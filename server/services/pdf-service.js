/**
 * PDF Service
 * 
 * This service handles generating PDF files for various purposes
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Generate a planting calendar PDF
 * 
 * @param {Object} options - Options for generating the calendar
 * @param {string} options.zone - The growing zone
 * @param {Array} options.plants - Array of plants to include in the calendar
 * @param {string} options.outputPath - Path to save the PDF (optional)
 * @returns {Promise<string>} - Path to the generated PDF
 */
exports.generatePlantingCalendar = async (options) => {
  const { zone, plants = [], outputPath } = options;
  
  // Create a temporary file path if no output path is provided
  const pdfPath = outputPath || path.join(
    os.tmpdir(),
    `planting-calendar-zone-${zone}-${Date.now()}.pdf`
  );
  
  // Create a new PDF document
  const doc = new PDFDocument({ 
    size: 'A4', 
    layout: 'landscape',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `Planting Calendar - Zone ${zone}`,
      Author: 'Garden Planner App',
      Subject: 'Garden Planting Calendar',
      Keywords: 'garden, planting, calendar, zone'
    }
  });
  
  // Pipe the PDF to a file
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);
  
  // Add content to the PDF
  doc.fontSize(24).text(`Planting Calendar - Zone ${zone}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown(2);
  
  // Add plants if available
  if (plants && plants.length > 0) {
    doc.fontSize(14).text('Your Plants:', { underline: true });
    doc.moveDown();
    
    plants.forEach((plant, index) => {
      doc.fontSize(12).text(`${index + 1}. ${plant.name || 'Unnamed Plant'}`);
    });
  } else {
    doc.fontSize(14).text('No plants selected for this calendar.');
  }
  
  // Add a note
  doc.moveDown(2);
  doc.fontSize(10).text('Note: This calendar shows general planting times for your zone. Adjust based on your specific microclimate and local conditions.', { color: '#666666' });
  
  // Finalize the PDF
  doc.end();
  
  // Return a promise that resolves when the PDF is written
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(pdfPath));
    stream.on('error', reject);
  });
}; 