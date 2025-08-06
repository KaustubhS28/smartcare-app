<template>
  <div v-if="showWalkme" class="walkme-overlay">
    <div class="walkme-modal">
      <h2>Welcome to SmartCare!</h2>
      <ul class="walkme-list">
        <li><strong>Dashboard:</strong> View your health summary and quick stats.</li>
        <li><strong>Doctors:</strong> Find and connect with healthcare professionals.</li>
        <li><strong>Appointments:</strong> Book, view, and manage your appointments.</li>
        <li><strong>Medical Records:</strong> Access and upload your health documents.</li>
        <li><strong>Health Tracking:</strong> Monitor your weight, height, and other metrics.</li>
        <li><strong>Medications:</strong> Track your prescriptions and reminders.</li>
        <li><strong>Profile & Settings:</strong> Update your personal info and preferences.</li>
      </ul>
      <button class="walkme-close-btn" @click="closeWalkme">Got it!</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const showWalkme = ref(false)
const route = useRoute()

function shouldShowWalkme() {
  showWalkme.value = route.name === 'login'
}

onMounted(() => {
  shouldShowWalkme()
})

watch(() => route.name, () => {
  shouldShowWalkme()
})

function closeWalkme() {
  showWalkme.value = false
}
</script>

<style scoped>
.walkme-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.walkme-modal {
  background: #fff;
  border-radius: 16px;
  padding: 2rem 2.5rem;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  text-align: center;
}
.walkme-modal h2 {
  margin-bottom: 1.5rem;
  color: var(--primary-color, #3b82f6);
}
.walkme-list {
  text-align: left;
  margin-bottom: 2rem;
  padding-left: 1.2rem;
}
.walkme-list li {
  margin-bottom: 0.75rem;
  font-size: 1rem;
  color: var(--text-primary, #1f2937);
}
.walkme-close-btn {
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  color: #fff;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.walkme-close-btn:hover {
  box-shadow: 0 4px 16px rgba(59,130,246,0.15);
}
</style>
