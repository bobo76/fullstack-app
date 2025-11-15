# Custom Instructions - Calendar Application Frontend

## Project Context

This is a Calendar Application frontend - an Angular 19 application with Material Design for appointment management.

**Goal:** Interactive calendar with drag-and-drop, resize, and real-time synchronization
**Tech Stack:** Angular 19, Angular Material, TypeScript, RxJS, STOMP WebSocket
**Key Components:** Calendar views (day/week), appointment drawer, WebSocket service, reminder notifications
**Priorities:** User experience > Real-time sync > Performance > Code quality

## Communication Guidelines

- Show code changes, minimal explanations unless asked
- Batch all related edits together before building
- Skip confirmation questions for obvious fixes (examples below)
- When multiple approaches exist, present 2-3 options briefly with trade-offs
- Be explicit about any assumptions made
- Report results concisely: BUILD status + summary + lint/test results

**Obvious fixes (no confirmation needed):**

- Typos and spelling errors
- Missing semicolons or syntax errors
- Missing imports that are clearly needed
- Unused variables or methods
- Common Angular decorators that are obviously missing
- Formatting issues (indentation, spacing)

## Coding Preferences

### Angular Specific

- Use standalone components (Angular 19 default)
- Follow Angular style guide naming conventions
- Use signals for reactive state management
- Prefer `inject()` function over constructor injection
- Use `OnPush` change detection strategy when possible
- Keep components focused - delegate complex logic to services
- Use Angular Material components consistently

### TypeScript Standards

- Use strict TypeScript settings
- Prefer interfaces for data models
- Use type annotations for function parameters and returns
- Use `const` and `let`, never `var`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Prefer arrow functions for callbacks
- Use modern ES6+ features

### RxJS Best Practices

- Use async pipe in templates instead of manual subscriptions
- Unsubscribe from subscriptions (or use takeUntil pattern)
- Use appropriate operators (map, filter, switchMap, debounceTime, etc.)
- Prefer declarative over imperative code
- Use subjects sparingly, prefer BehaviorSubject/ReplaySubject when needed

### Material Design Guidelines

- Use Material components exclusively (no custom UI components unless necessary)
- Follow Material Design principles for spacing, colors, typography
- Use Material theming system
- Ensure accessibility (ARIA labels, keyboard navigation)
- Use responsive design breakpoints

### Code Organization

- File structure: `components/`, `services/`, `models/`, `guards/`, `interceptors/`
- One component/service/model per file
- Group related features in feature modules/folders
- Keep shared code in `shared/` folder
- Separate business logic from presentation logic

### Component Structure

```typescript
@Component({
  selector: 'app-component-name',
  standalone: true,
  imports: [...],
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentName {
  // Injects
  private service = inject(ServiceName);

  // Signals
  appointments = signal<Appointment[]>([]);

  // Lifecycle
  ngOnInit() { }

  // Methods
  methodName() { }
}
```

## Decision Authority

### Automatic (no confirmation needed):

- Fix typos, bugs, and obvious errors
- Add missing imports and decorators
- Remove unused imports and variables
- Add type annotations where missing
- Extract magic numbers/strings to constants
- Rename variables/methods for clarity
- Remove unused code
- Run build after changes
- Fix compilation/lint errors iteratively
- Add component unit tests
- Update component documentation

### Always ask first:

- Breaking changes to component APIs (input/output changes)
- Major refactoring affecting 3+ components
- Adding new npm dependencies
- Changing Angular or Material version
- Changing routing structure
- Removing features that might be in use
- Performance trade-offs affecting user experience
- Changes to WebSocket connection logic

## Testing & Verification

- **Always build** after code changes: `yarn build`
- Run tests: `yarn test`
- Run linter: `yarn lint`
- Add unit tests (Jasmine/Karma) for new components/services
- Report test results concisely: `X passed, Y failed, Z total`
- Only report task complete after successful build
- Verify app runs without errors: `yarn start`
- Test in browser at http://localhost:4200

## Error Handling

- Iterate on compilation/lint errors until fixed
- Try reasonable fixes before asking for help
- Fix all errors in batch when possible
- Report errors in format: `file:line - description`
- If stuck after 2 attempts, ask for guidance
- Handle HTTP errors gracefully (show user-friendly messages)
- Log errors to console for debugging
- Use Material Snackbar for user notifications

## Technology Stack

**Core:**

- Angular 19
- TypeScript 5.x
- RxJS 7.x
- yarn package manager

**UI Library:**

- Angular Material 19
- Angular CDK (for drag & drop)
- Material Icons

**WebSocket:**

- @stomp/stompjs
- RxJS WebSocketSubject

**Development:**

- Angular CLI
- Jasmine/Karma for testing
- ESLint for linting

## Yarn Commands

