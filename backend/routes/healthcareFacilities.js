import express from 'express';
import jwt from 'jsonwebtoken';
import HealthcareFacility from '../models/HealthcareFacility.js';
import User from '../models/User.js';
import { authenticate as authMiddleware, authorize, generateToken } from '../middleware/auth.js';
const router = express.Router();

// Get all healthcare facilities with filtering and search
router.get('/', async (req, res) => {
  try {
    const {
      type,
      subCategory,
      city,
      state,
      pincode,
      specialty,
      search,
      lat,
      lng,
      radius = 10,
      limit = 20,
      skip = 0,
      sortBy = 'rating.overall'
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    if (type) {
      if (Array.isArray(type)) {
        filter.type = { $in: type };
      } else {
        filter.type = type;
      }
    }

    if (subCategory) filter.subCategory = subCategory;
    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (state) filter['address.state'] = new RegExp(state, 'i');
    if (pincode) filter['address.pincode'] = new RegExp(pincode, 'i');
    if (specialty) filter.specialties = { $in: [specialty] };

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Location-based search
    if (lat && lng) {
      const facilities = await HealthcareFacility.findNearby(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(radius),
        type
      );
      
      return res.json({
        success: true,
        data: facilities,
        total: facilities.length,
        hasMore: false
      });
    }

    // Regular query
    const sortOptions = {};
    switch (sortBy) {
      case 'distance':
        // This would be handled by location-based search above
        sortOptions['rating.overall'] = -1;
        break;
      case 'rating':
        sortOptions['rating.overall'] = -1;
        break;
      case 'name':
        sortOptions.name = 1;
        break;
      default:
        sortOptions['rating.overall'] = -1;
    }

    const facilities = await HealthcareFacility.find(filter)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('owner', 'firstName lastName email')
      .populate('staff.doctors.doctorId', 'userId specializations')
      .lean();

    const total = await HealthcareFacility.countDocuments(filter);

    res.json({
      success: true,
      data: facilities,
      total,
      hasMore: total > parseInt(skip) + parseInt(limit)
    });

  } catch (error) {
    console.error('Error fetching healthcare facilities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching healthcare facilities',
      error: error.message
    });
  }
});

// Get single healthcare facility by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const facility = await HealthcareFacility.findById(id)
      .populate('owner', 'firstName lastName email phone')
      .populate('managers.userId', 'firstName lastName email')
      .populate('staff.doctors.doctorId', 'userId specializations experience')
      .populate({
        path: 'reviews.userId',
        select: 'firstName lastName'
      });

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Healthcare facility not found'
      });
    }

    // Increment view count
    await HealthcareFacility.findByIdAndUpdate(id, {
      $inc: { 'analytics.totalViews': 1 },
      $set: { 'analytics.lastVisitDate': new Date() }
    });

    res.json({
      success: true,
      data: facility
    });

  } catch (error) {
    console.error('Error fetching healthcare facility:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching healthcare facility',
      error: error.message
    });
  }
});

// Create new healthcare facility (Protected route)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const facilityData = {
      ...req.body,
      owner: req.user.id
    };

    const facility = new HealthcareFacility(facilityData);
    await facility.save();

    res.status(201).json({
      success: true,
      message: 'Healthcare facility created successfully',
      data: facility
    });

  } catch (error) {
    console.error('Error creating healthcare facility:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating healthcare facility',
      error: error.message
    });
  }
});

// Update healthcare facility (Protected route - facility owner only)
router.put('/:id', authMiddleware, authorize('facility'), async (req, res) => {
  try {
    const { id } = req.params;

    const facility = await HealthcareFacility.findById(id);
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Healthcare facility not found' });
    }

    if (facility.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied. Only the facility account can update this facility.' });
    }

    const updatedFacility = await HealthcareFacility.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Healthcare facility updated successfully', data: updatedFacility });

  } catch (error) {
    console.error('Error updating healthcare facility:', error);
    res.status(400).json({ success: false, message: 'Error updating healthcare facility', error: error.message });
  }
});

