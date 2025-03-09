import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Context Providers
import { AuthProvider } from './utils/AuthContext';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import GlobalSeedCalendar from './components/GlobalSeedCalendar';

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
  // const [userLocation, setUserLocation] = useState(null); // Removed unused state
  
  // Initialize app and detect user location
  useEffect(() => {
    // Simulate app initialization/loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Code for getting location removed as it's not used
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Loading screen
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <h2>🌱 Preparing Your Garden...</h2>
      </div>
    );
  }
  
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="app-main">
            <Container fluid="md" className="py-4">
              <Routes>
                <Route path="/" element={<GlobalSeedCalendar />} />
                <Route path="/seed-calendar" element={<GlobalSeedCalendar />} />
                <Route path="/planting-calendar" element={<PlantingCalendarPage />} />
                <Route path="/garden-recommendations" element={<GardenRecommendationsPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Container>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;