import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Tab, Nav, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileDownload, faCalendarAlt, faListUl, faInfo, 
  faLeaf, faSeedling, faImages, faCrown
} from '@fortawesome/free-solid-svg-icons';

/**
 * PDF Exporter Component
 * 
 * Provides an interface for generating and downloading PDF documents:
 * - Monthly/Annual Planting Calendars
 * - Plant Information Sheets
 * - Garden Layout & Reports
 */
const PDFExporter = ({ userSubscription, garden, plants, zone }) => {
  const [format, setFormat] = useState('calendar-monthly');
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState('standard');
  const [customOptions, setCustomOptions] = useState({
    showImages: true,
    includeNotes: true,
    includeCompanionPlants: true,
    colorCoded: true,
    includePlantingDepth: true
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Check if user has premium access
  const isPremium = userSubscription && userSubscription !== 'free';
  
  // Handle form submission to generate PDF
  const handleGeneratePDF = async (e) => {
    e.preventDefault();
    
    if (!isPremium) {
      setError("Exporting PDF calendars is a premium feature. Please upgrade your subscription.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // In a real implementation, this would call an API endpoint
      // Mock implementation for demonstration
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful PDF generation
      setSuccess("PDF successfully generated! Your download should begin shortly.");
      
      // Simulate download by logging to console
      console.log('Generating PDF with options:', {
        format,
        template,
        customOptions,
        selectedMonth,
        garden: garden?.name,
        plants: plants?.length,
        zone: zone?.code
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle change to custom options
  const handleOptionChange = (e) => {
    const { name, checked } = e.target;
    setCustomOptions(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Template preview renderer
  const renderTemplatePreview = () => {
    if (format === 'calendar-monthly') {
      return (
        <div className="template-preview p-3 bg-white border rounded mb-3">
          <div className="text-center mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            <h5 className="mb-0" style={{ color: '#4A7C59' }}>July 2023 Planting Calendar</h5>
            <div className="small text-muted">Zone {zone?.code || '8b'}</div>
          </div>
          <div className="calendar-grid-preview">
            {/* Mock calendar grid */}
            <div className="d-flex justify-content-between mb-2">
              <div style={{ width: '14%', textAlign: 'center', fontWeight: 'bold' }}>Sun</div>
              <div style={{ width: '14%', textAlign: 'center', fontWeight: 'bold' }}>Mon</div>
              <div style={{ width: '14%', textAlign: 'center', fontWeight: 'bold' }}>Tue</div>
              <div style={{ width: '14%', textAlign: 'center', fontWeight: 'bold' }}>Wed</div>
              <div style={{ width: '14%', textAlign: 'center', fontWeight: 'bold' }}>Thu</div>
              <div style={{ width: '14%', textAlign: 'center', fontWeight: 'bold' }}>Fri</div>
              <div style={{ width: '14%', textAlign: 'center', fontWeight: 'bold' }}>Sat</div>
            </div>
            <div className="d-flex justify-content-between mb-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{ 
                  width: '14%', 
                  height: '50px', 
                  border: '1px solid #eee',
                  borderRadius: '4px',
                  padding: '2px',
                  fontSize: '0.8rem'
                }}>
                  <div className="text-end">{i + 1}</div>
                  {i === 2 && <div className="bg-success text-white px-1 rounded mt-1" style={{ fontSize: '0.7rem' }}>Plant Tomatoes</div>}
                  {i === 5 && <div className="bg-primary text-white px-1 rounded mt-1" style={{ fontSize: '0.7rem' }}>Sow Basil</div>}
                </div>
              ))}
            </div>
            <div className="small text-muted text-center mt-3">
              {customOptions.colorCoded && "Color-coded by plant family • "}
              {customOptions.includeNotes && "Includes notes • "}
              {customOptions.showImages && "With plant images"}
            </div>
          </div>
        </div>
      );
    } else if (format === 'plant-info') {
      return (
        <div className="template-preview p-3 bg-white border rounded mb-3">
          <div className="d-flex align-items-center mb-3">
            <div 
              className="rounded-circle me-3"
              style={{ width: '50px', height: '50px', backgroundColor: '#C8D5B9' }}
            ></div>
            <div>
              <h5 className="mb-0" style={{ fontFamily: "'Playfair Display', serif", color: '#4A7C59' }}>Tomato</h5>
              <div className="text-muted small"><em>Solanum lycopersicum</em></div>
            </div>
          </div>
          
          <div className="info-grid mb-3">
            <div className="row g-2">
              <div className="col-md-6">
                <div className="border rounded p-2">
                  <div className="small fw-bold">Growing Requirements</div>
                  <div className="small">Full Sun • pH 6.0-6.8 • 70-85°F</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="border rounded p-2">
                  <div className="small fw-bold">Days to Maturity</div>
                  <div className="small">70-85 days</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="planting-timeline border rounded p-2 mb-3">
            <div className="small fw-bold mb-1">Planting Calendar</div>
            <div className="d-flex">
              {['J','F','M','A','M','J','J','A','S','O','N','D'].map((month, i) => (
                <div key={i} style={{ width: '8.33%', textAlign: 'center', fontSize: '0.7rem' }}>
                  {month}
                  <div 
                    style={{ 
                      height: '10px', 
                      backgroundColor: i >= 2 && i <= 5 ? '#8FC0A9' : 'transparent',
                      margin: '2px 1px',
                      borderRadius: '2px'
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
          
          {customOptions.includeCompanionPlants && (
            <div className="companion-section small border rounded p-2 mb-3">
              <div className="fw-bold mb-1">Companion Plants</div>
              <div>Basil • Marigold • Nasturtium • Garlic</div>
            </div>
          )}
          
          {customOptions.includePlantingDepth && (
            <div className="planting-details small border rounded p-2">
              <div className="fw-bold mb-1">Planting Details</div>
              <div>Depth: 1/4 inch • Spacing: 24-36 inches • Rows: 48 inches</div>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="template-preview p-3 bg-white border rounded mb-3">
          <div className="text-center mb-3">
            <h5 style={{ fontFamily: "'Playfair Display', serif", color: '#4A7C59' }}>
              {garden?.name || 'Your Garden'} Layout
            </h5>
          </div>
          
          <div className="garden-layout-preview mb-3" style={{ height: '100px', backgroundColor: '#F5F5F5', borderRadius: '4px' }}>
            <div className="d-flex justify-content-center align-items-center h-100 text-muted">
              {customOptions.showImages ? 'Garden layout with plant images' : 'Garden layout diagram'}
            </div>
          </div>
          
          <div className="plant-list small">
            <div className="fw-bold mb-1">Plants in this Garden:</div>
            <ul className="mb-0 ps-3">
              <li>Tomatoes (Cherry, Roma, Beefsteak)</li>
              <li>Cucumbers</li>
              <li>Basil</li>
              <li>Zucchini</li>
            </ul>
          </div>
        </div>
      );
    }
  };
  
  // If not premium, show upgrade message
  if (!isPremium) {
    return (
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <FontAwesomeIcon icon={faFileDownload} className="me-2" />
          PDF Export
        </Card.Header>
        <Card.Body className="text-center py-5">
          <FontAwesomeIcon icon={faCrown} size="3x" className="mb-3 text-warning" />
          <h4>PDF Export is a Premium Feature</h4>
          <p className="mb-4">
            Generate beautiful, customized PDF calendars, plant information sheets, 
            and garden layouts with our premium subscription.
          </p>
          <Button variant="warning" href="/upgrade">
            Upgrade to Premium
          </Button>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-white d-flex justify-content-between">
        <div>
          <FontAwesomeIcon icon={faFileDownload} className="me-2" />
          PDF Export
        </div>
        {isPremium && (
          <Badge pill style={{ backgroundColor: '#F4B942', color: 'black' }}>
            Premium Feature
          </Badge>
        )}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleGeneratePDF}>
          <Row>
            <Col md={4}>
              <div className="mb-3">
                <Form.Label>Export Format</Form.Label>
                <div className="d-flex flex-column gap-2">
                  <Button 
                    variant={format === 'calendar-monthly' ? 'primary' : 'outline-primary'}
                    className="text-start"
                    onClick={() => setFormat('calendar-monthly')}
                    type="button"
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    Monthly Calendar
                  </Button>
                  
                  <Button 
                    variant={format === 'calendar-annual' ? 'primary' : 'outline-primary'}
                    className="text-start"
                    onClick={() => setFormat('calendar-annual')}
                    type="button"
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    Annual Calendar
                  </Button>
                  
                  <Button 
                    variant={format === 'plant-info' ? 'primary' : 'outline-primary'}
                    className="text-start"
                    onClick={() => setFormat('plant-info')}
                    type="button"
                  >
                    <FontAwesomeIcon icon={faLeaf} className="me-2" />
                    Plant Information Sheets
                  </Button>
                  
                  <Button 
                    variant={format === 'garden-layout' ? 'primary' : 'outline-primary'}
                    className="text-start"
                    onClick={() => setFormat('garden-layout')}
                    type="button"
                  >
                    <FontAwesomeIcon icon={faSeedling} className="me-2" />
                    Garden Layout & Report
                  </Button>
                </div>
              </div>
              
              {format === 'calendar-monthly' && (
                <div className="mb-3">
                  <Form.Label>Month</Form.Label>
                  <Form.Select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  >
                    {[
                      'January', 'February', 'March', 'April', 
                      'May', 'June', 'July', 'August',
                      'September', 'October', 'November', 'December'
                    ].map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </Form.Select>
                </div>
              )}
              
              <div className="mb-3">
                <Form.Label>Template</Form.Label>
                <Form.Select 
                  value={template} 
                  onChange={(e) => setTemplate(e.target.value)}
                >
                  <option value="standard">Standard</option>
                  <option value="minimal">Minimal</option>
                  <option value="decorative">Decorative</option>
                </Form.Select>
              </div>
            </Col>
            
            <Col md={8}>
              <div className="mb-3">
                <Form.Label>Preview</Form.Label>
                {renderTemplatePreview()}
                
                <div className="custom-options mb-3">
                  <div className="fw-bold mb-2">Customize Content:</div>
                  <Row>
                    <Col sm={6}>
                      <Form.Check 
                        type="switch"
                        id="showImages"
                        label="Include Plant Images"
                        checked={customOptions.showImages}
                        onChange={handleOptionChange}
                        name="showImages"
                      />
                      <Form.Check 
                        type="switch"
                        id="includeNotes"
                        label="Include Notes"
                        checked={customOptions.includeNotes}
                        onChange={handleOptionChange}
                        name="includeNotes"
                      />
                      <Form.Check 
                        type="switch"
                        id="includeCompanionPlants"
                        label="Show Companion Plants"
                        checked={customOptions.includeCompanionPlants}
                        onChange={handleOptionChange}
                        name="includeCompanionPlants"
                      />
                    </Col>
                    <Col sm={6}>
                      <Form.Check 
                        type="switch"
                        id="colorCoded"
                        label="Color-code Plant Families"
                        checked={customOptions.colorCoded}
                        onChange={handleOptionChange}
                        name="colorCoded"
                      />
                      <Form.Check 
                        type="switch"
                        id="includePlantingDepth"
                        label="Include Planting Depth"
                        checked={customOptions.includePlantingDepth}
                        onChange={handleOptionChange}
                        name="includePlantingDepth"
                      />
                    </Col>
                  </Row>
                </div>
              </div>
              
              <div className="d-flex justify-content-end">
                <Button 
                  type="submit" 
                  variant="success"
                  disabled={loading}
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
                      Generating...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faFileDownload} className="me-2" />
                      Generate & Download PDF
                    </>
                  )}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PDFExporter;