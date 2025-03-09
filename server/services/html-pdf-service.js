/**
 * HTML-to-PDF Service
 * 
 * This service handles capturing HTML content from a client-provided HTML string
 * and converting it to PDF for email attachments and downloads
 */

const puppeteer = require('puppeteer');
const htmlPdf = require('html-pdf-node');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Generate a PDF from HTML content using Puppeteer
 * 
 * @param {string} htmlContent - The HTML content to convert to PDF
 * @param {Object} options - PDF generation options
 * @returns {Promise<Buffer>} - A promise that resolves to a PDF buffer
 */
async function generatePdfFromHtml(htmlContent, options = {}) {
  console.log('[DEBUG] Starting HTML to PDF conversion with Puppeteer');
  
  // Check if HTML content is valid with more detailed logging
  if (!htmlContent) {
    console.error('[DEBUG] ❌ HTML content is completely missing');
    throw new Error('HTML content is missing');
  }
  
  // We'll still log this but not throw an error
  if (htmlContent.length < 100) {
    console.warn('[DEBUG] ⚠️ HTML content is very short:', htmlContent);
    // We'll continue anyway for testing purposes
  }
  
  // Enhance the HTML content if it's too simple
  let finalHtmlContent = htmlContent;
  if (!htmlContent.includes('<!DOCTYPE html>') || !htmlContent.includes('<html')) {
    console.log('[DEBUG] ℹ️ Enhancing simple HTML content with proper structure');
    finalHtmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>PDF Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #3a7b5e; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
  }
  
  // More comprehensive content validation
  const contentValidation = {
    hasDocType: finalHtmlContent.includes('<!DOCTYPE html>') || finalHtmlContent.includes('<!doctype html>'),
    hasHtmlTag: finalHtmlContent.includes('<html') && finalHtmlContent.includes('</html>'),
    hasHeadTag: finalHtmlContent.includes('<head') && finalHtmlContent.includes('</head>'),
    hasBodyTag: finalHtmlContent.includes('<body') && finalHtmlContent.includes('</body>'),
    hasStyleTag: finalHtmlContent.includes('<style') && finalHtmlContent.includes('</style>'),
    hasTable: finalHtmlContent.includes('<table') && finalHtmlContent.includes('</table>'),
    hasCalendarClass: finalHtmlContent.includes('planting-calendar'),
    hasGridClass: finalHtmlContent.includes('calendar-grid'),
    hasSowingStyles: finalHtmlContent.includes('indoor-sowing') || finalHtmlContent.includes('direct-sowing'),
    hasMonths: ['January', 'February', 'March', 'April'].some(month => finalHtmlContent.includes(month)),
    contentLength: finalHtmlContent.length
  };
  
  console.log('[DEBUG-PDF] HTML content validation results:', contentValidation);
  
  // Enhanced repair mechanism - fix common issues with the HTML structure
  let repairedHtml = finalHtmlContent;
  let repairLog = [];
  
  // 1. Ensure proper DOCTYPE
  if (!contentValidation.hasDocType) {
    repairedHtml = '<!DOCTYPE html>\n' + repairedHtml;
    repairLog.push('Added DOCTYPE');
  }
  
  // 2. Ensure proper HTML structure
  if (!contentValidation.hasHtmlTag) {
    repairedHtml = `<!DOCTYPE html>\n<html><head><meta charset="UTF-8"><title>Your Planting Calendar</title></head><body>${repairedHtml}</body></html>`;
    repairLog.push('Added complete HTML structure');
  } else {
    // 3. Check for partial structure issues (missing head or body)
    if (!contentValidation.hasHeadTag) {
      repairedHtml = repairedHtml.replace('<html>', '<html><head><meta charset="UTF-8"><title>Your Planting Calendar</title></head>');
      repairLog.push('Added missing head tags');
    }
    
    if (!contentValidation.hasBodyTag) {
      // Find where to insert body tags
      if (repairedHtml.includes('</head>')) {
        repairedHtml = repairedHtml.replace('</head>', '</head><body>');
        repairedHtml = repairedHtml.replace('</html>', '</body></html>');
        repairLog.push('Added missing body tags');
      }
    }
  }
  
  // 4. Add essential styles if missing
  if (!contentValidation.hasStyleTag || !contentValidation.hasSowingStyles) {
    // Insert essential calendar styles
    const essentialStyles = `
      <style>
        /* Critical Calendar Styles */
        @page { size: landscape; margin: 10mm; }
        body { font-family: Arial, sans-serif; }
        .planting-calendar { width: 100%; }
        .calendar-grid { width: 100%; border-collapse: collapse; }
        .calendar-grid th, .calendar-grid td { border: 1px solid #ddd; padding: 6px; }
        .calendar-grid th { background-color: #4CAF50; color: white; }
        .indoor-sowing, .indoor-sowing-color { background-color: #b3e0ff !important; }
        .direct-sowing, .direct-sowing-color { background-color: #b3ffb3 !important; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      </style>
    `;
    
    // Insert styles into head if it exists
    if (repairedHtml.includes('</head>')) {
      repairedHtml = repairedHtml.replace('</head>', `${essentialStyles}</head>`);
      repairLog.push('Added missing essential styles');
    }
    // Otherwise add at the beginning if we're dealing with a fragment
    else if (!contentValidation.hasHeadTag) {
      repairedHtml = `<style>${essentialStyles}</style>` + repairedHtml;
      repairLog.push('Added styles to HTML fragment');
    }
  }
  
  // Log repair results
  if (repairLog.length > 0) {
    console.log('[DEBUG-PDF] HTML structure repaired:', repairLog.join(', '));
    finalHtmlContent = repairedHtml;
    console.log('[DEBUG-PDF] HTML content after repairs (first 200 chars):', finalHtmlContent.substring(0, 200));
  } else {
    console.log('[DEBUG-PDF] HTML structure is valid, no repairs needed');
  }
  
  const defaultOptions = {
    format: 'A4',
    landscape: options.landscape !== undefined ? options.landscape : true, // Default to landscape for calendars
    margin: {
      top: '10mm',
      right: '10mm',
      bottom: '10mm',
      left: '10mm'
    },
    printBackground: true,
    displayHeaderFooter: false,
    scale: 0.9, // Slightly scale down to ensure content fits
  };

  // Merge provided options with defaults
  const pdfOptions = { ...defaultOptions, ...options };
  
  console.log('[DEBUG-PDF] PDF generation options:', {
    format: pdfOptions.format,
    landscape: pdfOptions.landscape,
    margin: pdfOptions.margin,
    scale: pdfOptions.scale
  });
  
  let browser = null;
  try {
    console.log('[DEBUG-PDF] Launching Puppeteer browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ],
    });
    
    console.log('[DEBUG-PDF] Creating new page...');
    const page = await browser.newPage();
    
    // Set viewport size to ensure full content capture
    await page.setViewport({ 
      width: 1200, 
      height: 1600,
      deviceScaleFactor: 2 // Higher resolution
    });
    
    console.log(`[DEBUG-PDF] Setting HTML content (length: ${finalHtmlContent.length} chars)...`);
    
    // Set the page content to the provided HTML with longer timeout
    await page.setContent(finalHtmlContent, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 60000, // Longer timeout for complex documents
    });
    
    // Wait a moment for any JavaScript to execute and layout to stabilize
    console.log('[DEBUG-PDF] Waiting for layout to stabilize...');
    await page.waitForTimeout(500);
    
    // Log what we've loaded
    const pageTitle = await page.title();
    console.log(`[DEBUG-PDF] Page title: "${pageTitle}"`);
    
    // Take a screenshot for debugging (won't be included in PDF)
    console.log('[DEBUG-PDF] Taking screenshot for debugging purposes...');
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    console.log(`[DEBUG-PDF] Screenshot captured: ${screenshotBuffer.length} bytes`);
    
    // Check if critical elements exist on the page
    const elementCounts = await page.evaluate(() => {
      return {
        calendarElements: document.querySelectorAll('.planting-calendar').length,
        tables: document.querySelectorAll('table').length,
        tableRows: document.querySelectorAll('tr').length,
        tableCells: document.querySelectorAll('td').length,
        indoorSowing: document.querySelectorAll('.indoor-sowing').length,
        directSowing: document.querySelectorAll('.direct-sowing').length,
      };
    });
    
    console.log('[DEBUG-PDF] Page element counts:', elementCounts);
    
    // Check for any content issues
    if (elementCounts.tables === 0 || elementCounts.tableRows === 0) {
      console.warn('[DEBUG-PDF] ⚠️ Page may not have critical calendar elements');
    }
    
    console.log('[DEBUG-PDF] Generating PDF from page...');
    const pdfBuffer = await page.pdf(pdfOptions);
    
    console.log(`[DEBUG-PDF] ✅ PDF generated successfully: ${pdfBuffer.length} bytes`);
    
    // Verify PDF header
    const pdfHeader = pdfBuffer.slice(0, 5).toString('ascii');
    if (pdfHeader !== '%PDF-') {
      console.error(`[DEBUG-PDF] ❌ Generated content is not a valid PDF (header: ${pdfHeader})`);
      throw new Error('Generated content is not a valid PDF');
    }
    
    console.log('[DEBUG-PDF] Closing browser...');
    await browser.close();
    console.log('[DEBUG-PDF] PDF generation completed successfully');
    
    return pdfBuffer;
  } catch (error) {
    console.error('[DEBUG-PDF] ❌ Error during PDF generation:', error);
    
    // Try to close the browser in case of error
    if (browser) {
      try {
        await browser.close();
        console.log('[DEBUG-PDF] Browser closed after error');
      } catch (closeError) {
        console.error('[DEBUG-PDF] ❌ Error closing browser:', closeError);
      }
    }
    
    throw error;
  }
}

