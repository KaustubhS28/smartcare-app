<template>
  <div v-if="isVisible" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ mode === 'reschedule' ? 'Reschedule' : 'Edit' }} Appointment</h3>
        <button @click="handleClose" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Current Appointment Info -->
        <div v-if="appointment" class="current-appointment">
          <h4>Current Appointment</h4>
          <div class="appointment-details">
            <div class="detail-row">
              <span class="label">Doctor:</span>
              <span class="value">{{ appointment.doctorName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">{{ formatDate(appointment.appointmentDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">{{ formatTime(appointment.appointmentTime) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Type:</span>
              <span class="value">{{ appointment.appointmentType }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span class="value status" :class="appointment.status.toLowerCase()">
                {{ appointment.status }}
              </span>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="update-form">
          <!-- Date and Time Section (only for reschedule) -->
          <div v-if="mode === 'reschedule'" class="form-section">
            <h4>Select New Date & Time</h4>
            
            <div class="form-group">
              <label for="newDate">New Date</label>
              <input
                id="newDate"
                type="date"
                v-model="formData.appointmentDate"
                :min="minDate"
                :max="maxDate"
                @change="onDateChange"
                :class="{ error: errors.appointmentDate }"
                required
              />
              <span v-if="errors.appointmentDate" class="error-message">
                {{ errors.appointmentDate }}
              </span>
            </div>

            <div v-if="formData.appointmentDate" class="form-group">
              <label>Available Times</label>
              <div v-if="loadingSlots" class="loading-slots">
                <div class="spinner"></div>
                <span>Loading available times...</span>
              </div>
              <div v-else-if="availableSlots.length === 0" class="no-slots">
                <p>No available time slots for this date. Please select another date.</p>
              </div>
              <div v-else class="time-slots">
                <button
                  v-for="slot in availableSlots"
                  :key="slot"
                  type="button"
                  :class="{ 
                    selected: formData.appointmentTime === slot,
                    current: appointment.appointmentTime === slot && appointment.appointmentDate === formData.appointmentDate
                  }"
                  @click="selectTimeSlot(slot)"
                  class="time-slot"
                  :disabled="appointment.appointmentTime === slot && appointment.appointmentDate === formData.appointmentDate"
                >
                  {{ formatTime(slot) }}
                  <span v-if="appointment.appointmentTime === slot && appointment.appointmentDate === formData.appointmentDate" 
                        class="current-label">
                    (Current)
                  </span>
                </button>
              </div>
              <span v-if="errors.appointmentTime" class="error-message">
                {{ errors.appointmentTime }}
              </span>
            </div>
          </div>

          <!-- Appointment Type Update -->
          <div class="form-section">
            <h4>Appointment Type</h4>
            <div class="appointment-types">
              <label 
                v-for="type in appointmentTypes" 
                :key="type.value"
                :class="{ selected: formData.appointmentType === type.value }"
                class="type-option"
              >
                <input
                  type="radio"
                  :value="type.value"
                  v-model="formData.appointmentType"
                  @change="onAppointmentTypeChange"
                />
                <div class="type-content">
                  <div class="type-icon">{{ type.icon }}</div>
                  <div class="type-info">
                    <span class="type-name">{{ type.name }}</span>
                    <span class="type-description">{{ type.description }}</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Appointment Details Update -->
          <div class="form-section">
            <h4>Update Appointment Details</h4>
            
            <div class="form-group">
              <label for="reasonForVisit">Reason for Visit *</label>
              <textarea
                id="reasonForVisit"
                v-model="formData.reasonForVisit"
                placeholder="Please describe your symptoms or reason for the appointment (minimum 10 characters)..."
                :class="{ error: errors.reasonForVisit }"
                required
                minlength="10"
                maxlength="500"
              ></textarea>
              <span v-if="errors.reasonForVisit" class="error-message">
                {{ errors.reasonForVisit }}
              </span>
              <span class="char-count">
                {{ formData.reasonForVisit.length }}/500 characters
              </span>
            </div>

            <div class="form-group">
              <label for="notes">Additional Notes</label>
              <textarea
                id="notes"
                v-model="formData.notes"
                placeholder="Any additional information for the doctor..."
                :class="{ error: errors.notes }"
                maxlength="1000"
              ></textarea>
              <span v-if="errors.notes" class="error-message">
                {{ errors.notes }}
              </span>
              <span class="char-count">
                {{ formData.notes.length }}/1000 characters
              </span>
            </div>

            <div class="form-group">
              <label for="urgency">Urgency Level</label>
              <select
                id="urgency"
                v-model="formData.urgency"
                :class="{ error: errors.urgency }"
              >
                <option value="ROUTINE">Routine - Regular scheduled appointment</option>
                <option value="URGENT">Urgent - Needs attention within 24-48 hours</option>
                <option value="EMERGENCY">Emergency - Immediate medical attention required</option>
              </select>
              <span v-if="errors.urgency" class="error-message">
                {{ errors.urgency }}
              </span>
            </div>

            <div class="form-group">
              <label for="duration">Duration</label>
              <select
                id="duration"
                v-model="formData.duration"
                :class="{ error: errors.duration }"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
              <span v-if="errors.duration" class="error-message">
                {{ errors.duration }}
              </span>
            </div>
          </div>

          <!-- Error Display -->
          <div v-if="submitError" class="submit-error">
            <div class="error-icon">⚠️</div>
            <div class="error-content">
              <p>{{ submitError }}</p>
              <div v-if="conflictSlots.length > 0" class="suggested-slots">
                <p>Suggested alternative times:</p>
                <div class="conflict-slots">
                  <button
                    v-for="slot in conflictSlots"
                    :key="slot"
                    type="button"
                    @click="selectTimeSlot(slot)"
                    class="conflict-slot"
                  >
                    {{ formatTime(slot) }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary of Changes -->
          <div v-if="hasChanges" class="changes-summary">
            <h4>Summary of Changes</h4>
            <div v-if="mode === 'reschedule' && (dateChanged || timeChanged)" class="change-item">
              <span class="change-label">Date & Time:</span>
              <div class="change-value">
                <span class="old-value">{{ formatDate(appointment.appointmentDate) }} at {{ formatTime(appointment.appointmentTime) }}</span>
                <span class="arrow">→</span>
                <span class="new-value">{{ formatDate(formData.appointmentDate) }} at {{ formatTime(formData.appointmentTime) }}</span>
              </div>
            </div>
            <div v-if="typeChanged" class="change-item">
              <span class="change-label">Type:</span>
              <div class="change-value">
                <span class="old-value">{{ appointment.appointmentType }}</span>
                <span class="arrow">→</span>
                <span class="new-value">{{ formData.appointmentType }}</span>
              </div>
            </div>
            <div v-if="reasonChanged" class="change-item">
              <span class="change-label">Reason:</span>
              <div class="change-value">
                <span class="new-value">Updated</span>
              </div>
            </div>
            <div v-if="notesChanged" class="change-item">
              <span class="change-label">Notes:</span>
              <div class="change-value">
                <span class="new-value">{{ formData.notes ? 'Updated' : 'Removed' }}</span>
              </div>
            </div>
            <div v-if="urgencyChanged" class="change-item">
              <span class="change-label">Urgency:</span>
              <div class="change-value">
                <span class="old-value">{{ appointment.urgency }}</span>
                <span class="arrow">→</span>
                <span class="new-value">{{ formData.urgency }}</span>
              </div>
            </div>
            <div v-if="durationChanged" class="change-item">
              <span class="change-label">Duration:</span>
              <div class="change-value">
                <span class="old-value">{{ appointment.duration }} min</span>
                <span class="arrow">→</span>
                <span class="new-value">{{ formData.duration }} min</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <button type="button" @click="handleClose" class="btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="!hasChanges || isSubmitting"
              class="btn-primary"
            >
              <span v-if="isSubmitting">{{ mode === 'reschedule' ? 'Rescheduling...' : 'Updating...' }}</span>
              <span v-else>{{ mode === 'reschedule' ? 'Reschedule' : 'Update' }} Appointment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAppointmentStore } from '../../stores/appointments.js'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  appointment: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'reschedule', // 'reschedule' or 'edit'
    validator: (value) => ['reschedule', 'edit'].includes(value)
  }
})

const emit = defineEmits(['close', 'success'])

const appointmentStore = useAppointmentStore()

// Form data
const formData = ref({
  appointmentDate: '',
  appointmentTime: '',
  appointmentType: 'IN_PERSON',
  reasonForVisit: '',
  notes: '',
  urgency: 'ROUTINE',
  duration: 30
})

// Form state
const errors = ref({})
const submitError = ref('')
const conflictSlots = ref([])
const availableSlots = ref([])
const loadingSlots = ref(false)
const isSubmitting = ref(false)

// Appointment types
const appointmentTypes = [
  {
    value: 'IN_PERSON',
    name: 'In-Person',
    description: 'Visit the doctor\'s office',
    icon: '🏥'
  },
  {
    value: 'VIDEO',
    name: 'Video Call',
    description: 'Online video consultation',
    icon: '📹'
  },
  {
    value: 'PHONE',
    name: 'Phone Call',
    description: 'Phone consultation',
    icon: '📞'
  }
]

// Date constraints
const today = new Date()
const minDate = computed(() => {
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const maxDate = computed(() => {
  const maxBooking = new Date(today)
  maxBooking.setDate(maxBooking.getDate() + 60)
  return maxBooking.toISOString().split('T')[0]
})

// Change detection
const dateChanged = computed(() => 
  props.mode === 'reschedule' && formData.value.appointmentDate !== props.appointment?.appointmentDate
)

const timeChanged = computed(() => 
  props.mode === 'reschedule' && formData.value.appointmentTime !== props.appointment?.appointmentTime
)

const typeChanged = computed(() => 
  formData.value.appointmentType !== props.appointment?.appointmentType
)

const reasonChanged = computed(() => 
  formData.value.reasonForVisit !== props.appointment?.reasonForVisit
)

const notesChanged = computed(() => 
  formData.value.notes !== (props.appointment?.notes || '')
)

const urgencyChanged = computed(() => 
  formData.value.urgency !== props.appointment?.urgency
)

const durationChanged = computed(() => 
  formData.value.duration !== props.appointment?.duration
)

const hasChanges = computed(() => {
  if (props.mode === 'reschedule') {
    return dateChanged.value || timeChanged.value || typeChanged.value || 
           reasonChanged.value || notesChanged.value || urgencyChanged.value || durationChanged.value
  } else {
    return typeChanged.value || reasonChanged.value || notesChanged.value || 
           urgencyChanged.value || durationChanged.value
  }
})

// Initialize form when appointment changes
watch(() => props.appointment, (newAppointment) => {
  if (newAppointment) {
    formData.value = {
      appointmentDate: newAppointment.appointmentDate,
      appointmentTime: newAppointment.appointmentTime,
      appointmentType: newAppointment.appointmentType,
      reasonForVisit: newAppointment.reasonForVisit || '',
      notes: newAppointment.notes || '',
      urgency: newAppointment.urgency || 'ROUTINE',
      duration: newAppointment.duration || 30
    }
  }
}, { immediate: true })

// Fetch available slots when date changes (only for reschedule mode)
const onDateChange = async () => {
  if (props.mode === 'reschedule' && formData.value.appointmentDate && props.appointment?.doctorId) {
    await fetchAvailableSlots()
  }
  
  // Clear selected time if date changes and it's different from current
  if (formData.value.appointmentDate !== props.appointment?.appointmentDate) {
    formData.value.appointmentTime = ''
  }
  
  clearError('appointmentDate')
}

const onAppointmentTypeChange = () => {
  // Re-fetch slots when appointment type changes
  if (props.mode === 'reschedule' && formData.value.appointmentDate && props.appointment?.doctorId) {
    fetchAvailableSlots()
  }
}

const fetchAvailableSlots = async () => {
  try {
    loadingSlots.value = true
    const slots = await appointmentStore.getAvailableSlots(
      props.appointment.doctorId,
      formData.value.appointmentDate
    )
    availableSlots.value = slots || []
  } catch (error) {
    console.error('Failed to fetch available slots:', error)
    availableSlots.value = []
    setError('appointmentDate', 'Unable to load available times for this date')
  } finally {
    loadingSlots.value = false
  }
}

const selectTimeSlot = (slot) => {
  formData.value.appointmentTime = slot
  clearError('appointmentTime')
  submitError.value = ''
  conflictSlots.value = []
}

const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    submitError.value = ''
    conflictSlots.value = []
    
    // Final validation
    validateForm()
    if (Object.keys(errors.value).length > 0) {
      return
    }

    // Prepare update data with only changed fields
    const updateData = {}
    
    if (props.mode === 'reschedule') {
      if (dateChanged.value) updateData.appointmentDate = formData.value.appointmentDate
      if (timeChanged.value) updateData.appointmentTime = formData.value.appointmentTime
    }
    
    if (typeChanged.value) updateData.appointmentType = formData.value.appointmentType
    if (reasonChanged.value) updateData.reasonForVisit = formData.value.reasonForVisit
    if (notesChanged.value) updateData.notes = formData.value.notes
    if (urgencyChanged.value) updateData.urgency = formData.value.urgency
    if (durationChanged.value) updateData.duration = formData.value.duration

    const result = await appointmentStore.updateAppointment(props.appointment.id, updateData)
    
    if (result.success) {
      emit('success', result.data)
      handleClose()
    } else {
      if (result.validationErrors) {
        errors.value = result.validationErrors
      } else if (result.availableSlots) {
        conflictSlots.value = result.availableSlots
        submitError.value = result.message || 'Selected time slot is no longer available'
      } else {
        submitError.value = result.message || 'Failed to update appointment'
      }
    }
  } catch (error) {
    console.error('Update error:', error)
    submitError.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const validateForm = () => {
  errors.value = {}
  
  if (props.mode === 'reschedule') {
    if (!formData.value.appointmentDate) {
      setError('appointmentDate', 'Please select an appointment date')
    }
    
    if (!formData.value.appointmentTime) {
      setError('appointmentTime', 'Please select an appointment time')
    }
  }
  
  if (!formData.value.reasonForVisit || formData.value.reasonForVisit.length < 10) {
    setError('reasonForVisit', 'Please provide a reason for visit (minimum 10 characters)')
  }
  
  if (formData.value.reasonForVisit.length > 500) {
    setError('reasonForVisit', 'Reason for visit must be 500 characters or less')
  }
  
  if (formData.value.notes.length > 1000) {
    setError('notes', 'Notes must be 1000 characters or less')
  }
}

const setError = (field, message) => {
  errors.value[field] = message
}

const clearError = (field) => {
  delete errors.value[field]
}

const handleClose = () => {
  // Reset form to original values
  if (props.appointment) {
    formData.value = {
      appointmentDate: props.appointment.appointmentDate,
      appointmentTime: props.appointment.appointmentTime,
      appointmentType: props.appointment.appointmentType,
      reasonForVisit: props.appointment.reasonForVisit || '',
      notes: props.appointment.notes || '',
      urgency: props.appointment.urgency || 'ROUTINE',
      duration: props.appointment.duration || 30
    }
  }
  
  errors.value = {}
  submitError.value = ''
  conflictSlots.value = []
  availableSlots.value = []
  
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
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
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

.current-appointment {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.current-appointment h4 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.appointment-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-row .label {
  font-weight: 500;
  color: var(--text-secondary);
}

.detail-row .value {
  color: var(--text-primary);
  font-weight: 500;
}

.detail-row .value.status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.detail-row .value.status.scheduled {
  background: var(--success-light);
  color: var(--success-color);
}

.detail-row .value.status.confirmed {
  background: var(--primary-light);
  color: var(--primary-color);
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.appointment-types {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.type-option {
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-option:hover {
  border-color: var(--primary-color);
}

.type-option.selected {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.type-option input {
  display: none;
}

.type-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.type-icon {
  font-size: 1.5rem;
}

.type-info {
  display: flex;
  flex-direction: column;
}

.type-name {
  font-weight: 600;
  color: var(--text-primary);
}

.type-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
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

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-group input.error,
.form-group textarea.error,
.form-group select.error {
  border-color: var(--error-color);
}

.loading-slots {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-slots {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-radius: 8px;
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
}

.time-slot {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.time-slot:hover:not(:disabled) {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.time-slot.selected {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.time-slot.current {
  border-color: var(--warning-color);
  background: var(--warning-light);
  color: var(--warning-dark);
}

.time-slot:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.current-label {
  display: block;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.error-message {
  display: block;
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.submit-error {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--error-light);
  border: 1px solid var(--error-color);
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.error-icon {
  font-size: 1.25rem;
}

.error-content {
  flex: 1;
}

.error-content p {
  margin: 0 0 0.75rem 0;
  color: var(--error-color);
  font-weight: 500;
}

.suggested-slots p {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
}

.conflict-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.conflict-slot {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--primary-color);
  background: white;
  color: var(--primary-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.conflict-slot:hover {
  background: var(--primary-color);
  color: white;
}

.changes-summary {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.changes-summary h4 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.change-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.change-item:last-child {
  border-bottom: none;
}

.change-label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.change-value {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.old-value {
  color: var(--text-secondary);
  text-decoration: line-through;
}

.arrow {
  color: var(--primary-color);
  font-weight: bold;
}

.new-value {
  color: var(--primary-color);
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.btn-secondary,
.btn-primary {
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

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-primary:disabled {
  background: var(--text-secondary);
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .time-slots {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
  
  .change-value {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
