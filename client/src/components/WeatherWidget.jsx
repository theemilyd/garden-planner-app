import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Badge, Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloudSun,
  faCloudRain,
  faSun,
  faSnowflake,
  faCloud,
  faBolt,
  faWind,
  faThermometerHalf,
  faWater,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

const WeatherWidget = ({ location, zone, userSubscription }) => {
  // State
  const [weatherData, setWeatherData] = useState(null);
  const [soilTempData, setSoilTempData] = useState(null);
  const [frostRisk, setFrostRisk] = useState(null);
  const [plantingRecommendations, setPlantingRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Colors for styling
  const colors = {
    forestGreen: '#4A7C59',
    sage: '#8FC0A9',
    lightMint: '#C8D5B9',
    cream: '#FAF3DD',
    marigold: '#F4B942',
  };
  
  // Helper function to get soil temperature color
  const getSoilTempColor = (temp) => {
    if (temp < 40) return '#0d47a1'; // Very cold - dark blue
    if (temp < 50) return '#2196f3'; // Cold - blue
    if (temp < 60) return '#4caf50'; // Cool - green
    if (temp < 70) return '#ff9800'; // Warm - orange
    return '#f44336'; // Hot - red
  };

  // Helper function to get planting guidance based on soil temperature
  const getSoilTempPlantingGuidance = (temperature) => {
    if (temperature < 40) {
      return 'Too cold for most planting. Focus on indoor seed starting.';
    } else if (temperature < 50) {
      return 'Good for cool-season crops: peas, spinach, lettuce, kale.';
    } else if (temperature < 60) {
      return 'Good for beets, carrots, radishes, potatoes, Swiss chard.';
    } else if (temperature < 70) {
      return 'Good for warm-season crops: tomatoes, peppers, beans, cucumbers.';
    } else {
      return 'Ideal for heat-loving crops: melons, okra, eggplant, sweet potatoes.';
    }
  };
  
  // Get weather icon based on condition
  const getWeatherIcon = useCallback((condition) => {
    switch (condition) {
      case 'sunny':
        return <FontAwesomeIcon icon={faSun} className="text-warning" />;
      case 'partly cloudy':
        return <FontAwesomeIcon icon={faCloudSun} className="text-info" />;
      case 'cloudy':
        return <FontAwesomeIcon icon={faCloud} className="text-secondary" />;
      case 'rainy':
        return <FontAwesomeIcon icon={faCloudRain} className="text-primary" />;
      case 'thunderstorm':
        return <FontAwesomeIcon icon={faBolt} className="text-dark" />;
      case 'snow':
        return <FontAwesomeIcon icon={faSnowflake} className="text-info" />;
      default:
        return <FontAwesomeIcon icon={faCloudSun} className="text-info" />;
    }
  }, []);
  
  // Generate mock weather data based on location
  const generateMockWeatherData = useCallback((lat, lng) => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const isNorthern = parseFloat(lat) > 0;
    
    // Base temperature varies by hemisphere and month
    let baseTemp;
    if (isNorthern) {
      // Northern hemisphere - warmer in summer months (5-8), cooler in winter (0-2, 9-11)
      if (month >= 5 && month <= 8) {
        baseTemp = 75 - Math.abs(lat) * 0.4; // Higher latitude = cooler
      } else {
        baseTemp = 45 - Math.abs(lat) * 0.6;
      }
    } else {
      // Southern hemisphere - opposite seasons
      if (month >= 5 && month <= 8) {
        baseTemp = 45 - Math.abs(lat) * 0.6; // Winter in southern hemisphere during northern summer
      } else {
        baseTemp = 75 - Math.abs(lat) * 0.4;
      }
    }
    
    // Add some randomness to temperatures
    const currentTemp = Math.round(baseTemp + (Math.random() * 10) - 5);
    
    // Generate weather conditions based on month and randomness
    const conditions = ['sunny', 'partly cloudy', 'cloudy', 'rainy', 'thunderstorm'];
    const conditionWeights = [0.3, 0.3, 0.2, 0.15, 0.05];
    
    // Adjust weights based on month (more rain in spring, more sun in summer, etc.)
    if (isNorthern) {
      if (month >= 3 && month <= 5) { // Spring: more rain
        conditionWeights[3] += 0.1; // More rain
        conditionWeights[0] -= 0.1; // Less sun
      } else if (month >= 6 && month <= 8) { // Summer: more sun, more thunderstorms
        conditionWeights[0] += 0.1; // More sun
        conditionWeights[4] += 0.05; // More thunderstorms
        conditionWeights[2] -= 0.15; // Less cloudy
      }
    } else {
      // Reverse seasons for southern hemisphere
      if (month >= 9 && month <= 11) { // Spring in southern hemisphere
        conditionWeights[3] += 0.1; // More rain
        conditionWeights[0] -= 0.1; // Less sun
      } else if (month >= 0 && month <= 2) { // Summer in southern hemisphere
        conditionWeights[0] += 0.1; // More sun
        conditionWeights[4] += 0.05; // More thunderstorms
        conditionWeights[2] -= 0.15; // Less cloudy
      }
    }
    
    // Select condition based on weights
    let random = Math.random();
    let cumulativeWeight = 0;
    let conditionIndex = 0;
    
    for (let i = 0; i < conditionWeights.length; i++) {
      cumulativeWeight += conditionWeights[i];
      if (random <= cumulativeWeight) {
        conditionIndex = i;
        break;
      }
    }
    
    const currentCondition = conditions[conditionIndex];
    
    // Humidity based on conditions
    let humidity;
    if (currentCondition === 'rainy' || currentCondition === 'thunderstorm') {
      humidity = Math.round(70 + Math.random() * 20); // 70-90%
    } else if (currentCondition === 'cloudy') {
      humidity = Math.round(60 + Math.random() * 20); // 60-80%
    } else if (currentCondition === 'partly cloudy') {
      humidity = Math.round(50 + Math.random() * 20); // 50-70%
    } else {
      humidity = Math.round(40 + Math.random() * 20); // 40-60%
    }
    
    // Wind speed based on conditions and randomness
    let windSpeed;
    if (currentCondition === 'thunderstorm') {
      windSpeed = Math.round(10 + Math.random() * 15); // 10-25 mph
    } else if (currentCondition === 'rainy') {
      windSpeed = Math.round(5 + Math.random() * 10); // 5-15 mph
    } else {
      windSpeed = Math.round(2 + Math.random() * 8); // 2-10 mph
    }
    
    // Generate 7-day forecast
    const forecast = [];
    for (let i = 0; i < 7; i++) {
      const forecastDate = new Date(now);
      forecastDate.setDate(forecastDate.getDate() + i);
      
      // Add some variation to temperature
      const dailyVariation = Math.round((Math.random() * 16) - 8); // -8 to +8
      const highTemp = Math.round(baseTemp + dailyVariation + 10);
      const lowTemp = Math.round(baseTemp + dailyVariation - 10);
      
      // Variation in condition
      const forecastConditionIndex = Math.floor(Math.random() * conditions.length);
      const forecastCondition = conditions[forecastConditionIndex];
      
      // Precipitation chance based on condition
      let precipChance;
      if (forecastCondition === 'rainy') {
        precipChance = Math.round(70 + Math.random() * 30); // 70-100%
      } else if (forecastCondition === 'thunderstorm') {
        precipChance = Math.round(60 + Math.random() * 40); // 60-100%
      } else if (forecastCondition === 'cloudy') {
        precipChance = Math.round(30 + Math.random() * 30); // 30-60%
      } else if (forecastCondition === 'partly cloudy') {
        precipChance = Math.round(10 + Math.random() * 20); // 10-30%
      } else {
        precipChance = Math.round(Math.random() * 10); // 0-10%
      }
      
      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        day: forecastDate.toLocaleDateString('en-US', { weekday: 'short' }),
        high: highTemp,
        low: lowTemp,
        condition: forecastCondition,
        precipitation: precipChance,
      });
    }
    
    return {
      current: {
        temperature: currentTemp,
        feels_like: Math.round(currentTemp - 2 + Math.random() * 4), // ±2 degrees from actual
        condition: currentCondition,
        humidity,
        wind_speed: windSpeed,
        precipitation: currentCondition === 'rainy' ? Math.round(50 + Math.random() * 50) : Math.round(Math.random() * 20),
      },
      location: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      },
      forecast,
      last_updated: new Date().toISOString(),
    };
  }, []);
  
  // Generate mock soil temperature data based on location
  const generateMockSoilTemperatureData = useCallback((lat, lng) => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const isNorthern = parseFloat(lat) > 0;
    
    // Soil temperature tends to lag behind air temperature
    let baseSoilTemp;
    if (isNorthern) {
      // Northern hemisphere
      if (month >= 6 && month <= 8) {
        baseSoilTemp = 70 - (Math.abs(lat) * 0.3); // Summer
      } else if (month >= 3 && month <= 5) {
        baseSoilTemp = 55 - (Math.abs(lat) * 0.4); // Spring
      } else if (month >= 9 && month <= 11) {
        baseSoilTemp = 60 - (Math.abs(lat) * 0.4); // Fall
      } else {
        baseSoilTemp = 40 - (Math.abs(lat) * 0.5); // Winter
      }
    } else {
      // Southern hemisphere - opposite seasons
      if (month >= 6 && month <= 8) {
        baseSoilTemp = 40 - (Math.abs(lat) * 0.5); // Winter
      } else if (month >= 3 && month <= 5) {
        baseSoilTemp = 60 - (Math.abs(lat) * 0.4); // Fall
      } else if (month >= 9 && month <= 11) {
        baseSoilTemp = 55 - (Math.abs(lat) * 0.4); // Spring
      } else {
        baseSoilTemp = 70 - (Math.abs(lat) * 0.3); // Summer
      }
    }
    
    // Add some random variation
    const randomVariation = (Math.random() * 6) - 3; // -3 to +3
    const soilTemp = Math.round(baseSoilTemp + randomVariation);
    
    return {
      temperature: {
        surface: soilTemp,
        inch_2: Math.round(soilTemp - 1 + Math.random() * 2), // Slight variation
        inch_4: Math.round(soilTemp - 2 + Math.random() * 2), // More stable
        inch_8: Math.round(soilTemp - 3 + Math.random() * 2), // Even more stable
      },
      moisture: Math.round(Math.random() * 50 + 20), // 20-70%
      planting_guidance: getSoilTempPlantingGuidance(soilTemp),
      last_updated: new Date().toISOString(),
    };
  }, []);
  
  // Generate mock frost risk data based on location
  const generateMockFrostRiskData = useCallback((lat, lng) => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const isNorthern = parseFloat(lat) > 0;
    
    // Determine base frost risk based on season and latitude
    let baseFrostRisk;
    if (isNorthern) {
      // Northern hemisphere
      if (month >= 5 && month <= 8) {
        baseFrostRisk = 0; // Summer, minimal frost risk
      } else if (month >= 3 && month <= 4) {
        baseFrostRisk = 20 + (Math.abs(lat) * 0.5); // Spring, some frost risk
      } else if (month >= 9 && month <= 10) {
        baseFrostRisk = 30 + (Math.abs(lat) * 0.6); // Fall, higher frost risk
      } else {
        baseFrostRisk = 60 + (Math.abs(lat) * 0.7); // Winter, high frost risk
      }
    } else {
      // Southern hemisphere - opposite seasons
      if (month >= 5 && month <= 8) {
        baseFrostRisk = 60 + (Math.abs(lat) * 0.7); // Winter
      } else if (month >= 3 && month <= 4) {
        baseFrostRisk = 30 + (Math.abs(lat) * 0.6); // Fall
      } else if (month >= 9 && month <= 10) {
        baseFrostRisk = 20 + (Math.abs(lat) * 0.5); // Spring
      } else {
        baseFrostRisk = 0; // Summer
      }
    }
    
    // Cap the risk at 100%
    baseFrostRisk = Math.min(baseFrostRisk, 100);
    
    // Generate daily frost risk forecast for next 10 days
    const frostForecast = [];
    for (let i = 0; i < 10; i++) {
      const forecastDate = new Date(now);
      forecastDate.setDate(forecastDate.getDate() + i);
      
      // Add some variation for each day
      let dailyVariation = (Math.random() * 30) - 15; // -15 to +15 percent
      
      // First few days are more accurate than later days
      if (i > 5) {
        dailyVariation = (Math.random() * 40) - 20; // -20 to +20 percent for later days
      }
      
      let dailyFrostRisk = Math.round(baseFrostRisk + dailyVariation);
      dailyFrostRisk = Math.max(0, Math.min(100, dailyFrostRisk)); // Keep between 0-100%
      
      // Calculate expected low temperature based on frost risk
      let expectedLow;
      if (dailyFrostRisk > 70) {
        expectedLow = Math.round(25 + (Math.random() * 7)); // 25-32°F
      } else if (dailyFrostRisk > 30) {
        expectedLow = Math.round(33 + (Math.random() * 5)); // 33-38°F
      } else {
        expectedLow = Math.round(39 + (Math.random() * 10)); // 39-49°F
      }
      
      frostForecast.push({
        date: forecastDate.toISOString().split('T')[0],
        day: forecastDate.toLocaleDateString('en-US', { weekday: 'short' }),
        risk_percent: dailyFrostRisk,
        expected_low: expectedLow,
        warning: dailyFrostRisk > 30,
      });
    }
    
    // Determine overall risk level
    let maxRisk = 0;
    frostForecast.forEach(day => {
      maxRisk = Math.max(maxRisk, day.risk_percent);
    });
    
    let riskLevel;
    if (maxRisk > 70) {
      riskLevel = 'high';
    } else if (maxRisk > 30) {
      riskLevel = 'moderate';
    } else {
      riskLevel = 'low';
    }
    
    return {
      risk_level: riskLevel,
      max_risk: maxRisk,
      forecast: frostForecast,
      protective_action_recommended: maxRisk > 30,
      last_updated: new Date().toISOString(),
    };
  }, []);
  
  // Generate mock planting recommendations based on location and weather
  const generateMockPlantingRecommendations = useCallback((lat, lng) => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const isNorthern = parseFloat(lat) > 0;
    
    // Determine season based on hemisphere and month
    let season;
    if (isNorthern) {
      if (month >= 2 && month <= 4) {
        season = 'spring';
      } else if (month >= 5 && month <= 7) {
        season = 'summer';
      } else if (month >= 8 && month <= 10) {
        season = 'fall';
      } else {
        season = 'winter';
      }
    } else {
      if (month >= 2 && month <= 4) {
        season = 'fall';
      } else if (month >= 5 && month <= 7) {
        season = 'winter';
      } else if (month >= 8 && month <= 10) {
        season = 'spring';
      } else {
        season = 'summer';
      }
    }
    
    // Generate recommendations based on season
    const recommendations = [];
    
    switch (season) {
      case 'spring':
        recommendations.push('Start seeds indoors for summer crops');
        recommendations.push('Plant cold-hardy vegetables like peas, spinach, and lettuce');
        recommendations.push('Prepare garden beds as soon as soil can be worked');
        recommendations.push('Begin hardening off indoor seedlings');
        break;
      case 'summer':
        recommendations.push('Plant heat-loving crops like tomatoes, peppers, and cucumbers');
        recommendations.push('Maintain consistent watering during hot periods');
        recommendations.push('Apply mulch to conserve moisture');
        recommendations.push('Start seeds for fall crops');
        break;
      case 'fall':
        recommendations.push('Plant cool-season crops for fall harvest');
        recommendations.push('Consider cold frames or row covers for extending the season');
        recommendations.push('Plant cover crops in empty beds');
        recommendations.push('Begin cleaning up spent summer crops');
        break;
      case 'winter':
        recommendations.push('Plan next year\'s garden layout');
        recommendations.push('Order seeds for the upcoming season');
        recommendations.push('Maintain winter protection for perennials');
        recommendations.push('Start seeds indoors for early spring planting');
        break;
      default:
        recommendations.push('Consider seasonal planting options for your location');
    }
    
    // Generate weather-specific recommendations
    const weatherSpecificRecommendations = [];
    
    // Get mock soil temperature and frost risk
    const soilTempData = generateMockSoilTemperatureData(lat, lng);
    const frostRiskData = generateMockFrostRiskData(lat, lng);
    
    // Add soil temperature-based recommendations
    if (soilTempData.temperature.surface < 40) {
      weatherSpecificRecommendations.push('Soil is too cold for most planting. Focus on indoor seed starting.');
    } else if (soilTempData.temperature.surface < 50) {
      weatherSpecificRecommendations.push('Soil is suitable for cool-season crops only.');
    } else if (soilTempData.temperature.surface >= 60) {
      weatherSpecificRecommendations.push('Soil temperature is ideal for warm-season crops.');
    }
    
    // Add frost risk-based recommendations
    if (frostRiskData.risk_level === 'high') {
      weatherSpecificRecommendations.push('High frost risk. Protect tender plants and delay planting frost-sensitive crops.');
    } else if (frostRiskData.risk_level === 'moderate') {
      weatherSpecificRecommendations.push('Moderate frost risk. Have protection ready for tender plants.');
    }
    
    return {
      season,
      general_recommendations: recommendations,
      weather_specific_recommendations: weatherSpecificRecommendations,
      soil_temperature: soilTempData.temperature.surface,
      frost_risk: frostRiskData.risk_level,
      last_updated: new Date().toISOString(),
    };
  }, [generateMockSoilTemperatureData, generateMockFrostRiskData]);
  
  // Fetch weather data from API
  const fetchWeatherData = useCallback(async () => {
    if (!location || !location.lat || !location.lng) {
      setError('Location is required to fetch weather data');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be actual API calls
      // const weatherResponse = await fetch(`/api/weather?lat=${location.lat}&lng=${location.lng}`);
      // setWeatherData(await weatherResponse.json());
      
      // Mock weather data for demonstration
      const mockWeatherData = generateMockWeatherData(location.lat, location.lng);
      setWeatherData(mockWeatherData);
      
      // For premium users, fetch soil temperature and frost risk
      if (userSubscription && userSubscription !== 'free') {
        // In a real implementation, these would be actual API calls
        // const soilTempResponse = await fetch(`/api/weather/soil-temperature?lat=${location.lat}&lng=${location.lng}`);
        // setSoilTempData(await soilTempResponse.json());
        
        // const frostRiskResponse = await fetch(`/api/weather/frost-risk?lat=${location.lat}&lng=${location.lng}`);
        // setFrostRisk(await frostRiskResponse.json());
        
        // const recommendationsResponse = await fetch(`/api/weather/planting-recommendations?lat=${location.lat}&lng=${location.lng}`);
        // setPlantingRecommendations(await recommendationsResponse.json());
        
        // Mock data for demonstration
        setSoilTempData(generateMockSoilTemperatureData(location.lat, location.lng));
        setFrostRisk(generateMockFrostRiskData(location.lat, location.lng));
        setPlantingRecommendations(generateMockPlantingRecommendations(location.lat, location.lng));
      }
      
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch weather data: ' + error.message);
      setLoading(false);
    }
  }, [
    location, 
    userSubscription, 
    generateMockWeatherData, 
    generateMockSoilTemperatureData, 
    generateMockFrostRiskData,
    generateMockPlantingRecommendations
  ]);

  // Fetch weather data when location or subscription changes
  useEffect(() => {
    if (location && location.lat && location.lng) {
      fetchWeatherData();
    }
  }, [location, fetchWeatherData]);
  
  // If loading
  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" variant="success" />
        <p className="mt-2">Loading weather data...</p>
      </div>
    );
  }
  
  // If error
  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }
  
  // If no weather data yet
  if (!weatherData) {
    return (
      <div className="text-center p-3">
        <FontAwesomeIcon icon={faCloudSun} size="2x" className="mb-3 text-muted" />
        <p>Weather data will appear here</p>
      </div>
    );
  }
  
  return (
    <div className="weather-widget">
      {/* Current Weather */}
      <Card className="mb-3" style={{ border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Card.Body className="text-center">
          <div className="d-flex align-items-center justify-content-center mb-2">
            <div style={{ fontSize: '2rem', marginRight: '15px' }}>
              {getWeatherIcon(weatherData.current.condition)}
            </div>
            <div>
              <h3 className="mb-0" style={{ color: colors.forestGreen }}>
                {weatherData.current.temperature}°F
              </h3>
              <div className="text-muted">
                {weatherData.current.condition.charAt(0).toUpperCase() + weatherData.current.condition.slice(1)}
              </div>
            </div>
          </div>
          
          <Row className="mt-3 text-center">
            <Col xs={4}>
              <div>
                <FontAwesomeIcon icon={faThermometerHalf} className="text-danger" />
                <div className="small">Feels like</div>
                <div>{weatherData.current.feels_like}°F</div>
              </div>
            </Col>
            <Col xs={4}>
              <div>
                <FontAwesomeIcon icon={faWater} className="text-primary" />
                <div className="small">Humidity</div>
                <div>{weatherData.current.humidity}%</div>
              </div>
            </Col>
            <Col xs={4}>
              <div>
                <FontAwesomeIcon icon={faWind} className="text-info" />
                <div className="small">Wind</div>
                <div>{weatherData.current.wind_speed} mph</div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Forecast */}
      <Card className="mb-3" style={{ border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Card.Header style={{ 
          backgroundColor: colors.forestGreen, 
          color: 'white',
          fontFamily: "'Playfair Display', serif" 
        }}>
          7-Day Forecast
        </Card.Header>
        <Card.Body>
          <div className="forecast-scroll" style={{ 
            display: 'flex',
            overflowX: 'auto',
            padding: '10px 0'
          }}>
            {weatherData.forecast.map((day, index) => (
              <div 
                key={index} 
                style={{ 
                  minWidth: '80px',
                  textAlign: 'center',
                  padding: '10px 5px',
                  marginRight: '10px'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{day.day}</div>
                <div style={{ fontSize: '1.5rem', margin: '5px 0' }}>
                  {getWeatherIcon(day.condition)}
                </div>
                <div style={{ fontWeight: 'bold' }}>{day.high}°</div>
                <div style={{ color: '#666' }}>{day.low}°</div>
                {day.precipitation > 30 && (
                  <Badge bg="primary" style={{ fontSize: '0.7rem', marginTop: '5px' }}>
                    {day.precipitation}% <FontAwesomeIcon icon={faCloudRain} />
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
      
      {/* Premium Features - Soil Temperature */}
      {userSubscription && userSubscription !== 'free' && soilTempData && (
        <Card className="mb-3" style={{ border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Card.Header style={{ 
            backgroundColor: colors.sage,
            color: colors.forestGreen,
            fontFamily: "'Playfair Display', serif" 
          }}>
            Soil Temperature
          </Card.Header>
          <Card.Body>
            <div className="d-flex align-items-center">
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%',
                backgroundColor: getSoilTempColor(soilTempData.temperature.surface),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '15px',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>
                {soilTempData.temperature.surface}°F
              </div>
              <div>
                <div style={{ fontWeight: 'bold' }}>Current Surface Temperature</div>
                <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                  {getSoilTempPlantingGuidance(soilTempData.temperature.surface)}
                </div>
              </div>
            </div>
            
            <div className="mt-3">
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                <Row>
                  <Col xs={4}>2" depth: {soilTempData.temperature.inch_2}°F</Col>
                  <Col xs={4}>4" depth: {soilTempData.temperature.inch_4}°F</Col>
                  <Col xs={4}>8" depth: {soilTempData.temperature.inch_8}°F</Col>
                </Row>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
      
      {/* Premium Features - Frost Risk */}
      {userSubscription && userSubscription !== 'free' && frostRisk && (
        <Card className="mb-3" style={{ border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Card.Header style={{ 
            backgroundColor: 
              frostRisk.risk_level === 'high' ? '#dc3545' :
              frostRisk.risk_level === 'moderate' ? '#ffc107' :
              '#28a745',
            color: 
              frostRisk.risk_level === 'high' ? 'white' :
              frostRisk.risk_level === 'moderate' ? 'black' :
              'white',
            fontFamily: "'Playfair Display', serif" 
          }}>
            <FontAwesomeIcon icon={faSnowflake} /> Frost Risk
          </Card.Header>
          <Card.Body>
            {frostRisk.risk_level !== 'low' && (
              <Alert variant={frostRisk.risk_level === 'high' ? 'danger' : 'warning'}>
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                {frostRisk.risk_level === 'high' 
                  ? 'High frost risk in the next 10 days. Protect sensitive plants!'
                  : 'Moderate frost risk. Be prepared to protect tender plants.'}
              </Alert>
            )}
            
            <div className="frost-forecast-scroll" style={{ 
              display: 'flex',
              overflowX: 'auto',
              padding: '10px 0'
            }}>
              {frostRisk.forecast.slice(0, 5).map((day, index) => (
                <div 
                  key={index} 
                  style={{ 
                    minWidth: '80px',
                    textAlign: 'center',
                    padding: '10px 5px',
                    marginRight: '10px',
                    backgroundColor: 
                      day.risk_percent > 70 ? '#ffebee' :
                      day.risk_percent > 30 ? '#fff8e1' :
                      '#f1f8e9',
                    borderRadius: '5px'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{day.day}</div>
                  <div style={{ color: '#666' }}>{day.expected_low}°F</div>
                  <div style={{ 
                    marginTop: '5px',
                    color: 
                      day.risk_percent > 70 ? '#c62828' :
                      day.risk_percent > 30 ? '#f57f17' :
                      '#2e7d32',
                    fontWeight: 'bold'
                  }}>
                    {day.risk_percent}%
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}
      
      {/* Premium Features - Planting Recommendations */}
      {userSubscription && userSubscription !== 'free' && plantingRecommendations && (
        <Card style={{ border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Card.Header style={{ 
            backgroundColor: colors.marigold,
            color: colors.forestGreen,
            fontFamily: "'Playfair Display', serif" 
          }}>
            Weather-Based Planting Tips
          </Card.Header>
          <Card.Body>
            <div className="mb-3">
              <Badge 
                bg="success" 
                style={{ 
                  fontWeight: 'normal', 
                  textTransform: 'capitalize',
                  padding: '5px 10px'
                }}
              >
                {plantingRecommendations.season} season
              </Badge>
            </div>
            
            <div className="mb-3">
              <h6>General Recommendations</h6>
              <ul className="list-unstyled">
                {plantingRecommendations.general_recommendations.map((rec, index) => (
                  <li key={index} className="mb-1">
                    <FontAwesomeIcon icon={faCloudSun} className="me-2 text-success" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
            
            {plantingRecommendations.weather_specific_recommendations.length > 0 && (
              <div>
                <h6>Based on Current Conditions</h6>
                <ul className="list-unstyled">
                  {plantingRecommendations.weather_specific_recommendations.map((rec, index) => (
                    <li key={index} className="mb-1">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="me-2 text-warning" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
      
      {/* For free users, show upgrade prompt */}
      {(!userSubscription || userSubscription === 'free') && (
        <Card 
          style={{ 
            border: `2px dashed ${colors.marigold}`,
            backgroundColor: colors.cream,
            marginTop: '20px'
          }}
        >
          <Card.Body className="text-center">
            <h6 style={{ color: colors.forestGreen }}>Upgrade for Premium Weather Features</h6>
            <p className="small text-muted mb-2">
              Get soil temperature data, frost alerts, and planting recommendations tailored to your garden conditions.
            </p>
            <Badge
              bg="warning"
              text="dark"
              style={{ fontSize: '0.9rem' }}
            >
              Premium Feature
            </Badge>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default WeatherWidget;