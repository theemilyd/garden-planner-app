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

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-5 mt-5" style={{ backgroundColor: '#4A7C59', color: 'white' }}>
      <Container>
        <Row className="mb-4">
          <Col lg={4} md={6} className="mb-4 mb-md-0">
            <h5 className="mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              <FontAwesomeIcon icon={faSeedling} className="me-2" />
              Seed Calendar
            </h5>
            <p className="mb-3">
              Your intelligent gardening companion for optimal planting schedules, 
              microclimate adjustments, and harvest planning.
            </p>
            <div className="d-flex gap-3 mb-3">
              <Link to="/social/facebook" className="text-white">
                <FontAwesomeIcon icon={faFacebook} size="lg" />
              </Link>
              <Link to="/social/twitter" className="text-white">
                <FontAwesomeIcon icon={faTwitter} size="lg" />
              </Link>
              <Link to="/social/instagram" className="text-white">
                <FontAwesomeIcon icon={faInstagram} size="lg" />
              </Link>
              <Link to="/social/pinterest" className="text-white">
                <FontAwesomeIcon icon={faPinterest} size="lg" />
              </Link>
            </div>
          </Col>
          
          <Col lg={2} md={6} className="mb-4 mb-md-0">
            <h6 className="mb-3 text-uppercase" style={{ fontFamily: "'Playfair Display', serif", color: '#F4B942' }}>
              Navigation
            </h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-white text-decoration-none">
                  <FontAwesomeIcon icon={faLeaf} className="me-2" fixedWidth />
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/dashboard" className="text-white text-decoration-none">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" fixedWidth />
                  Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/plants" className="text-white text-decoration-none">
                  <FontAwesomeIcon icon={faLeaf} className="me-2" fixedWidth />
                  Plants
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/gardens" className="text-white text-decoration-none">
                  <FontAwesomeIcon icon={faSun} className="me-2" fixedWidth />
                  Gardens
                </Link>
              </li>
            </ul>
          </Col>
          
          <Col lg={2} md={6} className="mb-4 mb-md-0">
            <h6 className="mb-3 text-uppercase" style={{ fontFamily: "'Playfair Display', serif", color: '#F4B942' }}>
              Resources
            </h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/plants" className="text-white text-decoration-none">
                  <FontAwesomeIcon icon={faBook} className="me-2" fixedWidth />
                  Plant Database
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/zones" className="text-white text-decoration-none">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" fixedWidth />
                  Zone Finder
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/tips" className="text-white text-decoration-none">
                  <FontAwesomeIcon icon={faLeaf} className="me-2" fixedWidth />
                  Gardening Tips
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/community" className="text-white text-decoration-none">
                  <FontAwesomeIcon icon={faUser} className="me-2" fixedWidth />
                  Community
                </Link>
              </li>
            </ul>
          </Col>
          
          <Col lg={4} md={6}>
            <h6 className="mb-3 text-uppercase" style={{ fontFamily: "'Playfair Display', serif", color: '#F4B942' }}>
              Newsletter
            </h6>
            <p>Subscribe for seasonal planting advice and gardening tips.</p>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Your email"
                aria-label="Your email"
                aria-describedby="subscribe-button"
                style={{ borderColor: '#8FC0A9' }}
              />
              <Button 
                variant="warning" 
                id="subscribe-button"
                style={{ backgroundColor: '#F4B942', borderColor: '#F4B942' }}
              >
                <FontAwesomeIcon icon={faEnvelope} className="me-1" />
                Subscribe
              </Button>
            </InputGroup>
          </Col>
        </Row>
        
        <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        
        <Row>
          <Col md={6} className="mb-3 mb-md-0">
            <p className="mb-0" style={{ fontSize: '0.9rem' }}>
              &copy; {currentYear} Seed Calendar. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="d-flex justify-content-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item me-3">
                <Link to="/privacy" className="text-white text-decoration-none" style={{ fontSize: '0.9rem' }}>
                  Privacy Policy
                </Link>
              </li>
              <li className="list-inline-item me-3">
                <Link to="/terms" className="text-white text-decoration-none" style={{ fontSize: '0.9rem' }}>
                  Terms of Service
                </Link>
              </li>
              <li className="list-inline-item">
                <Link to="/contact" className="text-white text-decoration-none" style={{ fontSize: '0.9rem' }}>
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