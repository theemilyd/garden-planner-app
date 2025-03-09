/**
 * Mailgun email provider for Garden App SaaS
 * Backup production email delivery service
 */

const nodemailer = require('nodemailer');

// Use environment variables for Mailgun credentials
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

/**
 * Create a Mailgun transporter
 * @returns {Object} Nodemailer transporter
 */
const createTransport = () => {
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    throw new Error('Mailgun credentials not configured');
  }

  return nodemailer.createTransport({
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
    auth: {
      user: `postmaster@${MAILGUN_DOMAIN}`,
      pass: MAILGUN_API_KEY
    }
  });
};

/**
 * Send email via Mailgun
 * @param {Object} options Email options object
 * @returns {Promise<Object>} Delivery result
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransport();
    const result = await transporter.sendMail(options);
    return {
      success: true,
      messageId: result.messageId,
      provider: 'mailgun',
      info: result
    };
  } catch (error) {
    console.error('Mailgun delivery error:', error);
    throw error;
  }
};

module.exports = {
  name: 'mailgun',
  label: 'Mailgun',
  sendEmail,
  createTransport
};