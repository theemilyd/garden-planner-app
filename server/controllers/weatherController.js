const axios = require('axios');
const Garden = require('../models/Garden');
const User = require('../models/User');

// Get current weather by location
exports.getCurrentWeather = async (req, res) => {
  try {
    const { lat, lng, location_name } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide lat and lng parameters',
      });
    }
    
    // This would typically use a real weather API like OpenWeatherMap
    // Here we're mocking the response for demonstration purposes
    const weatherData = await mockWeatherAPI(lat, lng);
    
    res.status(200).json({
      status: 'success',
      data: {
        location: location_name || 'Your location',
        coordinates: { lat, lng },
        weather: weatherData,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get 7-day forecast by location
exports.getWeatherForecast = async (req, res) => {
  try {
    const { lat, lng, location_name } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide lat and lng parameters',
      });
    }
    
    // This would typically use a real weather API like OpenWeatherMap
    // Here we're mocking the response for demonstration purposes
    const forecastData = await mockForecastAPI(lat, lng);
    
    res.status(200).json({
      status: 'success',
      data: {
        location: location_name || 'Your location',
        coordinates: { lat, lng },
        forecast: forecastData,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get soil temperature by location
exports.getSoilTemperature = async (req, res) => {
  try {
    const { lat, lng, location_name } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide lat and lng parameters',
      });
    }
    
    // This would typically use a specialized soil temperature API
    // Here we're mocking the response for demonstration purposes
    const soilData = await mockSoilTemperatureAPI(lat, lng);
    
    res.status(200).json({
      status: 'success',
      data: {
        location: location_name || 'Your location',
        coordinates: { lat, lng },
        soil_temperature: soilData,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get garden-specific weather alerts
exports.getGardenAlerts = async (req, res) => {
  try {
    const gardenId = req.params.garden_id;
    
    // Fetch the garden to get its location
    const garden = await Garden.findById(gardenId);
    
    if (!garden) {
      return res.status(404).json({
        status: 'fail',
        message: 'Garden not found',
      });
    }
    
    // Check if the garden belongs to the current user
    if (garden.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to access this garden',
      });
    }
    
    // Get the user's location
    const userLocation = req.user.location;
    
    if (!userLocation || !userLocation.coordinates || !userLocation.coordinates.coordinates) {
      return res.status(400).json({
        status: 'fail',
        message: 'User location is not set',
      });
    }
    
    const [lng, lat] = userLocation.coordinates.coordinates;
    
    // Get current weather and forecast
    const currentWeather = await mockWeatherAPI(lat, lng);
    const forecast = await mockForecastAPI(lat, lng);
    
    // Generate alerts based on weather conditions
    const alerts = generateWeatherAlerts(garden, currentWeather, forecast);
    
    res.status(200).json({
      status: 'success',
      data: {
        garden_name: garden.name,
        current_weather: currentWeather,
        alerts,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Update weather data for a garden
exports.updateGardenWeatherData = async (req, res) => {
  try {
    const gardenId = req.params.garden_id;
    
    // Fetch the garden
    const garden = await Garden.findById(gardenId);
    
    if (!garden) {
      return res.status(404).json({
        status: 'fail',
        message: 'Garden not found',
      });
    }
    
    // Check if the garden belongs to the current user
    if (garden.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this garden',
      });
    }
    
    // Get the user's location
    const userLocation = req.user.location;
    
    if (!userLocation || !userLocation.coordinates || !userLocation.coordinates.coordinates) {
      return res.status(400).json({
        status: 'fail',
        message: 'User location is not set',
      });
    }
    
    const [lng, lat] = userLocation.coordinates.coordinates;
    
    // Update with seasonal temperature data (would typically come from historical weather API)
    // For now, we're using mock data
    const weatherData = {
      average_temperatures: {
        january: 32,
        february: 35,
        march: 45,
        april: 55,
        may: 65,
        june: 75,
        july: 80,
        august: 78,
        september: 68,
        october: 58,
        november: 48,
        december: 38,
      },
      annual_rainfall: 45, // inches
    };
    
    // If frost dates were provided manually, use those
    if (req.body.first_frost_date) {
      weatherData.first_frost_date = new Date(req.body.first_frost_date);
    }
    
    if (req.body.last_frost_date) {
      weatherData.last_frost_date = new Date(req.body.last_frost_date);
    }
    
    // Update the garden with weather data
    garden.weather_data = weatherData;
    await garden.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        garden,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Mock API functions for demonstration purposes
// In a real application, these would be API calls to real weather services

async function mockWeatherAPI(lat, lng) {
  // Simulate API response delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Generate random weather conditions based on latitude
  // Northern areas tend to be cooler, southern areas warmer
  const baseTemp = lat > 40 ? 50 : lat > 30 ? 65 : 80;
  const tempVariation = Math.floor(Math.random() * 15) - 7; // -7 to +7 degrees
  const temperature = baseTemp + tempVariation;
  
  // Random conditions with weighted probability
  const conditions = ['sunny', 'partly cloudy', 'cloudy', 'rainy', 'stormy'];
  const weights = [0.4, 0.3, 0.15, 0.1, 0.05];
  
  let conditionIndex = 0;
  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (let i = 0; i < weights.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      conditionIndex = i;
      break;
    }
  }
  
  const humidity = Math.floor(Math.random() * 35) + 40; // 40-75%
  const windSpeed = Math.floor(Math.random() * 15) + 2; // 2-17 mph
  
  return {
    temperature: {
      fahrenheit: temperature,
      celsius: Math.round((temperature - 32) * 5 / 9),
    },
    condition: conditions[conditionIndex],
    humidity,
    wind_speed: windSpeed,
    timestamp: new Date().toISOString(),
  };
}

async function mockForecastAPI(lat, lng) {
  // Simulate API response delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Generate a 7-day forecast
  const forecast = [];
  const baseTemp = lat > 40 ? 50 : lat > 30 ? 65 : 80;
  const conditions = ['sunny', 'partly cloudy', 'cloudy', 'rainy', 'stormy'];
  
  // Get current date
  const currentDate = new Date();
  
  for (let i = 0; i < 7; i++) {
    const forecastDate = new Date(currentDate);
    forecastDate.setDate(forecastDate.getDate() + i);
    
    // Generate some mild temperature variation across days
    const dayVariation = Math.floor(Math.random() * 10) - 5; // -5 to +5 degrees
    const highTemp = baseTemp + dayVariation + 10;
    const lowTemp = baseTemp + dayVariation - 10;
    
    // Weighted random condition
    const conditionIndex = Math.floor(Math.random() * conditions.length);
    
    // Chance of precipitation based on condition
    let precipitation = 0;
    if (conditions[conditionIndex] === 'rainy') {
      precipitation = Math.floor(Math.random() * 70) + 30; // 30-100%
    } else if (conditions[conditionIndex] === 'cloudy') {
      precipitation = Math.floor(Math.random() * 30); // 0-30%
    } else if (conditions[conditionIndex] === 'partly cloudy') {
      precipitation = Math.floor(Math.random() * 15); // 0-15%
    } else if (conditions[conditionIndex] === 'stormy') {
      precipitation = Math.floor(Math.random() * 40) + 60; // 60-100%
    }
    
    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      temperature: {
        high: {
          fahrenheit: highTemp,
          celsius: Math.round((highTemp - 32) * 5 / 9),
        },
        low: {
          fahrenheit: lowTemp,
          celsius: Math.round((lowTemp - 32) * 5 / 9),
        },
      },
      condition: conditions[conditionIndex],
      precipitation_chance: precipitation,
    });
  }
  
  return forecast;
}

async function mockSoilTemperatureAPI(lat, lng) {
  // Simulate API response delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Soil temperature tends to lag behind air temperature
  // and is less variable
  
  // Base on latitude
  const baseTemp = lat > 40 ? 45 : lat > 30 ? 55 : 65;
  const tempVariation = Math.floor(Math.random() * 8) - 4; // -4 to +4 degrees
  const soilTemp = baseTemp + tempVariation;
  
  // Temperatures at different depths
  return {
    temperature: {
      surface: {
        fahrenheit: soilTemp + 5,
        celsius: Math.round(((soilTemp + 5) - 32) * 5 / 9),
      },
      "4_inches": {
        fahrenheit: soilTemp,
        celsius: Math.round((soilTemp - 32) * 5 / 9),
      },
      "8_inches": {
        fahrenheit: soilTemp - 3,
        celsius: Math.round(((soilTemp - 3) - 32) * 5 / 9),
      },
    },
    moisture: Math.floor(Math.random() * 60) + 20, // 20-80%
    timestamp: new Date().toISOString(),
  };
}

// In a production environment, this function would make actual API calls
// This function estimates soil temperature based on Open-Meteo data
async function getRealSoilTemperature(lat, lng) {
  try {
    // Use Open-Meteo for air temperature (free, no API key required)
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lng,
        daily: 'temperature_2m_max,temperature_2m_min',
        current_weather: true,
        temperature_unit: 'celsius',
        timeformat: 'iso8601',
        timezone: 'auto',
        forecast_days: 1
      }
    });
    
    // Extract current temperature data
    const currentTemp = response.data.current_weather?.temperature;
    
    // Use the Open-Meteo temperature to estimate soil temperature
    // Soil temperature typically lags behind and is more stable than air temperature
    // Surface soil is more affected by air temp, deeper soil less so
    const surfaceTemp = currentTemp - 1; // Usually 1-2°C cooler than air at surface
    const depth4InchesTemp = currentTemp - 3; // Deeper soil has more stable temps
    const depth8InchesTemp = currentTemp - 5; // Even more stable at deeper depths
    
    // Soil moisture is more difficult to estimate accurately without specialized sensors
    // Here we're using a fixed value as a placeholder
    const soilMoisture = 45; // Percent, moderate moisture level
    
    return {
      temperature: {
        surface: {
          fahrenheit: celsiusToFahrenheit(surfaceTemp),
          celsius: surfaceTemp,
        },
        "4_inches": {
          fahrenheit: celsiusToFahrenheit(depth4InchesTemp),
          celsius: depth4InchesTemp,
        },
        "8_inches": {
          fahrenheit: celsiusToFahrenheit(depth8InchesTemp),
          celsius: depth8InchesTemp,
        },
      },
      moisture: soilMoisture,
      timestamp: new Date().toISOString(),
      note: "Soil temperature estimated from air temperature (Open-Meteo)"
    };
  } catch (error) {
    console.error('Failed to fetch soil temperature data:', error);
    // Fallback to mock data if the API fails
    return mockSoilTemperatureAPI(lat, lng);
  }
}

// Helper function to convert celsius to fahrenheit
function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9/5) + 32);
}

// Helper function to generate garden-specific weather alerts
function generateWeatherAlerts(garden, currentWeather, forecast) {
  const alerts = [];
  const currentDate = new Date();
  
  // Check for frost risks
  const tomorrowForecast = forecast[1];
  if (tomorrowForecast && tomorrowForecast.temperature.low.fahrenheit <= 32) {
    alerts.push({
      type: 'frost',
      severity: 'high',
      message: 'Frost alert for tomorrow! Protect sensitive plants.',
      timestamp: currentDate.toISOString(),
    });
  }
  
  // Check for heat stress
  if (currentWeather.temperature.fahrenheit >= 90) {
    alerts.push({
      type: 'heat',
      severity: 'medium',
      message: 'High temperatures may cause heat stress. Consider additional watering and shade.',
      timestamp: currentDate.toISOString(),
    });
  }
  
  // Check for drought conditions
  let dryDaysCount = 0;
  for (const day of forecast) {
    if (day.precipitation_chance < 20) {
      dryDaysCount++;
    }
  }
  
  if (dryDaysCount >= 5) {
    alerts.push({
      type: 'drought',
      severity: 'medium',
      message: 'Extended dry period forecasted. Plan for additional watering.',
      timestamp: currentDate.toISOString(),
    });
  }
  
  // Check for heavy rain
  let heavyRainDays = 0;
  for (const day of forecast.slice(0, 3)) {
    if (day.condition === 'rainy' && day.precipitation_chance > 70) {
      heavyRainDays++;
    }
  }
  
  if (heavyRainDays >= 2) {
    alerts.push({
      type: 'rain',
      severity: 'low',
      message: 'Heavy rain expected. Check drainage and consider delaying new plantings.',
      timestamp: currentDate.toISOString(),
    });
  }
  
  // Check for strong winds
  if (currentWeather.wind_speed > 15) {
    alerts.push({
      type: 'wind',
      severity: 'low',
      message: 'Strong winds may damage tall plants. Consider staking or temporary protection.',
      timestamp: currentDate.toISOString(),
    });
  }
  
  return alerts;
}