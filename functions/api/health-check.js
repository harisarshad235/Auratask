export async function onRequestGet(context) {
  try {
    const supabaseUrl = context.env?.VITE_SUPABASE_URL || 'https://zamtslutoccexvqjepqz.supabase.co';
    const targetUrl = `${supabaseUrl}/auth/v1/health`;
    const response = await fetch(targetUrl);
    const text = await response.text();

    return new Response(JSON.stringify({
      ok: true,
      statusCode: response.status,
      body: text,
      message: 'Supabase is fully reachable from Cloudflare Edge!'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      ok: false,
      error: err.message,
      message: 'Could not reach Supabase from Cloudflare Edge.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
