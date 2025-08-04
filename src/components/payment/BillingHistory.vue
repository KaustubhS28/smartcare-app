<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  invoices: {
    type: Array,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['payInvoice', 'downloadInvoice', 'viewDetails'])

const statusFilter = ref('all')
const sortBy = ref('date')
const sortOrder = ref('desc')

const statusOptions = [
  { value: 'all', label: 'All Invoices' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' }
]

const sortOptions = [
  { value: 'date', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'status', label: 'Status' }
]

const filteredInvoices = computed(() => {
  let filtered = [...props.invoices]
  
  // Filter by status
  if (statusFilter.value !== 'all') {
    if (statusFilter.value === 'overdue') {
      filtered = filtered.filter(invoice => {
        const dueDate = new Date(invoice.dueDate)
        const now = new Date()
        return invoice.status === 'pending' && dueDate < now
      })
    } else {
      filtered = filtered.filter(invoice => invoice.status === statusFilter.value)
    }
  }
  
  // Sort invoices
  filtered.sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy.value) {
      case 'date':
        aValue = new Date(a.date)
        bValue = new Date(b.date)
        break
      case 'amount':
        aValue = a.amount
        bValue = b.amount
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      default:
        aValue = new Date(a.date)
        bValue = new Date(b.date)
    }
    
    if (sortOrder.value === 'desc') {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0
    } else {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    }
  })
  
  return filtered
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const getStatusColor = (status, dueDate) => {
  if (status === 'paid') return 'success'
  if (status === 'pending') {
    const due = new Date(dueDate)
    const now = new Date()
    return due < now ? 'danger' : 'warning'
  }
  return 'secondary'
}

const getStatusText = (status, dueDate) => {
  if (status === 'paid') return 'Paid'
  if (status === 'pending') {
    const due = new Date(dueDate)
    const now = new Date()
    return due < now ? 'Overdue' : 'Pending'
  }
  return status
}

const handlePayInvoice = (invoice) => {
  emit('payInvoice', invoice.id)
}

const handleDownloadInvoice = (invoice) => {
  emit('downloadInvoice', invoice.id)
}

const handleViewDetails = (invoice) => {
  emit('viewDetails', invoice.id)
}

const toggleSort = (field) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'desc'
  }
}
</script>

<template>
  <div class="billing-history">
    <!-- Header with filters -->
    <div class="billing-header">
      <div class="filters">
        <div class="filter-group">
          <label for="statusFilter">Filter by Status:</label>
          <select id="statusFilter" v-model="statusFilter">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="sortBy">Sort by:</label>
          <select id="sortBy" v-model="sortBy">
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading billing history...</p>
    </div>

    <!-- Invoice list -->
    <div v-else-if="filteredInvoices.length > 0" class="invoice-list">
      <div v-for="invoice in filteredInvoices" :key="invoice.id" class="invoice-card">
        <div class="invoice-header">
          <div class="invoice-info">
            <h4 class="invoice-number">{{ invoice.invoiceNumber }}</h4>
            <p class="invoice-description">{{ invoice.description }}</p>
            <div class="invoice-meta">
              <span class="invoice-date">{{ formatDate(invoice.date) }}</span>
              <span v-if="invoice.doctorName" class="doctor-name">• {{ invoice.doctorName }}</span>
            </div>
          </div>
          
          <div class="invoice-amount">
            <span class="amount">{{ formatCurrency(invoice.amount) }}</span>
            <span 
              class="status-badge" 
              :class="`status-${getStatusColor(invoice.status, invoice.dueDate)}`"
            >
              {{ getStatusText(invoice.status, invoice.dueDate) }}
            </span>
          </div>
        </div>

        <div class="invoice-details">
          <div class="detail-row">
            <span class="label">Service Type:</span>
            <span class="value">{{ invoice.serviceType || 'Consultation' }}</span>
          </div>
          
          <div v-if="invoice.status === 'pending'" class="detail-row">
            <span class="label">Due Date:</span>
            <span class="value" :class="{ 'overdue': new Date(invoice.dueDate) < new Date() }">
              {{ formatDate(invoice.dueDate) }}
            </span>
          </div>
          
          <div v-if="invoice.paidDate" class="detail-row">
            <span class="label">Paid Date:</span>
            <span class="value">{{ formatDate(invoice.paidDate) }}</span>
          </div>
        </div>

        <div class="invoice-actions">
          <button 
            @click="handleViewDetails(invoice)"
            class="action-btn view-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            View Details
          </button>
          
          <button 
            @click="handleDownloadInvoice(invoice)"
            class="action-btn download-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2"/>
              <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            Download
          </button>
          
          <button 
            v-if="invoice.status === 'pending'"
            @click="handlePayInvoice(invoice)"
            class="action-btn pay-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" stroke-width="2"/>
            </svg>
            Pay Now
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
          <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h3>No invoices found</h3>
      <p>
        {{ statusFilter === 'all' 
          ? 'You don\'t have any invoices yet.' 
          : `No ${statusFilter} invoices found.` 
        }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.billing-history {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.billing-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.filters {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  min-width: 150px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.invoice-list {
  padding: 1rem;
}

.invoice-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.invoice-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.invoice-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}

.invoice-description {
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.invoice-meta {
  font-size: 0.875rem;
  color: #6b7280;
}

.doctor-name {
  font-weight: 500;
}

.invoice-amount {
  text-align: right;
}

.amount {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-success {
  background: #d1fae5;
  color: #065f46;
}

.status-warning {
  background: #fef3c7;
  color: #92400e;
}

.status-danger {
  background: #fee2e2;
  color: #991b1b;
}

.status-secondary {
  background: #f3f4f6;
  color: #374151;
}

.invoice-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-row .label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.detail-row .value {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
}

.detail-row .value.overdue {
  color: #dc2626;
  font-weight: 600;
}

.invoice-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.view-btn:hover {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #3b82f6;
}

.download-btn:hover {
  background: #f0fdf4;
  border-color: #10b981;
  color: #10b981;
}

.pay-btn {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.pay-btn:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
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

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filter-group select {
    min-width: 100%;
  }
  
  .invoice-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .invoice-amount {
    text-align: left;
  }
  
  .invoice-details {
    grid-template-columns: 1fr;
  }
  
  .invoice-actions {
    flex-direction: column;
  }
  
  .action-btn {
    justify-content: center;
  }
}
</style> 