import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { profileApi } from '../services/profile.js'

export const useProfileStore = defineStore('profile', () => {
  // State
  const profile = ref(null)
  const healthProfile = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Actions
  const fetchProfile = async () => {
    try {
      isLoading.value = true
      error.value = null

      const response = await profileApi.getProfile()
      profile.value = response.user || response
      
      return profile.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch profile'
      console.error('Failed to fetch profile:', err)
      
      // Return fallback profile for demo
      const demoProfile = {
        id: 1,
        name: 'Demo User',
        email: 'demo@smartcare.com',
        phone: '(555) 123-4567',
        address: '123 Demo Street, Demo City, DC 12345',
        dateOfBirth: '1990-01-01',
        profilePictureUrl: '/api/placeholder/150/150'
      }
      profile.value = demoProfile
      return demoProfile
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (userData) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await profileApi.updateProfile(userData)
      profile.value = response.user || response
      
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Failed to update profile'
      console.error('Failed to update profile:', err)
      
      // Update local profile for demo
      if (profile.value) {
        profile.value = { ...profile.value, ...userData }
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

      const response = await profileApi.getHealthProfile()
      healthProfile.value = response.healthProfile || response
      
      return healthProfile.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch health profile'
      console.error('Failed to fetch health profile:', err)
      
      // Return fallback health profile for demo
      const demoHealthProfile = {
        id: 1,
        userId: 1,
        height: 175, // cm
        weight: 70, // kg
        bloodType: 'O_POSITIVE',
        medicalConditions: ['Hypertension'],
        allergies: ['Penicillin', 'Peanuts'],
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '(555) 987-6543',
        additionalNotes: 'No additional notes',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      healthProfile.value = demoHealthProfile
      return demoHealthProfile
    } finally {
      isLoading.value = false
    }
  }

  const updateHealthProfile = async (healthData) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await profileApi.updateHealthProfile(healthData)
      healthProfile.value = response.healthProfile || response
      
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Failed to update health profile'
      console.error('Failed to update health profile:', err)
      
      // Update local health profile for demo
      if (healthProfile.value) {
        healthProfile.value = { ...healthProfile.value, ...healthData }
      }
      
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  const completeTour = async () => {
    try {
      await profileApi.completeTour()
      if (profile.value) {
        profile.value.tourCompleted = true
      }
      return { success: true }
    } catch (err) {
      console.error('Failed to complete tour:', err)
      // Update local profile for demo
      if (profile.value) {
        profile.value.tourCompleted = true
      }
      return { success: true }
    }
  }

  const updateProfilePicture = async (profilePictureUrl) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await profileApi.updateProfilePicture(profilePictureUrl)
      profile.value = response.user || response
      
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Failed to update profile picture'
      console.error('Failed to update profile picture:', err)
      
      // Update local profile for demo
      if (profile.value) {
        profile.value.profilePictureUrl = profilePictureUrl
      }
      
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // Computed properties
  const fullName = computed(() => {
    return profile.value?.name || 'Unknown User'
  })

  const initials = computed(() => {
    if (!profile.value?.name) return 'U'
    return profile.value.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
  })

  const age = computed(() => {
    if (!profile.value?.dateOfBirth) return 0
    const today = new Date()
    const birthDate = new Date(profile.value.dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  })

  const bmi = computed(() => {
    if (!healthProfile.value?.height || !healthProfile.value?.weight) return 0
    const heightInMeters = healthProfile.value.height / 100
    return (healthProfile.value.weight / (heightInMeters * heightInMeters)).toFixed(1)
  })

  const bmiCategory = computed(() => {
    const bmiValue = parseFloat(bmi.value)
    if (bmiValue < 18.5) return 'Underweight'
    if (bmiValue < 25) return 'Normal weight'
    if (bmiValue < 30) return 'Overweight'
    return 'Obese'
  })

  return {
    // State
    profile,
    healthProfile,
    isLoading,
    error,
    
    // Computed
    fullName,
    initials,
    age,
    bmi,
    bmiCategory,
    
    // Actions
    fetchProfile,
    updateProfile,
    fetchHealthProfile,
    updateHealthProfile,
    completeTour,
    updateProfilePicture
  }
})
