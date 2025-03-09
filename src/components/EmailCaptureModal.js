import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Stack, Badge } from 'react-bootstrap';
// Removed unused axios import
// Import jsPDF if available in your project, or you can add it with npm install jspdf
// import { jsPDF } from 'jspdf';

const EmailCaptureModal = ({ show, onHide, onSuccess, resourceType, zoneName }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile screens
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 576);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Function to test direct email sending - commented out as it's unused
  // const testDirectEmail = async (emailAddress) => {
  //   try {
  //     console.log(`Testing direct email to: ${emailAddress}`);
  //     // Implementation would go here
  //   } catch (error) {
  //     console.error('Error sending test email:', error);
  //   }
  // };
  
  // Fallback function to handle API failure
  // eslint-disable-next-line no-unused-vars
  const generateClientSidePDF = () => {
    // This is a placeholder for client-side PDF generation
    // In a real implementation, you would use jsPDF or another library
    console.log('Generating client-side PDF for zone:', zoneName);
    
    // For now, we'll just create a simple object with calendar data
    const calendarData = {
      zone: zoneName,
      calendar_url: '#', // No actual PDF yet
      vegetables: [
        {
          name: 'Tomatoes',
          indoorStart: 'Early March',
          directSow: 'Not recommended',
          transplant: 'After last frost',
          harvest: 'July - October'
        },
        {
          name: 'Lettuce',
          indoorStart: 'February',
          directSow: 'March - September',
          transplant: 'March - April',
          harvest: 'Year-round with succession planting'
        }
      ]
    };
    
    return calendarData;
  };

  const handleSubmit = async (e) => {
    // Ensure we prevent the default form submission which can cause page reload
    e.preventDefault();
    
    // Only proceed if not already loading
    if (loading) return;
    
    setLoading(true);
    setError('');

    try {
      console.log(`Preparing to submit email form for: ${email}`);
      
      // Make sure we're using the full URL if needed
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';
      
      // Get the calendar data from the window object if it exists
      const calendarData = window.currentCalendarData || {};
      
      // Different logic based on the resource type
      if (resourceType === 'calendar') {
        // Use the direct PDF generation and email route
        const pdfEndpoint = `${apiBaseUrl}/api/pdfexport/calendar`;
        console.log(`Submitting calendar export request to ${pdfEndpoint}`);
        
        // Prepare data for the PDF export
        const pdfData = {
          email,
          zone: zoneName,
          plants: calendarData.plants || [],
          year: calendarData.year || new Date().getFullYear(),
          month: calendarData.month || new Date().getMonth() + 1,
          zoneId: calendarData.zoneId || null,
          htmlContent: calendarData.htmlContent || null,
          frostDates: calendarData.frostDates || null,
          marketing_consent: marketingConsent
        };
        
        console.log('Sending PDF data to server:', {
          email: pdfData.email,
          zone: pdfData.zone,
          plantsCount: pdfData.plants.length,
          hasHtmlContent: !!pdfData.htmlContent,
          htmlContentLength: pdfData.htmlContent ? pdfData.htmlContent.length : 0
        });
        
        console.log('Sending PDF export data:', pdfData);
        
        try {
          const response = await fetch(pdfEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(pdfData)
          });
          
          console.log('Response status:', response.status);
          
          // Clone the response before reading it to avoid "body stream already read" error
          const responseClone = response.clone();
          
          let responseData;
          try {
            responseData = await response.json();
            console.log('PDF export response:', responseData);
          } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
            // Use the cloned response for text() since the original response body was consumed
            const textResponse = await responseClone.text();
            console.log('Raw response text:', textResponse);
            throw new Error(`Failed to parse response: ${jsonError.message}`);
          }
          
          if (!response.ok) {
            const errorMessage = responseData?.message || `HTTP error! Status: ${response.status}`;
            console.error('Response not OK:', errorMessage);
            throw new Error(errorMessage);
          }
          
          if (responseData.status === 'success') {
            console.log('PDF export successful');
            
            // Update the UI to show success
            setSubmitted(true);
            setLoading(false);
            
            // Call the onSuccess callback if provided
            if (onSuccess && typeof onSuccess === 'function') {
              onSuccess(responseData.data);
            }
            
            // If we have a preview URL (for development), show it
            if (responseData.data?.preview_url) {
              console.log('Email preview URL:', responseData.data.preview_url);
              
              // Use setTimeout to ensure the DOM elements are available
              setTimeout(() => {
                const previewContainer = document.getElementById('email-preview-container');
                const previewLink = document.getElementById('email-preview-link');
                
                if (previewContainer && previewLink) {
                  previewContainer.classList.remove('d-none');
                  previewLink.setAttribute('data-url', responseData.data.preview_url);
                  previewLink.textContent = responseData.data.preview_url;
                }
              }, 100);
            }
          } else {
            console.error('PDF export failed:', responseData.message);
            setError(responseData.message || 'Failed to export PDF. Please try again.');
            setLoading(false);
          }
        } catch (pdfError) {
          console.error('PDF generation error:', pdfError);
          setError(`Failed to generate the PDF: ${pdfError.message}. Please try again or contact support.`);
          setLoading(false);
        }
      } else if (resourceType === 'recommendations') {
        // Handle recommendations request
        const endpoint = `${apiBaseUrl}/api/newsletter/garden-recommendations`;
        const data = { 
          email, 
          zone: zoneName,
          garden_size: 'medium',
          experience_level: 'beginner',
          marketing_consent: marketingConsent,
          preferences: {
            vegetables: true,
            herbs: true
          }
        };
        
        console.log(`Submitting recommendations request to ${endpoint}`);
        
        // Make the API call
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.message || 'Server error');
        }
        
        console.log('Successfully received response:', responseData);
        
        // Set submitted state to true to show success screen
        setSubmitted(true);
        
        if (onSuccess) {
          onSuccess(responseData.data);
        }
      } else {
        // Handle other newsletter subscription types
        const endpoint = `${apiBaseUrl}/api/newsletter/planting-calendar`;
        const data = { 
          email, 
          hardiness_zone: zoneName,
          marketing_consent: marketingConsent 
        };
        
        console.log(`Submitting request to ${endpoint}`);
        
        // Make the API call
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.message || 'Server error');
        }
        
        console.log('Successfully received response:', responseData);
        
        // Set submitted state to true to show success screen
        setSubmitted(true);
        
        if (onSuccess) {
          onSuccess(responseData.data);
        }
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
      contentClassName="border-0 shadow"
      size="lg"
    >
      <Modal.Header className="bg-gradient-success text-white border-0" style={{background: 'linear-gradient(135deg, #3A7B5E, #56A978)'}}>
        <div className="d-flex align-items-center w-100">
          <div className="me-3 d-flex align-items-center justify-content-center rounded-circle bg-white" 
               style={{width: '38px', height: '38px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
            <span role="img" aria-label="plant" style={{fontSize: '24px'}}>🌱</span>
          </div>
          <Modal.Title>
            {resourceType === 'calendar' 
              ? 'Export Your Personalized Planting Calendar' 
              : 'Get Custom Garden Recommendations'}
          </Modal.Title>
        </div>
      </Modal.Header>

      <Modal.Body className={`${isMobile ? 'px-3' : 'px-4'} py-4 bg-light`}>
        {!submitted ? (
          <>
            <div className="mb-4 p-3 bg-white rounded shadow-sm">
              <h5 className="text-success">
                {resourceType === 'calendar'
                  ? 'Never miss optimal planting times again!'
                  : 'Grow your best garden yet!'}
              </h5>
              <p>
                {resourceType === 'calendar'
                  ? `Your personalized planting calendar for Zone ${zoneName} is ready! Enter your email to export it.`
                  : 'Get personalized plant recommendations tailored to your garden. Enter your email to continue.'}
              </p>
              <div className="d-flex align-items-center mt-3">
                <Badge bg="success" className="me-2 py-2 px-3">10,000+</Badge>
                <span className="small text-muted">gardeners are already using our tools</span>
              </div>
            </div>
            
            <Form 
              onSubmit={(e) => {
                e.preventDefault(); // Prevent form submission
                handleSubmit(e);
              }}
              className={`bg-white rounded shadow-sm ${isMobile ? 'p-2' : 'p-3'}`}>
              {/* Removed method and action which can cause navigation */}
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-success"
                />
                <Form.Text className="text-muted">
                  We'll send you your {resourceType === 'calendar' ? 'calendar' : 'recommendations'} to this email address.
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="marketing-consent"
                  label="I agree to receive gardening tips and updates by email (you can unsubscribe at any time)"
                  checked={marketingConsent}
                  onChange={() => setMarketingConsent(!marketingConsent)}
                  className="small"
                />
              </Form.Group>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Stack direction={isMobile ? "vertical" : "horizontal"} 
                     gap={isMobile ? 2 : 3} 
                     className={`mt-4 ${isMobile ? "d-grid" : "justify-content-between"}`}>
                <Button 
                  variant="outline-secondary" 
                  onClick={onHide}
                  className={isMobile ? "order-2 py-2" : ""}
                  style={isMobile ? {width: '100%'} : {}}
                >
                  Cancel
                </Button>
                <Button 
                  variant="success" 
                  type="button" // Changed from submit to button to avoid form submission
                  disabled={loading}
                  onClick={(e) => {
                    // This is now the only handler for the button click
                    handleSubmit(e);
                  }}
                  className={`shadow-sm ${isMobile ? "order-1 mb-2 py-3" : ""}`}
                  style={{
                    background: 'linear-gradient(135deg, #3A7B5E, #56A978)',
                    width: isMobile ? '100%' : 'auto'
                  }}
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
                      Processing...
                    </>
                  ) : (
                    <>
                      {resourceType === 'calendar' 
                        ? <><i className="fas fa-download me-2"></i>Export Calendar</> 
                        : <><i className="fas fa-leaf me-2"></i>Get Recommendations</>
                      }
                    </>
                  )}
                </Button>
              </Stack>
            </Form>
          </>
        ) : (
          <div className={`text-center py-4 bg-white rounded shadow-sm ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="mb-4">
              <div className="bg-success text-white rounded-circle mx-auto d-flex align-items-center justify-content-center" 
                   style={{ width: '90px', height: '90px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <i className="fas fa-check fa-3x"></i>
              </div>
            </div>
            <h4 className="mb-3">Thank You!</h4>
            <div className="mb-4 p-3 bg-light rounded">
              <p className="mb-2">
                {resourceType === 'calendar'
                  ? 'Your planting calendar request has been processed successfully.'
                  : 'Your garden recommendations request has been processed successfully.'}
              </p>
              <p className="small text-muted mb-0">
                We've sent the information to your email address. Please check your inbox in a few minutes. 
                If you don't see it, please check your spam folder.
              </p>
              <p className="small text-success mt-2">
                You can continue using the app while we process your request.
                <br/>
                <strong>Thank you for using our garden planner!</strong>
              </p>
              <div className="mt-3 p-2 border-start border-success border-3 bg-light">
                <p className="small mb-0 text-muted">
                  <i className="fas fa-info-circle me-1"></i> <strong>Note:</strong> Due to email delivery times, it may take 
                  a few minutes for the email to arrive. If you still don't receive it, please try again later.
                </p>
              </div>
              
              {/* Development preview link - this would be removed in production */}
              <div id="email-preview-container" className="d-none mt-3">
                <p className="small mb-1 text-primary">
                  <strong>Development:</strong> View your test email here:
                </p>
                <button 
                  id="email-preview-link" 
                  onClick={(e) => {
                    const url = e.target.getAttribute('data-url');
                    if (url) window.open(url, '_blank');
                  }}
                  data-url=""
                  className="small text-primary text-break border-0 bg-transparent p-0 text-decoration-underline" 
                  style={{ cursor: 'pointer' }}
                >
                  [Preview link will appear here]
                </button>
              </div>
            </div>
            
            <div className="d-flex justify-content-center">
              <Button 
                variant="success" 
                onClick={onHide}
                size={isMobile ? "md" : "lg"}
                className={`shadow-sm ${isMobile ? 'w-100 py-3' : 'px-4'}`}
                style={{background: 'linear-gradient(135deg, #3A7B5E, #56A978)'}}
              >
                <i className="fas fa-thumbs-up me-2"></i> Continue
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-light border-0 py-3">
        <div className="d-flex justify-content-center align-items-center w-100">
          <i className="fas fa-lock text-muted me-2" style={{fontSize: '0.8rem'}}></i>
          <small className="text-muted text-center">
            Your email is secure. We respect your privacy and you can unsubscribe at any time.
          </small>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default EmailCaptureModal;