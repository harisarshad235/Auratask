function sanitizeString(val) {
  if (typeof val !== 'string') return '';
  return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

export async function onRequestPost(context) {
  try {
    let body;
    try {
      body = await context.request.json();
    } catch {
      return new Response(JSON.stringify({ ok: false, error: 'Malformed JSON payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const email = sanitizeString(body?.email || '').toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 254) {
      return new Response(JSON.stringify({ ok: false, error: 'Valid email address is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = context.env?.VITE_SUPABASE_URL || 'https://zamtslutoccexvqjepqz.supabase.co';
    const supabaseKey = context.env?.VITE_SUPABASE_ANON_KEY;

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

    // Always generic success to prevent account enumeration
    return new Response(JSON.stringify({
      ok: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
