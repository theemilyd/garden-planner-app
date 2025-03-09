const nodemailer = require('nodemailer');
require('dotenv').config();

// Cache for the test account
let testAccount = null;

// Create a test account with Ethereal for development
const createTestAccount = async () => {
  // If we already have a test account, reuse it
  if (testAccount) {
    return testAccount;
  }
  
  // Create a new test account
  try {
    testAccount = await nodemailer.createTestAccount();
    console.log('Created test email account:', testAccount.user);
    return testAccount;
  } catch (error) {
    console.error('Failed to create test email account:', error);
    // Fallback to default credentials
    return {
      user: process.env.ETHEREAL_EMAIL || 'test@ethereal.email',
      pass: process.env.ETHEREAL_PASSWORD || 'testpassword',
    };
  }
};

// Create a transporter with Brevo configuration - no fallbacks
const createTransporter = async () => {
  console.log('Creating Brevo email transporter');
  
  // Check if required email config exists
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('EMAIL_HOST, EMAIL_USER or EMAIL_PASS environment variables are missing');
    throw new Error('Missing Brevo email configuration. Please check your environment variables.');
  }
  
  console.log('Using Brevo configuration from environment variables');
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Send an email using Nodemailer
 * @param {Object} options Email options
 * @param {string} options.to Recipient email
 * @param {string} options.subject Email subject
 * @param {string} options.text Plain text version of email
 * @param {string} options.html HTML version of email
 * @param {string} options.from Sender email (defaults to configured from address)
 * @returns {Promise<Object>} Nodemailer response
 */
const sendEmail = async (options) => {
  try {
    console.log(`Attempting to send email to: ${options.to || options.email}`);
    
    // Get transporter - now async
    const transporter = await createTransporter();
    
    // Create message options with headers to help avoid spam filters
    const msg = {
      to: options.to || options.email,
      from: {
        name: 'Garden Planner App',
        address: options.from || process.env.EMAIL_FROM || 'noreply@gardenapp.com'
      },
      subject: options.subject,
      text: options.text || options.message,
      html: options.html || `<p>${options.message}</p>`,
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'Garden App Mailer',
        'List-Unsubscribe': `<mailto:unsubscribe@gardenapp.com?subject=Unsubscribe:${options.to || options.email}>`
      }
    };

    console.log(`Email details: Subject: "${options.subject}"`);
    
    // Send email
    const info = await transporter.sendMail(msg);
    
    console.log('Email sent successfully');
    console.log('Message ID:', info.messageId);
    
    // Check if this is an Ethereal test email and log the preview URL
    if (info.messageId && info.messageId.includes('ethereal')) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      // If it's a test account, append the preview URL to the info
      info.previewUrl = nodemailer.getTestMessageUrl(info);
    } else {
      console.log('Check your email provider to view the email');
    }
    
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    
    // More detailed error logging
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    
    if (error.command) {
      console.error(`Failed command: ${error.command}`);
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send a verification email
 * @param {string} email Recipient email
 * @param {string} token Verification token
 * @param {string} type Type of verification ('subscriber' or 'user')
 * @returns {Promise<Object>} SendGrid response
 */
const sendVerificationEmail = async (email, token, type = 'subscriber') => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verifyPath = type === 'subscriber' ? '/verify-email' : '/verify-account';
  const verifyUrl = `${baseUrl}${verifyPath}/${token}`;
  
  const subject = type === 'subscriber' 
    ? 'Garden App: Please verify your email subscription' 
    : 'Garden App: Please verify your account';
    
  const text = type === 'subscriber'
    ? `Thank you for subscribing to Garden App! To verify your email and start receiving gardening tips, please click this link: ${verifyUrl}`
    : `Thank you for creating an account with Garden App! To verify your email and access all features, please click this link: ${verifyUrl}`;
    
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Garden App</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p style="margin-top: 0;">Hi there,</p>
        <p>${type === 'subscriber' 
          ? 'Thank you for subscribing to our garden planning app!' 
          : 'Thank you for creating an account with our garden planning app!'}</p>
        <p>To verify your email address, please click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Verify My Email
          </a>
        </div>
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all;"><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>Happy Gardening!<br>The Garden App Team</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>If you didn't sign up for this service, you can safely ignore this email.</p>
        <p>© ${new Date().getFullYear()} Garden App. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject,
    text,
    html
  });
};

