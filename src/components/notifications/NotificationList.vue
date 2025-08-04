<script setup>
import { ref, computed } from 'vue'
import NotificationItem from './NotificationItem.vue'

const props = defineProps({
  notifications: {
    type: Array,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  maxItems: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['markAsRead', 'deleteNotification', 'markAllAsRead', 'viewMore'])

const filterType = ref('all')
const filterStatus = ref('all')

const typeOptions = [
  { value: 'all', label: 'All Types', icon: '📋' },
  { value: 'appointment', label: 'Appointments', icon: '📅' },
  { value: 'medication', label: 'Medications', icon: '💊' },
  { value: 'billing', label: 'Billing', icon: '💳' },
  { value: 'system', label: 'System', icon: '⚙️' }
]

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' }
]

const priorityOrder = { high: 3, medium: 2, low: 1 }

const filteredNotifications = computed(() => {
  let filtered = [...props.notifications]
  
  // Filter by type
  if (filterType.value !== 'all') {
    filtered = filtered.filter(notification => notification.type === filterType.value)
  }
  
  // Filter by status
  if (filterStatus.value !== 'all') {
    if (filterStatus.value === 'unread') {
      filtered = filtered.filter(notification => !notification.isRead)
    } else if (filterStatus.value === 'read') {
      filtered = filtered.filter(notification => notification.isRead)
    }
  }
  
  // Sort by priority and date
  filtered.sort((a, b) => {
    // First by read status (unread first)
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1
    }
    
    // Then by priority
    const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
    if (priorityDiff !== 0) {
      return priorityDiff
    }
    
    // Finally by date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
  
  // Limit items if maxItems is specified
  if (props.maxItems) {
    filtered = filtered.slice(0, props.maxItems)
  }
  
  return filtered
})

const unreadCount = computed(() => {
  return props.notifications.filter(n => !n.isRead).length
})

const hasMoreItems = computed(() => {
  return props.maxItems && props.notifications.length > props.maxItems
})

const getTypeIcon = (type) => {
  const typeOption = typeOptions.find(option => option.value === type)
  return typeOption?.icon || '📋'
}

const handleMarkAsRead = (notificationId) => {
  emit('markAsRead', notificationId)
}

const handleDeleteNotification = (notificationId) => {
  emit('deleteNotification', notificationId)
}

const handleMarkAllAsRead = () => {
  emit('markAllAsRead')
}

const handleViewMore = () => {
  emit('viewMore')
}

const getRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`
  
  return date.toLocaleDateString()
}
</script>

<template>
  <div class="notification-list">
    <!-- Header -->
    <div v-if="showHeader" class="list-header">
      <div class="header-info">
        <h3>Notifications</h3>
        <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
      </div>
      
      <div class="header-actions">
        <button
          v-if="unreadCount > 0"
          @click="handleMarkAllAsRead"
          class="mark-all-btn"
        >
          Mark all as read
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div v-if="showHeader" class="filters">
      <div class="filter-group">
        <label for="typeFilter">Type:</label>
        <select id="typeFilter" v-model="filterType">
          <option v-for="option in typeOptions" :key="option.value" :value="option.value">
            {{ option.icon }} {{ option.label }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="statusFilter">Status:</label>
        <select id="statusFilter" v-model="filterStatus">
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading notifications...</p>
    </div>

    <!-- Notifications list -->
    <div v-else-if="filteredNotifications.length > 0" class="notifications-container">
      <NotificationItem
        v-for="notification in filteredNotifications"
        :key="notification.id"
        :notification="notification"
        @markAsRead="handleMarkAsRead"
        @delete="handleDeleteNotification"
      />
      
      <!-- View more button -->
      <div v-if="hasMoreItems" class="view-more-container">
        <button @click="handleViewMore" class="view-more-btn">
          View All Notifications
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h3>No notifications</h3>
      <p>
        {{ filterType === 'all' && filterStatus === 'all'
          ? 'You\'re all caught up! No new notifications.'
          : 'No notifications match the selected filters.'
        }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.notification-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-info h3 {
  margin: 0;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 600;
}

.unread-badge {
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.mark-all-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mark-all-btn:hover {
  background: #2563eb;
}

.filters {
  display: flex;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.filter-group select {
  padding: 0.375rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  min-width: 120px;
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

.notifications-container {
  max-height: 600px;
  overflow-y: auto;
}

.view-more-container {
  padding: 1rem;
  text-align: center;
  border-top: 1px solid #e5e7eb;
}

.view-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-more-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #111827;
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
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
  max-width: 300px;
}

@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .filters {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
  
  .filter-group select {
    width: 100%;
    min-width: auto;
  }
  
  .notifications-container {
    max-height: 400px;
  }
}
</style> 