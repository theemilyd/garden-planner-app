import React, { useState } from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, faLeaf, faSeedling, 
  faSignInAlt, faSun
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../utils/AuthContext';

function Header() {
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
      className="py-3" 
      expanded={expanded}
      onToggle={setExpanded}
      bg="forest-green"
      variant="dark"
    >
      <Container>
        <Navbar.Brand as={Link} to="/" onClick={() => setExpanded(false)}>
          <FontAwesomeIcon icon={faSeedling} className="me-2" />
          Global Seed Sowing Calendar
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              active={location.pathname === '/'} 
              onClick={() => setExpanded(false)}
            >
              <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
              Seed Calendar
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/planting-calendar" 
              active={location.pathname === '/planting-calendar'} 
              onClick={() => setExpanded(false)}
            >
              <FontAwesomeIcon icon={faLeaf} className="me-1" />
              Planting Calendar
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/garden-recommendations" 
              active={location.pathname === '/garden-recommendations'} 
              onClick={() => setExpanded(false)}
            >
              <FontAwesomeIcon icon={faSun} className="me-1" />
              Recommendations
            </Nav.Link>
                
            <Button 
              variant="outline-light" 
              className="ms-2" 
              onClick={() => handleNavigation('/login')}
            >
              <FontAwesomeIcon icon={faSignInAlt} className="me-1" />
              Login
            </Button>
            
            <Button 
              variant="light" 
              className="ms-2" 
              onClick={() => handleNavigation('/signup')}
            >
              Sign Up
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;