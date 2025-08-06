<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppointmentStore } from '../stores/appointments.js'

const appointmentStore = useAppointmentStore()

const selectedDate = ref(new Date())
const viewMode = ref('upcoming') // 'upcoming', 'past', 'all', 'today'
const isLoading = ref(false)
const showCancelModal = ref(false)
const selectedAppointment = ref(null)

// Load appointments when component mounts
onMounted(async () => {
  await loadAppointments()
  await appointmentStore.getUpcoming()
})

const loadAppointments = async () => {
  isLoading.value = true
  try {
    await appointmentStore.getAppointments()
  } catch (error) {
    console.error('Failed to load appointments:', error)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (timeString) => {
  // Convert 24-hour format to 12-hour format
  const [hours, minutes] = timeString.split(':')
  const hour12 = parseInt(hours) % 12 || 12
  const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
  return `${hour12}:${minutes} ${ampm}`
}

const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'SCHEDULED': return 'scheduled'
    case 'CONFIRMED': return 'confirmed'
    case 'IN_PROGRESS': return 'in-progress'
    case 'COMPLETED': return 'completed'
    case 'CANCELLED': return 'cancelled'
    case 'NO_SHOW': return 'no-show'
    default: return 'secondary'
  }
}

const getStatusDisplayText = (status) => {
  switch (status?.toUpperCase()) {
    case 'SCHEDULED': return 'Scheduled'
    case 'CONFIRMED': return 'Confirmed'
    case 'IN_PROGRESS': return 'In Progress'
    case 'COMPLETED': return 'Completed'
    case 'CANCELLED': return 'Cancelled'
    case 'NO_SHOW': return 'No Show'
    default: return status
  }
}

const filteredAppointments = computed(() => {
  switch (viewMode.value) {
    case 'upcoming':
      return appointmentStore.futureAppointments
    case 'past':
      return appointmentStore.pastAppointments
    case 'today':
      return appointmentStore.todayAppointments
    case 'all':
    default:
      return appointmentStore.appointments
  }
})

const upcomingCount = computed(() => appointmentStore.futureAppointments.length)
const completedCount = computed(() => appointmentStore.completedAppointments.length)
const todayCount = computed(() => appointmentStore.todayAppointments.length)

const canCancelAppointment = (appointment) => {
  return appointment.canCancel && ['SCHEDULED', 'CONFIRMED'].includes(appointment.status)
}

const canRescheduleAppointment = (appointment) => {
  return appointment.canReschedule && ['SCHEDULED', 'CONFIRMED'].includes(appointment.status)
}

const showCancelConfirmation = (appointment) => {
  selectedAppointment.value = appointment
  showCancelModal.value = true
}

const showRescheduleModal = (appointment) => {
  selectedAppointment.value = appointment
  manageMode.value = 'reschedule'
  showManageModal.value = true
}

const showEditModal = (appointment) => {
  selectedAppointment.value = appointment
  manageMode.value = 'edit'
  showManageModal.value = true
}

const openBookingModal = () => {
  showBookingModal.value = true
}

const handleBookingSuccess = async (appointmentData) => {
  console.log('Appointment booked successfully:', appointmentData)
  await loadAppointments()
  // Could show a success toast here
}

const handleManageSuccess = async (appointmentData) => {
  console.log('Appointment updated successfully:', appointmentData)
  await loadAppointments()
  // Could show a success toast here
}

const handleCancelSuccess = async (result) => {
  console.log('Appointment cancelled successfully:', result)
  await loadAppointments()
  // Could show a success toast here
}

const handleRescheduleFromCancel = (appointment) => {
  showRescheduleModal(appointment)
}

const handleContactFromCancel = (appointment) => {
  // Could open a contact modal or redirect to contact page
  console.log('Contact doctor for appointment:', appointment.id)
}
</script>

