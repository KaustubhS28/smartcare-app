<template>
  <div v-if="isVisible" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <div class="warning-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <h3>Cancel Appointment</h3>
        <button @click="handleClose" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Appointment Details -->
        <div v-if="appointment" class="appointment-summary">
          <h4>Appointment to Cancel</h4>
          <div class="appointment-card">
            <div class="appointment-info">
              <div class="doctor-info">
                <h5>{{ appointment.doctorName }}</h5>
                <p>{{ appointment.doctorSpecialization }}</p>
              </div>
              <div class="appointment-datetime">
                <div class="date">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>{{ formatDate(appointment.appointmentDate) }}</span>
                </div>
                <div class="time">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>{{ formatTime(appointment.appointmentTime) }}</span>
                </div>
              </div>
              <div class="appointment-meta">
                <span class="type">{{ appointment.appointmentType }}</span>
                <span class="duration">{{ appointment.duration }} min</span>
              </div>
            </div>
            <div v-if="appointment.consultationFee" class="fee-info">
              <span class="fee-label">Consultation Fee</span>
              <span class="fee-amount">${{ appointment.consultationFee }}</span>
            </div>
          </div>
        </div>

        <!-- Cancellation Warnings -->
        <div class="cancellation-warnings">
          <div class="warning-item">
            <div class="warning-icon-small">⚠️</div>
            <div class="warning-text">
              <strong>This action cannot be undone.</strong>
              <p>Once cancelled, you'll need to book a new appointment.</p>
            </div>
          </div>
          
          <div v-if="isCancellationRestricted" class="warning-item severe">
            <div class="warning-icon-small">🚫</div>
            <div class="warning-text">
              <strong>Cancellation Fee May Apply</strong>
              <p>{{ cancellationWarning }}</p>
            </div>
          </div>
          
          <div v-if="refundInfo" class="warning-item">
            <div class="warning-icon-small">💰</div>
            <div class="warning-text">
              <strong>Refund Information</strong>
              <p>{{ refundInfo }}</p>
            </div>
          </div>
        </div>

        <!-- Cancellation Reason -->
        <div class="form-section">
          <label for="cancellationReason">Reason for Cancellation (Optional)</label>
          <select
            id="cancellationReason"
            v-model="cancellationReason"
            class="reason-select"
          >
            <option value="">Select a reason (optional)</option>
            <option value="Schedule conflict">Schedule conflict</option>
            <option value="Feeling better">Feeling better</option>
            <option value="Emergency came up">Emergency came up</option>
            <option value="Doctor unavailable">Doctor unavailable</option>
            <option value="Financial reasons">Financial reasons</option>
            <option value="Found another doctor">Found another doctor</option>
            <option value="Personal reasons">Personal reasons</option>
            <option value="Other">Other</option>
          </select>
          
          <div v-if="cancellationReason === 'Other'" class="custom-reason">
            <textarea
              v-model="customReason"
              placeholder="Please specify your reason..."
              maxlength="500"
              class="custom-reason-input"
            ></textarea>
            <span class="char-count">{{ customReason.length }}/500 characters</span>
          </div>
        </div>

        <!-- Alternative Options -->
        <div class="alternative-options">
          <h4>Consider These Alternatives</h4>
          <div class="alternatives">
            <button 
              @click="handleReschedule"
              class="alternative-btn"
              type="button"
            >
              <div class="alt-icon">📅</div>
              <div class="alt-content">
                <strong>Reschedule Instead</strong>
                <p>Change the date or time</p>
              </div>
            </button>
            
            <button 
              @click="handleContactDoctor"
              class="alternative-btn"
              type="button"
            >
              <div class="alt-icon">📞</div>
              <div class="alt-content">
                <strong>Contact Doctor</strong>
                <p>Discuss your concerns</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="error-message">
          <div class="error-icon">⚠️</div>
          <span>{{ error }}</span>
        </div>

        <!-- Confirmation -->
        <div class="confirmation-section">
          <label class="confirmation-checkbox">
            <input
              type="checkbox"
              v-model="confirmed"
            />
            <span class="checkmark"></span>
            I understand this appointment will be cancelled and cannot be undone.
          </label>
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button 
            type="button" 
            @click="handleClose" 
            class="btn-secondary"
          >
            Keep Appointment
          </button>
          <button 
            type="button"
            @click="handleCancel"
            :disabled="!confirmed || isProcessing"
            class="btn-danger"
          >
            <span v-if="isProcessing">Cancelling...</span>
            <span v-else>Cancel Appointment</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppointmentStore } from '../../stores/appointments.js'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  appointment: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success', 'reschedule', 'contact'])

const appointmentStore = useAppointmentStore()

// Form state
const cancellationReason = ref('')
const customReason = ref('')
const confirmed = ref(false)
const error = ref('')
const isProcessing = ref(false)

