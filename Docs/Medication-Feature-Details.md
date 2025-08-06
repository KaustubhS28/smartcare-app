# Medication Feature - Technical Documentation

## Overview
This document provides detailed technical specifications for the Medication feature endpoints in the Smart Care Services application. The Medication feature allows users to track their medications, set reminders, and manage their prescription schedules.

## Base Configuration
- **Base URL**: `http://localhost:8080/api/v1`
- **Authentication**: JWT Bearer token required for all endpoints
- **Content-Type**: `application/json`
- **Context Path**: `/api/v1`

## Authentication Header
All endpoints require authentication:
```
Authorization: Bearer {jwt_token}
```

---

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/medications` | Add new medication | ✅ |
| GET | `/medications` | Get user's medications | ✅ |
| GET | `/medications/{id}` | Get medication details | ✅ |
| PUT | `/medications/{id}` | Update medication | ✅ |
| DELETE | `/medications/{id}` | Remove medication | ✅ |
| GET | `/medications/active` | Get active medications | ✅ |
| PUT | `/medications/{id}/status` | Update medication status | ✅ |
| POST | `/medications/{id}/reminder` | Set medication reminder | ✅ |
| POST | `/medications/{id}/log` | Log medication intake | ✅ |
| GET | `/medications/reminders` | Get today's reminders | ✅ |

---

## 1. Add New Medication

Adds a new medication to the user's medication list.

### Request Details
- **Method**: `POST`
- **Endpoint**: `/medications`
- **Authentication**: Required

### Request Body
```json
{
  "medicationName": "Lisinopril",
  "dosage": "10mg",
  "frequency": "ONCE_DAILY",
  "startDate": "2024-01-15",
  "endDate": "2024-07-15",
  "prescribedBy": "Dr. Sarah Johnson",
  "instructions": "Take with food in the morning",
  "purpose": "Blood pressure management",
  "medicationType": "PRESCRIPTION",
  "reminderTimes": ["08:00"],
  "notes": "Monitor blood pressure weekly"
}
```

### Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `medicationName` | String | ✅ | 1-100 characters | Name of the medication |
| `dosage` | String | ✅ | 1-50 characters | Dosage information (e.g., "10mg", "2 tablets") |
| `frequency` | Enum | ✅ | Valid frequency value | How often to take |
| `startDate` | String | ✅ | YYYY-MM-DD format | Start date of medication |
| `endDate` | String | ❌ | YYYY-MM-DD format | End date (null for ongoing) |
| `prescribedBy` | String | ❌ | 1-100 characters | Prescribing doctor's name |
| `instructions` | String | ❌ | Max 500 characters | Special instructions |
| `purpose` | String | ❌ | Max 200 characters | Purpose/condition being treated |
| `medicationType` | Enum | ✅ | PRESCRIPTION, OTC, SUPPLEMENT | Type of medication |
| `reminderTimes` | Array | ❌ | Array of HH:MM strings | Reminder times |
| `notes` | String | ❌ | Max 1000 characters | Additional notes |

### Frequency Options
- `ONCE_DAILY` - Once per day
- `TWICE_DAILY` - Twice per day
- `THREE_TIMES_DAILY` - Three times per day
- `FOUR_TIMES_DAILY` - Four times per day
- `EVERY_OTHER_DAY` - Every other day
- `WEEKLY` - Once per week
- `AS_NEEDED` - As needed (PRN)
- `CUSTOM` - Custom schedule

### Medication Type Options
- `PRESCRIPTION` - Prescription medication
- `OTC` - Over-the-counter medication
- `SUPPLEMENT` - Vitamin/supplement
- `HERBAL` - Herbal remedy

### Excluded Fields
The following fields are managed internally and should NOT be included in requests:
- `id` - Auto-generated UUID
- `userId` - Set from authenticated user
- `status` - Defaults to "ACTIVE"
- `totalDoses` - Calculated field
- `missedDoses` - Calculated field
- `adherenceRate` - Calculated field
- `createdAt`, `updatedAt` - Auto-managed timestamps

### Response Format

**Success Response (201 Created)**
```json
{
  "success": true,
  "message": "Medication added successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "medicationName": "Lisinopril",
    "dosage": "10mg",
    "frequency": "ONCE_DAILY",
    "startDate": "2024-01-15",
    "endDate": "2024-07-15",
    "prescribedBy": "Dr. Sarah Johnson",
    "instructions": "Take with food in the morning",
    "purpose": "Blood pressure management",
    "medicationType": "PRESCRIPTION",
    "status": "ACTIVE",
    "reminderTimes": ["08:00"],
    "notes": "Monitor blood pressure weekly",
    "totalDoses": 0,
    "takenDoses": 0,
    "missedDoses": 0,
    "adherenceRate": 0.0,
    "nextDoseTime": "2024-01-16T08:00:00Z"
  }
}
```

### Error Responses

**400 Bad Request - Validation Errors**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "medicationName",
        "message": "Medication name is required"
      },
      {
        "field": "startDate",
        "message": "Start date cannot be in the past"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/medications"
}
```

