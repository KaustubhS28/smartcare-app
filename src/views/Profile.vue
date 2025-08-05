<script setup>
import { onMounted, ref } from 'vue'
import { useProfileStore } from '../stores/profile'

const profileStore = useProfileStore()
const isEditing = ref(false)
const editForm = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  dateOfBirth: ''
})

onMounted(async () => {
  await profileStore.fetchProfile()
  await profileStore.fetchHealthProfile()
  
  // Populate edit form if profile exists
  if (profileStore.profile) {
    editForm.value = { ...profileStore.profile }
  }
})

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  if (isEditing.value && profileStore.profile) {
    editForm.value = { ...profileStore.profile }
  }
}

const saveProfile = async () => {
  try {
    await profileStore.updateProfile(editForm.value)
    isEditing.value = false
  } catch (error) {
    console.error('Failed to save profile:', error)
  }
}

const cancelEdit = () => {
  isEditing.value = false
  if (profileStore.profile) {
    editForm.value = { ...profileStore.profile }
  }
}
</script>

<template>
  <div class="profile-view">
    <div class="profile-header">
      <h1>My Profile</h1>
      <div class="header-actions">
        <div v-if="profileStore.isLoading" class="loading-indicator">
          Loading...
        </div>
        <div v-if="profileStore.error" class="error-message">
          {{ profileStore.error }}
        </div>
      </div>
    </div>

    <div class="profile-content">
      <!-- User Profile Section -->
      <div class="profile-section">
        <div class="section-header">
          <h2>Personal Information</h2>
          <button 
            @click="toggleEdit" 
            class="edit-btn"
            :disabled="profileStore.isLoading"
          >
            {{ isEditing ? 'Cancel' : 'Edit' }}
          </button>
        </div>

        <div v-if="!isEditing" class="profile-display">
          <div class="profile-item">
            <label>Name:</label>
            <span>{{ profileStore.profile?.name || 'Not set' }}</span>
          </div>
          <div class="profile-item">
            <label>Email:</label>
            <span>{{ profileStore.profile?.email || 'Not set' }}</span>
          </div>
          <div class="profile-item">
            <label>Phone:</label>
            <span>{{ profileStore.profile?.phone || 'Not set' }}</span>
          </div>
          <div class="profile-item">
            <label>Address:</label>
            <span>{{ profileStore.profile?.address || 'Not set' }}</span>
          </div>
          <div class="profile-item">
            <label>Date of Birth:</label>
            <span>{{ profileStore.profile?.dateOfBirth || 'Not set' }}</span>
          </div>
        </div>

        <div v-else class="profile-edit">
          <div class="form-group">
            <label for="name">Name:</label>
            <input 
              id="name"
              v-model="editForm.name" 
              type="text" 
              placeholder="Enter your name"
            />
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input 
              id="email"
              v-model="editForm.email" 
              type="email" 
              placeholder="Enter your email"
            />
          </div>
          <div class="form-group">
            <label for="phone">Phone:</label>
            <input 
              id="phone"
              v-model="editForm.phone" 
              type="tel" 
              placeholder="Enter your phone number"
            />
          </div>
          <div class="form-group">
            <label for="address">Address:</label>
            <textarea 
              id="address"
              v-model="editForm.address" 
              placeholder="Enter your address"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="dateOfBirth">Date of Birth:</label>
            <input 
              id="dateOfBirth"
              v-model="editForm.dateOfBirth" 
              type="date"
            />
          </div>
          <div class="form-actions">
            <button @click="saveProfile" class="save-btn" :disabled="profileStore.isLoading">
              Save Changes
            </button>
            <button @click="cancelEdit" class="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Health Profile Section -->
      <div class="profile-section">
        <div class="section-header">
          <h2>Health Information</h2>
        </div>

        <div class="health-profile">
          <div v-if="profileStore.healthProfile" class="health-data">
            <div class="health-item">
              <label>Health Score:</label>
              <span class="health-score">{{ profileStore.healthProfile.healthScore || 'N/A' }}</span>
            </div>
            <div v-if="profileStore.healthProfile.vitals" class="vitals-grid">
              <div class="vital-item">
                <label>Blood Pressure:</label>
                <span>{{ profileStore.healthProfile.vitals.bloodPressure?.systolic }}/{{ profileStore.healthProfile.vitals.bloodPressure?.diastolic }} mmHg</span>
              </div>
              <div class="vital-item">
                <label>Heart Rate:</label>
                <span>{{ profileStore.healthProfile.vitals.heartRate?.value }} bpm</span>
              </div>
              <div class="vital-item">
                <label>Temperature:</label>
                <span>{{ profileStore.healthProfile.vitals.temperature?.value }}°F</span>
              </div>
              <div class="vital-item">
                <label>Weight:</label>
                <span>{{ profileStore.healthProfile.vitals.weight?.value }} lbs</span>
              </div>
            </div>
          </div>
          <div v-else class="no-health-data">
            <p>No health profile data available</p>
          </div>
        </div>
      </div>

      <!-- Debug Section (for testing) -->
      <div class="profile-section debug-section">
        <div class="section-header">
          <h2>Debug Information</h2>
        </div>
        <div class="debug-info">
          <h3>Profile Store State:</h3>
          <pre>{{ JSON.stringify({
            isLoading: profileStore.isLoading,
            error: profileStore.error,
            hasProfile: !!profileStore.profile,
            hasHealthProfile: !!profileStore.healthProfile,
            profileId: profileStore.profile?.id
          }, null, 2) }}</pre>
          
          <h3>Raw Profile Data:</h3>
          <pre>{{ JSON.stringify(profileStore.profile, null, 2) }}</pre>
          
          <h3>Raw Health Profile Data:</h3>
          <pre>{{ JSON.stringify(profileStore.healthProfile, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e1e5e9;
  padding-bottom: 1rem;
}

.profile-header h1 {
  margin: 0;
  color: #2c3e50;
}

.loading-indicator {
  color: #3498db;
  font-weight: 500;
}

.error-message {
  color: #e74c3c;
  font-weight: 500;
  padding: 0.5rem;
  background: #fdf2f2;
  border: 1px solid #e74c3c;
  border-radius: 4px;
}

.profile-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
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
  color: #2c3e50;
}

.edit-btn, .save-btn, .cancel-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.edit-btn {
  background: #3498db;
  color: white;
}

.edit-btn:hover {
  background: #2980b9;
}

.save-btn {
  background: #27ae60;
  color: white;
  margin-right: 0.5rem;
}

.save-btn:hover {
  background: #229954;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
}

.cancel-btn:hover {
  background: #7f8c8d;
}

.profile-item {
  display: flex;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #ecf0f1;
}

.profile-item label {
  flex: 0 0 150px;
  font-weight: 600;
  color: #7f8c8d;
}

.profile-item span {
  flex: 1;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #7f8c8d;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-actions {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
}

.health-score {
  font-size: 1.5rem;
  font-weight: bold;
  color: #27ae60;
}

.vitals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.vital-item {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.vital-item label {
  font-weight: 600;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.vital-item span {
  font-size: 1.1rem;
  font-weight: 500;
  color: #2c3e50;
}

.no-health-data {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  padding: 2rem;
}

.debug-section {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
}

.debug-info h3 {
  margin: 1rem 0 0.5rem 0;
  color: #495057;
}

.debug-info pre {
  background: #e9ecef;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}
</style>
