/**
 * Utility functions for event handling
 */

/**
 * Formats an event title to hide the program name
 * @param {Object} event - The event object
 * @returns {string} - The formatted title without program name
 */
export const formatEventTitle = (event) => {
  if (!event) return '';
  
  let displayTitle = event.title || '';
  
  // Remove any text within square brackets (like [DTM - 2 - ])
  displayTitle = displayTitle.replace(/\[.*?\]\s*/g, '');
  
  // If the title contains the program name, try to extract just the course name
  if (event.program && displayTitle.includes(event.program)) {
    // Try to extract just the course name by removing program information
    const programParts = event.program.split(' ');
    for (const part of programParts) {
      if (part.length > 3) { // Only remove substantial words, not short prepositions
        displayTitle = displayTitle.replace(new RegExp(part, 'gi'), '').trim();
      }
    }
  }
  
  // Clean up any remaining artifacts
  displayTitle = displayTitle.replace(/^[-\\s]+|[-\\s]+$/g, ''); // Remove leading/trailing dashes and spaces
  displayTitle = displayTitle.replace(/\s{2,}/g, ' '); // Replace multiple spaces with a single space
  
  // If we ended up with an empty string, revert to the original title but still remove brackets
  if (!displayTitle.trim()) {
    displayTitle = event.title?.replace(/\[.*?\]\s*/g, '') || '';
  }
  
  return displayTitle.trim();
};

/**
 * Creates a formatted event object for the calendar
 * @param {Object} event - The raw event data
 * @param {Date} start - The start date
 * @param {Date} end - The end date
 * @returns {Object} - Formatted event object
 */
export const createCalendarEvent = (event, start, end) => {
  const displayTitle = formatEventTitle(event);
  
  return {
    title: `${displayTitle} - ${event.docente || 'No Instructor'}`,
    start,
    end,
    resource: event,
  };
};
