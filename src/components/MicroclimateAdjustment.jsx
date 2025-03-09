import React, { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col, Button, Card, Alert } from 'react-bootstrap';

const MicroclimateAdjustment = ({ onSave, userSubscription, zone }) => {
  // State for microclimate factors
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileName, setProfileName] = useState('');
  
  // Slope factors
  const [slopeDirection, setSlopeDirection] = useState('flat');
  const [slopeSeverity, setSlopeSeverity] = useState('none');
  
  // Urban heat island effect
  const [heatIslandEffect, setHeatIslandEffect] = useState('none');
  
  // Water bodies
  const [waterPresent, setWaterPresent] = useState(false);
  const [waterType, setWaterType] = useState('none');
  const [waterDistance, setWaterDistance] = useState(0);
  
  // Wind protection
  const [windProtection, setWindProtection] = useState('none');
  const [windDirection, setWindDirection] = useState('none');
  
  // Custom factors
  const [customFactors, setCustomFactors] = useState([]);
  const [newFactorName, setNewFactorName] = useState('');
  const [newFactorAdjustment, setNewFactorAdjustment] = useState(0);
  const [newFactorType, setNewFactorType] = useState('earlier');
  
  // Calculated adjustments
  const [springAdjustment, setSpringAdjustment] = useState(0);
  const [fallAdjustment, setFallAdjustment] = useState(0);
  
  // Alerts
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Calculate total adjustment days based on all factors
  const calculateAdjustments = useCallback(() => {
    // Initialize adjustments
    let springDays = 0;
    let fallDays = 0;
    
    // Slope adjustments
    if (slopeDirection === 'south' || slopeDirection === 'southeast' || slopeDirection === 'southwest') {
      // South-facing slopes warm up earlier in spring
      if (slopeSeverity === 'gentle') springDays += 3;
      else if (slopeSeverity === 'moderate') springDays += 5;
      else if (slopeSeverity === 'steep') springDays += 7;
      
      // South-facing slopes cool down later in fall
      if (slopeSeverity === 'gentle') fallDays += 3;
      else if (slopeSeverity === 'moderate') fallDays += 5;
      else if (slopeSeverity === 'steep') fallDays += 7;
    } 
    else if (slopeDirection === 'north' || slopeDirection === 'northeast' || slopeDirection === 'northwest') {
      // North-facing slopes warm up later in spring
      if (slopeSeverity === 'gentle') springDays -= 3;
      else if (slopeSeverity === 'moderate') springDays -= 5;
      else if (slopeSeverity === 'steep') springDays -= 7;
      
      // North-facing slopes cool down earlier in fall
      if (slopeSeverity === 'gentle') fallDays -= 3;
      else if (slopeSeverity === 'moderate') fallDays -= 5;
      else if (slopeSeverity === 'steep') fallDays -= 7;
    }
    
    // Urban heat island effect
    if (heatIslandEffect === 'mild') {
      springDays += 3;
      fallDays += 3;
    } else if (heatIslandEffect === 'moderate') {
      springDays += 5;
      fallDays += 5;
    } else if (heatIslandEffect === 'strong') {
      springDays += 7;
      fallDays += 7;
    }
    
    // Water bodies effects
    if (waterPresent && waterType !== 'none') {
      let waterEffect = 0;
      
      if (waterType === 'small_pond') waterEffect = 1;
      else if (waterType === 'large_pond' || waterType === 'stream') waterEffect = 2;
      else if (waterType === 'lake') waterEffect = 4;
      else if (waterType === 'ocean') waterEffect = 7;
      
      // Adjust based on distance
      if (waterDistance > 500) waterEffect = Math.round(waterEffect / 2);
      else if (waterDistance > 1000) waterEffect = Math.round(waterEffect / 3);
      
      // Water bodies delay warming in spring, but extend season in fall
      springDays -= waterEffect;
      fallDays += waterEffect * 1.5; // Larger effect in fall
    }
    
    // Wind protection
    if (windProtection !== 'none') {
      let windEffect = 0;
      
      if (windProtection === 'partial') windEffect = 2;
      else if (windProtection === 'significant') windEffect = 4;
      
      // Direction matters most for spring
      if (windDirection === 'north' || windDirection === 'all') {
        springDays += windEffect; // Protection from cold winds
      }
      
      // Less effect in fall
      fallDays += Math.round(windEffect / 2);
    }
    
    // Add custom factors
    customFactors.forEach(factor => {
      if (factor.type === 'earlier') {
        springDays += factor.adjustment;
      } else {
        springDays -= factor.adjustment;
      }
      
      // Similar but opposite effect in fall
      if (factor.type === 'later') {
        fallDays += factor.adjustment;
      } else {
        fallDays -= factor.adjustment;
      }
    });
    
    // Update state with calculated adjustments
    setSpringAdjustment(springDays);
    setFallAdjustment(fallDays);
  }, [
    slopeDirection, 
    slopeSeverity, 
    heatIslandEffect, 
    waterPresent,
    waterType, 
    waterDistance, 
    windProtection, 
    windDirection, 
    customFactors
  ]);

  // Fetch user's microclimate profiles on component mount
  useEffect(() => {
    // Only if user is logged in and on premium tier
    if (userSubscription && userSubscription !== 'free') {
      fetchMicroclimateProfiles();
    }
  }, [userSubscription]);
  
  // Recalculate adjustments when factors change
  useEffect(() => {
    calculateAdjustments();
  }, [calculateAdjustments]);
  
  // Fetch user's microclimate profiles from API
  const fetchMicroclimateProfiles = async () => {
    try {
      // Call API to get microclimate profiles for current user
      // const response = await axios.get('/api/microclimates');
      // setProfiles(response.data.data.microclimates);
      
      // Mock data for demonstration
      setProfiles([
        {
          id: '1',
          name: 'Backyard Garden',
          slope: { direction: 'south', severity: 'gentle' },
          urban_heat_island: { intensity: 'mild' },
          water_bodies: { present: true, type: 'small_pond', distance: 100 },
          shelter: { type: 'partial', direction: 'north' },
          total_adjustment_days: { spring: 4, fall: 6 }
        },
        {
          id: '2',
          name: 'Front Yard',
          slope: { direction: 'flat', severity: 'none' },
          urban_heat_island: { intensity: 'moderate' },
          water_bodies: { present: false, type: 'none', distance: 0 },
          shelter: { type: 'none', direction: 'none' },
          total_adjustment_days: { spring: 3, fall: 5 }
        }
      ]);
    } catch (error) {
      setError('Failed to load microclimate profiles. Please try again.');
      console.error(error);
    }
  };
  
  // Handle profile selection
  const handleProfileSelect = (event) => {
    const profileId = event.target.value;
    
    if (profileId === 'new') {
      // Creating a new profile
      resetForm();
      setSelectedProfile(null);
      setProfileName('New Profile');
    } else if (profileId) {
      // Load existing profile
      const profile = profiles.find(p => p.id === profileId);
      setSelectedProfile(profile);
      setProfileName(profile.name);
      
      // Set all the form values from the profile
      setSlopeDirection(profile.slope.direction);
      setSlopeSeverity(profile.slope.severity);
      setHeatIslandEffect(profile.urban_heat_island.intensity);
      setWaterPresent(profile.water_bodies.present);
      setWaterType(profile.water_bodies.type);
      setWaterDistance(profile.water_bodies.distance);
      setWindProtection(profile.shelter.type);
      setWindDirection(profile.shelter.direction);
      
      // Custom factors would be loaded here if they were in the mock data
      setCustomFactors([]);
      
      // Set calculated adjustments
      setSpringAdjustment(profile.total_adjustment_days.spring);
      setFallAdjustment(profile.total_adjustment_days.fall);
    }
  };
  
  // Reset form to default values
  const resetForm = () => {
    setProfileName('');
    setSlopeDirection('flat');
    setSlopeSeverity('none');
    setHeatIslandEffect('none');
    setWaterPresent(false);
    setWaterType('none');
    setWaterDistance(0);
    setWindProtection('none');
    setWindDirection('none');
    setCustomFactors([]);
    setSpringAdjustment(0);
    setFallAdjustment(0);
  };
  
  
  // Add a custom factor
  const addCustomFactor = () => {
    if (newFactorName.trim() === '' || newFactorAdjustment === 0) {
      setError('Please provide a name and adjustment value for the custom factor.');
      return;
    }
    
    const newFactor = {
      id: Date.now(), // simple unique id for demo
      name: newFactorName,
      adjustment: Math.abs(newFactorAdjustment),
      type: newFactorType
    };
    
    setCustomFactors([...customFactors, newFactor]);
    setNewFactorName('');
    setNewFactorAdjustment(0);
    setNewFactorType('earlier');
    setError(null);
  };
  
  // Remove a custom factor
  const removeCustomFactor = (factorId) => {
    setCustomFactors(customFactors.filter(factor => factor.id !== factorId));
  };
  
  // Save the microclimate profile
  const saveProfile = async () => {
    if (!profileName.trim()) {
      setError('Please provide a name for this microclimate profile.');
      return;
    }
    
    try {
      const profileData = {
        name: profileName,
        slope: {
          direction: slopeDirection,
          severity: slopeSeverity
        },
        urban_heat_island: {
          intensity: heatIslandEffect
        },
        water_bodies: {
          present: waterPresent,
          type: waterType,
          distance: parseInt(waterDistance)
        },
        shelter: {
          type: windProtection,
          direction: windDirection
        },
        custom_factors: customFactors.map(f => ({
          name: f.name,
          adjustment_days: f.adjustment,
          adjustment_type: f.type
        })),
        total_adjustment_days: {
          spring: springAdjustment,
          fall: fallAdjustment
        }
      };
      
      // If editing an existing profile
      if (selectedProfile) {
        // API call to update profile
        // await axios.patch(`/api/microclimates/${selectedProfile.id}`, profileData);
        console.log('Updating profile:', profileData);
        
        // Update local state
        setProfiles(
          profiles.map(p => 
            p.id === selectedProfile.id 
              ? { ...p, ...profileData, id: p.id } 
              : p
          )
        );
      } else {
        // API call to create new profile
        // const response = await axios.post('/api/microclimates', profileData);
        // const newProfile = response.data.data.microclimate;
        
        // Mock response
        const newProfile = {
          ...profileData,
          id: `new-${Date.now()}`
        };
        
        console.log('Creating new profile:', newProfile);
        
        // Update local state
        setProfiles([...profiles, newProfile]);
        setSelectedProfile(newProfile);
      }
      
      // Notify parent component
      if (onSave) {
        onSave({
          springAdjustment,
          fallAdjustment,
          profileName
        });
      }
      
      setSuccess('Microclimate profile saved successfully!');
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setError('Failed to save microclimate profile. Please try again.');
      console.error(error);
    }
  };
  
  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Select Existing Profile or Create New</Form.Label>
          <Form.Select onChange={handleProfileSelect} value={selectedProfile ? selectedProfile.id : 'new'}>
            <option value="new">Create New Profile</option>
            {profiles.map(profile => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Profile Name</Form.Label>
          <Form.Control 
            type="text" 
            value={profileName} 
            onChange={(e) => setProfileName(e.target.value)} 
            placeholder="e.g., Backyard Garden"
          />
        </Form.Group>
        
        <Card className="mb-3">
          <Card.Header>Slope Factors</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Slope Direction</Form.Label>
                  <Form.Select value={slopeDirection} onChange={(e) => setSlopeDirection(e.target.value)}>
                    <option value="flat">Flat (No slope)</option>
                    <option value="north">North-facing</option>
                    <option value="northeast">Northeast-facing</option>
                    <option value="east">East-facing</option>
                    <option value="southeast">Southeast-facing</option>
                    <option value="south">South-facing</option>
                    <option value="southwest">Southwest-facing</option>
                    <option value="west">West-facing</option>
                    <option value="northwest">Northwest-facing</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    South-facing slopes warm earlier in spring, while north-facing slopes stay cooler.
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Slope Severity</Form.Label>
                  <Form.Select value={slopeSeverity} onChange={(e) => setSlopeSeverity(e.target.value)}>
                    <option value="none">None</option>
                    <option value="gentle">Gentle (1-5°)</option>
                    <option value="moderate">Moderate (5-15°)</option>
                    <option value="steep">Steep (>15°)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        <Card className="mb-3">
          <Card.Header>Urban Heat Island Effect</Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Intensity</Form.Label>
              <Form.Select value={heatIslandEffect} onChange={(e) => setHeatIslandEffect(e.target.value)}>
                <option value="none">None (Rural area)</option>
                <option value="mild">Mild (Suburban area)</option>
                <option value="moderate">Moderate (Dense suburbs/small city)</option>
                <option value="strong">Strong (Urban center)</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Urban areas tend to be warmer than surrounding rural areas.
              </Form.Text>
            </Form.Group>
          </Card.Body>
        </Card>
        
        <Card className="mb-3">
          <Card.Header>Water Bodies</Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                label="Water body nearby"
                checked={waterPresent}
                onChange={(e) => setWaterPresent(e.target.checked)}
              />
            </Form.Group>
            
            {waterPresent && (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Type of Water Body</Form.Label>
                      <Form.Select value={waterType} onChange={(e) => setWaterType(e.target.value)}>
                        <option value="none">None</option>
                        <option value="small_pond">Small pond/stream nearby</option>
                        <option value="large_pond">Large pond/small lake nearby</option>
                        <option value="lake">Large lake nearby</option>
                        <option value="ocean">Ocean/large body of water nearby</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Approximate Distance (meters)</Form.Label>
                      <Form.Control 
                        type="number"
                        min="0"
                        step="10"
                        value={waterDistance}
                        onChange={(e) => setWaterDistance(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Text className="text-muted">
                  Water bodies tend to moderate temperature extremes, delaying warming in spring but extending the season in fall.
                </Form.Text>
              </>
            )}
          </Card.Body>
        </Card>
        
        <Card className="mb-3">
          <Card.Header>Wind Protection</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Level of Protection</Form.Label>
                  <Form.Select value={windProtection} onChange={(e) => setWindProtection(e.target.value)}>
                    <option value="none">None (Open area)</option>
                    <option value="partial">Partial (Some protection)</option>
                    <option value="significant">Significant (Well protected)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Direction of Protection</Form.Label>
                  <Form.Select 
                    value={windDirection} 
                    onChange={(e) => setWindDirection(e.target.value)}
                    disabled={windProtection === 'none'}
                  >
                    <option value="none">None</option>
                    <option value="north">North</option>
                    <option value="east">East</option>
                    <option value="south">South</option>
                    <option value="west">West</option>
                    <option value="all">All directions</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Text className="text-muted">
              Protection from cold winds can significantly affect early spring temperatures.
            </Form.Text>
          </Card.Body>
        </Card>
        
        <Card className="mb-3">
          <Card.Header>Custom Factors</Card.Header>
          <Card.Body>
            {customFactors.length > 0 && (
              <div className="mb-3">
                <h6>Your Custom Factors:</h6>
                <ul className="list-group">
                  {customFactors.map(factor => (
                    <li key={factor.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span>{factor.name}</span>
                        <span className="ms-2 badge bg-secondary">
                          {factor.adjustment} days {factor.type}
                        </span>
                      </div>
                      <Button 
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeCustomFactor(factor.id)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Row>
              <Col md={5}>
                <Form.Group className="mb-3">
                  <Form.Label>Factor Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={newFactorName} 
                    onChange={(e) => setNewFactorName(e.target.value)} 
                    placeholder="e.g., Cold air drainage"
                  />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Days</Form.Label>
                  <Form.Control 
                    type="number"
                    min="0"
                    max="14"
                    value={newFactorAdjustment}
                    onChange={(e) => setNewFactorAdjustment(parseInt(e.target.value) || 0)}
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Effect</Form.Label>
                  <Form.Select value={newFactorType} onChange={(e) => setNewFactorType(e.target.value)}>
                    <option value="earlier">Makes spring earlier</option>
                    <option value="later">Makes spring later</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Button 
              variant="outline-secondary"
              size="sm"
              onClick={addCustomFactor}
              disabled={!newFactorName.trim() || newFactorAdjustment === 0}
            >
              Add Custom Factor
            </Button>
          </Card.Body>
        </Card>
        
        <Card className="mb-3 bg-light">
          <Card.Header>Calculated Adjustments</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <div><strong>Spring dates:</strong> {springAdjustment > 0 ? `${springAdjustment} days earlier` : springAdjustment < 0 ? `${Math.abs(springAdjustment)} days later` : 'No adjustment'}</div>
              </Col>
              <Col md={6}>
                <div><strong>Fall dates:</strong> {fallAdjustment > 0 ? `${fallAdjustment} days later` : fallAdjustment < 0 ? `${Math.abs(fallAdjustment)} days earlier` : 'No adjustment'}</div>
              </Col>
            </Row>
            <div className="mt-2 text-muted" style={{ fontSize: '0.9rem' }}>
              These adjustments will be applied to your planting calendar.
            </div>
          </Card.Body>
        </Card>
        
        <div className="d-flex justify-content-between">
          <Button variant="outline-secondary" onClick={resetForm}>
            Reset
          </Button>
          <Button variant="success" onClick={saveProfile}>
            Save Microclimate Profile
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default MicroclimateAdjustment;