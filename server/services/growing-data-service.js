/**
 * Service for accessing accurate growing data from multiple sources
 * Implements enhanced fallbacks and regional data
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cacheService = require('./cache-service');

// Load local data files
const hardinessZones = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/hardiness-zones.json'), 'utf8'));
const soilTemperature = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/soil-temperature.json'), 'utf8'));
const regionalTips = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/regional-growing-tips.json'), 'utf8'));

// Cache TTLs (Time to live in seconds)
const CACHE_TTL = {
  WEATHER: 60 * 60, // 1 hour
  ZONE: 60 * 60 * 24 * 7, // 1 week
  SOIL: 60 * 60 * 6, // 6 hours
  GEOCODING: 60 * 60 * 24 * 30, // 30 days
  TIPS: 60 * 60 * 24 * 30 // 30 days
};

/**
 * Get hardiness zone data for a location with enhanced fallbacks
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Hardiness zone information
 */
async function getHardinessZone(lat, lng) {
  const cacheKey = `zone:${lat},${lng}`;
  const cachedData = cacheService.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // First attempt: PHZMAPI.org API
    const roundedLat = Math.round(lat * 100) / 100; // Round to 2 decimal places
    const roundedLng = Math.round(lng * 100) / 100;
    const response = await axios.get(`https://phzmapi.org/${roundedLat}/${roundedLng}.json`);
    
    const zoneData = {
      source: 'PHZMAPI.org',
      zone: response.data.zone.split(' ')[1], // Extract just the zone number/letter (e.g., "7b")
      temperature_range: response.data.temperature_range,
      coordinates: { lat, lng }
    };
    
    // Cache the result with persistent storage for zone data
    cacheService.set(cacheKey, zoneData, CACHE_TTL.ZONE, true);
    return zoneData;
  } catch (error) {
    console.log(`PHZMAPI API failed: ${error.message}. Trying enhanced fallbacks...`);
    
    // Second attempt: Check city database
    const city = await getNearestCity(lat, lng);
    if (city && hardinessZones.cities[city]) {
      const zoneData = {
        source: 'Hardiness Zones Database (City)',
        zone: hardinessZones.cities[city],
        city,
        coordinates: { lat, lng }
      };
      
      cacheService.set(cacheKey, zoneData, CACHE_TTL.ZONE, true);
      return zoneData;
    }
    
    // Third attempt: Check geo zones database
    const geoZone = findGeoZone(lat, lng);
    if (geoZone) {
      const zoneData = {
        source: 'Hardiness Zones Database (Geographic)',
        zone: geoZone,
        coordinates: { lat, lng }
      };
      
      cacheService.set(cacheKey, zoneData, CACHE_TTL.ZONE, true);
      return zoneData;
    }
    
    // Final fallback: Latitude-based estimation
    const estimatedZone = estimateZoneFromLatitude(lat);
    const zoneData = {
      source: 'Estimated Zone (latitude-based)',
      zone: estimatedZone,
      coordinates: { lat, lng },
      note: 'Estimated from latitude due to API unavailability'
    };
    
    cacheService.set(cacheKey, zoneData, CACHE_TTL.ZONE, true);
    return zoneData;
  }
}

/**
 * Get current weather and forecast data for a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Weather data
 */
