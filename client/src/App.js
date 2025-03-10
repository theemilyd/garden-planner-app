import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

// Context Providers
import { AuthProvider } from './utils/AuthContext';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import GlobalSeedCalendar from './components/GlobalSeedCalendar';
import OnboardingTour from './components/onboarding/OnboardingTour';

// Pages
// Commented out unused imports
// import Dashboard from './pages/Dashboard';
// import PlantList from './pages/plant/PlantList';
// import PlantDetail from './pages/plant/PlantDetail';
// import GardenList from './pages/garden/GardenList';
// import GardenDetail from './pages/garden/GardenDetail';
// import GardenForm from './pages/garden/GardenForm';
// import Profile from './pages/Profile';
// import GardeningTips from './pages/GardeningTips';
import NotFound from './pages/NotFound';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import PlantingCalendarPage from './pages/PlantingCalendarPage';
import GardenRecommendationsPage from './pages/GardenRecommendationsPage';

// CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Initialize app, detect user location, and check if mobile
  useEffect(() => {
    // Check if in test mode
    const urlParams = new URLSearchParams(window.location.search);
    const mobileTest = urlParams.get('mobileTest');
    const isInTestMode = mobileTest === 'true';
    setIsTestMode(isInTestMode);
    
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = isInTestMode || mobileRegex.test(userAgent) || window.innerWidth < 768;
      setIsMobile(isMobileDevice);
      
      // Add mobile class to body if on mobile device
      if (isMobileDevice) {
        document.body.classList.add('mobile-device');
      } else {
        document.body.classList.remove('mobile-device');
      }
    };
    
    // Simulate app initialization/loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      checkMobile();
      
      // Run mobile tests automatically if in test mode
      if (isInTestMode && window.runMobileTests) {
        setTimeout(() => {
          console.log('%c Running automated mobile tests...', 'background: #4A7C59; color: white; padding: 4px;');
          window.runMobileTests();
        }, 2000); // Wait 2 seconds for app to fully render
      }
    }, 800);
    
    // Add resize listener to update mobile status on orientation change
    window.addEventListener('resize', checkMobile);
    
    // Initial check
    checkMobile();
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isTestMode]);
  
  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // You could trigger additional actions here, like showing a welcome message
  };
  
  // Loading screen
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <h2>🌱 Preparing Your Garden...</h2>
        {isMobile && <p>Mobile View Detected</p>}
        {isTestMode && <p>Mobile Test Mode Enabled</p>}
      </div>
    );
  }
  
  return (
    <AuthProvider>
      <Router>
        <Helmet>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <meta name="theme-color" content="#4A7C59" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
        </Helmet>
        <div className={`app-container ${isMobile ? 'mobile-view' : ''} ${isTestMode ? 'test-mode' : ''}`}>
          {isTestMode && (
            <div className="test-mode-banner">
              Mobile Test Mode Active
              <button 
                onClick={() => window.runMobileTests && window.runMobileTests()} 
                className="test-run-button"
              >
                Run Tests
              </button>
            </div>
          )}
          <Header isMobile={isMobile} />
          <main className="app-main">
            <Container fluid="md" className={`py-3 ${isMobile ? 'px-2' : ''}`}>
              <Routes>
                <Route path="/" element={<GlobalSeedCalendar isMobile={isMobile} />} />
                <Route path="/seed-calendar" element={<GlobalSeedCalendar isMobile={isMobile} />} />
                <Route path="/planting-calendar" element={<PlantingCalendarPage isMobile={isMobile} />} />
                <Route path="/garden-recommendations" element={<GardenRecommendationsPage isMobile={isMobile} />} />
                <Route path="/login" element={<Login isMobile={isMobile} />} />
                <Route path="/signup" element={<Signup isMobile={isMobile} />} />
                <Route path="*" element={<NotFound isMobile={isMobile} />} />
              </Routes>
            </Container>
          </main>
          <Footer isMobile={isMobile} />
          
          {/* Onboarding Tour */}
          <OnboardingTour onComplete={handleOnboardingComplete} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;