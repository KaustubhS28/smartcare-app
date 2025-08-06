# Appointment Feature - Technical Documentation

## Overview
This document provides detailed technical specifications for the Appointment feature endpoints in the Smart Care Services application. The Appointment feature allows users to book, manage, and track their medical appointments with healthcare providers.

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
| POST | `/appointments` | Create new appointment | ✅ |
| GET | `/appointments` | Get user's appointments | ✅ |
| GET | `/appointments/{id}` | Get appointment details | ✅ |
| PUT | `/appointments/{id}` | Update appointment | ✅ |
| DELETE | `/appointments/{id}` | Cancel appointment | ✅ |
| PUT | `/appointments/{id}/status` | Update appointment status | ✅ |
| GET | `/appointments/upcoming` | Get upcoming appointments | ✅ |
| GET | `/appointments/history` | Get appointment history | ✅ |

---

## 1. Create New Appointment

Books a new appointment with a healthcare provider.

### Request Details
- **Method**: `POST`
- **Endpoint**: `/appointments`
- **Authentication**: Required

### Request Body
```json
{
  "doctorId": "550e8400-e29b-41d4-a716-446655440000",
  "appointmentDate": "2024-02-15",
  "appointmentTime": "14:30",
  "appointmentType": "IN_PERSON",
  "reasonForVisit": "Regular checkup and blood pressure monitoring",
  "notes": "Patient has been experiencing occasional dizziness",
  "urgency": "ROUTINE",
  "duration": 30
}
```

### Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `doctorId` | UUID | ✅ | Valid doctor ID | Doctor's unique identifier |
| `appointmentDate` | String | ✅ | YYYY-MM-DD, future date | Date of appointment |
| `appointmentTime` | String | ✅ | HH:MM format | Time of appointment |
| `appointmentType` | Enum | ✅ | IN_PERSON, VIDEO, PHONE | Type of consultation |
| `reasonForVisit` | String | ✅ | 10-500 characters | Reason for the appointment |
| `notes` | String | ❌ | Max 1000 characters | Additional notes |
| `urgency` | Enum | ❌ | ROUTINE, URGENT, EMERGENCY | Appointment urgency |
| `duration` | Integer | ❌ | 15, 30, 45, 60 minutes | Expected duration |

### Appointment Type Options
- `IN_PERSON` - Physical visit to doctor's office
- `VIDEO` - Video consultation online
- `PHONE` - Phone call consultation

### Urgency Options
- `ROUTINE` - Regular scheduled appointment
- `URGENT` - Needs attention within 24-48 hours
- `EMERGENCY` - Immediate medical attention required

### Excluded Fields
The following fields are managed internally and should NOT be included in requests:
- `id` - Auto-generated UUID
- `patientId` - Set from authenticated user
- `status` - Defaults to "SCHEDULED"
- `confirmationCode` - Auto-generated
- `createdAt`, `updatedAt` - Auto-managed timestamps

### Response Format