async function getWeatherData(lat, lng) {
  const cacheKey = `weather:${lat},${lng}`;
  const cachedData = cacheService.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // Use Open-Meteo API (free, no key required)
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lng,
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        current_weather: true,
        temperature_unit: 'fahrenheit',
        windspeed_unit: 'mph',
        precipitation_unit: 'inch',
        timeformat: 'iso8601',
        timezone: 'auto',
        forecast_days: 14
      }
    });
    
    // Process the response data
    const currentTemp = response.data.current_weather?.temperature || null;
    const forecast = response.data.daily || {};
    
    // Calculate average temperature over the next 7 days
    const maxTemps = forecast.temperature_2m_max || [];
    const minTemps = forecast.temperature_2m_min || [];
    const avgForecastTemp = maxTemps.length && minTemps.length ? 
      (maxTemps.slice(0, 7).reduce((sum, temp) => sum + temp, 0) / Math.min(maxTemps.length, 7) + 
       minTemps.slice(0, 7).reduce((sum, temp) => sum + temp, 0) / Math.min(minTemps.length, 7)) / 2 : 
      currentTemp;
    
    // Calculate precipitation probability
    const precipProb = forecast.precipitation_probability_max || [];
    const avgPrecipProb = precipProb.length ? 
      precipProb.slice(0, 7).reduce((sum, prob) => sum + prob, 0) / Math.min(precipProb.length, 7) : 
      50;
    
    // Estimate soil temperature using improved model
    const soilTemps = estimateSoilTemperature(lat, lng, currentTemp);
    
    const weatherData = {
      source: 'Open-Meteo API',
      current_temp_f: currentTemp,
      current_temp_c: fahrenheitToCelsius(currentTemp),
      avg_forecast_temp_f: avgForecastTemp,
      avg_forecast_temp_c: fahrenheitToCelsius(avgForecastTemp),
      precipitation_probability: avgPrecipProb,
      soil_temperature: soilTemps,
      forecast_dates: forecast.time,
      coordinates: { lat, lng },
      timestamp: new Date().toISOString()
    };
    
    // Cache the result
    cacheService.set(cacheKey, weatherData, CACHE_TTL.WEATHER, true);
    return weatherData;
  } catch (error) {
    console.log(`Weather API failed: ${error.message}. Using fallback estimation...`);
    
    // Fallback to latitude-based estimation
    const estimatedTemp = estimateTemperatureFromLatitude(lat);
    const soilTemps = estimateSoilTemperature(lat, lng, estimatedTemp);
    
    const weatherData = {
      source: 'Estimated Weather (latitude-based)',
      current_temp_f: estimatedTemp,
      current_temp_c: fahrenheitToCelsius(estimatedTemp),
      avg_forecast_temp_f: estimatedTemp,
      avg_forecast_temp_c: fahrenheitToCelsius(estimatedTemp),
      precipitation_probability: Math.floor(Math.random() * 100),
      soil_temperature: soilTemps,
      coordinates: { lat, lng },
      note: 'Estimated due to API unavailability',
      timestamp: new Date().toISOString()
    };
    
    cacheService.set(cacheKey, weatherData, CACHE_TTL.WEATHER, true);
    return weatherData;
  }
}

/**
 * Get growing tips for a specific region and plant type
 * @param {string} countryCode - Country code (us, uk, ca, au)
 * @param {string} region - Region within country
 * @param {string} plantType - Type of plant (vegetable, herb, flower)
 * @param {string} season - Current season
 * @returns {Array} Array of growing tips
 */
function getRegionalTips(countryCode, region, plantType, season) {
  const cacheKey = `tips:${countryCode}:${region}:${plantType}:${season}`;
  const cachedData = cacheService.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // Default country and region if not provided
    const country = countryCode?.toLowerCase() || 'us';
    const defaultRegion = {
      us: 'northeast',
      uk: 'south',
      ca: 'central',
      au: 'southern'
    }[country] || 'northeast';
    
    // Use provided region or default
    const regionKey = region || defaultRegion;
    
    // Get tips for the region
    const countryTips = regionalTips[country] || regionalTips.us;
    const regionTips = countryTips[regionKey] || countryTips[defaultRegion];
    
    if (!regionTips) {
      return [];
    }
    
    // Filter tips by plant type and season
    const filteredTips = regionTips.filter(tip => {
      const matchesType = !plantType || tip.applies_to.includes(plantType);
      const matchesSeason = !season || tip.season === 'all' || 
                           (Array.isArray(tip.season) && tip.season.includes(season)) ||
                           tip.season === season;
      
      return matchesType && matchesSeason;
    });
    
    cacheService.set(cacheKey, filteredTips, CACHE_TTL.TIPS, true);
    return filteredTips;
  } catch (error) {
    console.log(`Error getting tips: ${error.message}`);
    return [];
  }
}

/**
 * Get region information for a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Region information
 */
