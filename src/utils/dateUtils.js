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
  if (!dateInput) return '';
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    return dateInput.trim();
  }
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Safely extracts 'YYYY-MM-DD' in local timezone from any ISO timestamp, Date, or date string.
 * @param {Date|string|number} ts
 * @returns {string}
 */
export function getLocalDateFromTimestamp(ts) {
  return formatLocalDate(ts);
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

const TAKT_META_REGEX = /<!--takt:meta\s+([\s\S]*?)-->/;

/**
 * Normalizes workflow stage / section strings across swimlanes.
 * @param {string} sec
 * @returns {string}
 */
export function normalizeSectionKey(sec) {
  if (!sec) return 'todo';
  const s = String(sec).toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (s === 'todo' || s === 'to_do') return 'todo';
  if (s === 'in_progress' || s === 'inprogress' || s === 'progress') return 'in_progress';
  if (s === 'in_review' || s === 'inreview' || s === 'review') return 'in_review';
  if (s === 'completed' || s === 'done' || s === 'complete') return 'completed';
  return s;
}

/**
 * Determines if a completed task was completed strictly on today's local date.
 * If the day passes, it returns false so past completed tasks don't linger in today's view.
 *
 * @param {Object} task
 * @param {string} [todayDateStr]
 * @returns {boolean}
 */
export function isTaskCompletedToday(task, todayDateStr = getTodayDateStr()) {
  if (!task || typeof task !== 'object') return false;
  const isCompleted =
    normalizeSectionKey(task.section) === 'completed' ||
    normalizeSectionKey(task.status) === 'completed' ||
    Boolean(task.completed_at);
  if (!isCompleted) return false;

  const targetDate = todayDateStr || getTodayDateStr();

  // 1. Explicit completed_at
  const compAt = task.completed_at || task.__meta_completed_at;
  if (compAt) {
    return getLocalDateFromTimestamp(compAt) === targetDate;
  }

  // 2. Embedded metadata in description
  if (typeof task.description === 'string' && task.description.includes('takt:meta')) {
    const match = task.description.match(TAKT_META_REGEX);
    if (match) {
      try {
        const meta = JSON.parse(match[1]);
        if (meta.completed_at) {
          return getLocalDateFromTimestamp(meta.completed_at) === targetDate;
        }
      } catch { }
    }
  }

  // 3. Fallback for legacy tasks marked completed before completed_at tracking:
  // Check updated_at when it was transitioned to completed
  if (task.updated_at) {
    return getLocalDateFromTimestamp(task.updated_at) === targetDate;
  }

  // 4. Fallback to due_date if no completion or update timestamp exists
  if (task.due_date) {
    return task.due_date === targetDate;
  }

  return false;
}

