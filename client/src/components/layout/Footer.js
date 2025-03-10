import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, InputGroup, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSeedling, faEnvelope, faBook, faMapMarkerAlt, 
  faLeaf, faCalendarAlt, faSun, faUser
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebook, faTwitter, faInstagram, faPinterest 
} from '@fortawesome/free-brands-svg-icons';

const Footer = ({ isMobile }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`py-4 py-md-5 mt-4 mt-md-5 mobile-footer ${isMobile ? 'mobile-view-footer' : ''}`} style={{ backgroundColor: '#4A7C59', color: 'white' }}>
      <Container>
        <Row className="mb-3 mb-md-4 gy-4">
          <Col lg={4} md={6} className="mb-4 mb-md-0">
            <h5 className="mb-3 d-flex align-items-center" style={{ fontFamily: "'Playfair Display', serif" }}>
              <FontAwesomeIcon icon={faSeedling} className="me-2" />
              <span>PlantPerfectly</span>
            </h5>
            <p className="mb-3 footer-text">
              Your intelligent gardening companion for optimal planting schedules, 
              microclimate adjustments, and harvest planning.
            </p>
            <div className="d-flex gap-3 mb-3 social-icons">
              <Link to="/social/facebook" className="text-white social-icon">
                <FontAwesomeIcon icon={faFacebook} size="lg" />
              </Link>
              <Link to="/social/twitter" className="text-white social-icon">
                <FontAwesomeIcon icon={faTwitter} size="lg" />
              </Link>
              <Link to="/social/instagram" className="text-white social-icon">
                <FontAwesomeIcon icon={faInstagram} size="lg" />
              </Link>
              <Link to="/social/pinterest" className="text-white social-icon">
                <FontAwesomeIcon icon={faPinterest} size="lg" />
              </Link>
            </div>
          </Col>
          
          <Col lg={2} md={6} sm={6} xs={6} className="mb-4 mb-md-0">
            <h6 className="mb-2 mb-md-3 text-uppercase" style={{ fontFamily: "'Playfair Display', serif", color: '#F4B942' }}>
              Navigation
            </h6>
            <ul className="list-unstyled footer-links">
              <li className="mb-2">
                <Link to="/" className="text-white text-decoration-none footer-link">
                  <FontAwesomeIcon icon={faLeaf} className="me-2" fixedWidth />
                  <span>Home</span>
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/dashboard" className="text-white text-decoration-none footer-link">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" fixedWidth />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/plants" className="text-white text-decoration-none footer-link">
                  <FontAwesomeIcon icon={faLeaf} className="me-2" fixedWidth />
                  <span>Plants</span>
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/gardens" className="text-white text-decoration-none footer-link">
                  <FontAwesomeIcon icon={faSun} className="me-2" fixedWidth />
                  <span>Gardens</span>
                </Link>
              </li>
            </ul>
          </Col>
          
          <Col lg={2} md={6} sm={6} xs={6} className="mb-4 mb-md-0">
            <h6 className="mb-2 mb-md-3 text-uppercase" style={{ fontFamily: "'Playfair Display', serif", color: '#F4B942' }}>
              Resources
            </h6>
            <ul className="list-unstyled footer-links">
              <li className="mb-2">
                <Link to="/plants" className="text-white text-decoration-none footer-link">
                  <FontAwesomeIcon icon={faBook} className="me-2" fixedWidth />
                  <span>Plant Database</span>
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/zones" className="text-white text-decoration-none footer-link">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" fixedWidth />
                  <span>Zone Finder</span>
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/tips" className="text-white text-decoration-none footer-link">
                  <FontAwesomeIcon icon={faLeaf} className="me-2" fixedWidth />
                  <span>Gardening Tips</span>
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/community" className="text-white text-decoration-none footer-link">
                  <FontAwesomeIcon icon={faUser} className="me-2" fixedWidth />
                  <span>Community</span>
                </Link>
              </li>
            </ul>
          </Col>
          
          <Col lg={4} md={6}>
            <h6 className="mb-2 mb-md-3 text-uppercase" style={{ fontFamily: "'Playfair Display', serif", color: '#F4B942' }}>
              Newsletter
            </h6>
            <p className="footer-text">Subscribe for seasonal planting advice and gardening tips.</p>
            <InputGroup className={`mb-3 newsletter-form ${isMobile ? 'flex-column' : ''}`}>
              <Form.Control
                placeholder="Your email"
                aria-label="Your email"
                aria-describedby="subscribe-button"
                style={{ borderColor: '#8FC0A9' }}
                className="footer-input"
              />
              <Button 
                variant="warning" 
                id="subscribe-button"
                style={{ backgroundColor: '#F4B942', borderColor: '#F4B942' }}
                className={`footer-btn ${isMobile ? 'mt-2 w-100' : ''}`}
              >
                <FontAwesomeIcon icon={faEnvelope} className="me-1" />
                <span className={isMobile ? '' : 'd-none d-sm-inline'}>Subscribe</span>
              </Button>
            </InputGroup>
          </Col>
        </Row>
        
        <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        
        <Row className="footer-bottom">
          <Col md={6} className={`mb-3 mb-md-0 ${isMobile ? 'text-center' : 'text-center text-md-start'}`}>
            <p className="mb-0 copyright-text" style={{ fontSize: '0.9rem' }}>
              &copy; {currentYear} PlantPerfectly. All rights reserved.
            </p>
          </Col>
          <Col md={6}>
            <ul className={`list-inline mb-0 footer-legal d-flex flex-wrap ${isMobile ? 'justify-content-center' : 'justify-content-center justify-content-md-end'}`}>
              <li className="list-inline-item me-3 mb-2">
                <Link to="/privacy" className="text-white text-decoration-none footer-legal-link" style={{ fontSize: '0.9rem' }}>
                  Privacy Policy
                </Link>
              </li>
              <li className="list-inline-item me-3 mb-2">
                <Link to="/terms" className="text-white text-decoration-none footer-legal-link" style={{ fontSize: '0.9rem' }}>
                  Terms of Service
                </Link>
              </li>
              <li className="list-inline-item mb-2">
                <Link to="/contact" className="text-white text-decoration-none footer-legal-link" style={{ fontSize: '0.9rem' }}>
                  Contact Us
                </Link>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;