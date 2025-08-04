<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { doctors, specialties } from '../data/doctors.js'

const router = useRouter()

const searchQuery = ref('')
const selectedSpecialty = ref('All Specialties')
const sortBy = ref('rating')

const filteredDoctors = computed(() => {
  let filtered = [...doctors]

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(doctor => 
      doctor.name.toLowerCase().includes(query) ||
      doctor.specialty.toLowerCase().includes(query) ||
      doctor.location.toLowerCase().includes(query)
    )
  }

  // Filter by specialty
  if (selectedSpecialty.value !== 'All Specialties') {
    filtered = filtered.filter(doctor => doctor.specialty === selectedSpecialty.value)
  }

  // Sort doctors
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'rating':
        return b.rating - a.rating
      case 'experience':
        return b.experience - a.experience
      case 'name':
        return a.name.localeCompare(b.name)
      case 'fee':
        return a.consultationFee - b.consultationFee
      default:
        return 0
    }
  })

  return filtered
})

const viewDoctorProfile = (doctorId) => {
  router.push({ name: 'doctor-detail', params: { id: doctorId } })
}

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
</script>

<template>
  <div class="doctors-page">
    <div class="page-header">
      <h1>Find Healthcare Professionals</h1>
      <p>Connect with qualified doctors and specialists in your area</p>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="search-bar">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
          </svg>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search doctors, specialties, or locations..."
            class="search-input"
          />
        </div>
      </div>

      <div class="filter-controls">
        <div class="filter-group">
          <label for="specialty">Specialty</label>
          <select v-model="selectedSpecialty" id="specialty" class="filter-select">
            <option v-for="specialty in specialties" :key="specialty" :value="specialty">
              {{ specialty }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="sort">Sort by</label>
          <select v-model="sortBy" id="sort" class="filter-select">
            <option value="rating">Highest Rated</option>
            <option value="experience">Most Experienced</option>
            <option value="name">Name (A-Z)</option>
            <option value="fee">Lowest Fee</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Results Summary -->
    <div class="results-summary">
      <p>Showing {{ filteredDoctors.length }} doctor{{ filteredDoctors.length !== 1 ? 's' : '' }}</p>
    </div>

    <!-- Doctors Grid -->
    <div class="doctors-grid">
      <div 
        v-for="doctor in filteredDoctors" 
        :key="doctor.id"
        class="doctor-card"
        @click="viewDoctorProfile(doctor.id)"
      >
        <div class="doctor-avatar">
          <img :src="doctor.avatar" :alt="doctor.name" />
          <div class="doctor-badges">
            <span 
              v-for="badge in doctor.badges" 
              :key="badge" 
              class="badge"
            >
              {{ badge }}
            </span>
          </div>
        </div>

        <div class="doctor-info">
          <h3 class="doctor-name">{{ doctor.name }}</h3>
          <p class="doctor-specialty">{{ doctor.specialty }}</p>
          <p class="doctor-education">{{ doctor.education }}</p>
          
          <div class="doctor-stats">
            <div class="rating">
              <div class="stars">
                <span v-for="n in generateStars(doctor.rating).full" :key="`full-${n}`" class="star full">★</span>
                <span v-if="generateStars(doctor.rating).half" class="star half">★</span>
                <span v-for="n in generateStars(doctor.rating).empty" :key="`empty-${n}`" class="star empty">★</span>
              </div>
              <span class="rating-text">{{ doctor.rating }} ({{ doctor.reviewCount }} reviews)</span>
            </div>
            
            <div class="experience">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ doctor.experience }} years experience
            </div>
          </div>

          <div class="doctor-details">
            <div class="location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ doctor.location }}
            </div>

            <div class="languages">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ doctor.languages.join(', ') }}
            </div>
          </div>

          <div class="doctor-footer">
            <div class="consultation-fee">
              <span class="fee-label">Consultation</span>
              <span class="fee-amount">${{ doctor.consultationFee }}</span>
            </div>
            
            <div class="availability">
              <span class="available-label">Next available:</span>
              <span class="available-date">{{ new Date(doctor.nextAvailable).toLocaleDateString() }}</span>
            </div>
          </div>

          <button class="book-appointment-btn" @click.stop="viewDoctorProfile(doctor.id)">
            View Profile & Book
          </button>
        </div>
      </div>
    </div>

    <!-- No results -->
    <div v-if="filteredDoctors.length === 0" class="no-results">
      <div class="no-results-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h3>No doctors found</h3>
      <p>Try adjusting your search criteria or browse all specialties</p>
      <button @click="searchQuery = ''; selectedSpecialty = 'All Specialties'" class="reset-filters-btn">
        Reset Filters
      </button>
    </div>
  </div>
</template>

<style scoped>
.doctors-page {
  width: 100%;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-header p {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

/* Filters */
.filters-section {
  background: var(--bg-primary);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
}

.search-bar {
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid var(--border-color);
  border-radius: 25px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-controls {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-width: 180px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Results */
.results-summary {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Doctors Grid */
.doctors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.doctor-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid var(--border-color);
}

.doctor-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
}

.doctor-avatar {
  position: relative;
  text-align: center;
  margin-bottom: 1rem;
}

.doctor-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border-color);
}

.doctor-badges {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.badge {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.doctor-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  text-align: center;
}

.doctor-specialty {
  font-size: 1rem;
  color: var(--primary-color);
  font-weight: 500;
  text-align: center;
  margin-bottom: 0.25rem;
}

.doctor-education {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 1rem;
}

.doctor-stats {
  margin-bottom: 1rem;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  justify-content: center;
}

.stars {
  display: flex;
  gap: 0.1rem;
}

.star {
  font-size: 1rem;
}

.star.full {
  color: #fbbf24;
}

.star.half {
  color: #fbbf24;
  opacity: 0.5;
}

.star.empty {
  color: var(--border-color);
}

.rating-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.experience {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.doctor-details {
  margin-bottom: 1rem;
  space-y: 0.5rem;
}

.location,
.languages {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.doctor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.consultation-fee {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.fee-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.fee-amount {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.availability {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.available-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.available-date {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--success-color);
}

.book-appointment-btn {
  width: 100%;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.book-appointment-btn:hover {
  background: var(--primary-dark);
}

/* No Results */
.no-results {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.no-results-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-results h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.reset-filters-btn {
  margin-top: 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.reset-filters-btn:hover {
  background: var(--primary-dark);
}

@media (max-width: 768px) {
  .doctors-grid {
    grid-template-columns: 1fr;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    width: 100%;
  }

  .filter-select {
    min-width: auto;
  }

  .doctor-footer {
    flex-direction: column;
    gap: 1rem;
  }
}
</style> 