// Calculate cancellation restrictions and warnings
const isCancellationRestricted = computed(() => {
  if (!props.appointment) return false
  
  const appointmentDateTime = new Date(`${props.appointment.appointmentDate}T${props.appointment.appointmentTime}`)
  const now = new Date()
  const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60)
  
  return hoursUntilAppointment < 24 // Less than 24 hours
})

const cancellationWarning = computed(() => {
  if (!props.appointment) return ''
  
  const appointmentDateTime = new Date(`${props.appointment.appointmentDate}T${props.appointment.appointmentTime}`)
  const now = new Date()
  const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60)
  
  if (hoursUntilAppointment < 2) {
    return 'Cancelling within 2 hours may result in the full consultation fee being charged.'
  } else if (hoursUntilAppointment < 24) {
    return 'Cancelling within 24 hours may result in a cancellation fee.'
  }
  
  return ''
})

const refundInfo = computed(() => {
  if (!props.appointment?.consultationFee) return ''
  
  const appointmentDateTime = new Date(`${props.appointment.appointmentDate}T${props.appointment.appointmentTime}`)
  const now = new Date()
  const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60)
  
  if (hoursUntilAppointment >= 24) {
    return 'Full refund will be processed within 3-5 business days.'
  } else if (hoursUntilAppointment >= 2) {
    return 'Partial refund may be available, subject to cancellation policy.'
  } else {
    return 'No refund available for cancellations within 2 hours.'
  }
})

const finalReason = computed(() => {
  if (cancellationReason.value === 'Other') {
    return customReason.value.trim() || 'Other'
  }
  return cancellationReason.value || 'Patient requested cancellation'
})

const handleCancel = async () => {
  if (!props.appointment || !confirmed.value) return
  
  try {
    isProcessing.value = true
    error.value = ''
    
    const result = await appointmentStore.cancelAppointment(
      props.appointment.id,
      finalReason.value
    )
    
    if (result.success) {
      emit('success', {
        ...result,
        cancellationReason: finalReason.value
      })
      handleClose()
    } else {
      error.value = result.message || 'Failed to cancel appointment. Please try again.'
    }
  } catch (err) {
    console.error('Failed to cancel appointment:', err)
    error.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isProcessing.value = false
  }
}

const handleReschedule = () => {
  emit('reschedule', props.appointment)
  handleClose()
}

const handleContactDoctor = () => {
  emit('contact', props.appointment)
  handleClose()
}

const handleClose = () => {
  // Reset form
  cancellationReason.value = ''
  customReason.value = ''
  confirmed.value = false
  error.value = ''
  
  emit('close')
}

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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
</script>

<style scoped>
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
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.warning-icon {
  color: var(--warning-color);
}

.modal-header h3 {
  flex: 1;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 8px;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.appointment-summary {
  margin-bottom: 2rem;
}

.appointment-summary h4 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.appointment-card {
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  background: var(--bg-secondary);
}

.appointment-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.doctor-info h5 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.doctor-info p {
  margin: 0;
  color: var(--text-secondary);
}

.appointment-datetime {
  display: flex;
  gap: 1.5rem;
}

.date,
.time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
}

.appointment-meta {
  display: flex;
  gap: 1rem;
}

.type,
.duration {
  padding: 0.25rem 0.75rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.fee-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.fee-label {
  color: var(--text-secondary);
}

.fee-amount {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
}

.cancellation-warnings {
  margin-bottom: 2rem;
}

.warning-item {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  background: var(--warning-light);
  border: 1px solid var(--warning-color);
}

.warning-item.severe {
  background: var(--error-light);
  border-color: var(--error-color);
}

.warning-icon-small {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.warning-text strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.warning-text p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.form-section {
  margin-bottom: 2rem;
}

.form-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.reason-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background: white;
  transition: border-color 0.3s ease;
}

.reason-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.custom-reason {
  margin-top: 1rem;
}

.custom-reason-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.custom-reason-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.char-count {
  display: block;
  text-align: right;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.alternative-options {
  margin-bottom: 2rem;
}

.alternative-options h4 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.alternatives {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.alternative-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid var(--border-color);
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.alternative-btn:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.alt-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.alt-content strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.alt-content p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--error-light);
  border: 1px solid var(--error-color);
  border-radius: 8px;
  margin-bottom: 1rem;
  color: var(--error-color);
}

.error-icon {
  font-size: 1.125rem;
}

.confirmation-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.confirmation-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  color: var(--text-primary);
}

.confirmation-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  transition: all 0.3s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.confirmation-checkbox input:checked + .checkmark {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.confirmation-checkbox input:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 0.875rem;
  font-weight: bold;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.btn-secondary,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--border-color);
}

.btn-danger {
  background: var(--error-color);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: var(--error-dark);
}

.btn-danger:disabled {
  background: var(--text-secondary);
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .appointment-datetime {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .appointment-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .alternatives {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn-secondary,
  .btn-danger {
    width: 100%;
  }
}
</style>
