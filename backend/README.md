# Healthcare Management System Backend

A comprehensive backend system for managing healthcare professionals, patients, and care providers with robust authentication, profile management, and medical data handling.

## Features

### 🏥 User Types
- **Doctors**: Complete medical professional profiles with specializations, credentials, and practice information
- **Patients**: Comprehensive medical history, medications, allergies, and vital signs tracking
- **Care Providers**: Professional and family caregivers with skills, availability, and service offerings

### 🔐 Authentication & Security
- JWT-based authentication with refresh token support
- Role-based access control (RBAC)
- Account lockout after failed login attempts
- Rate limiting and security headers
- Input validation and sanitization

### 📊 Profile Management
- Detailed profile creation and updates for each user type
- Medical license verification for doctors
- Emergency contacts and insurance information for patients
- Skills assessment and availability scheduling for care providers

### 🏗️ Technical Features
- RESTful API design
- MongoDB with Mongoose ODM
- Comprehensive error handling
- Database indexing for performance
- Health check endpoints
- Graceful shutdown handling

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn package manager

## Installation

1. **Clone the repository and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Copy the `.env` file and update the values:
   ```bash
   cp .env .env.local
   ```
   
   Update the following environment variables:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration - UPDATE THIS
   MONGODB_URI=mongodb://localhost:27017/healthcare_db
   
   # JWT Configuration - CHANGE THESE IN PRODUCTION
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   JWT_EXPIRE=7d
   
   # CORS Configuration
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # Using MongoDB service (Windows)
   net start MongoDB
   
   # Using MongoDB directly (Linux/Mac)
   mongod --dbpath /path/to/your/db
   
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user profile
- `POST /auth/logout` - Logout user
- `PUT /auth/change-password` - Change password
- `PUT /auth/update-profile` - Update basic profile

### Doctor Endpoints
- `GET /doctors` - Get all approved doctors (public)
- `GET /doctors/:id` - Get doctor by ID (public)
- `GET /doctors/profile/me` - Get current doctor's profile
- `PUT /doctors/profile/me` - Update doctor profile
- `POST /doctors/profile/education` - Add education entry
- `GET /doctors/search/specialty` - Search doctors by specialty
- `GET /doctors/stats/dashboard` - Get doctor dashboard stats

### Patient Endpoints
- `GET /patients/profile/me` - Get current patient's profile
- `PUT /patients/profile/me` - Update patient profile
- `POST /patients/profile/emergency-contact` - Add emergency contact
- `POST /patients/profile/medication` - Add medication
- `POST /patients/profile/allergy` - Add allergy
- `PUT /patients/profile/vital-signs` - Update vital signs
- `GET /patients/stats/dashboard` - Get patient dashboard stats

### Care Provider Endpoints
- `GET /careproviders` - Get all verified care providers (public)
- `GET /careproviders/:id` - Get care provider by ID (public)
- `GET /careproviders/profile/me` - Get current care provider's profile
- `PUT /careproviders/profile/me` - Update care provider profile
- `POST /careproviders/profile/certification` - Add certification
- `GET /careproviders/search/service` - Search by service
- `GET /careproviders/available/:day` - Get available providers

### Health Check
- `GET /health` - Server and database health status

## Request/Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"] // Optional
}
```

## Authentication

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Database Schema

### User (Base Model)
- Basic information (name, email, contact)
- Authentication data
- Profile settings
- Address information

### Doctor (Extends User)
- Medical license information
- Specializations and subspecialties
- Education and training history
- Hospital and clinic affiliations
- Ratings and reviews
- Consultation fees and insurance

### Patient (Extends User)
- Medical history and conditions
- Current and past medications
- Allergies and reactions
- Vital signs and measurements
- Emergency contacts
- Insurance information
- Healthcare team relationships

### Care Provider (Extends User)
- Provider type and credentials
- Skills and certifications
- Availability and schedule
- Service offerings
- Patient relationships
- Background verification

## Development

### Available Scripts
```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run tests (when implemented)
npm test

# Check code style
npm run lint
```

### Adding New Features

1. **Models**: Add new Mongoose models in `models/`
2. **Routes**: Create route handlers in `routes/`
3. **Middleware**: Add custom middleware in `middleware/`
4. **Controllers**: Business logic in `controllers/` (optional)
5. **Utils**: Helper functions in `utils/`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment mode | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/healthcare_db |
| JWT_SECRET | JWT signing secret | Required |
| JWT_EXPIRE | Token expiration time | 7d |
| CLIENT_URL | Frontend URL for CORS | http://localhost:3000 |

## Security Considerations

### Production Deployment
1. **Environment Variables**: Use strong, unique values for JWT_SECRET
2. **Database**: Enable authentication and use connection strings with credentials
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Adjust rate limits based on expected usage
5. **Monitoring**: Implement logging and monitoring
6. **Backups**: Regular database backups
7. **Updates**: Keep dependencies updated

### Data Privacy
- All sensitive data is properly encrypted
- Password hashing using bcrypt
- Medical data access is role-restricted
- Audit trails for data modifications

## Error Handling

The API includes comprehensive error handling:
- Input validation errors
- Authentication and authorization errors
- Database connection errors
- Rate limiting errors
- Server errors with appropriate HTTP status codes

## Support

For questions or issues:
1. Check the API documentation
2. Review error messages and logs
3. Ensure MongoDB is running and accessible
4. Verify environment variables are set correctly

## License

This project is licensed under the ISC License.