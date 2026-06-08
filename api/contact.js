// Vercel Serverless Function — POST /api/contact
// ------------------------------------------------
// Receives the booking form and forwards it to engage@schoolstories.com.au
// via Resend. The Resend API key is read from process.env.RESEND_API_KEY,
// which you set in Vercel → Project → Settings → Environment Variables.
// It is NEVER committed to the repo and never sent to the browser.

const TO_ADDRESS = 'engage@schoolstories.com.au';
// NOTE: the "from" domain must be verified in your Resend dashboard.
// Until schoolstories.com.au is verified you can test with 'onboarding@resend.dev'.
const FROM_ADDRESS = 'School Stories <engage@schoolstories.com.au>';

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  // Vercel parses JSON bodies automatically; guard in case it's a string.
  let data = req.body;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch { data = {}; }
  }
  data = data || {};

  const name = (data.name || '').trim();
  const role = (data.role || '').trim();
  const school = (data.school || '').trim();
  const email = (data.email || '').trim();
  const msg = (data.msg || '').trim();

  if (!name || !school || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#1a1815;line-height:1.6">
      <h2 style="margin:0 0 14px">New discovery call request</h2>
      <p style="margin:0 0 6px"><strong>Name:</strong> ${esc(name)}</p>
      <p style="margin:0 0 6px"><strong>Role:</strong> ${esc(role) || '—'}</p>
      <p style="margin:0 0 6px"><strong>School:</strong> ${esc(school)}</p>
      <p style="margin:0 0 6px"><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
      <p style="margin:14px 0 6px"><strong>Message:</strong></p>
      <p style="margin:0;white-space:pre-wrap">${esc(msg) || '—'}</p>
    </div>`;

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [TO_ADDRESS],
        reply_to: email,
        subject: `New discovery call request — ${school}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const detail = await resendRes.text();
      return res.status(502).json({ error: 'Email send failed', detail });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ error: 'Email send failed' });
  }
}