// Add review to healthcare facility (Protected route)
router.post('/:id/reviews', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review, aspects } = req.body;

    const facility = await HealthcareFacility.findById(id);
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Healthcare facility not found'
      });
    }

    // Check if user already reviewed this facility
    const existingReview = facility.reviews.find(
      r => r.userId.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this facility'
      });
    }

    // Add new review
    const newReview = {
      userId: req.user.id,
      rating,
      review,
      aspects,
      date: new Date()
    };

    facility.reviews.push(newReview);

    // Recalculate ratings
    const totalReviews = facility.reviews.length;
    const ratingSums = facility.reviews.reduce((sums, r) => {
      sums.overall += r.rating;
      if (r.aspects) {
        sums.cleanliness += r.aspects.cleanliness || 0;
        sums.staff += r.aspects.staff || 0;
        sums.facilities += r.aspects.facilities || 0;
        sums.valueForMoney += r.aspects.valueForMoney || 0;
      }
      return sums;
    }, { overall: 0, cleanliness: 0, staff: 0, facilities: 0, valueForMoney: 0 });

    facility.rating = {
      overall: (ratingSums.overall / totalReviews).toFixed(1),
      cleanliness: (ratingSums.cleanliness / totalReviews).toFixed(1),
      staff: (ratingSums.staff / totalReviews).toFixed(1),
      facilities: (ratingSums.facilities / totalReviews).toFixed(1),
      valueForMoney: (ratingSums.valueForMoney / totalReviews).toFixed(1),
      totalReviews
    };

    await facility.save();

    res.json({
      success: true,
      message: 'Review added successfully',
      data: facility.reviews[facility.reviews.length - 1]
    });

  } catch (error) {
    console.error('Error adding review:', error);
    res.status(400).json({
      success: false,
      message: 'Error adding review',
      error: error.message
    });
  }
});

// Get facility types and categories
router.get('/meta/types', async (req, res) => {
  try {
    const types = await HealthcareFacility.distinct('type');
    const subCategories = await HealthcareFacility.distinct('subCategory');
    const specialties = await HealthcareFacility.distinct('specialties');
    const cities = await HealthcareFacility.distinct('address.city');
    const states = await HealthcareFacility.distinct('address.state');

    res.json({
      success: true,
      data: {
        types,
        subCategories,
        specialties,
        cities,
        states
      }
    });
  } catch (error) {
    console.error('Error fetching meta data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching meta data',
      error: error.message
    });
  }
});

// Search suggestions
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const suggestions = await HealthcareFacility.find({
      $or: [
        { name: new RegExp(q, 'i') },
        { 'address.city': new RegExp(q, 'i') },
        { 'address.area': new RegExp(q, 'i') },
        { type: new RegExp(q, 'i') },
        { specialties: new RegExp(q, 'i') }
      ],
      status: 'active'
    })
    .select('name type address.city address.area specialties')
    .limit(10)
    .lean();

    const formattedSuggestions = suggestions.map(facility => ({
      id: facility._id,
      text: facility.name,
      type: facility.type,
      location: `${facility.address.area}, ${facility.address.city}`,
      category: 'facility'
    }));

    res.json({
      success: true,
      data: formattedSuggestions
    });

  } catch (error) {
    console.error('Error getting search suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting search suggestions',
      error: error.message
    });
  }
});

