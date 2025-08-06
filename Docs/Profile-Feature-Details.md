# Profile Feature - Technical Documentation

## Overview
This document provides detailed technical specifications for the User Profile feature endpoints in the Smart Care Services application. The Profile feature allows users to manage their personal information, health profiles, and onboarding preferences.

## Base Configuration
- **Base URL**: `http://localhost:8080/api/v1`
- **Authentication**: JWT Bearer token required for all endpoints
- **Content-Type**: `application/json`
- **Context Path**: `/api/v1`

## Authentication Header
All endpoints require authentication:
```
Authorization: Bearer {jwt_token}
```

---

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get current user profile | ✅ |
| PUT | `/profile` | Update user profile | ✅ |
| PUT | `/profile/tour-completion` | Update onboarding tour status | ✅ |
| POST | `/profile/health` | Create health profile | ✅ |
| PUT | `/profile/health/{id}` | Update health profile | ✅ |
| GET | `/profile/health` | Get user's health profiles | ✅ |

---

## 1. Get Current User Profile

Retrieves the complete profile information for the authenticated user.

### Request Details
- **Method**: `GET`
- **Endpoint**: `/profile`
- **Parameters**: None

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1-555-123-4567",
    "address": "123 Main Street, Anytown, ST 12345",
    "profilePictureUrl": "https://cdn.example.com/profiles/john_doe.jpg",
    "dateOfBirth": "1990-05-15",
    "gender": "MALE",
    "tourCompleted": true,
    "profileCompleted": true,
    "roles": ["USER"]
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
  "path": "/api/v1/profile"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "User profile not found",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/profile"
}
```

### UI Integration Notes
- Use this endpoint to populate user profile forms
- Check `profileCompleted` to determine if profile setup is required
- Use `tourCompleted` to show/hide onboarding tours
- Cache profile data in state management for performance

---

## 2. Update User Profile

Updates the user's personal information and profile settings.

### Request Details
- **Method**: `PUT`
- **Endpoint**: `/profile`
- **Content-Type**: `application/json`

### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1-555-123-4567",
  "address": "123 Main Street, Anytown, ST 12345",
  "profilePictureUrl": "https://cdn.example.com/profiles/john_doe.jpg",
  "dateOfBirth": "1990-05-15",
  "gender": "MALE"
}
```

### Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `firstName` | String | ✅ | 1-50 characters, letters only | User's first name |
| `lastName` | String | ✅ | 1-50 characters, letters only | User's last name |
| `phoneNumber` | String | ❌ | Valid phone format | Contact phone number |
| `address` | String | ❌ | Max 200 characters | Full address |
| `profilePictureUrl` | String | ❌ | Valid URL format | Profile image URL |
| `dateOfBirth` | String | ❌ | YYYY-MM-DD format | Birth date |
| `gender` | Enum | ❌ | MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY | Gender identity |

### Excluded Fields
The following fields are managed internally and should NOT be included in requests:
- `id` - Auto-generated UUID
- `username` - Set during registration
- `email` - Managed separately
- `tourCompleted` - Updated via separate endpoint
- `profileCompleted` - Calculated automatically
- `roles` - Managed by admin
- `createdAt`, `updatedAt` - Auto-managed timestamps

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1-555-123-4567",
    "address": "123 Main Street, Anytown, ST 12345",
    "profilePictureUrl": "https://cdn.example.com/profiles/john_doe.jpg",
    "dateOfBirth": "1990-05-15",
    "gender": "MALE",
    "tourCompleted": true,
    "profileCompleted": true,
    "roles": ["USER"]
  }
}
```

### Error Responses

**400 Bad Request - Validation Errors**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "firstName",
        "message": "First name is required"
      },
      {
        "field": "phoneNumber",
        "message": "Invalid phone number format"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/profile"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Authentication required",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/profile"
}
```

### UI Integration Notes
- Validate required fields client-side before submission
- Show field-specific error messages next to form inputs
- Display success message on successful update
- Update cached profile data in state management

---

## 3. Update Tour Completion Status

Marks the user onboarding tour as completed.

