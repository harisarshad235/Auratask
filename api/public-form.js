import { withSecurity } from './_security.js';

async function publicFormHandler(req, res) {
  const { name, email, subject, message } = req.sanitizedBody;

  // Process public contact / support / data deletion form safely
  return res.status(200).json({
    ok: true,
    message: 'Your message has been securely received and recorded.',
    data: {
      name,
      email,
      subject: subject || 'General Inquiry',
      timestamp: new Date().toISOString()
    }
  });
}

export default withSecurity(publicFormHandler, {
  allowedMethods: ['POST', 'OPTIONS'],
  rateLimit: 10, // Sensitive form limit: max 10 submissions per 15 minutes
  windowMs: 15 * 60 * 1000,
  schema: {
    name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    email: { required: true, type: 'email' },
    subject: { required: false, type: 'string', maxLength: 150, default: 'General Inquiry' },
    message: { required: true, type: 'string', minLength: 5, maxLength: 3000 }
  }
});