**409 Conflict - Medication Already Exists**
```json
{
  "success": false,
  "message": "A medication with the same name and dosage already exists",
  "data": {
    "existingMedicationId": "550e8400-e29b-41d4-a716-446655440002"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/medications"
}
```

### UI Integration Notes
- Implement autocomplete for common medication names
- Validate date ranges (end date after start date)
- Provide frequency presets with custom option
- Show conflict warnings for similar medications

---

## 2. Get User's Medications

Retrieves all medications for the authenticated user with filtering and pagination.

### Request Details
- **Method**: `GET`
- **Endpoint**: `/medications`
- **Authentication**: Required

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `status` | String | ❌ | Filter by status | `ACTIVE` |
| `type` | String | ❌ | Filter by medication type | `PRESCRIPTION` |
| `prescribedBy` | String | ❌ | Filter by prescribing doctor | `Dr. Johnson` |
| `includeExpired` | Boolean | ❌ | Include expired medications | `false` |
| `page` | Integer | ❌ | Page number (0-based) | `0` |
| `size` | Integer | ❌ | Page size | `10` |
| `sort` | String | ❌ | Sort criteria | `medicationName,asc` |

### Status Options
- `ACTIVE` - Currently taking
- `PAUSED` - Temporarily stopped
- `COMPLETED` - Course completed
- `DISCONTINUED` - Permanently stopped

### Example Request
```
GET /medications?status=ACTIVE&type=PRESCRIPTION&includeExpired=false
```

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Medications retrieved successfully",
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "medicationName": "Lisinopril",
        "dosage": "10mg",
        "frequency": "ONCE_DAILY",
        "startDate": "2024-01-15",
        "endDate": "2024-07-15",
        "prescribedBy": "Dr. Sarah Johnson",
        "purpose": "Blood pressure management",
        "medicationType": "PRESCRIPTION",
        "status": "ACTIVE",
        "reminderTimes": ["08:00"],
        "adherenceRate": 85.5,
        "nextDoseTime": "2024-01-16T08:00:00Z",
        "daysRemaining": 152,
        "isExpired": false,
        "requiresRefill": false
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10
    },
    "totalElements": 3,
    "totalPages": 1
  }
}
```

### UI Integration Notes
- Group medications by status or type
- Show adherence rates with visual indicators
- Highlight medications requiring refills
- Provide quick action buttons (pause, edit, delete)

---

## 3. Get Medication Details

Retrieves detailed information about a specific medication including intake history.

### Request Details
- **Method**: `GET`
- **Endpoint**: `/medications/{id}`
- **Authentication**: Required

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | ✅ | Medication's unique identifier |

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `includeHistory` | Boolean | ❌ | Include intake history | `true` |
| `historyDays` | Integer | ❌ | Days of history to include | `30` |

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Medication details retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "medicationName": "Lisinopril",
    "dosage": "10mg",
    "frequency": "ONCE_DAILY",
    "startDate": "2024-01-15",
    "endDate": "2024-07-15",
    "prescribedBy": "Dr. Sarah Johnson",
    "instructions": "Take with food in the morning",
    "purpose": "Blood pressure management",
    "medicationType": "PRESCRIPTION",
    "status": "ACTIVE",
    "reminderTimes": ["08:00"],
    "notes": "Monitor blood pressure weekly",
    "totalDoses": 30,
    "takenDoses": 26,
    "missedDoses": 4,
    "adherenceRate": 86.7,
    "nextDoseTime": "2024-01-16T08:00:00Z",
    "daysRemaining": 152,
    "estimatedFinishDate": "2024-07-15",
    "refillDate": "2024-07-01",
    "sideEffects": ["Dizziness", "Dry cough"],
    "intakeHistory": [
      {
        "date": "2024-01-15",
        "scheduledTime": "08:00",
        "actualTime": "08:15",
        "status": "TAKEN",
        "notes": "Took with breakfast"
      },
      {
        "date": "2024-01-14",
        "scheduledTime": "08:00",
        "actualTime": null,
        "status": "MISSED",
        "notes": "Forgot to take"
      }
    ]
  }
}
```

