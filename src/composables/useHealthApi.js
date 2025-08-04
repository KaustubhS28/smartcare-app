import axios from 'axios'
import { ref } from 'vue'

export function useHealthApi() {
  const stepsData = ref(null)
  const sleepData = ref(null)
  const summary = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchDashboardData() {
    loading.value = true
    error.value = null
    try {
      // Example endpoints, replace with your real API URLs
      const [stepsRes, sleepRes, summaryRes] = await Promise.all([
        axios.get('/api/health/steps'),
        axios.get('/api/health/sleep'),
        axios.get('/api/health/summary'),
      ])
      stepsData.value = stepsRes.data
      sleepData.value = sleepRes.data
      summary.value = summaryRes.data
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  return {
    stepsData,
    sleepData,
    summary,
    loading,
    error,
    fetchDashboardData
  }
}
