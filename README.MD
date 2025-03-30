
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
- **One-Off Slide Creation**: Manually generate slide decks for arbitrary dates

## Setup Instructions

### Prerequisites

- A Google account
- A template slide deck in Google Slides
- A dedicated Google Calendar for product team rituals (recommended)
- Sprint Review meetings in your calendar (must have exact title "Sprint Review")

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

## One-Off Slide Creation

You can manually generate a slide deck for any date by using the `testSlideCreation.gs` helper file.

### Usage:

```javascript
generateSprintReviewSlidesFor("2025-04-08");
```

This:
- Parses the date
- Generates a slide deck using all your configured logic
- Applies the correct sprint label and file name
- Works independently of scheduled events

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

### Using the test functions:

Use these utility/test functions to verify that everything is working:

- `testFindSprintReviewEvents()` — Logs calendar events found using your config
- `testSprintStringCalculations()` — Prints sprint string results for a list of example dates
- `logSprintStringForDate(dateString)` — Logs the sprint string for any one date
- `generateSprintReviewSlidesFor("YYYY-MM-DD")` — One-off deck generation for any date
- `listAllTriggers()` — Outputs currently active time and event-based triggers
- `listStoredEventProperties()` — Lists stored properties used to prevent duplication

## Function Reference

- `formatSprintString(date)` - Converts any date to a fiscal sprint string (e.g. FY25-Q4-S6)
- `createSprintReviewSlides(date)` - Generates slide deck with correct content and name
- `scheduleUpcomingSprintReviews()` - Sets up slide generation triggers for future meetings
- `setupMonthlyScheduler()` - Ensures automation continues running
- `completeReset()` - Clears all existing triggers and stored metadata
- `testFindSprintReviewEvents()` - Lists matching calendar events
- `generateSprintReviewSlidesFor(dateString)` - Manually generate slides from a date string
- `listStoredEventProperties()` - Displays tracked events
- `listAllTriggers()` - Lists all triggers for debugging

## Switching Calendars

If you change to a different calendar:

1. Update `calendar.id` in `config.gs`
2. Run `completeReset()`
3. Run `testFindSprintReviewEvents()` to validate
4. Run `scheduleUpcomingSprintReviews()`
5. Run `setupMonthlyScheduler()` to restore monthly updates

## License

This project is available under the MIT license.
