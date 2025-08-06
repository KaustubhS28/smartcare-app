# Doctor Feature - Technical Documentation

## Overview
This document provides detailed technical specifications for the Doctor feature endpoints in the Smart Care Services application. The Doctor feature allows users to search for doctors, view doctor profiles, and check availability for appointments.

## Base Configuration
- **Base URL**: `http://localhost:8080/api/v1`
- **Authentication**: Mixed (some endpoints public, others require JWT)
- **Content-Type**: `application/json`
- **Context Path**: `/api/v1`

## Authentication Header
For protected endpoints:
```
Authorization: Bearer {jwt_token}
```

---

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/doctors/search` | Search doctors (public) | ❌ |
| GET | `/doctors/{id}` | Get doctor details | ✅ |
| GET | `/doctors/{id}/availability` | Check doctor availability | ✅ |
| GET | `/doctors/specializations` | Get all specializations | ❌ |
| GET | `/doctors/nearby` | Find nearby doctors | ✅ |

---

## 1. Search Doctors

Searches for doctors based on various criteria like specialization, location, rating, and availability.

### Request Details
- **Method**: `GET`
- **Endpoint**: `/doctors/search`
- **Authentication**: Not required (Public endpoint)

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `specialization` | String | ❌ | Medical specialization | `Cardiology` |
| `location` | String | ❌ | City or region | `New York` |
| `language` | String | ❌ | Spoken language | `English` |
| `rating` | Integer | ❌ | Minimum rating (1-5) | `4` |
| `available` | Boolean | ❌ | Filter by availability | `true` |
| `gender` | String | ❌ | Doctor gender | `MALE`, `FEMALE` |
| `experience` | Integer | ❌ | Minimum years of experience | `5` |
| `page` | Integer | ❌ | Page number (0-based) | `0` |
| `size` | Integer | ❌ | Page size | `10` |
| `sort` | String | ❌ | Sort criteria | `rating,desc` |

### Example Request
```
GET /doctors/search?specialization=Cardiology&location=New York&rating=4&page=0&size=10&sort=rating,desc
```

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Doctors retrieved successfully",
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "firstName": "Dr. Sarah",
        "lastName": "Johnson",
        "specializations": ["Cardiology", "Internal Medicine"],
        "location": "New York, NY",
        "languages": ["English", "Spanish"],
        "rating": 4.8,
        "reviewCount": 127,
        "yearsOfExperience": 15,
        "gender": "FEMALE",
        "profilePictureUrl": "https://cdn.example.com/doctors/sarah-johnson.jpg",
        "consultationFee": 200.00,
        "availability": true,
        "hospitalAffiliation": "NYC Medical Center",
        "education": "Harvard Medical School",
        "certifications": ["Board Certified Cardiologist", "FACC"]
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "firstName": "Dr. Michael",
        "lastName": "Chen",
        "specializations": ["Cardiology"],
        "location": "New York, NY",
        "languages": ["English", "Chinese"],
        "rating": 4.6,
        "reviewCount": 89,
        "yearsOfExperience": 12,
        "gender": "MALE",
        "profilePictureUrl": "https://cdn.example.com/doctors/michael-chen.jpg",
        "consultationFee": 180.00,
        "availability": true,
        "hospitalAffiliation": "Mount Sinai Hospital",
        "education": "Johns Hopkins Medical School",
        "certifications": ["Board Certified Cardiologist"]
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10,
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      },
      "offset": 0,
      "paged": true,
      "unpaged": false
    },
    "totalElements": 45,
    "totalPages": 5,
    "last": false,
    "first": true,
    "numberOfElements": 10,
    "size": 10,
    "number": 0,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "empty": false
  }
}
```

### Error Responses

**400 Bad Request - Invalid Parameters**
```json
{
  "success": false,
  "message": "Invalid search parameters",
  "data": {
    "errors": [
      {
        "field": "rating",
        "message": "Rating must be between 1 and 5"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/doctors/search"
}
```

### UI Integration Notes
- Implement debounced search for better performance
- Use pagination for large result sets
- Provide filter options for all supported parameters
- Cache search results for better user experience

---

## 2. Get Doctor Details

Retrieves detailed information about a specific doctor.