### Request Details
- **Method**: `PUT`
- **Endpoint**: `/profile/tour-completion`
- **Content-Type**: `application/json`

### Request Body
```json
{
  "tourCompleted": true
}
```

### Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `tourCompleted` | Boolean | ✅ | true/false | Tour completion status |

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Tour completion status updated successfully",
  "data": {
    "tourCompleted": true
  }
}
```

### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "message": "Tour completion status is required",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/profile/tour-completion"
}
```

### UI Integration Notes
- Call this endpoint when user completes onboarding tour
- Update local state to hide tour-related UI elements
- Typically called only once per user

---

## 4. Create Health Profile

Creates a new health profile with medical information for the user.

### Request Details
- **Method**: `POST`
- **Endpoint**: `/profile/health`
- **Content-Type**: `application/json`

### Request Body
```json
{
  "bloodType": "A_POSITIVE",
  "height": 175.5,
  "weight": 70.2,
  "allergies": ["Penicillin", "Peanuts"],
  "medicalConditions": ["Asthma", "Hypertension"],
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+1-555-987-6543",
  "emergencyContactRelationship": "Spouse",
  "additionalNotes": "Regular exercise routine, vegetarian diet"
}
```

### Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `bloodType` | Enum | ❌ | Valid blood type | User's blood type |
| `height` | Number | ❌ | > 0, decimal places allowed | Height in cm |
| `weight` | Number | ❌ | > 0, decimal places allowed | Weight in kg |
| `allergies` | Array | ❌ | Array of strings | Known allergies |
| `medicalConditions` | Array | ❌ | Array of strings | Current medical conditions |
| `emergencyContactName` | String | ❌ | 1-100 characters | Emergency contact name |
| `emergencyContactPhone` | String | ✅* | Valid phone format | Emergency contact phone |
| `emergencyContactRelationship` | String | ❌ | 1-50 characters | Relationship to user |
| `additionalNotes` | String | ❌ | Max 500 characters | Additional medical notes |

*Required if `emergencyContactName` is provided

### Blood Type Options
- `A_POSITIVE`, `A_NEGATIVE`
- `B_POSITIVE`, `B_NEGATIVE`
- `AB_POSITIVE`, `AB_NEGATIVE`
- `O_POSITIVE`, `O_NEGATIVE`
- `UNKNOWN`

### Excluded Fields
- `id` - Auto-generated UUID
- `user` - Set from authenticated user
- `createdAt`, `updatedAt` - Auto-managed timestamps

### Response Format

**Success Response (201 Created)**
```json
{
  "success": true,
  "message": "Health profile created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "bloodType": "A_POSITIVE",
    "height": 175.5,
    "weight": 70.2,
    "allergies": ["Penicillin", "Peanuts"],
    "medicalConditions": ["Asthma", "Hypertension"],
    "emergencyContactName": "Jane Doe",
    "emergencyContactPhone": "+1-555-987-6543",
    "emergencyContactRelationship": "Spouse",
    "additionalNotes": "Regular exercise routine, vegetarian diet"
  }
}
```

### Error Responses

**400 Bad Request - Validation Errors**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "emergencyContactPhone",
        "message": "Emergency contact phone is required when name is provided"
      },
      {
        "field": "height",
        "message": "Height must be greater than 0"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/profile/health"
}
```

### UI Integration Notes
- Implement conditional validation for emergency contact fields
- Use number inputs with step="0.1" for height/weight
- Provide multi-select components for allergies and conditions
- Consider auto-save functionality for long forms

---

## 5. Update Health Profile

Updates an existing health profile for the user.

### Request Details
- **Method**: `PUT`
- **Endpoint**: `/profile/health/{id}`
- **Content-Type**: `application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | ✅ | Health profile ID |

### Request Body
Same format as Create Health Profile

### Response Format
Same format as Create Health Profile (200 OK instead of 201)

### Error Responses

**403 Forbidden**
```json
{
  "success": false,
  "message": "Access denied - You can only update your own health profiles",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/profile/health/550e8400-e29b-41d4-a716-446655440001"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Health profile not found",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/profile/health/550e8400-e29b-41d4-a716-446655440001"
}
```

---

## 6. Get Health Profiles