async function getRegionInfo(lat, lng) {
  const cacheKey = `region:${lat},${lng}`;
  const cachedData = cacheService.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // Try to get region info from OpenWeatherMap geocoding API
    const response = await axios.get(`https://api.openweathermap.org/geo/1.0/reverse`, {
      params: {
        lat,
        lon: lng,
        limit: 1,
        appid: process.env.OPENWEATHER_API_KEY
      }
    });
    
    const locationData = response.data[0] || {};
    
    // Process location data
    const country = locationData.country;
    const regionName = locationData.state;
    const city = locationData.name;
    
    // Determine country code
    let countryCode = 'us'; // Default
    if (country === 'GB' || country === 'UK') countryCode = 'uk';
    else if (country === 'CA') countryCode = 'ca';
    else if (country === 'AU') countryCode = 'au';
    else if (country === 'US') countryCode = 'us';
    
    // Determine region within country
    let region = determineRegionFromCoordinates(lat, lng, countryCode);
    
    // Override with more specific information if available
    if (countryCode === 'uk' && regionName) {
      // UK regions
      if (["Scotland", "Northumberland", "Cumbria", "Durham", "North Yorkshire"].some(r => regionName.includes(r))) {
        region = 'north';
      } else if (["Derbyshire", "Nottinghamshire", "West Midlands", "Midlands", "Leicester"].some(r => regionName.includes(r))) {
        region = 'midlands';
      } else {
        region = 'south';
      }
    }
    
    const regionData = {
      source: 'OpenWeatherMap Geocoding',
      country_code: countryCode,
      country,
      region,
      city,
      state: regionName,
      coordinates: { lat, lng }
    };
    
    cacheService.set(cacheKey, regionData, CACHE_TTL.GEOCODING, true);
    return regionData;
  } catch (error) {
    console.log(`Geocoding API failed: ${error.message}. Using coordinates-based estimation...`);
    
    // Fallback to coordinates-based estimation
    const countryCode = estimateCountryFromCoordinates(lat, lng);
    const region = determineRegionFromCoordinates(lat, lng, countryCode);
    
    const regionData = {
      source: 'Estimated Region (coordinates-based)',
      country_code: countryCode,
      region,
      coordinates: { lat, lng },
      note: 'Estimated from coordinates due to API unavailability'
    };
    
    cacheService.set(cacheKey, regionData, CACHE_TTL.GEOCODING, true);
    return regionData;
  }
}

/**
 * Estimate the nearest city for a given location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string|null>} City name or null if not found
 */
async function getNearestCity(lat, lng) {
  const cacheKey = `city:${lat},${lng}`;
  const cachedData = cacheService.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // Try OpenWeatherMap geocoding API
    const response = await axios.get(`https://api.openweathermap.org/geo/1.0/reverse`, {
      params: {
        lat,
        lon: lng,
        limit: 1,
        appid: process.env.OPENWEATHER_API_KEY
      }
    });
    
    const locationData = response.data[0] || {};
    const cityName = locationData.name;
    const stateName = locationData.state;
    
    // Format city name with state if available
    let formattedCityName = cityName;
    if (stateName && locationData.country === 'US') {
      formattedCityName = `${cityName}, ${stateName}`;
    }
    
    if (formattedCityName) {
      cacheService.set(cacheKey, formattedCityName, CACHE_TTL.GEOCODING, true);
    }
    
    return formattedCityName || null;
  } catch (error) {
    console.log(`City lookup failed: ${error.message}`);
    return null;
  }
}

/**
 * Find the hardiness zone from geographic coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string|null} Hardiness zone or null if not found
 */
function findGeoZone(lat, lng) {
  // Check if coordinates match any geo zone
  for (const geoZone of hardinessZones.geo_zones) {
    const {lat_range, lng_range, zone} = geoZone;
    if (lat >= lat_range[0] && lat <= lat_range[1] && 
        lng >= lng_range[0] && lng <= lng_range[1]) {
      return zone;
    }
  }
  
  return null;
}

/**
 * Estimate hardiness zone based on latitude
 * @param {number} lat - Latitude
 * @returns {string} Estimated hardiness zone
 */
