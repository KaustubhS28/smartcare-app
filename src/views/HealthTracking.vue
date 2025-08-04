<template>
  <div class="health-tracking-page">
    <div class="page-header">
      <h1>Health Tracking</h1>
      <p>Monitor your progress and achieve your health goals</p>
    </div>

    <!-- Health Score Overview -->
    <div class="health-score-section">
      <div class="score-card main-score">
        <div class="score-circle">
          <div class="score-value">{{ apiHealthScore ?? healthScore }}</div>
          <div class="score-label">Health Score</div>
        </div>
        <div class="score-trend">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="#10b981" stroke-width="2"/>
            <polyline points="17 6 23 6 23 12" stroke="#10b981" stroke-width="2"/>
          </svg>
          <span>+5 from last week</span>
        </div>
      </div>

      <div class="score-breakdown">
        <div class="score-item">
          <div class="score-metric">
            <span class="metric-label">Activity</span>
            <span class="metric-value">85%</span>
          </div>
          <div class="score-bar">
            <div class="score-fill" style="width: 85%"></div>
          </div>
        </div>

        <div class="score-item">
          <div class="score-metric">
            <span class="metric-label">Sleep</span>
            <span class="metric-value">78%</span>
          </div>
          <div class="score-bar">
            <div class="score-fill" style="width: 78%"></div>
          </div>
        </div>

        <div class="score-item">
          <div class="score-metric">
            <span class="metric-label">Nutrition</span>
            <span class="metric-value">92%</span>
          </div>
          <div class="score-bar">
            <div class="score-fill" style="width: 92%"></div>
          </div>
        </div>

        <div class="score-item">
          <div class="score-metric">
            <span class="metric-label">Vitals</span>
            <span class="metric-value">88%</span>
          </div>
          <div class="score-bar">
            <div class="score-fill" style="width: 88%"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Goals Dashboard -->
    <div class="goals-section">
      <div class="section-header">
        <h2>Health Goals</h2>
        <button class="add-goal-btn" @click="showAddGoalModal = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2"/>
            <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2"/>
          </svg>
          Add Goal
        </button>
      </div>

      <div class="goals-grid">
        <div v-for="goal in (Array.isArray(apiHealthGoals) && apiHealthGoals.length ? apiHealthGoals : healthGoals)" :key="goal.id" class="goal-card">
          <div class="goal-header">
            <div class="goal-icon" :class="goal.category ? goal.category.toLowerCase() : ''">
              <svg v-if="goal.category === 'Activity'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else-if="goal.category === 'Weight'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else-if="goal.category === 'Sleep'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="goal-status" :class="goal.status ? goal.status.toLowerCase() : ''">
              {{ goal.status }}
            </div>
          </div>
          
          <h3>{{ goal.title }}</h3>
          <p>{{ goal.description }}</p>
          
          <div class="goal-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (goal.progress || 0) + '%' }"></div>
            </div>
            <div class="progress-text">
              <span>{{ goal.current }} / {{ goal.target }} {{ goal.unit }}</span>
              <span>{{ goal.progress }}%</span>
            </div>
          </div>

          <div class="goal-timeline">
            <span class="timeline-start">{{ goal.startDate ? new Date(goal.startDate).toLocaleDateString() : '' }}</span>
            <span class="timeline-end">{{ goal.endDate ? new Date(goal.endDate).toLocaleDateString() : '' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity Tracking -->
    <div class="content-grid">
      <div class="tracking-section">
        <div class="section-header">
          <h2>Recent Activity</h2>
          <div class="view-toggle">
            <button 
              v-for="period in ['7D', '30D', '90D']" 
              :key="period"
              @click="selectedPeriod = period"
              :class="{ active: selectedPeriod === period }"
              class="toggle-btn"
            >
              {{ period }}
            </button>
          </div>
        </div>

        <div class="activity-chart">
          <HealthChart :type="'line'" :chartData="activityChartData ?? activityChartDataLocal" :options="activityChartOptions" v-if="activityChartData || activityChartDataLocal" />
        </div>

        <div class="activity-stats">
          <div class="stat-item">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">8,247</span>
              <span class="stat-label">Steps Today</span>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">342</span>
              <span class="stat-label">Calories</span>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">45</span>
              <span class="stat-label">Active Minutes</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sleep Tracking -->
      <div class="tracking-section">
        <div class="section-header">
          <h2>Sleep Analysis</h2>
          <button class="log-btn" @click="logSleep">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2"/>
              <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2"/>
            </svg>
            Log Sleep
          </button>
        </div>

        <div class="sleep-summary">
          <div class="sleep-score">
            <div class="score-ring">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="8"/>
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke="#3b82f6" 
                  stroke-width="8"
                  stroke-dasharray="251.2"
                  stroke-dashoffset="62.8"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div class="score-text">
                <span class="score-number">7.5</span>
                <span class="score-unit">hrs</span>
              </div>
            </div>
            <span class="sleep-quality">Good Quality</span>
          </div>

          <div class="sleep-breakdown">
            <div class="sleep-phase">
              <div class="phase-color deep"></div>
              <div class="phase-info">
                <span class="phase-label">Deep Sleep</span>
                <span class="phase-value">2h 15m</span>
              </div>
            </div>
            
            <div class="sleep-phase">
              <div class="phase-color light"></div>
              <div class="phase-info">
                <span class="phase-label">Light Sleep</span>
                <span class="phase-value">4h 30m</span>
              </div>
            </div>
            
            <div class="sleep-phase">
              <div class="phase-color rem"></div>
              <div class="phase-info">
                <span class="phase-label">REM Sleep</span>
                <span class="phase-value">45m</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sleep-insights">
          <h4>Sleep Insights</h4>
          <ul>
            <li>Your sleep duration is within the recommended range</li>
            <li>Consider a consistent bedtime routine</li>
            <li>Your deep sleep percentage is excellent</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Add Goal Modal -->
    <div v-if="showAddGoalModal" class="modal-overlay" @click="showAddGoalModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add New Goal</h3>
          <button @click="showAddGoalModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Goal Category</label>
            <select v-model="newGoal.category" class="form-select">
              <option value="">Select category...</option>
              <option value="Activity">Physical Activity</option>
              <option value="Weight">Weight Management</option>
              <option value="Sleep">Sleep Quality</option>
              <option value="Nutrition">Nutrition</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Goal Title</label>
            <input v-model="newGoal.title" type="text" class="form-input" placeholder="e.g., Walk 10,000 steps daily">
          </div>
          
          <div class="form-group">
            <label>Target Value</label>
            <input v-model="newGoal.target" type="number" class="form-input" placeholder="Target amount">
          </div>
          
          <div class="form-group">
            <label>End Date</label>
            <input v-model="newGoal.endDate" type="date" class="form-input">
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showAddGoalModal = false" class="btn secondary">Cancel</button>
          <button @click="addGoal" class="btn primary">Create Goal</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import HealthChart from '../components/common/HealthChart.vue'
import { useHealthTrackingApi } from '../composables/useHealthTrackingApi'

const { healthScore: apiHealthScore, activityChartData, healthGoals: apiHealthGoals, loading, error, fetchHealthTrackingData } = useHealthTrackingApi()

onMounted(() => {
  fetchHealthTrackingData()
})

const healthScore = ref(92)
const selectedPeriod = ref('7D')
const showAddGoalModal = ref(false)

const newGoal = reactive({
  category: '',
  title: '',
  target: '',
  endDate: ''
})

const healthGoals = ref([
  {
    id: 1,
    title: 'Daily Step Goal',
    description: 'Walk at least 10,000 steps every day',
    category: 'Activity',
    current: 8247,
    target: 10000,
    unit: 'steps',
    progress: 82,
    status: 'In Progress',
    startDate: '2024-01-01',
    endDate: '2024-03-31'
  },
  {
    id: 2,
    title: 'Weight Loss Goal',
    description: 'Lose 10 pounds in 3 months',
    category: 'Weight',
    current: 5,
    target: 10,
    unit: 'lbs',
    progress: 50,
    status: 'In Progress',
    startDate: '2024-01-01',
    endDate: '2024-04-01'
  },
  {
    id: 3,
    title: 'Sleep Quality',
    description: 'Get 7-8 hours of quality sleep',
    category: 'Sleep',
    current: 7.5,
    target: 8,
    unit: 'hours',
    progress: 94,
    status: 'On Track',
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  },
  {
    id: 4,
    title: 'Meditation Practice',
    description: 'Meditate for 15 minutes daily',
    category: 'Wellness',
    current: 12,
    target: 15,
    unit: 'minutes',
    progress: 80,
    status: 'In Progress',
    startDate: '2024-01-15',
    endDate: '2024-06-15'
  }
])

const activityChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Weekly Activity' },
  },
}

