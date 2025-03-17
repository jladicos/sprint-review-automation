/**
 * Creates a copy of a template slide deck for sprint reviews with proper naming
 * based on fiscal year, quarter, sprint number, and meeting date.
 * Also updates the first slide with the sprint information and meeting date.
 *
 * @param {Date} eventDate - Optional date from calendar event
 * @return {String} URL of the created presentation
 */
function createSprintReviewSlides(eventDate) {
  // Get the template file and target folder
  const templateFile = DriveApp.getFileById(CONFIG.templateId);
  const targetFolder = DriveApp.getFolderById(CONFIG.targetFolderId);

  // Get date - use event date if provided, otherwise prompt for manual input
  let meetingDate;

  if (eventDate) {
	// Use the provided event date
	meetingDate = eventDate;
  } else {
	// No date provided, prompt user for input
	meetingDate = promptForDate();
  }

  // Calculate fiscal year, quarter, and sprint
  const fiscalInfo = calculateFiscalInfo(meetingDate);

  // Generate filename with date included
  const newFileName = generateFilename(fiscalInfo, meetingDate);

  // Make a copy in the target folder
  const newFile = templateFile.makeCopy(newFileName, targetFolder);

  // Update the first slide with sprint information and meeting date
  updateFirstSlideApproach1(newFile.getId(), fiscalInfo, meetingDate);

  // Log and return the URL to the new presentation
  const slideUrl = newFile.getUrl();
  Logger.log(`Created new presentation: ${slideUrl}`);
  return slideUrl;
}

/**
 * Updates the first slide with the appropriate sprint information and meeting date
 * Using a simple and reliable approach
 */
function updateFirstSlideApproach1(presentationId, fiscalInfo, meetingDate) {
  try {
	// Add a delay to make sure the copy is fully processed
	Utilities.sleep(3000);

	// Open the presentation
	const presentation = SlidesApp.openById(presentationId);

	// Get the first slide
	const slides = presentation.getSlides();
	if (slides.length === 0) {
	  Logger.log("No slides found in the presentation");
	  return;
	}

	const firstSlide = slides[0];

	// Find and replace the sprint information text
	updateSprintText(firstSlide, fiscalInfo);

	// Find and replace the date text
	updateDateText(firstSlide, meetingDate);

	// Save changes
	presentation.saveAndClose();
	Logger.log("Presentation saved and closed");
  } catch (e) {
	Logger.log(`Error updating first slide: ${e.toString()}`);
  }
}

/**
 * Updates the sprint information text on the slide
 */
function updateSprintText(slide, fiscalInfo) {
  // Find text containing "Sprint FY" on the slide
  const shapes = slide.getShapes();

  // Log how many shapes we found for debugging
  Logger.log(`Found ${shapes.length} shapes on the slide`);

  // Store the original text and shape for reference
  let originalShape = null;
  let originalText = "";

  // First, find the shape with the text we want to replace
  for (let i = 0; i < shapes.length; i++) {
	const shape = shapes[i];
	if (!shape.getText) continue;

	try {
	  const textRange = shape.getText();
	  const text = textRange.asString();

	  Logger.log(`Shape ${i}: Text content: "${text}"`);

	  // Look for pattern "Sprint FY" to identify the title text
	  if (text.includes("Sprint FY")) {
		originalShape = shape;
		originalText = text;
		Logger.log(`Found sprint text to replace in shape ${i}: "${originalText}"`);
		break;
	  }
	} catch (error) {
	  Logger.log(`Error examining shape ${i}: ${error}`);
	}
  }

  // If we found the shape with the text to replace
  if (originalShape) {
	// Create the replacement text
	const replacementText = `Sprint FY${fiscalInfo.fiscalYear}-Q${fiscalInfo.quarter}-S${fiscalInfo.sprint}`;
	Logger.log(`Will replace with: "${replacementText}"`);

	// Attempt to replace the text directly using simple string search/replace
	try {
	  // Get the text object
	  const textObject = originalShape.getText();

	  // Extract the pattern from the original text
	  const startIndex = originalText.indexOf("Sprint FY");
	  if (startIndex >= 0) {
		// Find a natural end point - the first new line or end of string
		let endIndex = originalText.indexOf("\\n", startIndex);
		if (endIndex < 0) endIndex = originalText.length;

		// Get the text to replace
		const textToReplace = originalText.substring(startIndex, endIndex);
		Logger.log(`Will replace sprint text: "${textToReplace}"`);

		// Use replaceText method
		if (textObject.replaceText) {
		  textObject.replaceText(textToReplace, replacementText);
		  Logger.log("Used replaceText method to update sprint info");
		} else {
		  // Fallback to replaceAllText if available
		  textObject.replaceAllText(textToReplace, replacementText);
		  Logger.log("Used replaceAllText method to update sprint info");
		}

		Logger.log("Sprint text replacement completed");
	  } else {
		Logger.log("Could not determine the exact pattern to replace for sprint info");
	  }
	} catch (error) {
	  Logger.log(`Error replacing sprint text: ${error}`);
	}
  } else {
	Logger.log("Could not find any text containing 'Sprint FY' on the slide");
  }
}

