/**
 * Configuration settings for Sprint Review automation
 */
const CONFIG = {
  // Template slide deck ID
  templateId: 'ID-OF-TEMPLATE-FILE',

  // Target folder ID where copies will be stored
  targetFolderId: 'ID-OF-TARGET-FOLDER'
};

/**
 * Configuration settings for Sprint Review automation
 */
const CONFIG = {
  // Template slide deck ID
  templateId: 'ID-OF-TEMPLATE-FILE',

  // Target folder ID where copies will be stored
  targetFolderId: 'ID-OF-TARGET-FOLDER',

  // Calendar settings
  calendar: {
	id: 'ID-OF-CALENDAR',  // Name or ID of the calendar containing Sprint Review events
	exactSearchTerm: 'Sprint review',  // Exact text to match in event titles
	daysInAdvance: 10,  // Number of days before the event to create slides
	lookaheadDays: 60   // How many days ahead to look for events
  }
};