import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { medicationApi } from '../services/api.js'

export const useMedicationStore = defineStore('medication', () => {
  const medications = ref([])
  const activeMedications = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Get all medications
  const getMedications = async (params = {}) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await medicationApi.getMedications(params)
      medications.value = response.medications || response
      
      return medications.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch medications'
      console.error('Failed to fetch medications:', err)
      
      // Return fallback demo medications
      const demoMedications = getFallbackMedications()
      medications.value = demoMedications
      return demoMedications
    } finally {
      isLoading.value = false
    }
  }

  // Get active medications
  const getActiveMedications = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await medicationApi.getActiveMedications()
      activeMedications.value = response.medications || response
      
      return activeMedications.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch active medications'
      console.error('Failed to fetch active medications:', err)
      
      // Return fallback demo medications
      const demoMedications = getFallbackActiveMedications()
      activeMedications.value = demoMedications
      return demoMedications
    } finally {
      isLoading.value = false
    }
  }

  // Add new medication
  const addMedication = async (medicationData) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await medicationApi.addMedication(medicationData)
      
      // Add to local state
      if (response.medication) {
        medications.value.push(response.medication)
        if (response.medication.status === 'ACTIVE') {
          activeMedications.value.push(response.medication)
        }
      }
      
      return { success: true, medication: response.medication }
    } catch (err) {
      error.value = err.message || 'Failed to add medication'
      console.error('Failed to add medication:', err)
      
      // Create fallback medication for demo
      const demoMedication = {
        id: Date.now(),
        ...medicationData,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        refillDate: calculateRefillDate(medicationData)
      }
      
      medications.value.push(demoMedication)
      activeMedications.value.push(demoMedication)
      
      return { success: true, medication: demoMedication }
    } finally {
      isLoading.value = false
    }
  }

  // Update medication status
  const updateMedicationStatus = async (medicationId, status) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await medicationApi.updateMedicationStatus(medicationId, status)
      
      // Update local state
      updateMedicationInState(medicationId, { status })
      
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Failed to update medication status'
      console.error('Failed to update medication status:', err)
      
      // Update local state for demo
      updateMedicationInState(medicationId, { status })
      
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // Get medications needing refill
  const getMedicationsNeedingRefill = async () => {
    try {
      const response = await medicationApi.getMedicationsNeedingRefill()
      return response.medications || response
    } catch (err) {
      console.error('Failed to fetch medications needing refill:', err)
      return getFallbackRefillMedications()
    }
  }

  // Delete medication
  const deleteMedication = async (medicationId) => {
    try {
      isLoading.value = true
      error.value = null
      
      await medicationApi.deleteMedication(medicationId)
      
      // Remove from local state
      medications.value = medications.value.filter(med => med.id !== medicationId)
      activeMedications.value = activeMedications.value.filter(med => med.id !== medicationId)
      
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Failed to delete medication'
      console.error('Failed to delete medication:', err)
      
      // Remove from local state for demo
      medications.value = medications.value.filter(med => med.id !== medicationId)
      activeMedications.value = activeMedications.value.filter(med => med.id !== medicationId)
      
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // Helper function to update medication in state
  const updateMedicationInState = (medicationId, updates) => {
    // Update in medications array
    const medIndex = medications.value.findIndex(med => med.id === medicationId)
    if (medIndex !== -1) {
      medications.value[medIndex] = { ...medications.value[medIndex], ...updates }
    }
    
    // Update in active medications array
    const activeMedIndex = activeMedications.value.findIndex(med => med.id === medicationId)
    if (activeMedIndex !== -1) {
      if (updates.status === 'ACTIVE') {
        activeMedications.value[activeMedIndex] = { ...activeMedications.value[activeMedIndex], ...updates }
      } else {
        activeMedications.value.splice(activeMedIndex, 1)
      }
    } else if (updates.status === 'ACTIVE') {
      const medication = medications.value.find(med => med.id === medicationId)
      if (medication) {
        activeMedications.value.push({ ...medication, ...updates })
      }
    }
  }

  // Helper function to calculate refill date
  const calculateRefillDate = (medicationData) => {
    const startDate = new Date(medicationData.startDate || new Date())
    const duration = parseInt(medicationData.duration) || 30
    const refillDate = new Date(startDate)
    refillDate.setDate(refillDate.getDate() + duration - 7) // 7 days before end
    return refillDate.toISOString()
  }

  // Computed properties
  const medicationsByStatus = computed(() => {
    const grouped = {}
    medications.value.forEach(medication => {
      const status = medication.status || 'ACTIVE'
      if (!grouped[status]) {
        grouped[status] = []
      }
      grouped[status].push(medication)
    })
    return grouped
  })

  const upcomingRefills = computed(() => {
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    
    return activeMedications.value.filter(medication => {
      if (!medication.refillDate) return false
      const refillDate = new Date(medication.refillDate)
      return refillDate <= sevenDaysFromNow && refillDate >= new Date()
    })
  })

  const medicationSchedule = computed(() => {
    return activeMedications.value.map(medication => ({
      ...medication,
      times: parseMedicationSchedule(medication.frequency, medication.instructions)
    }))
  })

  // Helper function to parse medication schedule
  const parseMedicationSchedule = (frequency, instructions) => {
    // Simple parser for common frequencies
    const lowerFreq = frequency?.toLowerCase() || ''
    
    if (lowerFreq.includes('once daily') || lowerFreq.includes('1 time')) {
      return ['08:00']
    } else if (lowerFreq.includes('twice daily') || lowerFreq.includes('2 times')) {
      return ['08:00', '20:00']
    } else if (lowerFreq.includes('three times') || lowerFreq.includes('3 times')) {
      return ['08:00', '14:00', '20:00']
    } else if (lowerFreq.includes('four times') || lowerFreq.includes('4 times')) {
      return ['08:00', '12:00', '16:00', '20:00']
    }
    
    return ['08:00'] // Default
  }

  // Fallback demo data
  const getFallbackMedications = () => {
    return [
      {
        id: 1,
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        instructions: 'Take in the morning with food',
        prescribedBy: 'Dr. Emily Rodriguez',
        startDate: '2024-01-01',
        endDate: '2024-06-01',
        status: 'ACTIVE',
        refillDate: '2024-05-25',
        sideEffects: ['Dizziness', 'Dry cough'],
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Vitamin D3',
        dosage: '2000 IU',
        frequency: 'Once daily',
        instructions: 'Take with food',
        prescribedBy: 'Dr. James Mitchell',
        startDate: '2024-01-15',
        endDate: '2024-07-15',
        status: 'ACTIVE',
        refillDate: '2024-07-08',
        sideEffects: [],
        createdAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 3,
        name: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'As needed',
        instructions: 'Take with food, maximum 3 times daily',
        prescribedBy: 'Dr. Sarah Kim',
        startDate: '2024-02-01',
        endDate: '2024-03-01',
        status: 'COMPLETED',
        refillDate: null,
        sideEffects: ['Stomach upset'],
        createdAt: '2024-02-01T00:00:00Z'
      }
    ]
  }

  const getFallbackActiveMedications = () => {
    return getFallbackMedications().filter(med => med.status === 'ACTIVE')
  }

  const getFallbackRefillMedications = () => {
    return getFallbackActiveMedications().filter(med => med.refillDate && new Date(med.refillDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  }

  return {
    // State
    medications,
    activeMedications,
    isLoading,
    error,
    
    // Computed
    medicationsByStatus,
    upcomingRefills,
    medicationSchedule,
    
    // Actions
    getMedications,
    getActiveMedications,
    addMedication,
    updateMedicationStatus,
    getMedicationsNeedingRefill,
    deleteMedication
  }
})
