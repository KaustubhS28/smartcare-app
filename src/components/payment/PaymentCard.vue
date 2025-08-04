<script setup>
import { computed } from 'vue'

const props = defineProps({
  paymentMethod: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['setDefault', 'delete', 'edit'])

const cardIcon = computed(() => {
  switch (props.paymentMethod.brand) {
    case 'visa':
      return '💳'
    case 'mastercard':
      return '💳'
    case 'american_express':
      return '💳'
    case 'discover':
      return '💳'
    default:
      return '💳'
  }
})

const formattedExpiry = computed(() => {
  const month = String(props.paymentMethod.expiryMonth).padStart(2, '0')
  const year = String(props.paymentMethod.expiryYear).slice(-2)
  return `${month}/${year}`
})

const cardTypeColor = computed(() => {
  switch (props.paymentMethod.brand) {
    case 'visa':
      return '#1a1f71'
    case 'mastercard':
      return '#eb001b'
    case 'american_express':
      return '#006fcf'
    case 'discover':
      return '#ff6000'
    default:
      return '#6b7280'
  }
})

const handleSetDefault = () => {
  emit('setDefault', props.paymentMethod.id)
}

const handleDelete = () => {
  emit('delete', props.paymentMethod.id)
}

const handleEdit = () => {
  emit('edit', props.paymentMethod.id)
}
</script>

<template>
  <div class="payment-card" :class="{ 'is-default': paymentMethod.isDefault }">
    <div class="card-header">
      <div class="card-brand">
        <span class="card-icon">{{ cardIcon }}</span>
        <span class="brand-name">{{ paymentMethod.brand.toUpperCase() }}</span>
      </div>
      <div v-if="paymentMethod.isDefault" class="default-badge">
        Default
      </div>
    </div>

    <div class="card-details">
      <div class="card-number">
        •••• •••• •••• {{ paymentMethod.last4 }}
      </div>
      <div class="card-info">
        <span class="expiry">{{ formattedExpiry }}</span>
        <span class="holder-name">{{ paymentMethod.holderName }}</span>
      </div>
    </div>

    <div v-if="showActions" class="card-actions">
      <button 
        v-if="!paymentMethod.isDefault"
        @click="handleSetDefault"
        class="action-btn set-default-btn"
      >
        Set as Default
      </button>
      <button 
        @click="handleEdit"
        class="action-btn edit-btn"
      >
        Edit
      </button>
      <button 
        @click="handleDelete"
        class="action-btn delete-btn"
        :disabled="paymentMethod.isDefault"
      >
        Remove
      </button>
    </div>
  </div>
</template>

<style scoped>
.payment-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 1.5rem;
  color: white;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.payment-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  pointer-events: none;
}

.payment-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

.payment-card.is-default {
  border: 2px solid #fbbf24;
  box-shadow: 0 8px 25px rgba(251, 191, 36, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-icon {
  font-size: 1.5rem;
}

.brand-name {
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

.default-badge {
  background: #fbbf24;
  color: #92400e;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.card-details {
  flex: 1;
}

.card-number {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 2px;
  margin-bottom: 1rem;
  font-family: 'Courier New', monospace;
}

.card-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.expiry {
  font-weight: 500;
}

.holder-name {
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.set-default-btn:hover {
  background: #fbbf24;
  color: #92400e;
}

.edit-btn:hover {
  background: #3b82f6;
}

.delete-btn:hover:not(:disabled) {
  background: #ef4444;
}

@media (max-width: 768px) {
  .payment-card {
    padding: 1.25rem;
    min-height: 180px;
  }
  
  .card-number {
    font-size: 1.1rem;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style> 