/**
 * Creates a Sprint Review slide deck for a given meeting date.
 *
 * This function:
 * - Calculates the correct sprint label (e.g. FY25-Q4-S6) based on the sprint start date
 * - Formats the meeting date for display on the slide
 * - Creates a copy of the template slide deck
 * - Renames the file with the sprint label and meeting date
 * - Updates the title slide with sprint info and the meeting date
 * - Moves the new slide deck to the target folder
 * - Sends an email notification with a link to the created slide
 *
 * @param {Date} meetingDate - The date of the Sprint Review meeting
 */
function createSprintReviewSlides(meetingDate) {
  const sprintInfo = formatSprintString(meetingDate);
  const formattedDate = Utilities.formatDate(meetingDate, Session.getScriptTimeZone(), 'MMM dd');
  const fileName = `Sprint Review - ${sprintInfo}-${formattedDate}`;

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
		shape.getText().setText(`Sprint ${sprintInfo}`);
	  }

	  if (text.includes('Date:')) {
		const formattedFullDate = Utilities.formatDate(meetingDate, Session.getScriptTimeZone(), 'MMM dd, yyyy');
		shape.getText().setText(`Date: ${formattedFullDate}`);
	  }
	}
  }

  presentation.saveAndClose();

  const message = `Slides created for ${sprintInfo} on ${formattedDate}\n` +
				  `Link: ${newFile.getUrl()}`;
  Logger.log(message);
  MailApp.sendEmail(Session.getActiveUser().getEmail(), 'Sprint Review Slides Created', message);
}