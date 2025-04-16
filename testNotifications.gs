/**
 * Test functions for Sprint Review notification emails
 * Use these to verify that the messaging system is working correctly
 */

/**
 * Test the slide creation notification email
 * This simulates the email sent when a new slide deck is created
 */
function testSlideCreationNotification() {
  // Generate a mock URL - would normally come from the actual slide creation
  const mockSlideUrl = "https://docs.google.com/presentation/d/1exampleId/edit";
  
  // Use today's date plus 10 days as a sample meeting date
  const mockMeetingDate = new Date();
  mockMeetingDate.setDate(mockMeetingDate.getDate() + 10);
  
  // Calculate sprint label for the meeting date
  const sprintLabel = formatSprintString(mockMeetingDate);
  
  // Get the current user's email
  const recipient = Session.getActiveUser().getEmail();
  
  // Send the test notification
  SprintMessaging.sendSlideCreationNotification(
	recipient,
	mockSlideUrl,
	mockMeetingDate,
	sprintLabel
  );
  
  Logger.log(`Test slide creation notification sent to ${recipient}`);
  Logger.log(`Meeting date: ${mockMeetingDate.toDateString()}`);
  Logger.log(`Sprint label: ${sprintLabel}`);
}

/**
 * Test the scheduler notification email
 * This simulates the email sent when the scheduler runs
 */
function testSchedulerNotification() {
  // Create a sample next meeting date (15 days from now)
  const mockNextMeetingDate = new Date();
  mockNextMeetingDate.setDate(mockNextMeetingDate.getDate() + 15);
  
  // Create sample scheduled dates (array of formatted dates)
  const mockScheduledDates = [];
  
  // Add some sample future dates
  for (let i = 1; i <= 3; i++) {
	const futureDate = new Date();
	futureDate.setDate(futureDate.getDate() + (15 * i));
	const formattedDate = Utilities.formatDate(futureDate, Session.getScriptTimeZone(), 'MMMM dd, yyyy');
	mockScheduledDates.push(formattedDate);
  }
  
  // Sample number of triggers created
  const mockTriggersCreated = mockScheduledDates.length;
  
  // Get the current user's email
  const recipient = Session.getActiveUser().getEmail();
  
  // Send the test notification
  SprintMessaging.sendSchedulerNotification(
	recipient,
	mockNextMeetingDate,
	mockScheduledDates,
	mockTriggersCreated
  );
  
  Logger.log(`Test scheduler notification sent to ${recipient}`);
  Logger.log(`Next meeting date: ${mockNextMeetingDate.toDateString()}`);
  Logger.log(`Scheduled dates: ${mockScheduledDates.join(', ')}`);
  Logger.log(`Triggers created: ${mockTriggersCreated}`);
}

/**
 * Test the basic email functionality with various options
 */
function testBasicEmail() {
  // Get the current user's email
  const recipient = Session.getActiveUser().getEmail();
  
  // Plain text email
  SprintMessaging.sendEmail(
	recipient,
	'Test Plain Text Email',
	'This is a test plain text email from the SprintMessaging system.'
  );
  
  Logger.log(`Test plain text email sent to ${recipient}`);
  
  // HTML email
  SprintMessaging.sendEmail(
	recipient,
	'Test HTML Email',
	'<h1>HTML Email Test</h1><p>This is a <strong>formatted</strong> email with <em>styling</em>.</p>',
	{ isHtml: true }
  );
  
  Logger.log(`Test HTML email sent to ${recipient}`);
}

/**
 * Test multiple notification types at once
 */
function testAllNotifications() {
  testSlideCreationNotification();
  testSchedulerNotification();
  testBasicEmail();
  
  Logger.log('All test notifications sent!');
}

/**
 * Test a notification with an error condition (empty next meeting)
 * This tests the template's handling of null/undefined values
 */
function testEmptySchedulerNotification() {
  // Get the current user's email
  const recipient = Session.getActiveUser().getEmail();
  
  // Send with no next meeting date
  SprintMessaging.sendSchedulerNotification(
	recipient,
	null,
	[],
	0
  );
  
  Logger.log(`Test empty scheduler notification sent to ${recipient}`);
}

/**
 * Test a custom message using direct MsgUtils access
 * This demonstrates using the library directly for one-off messages
 */
function testCustomMessage() {
  // Get the current user's email
  const recipient = Session.getActiveUser().getEmail();
  
  // Custom template text
  const customTemplate = "This is a custom message with some dynamic content:\n" +
	"- Current time: {{time}}\n" +
	"- User: {{user}}\n" +
	"- Custom value: {{customValue}}";
  
  // Create data for the template
  const templateData = {
	time: new Date().toLocaleString(),
	user: Session.getActiveUser().getEmail().split('@')[0],
	customValue: "Hello from the test function!"
  };
  
  // Send using the MsgUtils library directly
  MsgUtilsLibrary.MsgUtils.sendTemplatedEmail(
	recipient,
	'Custom Template Test',
	customTemplate, 
	templateData
  );
  
  Logger.log(`Custom test message sent to ${recipient}`);
}