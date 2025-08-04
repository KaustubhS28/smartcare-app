import axios from 'axios'
import { ref } from 'vue'

export function useHealthTrackingApi() {
  const healthScore = ref(null)
  const activityChartData = ref(null)
  const healthGoals = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchHealthTrackingData() {
    loading.value = true
    error.value = null
    console.log('Fetching health tracking data from API...')
    try {
      // Example endpoints, replace with your real API URLs
      const [scoreRes, activityRes, goalsRes] = await Promise.all([
        axios.get('/api/health/score'),
        axios.get('/api/health/activity'),
        axios.get('/api/health/goals'),
      ])
      // Defensive: Try to parse JSON if response is a string (in case of fallback to HTML)
      let score = scoreRes.data
      let activity = activityRes.data
      let goals = goalsRes.data
      if (typeof score === 'string') {
        try { score = JSON.parse(score) } catch { score = null }
      }
      if (typeof activity === 'string') {
        try { activity = JSON.parse(activity) } catch { activity = null }
      }
      if (typeof goals === 'string') {
        try { goals = JSON.parse(goals) } catch { goals = [] }
      }
      // Defensive: Ensure goals is always an array
      if (!Array.isArray(goals)) goals = []
      console.log('API responses:', { score, activity, goals })
      healthScore.value = score
      activityChartData.value = activity
      healthGoals.value = goals
    } catch (err) {
      error.value = err
      console.error('API error:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    healthScore,
    activityChartData,
    healthGoals,
    loading,
    error,
    fetchHealthTrackingData
  }
}
