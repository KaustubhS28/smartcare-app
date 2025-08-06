<script setup>
import { onMounted, ref, computed } from 'vue'
import { useProfileStore } from '../stores/profile'
import { useAuthStore } from '../stores/auth'

const profileStore = useProfileStore()
const authStore = useAuthStore()
const isEditingPersonal = ref(false)
const isEditingHealth = ref(false)

// Personal Information Form
const personalForm = ref({
  email: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  address: '',
  dateOfBirth: '',
  gender: 'MALE',
  profilePicture: ''
})

// Health Profile Form
const healthForm = ref({
  height: 0,
  weight: 0,
  bloodType: 'A_POSITIVE',
  medicalConditions: [],
  allergies: [],
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  additionalNotes: ''
})

// Temporary fields for adding conditions/allergies
const newCondition = ref('')
const newAllergy = ref('')

// Options for dropdowns
const genderOptions = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' }
]

const bloodTypeOptions = [
  'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE',
  'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'
]

// Computed properties
const formattedBirthDate = computed(() => {
  if (!personalForm.value.dateOfBirth) return 'Not set'
  return new Date(personalForm.value.dateOfBirth).toLocaleDateString()
})

const bmi = computed(() => {
  if (healthForm.value.height && healthForm.value.weight) {
    const heightInMeters = healthForm.value.height / 100
    return (healthForm.value.weight / (heightInMeters * heightInMeters)).toFixed(1)
  }
  return null
})

onMounted(async () => {
  await profileStore.fetchProfile()
  await profileStore.fetchHealthProfile()
  
  // Populate forms with existing data
  if (profileStore.profile) {
    personalForm.value = {
      email: profileStore.profile.email || '',
      firstName: profileStore.profile.firstName || '',
      lastName: profileStore.profile.lastName || '',
      phoneNumber: profileStore.profile.phoneNumber || '',
      address: profileStore.profile.address || '',
      dateOfBirth: profileStore.profile.dateOfBirth ? profileStore.profile.dateOfBirth.split('T')[0] : '',
      gender: profileStore.profile.gender || 'MALE',
      profilePicture: profileStore.profile.profilePictureUrl || ''
    }
  }
  
  if (profileStore.primaryHealthProfile) {
    const hp = profileStore.primaryHealthProfile
    healthForm.value = {
      height: hp.height || 0,
      weight: hp.weight || 0,
      bloodType: hp.bloodType || 'A_POSITIVE',
      medicalConditions: [...(hp.medicalConditions || [])],
      allergies: [...(hp.allergies || [])],
      emergencyContactName: hp.emergencyContactName || '',
      emergencyContactPhone: hp.emergencyContactPhone || '',
      emergencyContactRelationship: hp.emergencyContactRelationship || '',
      additionalNotes: hp.additionalNotes || ''
    }
  }
})

const togglePersonalEdit = () => {
  isEditingPersonal.value = !isEditingPersonal.value
  profileStore.clearErrors()
  if (!isEditingPersonal.value && profileStore.profile) {
    // Reset form on cancel
    personalForm.value = {
      email: profileStore.profile.email || '',
      firstName: profileStore.profile.firstName || '',
      lastName: profileStore.profile.lastName || '',
      phoneNumber: profileStore.profile.phoneNumber || '',
      address: profileStore.profile.address || '',
      dateOfBirth: profileStore.profile.dateOfBirth ? profileStore.profile.dateOfBirth.split('T')[0] : '',
      gender: profileStore.profile.gender || 'MALE',
      profilePicture: profileStore.profile.profilePictureUrl || ''
    }
  }
}

const toggleHealthEdit = () => {
  isEditingHealth.value = !isEditingHealth.value
  profileStore.clearErrors()
  if (!isEditingHealth.value && profileStore.primaryHealthProfile) {
    // Reset form on cancel
    const hp = profileStore.primaryHealthProfile
    healthForm.value = {
      height: hp.height || 0,
      weight: hp.weight || 0,
      bloodType: hp.bloodType || 'A_POSITIVE',
      medicalConditions: [...(hp.medicalConditions || [])],
      allergies: [...(hp.allergies || [])],
      emergencyContactName: hp.emergencyContactName || '',
      emergencyContactPhone: hp.emergencyContactPhone || '',
      emergencyContactRelationship: hp.emergencyContactRelationship || '',
      additionalNotes: hp.additionalNotes || ''
    }
  }
}

