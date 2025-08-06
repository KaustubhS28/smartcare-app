<template>
  <div class="login-page">
    <!-- Background Elements -->
    <div class="background-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <div class="login-container">
      <!-- Application Name/Brand at Top -->
      <div class="brand-header">
        <BrandSection />
      </div>

      <!-- Centered Auth Form -->
      <div class="auth-form-container">
        <!-- Mode Toggle -->
        <div class="auth-mode-toggle">
          <button 
            :class="{ active: isLoginMode }"
            @click="setMode('login')"
            class="mode-toggle-btn"
          >
            Login
          </button>
          <button 
            :class="{ active: !isLoginMode }"
            @click="setMode('signup')"
            class="mode-toggle-btn"
          >
            Sign Up
          </button>
        </div>

        <!-- Auth Form -->
        <div class="auth-form">
          <h2 class="auth-title">
            {{ isLoginMode ? 'Welcome Back' : 'Create Account' }}
          </h2>
          <p class="auth-subtitle">
            {{ isLoginMode ? 'Sign in to your SmartCare account' : 'Join SmartCare today' }}
          </p>

          <form @submit.prevent="handleSubmit" class="form">
            <!-- First Name field (signup only) -->
            <div v-if="!isLoginMode" class="form-group">
              <label for="firstName">First Name</label>
              <input
                id="firstName"
                v-model="formData.firstName"
                type="text"
                required
                placeholder="Enter your first name"
                :disabled="isLoading"
                maxlength="50"
                pattern="[A-Za-z\s]+"
                title="First name must contain only letters and spaces"
              />
              <div v-if="validationErrors.firstName" class="field-error">
                {{ validationErrors.firstName }}
              </div>
            </div>

            <!-- Last Name field (signup only) -->
            <div v-if="!isLoginMode" class="form-group">
              <label for="lastName">Last Name</label>
              <input
                id="lastName"
                v-model="formData.lastName"
                type="text"
                required
                placeholder="Enter your last name"
                :disabled="isLoading"
                maxlength="50"
                pattern="[A-Za-z\s]+"
                title="Last name must contain only letters and spaces"
              />
              <div v-if="validationErrors.lastName" class="field-error">
                {{ validationErrors.lastName }}
              </div>
            </div>

            <!-- Username field (signup only) -->
            <div v-if="!isLoginMode" class="form-group">
              <label for="username">Username</label>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                required
                placeholder="Choose a username (3-20 characters)"
                :disabled="isLoading"
                minlength="3"
                maxlength="20"
                pattern="[a-zA-Z0-9_]+"
                title="Username must be 3-20 characters (letters, numbers, underscore only)"
              />
              <div v-if="validationErrors.username" class="field-error">
                {{ validationErrors.username }}
              </div>
            </div>

            <!-- Email field -->
            <div class="form-group">
              <label for="email">{{ isLoginMode ? 'Email or Username' : 'Email' }}</label>
              <input
                id="email"
                v-model="formData.email"
                :type="isLoginMode ? 'text' : 'email'"
                required
                :placeholder="isLoginMode ? 'Enter your email or username' : 'Enter your email address'"
                :disabled="isLoading"
                minlength="3"
                maxlength="50"
              />
              <div v-if="validationErrors.email" class="field-error">
                {{ validationErrors.email }}
              </div>
            </div>

            <!-- Password field -->
            <div class="form-group">
              <label for="password">Password</label>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                required
                :placeholder="isLoginMode ? 'Enter your password' : 'Create a password (min 8 chars, 1 letter, 1 number)'"
                :minlength="isLoginMode ? 1 : 8"
                :maxlength="100"
                :disabled="isLoading"
              />
              <div v-if="validationErrors.password" class="field-error">
                {{ validationErrors.password }}
              </div>
              <!-- Password strength indicator for signup -->
              <div v-if="!isLoginMode && formData.password" class="password-strength">
                <div class="strength-bar" :class="passwordStrength.class">
                  <div class="strength-fill" :style="{ width: passwordStrength.percent + '%' }"></div>
                </div>
                <span class="strength-text">{{ passwordStrength.text }}</span>
              </div>
            </div>

            <!-- Confirm Password field (signup only) -->
            <div v-if="!isLoginMode" class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                type="password"
                required
                placeholder="Confirm your password"
                :disabled="isLoading"
                minlength="8"
                maxlength="100"
              />
              <div v-if="validationErrors.confirmPassword" class="field-error">
                {{ validationErrors.confirmPassword }}
              </div>
            </div>

            <!-- Phone field (signup only) -->
            <div v-if="!isLoginMode" class="form-group">
              <label for="phone">Phone Number (Optional)</label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                placeholder="Enter your phone number"
                :disabled="isLoading"
                pattern="[\+]?[\d\s\-\(\)\.]+"
                title="Please enter a valid phone number"
              />
              <div v-if="validationErrors.phone" class="field-error">
                {{ validationErrors.phone }}
              </div>
            </div>

            <!-- Error message -->
            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <!-- Success message -->
            <div v-if="successMessage" class="success-message">
              {{ successMessage }}
            </div>

            <!-- Submit button -->
            <button 
              type="submit" 
              class="submit-btn"
              :disabled="isLoading"
            >
              <span v-if="isLoading">
                {{ isLoginMode ? 'Signing in...' : 'Creating Account...' }}
              </span>
              <span v-else>
                {{ isLoginMode ? 'Sign In' : 'Create Account' }}
              </span>
            </button>
          </form>
        </div>
      </div>

      <!-- Demo Users Section (login mode only) -->
      <div v-if="isLoginMode" class="demo-section">
        <div class="divider">
          <span>Or try demo accounts</span>
        </div>

        <div class="demo-users">
          <h3>Demo User Accounts</h3>
          <p class="demo-description">
            Click any user below to login instantly and explore their healthcare data
          </p>
          
          <div class="demo-user-tiles">
            <DemoUserCard
              v-for="user in demoUsers"
              :key="user.id"
              :user="user"
              :is-loading="isLoading"
              @click="loginAsDemoUser"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BrandSection from '../components/common/BrandSection.vue'
