# Custom Instructions - Calendar Application Backend

## Project Context

This is a Calendar Application backend - a full-stack appointment management system with real-time synchronization.

**Goal:** RESTful API with WebSocket support for managing appointments with drag-and-drop, resize, and reminder notifications
**Tech Stack:** Java 17, Spring Boot 3.x, Maven, H2 Database
**Key Components:** REST API, WebSocket endpoints, JPA repositories, Reminder service
**Priorities:** Real-time sync reliability > API performance > Code quality

## Communication Guidelines

- Show code changes, minimal explanations unless asked
- Batch all related edits together before building
- Skip confirmation questions for obvious fixes (examples below)
- When multiple approaches exist, present 2-3 options briefly with trade-offs
- Be explicit about any assumptions made
- Report results concisely: BUILD status + summary + test results

**Obvious fixes (no confirmation needed):**

- Typos and spelling errors
- Missing semicolons or syntax errors
- Missing imports that are clearly needed
- Unused variables or methods
- Common Spring annotations that are obviously missing
- Formatting issues (indentation, spacing)

## Coding Preferences

### Java/Spring Boot Specific

- Follow Java naming conventions (camelCase for methods/variables, PascalCase for classes)
- Use Spring Boot best practices and conventions
- Prefer constructor injection over field injection
- Use `@Slf4j` (Lombok) for logging instead of manual logger creation
- Keep controllers thin - delegate business logic to services
- Use DTOs for API requests/responses, keep entities separate
- Use Java 17 features (records for DTOs when appropriate, text blocks, pattern matching)

### REST API Standards

- Follow RESTful naming conventions for endpoints
- Use PATCH for partial updates (drag, drop, resize operations)
- Use appropriate HTTP status codes (200, 201, 204, 400, 404, 500, etc.)
- Validate input with `@Valid` and appropriate constraints
- Document endpoints with Swagger/OpenAPI annotations
- Use consistent response formats across endpoints
- Handle exceptions with `@ControllerAdvice`
- Return 204 No Content for successful DELETE operations

### WebSocket Guidelines

- Use STOMP protocol over WebSocket
- Broadcast appointment changes to `/topic/appointments`
- Send user-specific reminders to `/user/queue/reminders`
- Handle connection errors gracefully
- Log WebSocket events for debugging

### Code Organization

- Package structure: `controller`, `service`, `repository`, `model`, `dto`, `config`, `websocket`
- One public class per file
- Group related functionality in the same package
- Keep configuration in dedicated `@Configuration` classes
- Separate test fixtures and test utilities
- Run tests after making changes. Fix broken tests by finding root cause. Otherwise, ask for guidance
- Do simplification or code simplification when it bring clarity without sacrifying performance

### Performance & Optimization

- Use Spring caching (`@Cacheable`) for appointment type queries
- Index database columns used in queries (appointmentTypeId, startTime, endTime)
- Use pagination for large appointment lists
- Consider async processing for reminder notifications
- Profile and optimize only when needed (measure first)

### General Code Quality

- Use descriptive variable and method names
- Initialize fields appropriately (use Lombok `@Builder` when suitable)
- Use Optional for nullable returns, avoid null checks where possible
- Use early returns to reduce nesting
- Comment only when logic is non-obvious
- Group related constants in enums or constant classes
- Use streams judiciously (readability over cleverness)

## Decision Authority

### Automatic (no confirmation needed):

- Fix typos, bugs, and obvious errors
- Add missing imports and annotations
- Remove unused imports
- Add type annotations where missing
- Extract magic numbers/strings to constants
- Rename variables/methods for clarity (following conventions)
- Remove unused code/imports/methods
- Translate non-English comments to English
- Run Maven build after changes
- Fix compilation errors iteratively
- Add unit tests for new service logic
- Update Swagger documentation for API changes

### Always ask first:

- Breaking API changes (endpoint removal, signature changes)
- Major refactoring affecting 3+ modules
- Adding new dependencies to pom.xml
- Changing Spring Boot or Java version
- Changing architectural patterns
- Removing features that might be in use
- Performance trade-offs affecting API response times
- Changes to security/CORS configuration

