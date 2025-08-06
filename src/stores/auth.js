import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '../services/auth.js'
import TokenManager from '../services/tokenManager.js'

// Error handling utility
const handleAuthError = (error) => {
  console.error('Auth error:', error)
  
  if (error.response?.status === 400) {
    // Validation errors
    const validationErrors = error.response.data.data?.errors || []
    return {
      type: 'validation',
      validationErrors: validationErrors.reduce((acc, err) => {
        acc[err.field] = err.message
        return acc
      }, {}),
      message: 'Validation failed'
    }
  } else if (error.response?.status === 401) {
    // Invalid credentials
    return {
      type: 'auth',
      message: error.response.data?.message || 'Invalid username or password'
    }
  } else if (error.response?.status === 403) {
    // Account locked
    return {
      type: 'forbidden',
      message: error.response.data?.message || 'Account is temporarily locked'
    }
  } else if (error.response?.status === 409) {
    // Conflict (username/email exists)
    return {
      type: 'conflict',
      message: error.response.data?.message || 'Username or email already exists'
    }
  } else {
    // Generic error
    return {
      type: 'generic',
      message: error.response?.data?.message || error.message || 'An unexpected error occurred'
    }
  }
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const currentUser = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Initialize auth state from localStorage
  const initializeAuth = () => {
    const userData = TokenManager.getUserData()
    const accessToken = TokenManager.getAccessToken()
    
    if (userData && accessToken && !TokenManager.isTokenExpired()) {
      currentUser.value = userData
      isAuthenticated.value = true
      console.log('Auth state initialized from storage:', userData.username)
    } else if (accessToken) {
      // Token exists but is expired, clear it
      TokenManager.clearTokens()
      console.log('Expired token cleared')
    }
  }

  // Login function with backend integration
  const login = async (credentials) => {
    try {
      isLoading.value = true
      error.value = null
      
      console.log('Auth store login called with:', credentials.username || credentials.usernameOrEmail)
      const response = await authApi.login(credentials)
      console.log('Backend login response:', response)
      
      // Handle API response structure from documentation
      if (response?.success && response?.data) {
        const responseData = response.data
        
        const userData = {
          id: responseData.userId,
          username: responseData.email,
          email: responseData.email,
          firstName: responseData.firstName,
          lastName: responseData.lastName,
          roles: responseData.roles || ['USER']
        }
        
        currentUser.value = userData
        isAuthenticated.value = true
        
        // Store auth data with tokens using TokenManager
        TokenManager.setTokens(
          responseData.accessToken,
          responseData.refreshToken,
          userData,
          responseData.tokenType || 'Bearer',
          responseData.expiresIn || 3600
        )
        
        console.log('Login successful, auth state set for user:', userData.username)
        return { success: true }
      } else {
        // Handle failure response
        const errorMessage = response.data?.message || 'Login failed'
        error.value = errorMessage
        console.error('Login failed:', errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err) {
      const errorInfo = handleAuthError(err)
      error.value = errorInfo.message
      
      console.warn('Backend login failed:', errorInfo)
      
      // Fallback to demo login for testing if specific credentials
      if (credentials.usernameOrEmail && credentials.password) {
        return await demoLogin(credentials.usernameOrEmail, credentials.password)
      }
      
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      isLoading.value = true
      error.value = null
      
      console.log('Auth store register called with:', userData.username)
      const response = await authApi.signup(userData)
      console.log('Backend signup response:', response)
      
      // Handle API response structure from documentation
      if (response?.success && response?.message) {
        // Registration successful but doesn't automatically log in
        console.log('Registration successful:', response.message)
        return { 
          success: true, 
          data: response.message,
          message: response.message || 'User registered successfully'
        }
      } else {
        // Handle failure response
        const errorMessage = response.data?.message || 'Registration failed'
        error.value = errorMessage
        console.error('Registration failed:', errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err) {
      const errorInfo = handleAuthError(err)
      error.value = errorInfo.message
      
      console.error('Registration error:', errorInfo)
      
      // Return validation errors if available
      if (errorInfo.type === 'validation') {
        return { 
          success: false, 
          validationErrors: errorInfo.validationErrors,
          error: errorInfo.message
        }
      }
      
      // Return other error types
      if (errorInfo.type === 'conflict') {
        return { success: false, error: errorInfo.message }
      }
      
      // Fallback for development/testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Using fallback demo registration')
        return { 
          success: true, 
          data: {
            userId: Date.now(),
            username: userData.username,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName
          },
          message: 'Demo registration successful'
        }
      }
      
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Get refresh token from storage
      const refreshToken = TokenManager.getRefreshToken()
      if (refreshToken) {
        await authApi.logout({ refreshToken })
      }
    } catch (error) {
      console.error('Logout API error:', error)
      // Continue with local logout even if API fails
    } finally {
      // Clear local auth state
      currentUser.value = null
      isAuthenticated.value = false
      error.value = null
      TokenManager.clearTokens()
      console.log('User logged out successfully')
    }
  }

  // Refresh token function
  const refreshToken = async () => {
    try {
      const storedRefreshToken = TokenManager.getRefreshToken()
      if (!storedRefreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await authApi.refresh({ refreshToken: storedRefreshToken })
      
      if (response.data?.success && response.data?.data) {
        // Update tokens using TokenManager
        TokenManager.updateTokens(
          response.data.data.accessToken,
          response.data.data.refreshToken,
          response.data.data.tokenType || 'Bearer',
          response.data.data.expiresIn || 3600
        )
        
        console.log('Token refreshed successfully')
        return response.data.data.accessToken
      } else {
        throw new Error('Failed to refresh token')
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      // Clear auth state on refresh failure
      await logout()
      throw error
    }
  }

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await authApi.updateProfile(profileData)
      
      if (response.user) {
        currentUser.value = response.user
        
        // Update stored auth data
        const authData = JSON.parse(localStorage.getItem('smartcare_auth') || '{}')
        authData.user = response.user
        localStorage.setItem('smartcare_auth', JSON.stringify(authData))
        
        return { success: true }
      }
    } catch (err) {
      error.value = err.message || 'Profile update failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Demo user profiles for fallback/testing
  const userProfiles = {
    'demo@smartcare.com': {
      id: 1,
      name: 'Demo User',
      email: 'demo@smartcare.com',
      username: 'demo',
      avatar: '/api/placeholder/150/150',
      dateOfBirth: '1985-06-15',
      bloodType: 'O+',
      phone: '(555) 123-4567',
      address: '123 Main Street, Seattle, WA 98101',
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Family',
        phone: '(555) 987-6543'
      },
      healthData: {
        healthScore: 92,
        vitals: {
          bloodPressure: { systolic: 120, diastolic: 80, date: '2024-01-08' },
          heartRate: { value: 72, date: '2024-01-08' },
          temperature: { value: 98.6, date: '2024-01-08' },
          weight: { value: 165, date: '2024-01-07' },
          height: { value: "5'8\"", date: '2023-12-01' }
        },
        conditions: ['Hypertension'],
        allergies: ['Penicillin', 'Peanuts'],
        medications: [
          { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
          { name: 'Vitamin D3', dosage: '2000 IU', frequency: 'Once daily' }
        ]
      }
    },
    'testuser': {
      id: 2,
      name: 'Test User',
      email: 'testuser@smartcare.com',
      username: 'testuser',
      avatar: '/api/placeholder/150/150',
      dateOfBirth: '1990-03-15',
      bloodType: 'A+',
      phone: '(555) 234-5678',
      address: '456 Test Street, Test City, TC 12345',
      emergencyContact: {
        name: 'Test Contact',
        relationship: 'Friend',
        phone: '(555) 987-6543'
      },
      healthData: {
        healthScore: 88,
        vitals: {
          bloodPressure: { systolic: 118, diastolic: 78, date: '2024-01-08' },
          heartRate: { value: 68, date: '2024-01-08' },
          temperature: { value: 98.4, date: '2024-01-08' },
          weight: { value: 155, date: '2024-01-07' },
          height: { value: "5'7\"", date: '2023-12-01' }
        },
        conditions: [],
        allergies: ['Shellfish'],
        medications: [
          { name: 'Multivitamin', dosage: '1 tablet', frequency: 'Once daily' }
        ]
      }
    }
  }

  // Demo login function (for testing without backend)
  const demoLogin = async (usernameOrEmail, password) => {
    isLoading.value = true
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const userByEmail = userProfiles[usernameOrEmail]
    const userByUsername = Object.values(userProfiles).find(user => user.username === usernameOrEmail)
    const user = userByEmail || userByUsername
    
    if (user && (password === 'demo' || password === 'test123')) {
      currentUser.value = user
      isAuthenticated.value = true
      
      localStorage.setItem('smartcare_auth', JSON.stringify({
        user: user,
        accessToken: 'demo-access-token',
        tokenType: 'Bearer'
      }))
      
      isLoading.value = false
      return { success: true }
    } else {
      isLoading.value = false
      error.value = 'Invalid credentials'
      return { success: false, error: 'Invalid credentials' }
    }
  }

  // Computed properties
  const user = computed(() => currentUser.value)
  const isLoggedIn = computed(() => isAuthenticated.value)

  const userInitials = computed(() => {
    if (!currentUser.value) return 'U'
    
    // Try to get initials from name first, fallback to username/email
    if (currentUser.value.name) {
      return currentUser.value.name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    } else if (currentUser.value.username) {
      // For email-based usernames, get first 2 characters before @
      const username = currentUser.value.username
      if (username.includes('@')) {
        return username.substring(0, 2).toUpperCase()
      }
      return username.substring(0, 2).toUpperCase()
    }
    
    return 'U'
  })

  const age = computed(() => {
    if (!currentUser.value || !currentUser.value.dateOfBirth) return 0
    const today = new Date()
    const birthDate = new Date(currentUser.value.dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  })

  // Additional helper functions
  const getHealthProfile = async () => {
    try {
      isLoading.value = true
      const response = await authApi.getHealthProfile()
      return response
    } catch (err) {
      error.value = err.message || 'Failed to fetch health profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const checkUsername = async (username) => {
    try {
      const response = await authApi.checkUsername(username)
      return response.available
    } catch (err) {
      console.error('Failed to check username availability:', err)
      return false
    }
  }

  const checkEmail = async (email) => {
    try {
      const response = await authApi.checkEmail(email)
      return response.available
    } catch (err) {
      console.error('Failed to check email availability:', err)
      return false
    }
  }

  const completeTour = async () => {
    try {
      await authApi.completeTour()
      if (currentUser.value) {
        currentUser.value.tourCompleted = true
      }
    } catch (err) {
      console.error('Failed to complete tour:', err)
    }
  }

  const updateHealthScore = (newScore) => {
    if (currentUser.value && currentUser.value.healthData) {
      currentUser.value.healthData.healthScore = newScore
      // Update localStorage for demo mode
      const authData = JSON.parse(localStorage.getItem('smartcare_auth') || '{}')
      if (authData.user) {
        authData.user = currentUser.value
        localStorage.setItem('smartcare_auth', JSON.stringify(authData))
      }
    }
  }

  // Token information
  const accessToken = computed(() => {
    const authData = localStorage.getItem('smartcare_auth')
    if (authData) {
      try {
        const { accessToken } = JSON.parse(authData)
        return accessToken
      } catch {
        return null
      }
    }
    return null
  })
  
  const isTokenValid = computed(() => {
    return !!accessToken.value
  })

  // Backward compatibility alias
  const checkAuthState = initializeAuth

  // Initialize auth state on store creation
  initializeAuth()

  return {
    // State
    isAuthenticated,
    currentUser,
    isLoading,
    error,
    
    // Computed
    user,
    isLoggedIn,
    userInitials,
    age,
    accessToken,
    isTokenValid,
    
    // Actions
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    initializeAuth,
    checkAuthState, // Backward compatibility
    demoLogin
  }
})
