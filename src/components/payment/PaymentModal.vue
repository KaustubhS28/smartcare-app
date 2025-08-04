<script setup>
import { ref, computed, reactive, watch } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const formData = reactive({
  holderName: '',
  cardNumber: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
  billingAddress: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  }
})

const errors = ref({})

const cardNumberFormatted = computed({
  get: () => formData.cardNumber,
  set: (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    // Format with spaces every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ')
    formData.cardNumber = formatted.slice(0, 19) // Max 16 digits + 3 spaces
  }
})

const cardBrand = computed(() => {
  const number = formData.cardNumber.replace(/\s/g, '')
  if (number.startsWith('4')) return 'visa'
  if (number.startsWith('5') || number.startsWith('2')) return 'mastercard'
  if (number.startsWith('3')) return 'american_express'
  if (number.startsWith('6')) return 'discover'
  return 'unknown'
})

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 15 }, (_, i) => currentYear + i)
const months = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1
  return { value: month.toString().padStart(2, '0'), label: month.toString().padStart(2, '0') }
})

const validateForm = () => {
  const newErrors = {}
  
  if (!formData.holderName.trim()) {
    newErrors.holderName = 'Cardholder name is required'
  }
  
  const cardNumber = formData.cardNumber.replace(/\s/g, '')
  if (!cardNumber) {
    newErrors.cardNumber = 'Card number is required'
  } else if (cardNumber.length < 15 || cardNumber.length > 16) {
    newErrors.cardNumber = 'Invalid card number'
  }
  
  if (!formData.expiryMonth) {
    newErrors.expiryMonth = 'Expiry month is required'
  }
  
  if (!formData.expiryYear) {
    newErrors.expiryYear = 'Expiry year is required'
  } else {
    const selectedYear = parseInt(formData.expiryYear)
    const selectedMonth = parseInt(formData.expiryMonth)
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    
    if (selectedYear === currentYear && selectedMonth < currentMonth) {
      newErrors.expiryMonth = 'Card has expired'
    }
  }
  
  if (!formData.cvv) {
    newErrors.cvv = 'CVV is required'
  } else if (formData.cvv.length < 3 || formData.cvv.length > 4) {
    newErrors.cvv = 'Invalid CVV'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleSubmit = () => {
  if (validateForm()) {
    const submitData = {
      ...formData,
      cardNumber: formData.cardNumber.replace(/\s/g, ''),
      brand: cardBrand.value
    }
    emit('submit', submitData)
  }
}

const handleClose = () => {
  // Reset form
  Object.assign(formData, {
    holderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  })
  errors.value = {}
  emit('close')
}

// Format CVV input
watch(() => formData.cvv, (newValue) => {
  formData.cvv = newValue.replace(/\D/g, '').slice(0, 4)
})

// Format expiry month
watch(() => formData.expiryMonth, (newValue) => {
  formData.expiryMonth = newValue.replace(/\D/g, '').slice(0, 2)
})
</script>

<template>
  <div v-if="isVisible" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Add Payment Method</h3>
        <button @click="handleClose" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="payment-form">
        <!-- Card Preview -->
        <div class="card-preview">
          <div class="preview-card" :class="`brand-${cardBrand}`">
            <div class="card-brand-icon">
              <span v-if="cardBrand === 'visa'">VISA</span>
              <span v-else-if="cardBrand === 'mastercard'">MC</span>
              <span v-else-if="cardBrand === 'american_express'">AMEX</span>
              <span v-else-if="cardBrand === 'discover'">DISC</span>
              <span v-else>CARD</span>
            </div>
            <div class="preview-number">
              {{ formData.cardNumber || '•••• •••• •••• ••••' }}
            </div>
            <div class="preview-details">
              <span class="preview-name">{{ formData.holderName || 'CARDHOLDER NAME' }}</span>
              <span class="preview-expiry">{{ formData.expiryMonth && formData.expiryYear ? `${formData.expiryMonth}/${formData.expiryYear.slice(-2)}` : 'MM/YY' }}</span>
            </div>
          </div>
        </div>

        <!-- Form Fields -->
        <div class="form-row">
          <div class="form-group full-width">
            <label for="holderName">Cardholder Name</label>
            <input
              id="holderName"
              v-model="formData.holderName"
              type="text"
              placeholder="John Doe"
              :class="{ error: errors.holderName }"
            />
            <span v-if="errors.holderName" class="error-message">{{ errors.holderName }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label for="cardNumber">Card Number</label>
            <input
              id="cardNumber"
              v-model="cardNumberFormatted"
              type="text"
              placeholder="1234 5678 9012 3456"
              :class="{ error: errors.cardNumber }"
            />
            <span v-if="errors.cardNumber" class="error-message">{{ errors.cardNumber }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="expiryMonth">Expiry Month</label>
            <select
              id="expiryMonth"
              v-model="formData.expiryMonth"
              :class="{ error: errors.expiryMonth }"
            >
              <option value="">MM</option>
              <option v-for="month in months" :key="month.value" :value="month.value">
                {{ month.label }}
              </option>
            </select>
            <span v-if="errors.expiryMonth" class="error-message">{{ errors.expiryMonth }}</span>
          </div>

          <div class="form-group">
            <label for="expiryYear">Expiry Year</label>
            <select
              id="expiryYear"
              v-model="formData.expiryYear"
              :class="{ error: errors.expiryYear }"
            >
              <option value="">YYYY</option>
              <option v-for="year in years" :key="year" :value="year.toString()">
                {{ year }}
              </option>
            </select>
            <span v-if="errors.expiryYear" class="error-message">{{ errors.expiryYear }}</span>
          </div>

          <div class="form-group">
            <label for="cvv">CVV</label>
            <input
              id="cvv"
              v-model="formData.cvv"
              type="text"
              placeholder="123"
              :class="{ error: errors.cvv }"
              maxlength="4"
            />
            <span v-if="errors.cvv" class="error-message">{{ errors.cvv }}</span>
          </div>
        </div>

        <!-- Billing Address (Optional) -->
        <div class="billing-section">
          <h4>Billing Address (Optional)</h4>
          
          <div class="form-row">
            <div class="form-group full-width">
              <label for="street">Street Address</label>
              <input
                id="street"
                v-model="formData.billingAddress.street"
                type="text"
                placeholder="123 Main Street"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="city">City</label>
              <input
                id="city"
                v-model="formData.billingAddress.city"
                type="text"
                placeholder="New York"
              />
            </div>

            <div class="form-group">
              <label for="state">State</label>
              <input
                id="state"
                v-model="formData.billingAddress.state"
                type="text"
                placeholder="NY"
              />
            </div>

            <div class="form-group">
              <label for="zipCode">ZIP Code</label>
              <input
                id="zipCode"
                v-model="formData.billingAddress.zipCode"
                type="text"
                placeholder="10001"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button type="button" @click="handleClose" class="btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn-primary" :disabled="isLoading">
            <span v-if="isLoading">Adding...</span>
            <span v-else>Add Payment Method</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

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
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  color: #6b7280;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.payment-form {
  padding: 1.5rem;
}

.card-preview {
  margin-bottom: 2rem;
}

.preview-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  color: white;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.preview-card.brand-visa {
  background: linear-gradient(135deg, #1a1f71 0%, #667eea 100%);
}

.preview-card.brand-mastercard {
  background: linear-gradient(135deg, #eb001b 0%, #ff5f00 100%);
}

.preview-card.brand-american_express {
  background: linear-gradient(135deg, #006fcf 0%, #00a9e0 100%);
}

.preview-card.brand-discover {
  background: linear-gradient(135deg, #ff6000 0%, #ffb300 100%);
}

.card-brand-icon {
  text-align: right;
  font-weight: bold;
  font-size: 0.9rem;
}

.preview-number {
  font-size: 1.2rem;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  margin: 1rem 0;
}

.preview-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-name {
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
}

.preview-expiry {
  font-size: 0.9rem;
  font-weight: 500;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  flex: 1 1 100%;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input.error,
.form-group select.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.billing-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.billing-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary,
.btn-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .form-group {
    margin-bottom: 1rem;
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