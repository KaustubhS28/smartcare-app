// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

// API client with common configuration
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    // Add authentication token if available
    const authData = localStorage.getItem('smartcare_auth')
    if (authData) {
      try {
        const { token } = JSON.parse(authData)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (error) {
        console.warn('Failed to parse auth data:', error)
      }
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options })
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    })
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    })
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options })
  }
}

// Create API client instance
const apiClient = new ApiClient()

// Payment API endpoints
export const paymentApi = {
  // Payment Methods
  getPaymentMethods: () => apiClient.get('/payments/methods'),
  
  addPaymentMethod: (paymentData) => apiClient.post('/payments/methods', paymentData),
  
  updatePaymentMethod: (methodId, paymentData) => 
    apiClient.put(`/payments/methods/${methodId}`, paymentData),
  
  deletePaymentMethod: (methodId) => apiClient.delete(`/payments/methods/${methodId}`),
  
  setDefaultPaymentMethod: (methodId) => 
    apiClient.put(`/payments/methods/${methodId}/default`),

  // Payment Processing
  processPayment: (paymentData) => apiClient.post('/payments/process', paymentData),
  
  createPaymentIntent: (amount, currency = 'USD') =>
    apiClient.post('/payments/intent', { amount, currency }),

  // Billing and Invoices
  getBillingHistory: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return apiClient.get(`/billing/invoices${queryParams ? `?${queryParams}` : ''}`)
  },
  
  getInvoice: (invoiceId) => apiClient.get(`/billing/invoices/${invoiceId}`),
  
  downloadInvoice: (invoiceId) => apiClient.get(`/billing/invoices/${invoiceId}/download`),
  
  payInvoice: (invoiceId, paymentMethodId) =>
    apiClient.post(`/billing/invoices/${invoiceId}/pay`, { paymentMethodId }),

  // Payment Analytics
  getPaymentStats: () => apiClient.get('/payments/stats'),
  
  getPaymentHistory: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return apiClient.get(`/payments/history${queryParams ? `?${queryParams}` : ''}`)
  }
}

// Notification API endpoints
export const notificationApi = {
  // Notifications
  getNotifications: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return apiClient.get(`/notifications${queryParams ? `?${queryParams}` : ''}`)
  },
  
  markAsRead: (notificationId) => apiClient.put(`/notifications/${notificationId}/read`),
  
  markAllAsRead: () => apiClient.put('/notifications/read-all'),
  
  deleteNotification: (notificationId) => apiClient.delete(`/notifications/${notificationId}`),
  
  deleteAllNotifications: () => apiClient.delete('/notifications'),

  // Notification Settings
  getSettings: () => apiClient.get('/notifications/settings'),
  
  updateSettings: (settings) => apiClient.put('/notifications/settings', settings),
  
  // Test Notifications
  sendTestNotification: (type, channel) =>
    apiClient.post('/notifications/test', { type, channel }),

  // Notification Preferences
  getPreferences: () => apiClient.get('/notifications/preferences'),
  
  updatePreferences: (preferences) => 
    apiClient.put('/notifications/preferences', preferences),

  // Notification Statistics
  getNotificationStats: () => apiClient.get('/notifications/stats')
}

// User API endpoints
export const userApi = {
  // Profile
  getProfile: () => apiClient.get('/user/profile'),
  
  updateProfile: (profileData) => apiClient.put('/user/profile', profileData),
  
  updatePassword: (passwordData) => apiClient.put('/user/password', passwordData),
  
  deleteAccount: () => apiClient.delete('/user/account'),

  // Privacy Settings
  getPrivacySettings: () => apiClient.get('/user/privacy'),
  
  updatePrivacySettings: (settings) => apiClient.put('/user/privacy', settings),

  // Preferences
  getPreferences: () => apiClient.get('/user/preferences'),
  
  updatePreferences: (preferences) => apiClient.put('/user/preferences', preferences),

  // Two-Factor Authentication
  enableTwoFactor: () => apiClient.post('/user/2fa/enable'),
  
  disableTwoFactor: (code) => apiClient.post('/user/2fa/disable', { code }),
  
  verifyTwoFactor: (code) => apiClient.post('/user/2fa/verify', { code })
}

// Healthcare API endpoints (existing functionality)
export const healthcareApi = {
  // Appointments
  getAppointments: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return apiClient.get(`/appointments${queryParams ? `?${queryParams}` : ''}`)
  },
  
  bookAppointment: (appointmentData) => apiClient.post('/appointments', appointmentData),
  
  cancelAppointment: (appointmentId) => 
    apiClient.delete(`/appointments/${appointmentId}`),
  
  rescheduleAppointment: (appointmentId, newDateTime) =>
    apiClient.put(`/appointments/${appointmentId}/reschedule`, { newDateTime }),

  // Doctors
  getDoctors: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return apiClient.get(`/doctors${queryParams ? `?${queryParams}` : ''}`)
  },
  
  getDoctor: (doctorId) => apiClient.get(`/doctors/${doctorId}`),
  
  getDoctorAvailability: (doctorId, date) =>
    apiClient.get(`/doctors/${doctorId}/availability?date=${date}`),

  // Medical Records
  getMedicalRecords: () => apiClient.get('/medical-records'),
  
  uploadMedicalRecord: (recordData) => apiClient.post('/medical-records', recordData),
  
  downloadMedicalRecord: (recordId) => 
    apiClient.get(`/medical-records/${recordId}/download`),

  // Medications
  getMedications: () => apiClient.get('/medications'),
  
  addMedication: (medicationData) => apiClient.post('/medications', medicationData),
  
  updateMedication: (medicationId, medicationData) =>
    apiClient.put(`/medications/${medicationId}`, medicationData),
  
  deleteMedication: (medicationId) => apiClient.delete(`/medications/${medicationId}`),

  // Health Tracking
  getHealthData: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return apiClient.get(`/health-data${queryParams ? `?${queryParams}` : ''}`)
  },
  
  addHealthData: (healthData) => apiClient.post('/health-data', healthData),
  
  updateHealthData: (dataId, healthData) =>
    apiClient.put(`/health-data/${dataId}`, healthData)
}

// Error handling utilities
export const ApiError = class extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// Request interceptor for common error handling
export const handleApiError = (error) => {
  if (error.status === 401) {
    // Handle unauthorized - redirect to login
    localStorage.removeItem('smartcare_auth')
    window.location.href = '/login'
  } else if (error.status === 403) {
    // Handle forbidden
    console.error('Access forbidden:', error.message)
  } else if (error.status >= 500) {
    // Handle server errors
    console.error('Server error:', error.message)
  }
  
  throw error
}

// Utility function for handling API responses with loading states
export const withLoading = async (apiCall, loadingRef) => {
  if (loadingRef) {
    loadingRef.value = true
  }
  
  try {
    const result = await apiCall()
    return result
  } catch (error) {
    handleApiError(error)
  } finally {
    if (loadingRef) {
      loadingRef.value = false
    }
  }
}

// Export default API client
export default apiClient 