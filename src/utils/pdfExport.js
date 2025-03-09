/**
 * PDF Export Utility
 * 
 * This utility captures the calendar view and exports it as a PDF
 */

import axios from 'axios';

/**
 * Captures the HTML content of the planting calendar
 * 
 * @returns {string} HTML content of the calendar
 */
export const captureCalendarHtml = () => {
  console.log('[DEBUG] Starting calendar HTML capture process');
  
  try {
    // Find the calendar element
    console.log('[DEBUG] Looking for calendar element with various selectors');
    const calendarElement = document.querySelector('.planting-calendar') || 
                          document.querySelector('[class*="plantingCalendar"]') ||
                          document.querySelector('[data-testid="planting-calendar"]') ||
                          document.querySelector('[id*="calendar"]');
    
    if (!calendarElement) {
      console.error('[DEBUG] ❌ Calendar element not found with any selector');
      throw new Error('Could not find the calendar element on the page');
    }
    
    console.log('[DEBUG] ✅ Found calendar element:', {
      tagName: calendarElement.tagName,
      className: calendarElement.className,
      childCount: calendarElement.children.length,
      dimensions: `${calendarElement.offsetWidth}x${calendarElement.offsetHeight}px`,
      id: calendarElement.id || 'no-id',
      innerHTML: calendarElement.innerHTML.substring(0, 100) + '...'
    });
    
    // Extract all styles that apply to the calendar
    console.log('[DEBUG] Extracting CSS styles');
    const styleSheets = Array.from(document.styleSheets);
    let cssRules = [];
    let styleSheetErrors = 0;
    
    styleSheets.forEach((sheet, index) => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        console.log(`[DEBUG] Processing stylesheet #${index}: extracted ${rules.length} rules`);
        cssRules.push(...rules);
      } catch (e) {
        styleSheetErrors++;
        console.warn(`[DEBUG] Could not access rules for stylesheet #${index}:`, e.message);
      }
    });
    
    console.log(`[DEBUG] Extracted ${cssRules.length} CSS rules (${styleSheetErrors} stylesheets had access errors)`);
    
    // Filter for rules that apply to calendar elements
    const relevantCssTexts = cssRules
      .filter(rule => {
        if (!rule.selectorText) return false;
        
        return rule.selectorText.includes('calendar') ||
               rule.selectorText.includes('planting') ||
               rule.selectorText.includes('month') ||
               rule.selectorText.includes('grid') ||
               rule.selectorText.includes('row') ||
               rule.selectorText.includes('cell') ||
               rule.selectorText.includes('sowing') ||
               rule.selectorText.includes('indoor') ||
               rule.selectorText.includes('direct') ||
               rule.selectorText.includes('table') ||
               rule.selectorText.includes('th') ||
               rule.selectorText.includes('td') ||
               rule.selectorText.includes('tr');
      })
      .map(rule => rule.cssText);
    
    console.log(`[DEBUG] Filtered down to ${relevantCssTexts.length} calendar-related CSS rules`);
    
    // Add essential print styles
    relevantCssTexts.push(`
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { margin: 0; padding: 0; }
        .planting-calendar { width: 100%; }
      }
    `);
    
    // Create a style element with all relevant CSS
    const styleElement = document.createElement('style');
    styleElement.textContent = relevantCssTexts.join('\n');
    console.log('[DEBUG] Created style element with relevant CSS');
    
    // Clone the calendar element to avoid modifying the original
    console.log('[DEBUG] Cloning calendar element');
    const calendarClone = calendarElement.cloneNode(true);
    
    // Count elements in the cloned calendar
    const elementCount = {
      total: calendarClone.querySelectorAll('*').length,
      tables: calendarClone.querySelectorAll('table').length,
      rows: calendarClone.querySelectorAll('tr').length,
      cells: calendarClone.querySelectorAll('td').length,
      headings: calendarClone.querySelectorAll('h1, h2, h3, h4, h5').length,
    };
    console.log('[DEBUG] Cloned calendar element stats:', elementCount);
    
    // Apply inline styles to ensure colors are preserved in PDF
    console.log('[DEBUG] Starting to apply inline styles to elements');
    
    const applyInlineStyles = (element) => {
      const computedStyle = window.getComputedStyle(element);
      
      // Apply background color if it exists and isn't transparent
      const bgColor = computedStyle.backgroundColor;
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        element.style.backgroundColor = bgColor;
      }
      
      // Apply text color if it exists
      const color = computedStyle.color;
      if (color) {
        element.style.color = color;
      }
      
      // Apply border styles if they exist
      const borderColor = computedStyle.borderColor;
      const borderWidth = computedStyle.borderWidth;
      const borderStyle = computedStyle.borderStyle;
      
      if (borderColor && borderWidth && borderStyle && borderStyle !== 'none') {
        element.style.borderColor = borderColor;
        element.style.borderWidth = borderWidth;
        element.style.borderStyle = borderStyle;
      }
      
      // Apply to all child elements
      Array.from(element.children).forEach(child => applyInlineStyles(child));
    };
    
    // Apply inline styles to the cloned calendar
    applyInlineStyles(calendarClone);
    console.log('[DEBUG] Finished applying inline styles');
    
    // Look for key elements in the calendar
    const calendarStructure = {
      hasHeader: !!calendarClone.querySelector('.calendar-header'),
      hasGrid: !!calendarClone.querySelector('.calendar-grid'),
      hasTable: !!calendarClone.querySelector('table'),
      hasMonths: !!calendarClone.querySelector('th'),
      hasPlants: !!calendarClone.querySelector('.plant-name, td:first-child'),
      hasIndoorStyling: !!calendarClone.querySelector('.indoor-sowing'),
      hasDirectStyling: !!calendarClone.querySelector('.direct-sowing'),
    };
    console.log('[DEBUG] Calendar structure check:', calendarStructure);
    
    // Create a complete HTML document
    console.log('[DEBUG] Creating complete HTML document');
    const docType = '<!DOCTYPE html>';
    const htmlOpen = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Your Planting Calendar</title>
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
          .calendar-header h1, .calendar-header h2 { margin: 0; color: white; }
          .calendar-legend {
            display: flex;
            justify-content: center;
            margin: 15px 0;
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
            height: 30px;
            vertical-align: top;
            padding: 5px;
          }
          .plant-name {
            font-weight: bold;
            text-align: left;
          }
          .indoor-sowing, .indoor-sowing-color {
            background-color: #b3e0ff !important; /* Light blue */
          }
          .direct-sowing, .direct-sowing-color {
            background-color: #b3ffb3 !important; /* Light green */
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        </style>
      </head>
      <body>
    `;
    const htmlClose = '</body></html>';
    
    // Create a container for our export HTML
    const container = document.createElement('div');
    container.appendChild(styleElement);
    container.appendChild(calendarClone);
    
    // Create a clean HTML document with proper structure
    const htmlContent = docType + htmlOpen + container.innerHTML + htmlClose;
    
    console.log(`[DEBUG] Generated HTML content with ${calendarClone.querySelectorAll('*').length} elements`);
    console.log(`[DEBUG] Complete HTML document size: ${htmlContent.length} characters`);
    console.log(`[DEBUG] First 200 chars of HTML: ${htmlContent.substring(0, 200)}...`);
    console.log(`[DEBUG] Last 200 chars of HTML: ...${htmlContent.substring(htmlContent.length - 200)}`);
    
    // Additional validation
    const validation = {
      hasDocType: htmlContent.includes('<!DOCTYPE html>'),
      hasHtmlTags: htmlContent.includes('<html') && htmlContent.includes('</html>'),
      hasHeadTag: htmlContent.includes('<head') && htmlContent.includes('</head>'),
      hasBodyTag: htmlContent.includes('<body') && htmlContent.includes('</body>'),
      hasStyleTag: htmlContent.includes('<style>') && htmlContent.includes('</style>'),
      hasIndoorStyle: htmlContent.includes('indoor-sowing'),
      hasDirectStyle: htmlContent.includes('direct-sowing'),
    };
    console.log('[DEBUG] Final HTML validation:', validation);
    
    return htmlContent;
  } catch (error) {
    console.error('[DEBUG] ❌ Error in captureCalendarHtml:', error);
    console.error('[DEBUG] Error stack:', error.stack);
    
    // Return a basic error HTML
    return `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Calendar Export Error</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          h1 { color: #D32F2F; }
          .error-box { border: 1px solid #ddd; padding: 20px; border-radius: 5px; background-color: #f9f9f9; }
          .contact { margin-top: 30px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <h1>Calendar Export Error</h1>
        <p>We encountered an error while trying to capture your planting calendar.</p>
        <div class="error-box">
          <p><strong>Error details:</strong> ${error.message}</p>
          <p>Please try again or contact support if the problem persists.</p>
        </div>
        <div class="contact">
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>`;
  }
};

/**
 * Sends captured HTML to the server for PDF conversion and email delivery
 * 
 * @param {string} email - User's email address
 * @param {Object} calendarData - Calendar data including month, year, plants, zoneId
 * @returns {Promise} - Promise resolving to response from server
 */
export const exportCalendarToPdf = async (email, calendarData) => {
  console.log('[DEBUG] Starting exportCalendarToPdf process');
  console.log('[DEBUG] Email:', email);
  console.log('[DEBUG] Calendar data:', {
    zoneId: calendarData.zoneId,
    year: calendarData.year,
    month: calendarData.month,
    plantsCount: calendarData.plants ? calendarData.plants.length : 0
  });
  
  try {
    // First, ensure we have the necessary calendar data
    if (!calendarData || !calendarData.zoneId) {
      console.error('[DEBUG] ❌ Missing required calendar data for export');
      throw new Error('Missing zone information. Please try again with a selected growing zone.');
    }
    
    // Get the calendar container element
    console.log('[DEBUG] Looking for calendar container element');
    const calendarContainer = document.querySelector('.planting-calendar') || 
                             document.querySelector('[class*="calendar"]') ||
                             document.querySelector('[class*="Calendar"]');
    
    if (!calendarContainer) {
      console.error('[DEBUG] ❌ Could not find calendar container element');
      throw new Error('Could not find the calendar element on the page. Please refresh and try again.');
    }
    
    console.log('[DEBUG] ✅ Found calendar container:', {
      tagName: calendarContainer.tagName,
      className: calendarContainer.className,
      dimensions: `${calendarContainer.offsetWidth}x${calendarContainer.offsetHeight}px`
    });
    
    // Force any styled-components to fully render
    console.log('[DEBUG] Waiting for styled-components to render (500ms)');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get a clean copy of the calendar HTML with all styles applied
    console.log('[DEBUG] Calling captureCalendarHtml()');
    const htmlContent = captureCalendarHtml();
    console.log('[DEBUG] Received HTML content from captureCalendarHtml()');
    
    // Validate the HTML content
    if (!htmlContent || htmlContent.length < 500) {
      console.error(`[DEBUG] ❌ HTML content validation failed - content too short (${htmlContent ? htmlContent.length : 0} chars)`);
      throw new Error('Could not properly capture the calendar. Please try again or contact support.');
    }
    
    console.log(`[DEBUG] ✅ HTML content validation passed: ${htmlContent.length} chars`);
    
    // Combine with other required data
    console.log('[DEBUG] Preparing request data for server');
    const requestData = {
      ...calendarData,
      email,
      htmlContent
    };
    
    console.log('[DEBUG] Sending calendar data to server:', {
      email: email,
      zoneId: calendarData.zoneId,
      contentSize: htmlContent.length,
      endpoint: '/api/pdfexport/calendar'
    });
    
    // Send to the server endpoint
    console.log('[DEBUG] Executing axios.post()');
    try {
      const response = await axios.post('/api/pdfexport/calendar', requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 second timeout for large files
      });
      
      console.log('[DEBUG] ✅ Received server response:', {
        status: response.status,
        statusText: response.statusText,
        dataKeys: Object.keys(response.data),
        success: response.data.status === 'success', 
        message: response.data.message,
        hasPreviewUrl: !!response.data.previewUrl,
      });
      
      // Return the complete response data including preview URL if available
      return {
        ...response.data,
        previewUrl: response.data.previewUrl || null
      };
    } catch (axiosError) {
      console.error('[DEBUG] ❌ Axios request failed:', {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        responseData: axiosError.response?.data || 'No response data'
      });
      
      // Rethrow with better error information
      if (axiosError.response) {
        throw new Error(`Server error: ${axiosError.response.status} ${axiosError.response.statusText} - ${axiosError.response.data.message || 'Unknown error'}`);
      } else if (axiosError.request) {
        throw new Error(`Network error: The server did not respond. Please check your internet connection and try again.`);
      } else {
        throw axiosError;
      }
    }
  } catch (error) {
    console.error('[DEBUG] ❌ Error in exportCalendarToPdf:', error);
    console.error('[DEBUG] Error stack:', error.stack);
    throw error;
  }
};

/**
 * Downloads calendar as PDF directly (without email)
 * 
 * @param {Object} calendarData - Calendar data including month, year, plants, zoneId
 * @returns {Promise} - Promise resolving to response with download URL
 */
export const downloadCalendarPdf = async (calendarData) => {
  console.log('[DEBUG] Starting downloadCalendarPdf process');
  console.log('[DEBUG] Calendar data:', {
    zoneId: calendarData.zoneId,
    year: calendarData.year,
    month: calendarData.month,
    plantsCount: calendarData.plants ? calendarData.plants.length : 0
  });
  
  try {
    // Capture the HTML content
    console.log('[DEBUG] Calling captureCalendarHtml()');
    const htmlContent = captureCalendarHtml();
    console.log('[DEBUG] Received HTML content from captureCalendarHtml()');
    
    // Validate the HTML content
    if (!htmlContent || htmlContent.length < 500) {
      console.error(`[DEBUG] ❌ HTML content validation failed - content too short (${htmlContent ? htmlContent.length : 0} chars)`);
      throw new Error('Could not properly capture the calendar. Please try again or contact support.');
    }
    
    console.log(`[DEBUG] ✅ HTML content validation passed: ${htmlContent.length} chars`);
    
    // Combine with other required data
    console.log('[DEBUG] Preparing request data for server');
    const requestData = {
      ...calendarData,
      htmlContent
    };
    
    // Send to the server endpoint
    console.log('[DEBUG] Sending request to server for direct PDF download with responseType: blob');
    try {
      const response = await axios.post('/api/pdfexport/calendar', requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'blob', // Important for handling binary data
        timeout: 60000 // 60 second timeout for large files
      });
      
      console.log('[DEBUG] ✅ Received server response with blob:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
        blobSize: response.data.size,
        blobType: response.data.type
      });
      
      // Verify we got a PDF
      if (response.headers['content-type'] !== 'application/pdf' && 
          response.data.type !== 'application/pdf') {
        console.error('[DEBUG] ❌ Response is not a PDF:', response.headers['content-type'] || response.data.type);
        throw new Error('The server did not return a PDF. Please try again.');
      }
      
      // Create a download link
      console.log('[DEBUG] Creating blob URL for download');
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      
      // Create a filename with month and year if available
      const monthName = calendarData.month 
        ? new Date(calendarData.year || new Date().getFullYear(), calendarData.month - 1, 1).toLocaleString('default', { month: 'long' }) 
        : 'Annual';
      const yearValue = calendarData.year || new Date().getFullYear();
      
      const filename = `garden-calendar-${monthName}-${yearValue}.pdf`;
      console.log(`[DEBUG] Setting download filename: ${filename}`);
      link.setAttribute('download', filename);
      
      // Trigger download
      console.log('[DEBUG] Appending link to body and triggering click');
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      console.log('[DEBUG] Cleaning up: removing link and revoking blob URL');
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('[DEBUG] ✅ PDF download process completed successfully');
      return { success: true, message: 'PDF downloaded successfully' };
    } catch (axiosError) {
      console.error('[DEBUG] ❌ Axios request failed:', {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        responseType: axiosError.response?.headers?.['content-type']
      });
      
      // Try to parse error message if not a blob
      if (axiosError.response && 
          axiosError.response.data && 
          axiosError.response.headers['content-type'] !== 'application/pdf') {
        
        // Convert blob to text to see error message
        try {
          const errorText = await new Response(axiosError.response.data).text();
          console.error('[DEBUG] Server error response:', errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            throw new Error(`Server error: ${errorJson.message || errorJson.error || 'Unknown error'}`);
          } catch (jsonError) {
            throw new Error(`Server error: ${errorText.substring(0, 100)}`);
          }
        } catch (blobError) {
          console.error('[DEBUG] Could not read error blob:', blobError);
          throw axiosError;
        }
      }
      
      throw axiosError;
    }
  } catch (error) {
    console.error('[DEBUG] ❌ Error in downloadCalendarPdf:', error);
    console.error('[DEBUG] Error stack:', error.stack);
    throw error;
  }
};