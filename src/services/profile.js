import apiClient from './api.js'

// Profile API endpoints
export const profileApi = {
  // Get user profile
  getProfile: () => {
    return apiClient.get('/profile')
  },

  // Update user profile
  updateProfile: (userData) => {
    return apiClient.put('/profile', userData)
  },

  // Get health profile
  getHealthProfile: () => {
    return apiClient.get('/profile/health')
  },

  // Create or update health profile
  createHealthProfile: (healthData) => {
    return apiClient.post('/profile/health', healthData)
  },

  updateHealthProfile: (healthData) => {
    return apiClient.put('/profile/health', healthData)
  },

  // Complete tour
  completeTour: () => {
    return apiClient.post('/profile/complete-tour')
  },

  // Update profile picture
  updateProfilePicture: (profilePictureUrl) => {
    return apiClient.post('/profile/profile-picture', null, {
      params: { profilePictureUrl }
    })
  }
}

export default profileApi
