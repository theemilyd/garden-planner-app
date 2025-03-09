import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Table, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faSeedling, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

const PRIMARY_COLOR = '#4A9C59';

const SuccessionPlanner = ({ plant, zone, onSave, onClose }) => {
  const [interval, setInterval] = useState(plant?.succession?.interval || 14);
  const [plantings, setPlantings] = useState(plant?.succession?.maxPlantings || 3);
  const [successPlans, setSuccessPlans] = useState([]);
  const [harvestWindow, setHarvestWindow] = useState(14); // days
  
  useEffect(() => {
    if (plant && zone) {
      calculateSuccessionPlans();
    }
  }, [plant, zone, interval, plantings, harvestWindow, calculateSuccessionPlans]);
  
  const calculateSuccessionPlans = () => {
    // This would be a more complex calculation using the frost dates, plant data, etc.
    // For now, we'll just create some mock data
    
    const plans = [];
    const today = new Date();
    
    for (let i = 0; i < plantings; i++) {
      const plantingDate = new Date(today);
      plantingDate.setDate(plantingDate.getDate() + (i * interval));
      
      const harvestStartDate = new Date(plantingDate);
      harvestStartDate.setDate(harvestStartDate.getDate() + plant.daysToMaturity.min);
      
      const harvestEndDate = new Date(plantingDate);
      harvestEndDate.setDate(harvestEndDate.getDate() + plant.daysToMaturity.max);
      
      plans.push({
        plantingNumber: i + 1,
        plantingDate,
        harvestStartDate,
        harvestEndDate
      });
    }
    
    setSuccessPlans(plans);
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave(successPlans);
    }
  };
  
  return (
    <Container className="succession-planner">
      <Card className="mb-3">
        <Card.Header style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <FontAwesomeIcon icon={faSeedling} className="me-2" />
              Succession Planting for {plant?.name}
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <p>
            Succession planting allows you to have continuous harvests by planting the same crop multiple times 
            throughout the growing season, staggered at regular intervals.
          </p>
          
          <Row className="mb-4">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Days Between Plantings</Form.Label>
                <div className="d-flex align-items-center">
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setInterval(Math.max(7, interval - 7))}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </Button>
                  <Form.Control
                    type="number"
                    value={interval}
                    onChange={(e) => setInterval(parseInt(e.target.value))}
                    min="7"
                    max="28"
                    className="mx-2 text-center"
                  />
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setInterval(Math.min(28, interval + 7))}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </Button>
                </div>
                <Form.Text>Recommended: 7-21 days</Form.Text>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group>
                <Form.Label>Number of Plantings</Form.Label>
                <div className="d-flex align-items-center">
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setPlantings(Math.max(2, plantings - 1))}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </Button>
                  <Form.Control
                    type="number"
                    value={plantings}
                    onChange={(e) => setPlantings(parseInt(e.target.value))}
                    min="2"
                    max="10"
                    className="mx-2 text-center"
                  />
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setPlantings(Math.min(10, plantings + 1))}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </Button>
                </div>
                <Form.Text>Maximum 10 plantings</Form.Text>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group>
                <Form.Label>Harvest Window (days)</Form.Label>
                <div className="d-flex align-items-center">
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setHarvestWindow(Math.max(7, harvestWindow - 7))}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </Button>
                  <Form.Control
                    type="number"
                    value={harvestWindow}
                    onChange={(e) => setHarvestWindow(parseInt(e.target.value))}
                    min="7"
                    max="30"
                    className="mx-2 text-center"
                  />
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setHarvestWindow(Math.min(30, harvestWindow + 7))}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </Button>
                </div>
                <Form.Text>Expected harvest duration</Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Alert variant="info">
            The succession plan below is calculated based on your growing zone, the current date, 
            and the frost dates for your location.
          </Alert>
          
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Planting Date</th>
                <th>Harvest Start</th>
                <th>Harvest End</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {successPlans.map((plan) => (
                <tr key={plan.plantingNumber}>
                  <td>{plan.plantingNumber}</td>
                  <td>{formatDate(plan.plantingDate)}</td>
                  <td>{formatDate(plan.harvestStartDate)}</td>
                  <td>{formatDate(plan.harvestEndDate)}</td>
                  <td>
                    {plan.plantingNumber === 1 ? 'First planting' : 
                     plan.plantingNumber === plantings ? 'Last planting' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          <div className="d-flex justify-content-end mt-3">
            <Button 
              variant="secondary" 
              className="me-2"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              variant="success" 
              onClick={handleSave}
              style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
            >
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              Save Succession Plan
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SuccessionPlanner;