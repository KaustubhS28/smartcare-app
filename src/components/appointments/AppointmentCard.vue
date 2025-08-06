<template>
  <div class="appointment-card" :class="[statusClass, { 'past': isPast }]">
    <div class="appointment-header">
      <div class="doctor-info">
        <h4>{{ appointment.doctorName }}</h4>
        <p class="specialization">{{ appointment.doctorSpecialization }}</p>
      </div>
      <div class="status-badge" :class="statusClass">
        {{ formatStatus(appointment.status) }}
      </div>
    </div>

    <div class="appointment-content">
      <div class="appointment-datetime">
        <div class="date-section">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>{{ formatDate(appointment.appointmentDate) }}</span>
        </div>
        <div class="time-section">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>{{ formatTime(appointment.appointmentTime) }}</span>
        </div>
      </div>

      <div class="appointment-meta">
        <div class="meta-item">
          <span class="meta-icon">{{ getTypeIcon(appointment.appointmentType) }}</span>
          <span class="meta-text">{{ appointment.appointmentType.replace('_', ' ') }}</span>
        </div>
        <div class="meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span class="meta-text">{{ appointment.duration }} min</span>
        </div>
        <div v-if="appointment.urgency && appointment.urgency !== 'ROUTINE'" class="meta-item urgency">
          <span class="meta-icon">⚡</span>
          <span class="meta-text">{{ appointment.urgency }}</span>
        </div>
      </div>

      <div v-if="appointment.reasonForVisit" class="appointment-reason">
        <p>{{ appointment.reasonForVisit }}</p>
      </div>

      <div v-if="appointment.confirmationCode" class="confirmation-info">
        <span class="confirmation-label">Confirmation:</span>
        <span class="confirmation-code">{{ appointment.confirmationCode }}</span>
      </div>
    </div>

    <div v-if="showActions && !isPast" class="appointment-actions">
      <button 
        v-if="canReschedule"
        @click="handleReschedule"
        class="action-btn secondary"
        title="Reschedule"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 12h18m-9-9l9 9-9 9" stroke="currentColor" stroke-width="2"/>
        </svg>
        Reschedule
      </button>
      
      <button 
        v-if="canCancel"
        @click="handleCancel"
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
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  appointment: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['reschedule', 'cancel'])

const isPast = computed(() => {
  const appointmentDateTime = new Date(`${props.appointment.appointmentDate}T${props.appointment.appointmentTime}`)
  return appointmentDateTime < new Date()
})

const statusClass = computed(() => {
  return props.appointment.status.toLowerCase().replace('_', '-')
})

const canReschedule = computed(() => {
  return props.appointment.canReschedule && 
         ['SCHEDULED', 'CONFIRMED'].includes(props.appointment.status) &&
         !isPast.value
})

const canCancel = computed(() => {
  return props.appointment.canCancel && 
         ['SCHEDULED', 'CONFIRMED'].includes(props.appointment.status) &&
         !isPast.value
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow'
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  const [hours, minutes] = timeString.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes))
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const formatStatus = (status) => {
  switch (status) {
    case 'SCHEDULED': return 'Scheduled'
    case 'CONFIRMED': return 'Confirmed'
    case 'IN_PROGRESS': return 'In Progress'
    case 'COMPLETED': return 'Completed'
    case 'CANCELLED': return 'Cancelled'
    case 'NO_SHOW': return 'No Show'
    default: return status
  }
}

const getTypeIcon = (type) => {
  switch (type) {
    case 'IN_PERSON': return '🏥'
    case 'VIDEO': return '📹'
    case 'PHONE': return '📞'
    default: return '📅'
  }
}

const handleReschedule = () => {
  emit('reschedule', props.appointment)
}

const handleCancel = () => {
  emit('cancel', props.appointment)
}
</script>

<style scoped>
.appointment-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: var(--shadow);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.appointment-card.scheduled {
  border-color: var(--success-color);
}

.appointment-card.confirmed {
  border-color: var(--primary-color);
}

.appointment-card.completed {
  border-color: var(--text-secondary);
}

.appointment-card.cancelled {
  border-color: var(--error-color);
  opacity: 0.7;
}

.appointment-card.past {
  opacity: 0.8;
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.doctor-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.specialization {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.scheduled {
  background: var(--success-light);
  color: var(--success-color);
}

.status-badge.confirmed {
  background: var(--primary-light);
  color: var(--primary-color);
}

.status-badge.completed {
  background: var(--text-light);
  color: var(--text-secondary);
}

.status-badge.cancelled {
  background: var(--error-light);
  color: var(--error-color);
}

.status-badge.in-progress {
  background: var(--warning-light);
  color: var(--warning-color);
}

.appointment-content {
  margin-bottom: 1rem;
}

.appointment-datetime {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.date-section,
.time-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.appointment-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.meta-item.urgency {
  color: var(--warning-color);
  font-weight: 500;
}

.meta-icon {
  font-size: 1rem;
}

.appointment-reason {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.appointment-reason p {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.875rem;
  line-height: 1.4;
}

.confirmation-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.confirmation-label {
  color: var(--text-secondary);
}

.confirmation-code {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: var(--primary-color);
  background: var(--primary-light);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.appointment-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.action-btn.secondary:hover {
  background: var(--primary-light);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.action-btn.danger {
  background: var(--error-light);
  color: var(--error-color);
  border: 1px solid var(--error-color);
}

.action-btn.danger:hover {
  background: var(--error-color);
  color: white;
}

@media (max-width: 768px) {
  .appointment-card {
    padding: 1rem;
  }
  
  .appointment-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
  
  .appointment-datetime {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .appointment-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .appointment-actions {
    flex-direction: column;
  }
  
  .action-btn {
    justify-content: center;
  }
}
</style>
