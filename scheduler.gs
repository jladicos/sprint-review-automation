/**
 * Sprint Review Automation Scheduler
 * Updated to use the MessagingUtils library with auto-initialization
 */

// Define a simple wrapper for MsgUtils that ensures initialization
const SprintMessaging = (function() {
  let initialized = false;
  
  // Auto-initialization function
  function ensureInitialized() {
    if (!initialized) {
      MsgUtilsLibrary.MsgUtils.setConfig({
        defaultSubjectPrefix: '[Sprint Review] ',
        useHtmlByDefault: false,
        debugMode: false // Set to true for troubleshooting
      });
      initialized = true;
      Logger.log('SprintMessaging: Initialized MsgUtils configuration');
    }
  }
  
  // Return the public API with auto-initialization
  return {
    /**
     * Auto-initializing wrapper around SprintEmailTemplates.sendSlideCreationNotification
     */
    sendSlideCreationNotification: function(recipient, slideUrl, meetingDate, sprintLabel) {
      ensureInitialized();
      return SprintEmailTemplates.sendSlideCreationNotification(
        recipient, slideUrl, meetingDate, sprintLabel
      );
    },
    
    /**
     * Auto-initializing wrapper around SprintEmailTemplates.sendSchedulerNotification
     */
    sendSchedulerNotification: function(recipient, nextMeetingDate, scheduledDates, triggersCreated) {
      ensureInitialized();
      return SprintEmailTemplates.sendSchedulerNotification(
        recipient, nextMeetingDate, scheduledDates, triggersCreated
      );
    },
    
    /**
     * Send a simple text email with auto-initialization
     */
    sendEmail: function(recipient, subject, body, options) {
      ensureInitialized();
      return MsgUtilsLibrary.MsgUtils.sendEmail(recipient, subject, body, options);
    }
  };
})();

/**
 * Finds upcoming Sprint Review meetings and schedules slide creation 10 days before each one.
 * Run this function monthly to maintain the scheduling.
 * @param {boolean} debugMode - If true, suppresses email notifications for testing (default: false)
 */
function scheduleUpcomingSprintReviews(debugMode = false) {
  // Use configuration from config.gs
  const calendarId = CONFIG.calendar.id;
  const exactSearchTerm = CONFIG.calendar.exactSearchTerm;
  const daysInAdvance = CONFIG.calendar.daysInAdvance;
  const lookaheadDays = CONFIG.calendar.lookaheadDays;

  // Calculate date range for searching events
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + lookaheadDays);

  // Get calendar and events - we'll get all events and filter for exact matches
  const calendar = CalendarApp.getCalendarById(calendarId);

  if (!calendar) {
    Logger.log(`Error: Could not find calendar with ID: ${calendarId}`);
    return; // Exit the function if calendar not found
  }

  Logger.log(`Successfully connected to calendar: ${calendar.getName()}`);
  const allEvents = calendar.getEvents(now, futureDate);

  // Filter for events with exactly matching titles
  const events = allEvents.filter(event => {
    // Check that the event title matches
    const titleMatches = event.getTitle().trim() === exactSearchTerm.trim();

    // Check that the event is from our target calendar
    const isFromTargetCalendar = event.getOriginalCalendarId() === calendar.getId();

    // Only include events that match both conditions
    return titleMatches && isFromTargetCalendar;
  });

  Logger.log(`Found ${events.length} upcoming Sprint Review events in the next ${lookaheadDays} days`);

  // Track how many triggers we've set
  let triggersCreated = 0;

  // Store dates for email notification
  let nextMeetingDate = null;
  const scheduledDates = [];

  // Process each event
  events.forEach(event => {
    const eventDate = event.getStartTime();
    const eventId = event.getId();
    const eventTitle = event.getTitle();

    // Track the closest upcoming meeting
    if (nextMeetingDate === null || eventDate < nextMeetingDate) {
      nextMeetingDate = eventDate;
    }

    // Format date for display in email
    const formattedEventDate = Utilities.formatDate(eventDate, Session.getScriptTimeZone(), 'MMMM dd, yyyy');
    scheduledDates.push(formattedEventDate);

    // Calculate the target date (10 days before the event)
    const targetDate = new Date(eventDate);
    targetDate.setDate(targetDate.getDate() - daysInAdvance);

    // Only create triggers for events that are more than 10 days away
    // (So we don't try to schedule triggers in the past)
    if (targetDate > now) {
      // Check if we already have a trigger for this specific event instance
      // Pass both event ID and date to handle recurring events
      const existingTrigger = checkExistingTrigger(eventId, eventDate);

      if (!existingTrigger) {
        // Schedule the slide creation trigger
        // Pass the event date as well
        createTimedTrigger(targetDate, eventId, eventDate);
        triggersCreated++;

        Logger.log(`Scheduled slide creation for "${eventTitle}" on ${targetDate.toDateString()}`);
      } else {
        Logger.log(`Trigger already exists for event "${eventTitle}" on ${eventDate.toDateString()}`);
      }
    } else {
      Logger.log(`Event "${eventTitle}" on ${eventDate.toDateString()} is too soon (less than ${daysInAdvance} days away)`);
    }
  });

  Logger.log(`Created ${triggersCreated} new triggers for upcoming meetings`);

  // Send notification email with the results
  sendSchedulerNotificationEmail(nextMeetingDate, scheduledDates, triggersCreated, debugMode);
}

