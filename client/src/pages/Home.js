import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSeedling, faCalendarAlt, faMapMarkerAlt, 
  faLeaf, faSun, faCloudSun, faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../utils/AuthContext';

// Import the new main component
import GlobalSeedSowingCalendar from '../components/GlobalSeedSowingCalendar';

const Home = ({ userLocation }) => {
  const { currentUser } = useAuth();
  
  return (
    <div className="home-page">
      {/* Header Section */}
      <section className="header-section text-center py-4" style={{ backgroundColor: '#ffffff' }}>
        <Container>
          <div className="d-flex justify-content-center align-items-center mb-3">
            <FontAwesomeIcon icon={faSeedling} style={{ color: '#4A9C59', fontSize: '2.5rem', marginRight: '15px' }} />
            <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '600', color: '#333', margin: 0 }}>
              PlantPerfectly
            </h1>
          </div>
          <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>
            Know exactly when to plant your seeds, anywhere in the world
          </p>
        </Container>
      </section>

      {/* If user is logged in or comes directly, show calendar component */}
      {currentUser || window.location.pathname === '/calendar' ? (
        <GlobalSeedSowingCalendar userLocation={userLocation} />
      ) : (
        <>
          {/* Hero Section */}
          <section 
            className="hero-section text-white py-5" 
            style={{ 
              background: `linear-gradient(rgba(74, 156, 89, 0.9), rgba(74, 156, 89, 0.8)), url('/images/garden-bg.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center' 
            }}
          >
            <Container className="py-4">
              <Row className="align-items-center">
                <Col lg={6} className="text-lg-start text-center mb-4 mb-lg-0">
                  <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2.2rem' }}>
                    Plan Your Garden With Precision
                  </h2>
                  <p className="lead mb-4">
                    Our calendar provides you with exact planting dates based on your location, taking into account frost dates and growing seasons.
                  </p>
                  <Button 
                    as={Link} 
                    to="/calendar" 
                    variant="light" 
                    size="lg" 
                    className="mb-2 mb-md-0 me-md-3"
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    Try It Now
                  </Button>
                  <Button 
                    as={Link} 
                    to="/plants" 
                    variant="outline-light" 
                    size="lg"
                  >
                    <FontAwesomeIcon icon={faLeaf} className="me-2" />
                    Explore Plants
                  </Button>
                </Col>
                <Col lg={6} className="d-flex justify-content-center">
                  <img 
                    src="/images/calendar-preview.png" 
                    alt="PlantPerfectly Preview" 
                    className="img-fluid rounded shadow-lg"
                    style={{ maxHeight: '400px' }}
                  />
                </Col>
              </Row>
            </Container>
          </section>
          
          {/* How It Works Section */}
          <section className="how-it-works-section py-5" style={{ backgroundColor: '#f8f9fa' }}>
            <Container>
              <Row className="text-center mb-5">
                <Col>
                  <h2 className="mb-3" style={{ color: '#4A9C59', fontFamily: 'Montserrat, sans-serif' }}>
                    How It Works
                  </h2>
                </Col>
              </Row>
              
              <Row className="g-4 justify-content-center">
                <Col lg={4} md={6}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="p-4 text-center">
                      <div className="mb-3">
                        <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: '#4A9C59', fontSize: '2.5rem' }} />
                      </div>
                      <h5 className="card-title" style={{ color: '#4A9C59' }}>
                        Enter Your Location
                      </h5>
                      <Card.Text>
                        Select your country and enter your postal code. We'll determine your growing zone and frost dates automatically.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={4} md={6}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="p-4 text-center">
                      <div className="mb-3">
                        <FontAwesomeIcon icon={faLeaf} style={{ color: '#4A9C59', fontSize: '2.5rem' }} />
                      </div>
                      <h5 className="card-title" style={{ color: '#4A9C59' }}>
                        Select Your Plants
                      </h5>
                      <Card.Text>
                        Choose from our extensive database of vegetables, herbs, and flowers to add to your gardening plan.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={4} md={6}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="p-4 text-center">
                      <div className="mb-3">
                        <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#4A9C59', fontSize: '2.5rem' }} />
                      </div>
                      <h5 className="card-title" style={{ color: '#4A9C59' }}>
                        Get Your Calendar
                      </h5>
                      <Card.Text>
                        View your personalized planting calendar showing when to start seeds indoors, direct sow, or transplant.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <Row className="mt-5">
                <Col className="text-center">
                  <Button 
                    as={Link} 
                    to="/calendar" 
                    variant="success" 
                    size="lg"
                    style={{ backgroundColor: '#4A9C59', borderColor: '#4A9C59' }}
                  >
                    Create Your Calendar
                  </Button>
                </Col>
              </Row>
            </Container>
          </section>
          
          {/* Features Section */}
          <section className="features-section py-5">
            <Container>
              <Row className="text-center mb-5">
                <Col>
                  <h2 className="mb-3" style={{ color: '#4A9C59', fontFamily: 'Montserrat, sans-serif' }}>
                    Features
                  </h2>
                </Col>
              </Row>
              
              <Row className="g-4">
                <Col lg={3} md={6}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="p-3">
                      <div className="text-center mb-3">
                        <FontAwesomeIcon icon={faMapMarkerAlt} size="2x" style={{ color: '#4A9C59' }} />
                      </div>
                      <h5 className="card-title text-center" style={{ color: '#4A9C59', fontSize: '1.1rem' }}>
                        Location-Based
                      </h5>
                      <Card.Text style={{ fontSize: '0.9rem' }}>
                        Customized planting dates based on your specific growing zone and frost dates.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={3} md={6}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="p-3">
                      <div className="text-center mb-3">
                        <FontAwesomeIcon icon={faSun} size="2x" style={{ color: '#4A9C59' }} />
                      </div>
                      <h5 className="card-title text-center" style={{ color: '#4A9C59', fontSize: '1.1rem' }}>
                        Seasonal Planning
                      </h5>
                      <Card.Text style={{ fontSize: '0.9rem' }}>
                        Clear visualization of indoor starting and direct sowing periods for each season.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={3} md={6}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="p-3">
                      <div className="text-center mb-3">
                        <FontAwesomeIcon icon={faArrowRight} size="2x" style={{ color: '#4A9C59' }} />
                      </div>
                      <h5 className="card-title text-center" style={{ color: '#4A9C59', fontSize: '1.1rem' }}>
                        Succession Planting
                      </h5>
                      <Card.Text style={{ fontSize: '0.9rem' }}>
                        Calculate optimal times for staggered plantings to maximize your harvest.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={3} md={6}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="p-3">
                      <div className="text-center mb-3">
                        <FontAwesomeIcon icon={faCloudSun} size="2x" style={{ color: '#4A9C59' }} />
                      </div>
                      <h5 className="card-title text-center" style={{ color: '#4A9C59', fontSize: '1.1rem' }}>
                        Weather Integration
                      </h5>
                      <Card.Text style={{ fontSize: '0.9rem' }}>
                        Current weather data to help you make informed planting decisions.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Container>
          </section>
          
          {/* CTA Section */}
          <section 
            className="cta-section py-4 text-white text-center" 
            style={{ 
              background: `linear-gradient(rgba(74, 156, 89, 0.95), rgba(74, 156, 89, 0.9))` 
            }}
          >
            <Container>
              <Row className="justify-content-center">
                <Col lg={8}>
                  <h2 className="mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Start Planning Your Garden Today
                  </h2>
                  <p className="mb-4">
                    Take the guesswork out of gardening with our precise planting calendar.
                  </p>
                  <Button 
                    as={Link} 
                    to="/calendar" 
                    variant="light" 
                    size="lg"
                    className="me-3 mb-2 mb-md-0"
                  >
                    Create Calendar
                  </Button>
                  {!currentUser && (
                    <Button 
                      as={Link} 
                      to="/login" 
                      variant="outline-light" 
                      size="lg"
                    >
                      Log In
                    </Button>
                  )}
                </Col>
              </Row>
            </Container>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;