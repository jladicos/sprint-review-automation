# Sprint Review Slide Deck Automation

This project automates the creation of Sprint Review slide decks for recurring meetings using Google Apps Script. It automatically creates a copy of a template slide deck, updates the content with the correct sprint information and date, and moves it to a designated folder.

## Features

- **Automated Slide Creation**: Creates slide decks 10 days before each Sprint Review meeting
- **Custom File Naming**: Names files following the pattern "Sprint Review - FY26-Q1-S3-Apr 08"
- **Slide Content Updates**: Automatically updates the first slide with correct sprint information and meeting date
- **Calendar Integration**: Scans a dedicated Google Calendar for upcoming Sprint Review meetings
- **Email Notifications**: Sends notifications when slides are created and when the scheduler runs
- **Recurring Meeting Support**: Handles recurring calendar events properly
- **Multi-Calendar Support**: Can be configured to use a specific calendar instead of your primary calendar
- **Manual Slide Creation Support**: Generate slides for any arbitrary date and/or sprint label
- **Messaging System**: Uses a modular messaging library for notifications (emails, with Slack support possible in the future)

## Setup Instructions

### Prerequisites

- A Google account
- A template slide deck in Google Slides
- A dedicated Google Calendar for product team rituals (recommended)
- Sprint Review meetings in your calendar (must have exact title "Sprint Review")
- The MessagingUtils library (see MessagingUtils Library section below)

### Step 1: Create the Script Project

