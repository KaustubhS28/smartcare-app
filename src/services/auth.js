import apiClient from './api.js'

// Authentication API endpoints
export const authApi = {
  // User login
  signin: (credentials) => {
    return apiClient.post('/auth/signin', credentials)
  },

  // User registration
  signup: (userData) => {
    return apiClient.post('/auth/signup', userData)
  },

  // Refresh token
  refreshToken: (refreshToken) => {
    return apiClient.post('/auth/refresh', { refreshToken })
  },

  // Logout (invalidate token)
  logout: () => {
    return apiClient.post('/auth/logout')
  },

  // Forgot password
  forgotPassword: (email) => {
    return apiClient.post('/auth/forgot-password', { email })
  },

  // Reset password
  resetPassword: (resetData) => {
    return apiClient.post('/auth/reset-password', resetData)
  },

  // Verify email
  verifyEmail: (verificationData) => {
    return apiClient.post('/auth/verify-email', verificationData)
  },

  // Change password
  changePassword: (passwordData) => {
    return apiClient.post('/auth/change-password', passwordData)
  },

  // Update profile
  updateProfile: (profileData) => {
    return apiClient.put('/auth/profile', profileData)
  },

  // Get current user profile
  getCurrentUser: () => {
    return apiClient.get('/auth/me')
  }
}

export default authApi
