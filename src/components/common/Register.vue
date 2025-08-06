<template>
  <div class="registration-form">
    <h2>Register New User</h2>
    <form @submit.prevent="handleRegister" class="auth-form" novalidate>
      <div class="form-group">
        <label for="name">Name</label>
        <input id="name" v-model="name" type="text" required placeholder="Enter your name" class="form-input" :class="{ error: errors.name }" />
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>
      <div class="form-group">
        <label for="age">Age</label>
        <input id="age" v-model="age" type="number" required min="0" placeholder="Enter your age" class="form-input" :class="{ error: errors.age }" />
        <span v-if="errors.age" class="error-message">{{ errors.age }}</span>
      </div>
      <div class="form-group">
        <label for="contact">Contact Number</label>
        <input id="contact" v-model="contact" type="tel" required placeholder="Enter your contact number" class="form-input" :class="{ error: errors.contact }" />
        <span v-if="errors.contact" class="error-message">{{ errors.contact }}</span>
      </div>
      <div class="form-group">
        <label for="weight">Weight (kg)</label>
        <input id="weight" v-model="weight" type="number" required min="0" placeholder="Enter your weight" class="form-input" :class="{ error: errors.weight }" />
        <span v-if="errors.weight" class="error-message">{{ errors.weight }}</span>
      </div>
      <div class="form-group">
        <label for="height">Height (cm)</label>
        <input id="height" v-model="height" type="number" required min="0" placeholder="Enter your height" class="form-input" :class="{ error: errors.height }" />
        <span v-if="errors.height" class="error-message">{{ errors.height }}</span>
      </div>
      <button type="submit" class="register-btn">Register</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const name = ref('')
const age = ref('')
const contact = ref('')
const weight = ref('')
const height = ref('')
const errors = ref({})
const router = useRouter()

function validate() {
  const newErrors = {}
  // Name: only letters and spaces
  if (!name.value.trim()) {
    newErrors.name = 'Name is required.'
  } else if (!/^[A-Za-z ]+$/.test(name.value)) {
    newErrors.name = 'Name must contain only letters.'
  }
  // Age: only numbers, >0
  if (!age.value || isNaN(age.value) || age.value <= 0) {
    newErrors.age = 'Valid age is required.'
  }
  // Contact: 10+ digits
  if (!contact.value.trim() || !/^\d{10,}$/.test(contact.value)) {
    newErrors.contact = 'Valid contact number is required.'
  }
  // Weight: only numbers, >0
  if (!weight.value || isNaN(weight.value) || weight.value <= 0) {
    newErrors.weight = 'Valid weight is required.'
  }
  // Height: only numbers, >0
  if (!height.value || isNaN(height.value) || height.value <= 0) {
    newErrors.height = 'Valid height is required.'
  }
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleRegister = () => {
  if (!validate()) return
  // Registration logic here (e.g., API call)
  // For now, just redirect to login
  router.push('/login')
}
</script>

<style scoped>
.registration-form {
  max-width: 400px;
  margin: 0 auto;
}
.registration-form h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  text-align: center;
}
.auth-form {
  margin-bottom: 2rem;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}
.form-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--bg-primary);
  box-sizing: border-box;
}
.form-input.error {
  border-color: var(--danger-color);
}
.error-message {
  color: var(--danger-color);
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}
.register-btn {
  width: 100%;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
}
</style>
