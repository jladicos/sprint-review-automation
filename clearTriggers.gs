/**
 * Completely resets all triggers and stored properties related to Sprint Review automation.
 * This provides a clean slate to restart the automation process.
 * Updated to handle the new composite key format for recurring events.
 */
function completeReset() {
  // 1. Delete all existing triggers
  const allTriggers = ScriptApp.getProjectTriggers();
  let triggerCount = 0;

  allTriggers.forEach(trigger => {
	// Only delete triggers related to sprint reviews
	const handlerFunction = trigger.getHandlerFunction();
	if (handlerFunction === 'prepareSprintReviewSlides' ||
		handlerFunction === 'scheduleUpcomingSprintReviews') {
	  ScriptApp.deleteTrigger(trigger);
	  triggerCount++;
	  Logger.log(`Deleted trigger for function: ${handlerFunction}`);
	}
  });

  Logger.log(`Removed ${triggerCount} triggers from the project`);

  // 2. Clear all stored properties
  const properties = PropertiesService.getScriptProperties();
  const props = properties.getProperties();
  let propCount = 0;

  for (const key in props) {
	if (key.startsWith('TRIGGER_EVENT_') || key.startsWith('TRIGGER_DATE_')) {
	  properties.deleteProperty(key);
	  propCount++;
	  Logger.log(`Deleted property: ${key}`);
	}
  }

  Logger.log(`Removed ${propCount} stored event properties`);

  // 3. Log completion message
  Logger.log('------------------------------------');
  Logger.log('Complete reset finished successfully');
  Logger.log('The system is now ready for a fresh start');
  Logger.log('Run scheduleUpcomingSprintReviews() to set up new triggers');
}

/**
 * Lists all stored event properties without deleting them.
 * Updated to handle the new composite key format for recurring events and custom calendar.
 */
function listStoredEventProperties() {
  const properties = PropertiesService.getScriptProperties();
  const props = properties.getProperties();
  let count = 0;

  // Get the calendar using the ID from the config
  const calendarId = CONFIG.calendar.id;
  let calendar;
  try {
	calendar = CalendarApp.getCalendarById(calendarId);
	Logger.log(`Using calendar: ${calendarId}`);
  } catch (e) {
	Logger.log(`Error accessing calendar: ${e.message}`);
  }

  Logger.log('Currently stored event properties:');
  Logger.log('------------------------------------');

  for (const key in props) {
	if (key.startsWith('TRIGGER_EVENT_') || key.startsWith('TRIGGER_DATE_')) {
	  count++;
	  const eventId = props[key];
	  Logger.log(`${count}. Property: ${key}`);

	  // Extract date part from the composite key if present
	  let eventDate = "Unknown";
	  const keyParts = key.split('_');
	  if (keyParts.length >= 4) {
		// Format is TRIGGER_EVENT_[eventId]_[date]
		eventDate = keyParts[3];
		if (keyParts.length > 4) {
		  // Handle case where the event ID itself contains underscores
		  eventDate = keyParts.slice(3).join('_');
		}
	  }

	  Logger.log(`   Event ID: ${eventId}`);
	  Logger.log(`   Event Date: ${eventDate}`);

			// Try to get event details if possible
	  if (calendar) {
		try {
		  // First try to find the event directly in our calendar
		  let event = null;

		  // We need to search through events around the stored date
		  // Since we know the date from the key, we can search 24 hours around it
		  if (eventDate !== "Unknown" && eventDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
			// Parse the date string into a Date object
			const searchDate = new Date(eventDate + "T00:00:00");
			const nextDay = new Date(searchDate);
			nextDay.setDate(nextDay.getDate() + 1);

			// Search for events in this 24-hour period
			const possibleEvents = calendar.getEvents(searchDate, nextDay);

			// Find the event with matching ID
			event = possibleEvents.find(e => e.getId() === eventId);

			if (event) {
			  Logger.log(`   Title: ${event.getTitle()}`);
			  Logger.log(`   Actual Start Date: ${event.getStartTime().toDateString()}`);
			  Logger.log(`   Calendar: ${event.getOriginalCalendarId()}`);
			} else {
			  Logger.log(`   Event details not found in '${calendar.getName()}' calendar`);
			  Logger.log(`   Event may have been deleted or moved to another calendar`);
			}
		  } else {
			Logger.log(`   Cannot determine event date from key: ${key}`);
		  }
		} catch (e) {
		  Logger.log(`   Cannot access event details: ${e.message}`);
		}
	  } else {
		Logger.log(`   Cannot access event details: Calendar not available`);
	  }

	  Logger.log('------------------------------------');
	}
  }

  if (count === 0) {
	Logger.log('No stored event properties found');
  } else {
	Logger.log(`Found ${count} stored event properties`);
  }
}

