import apiClient from './api.js'

// Field validation utilities
const validateField = (value, field, constraints = {}) => {
  const errors = []
  
  if (constraints.required && (!value || value.trim().length === 0)) {
    errors.push(`${field} is required`)
    return errors
  }
  
  if (value && constraints.minLength && value.length < constraints.minLength) {
    errors.push(`${field} must be at least ${constraints.minLength} characters`)
  }
  
  if (value && constraints.maxLength && value.length > constraints.maxLength) {
    errors.push(`${field} must be ${constraints.maxLength} characters or less`)
  }
  
  if (value && constraints.pattern && !constraints.pattern.test(value)) {
    errors.push(constraints.patternMessage || `${field} format is invalid`)
  }
  
  return errors
}

// Clean and validate signup data according to API spec
const cleanSignupData = (userData) => {
  const cleanData = {}
  const errors = []
  
  // Username validation (3-20 characters, alphanumeric + underscore)
  if (userData.username) {
    cleanData.username = userData.username.trim()
    const usernameErrors = validateField(cleanData.username, 'Username', {
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_]+$/,
      patternMessage: 'Username must contain only letters, numbers, and underscores'
    })
    errors.push(...usernameErrors)
  } else {
    errors.push('Username is required')
  }
  
  // Email validation
  if (userData.email) {
    cleanData.email = userData.email.trim()
    const emailErrors = validateField(cleanData.email, 'Email', {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Please enter a valid email address'
    })
    errors.push(...emailErrors)
  } else {
    errors.push('Email is required')
  }
  
  // Password validation (min 8 chars, 1 letter, 1 number)
  if (userData.password) {
    cleanData.password = userData.password // Don't trim passwords
    const passwordErrors = validateField(cleanData.password, 'Password', {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/,
      patternMessage: 'Password must contain at least one letter and one number'
    })
    errors.push(...passwordErrors)
  } else {
    errors.push('Password is required')
  }
  
  // First name validation (1-50 characters, letters only)
  if (userData.firstName) {
    cleanData.firstName = userData.firstName.trim()
    const firstNameErrors = validateField(cleanData.firstName, 'First name', {
      required: true,
      minLength: 1,
      maxLength: 50,
      pattern: /^[A-Za-z\s]+$/,
      patternMessage: 'First name must contain only letters and spaces'
    })
    errors.push(...firstNameErrors)
  } else {
    errors.push('First name is required')
  }
  
  // Last name validation (1-50 characters, letters only)
  if (userData.lastName) {
    cleanData.lastName = userData.lastName.trim()
    const lastNameErrors = validateField(cleanData.lastName, 'Last name', {
      required: true,
      minLength: 1,
      maxLength: 50,
      pattern: /^[A-Za-z\s]+$/,
      patternMessage: 'Last name must contain only letters and spaces'
    })
    errors.push(...lastNameErrors)
  } else {
    errors.push('Last name is required')
  }
  
  // Phone number validation (optional)
  if (userData.phoneNumber && userData.phoneNumber.trim()) {
    cleanData.phoneNumber = userData.phoneNumber.trim()
    // Basic phone validation - allow various formats
    const phoneErrors = validateField(cleanData.phoneNumber, 'Phone number', {
      pattern: /^[\+]?[\d\s\-\(\)\.]+$/,
      patternMessage: 'Please enter a valid phone number'
    })
    errors.push(...phoneErrors)
  }
  
  return { cleanData, errors }
}

// Authentication API endpoints following the API documentation
export const authApi = {
  // User login
  login: (credentials) => {
    // Backend expects 'username' field (can be username or email)
    const loginData = {
      usernameOrEmail: credentials.usernameOrEmail || credentials.username || credentials.email,
      password: credentials.password
    }
    return apiClient.post('/auth/signin', loginData)
  },

  // User registration with validation
  signup: (userData) => {
    // Clean and validate data according to API spec
    const { cleanData, errors } = cleanSignupData(userData)
    
    // If there are validation errors, throw them in API format
    if (errors.length > 0) {
      const error = new Error('Validation failed')
      error.response = {
        status: 400,
        data: {
          success: false,
          message: 'Validation failed',
          data: {
            errors: errors.map(errorMsg => ({
              field: errorMsg.split(' ')[0].toLowerCase(),
              message: errorMsg
            }))
          }
        }
      }
      throw error
    }
    
    return apiClient.post('/auth/signup', cleanData)
  },

  // Logout (invalidate token)
  logout: (logoutData) => {
    return apiClient.post('/auth/logout', logoutData)
  },

  // Refresh token
  refresh: (refreshData) => {
    return apiClient.post('/auth/refresh', refreshData)
  },

  // Utility functions for real-time validation (future implementation)
  checkUsernameAvailability: (username) => {
    return apiClient.get(`/auth/check-username?username=${encodeURIComponent(username)}`)
  },

  checkEmailAvailability: (email) => {
    return apiClient.get(`/auth/check-email?email=${encodeURIComponent(email)}`)
  }
}

export default authApi