### Error Responses

**403 Forbidden - Not User's Medication**
```json
{
  "success": false,
  "message": "Access denied - You can only view your own medications",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/medications/550e8400-e29b-41d4-a716-446655440003"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Medication not found",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/medications/550e8400-e29b-41d4-a716-446655440003"
}
```

---

## 4. Update Medication

Updates an existing medication's information.

### Request Details
- **Method**: `PUT`
- **Endpoint**: `/medications/{id}`
- **Authentication**: Required

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | ✅ | Medication's unique identifier |

### Request Body
```json
{
  "dosage": "20mg",
  "frequency": "TWICE_DAILY",
  "instructions": "Take with food, morning and evening",
  "reminderTimes": ["08:00", "20:00"],
  "notes": "Increased dosage as per doctor's recommendation"
}
```

### Field Specifications
Same as Create Medication, but all fields are optional for updates.

### Response Format
Same as Get Medication Details (200 OK instead of 201)

### Error Responses

**400 Bad Request - Invalid Update**
```json
{
  "success": false,
  "message": "Cannot update medication that has been discontinued",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/medications/550e8400-e29b-41d4-a716-446655440003"
}
```

---

## 5. Remove Medication

Removes a medication from the user's list (soft delete - sets status to DISCONTINUED).

### Request Details
- **Method**: `DELETE`
- **Endpoint**: `/medications/{id}`
- **Authentication**: Required

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | ✅ | Medication's unique identifier |

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reason` | String | ❌ | Reason for discontinuation |

### Example Request
```
DELETE /medications/550e8400-e29b-41d4-a716-446655440003?reason=Course completed
```

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Medication discontinued successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "status": "DISCONTINUED",
    "discontinuedAt": "2024-01-15T10:30:00Z",
    "discontinuationReason": "Course completed"
  }
}
```

---

## 6. Get Active Medications

Retrieves only the user's currently active medications.

### Request Details
- **Method**: `GET`
- **Endpoint**: `/medications/active`
- **Authentication**: Required

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Active medications retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "medicationName": "Lisinopril",
      "dosage": "10mg",
      "frequency": "ONCE_DAILY",
      "nextDoseTime": "2024-01-16T08:00:00Z",
      "reminderTimes": ["08:00"],
      "adherenceRate": 86.7,
      "requiresRefill": false,
      "daysRemaining": 152
    }
  ]
}
```

---

## 7. Update Medication Status

Updates the status of a medication (active, paused, completed, discontinued).

### Request Details
- **Method**: `PUT`
- **Endpoint**: `/medications/{id}/status`
- **Authentication**: Required

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | ✅ | Medication's unique identifier |

### Request Body
```json
{
  "status": "PAUSED",
  "reason": "Temporary side effects",
  "pauseUntil": "2024-02-01"
}
```

### Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `status` | Enum | ✅ | Valid status value | New medication status |
| `reason` | String | ❌ | Max 200 characters | Reason for status change |
| `pauseUntil` | String | ❌ | YYYY-MM-DD format | Resume date (for PAUSED status) |

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Medication status updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "status": "PAUSED",
    "statusUpdatedAt": "2024-01-15T10:30:00Z",
    "statusReason": "Temporary side effects",
    "pauseUntil": "2024-02-01"
  }
}
```

---

## 8. Set Medication Reminder

Sets or updates reminder preferences for a medication.

### Request Details
- **Method**: `POST`
- **Endpoint**: `/medications/{id}/reminder`
- **Authentication**: Required

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | ✅ | Medication's unique identifier |

