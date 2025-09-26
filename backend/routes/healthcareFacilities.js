import express from 'express';
import HealthcareFacility from '../models/HealthcareFacility.js';
import { authMiddleware } from '../middleware/auth.js';

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

// Update healthcare facility (Protected route - owner only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const facility = await HealthcareFacility.findById(id);
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Healthcare facility not found'
      });
    }

    // Check if user is owner or manager
    const isOwner = facility.owner.toString() === req.user.id;
    const isManager = facility.managers.some(manager => 
      manager.userId.toString() === req.user.id
    );

    if (!isOwner && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only facility owner or managers can update this facility.'
      });
    }

    const updatedFacility = await HealthcareFacility.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Healthcare facility updated successfully',
      data: updatedFacility
    });

  } catch (error) {
    console.error('Error updating healthcare facility:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating healthcare facility',
      error: error.message
    });
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

export default router;