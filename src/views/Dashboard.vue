<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'
import { appointments } from '../data/doctors.js'

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()

// Load profile data when component mounts
onMounted(async () => {
  await profileStore.fetchProfile()
  await profileStore.fetchHealthProfile()
})

const currentDate = new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})

const upcomingAppointments = computed(() => {
  return appointments
    .filter(apt => new Date(apt.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 2)
})

const currentVitals = computed(() => {
  return profileStore.healthProfile?.vitals || {
    bloodPressure: { systolic: 120, diastolic: 80 },
    heartRate: { value: 72 },
    temperature: { value: 98.6 },
    weight: { value: 150 }
  }
})

const quickActions = [
  {
    title: 'Find Doctors',
    description: 'Search specialists near you',
    icon: 'doctor',
    color: 'blue',
    action: () => router.push({ name: 'doctors' })
  },
  {
    title: 'Book Appointment',
    description: 'Schedule your next visit',
    icon: 'calendar',
    color: 'green',
    action: () => router.push({ name: 'appointments' })
  },
  {
    title: 'View Records',
    description: 'Access medical history',
    icon: 'records',
    color: 'purple',
    action: () => router.push({ name: 'medical-records' })
  },
  {
    title: 'Track Health',
    description: 'Monitor vital signs',
    icon: 'heart',
    color: 'red',
    action: () => router.push({ name: 'health-tracking' })
  }
]

const getBPStatus = (bp) => {
  if (bp.systolic >= 140 || bp.diastolic >= 90) return 'high'
  if (bp.systolic >= 120 || bp.diastolic >= 80) return 'elevated'
  return 'normal'
}

const getBPStatusText = (bp) => {
  if (bp.systolic >= 140 || bp.diastolic >= 90) return 'High'
  if (bp.systolic >= 120 || bp.diastolic >= 80) return 'Elevated'
  return 'Normal'
}
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div class="welcome-section">
        <h1 class="welcome-title">Welcome back, {{ profileStore.profile?.name?.split(' ')[0] || authStore.user?.name?.split(' ')[0] || 'User' }}!</h1>
        <p class="welcome-subtitle">{{ currentDate }}</p>
      </div>
      <div class="health-score">
        <div class="score-circle">
          <span class="score-number">{{ profileStore.healthProfile?.healthScore || authStore.user?.healthData?.healthScore || 85 }}</span>
          <span class="score-label">Health Score</span>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Quick Actions -->
      <div class="quick-actions-section">
        <h2 class="section-title">Quick Actions</h2>
        <div class="quick-actions-grid">
          <button 
            v-for="action in quickActions" 
            :key="action.title"
            @click="action.action"
            class="quick-action-card"
            :class="action.color"
          >
            <div class="action-icon">
              <svg v-if="action.icon === 'doctor'" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M12 1v6M9 4h6" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else-if="action.icon === 'calendar'" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else-if="action.icon === 'records'" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="11" x2="12" y2="17" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="14" x2="15" y2="14" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else-if="action.icon === 'heart'" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="action-content">
              <h3>{{ action.title }}</h3>
              <p>{{ action.description }}</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Upcoming Appointments -->
      <div class="appointments-section">
        <div class="section-header">
          <h2 class="section-title">Upcoming Appointments</h2>
          <router-link :to="{ name: 'appointments' }" class="view-all-link">View All</router-link>
        </div>
        <div class="appointments-list">
          <div v-for="appointment in upcomingAppointments" :key="appointment.id" class="appointment-card">
            <div class="appointment-date">
              <span class="date-day">{{ new Date(appointment.date).getDate() }}</span>
              <span class="date-month">{{ new Date(appointment.date).toLocaleDateString('en-US', { month: 'short' }) }}</span>
            </div>
            <div class="appointment-details">
              <h4>{{ appointment.doctorName }}</h4>
              <p class="appointment-specialty">{{ appointment.specialty }}</p>
              <div class="appointment-time">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ appointment.time }}
              </div>
            </div>
            <div class="appointment-status" :class="appointment.status">
              {{ appointment.status }}
            </div>
          </div>
          <div v-if="upcomingAppointments.length === 0" class="no-appointments">
            <p>No upcoming appointments</p>
            <router-link :to="{ name: 'doctors' }" class="book-appointment-btn">Book Your First Appointment</router-link>
          </div>
        </div>
      </div>

      <!-- Health Overview -->
      <div class="health-overview-section">
        <h2 class="section-title">Health Overview</h2>
        <div class="vitals-grid">
          <div class="vital-card">
            <div class="vital-icon blood-pressure">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="vital-info">
              <span class="vital-value">{{ currentVitals.bloodPressure.systolic }}/{{ currentVitals.bloodPressure.diastolic }}</span>
              <span class="vital-label">Blood Pressure</span>
              <span class="vital-status" :class="getBPStatus(currentVitals.bloodPressure)">{{ getBPStatusText(currentVitals.bloodPressure) }}</span>
            </div>
          </div>

          <div class="vital-card">
            <div class="vital-icon heart-rate">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="vital-info">
              <span class="vital-value">{{ currentVitals.heartRate.value }} bpm</span>
              <span class="vital-label">Heart Rate</span>
              <span class="vital-status normal">Normal</span>
            </div>
          </div>

          <div class="vital-card">
            <div class="vital-icon weight">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="vital-info">
              <span class="vital-value">{{ currentVitals.weight.value }} lbs</span>
              <span class="vital-label">Weight</span>
              <span class="vital-status normal">Stable</span>
            </div>
          </div>

          <div class="vital-card">
            <div class="vital-icon temperature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="vital-info">
              <span class="vital-value">{{ currentVitals.temperature.value }}°F</span>
              <span class="vital-label">Temperature</span>
              <span class="vital-status normal">Normal</span>
            </div>
          </div>
        </div>

        <!-- User-specific Health Insights -->
        <div v-if="authStore.user?.healthData?.conditions?.length" class="health-conditions">
          <h3>Current Conditions</h3>
          <div class="conditions-list">
            <span 
              v-for="condition in authStore.user.healthData.conditions" 
              :key="condition"
              class="condition-tag"
            >
              {{ condition }}
            </span>
          </div>
        </div>

        <div v-if="authStore.user?.healthData?.medications?.length" class="current-medications">
          <h3>Current Medications</h3>
          <div class="medications-list">
            <div 
              v-for="medication in authStore.user.healthData.medications.slice(0, 3)" 
              :key="medication.name"
              class="medication-item"
            >
              <span class="med-name">{{ medication.name }}</span>
              <span class="med-dosage">{{ medication.dosage }} - {{ medication.frequency }}</span>
            </div>
            <router-link v-if="authStore.user.healthData.medications.length > 3" :to="{ name: 'medications' }" class="view-all-meds">
              View all {{ authStore.user.healthData.medications.length }} medications
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  width: 100%;
  padding: 0 1rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.welcome-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.health-score {
  text-align: center;
}

