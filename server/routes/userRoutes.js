const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const path = require('path');

// Authentication routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Email verification
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);

// Direct calendar email route (for debugging)
router.post('/send-calendar', async (req, res) => {
  try {
    const { email, zone } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email is required'
      });
    }
    
    console.log(`Direct calendar request for email: ${email}, zone: ${zone || '7b'}`);
    
    // Create a simple PDF file
    const fs = require('fs');
    const PDFDocument = require('pdfkit');
    
    // Create directories if they don't exist
    const publicDir = path.join(__dirname, '..', 'public');
    const downloadsDir = path.join(publicDir, 'downloads');
    
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }
    
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `direct-calendar-${zone || '7b'}-${timestamp}.pdf`;
    const pdfPath = path.join(downloadsDir, filename);
    
    // Create a simple PDF
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));
    
    // Add some content
    doc.fontSize(24).text('Garden Planting Calendar', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Zone: ${zone || '7b'}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(14).text('This is a simple test calendar PDF.', { align: 'center' });
    
    // Finalize the PDF
    doc.end();
    
    // Wait for the PDF to be fully written
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a transporter
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Get the full path
    const fullPath = path.resolve(pdfPath);
    console.log(`PDF created at: ${fullPath}. Size: ${fs.statSync(fullPath).size} bytes`);
    
    // Read the file content
    const fileContent = fs.readFileSync(fullPath);
    
    // Send email with the PDF
    const info = await transporter.sendMail({
      from: `"Garden App" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your Garden Planting Calendar (Zone ${zone || '7b'})`,
      text: `Your personalized planting calendar for Zone ${zone || '7b'} is ready. Please check the attached PDF.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Your Garden Planting Calendar</h1>
          </div>
          
          <div style="padding: 20px; border: 1px solid #dddddd; border-top: none;">
            <h2 style="color: #333333; margin-top: 0;">Your Calendar is Ready!</h2>
            
            <p>Thank you for using our garden planning app! As requested, we've attached your custom planting calendar for <strong>Zone ${zone || '7b'}</strong>.</p>
            
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
      `,
      attachments: [
        {
          filename: `garden-planting-calendar-zone-${zone || '7b'}.pdf`,
          content: fileContent,
          contentType: 'application/pdf'
        }
      ]
    });
    
    console.log('Email sent successfully:', info.messageId);
    
    // Return success
    res.status(200).json({
      status: 'success',
      message: 'Calendar email sent successfully',
      data: {
        email_sent: true,
        email_address: email,
        messageId: info.messageId
      }
    });
  } catch (error) {
    console.error('Error sending direct calendar:', error);
    res.status(500).json({
      status: 'fail',
      message: `Failed to send calendar: ${error.message}`
    });
  }
});

// Protected routes (require authentication)
router.use(authController.protect);

router.get('/me', authController.getMe);
router.patch('/updateMe', authController.updateMe);
router.patch('/updatePassword', authController.updatePassword);

module.exports = router;