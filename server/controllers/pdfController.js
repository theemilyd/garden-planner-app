const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');
const Plant = require('../models/Plant');
const Zone = require('../models/Zone');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Generate a monthly planting calendar PDF
exports.generateMonthlyCalendar = async (req, res) => {
  try {
    const { month, year, plants, zoneId } = req.body;
    
    if (!month || !year || !plants || !zoneId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide month, year, plants array, and zoneId',
      });
    }
    
    // Check if premium feature
    const user = await User.findById(req.user.id);
    if (user.subscription.tier === 'free') {
      return res.status(403).json({
        status: 'fail',
        message: 'PDF calendar export is a premium feature. Please upgrade your subscription.',
      });
    }
    
    // Get zone information
    const zone = await Zone.findById(zoneId);
    if (!zone) {
      return res.status(404).json({
        status: 'fail',
        message: 'Zone not found',
      });
    }
    
    // Get plant information
    const plantIds = plants.map(plant => plant.id);
    const plantData = await Plant.find({ _id: { $in: plantIds } });
    
    if (plantData.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No valid plants found',
      });
    }
    
    // Create a temporary file path
    const tempFilePath = path.join(os.tmpdir(), `garden-calendar-${month}-${year}-${Date.now()}.pdf`);
    
    // Generate the PDF using HTML-to-PDF service
    const htmlPdfService = require('../services/html-pdf-service');
    
    // Create simple HTML for the calendar since we don't have the actual calendar HTML here
    const calendarHtml = createCalendarHtml(month, year, plantData, zone, user);
    
    // Generate PDF from HTML
    const pdfBuffer = await htmlPdfService.createPdfBuffer(calendarHtml, {
      landscape: true,
      format: 'A4',
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      printBackground: true
    });
    
    // Write to file
    fs.writeFileSync(tempFilePath, pdfBuffer);
    
    // Stream the file to the client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=garden-calendar-${month}-${year}.pdf`);
    
    const fileStream = fs.createReadStream(tempFilePath);
    fileStream.pipe(res);
    
    // Clean up the file after sending
    fileStream.on('end', () => {
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error('Error deleting temporary file:', err);
      });
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Generate an annual planting calendar PDF
exports.generateAnnualCalendar = async (req, res) => {
  try {
    const { year, plants, zoneId } = req.body;
    
    if (!year || !plants || !zoneId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide year, plants array, and zoneId',
      });
    }
    
    // Check if premium feature
    const user = await User.findById(req.user.id);
    if (user.subscription.tier === 'free') {
      return res.status(403).json({
        status: 'fail',
        message: 'PDF calendar export is a premium feature. Please upgrade your subscription.',
      });
    }
    
    // Annual calendar generation is not yet implemented
    res.status(200).json({
      status: 'success',
      message: 'Annual PDF calendar generation feature coming soon',
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Export monthly calendar to email
exports.emailMonthlyCalendar = async (req, res) => {
  try {
    console.log('Starting emailMonthlyCalendar process...');
    const { month, year, plants, zoneId, email } = req.body;
    
    // Log received parameters
    console.log(`Request parameters:`, {
      month, 
      year, 
      plantsCount: plants ? plants.length : 0,
      zoneId,
      email: email ? `${email.substring(0, 3)}...${email.split('@')[1]}` : 'undefined', // Log partial email for privacy
      hasHtmlContent: !!req.body.htmlContent,
      htmlContentLength: req.body.htmlContent ? req.body.htmlContent.length : 0
    });
    
    if (!month || !year || !plants || !zoneId || !email) {
      console.error('Missing required parameters');
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide month, year, plants array, zoneId, and email address',
      });
    }
    
    // Check if premium feature
    const user = await User.findById(req.user.id);
    console.log(`User subscription tier: ${user.subscription.tier}`);
    
    if (user.subscription.tier === 'free') {
      console.log('Free user attempting to access premium feature');
      return res.status(403).json({
        status: 'fail',
        message: 'Email calendar export is a premium feature. Please upgrade your subscription.',
      });
    }
    
    // Get zone information
    console.log(`Looking up zone with ID: ${zoneId}`);
    const zone = await Zone.findById(zoneId);
    if (!zone) {
      console.error(`Zone not found with ID: ${zoneId}`);
      return res.status(404).json({
        status: 'fail',
        message: 'Zone not found',
      });
    }
    console.log(`Found zone: ${zone.zone}`);
    
    // Get plant information
    const plantIds = plants.map(plant => plant.id);
    console.log(`Looking up ${plantIds.length} plants`);
    const plantData = await Plant.find({ _id: { $in: plantIds } });
    
    console.log(`Found ${plantData.length} plants out of ${plantIds.length} requested`);
    if (plantData.length === 0) {
      console.error('No valid plants found in database');
      return res.status(404).json({
        status: 'fail',
        message: 'No valid plants found',
      });
    }
    
    // Create a file in the public downloads directory
    const publicDir = path.join(__dirname, '..', 'public');
    const publicDownloadsDir = path.join(publicDir, 'downloads');
    
    // Make sure the directories exist
    console.log(`Ensuring directories exist:`);
    console.log(`- Public dir: ${publicDir}`);
    console.log(`- Downloads dir: ${publicDownloadsDir}`);
    
    if (!fs.existsSync(publicDir)) {
      console.log(`Creating public directory`);
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    if (!fs.existsSync(publicDownloadsDir)) {
      console.log(`Creating downloads directory`);
      fs.mkdirSync(publicDownloadsDir, { recursive: true });
    }
    
    // Create a unique filename with timestamp
    const timestamp = new Date().getTime();
    const monthName = new Date(year, month-1, 1).toLocaleString('default', { month: 'long' });
    const filename = `garden-calendar-${monthName}-${year}-${timestamp}.pdf`;
    const pdfPath = path.join(publicDownloadsDir, filename);
    
    console.log(`Generating custom calendar PDF at: ${pdfPath}`);
    
    // Use either provided HTML or generate PDF directly
    let pdfBuffer;
    let pdfGenerationMethod = 'unknown';
    
    if (req.body.htmlContent) {
      console.log("HTML content provided, using HTML-to-PDF conversion...");
      console.log(`HTML content excerpt: ${req.body.htmlContent.substring(0, 100)}...`);
      
      // Check HTML content for key calendar elements
      const hasCalendarClass = req.body.htmlContent.includes('planting-calendar');
      const hasHeaderClass = req.body.htmlContent.includes('calendar-header');
      const hasGridClass = req.body.htmlContent.includes('calendar-grid');
      
      console.log('HTML content checks:', {
        hasCalendarClass,
        hasHeaderClass,
        hasGridClass,
        contentLength: req.body.htmlContent.length
      });
      
      if (!hasCalendarClass || !hasHeaderClass || !hasGridClass) {
        console.warn('HTML content may be missing key calendar elements. Will try HTML-to-PDF anyway.');
      }
      
      // Import HTML-to-PDF service
      const htmlPdfService = require('../services/html-pdf-service');
      
      const options = {
        landscape: true, // Calendar view works better in landscape
        format: 'A4',
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        },
        printBackground: true,
        scale: 0.9 // Slightly scale down to ensure content fits
      };
      
      // Generate PDF from HTML content
      console.log(`Converting HTML content to PDF (${req.body.htmlContent.length} chars)...`);
      pdfBuffer = await htmlPdfService.createPdfBuffer(req.body.htmlContent, options);
      pdfGenerationMethod = 'html-to-pdf';
      console.log(`HTML-to-PDF conversion successful, buffer size: ${pdfBuffer.length} bytes`);
    } else {
      console.log("No HTML content provided, cannot generate PDF");
      throw new Error('HTML content is required for PDF generation');
    }
    
    // Verify the PDF buffer has content
    if (!pdfBuffer || pdfBuffer.length < 100) {
      console.error(`Generated PDF buffer is too small or empty: ${pdfBuffer ? pdfBuffer.length : 0} bytes`);
      throw new Error('Generated PDF is invalid or empty');
    }
    
    console.log(`Successfully generated PDF buffer (${pdfGenerationMethod} method), size: ${pdfBuffer.length} bytes`);
    
    // Write the buffer to file
    fs.writeFileSync(pdfPath, pdfBuffer);
    console.log(`PDF file written to disk: ${pdfPath}, size: ${pdfBuffer.length} bytes`);
    
    // Create the public URL for the file
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const fileUrl = `${baseUrl}/downloads/${filename}`;
    
    // Send the email with the PDF attachment
    try {
      // Import email service
      const emailService = require('../services/simple-email-service');
      
      // Verify the PDF buffer has content before attempting to send
      if (!pdfBuffer || pdfBuffer.length < 1000) {
        console.error(`Cannot send email with invalid PDF buffer: size=${pdfBuffer ? pdfBuffer.length : 0} bytes`);
        throw new Error('PDF generation failed or produced invalid content');
      }
      
      console.log(`Preparing to send email with PDF attachment of size ${pdfBuffer.length} bytes`);
      
      // Explicitly validate PDF buffer content
      const header = pdfBuffer.toString('ascii', 0, 5);
      if (header !== '%PDF-') {
        console.error(`Invalid PDF header in buffer: ${header}`);
        throw new Error('PDF buffer does not contain a valid PDF file');
      }
      
      console.log('PDF buffer header validation passed');
      
      // Create a readable filename for the attachment
      const attachmentFilename = `${monthName}-${year}-Garden-Calendar-Zone-${zone.zone}.pdf`;
      
      // Send email with attachment using the buffer directly
      const emailOptions = {
        to: email,
        subject: `Your Garden Planting Calendar - ${monthName} ${year} (Zone ${zone.zone})`,
        text: `Your personalized planting calendar for ${monthName} ${year} (Zone ${zone.zone}) is ready. It includes your custom plants and planting schedule.`,
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
                <h2 style="color: #333333; margin-top: 0;">Your ${monthName} ${year} Calendar is Ready!</h2>
                
                <p>Thank you for using our garden planning app! As requested, we've attached your custom garden calendar for <strong>${monthName} ${year}</strong> (Zone ${zone.zone}).</p>
                
                <p>This calendar includes:</p>
                <ul>
                  <li>Your ${plantData.length} selected plants and their planting schedule</li>
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
        // Primary attachment method - use direct buffer for reliability
        attachments: [
          {
            filename: attachmentFilename,
            content: pdfBuffer,
            contentType: 'application/pdf',
            encoding: 'binary'
          }
        ],
        // Fallback method - provide path to the file
        attachmentPath: pdfPath,
        // Additional metadata for email service
        zone: zone.zone,
        calendar_url: fileUrl
      };
      
      // Log attachment details
      console.log(`Email attachment prepared:`);
      console.log(`- Filename: ${attachmentFilename}`);
      console.log(`- Content type: application/pdf`);
      console.log(`- Buffer size: ${pdfBuffer.length} bytes`);
      console.log(`- File path (fallback): ${pdfPath}`);
      
      // Send the email
      const emailResult = await emailService.sendEmail(emailOptions);
      
      console.log(`Calendar email sent to ${email} with message ID: ${emailResult.messageId}`);
      
      // Return success response
      res.status(200).json({
        status: 'success',
        message: 'Your custom planting calendar has been emailed to you.',
        data: {
          email_sent: true,
          email_address: email,
          download_url: fileUrl,
          generation_method: pdfGenerationMethod
        }
      });
    } catch (emailError) {
      console.error('Error sending calendar email:', emailError);
      
      // Even if email fails, provide download link
      res.status(200).json({
        status: 'success',
        message: 'Calendar created but email sending failed. You can download it directly.',
        data: {
          email_sent: false,
          error: emailError.message,
          download_url: fileUrl,
          generation_method: pdfGenerationMethod
        }
      });
    }
  } catch (error) {
    console.error('Error in emailMonthlyCalendar:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Generate plant information sheet PDF
exports.generatePlantInfoSheet = async (req, res) => {
  try {
    const { plantId } = req.params;
    
    if (!plantId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide plantId',
      });
    }
    
    // Get plant information
    const plant = await Plant.findById(plantId);
    
    if (!plant) {
      return res.status(404).json({
        status: 'fail',
        message: 'Plant not found',
      });
    }
    
    // Create a temporary file path
    const tempFilePath = path.join(os.tmpdir(), `plant-info-${plantId}-${Date.now()}.pdf`);
    
    // Generate the plant info PDF using HTML-to-PDF service
    const htmlPdfService = require('../services/html-pdf-service');
    
    // Create HTML for the plant info
    const plantInfoHtml = createPlantInfoHtml(plant);
    
    // Generate PDF from HTML
    const pdfBuffer = await htmlPdfService.createPdfBuffer(plantInfoHtml, {
      format: 'A4',
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      printBackground: true
    });
    
    // Write to file
    fs.writeFileSync(tempFilePath, pdfBuffer);
    
    // Stream the file to the client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=plant-info-${plant.name}.pdf`);
    
    const fileStream = fs.createReadStream(tempFilePath);
    fileStream.pipe(res);
    
    // Clean up the file after sending
    fileStream.on('end', () => {
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error('Error deleting temporary file:', err);
      });
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Generate PDF from HTML content
exports.generatePdfFromHtml = async (req, res) => {
  console.log('[DEBUG] Starting generatePdfFromHtml controller method');
  console.log('[DEBUG] Request body:', req.body);
  
  try {
    const { htmlContent, email, month, year, zoneId, plants } = req.body;
    
    console.log('[DEBUG] Request received with parameters:', {
      hasHtmlContent: !!htmlContent,
      htmlContentLength: htmlContent ? htmlContent.length : 0,
      email: email || 'not provided',
      month,
      year,
      zoneId,
      plantsCount: plants ? plants.length : 0
    });
    
    // If no HTML content provided, create a simple one
    if (!htmlContent) {
      console.log('[DEBUG] No HTML content provided, generating simple PDF');
      
      // Generate a simple HTML document
      const simpleHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Garden Planting Calendar</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #3a7b5e; }
            .zone { font-weight: bold; color: #56a978; }
            .date { color: #666; font-style: italic; }
          </style>
        </head>
        <body>
          <h1>Garden Planting Calendar</h1>
          <p class="zone">Zone: ${req.body.zone || '7b'}</p>
          <p class="date">Generated on: ${new Date().toLocaleString()}</p>
          <p>This calendar includes planting information for ${plants ? plants.length : 0} plants.</p>
          <p>It shows you when to start seeds indoors, when to plant outdoors, and when to expect harvests based on your growing zone.</p>
          <p>For a more detailed calendar, please ensure you're using the latest version of our app.</p>
        </body>
        </html>
      `;
      req.body.htmlContent = simpleHtml;
    }
    
    // Import necessary services
    console.log('[DEBUG] Importing necessary services and modules');
    const htmlPdfService = require('../services/html-pdf-service');
    const Zone = require('../models/Zone');
    const nodemailer = require('nodemailer');
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    console.log('[DEBUG] Checking NodeMailer version:', nodemailer.version);
    
    // Get zone data if available
    let zone = null;
    if (zoneId) {
      try {
        console.log(`[DEBUG] Looking up zone with ID: ${zoneId}`);
        zone = await Zone.findById(zoneId);
        console.log(`[DEBUG] Zone lookup result:`, zone ? `Found zone ${zone.zone}` : 'Zone not found');
      } catch (zoneError) {
        console.error(`[DEBUG] ❌ Error finding zone ${zoneId}:`, zoneError.message);
      }
    }
    
    // Additional metadata for PDF generation
    const timestamp = new Date().toISOString();
    const monthName = month 
      ? new Date(year || new Date().getFullYear(), month - 1, 1).toLocaleString('default', { month: 'long' }) 
      : new Date().toLocaleString('default', { month: 'long' });
    const yearValue = year || new Date().getFullYear();
    const zoneIdentifier = zone ? zone.zone : (zoneId || '7b');
    
    console.log(`[DEBUG] Generated calendar metadata:`, {
      timestamp,
      monthName,
      yearValue,
      zoneIdentifier
    });
    
    // Enhanced PDF options with watermark and metadata
    console.log('[DEBUG] Setting up PDF generation options');
    const pdfOptions = {
      landscape: true,
      format: 'A4',
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      printBackground: true,
      scale: 0.9, // Slightly scale down to ensure content fits
      displayHeaderFooter: true,
      footerTemplate: `
        <div style="width: 100%; font-size: 8px; text-align: center; color: #777; padding: 0 20px;">
          <span>Zone ${zoneIdentifier} | Generated on ${new Date().toLocaleDateString()} | Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
      headerTemplate: '<div></div>',
      preferCSSPageSize: true
    };
    
    // Check if this is an email request or a direct download
    if (email) {
      console.log(`[DEBUG] Email address provided (${email}), starting email generation process`);
      
      try {
        // Step 1: Generate PDF buffer
        console.log('[DEBUG] Step 1: Generating PDF buffer from HTML content');
        let pdfBuffer;
        try {
          console.log(`[DEBUG] Calling htmlPdfService.createPdfBuffer with ${htmlContent.length} chars of HTML`);
          pdfBuffer = await htmlPdfService.createPdfBuffer(htmlContent, pdfOptions);
          console.log(`[DEBUG] ✅ PDF buffer created successfully, size: ${pdfBuffer.length} bytes`);
          
          // Validate PDF buffer 
          if (!pdfBuffer || pdfBuffer.length < 1000) {
            console.error(`[DEBUG] ❌ PDF buffer validation failed: Too small (${pdfBuffer ? pdfBuffer.length : 0} bytes)`);
            throw new Error('Generated PDF is too small, likely invalid');
          }
          
          // Check PDF header
          const pdfHeader = pdfBuffer.slice(0, 5).toString('ascii');
          if (pdfHeader !== '%PDF-') {
            console.error(`[DEBUG] ❌ PDF header validation failed: Invalid header "${pdfHeader}"`);
            throw new Error('Generated PDF has invalid header, not a proper PDF');
          }
          
          console.log('[DEBUG] PDF validation passed: Valid PDF header and sufficient size');
        } catch (pdfError) {
          console.error('[DEBUG] ❌ Error generating PDF buffer:', pdfError);
          return res.status(500).json({
            status: 'fail',
            message: 'Failed to generate PDF from HTML content',
            error: pdfError.message
          });
        }
        
        // Step 2: Create a temporary file path for the PDF
        console.log('[DEBUG] Step 2: Creating temporary file for PDF');
        const tempDir = os.tmpdir();
        const tempFilename = `garden-calendar-${monthName}-${yearValue}-${Date.now()}.pdf`;
        const tempFilePath = path.join(tempDir, tempFilename);
        
        console.log(`[DEBUG] Temporary file path: ${tempFilePath}`);
        
        // Write the PDF buffer to a file
        try {
          console.log(`[DEBUG] Writing ${pdfBuffer.length} bytes to temporary file`);
          fs.writeFileSync(tempFilePath, pdfBuffer);
          
          // Verify the file was written
          const stats = fs.statSync(tempFilePath);
          console.log(`[DEBUG] ✅ PDF file written successfully: ${stats.size} bytes`);
          
          if (stats.size === 0) {
            console.error('[DEBUG] ❌ Temporary file is empty');
            throw new Error('Failed to write PDF to temporary file');
          }
        } catch (fileError) {
          console.error('[DEBUG] ❌ Error writing PDF to temp file:', fileError);
          return res.status(500).json({
            status: 'fail',
            message: 'Failed to save PDF file',
            error: fileError.message
          });
        }
        
        // Step 3: Set up email transport and create test account if in development
        console.log('[DEBUG] Step 3: Setting up email transport');
        let transporter;
        let testAccount;
        let previewUrl;
        
        // Check if we should use production email service
        const useProductionEmail = process.env.NODE_ENV === 'production' || process.env.FORCE_PRODUCTION_EMAIL === 'true';
        console.log(`[DEBUG] Email mode: ${useProductionEmail ? 'PRODUCTION' : 'DEVELOPMENT'}`);
        
        if (useProductionEmail) {
          // Use Brevo SMTP configuration for production or when forced
          console.log('[DEBUG] Using production email service (Brevo)');
          transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
              user: process.env.EMAIL_USER || '874592001@smtp-brevo.com',
              pass: process.env.EMAIL_PASS || 'gm75xn6UbJ4V2dka'
            },
            debug: true,
            logger: true
          });
        } else {
          // Use Ethereal for development/testing only
          try {
            console.log('[DEBUG] Creating test account with Ethereal');
            testAccount = await nodemailer.createTestAccount();
            console.log('[DEBUG] ✅ Test account created:', testAccount.user);
            
            transporter = nodemailer.createTransport({
              host: 'smtp.ethereal.email',
              port: 587,
              secure: false,
              auth: {
                user: testAccount.user,
                pass: testAccount.pass
              },
              debug: true,
              logger: true
            });
            
            console.log('[DEBUG] Ethereal email transporter created');
          } catch (accountError) {
            console.error('[DEBUG] ❌ Error creating Ethereal test account:', accountError);
            console.log('[DEBUG] Falling back to direct SMTP configuration');
            
            // Fallback to direct SMTP config if Ethereal fails
            transporter = nodemailer.createTransport({
              host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
              port: parseInt(process.env.EMAIL_PORT || '587'),
              secure: process.env.EMAIL_SECURE === 'true',
              auth: {
                user: process.env.EMAIL_USER || '874592001@smtp-brevo.com',
                pass: process.env.EMAIL_PASS || 'gm75xn6UbJ4V2dka'
              },
              debug: true,
              logger: true
            });
          }
        }
        
        // Verify SMTP connection
        console.log('[DEBUG] Verifying SMTP connection');
        try {
          await transporter.verify();
          console.log('[DEBUG] ✅ SMTP connection verified successfully');
        } catch (verifyError) {
          console.error('[DEBUG] ❌ SMTP connection verification failed:', verifyError);
          console.log('[DEBUG] Will attempt to send email anyway');
        }
        
        // Step 4: Create and send the email
        console.log('[DEBUG] Step 4: Sending email with PDF attachment');
        
        // Prepare the email content
        const filename = `Garden-Planting-Calendar-Zone-${zoneIdentifier}-${monthName}-${yearValue}.pdf`;
        
        // Verify the PDF file exists and has content before attaching
        try {
          const fileStats = fs.statSync(tempFilePath);
          console.log(`[DEBUG] Attachment file details:`, {
            path: tempFilePath,
            size: fileStats.size,
            created: fileStats.birthtime
          });
          
          if (fileStats.size === 0) {
            console.error('[DEBUG] ❌ PDF file is empty, cannot attach');
            throw new Error('PDF file is empty');
          }
          
          // Verify file is readable
          const testBuffer = fs.readFileSync(tempFilePath, { encoding: null, length: 10 });
          console.log(`[DEBUG] First 10 bytes of PDF:`, testBuffer.toString('hex'));
        } catch (statError) {
          console.error('[DEBUG] ❌ Error verifying PDF file:', statError);
          throw new Error(`Cannot verify PDF file: ${statError.message}`);
        }
        
        // Create email options
        const mailOptions = {
          from: testAccount ? `"Garden App" <${testAccount.user}>` : '"Garden App" <hello@plantperfectly.com>',
          to: email,
          subject: `Your Garden Planting Calendar - Zone ${zoneIdentifier}`,
          text: `Your personalized planting calendar for Zone ${zoneIdentifier} is attached.`,
          html: `
            <h1>Your Garden Planting Calendar</h1>
            <p>Thank you for using our garden planning app! Your personalized planting calendar for <strong>Zone ${zoneIdentifier}</strong> is attached as a PDF.</p>
            <p>Happy gardening!</p>
          `,
          attachments: [
            {
              filename: filename,
              content: fs.readFileSync(tempFilePath),
              contentType: 'application/pdf'
            }
          ]
        };
        
        console.log('[DEBUG] Mail options configured:', {
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
          attachmentName: mailOptions.attachments[0].filename,
          attachmentSize: mailOptions.attachments[0].content.length
        });
        
        // Send the email
        console.log('[DEBUG] Sending email now...');
        try {
          const info = await transporter.sendMail(mailOptions);
          
          console.log('[DEBUG] ✅ Email sent successfully:', {
            messageId: info.messageId,
            response: info.response,
            acceptedRecipients: info.accepted,
            rejectedRecipients: info.rejected
          });
          
          // Get ethereal preview URL if available
          if (testAccount) {
            previewUrl = nodemailer.getTestMessageUrl(info);
            console.log('[DEBUG] Ethereal preview URL:', previewUrl);
          }
        } catch (sendError) {
          console.error('[DEBUG] ❌ Error sending email:', sendError);
          throw new Error(`Failed to send email: ${sendError.message}`);
        }
        
        // Clean up the temporary file
        try {
          fs.unlinkSync(tempFilePath);
          console.log('[DEBUG] ✅ Temporary PDF file deleted');
        } catch (cleanupError) {
          console.warn('[DEBUG] Warning: Could not delete temporary PDF file:', cleanupError);
        }
        
        // Send successful response
        console.log('[DEBUG] Sending success response to client');
        return res.status(200).json({
          status: 'success',
          message: testAccount 
            ? 'Calendar PDF email preview is ready (development mode)' 
            : `Calendar PDF sent to ${email}`,
          previewUrl: previewUrl || null
        });
      } catch (emailError) {
        console.error('[DEBUG] ❌ Error in email process:', emailError);
        return res.status(500).json({
          status: 'fail',
          message: 'Failed to send email with PDF attachment',
          error: emailError.message
        });
      }
    } 
    // Direct download (no email)
    else {
      console.log('[DEBUG] No email provided, generating PDF for direct download');
      
      try {
        console.log('[DEBUG] Generating PDF buffer for direct download');
        const pdfBuffer = await htmlPdfService.createPdfBuffer(htmlContent, pdfOptions);
        console.log(`[DEBUG] ✅ Generated PDF buffer (${pdfBuffer.length} bytes)`);
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=garden-calendar-${monthName}-${yearValue}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);
        
        console.log('[DEBUG] Sending PDF buffer to client for download');
        
        // Send the PDF buffer
        res.send(pdfBuffer);
        
        console.log('[DEBUG] ✅ PDF sent for direct download');
      } catch (downloadError) {
        console.error('[DEBUG] ❌ Error generating PDF for download:', downloadError);
        return res.status(500).json({
          status: 'fail',
          message: 'Failed to generate PDF for download',
          error: downloadError.message
        });
      }
    }
  } catch (error) {
    console.error('[DEBUG] ❌ Unexpected error in generatePdfFromHtml:', error);
    return res.status(500).json({
      status: 'fail',
      message: 'An unexpected error occurred',
      error: error.message
    });
  }
};

// Helper function to create an HTML representation of the calendar
function createCalendarHtml(month, year, plants, zone, user) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Get frost dates
  const lastFrostDate = new Date(year, zone.average_frost_dates.last_spring_frost.month - 1, zone.average_frost_dates.last_spring_frost.day);
  const firstFrostDate = new Date(year, zone.average_frost_dates.first_fall_frost.month - 1, zone.average_frost_dates.first_fall_frost.day);
  
  // Generate tasks for plants
  const tasks = collectTasksForMonth(month, year, plants, lastFrostDate, firstFrostDate);
  
  // Get number of days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Get the day of the week of the first day (0-6, where 0 is Sunday)
  const firstDay = new Date(year, month - 1, 1).getDay();
  
  // Build the HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${monthNames[month - 1]} ${year} Planting Calendar</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .planting-calendar { width: 100%; }
        .calendar-header { 
          background-color: #4A7C59; 
          color: white; 
          padding: 15px; 
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .calendar-header h1 { margin: 0; }
        .frost-dates {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
        }
        .tasks-section {
          margin: 20px 0;
        }
        .task-category {
          margin-bottom: 15px;
        }
        .task-category h3 {
          color: #4A7C59;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .task-item {
          margin-bottom: 5px;
          padding-left: 20px;
        }
        .calendar-grid {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .calendar-grid th {
          background-color: #4A7C59;
          color: white;
          padding: 8px;
          text-align: center;
        }
        .calendar-grid td {
          border: 1px solid #ddd;
          height: 60px;
          width: 14.28%;
          vertical-align: top;
          padding: 5px;
        }
        .calendar-grid .day-number {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .calendar-legend {
          display: flex;
          justify-content: center;
          margin: 20px 0;
        }
        .legend-item {
          display: flex;
          align-items: center;
          margin: 0 10px;
        }
        .legend-color {
          width: 20px;
          height: 20px;
          margin-right: 5px;
        }
        .indoor-sowing, .indoor-sowing-color {
          background-color: #b3e0ff; /* Light blue */
        }
        .direct-sowing, .direct-sowing-color {
          background-color: #b3ffb3; /* Light green */
        }
        .task-blue {
          color: #3498db;
          font-size: 10px;
        }
        .task-green {
          color: #2ecc71;
          font-size: 10px;
        }
        .task-purple {
          color: #9b59b6;
          font-size: 10px;
        }
        .task-yellow {
          color: #f4b942;
          font-size: 10px;
        }
        .calendar-footer {
          margin-top: 20px;
          text-align: center;
          color: #999;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="planting-calendar">
        <div class="calendar-header">
          <h1>${monthNames[month - 1]} ${year} Planting Calendar</h1>
          <div>Zone ${zone.zone} | Growing Season: ${zone.growing_season_length} days</div>
        </div>
        
        <div class="frost-dates">
          <div><strong>Last Spring Frost:</strong> ${lastFrostDate.toLocaleDateString()}</div>
          <div><strong>First Fall Frost:</strong> ${firstFrostDate.toLocaleDateString()}</div>
        </div>
        
        <div class="tasks-section">
          <h2>This Month's Planting Tasks</h2>
          
          ${buildTasksHtml(tasks)}
        </div>
        
        <div class="calendar-legend">
          <div class="legend-item">
            <div class="legend-color indoor-sowing-color"></div>
            <div>Start Seeds Indoors</div>
          </div>
          <div class="legend-item">
            <div class="legend-color direct-sowing-color"></div>
            <div>Direct Sow / Transplant Outdoors</div>
          </div>
        </div>
        
        <table class="calendar-grid">
          <thead>
            <tr>
              <th>Sunday</th>
              <th>Monday</th>
              <th>Tuesday</th>
              <th>Wednesday</th>
              <th>Thursday</th>
              <th>Friday</th>
              <th>Saturday</th>
            </tr>
          </thead>
          <tbody>
            ${buildCalendarGridHtml(daysInMonth, firstDay, tasks)}
          </tbody>
        </table>
        
        <div class="calendar-footer">
          <div>Generated on ${new Date().toLocaleDateString()} for ${user.name} | Zone ${zone.zone}</div>
          <div>Generated by Garden App</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Helper function to build HTML for tasks
function buildTasksHtml(tasks) {
  let html = '';
  
  if (tasks.indoor_seed_start.length > 0) {
    html += `
      <div class="task-category">
        <h3>Start Seeds Indoors</h3>
        ${tasks.indoor_seed_start.map(task => 
          `<div class="task-item">• ${task.name} (around the ${task.date}${getDaySuffix(task.date)})${task.notes ? ` - ${task.notes}` : ''}</div>`
        ).join('')}
      </div>
    `;
  }
  
  if (tasks.direct_sow_spring.length > 0) {
    html += `
      <div class="task-category">
        <h3>Direct Sow Outdoors</h3>
        ${tasks.direct_sow_spring.map(task => 
          `<div class="task-item">• ${task.name} (around the ${task.date}${getDaySuffix(task.date)})${task.notes ? ` - ${task.notes}` : ''}</div>`
        ).join('')}
      </div>
    `;
  }
  
  if (tasks.direct_sow_fall.length > 0) {
    html += `
      <div class="task-category">
        <h3>Direct Sow for Fall Harvest</h3>
        ${tasks.direct_sow_fall.map(task => 
          `<div class="task-item">• ${task.name} (around the ${task.date}${getDaySuffix(task.date)})${task.notes ? ` - ${task.notes}` : ''}</div>`
        ).join('')}
      </div>
    `;
  }
  
  if (tasks.transplant.length > 0) {
    html += `
      <div class="task-category">
        <h3>Transplant Outdoors</h3>
        ${tasks.transplant.map(task => 
          `<div class="task-item">• ${task.name} (around the ${task.date}${getDaySuffix(task.date)})${task.notes ? ` - ${task.notes}` : ''}</div>`
        ).join('')}
      </div>
    `;
  }
  
  if (tasks.harvest.length > 0) {
    html += `
      <div class="task-category">
        <h3>Expected Harvests</h3>
        ${tasks.harvest.map(task => 
          `<div class="task-item">• ${task.name} (around the ${task.date}${getDaySuffix(task.date)}, ${task.days} days after planting)</div>`
        ).join('')}
      </div>
    `;
  }
  
  return html;
}

// Helper function to build the calendar grid HTML
function buildCalendarGridHtml(daysInMonth, firstDay, tasks) {
  let html = '';
  let day = 1;
  let weekRow = '';
  
  // Start with empty cells for days before the first of the month
  weekRow = '<tr>';
  for (let i = 0; i < firstDay; i++) {
    weekRow += '<td></td>';
  }
  
  // Fill in the days of the month
  while (day <= daysInMonth) {
    let dayHtml = `<td><div class="day-number">${day}</div>`;
    
    // Add tasks for this day
    const dayTasks = [];
    
    // Check each task type
    Object.keys(tasks).forEach(taskType => {
      tasks[taskType].forEach(task => {
        if (task.date === day) {
          let taskText = '';
          let taskClass = '';
          
          switch (taskType) {
            case 'indoor_seed_start':
              taskText = `Start: ${task.name}`;
              taskClass = 'task-blue';
              dayHtml = dayHtml.replace('<td>', '<td class="indoor-sowing">');
              break;
            case 'direct_sow_spring':
            case 'direct_sow_fall':
              taskText = `Sow: ${task.name}`;
              taskClass = 'task-green';
              dayHtml = dayHtml.replace('<td>', '<td class="direct-sowing">');
              break;
            case 'transplant':
              taskText = `Plant: ${task.name}`;
              taskClass = 'task-purple';
              dayHtml = dayHtml.replace('<td>', '<td class="direct-sowing">');
              break;
            case 'harvest':
              taskText = `Harvest: ${task.name}`;
              taskClass = 'task-yellow';
              break;
          }
          
          dayTasks.push(`<div class="${taskClass}">${taskText}</div>`);
        }
      });
    });
    
    // Add up to two tasks, with a "more" indicator if needed
    if (dayTasks.length > 0) {
      dayHtml += dayTasks.slice(0, 2).join('');
      if (dayTasks.length > 2) {
        dayHtml += `<div style="font-size: 10px; color: #666;">+${dayTasks.length - 2} more</div>`;
      }
    }
    
    dayHtml += '</td>';
    weekRow += dayHtml;
    
    // Close the row after Saturday (day 6) or at the end of the month
    if ((day + firstDay) % 7 === 0 || day === daysInMonth) {
      // Fill in any empty cells at the end of the month
      if (day === daysInMonth) {
        const remainingCells = 7 - ((day + firstDay) % 7);
        if (remainingCells < 7) {
          for (let i = 0; i < remainingCells; i++) {
            weekRow += '<td></td>';
          }
        }
      }
      
      weekRow += '</tr>';
      html += weekRow;
      
      // Start a new row if we're not done
      if (day < daysInMonth) {
        weekRow = '<tr>';
      }
    }
    
    day++;
  }
  
  return html;
}

// Helper function to collect tasks for a month
function collectTasksForMonth(month, year, plants, lastFrostDate, firstFrostDate) {
  // Group plants by task type
  const tasks = {
    indoor_seed_start: [],
    direct_sow_spring: [],
    direct_sow_fall: [],
    transplant: [],
    harvest: [],
  };
  
  // Determine which plants have tasks in this month
  plants.forEach(plant => {
    // Indoor seed starting
    if (plant.growing_calendar && plant.growing_calendar.indoor_seed_start && plant.growing_calendar.indoor_seed_start.weeks_before_last_frost) {
      const seedDate = new Date(lastFrostDate);
      seedDate.setDate(seedDate.getDate() - (plant.growing_calendar.indoor_seed_start.weeks_before_last_frost * 7));
      
      if (seedDate.getMonth() === month - 1) {
        tasks.indoor_seed_start.push({
          name: plant.name,
          date: seedDate.getDate(),
          notes: plant.growing_calendar.indoor_seed_start.notes,
        });
      }
    }
    
    // Direct sow spring
    if (plant.growing_calendar && plant.growing_calendar.direct_sow && plant.growing_calendar.direct_sow.spring && plant.growing_calendar.direct_sow.spring.weeks_from_last_frost) {
      const sowDate = new Date(lastFrostDate);
      sowDate.setDate(sowDate.getDate() + (plant.growing_calendar.direct_sow.spring.weeks_from_last_frost * 7));
      
      if (sowDate.getMonth() === month - 1) {
        tasks.direct_sow_spring.push({
          name: plant.name,
          date: sowDate.getDate(),
          notes: plant.growing_calendar.direct_sow.spring.notes,
        });
      }
    }
    
    // Direct sow fall
    if (plant.growing_calendar && plant.growing_calendar.direct_sow && plant.growing_calendar.direct_sow.fall && plant.growing_calendar.direct_sow.fall.weeks_before_first_frost) {
      const sowDate = new Date(firstFrostDate);
      sowDate.setDate(sowDate.getDate() - (plant.growing_calendar.direct_sow.fall.weeks_before_first_frost * 7));
      
      if (sowDate.getMonth() === month - 1) {
        tasks.direct_sow_fall.push({
          name: plant.name,
          date: sowDate.getDate(),
          notes: plant.growing_calendar.direct_sow.fall.notes,
        });
      }
    }
    
    // Transplant
    if (plant.growing_calendar && plant.growing_calendar.transplant && plant.growing_calendar.transplant.weeks_after_last_frost) {
      const transplantDate = new Date(lastFrostDate);
      transplantDate.setDate(transplantDate.getDate() + (plant.growing_calendar.transplant.weeks_after_last_frost * 7));
      
      if (transplantDate.getMonth() === month - 1) {
        tasks.transplant.push({
          name: plant.name,
          date: transplantDate.getDate(),
          notes: plant.growing_calendar.transplant.notes,
        });
      }
    }
    
    // Harvest (approximate, based on planting date + days to maturity)
    if (plant.days_to_maturity && (plant.days_to_maturity.min || plant.days_to_maturity.max)) {
      let plantingDate;
      
      // Use transplant date if available, otherwise use direct sow date
      if (plant.growing_calendar && plant.growing_calendar.transplant && plant.growing_calendar.transplant.weeks_after_last_frost) {
        plantingDate = new Date(lastFrostDate);
        plantingDate.setDate(plantingDate.getDate() + (plant.growing_calendar.transplant.weeks_after_last_frost * 7));
      } else if (plant.growing_calendar && plant.growing_calendar.direct_sow && plant.growing_calendar.direct_sow.spring && plant.growing_calendar.direct_sow.spring.weeks_from_last_frost) {
        plantingDate = new Date(lastFrostDate);
        plantingDate.setDate(plantingDate.getDate() + (plant.growing_calendar.direct_sow.spring.weeks_from_last_frost * 7));
      }
      
      if (plantingDate) {
        const daysToMaturity = plant.days_to_maturity.min || plant.days_to_maturity.max;
        const harvestDate = new Date(plantingDate);
        harvestDate.setDate(harvestDate.getDate() + daysToMaturity);
        
        if (harvestDate.getMonth() === month - 1) {
          tasks.harvest.push({
            name: plant.name,
            date: harvestDate.getDate(),
            days: daysToMaturity,
          });
        }
      }
    }
  });
  
  // Sort tasks by date
  Object.keys(tasks).forEach(key => {
    tasks[key].sort((a, b) => a.date - b.date);
  });
  
  return tasks;
}

// Helper function to create an HTML representation of plant info
function createPlantInfoHtml(plant) {
  // Build the HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${plant.name} Information Sheet</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          color: #333;
        }
        h1 {
          color: #4A7C59;
          text-align: center;
          margin-bottom: 5px;
        }
        .scientific-name {
          text-align: center;
          font-style: italic;
          color: #666;
          margin-bottom: 20px;
        }
        .image-link {
          text-align: center;
          color: #999;
          font-size: 12px;
          margin-bottom: 20px;
        }
        .description {
          margin-bottom: 20px;
          line-height: 1.5;
        }
        h2 {
          color: #4A7C59;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
          margin-top: 30px;
        }
        .requirements-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .requirements-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .requirements-table td {
          padding: 8px;
        }
        .requirements-table td:first-child {
          font-weight: bold;
          width: 30%;
        }
        .calendar-item {
          margin-bottom: 10px;
        }
        .calendar-item-title {
          font-weight: bold;
        }
        .calendar-item-note {
          font-size: 13px;
          color: #666;
          margin-left: 20px;
        }
        .companion-section {
          margin: 20px 0;
        }
        .companion-type {
          font-weight: bold;
          margin-top: 10px;
        }
        .companion-item {
          margin-left: 20px;
          margin-bottom: 5px;
        }
        .companion-note {
          font-size: 13px;
          color: #666;
        }
        .pest-disease {
          margin-bottom: 15px;
        }
        .pest-disease-name {
          font-weight: bold;
        }
        .pest-disease-details {
          margin-left: 20px;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          color: #999;
          font-size: 12px;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <h1>${plant.name}</h1>
      
      ${plant.scientific_name ? `<div class="scientific-name">${plant.scientific_name}</div>` : ''}
      
      ${plant.image_url ? `<div class="image-link">Image available at: ${plant.image_url}</div>` : ''}
      
      ${plant.description ? `<div class="description">${plant.description}</div>` : ''}
      
      <h2>Growing Information</h2>
      <table class="requirements-table">
        <tr>
          <td>Hardiness Zones</td>
          <td>${plant.hardiness_zones.min} - ${plant.hardiness_zones.max}</td>
        </tr>
      </table>
    </body>
    </html>
  `;
}