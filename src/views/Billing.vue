<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePaymentStore } from '../stores/payment'
import BillingHistory from '../components/payment/BillingHistory.vue'
import PaymentModal from '../components/payment/PaymentModal.vue'

const router = useRouter()
const paymentStore = usePaymentStore()

const showPaymentModal = ref(false)
const selectedInvoice = ref(null)
const isProcessingPayment = ref(false)

const stats = computed(() => ({
  totalBilled: paymentStore.totalBilled,
  totalPaid: paymentStore.totalPaid,
  pendingAmount: paymentStore.pendingAmount,
  pendingCount: paymentStore.billingHistory.filter(inv => inv.status === 'pending').length
}))

const recentInvoices = computed(() => {
  return paymentStore.billingHistory
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3)
})

const upcomingPayments = computed(() => {
  const pending = paymentStore.billingHistory.filter(inv => inv.status === 'pending')
  return pending.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handlePayInvoice = async (invoiceId) => {
  selectedInvoice.value = paymentStore.getInvoiceById(invoiceId)
  
  if (!paymentStore.defaultPaymentMethod) {
    // Redirect to payment methods if no default method
    router.push('/payment-methods')
    return
  }
  
  showPaymentModal.value = true
}

const handleQuickPayment = async (paymentData) => {
  isProcessingPayment.value = true
  
  try {
    await paymentStore.processPayment(
      selectedInvoice.value.id,
      paymentStore.defaultPaymentMethod.id
    )
    
    showPaymentModal.value = false
    selectedInvoice.value = null
    
    // Show success message (in real app, use a toast notification)
    alert('Payment processed successfully!')
  } catch (error) {
    console.error('Payment failed:', error)
    alert('Payment failed. Please try again.')
  } finally {
    isProcessingPayment.value = false
  }
}

const handleDownloadInvoice = (invoiceId) => {
  // Simulate invoice download
  const invoice = paymentStore.getInvoiceById(invoiceId)
  alert(`Downloading invoice ${invoice.invoiceNumber}...`)
}

const handleViewDetails = (invoiceId) => {
  // Navigate to invoice details (would implement in real app)
  alert('Invoice details feature coming soon!')
}

const goToPaymentMethods = () => {
  router.push('/payment-methods')
}

const goToFullBillingHistory = () => {
  // This would navigate to a full billing history page
  // For now, we'll just scroll to the billing history section
  document.querySelector('.billing-history-section')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  paymentStore.fetchBillingHistory()
})
</script>

<template>
  <div class="billing-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Billing & Payments</h1>
        <p>Manage your payments, view billing history, and track expenses</p>
      </div>
      <div class="header-actions">
        <button @click="goToPaymentMethods" class="btn-secondary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" stroke-width="2"/>
          </svg>
          Payment Methods
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total Billed</span>
            <span class="stat-value">{{ formatCurrency(stats.totalBilled) }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon paid">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total Paid</span>
            <span class="stat-value">{{ formatCurrency(stats.totalPaid) }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon pending">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Pending Amount</span>
            <span class="stat-value">{{ formatCurrency(stats.pendingAmount) }}</span>
            <span class="stat-meta">{{ stats.pendingCount }} invoice{{ stats.pendingCount !== 1 ? 's' : '' }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon payment-method">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Payment Methods</span>
            <span class="stat-value">{{ paymentStore.paymentMethods.length }}</span>
            <span v-if="paymentStore.defaultPaymentMethod" class="stat-meta">
              Default: •••• {{ paymentStore.defaultPaymentMethod.last4 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Upcoming Payments -->
      <div class="content-section">
        <div class="section-header">
          <h2>Upcoming Payments</h2>
          <button v-if="upcomingPayments.length > 3" @click="goToFullBillingHistory" class="view-all-btn">
            View All
          </button>
        </div>

        <div v-if="upcomingPayments.length > 0" class="upcoming-payments">
          <div v-for="invoice in upcomingPayments.slice(0, 3)" :key="invoice.id" class="payment-card">
            <div class="payment-info">
              <div class="payment-details">
                <h4>{{ invoice.description }}</h4>
                <p class="invoice-number">{{ invoice.invoiceNumber }}</p>
                <div class="payment-meta">
                  <span class="due-date">Due: {{ formatDate(invoice.dueDate) }}</span>
                  <span v-if="invoice.doctorName" class="doctor">{{ invoice.doctorName }}</span>
                </div>
              </div>
              <div class="payment-amount">
                <span class="amount">{{ formatCurrency(invoice.amount) }}</span>
                <span class="status-badge pending">Pending</span>
              </div>
            </div>
            <div class="payment-actions">
              <button @click="handlePayInvoice(invoice.id)" class="btn-primary">
                Pay Now
              </button>
              <button @click="handleViewDetails(invoice.id)" class="btn-secondary">
                View Details
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h3>All caught up!</h3>
          <p>You have no pending payments at the moment.</p>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="content-section">
        <div class="section-header">
          <h2>Recent Transactions</h2>
          <button @click="goToFullBillingHistory" class="view-all-btn">
            View All
          </button>
        </div>

        <div class="recent-transactions">
          <div v-for="invoice in recentInvoices" :key="invoice.id" class="transaction-item">
            <div class="transaction-icon">
              <svg v-if="invoice.status === 'paid'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="transaction-info">
              <h4>{{ invoice.description }}</h4>
              <p>{{ invoice.invoiceNumber }} • {{ formatDate(invoice.date) }}</p>
            </div>
            <div class="transaction-amount">
              <span class="amount">{{ formatCurrency(invoice.amount) }}</span>
              <span 
                class="status-badge" 
                :class="invoice.status"
              >
                {{ invoice.status === 'paid' ? 'Paid' : 'Pending' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Full Billing History -->
    <div class="billing-history-section">
      <div class="section-header">
        <h2>Billing History</h2>
      </div>
      
      <BillingHistory
        :invoices="paymentStore.billingHistory"
        :is-loading="paymentStore.isLoading"
        @pay-invoice="handlePayInvoice"
        @download-invoice="handleDownloadInvoice"
        @view-details="handleViewDetails"
      />
    </div>

    <!-- Payment Modal -->
    <PaymentModal
      v-if="selectedInvoice"
      :is-visible="showPaymentModal"
      :is-loading="isProcessingPayment"
      @close="showPaymentModal = false"
      @submit="handleQuickPayment"
    />
  </div>
</template>

<style scoped>
.billing-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
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
  font-size: 1rem;
}

.btn-secondary,
.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
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

.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.paid {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-icon.payment-method {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.stat-meta {
  font-size: 0.75rem;
  color: #9ca3af;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.content-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 600;
}

.view-all-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s ease;
}

.view-all-btn:hover {
  color: #2563eb;
}

.upcoming-payments {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.payment-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.payment-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.payment-details h4 {
  margin: 0 0 0.25rem 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
}

.invoice-number {
  margin: 0 0 0.5rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.payment-meta {
  font-size: 0.75rem;
  color: #9ca3af;
}

.payment-meta .doctor {
  margin-left: 0.5rem;
}

.payment-amount {
  text-align: right;
}

.amount {
  display: block;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.paid {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.payment-actions {
  display: flex;
  gap: 0.75rem;
}

.payment-actions .btn-primary,
.payment-actions .btn-secondary {
  flex: 1;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.recent-transactions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.transaction-item:hover {
  border-color: #e5e7eb;
  background: #f9fafb;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  color: #6b7280;
}

.transaction-info {
  flex: 1;
}

.transaction-info h4 {
  margin: 0 0 0.25rem 0;
  color: #111827;
  font-size: 0.875rem;
  font-weight: 600;
}

.transaction-info p {
  margin: 0;
  color: #6b7280;
  font-size: 0.75rem;
}

.transaction-amount {
  text-align: right;
}

.transaction-amount .amount {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1.125rem;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
}

.billing-history-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.billing-history-section .section-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
  margin-bottom: 0;
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .billing-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .payment-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .payment-amount {
    text-align: left;
  }
  
  .payment-actions {
    flex-direction: column;
  }
}
</style> 