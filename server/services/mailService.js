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
      const userHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">

  <div style="display:none;visibility:hidden;opacity:0;height:0;width:0;">
    Hi ${vars.name}, we've received your inquiry and will contact you shortly.
  </div>

  <div style="width:100%;padding:20px 0;background:#f4f6f8;">
    <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;overflow:hidden;">

      <div style="background:linear-gradient(135deg,#2563eb,#1e40af);color:#ffffff;padding:30px;">
        <div style="display:inline-block;background:#22c55e;padding:5px 12px;font-size:12px;border-radius:20px;margin-bottom:10px;">
          Inquiry Received
        </div>

        <h1 style="margin:10px 0;font-size:22px;">
          We've Received Your Inquiry
        </h1>

        <p style="font-size:14px;opacity:0.9;">
          Hello ${vars.name}, thank you for reaching out. Our team will contact you shortly.
        </p>
      </div>

      <div style="padding:20px 30px;">
        <h3>Submission Summary</h3>

        <div style="background:#f9fafb;border-radius:8px;padding:15px;margin-bottom:15px;">
          <div style="font-size:12px;color:#6b7280;">Full Name</div>
          <div style="font-weight:bold;margin-bottom:10px;">${vars.name}</div>

          <div style="font-size:12px;color:#6b7280;">Email</div>
          <div style="font-weight:bold;margin-bottom:10px;">${vars.email}</div>

          <div style="font-size:12px;color:#6b7280;">Phone</div>
          <div style="font-weight:bold;">${vars.phone}</div>
        </div>

        <div style="background:#f9fafb;border-radius:8px;padding:15px;">
          <div style="font-size:12px;color:#6b7280;">Business Type</div>
          <div style="font-weight:bold;margin-bottom:10px;">${vars.businessType}</div>

          <div style="font-size:12px;color:#6b7280;">Budget</div>
          <div style="font-weight:bold;">${vars.budget}</div>
        </div>
      </div>

      <div style="padding:20px 30px;">
        <div style="background:#f9fafb;border-radius:8px;padding:15px;">
          <strong>Want faster response?</strong>
          <p style="font-size:13px;">
            Chat instantly on WhatsApp.
          </p>

          <div style="text-align:center;margin-top:15px;">
            <a href="https://wa.me/916352010575?text=Hi%20GrowPhone%2C%20this%20is%20${encodeURIComponent(vars.name)}"
              style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;">
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div style="background:#111827;color:#9ca3af;text-align:center;padding:15px;font-size:12px;">
        GrowPhone © 2026
      </div>

    </div>
  </div>

</body>
</html>
`;

await resend.emails.send({
  from: `"Growphone" <${from}>`,
  to: lead.email,
  subject: 'Thank you for contacting Growphone!',
  html: userHtml,
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
