/**
 * Simple Email Service
 * A straightforward email service that sends emails with PDF attachments
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

/**
 * Creates a transporter for sending emails using Brevo exclusively
 * @returns {Object} Nodemailer transporter
 */
const createTransporter = () => {
  // Check if required email config exists
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('EMAIL_HOST, EMAIL_USER or EMAIL_PASS environment variables are missing');
    throw new Error('Missing Brevo email configuration. Please check your environment variables.');
  }
  
  console.log('Creating Brevo email transporter');
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
 * Send an email
 * @param {Object} options Email options
 * @param {string} options.to Recipient email
 * @param {string} options.subject Email subject
 * @param {string} options.text Text content
 * @param {string} options.html HTML content
 * @param {string} options.attachmentPath Optional path to attachment
 * @param {Array} options.attachments Optional array of nodemailer attachment objects
 * @returns {Promise<Object>} Email send result
 */
const sendEmail = async (options) => {
  try {
    console.log(`Sending email to: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    
    const transporter = createTransporter();
    
    const emailOptions = {
      from: options.from || '"Garden App" <no-reply@gardenapp.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };
    
    // Check if we have any attachments
    const hasDirectAttachments = options.attachments && Array.isArray(options.attachments) && options.attachments.length > 0;
    const hasPathAttachment = options.attachmentPath && fs.existsSync(options.attachmentPath);
    
    console.log('Attachment status:', {
      hasDirectAttachments,
      directAttachmentCount: hasDirectAttachments ? options.attachments.length : 0,
      hasPathAttachment,
      attachmentPath: hasPathAttachment ? options.attachmentPath : 'none'
    });
    
    // If both attachment methods provided, log this unusual situation
    if (hasDirectAttachments && hasPathAttachment) {
      console.log('Both direct attachments and attachment path provided. Direct attachments will be used.');
    }
    
    let attachmentsToUse = [];
    
    // First check if direct attachments are provided
    if (hasDirectAttachments) {
      console.log(`Processing ${options.attachments.length} pre-configured attachments`);
      
      // Validate each attachment to ensure it's properly configured
      for (let index = 0; index < options.attachments.length; index++) {
        const attachment = options.attachments[index];
        console.log(`\nValidating attachment ${index + 1}:`);
        
        // Log the attachment details for debugging
        console.log(`- Filename: ${attachment.filename || 'unnamed'}`);
        console.log(`- Content type: ${attachment.contentType || 'unspecified'}`);
        
        // For Buffer attachments, validate size and content
        if (Buffer.isBuffer(attachment.content)) {
          console.log(`- Content size: ${attachment.content.length} bytes`);
          
          // Check if content is a valid PDF (if it claims to be)
          if (attachment.contentType === 'application/pdf' || 
              attachment.filename?.toLowerCase().endsWith('.pdf')) {
            // Verify PDF header
            const header = attachment.content.slice(0, 5).toString('ascii');
            const isPdf = header === '%PDF-';
            
            if (!isPdf) {
              console.error(`WARNING: Attachment ${index + 1} claims to be PDF but doesn't have proper header`);
              console.error(`- Header bytes: ${header}`);
              console.error(`- First 20 bytes hex: ${attachment.content.slice(0, 20).toString('hex')}`);
              
              // Try to recover if possible - content might be encoded differently
              if (attachment.encoding === 'base64') {
                try {
                  console.log('Trying to decode base64 content...');
                  const decodedContent = Buffer.from(attachment.content.toString(), 'base64');
                  const decodedHeader = decodedContent.slice(0, 5).toString('ascii');
                  if (decodedHeader === '%PDF-') {
                    console.log('Successfully decoded base64 content as PDF');
                    attachment.content = decodedContent;
                    attachment.encoding = 'binary';
                  } else {
                    console.error('Content is not a valid PDF after base64 decoding');
                  }
                } catch (decodeError) {
                  console.error('Failed to decode potential base64 content:', decodeError.message);
                }
              }
            } else {
              console.log(`- Valid PDF header confirmed`);
            }
          }
          
          // Add to our validated attachments
          if (attachment.content.length > 100) {
            attachmentsToUse.push(attachment);
            console.log(`- Attachment ${index + 1} validated and will be used`);
          } else {
            console.error(`- Attachment ${index + 1} skipped: Content too small (${attachment.content.length} bytes)`);
          }
        } else if (typeof attachment.content === 'string') {
          console.log(`- Content is string, length: ${attachment.content.length} characters`);
          
          // If it's a base64 string claiming to be PDF, try to validate
          if ((attachment.contentType === 'application/pdf' || 
               attachment.filename?.toLowerCase().endsWith('.pdf')) && 
              attachment.encoding === 'base64') {
            try {
              const decodedContent = Buffer.from(attachment.content, 'base64');
              const header = decodedContent.slice(0, 5).toString('ascii');
              if (header === '%PDF-') {
                console.log(`- Valid PDF header confirmed after base64 decoding`);
                attachmentsToUse.push({
                  ...attachment,
                  content: decodedContent,
                  encoding: 'binary'
                });
                console.log(`- Attachment ${index + 1} converted from base64 string to buffer and will be used`);
              } else {
                console.error(`- Invalid PDF: base64 decoded content does not have PDF header`);
                // Add it anyway, but might not work
                attachmentsToUse.push(attachment);
              }
            } catch (decodeError) {
              console.error(`- Error decoding base64 string: ${decodeError.message}`);
              // Add it anyway
              attachmentsToUse.push(attachment);
            }
          } else {
            // Not a PDF or not base64, just add it
            attachmentsToUse.push(attachment);
          }
        } else if (attachment.path) {
          console.log(`- Using file path: ${attachment.path}`);
          
          // Check if file exists
          if (fs.existsSync(attachment.path)) {
            const stats = fs.statSync(attachment.path);
            console.log(`- File size: ${stats.size} bytes`);
            
            if (stats.size < 100) {
              console.error(`- Attachment file is too small (${stats.size} bytes)`);
            } else {
              // For PDF files, validate the content
              if (attachment.contentType === 'application/pdf' || 
                  attachment.path.toLowerCase().endsWith('.pdf')) {
                try {
                  const fileHeader = fs.readFileSync(attachment.path, {
                    encoding: 'ascii', 
                    flag: 'r',
                    length: 5
                  });
                  
                  if (fileHeader === '%PDF-') {
                    console.log(`- Valid PDF header confirmed from file`);
                    // Read the whole file content for more reliable attachment
                    const fileContent = fs.readFileSync(attachment.path);
                    attachmentsToUse.push({
                      filename: attachment.filename || path.basename(attachment.path),
                      content: fileContent,
                      contentType: 'application/pdf',
                      encoding: 'binary'
                    });
                    console.log(`- Attachment ${index + 1} converted from path to buffer and will be used`);
                  } else {
                    console.error(`- Invalid PDF: file does not have PDF header`);
                    // Use path-based anyway as fallback
                    attachmentsToUse.push(attachment);
                  }
                } catch (readError) {
                  console.error(`- Error reading file: ${readError.message}`);
                  // Fall back to path-based attachment
                  attachmentsToUse.push(attachment);
                }
              } else {
                // Not a PDF, just use path-based
                attachmentsToUse.push(attachment);
              }
            }
          } else {
            console.error(`WARNING: Attachment file path doesn't exist: ${attachment.path}`);
          }
        } else {
          console.error(`WARNING: Attachment ${index + 1} has no content or path`);
        }
      }
      
      console.log(`\nFinal attachment count: ${attachmentsToUse.length} of ${options.attachments.length} provided`);
    }
    // Fall back to path-based attachment if no direct attachments
    else if (hasPathAttachment) {
      const stats = fs.statSync(options.attachmentPath);
      console.log(`Attaching file from path: ${options.attachmentPath}, size: ${stats.size} bytes`);
      
      if (stats.size < 100) {
        console.error(`Attachment file is too small (${stats.size} bytes), may be empty or corrupted`);
        throw new Error(`PDF file appears to be empty or corrupted (size: ${stats.size} bytes)`);
      }
      
      // Read the file to verify it's a valid PDF before attaching
      try {
        // Get absolute path to ensure no path resolution issues
        const absolutePath = path.resolve(options.attachmentPath);
        console.log(`Using absolute path for PDF: ${absolutePath}`);
        
        // Check if file exists and is readable
        fs.accessSync(absolutePath, fs.constants.R_OK);
        console.log(`File exists and is readable: ${absolutePath}`);
        
        // Read the file content
        const fileContent = fs.readFileSync(absolutePath, {encoding: null, flag: 'r'});
        console.log(`Successfully read file content of size: ${fileContent.length} bytes`);
        
        if (fileContent.length < 100) {
          console.error(`ERROR: File content too small (${fileContent.length} bytes)`);
          throw new Error(`File content too small (${fileContent.length} bytes)`);
        }
        
        // Verify PDF header
        const isPdf = fileContent.toString('ascii', 0, 5) === '%PDF-';
        if (!isPdf) {
          console.error('ERROR: File does not have PDF header');
          console.error('First 20 bytes:', fileContent.toString('hex', 0, 20));
          throw new Error('File does not appear to be a valid PDF');
        }
        
        console.log('File validated as a proper PDF');
        
        // Create a more descriptive filename based on available data
        let filename = 'garden-planting-calendar';
        if (options.zone) {
          filename += `-zone-${options.zone}`;
        }
        if (options.month && options.year) {
          const monthName = new Date(
            parseInt(options.year), 
            parseInt(options.month) - 1, 
            1
          ).toLocaleString('default', { month: 'long' });
          filename += `-${monthName}-${options.year}`;
        }
        filename += '.pdf';
        
        // Use a content-based attachment for reliability
        attachmentsToUse.push({
          filename: filename,
          content: fileContent,
          contentType: 'application/pdf',
          encoding: 'binary'
        });
        
        console.log(`Using buffer-based attachment with filename: ${filename}`);
      } catch (readError) {
        console.error(`Error validating PDF file: ${readError.message}`);
        throw new Error(`Cannot validate PDF file: ${readError.message}`);
      }
    } else if (options.attachmentPath) {
      console.warn(`Attachment file not found: ${options.attachmentPath}`);
      throw new Error(`Attachment file not found: ${options.attachmentPath}`);
    }
    
    // Add the validated attachments to the email options
    if (attachmentsToUse.length > 0) {
      emailOptions.attachments = attachmentsToUse;
      console.log(`Adding ${attachmentsToUse.length} validated attachments to email`);
      
      // Print details of each attachment
      attachmentsToUse.forEach((attachment, index) => {
        const contentType = attachment.contentType || 'unknown';
        const contentSize = Buffer.isBuffer(attachment.content) 
                          ? `${attachment.content.length} bytes` 
                          : attachment.path
                            ? `path: ${attachment.path}`
                            : `${typeof attachment.content === 'string' ? attachment.content.length : 'unknown'} chars`;
                            
        console.log(`Attachment ${index + 1}: ${attachment.filename || 'unnamed'} (${contentType}) - ${contentSize}`);
      });
    } else {
      console.log(`No attachments to send - email will be sent without attachments`);
    }
    
    // Send the email with Nodemailer
    console.log('Sending email via Nodemailer...');
    const result = await transporter.sendMail(emailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', result.messageId);
    
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send a calendar email with PDF attachment
 * @param {string} email Recipient email
 * @param {string} pdfPath Path to the PDF file
 * @param {Object} calendarData Calendar data object
 * @returns {Promise<Object>} Email send result
 */
const sendCalendarEmail = async (email, pdfPath, calendarData) => {
  const { zone, calendar_url } = calendarData;
  
  // Create a clear, organized email that's less likely to be flagged as spam
  return sendEmail({
    to: email,
    subject: `Your Garden Planting Calendar (Zone ${zone})`,
    text: `Your personalized planting calendar for Zone ${zone} is ready. You can view it online or check the attached PDF.`,
    zone, // Pass zone for the attachment filename
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
    attachmentPath: pdfPath
  });
};

module.exports = {
  sendEmail,
  sendCalendarEmail
};