### Request Details
- **Method**: `GET`
- **Endpoint**: `/doctors/{id}`
- **Authentication**: Required

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | ✅ | Doctor's unique identifier |

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Doctor details retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "Dr. Sarah",
    "lastName": "Johnson",
    "specializations": ["Cardiology", "Internal Medicine"],
    "location": "New York, NY",
    "languages": ["English", "Spanish"],
    "rating": 4.8,
    "reviewCount": 127,
    "yearsOfExperience": 15,
    "gender": "FEMALE",
    "profilePictureUrl": "https://cdn.example.com/doctors/sarah-johnson.jpg",
    "consultationFee": 200.00,
    "availability": true,
    "hospitalAffiliation": "NYC Medical Center",
    "education": "Harvard Medical School",
    "certifications": ["Board Certified Cardiologist", "FACC"],
    "biography": "Dr. Sarah Johnson is a renowned cardiologist with over 15 years of experience...",
    "officeAddress": {
      "street": "123 Medical Plaza",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "contactInfo": {
      "phone": "+1-555-123-4567",
      "email": "office@drjohnson.com",
      "website": "https://drjohnson.com"
    },
    "workingHours": {
      "monday": "09:00-17:00",
      "tuesday": "09:00-17:00",
      "wednesday": "09:00-17:00",
      "thursday": "09:00-17:00",
      "friday": "09:00-15:00",
      "saturday": "CLOSED",
      "sunday": "CLOSED"
    },
    "reviews": [
      {
        "id": "review-1",
        "patientName": "John D.",
        "rating": 5,
        "comment": "Excellent doctor, very thorough and caring.",
        "date": "2024-01-10"
      }
    ]
  }
}
```

### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Authentication required",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/doctors/550e8400-e29b-41d4-a716-446655440000"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Doctor not found",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/doctors/550e8400-e29b-41d4-a716-446655440000"
}
```

### UI Integration Notes
- Display comprehensive doctor profile
- Show working hours in user's timezone
- Implement review pagination for large numbers of reviews
- Provide contact and booking options

---

## 3. Check Doctor Availability

Checks the availability of a specific doctor for appointment booking.

### Request Details
- **Method**: `GET`
- **Endpoint**: `/doctors/{id}/availability`
- **Authentication**: Required

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | ✅ | Doctor's unique identifier |

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `date` | String | ✅ | Date to check (YYYY-MM-DD) | `2024-01-20` |
| `type` | String | ❌ | Appointment type | `IN_PERSON`, `VIDEO`, `PHONE` |

### Example Request
```
GET /doctors/550e8400-e29b-41d4-a716-446655440000/availability?date=2024-01-20&type=IN_PERSON
```

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Availability retrieved successfully",
  "data": {
    "doctorId": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2024-01-20",
    "availableSlots": [
      {
        "startTime": "09:00",
        "endTime": "09:30",
        "available": true,
        "appointmentType": "IN_PERSON"
      },
      {
        "startTime": "09:30",
        "endTime": "10:00",
        "available": true,
        "appointmentType": "IN_PERSON"
      },
      {
        "startTime": "10:00",
        "endTime": "10:30",
        "available": false,
        "appointmentType": "IN_PERSON"
      },
      {
        "startTime": "14:00",
        "endTime": "14:30",
        "available": true,
        "appointmentType": "VIDEO"
      }
    ],
    "totalSlots": 16,
    "availableSlots": 12,
    "unavailableSlots": 4
  }
}
```

### Error Responses

**400 Bad Request - Invalid Date**
```json
{
  "success": false,
  "message": "Invalid date format. Use YYYY-MM-DD",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/doctors/550e8400-e29b-41d4-a716-446655440000/availability"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Doctor not found",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/doctors/550e8400-e29b-41d4-a716-446655440000/availability"
}
```

### UI Integration Notes
- Display availability in calendar format
- Show different appointment types
- Highlight available vs unavailable slots
- Update availability in real-time

---

## 4. Get All Specializations

Retrieves all available medical specializations in the system.

### Request Details
- **Method**: `GET`
- **Endpoint**: `/doctors/specializations`
- **Authentication**: Not required (Public endpoint)

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Specializations retrieved successfully",
  "data": [
    {
      "name": "Cardiology",
      "description": "Heart and cardiovascular system",
      "doctorCount": 15
    },
    {
      "name": "Dermatology",
      "description": "Skin, hair, and nail conditions",
      "doctorCount": 8
    },
    {
      "name": "Neurology",
      "description": "Nervous system disorders",
      "doctorCount": 12
    },
    {
      "name": "Orthopedics",
      "description": "Musculoskeletal system",
      "doctorCount": 10
    },
    {
      "name": "Pediatrics",
      "description": "Medical care for children",
      "doctorCount": 18
    }
  ]
}
```

### UI Integration Notes
- Use for dropdown/filter options in search
- Display doctor count for each specialization
- Cache data for better performance
- Implement search within specializations

---

## 5. Find Nearby Doctors

Finds doctors near the user's location.

### Request Details
- **Method**: `GET`
- **Endpoint**: `/doctors/nearby`
- **Authentication**: Required

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `latitude` | Number | ✅ | User's latitude | `40.7128` |
| `longitude` | Number | ✅ | User's longitude | `-74.0060` |
| `radius` | Number | ❌ | Search radius in km (default: 10) | `5` |
| `specialization` | String | ❌ | Filter by specialization | `Cardiology` |
| `page` | Integer | ❌ | Page number | `0` |
| `size` | Integer | ❌ | Page size | `10` |

