Create a new Angular standalone component following project conventions.

Arguments: component-name

Steps:
1. Ask user for component name if not provided
2. Create component following the project structure template:
   - Use standalone: true
   - Use OnPush change detection
   - Use inject() for dependency injection
   - Include basic SCSS structure
   - Add proper imports
3. Create files:
   - component-name.component.ts
   - component-name.component.html
   - component-name.component.scss
4. Generate basic unit test file
5. Report created files
