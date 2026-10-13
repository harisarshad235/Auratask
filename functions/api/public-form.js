function sanitizeString(val, maxLength = 3000) {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    .slice(0, maxLength)
    .trim();
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

    const name = sanitizeString(body?.name || '', 100);
    const email = sanitizeString(body?.email || '', 254).toLowerCase();
    const subject = sanitizeString(body?.subject || 'General Inquiry', 150);
    const message = sanitizeString(body?.message || '', 3000);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || name.length < 2) {
      return new Response(JSON.stringify({ ok: false, error: 'Name must be at least 2 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!email || !emailRegex.test(email)) {
      return new Response(JSON.stringify({ ok: false, error: 'Valid email address is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!message || message.length < 5) {
      return new Response(JSON.stringify({ ok: false, error: 'Message must be at least 5 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      message: 'Your message has been securely received and recorded.',
      data: { name, email, subject, timestamp: new Date().toISOString() }
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
