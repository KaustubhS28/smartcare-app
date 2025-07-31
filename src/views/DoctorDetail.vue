<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { doctors } from '../data/doctors.js'

const router = useRouter()
const route = useRoute()

const doctorId = parseInt(route.params.id)
const doctor = computed(() => doctors.find(d => d.id === doctorId))

const selectedDay = ref('')
const selectedTime = ref('')
const showBookingModal = ref(false)

const generateStars = (rating) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  
  return {
    full: fullStars,
    half: hasHalfStar,
    empty: emptyStars
  }
}

const bookAppointment = () => {
  if (!selectedDay.value || !selectedTime.value) {
    alert('Please select a day and time for your appointment.')
    return
  }
  
  // In a real app, this would make an API call
  alert(`Appointment booked with ${doctor.value.name} on ${selectedDay.value} at ${selectedTime.value}!`)
  showBookingModal.value = false
  router.push({ name: 'appointments' })
}

const goBack = () => {
  router.push({ name: 'doctors' })
}
</script>

<template>
  <div v-if="doctor" class="doctor-detail-page">
    <!-- Header -->
    <div class="page-header">
      <button @click="goBack" class="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2"/>
        </svg>
        Back to Doctors
      </button>
    </div>

    <!-- Doctor Profile -->
    <div class="doctor-profile">
      <div class="doctor-header">
        <div class="doctor-avatar">
          <img :src="doctor.avatar" :alt="doctor.name" />
        </div>
        
        <div class="doctor-main-info">
          <div class="doctor-badges">
            <span v-for="badge in doctor.badges" :key="badge" class="badge">
              {{ badge }}
            </span>
          </div>
          
          <h1>{{ doctor.name }}</h1>
          <p class="specialty">{{ doctor.specialty }}</p>
          <p class="education">{{ doctor.education }}</p>
          
          <div class="rating-section">
            <div class="stars">
              <span v-for="n in generateStars(doctor.rating).full" :key="`full-${n}`" class="star full">★</span>
              <span v-if="generateStars(doctor.rating).half" class="star half">★</span>
              <span v-for="n in generateStars(doctor.rating).empty" :key="`empty-${n}`" class="star empty">★</span>
            </div>
            <span class="rating-text">{{ doctor.rating }} ({{ doctor.reviewCount }} reviews)</span>
          </div>
        </div>

        <div class="doctor-quick-info">
          <div class="info-card">
            <div class="info-label">Experience</div>
            <div class="info-value">{{ doctor.experience }} years</div>
          </div>
          
          <div class="info-card">
            <div class="info-label">Consultation Fee</div>
            <div class="info-value">${{ doctor.consultationFee }}</div>
          </div>
          
          <div class="info-card">
            <div class="info-label">Next Available</div>
            <div class="info-value">{{ new Date(doctor.nextAvailable).toLocaleDateString() }}</div>
          </div>
        </div>
      </div>

      <!-- About Section -->
      <div class="doctor-content">
        <div class="content-section">
          <h2>About Dr. {{ doctor.name.split(' ').pop() }}</h2>
          <p>{{ doctor.about }}</p>
        </div>

        <!-- Contact Info -->
        <div class="content-section">
          <h2>Contact Information</h2>
          <div class="contact-grid">
            <div class="contact-item">
              <div class="contact-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div>
                <div class="contact-label">Location</div>
                <div class="contact-value">{{ doctor.location }}</div>
                <div class="contact-detail">{{ doctor.address }}</div>
              </div>
            </div>

            <div class="contact-item">
              <div class="contact-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div>
                <div class="contact-label">Phone</div>
                <div class="contact-value">{{ doctor.phone }}</div>
              </div>
            </div>

            <div class="contact-item">
              <div class="contact-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" stroke-width="2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" stroke-width="2"/>
                  <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div>
                <div class="contact-label">Languages</div>
                <div class="contact-value">{{ doctor.languages.join(', ') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Availability -->
        <div class="content-section">
          <h2>Availability</h2>
          <div class="availability-grid">
            <div v-for="schedule in doctor.availability" :key="schedule.day" class="availability-day">
              <h4>{{ schedule.day }}</h4>
              <div class="time-slots">
                <span v-for="slot in schedule.slots" :key="slot" class="time-slot">
                  {{ slot }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Book Appointment Button -->
    <div class="booking-section">
      <button @click="showBookingModal = true" class="book-appointment-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
        </svg>
        Book Appointment
      </button>
    </div>

    <!-- Booking Modal -->
    <div v-if="showBookingModal" class="modal-overlay" @click="showBookingModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Book Appointment</h3>
          <button @click="showBookingModal = false" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <p>Book an appointment with {{ doctor.name }}</p>
          
          <div class="form-group">
            <label>Select Day</label>
            <select v-model="selectedDay" class="form-select">
              <option value="">Choose a day...</option>
              <option v-for="schedule in doctor.availability" :key="schedule.day" :value="schedule.day">
                {{ schedule.day }}
              </option>
            </select>
          </div>

          <div v-if="selectedDay" class="form-group">
            <label>Select Time</label>
            <select v-model="selectedTime" class="form-select">
              <option value="">Choose a time...</option>
              <option v-for="slot in doctor.availability.find(s => s.day === selectedDay)?.slots" :key="slot" :value="slot">
                {{ slot }}
              </option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showBookingModal = false" class="btn secondary">Cancel</button>
          <button @click="bookAppointment" class="btn primary">Book Appointment</button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="error-page">
    <h1>Doctor Not Found</h1>
    <p>The doctor you're looking for doesn't exist.</p>
    <router-link :to="{ name: 'doctors' }" class="back-link">Back to Doctors</router-link>
  </div>
</template>

<style scoped>
.doctor-detail-page {
  width: 100%;
  padding: 0 1rem;
}

.page-header {
  margin-bottom: 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.doctor-profile {
  background: var(--bg-primary);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  margin-bottom: 2rem;
}

.doctor-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.doctor-avatar img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.doctor-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.doctor-main-info h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.specialty {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  opacity: 0.9;
  font-weight: 500;
}

.education {
  font-size: 1rem;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stars {
  display: flex;
  gap: 0.1rem;
}

.star {
  font-size: 1.2rem;
}

.star.full { color: #fbbf24; }
.star.half { color: #fbbf24; opacity: 0.5; }
.star.empty { color: rgba(255, 255, 255, 0.3); }

.rating-text {
  font-size: 0.9rem;
  opacity: 0.9;
}

.doctor-quick-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-card {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  min-width: 140px;
}

.info-label {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 1.1rem;
  font-weight: 600;
}

.doctor-content {
  padding: 2rem;
}

.content-section {
  margin-bottom: 2rem;
}

.content-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.content-section p {
  color: var(--text-secondary);
  line-height: 1.6;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.contact-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  flex-shrink: 0;
}

.contact-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.contact-value {
  font-weight: 600;
  color: var(--text-primary);
}

.contact-detail {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.availability-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.availability-day h4 {
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.time-slot {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  border: 1px solid var(--border-color);
}

.booking-section {
  text-align: center;
  margin-bottom: 2rem;
}

.book-appointment-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
}

.book-appointment-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
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

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn.secondary:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.btn.primary {
  background: var(--primary-color);
  color: white;
  border: none;
}

.btn.primary:hover {
  background: var(--primary-dark);
}

.error-page {
  text-align: center;
  padding: 4rem 2rem;
}

.error-page h1 {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.back-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

@media (max-width: 768px) {
  .doctor-header {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1.5rem;
  }

  .contact-grid {
    grid-template-columns: 1fr;
  }

  .availability-grid {
    grid-template-columns: 1fr;
  }
}
</style> 