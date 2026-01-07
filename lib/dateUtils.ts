/**
 * Parse a date string (YYYY-MM-DD) as local time instead of UTC.
 * This prevents timezone conversion issues where dates appear a day behind.
 *
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Date object in local timezone
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in JavaScript
}

/**
 * Format a date string for display in the activity feed.
 * Shows "Today", "Yesterday", or formatted date.
 *
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Formatted date string
 */
export function formatActivityDate(dateString: string): string {
  const date = parseLocalDate(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day for comparison

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset date to start of day for comparison
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  if (compareDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (compareDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * Format a date string for display in the activity detail page.
 * Shows full weekday and date.
 *
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "Monday, January 15, 2024")
 */
export function formatDetailDate(dateString: string): string {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
