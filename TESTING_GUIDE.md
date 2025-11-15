# Calendar Application - Testing Guide

## Prerequisites

Ensure both servers are running:

1. **Backend (Spring Boot)**: http://localhost:8080
   ```bash
   cd /home/bobo/dev/fullstack-app/backend
   mvn spring-boot:run
   ```

2. **Frontend (Angular)**: http://localhost:4200
   ```bash
   cd /home/bobo/dev/fullstack-app/frontend
   yarn start
   ```

## Access the Application

Open your browser and navigate to: **http://localhost:4200**

---

## Testing Checklist

### 1. Initial Load
- [ ] Application loads without errors
- [ ] Calendar view displays (week view by default)
- [ ] Toolbar shows: view toggle, date navigation, "Today" button
- [ ] No console errors in browser DevTools (F12)

### 2. Appointment Types Setup

**Test: Create Appointment Types**

1. Look for an "Appointment Types" section or button
2. Create three appointment types:
   - **Work** - Color: #FF5733 (orange-red)
   - **Personal** - Color: #33C3FF (blue)
   - **Meeting** - Color: #4CAF50 (green)
3. Verify types appear in the list with correct colors

**Expected Result**: Three colored appointment types visible

---

### 3. Create Appointments

**Test: Click Time Slot to Create**

1. Click on any empty time slot in the calendar
2. Appointment drawer should open on the right side
3. Fill in the form:
   - **Title**: "Team Meeting"
   - **Description**: "Discuss Q4 goals"
   - **Start Time**: (auto-filled from clicked slot)
   - **End Time**: 1 hour after start
   - **Type**: Select "Work"
   - **Reminder**: 15 minutes (default)
4. Click "Save" or "Create"

**Expected Result**:
- Appointment appears on calendar as orange-red card
- Shows title "Team Meeting"
- Positioned at correct time slot

**Repeat** to create more appointments:
- "Lunch Break" - 12:00-13:00 - Personal (blue) - 5 min reminder
- "Code Review" - 14:00-15:30 - Meeting (green) - 30 min reminder

---

### 4. View Switching

**Test: Day and Week Views**

1. Click "Week" / "Day" toggle button in toolbar
2. Switch between views
3. Verify appointments display correctly in both views

**Expected Result**:
- Week view: 7-day grid with all appointments
- Day view: Single day with hourly slots
- Appointments maintain their colors and positions

---

### 5. Date Navigation

**Test: Navigate Between Dates**

1. Click "Previous" button (◄ or Previous Week/Day)
2. Click "Next" button (► or Next Week/Day)
3. Click "Today" button

**Expected Result**:
- Calendar navigates to different dates
- Appointments appear/disappear based on date range
- "Today" button returns to current date

---

### 6. Drag and Drop

**Test: Move Appointment to Different Time**

1. Click and hold on "Team Meeting" appointment
2. Drag it to a different time slot (e.g., 11:00-12:00)
3. Release mouse button

**Expected Result**:
- Appointment moves smoothly during drag
- Appointment updates to new time on release
- Backend receives PATCH request (check browser Network tab)
- Appointment stays in new position after refresh

**Troubleshooting**:
- If drag doesn't work, check console for errors
- Verify Angular CDK drag-drop is working
- Check that cursor changes to "move" when hovering

---

### 7. Resize Appointments

**Test: Change Appointment Duration**

1. Hover over the bottom edge of "Lunch Break" appointment
2. Cursor should change to "ns-resize" (resize cursor)
3. Click and drag the bottom edge down to extend duration
4. Release to apply changes

**Expected Result**:
- Appointment height increases smoothly
- End time updates (e.g., 13:00 → 13:30)
- Backend receives PATCH request with new end time
- New duration persists after refresh

**Test Resize from Top**:
1. Hover over top edge of an appointment
2. Drag up or down to change start time
3. Verify start time updates correctly

---

### 8. Edit Appointments

**Test: Click to Open Drawer**

1. Click on "Code Review" appointment card
2. Drawer should open on the right side
3. Form should be pre-filled with appointment details

**Test: Update Multiple Fields**

1. Change title to "Code Review - Backend"
2. Change reminder from 30 to 10 minutes
3. Update description to "Review PR #123"
4. Click "Save"

**Expected Result**:
- Drawer closes
- Appointment card shows updated title
- Changes persist after refresh
- Backend receives PATCH request

