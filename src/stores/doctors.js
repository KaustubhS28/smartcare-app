import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { doctorApi } from '../services/api.js'

export const useDoctorStore = defineStore('doctor', () => {
  const doctors = ref([])
  const currentDoctor = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const searchFilters = ref({
    specialization: '',
    location: '',
    language: '',
    rating: 0
  })

  // Search for doctors
  const searchDoctors = async (filters = {}) => {
    try {
      isLoading.value = true
      error.value = null
      
      const mergedFilters = { ...searchFilters.value, ...filters }
      const response = await doctorApi.searchDoctors(mergedFilters)
      
      doctors.value = response.doctors || response
      return doctors.value
    } catch (err) {
      error.value = err.message || 'Failed to search doctors'
      console.error('Failed to search doctors:', err)
      // Return fallback demo doctors
      return getFallbackDoctors()
    } finally {
      isLoading.value = false
    }
  }

  // Get doctor by ID
  const getDoctorById = async (doctorId) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await doctorApi.getDoctor(doctorId)
      currentDoctor.value = response
      return response
    } catch (err) {
      error.value = err.message || 'Failed to fetch doctor details'
      console.error('Failed to fetch doctor:', err)
      // Return fallback demo doctor
      return getFallbackDoctorById(doctorId)
    } finally {
      isLoading.value = false
    }
  }

  // Get doctors by specialization
  const getDoctorsBySpecialization = async (specialization) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await doctorApi.getDoctorsBySpecialization(specialization)
      return response.doctors || response
    } catch (err) {
      error.value = err.message || 'Failed to fetch doctors by specialization'
      console.error('Failed to fetch doctors by specialization:', err)
      return getFallbackDoctorsBySpecialization(specialization)
    } finally {
      isLoading.value = false
    }
  }

  // Get doctor availability
  const getDoctorAvailability = async (doctorId, date) => {
    try {
      const response = await doctorApi.getDoctorAvailability(doctorId, date)
      return response.availableSlots || response
    } catch (err) {
      console.error('Failed to fetch doctor availability:', err)
      return getFallbackAvailability()
    }
  }

  // Update search filters
  const updateFilters = (newFilters) => {
    searchFilters.value = { ...searchFilters.value, ...newFilters }
  }

  // Clear search results
  const clearDoctors = () => {
    doctors.value = []
    currentDoctor.value = null
    error.value = null
  }

  // Computed properties
  const doctorsBySpecialization = computed(() => {
    const grouped = {}
    doctors.value.forEach(doctor => {
      const specialization = doctor.specialization || 'General'
      if (!grouped[specialization]) {
        grouped[specialization] = []
      }
      grouped[specialization].push(doctor)
    })
    return grouped
  })

  const filteredDoctors = computed(() => {
    let filtered = doctors.value

    if (searchFilters.value.specialization) {
      filtered = filtered.filter(doctor => 
        doctor.specialization?.toLowerCase().includes(searchFilters.value.specialization.toLowerCase())
      )
    }

    if (searchFilters.value.location) {
      filtered = filtered.filter(doctor => 
        doctor.location?.toLowerCase().includes(searchFilters.value.location.toLowerCase()) ||
        doctor.city?.toLowerCase().includes(searchFilters.value.location.toLowerCase())
      )
    }

    if (searchFilters.value.rating > 0) {
      filtered = filtered.filter(doctor => doctor.rating >= searchFilters.value.rating)
    }

    return filtered
  })

  // Fallback demo data when backend is not available
  const getFallbackDoctors = () => {
    const demoData = [
      {
        id: 1,
        name: 'Dr. Emily Rodriguez',
        specialization: 'Cardiology',
        rating: 4.9,
        experience: 15,
        location: 'Seattle Medical Center',
        city: 'Seattle',
        state: 'WA',
        languages: ['English', 'Spanish'],
        consultationFee: 250,
        avatar: '/api/placeholder/120/120',
        description: 'Specialized in interventional cardiology with expertise in heart disease prevention.',
        education: 'MD from Johns Hopkins University',
        availability: ['Monday', 'Wednesday', 'Friday']
      },
      {
        id: 2,
        name: 'Dr. James Mitchell',
        specialization: 'Internal Medicine',
        rating: 4.7,
        experience: 12,
        location: 'Portland General Hospital',
        city: 'Portland',
        state: 'OR',
        languages: ['English'],
        consultationFee: 200,
        avatar: '/api/placeholder/120/120',
        description: 'Comprehensive primary care with focus on preventive medicine.',
        education: 'MD from University of Washington',
        availability: ['Tuesday', 'Thursday', 'Saturday']
      },
      {
        id: 3,
        name: 'Dr. Sarah Kim',
        specialization: 'Endocrinology',
        rating: 4.8,
        experience: 10,
        location: 'San Francisco Medical Group',
        city: 'San Francisco',
        state: 'CA',
        languages: ['English', 'Korean'],
        consultationFee: 275,
        avatar: '/api/placeholder/120/120',
        description: 'Expert in diabetes management and hormone disorders.',
        education: 'MD from Stanford University',
        availability: ['Monday', 'Tuesday', 'Friday']
      }
    ]
    
    doctors.value = demoData
    return demoData
  }

  const getFallbackDoctorById = (doctorId) => {
    const demoData = getFallbackDoctors()
    return demoData.find(doctor => doctor.id == doctorId) || demoData[0]
  }

  const getFallbackDoctorsBySpecialization = (specialization) => {
    const demoData = getFallbackDoctors()
    return demoData.filter(doctor => 
      doctor.specialization.toLowerCase().includes(specialization.toLowerCase())
    )
  }

  const getFallbackAvailability = () => {
    return [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ]
  }

  return {
    // State
    doctors,
    currentDoctor,
    isLoading,
    error,
    searchFilters,
    
    // Computed
    doctorsBySpecialization,
    filteredDoctors,
    
    // Actions
    searchDoctors,
    getDoctorById,
    getDoctorsBySpecialization,
    getDoctorAvailability,
    updateFilters,
    clearDoctors
  }
})
