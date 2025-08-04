<template>
  <div class="medical-records-page">
    <div class="page-header">
      <h1>Medical Records</h1>
      <p>Your complete health history and medical documents</p>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-icon health">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="summary-info">
          <span class="summary-number">{{ healthMetrics.vitals.bloodPressure.systolic }}/{{ healthMetrics.vitals.bloodPressure.diastolic }}</span>
          <span class="summary-label">Latest BP</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon lab">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 11H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2M9 11V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M9 11h6" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="summary-info">
          <span class="summary-number">{{ healthMetrics.labResults.length }}</span>
          <span class="summary-label">Lab Results</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon documents">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="summary-info">
          <span class="summary-number">{{ documents.length }}</span>
          <span class="summary-label">Documents</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon allergies">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="summary-info">
          <span class="summary-number">{{ allergies.length }}</span>
          <span class="summary-label">Allergies</span>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Recent Lab Results -->
      <div class="content-section">
        <div class="section-header">
          <h2>Recent Lab Results</h2>
          <button class="view-all-btn">View All</button>
        </div>
        
        <div class="lab-results">
          <div v-for="result in healthMetrics.labResults" :key="result.test" class="lab-result-card">
            <div class="lab-result-header">
              <h4>{{ result.test }}</h4>
              <span class="lab-status" :class="result.status">{{ result.status }}</span>
            </div>
            <div class="lab-result-details">
              <div class="lab-value">
                <span class="value">{{ result.value }}</span>
                <span class="unit">{{ result.unit }}</span>
              </div>
              <div class="lab-range">
                <span class="range-label">Normal Range:</span>
                <span class="range-value">{{ result.range }}</span>
              </div>
              <div class="lab-date">{{ new Date(result.date).toLocaleDateString() }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vital Signs History -->
      <div class="content-section">
        <div class="section-header">
          <h2>Vital Signs</h2>
          <button class="add-btn" @click="showAddVitalModal = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2"/>
              <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2"/>
            </svg>
            Add Entry
          </button>
        </div>

        <div class="vitals-grid">
          <div class="vital-item">
            <div class="vital-icon bp">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="vital-details">
              <div class="vital-name">Blood Pressure</div>
              <div class="vital-value">{{ healthMetrics.vitals.bloodPressure.systolic }}/{{ healthMetrics.vitals.bloodPressure.diastolic }} mmHg</div>
              <div class="vital-date">{{ new Date(healthMetrics.vitals.bloodPressure.date).toLocaleDateString() }}</div>
            </div>
            <div class="vital-trend">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="#10b981" stroke-width="2"/>
                <polyline points="17 6 23 6 23 12" stroke="#10b981" stroke-width="2"/>
              </svg>
            </div>
          </div>

          <div class="vital-item">
            <div class="vital-icon hr">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="vital-details">
              <div class="vital-name">Heart Rate</div>
              <div class="vital-value">{{ healthMetrics.vitals.heartRate.value }} bpm</div>
              <div class="vital-date">{{ new Date(healthMetrics.vitals.heartRate.date).toLocaleDateString() }}</div>
            </div>
            <div class="vital-trend">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="#10b981" stroke-width="2"/>
                <polyline points="17 6 23 6 23 12" stroke="#10b981" stroke-width="2"/>
              </svg>
            </div>
          </div>

          <div class="vital-item">
            <div class="vital-icon weight">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="vital-details">
              <div class="vital-name">Weight</div>
              <div class="vital-value">{{ healthMetrics.vitals.weight.value }} lbs</div>
              <div class="vital-date">{{ new Date(healthMetrics.vitals.weight.date).toLocaleDateString() }}</div>
            </div>
            <div class="vital-trend">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <line x1="12" y1="20" x2="12" y2="10" stroke="#6b7280" stroke-width="2"/>
                <line x1="18" y1="20" x2="6" y2="20" stroke="#6b7280" stroke-width="2"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Documents -->
      <div class="content-section">
        <div class="section-header">
          <h2>Medical Documents</h2>
          <button class="upload-btn" @click="uploadDocument">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2"/>
              <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            Upload
          </button>
        </div>

        <div class="documents-list">
          <div v-for="document in documents" :key="document.id" class="document-item">
            <div class="document-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="document-details">
              <h4>{{ document.name }}</h4>
              <p>{{ document.type }} • {{ document.size }}</p>
              <span class="document-date">{{ new Date(document.date).toLocaleDateString() }}</span>
            </div>
            <div class="document-actions">
              <button class="action-btn view" @click="viewDocument(document.id)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
              <button class="action-btn download" @click="downloadDocument(document.id)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2"/>
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Allergies & Conditions -->
      <div class="content-section">
        <div class="section-header">
          <h2>Allergies & Conditions</h2>
          <button class="add-btn" @click="showAddAllergyModal = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2"/>
              <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2"/>
            </svg>
            Add
          </button>
        </div>

        <div class="conditions-grid">
          <div class="condition-category">
            <h4>Allergies</h4>
            <div class="condition-items">
              <div v-for="allergy in allergies" :key="allergy.id" class="condition-tag allergy">
                <span>{{ allergy.name }}</span>
                <span class="severity" :class="allergy.severity.toLowerCase()">{{ allergy.severity }}</span>
              </div>
            </div>
          </div>

          <div class="condition-category">
            <h4>Chronic Conditions</h4>
            <div class="condition-items">
              <div v-for="condition in conditions" :key="condition.id" class="condition-tag condition">
                <span>{{ condition.name }}</span>
                <span class="status">{{ condition.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Vital Modal -->
    <div v-if="showAddVitalModal" class="modal-overlay" @click="showAddVitalModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add Vital Signs</h3>
          <button @click="showAddVitalModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <p>Add new vital sign readings...</p>
          <div class="form-group">
            <label>Type</label>
            <select class="form-select">
              <option>Blood Pressure</option>
              <option>Heart Rate</option>
              <option>Weight</option>
              <option>Temperature</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showAddVitalModal = false" class="btn secondary">Cancel</button>
          <button class="btn primary">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { healthMetrics } from '../data/doctors.js'

const showAddVitalModal = ref(false)
const showAddAllergyModal = ref(false)

const documents = ref([
  {
    id: 1,
    name: 'Blood Test Results - Jan 2024',
    type: 'Lab Report',
    size: '2.3 MB',
    date: '2024-01-05'
  },
  {
    id: 2,
    name: 'Chest X-Ray Report',
    type: 'Imaging',
    size: '5.1 MB',
    date: '2023-12-15'
  },
  {
    id: 3,
    name: 'Annual Physical Exam',
    type: 'Medical Report',
    size: '1.8 MB',
    date: '2023-12-01'
  },
  {
    id: 4,
    name: 'Vaccination Record',
    type: 'Immunization',
    size: '0.5 MB',
    date: '2023-11-20'
  }
])

const allergies = ref([
  { id: 1, name: 'Penicillin', severity: 'High' },
  { id: 2, name: 'Peanuts', severity: 'Medium' },
  { id: 3, name: 'Shellfish', severity: 'Low' }
])

const conditions = ref([
  { id: 1, name: 'Hypertension', status: 'Controlled' },
  { id: 2, name: 'Type 2 Diabetes', status: 'Managed' }
])

const uploadDocument = () => {
  alert('Document upload feature would open here.')
}

const viewDocument = (documentId) => {
  alert(`Viewing document ${documentId}`)
}

const downloadDocument = (documentId) => {
  alert(`Downloading document ${documentId}`)
}
</script>

<style scoped>
.medical-records-page {
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

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.summary-card {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: white;
}

.summary-icon.health { background: #ef4444; }
.summary-icon.lab { background: #3b82f6; }
.summary-icon.documents { background: #8b5cf6; }
.summary-icon.allergies { background: #f59e0b; }

.summary-info {
  display: flex;
  flex-direction: column;
}

.summary-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.summary-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.content-section {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.view-all-btn, .add-btn, .upload-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.view-all-btn:hover, .add-btn:hover, .upload-btn:hover {
  background: var(--primary-dark);
}

/* Lab Results */
.lab-results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lab-result-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.lab-result-card:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
}

.lab-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.lab-result-header h4 {
  font-weight: 600;
  color: var(--text-primary);
}

.lab-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.lab-status.normal {
  background: #dcfce7;
  color: #166534;
}

.lab-result-details {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: center;
}

.lab-value {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.lab-value .value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.lab-value .unit {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.lab-range .range-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.lab-range .range-value {
  font-size: 0.8rem;
  color: var(--text-primary);
  font-weight: 500;
}

.lab-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* Vitals */
.vitals-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vital-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.vital-item:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
}

.vital-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
}

.vital-icon.bp { background: #ef4444; }
.vital-icon.hr { background: #f59e0b; }
.vital-icon.weight { background: #10b981; }

.vital-details {
  flex: 1;
}

.vital-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.vital-value {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.vital-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.vital-trend {
  color: var(--success-color);
}

/* Documents */
.documents-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.document-item:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
}

.document-icon {
  color: var(--primary-color);
}

.document-details {
  flex: 1;
}

.document-details h4 {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.document-details p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.document-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.document-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

/* Conditions */
.conditions-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.condition-category h4 {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.condition-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.condition-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.condition-tag.allergy {
  background: #fee2e2;
  color: #991b1b;
}

.condition-tag.condition {
  background: #dbeafe;
  color: #1e40af;
}

.severity {
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}

.severity.high {
  background: #dc2626;
  color: white;
}

.severity.medium {
  background: #f59e0b;
  color: white;
}

.severity.low {
  background: #10b981;
  color: white;
}

.status {
  font-size: 0.75rem;
  color: var(--success-color);
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
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
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
  background: var(--bg-primary);
  color: var(--text-primary);
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

.btn.primary {
  background: var(--primary-color);
  color: white;
  border: none;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .summary-cards {
    grid-template-columns: 1fr 1fr;
  }

  .lab-result-details {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
</style> 