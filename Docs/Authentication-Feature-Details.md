# Authentication Feature - Technical Documentation

## Overview
This document provides detailed technical specifications for the Authentication feature endpoints in the Smart Care Services application. The Authentication feature handles user registration, login, logout, and JWT token management.

## Base Configuration
- **Base URL**: `http://localhost:8080/api/v1`
- **Authentication**: Not required for most endpoints (public access)
- **Content-Type**: `application/json`
- **Context Path**: `/api/v1`

## Authentication Header
For protected endpoints (logout, refresh):
```
Authorization: Bearer {jwt_token}
```

---

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register new user | ❌ |
| POST | `/auth/login` | User login | ❌ |
| POST | `/auth/logout` | User logout | ✅ |
| POST | `/auth/refresh` | Refresh JWT token | ✅ |

---

## 1. User Registration

Creates a new user account in the system.

### Request Details
- **Method**: `POST`
- **Endpoint**: `/auth/signup`
- **Authentication**: Not required (Public endpoint)

### Request Body
```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1-555-123-4567"
}
```

### Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `username` | String | ✅ | 3-20 characters, alphanumeric + underscore | Unique username |
| `email` | String | ✅ | Valid email format, unique | User's email address |
| `password` | String | ✅ | Min 8 chars, 1 letter, 1 number | Account password |
| `firstName` | String | ✅ | 1-50 characters, letters only | User's first name |
| `lastName` | String | ✅ | 1-50 characters, letters only | User's last name |
| `phoneNumber` | String | ❌ | Valid phone format | Contact phone number |

### Excluded Fields
The following fields are managed internally and should NOT be included in requests:
- `id` - Auto-generated UUID
- `roles` - Defaults to ["USER"]
- `enabled` - Defaults to true
- `accountNonExpired` - Auto-managed
- `accountNonLocked` - Auto-managed
- `credentialsNonExpired` - Auto-managed
- `createdAt`, `updatedAt` - Auto-managed timestamps

### Response Format

**Success Response (201 Created)**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
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
        "field": "username",
        "message": "Username must be between 3 and 20 characters"
      },
      {
        "field": "password",
        "message": "Password must contain at least one letter and one number"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/signup"
}
```

**409 Conflict - Username Already Exists**
```json
{
  "success": false,
  "message": "Username is already taken!",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/signup"
}
```

**409 Conflict - Email Already Exists**
```json
{
  "success": false,
  "message": "Email is already in use!",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/signup"
}
```

### UI Integration Notes
- Implement real-time username/email availability checking
- Show password strength indicator
- Clear password fields on validation errors
- Provide clear feedback for unique constraint violations

---

## 2. User Login

Authenticates a user and provides JWT access tokens.

### Request Details
- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Authentication**: Not required (Public endpoint)

### Request Body
```json
{
  "username": "johndoe",
  "password": "SecurePassword123"
}
```

### Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `username` | String | ✅ | Username or email | User identifier |
| `password` | String | ✅ | User's password | Account password |

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "roles": ["USER"]
  }
}
```

### Error Responses

**401 Unauthorized - Invalid Credentials**
```json
{
  "success": false,
  "message": "Invalid username or password",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/login"
}
```

**403 Forbidden - Account Locked**
```json
{
  "success": false,
  "message": "Account is temporarily locked due to multiple failed login attempts",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/login"
}
```

### UI Integration Notes
- Store JWT tokens securely (HttpOnly cookies recommended)
- Implement "Remember Me" functionality using refresh tokens
- Handle account lockout scenarios gracefully
- Don't specify which credential (username/password) is incorrect

---

## 3. User Logout

Invalidates the user's current session and tokens.

### Request Details
- **Method**: `POST`
- **Endpoint**: `/auth/logout`
- **Authentication**: Required

### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `refreshToken` | String | ✅ | Valid JWT refresh token | Token to invalidate |

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

### Error Responses

**401 Unauthorized - Invalid Token**
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/logout"
}
```

### UI Integration Notes
- Clear all stored tokens from client storage
- Redirect to login page after successful logout
- Clear user state from application store
- Handle logout even if token is already expired

---

## 4. Refresh Token

Obtains a new access token using a valid refresh token.

### Request Details
- **Method**: `POST`
- **Endpoint**: `/auth/refresh`
- **Authentication**: Required (Refresh Token)

### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `refreshToken` | String | ✅ | Valid JWT refresh token | Current refresh token |

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses

**401 Unauthorized - Invalid Refresh Token**
```json
{
  "success": false,
  "message": "Invalid or expired refresh token",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/refresh"
}
```

### UI Integration Notes
- Implement automatic token refresh before expiration
- Handle refresh token expiration by redirecting to login
- Update stored tokens with new values
- Retry failed requests after successful token refresh

---

## UI Integration Guidelines

### Token Management

```javascript
// Token storage utility
class TokenManager {
  static setTokens(accessToken, refreshToken) {
    // Store in HttpOnly cookies (recommended) or secure storage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
  
  static getAccessToken() {
    return localStorage.getItem('accessToken');
  }
  
  static getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }
  
