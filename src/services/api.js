// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

// Import TokenManager
import TokenManager from './tokenManager.js'

// API client with common configuration
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
    this.isRefreshing = false
    this.failedQueue = []
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
    const accessToken = TokenManager.getAccessToken()
    const tokenType = TokenManager.getTokenType()
    
    if (accessToken && tokenType) {
      config.headers.Authorization = `${tokenType} ${accessToken}`
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`)
        error.response = {
          status: response.status,
          data: errorData
        }
        throw error
      }

      const data = await response.json()
      return data
    } catch (error) {
      // Handle token refresh for 401 errors
      if (error.response?.status === 401 && !endpoint.includes('/auth/') && !this.isRefreshing) {
        return this.handleTokenRefresh(endpoint, options)
      }
      
      console.error('API request failed:', error)
      throw error
    }
  }

  async handleTokenRefresh(originalEndpoint, originalOptions) {
    if (this.isRefreshing) {
      // Wait for the ongoing refresh to complete
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject, endpoint: originalEndpoint, options: originalOptions })
      })
    }

    this.isRefreshing = true

    try {
      const refreshToken = TokenManager.getRefreshToken()
      const tokenType = TokenManager.getTokenType()
      
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${tokenType} ${refreshToken}`
        },
        body: JSON.stringify({ refreshToken })
      })

      if (!refreshResponse.ok) {
        throw new Error('Token refresh failed')
      }

      const refreshData = await refreshResponse.json()
      
      if (refreshData.success && refreshData.data) {
        // Update stored tokens using TokenManager
        TokenManager.updateTokens(
          refreshData.data.accessToken,
          refreshData.data.refreshToken,
          refreshData.data.tokenType || 'Bearer',
          refreshData.data.expiresIn || 3600
        )

        // Retry original request
        const result = await this.request(originalEndpoint, originalOptions)
        
        // Process failed queue
        this.failedQueue.forEach(({ resolve, endpoint, options }) => {
          resolve(this.request(endpoint, options))
        })
        this.failedQueue = []
        
        return result
      } else {
        throw new Error('Invalid refresh response')
      }
    } catch (error) {
      // Clear auth data and reject all queued requests
      TokenManager.clearTokens()
      this.failedQueue.forEach(({ reject }) => {
        reject(error)
      })
      this.failedQueue = []
      
      // Redirect to login (if in browser context)
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/login'
      }
      
      throw error
    } finally {
      this.isRefreshing = false
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

// Authentication API endpoints
export const authApi = {
  // Authentication
  signin: (credentials) => apiClient.post('/auth/signin', credentials),
  
  signup: (userData) => apiClient.post('/auth/signup', userData),
  
  checkUsername: (username) => apiClient.get(`/auth/check-username?username=${username}`),
  
  checkEmail: (email) => apiClient.get(`/auth/check-email?email=${email}`),
  
  // Profile management
  getProfile: () => apiClient.get('/profile'),
  
  updateProfile: (profileData) => apiClient.put('/profile', profileData),
  
  getHealthProfile: () => apiClient.get('/profile/health'),
  
  createHealthProfile: (healthData) => apiClient.post('/profile/health', healthData),
  
  updateHealthProfile: (healthData) => apiClient.put('/profile/health', healthData),
  
  completeTour: () => apiClient.post('/profile/complete-tour')
}

// Doctor API endpoints
export const doctorApi = {
  // Doctor discovery
  searchDoctors: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return apiClient.get(`/doctors/search${queryParams ? `?${queryParams}` : ''}`)
  },
  
  getDoctor: (doctorId) => apiClient.get(`/doctors/${doctorId}`),
  
  getDoctorsBySpecialization: (specialization) => 
    apiClient.get(`/doctors/by-specialization?specialization=${specialization}`),
  
  getDoctorAvailability: (doctorId, date) =>
    apiClient.get(`/doctors/${doctorId}/availability?date=${date}`)
}

// Appointment API endpoints (legacy - use appointment.js service instead)
export const appointmentApi = {
  // Backward compatibility methods - these delegate to the new appointment service
  bookAppointment: (appointmentData) => {
    // Import dynamically to avoid circular imports
    return import('./appointment.js').then(module => 
      module.appointmentApi.create(appointmentData)
    )
  },
  
  getMyAppointments: (params = {}) => {
    return import('./appointment.js').then(module => 
      module.appointmentApi.getAll(params)
    )
  },
  
  getUpcomingAppointments: () => {
    return import('./appointment.js').then(module => 
      module.appointmentApi.getUpcoming()
    )
  },
  
  getAvailableSlots: (doctorId, date) => {
    return import('./appointment.js').then(module => 
      module.appointmentApi.getAvailableSlots(doctorId, date)
    )
  },
  
  updateAppointmentStatus: (appointmentId, status) => {
    return import('./appointment.js').then(module => 
      module.appointmentApi.updateStatus(appointmentId, status)
    )
  },
  
  cancelAppointment: (appointmentId) => {
    return import('./appointment.js').then(module => 
      module.appointmentApi.cancel(appointmentId)
    )
  },
  
  rescheduleAppointment: (appointmentId, updateData) => {
    return import('./appointment.js').then(module => 
      module.appointmentApi.update(appointmentId, updateData)
    )
  }
}

// Medication API endpoints  
export const medicationApi = {
  // Medication management
  getMedications: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return apiClient.get(`/medications${queryParams ? `?${queryParams}` : ''}`)
  },
  
  getActiveMedications: () => apiClient.get('/medications/active'),
  
  addMedication: (medicationData) => apiClient.post('/medications', medicationData),
  
  updateMedicationStatus: (medicationId, status) =>
    apiClient.put(`/medications/${medicationId}/status`, { status }),
  
  getMedicationsNeedingRefill: () => apiClient.get('/medications/refill-needed'),
  
  deleteMedication: (medicationId) => apiClient.delete(`/medications/${medicationId}`)
}

// Health Tracking API endpoints
export const healthTrackingApi = {
  // Health data management
  getHealthData: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return apiClient.get(`/health-data${queryParams ? `?${queryParams}` : ''}`)
  },
  
  addHealthData: (healthData) => apiClient.post('/health-data', healthData),
  
  updateHealthData: (dataId, healthData) =>
    apiClient.put(`/health-data/${dataId}`, healthData),
  
  deleteHealthData: (dataId) => apiClient.delete(`/health-data/${dataId}`),
  
  getVitalSigns: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return apiClient.get(`/health-data/vitals${queryParams ? `?${queryParams}` : ''}`)
  },
  
  addVitalSigns: (vitalsData) => apiClient.post('/health-data/vitals', vitalsData)
}

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