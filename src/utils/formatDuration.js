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

export const parseDurationMinutes = (val) => {
  if (!val && val !== 0) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.round(val);
  const s = String(val).trim().toLowerCase();
  if (!s) return 0;
  let totalMins = 0;
  const hourMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:h|hour)/i);
  const minMatch = s.match(/(\d+)\s*(?:m|min)/i);
  const dayMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:d|day)/i);

  if (dayMatch) totalMins += parseFloat(dayMatch[1]) * 480;
  if (hourMatch) totalMins += parseFloat(hourMatch[1]) * 60;
  if (minMatch) totalMins += parseInt(minMatch[1], 10);

  if (!hourMatch && !minMatch && !dayMatch) {
    const num = parseFloat(s);
    return isNaN(num) ? 0 : Math.round(num);
  }
  return Math.round(totalMins);
};

export const extractDurationHint = (text) => {
  if (!text || typeof text !== 'string') return null;
  const m = text.match(/(?:ETA[:\s]+|[[(])?\b(\d+(?:\.\d+)?\s*(?:m(?:in(?:ute)?s?)?|h(?:(?:ou)?rs?)?|d(?:ays?)?))\b[\])]?/i);
  if (m) {
    const raw = m[1].toLowerCase().replace(/\s+/g, '');
    if (raw.includes('min') || raw.endsWith('m')) {
      const num = parseFloat(raw);
      return num ? `${num}m` : null;
    }
    if (raw.includes('h') || raw.includes('hour')) {
      const num = parseFloat(raw);
      return num ? (num === 1 ? '1h' : `${num}h`) : null;
    }
    if (raw.includes('d') || raw.includes('day')) {
      const num = parseFloat(raw);
      return num ? `${num}d` : null;
    }
  }
  return null;
};

export default formatDuration;
