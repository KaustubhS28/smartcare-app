import apiClient from './api.js'

// Profile API endpoints following the API documentation
export const profileApi = {
  // Get current user profile
  getProfile: () => {
    return apiClient.get('/profile')
  },

  // Update user profile
  updateProfile: (userData) => {
    // Include required fields but filter out read-only fields
    const { id, tourCompleted, profileCompleted, roles, ...profileData } = userData
    
    // Convert date of birth to proper DateTime format if provided
    if (profileData.dateOfBirth) {
      // If it's just a date (YYYY-MM-DD), convert to DateTime format
      if (profileData.dateOfBirth.length === 10) {
        profileData.dateOfBirth = `${profileData.dateOfBirth}T00:00:00.000Z`
      }
    }
    
    // Ensure required fields are present - get from current profile if not provided
    if (!profileData.email && userData.email) {
      profileData.email = userData.email
    }
    if (!profileData.username && userData.username) {
      profileData.username = userData.username
    }
    // Note: password should be handled separately via password change endpoint
    // For now, we'll include a placeholder to satisfy validation
    if (!profileData.password) {
      profileData.password = "UNCHANGED"
    }
    
    return apiClient.put('/profile', profileData)
  },

  // Update tour completion status
  updateTourCompletion: (tourCompleted) => {
    return apiClient.put('/profile/tour-completion', { tourCompleted })
  },

  // Get user's health profiles
  getHealthProfile: () => {
    return apiClient.get('/profile/health')
  },

  // Create health profile
  createHealthProfile: (healthData) => {
    // Remove fields that shouldn't be sent to backend
    const { id, user, createdAt, updatedAt, ...cleanHealthData } = healthData
    return apiClient.post('/profile/health', cleanHealthData)
  },

  // Update health profile by ID
  updateHealthProfile: (id, healthData) => {
    // Remove fields that shouldn't be sent to backend
    const { user, createdAt, updatedAt, ...cleanHealthData } = healthData
    return apiClient.put(`/profile/health/${id}`, cleanHealthData)
  }
}

export default profileApi
