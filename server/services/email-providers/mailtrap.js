/**
 * Mailtrap email provider for Garden App SaaS
 * Development/Testing email service
 */

const nodemailer = require('nodemailer');

// Use environment variables for Mailtrap credentials
const MAILTRAP_USER = process.env.MAILTRAP_USER || process.env.EMAIL_USER || 'b21a4dcc301127';
const MAILTRAP_PASS = process.env.MAILTRAP_PASS || process.env.EMAIL_PASS || 'b11f9f4b5fe2ca';

/**
 * Create a Mailtrap transporter
 * @returns {Object} Nodemailer transporter
 */
const createTransport = () => {
  return nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    secure: false,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASS
    }
  });
};

/**
 * Send email via Mailtrap
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
      provider: 'mailtrap',
      info: result,
      testUrl: 'https://mailtrap.io/inboxes'
    };
  } catch (error) {
    console.error('Mailtrap delivery error:', error);
    throw error;
  }
};

module.exports = {
  name: 'mailtrap',
  label: 'Mailtrap',
  sendEmail,
  createTransport,
  isTestProvider: true
};