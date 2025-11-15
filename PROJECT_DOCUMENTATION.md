# Calendar Application - Project Documentation

## Project Overview

A full-stack calendar application that allows users to manage appointments with drag-and-drop functionality, appointment types with custom colors, and real-time notifications. The application supports multi-user concurrent updates through WebSocket connections.

## Features

### Core Features
- **Calendar Views**: Day and Week views (Week is default)
- **Appointment Management**: Create, read, update, delete appointments
- **Drag & Drop**: Move appointments to different time slots
- **Resize**: Adjust appointment duration by dragging edges
- **Appointment Types**: User-defined categories with custom colors
- **In-App Reminders**: Notifications at configurable intervals (0, 5, 10, 15, 30 minutes before event)
- **Real-Time Sync**: WebSocket-based multi-user support for concurrent updates
- **Material Design**: Clean, modern UI using Angular Material

### User Interactions
- Click on time slot to create new appointment
- Drag appointment to reschedule
- Resize appointment by dragging top/bottom edges
- Click appointment to open edit drawer
- Filter by appointment type
- Receive reminder notifications 15 minutes before (configurable)

## Technical Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Build Tool**: Maven
- **Database**: H2 (in-memory)
- **ORM**: Spring Data JPA
- **WebSocket**: Spring WebSocket + STOMP
- **Language**: Java 17+

### Frontend
- **Framework**: Angular 19
- **UI Library**: Angular Material
- **Drag & Drop**: Angular CDK
- **WebSocket Client**: RxJS + STOMP.js
- **Language**: TypeScript

## Architecture

### System Architecture

```
┌─────────────────────────────────────┐
│         Angular Frontend            │
│  ┌──────────────────────────────┐  │
│  │  Calendar Components         │  │
│  │  - Week View                 │  │
│  │  - Day View                  │  │
│  │  - Appointment Drawer        │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  Services                    │  │
│  │  - Appointment Service       │  │
│  │  - WebSocket Service         │  │
│  │  - Reminder Service          │  │
│  └──────────────────────────────┘  │
└─────────────────┬───────────────────┘
                  │ HTTP REST + WebSocket
                  │
┌─────────────────▼───────────────────┐
│      Spring Boot Backend            │
│  ┌──────────────────────────────┐  │
│  │  REST Controllers            │  │
│  │  - AppointmentController     │  │
│  │  - AppointmentTypeController │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  WebSocket Endpoints         │  │
│  │  - /ws/appointments          │  │
│  │  - /ws/reminders             │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  Services & Repositories     │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  H2 Database                 │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Data Models

### Appointment Entity

```java
{
  "id": "Long",
  "title": "String",
  "description": "String (optional)",
  "startTime": "LocalDateTime",
  "endTime": "LocalDateTime",
  "appointmentType": "AppointmentType",
  "reminderMinutes": "Integer (0, 5, 10, 15, 30)",
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime"
}
```

### AppointmentType Entity

```java
{
  "id": "Long",
  "name": "String",
  "color": "String (hex color code, e.g., #FF5733)",
  "createdAt": "LocalDateTime"
}
```

## API Endpoints

### Appointment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | Get all appointments |
| GET | `/api/appointments?start={date}&end={date}` | Get appointments in date range |
| GET | `/api/appointments/{id}` | Get appointment by ID |
| POST | `/api/appointments` | Create new appointment |
| PATCH | `/api/appointments/{id}` | Partially update appointment |
| DELETE | `/api/appointments/{id}` | Delete appointment |

#### PATCH Examples

**Drag & Drop (update times only):**
```json
{
  "startTime": "2025-11-15T10:00:00",
  "endTime": "2025-11-15T11:00:00"
}
```

**Resize (update end time only):**
```json
{
  "endTime": "2025-11-15T11:30:00"
}
```

**Edit from drawer (update multiple fields):**
```json
{
  "title": "Updated Meeting",
  "description": "New description",
  "appointmentTypeId": 2,
  "reminderMinutes": 30
}
```

### AppointmentType Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointment-types` | Get all appointment types |
| GET | `/api/appointment-types/{id}` | Get appointment type by ID |
| POST | `/api/appointment-types` | Create new appointment type |
| PATCH | `/api/appointment-types/{id}` | Partially update appointment type |
| DELETE | `/api/appointment-types/{id}` | Delete appointment type |

## WebSocket Events

### Connection
- **Endpoint**: `/ws`
- **Protocol**: STOMP over WebSocket

### Topics (Subscribe)

| Topic | Description | Payload |
|-------|-------------|---------|
| `/topic/appointments` | Broadcast appointment changes | AppointmentEvent |
| `/user/queue/reminders` | User-specific reminder notifications | ReminderNotification |

### Destinations (Send)