<template>
  <div class="appointments-page">
    <div class="page-header">
      <h1>My Appointments</h1>
      <p>Manage your healthcare visits and consultations</p>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon today">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ todayCount }}</span>
          <span class="stat-label">Today</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon upcoming">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ upcomingCount }}</span>
          <span class="stat-label">Upcoming</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon completed">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
            <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ completedCount }}</span>
          <span class="stat-label">Completed</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon total">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
            <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ appointmentStore.appointments.length }}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>

      <div class="stat-card action-card">
        <router-link to="/doctors" class="book-new-btn">
          <div class="stat-icon book">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2"/>
              <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Book New</span>
            <span class="stat-sublabel">Appointment</span>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button 
        @click="viewMode = 'today'" 
        :class="{ active: viewMode === 'today' }"
        class="filter-tab"
      >
        Today
      </button>
      <button 
        @click="viewMode = 'upcoming'" 
        :class="{ active: viewMode === 'upcoming' }"
        class="filter-tab"
      >
        Upcoming
      </button>
      <button 
        @click="viewMode = 'past'" 
        :class="{ active: viewMode === 'past' }"
        class="filter-tab"
      >
        Past
      </button>
      <button 
        @click="viewMode = 'all'" 
        :class="{ active: viewMode === 'all' }"
        class="filter-tab"
      >
        All
      </button>
    </div>

    <!-- Appointments List -->
    <div class="appointments-section">
      <div v-if="filteredAppointments.length === 0" class="no-appointments">
        <div class="no-appointments-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <h3>No {{ viewMode }} appointments</h3>
        <p v-if="viewMode === 'upcoming'">You don't have any upcoming appointments.</p>
        <p v-else-if="viewMode === 'past'">You don't have any past appointments.</p>
        <p v-else>You don't have any appointments yet.</p>
        <router-link to="/doctors" class="book-first-btn">Book Your First Appointment</router-link>
      </div>

      <div v-else class="appointments-list">
        <div 
          v-for="appointment in filteredAppointments" 
          :key="appointment.id"
          class="appointment-card"
        >
          <div class="appointment-date-section">
            <div class="date-badge">
              <span class="date-day">{{ new Date(appointment.date).getDate() }}</span>
              <span class="date-month">{{ new Date(appointment.date).toLocaleDateString('en-US', { month: 'short' }) }}</span>
              <span class="date-year">{{ new Date(appointment.date).getFullYear() }}</span>
            </div>
            <div class="time-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ appointment.time }}
            </div>
          </div>

          <div class="appointment-details">
            <div class="appointment-main">
              <h3 class="doctor-name">{{ appointment.doctorName }}</h3>
              <p class="appointment-specialty">{{ appointment.specialty }}</p>
              <p class="appointment-type">{{ appointment.type }}</p>
            </div>

            <div class="appointment-meta">
              <div class="location">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ appointment.location }}
              </div>
              
              <div v-if="appointment.notes" class="notes">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ appointment.notes }}
              </div>

              <div class="duration">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ appointment.duration }} minutes
              </div>
            </div>
          </div>

          <div class="appointment-status-section">
            <div class="status-badge" :class="getStatusColor(appointment.status)">
              {{ appointment.status }}
            </div>

            <div class="appointment-actions" v-if="appointment.status !== 'completed' && appointment.status !== 'cancelled'">
              <button 
                v-if="canRescheduleAppointment(appointment)"
                @click="showRescheduleModal(appointment)"
                class="action-btn secondary"
                title="Reschedule"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12h18m-9-9l9 9-9 9" stroke="currentColor" stroke-width="2"/>
                </svg>
                Reschedule
              </button>
              
              <button 
                v-if="canCancelAppointment(appointment)"
                @click="showCancelConfirmation(appointment)"
                class="action-btn danger"
                title="Cancel"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                </svg>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Book New Appointment Button -->
    <div class="floating-action">
      <button @click="openBookingModal" class="fab-btn" title="Book New Appointment">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2"/>
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>

    <!-- Modals -->
    <AppointmentBookingModal
      :is-visible="showBookingModal"
      @close="showBookingModal = false"
      @success="handleBookingSuccess"
    />

    <AppointmentManageModal
      :is-visible="showManageModal"
      :appointment="selectedAppointment"
      :mode="manageMode"
      @close="showManageModal = false"
      @success="handleManageSuccess"
    />

    <AppointmentCancelModal
      :is-visible="showCancelModal"
      :appointment="selectedAppointment"
      @close="showCancelModal = false"
      @success="handleCancelSuccess"
      @reschedule="handleRescheduleFromCancel"
      @contact="handleContactFromCancel"
    />
  </div>
</template>

<style scoped>
.appointments-page {
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: white;
}

.stat-icon.upcoming { background: var(--primary-color); }
.stat-icon.completed { background: var(--success-color); }
.stat-icon.total { background: var(--accent-color); }
.stat-icon.book { background: var(--secondary-color); }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-sublabel {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.action-card {
  cursor: pointer;
  border: 2px dashed var(--border-color);
  background: var(--bg-secondary);
}

.action-card:hover {
  border-color: var(--secondary-color);
  background: var(--bg-primary);
}

.book-new-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  width: 100%;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: var(--bg-primary);
  padding: 0.5rem;
  border-radius: 8px;
  box-shadow: var(--shadow);
}

.filter-tab {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tab:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.filter-tab.active {
  background: var(--primary-color);
  color: white;
}

/* Appointments List */
.appointments-section {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.appointments-list {
  padding: 1rem;
}

.appointment-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  background: var(--bg-primary);
}

.appointment-card:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

.appointment-date-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 80px;
}

.date-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--primary-color);
  color: white;
  border-radius: 12px;
  min-width: 70px;
}

.date-day {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.date-month {
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 500;
}

.date-year {
  font-size: 0.7rem;
  opacity: 0.9;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.appointment-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.appointment-main h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.appointment-specialty {
  color: var(--primary-color);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.appointment-type {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.appointment-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.location,
.notes,
.duration {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.appointment-status-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.success {
  background: #dcfce7;
  color: #166534;
}

.status-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.danger {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.info {
  background: #dbeafe;
  color: #1e40af;
}

.appointment-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.secondary {
  border-color: var(--border-color);
  color: var(--text-secondary);
  background: var(--bg-primary);
}

.action-btn.secondary:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(59, 130, 246, 0.05);
}

.action-btn.danger {
  border-color: var(--danger-color);
  color: var(--danger-color);
  background: var(--bg-primary);
}

.action-btn.danger:hover {
  background: var(--danger-color);
  color: white;
}

/* No Appointments */
.no-appointments {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.no-appointments-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-appointments h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.book-first-btn {
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

.book-first-btn:hover {
  background: var(--primary-dark);
}

.floating-action {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 999;
}

.fab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
}

.fab-btn:hover {
  background: var(--primary-dark);
  transform: scale(1.1);
}

.book-new {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.book-new:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.book-new .stat-icon {
  background: rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .appointment-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .appointment-date-section {
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
  }

  .appointment-status-section {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .appointment-actions {
    flex-direction: column;
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style> 