### Example Request
```
GET /doctors/nearby?latitude=40.7128&longitude=-74.0060&radius=5&specialization=Cardiology
```

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Nearby doctors retrieved successfully",
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "firstName": "Dr. Sarah",
        "lastName": "Johnson",
        "specializations": ["Cardiology"],
        "location": "New York, NY",
        "rating": 4.8,
        "consultationFee": 200.00,
        "distance": 1.2,
        "distanceUnit": "km",
        "coordinates": {
          "latitude": 40.7589,
          "longitude": -73.9851
        }
      }
    ],
    "totalElements": 8,
    "totalPages": 1
  }
}
```

### Error Responses

**400 Bad Request - Invalid Coordinates**
```json
{
  "success": false,
  "message": "Invalid coordinates",
  "data": {
    "errors": [
      {
        "field": "latitude",
        "message": "Latitude must be between -90 and 90"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/doctors/nearby"
}
```

---

## UI Integration Guidelines

### Search Implementation

```javascript
// Debounced search function
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

// Search implementation
const searchDoctors = async (filters) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, value);
    }
  });
  
  try {
    const response = await api.get(`/doctors/search?${params}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

### Filter Components

```javascript
// Specialization filter
const SpecializationFilter = ({ value, onChange, options }) => {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">All Specializations</option>
      {options.map(spec => (
        <option key={spec.name} value={spec.name}>
          {spec.name} ({spec.doctorCount})
        </option>
      ))}
    </select>
  );
};

// Rating filter
const RatingFilter = ({ value, onChange }) => {
  return (
    <div className="rating-filter">
      <label>Minimum Rating:</label>
      {[1, 2, 3, 4, 5].map(rating => (
        <button
          key={rating}
          className={value >= rating ? 'active' : ''}
          onClick={() => onChange(rating)}
        >
          ⭐ {rating}+
        </button>
      ))}
    </div>
  );
};
```

### Error Handling Strategy

```javascript
const handleDoctorError = (error) => {
  if (error.response?.status === 400) {
    // Invalid search parameters
    const validationErrors = error.response.data.data?.errors || [];
    return validationErrors.reduce((acc, err) => {
      acc[err.field] = err.message;
      return acc;
    }, {});
  } else if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    router.push('/login');
  } else if (error.response?.status === 404) {
    // Doctor not found
    return { general: 'Doctor not found' };
  } else {
    // Generic error
    return { general: 'Unable to load doctors. Please try again.' };
  }
};
```

### State Management Integration

```javascript
// Pinia doctor store
export const useDoctorStore = defineStore('doctor', {
  state: () => ({
    doctors: [],
    selectedDoctor: null,
    searchResults: {
      content: [],
      totalElements: 0,
      totalPages: 0
    },
    specializations: [],
    filters: {
      specialization: '',
      location: '',
      rating: 0,
      available: null
    },
    loading: false,
    error: null
  }),
  
  actions: {
    async searchDoctors(filters = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await doctorApi.search({ ...this.filters, ...filters });
        this.searchResults = response.data.data;
        return { success: true };
      } catch (error) {
        this.error = handleDoctorError(error);
        return { success: false, errors: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async getDoctorDetails(doctorId) {
      this.loading = true;
      
      try {
        const response = await doctorApi.getById(doctorId);
        this.selectedDoctor = response.data.data;
        return { success: true, data: this.selectedDoctor };
      } catch (error) {
        this.error = handleDoctorError(error);
        return { success: false, errors: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async getAvailability(doctorId, date, type) {
      try {
        const response = await doctorApi.getAvailability(doctorId, { date, type });
        return { success: true, data: response.data.data };
      } catch (error) {
        return { success: false, errors: handleDoctorError(error) };
      }
    },
    
    async loadSpecializations() {
      try {
        const response = await doctorApi.getSpecializations();
        this.specializations = response.data.data;
      } catch (error) {
        console.error('Failed to load specializations:', error);
      }
    }
  }
});
```

### Performance Considerations

1. **Search Debouncing**: Implement 300ms debounce for search inputs
2. **Result Caching**: Cache search results for frequently accessed data
3. **Image Optimization**: Lazy load doctor profile images
4. **Pagination**: Implement virtual scrolling for large result sets

### Security Considerations

1. **Location Privacy**: Request user permission before accessing location
2. **Data Sanitization**: Sanitize all search inputs
3. **Rate Limiting**: Implement client-side rate limiting for searches

---

## Testing Recommendations

### Unit Testing
- Test search filter logic
- Test pagination handling
- Test error handling scenarios
- Test state management actions

### Integration Testing
- Test search API with various parameters
- Test doctor detail retrieval
- Test availability checking
- Test geolocation functionality

### E2E Testing
- Test complete doctor search flow
- Test doctor profile viewing
- Test appointment booking from doctor profile
- Test responsive design on mobile devices