/**
 * Updates the date text on the slide
 */
function updateDateText(slide, meetingDate) {
  // Find text containing "Date:" on the slide
  const shapes = slide.getShapes();

  // Store the original text and shape for reference
  let originalShape = null;
  let originalText = "";

  // First, find the shape with the text we want to replace
  for (let i = 0; i < shapes.length; i++) {
	const shape = shapes[i];
	if (!shape.getText) continue;

	try {
	  const textRange = shape.getText();
	  const text = textRange.asString();

	  // Look for pattern "Date:" to identify the date text
	  if (text.includes("Date:")) {
		originalShape = shape;
		originalText = text;
		Logger.log(`Found date text to replace in shape ${i}: "${originalText}"`);
		break;
	  }
	} catch (error) {
	  Logger.log(`Error examining shape ${i} for date: ${error}`);
	}
  }

  // If we found the shape with the text to replace
  if (originalShape) {
	// Format the date as "MMM DD, YYYY"
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const month = months[meetingDate.getMonth()];
	const day = meetingDate.getDate();
	const year = meetingDate.getFullYear();

	const formattedDate = `${month} ${day}, ${year}`;
	const replacementText = `Date: ${formattedDate}`;
	Logger.log(`Will replace date with: "${replacementText}"`);

	// Attempt to replace the text directly using simple string search/replace
	try {
	  // Get the text object
	  const textObject = originalShape.getText();

	  // Extract the pattern from the original text
	  const startIndex = originalText.indexOf("Date:");
	  if (startIndex >= 0) {
		// Find a natural end point - the first new line or end of string
		let endIndex = originalText.indexOf("\\n", startIndex);
		if (endIndex < 0) endIndex = originalText.length;

		// Get the text to replace
		const textToReplace = originalText.substring(startIndex, endIndex);
		Logger.log(`Will replace date text: "${textToReplace}"`);

		// Use replaceText method if available
		if (textObject.replaceText) {
		  textObject.replaceText(textToReplace, replacementText);
		  Logger.log("Used replaceText method to update date");
		} else {
		  // Fallback to replaceAllText if available
		  textObject.replaceAllText(textToReplace, replacementText);
		  Logger.log("Used replaceAllText method to update date");
		}

		Logger.log("Date text replacement completed");
	  } else {
		Logger.log("Could not determine the exact pattern to replace for date");
	  }
	} catch (error) {
	  Logger.log(`Error replacing date text: ${error}`);
	}
  } else {
	Logger.log("Could not find any text containing 'Date:' on the slide");
  }
}

/**
 * Prompts the user to enter a date for the sprint review
 * Uses a safer approach that works in all contexts
 *
 * @return {Date} The selected date
 */
