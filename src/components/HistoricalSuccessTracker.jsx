import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Badge, Alert, Table, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSeedling, faLeaf, faCalendarAlt, faChartLine, 
  faPlus, faPencilAlt, faTrashAlt, faStar, faCheck,
  faInfoCircle, faChartBar, faCrown
} from '@fortawesome/free-solid-svg-icons';

/**
 * Historical Success Tracker Component
 * 
 * Allows users to record and analyze their gardening history:
 * - Track germination rates
 * - Record harvest yields
 * - Note variety performance
 * - Store planting notes and observations
 */
const HistoricalSuccessTracker = ({ userSubscription, plant, garden }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  
  // Form states for adding new record
  const [formData, setFormData] = useState({
    plantingDate: '',
    variety: '',
    germinationRate: 0,
    germDays: 0,
    harvestDate: '',
    yield: 0,
    yieldRating: 3,
    qualityRating: 3,
    notes: '',
    successFactors: [],
    challenges: []
  });
  
  // Aggregated statistics
  const [stats, setStats] = useState({
    totalPlantings: 0,
    avgGermination: 0,
    avgYield: 0,
    bestVariety: '',
    worstVariety: '',
    fastestGerm: 0,
    successTrends: []
  });
  
  // Common success factors and challenges for selection
  const commonFactors = ['Good soil prep', 'Proper spacing', 'Consistent watering', 'Weather conditions', 'Quality seeds', 'Companion planting'];
  const commonChallenges = ['Pests', 'Disease', 'Weather extremes', 'Poor soil', 'Inconsistent watering', 'Improper spacing'];
  
  // Check if user has premium access
  const isPremium = userSubscription && userSubscription !== 'free';
  
  // Fetch historical records for this plant
  useEffect(() => {
    const fetchRecords = async () => {
      if (!plant || !isPremium) return;
      
      try {
        setLoading(true);
        
        // In a real implementation, this would call an API endpoint
        // Mock implementation for demonstration
        
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockRecords = [
          {
            id: '1',
            plantingDate: '2023-03-15',
            variety: 'Better Boy',
            germinationRate: 85,
            germDays: 7,
            harvestDate: '2023-07-10',
            yield: 4,
            yieldRating: 4,
            qualityRating: 5,
            notes: 'Great production this year. Started seeds indoors under grow lights.',
            successFactors: ['Good soil prep', 'Consistent watering'],
            challenges: ['Early blight in August']
          },
          {
            id: '2',
            plantingDate: '2022-04-01',
            variety: 'Cherokee Purple',
            germinationRate: 70,
            germDays: 9,
            harvestDate: '2022-07-25',
            yield: 3,
            yieldRating: 3,
            qualityRating: 5,
            notes: 'Amazing flavor but lower yield than other varieties.',
            successFactors: ['Quality seeds', 'Weather conditions'],
            challenges: ['Irregular watering', 'Pests']
          },
          {
            id: '3',
            plantingDate: '2022-03-20',
            variety: 'Roma',
            germinationRate: 90,
            germDays: 6,
            harvestDate: '2022-07-15',
            yield: 5,
            yieldRating: 5,
            qualityRating: 4,
            notes: 'Great for sauce! Very productive.',
            successFactors: ['Good soil prep', 'Companion planting'],
            challenges: []
          }
        ];
        
        setRecords(mockRecords);
        calculateStats(mockRecords);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching planting records:', err);
        setError('Failed to load planting records');
        setLoading(false);
      }
    };
    
    fetchRecords();
  }, [plant, isPremium]);
  
  // Calculate statistics from records
  const calculateStats = (plantingRecords) => {
    if (!plantingRecords || plantingRecords.length === 0) return;
    
    // Calculate average germination rate
    const avgGerm = plantingRecords.reduce((sum, record) => sum + record.germinationRate, 0) / plantingRecords.length;
    
    // Calculate average yield rating
    const avgYield = plantingRecords.reduce((sum, record) => sum + record.yield, 0) / plantingRecords.length;
    
    // Find best and worst varieties based on yield rating
    const varietyPerformance = {};
    plantingRecords.forEach(record => {
      if (!varietyPerformance[record.variety]) {
        varietyPerformance[record.variety] = {
          totalYield: 0,
          count: 0
        };
      }
      varietyPerformance[record.variety].totalYield += record.yieldRating;
      varietyPerformance[record.variety].count += 1;
    });
    
    let bestVariety = '';
    let worstVariety = '';
    let bestScore = 0;
    let worstScore = 5;
    
    Object.entries(varietyPerformance).forEach(([variety, data]) => {
      const avgScore = data.totalYield / data.count;
      if (avgScore > bestScore) {
        bestScore = avgScore;
        bestVariety = variety;
      }
      if (avgScore < worstScore) {
        worstScore = avgScore;
        worstVariety = variety;
      }
    });
    
    // Find fastest germination
    const fastestGerm = Math.min(...plantingRecords.map(record => record.germDays));
    
    // Calculate success trends over time
    const successTrends = [];
    const yearCounts = {};
    
    plantingRecords.forEach(record => {
      const year = new Date(record.plantingDate).getFullYear();
      if (!yearCounts[year]) {
        yearCounts[year] = { year, count: 0, totalYield: 0, totalGerm: 0 };
      }
      yearCounts[year].count += 1;
      yearCounts[year].totalYield += record.yieldRating;
      yearCounts[year].totalGerm += record.germinationRate;
    });
    
    Object.values(yearCounts).forEach(yearData => {
      successTrends.push({
        year: yearData.year,
        avgYield: yearData.totalYield / yearData.count,
        avgGerm: yearData.totalGerm / yearData.count
      });
    });
    
    successTrends.sort((a, b) => a.year - b.year);
    
    setStats({
      totalPlantings: plantingRecords.length,
      avgGermination: avgGerm,
      avgYield,
      bestVariety,
      worstVariety,
      fastestGerm,
      successTrends
    });
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle checkbox changes for success factors and challenges
  const handleCheckboxChange = (e, type) => {
    const { value, checked } = e.target;
    
    if (type === 'successFactors') {
      if (checked) {
        setFormData(prev => ({
          ...prev,
          successFactors: [...prev.successFactors, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          successFactors: prev.successFactors.filter(factor => factor !== value)
        }));
      }
    } else if (type === 'challenges') {
      if (checked) {
        setFormData(prev => ({
          ...prev,
          challenges: [...prev.challenges, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          challenges: prev.challenges.filter(challenge => challenge !== value)
        }));
      }
    }
  };
  
  // Handle rating changes
  const handleRatingChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Submit form to add new record
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // In a real implementation, this would call an API endpoint
      // Mock implementation for demonstration
      
      const newRecord = {
        id: `new-${Date.now()}`,
        ...formData
      };
      
      // Add to records
      const updatedRecords = [...records, newRecord];
      setRecords(updatedRecords);
      
      // Recalculate stats
      calculateStats(updatedRecords);
      
      // Reset form and close modal
      setFormData({
        plantingDate: '',
        variety: '',
        germinationRate: 0,
        germDays: 0,
        harvestDate: '',
        yield: 0,
        yieldRating: 3,
        qualityRating: 3,
        notes: '',
        successFactors: [],
        challenges: []
      });
      
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding planting record:', err);
      setError('Failed to add planting record');
    }
  };
  
  // Delete a record
  const handleDelete = async (recordId) => {
    try {
      // In a real implementation, this would call an API endpoint
      // Mock implementation for demonstration
      
      const updatedRecords = records.filter(record => record.id !== recordId);
      setRecords(updatedRecords);
      
      // Recalculate stats
      calculateStats(updatedRecords);
    } catch (err) {
      console.error('Error deleting record:', err);
      setError('Failed to delete record');
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Render star rating
  const renderRating = (rating, max = 5) => {
    return (
      <div className="d-flex">
        {Array.from({ length: max }).map((_, i) => (
          <FontAwesomeIcon 
            key={i} 
            icon={faStar} 
            className={i < rating ? 'text-warning' : 'text-muted'} 
            style={{ fontSize: '0.9rem' }}
          />
        ))}
      </div>
    );
  };
  
  // If not premium, show upgrade message
  if (!isPremium) {
    return (
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <FontAwesomeIcon icon={faChartLine} className="me-2" />
          Historical Success Tracking
        </Card.Header>
        <Card.Body className="text-center py-5">
          <FontAwesomeIcon icon={faCrown} size="3x" className="mb-3 text-warning" />
          <h4>Historical Tracking is a Premium Feature</h4>
          <p className="mb-4">
            Track your planting success over time. Record germination rates, harvest yields, 
            and variety performance to improve your gardening results year after year.
          </p>
          <Button variant="warning" href="/upgrade">
            Upgrade to Premium
          </Button>
        </Card.Body>
      </Card>
    );
  }
  
  // If no plant is selected
  if (!plant) {
    return (
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <FontAwesomeIcon icon={faChartLine} className="me-2" />
          Historical Success Tracking
        </Card.Header>
        <Card.Body className="text-center py-4">
          <p>Please select a plant to view historical data.</p>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <div>
            <FontAwesomeIcon icon={faChartLine} className="me-2" />
            {plant.name} History
          </div>
          <div>
            <Button 
              variant="outline-success" 
              size="sm" 
              className="me-2"
              onClick={() => setShowStatsModal(true)}
            >
              <FontAwesomeIcon icon={faChartBar} className="me-1" />
              View Stats
            </Button>
            <Button 
              variant="success" 
              size="sm"
              onClick={() => setShowAddModal(true)}
            >
              <FontAwesomeIcon icon={faPlus} className="me-1" />
              Add Record
            </Button>
          </div>
        </Card.Header>
        
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading planting records...</p>
            </div>
          ) : records.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Date Planted</th>
                    <th>Variety</th>
                    <th>Germination</th>
                    <th>Harvest</th>
                    <th>Yield</th>
                    <th>Quality</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(record => (
                    <tr key={record.id}>
                      <td>{formatDate(record.plantingDate)}</td>
                      <td>{record.variety}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar bg-success" 
                              style={{ width: `${record.germinationRate}%` }}
                            ></div>
                          </div>
                          <span className="small">{record.germinationRate}%</span>
                        </div>
                        <div className="small text-muted">{record.germDays} days</div>
                      </td>
                      <td>{record.harvestDate ? formatDate(record.harvestDate) : 'N/A'}</td>
                      <td>{renderRating(record.yieldRating)}</td>
                      <td>{renderRating(record.qualityRating)}</td>
                      <td>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 me-2 text-muted"
                          title="Edit record"
                        >
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </Button>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 text-danger"
                          title="Delete record"
                          onClick={() => handleDelete(record.id)}
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p>No planting records found for this plant.</p>
              <Button 
                variant="outline-success" 
                onClick={() => setShowAddModal(true)}
              >
                <FontAwesomeIcon icon={faPlus} className="me-1" />
                Add Your First Record
              </Button>
            </div>
          )}
          
          {/* Quick Statistics */}
          {records.length > 0 && (
            <div className="statistics-summary mt-4">
              <h6 className="mb-3">Quick Stats</h6>
              <Row>
                <Col md={3} sm={6} className="mb-3">
                  <div className="bg-light rounded p-3 text-center h-100">
                    <div className="text-muted small">Total Plantings</div>
                    <div className="fw-bold fs-4">{stats.totalPlantings}</div>
                  </div>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                  <div className="bg-light rounded p-3 text-center h-100">
                    <div className="text-muted small">Avg Germination</div>
                    <div className="fw-bold fs-4">{Math.round(stats.avgGermination)}%</div>
                  </div>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                  <div className="bg-light rounded p-3 text-center h-100">
                    <div className="text-muted small">Best Variety</div>
                    <div className="fw-bold">{stats.bestVariety}</div>
                  </div>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                  <div className="bg-light rounded p-3 text-center h-100">
                    <div className="text-muted small">Fastest Germination</div>
                    <div className="fw-bold fs-4">{stats.fastestGerm} days</div>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Add Record Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Planting Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date Planted</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="plantingDate"
                    value={formData.plantingDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Variety</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="variety"
                    value={formData.variety}
                    onChange={handleInputChange}
                    placeholder="E.g. Better Boy, Roma, etc."
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Germination Rate (%)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="germinationRate"
                    value={formData.germinationRate}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Days to Germination</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="germDays"
                    value={formData.germDays}
                    onChange={handleInputChange}
                    min="0"
                    max="30"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Harvest Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="harvestDate"
                    value={formData.harvestDate}
                    onChange={handleInputChange}
                  />
                  <Form.Text className="text-muted">
                    Leave blank if not yet harvested
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Yield Rating (1-5)</Form.Label>
                  <div className="rating-selector d-flex align-items-center">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <FontAwesomeIcon 
                        key={rating}
                        icon={faStar} 
                        className={`me-2 ${rating <= formData.yieldRating ? 'text-warning' : 'text-muted'}`}
                        style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                        onClick={() => handleRatingChange('yieldRating', rating)}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Quality Rating (1-5)</Form.Label>
              <div className="rating-selector d-flex align-items-center">
                {[1, 2, 3, 4, 5].map(rating => (
                  <FontAwesomeIcon 
                    key={rating}
                    icon={faStar} 
                    className={`me-2 ${rating <= formData.qualityRating ? 'text-warning' : 'text-muted'}`}
                    style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                    onClick={() => handleRatingChange('qualityRating', rating)}
                  />
                ))}
              </div>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control 
                as="textarea" 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Add any observations, issues, or insights about this planting"
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Success Factors</Form.Label>
                  {commonFactors.map(factor => (
                    <Form.Check 
                      key={factor}
                      type="checkbox"
                      id={`success-${factor}`}
                      label={factor}
                      value={factor}
                      checked={formData.successFactors.includes(factor)}
                      onChange={(e) => handleCheckboxChange(e, 'successFactors')}
                    />
                  ))}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Challenges</Form.Label>
                  {commonChallenges.map(challenge => (
                    <Form.Check 
                      key={challenge}
                      type="checkbox"
                      id={`challenge-${challenge}`}
                      label={challenge}
                      value={challenge}
                      checked={formData.challenges.includes(challenge)}
                      onChange={(e) => handleCheckboxChange(e, 'challenges')}
                    />
                  ))}
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="success" type="submit">
                Save Record
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Statistics Modal */}
      <Modal show={showStatsModal} onHide={() => setShowStatsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faChartBar} className="me-2" />
            {plant.name} Statistics
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {records.length > 0 ? (
            <>
              <Row className="mb-4">
                <Col md={3} sm={6} className="mb-3">
                  <div className="bg-light rounded p-3 text-center h-100">
                    <div className="text-muted small">Total Plantings</div>
                    <div className="fw-bold fs-4">{stats.totalPlantings}</div>
                  </div>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                  <div className="bg-light rounded p-3 text-center h-100">
                    <div className="text-muted small">Avg Germination</div>
                    <div className="fw-bold fs-4">{Math.round(stats.avgGermination)}%</div>
                  </div>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                  <div className="bg-light rounded p-3 text-center h-100">
                    <div className="text-muted small">Avg Yield Rating</div>
                    <div className="fw-bold fs-4">{stats.avgYield.toFixed(1)}</div>
                    <div className="small">out of 5</div>
                  </div>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                  <div className="bg-light rounded p-3 text-center h-100">
                    <div className="text-muted small">Fastest Germination</div>
                    <div className="fw-bold fs-4">{stats.fastestGerm} days</div>
                  </div>
                </Col>
              </Row>
              
              <div className="mb-4">
                <h6>Variety Performance</h6>
                <Table size="sm">
                  <thead>
                    <tr>
                      <th>Variety</th>
                      <th>Plantings</th>
                      <th>Avg Germination</th>
                      <th>Avg Yield</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(
                      records.reduce((acc, record) => {
                        const { variety, germinationRate, yieldRating, qualityRating } = record;
                        if (!acc[variety]) {
                          acc[variety] = {
                            count: 0,
                            totalGerm: 0,
                            totalYield: 0,
                            totalQuality: 0
                          };
                        }
                        acc[variety].count += 1;
                        acc[variety].totalGerm += germinationRate;
                        acc[variety].totalYield += yieldRating;
                        acc[variety].totalQuality += qualityRating;
                        return acc;
                      }, {})
                    ).map(([variety, data]) => (
                      <tr key={variety}>
                        <td>{variety}</td>
                        <td>{data.count}</td>
                        <td>{Math.round(data.totalGerm / data.count)}%</td>
                        <td>{(data.totalYield / data.count).toFixed(1)}</td>
                        <td>{renderRating(Math.round(data.totalQuality / data.count))}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              <div className="mb-4">
                <h6>Success Factors</h6>
                <Row>
                  {Object.entries(
                    records.flatMap(r => r.successFactors).reduce((acc, factor) => {
                      acc[factor] = (acc[factor] || 0) + 1;
                      return acc;
                    }, {})
                  )
                    .sort((a, b) => b[1] - a[1])
                    .map(([factor, count]) => (
                      <Col md={4} key={factor}>
                        <div className="d-flex justify-content-between mb-2">
                          <div>{factor}</div>
                          <Badge bg="success">{count}</Badge>
                        </div>
                      </Col>
                    ))}
                </Row>
              </div>
              
              <div>
                <h6>Common Challenges</h6>
                <Row>
                  {Object.entries(
                    records.flatMap(r => r.challenges).reduce((acc, challenge) => {
                      acc[challenge] = (acc[challenge] || 0) + 1;
                      return acc;
                    }, {})
                  )
                    .sort((a, b) => b[1] - a[1])
                    .map(([challenge, count]) => (
                      <Col md={4} key={challenge}>
                        <div className="d-flex justify-content-between mb-2">
                          <div>{challenge}</div>
                          <Badge bg="danger">{count}</Badge>
                        </div>
                      </Col>
                    ))}
                </Row>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p>No statistics available. Add planting records first.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default HistoricalSuccessTracker;