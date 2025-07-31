<template>
  <div 
    class="demo-user-card"
    :class="{ 'loading': isLoading }"
    @click="handleClick"
  >
    <div class="card-header">
      <div class="demo-avatar">
        <img :src="user.avatar" :alt="user.name" />
        <div v-if="isLoading" class="demo-loading">
          <div class="spinner"></div>
        </div>
      </div>
      
      <div class="user-basic-info">
        <h4>{{ user.name }}</h4>
        <p class="demo-role">{{ user.role }}</p>
      </div>
    </div>
    
    <div class="card-body">
      <p class="demo-details">{{ user.description }}</p>
      
      <div class="demo-credentials">
        <div class="credential-item">
          <strong>Email:</strong> {{ user.email }}
        </div>
        <div class="credential-item">
          <strong>Password:</strong> demo123
        </div>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="demo-stats">
        <div class="stat-item">
          <span class="stat-value">{{ user.stats.appointments }}</span>
          <span class="stat-label">Appointments</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ user.stats.medications }}</span>
          <span class="stat-label">Medications</span>
        </div>
      </div>
      
      <div class="action-hint">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>Click to login</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// Props
const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['click'])

// Methods
const handleClick = () => {
  if (!props.isLoading) {
    emit('click', props.user)
  }
}
</script>

<style scoped>
.demo-user-card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border: 2px solid var(--border-color);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--bg-primary);
  user-select: none;
  position: relative;
  overflow: hidden;
  min-height: 240px;
}

.demo-user-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.demo-user-card:hover:not(.loading)::before {
  transform: scaleX(1);
}

.demo-user-card:hover:not(.loading) {
  border-color: var(--primary-color);
  background: var(--bg-secondary);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.demo-user-card.loading {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.demo-avatar {
  position: relative;
  flex-shrink: 0;
}

.demo-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border-color);
  transition: border-color 0.3s ease;
}

.demo-user-card:hover:not(.loading) .demo-avatar img {
  border-color: var(--primary-color);
}

.demo-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.user-basic-info {
  flex: 1;
  min-width: 0;
}

.user-basic-info h4 {
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
}

.demo-role {
  font-size: 0.9rem;
  color: var(--primary-color);
  font-weight: 600;
  margin: 0;
}

.card-body {
  flex: 1;
  margin-bottom: 1.25rem;
}

.demo-details {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.4;
}

.demo-credentials {
  background: var(--bg-secondary);
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 3px solid var(--primary-color);
}

.credential-item {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.credential-item:last-child {
  margin-bottom: 0;
}

.credential-item strong {
  color: var(--text-primary);
  font-weight: 600;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.demo-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.25rem;
  line-height: 1;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0.25rem;
}

.action-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
}

.demo-user-card:hover:not(.loading) .action-hint {
  opacity: 1;
  transform: translateX(0);
  color: var(--primary-color);
}

.action-hint svg {
  transition: transform 0.3s ease;
}

.demo-user-card:hover:not(.loading) .action-hint svg {
  transform: translateX(2px);
}

@media (max-width: 768px) {
  .demo-user-card {
    min-height: auto;
    padding: 1.25rem;
  }

  .card-header {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .demo-avatar img {
    width: 50px;
    height: 50px;
  }

  .card-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .action-hint {
    opacity: 1;
    transform: none;
  }
}
</style> 