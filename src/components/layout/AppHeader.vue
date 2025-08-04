<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notifications'
import NotificationList from '../notifications/NotificationList.vue'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const showProfileMenu = ref(false)
const showNotifications = ref(false)

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
  showNotifications.value = false
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showProfileMenu.value = false
}

const closeDropdowns = () => {
  showProfileMenu.value = false
  showNotifications.value = false
}

const handleLogout = () => {
  try {
    authStore.logout()
    showProfileMenu.value = false
    
    // Force navigation to login and ensure clean state
    router.push({ name: 'login' }).then(() => {
      // Ensure we're properly on the login page
      console.log('Successfully logged out and redirected to login')
    })
  } catch (error) {
    console.error('Logout error:', error)
    // Force redirect even if there's an error
    router.push({ name: 'login' })
  }
}

const handleNotificationMarkAsRead = async (notificationId) => {
  await notificationStore.markAsRead(notificationId)
}

const handleNotificationDelete = async (notificationId) => {
  await notificationStore.deleteNotification(notificationId)
}

const handleMarkAllAsRead = async () => {
  await notificationStore.markAllAsRead()
}

const handleViewAllNotifications = () => {
  showNotifications.value = false
  router.push({ name: 'settings' })
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.user-profile') && !e.target.closest('.notifications')) {
    closeDropdowns()
  }
})

onMounted(() => {
  notificationStore.fetchNotifications()
})
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <div class="brand">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#3b82f6"/>
            <circle cx="12" cy="12" r="3" fill="#10b981"/>
          </svg>
        </div>
        <h1 class="brand-text">SmartCare</h1>
      </div>

      <div class="header-actions">
        <div class="search-bar">
          <input 
            type="text" 
            placeholder="Search doctors, appointments..."
            class="search-input"
          />
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>

        <div class="notifications">
          <button @click="toggleNotifications" class="notification-btn" :class="{ active: showNotifications }">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span v-if="notificationStore.unreadCount > 0" class="notification-badge">
              {{ notificationStore.unreadCount }}
            </span>
          </button>

          <!-- Notifications Dropdown -->
          <div v-if="showNotifications" class="notifications-dropdown">
            <div class="dropdown-header">
              <h3>Notifications</h3>
              <div class="dropdown-actions">
                <button
                  v-if="notificationStore.unreadCount > 0"
                  @click="handleMarkAllAsRead"
                  class="mark-all-btn"
                >
                  Mark all as read
                </button>
                <button @click="handleViewAllNotifications" class="view-all-btn">
                  View all
                </button>
              </div>
            </div>
            
            <NotificationList
              :notifications="notificationStore.recentNotifications"
              :is-loading="notificationStore.isLoading"
              :show-header="false"
              :max-items="5"
              @mark-as-read="handleNotificationMarkAsRead"
              @delete-notification="handleNotificationDelete"
              @view-more="handleViewAllNotifications"
            />
          </div>
        </div>

        <div class="user-profile" @click="toggleProfileMenu">
          <img :src="authStore.user?.avatar || '/api/placeholder/40/40'" :alt="authStore.user?.name || 'User'" class="user-avatar" />
          <span class="user-name">{{ authStore.user?.name || 'User' }}</span>
          <svg class="dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2"/>
          </svg>
          
          <div v-if="showProfileMenu" class="profile-dropdown">
            <div class="dropdown-header">
              <div class="user-info">
                <img :src="authStore.user?.avatar || '/api/placeholder/50/50'" :alt="authStore.user?.name" class="dropdown-avatar" />
                <div class="user-details">
                  <div class="user-display-name">{{ authStore.user?.name }}</div>
                  <div class="user-email">{{ authStore.user?.email }}</div>
                </div>
              </div>
            </div>
            
            <div class="dropdown-divider"></div>
            
            <router-link :to="{ name: 'dashboard' }" class="dropdown-item" @click="closeDropdown">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="9" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="3" width="7" height="5" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="12" width="7" height="9" stroke="currentColor" stroke-width="2"/>
                <rect x="3" y="16" width="7" height="5" stroke="currentColor" stroke-width="2"/>
              </svg>
              Dashboard
            </router-link>
            
            <router-link :to="{ name: 'medical-records' }" class="dropdown-item" @click="closeDropdown">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
              </svg>
              Medical History
            </router-link>
            
            <router-link :to="{ name: 'health-tracking' }" class="dropdown-item" @click="closeDropdown">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="currentColor" stroke-width="2"/>
              </svg>
              Health Tracking
            </router-link>
            
            <router-link :to="{ name: 'medications' }" class="dropdown-item" @click="closeDropdown">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4.5 16.5c-1.5 1.5-1.5 4 0 5.5s4 1.5 5.5 0L12 20l-7.5-7.5z" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8l4-4 4 4-4 4-4-4z" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8l7.5 7.5" stroke="currentColor" stroke-width="2"/>
              </svg>
              Medications
            </router-link>
            
            <div class="dropdown-divider"></div>
            
            <button @click="handleLogout" class="dropdown-item logout-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: var(--shadow-lg);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}

.header-content {
  width: 100%;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.brand-text {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  color: white;
  placeholder-color: rgba(255, 255, 255, 0.8);
  width: 300px;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.8);
}

.search-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

.notifications {
  position: relative;
}

.notification-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  position: relative;
}

.notification-btn:hover,
.notification-btn.active {
  background: rgba(255, 255, 255, 0.1);
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  position: relative;
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-name {
  font-weight: 500;
  font-size: 0.9rem;
}

.dropdown-icon {
  opacity: 0.8;
  transition: transform 0.3s ease;
}

.user-profile:hover .dropdown-icon {
  transform: rotate(180deg);
}

.profile-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  min-width: 280px;
  z-index: 1000;
  margin-top: 0.5rem;
  overflow: hidden;
}

.dropdown-header {
  padding: 1rem;
  background: var(--bg-secondary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dropdown-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-display-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  truncate: true;
}

.user-email {
  font-size: 0.85rem;
  color: var(--text-secondary);
  truncate: true;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  transition: background-color 0.3s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background: var(--bg-secondary);
}

.logout-item {
  color: var(--danger-color);
}

.logout-item:hover {
  background: #fee2e2;
  color: var(--danger-color);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.5rem 0;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }
  
  .search-bar {
    display: none;
  }
  
  .user-name {
    display: none;
  }
  
  .header-actions {
    gap: 1rem;
  }
  
  .profile-dropdown {
    min-width: 250px;
    right: -1rem;
  }
  
  .notifications-dropdown {
    min-width: 320px;
    right: -1rem;
  }
  
  .dropdown-actions {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
  }
}

/* Notifications Dropdown */
.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  min-width: 400px;
  max-width: 500px;
  z-index: 1000;
  margin-top: 0.5rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.notifications-dropdown .dropdown-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notifications-dropdown .dropdown-header h3 {
  margin: 0;
  color: #111827;
  font-size: 1.125rem;
  font-weight: 600;
}

.dropdown-actions {
  display: flex;
  gap: 1rem;
}

.mark-all-btn,
.view-all-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s ease;
}

.mark-all-btn:hover,
.view-all-btn:hover {
  color: #2563eb;
}
</style> 