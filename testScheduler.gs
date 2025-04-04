/**
 * Test function that finds Sprint Review events without creating any triggers.
 * This can be run to verify which events will be detected by the automation.
 * Results are only logged to the script editor - no emails are sent.
 * Updated to show which events would have triggers based on the composite key format.
 */
function testFindSprintReviewEvents() {
  // Use configuration from config.gs
  const calendarId = CONFIG.calendar.id;
  const exactSearchTerm = CONFIG.calendar.exactSearchTerm;
  const lookaheadDays = CONFIG.calendar.lookaheadDays + 30; // Increased for testing (+30 days)
  const daysInAdvance = CONFIG.calendar.daysInAdvance;

  // Calculate date range for searching events
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + lookaheadDays);

  // Get calendar and events
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

  // Get all properties to check for existing triggers
  const properties = PropertiesService.getScriptProperties().getProperties();

  // Prepare results for display
  Logger.log(`Found ${events.length} upcoming Sprint Review events in the next ${lookaheadDays} days:`);
  Logger.log('-----------------------------------------------------');
  Logger.log(`Calendar: ${calendarId}`);
  Logger.log(`Search term: "${exactSearchTerm}"`);
  Logger.log('-----------------------------------------------------');

  // Display detailed information about each event
  if (events.length === 0) {
	Logger.log('No events found with the exact title "Sprint Review"');
  } else {
	events.forEach((event, index) => {
	  const eventDate = event.getStartTime();
	  const eventId = event.getId();
	  const formattedDate = Utilities.formatDate(eventDate, Session.getScriptTimeZone(), 'MMMM dd, yyyy h:mm a');

	  // Calculate when the trigger would be set
	  const triggerDate = new Date(eventDate);
	  triggerDate.setDate(triggerDate.getDate() - daysInAdvance);
	  const formattedTriggerDate = Utilities.formatDate(triggerDate, Session.getScriptTimeZone(), 'MMMM dd, yyyy');

	  // Check if a trigger already exists for this event using the composite key
	  const dateString = Utilities.formatDate(eventDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
	  const compositeKey = `TRIGGER_EVENT_${eventId}_${dateString}`;
	  const hasExistingTrigger = properties[compositeKey] !== undefined;

	  Logger.log(`${index + 1}. Title: ${event.getTitle()}`);
	  Logger.log(`   Date: ${formattedDate}`);
	  Logger.log(`   Calendar: ${event.getOriginalCalendarId()}`);
	  Logger.log(`   Event ID: ${eventId}`);
	  Logger.log(`   Trigger would be set for: ${formattedTriggerDate}`);
	  Logger.log(`   Trigger already exists: ${hasExistingTrigger ? 'YES' : 'NO'}`);
	  Logger.log(`   Composite key: ${compositeKey}`);
	  Logger.log('-----------------------------------------------------');
	});
  }

  Logger.log('NOTE: No triggers were actually created. This is just a test to show which events would be included.');
}