- Install: `yarn install`
- Dev server: `yarn start` (runs on http://localhost:4200)
- Build: `yarn build`
- Test: `yarn test`
- Lint: `yarn lint`
- Build for production: `yarn build --configuration production`

## Workflow

1. Read/analyze code as needed
2. Make all related changes in parallel
3. Build to verify: `yarn build`
4. If errors: iterate, find root cause, fix. Otherwise, ask for guidance
5. Run tests if logic changed: `yarn test`
6. Report: BUILD status + changes summary + test results

## Application Structure

```
src/
├── app/
│   ├── components/
│   │   ├── calendar/
│   │   │   ├── calendar-view/
│   │   │   ├── week-view/
│   │   │   ├── day-view/
│   │   │   ├── appointment-card/
│   │   │   └── time-grid/
│   │   ├── appointment/
│   │   │   ├── appointment-drawer/
│   │   │   └── appointment-form/
│   │   └── appointment-type/
│   │       ├── type-list/
│   │       └── type-form/
│   ├── services/
│   │   ├── appointment.service.ts
│   │   ├── appointment-type.service.ts
│   │   ├── websocket.service.ts
│   │   └── reminder.service.ts
│   ├── models/
│   │   ├── appointment.model.ts
│   │   ├── appointment-type.model.ts
│   │   └── reminder.model.ts
│   └── app.component.ts
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

## Domain Knowledge

**Calendar Application:**

- Display appointments in day and week views (week is default)
- Drag & drop to reschedule appointments
- Resize to adjust appointment duration
- Click appointment to open edit drawer
- Real-time updates via WebSocket
- In-app reminder notifications 15 minutes before (configurable: 0, 5, 10, 15, 30)
- Color-coded appointment types
- Only show title on appointment cards

**User Interactions:**

- Click time slot → Create new appointment
- Drag appointment → Update start/end time (PATCH request)
- Resize appointment → Update duration (PATCH request)
- Click appointment → Open drawer for editing
- Save in drawer → PATCH request with changed fields
- Delete in drawer → DELETE request
- Receive reminder → Show Material Snackbar

**WebSocket Events:**

- Connect to: `ws://localhost:8080/ws`
- Subscribe to: `/topic/appointments` (all changes)
- Subscribe to: `/user/queue/reminders` (personal reminders)
- On appointment change → Update local state
- On reminder → Show notification

## API Integration

**Base URL:** `http://localhost:8080/api`

**Endpoints:**

- GET `/appointments` - List all
- GET `/appointments?start={iso}&end={iso}` - Date range
- GET `/appointments/{id}` - Single appointment
- POST `/appointments` - Create
- PATCH `/appointments/{id}` - Partial update
- DELETE `/appointments/{id}` - Delete
- GET `/appointment-types` - List types
- POST `/appointment-types` - Create type
- PATCH `/appointment-types/{id}` - Update type

## Material Components Used

- `MatSidenav` - Appointment edit drawer
- `MatCard` - Appointment display cards
- `MatFormField` - Form inputs
- `MatInput` - Text inputs
- `MatSelect` - Appointment type selector
- `MatDatepicker` - Date selection
- `MatTimepicker` - Time selection (or ngx-material-timepicker)
- `MatSnackBar` - Notifications/reminders
- `MatButton` - Action buttons
- `MatIcon` - Icons
- `MatToolbar` - Top navigation
- `MatChip` - Appointment type tags
- `MatDialog` - Modals (if needed)

## Drag & Drop Implementation

Use Angular CDK Drag & Drop:

```typescript
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

// In template
<div cdkDropList (cdkDropListDropped)="onDrop($event)">
  <div cdkDrag *ngFor="let appointment of appointments">
    {{ appointment.title }}
  </div>
</div>

// In component
onDrop(event: CdkDragDrop<Appointment[]>) {
  // Calculate new time based on drop position
  // Call appointmentService.update() with PATCH
}
```

## Resize Implementation

Use mouse events on resize handles:

```typescript
onResizeStart(event: MouseEvent) {
  // Track initial position
}

onResizeMove(event: MouseEvent) {
  // Calculate new height/time
  // Update UI optimistically
}

onResizeEnd(event: MouseEvent) {
  // Call appointmentService.update() with PATCH
}
```

## State Management

Use Angular signals for reactive state:

```typescript
export class CalendarService {
  private appointmentsSignal = signal<Appointment[]>([]);
  appointments = this.appointmentsSignal.asReadonly();

  addAppointment(appointment: Appointment) {
    this.appointmentsSignal.update(apps => [...apps, appointment]);
  }
}
```

## WebSocket Service Pattern

```typescript
export class WebSocketService {
  private stompClient: Client;
  private appointments$ = new Subject<AppointmentEvent>();

  connect() {
    // Initialize STOMP client
    // Subscribe to topics
  }

  getAppointmentUpdates(): Observable<AppointmentEvent> {
    return this.appointments$.asObservable();
  }
}
```

## Configuration

**Environment Variables:**

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  wsUrl: 'ws://localhost:8080/ws'
};
```

**Proxy Configuration (proxy.conf.json):**

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false
  },
  "/ws": {
    "target": "http://localhost:8080",
    "secure": false,
    "ws": true
  }
}
```

## Notes

- Use standalone components (Angular 19 default)
- Signals for state management
- Material-only UI components
- Real-time sync via WebSocket
- Optimistic UI updates (update UI before server confirms)
- Handle connection loss gracefully
- Show loading states
- Accessible (keyboard navigation, ARIA labels)
- Responsive design (mobile-friendly)