function estimateZoneFromLatitude(lat) {
  // Basic northern hemisphere zone estimation
  // This is very simplified; actual zones depend on many factors
  const absLat = Math.abs(lat);
  
  if (absLat < 26) return '11a'; // Very tropical
  if (absLat < 28) return '10b';
  if (absLat < 30) return '10a';
  if (absLat < 32) return '9b';
  if (absLat < 34) return '9a';
  if (absLat < 36) return '8b';
  if (absLat < 38) return '8a';
  if (absLat < 40) return '7b';
  if (absLat < 42) return '7a';
  if (absLat < 44) return '6b';
  if (absLat < 46) return '6a';
  if (absLat < 48) return '5b';
  if (absLat < 50) return '5a';
  if (absLat < 52) return '4b';
  if (absLat < 54) return '4a';
  if (absLat < 56) return '3b';
  if (absLat < 58) return '3a';
  if (absLat < 60) return '2b';
  if (absLat < 65) return '2a';
  return '1a'; // Very cold
}

/**
 * Estimate temperature based on latitude and current season
 * @param {number} lat - Latitude
 * @returns {number} Estimated temperature in Fahrenheit
 */
function estimateTemperatureFromLatitude(lat) {
  const absLat = Math.abs(lat);
  const currentMonth = new Date().getMonth();
  
  // Determine if it's northern or southern hemisphere
  const isNorthern = lat >= 0;
  
  // Determine season adjustment based on hemisphere
  let seasonAdjustment = 0;
  
  if (isNorthern) {
    // Northern hemisphere seasons
    if (currentMonth >= 2 && currentMonth <= 4) {
      seasonAdjustment = 10; // Spring
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      seasonAdjustment = 20; // Summer
    } else if (currentMonth >= 8 && currentMonth <= 10) {
      seasonAdjustment = 10; // Fall
    } else {
      seasonAdjustment = 0; // Winter
    }
  } else {
    // Southern hemisphere seasons (opposite)
    if (currentMonth >= 2 && currentMonth <= 4) {
      seasonAdjustment = 10; // Fall
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      seasonAdjustment = 0; // Winter
    } else if (currentMonth >= 8 && currentMonth <= 10) {
      seasonAdjustment = 10; // Spring
    } else {
      seasonAdjustment = 20; // Summer
    }
  }
  
  // Base temperature decreases as latitude increases
  // This is a very simplified model
  let baseTemp = 75 - (absLat * 0.5);
  
  // Apply season adjustment
  return baseTemp + seasonAdjustment;
}

/**
 * Advanced soil temperature estimation
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} airTemp - Current air temperature in Fahrenheit
 * @returns {Object} Soil temperature at different depths
 */