/**
 * Lists all active triggers in the project with comprehensive debugging information.
 * Shows meeting details, trigger fire dates, and calendar event correlation.
 */
function listAllTriggers() {
  const allTriggers = ScriptApp.getProjectTriggers();
  const properties = PropertiesService.getScriptProperties().getProperties();

  // Build a map of stored event info from properties
  const eventMap = {};
  for (const key in properties) {
    if (key.startsWith('TRIGGER_EVENT_')) {
      // Extract date and event ID from key: TRIGGER_EVENT_eventId_2025-04-08
      const parts = key.split('_');
      const dateStr = parts[parts.length - 1]; // Last part is date
      const eventId = properties[key];
      eventMap[eventId] = {
        meetingDate: dateStr,
        propertyKey: key,
        eventId: eventId
      };
    }
  }

  // Get calendar for event lookups
  let calendar;
  try {
    calendar = CalendarApp.getCalendarById(CONFIG.calendar.id);
  } catch (e) {
    Logger.log(`Warning: Could not access calendar ${CONFIG.calendar.id}: ${e.message}`);
  }

  Logger.log('Currently active triggers with detailed information:');
  Logger.log('================================================================');

  let count = 0;
  allTriggers.forEach(trigger => {
    count++;
    Logger.log(`${count}. Trigger ID: ${trigger.getUniqueId()}`);
    Logger.log(`   Function: ${trigger.getHandlerFunction()}`);
    Logger.log(`   Event Type: ${trigger.getEventType()}`);

    if (trigger.getEventType() === ScriptApp.EventType.CLOCK) {
      // Try to find corresponding event information
      let eventInfo = null;
      let calendarEvent = null;

      // Look through our stored events to find a match
      for (const eventId in eventMap) {
        const stored = eventMap[eventId];

        // Try to get the calendar event
        if (calendar) {
          try {
            // We need to search for the event since getEventById might not work with recurring events
            const meetingDate = new Date(stored.meetingDate + "T00:00:00");
            const nextDay = new Date(meetingDate);
            nextDay.setDate(nextDay.getDate() + 1);

            const possibleEvents = calendar.getEvents(meetingDate, nextDay);
            calendarEvent = possibleEvents.find(e => e.getId() === eventId);

            if (calendarEvent) {
              eventInfo = stored;
              break; // Found a match
            }
          } catch (e) {
            Logger.log(`   Warning: Could not access event ${eventId}: ${e.message}`);
          }
        }
      }

      if (eventInfo && calendarEvent) {
        // Calculate trigger fire date (meeting date - daysInAdvance)
        const meetingDate = calendarEvent.getStartTime();
        const triggerDate = new Date(meetingDate);
        triggerDate.setDate(triggerDate.getDate() - CONFIG.calendar.daysInAdvance);

        Logger.log(`   Meeting: "${calendarEvent.getTitle()}" on ${Utilities.formatDate(meetingDate, Session.getScriptTimeZone(), 'MMMM dd, yyyy h:mm a')}`);
        Logger.log(`   Trigger fires: ${Utilities.formatDate(triggerDate, Session.getScriptTimeZone(), 'MMMM dd, yyyy')} (${CONFIG.calendar.daysInAdvance} days before)`);
        Logger.log(`   Event ID: ${eventInfo.eventId}`);
        Logger.log(`   Calendar: ${calendarEvent.getOriginalCalendarId()}`);
        Logger.log(`   Stored Property: ${eventInfo.propertyKey}`);

        if (calendarEvent.getLocation()) {
          Logger.log(`   Location: ${calendarEvent.getLocation()}`);
        }
      } else {
        // Couldn't correlate with stored events
        Logger.log(`   Unable to correlate with calendar event`);
        Logger.log(`   Source ID: ${trigger.getTriggerSourceId()}`);
        Logger.log(`   Note: This trigger may be orphaned or from a different system`);
      }
    } else {
      Logger.log(`   Non-clock trigger: ${trigger.getTriggerSource()}`);
    }

    Logger.log('================================================================');
  });

  if (count === 0) {
    Logger.log('No active triggers found');
  } else {
    Logger.log(`Found ${count} active triggers total`);

    // Summary of stored events vs active triggers
    const storedEventCount = Object.keys(eventMap).length;
    const clockTriggerCount = allTriggers.filter(t => t.getEventType() === ScriptApp.EventType.CLOCK).length;

    Logger.log(`Stored event properties: ${storedEventCount}`);
    Logger.log(`Clock-based triggers: ${clockTriggerCount}`);

    if (storedEventCount !== clockTriggerCount) {
      Logger.log(`⚠️  MISMATCH: ${storedEventCount} stored events vs ${clockTriggerCount} clock triggers`);
    }
  }
}