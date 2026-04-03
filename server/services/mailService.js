const nodemailer = require('nodemailer');
const EmailTemplate = require('../models/EmailTemplate');
const { renderTemplate } = require('./templateRenderer');

let transporterPromise;

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  if (!transporterPromise) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure =
      process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1' || port === 465;
    transporterPromise = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      /** Zoho / many providers expect STARTTLS on 587 */
      ...(port === 587 && !secure ? { requireTLS: true } : {}),
    });
  }
  return transporterPromise;
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
  const transport = getTransporter();
  if (!transport) {
    console.warn('[mail] SMTP not configured — skipping email send');
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const vars = leadVars(lead);
  const adminNotify =
    process.env.ADMIN_NOTIFICATION_EMAIL || 'growphonedigital@gmail.com';
  const from = mailFromAddress();

  const [userTpl, adminTpl] = await Promise.all([
    getActiveTemplate('contact_confirmation'),
    getActiveTemplate('contact_admin'),
  ]);

  const results = [];

  if (userTpl && lead.email) {
    const subject = renderTemplate(userTpl.subject, vars);
    const html = renderTemplate(userTpl.htmlContent, vars);
    await transport.sendMail({
      from: `"Growphone" <${from}>`,
      to: lead.email,
      subject,
      html,
    });
    results.push('user');
  }

  if (adminTpl) {
    const subject = renderTemplate(adminTpl.subject, vars);
    const html = renderTemplate(adminTpl.htmlContent, vars);
    await transport.sendMail({
      from: `"Growphone" <${from}>`,
      to: adminNotify,
      subject,
      html,
    });
    results.push('admin');
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
