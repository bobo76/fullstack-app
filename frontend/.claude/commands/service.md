Create a new Angular service following project conventions.

Arguments: service-name

Steps:
1. Ask user for service name if not provided
2. Create service with:
   - Injectable decorator with providedIn: 'root'
   - Basic structure for HTTP calls
   - RxJS imports if needed
   - Signal-based state if managing data
3. Create files:
   - service-name.service.ts
   - service-name.service.spec.ts (unit test)
4. Report created files
