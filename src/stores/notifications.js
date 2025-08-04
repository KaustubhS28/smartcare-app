import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([
    {
      id: 1,
      type: 'appointment',
      title: 'Upcoming Appointment Reminder',
      message: 'You have an appointment with Dr. Emily Rodriguez tomorrow at 2:00 PM',
      isRead: false,
      priority: 'high',
      createdAt: '2024-01-20T09:00:00Z',
      scheduledFor: '2024-01-21T14:00:00Z',
      actionUrl: '/appointments',
      metadata: {
        doctorName: 'Dr. Emily Rodriguez',
        appointmentId: 1
      }
    },
    {
      id: 2,
      type: 'medication',
      title: 'Medication Reminder',
      message: 'Time to take your Lisinopril (10mg)',
      isRead: false,
      priority: 'medium',
      createdAt: '2024-01-20T08:00:00Z',
      scheduledFor: '2024-01-20T08:00:00Z',
      actionUrl: '/medications',
      metadata: {
        medicationName: 'Lisinopril',
        dosage: '10mg',
        medicationId: 1
      }
    },
    {
      id: 3,
      type: 'billing',
      title: 'Payment Due',
      message: 'Your invoice INV-2024-003 of $75.00 is due in 5 days',
      isRead: true,
      priority: 'medium',
      createdAt: '2024-01-18T10:00:00Z',
      scheduledFor: null,
      actionUrl: '/billing',
      metadata: {
        invoiceNumber: 'INV-2024-003',
        amount: 75.00,
        dueDate: '2024-02-05T23:59:59Z'
      }
    },
    {
      id: 4,
      type: 'system',
      title: 'Health Score Updated',
      message: 'Your health score has been updated to 92. Great job maintaining your health!',
      isRead: true,
      priority: 'low',
      createdAt: '2024-01-17T15:30:00Z',
      scheduledFor: null,
      actionUrl: '/dashboard',
      metadata: {
        previousScore: 89,
        newScore: 92
      }
    },
    {
      id: 5,
      type: 'appointment',
      title: 'Appointment Confirmed',
      message: 'Your appointment with Dr. Michael Chen has been confirmed for January 25th at 10:00 AM',
      isRead: true,
      priority: 'medium',
      createdAt: '2024-01-15T11:20:00Z',
      scheduledFor: null,
      actionUrl: '/appointments',
      metadata: {
        doctorName: 'Dr. Michael Chen',
        appointmentDate: '2024-01-25T10:00:00Z',
        appointmentId: 2
      }
    }
  ])

  const settings = ref({
    email: {
      enabled: true,
      appointments: true,
      medications: true,
      billing: true,
      healthUpdates: false,
      marketing: false,
      reminders: true
    },
    push: {
      enabled: true,
      appointments: true,
      medications: true,
      billing: false,
      healthUpdates: true,
      emergencies: true,
      reminders: true
    },
    sms: {
      enabled: false,
      appointments: false,
      medications: true,
      billing: false,
      emergencies: true,
      reminders: false
    },
    preferences: {
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '07:00'
      },
      frequency: {
        medications: 'every_dose', // every_dose, daily, weekly
        appointments: '24_hours', // immediate, 1_hour, 24_hours, week_before
        healthUpdates: 'weekly' // daily, weekly, monthly
      },
      language: 'en',
      timezone: 'America/New_York'
    }
  })

  const isLoading = ref(false)

  // Computed properties
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.isRead).length
  })

  const recentNotifications = computed(() => {
    return notifications.value
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  })

  const notificationsByType = computed(() => {
    const grouped = {}
    notifications.value.forEach(notification => {
      if (!grouped[notification.type]) {
        grouped[notification.type] = []
      }
      grouped[notification.type].push(notification)
    })
    return grouped
  })

  const urgentNotifications = computed(() => {
    return notifications.value.filter(n => 
      n.priority === 'high' && !n.isRead
    )
  })

  const isNotificationTypeEnabled = computed(() => {
    return (type, channel) => {
      return settings.value[channel]?.enabled && settings.value[channel]?.[type]
    }
  })

  // Actions
  async function fetchNotifications() {
    isLoading.value = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      // Data is already loaded in mock implementation
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function markAsRead(notificationId) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.isRead = true
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  async function markAllAsRead() {
    isLoading.value = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      notifications.value.forEach(notification => {
        notification.isRead = true
      })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function deleteNotification(notificationId) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index > -1) {
        notifications.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  }

  async function updateSettings(newSettings) {
    isLoading.value = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Deep merge settings
      Object.keys(newSettings).forEach(key => {
        if (typeof newSettings[key] === 'object' && newSettings[key] !== null) {
          settings.value[key] = { ...settings.value[key], ...newSettings[key] }
        } else {
          settings.value[key] = newSettings[key]
        }
      })
    } catch (error) {
      console.error('Error updating notification settings:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function createNotification(notificationData) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const newNotification = {
        id: Date.now(),
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        isRead: false,
        priority: notificationData.priority || 'medium',
        createdAt: new Date().toISOString(),
        scheduledFor: notificationData.scheduledFor || null,
        actionUrl: notificationData.actionUrl || null,
        metadata: notificationData.metadata || {}
      }
      
      notifications.value.unshift(newNotification)
      return newNotification
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  function getNotificationById(notificationId) {
    return notifications.value.find(n => n.id === notificationId)
  }

  function getNotificationsByType(type) {
    return notifications.value.filter(n => n.type === type)
  }

  async function testNotification(type, channel) {
    // Create a test notification
    const testData = {
      type: 'system',
      title: `Test ${channel.toUpperCase()} Notification`,
      message: `This is a test ${type} notification sent via ${channel}`,
      priority: 'low',
      actionUrl: '/settings'
    }
    
    await createNotification(testData)
    
    // In real implementation, this would trigger the actual notification service
    console.log(`Test notification sent via ${channel} for ${type}`)
  }

  return {
    // State
    notifications,
    settings,
    isLoading,
    
    // Computed
    unreadCount,
    recentNotifications,
    notificationsByType,
    urgentNotifications,
    isNotificationTypeEnabled,
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings,
    createNotification,
    getNotificationById,
    getNotificationsByType,
    testNotification
  }
}) 