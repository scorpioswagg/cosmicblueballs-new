import { Resend } from 'resend';

let _resend = null;
function getResend() {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

export async function sendMagicLinkEmail({ to, magicLink }) {
  const resend = getResend();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set, skipping email send. Magic link:', magicLink);
    return { skipped: true };
  }
  const html = `
    <div style="font-family:system-ui,sans-serif;background:#0b0820;padding:32px;color:#f3f0ff;">
      <div style="max-width:480px;margin:0 auto;background:linear-gradient(135deg,#1a0f3e,#2d1b5e);border-radius:12px;padding:32px;border:1px solid rgba(255,255,255,0.1);">
        <h1 style="font-size:24px;margin:0 0 8px 0;background:linear-gradient(90deg,#c084fc,#f0abfc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">✨ Cosmic Blueprint</h1>
        <p style="color:#cbd5e1;font-size:14px;margin:0 0 24px 0;">Your sign-in link is ready</p>
        <p style="margin:0 0 24px 0;">Click the button below to sign in. This link expires in 10 minutes and can only be used once.</p>
        <p style="text-align:center;margin:32px 0;"><a href="${magicLink}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;text-decoration:none;border-radius:9999px;font-weight:600;">Sign in to Cosmic Blueprint</a></p>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">If the button doesn\u2019t work, paste this link in your browser:<br/><span style="color:#cbd5e1;word-break:break-all;">${magicLink}</span></p>
        <p style="color:#64748b;font-size:11px;margin-top:32px;">If you didn\u2019t request this, you can safely ignore this email.</p>
      </div>
    </div>
  `;
  try {
    const { data, error } = await resend.emails.send({
      from: 'Cosmic Blueprint <onboarding@resend.dev>',
      to: [to],
      subject: 'Your Cosmic Blueprint sign-in link',
      html,
    });
    if (error) {
      console.error('[resend] send error:', error);
      return { error };
    }
    return { id: data?.id };
  } catch (e) {
    console.error('[resend] exception:', e.message);
    return { error: e.message };
  }
}
