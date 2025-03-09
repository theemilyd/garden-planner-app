import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Row, Col, Card, Table, Alert, Badge } from 'react-bootstrap';

const SuccessionPlantingCalculator = ({ selectedPlant, zone, userSubscription }) => {
  // Form state
  const [harvestDuration, setHarvestDuration] = useState(2);
  const [successionCount, setSuccessionCount] = useState(3);
  const [intervalDays, setIntervalDays] = useState(14);
  const [customInterval, setCustomInterval] = useState(false);
  
  // Results state
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Calculated values
  const [plantingSeasonEnd, setPlantingSeasonEnd] = useState(null);
  const [totalHarvestWeeks, setTotalHarvestWeeks] = useState(0);
  
  // Plant recommended settings
  const [recommendedInterval, setRecommendedInterval] = useState(14);
  // const [recommendedCount, setRecommendedCount] = useState(3); // Not used directly
  
  // Load plant specific recommendations when plant changes
  useEffect(() => {
    if (selectedPlant && selectedPlant.growing_calendar && selectedPlant.growing_calendar.succession_planting) {
      const succession = selectedPlant.growing_calendar.succession_planting;
      
      if (succession.recommended) {
        if (succession.interval_days) {
          setRecommendedInterval(succession.interval_days);
          if (!customInterval) {
            setIntervalDays(succession.interval_days);
          }
        }
        
        if (succession.max_plantings) {
          // setRecommendedCount(succession.max_plantings); // Removed unused call
          setSuccessionCount(Math.min(successionCount, succession.max_plantings));
        }
      }
    }
  }, [selectedPlant, customInterval, successionCount]);
  
  // Define calculateSchedule function with useCallback before it's used
  const calculateSchedule = useCallback(async () => {
    if (!selectedPlant || !zone) {
      setError('Please select a plant and ensure your zone is set');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // const response = await axios.post('/api/succession/calculate', {
      //   plantId: selectedPlant.id,
      //   harvestDuration,
      //   successionCount,
      //   intervalDays,
      //   zoneId: zone.id
      // });
      // setSchedule(response.data.data.succession_schedule);
      
      // Mock implementation for demonstration
      const mockSchedule = generateMockSuccessionSchedule(
        selectedPlant,
        zone,
        harvestDuration,
        successionCount,
        intervalDays
      );
      
      setSchedule(mockSchedule);
      
      // Calculate total harvest weeks
      let firstHarvest = mockSchedule.length > 0 ? new Date(mockSchedule[0].harvest_start_date) : null;
      let lastHarvest = mockSchedule.length > 0 ? new Date(mockSchedule[mockSchedule.length - 1].harvest_end_date) : null;
      
      if (firstHarvest && lastHarvest) {
        const diffTime = Math.abs(lastHarvest - firstHarvest);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setTotalHarvestWeeks(Math.ceil(diffDays / 7));
      }
      
      setLoading(false);
    } catch (error) {
      setError('Failed to calculate succession schedule: ' + error.message);
      setLoading(false);
    }
  }, [selectedPlant, zone, harvestDuration, successionCount, intervalDays]);
  
  // Then use it in useEffect
  useEffect(() => {
    if (selectedPlant && zone) {
      calculateSchedule();
    }
  }, [selectedPlant, zone, calculateSchedule]);
  
  // Save succession plan
  const saveSuccessionPlan = async () => {
    if (userSubscription === 'free') {
      setError('Saving succession plans is a premium feature. Please upgrade to save this plan.');
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real implementation, this would be an API call
      // const response = await axios.post('/api/succession/save', {
      //   plantId: selectedPlant.id,
      //   name: `${selectedPlant.name} Succession Plan`,
      //   schedule
      // });
      
      // Mock implementation
      console.log('Saved succession plan:', {
        plantId: selectedPlant.id,
        name: `${selectedPlant.name} Succession Plan`,
        schedule
      });
      
      setSuccess('Succession plan saved successfully!');
      setLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setError('Failed to save succession plan: ' + error.message);
      setLoading(false);
    }
  };
  
  // Generate mock succession schedule for demo
  const generateMockSuccessionSchedule = (plant, zone, harvestDuration, count, interval) => {
    if (!plant || !zone) return [];
    
    // Use frost dates from zone
    const lastFrostStr = zone.lastFrost || '2023-04-15';
    const firstFrostStr = zone.firstFrost || '2023-10-15';
    
    const lastFrost = new Date(lastFrostStr);
    const firstFrost = new Date(firstFrostStr);
    
    // Get days to maturity
    const daysToMaturity = plant.days_to_maturity || 60;
    
    // First planting date (for simplicity, using direct sow date or 2 weeks after last frost)
    let firstPlantingDate;
    if (plant.direct_sow !== null && plant.direct_sow !== undefined) {
      // Calculate from direct sow information
      firstPlantingDate = new Date(lastFrost);
      firstPlantingDate.setDate(firstPlantingDate.getDate() + (plant.direct_sow * 7));
    } else if (plant.transplant !== null && plant.transplant !== undefined) {
      // Calculate from transplant information
      firstPlantingDate = new Date(lastFrost);
      firstPlantingDate.setDate(firstPlantingDate.getDate() + (plant.transplant * 7));
    } else {
      // Default to 2 weeks after last frost
      firstPlantingDate = new Date(lastFrost);
      firstPlantingDate.setDate(firstPlantingDate.getDate() + 14);
    }
    
    // Calculate last possible planting date (first frost minus days to maturity)
    const lastPossiblePlantingDate = new Date(firstFrost);
    lastPossiblePlantingDate.setDate(lastPossiblePlantingDate.getDate() - daysToMaturity);
    
    // Store this for UI
    setPlantingSeasonEnd(lastPossiblePlantingDate);
    
    // Generate schedule
    const schedule = [];
    
    for (let i = 0; i < count; i++) {
      const plantingDate = new Date(firstPlantingDate);
      plantingDate.setDate(plantingDate.getDate() + (i * interval));
      
      // Stop if we're past the last possible planting date
      if (plantingDate > lastPossiblePlantingDate) {
        break;
      }
      
      const harvestStartDate = new Date(plantingDate);
      harvestStartDate.setDate(harvestStartDate.getDate() + daysToMaturity);
      
      const harvestEndDate = new Date(harvestStartDate);
      harvestEndDate.setDate(harvestEndDate.getDate() + (harvestDuration * 7));
      
      schedule.push({
        planting_number: i + 1,
        planting_date: plantingDate.toISOString().split('T')[0],
        days_to_maturity: daysToMaturity,
        harvest_start_date: harvestStartDate.toISOString().split('T')[0],
        harvest_end_date: harvestEndDate.toISOString().split('T')[0],
      });
    }
    
    return schedule;
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Calculate overlap percentage between harvests
  const calculateOverlap = () => {
    if (schedule.length < 2) return 0;
    
    let overlapDays = 0;
    let totalPossibleOverlapDays = 0;
    
    for (let i = 0; i < schedule.length - 1; i++) {
      const currentHarvestEnd = new Date(schedule[i].harvest_end_date);
      const nextHarvestStart = new Date(schedule[i+1].harvest_start_date);
      
      const harvestDurationDays = harvestDuration * 7;
      totalPossibleOverlapDays += harvestDurationDays;
      
      if (nextHarvestStart <= currentHarvestEnd) {
        // There is overlap
        const overlapEnd = new Date(Math.min(currentHarvestEnd.getTime(), nextHarvestStart.getTime() + (harvestDuration * 7 * 24 * 60 * 60 * 1000)));
        const daysBetween = Math.ceil((overlapEnd - nextHarvestStart) / (1000 * 60 * 60 * 24));
        overlapDays += Math.max(0, daysBetween);
      }
    }
    
    return totalPossibleOverlapDays > 0 ? Math.round((overlapDays / totalPossibleOverlapDays) * 100) : 0;
  };
  
  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Card className="mb-4">
        <Card.Header className="bg-success text-white">
          <strong>Succession Planting Calculator</strong>
          {selectedPlant && (
            <span className="ms-2">for {selectedPlant.name}</span>
          )}
        </Card.Header>
        <Card.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Harvest Duration (weeks)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="8"
                    value={harvestDuration}
                    onChange={(e) => setHarvestDuration(parseInt(e.target.value))}
                  />
                  <Form.Text className="text-muted">
                    How many weeks you expect to harvest from each planting
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Number of Plantings</Form.Label>
                  <Form.Control
                    type="number"
                    min="2"
                    max={userSubscription === 'free' ? 3 : 10}
                    value={successionCount}
                    onChange={(e) => setSuccessionCount(parseInt(e.target.value))}
                  />
                  {userSubscription === 'free' && (
                    <Form.Text className="text-muted">
                      Free tier limited to 3 plantings. <Badge bg="warning" text="dark">Premium</Badge>
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Use custom interval"
                    checked={customInterval}
                    onChange={(e) => {
                      setCustomInterval(e.target.checked);
                      if (!e.target.checked && recommendedInterval) {
                        setIntervalDays(recommendedInterval);
                      }
                    }}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Days Between Plantings</Form.Label>
                  <Form.Control
                    type="number"
                    min="7"
                    max="28"
                    step="7"
                    value={intervalDays}
                    onChange={(e) => setIntervalDays(parseInt(e.target.value))}
                    disabled={!customInterval}
                  />
                  {!customInterval && recommendedInterval > 0 && (
                    <Form.Text className="text-muted">
                      Using recommended interval for {selectedPlant?.name || 'this plant'}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Form>
          
          {schedule.length > 0 && (
            <div className="mt-4">
              <h5>Succession Schedule</h5>
              <Table responsive striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Planting Date</th>
                    <th>Harvest Begins</th>
                    <th>Harvest Ends</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((planting) => (
                    <tr key={planting.planting_number}>
                      <td>{planting.planting_number}</td>
                      <td>{formatDate(planting.planting_date)}</td>
                      <td>{formatDate(planting.harvest_start_date)}</td>
                      <td>{formatDate(planting.harvest_end_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              <div className="mt-3 p-3 bg-light rounded">
                <Row>
                  <Col md={4}>
                    <div><strong>Total Harvest Period:</strong> {totalHarvestWeeks} weeks</div>
                  </Col>
                  <Col md={4}>
                    <div><strong>Overlap:</strong> {calculateOverlap()}%</div>
                  </Col>
                  <Col md={4}>
                    <div><strong>Last Planting By:</strong> {plantingSeasonEnd ? formatDate(plantingSeasonEnd) : 'N/A'}</div>
                  </Col>
                </Row>
              </div>
              
              {userSubscription !== 'free' && (
                <div className="mt-3 text-end">
                  <Button 
                    variant="success" 
                    onClick={saveSuccessionPlan}
                    disabled={loading}
                  >
                    Save Succession Plan
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
      
      {selectedPlant && (
        <Card>
          <Card.Header>Visualized Schedule</Card.Header>
          <Card.Body>
            <div className="succession-timeline">
              {schedule.length > 0 ? (
                <div className="position-relative" style={{ height: '200px' }}>
                  {schedule.map((planting) => {
                    // Calculate timeline position
                    const firstPlantingDate = new Date(schedule[0].planting_date);
                    const lastHarvestDate = new Date(schedule[schedule.length - 1].harvest_end_date);
                    const timelineSpan = lastHarvestDate - firstPlantingDate;
                    
                    const plantingDate = new Date(planting.planting_date);
                    const harvestStartDate = new Date(planting.harvest_start_date);
                    const harvestEndDate = new Date(planting.harvest_end_date);
                    
                    const plantingPos = ((plantingDate - firstPlantingDate) / timelineSpan) * 100;
                    const harvestStartPos = ((harvestStartDate - firstPlantingDate) / timelineSpan) * 100;
                    const harvestWidth = ((harvestEndDate - harvestStartDate) / timelineSpan) * 100;
                    
                    return (
                      <div key={planting.planting_number} className="position-relative" style={{ height: '30px', marginBottom: '10px' }}>
                        {/* Planting marker */}
                        <div 
                          className="position-absolute bg-success rounded-circle" 
                          style={{ 
                            left: `${plantingPos}%`, 
                            width: '20px', 
                            height: '20px', 
                            transform: 'translateX(-50%)',
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                          title={`Planting ${planting.planting_number}: ${formatDate(planting.planting_date)}`}
                        >
                          {planting.planting_number}
                        </div>
                        
                        {/* Growing period line */}
                        <div 
                          className="position-absolute bg-success" 
                          style={{ 
                            left: `${plantingPos}%`, 
                            width: `${harvestStartPos - plantingPos}%`, 
                            height: '3px', 
                            top: '10px'
                          }}
                          title="Growing period"
                        ></div>
                        
                        {/* Harvest period bar */}
                        <div 
                          className="position-absolute bg-warning" 
                          style={{ 
                            left: `${harvestStartPos}%`, 
                            width: `${harvestWidth}%`, 
                            height: '20px', 
                            borderRadius: '4px',
                            opacity: 0.7
                          }}
                          title={`Harvest: ${formatDate(planting.harvest_start_date)} - ${formatDate(planting.harvest_end_date)}`}
                        ></div>
                      </div>
                    );
                  })}
                  
                  {/* Timeline base */}
                  <div className="position-absolute" style={{ bottom: 0, left: 0, right: 0, height: '2px', backgroundColor: '#ccc' }}>
                    {/* Month markers */}
                    {(() => {
                      const markers = [];
                      if (schedule.length > 0) {
                        const startDate = new Date(schedule[0].planting_date);
                        const endDate = new Date(schedule[schedule.length - 1].harvest_end_date);
                        // No need to store totalDays as we're only using it to visualize the timeline
                        
                        // Create a marker for each month
                        let currentDate = new Date(startDate);
                        while (currentDate <= endDate) {
                          const position = ((currentDate - startDate) / (endDate - startDate)) * 100;
                          markers.push(
                            <div 
                              key={currentDate.toISOString()} 
                              className="position-absolute" 
                              style={{ bottom: 0, left: `${position}%` }}
                            >
                              <div style={{ height: '10px', width: '2px', backgroundColor: '#666', marginLeft: '-1px' }}></div>
                              <div style={{ fontSize: '12px', marginLeft: '-20px', width: '40px', textAlign: 'center' }}>
                                {currentDate.toLocaleDateString('en-US', { month: 'short' })}
                              </div>
                            </div>
                          );
                          
                          // Move to next month
                          currentDate.setMonth(currentDate.getMonth() + 1);
                        }
                      }
                      return markers;
                    })()}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  Calculate a succession plan to see the visual timeline
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default SuccessionPlantingCalculator;