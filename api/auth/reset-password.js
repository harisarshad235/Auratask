import { withSecurity } from '../_security.js';

async function resetPasswordHandler(req, res) {
  const { email } = req.sanitizedBody;

  try {
    // In production, triggers Supabase auth password reset email or returns success
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zamtslutoccexvqjepqz.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseKey) {
      await fetch(`${supabaseUrl}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey
        },
        body: JSON.stringify({ email })
      });
    }

    // Always respond with generic success to mitigate account enumeration attacks
    return res.status(200).json({
      ok: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.'
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: 'Unable to process reset request at this time.'
    });
  }
}

export default withSecurity(resetPasswordHandler, {
  allowedMethods: ['POST', 'OPTIONS'],
  rateLimit: 5, // Strict rate limit: max 5 attempts per 15 minutes
  windowMs: 15 * 60 * 1000,
  schema: {
    email: { required: true, type: 'email' }
  }
});
