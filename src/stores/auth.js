import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '../services/auth.js'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const currentUser = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Initialize auth state from localStorage
  const initializeAuth = () => {
    const authData = localStorage.getItem('smartcare_auth')
    if (authData) {
      try {
        const { user, accessToken, tokenType } = JSON.parse(authData)
        if (accessToken && user) {
          currentUser.value = user
          isAuthenticated.value = true
        }
      } catch (error) {
        console.warn('Failed to parse stored auth data:', error)
        localStorage.removeItem('smartcare_auth')
      }
    }
  }

  // Login function with backend integration
  const login = async (credentials) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await authApi.signin(credentials)
      
      // Handle new response structure
      if (response.success && response.data) {
        const userData = {
          id: response.data.userId,
          username: response.data.username,
          email: response.data.email,
          profileCompleted: response.data.profileCompleted,
          tourCompleted: response.data.tourCompleted
        }
        
        currentUser.value = userData
        isAuthenticated.value = true
        
        // Store auth data with new structure
        localStorage.setItem('smartcare_auth', JSON.stringify({
          user: userData,
          accessToken: response.data.accessToken,
          tokenType: response.data.tokenType
        }))
        
        return { success: true }
      } else {
        // Handle failure response
        const errorMessage = response.message || 'Login failed'
        error.value = errorMessage
        return { success: false, error: errorMessage }
      }
    } catch (err) {
      console.warn('Backend login failed:', err)
      error.value = err.message || 'Login failed'
      
      // Fallback to demo login for testing
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
      
      const response = await authApi.signup(userData)
      
      // Handle new response structure
      if (response.success && response.data) {
        const userInfo = {
          id: response.data.userId,
          username: response.data.username,
          email: response.data.email,
          profileCompleted: response.data.profileCompleted,
          tourCompleted: response.data.tourCompleted
        }
        
        currentUser.value = userInfo
        isAuthenticated.value = true
        
        // Store auth data with new structure
        localStorage.setItem('smartcare_auth', JSON.stringify({
          user: userInfo,
          accessToken: response.data.accessToken,
          tokenType: response.data.tokenType
        }))
        
        return { success: true }
      } else {
        // Handle failure response
        const errorMessage = response.message || 'Registration failed'
        error.value = errorMessage
        return { success: false, error: errorMessage }
      }
    } catch (err) {
      error.value = err.message || 'Registration failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Logout function
  const logout = () => {
    currentUser.value = null
    isAuthenticated.value = false
    error.value = null
    localStorage.removeItem('smartcare_auth')
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
    updateProfile,
    initializeAuth,
    checkAuthState, // Backward compatibility
    demoLogin
  }
})
