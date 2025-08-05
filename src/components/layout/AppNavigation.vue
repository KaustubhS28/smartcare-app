<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isCollapsed = ref(false)

const navigationItems = [
  {
    name: 'Dashboard',
    routeName: 'dashboard',
    icon: 'dashboard',
    description: 'Overview & Health Summary'
  },
  {
    name: 'My Profile',
    routeName: 'profile',
    icon: 'user',
    description: 'Personal & Health Information'
  },
  {
    name: 'Find Doctors',
    routeName: 'doctors',
    icon: 'doctors',
    description: 'Browse & Search Specialists'
  },
  {
    name: 'Appointments',
    routeName: 'appointments',
    icon: 'calendar',
    description: 'Manage Your Visits'
  },
  {
    name: 'Medical Records',
    routeName: 'medical-records',
    icon: 'medical',
    description: 'Health History & Reports'
  },
  {
    name: 'Health Tracking',
    routeName: 'health-tracking',
    icon: 'activity',
    description: 'Monitor Vitals & Goals'
  },
  {
    name: 'Medications',
    routeName: 'medications',
    icon: 'pill',
    description: 'Prescription Management'
  },
  {
    name: 'Billing',
    routeName: 'billing',
    icon: 'billing',
    description: 'Payments & Invoices'
  },
  {
    name: 'Settings',
    routeName: 'settings',
    icon: 'settings',
    description: 'Account & Preferences'
  }
]

const isActiveRoute = (routeName) => {
  return route.name === routeName
}

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <nav class="app-navigation" :class="{ collapsed: isCollapsed }">
    <div class="nav-header">
      <button @click="toggleSidebar" class="toggle-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>

    <div class="nav-content">
      <ul class="nav-list">
        <li v-for="item in navigationItems" :key="item.path" class="nav-item">
          <router-link 
            :to="{ name: item.routeName }" 
            class="nav-link"
            :class="{ active: isActiveRoute(item.routeName) }"
          >
            <div class="nav-icon">
              <svg v-if="item.icon === 'dashboard'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="9" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="3" width="7" height="5" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="12" width="7" height="9" stroke="currentColor" stroke-width="2"/>
                <rect x="3" y="16" width="7" height="5" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else-if="item.icon === 'user'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else-if="item.icon === 'doctors'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M12 1v6M9 4h6" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else-if="item.icon === 'calendar'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else-if="item.icon === 'medical'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="11" x2="12" y2="17" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="14" x2="15" y2="14" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else-if="item.icon === 'activity'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else-if="item.icon === 'pill'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4.5 16.5c-1.5 1.5-1.5 4 0 5.5s4 1.5 5.5 0L12 20l-7.5-7.5z" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8l4-4 4 4-4 4-4-4z" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8l7.5 7.5" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else-if="item.icon === 'billing'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else-if="item.icon === 'settings'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="nav-text" v-show="!isCollapsed">
              <span class="nav-title">{{ item.name }}</span>
              <span class="nav-description">{{ item.description }}</span>
            </div>
          </router-link>
        </li>
      </ul>

      <div class="nav-footer" v-show="!isCollapsed">
        <div class="emergency-contact">
          <div class="emergency-icon">🚨</div>
          <div class="emergency-text">
            <strong>Emergency</strong>
            <span>Call 911 or visit ER</span>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.app-navigation {
  width: 280px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  height: 100vh;
  position: sticky;
  top: 0;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-navigation.collapsed {
  width: 70px;
}

.nav-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-content {
  flex: 1;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 0 25px 25px 0;
  margin-right: 1rem;
  gap: 1rem;
}

.nav-link:hover {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%);
  color: var(--primary-color);
}

.nav-link.active {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, transparent 100%);
  color: var(--primary-color);
  border-right: 3px solid var(--primary-color);
}

.nav-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.nav-title {
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
}

.nav-description {
  font-size: 0.75rem;
  opacity: 0.7;
  white-space: nowrap;
}

.nav-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.emergency-contact {
  background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.emergency-icon {
  font-size: 1.25rem;
}

.emergency-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.emergency-text strong {
  font-weight: 600;
  color: #92400e;
  font-size: 0.85rem;
}

.emergency-text span {
  font-size: 0.75rem;
  color: #b45309;
}

@media (max-width: 768px) {
  .app-navigation {
    position: fixed;
    left: -280px;
    top: 0;
    z-index: 1000;
    height: 100vh;
    background: var(--bg-primary);
    box-shadow: var(--shadow-lg);
    transition: left 0.3s ease;
  }

  .app-navigation.mobile-open {
    left: 0;
  }

  .app-navigation.collapsed {
    width: 280px;
    left: -280px;
  }
}
</style> 