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
 * Lists all active triggers in the project without deleting them.
 * Useful for seeing what triggers are actually scheduled.
 */
function listAllTriggers() {
  const allTriggers = ScriptApp.getProjectTriggers();
  let count = 0;

  Logger.log('Currently active triggers:');
  Logger.log('------------------------------------');

  allTriggers.forEach(trigger => {
    count++;
    Logger.log(`${count}. Function: ${trigger.getHandlerFunction()}`);
    Logger.log(`   Event Type: ${trigger.getEventType()}`);
    Logger.log(`   Trigger ID: ${trigger.getUniqueId()}`);

    if (trigger.getEventType() === ScriptApp.EventType.CLOCK) {
      if (trigger.getTriggerSourceId()) {
        Logger.log(`   Source ID: ${trigger.getTriggerSourceId()}`);
      }
    }

    Logger.log('------------------------------------');
  });

  if (count === 0) {
    Logger.log('No active triggers found');
  } else {
    Logger.log(`Found ${count} active triggers`);
  }
}