function promptForDate() {
  try {
	// Try to get UI context if available
	let ui;

	if (typeof SlidesApp !== 'undefined' && SlidesApp.getActivePresentation()) {
	  ui = SlidesApp.getUi();
	} else {
	  // We're likely running from the script editor directly
	  // Use a different approach for date input
	  Logger.log("No UI context available. Using today's date.");
	  return new Date();
	}

	// Default to today
	let date = new Date();

	// Prompt for date input in MM/DD/YYYY format
	const response = ui.prompt(
	  'Enter Sprint Review Date',
	  'Please enter the date in MM/DD/YYYY format:',
	  ui.ButtonSet.OK_CANCEL
	);

	// Process the response
	if (response.getSelectedButton() == ui.Button.OK) {
	  const dateString = response.getResponseText();

	  // Try to parse the entered date
	  const parts = dateString.split('/');
	  if (parts.length === 3) {
		const month = parseInt(parts[0]) - 1; // JS months are 0-based
		const day = parseInt(parts[1]);
		const year = parseInt(parts[2]);

		date = new Date(year, month, day);
	  } else {
		// Invalid format, show error and use today's date
		ui.alert('Invalid date format. Using today\'s date instead.');
	  }
	}

	return date;
  } catch (e) {
	// If any error occurs, just use today's date
	Logger.log("Error prompting for date: " + e.toString());
	Logger.log("Using today's date instead.");
	return new Date();
  }
}

/**
 * Generates a filename based on fiscal information and meeting date
 *
 * @param {Object} fiscalInfo - Object containing fiscalYear, quarter, and sprint
 * @param {Date} meetingDate - Date of the sprint review meeting
 * @return {String} Formatted filename
 */
function generateFilename(fiscalInfo, meetingDate) {
  // Format the date as "MMM DD" (e.g., "Mar 15")
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[meetingDate.getMonth()];
  const day = meetingDate.getDate().toString().padStart(2, '0');

  // Create the filename with the date appended
  return `Sprint Review - FY${fiscalInfo.fiscalYear}-Q${fiscalInfo.quarter}-S${fiscalInfo.sprint}-${month} ${day}`;
}

/**
 * Updated function to calculate fiscal year, quarter, and sprint number based on a given date.
 * Fiscal year starts April 1, and sprints are two-week periods starting on the first Tuesday of each quarter.
 *
 * @param {Date} date - The date to calculate fiscal information for
 * @return {Object} Object containing fiscalYear, quarter, and sprint
 */
function calculateFiscalInfo(date) {
  const month = date.getMonth(); // 0-11 (Jan-Dec)
  const year = date.getFullYear();

  // Calculate fiscal year (FY starts April 1)
  let fiscalYear;
  if (month >= 3) { // Apr-Dec
	fiscalYear = (year - 2000) + 1; // 2025 - 2000 + 1 = 26 (FY26)
  } else { // Jan-Mar
	fiscalYear = (year - 2000); // 2026 - 2000 = 26 (FY26) for Jan-Mar 2026
  }

  // Calculate quarter
  let quarter;
  if (month >= 3 && month <= 5) { // Apr-Jun
	quarter = 1;
  } else if (month >= 6 && month <= 8) { // Jul-Sep
	quarter = 2;
  } else if (month >= 9 && month <= 11) { // Oct-Dec
	quarter = 3;
  } else { // Jan-Mar
	quarter = 4;
  }

  // Calculate the first day of the current quarter
  let quarterStartDate;
  switch (quarter) {
	case 1: // Q1: Apr-Jun
	  quarterStartDate = new Date(year, 3, 1); // April 1
	  break;
	case 2: // Q2: Jul-Sep
	  quarterStartDate = new Date(year, 6, 1); // July 1
	  break;
	case 3: // Q3: Oct-Dec
	  quarterStartDate = new Date(year, 9, 1); // October 1
	  break;
	case 4: // Q4: Jan-Mar
	  quarterStartDate = new Date(year, 0, 1); // January 1
	  break;
  }

  // Calculate sprint number using the new function
  const sprint = calculateSprintNumber(date, quarterStartDate);

  return {
	fiscalYear: fiscalYear,
	quarter: quarter,
	sprint: sprint
  };
}

/**
 * Calculates the sprint number based on the given date.
 * Sprints always start on Wednesday and end on Tuesday, with a fixed schedule.
 * For Q4 2025, we know that March 12-25 is Sprint 5, and March 26-April 8 is Sprint 6.
 * 
 * @param {Date} date - The date to calculate the sprint number for
 * @param {Date} quarterStartDate - The first day of the fiscal quarter
 * @return {Number} The sprint number (1-indexed)
 */
