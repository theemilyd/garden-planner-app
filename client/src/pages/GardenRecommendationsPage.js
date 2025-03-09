import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup } from 'react-bootstrap';
import EmailCaptureModal from '../components/EmailCaptureModal';

const GardenRecommendationsPage = () => {
  const [zone, setZone] = useState('');
  const [gardenSize, setGardenSize] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);

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

  // Garden size options
  const gardenSizes = [
    { value: 'small', label: 'Small (1-2 raised beds or containers)' },
    { value: 'medium', label: 'Medium (3-5 raised beds or small plot)' },
    { value: 'large', label: 'Large (6+ beds or large plot)' }
  ];

  // Experience level options
  const experienceLevels = [
    { value: 'beginner', label: 'Beginner (First time gardener)' },
    { value: 'intermediate', label: 'Intermediate (1-3 years experience)' },
    { value: 'advanced', label: 'Advanced (3+ years experience)' }
  ];

  // Generate preview data based on selections
  const getPreviewData = () => {
    return {
      recommended_plants: [
        {
          name: 'Bush Beans',
          difficulty: 'easy',
          space_needed: 'compact',
          days_to_maturity: '45-60',
          ideal_for: 'beginners',
          companion_plants: ['Carrots', 'Cucumber']
        },
        {
          name: 'Cherry Tomatoes',
          difficulty: 'easy',
          space_needed: 'medium',
          days_to_maturity: '60-80',
          ideal_for: 'beginners',
          companion_plants: ['Basil', 'Marigolds']
        }
      ],
      seasonal_tips: [
        'Start with transplants for quicker results',
        'Mulch well to reduce watering needs'
      ]
    };
  };

  const handleGeneratePreview = () => {
    if (zone && gardenSize && experienceLevel) {
      setPreviewData(getPreviewData());
      setShowPreview(true);
    }
  };

  const handleGetFullRecommendations = () => {
    setShowEmailModal(true);
  };

  const handleEmailSuccess = (data) => {
    // Here we would handle what happens after email submission
    console.log('Recommendations data:', data);
    // Could redirect to a full recommendations page or show more details
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center mb-5">
        <Col md={8} lg={6}>
          <h1 className="text-center mb-4">Garden Recommendations</h1>
          <p className="text-center">
            Get customized plant recommendations based on your garden size, 
            experience level, and growing zone.
          </p>
          
          <Card className="shadow">
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Your Growing Zone</Form.Label>
                  <Form.Select 
                    value={zone} 
                    onChange={(e) => setZone(e.target.value)}
                  >
                    <option value="">Select your zone</option>
                    {zones.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Garden Size</Form.Label>
                  <Form.Select 
                    value={gardenSize} 
                    onChange={(e) => setGardenSize(e.target.value)}
                  >
                    <option value="">Select size</option>
                    {gardenSizes.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Your Experience Level</Form.Label>
                  <Form.Select 
                    value={experienceLevel} 
                    onChange={(e) => setExperienceLevel(e.target.value)}
                  >
                    <option value="">Select experience</option>
                    {experienceLevels.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <div className="d-grid">
                  <Button 
                    variant="success" 
                    onClick={handleGeneratePreview}
                    disabled={!zone || !gardenSize || !experienceLevel}
                  >
                    Get Recommendations Preview
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {showPreview && previewData && (
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow mb-4">
              <Card.Header className="bg-primary text-white">
                <h2 className="h4 mb-0">Recommended Plants</h2>
              </Card.Header>
              <Card.Body>
                <p className="text-muted mb-4">
                  Based on your selections, here are some plant recommendations
                  that should do well in your garden. This is just a preview of what
                  our full recommendation includes.
                </p>
                
                <ListGroup variant="flush">
                  {previewData.recommended_plants.map((plant, index) => (
                    <ListGroup.Item key={index} className="border px-3 py-3 mb-3 rounded">
                      <h5>{plant.name}</h5>
                      <div className="d-flex flex-wrap gap-3 text-muted mb-2">
                        <span><strong>Difficulty:</strong> {plant.difficulty}</span>
                        <span><strong>Space:</strong> {plant.space_needed}</span>
                        <span><strong>Days to maturity:</strong> {plant.days_to_maturity}</span>
                      </div>
                      <div><strong>Ideal for:</strong> {plant.ideal_for}</div>
                      <div><strong>Companion plants:</strong> {plant.companion_plants.join(', ')}</div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                
                <div className="text-center mt-4">
                  <p className="text-muted">
                    The full recommendations include 15+ plants specifically chosen 
                    for your conditions, plus detailed growing information.
                  </p>
                </div>
              </Card.Body>
            </Card>
            
            <Card className="shadow mb-4">
              <Card.Header className="bg-primary text-white">
                <h2 className="h4 mb-0">Seasonal Tips</h2>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {previewData.seasonal_tips.map((tip, index) => (
                    <ListGroup.Item key={index}>
                      {tip}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <div className="text-center mt-4">
                  <p className="text-muted">
                    The full recommendations include many more tips and tricks
                    specific to your garden conditions.
                  </p>
                </div>
              </Card.Body>
            </Card>
            
            <div className="text-center my-4">
              <Button 
                variant="success" 
                size="lg"
                onClick={handleGetFullRecommendations}
              >
                Get Full Recommendations
              </Button>
              <p className="text-muted mt-2">
                Enter your email to receive your custom recommendations.
              </p>
            </div>
          </Col>
        </Row>
      )}
      
      {/* Email Capture Modal */}
      <EmailCaptureModal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
        onSuccess={handleEmailSuccess}
        resourceType="recommendations"
        zoneName={zone}
      />
    </Container>
  );
};

export default GardenRecommendationsPage;