  static clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
```

### Form Validation Rules

#### Registration Form
```javascript
const registrationValidation = {
  username: {
    required: true,
    pattern: /^[a-zA-Z0-9_]{3,20}$/,
    message: "Username must be 3-20 characters (letters, numbers, underscore only)"
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address"
  },
  password: {
    required: true,
    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
    message: "Password must be at least 8 characters with letters and numbers"
  },
  firstName: {
    required: true,
    pattern: /^[A-Za-z\s]{1,50}$/,
    message: "First name is required (1-50 characters, letters only)"
  },
  lastName: {
    required: true,
    pattern: /^[A-Za-z\s]{1,50}$/,
    message: "Last name is required (1-50 characters, letters only)"
  }
}
```

#### Login Form
```javascript
const loginValidation = {
  username: {
    required: true,
    message: "Username or email is required"
  },
  password: {
    required: true,
    message: "Password is required"
  }
}
```

### Error Handling Strategy

```javascript
// Authentication error handler
const handleAuthError = (error) => {
  if (error.response?.status === 400) {
    // Validation errors
    const validationErrors = error.response.data.data?.errors || [];
    return validationErrors.reduce((acc, err) => {
      acc[err.field] = err.message;
      return acc;
    }, {});
  } else if (error.response?.status === 401) {
    // Invalid credentials
    return { general: 'Invalid username or password' };
  } else if (error.response?.status === 403) {
    // Account locked
    return { general: 'Account is temporarily locked' };
  } else if (error.response?.status === 409) {
    // Conflict (username/email exists)
    return { general: error.response.data.message };
  } else {
    // Generic error
    return { general: 'An unexpected error occurred' };
  }
};
```

### State Management Integration

```javascript
// Pinia auth store
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),
  
  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authApi.login(credentials);
        const { accessToken, refreshToken, ...userData } = response.data.data;
        
        this.user = userData;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.isAuthenticated = true;
        
        TokenManager.setTokens(accessToken, refreshToken);
        
        return { success: true };
      } catch (error) {
        this.error = handleAuthError(error);
        return { success: false, errors: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async register(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authApi.register(userData);
        return { success: true, data: response.data.data };
      } catch (error) {
        this.error = handleAuthError(error);
        return { success: false, errors: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async logout() {
      try {
        if (this.refreshToken) {
          await authApi.logout({ refreshToken: this.refreshToken });
        }
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.clearAuth();
      }
    },
    
    async refreshToken() {
      try {
        const response = await authApi.refreshToken({ 
          refreshToken: this.refreshToken 
        });
        
        const { accessToken, refreshToken } = response.data.data;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        
        TokenManager.setTokens(accessToken, refreshToken);
        
        return accessToken;
      } catch (error) {
        this.clearAuth();
        throw error;
      }
    },
    
    clearAuth() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.isAuthenticated = false;
      TokenManager.clearTokens();
    }
  }
});
```

### Axios Interceptors Setup

```javascript
// Request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const authStore = useAuthStore();
        const newToken = await authStore.refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        const authStore = useAuthStore();
        authStore.clearAuth();
        router.push('/login');
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

### Security Considerations

1. **Token Storage**: Use HttpOnly cookies for production
2. **HTTPS**: Always use HTTPS in production
3. **Token Expiration**: Implement proper token refresh logic
4. **Rate Limiting**: Handle login attempt rate limiting
5. **Password Security**: Implement password strength requirements
6. **Session Management**: Clear all auth data on logout

### Performance Considerations

1. **Token Refresh**: Refresh tokens proactively before expiration
2. **Error Recovery**: Implement retry logic for network failures
3. **Loading States**: Show appropriate loading indicators
4. **Caching**: Cache user data appropriately

---

## Testing Recommendations

### Unit Testing
- Test form validation logic
- Test token management utilities
- Test error handling scenarios
- Test state management actions

### Integration Testing
- Test complete authentication flows
- Test token refresh mechanisms
- Test error response handling
- Test security configurations

### E2E Testing
- Test registration to login flow
- Test logout functionality
- Test session persistence
- Test token expiration handling
