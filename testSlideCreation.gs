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
	createSprintReviewSlides(meetingDate);
  } catch (err) {
	Logger.log(`❌ Error: ${err.message}`);
  }
}

function runManualSlideTestForApril8() {
  generateSprintReviewSlidesFor("2025-04-08");
}