### Request Body
```json
{
  "reminderTimes": ["08:00", "20:00"],
  "reminderType": "PUSH_NOTIFICATION",
  "advanceReminder": 15,
  "persistentReminder": true,
  "soundEnabled": true,
  "vibrationEnabled": true
}
```

### Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `reminderTimes` | Array | ✅ | Array of HH:MM strings | Times to send reminders |
| `reminderType` | Enum | ❌ | PUSH, SMS, EMAIL, ALL | Type of reminder |
| `advanceReminder` | Integer | ❌ | 0-60 minutes | Minutes before dose time |
| `persistentReminder` | Boolean | ❌ | true/false | Keep reminding until marked taken |
| `soundEnabled` | Boolean | ❌ | true/false | Enable sound for reminders |
| `vibrationEnabled` | Boolean | ❌ | true/false | Enable vibration for reminders |

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Medication reminder set successfully",
  "data": {
    "medicationId": "550e8400-e29b-41d4-a716-446655440003",
    "reminderTimes": ["08:00", "20:00"],
    "reminderType": "PUSH_NOTIFICATION",
    "advanceReminder": 15,
    "nextReminderTime": "2024-01-16T07:45:00Z"
  }
}
```

---

## 9. Log Medication Intake

Records that a dose of medication has been taken.

### Request Details
- **Method**: `POST`
- **Endpoint**: `/medications/{id}/log`
- **Authentication**: Required

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | ✅ | Medication's unique identifier |

### Request Body
```json
{
  "takenAt": "2024-01-15T08:15:00Z",
  "scheduledTime": "08:00",
  "status": "TAKEN",
  "notes": "Took with breakfast",
  "sideEffects": ["Mild dizziness"]
}
```

### Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `takenAt` | String | ❌ | ISO 8601 format | When dose was taken (defaults to now) |
| `scheduledTime` | String | ✅ | HH:MM format | Scheduled time for this dose |
| `status` | Enum | ✅ | TAKEN, MISSED, SKIPPED | Status of this dose |
| `notes` | String | ❌ | Max 200 characters | Notes about this dose |
| `sideEffects` | Array | ❌ | Array of strings | Any side effects experienced |

### Status Options
- `TAKEN` - Dose was taken as scheduled
- `MISSED` - Dose was forgotten/missed
- `SKIPPED` - Dose was intentionally skipped

### Response Format

**Success Response (201 Created)**
```json
{
  "success": true,
  "message": "Medication intake logged successfully",
  "data": {
    "id": "log-550e8400-e29b-41d4-a716-446655440004",
    "medicationId": "550e8400-e29b-41d4-a716-446655440003",
    "scheduledTime": "08:00",
    "takenAt": "2024-01-15T08:15:00Z",
    "status": "TAKEN",
    "notes": "Took with breakfast",
    "sideEffects": ["Mild dizziness"],
    "updatedAdherenceRate": 87.1
  }
}
```

---

## 10. Get Today's Reminders

Retrieves all medication reminders for the current day.

### Request Details
- **Method**: `GET`
- **Endpoint**: `/medications/reminders`
- **Authentication**: Required

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `date` | String | ❌ | Date for reminders (defaults to today) | `2024-01-15` |
| `includeCompleted` | Boolean | ❌ | Include already taken doses | `false` |

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Medication reminders retrieved successfully",
  "data": [
    {
      "medicationId": "550e8400-e29b-41d4-a716-446655440003",
      "medicationName": "Lisinopril",
      "dosage": "10mg",
      "scheduledTime": "08:00",
      "reminderTime": "07:45",
      "status": "PENDING",
      "isOverdue": false,
      "minutesUntilDue": 30,
      "instructions": "Take with food"
    },
    {
      "medicationId": "550e8400-e29b-41d4-a716-446655440005",
      "medicationName": "Vitamin D3",
      "dosage": "1000 IU",
      "scheduledTime": "20:00",
      "reminderTime": "19:45",
      "status": "TAKEN",
      "takenAt": "2024-01-15T19:50:00Z",
      "isOverdue": false
    }
  ]
}
```

---

## UI Integration Guidelines

### Medication Management Interface