/**
 * Generate a PDF from HTML content using html-pdf-node (fallback method)
 * 
 * @param {string} htmlContent - The HTML content to convert to PDF
 * @param {Object} options - PDF generation options
 * @returns {Promise<Buffer>} - A promise that resolves to a PDF buffer
 */
async function generatePdfFallback(htmlContent, options = {}) {
  console.log('[DEBUG] Starting HTML to PDF conversion with html-pdf-node');
  
  // Check if HTML content is valid
  if (!htmlContent) {
    console.error('[DEBUG] ❌ HTML content is missing');
    throw new Error('HTML content is missing');
  }
  
  // We'll still log this but not throw an error
  if (htmlContent.length < 100) {
    console.warn('[DEBUG] ⚠️ HTML content is very short:', htmlContent);
    // We'll continue anyway for testing purposes
  }
  
  // Enhance the HTML content if it's too simple
  let finalHtmlContent = htmlContent;
  if (!htmlContent.includes('<!DOCTYPE html>') || !htmlContent.includes('<html')) {
    console.log('[DEBUG] ℹ️ Enhancing simple HTML content with proper structure');
    finalHtmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>PDF Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #3a7b5e; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
  }
  
  // More comprehensive content validation
  const contentValidation = {
    hasDocType: finalHtmlContent.includes('<!DOCTYPE html>') || finalHtmlContent.includes('<!doctype html>'),
    hasHtmlTag: finalHtmlContent.includes('<html') && finalHtmlContent.includes('</html>'),
    hasHeadTag: finalHtmlContent.includes('<head') && finalHtmlContent.includes('</head>'),
    hasBodyTag: finalHtmlContent.includes('<body') && finalHtmlContent.includes('</body>'),
    hasStyleTag: finalHtmlContent.includes('<style') && finalHtmlContent.includes('</style>'),
    hasTable: finalHtmlContent.includes('<table') && finalHtmlContent.includes('</table>'),
    hasCalendarClass: finalHtmlContent.includes('planting-calendar'),
    hasGridClass: finalHtmlContent.includes('calendar-grid'),
    hasSowingStyles: finalHtmlContent.includes('indoor-sowing') || finalHtmlContent.includes('direct-sowing'),
    hasMonths: ['January', 'February', 'March', 'April'].some(month => finalHtmlContent.includes(month)),
    contentLength: finalHtmlContent.length
  };
  
  console.log('[DEBUG-PDF] HTML content validation results:', contentValidation);
  
  // Enhanced repair mechanism - fix common issues with the HTML structure
  let repairedHtml = finalHtmlContent;
  let repairLog = [];
  
  // 1. Ensure proper DOCTYPE
  if (!contentValidation.hasDocType) {
    repairedHtml = '<!DOCTYPE html>\n' + repairedHtml;
    repairLog.push('Added DOCTYPE');
  }
  
  // 2. Ensure proper HTML structure
  if (!contentValidation.hasHtmlTag) {
    repairedHtml = `<!DOCTYPE html>\n<html><head><meta charset="UTF-8"><title>Your Planting Calendar</title></head><body>${repairedHtml}</body></html>`;
    repairLog.push('Added complete HTML structure');
  } else {
    // 3. Check for partial structure issues (missing head or body)
    if (!contentValidation.hasHeadTag) {
      repairedHtml = repairedHtml.replace('<html>', '<html><head><meta charset="UTF-8"><title>Your Planting Calendar</title></head>');
      repairLog.push('Added missing head tags');
    }
    
    if (!contentValidation.hasBodyTag) {
      // Find where to insert body tags
      if (repairedHtml.includes('</head>')) {
        repairedHtml = repairedHtml.replace('</head>', '</head><body>');
        repairedHtml = repairedHtml.replace('</html>', '</body></html>');
        repairLog.push('Added missing body tags');
      }
    }
  }
  
  // 4. Add essential styles if missing
  if (!contentValidation.hasStyleTag || !contentValidation.hasSowingStyles) {
    // Insert essential calendar styles
    const essentialStyles = `
      <style>
        /* Critical Calendar Styles */
        @page { size: landscape; margin: 10mm; }
        body { font-family: Arial, sans-serif; }
        .planting-calendar { width: 100%; }
        .calendar-grid { width: 100%; border-collapse: collapse; }
        .calendar-grid th, .calendar-grid td { border: 1px solid #ddd; padding: 6px; }
        .calendar-grid th { background-color: #4CAF50; color: white; }
        .indoor-sowing, .indoor-sowing-color { background-color: #b3e0ff !important; }
        .direct-sowing, .direct-sowing-color { background-color: #b3ffb3 !important; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      </style>
    `;
    
    // Insert styles into head if it exists
    if (repairedHtml.includes('</head>')) {
      repairedHtml = repairedHtml.replace('</head>', `${essentialStyles}</head>`);
      repairLog.push('Added missing essential styles');
    }
    // Otherwise add at the beginning if we're dealing with a fragment
    else if (!contentValidation.hasHeadTag) {
      repairedHtml = `<style>${essentialStyles}</style>` + repairedHtml;
      repairLog.push('Added styles to HTML fragment');
    }
  }
  
  // Log repair results
  if (repairLog.length > 0) {
    console.log('[DEBUG-PDF] HTML structure repaired:', repairLog.join(', '));
    finalHtmlContent = repairedHtml;
    console.log('[DEBUG-PDF] HTML content after repairs (first 200 chars):', finalHtmlContent.substring(0, 200));
  } else {
    console.log('[DEBUG-PDF] HTML structure is valid, no repairs needed');
  }
  
  const defaultOptions = {
    format: 'A4',
    landscape: options.landscape || false,
    margin: {
      top: '10mm',
      right: '10mm',
      bottom: '10mm',
      left: '10mm'
    },
    printBackground: true,
  };
  
  // Merge provided options with defaults
  const pdfOptions = { ...defaultOptions, ...options };
  
  console.log('[DEBUG-PDF] Fallback PDF options:', {
    format: pdfOptions.format,
    landscape: pdfOptions.landscape,
    margin: pdfOptions.margin,
    printBackground: pdfOptions.printBackground
  });
  
  try {
    // Create a file object with content
    const file = { content: finalHtmlContent };
    
    // Generate PDF with html-pdf-node
    console.log('[DEBUG-PDF] Generating PDF with html-pdf-node...');
    
    const startTime = Date.now();
    const pdfBuffer = await htmlPdf.generatePdf(file, pdfOptions);
    const endTime = Date.now();
    
    console.log(`[DEBUG-PDF] Fallback PDF generation took ${endTime - startTime}ms`);
    
    // Validate PDF buffer
    if (!pdfBuffer || pdfBuffer.length < 1000) {
      console.error(`[DEBUG-PDF] ❌ Fallback PDF generation failed - buffer too small (${pdfBuffer ? pdfBuffer.length : 0} bytes)`);
      throw new Error(`PDF fallback generation failed - buffer too small (${pdfBuffer ? pdfBuffer.length : 0} bytes)`);
    }
    
    // Verify PDF header
    const header = pdfBuffer.toString('ascii', 0, 5);
    if (header !== '%PDF-') {
      console.error(`[DEBUG-PDF] ❌ Invalid PDF generated by fallback - wrong header: "${header}"`);
      throw new Error(`Invalid PDF generated by fallback method - missing PDF header signature: ${header}`);
    }
    
    console.log(`[DEBUG-PDF] ✅ Fallback PDF successfully generated! Buffer size: ${pdfBuffer.length} bytes`);
    return pdfBuffer;
  } catch (error) {
    console.error('[DEBUG-PDF] ❌ Error in fallback PDF generation:', error);
    throw error;
  }
}

