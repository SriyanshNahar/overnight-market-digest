const sgMail = require('@sendgrid/mail');
const config = require('./config');

function todaySubjectDate() {
  return new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Kolkata',
  });
}

async function sendEmailDigest(htmlContent, itemCount) {
  if (!config.sendgridApiKey || !config.sendgridFromEmail || !config.sendgridToEmail) {
    console.warn('[sendEmail] Missing SendGrid config - skipping email send.');
    return;
  }

  sgMail.setApiKey(config.sendgridApiKey);

  const msg = {
    to: config.sendgridToEmail,
    from: config.sendgridFromEmail,
    subject: `🌙 Overnight Market Digest — ${todaySubjectDate()} (${itemCount} stories)`,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log('[sendEmail] Digest email sent successfully.');
  } catch (err) {
    console.error('[sendEmail] Failed to send email:', err.response?.body || err.message);
    throw err;
  }
}

module.exports = { sendEmailDigest };
