const express = require('express');
const router = express.Router();
const gardenController = require('../controllers/gardenController');
const authController = require('../controllers/authController');
const pdfController = require('../controllers/pdfController');

// All garden routes require authentication
router.use(authController.protect);

router.get('/', gardenController.getAllGardens);
router.get('/:id', gardenController.getGarden);
router.post('/', gardenController.createGarden);
router.patch('/:id', gardenController.updateGarden);
router.delete('/:id', gardenController.deleteGarden);

// Plant management within gardens
router.post('/plant', gardenController.addPlantToGarden);
router.patch('/plant/:garden_id/:plant_index', gardenController.updatePlantInGarden);
router.delete('/plant/:garden_id/:plant_index', gardenController.removePlantFromGarden);

// Task management for plants
router.post('/task/:garden_id/:plant_index', gardenController.updateTask);
router.patch('/task/:garden_id/:plant_index/:task_index', gardenController.updateTask);

// Journal entries for plants
router.post('/journal/:garden_id/:plant_index', gardenController.addJournalEntry);

// PDF Calendar export routes
router.post('/calendar/monthly', pdfController.generateMonthlyCalendar);
router.post('/calendar/annual', pdfController.generateAnnualCalendar);
router.post('/calendar/email', pdfController.emailMonthlyCalendar);

// HTML-to-PDF Calendar conversion route
router.post('/calendar/html-to-pdf', async (req, res) => {
  console.log('[DEBUG] ======================================');
  console.log('[DEBUG] HTML-to-PDF route handler started');
  
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
    
    if (!htmlContent) {
      console.error('[DEBUG] ❌ Missing HTML content');
      return res.status(400).json({
        status: 'fail',
        message: 'HTML content is required'
      });
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
          console.log('[DEBUG] Falling back to direct Brevo SMTP configuration');
          
          // Fallback to direct SMTP config if Ethereal fails
          transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: {
              user: '874592001@smtp-brevo.com',
              pass: 'gm75xn6UbJ4V2dka'
            },
            debug: true,
            logger: true
          });
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
    console.error('[DEBUG] ❌ Unexpected error in HTML-to-PDF route:', error);
    return res.status(500).json({
      status: 'fail',
      message: 'An unexpected error occurred',
      error: error.message
    });
  } finally {
    console.log('[DEBUG] HTML-to-PDF route handler completed');
    console.log('[DEBUG] ======================================');
  }
});

// Debugging route for capturing calendar HTML 
router.post('/calendar/debug-html', async (req, res) => {
  try {
    const { htmlContent } = req.body;
    
    if (!htmlContent) {
      return res.status(400).json({
        status: 'fail',
        message: 'HTML content is required'
      });
    }
    
    // Save the HTML content to a file for debugging
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    const timestamp = Date.now();
    const debugFilePath = path.join(os.tmpdir(), `calendar-debug-${timestamp}.html`);
    
    fs.writeFileSync(debugFilePath, htmlContent);
    console.log(`Debug HTML file saved to: ${debugFilePath}`);
    
    // Analyze the HTML content for key elements
    const analysis = {
      totalCharacters: htmlContent.length,
      hasDocType: htmlContent.includes('<!DOCTYPE html>') || htmlContent.includes('<!doctype html>'),
      hasHtmlTags: htmlContent.includes('<html') && htmlContent.includes('</html>'),
      hasHead: htmlContent.includes('<head') && htmlContent.includes('</head>'),
      hasBody: htmlContent.includes('<body') && htmlContent.includes('</body>'),
      hasCalendarClass: htmlContent.includes('planting-calendar'),
      hasHeader: htmlContent.includes('calendar-header'),
      hasLegend: htmlContent.includes('calendar-legend'),
      hasGrid: htmlContent.includes('calendar-grid'),
      hasIndoorStyles: htmlContent.includes('indoor-sowing') || htmlContent.includes('indoor-sowing-color'),
      hasOutdoorStyles: htmlContent.includes('direct-sowing') || htmlContent.includes('direct-sowing-color'),
      firstHundredChars: htmlContent.substring(0, 100),
      lastHundredChars: htmlContent.substring(htmlContent.length - 100)
    };
    
    return res.status(200).json({
      status: 'success',
      message: 'HTML content saved and analyzed',
      data: {
        filePath: debugFilePath,
        analysis
      }
    });
  } catch (error) {
    console.error('Error in debug-html route:', error);
    return res.status(500).json({
      status: 'fail',
      message: error.message
    });
  }
});

module.exports = router;