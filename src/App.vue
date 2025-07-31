<script setup>
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AppHeader from './components/layout/AppHeader.vue'
import AppNavigation from './components/layout/AppNavigation.vue'

const authStore = useAuthStore()
</script>

<template>
  <div id="app">
    <!-- Authenticated Layout -->
    <template v-if="authStore.isAuthenticated">
      <AppHeader />
      <div class="app-container">
        <AppNavigation />
        <main class="main-content">
          <RouterView />
        </main>
      </div>
    </template>
    
    <!-- Unauthenticated Layout (Login Page) -->
    <template v-else>
      <RouterView />
    </template>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  height: 100%;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8fafc;
  color: #334155;
  line-height: 1.6;
  height: 100%;
  width: 100%;
}

#app {
  min-height: 100vh;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.app-container {
  display: flex;
  flex: 1;
  width: 100%;
  height: calc(100vh - 80px); /* Subtract header height */
}

.main-content {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
  background: #f8fafc;
  width: 100%;
}

@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
    height: calc(100vh - 70px); /* Adjust for mobile header height */
  }
  
  .main-content {
    padding: 1rem;
  }
}

/* Color Variables */
:root {
  --primary-color: #3b82f6;
  --primary-dark: #2563eb;
  --secondary-color: #10b981;
  --accent-color: #f59e0b;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
  --success-color: #10b981;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --border-color: #e5e7eb;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
</style>
