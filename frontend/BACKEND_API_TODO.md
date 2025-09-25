# 🔗 BACKEND API ENDPOINTS - TODO LIST

Your doctor profile is now **100% dynamic** and ready for backend integration! Here are the API endpoints you need to implement in your backend:

## ✅ **Already Working:**
- `GET /api/auth/me` - Get current user
- `GET /api/doctors/profile/me` - Get doctor profile  
- `PUT /api/doctors/profile/me` - Update doctor profile
- `POST /api/doctors/profile/education` - Add education
- `PUT /api/doctors/profile/education/:id` - Update education
- `DELETE /api/doctors/profile/education/:id` - Delete education
- `POST /api/upload/profile-picture` - Upload profile picture

## 🔧 **NEED TO ADD TO BACKEND:**

### 1. **Doctor Reviews API**
```javascript
// Get reviews for current doctor
GET /api/doctors/reviews/me
Response: {
  success: true,
  data: [
    {
      id: 1,
      patientName: "Sarah M.",
      rating: 5,
      comment: "Excellent care!",
      date: "2024-01-15T10:30:00Z",
      createdAt: "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 2. **Doctor Appointments API**
```javascript
// Get booked appointments for current doctor
GET /api/doctors/appointments
Response: {
  success: true,
  data: [
    {
      id: 1,
      patientName: "John Smith",
      patientEmail: "john@example.com",
      phone: "+1234567890",
      date: "2024-12-28",
      time: "10:00 AM",
      type: "Consultation",
      status: "Confirmed", // Pending, Confirmed, Cancelled
      reason: "Regular checkup"
    }
  ]
}

// Update appointment status
PUT /api/doctors/appointments/:id
Body: { status: "Confirmed" | "Cancelled" }
```

### 3. **Doctor Available Slots API**
```javascript
// Get available time slots for current doctor
GET /api/doctors/slots
Response: {
  success: true,
  data: [
    {
      id: 1,
      date: "2024-12-30",
      time: "09:00",
      isAvailable: true
    }
  ]
}

// Add new available slot
POST /api/doctors/slots
Body: {
  date: "2024-12-30",
  time: "09:00"
}

// Update slot availability
PUT /api/doctors/slots/:id
Body: {
  isAvailable: true
}

// Delete slot
DELETE /api/doctors/slots/:id
```

### 4. **Enhanced Doctor Profile Fields**
Make sure your doctor profile model includes:
```javascript
{
  // Basic Info
  id: Number,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  profilePicture: String,
  
  // Professional Info
  primarySpecialty: String,
  secondarySpecialty: String,
  bio: String,
  yearsOfExperience: Number,
  
  // Location
  hospitalName: String,
  clinicName: String,
  address: String,
  
  // Settings
  isAcceptingNewPatients: Boolean,
  languages: [String],
  workingHours: {
    monday: String,
    tuesday: String,
    // ... etc
  },
  
  // Statistics (calculated)
  averageRating: Number,
  totalReviews: Number,
  
  // Arrays
  education: [EducationSchema],
  certifications: [String],
  specializations: [String]
}
```

## 🔄 **CURRENT STATUS:**

**✅ FRONTEND:** Fully dynamic, with mock API calls that simulate backend responses  
**⏳ BACKEND:** You need to implement the 3 new endpoint groups above  

## 🧪 **Testing Instructions:**

**Right Now (with mock data):**
1. Run your frontend: `npm run dev`
2. Login as doctor
3. Go to profile - you'll see:
   - ✅ Real user data (name, email, profile picture)
   - ✅ Loading states for reviews, appointments, slots
   - ✅ Mock backend data that simulates real API calls

**After Adding Backend APIs:**
1. Replace the `extendedAPI` mock functions in `DoctorSelfProfilePage.jsx`
2. Update the API calls to use real endpoints:
   ```javascript
   // Replace this:
   const data = await extendedAPI.getReviews();
   
   // With this:
   const response = await apiRequest('/doctors/reviews/me');
   const data = response.data;
   ```

## 🎯 **EXPECTED BEHAVIOR:**

Your doctor profile now:
- 🔄 **Fetches all data dynamically** from backend APIs
- ⚡ **Shows loading states** while fetching  
- 📊 **Displays real statistics** (ratings, reviews count)
- ✏️ **Allows editing** profile sections
- 📅 **Manages appointments** with real patient data
- 🕒 **Manages time slots** with backend persistence
- 🖼️ **Uploads profile pictures** to backend storage

**No more static data!** Everything is now properly integrated with backend APIs.