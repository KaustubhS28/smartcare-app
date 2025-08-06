<template>
  <div v-if="isVisible" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Book Appointment</h3>
        <button @click="handleClose" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Doctor Info -->
        <div v-if="doctor" class="doctor-info">
          <div class="doctor-avatar">
            <img :src="doctor.avatar" :alt="doctor.name" />
          </div>
          <div class="doctor-details">
            <h4>{{ doctor.name }}</h4>
            <p>{{ doctor.specialization }}</p>
            <div class="consultation-fee">
              <span class="fee-amount">${{ doctor.consultationFee }}</span>
              <span class="fee-label">consultation fee</span>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="booking-form">
          <!-- Appointment Type -->
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

          <!-- Date Selection -->
          <div class="form-section">
            <h4>Select Date</h4>
            <div class="date-selector">
              <input
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
          </div>

          <!-- Time Selection -->
          <div v-if="formData.appointmentDate" class="form-section">
            <h4>Available Times</h4>
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
                :class="{ selected: formData.appointmentTime === slot }"
                @click="selectTimeSlot(slot)"
                class="time-slot"
              >
                {{ formatTime(slot) }}
              </button>
            </div>
            <span v-if="errors.appointmentTime" class="error-message">
              {{ errors.appointmentTime }}
            </span>
          </div>

          <!-- Appointment Details -->
          <div class="form-section">
            <h4>Appointment Details</h4>
            
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
              <label for="notes">Additional Notes (Optional)</label>
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

          <!-- Summary -->
          <div v-if="isFormValid" class="booking-summary">
            <h4>Appointment Summary</h4>
            <div class="summary-item">
              <span class="label">Doctor:</span>
              <span class="value">{{ doctor?.name }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Date:</span>
              <span class="value">{{ formatDate(formData.appointmentDate) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Time:</span>
              <span class="value">{{ formatTime(formData.appointmentTime) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Type:</span>
              <span class="value">{{ getAppointmentTypeName(formData.appointmentType) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Duration:</span>
              <span class="value">{{ formData.duration }} minutes</span>
            </div>
            <div class="summary-item total">
              <span class="label">Total Cost:</span>
              <span class="value">${{ doctor?.consultationFee }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <button type="button" @click="handleClose" class="btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="!isFormValid || isSubmitting"
              class="btn-primary"
            >
              <span v-if="isSubmitting">Booking...</span>
              <span v-else>Book Appointment</span>
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
  doctor: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

const appointmentStore = useAppointmentStore()

// Form data
const formData = ref({
  doctorId: '',
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
  maxBooking.setDate(maxBooking.getDate() + 60) // 60 days ahead
  return maxBooking.toISOString().split('T')[0]
})

// Form validation
const isFormValid = computed(() => {
  return formData.value.doctorId &&
         formData.value.appointmentDate &&
         formData.value.appointmentTime &&
         formData.value.appointmentType &&
         formData.value.reasonForVisit &&
         formData.value.reasonForVisit.length >= 10 &&
         Object.keys(errors.value).length === 0
})

// Initialize form when doctor changes
watch(() => props.doctor, (newDoctor) => {
  if (newDoctor) {
    formData.value.doctorId = newDoctor.id
  }
}, { immediate: true })

// Fetch available slots when date changes
const onDateChange = async () => {
  if (formData.value.appointmentDate && formData.value.doctorId) {
    await fetchAvailableSlots()
  }
  
  // Clear selected time if date changes
  formData.value.appointmentTime = ''
  clearError('appointmentDate')
}

const onAppointmentTypeChange = () => {
  // Re-fetch slots when appointment type changes (different types might have different availability)
  if (formData.value.appointmentDate && formData.value.doctorId) {
    fetchAvailableSlots()
  }
}

const fetchAvailableSlots = async () => {
  try {
    loadingSlots.value = true
    const slots = await appointmentStore.getAvailableSlots(
      formData.value.doctorId,
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

    const result = await appointmentStore.createAppointment(formData.value)
    
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
        submitError.value = result.message || 'Failed to book appointment'
      }
    }
  } catch (error) {
    console.error('Booking error:', error)
    submitError.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.appointmentDate) {
    setError('appointmentDate', 'Please select an appointment date')
  }
  
  if (!formData.value.appointmentTime) {
    setError('appointmentTime', 'Please select an appointment time')
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
  // Reset form
  formData.value = {
    doctorId: props.doctor?.id || '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'IN_PERSON',
    reasonForVisit: '',
    notes: '',
    urgency: 'ROUTINE',
    duration: 30
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

const getAppointmentTypeName = (type) => {
  const typeObj = appointmentTypes.find(t => t.value === type)
  return typeObj ? typeObj.name : type
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

.doctor-info {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  margin-bottom: 2rem;
}

.doctor-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.doctor-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.doctor-details p {
  margin: 0 0 0.5rem 0;
  color: var(--text-secondary);
}

.consultation-fee {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.fee-amount {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
}

.fee-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
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

.date-selector input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.date-selector input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.date-selector input.error {
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
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
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
}

.time-slot:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.time-slot.selected {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
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

.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s ease;
  resize: vertical;
}

.form-group textarea {
  min-height: 100px;
}

.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-group textarea.error,
.form-group select.error {
  border-color: var(--error-color);
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

.booking-summary {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.booking-summary h4 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.total {
  padding-top: 1rem;
  margin-top: 0.5rem;
  border-top: 2px solid var(--border-color);
  font-weight: 600;
  font-size: 1.125rem;
}

.summary-item .label {
  color: var(--text-secondary);
}

.summary-item .value {
  color: var(--text-primary);
  font-weight: 500;
}

.summary-item.total .value {
  color: var(--primary-color);
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
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}
</style>
