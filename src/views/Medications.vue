<template>
  <div class="medications-page">
    <div class="page-header">
      <h1>Medications</h1>
      <p>Manage your prescriptions and track medication adherence</p>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-icon active">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4.5 16.5c-1.5 1.5-1.5 4 0 5.5s4 1.5 5.5 0L12 20l-7.5-7.5z" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8l4-4 4 4-4 4-4-4z" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8l7.5 7.5" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="summary-info">
          <span class="summary-number">{{ activeMedications.length }}</span>
          <span class="summary-label">Active Meds</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon today">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="summary-info">
          <span class="summary-number">{{ todaysDoses }}</span>
          <span class="summary-label">Due Today</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon adherence">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
            <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="summary-info">
          <span class="summary-number">{{ adherenceRate }}%</span>
          <span class="summary-label">Adherence</span>
        </div>
      </div>

      <div class="summary-card action-card" @click="showAddMedicationModal = true">
        <div class="summary-icon add">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2"/>
            <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="summary-info">
          <span class="summary-label">Add New</span>
          <span class="summary-sublabel">Medication</span>
        </div>
      </div>
    </div>

    <!-- Today's Schedule -->
    <div class="schedule-section">
      <div class="section-header">
        <h2>Today's Schedule</h2>
        <div class="date-info">{{ currentDate }}</div>
      </div>

      <div class="schedule-timeline">
        <div v-for="dose in todaysSchedule" :key="dose.id" class="dose-item" :class="{ taken: dose.taken, overdue: dose.overdue }">
          <div class="dose-time">
            <span class="time">{{ dose.time }}</span>
            <span class="period">{{ dose.period }}</span>
          </div>
          
          <div class="dose-medication">
            <div class="med-info">
              <h4>{{ dose.medication }}</h4>
              <p>{{ dose.dosage }} • {{ dose.instructions }}</p>
            </div>
            <div class="med-icon" :style="{ backgroundColor: dose.color }">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4.5 16.5c-1.5 1.5-1.5 4 0 5.5s4 1.5 5.5 0L12 20l-7.5-7.5z" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8l4-4 4 4-4 4-4-4z" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8l7.5 7.5" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
          </div>

          <div class="dose-actions">
            <button v-if="!dose.taken" @click="markAsTaken(dose.id)" class="action-btn take">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
              </svg>
              Mark Taken
            </button>
            <div v-else class="taken-status">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
              </svg>
              Taken
            </div>
            
            <button @click="snoozeReminder(dose.id)" class="action-btn snooze">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
              </svg>
              Snooze
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="content-grid">
      <!-- Active Medications -->
      <div class="medications-list-section">
        <div class="section-header">
          <h2>Active Medications</h2>
          <div class="view-filters">
            <button 
              v-for="filter in ['All', 'Prescription', 'OTC', 'Supplements']" 
              :key="filter"
              @click="selectedFilter = filter"
              :class="{ active: selectedFilter === filter }"
              class="filter-btn"
            >
              {{ filter }}
            </button>
          </div>
        </div>

        <div class="medications-list">
          <div v-for="medication in filteredMedications" :key="medication.id" class="medication-card">
            <div class="medication-header">
              <div class="med-icon-large" :style="{ backgroundColor: medication.color }">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4.5 16.5c-1.5 1.5-1.5 4 0 5.5s4 1.5 5.5 0L12 20l-7.5-7.5z" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 8l4-4 4 4-4 4-4-4z" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 8l7.5 7.5" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              
              <div class="med-main-info">
                <h3>{{ medication.name }}</h3>
                <p class="med-generic">{{ medication.genericName }}</p>
                <p class="med-dosage">{{ medication.dosage }} • {{ medication.frequency }}</p>
              </div>

              <div class="med-status" :class="medication.status.toLowerCase().replace(' ', '-')">
                {{ medication.status }}
              </div>
            </div>

            <div class="medication-details">
              <div class="detail-item">
                <span class="detail-label">Prescribed by:</span>
                <span class="detail-value">{{ medication.prescribedBy }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Start Date:</span>
                <span class="detail-value">{{ new Date(medication.startDate).toLocaleDateString() }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Refills Left:</span>
                <span class="detail-value">{{ medication.refillsLeft }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Next Refill:</span>
                <span class="detail-value">{{ new Date(medication.nextRefill).toLocaleDateString() }}</span>
              </div>
            </div>

            <div class="medication-actions">
              <button @click="editMedication(medication.id)" class="action-btn edit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
                </svg>
                Edit
              </button>
              
              <button @click="requestRefill(medication.id)" class="action-btn refill">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M1 4v6h6" stroke="currentColor" stroke-width="2"/>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" stroke-width="2"/>
                </svg>
                Request Refill
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Adherence Tracking -->
      <div class="adherence-section">
        <div class="section-header">
          <h2>Adherence Tracking</h2>
          <div class="time-range">
            <select v-model="adherenceTimeRange" class="time-select">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        <div class="adherence-chart">
          <div class="adherence-score">
            <div class="score-circle">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" stroke-width="10"/>
                <circle 
                  cx="60" cy="60" r="50" 
                  fill="none" 
                  stroke="#10b981" 
                  stroke-width="10"
                  stroke-dasharray="314.16"
                  stroke-dashoffset="62.83"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div class="score-text">
                <span class="score-number">{{ adherenceRate }}%</span>
                <span class="score-label">Adherence</span>
              </div>
            </div>
          </div>

          <div class="adherence-breakdown">
            <div class="breakdown-item">
              <div class="breakdown-label">Doses Taken</div>
              <div class="breakdown-value">{{ dosesTaken }}/{{ totalDoses }}</div>
            </div>
            
            <div class="breakdown-item">
              <div class="breakdown-label">On Time</div>
              <div class="breakdown-value">{{ onTimeDoses }}%</div>
            </div>
            
            <div class="breakdown-item">
              <div class="breakdown-label">Missed</div>
              <div class="breakdown-value">{{ missedDoses }}</div>
            </div>
          </div>
        </div>

        <div class="adherence-insights">
          <h4>Insights & Tips</h4>
          <ul>
            <li>Great job! Your adherence rate is above average</li>
            <li>Consider setting more reminders for evening doses</li>
            <li>You're most consistent with morning medications</li>
          </ul>
        </div>

        <!-- Reminders Settings -->
        <div class="reminders-section">
          <h3>Reminder Settings</h3>
          
          <div class="reminder-option">
            <label class="reminder-label">
              <input type="checkbox" v-model="reminderSettings.push" class="reminder-checkbox">
              <span class="checkmark"></span>
              Push Notifications
            </label>
          </div>
          
          <div class="reminder-option">
            <label class="reminder-label">
              <input type="checkbox" v-model="reminderSettings.email" class="reminder-checkbox">
              <span class="checkmark"></span>
              Email Reminders
            </label>
          </div>
          
          <div class="reminder-option">
            <label class="reminder-label">
              <input type="checkbox" v-model="reminderSettings.sms" class="reminder-checkbox">
              <span class="checkmark"></span>
              SMS Alerts
            </label>
          </div>

          <div class="reminder-timing">
            <label>Reminder Time</label>
            <select v-model="reminderSettings.timing" class="timing-select">
              <option value="0">At dose time</option>
              <option value="15">15 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Medication Modal -->
    <div v-if="showAddMedicationModal" class="modal-overlay" @click="showAddMedicationModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add New Medication</h3>
          <button @click="showAddMedicationModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Medication Name</label>
            <input v-model="newMedication.name" type="text" class="form-input" placeholder="Enter medication name">
          </div>
          
          <div class="form-group">
            <label>Dosage</label>
            <input v-model="newMedication.dosage" type="text" class="form-input" placeholder="e.g., 500mg">
          </div>
          
          <div class="form-group">
            <label>Frequency</label>
            <select v-model="newMedication.frequency" class="form-select">
              <option value="">Select frequency...</option>
              <option value="Once daily">Once daily</option>
              <option value="Twice daily">Twice daily</option>
              <option value="Three times daily">Three times daily</option>
              <option value="As needed">As needed</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Prescribed By</label>
            <input v-model="newMedication.prescribedBy" type="text" class="form-input" placeholder="Doctor's name">
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showAddMedicationModal = false" class="btn secondary">Cancel</button>
          <button @click="addMedication" class="btn primary">Add Medication</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const selectedFilter = ref('All')
const adherenceTimeRange = ref('30d')
const showAddMedicationModal = ref(false)

const currentDate = new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})

const newMedication = reactive({
  name: '',
  dosage: '',
  frequency: '',
  prescribedBy: ''
})

const reminderSettings = reactive({
  push: true,
  email: false,
  sms: true,
  timing: 15
})

// Mock data
const medications = ref([
  {
    id: 1,
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    type: 'Prescription',
    status: 'Active',
    prescribedBy: 'Dr. Emily Rodriguez',
    startDate: '2024-01-01',
    refillsLeft: 3,
    nextRefill: '2024-02-15',
    color: '#3b82f6'
  },
  {
    id: 2,
    name: 'Metformin',
    genericName: 'Metformin HCl',
    dosage: '500mg',
    frequency: 'Twice daily',
    type: 'Prescription',
    status: 'Active',
    prescribedBy: 'Dr. Kevin Lee',
    startDate: '2023-12-15',
    refillsLeft: 1,
    nextRefill: '2024-01-30',
    color: '#10b981'
  },
  {
    id: 3,
    name: 'Vitamin D3',
    genericName: 'Cholecalciferol',
    dosage: '2000 IU',
    frequency: 'Once daily',
    type: 'Supplements',
    status: 'Active',
    prescribedBy: 'Self-administered',
    startDate: '2024-01-01',
    refillsLeft: 0,
    nextRefill: '2024-03-01',
    color: '#f59e0b'
  },
  {
    id: 4,
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    dosage: '200mg',
    frequency: 'As needed',
    type: 'OTC',
    status: 'Active',
    prescribedBy: 'Self-administered',
    startDate: '2024-01-01',
    refillsLeft: 0,
    nextRefill: '2024-02-01',
    color: '#ef4444'
  }
])

const todaysSchedule = ref([
  {
    id: 1,
    time: '8:00',
    period: 'AM',
    medication: 'Lisinopril',
    dosage: '10mg',
    instructions: 'With breakfast',
    taken: true,
    overdue: false,
    color: '#3b82f6'
  },
  {
    id: 2,
    time: '8:00',
    period: 'AM',
    medication: 'Metformin',
    dosage: '500mg',
    instructions: 'With breakfast',
    taken: true,
    overdue: false,
    color: '#10b981'
  },
  {
    id: 3,
    time: '9:00',
    period: 'AM',
    medication: 'Vitamin D3',
    dosage: '2000 IU',
    instructions: 'With food',
    taken: false,
    overdue: true,
    color: '#f59e0b'
  },
  {
    id: 4,
    time: '6:00',
    period: 'PM',
    medication: 'Metformin',
    dosage: '500mg',
    instructions: 'With dinner',
    taken: false,
    overdue: false,
    color: '#10b981'
  }
])

// Computed properties
const activeMedications = computed(() => {
  return medications.value.filter(med => med.status === 'Active')
})

const filteredMedications = computed(() => {
  if (selectedFilter.value === 'All') return activeMedications.value
  return activeMedications.value.filter(med => med.type === selectedFilter.value)
})

const todaysDoses = computed(() => {
  return todaysSchedule.value.length
})

const adherenceRate = computed(() => 92)
const dosesTaken = computed(() => 28)
const totalDoses = computed(() => 30)
const onTimeDoses = computed(() => 85)
const missedDoses = computed(() => 2)

// Methods
const markAsTaken = (doseId) => {
  const dose = todaysSchedule.value.find(d => d.id === doseId)
  if (dose) {
    dose.taken = true
    dose.overdue = false
  }
}

const snoozeReminder = (doseId) => {
  alert('Reminder snoozed for 15 minutes')
}

const editMedication = (medicationId) => {
  alert(`Edit medication ${medicationId}`)
}

const requestRefill = (medicationId) => {
  alert(`Refill requested for medication ${medicationId}`)
}

const addMedication = () => {
  if (newMedication.name && newMedication.dosage && newMedication.frequency) {
    medications.value.push({
      id: Date.now(),
      name: newMedication.name,
      genericName: newMedication.name,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency,
      type: 'Prescription',
      status: 'Active',
      prescribedBy: newMedication.prescribedBy,
      startDate: new Date().toISOString().split('T')[0],
      refillsLeft: 5,
      nextRefill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      color: '#8b5cf6'
    })
    
    // Reset form
    Object.assign(newMedication, {
      name: '',
      dosage: '',
      frequency: '',
      prescribedBy: ''
    })
    
    showAddMedicationModal.value = false
  }
}
</script>

<style scoped>
.medications-page {
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

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.summary-card {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: white;
}

.summary-icon.active { background: #3b82f6; }
.summary-icon.today { background: #f59e0b; }
.summary-icon.adherence { background: #10b981; }
.summary-icon.add { background: #8b5cf6; }

.summary-info {
  display: flex;
  flex-direction: column;
}

.summary-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.summary-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.summary-sublabel {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.action-card {
  cursor: pointer;
  border: 2px dashed var(--border-color);
  background: var(--bg-secondary);
}

.action-card:hover {
  border-color: var(--primary-color);
  background: var(--bg-primary);
}

/* Schedule Section */
.schedule-section {
  background: var(--bg-primary);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
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

.date-info {
  color: var(--text-secondary);
  font-weight: 500;
}

.schedule-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dose-item {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.dose-item:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
}

.dose-item.taken {
  background: #f0fdf4;
  border-color: #16a34a;
}

.dose-item.overdue {
  background: #fef2f2;
  border-color: #dc2626;
}

.dose-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  text-align: center;
}

.dose-time .time {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.dose-time .period {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.dose-medication {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.med-info h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.med-info p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.med-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
}

.dose-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.take {
  border-color: var(--success-color);
  color: var(--success-color);
  background: var(--bg-primary);
}

.action-btn.take:hover {
  background: var(--success-color);
  color: white;
}

.action-btn.snooze {
  border-color: var(--border-color);
  color: var(--text-secondary);
  background: var(--bg-primary);
}

.action-btn.snooze:hover {
  border-color: var(--warning-color);
  color: var(--warning-color);
}

.action-btn.edit {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: var(--bg-primary);
}

.action-btn.edit:hover {
  background: var(--primary-color);
  color: white;
}

.action-btn.refill {
  border-color: var(--secondary-color);
  color: var(--secondary-color);
  background: var(--bg-primary);
}

.action-btn.refill:hover {
  background: var(--secondary-color);
  color: white;
}

.taken-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--success-color);
  font-weight: 500;
  font-size: 0.85rem;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.medications-list-section,
.adherence-section {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.view-filters {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.medications-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.medication-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.medication-card:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
}

.medication-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.med-icon-large {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: white;
}

.med-main-info {
  flex: 1;
}

.med-main-info h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.med-generic {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.med-dosage {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.med-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.med-status.active {
  background: #dcfce7;
  color: #166534;
}

.medication-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
}

.detail-label {
  color: var(--text-secondary);
}

.detail-value {
  color: var(--text-primary);
  font-weight: 500;
}

.medication-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* Adherence Section */
.time-range {
  display: flex;
  align-items: center;
}

.time-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.adherence-chart {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.adherence-score {
  display: flex;
  justify-content: center;
}

.score-circle {
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

.score-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.adherence-breakdown {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breakdown-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.breakdown-value {
  color: var(--text-primary);
  font-weight: 600;
}

.adherence-insights h4 {
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.adherence-insights ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.adherence-insights li {
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.adherence-insights li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-weight: bold;
}

/* Reminders */
.reminders-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.reminders-section h3 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-weight: 600;
}

.reminder-option {
  margin-bottom: 1rem;
}

.reminder-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  color: var(--text-primary);
}

.reminder-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  height: 20px;
  width: 20px;
  background-color: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 4px;
  position: relative;
}

.reminder-checkbox:checked ~ .checkmark {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.reminder-checkbox:checked ~ .checkmark::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.reminder-timing {
  margin-top: 1rem;
}

.reminder-timing label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.timing-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
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

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.form-input:focus,
.form-select:focus {
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
  .content-grid {
    grid-template-columns: 1fr;
  }

  .summary-cards {
    grid-template-columns: 1fr 1fr;
  }

  .dose-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .dose-actions {
    width: 100%;
    justify-content: space-between;
  }

  .medication-details {
    grid-template-columns: 1fr;
  }

  .adherence-chart {
    flex-direction: column;
    align-items: center;
  }
}
</style> 