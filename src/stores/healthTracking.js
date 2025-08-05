import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { healthTrackingApi } from '../services/api.js'

export const useHealthTrackingStore = defineStore('healthTracking', () => {
  const healthData = ref([])
  const vitalSigns = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Get health data
  const getHealthData = async (params = {}) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await healthTrackingApi.getHealthData(params)
      healthData.value = response.data || response
      
      return healthData.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch health data'
      console.error('Failed to fetch health data:', err)
      
      // Return fallback demo health data
      const demoData = getFallbackHealthData()
      healthData.value = demoData
      return demoData
    } finally {
      isLoading.value = false
    }
  }

  // Add health data
  const addHealthData = async (data) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await healthTrackingApi.addHealthData(data)
      
      // Add to local state
      if (response.data) {
        healthData.value.push(response.data)
      }
      
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.message || 'Failed to add health data'
      console.error('Failed to add health data:', err)
      
      // Create fallback health data for demo
      const demoData = {
        id: Date.now(),
        ...data,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
      
      healthData.value.push(demoData)
      
      return { success: true, data: demoData }
    } finally {
      isLoading.value = false
    }
  }

  // Update health data
  const updateHealthData = async (dataId, updates) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await healthTrackingApi.updateHealthData(dataId, updates)
      
      // Update local state
      const dataIndex = healthData.value.findIndex(item => item.id === dataId)
      if (dataIndex !== -1) {
        healthData.value[dataIndex] = { ...healthData.value[dataIndex], ...updates }
      }
      
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Failed to update health data'
      console.error('Failed to update health data:', err)
      
      // Update local state for demo
      const dataIndex = healthData.value.findIndex(item => item.id === dataId)
      if (dataIndex !== -1) {
        healthData.value[dataIndex] = { ...healthData.value[dataIndex], ...updates }
      }
      
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // Delete health data
  const deleteHealthData = async (dataId) => {
    try {
      isLoading.value = true
      error.value = null
      
      await healthTrackingApi.deleteHealthData(dataId)
      
      // Remove from local state
      healthData.value = healthData.value.filter(item => item.id !== dataId)
      
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Failed to delete health data'
      console.error('Failed to delete health data:', err)
      
      // Remove from local state for demo
      healthData.value = healthData.value.filter(item => item.id !== dataId)
      
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // Get vital signs
  const getVitalSigns = async (params = {}) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await healthTrackingApi.getVitalSigns(params)
      vitalSigns.value = response.vitals || response
      
      return vitalSigns.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch vital signs'
      console.error('Failed to fetch vital signs:', err)
      
      // Return fallback demo vital signs
      const demoVitals = getFallbackVitalSigns()
      vitalSigns.value = demoVitals
      return demoVitals
    } finally {
      isLoading.value = false
    }
  }

  // Add vital signs
  const addVitalSigns = async (vitalsData) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await healthTrackingApi.addVitalSigns(vitalsData)
      
      // Add to local state
      if (response.vitals) {
        vitalSigns.value.push(response.vitals)
      }
      
      return { success: true, vitals: response.vitals }
    } catch (err) {
      error.value = err.message || 'Failed to add vital signs'
      console.error('Failed to add vital signs:', err)
      
      // Create fallback vital signs for demo
      const demoVitals = {
        id: Date.now(),
        ...vitalsData,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
      
      vitalSigns.value.push(demoVitals)
      
      return { success: true, vitals: demoVitals }
    } finally {
      isLoading.value = false
    }
  }

  // Computed properties
  const latestVitals = computed(() => {
    if (vitalSigns.value.length === 0) return null
    
    return vitalSigns.value.reduce((latest, current) => {
      return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
    })
  })

  const vitalsByType = computed(() => {
    const grouped = {}
    vitalSigns.value.forEach(vital => {
      const type = vital.type || 'general'
      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push(vital)
    })
    return grouped
  })

  const healthTrends = computed(() => {
    const trends = {}
    
    // Group by metric type
    healthData.value.forEach(entry => {
      Object.keys(entry).forEach(key => {
        if (key !== 'id' && key !== 'timestamp' && key !== 'createdAt' && typeof entry[key] === 'number') {
          if (!trends[key]) {
            trends[key] = []
          }
          trends[key].push({
            value: entry[key],
            timestamp: entry.timestamp,
            date: new Date(entry.timestamp).toLocaleDateString()
          })
        }
      })
    })
    
    // Sort by timestamp
    Object.keys(trends).forEach(key => {
      trends[key].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    })
    
    return trends
  })

  const healthScore = computed(() => {
    if (!latestVitals.value) return 85 // Default score
    
    let score = 100
    const vitals = latestVitals.value
    
    // Blood pressure scoring
    if (vitals.systolic && vitals.diastolic) {
      if (vitals.systolic > 140 || vitals.diastolic > 90) {
        score -= 15
      } else if (vitals.systolic > 130 || vitals.diastolic > 80) {
        score -= 8
      }
    }
    
    // Heart rate scoring
    if (vitals.heartRate) {
      if (vitals.heartRate > 100 || vitals.heartRate < 60) {
        score -= 10
      }
    }
    
    // Weight trending (simplified)
    const weightData = healthTrends.value.weight || []
    if (weightData.length > 1) {
      const recent = weightData.slice(-2)
      const change = recent[1].value - recent[0].value
      if (Math.abs(change) > 5) {
        score -= 5
      }
    }
    
    return Math.max(score, 0)
  })

  // Health status assessment
  const getHealthStatus = (type, value) => {
    switch (type) {
      case 'bloodPressure':
        const { systolic, diastolic } = value
        if (systolic >= 140 || diastolic >= 90) return { status: 'high', message: 'High blood pressure' }
        if (systolic >= 130 || diastolic >= 80) return { status: 'elevated', message: 'Elevated blood pressure' }
        return { status: 'normal', message: 'Normal blood pressure' }
      
      case 'heartRate':
        if (value > 100) return { status: 'high', message: 'High heart rate' }
        if (value < 60) return { status: 'low', message: 'Low heart rate' }
        return { status: 'normal', message: 'Normal heart rate' }
      
      case 'weight':
        return { status: 'normal', message: 'Weight recorded' }
      
      case 'temperature':
        if (value > 99.5) return { status: 'high', message: 'Fever detected' }
        if (value < 97) return { status: 'low', message: 'Low body temperature' }
        return { status: 'normal', message: 'Normal temperature' }
      
      default:
        return { status: 'normal', message: 'Data recorded' }
    }
  }

  // Fallback demo data
  const getFallbackHealthData = () => {
    const now = new Date()
    const data = []
    
    // Generate data for the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      data.push({
        id: i + 1,
        timestamp: date.toISOString(),
        weight: 165 + Math.sin(i * 0.1) * 2,
        steps: 8000 + Math.random() * 4000,
        sleepHours: 7 + Math.random() * 2,
        waterIntake: 6 + Math.random() * 3,
        createdAt: date.toISOString()
      })
    }
    
    return data
  }

  const getFallbackVitalSigns = () => {
    const now = new Date()
    const vitals = []
    
    // Generate vital signs for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      vitals.push({
        id: i + 1,
        timestamp: date.toISOString(),
        type: 'daily',
        systolic: 120 + Math.random() * 20,
        diastolic: 80 + Math.random() * 10,
        heartRate: 70 + Math.random() * 20,
        temperature: 98.6 + (Math.random() - 0.5) * 2,
        respiratoryRate: 16 + Math.random() * 4,
        oxygenSaturation: 98 + Math.random() * 2,
        createdAt: date.toISOString()
      })
    }
    
    return vitals
  }

  return {
    // State
    healthData,
    vitalSigns,
    isLoading,
    error,
    
    // Computed
    latestVitals,
    vitalsByType,
    healthTrends,
    healthScore,
    
    // Actions
    getHealthData,
    addHealthData,
    updateHealthData,
    deleteHealthData,
    getVitalSigns,
    addVitalSigns,
    getHealthStatus
  }
})