/**
 * This function is called by the timed trigger
 * It creates the slide deck for the upcoming meeting
 */
function prepareSprintReviewSlides() {
  // Get all triggers that might have invoked this function
  const triggers = ScriptApp.getProjectTriggers();

  // Find which trigger fired (the one closest to now)
  let closestTrigger = null;
  let smallestDiff = Infinity;

  const now = new Date();

  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'prepareSprintReviewSlides') {
      // Get trigger time
      const triggerTime = trigger.getTriggerSourceId();
      if (triggerTime) {
        const triggerDate = new Date(triggerTime);
        const timeDiff = Math.abs(now - triggerDate);

        if (timeDiff < smallestDiff) {
          smallestDiff = timeDiff;
          closestTrigger = trigger;
        }
      }
    }
  });

  // Clean up by deleting the trigger that fired
  if (closestTrigger) {
    ScriptApp.deleteTrigger(closestTrigger);
  }

  // Use the configured days in advance value
  const daysInAdvance = CONFIG.calendar.daysInAdvance;

  // Now create the slide deck using today's date plus days in advance
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + daysInAdvance);

  // Create the slide deck
  const slideUrl = createSprintReviewSlides(targetDate);

  Logger.log(`Created slide deck for upcoming Sprint Review: ${slideUrl}`);

  // Send an email notification
  sendNotificationEmail(slideUrl, targetDate);

  // Note: Removed recursive call to scheduleUpcomingSprintReviews() to prevent duplicate triggers
  // The system is self-sustaining through bi-weekly execution without this call
}

/**
 * Sends an email notification with the slide deck URL after slides are prepared
 * @param {string} slideUrl - URL of the created slide deck
 * @param {Date} meetingDate - Date of the Sprint Review meeting
 * @param {boolean} debugMode - If true, suppresses email sending for testing (default: false)
 */
function sendNotificationEmail(slideUrl, meetingDate, debugMode = false) {
  if (debugMode) {
    Logger.log('DEBUG MODE: Slide creation notification email suppressed for testing');
    Logger.log(`Would have sent email about slide deck: ${slideUrl}`);
    return;
  }

  const recipient = Session.getActiveUser().getEmail();
  const sprintLabel = formatSprintString(meetingDate);

  SprintMessaging.sendSlideCreationNotification(
    recipient,
    slideUrl,
    meetingDate,
    sprintLabel
  );

  Logger.log('Notification email sent');
}

/**
 * Sends a notification email about scheduled triggers
 * @param {Date} nextMeetingDate - The next upcoming meeting date
 * @param {Array} scheduledDates - Array of formatted dates that were scheduled
 * @param {number} triggersCreated - Number of triggers created
 * @param {boolean} debugMode - If true, suppresses email sending for testing (default: false)
 */
function sendSchedulerNotificationEmail(nextMeetingDate, scheduledDates, triggersCreated, debugMode = false) {
  if (debugMode) {
    Logger.log('DEBUG MODE: Scheduler notification email suppressed for testing');
    Logger.log(`Would have sent email about ${triggersCreated} triggers for ${scheduledDates.length} meetings`);
    return;
  }

  const recipient = Session.getActiveUser().getEmail();

  SprintMessaging.sendSchedulerNotification(
    recipient,
    nextMeetingDate,
    scheduledDates,
    triggersCreated
  );

  Logger.log('Notification email sent');
}

/**
 * Checks if a trigger already exists for a specific event and date combination.
 * Uses a composite key approach to handle recurring events properly.
 *
 * @param {string} eventId - The Google Calendar event ID
 * @param {Date} eventDate - The date of the specific event occurrence
 * @returns {boolean} - True if a trigger already exists for this event+date combination
 */
function checkExistingTrigger(eventId, eventDate) {
  // Create composite key using event ID and date
  const dateString = Utilities.formatDate(eventDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const compositeKey = `TRIGGER_EVENT_${eventId}_${dateString}`;

  // Check if we have a stored property for this specific event occurrence
  const properties = PropertiesService.getScriptProperties();
  const existingTrigger = properties.getProperty(compositeKey);

  if (existingTrigger) {
    Logger.log(`Existing trigger found for event ${eventId} on ${dateString}`);
    return true;
  }

  return false;
}

/**
 * Creates a timed trigger for slide preparation and stores tracking information.
 *
 * @param {Date} targetDate - The date when the trigger should fire (10 days before meeting)
 * @param {string} eventId - The Google Calendar event ID
 * @param {Date} eventDate - The date of the actual meeting
 */
function createTimedTrigger(targetDate, eventId, eventDate) {
  // Create the actual Google Apps Script trigger
  const trigger = ScriptApp.newTrigger('prepareSprintReviewSlides')
    .timeBased()
    .at(targetDate)
    .create();

  // Store the trigger information using composite key
  const dateString = Utilities.formatDate(eventDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const compositeKey = `TRIGGER_EVENT_${eventId}_${dateString}`;

  const properties = PropertiesService.getScriptProperties();
  properties.setProperty(compositeKey, eventId);

  Logger.log(`Created trigger ${trigger.getUniqueId()} for event ${eventId} on ${dateString}, firing on ${targetDate.toDateString()}`);
}