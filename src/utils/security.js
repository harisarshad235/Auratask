/**
 * Takt Security Suite
 * High-performance input sanitization, schema validation, and rate limiting.
 */

// Permitted CORS Origins (Production, Staging, and Local Dev)
export const ALLOWED_ORIGINS = [
  'https://takt.harisarshad.site',
  'https://auratask.pages.dev',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173'
];

/**
 * Validates if an Origin header is permitted.
 * Supports wildcard matching for Cloudflare Pages (*.pages.dev) and Vercel (*.vercel.app).
 */
export function isOriginAllowed(origin) {
  if (!origin) return false;
  const cleanOrigin = origin.trim().toLowerCase();
  
  if (ALLOWED_ORIGINS.includes(cleanOrigin)) return true;
  
  // Staging / Preview subdomains
  if (/^https:\/\/[a-z0-9-]+\.pages\.dev$/i.test(cleanOrigin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(cleanOrigin)) return true;
  
  return false;
}

/**
 * Escapes dangerous HTML characters to prevent Reflected and Stored XSS.
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Deep sanitization for strings: strips script tags, event handlers, javascript: schemes,
 * control characters, and null bytes.
 */
export function sanitizeString(val, maxLength = 10000) {
  if (typeof val !== 'string') return '';
  let clean = val;

  // 1. Strip null bytes and dangerous control characters
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Strip executable <script> tags and enclosed code
  clean = clean.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');

  // 3. Strip iframe, object, embed, and style tags
  clean = clean.replace(/<(iframe|object|embed|style|meta|link)[\s\S]*?>[\s\S]*?<\/\1>/gi, '');

  // 4. Strip inline event handlers (e.g., onload=, onerror=, onclick=)
  clean = clean.replace(/on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 5. Strip dangerous protocols (javascript:, data:text/html, vbscript:)
  clean = clean.replace(/(javascript|vbscript|data):/gi, '$1_blocked:');

  // 6. Enforce maximum character length to prevent buffer/memory exhaustion
  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength);
  }

  return clean.trim();
}

/**
 * Recursively sanitizes any incoming payload (objects, arrays, strings).
 */
export function sanitizePayload(data, maxDepth = 10) {
  if (maxDepth <= 0 || data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return sanitizeString(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizePayload(item, maxDepth - 1));
  }

  if (typeof data === 'object') {
    // Mitigate prototype pollution attacks
    const sanitizedObj = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      const safeKey = sanitizeString(key, 100);
      sanitizedObj[safeKey] = sanitizePayload(value, maxDepth - 1);
    }
    return sanitizedObj;
  }

  return data;
}

/**
 * Strict Schema Validator.
 * Validates fields according to provided rule definitions.
 */
export function validateSchema(schema, data) {
  const errors = [];
  const sanitized = {};

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'], data: null };
  }

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Check required
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field '${field}' is required`);
      continue;
    }

    if (value === undefined || value === null) {
      if (rules.default !== undefined) {
        sanitized[field] = rules.default;
      }
      continue;
    }

    // Type validation
    if (rules.type === 'string') {
      if (typeof value !== 'string') {
        errors.push(`Field '${field}' must be a string`);
        continue;
      }

      let cleanVal = sanitizeString(value, rules.maxLength || 5000);

      if (rules.minLength && cleanVal.length < rules.minLength) {
        errors.push(`Field '${field}' must be at least ${rules.minLength} characters`);
      }

      if (rules.pattern && !rules.pattern.test(cleanVal)) {
        errors.push(rules.patternError || `Field '${field}' has an invalid format`);
      }

      sanitized[field] = cleanVal;
    } else if (rules.type === 'email') {
      if (typeof value !== 'string') {
        errors.push(`Field '${field}' must be a string`);
        continue;
      }
      const cleanEmail = value.trim().toLowerCase();
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailRegex.test(cleanEmail) || cleanEmail.length > 254) {
        errors.push(`Field '${field}' must be a valid email address`);
        continue;
      }
      sanitized[field] = cleanEmail;
    } else if (rules.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) {
        errors.push(`Field '${field}' must be a number`);
        continue;
      }
      if (rules.min !== undefined && num < rules.min) {
        errors.push(`Field '${field}' must be >= ${rules.min}`);
      }
      if (rules.max !== undefined && num > rules.max) {
        errors.push(`Field '${field}' must be <= ${rules.max}`);
      }
      sanitized[field] = num;
    } else if (rules.type === 'boolean') {
      sanitized[field] = Boolean(value);
    } else if (rules.type === 'array') {
      if (!Array.isArray(value)) {
        errors.push(`Field '${field}' must be an array`);
        continue;
      }
      if (rules.maxItems && value.length > rules.maxItems) {
        errors.push(`Field '${field}' exceeds maximum item count of ${rules.maxItems}`);
      }
      sanitized[field] = sanitizePayload(value);
    } else {
      sanitized[field] = sanitizePayload(value);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? sanitized : null
  };
}

/**
 * Client-Side Rate Limiter for Authentication & Sensitive User Actions.
 * Thwarts rapid brute-forcing, credential stuffing, and duplicate form submits.
 */
class ClientRateLimiter {
  constructor() {
    this.attempts = new Map();
  }

  /**
   * Evaluates if an action is permitted.
   * @param {string} actionName Identifier for the action (e.g. 'auth_login')
   * @param {number} maxAttempts Maximum allowed attempts in window
   * @param {number} windowMs Time window in milliseconds
   * @returns {{ allowed: boolean, remaining: number, waitSeconds: number }}
   */
  check(actionName, maxAttempts = 5, windowMs = 60000) {
    const now = Date.now();
    const timestamps = (this.attempts.get(actionName) || []).filter(ts => now - ts < windowMs);

    if (timestamps.length >= maxAttempts) {
      const oldest = timestamps[0];
      const waitSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
      return { allowed: false, remaining: 0, waitSeconds };
    }

    timestamps.push(now);
    this.attempts.set(actionName, timestamps);
    return { allowed: true, remaining: maxAttempts - timestamps.length, waitSeconds: 0 };
  }

  reset(actionName) {
    this.attempts.delete(actionName);
  }
}

export const clientRateLimiter = new ClientRateLimiter();
