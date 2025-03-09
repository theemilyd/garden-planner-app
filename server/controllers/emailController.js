const EmailSubscriber = require('../models/EmailSubscriber');
const User = require('../models/User');
const crypto = require('crypto');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

// Import email and PDF services
const { sendEmail, sendVerificationEmail, sendResourceEmail } = require('../services/email-service');
const { generatePlantingCalendar } = require('../services/pdf-service');

// Subscribe to newsletter with email only
exports.subscribeToNewsletter = async (req, res) => {
  try {
    const { email, source, utm_source, utm_medium, utm_campaign, marketing_consent = true } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an email address',
      });
    }

    // Check if email already exists as subscriber
    let subscriber = await EmailSubscriber.findOne({ email });

    if (subscriber) {
      // If already verified, just update preferences
      if (subscriber.verified) {
        return res.status(200).json({
          status: 'success',
          message: 'You are already subscribed to our newsletter',
        });
      }
      
      // If not verified, resend verification email
      const verificationToken = subscriber.createVerificationToken();
      await subscriber.save({ validateBeforeSave: false });

      // Send verification email
      await sendVerificationEmail(subscriber.email, verificationToken, 'subscriber');
      
      return res.status(200).json({
        status: 'success',
        message: 'Verification email resent. Please check your inbox.',
      });
    }

    // Create new subscriber
    subscriber = await EmailSubscriber.create({
      email,
      source: source || 'homepage',
      marketing_consent,
      utm_parameters: {
        source: utm_source,
        medium: utm_medium,
        campaign: utm_campaign,
      },
    });

    // Generate verification token
    const verificationToken = subscriber.createVerificationToken();
    await subscriber.save({ validateBeforeSave: false });

    // Send verification email
    await sendVerificationEmail(subscriber.email, verificationToken, 'subscriber');

    res.status(201).json({
      status: 'success',
      message: 'Thank you for subscribing! Please check your email to verify your subscription.',
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Verify subscriber email
exports.verifySubscriberEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find subscriber with token
    const subscriber = await EmailSubscriber.findOne({
      verification_token: hashedToken,
      verification_token_expires: { $gt: Date.now() },
    });

    if (!subscriber) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired',
      });
    }

    // Update subscriber
    subscriber.verified = true;
    subscriber.verification_token = undefined;
    subscriber.verification_token_expires = undefined;
    await subscriber.save();

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully! You are now subscribed to our newsletter.',
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Unsubscribe from newsletter
exports.unsubscribeFromNewsletter = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find subscriber with token
    const subscriber = await EmailSubscriber.findOne({
      unsubscribe_token: hashedToken,
    });

    if (!subscriber) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid unsubscribe link',
      });
    }

    // Update subscriber or remove completely based on preference
    // Option 1: Keep record but mark as unsubscribed
    subscriber.preferences = {
      weekly_tips: false,
      product_updates: false,
      seasonal_alerts: false,
    };
    await subscriber.save();

    res.status(200).json({
      status: 'success',
      message: 'You have been successfully unsubscribed from our newsletter.',
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Update newsletter preferences for existing user
exports.updateNewsletterPreferences = async (req, res) => {
  try {
    const { weekly_tips, product_updates, seasonal_alerts } = req.body;
    
    // For logged-in users
    if (req.user) {
      const user = await User.findById(req.user.id);
      
      user.newsletter_subscription.preferences = {
        weekly_tips: weekly_tips !== undefined ? weekly_tips : user.newsletter_subscription.preferences.weekly_tips,
        product_updates: product_updates !== undefined ? product_updates : user.newsletter_subscription.preferences.product_updates,
        seasonal_alerts: seasonal_alerts !== undefined ? seasonal_alerts : user.newsletter_subscription.preferences.seasonal_alerts,
      };
      
      if (weekly_tips === false && product_updates === false && seasonal_alerts === false) {
        user.newsletter_subscription.subscribed = false;
      } else {
        user.newsletter_subscription.subscribed = true;
      }
      
      await user.save();
      
      return res.status(200).json({
        status: 'success',
        message: 'Newsletter preferences updated successfully',
        data: {
          preferences: user.newsletter_subscription.preferences,
        },
      });
    }
    
    // For email subscribers (not logged in)
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide your email address',
      });
    }
    
    const subscriber = await EmailSubscriber.findOne({ email });
    if (!subscriber) {
      return res.status(404).json({
        status: 'fail',
        message: 'Subscriber not found',
      });
    }
    
    subscriber.preferences = {
      weekly_tips: weekly_tips !== undefined ? weekly_tips : subscriber.preferences.weekly_tips,
      product_updates: product_updates !== undefined ? product_updates : subscriber.preferences.product_updates,
      seasonal_alerts: seasonal_alerts !== undefined ? seasonal_alerts : subscriber.preferences.seasonal_alerts,
    };
    
    await subscriber.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Newsletter preferences updated successfully',
      data: {
        preferences: subscriber.preferences,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Convert email subscriber to full user during signup
exports.convertSubscriberToUser = async (userId, email) => {
  try {
    const subscriber = await EmailSubscriber.findOne({ email });
    
    if (subscriber) {
      subscriber.converted_to_user = true;
      subscriber.user_id = userId;
      await subscriber.save();
      
      // Update the user to maintain newsletter preferences
      const user = await User.findById(userId);
      user.newsletter_subscription = {
        subscribed: true,
        preferences: subscriber.preferences,
      };
      
      // Generate unsubscribe token for the user
      const unsubscribeToken = crypto.randomBytes(32).toString('hex');
      user.newsletter_subscription.unsubscribe_token = crypto
        .createHash('sha256')
        .update(unsubscribeToken)
        .digest('hex');
        
      await user.save();
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error converting subscriber to user:', error);
    return false;
  }
};


// Get downloadable planting calendar by providing email
exports.getPlantingCalendar = async (req, res) => {
  try {
    console.log('Calendar request received with body:', JSON.stringify(req.body));
    
    const { email, hardiness_zone, marketing_consent = true } = req.body;
    
    if (!email) {
      console.log('Missing email in request');
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide your email address'
      });
    }
    
    console.log(`Processing planting calendar request for email: ${email}, zone: ${hardiness_zone}`);
    
    // Check if already subscribed - wrap in try/catch to proceed even if DB is not available
    let subscriber = null;
    let isNewSubscriber = false;
    
    try {
      subscriber = await EmailSubscriber.findOne({ email });
      
      if (!subscriber) {
        console.log(`Creating new subscriber for email: ${email}`);
        // Create new subscriber
        subscriber = await EmailSubscriber.create({
          email,
          source: 'planting_calendar',
          marketing_consent,
          preferences: {
            weekly_tips: marketing_consent,
            product_updates: marketing_consent,
            seasonal_alerts: marketing_consent
          }
        });
        isNewSubscriber = true;
        
        // Generate verification token
        const verificationToken = subscriber.createVerificationToken();
        // Generate unsubscribe token
        const unsubscribeToken = subscriber.createUnsubscribeToken();
        await subscriber.save({ validateBeforeSave: false });
        
        // Send verification email - we'll do this in parallel
        sendVerificationEmail(subscriber.email, verificationToken, 'subscriber')
          .then(() => console.log('Verification email sent successfully'))
          .catch(err => console.error('Error sending verification email:', err));
      }
    } catch (dbError) {
      // Continue even if database operations fail
      console.error('Database operation failed, but continuing with calendar generation:', dbError.message);
    }
    
    // Determine zone
    const zone = hardiness_zone || '7b'; // Default to 7b if no zone provided
    
    // Create PDF directory - ensure it exists
    const publicDir = path.join(__dirname, '..', 'public');
    const publicDownloadsDir = path.join(publicDir, 'downloads');
    
    // Make directories synchronously with proper error handling
    try {
      if (!fs.existsSync(publicDir)) {
        console.log(`Creating public directory: ${publicDir}`);
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      if (!fs.existsSync(publicDownloadsDir)) {
        console.log(`Creating downloads directory: ${publicDownloadsDir}`);
        fs.mkdirSync(publicDownloadsDir, { recursive: true });
      }
    } catch (dirError) {
      console.error('Error creating directories:', dirError);
      // We'll continue, but log the error
    }
    
    // Generate the PDF filename with a timestamp to make it unique
    const timestamp = new Date().getTime();
    const filename = `planting-calendar-${zone}-${timestamp}.pdf`;
    const pdfPath = path.join(publicDownloadsDir, filename);
    
    console.log(`PDF will be generated at: ${pdfPath}`);
    
    // Create the PDF calendar
    try {
      console.log('Starting PDF generation...');
      
      // Make sure the directory exists
      try {
        if (!fs.existsSync(publicDir)) {
          console.log(`Creating public directory: ${publicDir}`);
          fs.mkdirSync(publicDir, { recursive: true });
        }
        
        if (!fs.existsSync(publicDownloadsDir)) {
          console.log(`Creating downloads directory: ${publicDownloadsDir}`);
          fs.mkdirSync(publicDownloadsDir, { recursive: true });
        }
      } catch (dirError) {
        console.error('Error creating directories:', dirError);
      }
      
      // Generate the calendar PDF using HTML-to-PDF service
      try {
        console.log('Using alternative PDF generation approach...');
        
        // Import html-pdf-service as an alternative approach
        const htmlPdfService = require('../services/html-pdf-service');
        
        // Create minimal calendar HTML
        const minimalCalendarHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Garden Planting Calendar - Zone ${zone}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              h1 { color: #4CAF50; margin-bottom: 20px; }
              .calendar { border: 1px solid #ddd; width: 100%; border-collapse: collapse; }
              .calendar th { background-color: #4CAF50; color: white; padding: 8px; text-align: center; }
              .calendar td { border: 1px solid #ddd; padding: 8px; text-align: center; }
              .indoor { background-color: #b3e0ff; }
              .outdoor { background-color: #b3ffb3; }
            </style>
          </head>
          <body>
            <h1>Zone ${zone} Planting Calendar</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            
            <table class="calendar">
              <tr>
                <th>Plant</th>
                <th>Jan</th><th>Feb</th><th>Mar</th><th>Apr</th><th>May</th><th>Jun</th>
                <th>Jul</th><th>Aug</th><th>Sep</th><th>Oct</th><th>Nov</th><th>Dec</th>
              </tr>
              <tr>
                <td>Tomatoes</td>
                <td></td><td class="indoor">Start</td><td class="indoor">Start</td>
                <td class="outdoor">Plant</td><td class="outdoor">Plant</td><td></td>
                <td></td><td></td><td></td><td></td><td></td><td></td>
              </tr>
              <tr>
                <td>Lettuce</td>
                <td></td><td class="indoor">Start</td><td class="outdoor">Sow</td>
                <td class="outdoor">Sow</td><td class="outdoor">Sow</td><td></td>
                <td></td><td class="outdoor">Sow</td><td class="outdoor">Sow</td>
                <td></td><td></td><td></td>
              </tr>
              <tr>
                <td>Carrots</td>
                <td></td><td></td><td class="outdoor">Sow</td>
                <td class="outdoor">Sow</td><td class="outdoor">Sow</td><td></td>
                <td></td><td class="outdoor">Sow</td><td></td>
                <td></td><td></td><td></td>
              </tr>
            </table>
            
            <div style="margin-top: 20px;">
              <p><strong>Legend:</strong></p>
              <div style="margin: 5px 0;">
                <span style="display: inline-block; width: 20px; height: 20px; background-color: #b3e0ff; margin-right: 10px;"></span>
                Start seeds indoors
              </div>
              <div style="margin: 5px 0;">
                <span style="display: inline-block; width: 20px; height: 20px; background-color: #b3ffb3; margin-right: 10px;"></span>
                Direct sow or transplant outdoors
              </div>
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; color: #666;">Note: This calendar shows general planting times for Zone ${zone}. Adjust based on your specific microclimate and local conditions.</p>
          </body>
          </html>
        `;
        
        // Convert HTML to PDF
        const pdfBuffer = await htmlPdfService.createPdfBuffer(minimalCalendarHtml, {
          landscape: true,
          format: 'A4',
          printBackground: true,
          margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
        });
        
        // Write PDF to file
        console.log(`Writing minimal calendar to: ${pdfPath}`);
        fs.writeFileSync(pdfPath, pdfBuffer);
      } catch (error) {
        console.error('Error generating minimal calendar PDF:', error);
        throw error;
      }
      
      // Verify the file exists and has content
      if (fs.existsSync(pdfPath)) {
        const stats = fs.statSync(pdfPath);
        console.log(`Final PDF file created: ${pdfPath}, size: ${stats.size} bytes`);
        
        if (stats.size < 1000) {
          console.warn('Warning: PDF file is very small, might be empty or corrupted');
        }
      } else {
        throw new Error(`PDF file does not exist after generation: ${pdfPath}`);
      }
      
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      
      // Create a basic PDF as an emergency fallback
      try {
        console.log('Creating emergency minimal PDF...');
        
        // Import html-pdf-service
        const htmlPdfService = require('../services/html-pdf-service');
        
        // Create a very simple HTML for the PDF
        const emergencyHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Garden Planting Calendar</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { color: #4CAF50; }
              .note { margin-top: 20px; padding: 15px; border-left: 4px solid #4CAF50; background-color: #f9f9f9; }
            </style>
          </head>
          <body>
            <h1>Garden Planting Calendar</h1>
            <p><strong>Zone:</strong> ${zone}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            
            <div class="note">
              <p>This is a basic planting calendar for Zone ${zone}. For a more detailed calendar, please try again later.</p>
              <p>General planting guidelines for Zone ${zone}:</p>
              <ul>
                <li>Last frost date: typically mid-April to early May</li>
                <li>First frost date: typically mid-October to early November</li>
                <li>Growing season: approximately 180 days</li>
              </ul>
            </div>
          </body>
          </html>
        `;
        
        // Convert HTML to PDF
        const pdfBuffer = await htmlPdfService.createPdfBuffer(emergencyHtml, {
          format: 'letter',
          margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
        });
        
        // Write the buffer to file
        fs.writeFileSync(pdfPath, pdfBuffer);
        console.log('Emergency minimal PDF created via html-pdf-service');
      } catch (emergencyError) {
        console.error('Failed to create emergency PDF:', emergencyError);
        
        // Last resort - create an ultra-minimal PDF directly with PDFKit
        try {
          console.log('Creating ultra-minimal PDF directly with PDFKit...');
          
          // Create the most basic PDF possible
          const PDFDocument = require('pdfkit');
          const doc = new PDFDocument({
            size: 'letter',
            margin: 50
          });
          
          // Create write stream
          const writeStream = fs.createWriteStream(pdfPath);
          
          // Pipe content to file
          doc.pipe(writeStream);
          
          // Add minimal content (just text)
          doc.fontSize(24).text('Garden Planting Calendar', { align: 'center' });
          doc.moveDown();
          doc.fontSize(14).text(`Zone: ${zone}`);
          doc.text(`Generated: ${new Date().toLocaleDateString()}`);
          
          // Finalize PDF
          doc.end();
          
          // Wait for write to complete
          await new Promise((resolve) => {
            writeStream.on('finish', resolve);
          });
          
          console.log('Ultra-minimal PDF created with PDFKit');
        } catch (minimalError) {
          console.error('Failed to create minimal PDF:', minimalError);
          // At this point we're completely out of options
        }
      }
    }
    
    // Create the public URL for the file
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const fileUrl = `${baseUrl}/downloads/${filename}`;
    console.log(`Calendar URL: ${fileUrl}`);
    
    // Create calendar data object for the email
    const calendar = {
      zone,
      calendar_url: fileUrl,
      filename
    };
    
    // Send the email with the calendar
    let emailSent = false;
    let emailPreviewUrl = "https://mailtrap.io/";
    
    try {
      console.log(`Sending calendar email to: ${email}`);
      
      // Use our simple email service with Brevo
      const emailService = require('../services/simple-email-service');
      
      // First verify the PDF exists and has content
      if (fs.existsSync(pdfPath)) {
        const stats = fs.statSync(pdfPath);
        console.log(`PDF file found at: ${pdfPath}, size: ${stats.size} bytes`);
        
        if (stats.size < 100) {
          throw new Error(`PDF file is too small (${stats.size} bytes). Cannot send empty PDF.`);
        }
      } else {
        throw new Error(`PDF file not found at: ${pdfPath}`);
      }
      
      // Get absolute path to ensure no path resolution issues
      const absolutePdfPath = path.resolve(pdfPath);
      console.log(`Using absolute path for PDF attachment: ${absolutePdfPath}`);
      
      // Let's read the file to make extra sure it's valid
      try {
        const fileContent = fs.readFileSync(absolutePdfPath);
        console.log(`Successfully read PDF file, content length: ${fileContent.length} bytes`);
        
        // Check PDF header
        const isPdf = fileContent.toString('ascii', 0, 5) === '%PDF-';
        if (!isPdf) {
          console.error('ERROR: File does not have PDF header');
          console.error('First 20 bytes:', fileContent.toString('hex', 0, 20));
          throw new Error('File does not appear to be a valid PDF');
        }
        console.log('File validated as a proper PDF');
        
        // Send the email with the PDF attachment (using direct attachment approach)
        const emailResult = await emailService.sendEmail({
          to: email,
          subject: `Your Garden Planting Calendar (Zone ${zone})`,
          text: `Your personalized planting calendar for Zone ${zone} is ready. You can view it online or check the attached PDF.`,
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Your Garden Planting Calendar</title>
            </head>
            <body style="font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; color: #333333;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">Your Garden Planting Calendar</h1>
                </div>
                
                <div style="padding: 20px; border: 1px solid #dddddd; border-top: none;">
                  <h2 style="color: #333333; margin-top: 0;">Your Custom Calendar is Ready!</h2>
                  
                  <p>Thank you for using our garden planning app! As requested, we've attached your custom planting calendar for <strong>Zone ${zone}</strong>.</p>
                  
                  <p>This calendar includes:</p>
                  <ul>
                    <li>Your specific plants and planting schedule</li>
                    <li>Customized monthly planting and harvesting tasks</li>
                    <li>Visual calendar with color-coded garden activities</li>
                    <li>First and last frost date guidance</li>
                  </ul>
                  
                  <div style="background-color: #f8f8f8; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Important:</strong> The PDF calendar is attached to this email. If you don't see it, please check your downloads folder or spam folder.</p>
                  </div>
                  
                  <p style="margin-top: 20px;">Happy Gardening!<br>The Garden App Team</p>
                </div>
                
                <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666666;">
                  <p>This email was sent because you requested to export your custom planting calendar.</p>
                  <p>© ${new Date().getFullYear()} Garden App. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `,
          attachments: [
            {
              filename: `garden-planting-calendar-zone-${zone}.pdf`,
              content: fs.readFileSync(absolutePdfPath),
              contentType: 'application/pdf'
            }
          ]
        });
        
        console.log('Email sent successfully:', emailResult.messageId);
        emailSent = true;
      } catch (fileError) {
        console.error(`Error reading PDF file: ${fileError.message}`);
        throw fileError;
      }
      
    } catch (emailError) {
      console.error('Error sending calendar email:', emailError);
      // Continue even if email fails
    }
    
    // Respond to the client
    res.status(200).json({
      status: 'success',
      message: isNewSubscriber ? 
        'Thank you for subscribing! Your planting calendar has been emailed to you.' : 
        'Your planting calendar has been emailed to you.',
      data: {
        calendar,
        email_sent: emailSent,
        email_address: email,
        download_url: fileUrl
      }
    });
  } catch (error) {
    console.error('Error generating calendar:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Helper method to get planting calendar data for a zone
const getCalendarData = (zone) => {
  return {
    zone,
    calendar_url: `${process.env.FRONTEND_URL}/downloads/planting-calendar-${zone}.pdf`
  };
};

// Access personalized garden recommendations (second feature behind email wall)
exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    const { email, zone, garden_size, experience_level, preferences, marketing_consent = true } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide your email address'
      });
    }
    
    // Check if already subscribed
    let subscriber = await EmailSubscriber.findOne({ email });
    let isNewSubscriber = false;
    
    if (!subscriber) {
      // Create new subscriber
      subscriber = await EmailSubscriber.create({
        email,
        source: 'garden_recommendations',
        preferences: {
          weekly_tips: true,
          product_updates: true,
          seasonal_alerts: true
        }
      });
      isNewSubscriber = true;
      
      // Generate verification token
      const verificationToken = subscriber.createVerificationToken();
      // Generate unsubscribe token
      const unsubscribeToken = subscriber.createUnsubscribeToken();
      await subscriber.save({ validateBeforeSave: false });
      
      // Send verification email
      await sendVerificationEmail(subscriber.email, verificationToken, 'subscriber');
    }
    
    // Generate personalized recommendations based on inputs
    const recommendations = generateRecommendations(zone, garden_size, experience_level, preferences);
    
    // Send the recommendations via email as well
    try {
      await sendResourceEmail(email, 'recommendations', recommendations);
    } catch (emailError) {
      console.error('Error sending recommendations email:', emailError);
      // Continue even if email fails
    }
    
    res.status(200).json({
      status: 'success',
      message: isNewSubscriber ? 
        'Thank you for subscribing! Your garden recommendations are ready.' : 
        'Your garden recommendations are ready.',
      data: {
        recommendations,
        email_verified: subscriber.verified
      }
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Generate personalized recommendations
const generateRecommendations = (zone, gardenSize, experienceLevel, preferences) => {
  // This would actually generate the real recommendations based on user inputs
  // For now returning placeholder data
  
  // Adjust recommendations based on experience level
  const difficulty = experienceLevel === 'beginner' ? 'easy' : 
                    experienceLevel === 'intermediate' ? 'moderate' : 'advanced';
  
  // Adjust based on garden size
  const spaceNeeded = gardenSize === 'small' ? 'compact' : 
                     gardenSize === 'medium' ? 'medium space' : 'space-intensive';
                     
  return {
    recommended_plants: [
      {
        name: 'Bush Beans',
        difficulty: 'easy',
        space_needed: 'compact',
        days_to_maturity: '45-60',
        ideal_for: 'beginners',
        companion_plants: ['Carrots', 'Cucumber']
      },
      {
        name: 'Cherry Tomatoes',
        difficulty: 'easy',
        space_needed: 'medium',
        days_to_maturity: '60-80',
        ideal_for: 'beginners',
        companion_plants: ['Basil', 'Marigolds']
      },
      {
        name: 'Zucchini',
        difficulty: 'easy',
        space_needed: 'medium',
        days_to_maturity: '40-55',
        ideal_for: 'high-yield',
        companion_plants: ['Nasturtium', 'Corn']
      }
    ],
    garden_layout_suggestions: [
      {
        name: 'Beginner Square Foot Garden',
        description: 'A simple layout for easy success',
        layout_url: `${process.env.FRONTEND_URL}/layouts/beginner-square-foot.jpg`
      },
      {
        name: 'Companion Planting Layout',
        description: 'Maximize growth with companion planting',
        layout_url: `${process.env.FRONTEND_URL}/layouts/companion-layout.jpg`
      }
    ],
    seasonal_tips: [
      'Start with transplants for quicker results',
      'Mulch well to reduce watering needs',
      'Consider a simple drip irrigation system'
    ]
  };
};