1. Go to [script.google.com](https://script.google.com)
2. Create a new project
3. Add the script files from this repository

### Step 2: Configure the Settings

In the `config.gs` file, update the following:

```javascript
const CONFIG = {
  templateId: 'YOUR_TEMPLATE_SLIDE_ID',
  targetFolderId: 'YOUR_TARGET_FOLDER_ID',
  calendar: {
    id: 'YOUR_CALENDAR_ID_OR_NAME',
    exactSearchTerm: 'Sprint review',
    daysInAdvance: 10,
    lookaheadDays: 60
  }
};
```

### Step 3: Set Up Automation

Run these functions:

1. `completeReset()` - Clear all triggers and stored properties
2. `testFindSprintReviewEvents()` - Verify your calendar events are being detected
3. `scheduleUpcomingSprintReviews()` - Set up triggers for upcoming meetings
4. `setupMonthlyScheduler()` - (Recommended) Keeps automation running for future meetings

### Step 4: Verify Setup

1. Run `testFindSprintReviewEvents()`
2. Check logs in Apps Script (`View > Logs`)
3. You should receive email confirmation when slides are generated

## How It Works

### Sprint Identification Logic

- Sprints are 2-week periods, starting on Jan 15, 2025
- Sprint numbers are based on the **sprint start date**, not the meeting date
- FY25 Q4 has unique logic:
  - Sprint 1 starts Jan 15, 2025
  - Sprint 6 ends April 8, 2025
- Any date before Jan 15, 2025 → `FY00-Q0-S0`

### Fiscal Year and Quarter Rules

- Fiscal year starts on April 1
- Quarters:
  - Q1: April to June
  - Q2: July to September
  - Q3: October to December
  - Q4: January to March

### Slide Deck Creation Process

1. Scheduler finds Sprint Review meetings
2. Trigger is scheduled 10 days before each meeting
3. On trigger:
   - Copy slide template
   - Rename using fiscal sprint string + date
   - Update content on title slide
   - Move slide to target folder
   - Send notification email

## Manual Slide Creation (via testSlideCreation.gs)

Use `testSlideCreation.gs` for one-off or custom Sprint Review slide generation.

### Generate a slide based on date:

```javascript
generateSprintReviewSlidesFor("2025-04-08");
```

This:
- Calculates the correct sprint label based on the sprint start date
- Creates the deck using standard logic

### Generate a slide with a custom sprint label:

```javascript
generateCustomSprintReviewSlides("2025-07-03", "FY26-Q1-S5");
```

Use this when:
- The meeting doesn't fall on a normal cadence (e.g. due to holidays)
- You want to override the sprint number manually

## MessagingUtils Library

This project uses a modular MessagingUtils library for handling notifications.

### Library Features

- **Unified Messaging Interface**: Common interface for sending different types of messages
- **Templated Notifications**: Uses templates for consistent email formatting
- **Auto-initialization**: No need to call initialization functions manually
- **Extensible**: Designed to support additional messaging platforms (like Slack) in the future

### Setting Up the Library

1. Create the MessagingUtils library:
   - Create a new Apps Script project
   - Add the MessagingUtils code
   - Deploy as a library (Project Settings > Library)
   - Copy the Library ID and current version number

2. Add the library to this project:
   - In the Editor sidebar, click Libraries (+)
   - Enter the Library ID from step 1
   - Select the latest version
   - Set Identifier as "MsgUtils"
   - Click Add

### Testing Notifications

After setting up the library, use `testNotifications.gs` to verify it's working:

- `testSlideCreationNotification()` - Tests slide creation email
- `testSchedulerNotification()` - Tests scheduler status email
- `testAllNotifications()` - Tests all notification types at once

### How Notifications Work

The project uses three components for messaging:
1. **MsgUtils Library**: Core messaging functionality
2. **SprintEmailTemplates**: Project-specific email templates
3. **SprintMessaging**: Auto-initializing wrapper that connects the two

## Slide Content Updates

- Replaces "Sprint FYXX-QY-SZ"
- Replaces "Date: MMM DD, YYYY"

## Preventing Duplicate Triggers

- Uses event ID + date tracking
- Ensures no duplicate date-based triggers

## Maintenance

- Automation runs in Google Cloud (Apps Script)
- Monthly scheduler ensures future meetings are detected
- After any changes, run:
  1. `completeReset()`
  2. `scheduleUpcomingSprintReviews()`
  3. `setupMonthlyScheduler()`

## Troubleshooting

### If slides aren't being created:

1. Confirm calendar event title is exactly "Sprint Review"
2. Double-check `calendar.id` in `config.gs`
3. Run `testFindSprintReviewEvents()` to verify detection
4. Run `listStoredEventProperties()` to check stored events
5. Run `listAllTriggers()` to view active triggers
6. Use `View > Logs` in the Apps Script editor to inspect errors
7. Re-run `completeReset()` if in doubt
8. Try `testAllNotifications()` to check if email notifications are working

### Testing the system:

1. Run `testDuplicateTriggerCreation()` to verify trigger creation and duplicate prevention
2. This test automatically cleans up and restores proper triggers when complete
3. Use `listAllTriggers()` to see current trigger status with IDs
4. Use `listStoredEventProperties()` to see tracked events

### Using the test functions:

- `testFindSprintReviewEvents()` — Logs calendar events found using your config
- `testDuplicateTriggerCreation()` — Tests trigger creation and duplicate prevention system (suppresses emails, auto-restores)
- `testSprintStringCalculations()` — Prints sprint string results for a list of example dates
- `logSprintStringForDate(dateString)` — Logs the sprint string for any one date
- `generateSprintReviewSlidesFor("YYYY-MM-DD")` — One-off deck generation using calculated sprint info
- `generateCustomSprintReviewSlides("YYYY-MM-DD", "SPRINT_LABEL")` — Force create slide for any label/date combo
- `listAllTriggers()` — Outputs currently active time and event-based triggers
- `listStoredEventProperties()` — Lists stored properties used to prevent duplication
- `testAllNotifications()` — Tests all notification types at once
- `testSlideCreationNotification()` — Tests just the slide creation email
- `testSchedulerNotification()` — Tests just the scheduler notification email

## Function Reference

- `formatSprintString(date)` - Converts any date to a fiscal sprint string (e.g. FY25-Q4-S6)
- `createSprintReviewSlides(date)` - Automatically calculates sprint label and creates slide deck
- `createSlides(date, sprintLabel)` - Shared logic to build a slide deck for any given date and sprint label
- `scheduleUpcomingSprintReviews()` - Sets up slide generation triggers for future meetings
- `setupMonthlyScheduler()` - Ensures automation continues running
- `completeReset()` - Clears all existing triggers and stored metadata
- `testFindSprintReviewEvents()` - Lists matching calendar events
- `testDuplicateTriggerCreation()` - Tests trigger creation and duplicate prevention system
- `generateSprintReviewSlidesFor(dateString)` - Manually generate slides from a date string
- `generateCustomSprintReviewSlides(dateString, sprintLabel)` - Manually generate slides from date + sprint string
- `listStoredEventProperties()` - Displays tracked events
- `listAllTriggers()` - Lists all triggers for debugging
- `sendNotificationEmail(slideUrl, meetingDate)` - Sends notification about created slides
- `sendSchedulerNotificationEmail(nextMeetingDate, scheduledDates, triggersCreated)` - Sends scheduler notification

## Switching Calendars

If you change to a different calendar:

1. Update `calendar.id` in `config.gs`
2. Run `completeReset()`
3. Run `testFindSprintReviewEvents()` to validate
4. Run `scheduleUpcomingSprintReviews()`
5. Run `setupMonthlyScheduler()` to restore monthly updates

## License

This project is available under the MIT license.