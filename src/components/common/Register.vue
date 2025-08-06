<template>
  <div class="registration-form">
    <h2>Register New User</h2>
    <form @submit.prevent="handleRegister" class="auth-form">
      <div class="form-group">
        <label for="name">Name</label>
        <input id="name" v-model="name" type="text" required placeholder="Enter your name" class="form-input" />
      </div>
      <div class="form-group">
        <label for="age">Age</label>
        <input id="age" v-model="age" type="number" required min="0" placeholder="Enter your age" class="form-input" />
      </div>
      <div class="form-group">
        <label for="contact">Contact Number</label>
        <input id="contact" v-model="contact" type="tel" required placeholder="Enter your contact number" class="form-input" />
      </div>
      <div class="form-group">
        <label for="weight">Weight (kg)</label>
        <input id="weight" v-model="weight" type="number" required min="0" placeholder="Enter your weight" class="form-input" />
      </div>
      <div class="form-group">
        <label for="height">Height (cm)</label>
        <input id="height" v-model="height" type="number" required min="0" placeholder="Enter your height" class="form-input" />
      </div>
      <div class="form-group">
        <label for="username">Username</label>
        <input id="username" v-model="username" type="text" required placeholder="Enter your username" class="form-input" :class="{ error: errors.username }" @blur="checkUsernameTaken" />
        <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" required placeholder="Enter your email" class="form-input" :class="{ error: errors.email }" @blur="checkEmailTaken" />
        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <div class="input-wrapper">
          <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" required placeholder="Enter your password" class="form-input" :class="{ error: errors.password }" />
          <button type="button" class="password-toggle" @click="showPassword = !showPassword">
            <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2"/>
              <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
      </div>
      <button type="submit" class="register-btn">Register</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { emailUserNameCollection } from '../../data/emailUserNameCollection.js'
import { useAuthStore } from '../../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const age = ref('')
const contact = ref('')
const weight = ref('')
const height = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errors = ref({})

function checkEmailTaken() {
  if (email.value.trim() && emailUserNameCollection.some(u => u.email.toLowerCase() === email.value.trim().toLowerCase())) {
    errors.value.email = 'Email Already Taken'
  } else if (errors.value.email === 'Email Already Taken') {
    delete errors.value.email
  }
}

function checkUsernameTaken() {
  if (username.value.trim() && emailUserNameCollection.some(u => u.username.toLowerCase() === username.value.trim().toLowerCase())) {
    errors.value.username = 'Username Already Taken'
  } else if (errors.value.username === 'Username Already Taken') {
    delete errors.value.username
  }
}

function validate() {
  const newErrors = {}
  // Password: required, min 6 chars, at least one letter and one number
  if (!password.value) {
    newErrors.password = 'Password is required.'
  } else if (password.value.length < 6) {
    newErrors.password = 'Password must be at least 6 characters.'
  } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password.value)) {
    newErrors.password = 'Password must contain letters and numbers.'
  }
  // Username: required, alphanumeric, 3-16 chars
  if (!username.value.trim()) {
    newErrors.username = 'Username is required.'
  } else if (!/^[A-Za-z0-9_]{3,16}$/.test(username.value)) {
    newErrors.username = 'Username must be 3-16 characters, letters, numbers, or underscores.'
  } else if (emailUserNameCollection.some(u => u.username.toLowerCase() === username.value.trim().toLowerCase())) {
    newErrors.username = 'Username Already Taken'
  }
  // Email: required, valid format
  if (!email.value.trim()) {
    newErrors.email = 'Email is required.'
  } else if (!/^\S+@\S+\.\S+$/.test(email.value)) {
    newErrors.email = 'Enter a valid email address.'
  } else if (emailUserNameCollection.some(u => u.email.toLowerCase() === email.value.trim().toLowerCase())) {
    newErrors.email = 'Email Already Taken'
  }
  // Password: required, min 6 chars
  if (!password.value.trim()) {
    newErrors.password = 'Password is required.'
  } else if (password.value.length < 6) {
    newErrors.password = 'Password must be at least 6 characters long.'
  }
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

const handleRegister = async () => {
  if (!validate()) return
  // Prepare new user object
  const newUser = {
    name: name.value,
    age: age.value,
    contact: contact.value,
    weight: weight.value,
    height: height.value,
    username: username.value,
    email: email.value,
    password: password.value
  }
  console.log('New User:', newUser);
  // Push to auth store
  await authStore.registerUser(newUser)
  // Redirect to login
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
.input-wrapper {
  position: relative;
}
.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  z-index: 3;
}
.password-toggle:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
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
}
.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
}
.error-message {
  color: red;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