const activityChartDataLocal = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Steps',
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
      data: [7000, 8000, 7500, 9000, 8500, 10000, 9500],
      fill: false,
    },
    {
      label: 'Calories',
      backgroundColor: '#f59e42',
      borderColor: '#f59e42',
      data: [320, 340, 300, 360, 342, 400, 390],
      fill: false,
    },
  ],
}

const addGoal = () => {
  if (newGoal.category && newGoal.title && newGoal.target && newGoal.endDate) {
    healthGoals.value.push({
      id: Date.now(),
      title: newGoal.title,
      description: `Achieve ${newGoal.target} in ${newGoal.category.toLowerCase()}`,
      category: newGoal.category,
      current: 0,
      target: parseInt(newGoal.target),
      unit: 'units',
      progress: 0,
      status: 'Not Started',
      startDate: new Date().toISOString().split('T')[0],
      endDate: newGoal.endDate
    })
    
    // Reset form
    Object.assign(newGoal, {
      category: '',
      title: '',
      target: '',
      endDate: ''
    })
    
    showAddGoalModal.value = false
  }
}

const logSleep = () => {
  alert('Sleep logging feature would open here.')
}
</script>

<style scoped>
.health-tracking-page {
  width: 100%;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-header p {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

/* Health Score */
.health-score-section {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 3rem;
  background: var(--bg-primary);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  margin-bottom: 3rem;
}

.main-score {
  text-align: center;
}

.score-circle {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: conic-gradient(#3b82f6 0deg 331deg, #e5e7eb 331deg 360deg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.score-circle::before {
  content: '';
  position: absolute;
  width: 120px;
  height: 120px;
  background: var(--bg-primary);
  border-radius: 50%;
}

.score-circle > div {
  position: relative;
  z-index: 1;
  text-align: center;
}

.score-value {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.score-label {
  display: block;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.score-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--success-color);
  font-size: 0.9rem;
  font-weight: 500;
}

.score-breakdown {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  justify-content: center;
}

.score-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.score-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-weight: 500;
  color: var(--text-primary);
}

.metric-value {
  font-weight: 600;
  color: var(--primary-color);
}

.score-bar {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 4px;
  transition: width 0.5s ease;
}

/* Goals Section */
.goals-section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.add-goal-btn, .log-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-goal-btn:hover, .log-btn:hover {
  background: var(--primary-dark);
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.goal-card {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
}

.goal-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.goal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
}

.goal-icon.activity { background: #ef4444; }
.goal-icon.weight { background: #10b981; }
.goal-icon.sleep { background: #3b82f6; }
.goal-icon.wellness { background: #8b5cf6; }

.goal-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.goal-status.in.progress {
  background: #fef3c7;
  color: #92400e;
}

.goal-status.on.track {
  background: #dcfce7;
  color: #166534;
}

.goal-status.not.started {
  background: #f3f4f6;
  color: #6b7280;
}

.goal-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.goal-card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.goal-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.goal-timeline {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-secondary);
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.tracking-section {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
  background: var(--bg-secondary);
  padding: 0.25rem;
  border-radius: 6px;
}

.toggle-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn.active {
  background: var(--primary-color);
  color: white;
}

.activity-chart {
  margin-bottom: 2rem;
}

.chart-placeholder {
  margin-bottom: 1rem;
}

.chart-legend {
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.steps { background: #3b82f6; }
.legend-color.calories { background: #f59e0b; }

.activity-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* Sleep Tracking */
.sleep-summary {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.sleep-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.score-ring {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-text {
  position: absolute;
  text-align: center;
}

.score-number {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.score-unit {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.sleep-quality {
  font-size: 0.9rem;
  color: var(--success-color);
  font-weight: 500;
}

.sleep-breakdown {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sleep-phase {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.phase-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.phase-color.deep { background: #1e40af; }
.phase-color.light { background: #3b82f6; }
.phase-color.rem { background: #60a5fa; }

.phase-info {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.phase-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.phase-value {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9rem;
}

.sleep-insights h4 {
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.sleep-insights ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sleep-insights li {
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.sleep-insights li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-weight: bold;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-select,
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn.primary {
  background: var(--primary-color);
  color: white;
  border: none;
}

@media (max-width: 768px) {
  .health-score-section {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .goals-grid {
    grid-template-columns: 1fr;
  }

  .sleep-summary {
    flex-direction: column;
  }

  .chart-legend {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
}
</style>