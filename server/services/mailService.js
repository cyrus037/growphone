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

  const results = [];

  // Send user email with fixed template
  if (lead.email) {
    try {
      const subject = 'Thank you for contacting Growphone! 🚀';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Growphone</h1>
            <p style="color: #64748b; margin: 5px 0;">Digital Marketing Solutions</p>
          </div>
          
          <h2 style="color: #1e293b;">Thank you for contacting us! 🎉</h2>
          <p>Hi ${vars.name},</p>
          <p>We've received your inquiry and our team will reach out to you within 2 hours on WhatsApp.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="color: #1e293b; margin-top: 0;">Your Details:</h3>
            <p><strong>Business Type:</strong> ${vars.businessType}</p>
            <p><strong>Phone:</strong> ${vars.phone}</p>
            <p><strong>Budget:</strong> ${vars.budget}</p>
            <p><strong>Email:</strong> ${vars.email}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://growphone.in" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Visit Our Website
            </a>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>📞 What happens next?</strong></p>
            <p style="margin: 5px 0; color: #92400e;">Our team will contact you on WhatsApp within 2 hours to discuss your growth strategy.</p>
          </div>
          
          <p style="color: #64748b;">Get ready to grow! 📈</p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">Best regards,<br>Team Growphone</p>
            <p style="margin: 10px 0 0; color: #64748b; font-size: 12px;">
              <a href="https://growphone.in" style="color: #2563eb; text-decoration: none;">www.growphone.in</a> | 
              <a href="mailto:info@growphone.in" style="color: #2563eb; text-decoration: none;">info@growphone.in</a>
            </p>
            <p style="margin: 5px 0 0; color: #94a3b8; font-size: 10px;">© 2026 Growphone. All rights reserved.</p>
          </div>
        </div>
      `;
      
      await transport.sendMail({
        from: `"Growphone" <${from}>`,
        to: lead.email,
        subject,
        html,
      });
      results.push('user');
      console.log('[mail] User email sent successfully to:', lead.email);
    } catch (emailError) {
      console.error('[mail] Failed to send user email:', emailError.message);
    }
  }

  // Send admin email with fixed template
  try {
    const subject = `🔥 New Lead: ${vars.name} - ${vars.businessType}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; margin: 0;">🔥 New Lead Received!</h1>
          <p style="color: #64748b; margin: 5px 0;">Growphone Inquiry</p>
        </div>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="color: #1e293b; margin-top: 0;">Lead Information:</h3>
          <p><strong>Name:</strong> ${vars.name}</p>
          <p><strong>Email:</strong> ${vars.email}</p>
          <p><strong>Business Type:</strong> ${vars.businessType}</p>
          <p><strong>Phone:</strong> ${vars.phone}</p>
          <p><strong>Budget:</strong> ${vars.budget}</p>
          <p><strong>Submitted:</strong> ${vars.submittedAt}</p>
        </div>
        
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af;"><strong>⚡ Action Required:</strong></p>
          <p style="margin: 5px 0; color: #1e40af;">Contact this lead within 2 hours on WhatsApp</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://growphone.in" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Visit Website
            </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <p style="margin: 0; color: #64748b; font-size: 14px;">Best regards,<br>Growphone System</p>
          <p style="margin: 10px 0 0; color: #64748b; font-size: 12px;">
            <a href="https://growphone.in" style="color: #2563eb; text-decoration: none;">www.growphone.in</a> | 
            <a href="mailto:info@growphone.in" style="color: #2563eb; text-decoration: none;">info@growphone.in</a>
          </p>
          <p style="margin: 5px 0 0; color: #94a3b8; font-size: 10px;">© 2026 Growphone. All rights reserved.</p>
        </div>
      </div>
    `;
    
    await transport.sendMail({
      from: `"Growphone" <${from}>`,
      to: adminNotify,
      subject,
      html,
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
