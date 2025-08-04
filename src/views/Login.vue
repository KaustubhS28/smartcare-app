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

      <!-- Centered Login Form -->
      <div class="login-form-container">
        <LoginForm
          ref="loginFormRef"
          :error-message="loginError"
          :is-loading="isLoading"
          @submit="handleLogin"
          @update:email="email = $event"
          @update:password="password = $event"
        />
      </div>

      <!-- Demo Users as Tiles Below -->
      <div class="demo-section">
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BrandSection from '../components/common/BrandSection.vue'
import LoginForm from '../components/common/LoginForm.vue'
import DemoUserCard from '../components/common/DemoUserCard.vue'

const router = useRouter()
const authStore = useAuthStore()

// Reactive state
const isLoading = ref(false)
const loginError = ref('')
const email = ref('')
const password = ref('')
const loginFormRef = ref(null)

// Demo users data
const demoUsers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    password: 'demo123',
    role: 'Working Professional',
    description: 'Manages hypertension, active lifestyle',
    avatar: '/api/placeholder/80/80',
    stats: { appointments: 5, medications: 3 }
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    password: 'demo123',
    role: 'Diabetes Patient',
    description: 'Type 2 diabetes management, regular monitoring',
    avatar: '/api/placeholder/80/80',
    stats: { appointments: 8, medications: 5 }
  },
  {
    id: 3,
    name: 'Emma Davis',
    email: 'emma.davis@email.com',
    password: 'demo123',
    role: 'Young Adult',
    description: 'Preventive care, fitness tracking',
    avatar: '/api/placeholder/80/80',
    stats: { appointments: 3, medications: 1 }
  },
  {
    id: 4,
    name: 'Robert Williams',
    email: 'robert.williams@email.com',
    password: 'demo123',
    role: 'Senior Patient',
    description: 'Multiple conditions, complex medication routine',
    avatar: '/api/placeholder/80/80',
    stats: { appointments: 12, medications: 8 }
  }
]

// Methods
const handleLogin = async (credentials) => {
  console.log('Login attempt:', credentials)
  
  if (!credentials.email || !credentials.password) {
    loginError.value = 'Please enter both email and password'
    return
  }

  isLoading.value = true
  loginError.value = ''

  try {
    console.log('Calling authStore.login...')
    const success = await authStore.login(credentials.email, credentials.password)
    console.log('Login result:', success)
    
    if (success) {
      console.log('Login successful, redirecting to dashboard...')
      await router.push({ name: 'dashboard' })
    } else {
      loginError.value = 'Invalid email or password. Use one of the demo accounts or password "demo123".'
    }
  } catch (error) {
    console.error('Login error:', error)
    loginError.value = 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const loginAsDemoUser = async (user) => {
  console.log('Demo login attempt:', user.email)
  
  isLoading.value = true
  loginError.value = ''
  
  // Fill the form with demo user credentials
  email.value = user.email
  password.value = user.password
  
  // Update the form component
  if (loginFormRef.value) {
    loginFormRef.value.setCredentials(user.email, user.password)
  }
  
  try {
    console.log('Calling authStore.login for demo user...')
    const success = await authStore.login(user.email, user.password)
    console.log('Demo login result:', success)
    
    if (success) {
      console.log('Demo login successful, redirecting to dashboard...')
      await router.push({ name: 'dashboard' })
    } else {
      loginError.value = 'Demo login failed. Please try again.'
    }
  } catch (error) {
    console.error('Demo login error:', error)
    loginError.value = 'Demo login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
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
  left: 10%;
  animation-delay: -2s;
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