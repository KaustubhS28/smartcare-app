<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import NotificationSettings from '../components/notifications/NotificationSettings.vue'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const activeTab = ref('notifications')
const isLoading = ref(false)
const showDeleteConfirm = ref(false)

const tabs = [
  {
    id: 'notifications',
    label: 'Notifications',
    icon: '🔔',
    description: 'Manage notification preferences'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: '👤',
    description: 'Update your personal information'
  },
  {
    id: 'privacy',
    label: 'Privacy & Security',
    icon: '🔒',
    description: 'Control your privacy settings'
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: '⚙️',
    description: 'App preferences and display settings'
  }
]

// Profile form data
const profileForm = ref({
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  bloodType: '',
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  },
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  }
})

// Privacy settings
const privacySettings = ref({
  shareHealthData: true,
  allowResearch: false,
  marketingEmails: false,
  dataRetention: '5_years', // 1_year, 5_years, 10_years, indefinite
  twoFactorAuth: false,
  sessionTimeout: '30_minutes' // 15_minutes, 30_minutes, 1_hour, 4_hours
})

// App preferences
const preferences = ref({
  theme: 'light', // light, dark, auto
  language: 'en',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12_hour',
  measurementUnit: 'imperial', // imperial, metric
  defaultView: 'dashboard' // dashboard, appointments, medications
})

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const relationships = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other']
const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' }
]

const hasUnsavedChanges = computed(() => {
  // This would check for actual changes in a real app
  return false
})

const initializeProfileData = () => {
  if (authStore.currentUser) {
    const user = authStore.currentUser
    profileForm.value = {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      bloodType: user.bloodType || '',
      emergencyContact: {
        name: user.emergencyContact?.name || '',
        relationship: user.emergencyContact?.relationship || '',
        phone: user.emergencyContact?.phone || ''
      },
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || 'US'
      }
    }
  }
}

const handleUpdateNotifications = async (settings) => {
  try {
    await notificationStore.updateSettings(settings)
    alert('Notification settings updated successfully!')
  } catch (error) {
    console.error('Failed to update notification settings:', error)
    alert('Failed to update notification settings. Please try again.')
  }
}

const handleTestNotification = async (type, channel) => {
  try {
    await notificationStore.testNotification(type, channel)
    alert(`Test ${channel} notification sent!`)
  } catch (error) {
    console.error('Failed to send test notification:', error)
    alert('Failed to send test notification. Please try again.')
  }
}

const handleUpdateProfile = async () => {
  isLoading.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update auth store
    authStore.updateProfile(profileForm.value)
    
    alert('Profile updated successfully!')
  } catch (error) {
    console.error('Failed to update profile:', error)
    alert('Failed to update profile. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const handleUpdatePrivacySettings = async () => {
  isLoading.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    alert('Privacy settings updated successfully!')
  } catch (error) {
    console.error('Failed to update privacy settings:', error)
    alert('Failed to update privacy settings. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const handleUpdatePreferences = async () => {
  isLoading.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600))
    
    alert('Preferences updated successfully!')
  } catch (error) {
    console.error('Failed to update preferences:', error)
    alert('Failed to update preferences. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const handleDeleteAccount = () => {
  showDeleteConfirm.value = true
}

const confirmDeleteAccount = async () => {
  // This would implement account deletion in a real app
  alert('Account deletion feature would be implemented here.')
  showDeleteConfirm.value = false
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  initializeProfileData()
  notificationStore.fetchNotifications()
})
</script>

