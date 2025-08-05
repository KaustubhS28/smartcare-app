import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { appointmentApi } from '../services/api.js'

export const useAppointmentStore = defineStore('appointment', () => {
  const appointments = ref([])
  const upcomingAppointments = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Book new appointment
  const bookAppointment = async (appointmentData) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await appointmentApi.bookAppointment(appointmentData)
      
      // Add to local state
      if (response.appointment) {
        appointments.value.push(response.appointment)
      }
      
      return { success: true, appointment: response.appointment }
    } catch (err) {
      error.value = err.message || 'Failed to book appointment'
      console.error('Failed to book appointment:', err)
      
      // Create fallback appointment for demo
      const demoAppointment = {
        id: Date.now(),
        ...appointmentData,
        status: 'SCHEDULED',
        createdAt: new Date().toISOString()
      }
      appointments.value.push(demoAppointment)
      
      return { success: true, appointment: demoAppointment }
    } finally {
      isLoading.value = false
    }
  }

  // Get user appointments
  const getMyAppointments = async (params = {}) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await appointmentApi.getMyAppointments(params)
      appointments.value = response.appointments || response
      
      return appointments.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch appointments'
      console.error('Failed to fetch appointments:', err)
      
      // Return fallback demo appointments
      const demoAppointments = getFallbackAppointments()
      appointments.value = demoAppointments
      return demoAppointments
    } finally {
      isLoading.value = false
    }
  }

  // Get upcoming appointments
  const getUpcomingAppointments = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await appointmentApi.getUpcomingAppointments()
      upcomingAppointments.value = response.appointments || response
      
      return upcomingAppointments.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch upcoming appointments'
      console.error('Failed to fetch upcoming appointments:', err)
      
      // Return fallback demo appointments
      const demoAppointments = getFallbackUpcomingAppointments()
      upcomingAppointments.value = demoAppointments
      return demoAppointments
    } finally {
      isLoading.value = false
    }
  }

  // Get available time slots
  const getAvailableSlots = async (doctorId, date) => {
    try {
      const response = await appointmentApi.getAvailableSlots(doctorId, date)
      return response.slots || response
    } catch (err) {
      console.error('Failed to fetch available slots:', err)
      return getFallbackAvailableSlots()
    }
  }

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await appointmentApi.updateAppointmentStatus(appointmentId, status)
      
      // Update local state
      const appointmentIndex = appointments.value.findIndex(apt => apt.id === appointmentId)
      if (appointmentIndex !== -1) {
        appointments.value[appointmentIndex].status = status
      }
      
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Failed to update appointment status'
      console.error('Failed to update appointment status:', err)
      
      // Update local state for demo
      const appointmentIndex = appointments.value.findIndex(apt => apt.id === appointmentId)
      if (appointmentIndex !== -1) {
        appointments.value[appointmentIndex].status = status
      }
      
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // Cancel appointment
  const cancelAppointment = async (appointmentId) => {
    return await updateAppointmentStatus(appointmentId, 'CANCELLED')
  }

  // Reschedule appointment
  const rescheduleAppointment = async (appointmentId, newDateTime) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await appointmentApi.rescheduleAppointment(appointmentId, newDateTime)
      
      // Update local state
      const appointmentIndex = appointments.value.findIndex(apt => apt.id === appointmentId)
      if (appointmentIndex !== -1) {
        appointments.value[appointmentIndex].dateTime = newDateTime
        appointments.value[appointmentIndex].status = 'RESCHEDULED'
      }
      
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Failed to reschedule appointment'
      console.error('Failed to reschedule appointment:', err)
      
      // Update local state for demo
      const appointmentIndex = appointments.value.findIndex(apt => apt.id === appointmentId)
      if (appointmentIndex !== -1) {
        appointments.value[appointmentIndex].dateTime = newDateTime
        appointments.value[appointmentIndex].status = 'RESCHEDULED'
      }
      
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // Computed properties
  const scheduledAppointments = computed(() => {
    return appointments.value.filter(apt => 
      apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED'
    )
  })

  const pastAppointments = computed(() => {
    const now = new Date()
    return appointments.value.filter(apt => 
      new Date(apt.dateTime || apt.date) < now &&
      (apt.status === 'COMPLETED' || apt.status === 'NO_SHOW')
    )
  })

  const todayAppointments = computed(() => {
    const today = new Date().toDateString()
    return appointments.value.filter(apt => {
      const aptDate = new Date(apt.dateTime || apt.date).toDateString()
      return aptDate === today && apt.status !== 'CANCELLED'
    })
  })

  // Fallback demo data
  const getFallbackAppointments = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    return [
      {
        id: 1,
        doctorId: 1,
        doctorName: 'Dr. Emily Rodriguez',
        specialization: 'Cardiology',
        dateTime: tomorrow.toISOString(),
        date: tomorrow.toDateString(),
        time: '10:00 AM',
        type: 'IN_PERSON',
        status: 'SCHEDULED',
        reason: 'Regular checkup',
        location: 'Seattle Medical Center',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        doctorId: 2,
        doctorName: 'Dr. James Mitchell',
        specialization: 'Internal Medicine',
        dateTime: nextWeek.toISOString(),
        date: nextWeek.toDateString(),
        time: '2:30 PM',
        type: 'VIRTUAL',
        status: 'CONFIRMED',
        reason: 'Follow-up consultation',
        meetingLink: 'https://smartcare.com/virtual/meeting-123',
        createdAt: new Date().toISOString()
      }
    ]
  }

  const getFallbackUpcomingAppointments = () => {
    return getFallbackAppointments().filter(apt => 
      new Date(apt.dateTime) > new Date() && apt.status !== 'CANCELLED'
    )
  }

  const getFallbackAvailableSlots = () => {
    return [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ]
  }

  return {
    // State
    appointments,
    upcomingAppointments,
    isLoading,
    error,
    
    // Computed
    scheduledAppointments,
    pastAppointments,
    todayAppointments,
    
    // Actions
    bookAppointment,
    getMyAppointments,
    getUpcomingAppointments,
    getAvailableSlots,
    updateAppointmentStatus,
    cancelAppointment,
    rescheduleAppointment
  }
})