**Success Response (201 Created)**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "doctorId": "550e8400-e29b-41d4-a716-446655440000",
    "doctorName": "Dr. Sarah Johnson",
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "appointmentDate": "2024-02-15",
    "appointmentTime": "14:30",
    "appointmentType": "IN_PERSON",
    "status": "SCHEDULED",
    "reasonForVisit": "Regular checkup and blood pressure monitoring",
    "notes": "Patient has been experiencing occasional dizziness",
    "urgency": "ROUTINE",
    "duration": 30,
    "confirmationCode": "APT-2024-001234",
    "doctorAddress": "123 Medical Plaza, New York, NY 10001",
    "consultationFee": 200.00
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
        "field": "appointmentDate",
        "message": "Appointment date must be in the future"
      },
      {
        "field": "reasonForVisit",
        "message": "Reason for visit is required"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/appointments"
}
```

**409 Conflict - Time Slot Unavailable**
```json
{
  "success": false,
  "message": "The selected time slot is no longer available",
  "data": {
    "availableSlots": [
      "14:00",
      "15:00",
      "15:30"
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/appointments"
}
```

**404 Not Found - Doctor Not Found**
```json
{
  "success": false,
  "message": "Doctor not found or not available",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/appointments"
}
```

### UI Integration Notes
- Validate date and time availability before submission
- Show alternative time slots when conflicts occur
- Display confirmation details after successful booking
- Send confirmation email/SMS to user

---

## 2. Get User's Appointments

Retrieves all appointments for the authenticated user with filtering and pagination.

### Request Details
- **Method**: `GET`
- **Endpoint**: `/appointments`
- **Authentication**: Required

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `status` | String | ❌ | Filter by status | `SCHEDULED` |
| `fromDate` | String | ❌ | Start date (YYYY-MM-DD) | `2024-01-01` |
| `toDate` | String | ❌ | End date (YYYY-MM-DD) | `2024-12-31` |
| `doctorId` | UUID | ❌ | Filter by doctor | `uuid-string` |
| `type` | String | ❌ | Filter by appointment type | `VIDEO` |
| `page` | Integer | ❌ | Page number (0-based) | `0` |
| `size` | Integer | ❌ | Page size | `10` |
| `sort` | String | ❌ | Sort criteria | `appointmentDate,desc` |

### Status Options
- `SCHEDULED` - Appointment is confirmed and scheduled
- `CONFIRMED` - Doctor has confirmed the appointment
- `IN_PROGRESS` - Appointment is currently happening
- `COMPLETED` - Appointment has been completed
- `CANCELLED` - Appointment has been cancelled
- `NO_SHOW` - Patient did not show up

### Example Request
```
GET /appointments?status=SCHEDULED&fromDate=2024-02-01&toDate=2024-02-29&page=0&size=10
```

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Appointments retrieved successfully",
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "doctorId": "550e8400-e29b-41d4-a716-446655440000",
        "doctorName": "Dr. Sarah Johnson",
        "doctorSpecialization": "Cardiology",
        "appointmentDate": "2024-02-15",
        "appointmentTime": "14:30",
        "appointmentType": "IN_PERSON",
        "status": "SCHEDULED",
        "reasonForVisit": "Regular checkup and blood pressure monitoring",
        "urgency": "ROUTINE",
        "duration": 30,
        "confirmationCode": "APT-2024-001234",
        "consultationFee": 200.00,
        "canReschedule": true,
        "canCancel": true
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10,
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      }
    },
    "totalElements": 5,
    "totalPages": 1,
    "last": true,
    "first": true,
    "numberOfElements": 5
  }
}
```

### UI Integration Notes
- Implement filters for different appointment statuses
- Show upcoming appointments prominently
- Provide quick actions (reschedule, cancel) where applicable
- Use different visual styles for different statuses

---

## 3. Get Appointment Details

Retrieves detailed information about a specific appointment.

### Request Details
- **Method**: `GET`
- **Endpoint**: `/appointments/{id}`
- **Authentication**: Required

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | ✅ | Appointment's unique identifier |

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Appointment details retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "doctorId": "550e8400-e29b-41d4-a716-446655440000",
    "doctorInfo": {
      "name": "Dr. Sarah Johnson",
      "specialization": "Cardiology",
      "profilePicture": "https://cdn.example.com/doctors/sarah-johnson.jpg",
      "rating": 4.8,
      "yearsOfExperience": 15
    },
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "appointmentDate": "2024-02-15",
    "appointmentTime": "14:30",
    "appointmentType": "IN_PERSON",
    "status": "SCHEDULED",
    "reasonForVisit": "Regular checkup and blood pressure monitoring",
    "notes": "Patient has been experiencing occasional dizziness",
    "urgency": "ROUTINE",
    "duration": 30,
    "confirmationCode": "APT-2024-001234",
    "consultationFee": 200.00,
    "appointmentLocation": {
      "type": "IN_PERSON",
      "address": "123 Medical Plaza, New York, NY 10001",
      "room": "Suite 205",
      "instructions": "Please arrive 15 minutes early for check-in"
    },
    "videoCallInfo": null,
    "canReschedule": true,
    "canCancel": true,
    "rescheduleDeadline": "2024-02-13T14:30:00Z",
    "cancellationDeadline": "2024-02-14T14:30:00Z",
    "remindersSent": [
      {
        "type": "EMAIL",
        "sentAt": "2024-02-13T09:00:00Z"
      }
    ]
  }
}
```

### Error Responses

**403 Forbidden - Not Patient's Appointment**
```json
{
  "success": false,
  "message": "Access denied - You can only view your own appointments",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/appointments/550e8400-e29b-41d4-a716-446655440002"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Appointment not found",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/appointments/550e8400-e29b-41d4-a716-446655440002"
}
```

---

## 4. Update Appointment

Updates an existing appointment (reschedule or modify details).

### Request Details
- **Method**: `PUT`
- **Endpoint**: `/appointments/{id}`
- **Authentication**: Required

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | ✅ | Appointment's unique identifier |

### Request Body
```json
{
  "appointmentDate": "2024-02-16",
  "appointmentTime": "15:00",
  "appointmentType": "VIDEO",
  "reasonForVisit": "Follow-up for blood pressure monitoring",
  "notes": "Patient reports improvement in symptoms",
  "urgency": "ROUTINE"
}
```

### Field Specifications
Same as Create Appointment, but all fields are optional for updates.

### Response Format
Same as Get Appointment Details (200 OK instead of 201)

### Error Responses

**400 Bad Request - Cannot Reschedule**
```json
{
  "success": false,
  "message": "Appointment cannot be rescheduled within 24 hours of the scheduled time",
  "data": {
    "rescheduleDeadline": "2024-02-13T14:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/appointments/550e8400-e29b-41d4-a716-446655440002"
}
```

**409 Conflict - New Time Unavailable**
```json
{
  "success": false,
  "message": "The selected time slot is not available",
  "data": {
    "availableSlots": [
      "14:00",
      "15:30",
      "16:00"
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/appointments/550e8400-e29b-41d4-a716-446655440002"
}
```

---

## 5. Cancel Appointment

Cancels an existing appointment.

### Request Details
- **Method**: `DELETE`
- **Endpoint**: `/appointments/{id}`
- **Authentication**: Required

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | ✅ | Appointment's unique identifier |

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reason` | String | ❌ | Reason for cancellation |

### Example Request
```
DELETE /appointments/550e8400-e29b-41d4-a716-446655440002?reason=Schedule conflict
```

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "status": "CANCELLED",
    "cancellationReason": "Schedule conflict",
    "cancelledAt": "2024-01-15T10:30:00Z",
    "refundAmount": 200.00,
    "refundStatus": "PENDING"
  }
}
```

### Error Responses

**400 Bad Request - Cannot Cancel**
```json
{
  "success": false,
  "message": "Appointment cannot be cancelled within 2 hours of the scheduled time",
  "data": {
    "cancellationDeadline": "2024-02-15T12:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/appointments/550e8400-e29b-41d4-a716-446655440002"
}
```

---

## 6. Update Appointment Status

Updates the status of an appointment (typically used by healthcare providers).

### Request Details
- **Method**: `PUT`
- **Endpoint**: `/appointments/{id}/status`
- **Authentication**: Required

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | ✅ | Appointment's unique identifier |

### Request Body
```json
{
  "status": "CONFIRMED",
  "notes": "Doctor has confirmed the appointment"
}
```

### Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `status` | Enum | ✅ | Valid status value | New appointment status |
| `notes` | String | ❌ | Max 500 characters | Status change notes |

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Appointment status updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "status": "CONFIRMED",
    "statusUpdatedAt": "2024-01-15T10:30:00Z",
    "statusNotes": "Doctor has confirmed the appointment"
  }
}
```

---

## 7. Get Upcoming Appointments

Retrieves the user's upcoming appointments (next 30 days).

### Request Details
- **Method**: `GET`
- **Endpoint**: `/appointments/upcoming`
- **Authentication**: Required

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `days` | Integer | ❌ | Number of days ahead (default: 30) | `7` |
| `limit` | Integer | ❌ | Maximum results (default: 10) | `5` |

### Response Format

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Upcoming appointments retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "doctorName": "Dr. Sarah Johnson",
      "appointmentDate": "2024-02-15",
      "appointmentTime": "14:30",
      "appointmentType": "IN_PERSON",
      "status": "SCHEDULED",
      "reasonForVisit": "Regular checkup",
      "daysUntilAppointment": 3,
      "isToday": false,
      "isTomorrow": false
    }
  ]
}
```

---

## 8. Get Appointment History

Retrieves the user's past appointments.

### Request Details
- **Method**: `GET`
- **Endpoint**: `/appointments/history`
- **Authentication**: Required

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `page` | Integer | ❌ | Page number | `0` |
| `size` | Integer | ❌ | Page size | `10` |
| `fromDate` | String | ❌ | Start date | `2023-01-01` |
| `toDate` | String | ❌ | End date | `2023-12-31` |

### Response Format
Similar to Get User's Appointments but filtered for past dates and completed/cancelled statuses.

---

## UI Integration Guidelines

### Appointment Booking Flow

```javascript
// Appointment booking component
const AppointmentBooking = ({ doctorId }) => {
  const [formData, setFormData] = useState({
    doctorId,
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'IN_PERSON',
    reasonForVisit: '',
    notes: '',
    urgency: 'ROUTINE'
  });
  
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const checkAvailability = async (date) => {
    if (!date) return;
    
    try {
      const response = await api.get(`/doctors/${doctorId}/availability?date=${date}`);
      setAvailableSlots(response.data.data.availableSlots);
    } catch (error) {
      console.error('Failed to check availability:', error);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/appointments', formData);
      // Handle success
      showSuccessMessage('Appointment booked successfully!');
      // Redirect or update UI
    } catch (error) {
      // Handle errors
      handleBookingError(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### Error Handling Strategy

```javascript
const handleAppointmentError = (error) => {
  if (error.response?.status === 400) {
    // Validation errors
    const validationErrors = error.response.data.data?.errors || [];
    return validationErrors.reduce((acc, err) => {
      acc[err.field] = err.message;
      return acc;
    }, {});
  } else if (error.response?.status === 409) {
    // Time slot conflict
    const availableSlots = error.response.data.data?.availableSlots || [];
    return {
      general: 'Time slot unavailable',
      suggestions: availableSlots
    };
  } else if (error.response?.status === 403) {
    // Access denied
    return { general: 'Access denied' };
  } else if (error.response?.status === 404) {
    // Not found
    return { general: 'Appointment or doctor not found' };
  } else {
    // Generic error
    return { general: 'Unable to process appointment. Please try again.' };
  }
};
```

### State Management Integration

```javascript
// Pinia appointment store
export const useAppointmentStore = defineStore('appointment', {
  state: () => ({
    appointments: [],
    upcomingAppointments: [],
    selectedAppointment: null,
    loading: false,
    error: null
  }),
  
  actions: {
    async bookAppointment(appointmentData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await appointmentApi.create(appointmentData);
        const newAppointment = response.data.data;
        
        this.appointments.unshift(newAppointment);
        this.updateUpcomingAppointments();
        
        return { success: true, data: newAppointment };
      } catch (error) {
        this.error = handleAppointmentError(error);
        return { success: false, errors: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async getAppointments(filters = {}) {
      this.loading = true;
      
      try {
        const response = await appointmentApi.getAll(filters);
        this.appointments = response.data.data.content;
        return { success: true };
      } catch (error) {
        this.error = handleAppointmentError(error);
        return { success: false, errors: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async cancelAppointment(appointmentId, reason) {
      try {
        const response = await appointmentApi.cancel(appointmentId, { reason });
        
        // Update local state
        const index = this.appointments.findIndex(apt => apt.id === appointmentId);
        if (index !== -1) {
          this.appointments[index].status = 'CANCELLED';
        }
        
        this.updateUpcomingAppointments();
        
        return { success: true, data: response.data.data };
      } catch (error) {
        return { success: false, errors: handleAppointmentError(error) };
      }
    },
    
    updateUpcomingAppointments() {
      const now = new Date();
      this.upcomingAppointments = this.appointments
        .filter(apt => {
          const aptDate = new Date(`${apt.appointmentDate}T${apt.appointmentTime}`);
          return aptDate > now && apt.status === 'SCHEDULED';
        })
        .sort((a, b) => new Date(`${a.appointmentDate}T${a.appointmentTime}`) - 
                         new Date(`${b.appointmentDate}T${b.appointmentTime}`))
        .slice(0, 5);
    }
  }
});
```

### Calendar Integration

```javascript
// Calendar component for appointment scheduling
const AppointmentCalendar = ({ doctorId, onDateSelect, onTimeSelect }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const handleDateChange = async (date) => {
    setSelectedDate(date);
    onDateSelect(date);
    
    // Fetch available slots for selected date
    try {
      const response = await api.get(`/doctors/${doctorId}/availability?date=${date}`);
      setAvailableSlots(response.data.data.availableSlots);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    }
  };
  
  return (
    <div className="appointment-calendar">
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        minDate={new Date()}
        filterDate={isWeekday}
      />
      
      {availableSlots.length > 0 && (
        <div className="time-slots">
          {availableSlots.map(slot => (
            <button
              key={slot.startTime}
              className={`time-slot ${slot.available ? 'available' : 'unavailable'}`}
              disabled={!slot.available}
              onClick={() => onTimeSelect(slot.startTime)}
            >
              {slot.startTime}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Performance Considerations

1. **Real-time Updates**: Implement WebSocket or polling for appointment status updates
2. **Caching**: Cache appointment data and refresh strategically
3. **Optimistic Updates**: Update UI immediately and rollback on failure
4. **Lazy Loading**: Load appointment details only when needed

### Security Considerations

1. **Authorization**: Ensure users can only access their own appointments
2. **Data Validation**: Validate all date/time inputs on both client and server
3. **Rate Limiting**: Prevent abuse of booking endpoints

---

## Testing Recommendations

### Unit Testing
- Test appointment validation logic
- Test date/time handling
- Test status transition logic
- Test error handling scenarios

### Integration Testing
- Test complete booking flow
- Test cancellation and rescheduling
- Test conflict resolution
- Test notification sending

### E2E Testing
- Test end-to-end appointment booking
- Test appointment management features
- Test responsive design
- Test error recovery flows
