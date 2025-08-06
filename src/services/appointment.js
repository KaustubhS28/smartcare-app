import apiClient from './api.js'

// Field validation utilities for appointments
const validateAppointmentField = (value, field, constraints = {}) => {
  const errors = []
  
  if (constraints.required && (!value || (typeof value === 'string' && value.trim().length === 0))) {
    errors.push(`${field} is required`)
    return errors
  }
  
  if (value && constraints.minLength && value.length < constraints.minLength) {
    errors.push(`${field} must be at least ${constraints.minLength} characters`)
  }
  
  if (value && constraints.maxLength && value.length > constraints.maxLength) {
    errors.push(`${field} must be ${constraints.maxLength} characters or less`)
  }
  
  if (value && constraints.pattern && !constraints.pattern.test(value)) {
    errors.push(constraints.patternMessage || `${field} format is invalid`)
  }
  
  if (value && constraints.oneOf && !constraints.oneOf.includes(value)) {
    errors.push(`${field} must be one of: ${constraints.oneOf.join(', ')}`)
  }
  
  return errors
}

// Clean and validate appointment data according to API spec
const cleanAppointmentData = (appointmentData) => {
  const cleanData = {}
  const errors = []
  
  // Doctor ID validation (required UUID)
  if (appointmentData.doctorId) {
    cleanData.doctorId = appointmentData.doctorId
    // Basic UUID format validation
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidPattern.test(cleanData.doctorId)) {
      errors.push('Doctor ID must be a valid UUID')
    }
  } else {
    errors.push('Doctor ID is required')
  }
  
  // Appointment date validation (required, future date, YYYY-MM-DD format)
  if (appointmentData.appointmentDate) {
    cleanData.appointmentDate = appointmentData.appointmentDate
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (!datePattern.test(cleanData.appointmentDate)) {
      errors.push('Appointment date must be in YYYY-MM-DD format')
    } else {
      const appointmentDate = new Date(cleanData.appointmentDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (appointmentDate <= today) {
        errors.push('Appointment date must be in the future')
      }
    }
  } else {
    errors.push('Appointment date is required')
  }
  
  // Appointment time validation (required, HH:MM format)
  if (appointmentData.appointmentTime) {
    cleanData.appointmentTime = appointmentData.appointmentTime
    const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timePattern.test(cleanData.appointmentTime)) {
      errors.push('Appointment time must be in HH:MM format')
    }
  } else {
    errors.push('Appointment time is required')
  }
  
  // Appointment type validation (required enum)
  if (appointmentData.appointmentType) {
    cleanData.appointmentType = appointmentData.appointmentType.toUpperCase()
    const validTypes = ['IN_PERSON', 'VIDEO', 'PHONE']
    if (!validTypes.includes(cleanData.appointmentType)) {
      errors.push('Appointment type must be one of: IN_PERSON, VIDEO, PHONE')
    }
  } else {
    errors.push('Appointment type is required')
  }
  
  // Reason for visit validation (required, 10-500 characters)
  if (appointmentData.reasonForVisit) {
    cleanData.reasonForVisit = appointmentData.reasonForVisit.trim()
    const reasonErrors = validateAppointmentField(cleanData.reasonForVisit, 'Reason for visit', {
      required: true,
      minLength: 10,
      maxLength: 500
    })
    errors.push(...reasonErrors)
  } else {
    errors.push('Reason for visit is required')
  }
  
  // Notes validation (optional, max 1000 characters)
  if (appointmentData.notes && appointmentData.notes.trim()) {
    cleanData.notes = appointmentData.notes.trim()
    const notesErrors = validateAppointmentField(cleanData.notes, 'Notes', {
      maxLength: 1000
    })
    errors.push(...notesErrors)
  }
  
  // Urgency validation (optional enum)
  if (appointmentData.urgency) {
    cleanData.urgency = appointmentData.urgency.toUpperCase()
    const validUrgencies = ['ROUTINE', 'URGENT', 'EMERGENCY']
    if (!validUrgencies.includes(cleanData.urgency)) {
      errors.push('Urgency must be one of: ROUTINE, URGENT, EMERGENCY')
    }
  }
  
  // Duration validation (optional, specific values)
  if (appointmentData.duration) {
    cleanData.duration = parseInt(appointmentData.duration)
    const validDurations = [15, 30, 45, 60]
    if (!validDurations.includes(cleanData.duration)) {
      errors.push('Duration must be one of: 15, 30, 45, 60 minutes')
    }
  }
  
  return { cleanData, errors }
}