---

### 9. Delete Appointments

**Test: Delete from Drawer**

1. Click on an appointment to open drawer
2. Look for "Delete" button (usually at bottom)
3. Click "Delete"
4. Confirm deletion if prompted

**Expected Result**:
- Appointment disappears from calendar
- Drawer closes
- Appointment does not reappear after refresh
- Backend receives DELETE request

---

### 10. Reminder Notifications

**Test: In-App Reminders**

1. Create an appointment with start time = current time + 16 minutes
2. Set reminder to 15 minutes
3. Wait 1 minute
4. Check for notification (Material Snackbar)

**Expected Result**:
- After 1 minute, a snackbar appears at bottom of screen
- Shows appointment title and time
- Auto-dismisses after a few seconds

**Note**: Reminders only work while app is open. They won't trigger if browser is closed.

---

### 11. Real-Time Synchronization (Multi-User)

**Test: WebSocket Updates**

1. Open the application in two browser tabs/windows
2. In **Tab 1**: Create a new appointment
3. In **Tab 2**: Watch the calendar

**Expected Result**:
- New appointment appears automatically in Tab 2 (no refresh needed)
- Updates are nearly instant (< 1 second delay)

**Test Other Operations**:
- Drag appointment in Tab 1 → Updates in Tab 2
- Edit appointment in Tab 1 → Updates in Tab 2
- Delete appointment in Tab 1 → Disappears in Tab 2

**Check WebSocket Connection**:
1. Open browser DevTools (F12) → Network tab
2. Filter by "WS" (WebSocket)
3. Look for connection to `ws://localhost:8080/ws`
4. Should show "101 Switching Protocols" status

---

### 12. Error Handling

**Test: Validation Errors**

1. Try to create appointment with end time before start time
   - **Expected**: Error message shown (snackbar or form validation)

2. Try to set invalid reminder minutes (e.g., manually type "25")
   - **Expected**: Validation error

3. Try to create appointment with blank title
   - **Expected**: Form validation prevents submission

**Test: Network Errors**

1. Stop the backend server
2. Try to create an appointment
   - **Expected**: Error snackbar: "Failed to create appointment"

3. Restart backend
4. Try again
   - **Expected**: Works normally

---

### 13. Accessibility

**Test: Keyboard Navigation**

1. Press **Tab** key repeatedly
2. Verify you can navigate through:
   - Toolbar buttons
   - Appointment cards
   - Form fields

**Test: Keyboard Appointment Interaction**

1. Tab to an appointment card
2. Press **Enter** or **Space** key
   - **Expected**: Drawer opens (same as clicking)

**Test: Screen Reader** (if available)

1. Enable screen reader (NVDA, JAWS, VoiceOver)
2. Navigate to appointment card
3. Verify it reads: "Appointment: [title], [type], [time]"

---

### 14. Responsive Design

**Test: Different Screen Sizes**

1. Resize browser window to mobile width (<768px)
2. Verify calendar still displays correctly
3. Check that drawer works on mobile
4. Test drag-and-drop on touch devices (if available)

**Expected Result**:
- Calendar adapts to smaller screens
- All features remain accessible
- No horizontal scrolling
- Buttons/controls are touch-friendly

---

### 15. Performance

**Test: Large Number of Appointments**

1. Create 20+ appointments in the same week
2. Verify calendar remains responsive
3. Check drag-and-drop still works smoothly
4. Test scrolling performance

**Expected Result**:
- No lag or stuttering
- Drag operations remain smooth
- Calendar renders within 1-2 seconds

---

## Common Issues and Troubleshooting

### Issue: Application Won't Load

**Symptoms**: Blank page or loading spinner forever

**Solutions**:
1. Check backend is running: `curl http://localhost:8080/api/appointment-types`
2. Check browser console for errors (F12)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check CORS errors in console
5. Restart both frontend and backend

### Issue: Drag and Drop Doesn't Work

**Solutions**:
1. Check console for Angular CDK errors
2. Verify cursor changes when hovering over appointment
3. Try clicking (not dragging) to ensure click events work
4. Check if `@angular/cdk` is installed: `yarn list @angular/cdk`

### Issue: WebSocket Not Connecting

**Symptoms**: Changes in one tab don't appear in another

