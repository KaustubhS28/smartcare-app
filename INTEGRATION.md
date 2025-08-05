# SmartCare Frontend Integration Guide

This document provides a comprehensive guide for integrating the SmartCare frontend application with the SmartCare Services backend.

## Backend Services Integration

### Prerequisites

1. **SmartCare Services Backend**: Ensure the backend service is running on `http://localhost:8080`
   - Repository: https://github.com/darsthakkar-cts/SmartCare-Services
   - Default credentials:
     - Admin: `admin` / `admin123`
     - Test User: `testuser` / `test123`

2. **Frontend Setup**: This application is configured to work with the backend APIs

### Configuration

The application is configured through environment variables in `.env`:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Environment
VITE_NODE_ENV=development

# Debug mode
VITE_DEBUG=true
```

### Integrated Services

#### 1. Authentication Service (`authApi`)
- **Endpoints**: `/auth/signin`, `/auth/signup`, `/auth/check-username`, `/auth/check-email`
- **Features**: JWT-based authentication, user registration, username/email validation
- **Store**: `src/stores/auth.js`

#### 2. Doctor Discovery Service (`doctorApi`)
- **Endpoints**: `/doctors/search`, `/doctors/{id}`, `/doctors/by-specialization`
- **Features**: Doctor search with filters, detailed profiles, availability checking
- **Store**: `src/stores/doctors.js`

#### 3. Appointment Management Service (`appointmentApi`)
- **Endpoints**: `/appointments/book`, `/appointments/my-appointments`, `/appointments/upcoming`
- **Features**: Appointment booking, scheduling, status management
- **Store**: `src/stores/appointments.js`

#### 4. Medication Management Service (`medicationApi`)
- **Endpoints**: `/medications`, `/medications/active`, `/medications/refill-needed`
- **Features**: Medication tracking, refill reminders, status management
- **Store**: `src/stores/medications.js`

#### 5. Health Tracking Service (`healthTrackingApi`)
- **Endpoints**: `/health-data`, `/health-data/vitals`
- **Features**: Vital signs tracking, health data analytics, trend analysis
- **Store**: `src/stores/healthTracking.js`

### Demo Mode vs Production Mode

The application supports both demo mode (for testing without backend) and production mode (with backend integration):

#### Demo Mode
When backend services are unavailable, the application automatically falls back to demo mode with:
- Demo user accounts: `demo@smartcare.com` / `demo`, `testuser` / `test123`
- Mock data for all services
- Local storage persistence
- Full UI functionality

#### Production Mode
When backend services are available, the application uses:
- Real JWT authentication
- Live data from backend APIs
- Automatic error handling with graceful fallbacks
- Real-time data synchronization

### API Integration Details

#### Authentication Flow
1. User credentials are sent to `/auth/signin`
2. Backend returns JWT token and user data
3. Token is stored in localStorage
4. Token is automatically included in subsequent API calls
5. On token expiry, user is redirected to login

#### Error Handling
- Network errors trigger fallback to demo mode
- Authentication errors redirect to login
- Validation errors are displayed to user
- Graceful degradation ensures app remains functional

#### Data Synchronization
- Local state is updated immediately for responsive UI
- Background API calls sync with backend
- Conflict resolution favors backend data
- Offline support through local storage

### Running the Application

#### Start Backend Services
```bash
# Clone and start the backend
git clone https://github.com/darsthakkar-cts/SmartCare-Services
cd SmartCare-Services
mvn spring-boot:run
```

#### Start Frontend Application
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development Credentials

For testing purposes, use these credentials:

#### Backend Credentials (if backend is running)
- **Admin User**: `admin` / `admin123`
- **Test User**: `testuser` / `test123`

#### Demo Credentials (fallback mode)
- **Demo User**: `demo@smartcare.com` / `demo`
- **Test User**: `testuser` / `test123`

### API Endpoints Reference

#### Authentication
```bash
POST /api/v1/auth/signin
POST /api/v1/auth/signup
GET  /api/v1/auth/check-username?username={username}
GET  /api/v1/auth/check-email?email={email}
```

#### Profile Management
```bash
GET  /api/v1/profile
PUT  /api/v1/profile
GET  /api/v1/profile/health
POST /api/v1/profile/health
POST /api/v1/profile/complete-tour
```

#### Doctor Discovery
```bash
GET  /api/v1/doctors/search
GET  /api/v1/doctors/{id}
GET  /api/v1/doctors/by-specialization
```

#### Appointments
```bash
POST /api/v1/appointments/book
GET  /api/v1/appointments/my-appointments
GET  /api/v1/appointments/upcoming
GET  /api/v1/appointments/available-slots
PUT  /api/v1/appointments/{id}/status
```

#### Medications
```bash
GET  /api/v1/medications
GET  /api/v1/medications/active
POST /api/v1/medications
PUT  /api/v1/medications/{id}/status
GET  /api/v1/medications/refill-needed
```

#### Health Data
```bash
GET  /api/v1/health-data
POST /api/v1/health-data
PUT  /api/v1/health-data/{id}
GET  /api/v1/health-data/vitals
POST /api/v1/health-data/vitals
```

### Troubleshooting

#### Backend Connection Issues
1. Verify backend is running on `http://localhost:8080`
2. Check CORS configuration in backend
3. Ensure JWT secret is properly configured
4. Check network connectivity

#### Authentication Issues
1. Clear localStorage: `localStorage.clear()`
2. Verify credentials with backend directly
3. Check JWT token expiration
4. Ensure proper CORS headers

#### Data Sync Issues
1. Check browser network tab for API errors
2. Verify API endpoints are accessible
3. Check authentication headers
4. Review backend logs for errors

### Development Tips

1. **Enable Debug Mode**: Set `VITE_DEBUG=true` for detailed logging
2. **API Testing**: Use browser dev tools to monitor API calls
3. **Demo Data**: All stores include fallback demo data for development
4. **Error Simulation**: Temporarily disable backend to test fallback behavior

### Next Steps

1. **Payment Integration**: Implement Stripe/PayPal integration
2. **Real-time Notifications**: Add WebSocket support
3. **Mobile App**: Create React Native companion app
4. **Advanced Analytics**: Add health trend analysis
5. **Telemedicine**: Integrate video calling capabilities

### Contributing

When adding new features or services:

1. Create corresponding API functions in `src/services/api.js`
2. Implement Pinia store with backend integration and fallback data
3. Update this documentation with new endpoints
4. Add proper error handling and loading states
5. Include demo data for offline development

---

For more information, refer to the backend repository: https://github.com/darsthakkar-cts/SmartCare-Services