// Appointment API endpoints following the API documentation
export const appointmentApi = {
  // Create new appointment
  create: (appointmentData) => {
    // Clean and validate data according to API spec
    const { cleanData, errors } = cleanAppointmentData(appointmentData)
    
    // If there are validation errors, throw them in API format
    if (errors.length > 0) {
      const error = new Error('Validation failed')
      error.response = {
        status: 400,
        data: {
          success: false,
          message: 'Validation failed',
          data: {
            errors: errors.map(errorMsg => {
              const field = errorMsg.split(' ')[0].toLowerCase().replace(/\s+/g, '')
              return {
                field: field,
                message: errorMsg
              }
            })
          }
        }
      }
      throw error
    }
    
    return apiClient.post('/appointments', cleanData)
  },

  // Get user's appointments with filtering and pagination
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams()
    
    // Add supported query parameters
    if (params.status) queryParams.append('status', params.status)
    if (params.fromDate) queryParams.append('fromDate', params.fromDate)
    if (params.toDate) queryParams.append('toDate', params.toDate)
    if (params.doctorId) queryParams.append('doctorId', params.doctorId)
    if (params.type) queryParams.append('type', params.type)
    if (params.page !== undefined) queryParams.append('page', params.page)
    if (params.size !== undefined) queryParams.append('size', params.size)
    if (params.sort) queryParams.append('sort', params.sort)
    
    const queryString = queryParams.toString()
    return apiClient.get(`/appointments${queryString ? `?${queryString}` : ''}`)
  },

  // Get appointment details by ID
  getById: (appointmentId) => {
    return apiClient.get(`/appointments/${appointmentId}`)
  },

  // Update appointment (reschedule or modify details)
  update: (appointmentId, updateData) => {
    // For updates, validation is optional since not all fields are required
    const cleanData = {}
    
    if (updateData.appointmentDate) {
      cleanData.appointmentDate = updateData.appointmentDate
    }
    if (updateData.appointmentTime) {
      cleanData.appointmentTime = updateData.appointmentTime
    }
    if (updateData.appointmentType) {
      cleanData.appointmentType = updateData.appointmentType.toUpperCase()
    }
    if (updateData.reasonForVisit) {
      cleanData.reasonForVisit = updateData.reasonForVisit.trim()
    }
    if (updateData.notes !== undefined) {
      cleanData.notes = updateData.notes ? updateData.notes.trim() : updateData.notes
    }
    if (updateData.urgency) {
      cleanData.urgency = updateData.urgency.toUpperCase()
    }
    if (updateData.duration) {
      cleanData.duration = parseInt(updateData.duration)
    }
    
    return apiClient.put(`/appointments/${appointmentId}`, cleanData)
  },

  // Cancel appointment
  cancel: (appointmentId, reason = '') => {
    const url = `/appointments/${appointmentId}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`
    return apiClient.delete(url)
  },

  // Update appointment status (for healthcare providers)
  updateStatus: (appointmentId, status, notes = '') => {
    return apiClient.put(`/appointments/${appointmentId}/status`, { 
      status: status.toUpperCase(),
      ...(notes && { notes })
    })
  },

  // Get upcoming appointments
  getUpcoming: () => {
    return apiClient.get('/appointments/upcoming')
  },

  // Get appointment history
  getHistory: () => {
    return apiClient.get('/appointments/history')
  },

  // Utility functions for real-time validation and availability
  checkAvailability: (doctorId, date, time) => {
    return apiClient.get(`/appointments/availability?doctorId=${doctorId}&date=${date}&time=${time}`)
  },

  getAvailableSlots: (doctorId, date) => {
    return apiClient.get(`/appointments/slots?doctorId=${doctorId}&date=${date}`)
  }
}

// Backward compatibility aliases
export const appointmentService = appointmentApi

export default appointmentApi