/**
 * Create a PDF file from HTML content and save it to disk
 * 
 * @param {string} htmlContent - The HTML content to convert to PDF
 * @param {string} outputPath - Path where to save the PDF file (optional)
 * @param {Object} options - PDF generation options
 * @returns {Promise<string>} - A promise that resolves to the path of the saved PDF
 */
async function createPdfFile(htmlContent, outputPath = null, options = {}) {
  // If no output path is provided, create a temp file
  const tempFilePath = outputPath || path.join(
    os.tmpdir(), 
    `calendar-export-${Date.now()}.pdf`
  );
  
  console.log(`Creating PDF file at: ${tempFilePath}`);
  
  let pdfBuffer;
  try {
    // First try with Puppeteer
    pdfBuffer = await generatePdfFromHtml(htmlContent, options);
  } catch (error) {
    console.error('Puppeteer PDF generation failed, trying fallback method:', error);
    
    // Try fallback if Puppeteer fails
    pdfBuffer = await generatePdfFallback(htmlContent, options);
  }
  
  // Ensure the directory exists
  const dir = path.dirname(tempFilePath);
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write the PDF buffer to a file
  try {
    fs.writeFileSync(tempFilePath, pdfBuffer);
    console.log(`PDF file written successfully to: ${tempFilePath}`);
    
    // Verify the file exists and has content
    const stats = fs.statSync(tempFilePath);
    console.log(`PDF file size: ${stats.size} bytes`);
    
    return tempFilePath;
  } catch (error) {
    console.error('Error writing PDF file:', error);
    throw error;
  }
}