const savePersonalInfo = async () => {
  try {
    profileStore.clearErrors()
    const updateData = {
      // Include required fields from current profile
      email: profileStore.profile?.email || personalForm.value.email,
      username: profileStore.profile?.username,
      // Include updateable fields
      firstName: personalForm.value.firstName,
      lastName: personalForm.value.lastName,
      phoneNumber: personalForm.value.phoneNumber,
      address: personalForm.value.address || '',
      profilePictureUrl: personalForm.value.profilePicture,
      dateOfBirth: personalForm.value.dateOfBirth || null,
      gender: personalForm.value.gender
    }
    
    await profileStore.updateProfile(updateData)
    isEditingPersonal.value = false
  } catch (error) {
    console.error('Failed to save personal information:', error)
    // Errors are handled in the store and displayed in the UI
  }
}

const saveHealthProfile = async () => {
  try {
    profileStore.clearErrors()
    
    if (profileStore.primaryHealthProfile?.id) {
      // Update existing health profile
      await profileStore.updateHealthProfile(profileStore.primaryHealthProfile.id, healthForm.value)
    } else {
      // Create new health profile
      await profileStore.createHealthProfile(healthForm.value)
    }
    
    isEditingHealth.value = false
  } catch (error) {
    console.error('Failed to save health profile:', error)
    // Errors are handled in the store and displayed in the UI
  }
}

const addCondition = () => {
  if (newCondition.value.trim()) {
    healthForm.value.medicalConditions.push(newCondition.value.trim())
    newCondition.value = ''
  }
}

const removeCondition = (index) => {
  healthForm.value.medicalConditions.splice(index, 1)
}

const addAllergy = () => {
  if (newAllergy.value.trim()) {
    healthForm.value.allergies.push(newAllergy.value.trim())
    newAllergy.value = ''
  }
}

const removeAllergy = (index) => {
  healthForm.value.allergies.splice(index, 1)
}

// Helper methods for BMI calculations
const getBMIClass = (bmi) => {
  const bmiValue = parseFloat(bmi)
  if (bmiValue < 18.5) return 'underweight'
  if (bmiValue < 25) return 'normal'
  if (bmiValue < 30) return 'overweight'
  return 'obese'
}

const getBMICategory = (bmi) => {
  const bmiValue = parseFloat(bmi)
  if (bmiValue < 18.5) return 'Underweight'
  if (bmiValue < 25) return 'Normal'
  if (bmiValue < 30) return 'Overweight'
  return 'Obese'
}
</script>

