<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['markAsRead', 'delete'])

const router = useRouter()

const typeIcons = {
  appointment: '📅',
  medication: '💊',
  billing: '💳',
  system: '⚙️',
  health: '❤️'
}

const priorityColors = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6b7280'
}

const typeIcon = computed(() => {
  return typeIcons[props.notification.type] || '📋'
})

const priorityColor = computed(() => {
  return priorityColors[props.notification.priority] || '#6b7280'
})

const formattedTime = computed(() => {
  const date = new Date(props.notification.createdAt)
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
})

const scheduledTime = computed(() => {
  if (!props.notification.scheduledFor) return null
  
  const scheduledDate = new Date(props.notification.scheduledFor)
  const now = new Date()
  
  // If scheduled for today, show time
  if (scheduledDate.toDateString() === now.toDateString()) {
    return `Today at ${scheduledDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`
  }
  
  // If scheduled for tomorrow
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  if (scheduledDate.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow at ${scheduledDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`
  }
  
  // Otherwise show full date
  return scheduledDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
})

const handleClick = () => {
  if (!props.notification.isRead) {
    emit('markAsRead', props.notification.id)
  }
  
  // Navigate to action URL if available
  if (props.notification.actionUrl) {
    router.push(props.notification.actionUrl)
  }
}

const handleMarkAsRead = (event) => {
  event.stopPropagation()
  emit('markAsRead', props.notification.id)
}

const handleDelete = (event) => {
  event.stopPropagation()
  emit('delete', props.notification.id)
}
</script>

<template>
  <div 
    class="notification-item" 
    :class="{ 
      'unread': !notification.isRead,
      'high-priority': notification.priority === 'high',
      'clickable': notification.actionUrl
    }"
    @click="handleClick"
  >
    <!-- Priority indicator -->
    <div 
      class="priority-indicator"
      :style="{ backgroundColor: priorityColor }"
    ></div>

    <!-- Content -->
    <div class="notification-content">
      <!-- Header -->
      <div class="notification-header">
        <div class="header-left">
          <span class="type-icon">{{ typeIcon }}</span>
          <span class="notification-type">{{ notification.type }}</span>
          <span v-if="!notification.isRead" class="unread-dot"></span>
        </div>
        <div class="header-right">
          <span class="timestamp">{{ formattedTime }}</span>
          <div class="actions">
            <button
              v-if="!notification.isRead"
              @click="handleMarkAsRead"
              class="action-btn mark-read-btn"
              title="Mark as read"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <button
              @click="handleDelete"
              class="action-btn delete-btn"
              title="Delete notification"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2"/>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="notification-body">
        <h4 class="notification-title">{{ notification.title }}</h4>
        <p class="notification-message">{{ notification.message }}</p>

        <!-- Scheduled time -->
        <div v-if="scheduledTime" class="scheduled-time">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
          </svg>
          {{ scheduledTime }}
        </div>

        <!-- Metadata -->
        <div v-if="notification.metadata && Object.keys(notification.metadata).length > 0" class="notification-metadata">
          <!-- Doctor name for appointments -->
          <span v-if="notification.metadata.doctorName" class="metadata-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
            {{ notification.metadata.doctorName }}
          </span>

          <!-- Medication info -->
          <span v-if="notification.metadata.medicationName" class="metadata-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <rect x="9" y="9" width="6" height="6" stroke="currentColor" stroke-width="2"/>
            </svg>
            {{ notification.metadata.medicationName }}
            <span v-if="notification.metadata.dosage"> - {{ notification.metadata.dosage }}</span>
          </span>

          <!-- Invoice info -->
          <span v-if="notification.metadata.invoiceNumber" class="metadata-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
            </svg>
            {{ notification.metadata.invoiceNumber }}
            <span v-if="notification.metadata.amount"> - ${{ notification.metadata.amount }}</span>
          </span>
        </div>
      </div>

      <!-- Action indicator -->
      <div v-if="notification.actionUrl" class="action-indicator">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-item {
  display: flex;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.3s ease;
  position: relative;
  background: white;
}

.notification-item:hover {
  background: #f9fafb;
}

.notification-item.clickable {
  cursor: pointer;
}

.notification-item.unread {
  background: #fefefe;
  border-left: 3px solid #3b82f6;
}

.notification-item.high-priority {
  border-left-color: #ef4444;
}

.priority-indicator {
  width: 4px;
  min-height: 100%;
  background: #e5e7eb;
}

.notification-content {
  flex: 1;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.type-icon {
  font-size: 1rem;
}

.notification-type {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.5px;
}

.unread-dot {
  width: 6px;
  height: 6px;
  background: #3b82f6;
  border-radius: 50%;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.timestamp {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.notification-item:hover .actions {
  opacity: 1;
}

.action-btn {
  padding: 0.25rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #6b7280;
}

.mark-read-btn:hover {
  background: #dbeafe;
  color: #3b82f6;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.notification-body {
  flex: 1;
}

.notification-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
}

.notification-message {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
}

.scheduled-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.notification-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #6b7280;
  background: #f8fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.action-indicator {
  align-self: center;
  color: #d1d5db;
  margin-left: auto;
}

.notification-item.clickable:hover .action-indicator {
  color: #9ca3af;
}

@media (max-width: 768px) {
  .notification-content {
    padding: 1rem;
  }
  
  .notification-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .actions {
    opacity: 1;
  }
  
  .notification-metadata {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .metadata-item {
    align-self: flex-start;
  }
}
</style> 