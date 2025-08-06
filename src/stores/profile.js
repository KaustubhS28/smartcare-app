import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { profileApi } from '../services/profile.js'

export const useProfileStore = defineStore('profile', () => {
  // State
  const profile = ref(null)
  const healthProfiles = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const validationErrors = ref({})

  // Helper function to handle API errors according to documentation
  const handleProfileError = (error) => {
    console.error('Profile API Error:', error)
    
    if (error.response?.status === 400) {
      // Validation errors - extract field-specific messages
      const validationErrors = error.response.data.data?.errors || []
      const errorMap = validationErrors.reduce((acc, err) => {
        acc[err.field] = err.message
        return acc
      }, {})
      return { type: 'validation', errors: errorMap }
    } else if (error.response?.status === 401) {
      // Unauthorized - redirect to login (handled by component)
      return { type: 'auth', message: 'Authentication required' }
    } else if (error.response?.status === 403) {
      // Forbidden - show access denied message
      return { type: 'forbidden', message: 'Access denied' }
    } else if (error.response?.status === 404) {
      // Not found
      return { type: 'notfound', message: 'Profile not found' }
    } else {
      // Generic error
      return { type: 'generic', message: error.message || 'An unexpected error occurred' }
    }
  }

  // Actions
  const fetchProfile = async () => {
    try {
      isLoading.value = true
      error.value = null
      validationErrors.value = {}

      const response = await profileApi.getProfile()
      
      // Extract data from API response structure
      if (response.data?.success && response.data?.data) {
        profile.value = response.data.data
      } else {
        // Fallback for different response structures
        profile.value = response.data
      }
      
      return profile.value
    } catch (err) {
      const errorInfo = handleProfileError(err)
      if (errorInfo.type === 'validation') {
        validationErrors.value = errorInfo.errors
      } else {
        error.value = errorInfo.message
      }
      
      // Provide fallback profile for development/demo
      if (process.env.NODE_ENV === 'development') {
        const demoProfile = {
          id: "550e8400-e29b-41d4-a716-446655440000",
          username: "demo_user",
          email: "demo@smartcare.com",
          firstName: "Demo",
          lastName: "User",
          phoneNumber: "+1-555-123-4567",
          address: "123 Demo Street, Demo City, DC 12345",
          profilePictureUrl: null,
          dateOfBirth: "1990-01-01T00:00:00.000Z",
          gender: "MALE",
          tourCompleted: false,
          profileCompleted: true,
          roles: ["USER"]
        }
        profile.value = demoProfile
        return demoProfile
      }
      
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (userData) => {
    try {
      isLoading.value = true
      error.value = null
      validationErrors.value = {}

      const response = await profileApi.updateProfile(userData)
      
      // Extract data from API response structure
      if (response.data?.success && response.data?.data) {
        profile.value = response.data.data
      } else {
        profile.value = response.data
      }
      
      return { success: true, data: profile.value }
    } catch (err) {
      const errorInfo = handleProfileError(err)
      if (errorInfo.type === 'validation') {
        validationErrors.value = errorInfo.errors
        throw new Error('Validation failed')
      } else {
        error.value = errorInfo.message
        throw err
      }
    } finally {
      isLoading.value = false
    }
  }

  const updateTourCompletion = async (tourCompleted = true) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await profileApi.updateTourCompletion(tourCompleted)
      
      // Update local profile state
      if (profile.value) {
        profile.value.tourCompleted = tourCompleted
      }
      
      return { success: true }
    } catch (err) {
      const errorInfo = handleProfileError(err)
      error.value = errorInfo.message
      
      // Update local state for demo purposes
      if (profile.value) {
        profile.value.tourCompleted = tourCompleted
      }
      
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  const fetchHealthProfile = async () => {
    try {
      isLoading.value = true
      error.value = null
      validationErrors.value = {}

      const response = await profileApi.getHealthProfile()
      
      // Extract data from API response structure
      if (response.data?.success && response.data?.data) {
        healthProfiles.value = response.data.data
      } else {
        healthProfiles.value = response.data || []
      }
      
      return healthProfiles.value
    } catch (err) {
      const errorInfo = handleProfileError(err)
      error.value = errorInfo.message
      
      // Provide fallback health profile for development/demo
      if (process.env.NODE_ENV === 'development') {
        const demoHealthProfile = {
          id: "550e8400-e29b-41d4-a716-446655440001",
          bloodType: "A_POSITIVE",
          height: 175.5,
          weight: 70.2,
          allergies: ["Penicillin", "Peanuts"],
          medicalConditions: ["Asthma"],
          emergencyContactName: "Jane Doe",
          emergencyContactPhone: "+1-555-987-6543",
          emergencyContactRelationship: "Spouse",
          additionalNotes: "Regular exercise routine"
        }
        healthProfiles.value = [demoHealthProfile]
        return healthProfiles.value
      }
      
      healthProfiles.value = []
      return []
    } finally {
      isLoading.value = false
    }
  }

  const createHealthProfile = async (healthData) => {
    try {
      isLoading.value = true
      error.value = null
      validationErrors.value = {}

      const response = await profileApi.createHealthProfile(healthData)
      
      // Extract data from API response structure
      let newHealthProfile
      if (response.data?.success && response.data?.data) {
        newHealthProfile = response.data.data
      } else {
        newHealthProfile = response.data
      }
      
      // Add to local health profiles array
      healthProfiles.value.push(newHealthProfile)
      
      return { success: true, data: newHealthProfile }
    } catch (err) {
      const errorInfo = handleProfileError(err)
      if (errorInfo.type === 'validation') {
        validationErrors.value = errorInfo.errors
        throw new Error('Validation failed')
      } else {
        error.value = errorInfo.message
        throw err
      }
    } finally {
      isLoading.value = false
    }
  }

  const updateHealthProfile = async (healthProfileId, healthData) => {
    try {
      isLoading.value = true
      error.value = null
      validationErrors.value = {}

      const response = await profileApi.updateHealthProfile(healthProfileId, healthData)
      
      // Extract data from API response structure
      let updatedHealthProfile
      if (response.data?.success && response.data?.data) {
        updatedHealthProfile = response.data.data
      } else {
        updatedHealthProfile = response.data
      }
      
      // Update local health profiles array
      const index = healthProfiles.value.findIndex(hp => hp.id === healthProfileId)
      if (index !== -1) {
        healthProfiles.value[index] = updatedHealthProfile
      }
      
      return { success: true, data: updatedHealthProfile }
    } catch (err) {
      const errorInfo = handleProfileError(err)
      if (errorInfo.type === 'validation') {
        validationErrors.value = errorInfo.errors
        throw new Error('Validation failed')
      } else {
        error.value = errorInfo.message
        throw err
      }
    } finally {
      isLoading.value = false
    }
  }

  // Computed properties
  const fullName = computed(() => {
    if (!profile.value) return 'Unknown User'
    return `${profile.value.firstName || ''} ${profile.value.lastName || ''}`.trim() || profile.value.username || 'Unknown User'
  })

  const initials = computed(() => {
    if (!profile.value) return 'U'
    const firstName = profile.value.firstName || ''
    const lastName = profile.value.lastName || ''
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U'
  })

  const age = computed(() => {
    if (!profile.value?.dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(profile.value.dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  })

  const primaryHealthProfile = computed(() => {
    return healthProfiles.value[0] || null
  })

  const bmi = computed(() => {
    const healthProfile = primaryHealthProfile.value
    if (!healthProfile?.height || !healthProfile?.weight) return null
    const heightInMeters = healthProfile.height / 100
    return (healthProfile.weight / (heightInMeters * heightInMeters)).toFixed(1)
  })

  const bmiCategory = computed(() => {
    const bmiValue = parseFloat(bmi.value)
    if (!bmiValue) return null
    if (bmiValue < 18.5) return 'Underweight'
    if (bmiValue < 25) return 'Normal weight'
    if (bmiValue < 30) return 'Overweight'
    return 'Obese'
  })

  const isProfileComplete = computed(() => {
    return profile.value?.profileCompleted || false
  })

  const isTourComplete = computed(() => {
    return profile.value?.tourCompleted || false
  })

  // Clear errors
  const clearErrors = () => {
    error.value = null
    validationErrors.value = {}
  }

  return {
    // State
    profile,
    healthProfiles,
    isLoading,
    error,
    validationErrors,
    
    // Computed
    fullName,
    initials,
    age,
    primaryHealthProfile,
    bmi,
    bmiCategory,
    isProfileComplete,
    isTourComplete,
    
    // Actions
    fetchProfile,
    updateProfile,
    updateTourCompletion,
    fetchHealthProfile,
    createHealthProfile,
    updateHealthProfile,
    clearErrors
  }
})
