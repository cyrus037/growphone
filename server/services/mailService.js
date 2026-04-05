const { Resend } = require('resend');
const EmailTemplate = require('../models/EmailTemplate');
const { renderTemplate } = require('./templateRenderer');

let resendClient;

function getTransporter() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function mailFromAddress() {
  return process.env.MAIL_FROM || 'info@growphone.in';
}

function isMailConfigured() {
  return !!getTransporter();
}

async function getActiveTemplate(usage) {
  const t = await EmailTemplate.findOne({ usage, isActive: true });
  return t;
}

function leadVars(lead) {
  const submittedAt = lead.createdAt
    ? new Date(lead.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  return {
    name: lead.name || '',
    email: lead.email || '',
    businessType: lead.businessType || '',
    phone: lead.phone || '',
    budget: lead.budget || '',
    submittedAt,
  };
}

/**
 * Sends confirmation to the lead and notification to admin when SMTP is configured.
 */
async function sendContactEmails(lead) {
  const resend = getTransporter();
  if (!resend) {
    console.warn('[mail] Resend not configured — skipping email send');
    return { sent: false, reason: 'resend_not_configured' };
  }

  const vars = leadVars(lead);
  const adminNotify =
    process.env.ADMIN_NOTIFICATION_EMAIL || 'growphonedigital@gmail.com';
  const from = mailFromAddress();

  const results = [];

  // Send user email using Resend template
  if (lead.email) {
    try {
      await resend.emails.send({
        from: `"Growphone" <${from}>`,
        to: lead.email,
        subject: 'Thank you for contacting Growphone!',
        template: {
          id: 'ef7400f8-c4eb-4a47-9ff7-a86fef453f6f',
          data: {
            name: vars.name,
            email: vars.email,
            businessType: vars.businessType,
            phone: vars.phone,
            budget: vars.budget,
            submittedAt: vars.submittedAt
          }
        }
      });
      results.push('user');
      console.log('[mail] User email sent successfully to:', lead.email);
    } catch (emailError) {
      console.error('[mail] Failed to send user email:', emailError.message);
    }
  }

  // Send admin email using Resend template
  try {
    const adminHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;">
          
          <tr>
            <td style="padding:25px 30px;font-size:18px;font-weight:bold;">
              GrowPhone
              <span style="float:right;font-size:12px;color:#888;">
                ${vars.submittedAt}
              </span>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 30px;">
              <span style="background:#22c55e;color:white;font-size:12px;padding:6px 10px;border-radius:20px;">
                ⚡ NEW LEAD
              </span>
              <h1 style="margin:15px 0 5px;font-size:26px;">
                New Lead Received
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 30px;">
              <table width="100%" style="background:#f9fafc;border-radius:10px;padding:20px;">
                
                <tr>
                  <td style="padding:10px;">
                    <div style="font-size:11px;color:#888;">FULL NAME</div>
                    <div style="font-size:16px;font-weight:bold;">
                      ${vars.name}
                    </div>
                  </td>

                  <td style="padding:10px;">
                    <div style="font-size:11px;color:#888;">BUSINESS TYPE</div>
                    <div style="background:#e5e7eb;padding:6px 12px;border-radius:20px;font-size:13px;display:inline-block;">
                      ${vars.businessType}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:10px;">
                    <div style="font-size:11px;color:#888;">EMAIL</div>
                    <div style="color:#2563eb;">
                      ${vars.email}
                    </div>
                  </td>

                  <td style="padding:10px;">
                    <div style="font-size:11px;color:#888;">BUDGET</div>
                    <div style="font-weight:bold;">
                      ${vars.budget}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:10px;">
                    <div style="font-size:11px;color:#888;">PHONE</div>
                    <div>
                      ${vars.phone}
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:20px;">
              <a href="https://growphone.in/admin-portal"
                 style="background:#2563eb;color:white;padding:12px 25px;border-radius:30px;text-decoration:none;font-size:14px;">
                View Full Lead →
              </a>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:10px;font-size:12px;color:#888;">
              Contact this lead ASAP via WhatsApp 🚀
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:20px;background:#111827;color:#9ca3af;font-size:12px;">
              GrowPhone System<br><br>
              <a href="https://growphone.in" style="color:#9ca3af;text-decoration:none;">
                Website
              </a>
              <br><br>
              © 2026 GrowPhone.in
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

await resend.emails.send({
  from: `"Growphone" <${from}>`,
  to: adminNotify,
  subject: '🔥 New Lead Received',
  html: adminHtml,
});
    results.push('admin');
    console.log('[mail] Admin email sent successfully to:', adminNotify);
  } catch (emailError) {
    console.error('[mail] Failed to send admin email:', emailError.message);
  }

  return { sent: results.length > 0, channels: results };
}

module.exports = {
  getTransporter,
  mailFromAddress,
  isMailConfigured,
  sendContactEmails,
  getActiveTemplate,
};
