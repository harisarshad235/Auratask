/**
 * Cloudflare Pages Global Security Middleware
 * Intercepts all requests, strictly restricts CORS on /api/* routes,
 * applies IP rate limiting on sensitive endpoints, and injects secure headers.
 */

const ALLOWED_ORIGINS = [
  'https://takt.harisarshad.site',
  'https://auratask.pages.dev',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173'
];

function isOriginAllowed(origin) {
  if (!origin) return false;
  const clean = origin.trim().toLowerCase();
  if (ALLOWED_ORIGINS.includes(clean)) return true;
  if (/^https:\/\/[a-z0-9-]+\.pages\.dev$/i.test(clean)) return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(clean)) return true;
  return false;
}

// In-worker rate limit memory cache
const rateLimitMap = new Map();

function checkRateLimit(ipKey, limit = 60, windowMs = 60000) {
  const now = Date.now();
  const list = (rateLimitMap.get(ipKey) || []).filter(ts => now - ts < windowMs);
  if (list.length >= limit) {
    const oldest = list[0];
    const retryAfter = Math.ceil((windowMs - (now - oldest)) / 1000);
    return { allowed: false, limit, remaining: 0, retryAfter };
  }
  list.push(now);
  rateLimitMap.set(ipKey, list);
  return { allowed: true, limit, remaining: limit - list.length, retryAfter: 0 };
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const isApi = url.pathname.startsWith('/api/');
  const origin = request.headers.get('Origin') || request.headers.get('Referer') || '';

  // 1. Strict CORS evaluation for API endpoints
  if (isApi && origin) {
    let cleanOrigin = '';
    try {
      cleanOrigin = new URL(origin).origin;
    } catch {
      return new Response(JSON.stringify({ ok: false, error: 'Malformed Origin' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!isOriginAllowed(cleanOrigin)) {
      return new Response(JSON.stringify({ ok: false, error: 'CORS forbidden: Origin not permitted' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': cleanOrigin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400',
          'Vary': 'Origin'
        }
      });
    }
  }

  // 2. Rate limiting for sensitive API routes
  if (isApi) {
    const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || 'anon';
    const isSensitive = url.pathname.includes('/auth') || url.pathname.includes('/public-form');
    const limit = isSensitive ? 10 : 60;
    const windowMs = isSensitive ? 15 * 60 * 1000 : 60000;

    const rl = checkRateLimit(`${clientIp}:${url.pathname}`, limit, windowMs);
    if (!rl.allowed) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'Too many requests. Please wait before retrying.',
        retryAfter: rl.retryAfter
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rl.retryAfter),
          'RateLimit-Limit': String(rl.limit),
          'RateLimit-Remaining': '0'
        }
      });
    }
  }

  // Execute request
  const response = await next();

  // 3. Inject strict security headers on all responses
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  if (isApi && origin && isOriginAllowed(origin)) {
    try {
      headers.set('Access-Control-Allow-Origin', new URL(origin).origin);
      headers.set('Vary', 'Origin');
    } catch { }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
