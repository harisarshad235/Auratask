/**
 * Date Utility Functions for Local Timezone Precision
 *
 * Prevents UTC timezone drift where `new Date().toISOString().split('T')[0]`
 * erroneously returns yesterday's date for users in timezones east of UTC
 * (e.g. UTC+5, UTC+8, UTC+12) during local night/morning hours.
 */

/**
 * Returns a 'YYYY-MM-DD' formatted string based on local machine time.
 * @param {Date|string|number} [dateInput=new Date()]
 * @returns {string} 'YYYY-MM-DD'
 */
export function formatLocalDate(dateInput = new Date()) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date formatted as 'YYYY-MM-DD' in the user's local timezone.
 * @returns {string}
 */
export function getTodayDateStr() {
  return formatLocalDate(new Date());
}

/**
 * Returns tomorrow's date formatted as 'YYYY-MM-DD' in the user's local timezone.
 * @returns {string}
 */
export function getTomorrowDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatLocalDate(d);
}

/**
 * Returns a date N days from now formatted as 'YYYY-MM-DD' in the user's local timezone.
 * @param {number} days
 * @returns {string}
 */
export function getDaysFromNowStr(days = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatLocalDate(d);
}
