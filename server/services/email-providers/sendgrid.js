/**
 * SendGrid email provider for Garden App SaaS
 * Primary production email delivery service
 */

const nodemailer = require('nodemailer');

// Use environment variable for SendGrid API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

/**
 * Create a SendGrid transporter
 * @returns {Object} Nodemailer transporter
 */
const createTransport = () => {
  if (!SENDGRID_API_KEY) {
    throw new Error('SendGrid API key not configured');
  }

  return nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false, // use TLS
    auth: {
      user: 'apikey', // this is literally the string 'apikey'
      pass: SENDGRID_API_KEY
    }
  });
};

/**
 * Send email via SendGrid
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
      provider: 'sendgrid',
      info: result
    };
  } catch (error) {
    console.error('SendGrid delivery error:', error);
    throw error;
  }
};

module.exports = {
  name: 'sendgrid',
  label: 'SendGrid',
  sendEmail,
  createTransport
};