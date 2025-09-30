# Claude Code Documentation for Sprint Review Automation

This project automates Sprint Review slide deck creation using Google Apps Script. This document provides context for AI assistants working on this codebase.

## Project Overview

**Purpose**: Automatically create Sprint Review slide decks 10 days before meetings, with correct sprint labeling and date formatting.

**Technology**: Google Apps Script (JavaScript runtime in Google Cloud)

**Key Components**:
- Calendar integration to detect Sprint Review meetings
- Slide deck templating and customization
- Email notifications via messaging library
- Trigger-based automation system

## Architecture

### Core Files

- **`scheduler.gs`** - Main automation logic, trigger management
- **`code.gs`** - Slide creation and content updates
- **`config.gs`** - Configuration settings
- **`sprintCalculator.gs`** - Fiscal year/sprint number calculations
- **`clearTriggers.gs`** - System maintenance and debugging
- **`test*.gs`** - Various test functions for different components

### Key Functions

1. **`scheduleUpcomingSprintReviews()`** - Scans calendar, creates triggers
2. **`prepareSprintReviewSlides()`** - Triggered function that creates slides
3. **`createSprintReviewSlides(date)`** - Slide generation with calculated sprint info
4. **`checkExistingTrigger(eventId, eventDate)`** - Prevents duplicate triggers
5. **`createTimedTrigger(targetDate, eventId, eventDate)`** - Safe trigger creation

## System Status (2025)

### Duplicate Prevention System
The system now has robust duplicate prevention:
- **`checkExistingTrigger(eventId, eventDate)`**: Checks stored properties to prevent duplicate triggers
- **`createTimedTrigger(targetDate, eventId, eventDate)`**: Safely creates triggers with tracking
- **Composite key tracking**: Uses `TRIGGER_EVENT_eventId_date` format for recurring events
- **No recursive calls**: System is self-sustaining through bi-weekly execution

### Email Accuracy
Email notifications accurately report only events that received triggers:
- **scheduledDates**: Only includes meetings with actual triggers created
- **triggersCreated count**: Matches the scheduledDates list exactly
- **nextMeetingDate**: Still shows chronologically next meeting even if too close for triggers

## Configuration

### Required Setup
```javascript
const CONFIG = {
  templateId: 'GOOGLE_SLIDES_TEMPLATE_ID',
  targetFolderId: 'GOOGLE_DRIVE_FOLDER_ID',
  calendar: {
    id: 'CALENDAR_ID_OR_NAME',
    exactSearchTerm: 'Sprint review',
    daysInAdvance: 10,
    lookaheadDays: 60
  }
};
```

### Dependencies
- **MessagingUtils Library**: External library for email notifications
- **Google Calendar API**: Built into Apps Script
- **Google Slides API**: Built into Apps Script
- **Google Drive API**: Built into Apps Script

## Sprint Calculation Logic

**Fiscal Year**: April 1 to March 31
**Sprint Duration**: 2 weeks
**Start Date**: January 15, 2025 (FY25-Q4-S1)

**Quarter Mapping**:
- Q1: April-June
- Q2: July-September
- Q3: October-December
- Q4: January-March

## Testing Strategy

### Key Test Functions
- **`testDuplicateTriggerCreation()`** - Tests trigger creation and duplicate prevention (suppresses emails, auto-restores system)
- **`testFindSprintReviewEvents()`** - Validates calendar integration (read-only)
- **`testSprintStringCalculations()`** - Checks sprint number logic
- **`testAllNotifications()`** - Email system verification

### Debug Mode for Testing
Functions accept `debugMode` parameter to suppress emails during testing:
- **`scheduleUpcomingSprintReviews(debugMode = false)`** - Main scheduling function
- **`sendSchedulerNotificationEmail(..., debugMode = false)`** - Scheduler notifications
- **`sendNotificationEmail(..., debugMode = false)`** - Slide creation notifications

### Testing Best Practices
- Test actual production functions, not separate testing versions
- Use `debugMode: true` to suppress emails during testing
- `testDuplicateTriggerCreation()` automatically restores proper system state

## Automation Sustainability

**Self-Sustaining Design**: With bi-weekly Sprint Reviews, `prepareSprintReviewSlides()` runs every 2 weeks, ensuring triggers are always created within the 60-day lookahead window.

**No Monthly Scheduler Needed**: The recursive call removal maintains automation without requiring `setupMonthlyScheduler()` for this use case.

## Common Issues & Solutions

### Duplicate Creation
- **Symptom**: Multiple slide decks or emails for same meeting
- **Debug**: Run `testDuplicateTriggerCreation()`
- **Fix**: Ensure recursive call is removed, trigger functions implemented

### Missing Triggers
- **Symptom**: No slides created for upcoming meetings
- **Debug**: Run `testFindSprintReviewEvents()`, `listAllTriggers()`
- **Fix**: Check calendar ID, event titles, run `scheduleUpcomingSprintReviews()`

### Calendar Detection Issues
- **Symptom**: Events not found
- **Debug**: Verify exact title match "Sprint review"
- **Fix**: Update `CONFIG.calendar.exactSearchTerm`

## Maintenance

### Regular Operations
- System is self-maintaining for normal operations
- Manual intervention only needed for configuration changes

### After Code Changes
1. Run `completeReset()` to clear old triggers
2. Run `scheduleUpcomingSprintReviews()` to recreate triggers
3. Verify with test functions

### Debugging Tools
- `listAllTriggers()` - See active triggers with IDs and basic info
- `listStoredEventProperties()` - Check tracking data for created triggers
- `testDuplicateTriggerCreation()` - Comprehensive system test
- Google Apps Script logs - View execution details

## Development Notes

### Code Style
- Uses Google Apps Script JavaScript (ES5+ features available)
- Extensive logging for debugging
- Composite keys for recurring event handling
- Property storage for trigger deduplication

### Security Considerations
- No sensitive data in code (IDs are in config)
- Uses session-based email addresses
- Proper error handling for API calls

### Performance
- Efficient calendar scanning with date ranges
- Minimal trigger creation (only future events)
- Batch operations where possible

## Future Enhancements

**Potential Improvements**:
- Slack integration via MessagingUtils library
- Multiple template support
- Custom sprint numbering overrides
- Integration with other project management tools

This documentation should help AI assistants understand the codebase context and make informed decisions about modifications or debugging.