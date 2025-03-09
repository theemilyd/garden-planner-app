import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { exportCalendarToPdf } from '../utils/pdfExport';

/**
 * Export Calendar Modal Component
 * 
 * Renders a modal that collects the user's email to send the exported calendar
 */
const ExportCalendarModal = ({ show, onHide, calendarData }) => {
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({ success: false, message: '', previewUrl: null });
  const [showResult, setShowResult] = useState(false);
  const [exportStage, setExportStage] = useState('idle'); // idle, capturing, generating, sending, complete
  
  // Debug component lifecycle
  useEffect(() => {
    console.log('[DEBUG] ExportCalendarModal - show state changed:', show);
    if (show) {
      console.log('[DEBUG] Calendar data received:', {
        zoneId: calendarData?.zoneId,
        year: calendarData?.year, 
        month: calendarData?.month,
        plantsCount: calendarData?.plants?.length
      });
      
      // Reset state when modal opens
      setExportStage('idle');
      setShowResult(false);
    }
  }, [show, calendarData]);

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email input change
  const handleEmailChange = (e) => {
    const value = e.target.value;
    console.log('[DEBUG] Email input changed:', value);
    setEmail(value);
    const isValid = validateEmail(value) || value.length === 0;
    setEmailValid(isValid);
    console.log('[DEBUG] Email validation result:', isValid);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[DEBUG] Form submitted with email:', email);
    
    // Validate email one more time
    if (!validateEmail(email)) {
      console.log('[DEBUG] Final email validation failed');
      setEmailValid(false);
      return;
    }
    
    // Reset states
    setLoading(true);
    setShowResult(false);
    setResult({ success: false, message: '', previewUrl: null });
    setExportStage('capturing');
    
    try {
      console.log('[DEBUG] Starting calendar export process...');
      
      // Check calendar data
      if (!calendarData) {
        console.error('[DEBUG] ❌ No calendar data available');
        throw new Error('No calendar data available. Please try again.');
      }
      
      console.log('[DEBUG] Calendar data being sent:', {
        zoneId: calendarData.zoneId,
        month: calendarData.month,
        year: calendarData.year,
        plantCount: calendarData.plants ? calendarData.plants.length : 0,
        plantsInfo: calendarData.plants ? calendarData.plants.map(p => p.id).join(',') : 'none'
      });
      
      // Ensure all needed data is present
      if (!calendarData.zoneId) {
        console.error('[DEBUG] ❌ Missing zone information');
        throw new Error('Missing zone information. Please select a growing zone first.');
      }
      
      // Update status messages during the process
      const updateStages = [
        { stage: 'capturing', message: 'Capturing your calendar content...', delay: 1000 },
        { stage: 'generating', message: 'Generating PDF from calendar...', delay: 3000 },
        { stage: 'sending', message: 'Sending email with your calendar...', delay: 6000 }
      ];
      
      // Set up sequential status updates
      updateStages.forEach(({ stage, message, delay }) => {
        setTimeout(() => {
          if (loading) { // Only update if still loading
            setExportStage(stage);
            setResult({
              success: true,
              message: message
            });
            setShowResult(true);
          }
        }, delay);
      });
      
      // Call the export function with enhanced error handling
      console.log('[DEBUG] Calling exportCalendarToPdf function');
      const response = await exportCalendarToPdf(email, calendarData);
      
      console.log('[DEBUG] Export response received:', response);
      setExportStage('complete');
      
      // Set success result with preview URL if available
      setResult({
        success: true,
        message: response.message || 'Your calendar email is ready to view!',
        previewUrl: response.previewUrl || null
      });
      setShowResult(true);
      console.log('[DEBUG] Success result set with previewUrl:', !!response.previewUrl);
      
      // Only auto-hide if no preview URL (in production)
      if (!response.previewUrl) {
        console.log('[DEBUG] Setting auto-hide timeout (3s)');
        setTimeout(() => {
          console.log('[DEBUG] Auto-hiding modal after success');
          setShowResult(false);
          onHide();
        }, 3000);
      }
    } catch (error) {
      console.error('[DEBUG] ❌ Error in export process:', error);
      setExportStage('error');
      
      // Extract error details from response if available
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to export calendar. Please try again.';
      
      // Log detailed error information
      console.error('[DEBUG] Detailed error information:', {
        message: errorMessage,
        status: error.response?.status,
        details: error.response?.data?.details || 'No additional details'
      });
      
      // Set error result
      setResult({
        success: false,
        message: errorMessage
      });
      setShowResult(true);
      console.log('[DEBUG] Error result set:', errorMessage);
    } finally {
      setLoading(false);
      console.log('[DEBUG] Loading state set to false');
    }
  };
  
  // Get progress based on current stage
  const getProgressValue = () => {
    switch (exportStage) {
      case 'capturing': return 25;
      case 'generating': return 50;
      case 'sending': return 75;
      case 'complete': return 100;
      default: return 0;
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Export Your Planting Calendar</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && (
          <div className="mb-3">
            <ProgressBar 
              animated 
              now={getProgressValue()} 
              label={`${getProgressValue()}%`} 
              variant={exportStage === 'error' ? 'danger' : 'success'}
            />
            <p className="text-center mt-2 text-muted small">
              {exportStage === 'capturing' && 'Capturing calendar content...'}
              {exportStage === 'generating' && 'Creating PDF document...'}
              {exportStage === 'sending' && 'Sending email with calendar...'}
              {exportStage === 'complete' && 'Complete!'}
            </p>
          </div>
        )}
      
        {showResult && (
          <Alert variant={result.success ? 'success' : 'danger'}>
            {result.message}
            {result.previewUrl && (
              <div className="mt-3">
                <p><strong>Testing mode:</strong> For development only</p>
                <a 
                  href={result.previewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-primary"
                >
                  View Test Email
                </a>
                <p className="mt-2 small text-muted">
                  In production, real emails will be sent. This preview is only for testing.
                </p>
              </div>
            )}
          </Alert>
        )}
        
        <p>Enter your email address to receive your planting calendar as a PDF.</p>
        
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="exportEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              isInvalid={!emailValid}
              disabled={loading}
              required
              autoFocus
            />
            {!emailValid && (
              <Form.Control.Feedback type="invalid">
                Please enter a valid email address.
              </Form.Control.Feedback>
            )}
          </Form.Group>
          
          <div className="d-flex justify-content-end mt-3">
            <Button 
              variant="secondary" 
              onClick={onHide} 
              className="me-2"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Exporting...
                </>
              ) : (
                'Send to Email'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ExportCalendarModal;