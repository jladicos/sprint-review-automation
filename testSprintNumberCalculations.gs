/**
 * Logs the sprint string for a single meeting date.
 * @param {string} dateString - A string like "Apr 8, 2025"
 */
function logSprintStringForDate(dateString) {
  const date = new Date(dateString);
  const sprintString = formatSprintString(date);
  Logger.log(`${dateString} → ${sprintString}`);
}


/**
 * Runs logSprintStringForDate on a predefined set of milestone dates.
 */
function testSprintStringCalculations() {
  const meetingDates = [
	"Jan 14, 2025",
	"Jan 15, 2025",
	"Jan 28, 2025",
	"Feb 11, 2025",
	"Feb 25, 2025",
	"Mar 11, 2025",
	"Mar 25, 2025",
	"Apr 8, 2025",
	"Apr 22, 2025",
	"May 6, 2025",
	"May 20, 2025",
	"Jun 3, 2025",
	"Jun 17, 2025",
	"Jul 1, 2025",
	"Jul 15, 2025",
	"Jul 29, 2025"
  ];

  for (const dateString of meetingDates) {
	logSprintStringForDate(dateString);
  }
}