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
        template: 'inquiry-received',
        variables: {
          name: vars.name,
          email: vars.email,
          businessType: vars.businessType,
          phone: vars.phone,
          budget: vars.budget,
          submittedAt: vars.submittedAt
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
    await resend.emails.send({
      from: `"Growphone" <${from}>`,
      to: adminNotify,
      subject: 'New Lead Received',
      template: 'new-lead',
      variables: {
        name: vars.name,
        email: vars.email,
        businessType: vars.businessType,
        phone: vars.phone,
        budget: vars.budget,
        submittedAt: vars.submittedAt
      }
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
