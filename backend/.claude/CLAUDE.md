# Calendar Application Backend

## Project Context

This is a Calendar Application backend - a full-stack appointment management system with real-time synchronization.

**Goal:** RESTful API with WebSocket support for managing appointments with drag-and-drop, resize, and reminder notifications
**Tech Stack:** Java 17, Spring Boot 3.x, Maven, H2 Database
**Key Components:** REST API, WebSocket endpoints, JPA repositories, Reminder service
**Priorities:** Real-time sync reliability > API performance > Code quality

## Coding Preferences

### Java/Spring Boot Standards

- Follow Java naming conventions (camelCase for methods/variables, PascalCase for classes)
- Use Spring Boot best practices and conventions
- Prefer constructor injection over field injection
- Use `@Slf4j` (Lombok) for logging instead of manual logger creation
- Keep controllers thin - delegate business logic to services
- Use DTOs for API requests/responses, keep entities separate
- Use Java 17 features (records for DTOs when appropriate, text blocks, pattern matching)
- Validate input with `@Valid` and appropriate constraints
- Handle exceptions with `@ControllerAdvice`

### REST API Standards

- Follow RESTful naming conventions for endpoints
- Use PATCH for partial updates (drag, drop, resize operations)
- Use appropriate HTTP status codes (200, 201, 204, 400, 404, 500, etc.)
- Return 204 No Content for successful DELETE operations
- Document endpoints with Swagger/OpenAPI annotations
- Use consistent response formats across endpoints

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
- Run tests after making changes. Fix broken tests by finding root cause
- Do simplification or code cleanup when it brings clarity without sacrificing performance
- Initialize fields appropriately (use Lombok `@Builder` when suitable)
- Use Optional for nullable returns, avoid null checks where possible
- Group related constants in enums or constant classes
- Use streams judiciously (readability over cleverness)
- Use proper exception handling (don't swallow exceptions)
- Create custom exceptions when appropriate (`AppointmentNotFoundException`, etc.)

### Performance & Optimization

- Use Spring caching (`@Cacheable`) for appointment type queries
- Index database columns used in queries (appointmentTypeId, startTime, endTime)
- Use pagination for large appointment lists
- Consider async processing for reminder notifications
- Profile and optimize only when needed (measure first)

## Decision Authority

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

### Required Workflow (DO NOT SKIP):
1. Make code changes
2. **Immediately run full build**: `mvn clean install` (NOT just `mvn test`)
3. If build fails, fix all errors before proceeding
4. Only report task complete after successful `mvn clean install` & `mvn test` pass 

### Testing Standards:
- Add unit tests (JUnit 5) for new service/controller logic automatically
- Use Mockito for mocking in tests (@Mock, @MockBean)
- When tests fail, find root cause before fixing
- Test API endpoints with Swagger UI when available
- Verify Spring Boot application starts successfully on port 8080
- Test WebSocket connections manually or with integration tests

### Important Notes:
- `mvn clean install` runs tests AND builds the JAR - this is required
- `mvn test` alone is NOT sufficient - always use `mvn clean install`
- Complete all code edits first, THEN run build (batch edits, then verify)

## Backend Error Handling

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