<template>
  <div class="settings-page">
    <!-- Page Header -->
    <div class="page-header">
      <button @click="goBack" class="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2"/>
        </svg>
        Back
      </button>
      
      <div class="header-content">
        <h1>Settings</h1>
        <p>Manage your account preferences and app settings</p>
      </div>
    </div>

    <!-- Settings Navigation -->
    <div class="settings-nav">
      <div class="nav-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="nav-tab"
          :class="{ active: activeTab === tab.id }"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <div class="tab-content">
            <span class="tab-label">{{ tab.label }}</span>
            <span class="tab-description">{{ tab.description }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Settings Content -->
    <div class="settings-content">
      <!-- Notifications Tab -->
      <div v-if="activeTab === 'notifications'" class="settings-section">
        <NotificationSettings
          :settings="notificationStore.settings"
          :is-loading="notificationStore.isLoading"
          @update-settings="handleUpdateNotifications"
          @test-notification="handleTestNotification"
        />
      </div>

      <!-- Profile Tab -->
      <div v-if="activeTab === 'profile'" class="settings-section">
        <div class="section-header">
          <h2>Profile Information</h2>
          <p>Update your personal information and medical details</p>
        </div>

        <form @submit.prevent="handleUpdateProfile" class="settings-form">
          <!-- Basic Information -->
          <div class="form-group-section">
            <h3>Basic Information</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="name">Full Name</label>
                <input
                  id="name"
                  v-model="profileForm.name"
                  type="text"
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="email">Email Address</label>
                <input
                  id="email"
                  v-model="profileForm.email"
                  type="email"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input
                  id="phone"
                  v-model="profileForm.phone"
                  type="tel"
                />
              </div>
              
              <div class="form-group">
                <label for="dateOfBirth">Date of Birth</label>
                <input
                  id="dateOfBirth"
                  v-model="profileForm.dateOfBirth"
                  type="date"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="bloodType">Blood Type</label>
                <select id="bloodType" v-model="profileForm.bloodType">
                  <option value="">Select blood type</option>
                  <option v-for="type in bloodTypes" :key="type" :value="type">
                    {{ type }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Emergency Contact -->
          <div class="form-group-section">
            <h3>Emergency Contact</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="emergencyName">Contact Name</label>
                <input
                  id="emergencyName"
                  v-model="profileForm.emergencyContact.name"
                  type="text"
                />
              </div>
              
              <div class="form-group">
                <label for="emergencyRelationship">Relationship</label>
                <select id="emergencyRelationship" v-model="profileForm.emergencyContact.relationship">
                  <option value="">Select relationship</option>
                  <option v-for="rel in relationships" :key="rel" :value="rel">
                    {{ rel }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="emergencyPhone">Contact Phone</label>
                <input
                  id="emergencyPhone"
                  v-model="profileForm.emergencyContact.phone"
                  type="tel"
                />
              </div>
            </div>
          </div>

          <!-- Address -->
          <div class="form-group-section">
            <h3>Address</h3>
            
            <div class="form-row">
              <div class="form-group full-width">
                <label for="street">Street Address</label>
                <input
                  id="street"
                  v-model="profileForm.address.street"
                  type="text"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="city">City</label>
                <input
                  id="city"
                  v-model="profileForm.address.city"
                  type="text"
                />
              </div>
              
              <div class="form-group">
                <label for="state">State</label>
                <input
                  id="state"
                  v-model="profileForm.address.state"
                  type="text"
                />
              </div>

              <div class="form-group">
                <label for="zipCode">ZIP Code</label>
                <input
                  id="zipCode"
                  v-model="profileForm.address.zipCode"
                  type="text"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="country">Country</label>
                <select id="country" v-model="profileForm.address.country">
                  <option v-for="country in countries" :key="country.code" :value="country.code">
                    {{ country.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="isLoading">
              <span v-if="isLoading">Updating...</span>
              <span v-else>Update Profile</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Privacy & Security Tab -->
      <div v-if="activeTab === 'privacy'" class="settings-section">
        <div class="section-header">
          <h2>Privacy & Security</h2>
          <p>Control how your data is used and manage security settings</p>
        </div>

        <form @submit.prevent="handleUpdatePrivacySettings" class="settings-form">
          <!-- Data Privacy -->
          <div class="form-group-section">
            <h3>Data Privacy</h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Share Health Data</h4>
                <p>Allow sharing of anonymized health data for research and improvement</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="privacySettings.shareHealthData" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h4>Participate in Research</h4>
                <p>Allow your data to be used for medical research studies</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="privacySettings.allowResearch" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h4>Marketing Communications</h4>
                <p>Receive promotional emails and marketing content</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="privacySettings.marketingEmails" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h4>Data Retention</h4>
                <p>How long to keep your data after account deletion</p>
              </div>
              <select v-model="privacySettings.dataRetention">
                <option value="1_year">1 Year</option>
                <option value="5_years">5 Years</option>
                <option value="10_years">10 Years</option>
                <option value="indefinite">Indefinite</option>
              </select>
            </div>
          </div>

          <!-- Security -->
          <div class="form-group-section">
            <h3>Security</h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Two-Factor Authentication</h4>
                <p>Add an extra layer of security to your account</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="privacySettings.twoFactorAuth" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h4>Session Timeout</h4>
                <p>Automatically log out after inactivity</p>
              </div>
              <select v-model="privacySettings.sessionTimeout">
                <option value="15_minutes">15 Minutes</option>
                <option value="30_minutes">30 Minutes</option>
                <option value="1_hour">1 Hour</option>
                <option value="4_hours">4 Hours</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="isLoading">
              <span v-if="isLoading">Updating...</span>
              <span v-else>Update Privacy Settings</span>
            </button>
          </div>
        </form>

        <!-- Danger Zone -->
        <div class="danger-zone">
          <h3>Danger Zone</h3>
          <div class="danger-content">
            <div class="danger-info">
              <h4>Delete Account</h4>
              <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
            </div>
            <button @click="handleDeleteAccount" class="btn-danger">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <!-- Preferences Tab -->
      <div v-if="activeTab === 'preferences'" class="settings-section">
        <div class="section-header">
          <h2>App Preferences</h2>
          <p>Customize your app experience and display settings</p>
        </div>

        <form @submit.prevent="handleUpdatePreferences" class="settings-form">
          <!-- Appearance -->
          <div class="form-group-section">
            <h3>Appearance</h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Theme</h4>
                <p>Choose your preferred color scheme</p>
              </div>
              <select v-model="preferences.theme">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
          </div>

          <!-- Localization -->
          <div class="form-group-section">
            <h3>Localization</h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Language</h4>
                <p>Select your preferred language</p>
              </div>
              <select v-model="preferences.language">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h4>Timezone</h4>
                <p>Set your local timezone</p>
              </div>
              <select v-model="preferences.timezone">
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h4>Date Format</h4>
                <p>Choose how dates are displayed</p>
              </div>
              <select v-model="preferences.dateFormat">
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h4>Time Format</h4>
                <p>Choose between 12-hour or 24-hour format</p>
              </div>
              <select v-model="preferences.timeFormat">
                <option value="12_hour">12 Hour (AM/PM)</option>
                <option value="24_hour">24 Hour</option>
              </select>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h4>Measurement Units</h4>
                <p>Choose your preferred measurement system</p>
              </div>
              <select v-model="preferences.measurementUnit">
                <option value="imperial">Imperial (lbs, °F)</option>
                <option value="metric">Metric (kg, °C)</option>
              </select>
            </div>
          </div>

          <!-- Navigation -->
          <div class="form-group-section">
            <h3>Navigation</h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Default View</h4>
                <p>Choose which page to show when you log in</p>
              </div>
              <select v-model="preferences.defaultView">
                <option value="dashboard">Dashboard</option>
                <option value="appointments">Appointments</option>
                <option value="medications">Medications</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="isLoading">
              <span v-if="isLoading">Updating...</span>
              <span v-else>Update Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Account Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Delete Account</h3>
        </div>
        
        <div class="modal-body">
          <div class="warning-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h4>Are you sure you want to delete your account?</h4>
          <p>This will permanently delete all your data including:</p>
          <ul>
            <li>Medical records and health data</li>
            <li>Appointment history</li>
            <li>Medication records</li>
            <li>Payment information</li>
            <li>All account settings</li>
          </ul>
          <p><strong>This action cannot be undone.</strong></p>
        </div>
        
        <div class="modal-actions">
          <button @click="showDeleteConfirm = false" class="btn-secondary">
            Cancel
          </button>
          <button @click="confirmDeleteAccount" class="btn-danger">
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
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

.settings-nav {
  margin-bottom: 2rem;
}

.nav-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.nav-tab:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-tab.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.tab-icon {
  font-size: 1.5rem;
}

.tab-content {
  flex: 1;
}

.tab-label {
  display: block;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.tab-description {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
}

.settings-content {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.settings-section {
  padding: 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 1.75rem;
  font-weight: 600;
}

.section-header p {
  margin: 0;
  color: #6b7280;
}

.settings-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-group-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-group-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.form-group-section h3 {
  margin: 0 0 1.5rem 0;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.setting-info {
  flex: 1;
  margin-right: 1rem;
}

.setting-info h4 {
  margin: 0 0 0.25rem 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
}

.setting-info p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.3s ease;
  border-radius: 20px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s ease;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #3b82f6;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.setting-item select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  min-width: 150px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.danger-zone {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #fecaca;
  background: #fef2f2;
  border-radius: 8px;
  padding: 2rem;
}

.danger-zone h3 {
  margin: 0 0 1rem 0;
  color: #dc2626;
  font-size: 1.25rem;
  font-weight: 600;
}

.danger-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.danger-info {
  flex: 1;
}

.danger-info h4 {
  margin: 0 0 0.5rem 0;
  color: #dc2626;
  font-size: 1rem;
  font-weight: 600;
}

.danger-info p {
  margin: 0;
  color: #7f1d1d;
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
  max-width: 500px;
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
}

.warning-icon {
  color: #f59e0b;
  margin-bottom: 1rem;
  text-align: center;
}

.modal-body h4 {
  margin: 0 0 1rem 0;
  color: #111827;
  font-size: 1.125rem;
  font-weight: 600;
  text-align: center;
}

.modal-body p {
  margin: 0 0 1rem 0;
  color: #6b7280;
  line-height: 1.5;
}

.modal-body ul {
  margin: 0 0 1rem 0;
  padding-left: 1.5rem;
  color: #6b7280;
}

.modal-body li {
  margin-bottom: 0.5rem;
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
  .settings-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .nav-tabs {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .setting-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .setting-info {
    margin-right: 0;
  }
  
  .danger-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style> 