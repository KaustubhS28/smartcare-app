import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const usePaymentStore = defineStore('payment', () => {
  const paymentMethods = ref([
    {
      id: 1,
      type: 'credit_card',
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2026,
      isDefault: true,
      holderName: 'Sarah Johnson',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      type: 'credit_card',
      brand: 'mastercard',
      last4: '8888',
      expiryMonth: 10,
      expiryYear: 2025,
      isDefault: false,
      holderName: 'Sarah Johnson',
      createdAt: '2023-12-15T00:00:00Z'
    }
  ])

  const billingHistory = ref([
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      amount: 150.00,
      status: 'paid',
      description: 'Dr. Emily Rodriguez - Cardiology Consultation',
      date: '2024-01-15T10:30:00Z',
      dueDate: '2024-01-30T23:59:59Z',
      paidDate: '2024-01-16T14:22:00Z',
      paymentMethodId: 1,
      doctorName: 'Dr. Emily Rodriguez',
      serviceType: 'consultation'
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002', 
      amount: 200.00,
      status: 'paid',
      description: 'Dr. Michael Chen - Dermatology Consultation',
      date: '2024-01-12T14:00:00Z',
      dueDate: '2024-01-27T23:59:59Z',
      paidDate: '2024-01-13T09:15:00Z',
      paymentMethodId: 1,
      doctorName: 'Dr. Michael Chen',
      serviceType: 'consultation'
    },
    {
      id: 3,
      invoiceNumber: 'INV-2024-003',
      amount: 75.00,
      status: 'pending',
      description: 'Health Monitoring Service - Monthly Subscription',
      date: '2024-01-20T00:00:00Z',
      dueDate: '2024-02-05T23:59:59Z',
      paidDate: null,
      paymentMethodId: null,
      doctorName: null,
      serviceType: 'subscription'
    },
    {
      id: 4,
      invoiceNumber: 'INV-2023-045',
      amount: 250.00,
      status: 'paid',
      description: 'Dr. Sarah Williams - Annual Physical Exam',
      date: '2023-12-20T11:00:00Z',
      dueDate: '2024-01-05T23:59:59Z',
      paidDate: '2023-12-21T16:30:00Z',
      paymentMethodId: 2,
      doctorName: 'Dr. Sarah Williams',
      serviceType: 'examination'
    }
  ])

  const currentTransaction = ref(null)
  const isProcessingPayment = ref(false)
  const isLoading = ref(false)

  // Computed properties
  const defaultPaymentMethod = computed(() => {
    return paymentMethods.value.find(method => method.isDefault)
  })

  const totalBilled = computed(() => {
    return billingHistory.value.reduce((total, invoice) => total + invoice.amount, 0)
  })

  const totalPaid = computed(() => {
    return billingHistory.value
      .filter(invoice => invoice.status === 'paid')
      .reduce((total, invoice) => total + invoice.amount, 0)
  })

  const pendingAmount = computed(() => {
    return billingHistory.value
      .filter(invoice => invoice.status === 'pending')
      .reduce((total, invoice) => total + invoice.amount, 0)
  })

  const recentTransactions = computed(() => {
    return billingHistory.value
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
  })

  // Actions
  async function addPaymentMethod(paymentData) {
    isLoading.value = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newMethod = {
        id: Date.now(),
        type: 'credit_card',
        brand: paymentData.brand || 'visa',
        last4: paymentData.cardNumber.slice(-4),
        expiryMonth: parseInt(paymentData.expiryMonth),
        expiryYear: parseInt(paymentData.expiryYear),
        isDefault: paymentMethods.value.length === 0,
        holderName: paymentData.holderName,
        createdAt: new Date().toISOString()
      }
      
      paymentMethods.value.push(newMethod)
      return newMethod
    } catch (error) {
      console.error('Error adding payment method:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function removePaymentMethod(methodId) {
    isLoading.value = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const index = paymentMethods.value.findIndex(method => method.id === methodId)
      if (index > -1) {
        const removedMethod = paymentMethods.value[index]
        paymentMethods.value.splice(index, 1)
        
        // If we removed the default method, set another as default
        if (removedMethod.isDefault && paymentMethods.value.length > 0) {
          paymentMethods.value[0].isDefault = true
        }
      }
    } catch (error) {
      console.error('Error removing payment method:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function setDefaultPaymentMethod(methodId) {
    isLoading.value = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      paymentMethods.value.forEach(method => {
        method.isDefault = method.id === methodId
      })
    } catch (error) {
      console.error('Error setting default payment method:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function processPayment(invoiceId, paymentMethodId = null) {
    isProcessingPayment.value = true
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const invoice = billingHistory.value.find(inv => inv.id === invoiceId)
      if (invoice) {
        invoice.status = 'paid'
        invoice.paidDate = new Date().toISOString()
        invoice.paymentMethodId = paymentMethodId || defaultPaymentMethod.value?.id
      }
      
      return { success: true, transactionId: `txn_${Date.now()}` }
    } catch (error) {
      console.error('Error processing payment:', error)
      throw error
    } finally {
      isProcessingPayment.value = false
    }
  }

  async function fetchBillingHistory() {
    isLoading.value = true
    
    try {
      // Simulate API call - in real implementation this would fetch from backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Data is already loaded in the mock implementation
    } catch (error) {
      console.error('Error fetching billing history:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function generateInvoice(serviceData) {
    isLoading.value = true
    
    try {
      // Simulate invoice generation
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      const newInvoice = {
        id: Date.now(),
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(billingHistory.value.length + 1).padStart(3, '0')}`,
        amount: serviceData.amount,
        status: 'pending',
        description: serviceData.description,
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
        paidDate: null,
        paymentMethodId: null,
        doctorName: serviceData.doctorName,
        serviceType: serviceData.serviceType
      }
      
      billingHistory.value.unshift(newInvoice)
      return newInvoice
    } catch (error) {
      console.error('Error generating invoice:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function getInvoiceById(invoiceId) {
    return billingHistory.value.find(invoice => invoice.id === invoiceId)
  }

  function getPaymentMethodById(methodId) {
    return paymentMethods.value.find(method => method.id === methodId)
  }

  return {
    // State
    paymentMethods,
    billingHistory,
    currentTransaction,
    isProcessingPayment,
    isLoading,
    
    // Computed
    defaultPaymentMethod,
    totalBilled,
    totalPaid,
    pendingAmount,
    recentTransactions,
    
    // Actions
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    processPayment,
    fetchBillingHistory,
    generateInvoice,
    getInvoiceById,
    getPaymentMethodById
  }
}) 