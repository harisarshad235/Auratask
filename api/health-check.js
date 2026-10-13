import { withSecurity } from './_security.js';

async function healthCheckHandler(req, res) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zamtslutoccexvqjepqz.supabase.co';
    const targetUrl = `${supabaseUrl}/auth/v1/health`;
    const response = await fetch(targetUrl);
    const text = await response.text();
    return res.status(200).json({
      ok: true,
      statusCode: response.status,
      body: text,
      message: 'Supabase is fully reachable!'
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
      message: 'Could not reach Supabase endpoint.'
    });
  }
}

export default withSecurity(healthCheckHandler, {
  allowedMethods: ['GET', 'OPTIONS'],
  rateLimit: 30, // 30 req/min
  windowMs: 60000
});
