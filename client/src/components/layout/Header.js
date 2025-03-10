import React, { useState } from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, faLeaf, faSeedling, 
  faSignInAlt, faSun, faTimes, faBars
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../utils/AuthContext';

function Header({ isMobile }) {
  // eslint-disable-next-line no-unused-vars
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  
  // Mock subscription status for demonstration - commented out as unused
  // const subscription = currentUser?.subscription || 'free';
  
  // Commented out as unused but keeping for future use
  // const handleLogout = () => {
  //   logout();
  //   navigate('/login');
  //   setExpanded(false);
  // };
  
  const handleNavigation = (path) => {
    navigate(path);
    setExpanded(false);
  };
  
  return (
    <Navbar 
      expand="lg" 
      className={`py-2 mobile-optimized-navbar ${isMobile ? 'mobile-navbar' : ''}`}
      expanded={expanded}
      onToggle={setExpanded}
      bg="forest-green"
      variant="dark"
      sticky="top"
    >
      <Container fluid="md">
        <Navbar.Brand as={Link} to="/" onClick={() => setExpanded(false)} className="mobile-brand">
          <FontAwesomeIcon icon={faSeedling} className="me-2" />
          <span className="brand-text d-none d-sm-inline">PlantPerfectly</span>
          <span className="brand-text d-inline d-sm-none">PlantPerfectly</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0">
          <FontAwesomeIcon icon={expanded ? faTimes : faBars} />
        </Navbar.Toggle>
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className={`ms-auto ${isMobile ? 'mobile-nav' : ''}`}>
            <Nav.Link 
              as={Link} 
              to="/" 
              active={location.pathname === '/'} 
              onClick={() => setExpanded(false)}
              className={`${isMobile ? 'mobile-nav-link' : ''} py-2`}
            >
              <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
              <span>Planting Guide</span>
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/planting-calendar" 
              active={location.pathname === '/planting-calendar'} 
              onClick={() => setExpanded(false)}
              className={`${isMobile ? 'mobile-nav-link' : ''} py-2`}
            >
              <FontAwesomeIcon icon={faLeaf} className="me-1" />
              <span>Planting Calendar</span>
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/garden-recommendations" 
              active={location.pathname === '/garden-recommendations'} 
              onClick={() => setExpanded(false)}
              className={`${isMobile ? 'mobile-nav-link' : ''} py-2`}
            >
              <FontAwesomeIcon icon={faSun} className="me-1" />
              <span>Recommendations</span>
            </Nav.Link>
            
            <div className={`d-flex ${isMobile ? 'flex-column' : 'flex-lg-row'} mt-3 mt-lg-0 ${isMobile ? 'mobile-auth-buttons' : ''}`}>
              <Button 
                variant="outline-light" 
                className={`mb-2 mb-lg-0 me-lg-2 ${isMobile ? 'mobile-btn' : ''}`}
                onClick={() => handleNavigation('/login')}
              >
                <FontAwesomeIcon icon={faSignInAlt} className="me-1" />
                Login
              </Button>
              
              <Button 
                variant="light" 
                className={isMobile ? 'mobile-btn' : ''}
                onClick={() => handleNavigation('/signup')}
              >
                Sign Up
              </Button>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;