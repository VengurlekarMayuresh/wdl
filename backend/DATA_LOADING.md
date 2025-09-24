# Static Data Loading for Healthcare Management System

This document explains how to load pre-defined static data into your MongoDB database for development and testing purposes.

## Overview

We've created a comprehensive static data loading system that includes:
- **5 Doctors** with complete professional profiles, specializations, and credentials
- **5 Patients** with medical histories, allergies, medications, and insurance information  
- **5 Care Providers** with certifications, services offered, and availability schedules

All users have realistic profile pictures from Unsplash and complete contact information.

## Quick Start

### Load Complete Data (RECOMMENDED)
```bash
npm run load-complete-data
```

This command will:
1. Connect to your MongoDB database
2. Clear any existing data from ALL collections
3. Create User records AND professional records (Doctor, Patient, CareProvider)
4. Load all doctors, patients, and care providers with proper relationships
5. Display a summary of loaded data

### Load Basic Data (User records only)
```bash
npm run load-static-data
```

This loads only User records but not the professional collections.

### Expected Output
```
🚀 Starting static data loader...
📂 Loading data files...
✅ Loaded 5 doctors, 5 patients, 5 care providers
🚀 Starting static data loading...
==================================================
🔌 Attempting to connect to MongoDB...
✅ MongoDB Connected: your-mongodb-host
✅ Cleared existing data
📋 Loading doctors...
  ✅ Created doctor: Sarah Johnson
  ✅ Created doctor: Michael Chen
  ✅ Created doctor: Emily Rodriguez
  ✅ Created doctor: David Thompson
  ✅ Created doctor: Lisa Park
✅ Successfully loaded 5 doctors
👥 Loading patients...
  ✅ Created patient: John Smith
  ✅ Created patient: Maria Garcia
  ✅ Created patient: Robert Williams
  ✅ Created patient: Jennifer Brown
  ✅ Created patient: David Jones
✅ Successfully loaded 5 patients
🏥 Loading care providers...
  ✅ Created care provider: Amanda Wilson
  ✅ Created care provider: Marcus Thompson
  ✅ Created care provider: Isabella Martinez
  ✅ Created care provider: James Anderson
  ✅ Created care provider: Sophia Chen
✅ Successfully loaded 5 care providers
==================================================
🎉 All static data loaded successfully!

📊 Database Summary:
  Total Users: 15
  Doctors: 5
  Patients: 5
  Care Providers: 5
```

## Test Login Credentials

All users have the following password format:
- **Doctors**: `doctor123`
- **Patients**: `patient123`  
- **Care Providers**: `caregiver123`

### Sample Doctor Login
- **Email**: `sarah.johnson@healthcenter.com`
- **Password**: `doctor123`

### Sample Patient Login
- **Email**: `john.smith@email.com`
- **Password**: `patient123`

### Sample Care Provider Login
- **Email**: `amanda.wilson@homecare.com`
- **Password**: `caregiver123`

## Data Structure

### Doctors Include:
- Complete medical credentials and licenses
- Specializations and years of experience
- Education history (Medical school, residency, fellowship)
- Hospital affiliations and board certifications
- Consultation fees and insurance accepted
- Languages spoken

### Patients Include:
- Medical history and current conditions
- Allergies and medications
- Emergency contact information
- Insurance details
- Family medical history
- Social habits (smoking, alcohol, exercise)

### Care Providers Include:
- Professional certifications (RN, CNA, LPN, PTA, HHA)
- Service specializations and hourly rates
- Availability schedules
- Background check status
- Service areas and transportation availability
- Emergency contacts

## File Locations

- **Data Files**: `/data/`
  - `doctors.json` - Doctor profiles
  - `patients.json` - Patient profiles  
  - `careProviders.json` - Care provider profiles
- **Loader Script**: `loadStaticData.js`

## Customization

To modify the data:
1. Edit the JSON files in the `/data/` directory
2. Run `npm run load-static-data` to reload the updated data

## Environment Requirements

Make sure your `.env` file has the correct MongoDB connection string:
```
MONGODB_URI=your-mongodb-connection-string
```

## Profile Images

All users have profile pictures from Unsplash that are:
- High quality and professional
- Properly formatted for web display
- Gender and role appropriate
- Diverse and inclusive

The profile upload functionality you've implemented can be tested by updating these default images through the frontend interface.

## Next Steps

After loading the data:
1. Start your server: `npm start`
2. Launch your frontend application
3. Test the profile upload functionality with any of the loaded users
4. Verify that the profile pages display correctly with the loaded data

This static data provides a solid foundation for testing all aspects of your healthcare management system!