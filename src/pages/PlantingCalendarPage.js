import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Table } from 'react-bootstrap';
import EmailCaptureModal from '../components/EmailCaptureModal';

const PlantingCalendarPage = () => {
  const [zone, setZone] = useState('');
  const [calendarData, setCalendarData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedZoneName, setSelectedZoneName] = useState('');

  // Hardcoded zones data for simplicity
  const zones = [
    { value: '3b', label: 'Zone 3b' },
    { value: '4a', label: 'Zone 4a' },
    { value: '4b', label: 'Zone 4b' },
    { value: '5a', label: 'Zone 5a' },
    { value: '5b', label: 'Zone 5b' },
    { value: '6a', label: 'Zone 6a' },
    { value: '6b', label: 'Zone 6b' },
    { value: '7a', label: 'Zone 7a' },
    { value: '7b', label: 'Zone 7b' },
    { value: '8a', label: 'Zone 8a' },
    { value: '8b', label: 'Zone 8b' },
    { value: '9a', label: 'Zone 9a' },
    { value: '9b', label: 'Zone 9b' },
    { value: '10a', label: 'Zone 10a' },
    { value: '10b', label: 'Zone 10b' }
  ];

  // Placeholder data for preview - this would be replaced by real data from backend
  const getPreviewData = (zoneValue) => {
    return {
      zone: zoneValue,
      firstFrost: zoneValue === '7b' ? 'November 15' : 'Varies by zone',
      lastFrost: zoneValue === '7b' ? 'March 20' : 'Varies by zone',
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
        },
        {
          name: 'Peppers',
          indoorStart: 'Early March',
          directSow: 'Not recommended',
          transplant: 'After soil reaches 65°F',
          harvest: 'July - October'
        }
      ]
    };
  };

  const handleZoneChange = (e) => {
    const zoneValue = e.target.value;
    setZone(zoneValue);
    
    if (zoneValue) {
      // Get zone label for display
      const selectedZone = zones.find(z => z.value === zoneValue);
      setSelectedZoneName(selectedZone ? selectedZone.label : zoneValue);
      
      // Get preview data
      setCalendarData(getPreviewData(zoneValue));
      setShowPreview(true);
    } else {
      setShowPreview(false);
      setCalendarData(null);
    }
  };

  const handleExportCalendar = () => {
    setShowEmailModal(true);
  };

  const handleEmailSubmitSuccess = (data) => {
    // Simple success handler that just logs the success
    // Most importantly, it does NOTHING that would cause page navigation
    console.log('Email submission successful');
    
    // Log the response data
    console.log('Response data:', data);
    
    if (data && data.calendar) {
      console.log('Calendar requested for zone:', data.calendar.zone);
      
      // Let the user know their email was sent
      if (data.email_sent) {
        console.log(`Email sent to: ${data.email_address}`);
        
        // If we have a preview URL (for development), show it
        if (data.preview_url) {
          console.log('Email preview URL:', data.preview_url);
          
          // Use setTimeout to ensure the DOM elements are available
          setTimeout(() => {
            const previewContainer = document.getElementById('email-preview-container');
            const previewLink = document.getElementById('email-preview-link');
            
            if (previewContainer && previewLink) {
              previewContainer.classList.remove('d-none');
              previewLink.href = data.preview_url;
              previewLink.textContent = data.preview_url;
            }
          }, 100);
        }
      } else {
        console.log('Email could not be sent, but request was processed');
      }
    }
    
    // DO NOT open any URLs or navigate away
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center mb-5">
        <Col md={8} lg={6}>
          <h1 className="text-center mb-4">Planting Calendar</h1>
          <p className="text-center">
            Get a customized planting calendar for your hardiness zone.
            Know exactly when to plant, transplant, and harvest for your area.
          </p>
          
          <Card className="shadow-sm">
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Select Your Hardiness Zone</Form.Label>
                  <Form.Select 
                    value={zone} 
                    onChange={handleZoneChange}
                    className="mb-3"
                  >
                    <option value="">Select a zone</option>
                    {zones.map(zone => (
                      <option key={zone.value} value={zone.value}>
                        {zone.label}
                      </option>
                    ))}
                  </Form.Select>
                  <div className="d-flex justify-content-center">
                    <a 
                      href="https://planthardiness.ars.usda.gov/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      Not sure what zone you're in? Find out here.
                    </a>
                  </div>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {showPreview && calendarData && (
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow">
              <Card.Header className="bg-success text-white py-3">
                <h2 className="mb-0 text-center">
                  {selectedZoneName} Planting Calendar
                </h2>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5>Important Dates:</h5>
                    <p className="mb-1"><strong>Average Last Spring Frost:</strong> {calendarData.lastFrost}</p>
                    <p><strong>Average First Fall Frost:</strong> {calendarData.firstFrost}</p>
                  </div>
                  <Button 
                    variant="primary" 
                    className="d-flex align-items-center" 
                    onClick={handleExportCalendar}
                  >
                    <i className="fas fa-download me-2"></i> Export Full Calendar
                  </Button>
                </div>
                
                <div className="mb-4">
                  <h5>Calendar Preview:</h5>
                  <p className="text-muted">
                    This is a preview of your planting calendar. The full calendar 
                    includes 30+ vegetables and detailed planting information for your zone.
                  </p>
                </div>

                <Table responsive striped bordered hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Vegetable</th>
                      <th>Start Indoors</th>
                      <th>Direct Sow</th>
                      <th>Transplant</th>
                      <th>Harvest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calendarData.vegetables.map((veg, index) => (
                      <tr key={index}>
                        <td><strong>{veg.name}</strong></td>
                        <td>{veg.indoorStart}</td>
                        <td>{veg.directSow}</td>
                        <td>{veg.transplant}</td>
                        <td>{veg.harvest}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                
                <div className="text-center mt-4">
                  <Button 
                    variant="success" 
                    size="lg"
                    onClick={handleExportCalendar}
                  >
                    Export Full Calendar
                  </Button>
                </div>
              </Card.Body>
              <Card.Footer className="text-center text-muted">
                <small>
                  This planting calendar is a guide based on general frost dates for your zone.
                  Your specific microclimate may vary.
                </small>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      )}

      {/* Email Capture Modal */}
      <EmailCaptureModal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
        onSuccess={handleEmailSubmitSuccess}
        resourceType="calendar"
        zoneName={zone}
      />
    </Container>
  );
};

export default PlantingCalendarPage;