Retrieves all health profiles for the authenticated user.

### Request Details
- **Method**: `GET`
- **Endpoint**: `/profile/health`
- **Parameters**: None

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Health profiles retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "bloodType": "A_POSITIVE",
      "height": 175.5,
      "weight": 70.2,
      "allergies": ["Penicillin", "Peanuts"],
      "medicalConditions": ["Asthma", "Hypertension"],
      "emergencyContactName": "Jane Doe",
      "emergencyContactPhone": "+1-555-987-6543",
      "emergencyContactRelationship": "Spouse",
      "additionalNotes": "Regular exercise routine, vegetarian diet"
    }
  ]
}
```

---

## UI Integration Guidelines

### Form Validation Rules

#### User Profile Form
```javascript
const profileValidation = {
  firstName: {
    required: true,
    pattern: /^[A-Za-z\s]{1,50}$/,
    message: "First name is required (1-50 characters, letters only)"
  },
  lastName: {
    required: true,
    pattern: /^[A-Za-z\s]{1,50}$/,
    message: "Last name is required (1-50 characters, letters only)"
  },
  phoneNumber: {
    required: false,
    pattern: /^\+?[\d\s\-\(\)]{10,15}$/,
    message: "Please enter a valid phone number"
  },
  dateOfBirth: {
    required: false,
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: "Date must be in YYYY-MM-DD format"
  }
}
```

#### Health Profile Form
```javascript
const healthProfileValidation = {
  height: {
    required: false,
    min: 0,
    message: "Height must be greater than 0"
  },
  weight: {
    required: false,
    min: 0,
    message: "Weight must be greater than 0"
  },
  emergencyContactPhone: {
    required: (form) => !!form.emergencyContactName,
    pattern: /^\+?[\d\s\-\(\)]{10,15}$/,
    message: "Emergency contact phone is required when name is provided"
  }
}
```

### Error Handling Strategy

```javascript
// Generic error handler for profile operations
const handleProfileError = (error) => {
  if (error.response?.status === 400) {
    // Validation errors - show field-specific messages
    const validationErrors = error.response.data.data?.errors || [];
    return validationErrors.reduce((acc, err) => {
      acc[err.field] = err.message;
      return acc;
    }, {});
  } else if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    router.push('/login');
  } else if (error.response?.status === 403) {
    // Forbidden - show access denied message
    showToast('Access denied', 'error');
  } else {
    // Generic error
    showToast('An unexpected error occurred', 'error');
  }
};
```

### State Management Integration

```javascript
// Pinia store example
export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null,
    healthProfiles: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchProfile() {
      this.loading = true;
      try {
        const response = await profileApi.getProfile();
        this.profile = response.data.data;
      } catch (error) {
        this.error = handleProfileError(error);
      } finally {
        this.loading = false;
      }
    },
    
    async updateProfile(profileData) {
      this.loading = true;
      try {
        const response = await profileApi.updateProfile(profileData);
        this.profile = response.data.data;
        showToast('Profile updated successfully', 'success');
      } catch (error) {
        this.error = handleProfileError(error);
        throw error; // Re-throw for component handling
      } finally {
        this.loading = false;
      }
    }
  }
});
```

### Performance Considerations

1. **Caching**: Cache profile data to avoid repeated API calls
2. **Optimistic Updates**: Update UI immediately, rollback on error
3. **Debouncing**: Debounce form inputs to prevent excessive validation calls
4. **Loading States**: Show appropriate loading indicators during API calls

### Security Notes

1. **Token Management**: Always include valid JWT token in requests
2. **Data Sanitization**: Sanitize user inputs before submission
3. **HTTPS**: Use HTTPS in production for all API calls
4. **Sensitive Data**: Never log or cache sensitive health information
5. **Session Handling**: Handle token expiration gracefully

---

## Testing Recommendations

### Unit Testing
- Test form validation logic
- Test error handling scenarios
- Test state management actions

### Integration Testing
- Test API endpoints with various data combinations
- Test authentication requirements
- Test error response handling

### E2E Testing
- Test complete profile creation/update flows
- Test onboarding tour completion
- Test health profile management workflows
