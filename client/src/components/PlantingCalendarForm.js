import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Spinner, Card } from 'react-bootstrap';

const PlantingCalendarForm = () => {
  const [email, setEmail] = useState('');
  const [zone, setZone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [calendarData, setCalendarData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/newsletter/planting-calendar', {
        email,
        hardiness_zone: zone
      });
      
      setSuccess(true);
      setCalendarData(response.data.data.calendar);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const downloadCalendar = () => {
    // This would be replaced with actual download logic for a PDF
    window.open(calendarData.calendar_url, '_blank');
  };
  
  return (
    <Card className="p-4 my-4">
      <Card.Title className="mb-4">Download Your Custom Planting Calendar</Card.Title>
      <Card.Subtitle className="mb-3 text-muted">
        Get a customized planting calendar specific to your growing zone
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
              We'll send your calendar to this email and include helpful gardening tips.
            </Form.Text>
          </Form.Group>
          
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
            <Form.Text className="text-muted">
              <a href="/zone-finder" target="_blank" rel="noopener noreferrer">
                Not sure what zone you're in? Find it here.
              </a>
            </Form.Text>
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
                Processing...
              </>
            ) : (
              'Get My Planting Calendar'
            )}
          </Button>
        </Form>
      ) : (
        <div className="text-center">
          <Alert variant="success" className="mb-4">
            {calendarData && `Your ${calendarData.zone} planting calendar is ready!`}
          </Alert>
          
          <Button 
            variant="success" 
            onClick={downloadCalendar}
            className="mb-3 w-100"
          >
            Download Calendar PDF
          </Button>
          
          <div className="mt-4">
            <h5>Preview:</h5>
            {calendarData && calendarData.vegetables && (
              <div className="text-start">
                <p>Here are a few vegetables from your calendar:</p>
                <ul>
                  {calendarData.vegetables.map((veg, index) => (
                    <li key={index}>
                      <strong>{veg.name}</strong>
                      <ul>
                        <li>Start indoors: {veg.start_indoors}</li>
                        <li>Transplant: {veg.transplant}</li>
                        <li>Direct sow: {veg.direct_sow}</li>
                        <li>Harvest: {veg.harvest}</li>
                      </ul>
                    </li>
                  ))}
                </ul>
                <p className="text-muted">Full calendar includes 30+ vegetables and herbs specific to your zone.</p>
              </div>
            )}
          </div>
          
          <Card.Text className="mt-4 text-muted small">
            Thank you for subscribing! Please check your inbox to verify your email.
          </Card.Text>
        </div>
      )}
      
      <Card.Footer className="text-center mt-3 bg-transparent border-0">
        <small className="text-muted">
          By downloading, you agree to receive occasional gardening tips. You can unsubscribe at any time.
        </small>
      </Card.Footer>
    </Card>
  );
};

export default PlantingCalendarForm;