## Testing & Verification

- **Always build** after code changes: `mvn clean install`
- Run unit tests after logic changes: `mvn test`
- Add unit tests (JUnit 5) for new service logic automatically
- Use Mockito for mocking in tests
- Report test results concisely: `X passed, Y failed, Z total`
- Only report task complete after successful build
- Test API endpoints with Swagger UI when available
- Verify Spring Boot application starts successfully on port 8080
- Test WebSocket connections manually or with integration tests

## Error Handling

- Iterate on compilation errors until fixed
- Try reasonable fixes before asking for help
- Fix all errors in batch when possible
- Report errors in format: `file:line - description`
- If stuck after 2 attempts, ask for guidance
- Use proper exception handling (don't swallow exceptions)
- Create custom exceptions when appropriate (`AppointmentNotFoundException`, etc.)
- Log errors appropriately (ERROR for failures, WARN for recoverable issues)

## Technology Stack

**Core:**

- Java 17
- Spring Boot 3.x (latest stable)
- Maven build system
- Lombok for boilerplate reduction

**Dependencies:**

- Spring Web (REST API)
- Spring Data JPA (Database access)
- Spring WebSocket (Real-time communication)
- H2 Database (In-memory)
- Swagger/OpenAPI for API documentation
- Jackson for JSON serialization

**Testing:**

- JUnit 5 (via spring-boot-starter-test)
- Mockito for mocking
- Spring Boot Test utilities
- H2 for test database

## Maven Commands

- Build: `mvn clean install`
- Test: `mvn test`
- Run: `mvn spring-boot:run`
- Package: `mvn clean package`

## Workflow

1. Read/analyze code as needed
2. Make all related changes in parallel
3. Build to verify: `mvn clean install`
4. If errors: iterate, find root cause, fix. Otherwise, ask for guidance
5. Run tests if logic changed: `mvn test`
6. Report: BUILD status + changes summary + test results

## API Endpoints Reference

See `PROJECT_DOCUMENTATION.md` for complete API specification.

**Key Endpoints:**

- `GET /api/appointments` - List appointments (with optional date range)
- `GET /api/appointments/{id}` - Get single appointment
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments/{id}` - Partial update (drag/drop/resize/edit)
- `DELETE /api/appointments/{id}` - Delete appointment
- `GET /api/appointment-types` - List appointment types
- `POST /api/appointment-types` - Create appointment type

**WebSocket:**

- Connection: `ws://localhost:8080/ws`
- Subscribe: `/topic/appointments` (all appointment changes)
- Subscribe: `/user/queue/reminders` (personal reminders)

## Domain Knowledge

**Calendar Application:**

- Appointments have title, description, start/end times, and types
- Appointment types define categories with custom colors
- Reminders trigger at configurable intervals (0, 5, 10, 15, 30 minutes before)
- Multi-user support via WebSocket broadcasts
- Drag & drop updates only start/end times
- Resize updates only end time (or start time)
- Full edits from drawer can update any field

**Business Rules:**

- Appointment end time must be after start time
- Reminder minutes must be one of: 0, 5, 10, 15, 30
- Appointment type colors should be valid hex codes
- Default reminder is 15 minutes

**Data Integrity:**

- Cascade delete appointment types should fail if appointments exist
- Validate date/time ranges on create/update
- Ensure WebSocket updates are broadcast to all connected clients
- Handle concurrent updates gracefully

## Configuration

**Application Port:** 8080

**CORS:** Allow `http://localhost:4200` (Angular frontend)

**H2 Console:** Enabled at `/h2-console` for development

**Database:** In-memory H2, recreated on restart (ddl-auto=create-drop)

**Logging:** INFO level, DEBUG for development debugging

## Notes

- This is a development/demo application using H2 in-memory database
- Data will be lost on application restart
- For production, would need persistent database (PostgreSQL/MySQL)
- No authentication/authorization in initial version
- Focus on core functionality first, then add features
