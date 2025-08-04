<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePaymentStore } from '../stores/payment'
import PaymentCard from '../components/payment/PaymentCard.vue'
import PaymentModal from '../components/payment/PaymentModal.vue'

const router = useRouter()
const paymentStore = usePaymentStore()

const showAddPaymentModal = ref(false)
const editingMethod = ref(null)
const confirmDelete = ref({ show: false, methodId: null })

const hasPaymentMethods = computed(() => {
  return paymentStore.paymentMethods.length > 0
})

const sortedPaymentMethods = computed(() => {
  return [...paymentStore.paymentMethods].sort((a, b) => {
    // Default method first
    if (a.isDefault && !b.isDefault) return -1
    if (!a.isDefault && b.isDefault) return 1
    
    // Then by creation date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
})

const handleAddPaymentMethod = async (paymentData) => {
  try {
    await paymentStore.addPaymentMethod(paymentData)
    showAddPaymentModal.value = false
    
    // Show success message
    alert('Payment method added successfully!')
  } catch (error) {
    console.error('Failed to add payment method:', error)
    alert('Failed to add payment method. Please try again.')
  }
}

const handleSetDefault = async (methodId) => {
  try {
    await paymentStore.setDefaultPaymentMethod(methodId)
    
    // Show success message
    alert('Default payment method updated!')
  } catch (error) {
    console.error('Failed to set default payment method:', error)
    alert('Failed to update default payment method. Please try again.')
  }
}

const handleEditPaymentMethod = (methodId) => {
  editingMethod.value = paymentStore.getPaymentMethodById(methodId)
  // In a real app, this would open an edit modal
  alert('Edit payment method feature coming soon!')
}

const handleDeletePaymentMethod = (methodId) => {
  const method = paymentStore.getPaymentMethodById(methodId)
  
  if (method.isDefault && paymentStore.paymentMethods.length > 1) {
    alert('Cannot delete the default payment method. Please set another method as default first.')
    return
  }
  
  confirmDelete.value = { show: true, methodId }
}

const confirmDeletePaymentMethod = async () => {
  try {
    await paymentStore.removePaymentMethod(confirmDelete.value.methodId)
    confirmDelete.value = { show: false, methodId: null }
    
    // Show success message
    alert('Payment method removed successfully!')
  } catch (error) {
    console.error('Failed to remove payment method:', error)
    alert('Failed to remove payment method. Please try again.')
  }
}

const cancelDelete = () => {
  confirmDelete.value = { show: false, methodId: null }
}

const goBack = () => {
  router.back()
}

const goToBilling = () => {
  router.push('/billing')
}

onMounted(() => {
  // Fetch payment methods if needed
  // paymentStore.fetchPaymentMethods()
})
</script>

<template>
  <div class="payment-methods-page">
    <!-- Page Header -->
    <div class="page-header">
      <button @click="goBack" class="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2"/>
        </svg>
        Back
      </button>
      
      <div class="header-content">
        <h1>Payment Methods</h1>
        <p>Manage your saved payment methods and billing preferences</p>
      </div>
      
      <div class="header-actions">
        <button @click="goToBilling" class="btn-secondary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
          </svg>
          View Billing
        </button>
      </div>
    </div>

    <!-- Payment Methods Grid -->
    <div v-if="hasPaymentMethods" class="payment-methods-section">
      <div class="section-header">
        <h2>Saved Payment Methods</h2>
        <button @click="showAddPaymentModal = true" class="btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2"/>
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2"/>
          </svg>
          Add Payment Method
        </button>
      </div>

      <div class="payment-methods-grid">
        <PaymentCard
          v-for="method in sortedPaymentMethods"
          :key="method.id"
          :payment-method="method"
          @set-default="handleSetDefault"
          @delete="handleDeletePaymentMethod"
          @edit="handleEditPaymentMethod"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="96" height="96" viewBox="0 0 24 24" fill="none">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
          <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h2>No Payment Methods</h2>
      <p>Add a payment method to start making payments quickly and securely.</p>
      <button @click="showAddPaymentModal = true" class="btn-primary large">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2"/>
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2"/>
        </svg>
        Add Your First Payment Method
      </button>
    </div>

    <!-- Security Notice -->
    <div class="security-notice">
      <div class="notice-content">
        <div class="notice-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="notice-text">
          <h3>Your payment information is secure</h3>
          <p>
            We use industry-standard encryption to protect your payment data. 
            Your card information is never stored on our servers and is processed 
            securely through our payment partners.
          </p>
        </div>
      </div>
      
      <div class="security-badges">
        <div class="badge">
          <span class="badge-text">SSL Encrypted</span>
        </div>
        <div class="badge">
          <span class="badge-text">PCI Compliant</span>
        </div>
        <div class="badge">
          <span class="badge-text">Bank-Level Security</span>
        </div>
      </div>
    </div>

    <!-- Payment Benefits -->
    <div v-if="hasPaymentMethods" class="benefits-section">
      <h3>Payment Method Benefits</h3>
      <div class="benefits-grid">
        <div class="benefit-card">
          <div class="benefit-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h4>Quick Payments</h4>
          <p>Pay your bills instantly with one click using your saved payment methods.</p>
        </div>
        
        <div class="benefit-card">
          <div class="benefit-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h4>Secure Storage</h4>
          <p>Your payment information is encrypted and stored securely with our payment partners.</p>
        </div>
        
        <div class="benefit-card">
          <div class="benefit-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h4>Auto-Pay Available</h4>
          <p>Set up automatic payments to never miss a due date and maintain good standing.</p>
        </div>
      </div>
    </div>

    <!-- Add Payment Method Modal -->
    <PaymentModal
      :is-visible="showAddPaymentModal"
      :is-loading="paymentStore.isLoading"
      @close="showAddPaymentModal = false"
      @submit="handleAddPaymentMethod"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="confirmDelete.show" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Remove Payment Method</h3>
        </div>
        
        <div class="modal-body">
          <div class="warning-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h4>Are you sure you want to remove this payment method?</h4>
          <p>This action cannot be undone. You can always add the payment method again later.</p>
        </div>
        
        <div class="modal-actions">
          <button @click="cancelDelete" class="btn-secondary">
            Cancel
          </button>
          <button @click="confirmDeletePaymentMethod" class="btn-danger">
            Remove Payment Method
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-methods-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #e5e7eb;
}

.header-content {
  flex: 1;
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 2rem;
  font-weight: 700;
}

.header-content p {
  margin: 0;
  color: #6b7280;
}

.btn-secondary,
.btn-primary,
.btn-danger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary.large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.payment-methods-section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  margin: 0;
  color: #111827;
  font-size: 1.5rem;
  font-weight: 600;
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border: 2px dashed #e5e7eb;
  border-radius: 16px;
  margin-bottom: 3rem;
}

