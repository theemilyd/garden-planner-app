import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import axios from 'axios';

// Components
import LocationFinder from './calendar/LocationFinder';
import PlantSelector from './calendar/PlantSelector';
import PlantingCalendar from './calendar/PlantingCalendar';
import WeatherWidget from './widgets/WeatherWidget';
import EmailCaptureModal from './EmailCaptureModal';

// Theme support
import { lightTheme } from '../themes/themes';

// Import zoneAPI directly instead of using dynamic import
import { getMockZoneData } from '../services/zoneAPI';

const GlobalSeedCalendar = ({ isMobile: propIsMobile }) => {
  // State for user location
  const [zoneInfo, setZoneInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State for plant selection
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [typeFilter, setTypeFilter] = useState('All');
  
  // State for weather data
  const [weatherData, setWeatherData] = useState(null);
  
  // State for email modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  // Use light theme only
  const theme = lightTheme;
  
  // State for mobile view
  const [isMobile, setIsMobile] = useState(propIsMobile || false);
  
  // Check if user is on mobile
  useEffect(() => {
    // Update from props if available
    if (propIsMobile !== undefined) {
      setIsMobile(propIsMobile);
    } else {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, [propIsMobile]);
  
  // Handle location submission and zone retrieval
  const handleLocationSubmit = async (country, postalCode) => {
    setLoading(true);
    
    try {
      // For demo purposes, use mock data
      const zoneData = await getMockZoneData(country, postalCode);
      setZoneInfo(zoneData);
      
      // Fetch weather data for the location
      fetchWeatherData(country, postalCode);
    } catch (error) {
      console.error('Error fetching zone data:', error);
      // Handle error state
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch weather data for the location
  const fetchWeatherData = async (country, postalCode) => {
    try {
      // For demo purposes, use mock weather data
      const mockWeatherData = {
        current: {
          temp: 72,
          condition: 'Sunny',
          humidity: 45,
          wind: 8,
          feelsLike: 74,
          icon: '01d'
        },
        forecast: [
          { day: 'Mon', temp: 74, icon: '01d' },
          { day: 'Tue', temp: 76, icon: '02d' },
          { day: 'Wed', temp: 71, icon: '03d' },
          { day: 'Thu', temp: 68, icon: '10d' },
          { day: 'Fri', temp: 70, icon: '01d' }
        ],
        soil: {
          temp: 65,
          moisture: 'Medium',
          readiness: 'Good for planting'
        },
        frost: {
          risk: 'Low',
          nextDate: 'Nov 15',
          lastDate: 'Mar 20'
        }
      };
      
      setWeatherData(mockWeatherData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Handle error state
    }
  };
  
  // Handle adding a plant to the selection
  const handleAddPlant = (plant) => {
    // Check if plant is already selected
    if (!selectedPlants.some(p => p.id === plant.id)) {
      setSelectedPlants([...selectedPlants, plant]);
    }
  };
  
  // Handle removing a plant from the selection
  const handleRemovePlant = (plantId) => {
    setSelectedPlants(selectedPlants.filter(plant => plant.id !== plantId));
  };
  
  // Handle changing the plant type filter
  const handleTypeFilterChange = (type) => {
    setTypeFilter(type);
  };
  
  // Handle exporting the calendar
  const handleExportCalendar = (calendarData) => {
    // Implementation for exporting calendar
    console.log('Exporting calendar:', calendarData);
    
    // Store the calendar data in the window object for the EmailCaptureModal to access
    window.currentCalendarData = calendarData;
    
    // Show email modal when exporting
    setShowEmailModal(true);
  };
  
  // Handle successful email submission
  const handleEmailSuccess = (data) => {
    console.log('Email success response:', data);
    // Display a success notification to the user
    alert('Your calendar has been emailed successfully! Please check your inbox.');
    // Hide the modal
    setShowEmailModal(false);
  };
  
  // Render the component
  return (
    <ThemeProvider theme={theme}>
      <CalendarContainer className={isMobile ? 'mobile-calendar-container' : ''}>
        <h1 className={`text-center mb-4 ${isMobile ? 'mobile-heading' : ''}`}>
          Global Seed Sowing Calendar
        </h1>
        
        <p className={`text-center mb-4 lead ${isMobile ? 'mobile-lead' : ''}`}>
          Find the perfect time to sow your seeds based on your location and climate zone.
        </p>
        
        <div className={`row ${isMobile ? 'mobile-row' : ''}`}>
          <div className={`${isMobile ? 'col-12' : 'col-md-4'} mb-4`}>
            <LocationFinder 
              onSubmit={handleLocationSubmit} 
              loading={loading}
              isMobile={isMobile}
            />
            
            {weatherData && (
              <WeatherWidget 
                data={weatherData} 
                className="mt-4"
                isMobile={isMobile}
              />
            )}
          </div>
          
          <div className={`${isMobile ? 'col-12' : 'col-md-8'}`}>
            {zoneInfo ? (
              <>
                <div className={`mb-4 ${isMobile ? 'mobile-plant-selector' : ''}`}>
                  <PlantSelector 
                    onAddPlant={handleAddPlant} 
                    selectedPlants={selectedPlants}
                    onRemovePlant={handleRemovePlant}
                    typeFilter={typeFilter}
                    onTypeFilterChange={handleTypeFilterChange}
                    isMobile={isMobile}
                  />
                </div>
                
                <PlantingCalendar 
                  zoneInfo={zoneInfo} 
                  selectedPlants={selectedPlants}
                  onExport={handleExportCalendar}
                  isMobile={isMobile}
                />
              </>
            ) : (
              <div className={`text-center p-5 bg-light rounded ${isMobile ? 'mobile-placeholder' : ''}`}>
                <h3>Enter your location to get started</h3>
                <p>We'll show you the best times to sow seeds in your area.</p>
              </div>
            )}
          </div>
        </div>
        
        <EmailCaptureModal 
          show={showEmailModal}
          onHide={() => setShowEmailModal(false)}
          onSuccess={handleEmailSuccess}
          resourceType="calendar"
          zoneName={zoneInfo?.zone || 'Unknown'}
          isMobile={isMobile}
        />
      </CalendarContainer>
    </ThemeProvider>
  );
};

// Styled components
const CalendarContainer = styled.div`
  padding: 1rem;
  
  &.mobile-calendar-container {
    padding: 0.5rem;
  }
  
  .mobile-heading {
    font-size: 1.75rem;
    margin-bottom: 0.75rem;
  }
  
  .mobile-lead {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  
  .mobile-row {
    margin-left: -0.5rem;
    margin-right: -0.5rem;
  }
  
  .mobile-plant-selector {
    margin-bottom: 1rem;
  }
  
  .mobile-placeholder {
    padding: 1.5rem !important;
    
    h3 {
      font-size: 1.25rem;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
`;

export default GlobalSeedCalendar;