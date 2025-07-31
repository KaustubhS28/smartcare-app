<template>
  <div class="brand-section">
    <div class="logo">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#3b82f6"/>
        <circle cx="12" cy="12" r="3" fill="#10b981"/>
      </svg>
    </div>
    <h1>SmartCare</h1>
    <p>Your Personal Healthcare Companion</p>
  </div>
</template>

<script setup>
// No props needed for this static component
</script>

<style scoped>
.brand-section {
  text-align: center;
  color: white;
}

.logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
}

.brand-section h1 {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.brand-section p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

@media (max-width: 768px) {
  .brand-section h1 {
    font-size: 2.5rem;
  }
  
  .brand-section p {
    font-size: 1rem;
  }
  
  .logo {
    width: 60px;
    height: 60px;
    margin-bottom: 1.5rem;
  }
}

@media (max-width: 480px) {
  .brand-section h1 {
    font-size: 2rem;
  }
  
  .brand-section p {
    font-size: 0.9rem;
  }
}
</style> 