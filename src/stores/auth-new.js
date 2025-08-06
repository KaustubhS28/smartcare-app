import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '../services/api.js'

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
        const { user, token } = JSON.parse(authData)
        if (token && user) {
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
      
      if (response.token && response.user) {
        currentUser.value = response.user
        isAuthenticated.value = true
        
        // Store auth data
        localStorage.setItem('smartcare_auth', JSON.stringify({
          user: response.user,
          token: response.token
        }))
        
        return { success: true }
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      console.warn('Backend login failed, trying demo login')
      // Fallback to demo login for testing
      return await demoLogin(credentials.username || credentials.email, credentials.password)
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
      
      if (response.token && response.user) {
        currentUser.value = response.user
        isAuthenticated.value = true
        
        // Store auth data
        localStorage.setItem('smartcare_auth', JSON.stringify({
          user: response.user,
          token: response.token
        }))
        
        return { success: true }
      } else {
        throw new Error('Registration failed')
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
  const demoLogin = async (email, password) => {
    isLoading.value = true
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const userByEmail = userProfiles[email]
    const userByUsername = Object.values(userProfiles).find(user => user.username === email)
    const user = userByEmail || userByUsername
    
    if (user && (password === 'demo' || password === 'test123')) {
      currentUser.value = user
      isAuthenticated.value = true
      
      localStorage.setItem('smartcare_auth', JSON.stringify({
        user: user,
        token: 'demo-token'
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
    if (!currentUser.value) return ''
    return currentUser.value.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
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
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    getHealthProfile,
    checkUsername,
    checkEmail,
    completeTour,
    demoLogin,
    initializeAuth,
    updateHealthScore
  }
})
