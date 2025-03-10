import React, { useState, useEffect } from 'react';
import { Modal, Button, Carousel, ProgressBar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faLeaf, 
  faSeedling, 
  faSun, 
  faCloudSun,
  faArrowRight,
  faArrowLeft,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

/**
 * Onboarding tour component that guides first-time users through the app's features
 */
const OnboardingTour = ({ onComplete }) => {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  
  // Check if user has seen the tour before
  useEffect(() => {
    const tourSeen = localStorage.getItem('onboardingTourSeen');
    if (!tourSeen) {
      setShow(true);
      setHasSeenTour(false);
    } else {
      setHasSeenTour(true);
    }
  }, []);
  
  // Define the tour steps
  const tourSteps = [
    {
      title: 'Welcome to PlantPerfectly!',
      description: 'Your intelligent gardening companion for optimal planting schedules, microclimate adjustments, and harvest planning.',
      icon: faSeedling,
      image: '/images/onboarding/welcome.jpg'
    },
    {
      title: 'Location-Based Planting Calendar',
      description: 'Get personalized planting dates based on your location, hardiness zone, and local frost dates.',
      icon: faMapMarkerAlt,
      image: '/images/onboarding/location.jpg'
    },
    {
      title: 'Comprehensive Plant Database',
      description: 'Access detailed information about hundreds of plants, including growing requirements, spacing, and days to maturity.',
      icon: faLeaf,
      image: '/images/onboarding/plants.jpg'
    },
    {
      title: 'Succession Planting',
      description: 'Plan multiple plantings throughout the season to maximize your harvest and garden space.',
      icon: faCalendarAlt,
      image: '/images/onboarding/succession.jpg'
    },
    {
      title: 'Weather Integration',
      description: 'Receive alerts about weather conditions that might affect your garden plans.',
      icon: faCloudSun,
      image: '/images/onboarding/weather.jpg'
    },
    {
      title: 'Ready to Get Started?',
      description: 'Let\'s create your perfect garden plan based on your location and preferences.',
      icon: faSun,
      image: '/images/onboarding/ready.jpg'
    }
  ];
  
  // Handle closing the tour
  const handleClose = () => {
    setShow(false);
    localStorage.setItem('onboardingTourSeen', 'true');
    if (onComplete) onComplete();
  };
  
  // Handle navigation between steps
  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Skip the tour
  const handleSkip = () => {
    handleClose();
  };
  
  // If user has already seen the tour, don't render anything
  if (hasSeenTour) return null;
  
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      keyboard={false}
      size="lg"
      className="onboarding-tour-modal"
    >
      <Modal.Header className="border-0 pb-0">
        <Button 
          variant="link" 
          className="ms-auto text-muted" 
          onClick={handleClose}
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </Modal.Header>
      
      <Modal.Body className="text-center px-4 pb-4 pt-0">
        <div className="step-indicator mb-4">
          <ProgressBar 
            now={(currentStep / (tourSteps.length - 1)) * 100} 
            variant="success" 
            className="mb-3"
          />
          <div className="d-flex justify-content-between">
            {tourSteps.map((_, index) => (
              <div 
                key={index}
                className={`step-dot ${index <= currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </div>
        </div>
        
        <div className="step-content">
          <div className="step-icon mb-3">
            <FontAwesomeIcon 
              icon={tourSteps[currentStep].icon} 
              size="3x" 
              className="text-success"
            />
          </div>
          
          <h2 className="step-title mb-3">{tourSteps[currentStep].title}</h2>
          
          <p className="step-description mb-4">
            {tourSteps[currentStep].description}
          </p>
          
          {tourSteps[currentStep].image && (
            <div className="step-image-container mb-4">
              <img 
                src={tourSteps[currentStep].image} 
                alt={tourSteps[currentStep].title}
                className="step-image img-fluid rounded shadow-sm"
              />
            </div>
          )}
        </div>
      </Modal.Body>
      
      <Modal.Footer className="border-0 pt-0">
        <div className="d-flex w-100 justify-content-between">
          {currentStep > 0 ? (
            <Button 
              variant="outline-secondary" 
              onClick={handlePrev}
              className="px-4"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Back
            </Button>
          ) : (
            <Button 
              variant="link" 
              onClick={handleSkip}
              className="text-muted"
            >
              Skip Tour
            </Button>
          )}
          
          <Button 
            variant="success" 
            onClick={handleNext}
            className="px-4"
          >
            {currentStep < tourSteps.length - 1 ? (
              <>
                Next
                <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
              </>
            ) : (
              'Get Started'
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default OnboardingTour; 