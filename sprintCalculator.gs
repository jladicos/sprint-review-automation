/**
 * Returns the sprint string for any date, e.g., "FY25-Q4-S3"
 * Handles special logic for FY25-Q4 and pre-sprint dates.
 * Replaces the original formatSprintString().
 * @param {Date} date
 * @returns {string}
 */
function formatSprintString(date) {
  const sprintLengthDays = 14;
  const sprintZeroStart = new Date(Date.UTC(2025, 0, 15)); // Jan 15, 2025

  const sprintStartDate = getSprintStartDate(date, sprintZeroStart, sprintLengthDays);
  if (!sprintStartDate) {
	return `FY00-Q0-S0`;
  }

  const fiscalYear = getFiscalYearFromDate(sprintStartDate);
  const fiscalQuarter = getFiscalQuarterFromDate(sprintStartDate);
  const sprintNumber = getSprintNumberInQuarter(sprintStartDate, sprintZeroStart, sprintLengthDays);

  const twoDigitYear = String(fiscalYear).slice(-2);
  return `FY${twoDigitYear}-Q${fiscalQuarter}-S${sprintNumber}`;
}


/**
 * Returns sprint number for any date, with special case logic for FY25 Q4.
 * Replaces the original getSprintNumberInQuarter().
 */
function getSprintNumberInQuarter(date, anchorDate, sprintLengthDays) {
  // Special case: before Sprint 0
  if (date < anchorDate) return 0;

  // Special case: FY25-Q4 (Jan 15 – Mar 31, 2025)
  const fy25Q4Start = new Date(Date.UTC(2025, 0, 15)); // Jan 15, 2025
  const fy25Q4End = new Date(Date.UTC(2025, 3, 1));    // Apr 1, 2025

  if (date >= fy25Q4Start && date < fy25Q4End) {
	const daysSinceQ4Start = Math.floor((date - fy25Q4Start) / (1000 * 60 * 60 * 24));
	return Math.floor(daysSinceQ4Start / sprintLengthDays) + 1;
  }

  // Standard logic
  const fiscalQuarter = getFiscalQuarterFromDate(date);
  const quarterStartMonth = [3, 6, 9, 0][fiscalQuarter - 1];
  const calendarYear = date.getFullYear();
  const quarterStartYear = (fiscalQuarter === 4) ? calendarYear - 1 : calendarYear;
  const quarterStartDate = new Date(Date.UTC(quarterStartYear, quarterStartMonth, 1));

  const daysSinceQuarterStart = Math.floor((date - quarterStartDate) / (1000 * 60 * 60 * 24));

  if (daysSinceQuarterStart < 0) {
	throw new Error(`Sprint date ${date.toISOString()} is before the quarter start (${quarterStartDate.toISOString()}).`);
  }

  return Math.floor(daysSinceQuarterStart / sprintLengthDays) + 1;
}

function getFiscalYearFromDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth(); // Jan = 0
  return (month >= 3) ? year + 1 : year;
}

function getFiscalQuarterFromDate(date) {
  const month = date.getMonth();
  if (month >= 3 && month <= 5) return 1; // Apr–Jun
  if (month >= 6 && month <= 8) return 2; // Jul–Sep
  if (month >= 9 && month <= 11) return 3; // Oct–Dec
  return 4; // Jan–Mar
}

function getSprintStartDate(date, anchorDate, sprintLengthDays) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSinceAnchor = Math.floor((date - anchorDate) / msPerDay);
  const sprintIndex = Math.floor(daysSinceAnchor / sprintLengthDays);

  if (sprintIndex < 0) {
	return null; // pre-sprint
  }

  const sprintStart = new Date(anchorDate.getTime() + sprintIndex * sprintLengthDays * msPerDay);
  return sprintStart;
}