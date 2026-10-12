/**
 * formatDuration
 * Formats a minute number or raw duration string into a concise human-readable ETA label.
 * Examples:
 *   30 -> "30m"
 *   90 -> "1h 30m"
 *   120 -> "2h"
 *   "45m" -> "45m"
 *   "2h" -> "2h"
 */
export const formatDuration = (val) => {
  if (!val && val !== 0) return '';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return '';
    // If it already contains units like 'm', 'h', 'd'
    if (/[mhd]/i.test(trimmed)) return trimmed;
    const num = Number(trimmed);
    if (isNaN(num) || num <= 0) return trimmed;
    val = num;
  }
  const mins = Number(val);
  if (isNaN(mins) || mins <= 0) return '';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
};

export default formatDuration;
