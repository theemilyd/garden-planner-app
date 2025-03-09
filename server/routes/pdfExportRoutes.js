const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');

// PDF Calendar export routes - no authentication for testing
router.post('/calendar', pdfController.generatePdfFromHtml);

module.exports = router; 