**Solutions**:
1. Check Network tab (F12) for WebSocket connection
2. Look for errors in console mentioning "STOMP" or "WebSocket"
3. Verify backend WebSocket endpoint: `ws://localhost:8080/ws`
4. Check firewall isn't blocking WebSocket connections
5. Restart backend server

### Issue: Appointments Don't Persist

**Symptoms**: Appointments disappear after refresh

**Solutions**:
1. H2 database is in-memory - data is lost when backend restarts
2. This is expected behavior for development
3. Check backend logs for database errors
4. Verify backend API calls succeed (Network tab)

### Issue: Styling Issues / No Material Design

**Solutions**:
1. Check Material theme is loaded: view page source, look for Material CSS
2. Verify `@angular/material` is installed
3. Check `styles.scss` includes Material theme
4. Clear browser cache
5. Rebuild: `yarn build`

### Issue: "Port 4200 already in use"

**Solutions**:
```bash
# Kill existing process
pkill -f "ng serve"

# Or use different port
yarn start --port 4201
```

---

## Browser DevTools - What to Check

### Console Tab (F12 → Console)
**Look for**:
- ✅ No red errors
- ℹ️ Info messages about Angular loading
- ⚠️ Warnings (yellow) are usually okay

**Common Errors**:
- `CORS error` → Backend CORS not configured
- `404 Not Found` → Backend not running or wrong URL
- `WebSocket connection failed` → WebSocket endpoint issue
- `Cannot read property of undefined` → Code bug

### Network Tab (F12 → Network)
**Look for**:
- `GET /api/appointments` → 200 OK
- `POST /api/appointments` → 201 Created
- `PATCH /api/appointments/1` → 200 OK
- `DELETE /api/appointments/1` → 204 No Content
- `WS /ws` → 101 Switching Protocols (WebSocket)

**Check Response Times**:
- Should be < 100ms for most requests
- First load may be slower

### Application Tab (F12 → Application)
**Local Storage**: Check if any settings are persisted
**Session Storage**: Check for temporary data

---

## Test Results Checklist

After completing all tests, you should have verified:

- [x] Application loads successfully
- [x] Appointment types can be created with colors
- [x] Appointments can be created via time slot click
- [x] Week and day views both work
- [x] Date navigation works (prev/next/today)
- [x] Drag and drop moves appointments
- [x] Resize changes appointment duration
- [x] Edit drawer updates appointments
- [x] Delete removes appointments
- [x] Reminders trigger at correct time
- [x] Real-time sync works across tabs
- [x] Validation prevents invalid data
- [x] Error handling shows user-friendly messages
- [x] Keyboard navigation works
- [x] Application is responsive
- [x] Performance is acceptable

---

## Next Steps

Once all tests pass:

1. **Deploy to production** (if needed)
2. **Add more features** from PROJECT_DOCUMENTATION.md "Future Enhancements"
3. **Improve styling** and UX
4. **Add unit tests** for frontend components
5. **Set up persistent database** (PostgreSQL/MySQL) for backend

---

## Reporting Issues

If you find bugs or issues:

1. Check browser console for errors
2. Check backend logs for errors
3. Note the steps to reproduce
4. Check if it's listed in "Common Issues" above
5. Document the expected vs actual behavior

---

## Additional Testing Tools

### Backend API Testing (Postman/cURL)

Test backend independently:

```bash
# Get all appointments
curl http://localhost:8080/api/appointments

# Create appointment
curl -X POST http://localhost:8080/api/appointments \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","startTime":"2025-11-15T10:00:00","endTime":"2025-11-15T11:00:00"}'

# Update appointment
curl -X PATCH http://localhost:8080/api/appointments/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'
```

### Frontend Build Testing

```bash
# Production build
cd /home/bobo/dev/fullstack-app/frontend
yarn build --configuration production

# Check output
ls -lh dist/calendar-app/

# Serve production build (optional)
npx http-server dist/calendar-app -p 8081
```

---

## Success Criteria

The application is working correctly if:

1. ✅ All API endpoints return correct status codes
2. ✅ Appointments display at correct times
3. ✅ Drag, drop, and resize work smoothly
4. ✅ Real-time sync updates both tabs
5. ✅ No console errors during normal operation
6. ✅ Reminders appear at the right time
7. ✅ Validation prevents invalid data
8. ✅ Application is responsive and performant

**Congratulations! Your calendar application is fully functional!** 🎉
