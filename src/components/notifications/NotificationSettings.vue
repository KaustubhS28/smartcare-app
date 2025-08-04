<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  settings: {
    type: Object,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['updateSettings', 'testNotification'])

const localSettings = ref({ ...props.settings })

// Watch for prop changes
watch(() => props.settings, (newSettings) => {
  localSettings.value = { ...newSettings }
}, { deep: true })

const notificationTypes = [
  {
    key: 'appointments',
    label: 'Appointments',
    description: 'Reminders for upcoming appointments, confirmations, and cancellations'
  },
  {
    key: 'medications',
    label: 'Medications',
    description: 'Medication reminders, refill alerts, and adherence tracking'
  },
  {
    key: 'billing',
    label: 'Billing & Payments',
    description: 'Invoice notifications, payment confirmations, and overdue alerts'
  },
  {
    key: 'healthUpdates',
    label: 'Health Updates',
    description: 'Health score changes, insights, and wellness tips'
  },
  {
    key: 'emergencies',
    label: 'Emergency Alerts',
    description: 'Critical health alerts and emergency notifications',
    smsOnly: true
  },
  {
    key: 'reminders',
    label: 'General Reminders',
    description: 'System reminders and routine health check notifications'
  },
  {
    key: 'marketing',
    label: 'Marketing & Updates',
    description: 'Product updates, newsletters, and promotional content',
    emailOnly: true
  }
]

const channelInfo = {
  email: {
    icon: '📧',
    label: 'Email Notifications',
    description: 'Get notifications delivered to your email inbox'
  },
  push: {
    icon: '🔔',
    label: 'Push Notifications',
    description: 'Receive notifications on your device while using the app'
  },
  sms: {
    icon: '📱',
    label: 'SMS Notifications',
    description: 'Get text messages for urgent notifications'
  }
}

const frequencyOptions = {
  medications: [
    { value: 'every_dose', label: 'Every dose time' },
    { value: 'daily', label: 'Daily summary' },
    { value: 'weekly', label: 'Weekly summary' }
  ],
  appointments: [
    { value: 'immediate', label: 'Immediately' },
    { value: '1_hour', label: '1 hour before' },
    { value: '24_hours', label: '24 hours before' },
    { value: 'week_before', label: '1 week before' }
  ],
  healthUpdates: [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ]
}

const unsavedChanges = computed(() => {
  return JSON.stringify(localSettings.value) !== JSON.stringify(props.settings)
})

const handleChannelToggle = (channel) => {
  localSettings.value[channel].enabled = !localSettings.value[channel].enabled
}

const handleTypeToggle = (channel, type) => {
  if (localSettings.value[channel]) {
    localSettings.value[channel][type] = !localSettings.value[channel][type]
  }
}

const handleFrequencyChange = (type, frequency) => {
  localSettings.value.preferences.frequency[type] = frequency
}

const handleQuietHoursToggle = () => {
  localSettings.value.preferences.quietHours.enabled = !localSettings.value.preferences.quietHours.enabled
}

const handleSaveSettings = async () => {
  emit('updateSettings', localSettings.value)
}

const handleResetSettings = () => {
  localSettings.value = { ...props.settings }
}

const handleTestNotification = (type, channel) => {
  emit('testNotification', type, channel)
}

const isTypeAvailable = (type, channel) => {
  const typeConfig = notificationTypes.find(t => t.key === type)
  if (!typeConfig) return true
  
  if (channel === 'sms' && typeConfig.emailOnly) return false
  if (channel === 'email' && typeConfig.smsOnly) return false
  
  return true
}
</script>