```javascript
// Medication list component
const MedicationList = () => {
  const [medications, setMedications] = useState([]);
  const [filter, setFilter] = useState('ACTIVE');
  const [loading, setLoading] = useState(false);
  
  const loadMedications = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/medications?status=${filter}`);
      setMedications(response.data.data.content);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };
  
  const logIntake = async (medicationId, scheduledTime, status) => {
    try {
      const response = await api.post(`/medications/${medicationId}/log`, {
        scheduledTime,
        status,
        takenAt: new Date().toISOString()
      });
      
      // Update UI optimistically
      updateMedicationAdherence(medicationId, response.data.data.updatedAdherenceRate);
      showSuccessMessage('Intake logged successfully');
    } catch (error) {
      handleError(error);
    }
  };
  
  return (
    <div className="medication-list">
      {medications.map(medication => (
        <MedicationCard 
          key={medication.id}
          medication={medication}
          onLogIntake={logIntake}
          onEdit={() => editMedication(medication.id)}
          onDelete={() => deleteMedication(medication.id)}
        />
      ))}
    </div>
  );
};
```

### Reminder System

```javascript
// Reminder notification component
const MedicationReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [showOverdue, setShowOverdue] = useState(true);
  
  useEffect(() => {
    loadTodaysReminders();
    
    // Set up periodic refresh for real-time updates
    const interval = setInterval(loadTodaysReminders, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const loadTodaysReminders = async () => {
    try {
      const response = await api.get('/medications/reminders');
      setReminders(response.data.data);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  };
  
  const markAsTaken = async (medicationId, scheduledTime) => {
    try {
      await api.post(`/medications/${medicationId}/log`, {
        scheduledTime,
        status: 'TAKEN'
      });
      
      // Update local state
      setReminders(prev => prev.map(reminder => 
        reminder.medicationId === medicationId && reminder.scheduledTime === scheduledTime
          ? { ...reminder, status: 'TAKEN', takenAt: new Date().toISOString() }
          : reminder
      ));
      
      showSuccessMessage('Medication marked as taken');
    } catch (error) {
      handleError(error);
    }
  };
  
  const overdueReminders = reminders.filter(r => r.isOverdue && r.status === 'PENDING');
  const upcomingReminders = reminders.filter(r => !r.isOverdue && r.status === 'PENDING');
  
  return (
    <div className="medication-reminders">
      {overdueReminders.length > 0 && (
        <div className="overdue-section">
          <h3>⚠️ Overdue Medications</h3>
          {overdueReminders.map(reminder => (
            <ReminderCard 
              key={`${reminder.medicationId}-${reminder.scheduledTime}`}
              reminder={reminder}
              isOverdue={true}
              onMarkTaken={markAsTaken}
            />
          ))}
        </div>
      )}
      
      <div className="upcoming-section">
        <h3>📅 Today's Schedule</h3>
        {upcomingReminders.map(reminder => (
          <ReminderCard 
            key={`${reminder.medicationId}-${reminder.scheduledTime}`}
            reminder={reminder}
            onMarkTaken={markAsTaken}
          />
        ))}
      </div>
    </div>
  );
};
```

### Error Handling Strategy

```javascript
const handleMedicationError = (error) => {
  if (error.response?.status === 400) {
    // Validation errors
    const validationErrors = error.response.data.data?.errors || [];
    return validationErrors.reduce((acc, err) => {
      acc[err.field] = err.message;
      return acc;
    }, {});
  } else if (error.response?.status === 409) {
    // Conflict (duplicate medication)
    return {
      general: 'This medication already exists in your list',
      suggestion: 'Would you like to update the existing medication instead?'
    };
  } else if (error.response?.status === 403) {
    // Access denied
    return { general: 'Access denied' };
  } else if (error.response?.status === 404) {
    // Not found
    return { general: 'Medication not found' };
  } else {
    // Generic error
    return { general: 'Unable to process request. Please try again.' };
  }
};
```

### State Management Integration

```javascript
// Pinia medication store
export const useMedicationStore = defineStore('medication', {
  state: () => ({
    medications: [],
    activeReminders: [],
    selectedMedication: null,
    adherenceStats: {},
    loading: false,
    error: null
  }),
  
  getters: {
    activeMedications: (state) => 
      state.medications.filter(med => med.status === 'ACTIVE'),
    
    overdueReminders: (state) => 
      state.activeReminders.filter(reminder => reminder.isOverdue),
    
    averageAdherence: (state) => {
      const activeMeds = state.medications.filter(med => med.status === 'ACTIVE');
      if (activeMeds.length === 0) return 0;
      
      const totalAdherence = activeMeds.reduce((sum, med) => sum + med.adherenceRate, 0);
      return totalAdherence / activeMeds.length;
    }
  },
  
  actions: {
    async addMedication(medicationData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await medicationApi.create(medicationData);
        const newMedication = response.data.data;
        
        this.medications.unshift(newMedication);
        
        return { success: true, data: newMedication };
      } catch (error) {
        this.error = handleMedicationError(error);
        return { success: false, errors: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async loadMedications(filters = {}) {
      this.loading = true;
      
      try {
        const response = await medicationApi.getAll(filters);
        this.medications = response.data.data.content;
        return { success: true };
      } catch (error) {
        this.error = handleMedicationError(error);
        return { success: false, errors: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async logIntake(medicationId, intakeData) {
      try {
        const response = await medicationApi.logIntake(medicationId, intakeData);
        
        // Update medication adherence rate
        const medicationIndex = this.medications.findIndex(med => med.id === medicationId);
        if (medicationIndex !== -1) {
          this.medications[medicationIndex].adherenceRate = response.data.data.updatedAdherenceRate;
        }
        
        // Update reminders
        await this.loadTodaysReminders();
        
        return { success: true, data: response.data.data };
      } catch (error) {
        return { success: false, errors: handleMedicationError(error) };
      }
    },
    
    async loadTodaysReminders() {
      try {
        const response = await medicationApi.getReminders();
        this.activeReminders = response.data.data;
      } catch (error) {
        console.error('Failed to load reminders:', error);
      }
    },
    
    async setReminder(medicationId, reminderData) {
      try {
        const response = await medicationApi.setReminder(medicationId, reminderData);
        
        // Update medication in list
        const medicationIndex = this.medications.findIndex(med => med.id === medicationId);
        if (medicationIndex !== -1) {
          this.medications[medicationIndex].reminderTimes = reminderData.reminderTimes;
        }
        
        return { success: true, data: response.data.data };
      } catch (error) {
        return { success: false, errors: handleMedicationError(error) };
      }
    }
  }
});
```

### Notification Integration

```javascript
// Push notification service for medication reminders
class MedicationNotificationService {
  static async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
  
  static async scheduleReminder(medication, reminderTime) {
    if (await this.requestPermission()) {
      const notification = new Notification(`💊 ${medication.medicationName}`, {
        body: `Time to take your ${medication.dosage} dose`,
        icon: '/icons/medication-reminder.png',
        badge: '/icons/badge.png',
        tag: `medication-${medication.id}`,
        requireInteraction: true,
        actions: [
          { action: 'taken', title: 'Mark as Taken' },
          { action: 'snooze', title: 'Snooze 15 min' }
        ]
      });
      
      notification.onclick = () => {
        window.focus();
        // Navigate to medication details
        router.push(`/medications/${medication.id}`);
      };
    }
  }
  
  static async showAdherenceReminder(medicationName, missedDoses) {
    if (await this.requestPermission()) {
      new Notification(`📊 Medication Adherence Alert`, {
        body: `You've missed ${missedDoses} doses of ${medicationName} this week`,
        icon: '/icons/adherence-alert.png'
      });
    }
  }
}
```

### Performance Considerations

1. **Real-time Updates**: Implement WebSocket for real-time reminder updates
2. **Offline Support**: Cache medication data for offline access
3. **Background Sync**: Sync medication logs when connection restored
4. **Efficient Polling**: Use smart polling intervals based on next reminder time

### Security Considerations

1. **Data Privacy**: Encrypt sensitive medication data
2. **Access Control**: Ensure users can only access their own medications
3. **Audit Trail**: Log all medication changes for safety

---

## Testing Recommendations

### Unit Testing
- Test medication validation logic
- Test adherence calculation
- Test reminder scheduling
- Test error handling scenarios

### Integration Testing
- Test complete medication management flow
- Test reminder notification system
- Test intake logging accuracy
- Test data synchronization

### E2E Testing
- Test end-to-end medication tracking
- Test reminder interactions
- Test adherence reporting
- Test multi-device synchronization