// Facility auth: register (uses HealthcareFacility.email/password)
router.post('/auth/register', async (req, res) => {
  try {
    const { name, type, address, authEmail, email, password } = req.body;

    if (!name || !type || !address?.city || !address?.state || !address?.pincode) {
      return res.status(400).json({ success: false, message: 'Missing required fields: name, type, address.city/state/pincode' });
    }
    const loginEmail = (authEmail || email || '').toLowerCase();
    if (!loginEmail || !password) {
      return res.status(400).json({ success: false, message: 'Missing email or password' });
    }

    const exists = await HealthcareFacility.findOne({ email: loginEmail }).lean();
    if (exists) {
      return res.status(400).json({ success: false, message: 'Facility email already exists' });
    }

    const facility = new HealthcareFacility({
      name,
      type,
      address,
      email: loginEmail,
      password,
      status: 'active',
      operatingHours: [
        { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'saturday', isOpen: false },
        { day: 'sunday', isOpen: false }
      ]
    });

    await facility.save();

    const token = jwt.sign({ facilityId: facility._id, role: 'facility' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

    res.status(201).json({ success: true, message: 'Facility registered', data: { facilityId: facility._id, token } });
  } catch (error) {
    console.error('Facility register error:', error);
    res.status(500).json({ success: false, message: 'Server error during facility registration' });
  }
});

// Facility auth: login (return user token and facilityId)
router.post('/auth/login', async (req, res) => {
  try {
    const { authEmail, email, password } = req.body;
    const loginEmail = (authEmail || email || '').toLowerCase();
    if (!loginEmail || !password) {
      return res.status(400).json({ success: false, message: 'Missing email or password' });
    }
    const user = await User.findOne({ email: loginEmail }).select('+password');
    if (!user || user.userType !== 'facility') {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = generateToken(user._id);
    const facility = await HealthcareFacility.findOne({ userId: user._id }).select('_id');
    res.json({ success: true, message: 'Login successful', data: { token, userId: user._id, facilityId: facility?._id } });
  } catch (error) {
    console.error('Facility login error:', error);
    res.status(500).json({ success: false, message: 'Server error during facility login' });
  }
});

// Facility profile: get my facility (user token)
router.get('/profile/me', authMiddleware, async (req, res) => {
  try {
    if (req.user?.userType !== 'facility') {
      return res.status(403).json({ success: false, message: 'Access denied. Not a facility account.' });
    }
    let facility = await HealthcareFacility.findOne({ userId: req.user._id });
    if (!facility) {
      // Auto-link fallback: try by user email
      facility = await HealthcareFacility.findOne({ email: req.user.email });
      if (!facility) {
        // Try alias used during registration: local+facility-<last6OfUserId>@domain
        const parts = (req.user.email || '').split('@');
        const local = (parts[0] || 'facility').replace(/[^a-zA-Z0-9+._-]/g, '');
        const domain = parts[1] || 'example.com';
        const alias = `${local}+facility-${String(req.user._id).slice(-6)}@${domain}`.toLowerCase();
        facility = await HealthcareFacility.findOne({ email: alias });
      }
      if (facility) {
        facility.userId = req.user._id;
        await facility.save();
      }
    }
    if (!facility) return res.status(404).json({ success: false, message: 'Facility profile not found' });
    res.json({ success: true, data: facility });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching facility profile' });
  }
});

// Facility profile: update my facility (user token)
router.put('/profile/me', authMiddleware, async (req, res) => {
  try {
    if (req.user?.userType !== 'facility') {
      return res.status(403).json({ success: false, message: 'Access denied. Not a facility account.' });
    }

    const body = req.body || {};
    const set = {};

    // Safe shallow fields
    if (typeof body.name === 'string') set.name = body.name;
    if (typeof body.description === 'string') set.description = body.description;
    if (typeof body.is24x7 === 'boolean') set.is24x7 = body.is24x7;
    if (typeof body.appointmentRequired === 'boolean') set.appointmentRequired = body.appointmentRequired;
    if (typeof body.clinicType === 'string') set.clinicType = body.clinicType;

    // Merge contact
    if (body.contact && typeof body.contact === 'object') {
      if (typeof body.contact.email === 'string') set['contact.email'] = body.contact.email;
      if (typeof body.contact.website === 'string') set['contact.website'] = body.contact.website;
      if (body.contact.phone && typeof body.contact.phone === 'object') {
        if (typeof body.contact.phone.primary === 'string') {
          set['contact.phone.primary'] = body.contact.phone.primary;
          set.phone = body.contact.phone.primary; // keep top-level phone in sync
        }
        if (typeof body.contact.phone.secondary === 'string') set['contact.phone.secondary'] = body.contact.phone.secondary;
        if (typeof body.contact.phone.emergency === 'string') set['contact.phone.emergency'] = body.contact.phone.emergency;
      }
    }

    // Merge address (only set provided fields to avoid failing required validation)
    if (body.address && typeof body.address === 'object') {
      ['street','area','city','state','pincode','country'].forEach(key => {
        const v = body.address[key];
        if (typeof v === 'string' && v.length >= 0) {
          set[`address.${key}`] = v;
        }
      });
    }

    // Arrays
    if (Array.isArray(body.services)) set.services = body.services;
    if (Array.isArray(body.specialties)) set.specialties = body.specialties;
    if (Array.isArray(body.languages)) set.languages = body.languages;
    if (Array.isArray(body.acceptedInsurance)) set.acceptedInsurance = body.acceptedInsurance;
    if (Array.isArray(body.operatingHours)) set.operatingHours = body.operatingHours;
    if (body.media && typeof body.media === 'object') set.media = body.media;
    if (Array.isArray(body.paymentMethods)) set.paymentMethods = body.paymentMethods;

    let updated = await HealthcareFacility.findOneAndUpdate(
      { userId: req.user._id },
      { $set: set },
      { new: true, runValidators: true }
    );

    // Fallback: auto-link by email if missing
    if (!updated) {
      const byEmail = await HealthcareFacility.findOne({ email: req.user.email });
      if (byEmail) {
        await HealthcareFacility.updateOne({ _id: byEmail._id }, { $set: { userId: req.user._id, ...set } });
        updated = await HealthcareFacility.findById(byEmail._id);
      }
    }

    if (!updated) return res.status(404).json({ success: false, message: 'Facility profile not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Facility update error:', error);
    res.status(400).json({ success: false, message: 'Error updating facility profile', error: error.message });
  }
});

export default router;
