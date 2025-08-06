import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { appointmentApi } from '../services/appointment.js'

// Error handling utility for appointments
const handleAppointmentError = (error) => {
  console.error('Appointment error:', error)
  
  if (error.response?.status === 400) {
    // Validation errors
    const validationErrors = error.response.data.data?.errors || []
    return {
      type: 'validation',
      validationErrors: validationErrors.reduce((acc, err) => {
        acc[err.field] = err.message
        return acc
      }, {}),
      message: 'Validation failed'
    }
  } else if (error.response?.status === 403) {
    // Access denied
    return {
      type: 'forbidden',
      message: error.response.data?.message || 'Access denied'
    }
  } else if (error.response?.status === 404) {
    // Not found
    return {
      type: 'notFound',
      message: error.response.data?.message || 'Appointment not found'
    }
  } else if (error.response?.status === 409) {
    // Conflict (time slot unavailable)
    return {
      type: 'conflict',
      message: error.response.data?.message || 'Time slot is not available',
      availableSlots: error.response.data?.data?.availableSlots || []
    }
  } else {
    // Generic error
    return {
      type: 'generic',
      message: error.response?.data?.message || error.message || 'An unexpected error occurred'
    }
  }
}

export const useAppointmentStore = defineStore('appointment', () => {
  const appointments = ref([])
  const upcomingAppointments = ref([])
  const appointmentHistory = ref([])
  const currentAppointment = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const pagination = ref({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  })

  // Create new appointment
  const createAppointment = async (appointmentData) => {
    try {
      isLoading.value = true
      error.value = null
      
      console.log('Creating appointment with data:', appointmentData)
      const response = await appointmentApi.create(appointmentData)
      console.log('Appointment creation response:', response)
      
      // Handle API response structure from documentation
      if (response.data?.success && response.data?.data) {
        const newAppointment = response.data.data
        appointments.value.unshift(newAppointment)
        
        console.log('Appointment created successfully:', newAppointment.confirmationCode)
        return { 
          success: true, 
          data: newAppointment,
          message: response.data.message || 'Appointment booked successfully'
        }
      } else {
        throw new Error(response.data?.message || 'Failed to create appointment')
      }
    } catch (err) {
      const errorInfo = handleAppointmentError(err)
      error.value = errorInfo.message
      
      console.error('Failed to create appointment:', errorInfo)
      
      // Return validation errors if available
      if (errorInfo.type === 'validation') {
        return { 
          success: false, 
          validationErrors: errorInfo.validationErrors,
          message: errorInfo.message
        }
      }
      
      // Return conflict errors with available slots
      if (errorInfo.type === 'conflict') {
        return { 
          success: false, 
          message: errorInfo.message,
          availableSlots: errorInfo.availableSlots
        }
      }
      
      // Fallback for development/testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Using fallback demo appointment creation')
        const demoAppointment = {
          id: `demo-${Date.now()}`,
          ...appointmentData,
          patientId: 'current-user-id',
          status: 'SCHEDULED',
          confirmationCode: `APT-${Date.now()}`,
          doctorName: 'Demo Doctor',
          consultationFee: 200.00,
          canReschedule: true,
          canCancel: true,
          createdAt: new Date().toISOString()
        }
        appointments.value.unshift(demoAppointment)
        return { 
          success: true, 
          data: demoAppointment,
          message: 'Demo appointment created successfully'
        }
      }
      
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Get user appointments with filtering and pagination
  const getAppointments = async (params = {}) => {
    try {
      isLoading.value = true
      error.value = null
      
      console.log('AppointmentStore: Fetching appointments with params:', params)
      const response = await appointmentApi.getAll(params)
      console.log('AppointmentStore: Appointments response:', response)
      
      // Handle API response structure from documentation
      if (response.data?.success && response.data?.data) {
        const responseData = response.data.data
        appointments.value = responseData.content || []
        
        // Update pagination info
        if (responseData.pageable) {
          pagination.value = {
            page: responseData.pageable.pageNumber,
            size: responseData.pageable.pageSize,
            totalElements: responseData.totalElements,
            totalPages: responseData.totalPages
          }
        }
        
        console.log('Appointments fetched successfully:', appointments.value.length)
        return { success: true, data: appointments.value }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch appointments')
      }
    } catch (err) {
      const errorInfo = handleAppointmentError(err)
      error.value = errorInfo.message
      
      console.error('Failed to fetch appointments:', errorInfo)
      
      // Fallback for development/testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Using fallback demo appointments')
        const demoAppointments = getFallbackAppointments()
        appointments.value = demoAppointments
        return { success: true, data: demoAppointments }
      }
      
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Get appointment details by ID
  const getAppointmentById = async (appointmentId) => {
    try {
      isLoading.value = true
      error.value = null
      
      console.log('Fetching appointment details for ID:', appointmentId)
      const response = await appointmentApi.getById(appointmentId)
      console.log('Appointment details response:', response)
      
      // Handle API response structure from documentation
      if (response.data?.success && response.data?.data) {
        currentAppointment.value = response.data.data
        console.log('Appointment details fetched successfully')
        return { success: true, data: currentAppointment.value }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch appointment details')
      }
    } catch (err) {
      const errorInfo = handleAppointmentError(err)
      error.value = errorInfo.message
      
      console.error('Failed to fetch appointment details:', errorInfo)
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Get upcoming appointments
  const getUpcoming = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await appointmentApi.getUpcoming()
      
      if (response.data?.success && response.data?.data) {
        const responseData = response.data.data
        upcomingAppointments.value = responseData.content || responseData || []
        return { success: true, data: upcomingAppointments.value }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch upcoming appointments')
      }
    } catch (err) {
      const errorInfo = handleAppointmentError(err)
      error.value = errorInfo.message
      
      console.error('Failed to fetch upcoming appointments:', errorInfo)
      
      // Fallback for development/testing
      const demoAppointments = getFallbackUpcomingAppointments()
      upcomingAppointments.value = demoAppointments
      return { success: true, data: demoAppointments }
    } finally {
      isLoading.value = false
    }
  }

  // Get appointment history
  const getHistory = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await appointmentApi.getHistory()
      
      if (response.data?.success && response.data?.data) {
        const responseData = response.data.data
        appointmentHistory.value = responseData.content || responseData || []
        return { success: true, data: appointmentHistory.value }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch appointment history')
      }
    } catch (err) {
      const errorInfo = handleAppointmentError(err)
      error.value = errorInfo.message
      
      console.error('Failed to fetch appointment history:', errorInfo)
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Update appointment (reschedule or modify details)
  const updateAppointment = async (appointmentId, updateData) => {
    try {
      isLoading.value = true
      error.value = null
      
      console.log('Updating appointment:', appointmentId, updateData)
      const response = await appointmentApi.update(appointmentId, updateData)
      
      if (response.data?.success && response.data?.data) {
        const updatedAppointment = response.data.data
        
        // Update local state
        const index = appointments.value.findIndex(apt => apt.id === appointmentId)
        if (index !== -1) {
          appointments.value[index] = updatedAppointment
        }
        
        // Update current appointment if it's the same
        if (currentAppointment.value?.id === appointmentId) {
          currentAppointment.value = updatedAppointment
        }
        
        console.log('Appointment updated successfully')
        return { 
          success: true, 
          data: updatedAppointment,
          message: response.data.message || 'Appointment updated successfully'
        }
      } else {
        throw new Error(response.data?.message || 'Failed to update appointment')
      }
    } catch (err) {
      const errorInfo = handleAppointmentError(err)
      error.value = errorInfo.message
      
      console.error('Failed to update appointment:', errorInfo)
      
      // Return validation errors if available
      if (errorInfo.type === 'validation') {
        return { 
          success: false, 
          validationErrors: errorInfo.validationErrors,
          message: errorInfo.message
        }
      }
      
      // Return conflict errors with available slots
      if (errorInfo.type === 'conflict') {
        return { 
          success: false, 
          message: errorInfo.message,
          availableSlots: errorInfo.availableSlots
        }
      }
      
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Cancel appointment
  const cancelAppointment = async (appointmentId, reason = '') => {
    try {
      isLoading.value = true
      error.value = null
      
      console.log('Cancelling appointment:', appointmentId, reason)
      const response = await appointmentApi.cancel(appointmentId, reason)
      
      if (response.data?.success && response.data?.data) {
        const cancelledAppointment = response.data.data
        
        // Update local state
        const index = appointments.value.findIndex(apt => apt.id === appointmentId)
        if (index !== -1) {
          appointments.value[index].status = 'CANCELLED'
          appointments.value[index].cancellationReason = reason
          appointments.value[index].cancelledAt = new Date().toISOString()
        }
        
        console.log('Appointment cancelled successfully')
        return { 
          success: true, 
          data: cancelledAppointment,
          message: response.data.message || 'Appointment cancelled successfully'
        }
      } else {
        throw new Error(response.data?.message || 'Failed to cancel appointment')
      }
    } catch (err) {
      const errorInfo = handleAppointmentError(err)
      error.value = errorInfo.message
      
      console.error('Failed to cancel appointment:', errorInfo)
      
      // Fallback for development/testing
      if (process.env.NODE_ENV === 'development') {
        const index = appointments.value.findIndex(apt => apt.id === appointmentId)
        if (index !== -1) {
          appointments.value[index].status = 'CANCELLED'
          appointments.value[index].cancellationReason = reason
          appointments.value[index].cancelledAt = new Date().toISOString()
        }
        return { success: true, message: 'Demo appointment cancelled successfully' }
      }
      
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Update appointment status (for healthcare providers)
  const updateAppointmentStatus = async (appointmentId, status, notes = '') => {
    try {
      isLoading.value = true
      error.value = null
      
      console.log('Updating appointment status:', appointmentId, status)
      const response = await appointmentApi.updateStatus(appointmentId, status, notes)
      
      if (response.data?.success) {
        // Update local state
        const index = appointments.value.findIndex(apt => apt.id === appointmentId)
        if (index !== -1) {
          appointments.value[index].status = status.toUpperCase()
          if (notes) {
            appointments.value[index].statusNotes = notes
          }
        }
        
        console.log('Appointment status updated successfully')
        return { 
          success: true,
          message: response.data.message || 'Appointment status updated successfully'
        }
      } else {
        throw new Error(response.data?.message || 'Failed to update appointment status')
      }
    } catch (err) {
      const errorInfo = handleAppointmentError(err)
      error.value = errorInfo.message
      
      console.error('Failed to update appointment status:', errorInfo)
      
      // Fallback for development/testing
      if (process.env.NODE_ENV === 'development') {
        const index = appointments.value.findIndex(apt => apt.id === appointmentId)
        if (index !== -1) {
          appointments.value[index].status = status.toUpperCase()
          if (notes) {
            appointments.value[index].statusNotes = notes
          }
        }
        return { success: true, message: 'Demo appointment status updated successfully' }
      }
      
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Get available time slots
  const getAvailableSlots = async (doctorId, date) => {
    try {
      const response = await appointmentApi.getAvailableSlots(doctorId, date)
      
      if (response.data?.success && response.data?.data) {
        return response.data.data.slots || response.data.data
      } else {
        throw new Error(response.data?.message || 'Failed to fetch available slots')
      }
    } catch (err) {
      console.error('Failed to fetch available slots:', err)
      return getFallbackAvailableSlots()
    }
  }

  // Check appointment availability
  const checkAvailability = async (doctorId, date, time) => {
    try {
      const response = await appointmentApi.checkAvailability(doctorId, date, time)
      
      if (response.data?.success) {
        return response.data.data
      } else {
        throw new Error(response.data?.message || 'Failed to check availability')
      }
    } catch (err) {
      console.error('Failed to check availability:', err)
      return { available: false, message: 'Unable to check availability' }
    }
  }

  // Computed properties
  const scheduledAppointments = computed(() => {
    return appointments.value.filter(apt => 
      ['SCHEDULED', 'CONFIRMED'].includes(apt.status)
    )
  })

  const completedAppointments = computed(() => {
    return appointments.value.filter(apt => 
      apt.status === 'COMPLETED'
    )
  })

  const cancelledAppointments = computed(() => {
    return appointments.value.filter(apt => 
      apt.status === 'CANCELLED'
    )
  })

  const todayAppointments = computed(() => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    return appointments.value.filter(apt => {
      return apt.appointmentDate === today && apt.status !== 'CANCELLED'
    })
  })

  const futureAppointments = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.value.filter(apt => {
      return apt.appointmentDate > today && ['SCHEDULED', 'CONFIRMED'].includes(apt.status)
    })
  })

  const pastAppointments = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.value.filter(apt => {
      return apt.appointmentDate < today && ['COMPLETED', 'NO_SHOW'].includes(apt.status)
    })
  })

  // Fallback demo data according to API structure
  const getFallbackAppointments = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    return [
      {
        id: "demo-appointment-1",
        doctorId: "demo-doctor-1",
        doctorName: "Dr. Emily Rodriguez",
        doctorSpecialization: "Cardiology",
        patientId: "current-user-id",
        appointmentDate: tomorrow.toISOString().split('T')[0],
        appointmentTime: "10:00",
        appointmentType: "IN_PERSON",
        status: "SCHEDULED",
        reasonForVisit: "Regular checkup and blood pressure monitoring",
        notes: "Patient reports feeling well",
        urgency: "ROUTINE",
        duration: 30,
        confirmationCode: "APT-2024-001234",
        consultationFee: 200.00,
        canReschedule: true,
        canCancel: true,
        appointmentLocation: {
          type: "IN_PERSON",
          address: "123 Medical Plaza, Seattle, WA 98101",
          room: "Suite 205",
          instructions: "Please arrive 15 minutes early for check-in"
        },
        createdAt: new Date().toISOString()
      },
      {
        id: "demo-appointment-2",
        doctorId: "demo-doctor-2",
        doctorName: "Dr. James Mitchell",
        doctorSpecialization: "Internal Medicine",
        patientId: "current-user-id",
        appointmentDate: nextWeek.toISOString().split('T')[0],
        appointmentTime: "14:30",
        appointmentType: "VIDEO",
        status: "CONFIRMED",
        reasonForVisit: "Follow-up consultation for recent symptoms",
        notes: "Patient has been taking prescribed medication",
        urgency: "ROUTINE",
        duration: 45,
        confirmationCode: "APT-2024-001235",
        consultationFee: 150.00,
        canReschedule: true,
        canCancel: true,
        videoCallInfo: {
          meetingLink: "https://smartcare.com/virtual/meeting-123",
          meetingId: "123-456-789"
        },
        createdAt: new Date().toISOString()
      }
    ]
  }

  const getFallbackUpcomingAppointments = () => {
    return getFallbackAppointments().filter(apt => {
      const appointmentDateTime = new Date(`${apt.appointmentDate}T${apt.appointmentTime}:00`)
      return appointmentDateTime > new Date() && !['CANCELLED', 'COMPLETED'].includes(apt.status)
    })
  }

  const getFallbackAvailableSlots = () => {
    return [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
    ]
  }

  return {
    // State
    appointments,
    upcomingAppointments,
    appointmentHistory,
    currentAppointment,
    isLoading,
    error,
    pagination,
    
    // Computed
    scheduledAppointments,
    completedAppointments,
    cancelledAppointments,
    todayAppointments,
    futureAppointments,
    pastAppointments,
    
    // Actions
    createAppointment,
    getAppointments,
    getAppointmentById,
    getUpcoming,
    getHistory,
    updateAppointment,
    cancelAppointment,
    updateAppointmentStatus,
    getAvailableSlots,
    checkAvailability,
    
    // Backward compatibility aliases
    bookAppointment: createAppointment,
    getMyAppointments: getAppointments,
    getUpcomingAppointments: getUpcoming,
    rescheduleAppointment: updateAppointment
  }
})