<template>
  <div class="profile-view">      <div class="profile-header">
        <h1>My Profile</h1>
        <div class="header-actions">
          <div v-if="profileStore.isLoading" class="loading-indicator">
            <i class="loading-spinner"></i> Loading...
          </div>
          <div v-if="profileStore.error" class="error-message">
            {{ profileStore.error }}
          </div>
        </div>
      </div>

    <div class="profile-content">
      <!-- Personal Information Section -->
      <div class="profile-section">
        <div class="section-header">
          <h2><i class="icon-user"></i> Personal Information</h2>
          <button 
            @click="togglePersonalEdit" 
            class="edit-btn"
            :disabled="profileStore.isLoading"
          >
            {{ isEditingPersonal ? 'Cancel' : 'Edit' }}
          </button>
        </div>

        <div v-if="!isEditingPersonal" class="profile-display">
          <div class="profile-grid">
            <div class="profile-item">
              <label>Email:</label>
              <span>{{ personalForm.email || 'Not set' }}</span>
            </div>
            <div class="profile-item">
              <label>First Name:</label>
              <span>{{ personalForm.firstName || 'Not set' }}</span>
            </div>
            <div class="profile-item">
              <label>Last Name:</label>
              <span>{{ personalForm.lastName || 'Not set' }}</span>
            </div>
            <div class="profile-item">
              <label>Phone Number:</label>
              <span>{{ personalForm.phoneNumber || 'Not set' }}</span>
            </div>
            <div class="profile-item">
              <label>Address:</label>
              <span>{{ personalForm.address || 'Not set' }}</span>
            </div>
            <div class="profile-item">
              <label>Date of Birth:</label>
              <span>{{ formattedBirthDate }}</span>
            </div>
            <div class="profile-item">
              <label>Gender:</label>
              <span>{{ genderOptions.find(g => g.value === personalForm.gender)?.label || 'Not set' }}</span>
            </div>
            <div class="profile-item">
              <label>Email Verified:</label>
              <span class="verification-status" :class="{ verified: authStore.user?.emailVerified }">
                {{ authStore.user?.emailVerified ? '✓ Verified' : '✗ Not Verified' }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="profile-edit">
          <div class="form-grid">
            <div class="form-group">
              <label for="email">Email:</label>
              <input 
                id="email"
                v-model="personalForm.email" 
                type="email" 
                placeholder="Enter email address"
                readonly
                disabled
                title="Email cannot be changed"
              />
              <small class="field-note">Email cannot be modified</small>
            </div>
            <div class="form-group">
              <label for="firstName">First Name:</label>
              <input 
                id="firstName"
                v-model="personalForm.firstName" 
                type="text" 
                placeholder="Enter first name"
                required
                :class="{ 'error': profileStore.validationErrors.firstName }"
              />
              <span v-if="profileStore.validationErrors.firstName" class="error-text">
                {{ profileStore.validationErrors.firstName }}
              </span>
            </div>
            <div class="form-group">
              <label for="lastName">Last Name:</label>
              <input 
                id="lastName"
                v-model="personalForm.lastName" 
                type="text" 
                placeholder="Enter last name"
                required
                :class="{ 'error': profileStore.validationErrors.lastName }"
              />
              <span v-if="profileStore.validationErrors.lastName" class="error-text">
                {{ profileStore.validationErrors.lastName }}
              </span>
            </div>
            <div class="form-group">
              <label for="phoneNumber">Phone Number:</label>
              <input 
                id="phoneNumber"
                v-model="personalForm.phoneNumber" 
                type="tel" 
                placeholder="Enter phone number"
                :class="{ 'error': profileStore.validationErrors.phoneNumber }"
              />
              <span v-if="profileStore.validationErrors.phoneNumber" class="error-text">
                {{ profileStore.validationErrors.phoneNumber }}
              </span>
            </div>
            <div class="form-group">
              <label for="address">Address:</label>
              <textarea 
                id="address"
                v-model="personalForm.address" 
                placeholder="Enter your address"
                rows="3"
                :class="{ 'error': profileStore.validationErrors.address }"
              ></textarea>
              <span v-if="profileStore.validationErrors.address" class="error-text">
                {{ profileStore.validationErrors.address }}
              </span>
            </div>
            <div class="form-group">
              <label for="dateOfBirth">Date of Birth:</label>
              <input 
                id="dateOfBirth"
                v-model="personalForm.dateOfBirth" 
                type="date"
                :class="{ 'error': profileStore.validationErrors.dateOfBirth }"
              />
              <span v-if="profileStore.validationErrors.dateOfBirth" class="error-text">
                {{ profileStore.validationErrors.dateOfBirth }}
              </span>
            </div>
            <div class="form-group">
              <label for="gender">Gender:</label>
              <select id="gender" v-model="personalForm.gender">
                <option v-for="option in genderOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            <div class="form-group full-width">
              <label for="profilePicture">Profile Picture URL:</label>
              <input 
                id="profilePicture"
                v-model="personalForm.profilePicture" 
                type="url" 
                placeholder="Enter profile picture URL"
              />
            </div>
          </div>
          <div class="form-actions">
            <button @click="savePersonalInfo" class="save-btn" :disabled="profileStore.isLoading">
              Save Changes
            </button>
            <button @click="togglePersonalEdit" class="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Health Profile Section -->
      <div class="profile-section">
        <div class="section-header">
          <h2><i class="icon-heart"></i> Health Profile</h2>
          <button 
            @click="toggleHealthEdit" 
            class="edit-btn"
            :disabled="profileStore.isLoading"
          >
            {{ isEditingHealth ? 'Cancel' : 'Edit' }}
          </button>
        </div>

        <div v-if="!isEditingHealth" class="health-display">
          <div class="health-grid">
            <!-- Basic Health Metrics -->
            <div class="health-card">
              <h3>Physical Metrics</h3>
              <div class="metric-item">
                <label>Height:</label>
                <span>{{ healthForm.height || 'Not set' }} cm</span>
              </div>
              <div class="metric-item">
                <label>Weight:</label>
                <span>{{ healthForm.weight || 'Not set' }} kg</span>
              </div>
              <div class="metric-item" v-if="bmi">
                <label>BMI:</label>
                <span class="bmi-value" :class="getBMIClass(bmi)">{{ bmi }}</span>
              </div>
              <div class="metric-item">
                <label>Blood Type:</label>
                <span>{{ healthForm.bloodType.replace('_', ' ') || 'Not set' }}</span>
              </div>
            </div>

            <!-- Medical Conditions -->
            <div class="health-card">
              <h3>Medical Conditions</h3>
              <div v-if="healthForm.medicalConditions.length > 0" class="condition-list">
                <span v-for="condition in healthForm.medicalConditions" :key="condition" class="condition-tag">
                  {{ condition }}
                </span>
              </div>
              <div v-else class="empty-state">
                No medical conditions recorded
              </div>
            </div>

            <!-- Allergies -->
            <div class="health-card">
              <h3>Allergies</h3>
              <div v-if="healthForm.allergies.length > 0" class="allergy-list">
                <span v-for="allergy in healthForm.allergies" :key="allergy" class="allergy-tag">
                  {{ allergy }}
                </span>
              </div>
              <div v-else class="empty-state">
                No allergies recorded
              </div>
            </div>

            <!-- Emergency Contact -->
            <div class="health-card emergency-contact">
              <h3>Emergency Contact</h3>
              <div class="contact-info">
                <div class="contact-item">
                  <label>Name:</label>
                  <span>{{ healthForm.emergencyContactName || 'Not set' }}</span>
                </div>
                <div class="contact-item">
                  <label>Phone:</label>
                  <span>{{ healthForm.emergencyContactPhone || 'Not set' }}</span>
                </div>
                <div class="contact-item">
                  <label>Relationship:</label>
                  <span>{{ healthForm.emergencyContactRelationship || 'Not set' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Notes -->
          <div v-if="healthForm.additionalNotes" class="additional-notes">
            <h3>Additional Notes</h3>
            <p>{{ healthForm.additionalNotes }}</p>
          </div>
        </div>

        <div v-else class="health-edit">
          <div class="form-section">
            <h3>Physical Metrics</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="height">Height (cm):</label>
                <input 
                  id="height"
                  v-model.number="healthForm.height" 
                  type="number" 
                  placeholder="Enter height in cm"
                  min="0"
                />
              </div>
              <div class="form-group">
                <label for="weight">Weight (kg):</label>
                <input 
                  id="weight"
                  v-model.number="healthForm.weight" 
                  type="number" 
                  placeholder="Enter weight in kg"
                  min="0"
                  step="0.1"
                />
              </div>
              <div class="form-group">
                <label for="bloodType">Blood Type:</label>
                <select id="bloodType" v-model="healthForm.bloodType">
                  <option v-for="type in bloodTypeOptions" :key="type" :value="type">
                    {{ type.replace('_', ' ') }}
                  </option>
                </select>
              </div>
              <div v-if="bmi" class="form-group">
                <label>BMI:</label>
                <div class="bmi-display" :class="getBMIClass(bmi)">
                  {{ bmi }} - {{ getBMICategory(bmi) }}
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Medical Conditions</h3>
            <div class="tag-input-group">
              <div class="tag-input">
                <input 
                  v-model="newCondition"
                  type="text" 
                  placeholder="Add medical condition"
                  @keyup.enter="addCondition"
                />
                <button @click="addCondition" type="button" class="add-btn">Add</button>
              </div>
              <div class="tag-list">
                <span v-for="(condition, index) in healthForm.medicalConditions" :key="index" class="tag">
                  {{ condition }}
                  <button @click="removeCondition(index)" class="remove-tag">×</button>
                </span>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Allergies</h3>
            <div class="tag-input-group">
              <div class="tag-input">
                <input 
                  v-model="newAllergy"
                  type="text" 
                  placeholder="Add allergy"
                  @keyup.enter="addAllergy"
                />
                <button @click="addAllergy" type="button" class="add-btn">Add</button>
              </div>
              <div class="tag-list">
                <span v-for="(allergy, index) in healthForm.allergies" :key="index" class="tag">
                  {{ allergy }}
                  <button @click="removeAllergy(index)" class="remove-tag">×</button>
                </span>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Emergency Contact</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="emergencyContactName">Name:</label>
                <input 
                  id="emergencyContactName"
                  v-model="healthForm.emergencyContactName" 
                  type="text" 
                  placeholder="Emergency contact name"
                />
              </div>
              <div class="form-group">
                <label for="emergencyContactPhone">Phone:</label>
                <input 
                  id="emergencyContactPhone"
                  v-model="healthForm.emergencyContactPhone" 
                  type="tel" 
                  placeholder="Emergency contact phone"
                  :class="{ 'error': profileStore.validationErrors.emergencyContactPhone }"
                />
                <span v-if="profileStore.validationErrors.emergencyContactPhone" class="error-text">
                  {{ profileStore.validationErrors.emergencyContactPhone }}
                </span>
              </div>
              <div class="form-group">
                <label for="emergencyContactRelationship">Relationship:</label>
                <input 
                  id="emergencyContactRelationship"
                  v-model="healthForm.emergencyContactRelationship" 
                  type="text" 
                  placeholder="Relationship (e.g., spouse, parent)"
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Additional Notes</h3>
            <div class="form-group full-width">
              <textarea 
                v-model="healthForm.additionalNotes" 
                placeholder="Any additional health information, medical history, or notes"
                rows="4"
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button @click="saveHealthProfile" class="save-btn" :disabled="profileStore.isLoading">
              Save Health Profile
            </button>
            <button @click="toggleHealthEdit" class="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8fafb;
  min-height: 100vh;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3498db;
  font-weight: 500;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid #e3f2fd;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #e74c3c;
  font-weight: 500;
  padding: 0.75rem 1rem;
  background: #fdf2f2;
  border: 1px solid #e74c3c;
  border-radius: 8px;
}

.profile-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-user::before {
  content: "👤";
}

.icon-heart::before {
  content: "❤️";
}

.edit-btn, .save-btn, .cancel-btn, .add-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.edit-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.edit-btn:hover {
  background: rgba(255, 255, 255, 0.3);
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

.add-btn {
  background: #3498db;
  color: white;
  padding: 0.5rem 0.75rem;
}

.add-btn:hover {
  background: #2980b9;
}

/* Profile Display Styles */
.profile-display, .health-display {
  padding: 1.5rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.profile-item {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.profile-item label {
  font-weight: 600;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.profile-item span {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 500;
}

.verification-status {
  font-weight: 600;
}

.verification-status.verified {
  color: #27ae60;
}

.verification-status:not(.verified) {
  color: #e74c3c;
}

/* Health Display Styles */
.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.health-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

.health-card h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.metric-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.metric-item label {
  font-weight: 500;
  color: #7f8c8d;
}

.metric-item span {
  font-weight: 600;
  color: #2c3e50;
}

.bmi-value {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.bmi-value.underweight {
  background: #e3f2fd;
  color: #1976d2;
}

.bmi-value.normal {
  background: #e8f5e8;
  color: #2e7d32;
}

.bmi-value.overweight {
  background: #fff3e0;
  color: #f57c00;
}

.bmi-value.obese {
  background: #ffebee;
  color: #d32f2f;
}

.condition-list, .allergy-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.condition-tag, .allergy-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.allergy-tag {
  background: #fff3e0;
  color: #f57c00;
}

.empty-state {
  color: #7f8c8d;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}

.emergency-contact {
  background: #fff5f5;
  border: 1px solid #ffcdd2;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-item {
  display: flex;
  justify-content: space-between;
}

.contact-item label {
  font-weight: 500;
  color: #7f8c8d;
}

.contact-item span {
  font-weight: 600;
  color: #2c3e50;
}

.additional-notes {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

.additional-notes h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.additional-notes p {
  margin: 0;
  color: #2c3e50;
  line-height: 1.6;
}

/* Form Styles */
.profile-edit, .health-edit {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  background: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #e74c3c;
  background-color: #fdf2f2;
}

.error-text {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

.field-note {
  color: #7f8c8d;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
  font-style: italic;
}

.form-group input:disabled,
.form-group input[readonly] {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  border-color: #e9ecef;
}

.bmi-display {
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
  border: 2px solid transparent;
}

.tag-input-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tag-input {
  display: flex;
  gap: 0.5rem;
}

.tag-input input {
  flex: 1;
  padding: 0.5rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.9rem;
}

.tag-input input:focus {
  outline: none;
  border-color: #3498db;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-tag {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  padding: 0;
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.remove-tag:hover {
  background: rgba(25, 118, 210, 0.1);
}

.form-actions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-view {
    padding: 1rem;
  }
  
  .profile-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .profile-grid,
  .health-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

/* Animation for smooth transitions */
.profile-section {
  transition: all 0.3s ease;
}

.profile-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