import DemoUserCard from '../components/common/DemoUserCard.vue'

const router = useRouter()
const authStore = useAuthStore()

// Reactive state
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isLoginMode = ref(true)
const validationErrors = ref({})

// Form data
const formData = reactive({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: ''
})

// Password strength computation
const passwordStrength = computed(() => {
  const password = formData.password
  if (!password) return { percent: 0, text: '', class: '' }
  
  let score = 0
  let feedback = []
  
  // Length check
  if (password.length >= 8) score += 25
  else feedback.push('at least 8 characters')
  
  // Letter check
  if (/[A-Za-z]/.test(password)) score += 25
  else feedback.push('at least one letter')
  
  // Number check
  if (/\d/.test(password)) score += 25
  else feedback.push('at least one number')
  
  // Special character check
  if (/[@$!%*#?&]/.test(password)) score += 25
  else feedback.push('special characters recommended')
  
  let text, className
  if (score < 50) {
    text = 'Weak'
    className = 'weak'
  } else if (score < 75) {
    text = 'Fair'
    className = 'fair'
  } else if (score < 100) {
    text = 'Good'
    className = 'good'
  } else {
    text = 'Strong'
    className = 'strong'
  }
  
  if (feedback.length > 0) {
    text += ` (needs: ${feedback.join(', ')})`
  }
  
  return { percent: score, text, class: className }
})

// Demo users data
const demoUsers = [
  {
    id: 1,
    name: 'Demo User',
    email: 'demo@smartcare.com',
    password: 'demo',
    role: 'Demo Account',
    description: 'Explore all SmartCare features',
    avatar: '/api/placeholder/80/80',
    stats: { appointments: 3, medications: 2 }
  },
  {
    id: 2,
    name: 'Test User',
    email: 'testuser',
    password: 'test123',
    role: 'Test Account',
    description: 'Alternative demo account for testing',
    avatar: '/api/placeholder/80/80',
    stats: { appointments: 2, medications: 1 }
  }
]

// Methods
const setMode = (mode) => {
  isLoginMode.value = mode === 'login'
  errorMessage.value = ''
  successMessage.value = ''
  validationErrors.value = {}
  // Clear form when switching modes
  Object.keys(formData).forEach(key => {
    formData[key] = ''
  })
}

// Validation according to API specification
const validateForm = () => {
  validationErrors.value = {}
  const errors = {}

  if (isLoginMode.value) {
    // Login validation
    if (!formData.email) {
      errors.email = 'Username or email is required'
    }
    if (!formData.password) {
      errors.password = 'Password is required'
    }
  } else {
    // Registration validation according to API spec
    
    // First name validation (1-50 characters, letters only)
    if (!formData.firstName?.trim()) {
      errors.firstName = 'First name is required'
    } else if (formData.firstName.length > 50) {
      errors.firstName = 'First name must be 50 characters or less'
    } else if (!/^[A-Za-z\s]+$/.test(formData.firstName)) {
      errors.firstName = 'First name must contain only letters and spaces'
    }

    // Last name validation (1-50 characters, letters only)
    if (!formData.lastName?.trim()) {
      errors.lastName = 'Last name is required'
    } else if (formData.lastName.length > 50) {
      errors.lastName = 'Last name must be 50 characters or less'
    } else if (!/^[A-Za-z\s]+$/.test(formData.lastName)) {
      errors.lastName = 'Last name must contain only letters and spaces'
    }

    // Username validation (3-20 characters, alphanumeric + underscore)
    if (!formData.username?.trim()) {
      errors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    } else if (formData.username.length > 20) {
      errors.username = 'Username must be 20 characters or less'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username must contain only letters, numbers, and underscores'
    }

    // Email validation
    if (!formData.email?.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Password validation (min 8 chars, 1 letter, 1 number)
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/.test(formData.password)) {
      errors.password = 'Password must contain at least one letter and one number'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    // Phone validation (optional, but if provided must be valid format)
    if (formData.phone?.trim() && !/^[\+]?[\d\s\-\(\)\.]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number'
    }
  }

  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (isLoginMode.value) {
      await handleLogin()
    } else {
      await handleSignup()
    }
  } catch (error) {
    console.error('Auth error:', error)
    errorMessage.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleLogin = async () => {
  console.log('Login attempt:', formData.email)
  
  try {
    const result = await authStore.login({
      usernameOrEmail: formData.email, // Backend expects usernameOrEmail field
      password: formData.password
    })
    
    console.log('Login result:', result)
    
    if (result.success) {
      console.log('Login successful, redirecting to dashboard...')
      await router.push({ name: 'dashboard' })
    } else {
      errorMessage.value = result.error || 'Invalid email or password. Use demo@smartcare.com / demo or testuser / test123.'
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = 'Login failed. Please try again.'
  }
}

const handleSignup = async () => {
  console.log('Signup attempt:', formData.email)
  
  try {
    const userData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      ...(formData.phone?.trim() && { phoneNumber: formData.phone.trim() })
    }

    console.log('Calling authStore.register with:', userData)
    const result = await authStore.register(userData)
    
    console.log('Signup result:', result)
    
    if (result.success) {
      // Registration successful - switch to login mode and show success message
      successMessage.value = result.message || 'Account created successfully! Please log in with your credentials.'
      
      // Pre-fill login form with username or email for login
      formData.email = userData.username // Use username for login
      formData.password = '' // Clear password for security
      
      // Clear other fields
      formData.firstName = ''
      formData.lastName = ''
      formData.username = ''
      formData.confirmPassword = ''
      formData.phone = ''
      validationErrors.value = {}
      
      // Switch to login mode after a short delay
      setTimeout(() => {
        setMode('login')
        successMessage.value = 'Please log in with your new account'
      }, 2000)
      
    } else if (result.validationErrors) {
      // Handle validation errors from backend
      console.error('Signup validation errors:', result.validationErrors)
      validationErrors.value = result.validationErrors
      errorMessage.value = 'Please correct the errors below'
    } else {
      console.error('Signup failed:', result.error)
      errorMessage.value = result.error || 'Registration failed. Please try again.'
    }
  } catch (error) {
    console.error('Signup error:', error)
    errorMessage.value = 'Registration failed. Please try again.'
  }
}

const loginAsDemoUser = async (user) => {
  console.log('Demo login attempt:', user.email)
  
  isLoading.value = true
  errorMessage.value = ''
  
  // Fill the form with demo user credentials
  formData.email = user.email
  formData.password = user.password
  
  try {
    console.log('Calling authStore.login for demo user...')
    const result = await authStore.login({
      usernameOrEmail: user.email,
      password: user.password
    })
    console.log('Demo login result:', result)
    
    if (result.success) {
      console.log('Demo login successful, redirecting to dashboard...')
      await router.push({ name: 'dashboard' })
    } else {
      errorMessage.value = result.error || 'Demo login failed. Please try again.'
    }
  } catch (error) {
    console.error('Demo login error:', error)
    errorMessage.value = 'Demo login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Clear messages when switching modes
watch(isLoginMode, () => {
  errorMessage.value = ''
  successMessage.value = ''
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 2rem 1rem;
}

.background-shapes {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 300px;
  height: 300px;
  top: 50%;
  right: -150px;
  animation-delay: 2s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-30px) rotate(120deg);
  }
  66% {
    transform: translateY(20px) rotate(240deg);
  }
}

.login-container {
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.brand-header {
  text-align: center;
  margin-bottom: 1rem;
}

.auth-form-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.auth-mode-toggle {
  display: flex;
  margin-bottom: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}

.mode-toggle-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #6c757d;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-toggle-btn.active {
  background: white;
  color: #495057;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.auth-form {
  text-align: center;
}

.auth-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.auth-subtitle {
  color: #6c757d;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.form {
  text-align: left;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.95rem;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

/* Form field validation styles */
.field-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.form-group input:invalid {
  border-color: #dc3545;
}

.form-group input:invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

/* Password strength indicator */
.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 2px;
}

.strength-bar.weak .strength-fill {
  background-color: #dc3545;
}

.strength-bar.fair .strength-fill {
  background-color: #fd7e14;
}

.strength-bar.good .strength-fill {
  background-color: #20c997;
}

.strength-bar.strong .strength-fill {
  background-color: #198754;
}

.strength-text {
  font-size: 0.75rem;
  color: var(--text-secondary, #6b7280);
  display: block;
}

/* Enhanced form validation feedback */
.form-group {
  position: relative;
}

.form-group input.has-error {
  border-color: #dc3545;
  background-color: #fff5f5;
}

.form-group input.has-success {
  border-color: #198754;
  background-color: #f0f9ff;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
  font-size: 0.9rem;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
  font-size: 0.9rem;
}

.submit-btn {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.demo-section {
  margin-top: 2rem;
}

.divider {
  position: relative;
  text-align: center;
  margin: 2rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
}

.divider span {
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: #2c3e50;
  font-weight: 500;
  position: relative;
  z-index: 1;
}

.demo-users {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.demo-users h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.demo-description {
  color: #6c757d;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.demo-user-tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .login-page {
    padding: 1rem;
  }

  .login-container {
    max-width: 100%;
  }

  .auth-form-container,
  .demo-users {
    padding: 1.5rem;
  }

  .auth-title {
    font-size: 1.75rem;
  }

  .demo-user-tiles {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .auth-form-container,
  .demo-users {
    padding: 1rem;
  }

  .auth-title {
    font-size: 1.5rem;
  }

  .mode-toggle-btn {
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  .shape-1 {
    width: 200px;
    height: 200px;
    top: 10%;
    left: 10%;
    animation-delay: -2s;
  }
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 20%;
  animation-delay: -4s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 30%;
  animation-delay: -1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.login-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  min-height: calc(100vh - 4rem);
  padding-bottom: 2rem;
}

/* Brand Header at Top */
.brand-header {
  text-align: center;
  margin-bottom: 1rem;
  width: 100%;
}

/* Centered Login Form Container */
.login-form-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 3;
}

/* Demo Section Styling */
.demo-section {
  width: 100%;
  max-width: 1000px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
}

.divider {
  display: flex;
  align-items: center;
  margin: 0 0 2rem 0;
  color: var(--text-secondary, #6b7280);
  font-size: 0.9rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color, #e5e7eb);
}

.divider span {
  padding: 0 1.5rem;
  font-weight: 500;
}

.demo-users h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary, #1f2937);
  margin-bottom: 0.75rem;
  text-align: center;
}

.demo-description {
  color: var(--text-secondary, #6b7280);
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1rem;
  line-height: 1.5;
}

/* Demo User Tiles Grid */
.demo-user-tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .demo-user-tiles {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
  }
  
  .login-container {
    max-width: 95%;
  }
}

@media (max-width: 768px) {
  .login-page {
    padding: 1rem 0.5rem;
  }

  .login-container {
    gap: 2rem;
    max-width: 100%;
    min-height: calc(100vh - 2rem);
  }

  .login-form-container {
    padding: 2rem;
    max-width: 100%;
  }

  .demo-section {
    padding: 2rem;
  }

  .demo-user-tiles {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .demo-users h3 {
    font-size: 1.25rem;
  }

  .demo-description {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 1rem 0.25rem;
  }

  .login-form-container {
    padding: 1.5rem;
    border-radius: 16px;
  }

  .demo-section {
    padding: 1.5rem;
    border-radius: 16px;
  }

  .brand-header {
    margin-bottom: 0.5rem;
  }

  .login-container {
    gap: 1.5rem;
  }
}

/* Enhanced animations for better visual appeal */
.login-form-container {
  animation: slideUp 0.6s ease-out;
}

.demo-section {
  animation: slideUp 0.8s ease-out;
}

.brand-header {
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Additional hover effects for tiles */
.demo-user-tiles :deep(.demo-user-card) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.demo-user-tiles :deep(.demo-user-card:hover:not(.loading)) {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}
</style>