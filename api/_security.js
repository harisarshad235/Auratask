/**
 * Serverless API Security Middleware & Utilities
 * Provides strict CORS restriction, sliding-window rate limiting,
 * request payload size limits, schema validation, and input sanitization.
 */

export const ALLOWED_ORIGINS = [
  'https://takt.harisarshad.site',
  'https://auratask.pages.dev',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173'
];

/**
 * Validates Origin against strict whitelist.
 */
export function isAllowedOrigin(origin) {
  if (!origin) return false;
  const clean = origin.trim().toLowerCase();
  if (ALLOWED_ORIGINS.includes(clean)) return true;

  // Staging / preview subdomains on Pages and Vercel
  if (/^https:\/\/[a-z0-9-]+\.pages\.dev$/i.test(clean)) return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(clean)) return true;

  return false;
}

/**
 * In-memory sliding-window rate limiter per client IP.
 */
const rateLimitCache = new Map();

export function checkRateLimit(ip, limit = 60, windowMs = 60000) {
  const now = Date.now();
  const key = `${ip}`;
  const record = rateLimitCache.get(key) || [];
  const validTimestamps = record.filter(ts => now - ts < windowMs);

  if (validTimestamps.length >= limit) {
    const oldest = validTimestamps[0];
    const retryAfter = Math.ceil((windowMs - (now - oldest)) / 1000);
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfter,
      reset: Math.ceil((oldest + windowMs) / 1000)
    };
  }

  validTimestamps.push(now);
  rateLimitCache.set(key, validTimestamps);

  // Periodic cache cleanup to prevent memory bloat
  if (rateLimitCache.size > 10000) {
    for (const [k, v] of rateLimitCache.entries()) {
      if (v.every(ts => now - ts >= windowMs)) {
        rateLimitCache.delete(k);
      }
    }
  }

  return {
    allowed: true,
    limit,
    remaining: limit - validTimestamps.length,
    reset: Math.ceil((now + windowMs) / 1000)
  };
}

/**
 * Deep string sanitizer to neutralize XSS and script injections.
 */
export function sanitizeString(val, maxLength = 5000) {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control chars
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '') // script tags
    .replace(/<(iframe|object|embed|style|meta|link)[\s\S]*?>[\s\S]*?<\/\1>/gi, '')
    .replace(/on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '') // inline handlers
    .replace(/(javascript|vbscript|data):/gi, '$1_blocked:') // malicious schemes
    .slice(0, maxLength)
    .trim();
}

/**
 * Recursively sanitize objects and arrays.
 */
export function sanitizePayload(data, depth = 8) {
  if (depth <= 0 || data === null || data === undefined) return data;
  if (typeof data === 'string') return sanitizeString(data);
  if (Array.isArray(data)) return data.map(item => sanitizePayload(item, depth - 1));
  if (typeof data === 'object') {
    const safe = {};
    for (const [k, v] of Object.entries(data)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      safe[sanitizeString(k, 100)] = sanitizePayload(v, depth - 1);
    }
    return safe;
  }
  return data;
}

/**
 * Request body schema validator.
 */
export function validateBody(schema, body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Body must be a valid JSON object'], data: null };
  }

  const errors = [];
  const sanitized = {};

  for (const [field, rules] of Object.entries(schema)) {
    const val = body[field];

    if (rules.required && (val === undefined || val === null || val === '')) {
      errors.push(`Field '${field}' is required`);
      continue;
    }

    if (val === undefined || val === null) {
      if (rules.default !== undefined) sanitized[field] = rules.default;
      continue;
    }

    if (rules.type === 'string') {
      if (typeof val !== 'string') {
        errors.push(`Field '${field}' must be a string`);
        continue;
      }
      const clean = sanitizeString(val, rules.maxLength || 2000);
      if (rules.minLength && clean.length < rules.minLength) {
        errors.push(`Field '${field}' must be at least ${rules.minLength} characters`);
      }
      sanitized[field] = clean;
    } else if (rules.type === 'email') {
      if (typeof val !== 'string') {
        errors.push(`Field '${field}' must be an email string`);
        continue;
      }
      const clean = val.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clean) || clean.length > 254) {
        errors.push(`Field '${field}' must be a valid email`);
      }
      sanitized[field] = clean;
    } else if (rules.type === 'number') {
      const num = Number(val);
      if (isNaN(num)) {
        errors.push(`Field '${field}' must be a number`);
      } else {
        sanitized[field] = num;
      }
    } else if (rules.type === 'boolean') {
      sanitized[field] = Boolean(val);
    } else {
      sanitized[field] = sanitizePayload(val);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? sanitized : null
  };
}

/**
 * Higher-order security wrapper for serverless API handlers.
 */
export function withSecurity(handler, options = {}) {
  const {
    allowedMethods = ['GET', 'POST', 'OPTIONS'],
    rateLimit = 60, // requests per minute
    windowMs = 60000,
    schema = null,
    maxBodyBytes = 50000 // 50KB limit
  } = options;

  return async function securedHandler(req, res) {
    const origin = req.headers.origin || req.headers.referer || '';
    let allowedOriginHeader = 'https://takt.harisarshad.site';

    // 1. Strict CORS evaluation
    if (origin) {
      try {
        const originUrl = new URL(origin).origin;
        if (isAllowedOrigin(originUrl)) {
          allowedOriginHeader = originUrl;
        } else {
          return res.status(403).json({
            ok: false,
            error: 'CORS forbidden: Origin not allowed',
            origin: originUrl
          });
        }
      } catch {
        // malformed origin
        return res.status(400).json({ ok: false, error: 'Malformed Origin header' });
      }
    }

    // Apply baseline security headers
    res.setHeader('Access-Control-Allow-Origin', allowedOriginHeader);
    res.setHeader('Access-Control-Allow-Methods', allowedMethods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    // 2. Method check
    if (!allowedMethods.includes(req.method)) {
      res.setHeader('Allow', allowedMethods.join(', '));
      return res.status(405).json({
        ok: false,
        error: `Method ${req.method} Not Allowed`
      });
    }

    // 3. Client IP extraction & Rate limiting
    const clientIp = (
      req.headers['cf-connecting-ip'] ||
      req.headers['x-real-ip'] ||
      req.headers['x-forwarded-for'] ||
      req.socket?.remoteAddress ||
      'unknown-ip'
    ).toString().split(',')[0].trim();

    const rlResult = checkRateLimit(`${req.url}:${clientIp}`, rateLimit, windowMs);
    res.setHeader('RateLimit-Limit', rlResult.limit);
    res.setHeader('RateLimit-Remaining', rlResult.remaining);

    if (!rlResult.allowed) {
      res.setHeader('Retry-After', rlResult.retryAfter);
      return res.status(429).json({
        ok: false,
        error: 'Too many requests. Please wait before retrying.',
        retryAfter: rlResult.retryAfter
      });
    }

    // 4. Request size verification
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > maxBodyBytes) {
      return res.status(413).json({
        ok: false,
        error: `Payload Too Large. Maximum allowed size is ${maxBodyBytes} bytes.`
      });
    }

    // 5. Schema validation & input sanitization
    if (schema && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
      const validation = validateBody(schema, req.body);
      if (!validation.valid) {
        return res.status(400).json({
          ok: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }
      req.sanitizedBody = validation.data;
    } else if (req.body) {
      req.sanitizedBody = sanitizePayload(req.body);
    }

    // Forward to base handler
    return handler(req, res);
  };
}