function estimateSoilTemperature(lat, lng, airTemp) {
  if (!airTemp) {
    airTemp = estimateTemperatureFromLatitude(lat);
  }
  
  // Get region and historical averages
  const countryCode = estimateCountryFromCoordinates(lat, lng);
  const region = determineRegionFromCoordinates(lat, lng, countryCode);
  
  // Determine current season
  const currentMonth = new Date().getMonth();
  const isNorthern = lat >= 0;
  
  let season;
  if (isNorthern) {
    if (currentMonth >= 2 && currentMonth <= 4) season = 'spring';
    else if (currentMonth >= 5 && currentMonth <= 7) season = 'summer';
    else if (currentMonth >= 8 && currentMonth <= 10) season = 'fall';
    else season = 'winter';
  } else {
    if (currentMonth >= 2 && currentMonth <= 4) season = 'fall';
    else if (currentMonth >= 5 && currentMonth <= 7) season = 'winter';
    else if (currentMonth >= 8 && currentMonth <= 10) season = 'spring';
    else season = 'summer';
  }
  
  // Get historical averages for region and season if available
  let historicalData = null;
  try {
    historicalData = soilTemperature.historical_averages[countryCode][region][season];
  } catch (error) {
    // Use US northeast as fallback if specific region data not available
    try {
      historicalData = soilTemperature.historical_averages.us.northeast[season];
    } catch (e) {
      // No historical data available, will use air temperature model only
    }
  }
  
  // Get thermal lag factors
  const thermalLag = soilTemperature.thermal_lag;
  
  // Calculate soil temperature based on air temperature and historical averages
  let surfaceTemp, depth4InchTemp, depth8InchTemp;
  
  if (historicalData) {
    // Blend current conditions with historical averages
    const blendFactor = 0.7; // 70% current conditions, 30% historical average
    
    surfaceTemp = (airTemp - thermalLag.air_to_surface) * blendFactor + 
                   historicalData.surface * (1 - blendFactor);
                   
    depth4InchTemp = (airTemp - thermalLag.surface_to_4inch) * blendFactor + 
                     historicalData["4inch"] * (1 - blendFactor);
                     
    depth8InchTemp = (airTemp - thermalLag.surface_to_8inch) * blendFactor + 
                     historicalData["8inch"] * (1 - blendFactor);
  } else {
    // Basic estimation based on air temperature
    surfaceTemp = airTemp - thermalLag.air_to_surface;
    depth4InchTemp = airTemp - thermalLag.surface_to_4inch;
    depth8InchTemp = airTemp - thermalLag.surface_to_8inch;
  }
  
  return {
    surface: {
      fahrenheit: Math.round(surfaceTemp),
      celsius: Math.round(fahrenheitToCelsius(surfaceTemp)),
    },
    "4_inches": {
      fahrenheit: Math.round(depth4InchTemp),
      celsius: Math.round(fahrenheitToCelsius(depth4InchTemp)),
    },
    "8_inches": {
      fahrenheit: Math.round(depth8InchTemp),
      celsius: Math.round(fahrenheitToCelsius(depth8InchTemp)),
    },
    is_estimated: true,
    estimation_method: historicalData ? 'Blended historical and current data' : 'Based on air temperature',
    season
  };
}

/**
 * Determine region within a country from coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} countryCode - Country code
 * @returns {string} Region name
 */
function determineRegionFromCoordinates(lat, lng, countryCode) {
  switch (countryCode) {
    case 'us':
      // US regions
      if (lng < -114) return 'west';
      if (lng < -104) return 'northwest';
      if (lng < -94) return 'midwest';
      if (lng < -84) {
        return lat < 36 ? 'southwest' : 'midwest';
      }
      return lat < 36 ? 'southeast' : 'northeast';
      
    case 'uk':
      // UK regions
      if (lat > 54) return 'north';
      if (lat > 52) return 'midlands';
      return 'south';
      
    case 'ca':
      // Canada regions
      if (lng < -125) return 'west_coast';
      if (lng < -95) return 'prairie';
      if (lng < -75) return 'central';
      return 'atlantic';
      
    case 'au':
      // Australia regions
      if (lat < -30) return 'southern';
      if (lat < -23) return 'central';
      return 'northern';
      
    default:
      return 'central';
  }
}

/**
 * Estimate country from coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} Country code
 */
function estimateCountryFromCoordinates(lat, lng) {
  // Very simplified country estimation based on rough boundaries
  // UK
  if (lat > 49 && lat < 61 && lng > -11 && lng < 2) {
    return 'uk';
  }
  
  // Australia
  if (lat < -10 && lat > -45 && lng > 110 && lng < 155) {
    return 'au';
  }
  
  // Canada
  if (lat > 48 && lat < 90 && lng > -141 && lng < -52) {
    return 'ca';
  }
  
  // Default to US for simplicity
  return 'us';
}

/**
 * Convert Fahrenheit to Celsius
 * @param {number} fahrenheit - Temperature in Fahrenheit
 * @returns {number} Temperature in Celsius
 */
function fahrenheitToCelsius(fahrenheit) {
  if (fahrenheit === null || fahrenheit === undefined) {
    return null;
  }
  return Math.round((fahrenheit - 32) * 5 / 9);
}

/**
 * Convert Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
function celsiusToFahrenheit(celsius) {
  if (celsius === null || celsius === undefined) {
    return null;
  }
  return Math.round((celsius * 9 / 5) + 32);
}

module.exports = {
  getHardinessZone,
  getWeatherData,
  getRegionalTips,
  getRegionInfo,
  estimateSoilTemperature,
  getNearestCity
};