function calculateSprintNumber(date, quarterStartDate) {
  // For Q4 2025, we know the exact start date of sprint 5: March 12, 2025
  // We can use this as a reference point to calculate the start of Q4 sprints
  const knownSprintDate = new Date(2025, 2, 12); // March 12, 2025
  const knownSprintNumber = 5;
  
  // Check if the date is in the same quarter/year as our reference sprint
  const dateQuarter = date.getMonth() >= 0 && date.getMonth() <= 2 ? 4 : 
					  date.getMonth() >= 3 && date.getMonth() <= 5 ? 1 :
					  date.getMonth() >= 6 && date.getMonth() <= 8 ? 2 : 3;
  const dateYear = date.getFullYear();
  const knownQuarter = 4; // Q4
  const knownYear = 2025;
  
  // If we're in the known quarter/year, we can use our reference
  if (dateYear === knownYear && dateQuarter === knownQuarter) {
	// Calculate how many days before or after the known sprint start date
	const millisecDiff = date.getTime() - knownSprintDate.getTime();
	const daysDiff = Math.floor(millisecDiff / (1000 * 60 * 60 * 24));
	
	// Each sprint is 14 days
	const sprintOffset = Math.floor(daysDiff / 14);
	return knownSprintNumber + sprintOffset;
  } else {
	// For other quarters, find the first Wednesday on or after the quarter start date
	const firstSprintStartDate = new Date(quarterStartDate);
	
	// Adjust to first Wednesday (day 3, where Sunday = 0)
	while (firstSprintStartDate.getDay() !== 3) { // 3 = Wednesday
	  firstSprintStartDate.setDate(firstSprintStartDate.getDate() + 1);
	}
	
	// Calculate days since first sprint start
	const millisecSinceFirstSprint = date.getTime() - firstSprintStartDate.getTime();
	const daysSinceFirstSprint = Math.floor(millisecSinceFirstSprint / (1000 * 60 * 60 * 24));
	
	// If the date is before the first sprint start, return 0 or handle as needed
	if (daysSinceFirstSprint < 0) {
	  return 1; // Default to first sprint of quarter if before first sprint
	}
	
	// Calculate sprint (1-indexed)
	const sprint = Math.floor(daysSinceFirstSprint / 14) + 1;
	
	return sprint;
  }
}

/**
 * Test function to verify fiscal calculations for different dates
 * Updated to test the new sprint calculation logic
 */
function testFiscalCalculations() {
  const testDates = [
	new Date(2025, 3, 5),  // April 5, 2025 - Should be FY26-Q1-S1
	new Date(2025, 4, 20), // May 20, 2025 - Should be FY26-Q1-S3 or S4 depending on sprint starts
	new Date(2025, 7, 10), // August 10, 2025 - Should be FY26-Q2-S3 or S4 depending on sprint starts
	new Date(2025, 11, 25),// December 25, 2025 - Should be FY26-Q3-S6 or S7 depending on sprint starts
	new Date(2026, 1, 5),  // February 5, 2026 - Should be FY26-Q4-S2 or S3 depending on sprint starts
	new Date(2025, 2, 12), // March 12, 2025 - Should be FY25-Q4-S5 (our known reference)
	new Date(2025, 2, 25), // March 25, 2025 - Should be FY25-Q4-S5
	new Date(2025, 2, 26), // March 26, 2025 - Should be FY25-Q4-S6
	new Date(2025, 3, 8),  // April 8, 2025 - Should be FY26-Q1-S6 (crosses quarter boundary)
  ];

  testDates.forEach(date => {
	const info = calculateFiscalInfo(date);
	const filename = generateFilename(info, date);
	
	// Format the date for better readability
	const formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), 'MMM dd, yyyy');
	
	Logger.log(`Date: ${formattedDate} => ${filename}`);
	Logger.log(`  FY${info.fiscalYear}-Q${info.quarter}-S${info.sprint}`);
  });
}

/**
 * Function to create slides from a calendar event
 * Can be triggered by Calendar
 */
function createSlidesFromCalendarEvent(e) {
  if (e && e.calendarEventId) {
	const calEvent = CalendarApp.getEventById(e.calendarEventId);
	if (calEvent) {
	  const eventDate = calEvent.getStartTime();
	  return createSprintReviewSlides(eventDate);
	}
  }

  // If no event or event id, run manually
  return createSprintReviewSlides();
}