.empty-icon {
  color: #d1d5db;
  margin-bottom: 1.5rem;
}

.empty-state h2 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1.5rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 2rem 0;
  color: #6b7280;
  font-size: 1.125rem;
  max-width: 400px;
}

.security-notice {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
}

.notice-content {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.notice-icon {
  color: #3b82f6;
  flex-shrink: 0;
}

.notice-text h3 {
  margin: 0 0 0.5rem 0;
  color: #1e40af;
  font-size: 1.125rem;
  font-weight: 600;
}

.notice-text p {
  margin: 0;
  color: #1e40af;
  line-height: 1.6;
}

.security-badges {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.badge {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid #bfdbfe;
  border-radius: 20px;
  padding: 0.5rem 1rem;
}

.badge-text {
  color: #1e40af;
  font-size: 0.875rem;
  font-weight: 600;
}

.benefits-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
}

.benefits-section h3 {
  margin: 0 0 2rem 0;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.benefit-card {
  text-align: center;
  padding: 1.5rem;
}

.benefit-icon {
  color: #3b82f6;
  margin-bottom: 1rem;
}

.benefit-card h4 {
  margin: 0 0 0.75rem 0;
  color: #111827;
  font-size: 1.125rem;
  font-weight: 600;
}

.benefit-card p {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
}

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

.modal-content.delete-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.modal-header h3 {
  margin: 0;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.warning-icon {
  color: #f59e0b;
  margin-bottom: 1rem;
}

.modal-body h4 {
  margin: 0 0 1rem 0;
  color: #111827;
  font-size: 1.125rem;
  font-weight: 600;
}

.modal-body p {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.modal-actions button {
  flex: 1;
  justify-content: center;
}

@media (max-width: 768px) {
  .payment-methods-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .payment-methods-grid {
    grid-template-columns: 1fr;
  }
  
  .notice-content {
    flex-direction: column;
    text-align: center;
  }
  
  .security-badges {
    justify-content: center;
  }
  
  .benefits-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style> 