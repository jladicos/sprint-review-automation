/**
 * Test utility for manually generating Sprint Review slide decks.
 * Call this with any meeting date to simulate one-off deck creation.
 *
 * Example usage:
 * generateSprintReviewSlidesFor("2025-04-08")
 */
function generateSprintReviewSlidesFor(dateString) {
  if (!dateString) {
	Logger.log("❌ Please provide a date string in YYYY-MM-DD format.");
	return;
  }

  try {
	const meetingDate = new Date(`${dateString}T09:00:00`); // 9 AM local time
	if (isNaN(meetingDate.getTime())) {
	  throw new Error("Invalid date format. Use YYYY-MM-DD.");
	}

	Logger.log(`📅 Generating Sprint Review slides for ${meetingDate.toDateString()}...`);
	const sprintInfo = formatSprintString(meetingDate);
	createSlides(meetingDate, sprintInfo);
  } catch (err) {
	Logger.log(`❌ Error: ${err.message}`);
  }
}

/**
 * Force-creates a Sprint Review slide deck for a given date and custom sprint string.
 * 
 * Useful for holidays, special scheduling, or backfills.
 * 
 * Example:
 * generateCustomSprintReviewSlides("2025-04-10", "FY25-Q4-S6")
 */
function generateCustomSprintReviewSlides(dateString, sprintLabel) {
  if (!dateString || !sprintLabel) {
	Logger.log("❌ Please provide both a date string (YYYY-MM-DD) and a sprint label (e.g., FY25-Q4-S6).");
	return;
  }

  try {
	const meetingDate = new Date(`${dateString}T09:00:00`);
	if (isNaN(meetingDate.getTime())) {
	  throw new Error("Invalid date format. Use YYYY-MM-DD.");
	}

	Logger.log(`📅 Generating custom Sprint Review slides for ${meetingDate.toDateString()} as ${sprintLabel}...`);
	createSlides(meetingDate, sprintLabel);
  } catch (err) {
	Logger.log(`❌ Error: ${err.message}`);
  }
}

/**
 * One-click test function to generate slides for an actual meeting date.
 */
function runManualSlideTestForMeetingDate() {
  generateSprintReviewSlidesFor("2025-04-08");
}

/**
 * One-click test function to generate slides for an arbitary date with an arbitrary sprint string.
 */
function runCustomSlideTestForArbitaryDateAndSprintValue() {
  generateCustomSprintReviewSlides("2025-07-03", "FY29-Q1-S66");
}