<template>
  <div class="notification-settings">
    <!-- Header -->
    <div class="settings-header">
      <h2>Notification Settings</h2>
      <p>Manage how and when you receive notifications from SmartCare</p>
    </div>

    <!-- Channel Settings -->
    <div class="channel-settings">
      <div v-for="(info, channel) in channelInfo" :key="channel" class="channel-section">
        <div class="channel-header">
          <div class="channel-info">
            <span class="channel-icon">{{ info.icon }}</span>
            <div>
              <h3>{{ info.label }}</h3>
              <p>{{ info.description }}</p>
            </div>
          </div>
          <div class="channel-toggle">
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="localSettings[channel]?.enabled"
                @change="handleChannelToggle(channel)"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Type settings for enabled channels -->
        <div v-if="localSettings[channel]?.enabled" class="type-settings">
          <div class="types-grid">
            <div
              v-for="type in notificationTypes"
              :key="type.key"
              class="type-item"
              :class="{ disabled: !isTypeAvailable(type.key, channel) }"
            >
              <div v-if="isTypeAvailable(type.key, channel)" class="type-content">
                <div class="type-info">
                  <h4>{{ type.label }}</h4>
                  <p>{{ type.description }}</p>
                </div>
                <div class="type-controls">
                  <label class="toggle-switch small">
                    <input
                      type="checkbox"
                      :checked="localSettings[channel][type.key]"
                      @change="handleTypeToggle(channel, type.key)"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                  <button
                    v-if="localSettings[channel][type.key]"
                    @click="handleTestNotification(type.key, channel)"
                    class="test-btn"
                    title="Send test notification"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L2 8.67l5.5 1.94L22 2z" stroke="currentColor" stroke-width="2"/>
                      <path d="l-10.5 8.39L8 22l4-10z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced Settings -->
    <div class="advanced-settings">
      <h3>Advanced Settings</h3>

      <!-- Quiet Hours -->
      <div class="setting-group">
        <div class="setting-header">
          <h4>Quiet Hours</h4>
          <label class="toggle-switch">
            <input
              type="checkbox"
              :checked="localSettings.preferences.quietHours.enabled"
              @change="handleQuietHoursToggle"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <p>Disable non-urgent notifications during these hours</p>

        <div v-if="localSettings.preferences.quietHours.enabled" class="quiet-hours-config">
          <div class="time-inputs">
            <div class="time-input">
              <label for="quietStart">Start Time</label>
              <input
                id="quietStart"
                v-model="localSettings.preferences.quietHours.start"
                type="time"
              />
            </div>
            <div class="time-input">
              <label for="quietEnd">End Time</label>
              <input
                id="quietEnd"
                v-model="localSettings.preferences.quietHours.end"
                type="time"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Frequency Settings -->
      <div class="setting-group">
        <h4>Notification Frequency</h4>
        <p>Customize how often you receive different types of notifications</p>

        <div class="frequency-settings">
          <div
            v-for="(options, type) in frequencyOptions"
            :key="type"
            class="frequency-item"
          >
            <label :for="`frequency-${type}`">
              {{ notificationTypes.find(t => t.key === type)?.label }}
            </label>
            <select
              :id="`frequency-${type}`"
              :value="localSettings.preferences.frequency[type]"
              @change="handleFrequencyChange(type, $event.target.value)"
            >
              <option v-for="option in options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Language & Timezone -->
      <div class="setting-group">
        <h4>Language & Timezone</h4>
        <div class="preference-inputs">
          <div class="input-group">
            <label for="language">Language</label>
            <select id="language" v-model="localSettings.preferences.language">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
          <div class="input-group">
            <label for="timezone">Timezone</label>
            <select id="timezone" v-model="localSettings.preferences.timezone">
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button
        v-if="unsavedChanges"
        @click="handleResetSettings"
        class="btn-secondary"
      >
        Reset Changes
      </button>
      <button
        @click="handleSaveSettings"
        class="btn-primary"
        :disabled="isLoading || !unsavedChanges"
      >
        <span v-if="isLoading">Saving...</span>
        <span v-else>{{ unsavedChanges ? 'Save Settings' : 'Settings Saved' }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.notification-settings {
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  text-align: center;
  margin-bottom: 2rem;
}

.settings-header h2 {
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 1.75rem;
  font-weight: 600;
}

.settings-header p {
  margin: 0;
  color: #6b7280;
  font-size: 1rem;
}

.channel-settings {
  margin-bottom: 2rem;
}

.channel-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.channel-icon {
  font-size: 1.5rem;
}

.channel-info h3 {
  margin: 0 0 0.25rem 0;
  color: #111827;
  font-size: 1.125rem;
  font-weight: 600;
}

.channel-info p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch.small {
  width: 40px;
  height: 20px;
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

.toggle-switch.small .toggle-slider:before {
  height: 14px;
  width: 14px;
}

input:checked + .toggle-slider {
  background-color: #3b82f6;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.toggle-switch.small input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.type-settings {
  padding: 1.5rem;
}

.types-grid {
  display: grid;
  gap: 1rem;
}

.type-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.type-item:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.type-item.disabled {
  opacity: 0.5;
  background: #f3f4f6;
}

.type-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type-info h4 {
  margin: 0 0 0.25rem 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
}

.type-info p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.type-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.test-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.3s ease;
}

.test-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.advanced-settings {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.advanced-settings h3 {
  margin: 0 0 1.5rem 0;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 600;
}

.setting-group {
  margin-bottom: 2rem;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.setting-group h4 {
  margin: 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
}

.setting-group p {
  margin: 0 0 1rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.quiet-hours-config {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
}

.time-inputs {
  display: flex;
  gap: 1rem;
}

.time-input {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.time-input label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.time-input input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.frequency-settings {
  display: grid;
  gap: 1rem;
}

.frequency-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
}

.frequency-item label {
  font-weight: 500;
  color: #374151;
}

.frequency-item select {
  padding: 0.375rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
}

.preference-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.input-group select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
}

.btn-secondary,
.btn-primary {
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

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .channel-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .type-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .time-inputs {
    flex-direction: column;
  }
  
  .frequency-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .preference-inputs {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style> 