/**
 * Send a welcome email with downloadable content
 * @param {string} email Recipient email 
 * @param {string} resourceType Type of resource ('calendar' or 'recommendations')
 * @param {Object} resourceData Data for the resource
 * @returns {Promise<Object>} SendGrid response
 */
const sendResourceEmail = async (email, resourceType, resourceData) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  let subject, text, html;
  
  if (resourceType === 'calendar') {
    const { zone, calendar_url } = resourceData;
    
    subject = `Your Zone ${zone} Planting Calendar is Ready!`;
    
    text = `Thank you for using Garden App! Your custom planting calendar for Zone ${zone} is ready to download at: ${calendar_url}`;
    
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Garden App</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <h2 style="color: #4CAF50;">Your Planting Calendar is Ready!</h2>
          <p>Thank you for using our garden planning app! Your custom planting calendar for <strong>Zone ${zone}</strong> is ready.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${calendar_url}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Download Calendar
            </a>
          </div>
          <p>This calendar includes:</p>
          <ul>
            <li>Optimal planting times for vegetables, herbs, and flowers</li>
            <li>First and last frost date guidance</li>
            <li>Succession planting recommendations</li>
            <li>Seasonal tasks and reminders</li>
          </ul>
          <p>Happy Gardening!<br>The Garden App Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>You received this email because you requested a planting calendar from Garden App.</p>
          <p>To unsubscribe from future emails, <a href="${baseUrl}/unsubscribe">click here</a>.</p>
          <p>© ${new Date().getFullYear()} Garden App. All rights reserved.</p>
        </div>
      </div>
    `;
  } else if (resourceType === 'recommendations') {
    subject = 'Your Personalized Garden Recommendations';
    
    text = `Thank you for using Garden App! Your personalized garden recommendations are ready. Visit your account to view them or check the recommendations we've included in this email.`;
    
    // Create HTML from recommendations data
    const plantsList = resourceData.recommended_plants.map(plant => 
      `<li style="margin-bottom: 10px;">
        <strong>${plant.name}</strong> - ${plant.difficulty} to grow, needs ${plant.space_needed} space<br>
        <span style="font-size: 13px;">Days to maturity: ${plant.days_to_maturity} | Ideal for: ${plant.ideal_for}</span>
      </li>`
    ).join('');
    
    const tipsList = resourceData.seasonal_tips.map(tip => 
      `<li style="margin-bottom: 5px;">${tip}</li>`
    ).join('');
    
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Garden App</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <h2 style="color: #4CAF50;">Your Garden Recommendations</h2>
          <p>Thank you for using our garden planning app! Based on your preferences, here are your personalized plant recommendations:</p>
          
          <h3 style="color: #4CAF50; margin-top: 25px;">Recommended Plants</h3>
          <ul style="padding-left: 20px;">
            ${plantsList}
          </ul>
          
          <h3 style="color: #4CAF50; margin-top: 25px;">Seasonal Tips</h3>
          <ul style="padding-left: 20px;">
            ${tipsList}
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/garden/plan" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Plan Your Garden Now
            </a>
          </div>
          
          <p>Happy Gardening!<br>The Garden App Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>You received this email because you requested garden recommendations from Garden App.</p>
          <p>To unsubscribe from future emails, <a href="${baseUrl}/unsubscribe">click here</a>.</p>
          <p>© ${new Date().getFullYear()} Garden App. All rights reserved.</p>
        </div>
      </div>
    `;
  }
  
  return sendEmail({
    to: email,
    subject,
    text,
    html
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendResourceEmail
};