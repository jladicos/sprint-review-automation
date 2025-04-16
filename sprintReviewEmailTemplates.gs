/**
 * Sprint Review Email Templates
 * 
 * Pre-defined templates for common Sprint Review notification emails.
 * These templates can be used with the MessagingUtils library.
 */

var SprintEmailTemplates = (function() {
  
  // Template for slide creation notification
  const SLIDE_CREATION_TEMPLATE = `✅ Sprint review automation successfully completed.

The slide deck for your Sprint {{sprintLabel}} on {{formattedDate}} has been created.

You can access the slides here: {{slideUrl}}`;

  // Template for scheduler notifications
  const SCHEDULER_TEMPLATE = `Sprint review automation successfully completed.

{{nextMeetingText}}

{{triggersList}}

{{triggersCreated}} new trigger(s) were created during this run.`;
  
  // Create template objects using MsgUtils
  const slideCreationTemplate = MsgUtilsLibrary.MsgUtils.createTextTemplate(SLIDE_CREATION_TEMPLATE);
  const schedulerTemplate = MsgUtilsLibrary.MsgUtils.createTextTemplate(SCHEDULER_TEMPLATE);
  
  /**
   * Send a notification about created slides
   * @param {string} recipient - Email recipient
   * @param {string} slideUrl - URL to the created slides
   * @param {Date} meetingDate - Date of the meeting
   * @param {string} sprintLabel - Sprint label (e.g., "FY25-Q4-S6")
   * @return {Object} Send result
   */
  function sendSlideCreationNotification(recipient, slideUrl, meetingDate, sprintLabel) {
	const formattedDate = Utilities.formatDate(meetingDate, Session.getScriptTimeZone(), 'MMMM dd, yyyy');
	
	return slideCreationTemplate.send(
	  recipient,
	  'Sprint Review Slides Created',
	  {
		sprintLabel: sprintLabel,
		formattedDate: formattedDate,
		slideUrl: slideUrl
	  }
	);
  }
  
  /**
   * Send a notification about scheduled triggers
   * @param {string} recipient - Email recipient
   * @param {Date|null} nextMeetingDate - Date of the next meeting, or null if none
   * @param {string[]} scheduledDates - Array of formatted dates for scheduled triggers
   * @param {number} triggersCreated - Number of new triggers created
   * @return {Object} Send result
   */
  function sendSchedulerNotification(recipient, nextMeetingDate, scheduledDates, triggersCreated) {
	let nextMeetingText = 'No upcoming sprint reviews found.';
	if (nextMeetingDate) {
	  const formattedNextDate = Utilities.formatDate(nextMeetingDate, Session.getScriptTimeZone(), 'MMMM dd, yyyy');
	  nextMeetingText = `The next sprint review will be on ${formattedNextDate}.`;
	}

	let triggersList = 'No triggers have been set.';
	if (scheduledDates.length > 0) {
	  triggersList = 'Triggers for the following sprint reviews have been set:\n';
	  scheduledDates.forEach(date => {
		triggersList += `* ${date}\n`;
	  });
	}
	
	return schedulerTemplate.send(
	  recipient,
	  'Sprint Review Automation Notification',
	  {
		nextMeetingText: nextMeetingText,
		triggersList: triggersList,
		triggersCreated: triggersCreated
	  }
	);
  }
  
  // Return the public API
  return {
	// Templates
	SLIDE_CREATION_TEMPLATE: SLIDE_CREATION_TEMPLATE,
	SCHEDULER_TEMPLATE: SCHEDULER_TEMPLATE,
	
	// Template objects
	slideCreationTemplate: slideCreationTemplate,
	schedulerTemplate: schedulerTemplate,
	
	// Send functions
	sendSlideCreationNotification: sendSlideCreationNotification,
	sendSchedulerNotification: sendSchedulerNotification
  };
})();