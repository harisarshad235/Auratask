export default async function handler(req, res) {
  try {
    const targetUrl = 'https://zamtslutoccexvqjepqz.supabase.co/auth/v1/health';
    const response = await fetch(targetUrl);
    const text = await response.text();
    return res.status(200).json({
      ok: true,
      statusCode: response.status,
      body: text,
      message: 'Supabase is fully reachable from Vercel Cloud!'
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
      message: 'Vercel Cloud also could not reach Supabase.'
    });
  }
}
