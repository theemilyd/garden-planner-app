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

const GlobalSeedCalendar = () => {
  // State for user location
  const [zoneInfo, setZoneInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State for plant selection
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [typeFilter, setTypeFilter] = useState('All');
  
  // State for weather data
  const [weatherData, setWeatherData] = useState(null);
  
  // Use light theme only
  const theme = lightTheme;
  
  // State for mobile view
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if user is on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Handle location submission and zone retrieval
  const handleLocationSubmit = async (country, postalCode) => {
    setLoading(true);
    try {
      // Try to get zone data from the API
      try {
        const response = await axios.get(`/api/zones/lookup?zipCode=${postalCode}`);
        setZoneInfo(response.data.data);
      } catch (apiError) {
        console.error('API error, using mock data:', apiError);
        // If API fails, use mock data (for development/demo purposes)
        const mockData = getMockZoneData(country, postalCode);
        setZoneInfo(mockData.data);
      }
      
      // Fetch weather data for the location
      await fetchWeatherData(country, postalCode);
    } catch (error) {
      console.error('Error retrieving zone information:', error);
      // Handle error state
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch weather data for the specified location
  const fetchWeatherData = async (country, postalCode) => {
    try {
      // For development/demo purposes, we'll use mock data directly
      console.log('Using mock weather data');
      
      // Create accurate mock weather data with more realistic temperatures
      // Values in Fahrenheit for consistent use
      let baseTemp;
      let condition;
      
      // Adjust temperatures based on country for more realistic data
      if (country === 'GB' || country === 'UK') {
        // UK is typically cooler
        baseTemp = 55; // ~13°C - spring in UK
        condition = 'Partly Cloudy';
      } else if (country === 'CA') {
        // Canada is typically even cooler
        baseTemp = 50; // ~10°C - spring in Canada
        condition = 'Cloudy';
      } else if (country === 'AU') {
        // Australia - hot if southern hemisphere
        baseTemp = 75; // ~24°C - warmer
        condition = 'Sunny';
      } else {
        // US default
        baseTemp = 65; // ~18°C - moderate
        condition = 'Mostly Sunny';
      }
      
      // Add a small random variance
      const variance = 5;
      const currentTemp = Math.round(baseTemp + (Math.random() * variance * 2 - variance));
      
      setWeatherData({
        status: 'success',
        data: {
          location: `${country}, ${postalCode}`,
          country: country,
          currentTemp: currentTemp,
          historicalAverage: baseTemp,
          averageTemp: baseTemp,
          forecast: [
            { date: '2024-04-03', high: currentTemp + 5, low: currentTemp - 8, condition: condition },
            { date: '2024-04-04', high: currentTemp + 7, low: currentTemp - 7, condition: 'Sunny' },
            { date: '2024-04-05', high: currentTemp + 3, low: currentTemp - 9, condition: 'Cloudy' },
          ],
          frostRisk: currentTemp < 40 ? 'High' : currentTemp < 50 ? 'Medium' : 'Low',
        }
      });
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Weather data is optional, so we can continue without it
    }
  };
  
  // Add a plant to the selected plants list
  const handleAddPlant = (plant) => {
    if (!selectedPlants.some(p => p.id === plant.id)) {
      console.log('Adding plant to calendar:', plant);
      
      // Make sure the plant has all the required properties
      const enhancedPlant = {
        ...plant,
        // Ensure these properties exist
        growing_calendar: plant.growing_calendar || {},
        growing_requirements: plant.growing_requirements || {
          sunlight: 'full sun',
          water_needs: 'moderate'
        },
        days_to_maturity: plant.days_to_maturity || { min: 60, max: 90 },
        // Ensure tags property exists
        tags: plant.tags || []
      };
      
      setSelectedPlants([...selectedPlants, enhancedPlant]);
    }
  };
  
  // Remove a plant from the selected plants list
  const handleRemovePlant = (plantId) => {
    setSelectedPlants(selectedPlants.filter(plant => plant.id !== plantId));
  };
  
  // Filter plants by type
  const handleTypeFilterChange = (type) => {
    setTypeFilter(type);
  };
  
  // State for email capture modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  // Export the calendar as PDF
  const handleExportCalendar = (calendarData) => {
    // If calendarData is not provided, create it with basic info
    let exportData = calendarData || {
      zone: zoneInfo?.zone || '7b',
      plants: selectedPlants.map(plant => ({
        id: plant.id,
        name: plant.name,
        type: plant.type,
        growingCalendar: plant.growingCalendar || plant.growing_calendar,
        growingRequirements: plant.growingRequirements || plant.growing_requirements,
        daysToMaturity: plant.daysToMaturity || plant.days_to_maturity
      })),
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1, // 1-indexed month
      zoneId: zoneInfo?.id || null,
      // Include frost dates if available
      frostDates: {
        lastFrost: zoneInfo?.lastFrostDate,
        firstFrost: zoneInfo?.firstFrostDate
      }
    };
    
    // Log for debugging
    console.log('Exporting calendar data:', exportData);
    
    // Show email capture modal with calendar data
    setShowEmailModal(true);
    
    // Store calendar data in a window variable that can be accessed by the modal
    window.currentCalendarData = exportData;
  };
  
  // Handle successful email submission
  const handleEmailSuccess = (data) => {
    // Log the response for debugging
    console.log('Email success response:', data);
    
    // Display a success notification to the user
    alert('Your calendar has been emailed successfully! Please check your inbox.');
    
    // Close the modal
    setShowEmailModal(false);
    
    // Clear the window.currentCalendarData to avoid stale data
    window.currentCalendarData = null;
  };
  

  return (
    <ThemeProvider theme={theme}>
      <CalendarContainer>
        <Header>
          <LogoSection>
            <Logo>🌱</Logo>
            <Title>Global Seed Sowing Calendar</Title>
          </LogoSection>
        </Header>
        
        <Tagline>Know exactly when to plant your seeds, anywhere in the world</Tagline>
        
        <ContentSection isMobile={isMobile}>
          <MainContent>
            <LocationFinder 
              onSubmit={handleLocationSubmit} 
              loading={loading}
              zoneInfo={zoneInfo}
            />
            
            {zoneInfo && (
              <>
                <PlantSelector
                  onAddPlant={handleAddPlant}
                  onRemovePlant={handleRemovePlant}
                  selectedPlants={selectedPlants}
                  typeFilter={typeFilter}
                  onTypeFilterChange={handleTypeFilterChange}
                />
                
                {selectedPlants.length > 0 && (
                  <PlantingCalendar
                    zoneInfo={zoneInfo}
                    selectedPlants={selectedPlants}
                    weatherData={weatherData}
                    onExportCalendar={handleExportCalendar}
                    isMobile={isMobile}
                  />
                )}
              </>
            )}
          </MainContent>
          
          {weatherData && zoneInfo && !isMobile && (
            <Sidebar>
              <WeatherWidget weatherData={weatherData} zoneInfo={zoneInfo} />
            </Sidebar>
          )}
          
          {weatherData && zoneInfo && isMobile && (
            <MobileWeatherSection>
              <WeatherWidget weatherData={weatherData} zoneInfo={zoneInfo} compact={true} />
            </MobileWeatherSection>
          )}
        </ContentSection>
        
        <SkipNavLink href="#main-content">Skip to main content</SkipNavLink>
        
        {/* Email Capture Modal */}
        <EmailCaptureModal
          show={showEmailModal}
          onHide={() => setShowEmailModal(false)}
          onSuccess={handleEmailSuccess}
          resourceType="calendar"
          zoneName={zoneInfo?.zone || '7b'}
        />
      </CalendarContainer>
    </ThemeProvider>
  );
};

// Styled Components
const CalendarContainer = styled.div`
  font-family: 'Inter', 'Roboto', -apple-system, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background-color: ${props => props.theme.background};
  min-height: 100vh;
  color: ${props => props.theme.text};
  transition: all 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
`;

// eslint-disable-next-line no-unused-vars
const ControlsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

// eslint-disable-next-line no-unused-vars
const ThemeToggle = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme.hoverBackground};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.accent};
    outline-offset: 2px;
  }
`;

const Logo = styled.div`
  font-size: 2.5rem;
  margin-right: 16px;
  background: linear-gradient(135deg, #3A7B5E, #56A978);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  color: ${props => props.theme.accent};
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

const Tagline = styled.p`
  color: ${props => props.theme.secondaryText};
  font-size: 1.1rem;
  margin-bottom: 32px;
  font-weight: 300;
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: ${props => props.isMobile ? 'column' : 'row'};
  gap: 32px;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
  min-width: 0;
  id="main-content"
`;

const Sidebar = styled.aside`
  width: 300px;
  align-self: flex-start;
  position: sticky;
  top: 24px;
  
  @media (max-width: 1100px) {
    width: 250px;
  }
`;

const MobileWeatherSection = styled.div`
  margin-top: 16px;
  margin-bottom: 32px;
`;

const SkipNavLink = styled.a`
  position: absolute;
  top: -40px;
  left: 0;
  background: ${props => props.theme.accent};
  color: white;
  padding: 8px;
  z-index: 100;
  
  &:focus {
    top: 0;
  }
`;

export default GlobalSeedCalendar;