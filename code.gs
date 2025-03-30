/**
 * Creates a Sprint Review slide deck for a given meeting date.
 *
 * This function:
 * - Calculates the correct sprint label (e.g. FY25-Q4-S6) based on the sprint start date
 * - Calls createSlides to generate and configure the deck
 *
 * @param {Date} meetingDate - The date of the Sprint Review meeting
 */
function createSprintReviewSlides(meetingDate) {
  const sprintInfo = formatSprintString(meetingDate);
  createSlides(meetingDate, sprintInfo);
}

/**
 * Shared slide creation logic, used by standard and custom sprint generators.
 *
 * @param {Date} meetingDate - The date of the meeting
 * @param {string} sprintLabel - The sprint string to use (e.g., FY25-Q4-S6)
 */
function createSlides(meetingDate, sprintLabel) {
  const formattedDate = Utilities.formatDate(meetingDate, Session.getScriptTimeZone(), 'MMM dd');
  const fileName = `Sprint Review - ${sprintLabel}-${formattedDate}`;

  const template = DriveApp.getFileById(CONFIG.templateId);
  const folder = DriveApp.getFolderById(CONFIG.targetFolderId);
  const newFile = template.makeCopy(fileName, folder);

  const presentation = SlidesApp.openById(newFile.getId());
  const titleSlide = presentation.getSlides()[0];
  const pageElements = titleSlide.getPageElements();

  for (const el of pageElements) {
	if (el.getPageElementType() === SlidesApp.PageElementType.SHAPE) {
	  const shape = el.asShape();
	  const text = shape.getText().asString();

	  if (text.includes('Sprint FY')) {
		shape.getText().setText(`Sprint ${sprintLabel}`);
	  }

	  if (text.includes('Date:')) {
		const formattedFullDate = Utilities.formatDate(meetingDate, Session.getScriptTimeZone(), 'MMM dd, yyyy');
		shape.getText().setText(`Date: ${formattedFullDate}`);
	  }
	}
  }

  presentation.saveAndClose();

  const message = `✅ Slides created for ${sprintLabel} on ${formattedDate}\nLink: ${newFile.getUrl()}`;
  Logger.log(message);
  MailApp.sendEmail(Session.getActiveUser().getEmail(), 'Sprint Review Slides Created', message);
}