/**
 * Create a PDF buffer from HTML content
 * 
 * @param {string} htmlContent - The HTML content to convert to PDF
 * @param {Object} options - PDF generation options
 * @returns {Promise<Buffer>} - A promise that resolves to a PDF buffer
 */
async function createPdfBuffer(htmlContent, options = {}) {
  console.log('[DEBUG] Starting createPdfBuffer with HTML content length:', htmlContent ? htmlContent.length : 0);
  console.log('[DEBUG] PDF options:', options);
  
  // Check if HTML content is valid
  if (!htmlContent) {
    console.error('[DEBUG] ❌ No HTML content provided');
    throw new Error('HTML content is required for PDF generation');
  }
  
  // Removed the length check to accept shorter HTML for testing
  // if (htmlContent.length < 100) {
  //   console.error('[DEBUG] ❌ HTML content too short:', htmlContent);
  //   throw new Error('HTML content is too short to be valid');
  // }
  
  try {
    // First try to use Puppeteer
    console.log('[DEBUG] Attempting to generate PDF using Puppeteer...');
    return await generatePdfFromHtml(htmlContent, options);
  } catch (puppeteerError) {
    console.error('[DEBUG] Puppeteer PDF generation failed:', puppeteerError.message);
    console.log('[DEBUG] Falling back to html-pdf-node library');
    
    try {
      // Fall back to html-pdf-node if Puppeteer fails
      return await generatePdfFallback(htmlContent, options);
    } catch (fallbackError) {
      console.error('[DEBUG] Fallback PDF generation also failed:', fallbackError.message);
      throw new Error(`Failed to generate PDF using both methods: ${puppeteerError.message}, ${fallbackError.message}`);
    }
  }
}

module.exports = {
  createPdfFile,
  createPdfBuffer,
};