.score-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.score-number {
  font-size: 2rem;
  font-weight: 700;
}

.score-label {
  font-size: 0.8rem;
  opacity: 0.9;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.view-all-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.view-all-link:hover {
  text-decoration: underline;
}

/* Quick Actions */
.quick-actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.quick-action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  background: var(--bg-primary);
  box-shadow: var(--shadow);
}

.quick-action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.quick-action-card.blue { color: #3b82f6; }
.quick-action-card.green { color: #10b981; }
.quick-action-card.purple { color: #8b5cf6; }
.quick-action-card.red { color: #ef4444; }

.action-icon {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 50%;
  background: currentColor;
  color: white;
}

.action-content h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.action-content p {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Appointments */
.appointments-section {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.appointment-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.appointment-card:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
}

.appointment-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  min-width: 60px;
}

.date-day {
  font-size: 1.5rem;
  font-weight: 700;
}

.date-month {
  font-size: 0.8rem;
  text-transform: uppercase;
}

.appointment-details {
  flex: 1;
}

.appointment-details h4 {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.appointment-specialty {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.appointment-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.appointment-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}

.appointment-status.confirmed {
  background: #dcfce7;
  color: #166534;
}

.appointment-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.no-appointments {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.book-appointment-btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.book-appointment-btn:hover {
  background: var(--primary-dark);
}

/* Health Overview */
.health-overview-section {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.vitals-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.vital-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.vital-card:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
}

.vital-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
}

.vital-icon.blood-pressure { background: #ef4444; }
.vital-icon.heart-rate { background: #f59e0b; }
.vital-icon.weight { background: #10b981; }
.vital-icon.temperature { background: #3b82f6; }

.vital-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.vital-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.vital-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.vital-status {
  font-size: 0.8rem;
  font-weight: 500;
}

.vital-status.normal {
  color: var(--success-color);
}

.vital-status.elevated {
  color: var(--warning-color);
}

.vital-status.high {
  color: var(--danger-color);
}

/* Health Conditions & Medications */
.health-conditions,
.current-medications {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.health-conditions h3,
.current-medications h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.conditions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.condition-tag {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.medications-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.medication-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.med-name {
  font-weight: 600;
  color: var(--text-primary);
}

.med-dosage {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.view-all-meds {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  padding: 0.5rem;
}

.view-all-meds:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .vitals-grid {
    grid-template-columns: 1fr;
  }
}
</style> 