import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const currentUser = ref(null)
  const isLoading = ref(false)

  // Demo user profiles with different healthcare data
  const userProfiles = {
    'sarah.johnson@email.com': {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      avatar: '/api/placeholder/150/150',
      dateOfBirth: '1985-06-15',
      bloodType: 'O+',
      phone: '(555) 123-4567',
      address: '123 Main Street, Seattle, WA 98101',
      emergencyContact: {
        name: 'John Johnson',
        relationship: 'Spouse',
        phone: '(555) 987-6543'
      },
      healthData: {
        healthScore: 92,
        vitals: {
          bloodPressure: { systolic: 120, diastolic: 80, date: '2024-01-08' },
          heartRate: { value: 72, date: '2024-01-08' },
          temperature: { value: 98.6, date: '2024-01-08' },
          weight: { value: 165, date: '2024-01-07' },
          height: { value: "5'8\"", date: '2023-12-01' }
        },
        conditions: ['Hypertension'],
        allergies: ['Penicillin', 'Peanuts'],
        medications: [
          { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
          { name: 'Vitamin D3', dosage: '2000 IU', frequency: 'Once daily' }
        ]
      }
    },
    'michael.chen@email.com': {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      avatar: '/api/placeholder/150/150',
      dateOfBirth: '1978-03-22',
      bloodType: 'A+',
      phone: '(555) 234-5678',
      address: '456 Oak Avenue, Portland, OR 97201',
      emergencyContact: {
        name: 'Lisa Chen',
        relationship: 'Wife',
        phone: '(555) 876-5432'
      },
      healthData: {
        healthScore: 85,
        vitals: {
          bloodPressure: { systolic: 135, diastolic: 85, date: '2024-01-08' },
          heartRate: { value: 78, date: '2024-01-08' },
          temperature: { value: 98.4, date: '2024-01-08' },
          weight: { value: 180, date: '2024-01-07' },
          height: { value: "5'10\"", date: '2023-12-01' }
        },
        conditions: ['Type 2 Diabetes', 'Prediabetes'],
        allergies: ['Shellfish'],
        medications: [
          { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
          { name: 'Lisinopril', dosage: '5mg', frequency: 'Once daily' },
          { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily' }
        ]
      }
    },
    'emma.davis@email.com': {
      id: 3,
      name: 'Emma Davis',
      email: 'emma.davis@email.com',
      avatar: '/api/placeholder/150/150',
      dateOfBirth: '1995-11-08',
      bloodType: 'B-',
      phone: '(555) 345-6789',
      address: '789 Pine Street, San Francisco, CA 94102',
      emergencyContact: {
        name: 'David Davis',
        relationship: 'Father',
        phone: '(555) 765-4321'
      },
      healthData: {
        healthScore: 96,
        vitals: {
          bloodPressure: { systolic: 110, diastolic: 70, date: '2024-01-08' },
          heartRate: { value: 65, date: '2024-01-08' },
          temperature: { value: 98.2, date: '2024-01-08' },
          weight: { value: 140, date: '2024-01-07' },
          height: { value: "5'6\"", date: '2023-12-01' }
        },
        conditions: [],
        allergies: ['Latex'],
        medications: [
          { name: 'Birth Control', dosage: '0.15mg', frequency: 'Once daily' },
          { name: 'Multivitamin', dosage: '1 tablet', frequency: 'Once daily' }
        ]
      }
    },
    'robert.williams@email.com': {
      id: 4,
      name: 'Robert Williams',
      email: 'robert.williams@email.com',
      avatar: '/api/placeholder/150/150',
      dateOfBirth: '1952-07-14',
      bloodType: 'AB+',
      phone: '(555) 456-7890',
      address: '321 Elm Drive, Phoenix, AZ 85001',
      emergencyContact: {
        name: 'Mary Williams',
        relationship: 'Wife',
        phone: '(555) 654-3210'
      },
      healthData: {
        healthScore: 78,
        vitals: {
          bloodPressure: { systolic: 145, diastolic: 90, date: '2024-01-08' },
          heartRate: { value: 82, date: '2024-01-08' },
          temperature: { value: 98.8, date: '2024-01-08' },
          weight: { value: 195, date: '2024-01-07' },
          height: { value: "5'11\"", date: '2023-12-01' }
        },
        conditions: ['Hypertension', 'Type 2 Diabetes', 'High Cholesterol', 'Arthritis'],
        allergies: ['Aspirin', 'Codeine'],
        medications: [
          { name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily' },
          { name: 'Lisinopril', dosage: '20mg', frequency: 'Once daily' },
          { name: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily' },
          { name: 'Insulin', dosage: '15 units', frequency: 'Before meals' },
          { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' },
          { name: 'Vitamin B12', dosage: '1000mcg', frequency: 'Once daily' }
        ]
      }
    }
  }

  // Store for registered users
  const registeredUsers = ref([])

  // Computed properties
  const user = computed(() => currentUser.value)
  const userInitials = computed(() => {
    if (!currentUser.value) return ''
    return currentUser.value.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
  })

  const age = computed(() => {
    if (!currentUser.value) return 0
    const today = new Date()
    const birthDate = new Date(currentUser.value.dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  })

  // Actions
  async function login(email, password) {
    console.log('Auth store login called with:', { email, password })
    
    isLoading.value = true
    
    try {
      // Simulate API call delay
      console.log('Simulating API delay...')
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Check if user exists and password is correct (demo: all passwords are 'demo123')
      console.log('Checking user credentials...')
      console.log('Available emails:', Object.keys(userProfiles))
      
      const userProfile = userProfiles[email]
      console.log('Found user profile:', userProfile ? 'Yes' : 'No')
      console.log('Password check:', password === 'demo123' ? 'Valid' : 'Invalid')
      
      if (userProfile && password === 'demo123') {
        console.log('Login successful, setting user state...')
        currentUser.value = userProfile
        isAuthenticated.value = true
        
        // Store in localStorage for persistence
        const authData = {
          isAuthenticated: true,
          user: userProfile
        }
        localStorage.setItem('smartcare_auth', JSON.stringify(authData))
        console.log('Auth data stored in localStorage')
        
        return true
      } else {
        console.log('Login failed - invalid credentials')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    console.log('Logging out user...')
    isAuthenticated.value = false
    currentUser.value = null
    localStorage.removeItem('smartcare_auth')
    console.log('User logged out and localStorage cleared')
  }

  function checkAuthState() {
    console.log('Checking auth state from localStorage...')
    const authData = localStorage.getItem('smartcare_auth')
    
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        console.log('Found auth data in localStorage:', parsed)
        
        if (parsed.isAuthenticated && parsed.user) {
          isAuthenticated.value = true
          currentUser.value = parsed.user
          console.log('Auth state restored from localStorage')
        }
      } catch (error) {
        console.error('Error parsing auth data:', error)
        localStorage.removeItem('smartcare_auth')
      }
    } else {
      console.log('No auth data found in localStorage')
    }
  }

  function updateProfile(userData) {
    if (currentUser.value) {
      currentUser.value = { ...currentUser.value, ...userData }
      
      // Update localStorage
      const authData = {
        isAuthenticated: true,
        user: currentUser.value
      }
      localStorage.setItem('smartcare_auth', JSON.stringify(authData))
      console.log('Profile updated and saved to localStorage')
    }
  }

  function updateHealthScore(newScore) {
    if (currentUser.value && currentUser.value.healthData) {
      currentUser.value.healthData.healthScore = newScore
      updateProfile(currentUser.value)
      console.log('Health score updated to:', newScore)
    }
  }

  async function registerUser(userData) {
    registeredUsers.value.push(userData)
    // Optionally persist to localStorage
    localStorage.setItem('smartcare_registered_users', JSON.stringify(registeredUsers.value))
  }

  // Initialize auth state on store creation
  checkAuthState()

  return {
    isAuthenticated,
    currentUser,
    isLoading,
    user,
    userInitials,
    age,
    login,
    logout,
    checkAuthState,
    updateProfile,
    updateHealthScore,
    registeredUsers,
    registerUser
  }
})