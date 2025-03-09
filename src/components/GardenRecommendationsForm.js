import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Spinner, Card, Row, Col, ListGroup } from 'react-bootstrap';

const GardenRecommendationsForm = () => {
  const [email, setEmail] = useState('');
  const [zone, setZone] = useState('');
  const [gardenSize, setGardenSize] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [preferences, setPreferences] = useState({
    vegetables: true,
    herbs: true,
    flowers: false,
    fruits: false,
    lowMaintenance: false,
    childFriendly: false,
    highYield: true,
    pestResistant: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [recommendationsData, setRecommendationsData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/newsletter/garden-recommendations', {
        email,
        zone,
        garden_size: gardenSize,
        experience_level: experienceLevel,
        preferences
      });
      
      setSuccess(true);
      setRecommendationsData(response.data.data.recommendations);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePreferenceChange = (preference) => {
    setPreferences({
      ...preferences,
      [preference]: !preferences[preference]
    });
  };
  
  return (
    <Card className="p-4 my-4">
      <Card.Title className="mb-4">Get Personalized Garden Recommendations</Card.Title>
      <Card.Subtitle className="mb-3 text-muted">
        Tell us about your garden and get customized plant recommendations
      </Card.Subtitle>
      
      {!success ? (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Form.Text className="text-muted">
              We'll send your recommendations to this email and helpful gardening tips.
            </Form.Text>
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Your USDA Hardiness Zone</Form.Label>
                <Form.Select 
                  value={zone} 
                  onChange={(e) => setZone(e.target.value)}
                  required
                >
                  <option value="">Select Your Zone</option>
                  <option value="1a">Zone 1a</option>
                  <option value="1b">Zone 1b</option>
                  <option value="2a">Zone 2a</option>
                  <option value="2b">Zone 2b</option>
                  <option value="3a">Zone 3a</option>
                  <option value="3b">Zone 3b</option>
                  <option value="4a">Zone 4a</option>
                  <option value="4b">Zone 4b</option>
                  <option value="5a">Zone 5a</option>
                  <option value="5b">Zone 5b</option>
                  <option value="6a">Zone 6a</option>
                  <option value="6b">Zone 6b</option>
                  <option value="7a">Zone 7a</option>
                  <option value="7b">Zone 7b</option>
                  <option value="8a">Zone 8a</option>
                  <option value="8b">Zone 8b</option>
                  <option value="9a">Zone 9a</option>
                  <option value="9b">Zone 9b</option>
                  <option value="10a">Zone 10a</option>
                  <option value="10b">Zone 10b</option>
                  <option value="11a">Zone 11a</option>
                  <option value="11b">Zone 11b</option>
                  <option value="12a">Zone 12a</option>
                  <option value="12b">Zone 12b</option>
                  <option value="13a">Zone 13a</option>
                  <option value="13b">Zone 13b</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Garden Size</Form.Label>
                <Form.Select
                  value={gardenSize}
                  onChange={(e) => setGardenSize(e.target.value)}
                  required
                >
                  <option value="">Select Size</option>
                  <option value="small">Small (1-2 raised beds or containers)</option>
                  <option value="medium">Medium (3-5 raised beds or small plot)</option>
                  <option value="large">Large (6+ beds or large plot)</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Your Gardening Experience</Form.Label>
            <Form.Select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              required
            >
              <option value="">Select Experience Level</option>
              <option value="beginner">Beginner (First time gardener)</option>
              <option value="intermediate">Intermediate (1-3 years experience)</option>
              <option value="advanced">Advanced (3+ years experience)</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label>Garden Preferences (select all that apply)</Form.Label>
            <div className="d-flex flex-wrap">
              <Form.Check 
                type="checkbox"
                label="Vegetables"
                className="me-3 mb-2"
                checked={preferences.vegetables}
                onChange={() => handlePreferenceChange('vegetables')}
              />
              <Form.Check 
                type="checkbox"
                label="Herbs"
                className="me-3 mb-2"
                checked={preferences.herbs}
                onChange={() => handlePreferenceChange('herbs')}
              />
              <Form.Check 
                type="checkbox"
                label="Flowers"
                className="me-3 mb-2"
                checked={preferences.flowers}
                onChange={() => handlePreferenceChange('flowers')}
              />
              <Form.Check 
                type="checkbox"
                label="Fruits"
                className="me-3 mb-2"
                checked={preferences.fruits}
                onChange={() => handlePreferenceChange('fruits')}
              />
              <Form.Check 
                type="checkbox"
                label="Low Maintenance"
                className="me-3 mb-2"
                checked={preferences.lowMaintenance}
                onChange={() => handlePreferenceChange('lowMaintenance')}
              />
              <Form.Check 
                type="checkbox"
                label="Child Friendly"
                className="me-3 mb-2"
                checked={preferences.childFriendly}
                onChange={() => handlePreferenceChange('childFriendly')}
              />
              <Form.Check 
                type="checkbox"
                label="High Yield"
                className="me-3 mb-2"
                checked={preferences.highYield}
                onChange={() => handlePreferenceChange('highYield')}
              />
              <Form.Check 
                type="checkbox"
                label="Pest Resistant"
                className="me-3 mb-2"
                checked={preferences.pestResistant}
                onChange={() => handlePreferenceChange('pestResistant')}
              />
            </div>
          </Form.Group>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Button 
            variant="primary" 
            type="submit" 
            className="w-100"
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
                Creating your recommendations...
              </>
            ) : (
              'Get My Garden Recommendations'
            )}
          </Button>
        </Form>
      ) : (
        <div>
          <Alert variant="success" className="mb-4">
            Your personalized garden recommendations are ready!
          </Alert>
          
          {recommendationsData && (
            <>
              <h5 className="mt-4">Recommended Plants</h5>
              <ListGroup className="mb-4">
                {recommendationsData.recommended_plants.map((plant, index) => (
                  <ListGroup.Item key={index}>
                    <h6>{plant.name}</h6>
                    <p className="mb-1 small">
                      <strong>Difficulty:</strong> {plant.difficulty} | 
                      <strong> Space:</strong> {plant.space_needed} | 
                      <strong> Days to harvest:</strong> {plant.days_to_maturity}
                    </p>
                    <p className="mb-1 small">
                      <strong>Ideal for:</strong> {plant.ideal_for}
                    </p>
                    <p className="mb-0 small">
                      <strong>Plant with:</strong> {plant.companion_plants.join(', ')}
                    </p>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              
              <h5>Garden Layout Suggestions</h5>
              <Row className="mb-4">
                {recommendationsData.garden_layout_suggestions.map((layout, index) => (
                  <Col md={6} key={index} className="mb-3">
                    <Card>
                      <Card.Body>
                        <Card.Title className="h6">{layout.name}</Card.Title>
                        <Card.Text className="small">{layout.description}</Card.Text>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          href={layout.layout_url}
                          target="_blank"
                        >
                          View Layout
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
              
              <h5>Seasonal Tips</h5>
              <ul className="mb-4">
                {recommendationsData.seasonal_tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </>
          )}
          
          <Card.Text className="mt-4 text-muted small">
            Your complete recommendations have been sent to your email. Please check your inbox and verify your email to receive future updates.
          </Card.Text>
        </div>
      )}
      
      <Card.Footer className="text-center mt-3 bg-transparent border-0">
        <small className="text-muted">
          By submitting this form, you agree to receive occasional gardening tips. You can unsubscribe at any time.
        </small>
      </Card.Footer>
    </Card>
  );
};

export default GardenRecommendationsForm;