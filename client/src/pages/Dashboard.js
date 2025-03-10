import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Tab, Nav, Badge, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLeaf, faSeedling, faCalendarAlt, faCloudSun, 
  faChartLine, faMapMarkerAlt, faCheck, faDownload, 
  faSun, faThermometerHalf, faStar
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../utils/AuthContext';

// Components
import WeatherWidget from '../components/WeatherWidget';
import MicroclimateAdjustment from '../components/MicroclimateAdjustment';
import SuccessionPlantingCalculator from '../components/SuccessionPlantingCalculator';
import PlantingCalendar from '../components/calendar/PlantingCalendar';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');
  const [gardens, setGardens] = useState([]);
  const [selectedGarden, setSelectedGarden] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [plantHistory, setPlantHistory] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [zone, setZone] = useState(null);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  // const [isDataLoading, setIsDataLoading] = useState(true); // Not used
  const [error, setError] = useState(null);
  
  // Mock subscription status for demonstration
  const userSubscription = currentUser?.subscription || 'free';
  
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real implementation, these would be API calls
        // Mock implementation for demonstration
        
        // Mock user location
        const location = currentUser?.location || { lat: 37.7749, lng: -122.4194 };
        setUserLocation(location);
        
        // Mock hardiness zone
        const mockZone = {
          code: '8b',
          firstFrost: '2023-11-10',
          lastFrost: '2023-02-28',
          tempRange: '15°F to 20°F'
        };
        setZone(mockZone);
        
        // Mock gardens
        const mockGardens = [
          {
            id: '1',
            name: 'Backyard Vegetable Garden',
            area: '200 sq ft',
            soilType: 'Loamy',
            sunExposure: 'Full Sun',
            plants: [
              { id: '101', name: 'Tomato' },
              { id: '102', name: 'Cucumber' },
              { id: '103', name: 'Lettuce' }
            ],
            microclimate: {
              id: '1',
              name: 'Sunny South Facing',
              adjustments: { spring: 5, fall: 7 }
            }
          },
          {
            id: '2',
            name: 'Front Yard Herb Garden',
            area: '50 sq ft',
            soilType: 'Sandy Loam',
            sunExposure: 'Partial Sun',
            plants: [
              { id: '201', name: 'Basil' },
              { id: '202', name: 'Rosemary' },
              { id: '203', name: 'Thyme' }
            ],
            microclimate: null
          }
        ];
        setGardens(mockGardens);
        
        if (mockGardens.length > 0) {
          setSelectedGarden(mockGardens[0]);
        }
        
        // Mock plant history data
        const mockHistory = {
          '101': {
            germination: { success: 85, notes: 'Takes 7-10 days with soil temp above 65°F' },
            harvest: { yield: 4, rating: 4.5, notes: 'Excellent production mid-summer' },
            varieties: [
              { name: 'Better Boy', performance: 5, notes: 'Excellent disease resistance' },
              { name: 'Cherokee Purple', performance: 4, notes: 'Great flavor but lower yield' }
            ],
            images: []
          }
        };
        setPlantHistory(mockHistory);
        
        // Mock upcoming tasks
        const mockTasks = [
          { id: '1', gardenId: '1', plantId: '101', name: 'Transplant tomato seedlings', date: '2023-05-10', completed: false },
          { id: '2', gardenId: '1', plantId: '102', name: 'Sow cucumber seeds', date: '2023-05-15', completed: false },
          { id: '3', gardenId: '2', plantId: '201', name: 'Harvest basil leaves', date: '2023-05-12', completed: false },
          { id: '4', gardenId: '1', plantId: '103', name: 'Thin lettuce seedlings', date: '2023-05-08', completed: true }
        ];
        setUpcomingTasks(mockTasks);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  // Handle plant selection
  const handlePlantSelect = (plant) => {
    setSelectedPlant(plant);
  };
  
  // Handle garden selection
  const handleGardenSelect = (garden) => {
    setSelectedGarden(garden);
    setSelectedPlant(null);
  };
  
  // Mark task as completed
  const completeTask = (taskId) => {
    setUpcomingTasks(upcomingTasks.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ));
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Generate PDF calendar
  const generatePDFCalendar = () => {
    if (userSubscription === 'free') {
      alert('Upgade to premium to export calendars');
      return;
    }
    
    // In a real implementation, this would call an API endpoint
    console.log('Generating PDF calendar...');
  };
  
  return (
    <Container fluid="lg" className="py-4">
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row className="mb-4">
        <Col>
          <h1 className="mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>My PlantPerfectly</h1>
          <p className="text-muted">Plan your perfect garden with optimized planting schedules.</p>
        </Col>
        <Col md="auto" className="d-flex align-items-center">
          {zone && (
            <div className="zone-badge px-3 py-2 rounded-pill" style={{ backgroundColor: '#8FC0A9', color: 'white' }}>
              <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
              Zone {zone.code}
            </div>
          )}
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={8}>
          <Tab.Container id="dashboard-tabs" activeKey={activeTab} onSelect={setActiveTab}>
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <Nav variant="tabs" className="border-bottom-0">
                  <Nav.Item>
                    <Nav.Link eventKey="calendar">
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                      Planting Calendar
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="succession">
                      <FontAwesomeIcon icon={faSeedling} className="me-2" />
                      Succession Planting
                      {userSubscription === 'free' && (
                        <Badge bg="warning" text="dark" className="ms-2" pill>Premium</Badge>
                      )}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="microclimate">
                      <FontAwesomeIcon icon={faSun} className="me-2" />
                      Microclimate
                      {userSubscription === 'free' && (
                        <Badge bg="warning" text="dark" className="ms-2" pill>Premium</Badge>
                      )}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="history">
                      <FontAwesomeIcon icon={faChartLine} className="me-2" />
                      History
                      {userSubscription === 'free' && (
                        <Badge bg="warning" text="dark" className="ms-2" pill>Premium</Badge>
                      )}
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="calendar">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <select 
                          className="form-select mb-2"
                          value={selectedGarden?.id || ''}
                          onChange={(e) => {
                            const garden = gardens.find(g => g.id === e.target.value);
                            handleGardenSelect(garden);
                          }}
                        >
                          <option value="">Select a garden...</option>
                          {gardens.map((garden) => (
                            <option key={garden.id} value={garden.id}>{garden.name}</option>
                          ))}
                        </select>
                        {selectedGarden && (
                          <div className="text-muted small">
                            {selectedGarden.area} • {selectedGarden.sunExposure} • {selectedGarden.soilType}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={generatePDFCalendar}
                      >
                        <FontAwesomeIcon icon={faDownload} className="me-1" />
                        Export Calendar
                        {userSubscription === 'free' && (
                          <Badge bg="warning" text="dark" className="ms-2" pill>Premium</Badge>
                        )}
                      </Button>
                    </div>
                    
                    {selectedGarden ? (
                      <PlantingCalendar 
                        garden={selectedGarden} 
                        zone={zone}
                        userLocation={userLocation}
                        onPlantSelect={handlePlantSelect}
                      />
                    ) : (
                      <div className="text-center py-5">
                        <p>Please select a garden to view your planting calendar.</p>
                        <Link to="/gardens/new" className="btn btn-success mt-2">
                          <FontAwesomeIcon icon={faLeaf} className="me-2" />
                          Create New Garden
                        </Link>
                      </div>
                    )}
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="succession">
                    {userSubscription !== 'free' ? (
                      <>
                        <div className="mb-3">
                          <h5>Succession Planting Calculator</h5>
                          <p className="text-muted small">
                            Plan staggered plantings to extend your harvest season and maximize yields.
                          </p>
                        </div>
                        
                        {selectedPlant ? (
                          <SuccessionPlantingCalculator 
                            selectedPlant={selectedPlant} 
                            zone={zone}
                            userSubscription={userSubscription}
                          />
                        ) : (
                          <div className="text-center py-4">
                            <p>Select a plant from your calendar to create a succession planting plan.</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="premium-feature-overlay text-center py-5">
                        <FontAwesomeIcon icon={faSeedling} size="3x" className="mb-3 text-success" />
                        <h4>Succession Planting Calculator</h4>
                        <p>Optimize your harvest with staggered planting schedules.</p>
                        <Button variant="warning" as={Link} to="/upgrade">
                          Upgrade to Premium
                        </Button>
                      </div>
                    )}
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="microclimate">
                    {userSubscription !== 'free' ? (
                      <>
                        <div className="mb-3">
                          <h5>Microclimate Adjustments</h5>
                          <p className="text-muted small">
                            Fine-tune your planting dates based on your garden's unique microclimate factors.
                          </p>
                        </div>
                        
                        <MicroclimateAdjustment 
                          onSave={(data) => console.log('Microclimate saved:', data)}
                          userSubscription={userSubscription}
                          zone={zone}
                        />
                      </>
                    ) : (
                      <div className="premium-feature-overlay text-center py-5">
                        <FontAwesomeIcon icon={faSun} size="3x" className="mb-3 text-warning" />
                        <h4>Microclimate Adjustments</h4>
                        <p>Factor in local conditions for more accurate planting dates.</p>
                        <Button variant="warning" as={Link} to="/upgrade">
                          Upgrade to Premium
                        </Button>
                      </div>
                    )}
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="history">
                    {userSubscription !== 'free' ? (
                      <>
                        <div className="mb-3">
                          <h5>Planting History & Performance</h5>
                          <p className="text-muted small">
                            Track your gardening success and learn from your experiences.
                          </p>
                        </div>
                        
                        {selectedPlant && plantHistory[selectedPlant.id] ? (
                          <div className="plant-history">
                            <h6>{selectedPlant.name} History</h6>
                            
                            <Card className="mb-3">
                              <Card.Header className="bg-light">Germination Stats</Card.Header>
                              <Card.Body>
                                <div className="d-flex align-items-center mb-2">
                                  <div className="flex-grow-1">Success Rate</div>
                                  <div className="progress flex-grow-2" style={{ height: '10px', width: '60%' }}>
                                    <div 
                                      className="progress-bar bg-success" 
                                      style={{ width: `${plantHistory[selectedPlant.id].germination.success}%` }}
                                    ></div>
                                  </div>
                                  <div className="ms-2 text-muted">{plantHistory[selectedPlant.id].germination.success}%</div>
                                </div>
                                <div className="small text-muted">
                                  {plantHistory[selectedPlant.id].germination.notes}
                                </div>
                              </Card.Body>
                            </Card>
                            
                            <Card className="mb-3">
                              <Card.Header className="bg-light">Harvest Stats</Card.Header>
                              <Card.Body>
                                <div className="d-flex mb-2">
                                  <div className="flex-grow-1">Average Yield</div>
                                  <div>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <FontAwesomeIcon 
                                        key={i}
                                        icon={faLeaf} 
                                        className={i < plantHistory[selectedPlant.id].harvest.yield ? 'text-success' : 'text-muted'}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="d-flex mb-2">
                                  <div className="flex-grow-1">Overall Rating</div>
                                  <div>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <FontAwesomeIcon 
                                        key={i}
                                        icon={faStar} 
                                        className={
                                          i < Math.floor(plantHistory[selectedPlant.id].harvest.rating) 
                                            ? 'text-warning' 
                                            : i < plantHistory[selectedPlant.id].harvest.rating
                                              ? 'text-warning-50'
                                              : 'text-muted'
                                        }
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="small text-muted">
                                  {plantHistory[selectedPlant.id].harvest.notes}
                                </div>
                              </Card.Body>
                            </Card>
                            
                            <Card>
                              <Card.Header className="bg-light">Variety Performance</Card.Header>
                              <div className="list-group list-group-flush">
                                {plantHistory[selectedPlant.id].varieties.map((variety, index) => (
                                  <div key={index} className="list-group-item">
                                    <div className="d-flex justify-content-between">
                                      <strong>{variety.name}</strong>
                                      <div>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                          <FontAwesomeIcon 
                                            key={i}
                                            icon={faStar} 
                                            className={i < variety.performance ? 'text-warning' : 'text-muted'}
                                            size="sm"
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <div className="small text-muted">{variety.notes}</div>
                                  </div>
                                ))}
                              </div>
                            </Card>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p>Select a plant from your calendar to view its performance history.</p>
                            {!selectedPlant && (
                              <p className="small text-muted">Or add planting records to start tracking your results.</p>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="premium-feature-overlay text-center py-5">
                        <FontAwesomeIcon icon={faChartLine} size="3x" className="mb-3 text-success" />
                        <h4>Planting History Tracking</h4>
                        <p>Record and analyze your garden success over time.</p>
                        <Button variant="warning" as={Link} to="/upgrade">
                          Upgrade to Premium
                        </Button>
                      </div>
                    )}
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </Col>
        
        <Col md={4}>
          {/* Weather Widget */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white">
              <FontAwesomeIcon icon={faCloudSun} className="me-2" />
              Weather & Conditions
            </Card.Header>
            <Card.Body className="p-0">
              <WeatherWidget 
                location={userLocation} 
                zone={zone}
                userSubscription={userSubscription}
              />
            </Card.Body>
          </Card>
          
          {/* Soil Temperature */}
          {userSubscription !== 'free' && (
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-white">
                <FontAwesomeIcon icon={faThermometerHalf} className="me-2" />
                Soil Temperature
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <div 
                    className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      backgroundColor: '#8FC0A9',
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}
                  >
                    58°F
                  </div>
                  <div>
                    <div className="fw-bold">Current Surface Temperature</div>
                    <div className="small text-muted">
                      Good for cool-season crops: lettuce, spinach, peas
                    </div>
                  </div>
                </div>
                <div className="small mb-2">
                  <div><strong>2" depth:</strong> 55°F - Seed germination zone</div>
                  <div><strong>4" depth:</strong> 54°F - Root development zone</div>
                </div>
                <div className="small text-muted">
                  Last updated: Today at 9:45 AM
                </div>
              </Card.Body>
            </Card>
          )}
          
          {/* Upcoming Tasks */}
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              Upcoming Tasks
            </Card.Header>
            <div className="list-group list-group-flush">
              {upcomingTasks.filter(task => !task.completed).slice(0, 5).map((task) => (
                <div key={task.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="d-flex align-items-center">
                        <Badge 
                          bg={new Date(task.date) < new Date() ? 'danger' : 'primary'} 
                          className="me-2"
                        >
                          {formatDate(task.date)}
                        </Badge>
                        {task.name}
                      </div>
                      <div className="small text-muted mt-1">
                        {gardens.find(g => g.id === task.gardenId)?.name}
                      </div>
                    </div>
                    <Button 
                      variant="success" 
                      size="sm" 
                      className="ms-2"
                      onClick={() => completeTask(task.id)}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </Button>
                  </div>
                </div>
              ))}
              
              {upcomingTasks.filter(task => !task.completed).length === 0 && (
                <div className="list-group-item text-center py-4">
                  <p className="mb-0">No upcoming tasks.</p>
                </div>
              )}
            </div>
            <Card.Footer className="bg-white">
              <Link to="/tasks" className="btn btn-outline-primary btn-sm w-100">
                View All Tasks
              </Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;

