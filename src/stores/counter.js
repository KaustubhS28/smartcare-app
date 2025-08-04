import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref({
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    avatar: '/api/placeholder/150/150',
    dateOfBirth: '1985-06-15',
    bloodType: 'O+',
    emergencyContact: {
      name: 'John Johnson',
      relationship: 'Spouse',
      phone: '(555) 987-6543'
    },
    medicalInfo: {
      allergies: ['Penicillin', 'Peanuts'],
      conditions: ['Hypertension'],
      medications: ['Lisinopril 10mg']
    }
  })

  const healthScore = ref(92)
  const isLoading = ref(false)

  // Computed
  const userInitials = computed(() => {
    return currentUser.value.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
  })

  const age = computed(() => {
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
  function updateProfile(userData) {
    isLoading.value = true
    
    // Simulate API call
    setTimeout(() => {
      currentUser.value = { ...currentUser.value, ...userData }
      isLoading.value = false
    }, 1000)
  }

  function updateHealthScore(newScore) {
    healthScore.value = newScore
  }

  return {
    currentUser,
    healthScore,
    isLoading,
    userInitials,
    age,
    updateProfile,
    updateHealthScore
  }
})
