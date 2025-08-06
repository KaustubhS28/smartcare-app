import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Profile from '../views/Profile.vue'
import Doctors from '../views/Doctors.vue'
import DoctorDetail from '../views/DoctorDetail.vue'
import Appointments from '../views/Appointments.vue'
import MedicalRecords from '../views/MedicalRecords.vue'
import HealthTracking from '../views/HealthTracking.vue'
import Medications from '../views/Medications.vue'
import Billing from '../views/Billing.vue'
import PaymentMethods from '../views/PaymentMethods.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { 
        requiresGuest: true,
        title: 'Login - SmartCare'
      }
    },
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { 
        requiresAuth: true,
        title: 'Dashboard - SmartCare'
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { 
        requiresAuth: true,
        title: 'My Profile - SmartCare'
      }
    },
    {
      path: '/doctors',
      name: 'doctors',
      component: Doctors,
      meta: { 
        requiresAuth: true,
        title: 'Find Doctors - SmartCare'
      }
    },
    {
      path: '/doctors/:id',
      name: 'doctor-detail',
      component: DoctorDetail,
      props: true,
      meta: { 
        requiresAuth: true,
        title: 'Doctor Profile - SmartCare'
      }
    },
    {
      path: '/appointments',
      name: 'appointments',
      component: Appointments,
      meta: { 
        requiresAuth: true,
        title: 'My Appointments - SmartCare'
      }
    },
    {
      path: '/medical-records',
      name: 'medical-records',
      component: MedicalRecords,
      meta: { 
        requiresAuth: true,
        title: 'Medical Records - SmartCare'
      }
    },
    {
      path: '/health-tracking',
      name: 'health-tracking',
      component: HealthTracking,
      meta: { 
        requiresAuth: true,
        title: 'Health Tracking - SmartCare'
      }
    },
    {
      path: '/medications',
      name: 'medications',
      component: Medications,
      meta: { 
        requiresAuth: true,
        title: 'Medications - SmartCare'
      }
    },
    {
      path: '/billing',
      name: 'billing',
      component: Billing,
      meta: { 
        requiresAuth: true,
        title: 'Billing & Payments - SmartCare'
      }
    },
    {
      path: '/payment-methods',
      name: 'payment-methods',
      component: PaymentMethods,
      meta: { 
        requiresAuth: true,
        title: 'Payment Methods - SmartCare'
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: { 
        requiresAuth: true,
        title: 'Settings - SmartCare'
      }
    },
    // Redirect old route names for backward compatibility
    {
      path: '/records',
      redirect: '/medical-records'
    },
    {
      path: '/tracking',
      redirect: '/health-tracking'
    },
    // Catch all route - redirect to dashboard if authenticated, login if not
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore()
        if (authStore.isAuthenticated) {
          next('/')
        } else {
          next('/login')
        }
      }
    }
  ]
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  console.log('Router guard - checking route:', to.path, 'Auth state:', authStore.isAuthenticated)
  
  // Ensure auth state is properly initialized
  if (!authStore.isAuthenticated) {
    authStore.checkAuthState()
    console.log('Auth state after check:', authStore.isAuthenticated)
  }
  
  // Set document title
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('Route requires auth, redirecting to login')
    next('/login')
    return
  }
  
  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    console.log('User already authenticated, redirecting to dashboard')
    next('/')
    return
  }
  
  // If going to login and already authenticated, redirect to dashboard
  if (to.path === '/login' && authStore.isAuthenticated) {
    console.log('User authenticated but going to login, redirecting to dashboard')
    next('/')
    return
  }
  
  console.log('Router guard - allowing navigation to:', to.path)
  next()
})

// After navigation
router.afterEach((to, from) => {
  // Scroll to top on route change
  window.scrollTo(0, 0)
})

export default router