| Destination | Description | Payload |
|-------------|-------------|---------|
| `/app/appointment/create` | Create appointment | Appointment |
| `/app/appointment/update` | Update appointment | Appointment |
| `/app/appointment/delete` | Delete appointment | Long (id) |

### WebSocket Message Types

**AppointmentEvent**
```json
{
  "eventType": "CREATED | UPDATED | DELETED",
  "appointment": { /* Appointment object */ },
  "timestamp": "ISO-8601 datetime"
}
```

**ReminderNotification**
```json
{
  "appointmentId": "Long",
  "title": "String",
  "startTime": "ISO-8601 datetime",
  "minutesBefore": "Integer"
}
```

## Frontend Components

### Component Structure

```
app/
├── components/
│   ├── calendar/
│   │   ├── calendar-view/           # Main calendar container
│   │   ├── week-view/               # Week view component
│   │   ├── day-view/                # Day view component
│   │   ├── appointment-card/        # Individual appointment display
│   │   └── time-grid/               # Time slots grid
│   ├── appointment/
│   │   ├── appointment-drawer/      # Edit/create drawer
│   │   └── appointment-form/        # Form component
│   ├── appointment-type/
│   │   ├── type-list/               # List of appointment types
│   │   └── type-form/               # Create/edit type form
│   └── notification/
│       └── reminder-snackbar/       # Reminder notification
├── services/
│   ├── appointment.service.ts       # HTTP API calls
│   ├── appointment-type.service.ts  # HTTP API calls
│   ├── websocket.service.ts         # WebSocket connection
│   └── reminder.service.ts          # Reminder scheduling
├── models/
│   ├── appointment.model.ts
│   ├── appointment-type.model.ts
│   └── reminder.model.ts
└── app.component.ts
```

### Key Features Implementation

#### Drag & Drop (Angular CDK)
- Use `cdkDrag` directive on appointment cards
- Use `cdkDropList` on time slots
- Calculate new start/end time based on drop position

#### Resize
- Custom resize handles (top and bottom)
- Use mouse events to track drag distance
- Update appointment duration in real-time

#### Material Components Used
- `mat-sidenav` - Appointment drawer
- `mat-card` - Appointment cards
- `mat-form-field` - Form inputs
- `mat-select` - Appointment type selector
- `mat-datepicker` - Date selection
- `mat-snackbar` - Reminder notifications
- `mat-button` - Action buttons
- `mat-icon` - Icons
- `mat-toolbar` - Top navigation
- `mat-chip` - Appointment type tags

## Development Setup

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- yarn
- Git

### Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend runs on: `http://localhost:8080`

### Frontend Setup

```bash
cd frontend
yarn install
yarn start
```

Frontend runs on: `http://localhost:4200`

## Configuration

### Backend Configuration (application.properties)

```properties
# Server
server.port=8080

# H2 Database
spring.datasource.url=jdbc:h2:mem:calendardb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

# H2 Console (optional, for debugging)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JPA
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# WebSocket
spring.websocket.allowed-origins=http://localhost:4200
```

### Frontend Configuration (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  wsUrl: 'ws://localhost:8080/ws'
};
```

## Database Schema

### Tables

**appointment**
- id (BIGINT, PK, AUTO_INCREMENT)
- title (VARCHAR(255), NOT NULL)
- description (TEXT)
- start_time (TIMESTAMP, NOT NULL)
- end_time (TIMESTAMP, NOT NULL)
- reminder_minutes (INT, DEFAULT 15)
- appointment_type_id (BIGINT, FK)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**appointment_type**
- id (BIGINT, PK, AUTO_INCREMENT)
- name (VARCHAR(100), NOT NULL, UNIQUE)
- color (VARCHAR(7), NOT NULL)
- created_at (TIMESTAMP)

## Future Enhancements

- Recurring appointments
- Email/SMS notifications
- Calendar export (iCal format)
- Multiple calendars per user
- User authentication and authorization
- Appointment search and filtering
- Time zone support
- Mobile responsive design improvements
- Dark mode

## Testing Strategy

### Backend Testing
- Unit tests for services
- Integration tests for repositories
- REST API tests with MockMvc
- WebSocket endpoint tests

### Frontend Testing
- Unit tests with Jasmine/Karma
- Component tests
- Service tests with mocked HTTP
- E2E tests with Protractor/Cypress

## Project Timeline

1. **Week 1**: Backend setup and core models
2. **Week 2**: REST APIs and WebSocket implementation
3. **Week 3**: Frontend setup and calendar views
4. **Week 4**: Drag & drop and resize functionality
5. **Week 5**: Reminder system and notifications
6. **Week 6**: Testing and bug fixes

## Contributors

- Developer: [Your Name]
- Created: 2025-11-12

## License

[Choose appropriate license]
