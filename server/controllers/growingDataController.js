/**
 * Controller for providing accurate sowing dates based on location
 * Uses multiple data sources with enhanced fallbacks
 */
 
const axios = require('axios');
const Plant = require('../models/Plant');
const User = require('../models/User');
const growingDataService = require('../services/growing-data-service');

/**
 * Get accurate sowing dates using multiple regional APIs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAccurateSowingDates = async (req, res) => {
  try {
    const { lat, lng, plantId, country } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide lat and lng parameters',
      });
    }
    
    if (!plantId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a plant ID',
      });
    }
    
    // Get the plant's basic data
    const plant = await Plant.findById(plantId);
    
    if (!plant) {
      return res.status(404).json({
        status: 'fail',
        message: 'Plant not found',
      });
    }

    // Get data from multiple sources concurrently
    const [zoneData, weatherData, regionInfo] = await Promise.all([
      growingDataService.getHardinessZone(lat, lng),
      growingDataService.getWeatherData(lat, lng),
      growingDataService.getRegionInfo(lat, lng)
    ]);
    
    // Calculate planting windows based on the data
    const plantingWindows = calculatePlantingWindows(plant, zoneData, weatherData, regionInfo);
    
    // Get region-specific growing tips
    const growingTips = growingDataService.getRegionalTips(
      regionInfo.country_code,
      regionInfo.region,
      plant.plant_type,
      getCurrentSeason(lat)
    );
    
    // Calculate confidence rating based on data sources
    const confidenceRating = calculateConfidenceRating(zoneData, weatherData, regionInfo);
    
    res.status(200).json({
      status: 'success',
      data: {
        plant: {
          id: plant._id,
          name: plant.name,
          scientific_name: plant.scientific_name,
          plant_type: plant.plant_type
        },
        location: {
          lat, 
          lng,
          city: regionInfo.city,
          region: regionInfo.region,
          country: regionInfo.country
        },
        hardiness_zone: zoneData.zone,
        weather: {
          current_temp_f: weatherData.current_temp_f,
          current_temp_c: weatherData.current_temp_c,
          soil_temperature: weatherData.soil_temperature
        },
        planting_data: {
          windows: plantingWindows,
          optimal_soil_temp: getOptimalSoilTemperature(plant),
          current_suitability: calculatePlantingSuitability(plant, weatherData, zoneData)
        },
        growing_tips: growingTips,
        confidence_rating: confidenceRating,
        data_sources: [zoneData.source, weatherData.source, regionInfo.source]
      }
    });
  } catch (error) {
    console.error('Error getting sowing dates:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

/**
 * Get accurate frost dates for a location using multiple data sources
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAccurateFrostDates = async (req, res) => {
  try {
    const { lat, lng, country } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide lat and lng parameters',
      });
    }
    
    // Get hardiness zone and region info
    const [zoneData, regionInfo] = await Promise.all([
      growingDataService.getHardinessZone(lat, lng),
      growingDataService.getRegionInfo(lat, lng)
    ]);
    
    // Get frost dates based on hardiness zone
    const firstFrostDate = calculateFirstFrostDate(zoneData.zone, regionInfo);
    const lastFrostDate = calculateLastFrostDate(zoneData.zone, regionInfo);
    
    // Calculate frost date range (for uncertainty)
    const firstFrostRange = calculateDateRange(firstFrostDate, 7); // +/- 7 days
    const lastFrostRange = calculateDateRange(lastFrostDate, 7);
    
    res.status(200).json({
      status: 'success',
      data: {
        location: {
          lat, 
          lng,
          city: regionInfo.city,
          region: regionInfo.region,
          country: regionInfo.country
        },
        hardiness_zone: zoneData.zone,
        frost_dates: {
          first_frost: {
            average_date: firstFrostDate,
            earliest: firstFrostRange.earlier,
            latest: firstFrostRange.later
          },
          last_frost: {
            average_date: lastFrostDate,
            earliest: lastFrostRange.earlier,
            latest: lastFrostRange.later
          },
          growing_season_length: calculateGrowingSeasonLength(lastFrostDate, firstFrostDate)
        },
        confidence_rating: calculateConfidenceRating(zoneData, null, regionInfo),
        data_sources: [zoneData.source, regionInfo.source]
      }
    });
  } catch (error) {
    console.error('Error getting frost dates:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

/**
 * Get accurate growing zone information from multiple sources
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAccurateGrowingZone = async (req, res) => {
  try {
    const { lat, lng, country } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide lat and lng parameters',
      });
    }
    
    // Get zone data and region info
    const [zoneData, regionInfo, nearestCity] = await Promise.all([
      growingDataService.getHardinessZone(lat, lng),
      growingDataService.getRegionInfo(lat, lng),
      growingDataService.getNearestCity(lat, lng)
    ]);
    
    // Get temperature range for zone
    const tempRange = getZoneTemperatureRange(zoneData.zone);
    
    res.status(200).json({
      status: 'success',
      data: {
        location: {
          lat, 
          lng,
          nearest_city: nearestCity,
          region: regionInfo.region,
          country: regionInfo.country
        },
        growing_zone: {
          usda_zone: zoneData.zone,
          min_temp_f: tempRange.min_f,
          min_temp_c: tempRange.min_c,
          examples: getZoneExamples(zoneData.zone)
        },
        region_info: {
          name: regionInfo.region,
          country_code: regionInfo.country_code,
          growing_season_length: calculateGrowingSeasonLength(
            calculateLastFrostDate(zoneData.zone, regionInfo),
            calculateFirstFrostDate(zoneData.zone, regionInfo)
          )
        },
        confidence_rating: calculateConfidenceRating(zoneData, null, regionInfo),
        data_sources: [zoneData.source, regionInfo.source]
      }
    });
  } catch (error) {
    console.error('Error getting growing zone:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

/**
 * Calculate planting windows for a plant based on zone and weather data
 * @param {Object} plant - Plant data
 * @param {Object} zoneData - Hardiness zone data
 * @param {Object} weatherData - Weather data
 * @param {Object} regionInfo - Region information
 * @returns {Object} Planting windows
 */
function calculatePlantingWindows(plant, zoneData, weatherData, regionInfo) {
  const countryCode = regionInfo.country_code || 'us';
  const region = regionInfo.region;
  const zoneNumber = parseZoneNumber(zoneData.zone);
  
  // Calculate base windows based on country and region
  let windows = {};
  
  if (countryCode === 'uk') {
    windows = calculateUKPlantingWindows(plant, region);
  } else if (countryCode === 'au') {
    windows = calculateAUPlantingWindows(plant, region);
  } else if (countryCode === 'ca') {
    windows = calculateCAPlantingWindows(plant, region, zoneNumber);
  } else {
    // Default to US
    windows = calculateUSPlantingWindows(plant, zoneNumber);
  }
  
  // Adjust windows based on current weather conditions
  if (weatherData) {
    windows = adjustWindowsForWeather(windows, weatherData, plant);
  }
  
  return windows;
}

/**
 * Calculate planting windows for US regions
 * @param {Object} plant - Plant data
 * @param {number} zoneNumber - USDA zone number
 * @returns {Object} Planting windows
 */
function calculateUSPlantingWindows(plant, zoneNumber) {
  const currentYear = new Date().getFullYear();
  const windows = {};
  
  // Adjust sowing windows based on plant type and zone
  if (plant.plant_type === 'vegetable') {
    // Cool season vegetables
    if (plant.preferences?.temperature === 'cool') {
      windows.spring = {
        start_date: `${currentYear}-${zoneNumber < 7 ? '04' : '03'}-01`,
        end_date: `${currentYear}-${zoneNumber < 7 ? '05' : '04'}-15`,
        method: 'direct sow or transplant'
      };
      windows.fall = {
        start_date: `${currentYear}-${zoneNumber < 7 ? '08' : '09'}-01`,
        end_date: `${currentYear}-${zoneNumber < 7 ? '09' : '10'}-15`,
        method: 'direct sow'
      };
    } 
    // Warm season vegetables
    else {
      windows.spring = {
        start_date: `${currentYear}-${zoneNumber < 7 ? '05' : '04'}-15`,
        end_date: `${currentYear}-${zoneNumber < 7 ? '06' : '05'}-30`,
        method: 'direct sow or transplant'
      };
    }
  } else if (plant.plant_type === 'herb') {
    windows.spring = {
      start_date: `${currentYear}-${zoneNumber < 7 ? '04' : '03'}-15`,
      end_date: `${currentYear}-${zoneNumber < 7 ? '06' : '05'}-15`,
      method: 'direct sow or transplant'
    };
  } else if (plant.plant_type === 'flower') {
    windows.spring = {
      start_date: `${currentYear}-${zoneNumber < 7 ? '04' : '03'}-01`,
      end_date: `${currentYear}-${zoneNumber < 7 ? '06' : '05'}-15`,
      method: 'direct sow or transplant'
    };
    windows.winter = {
      start_date: `${currentYear-1}-${zoneNumber < 7 ? '10' : '11'}-01`,
      end_date: `${currentYear-1}-${zoneNumber < 7 ? '11' : '12'}-15`,
      method: 'stratify seeds or indoor sow'
    };
  }
  
  return windows;
}

/**
 * Calculate planting windows for UK regions
 * @param {Object} plant - Plant data
 * @param {string} region - UK region
 * @returns {Object} Planting windows
 */
function calculateUKPlantingWindows(plant, region) {
  const currentYear = new Date().getFullYear();
  const windows = {};
  
  // Adjust sowing windows based on plant type and UK region
  if (plant.plant_type === 'vegetable') {
    // Cool season vegetables
    if (plant.preferences?.temperature === 'cool') {
      windows.spring = {
        start_date: `${currentYear}-${region === 'north' ? '04' : '03'}-15`,
        end_date: `${currentYear}-${region === 'north' ? '05' : '04'}-30`,
        method: 'direct sow or transplant'
      };
      windows.fall = {
        start_date: `${currentYear}-${region === 'north' ? '08' : '09'}-01`,
        end_date: `${currentYear}-${region === 'north' ? '09' : '10'}-15`,
        method: 'direct sow'
      };
    } 
    // Warm season vegetables
    else {
      windows.spring = {
        start_date: `${currentYear}-${region === 'north' ? '05' : '04'}-15`,
        end_date: `${currentYear}-${region === 'north' ? '06' : '05'}-30`,
        method: 'direct sow or transplant'
      };
    }
  } else if (plant.plant_type === 'herb') {
    windows.spring = {
      start_date: `${currentYear}-${region === 'north' ? '04' : '03'}-15`,
      end_date: `${currentYear}-${region === 'north' ? '06' : '05'}-15`,
      method: 'direct sow or transplant'
    };
  } else if (plant.plant_type === 'flower') {
    windows.spring = {
      start_date: `${currentYear}-${region === 'north' ? '04' : '03'}-15`,
      end_date: `${currentYear}-${region === 'north' ? '06' : '05'}-15`,
      method: 'direct sow or transplant'
    };
    windows.autumn = {
      start_date: `${currentYear}-${region === 'north' ? '09' : '10'}-01`,
      end_date: `${currentYear}-${region === 'north' ? '10' : '11'}-15`,
      method: 'stratify seeds or indoor sow'
    };
  }
  
  return windows;
}

/**
 * Calculate planting windows for Canada regions
 * @param {Object} plant - Plant data
 * @param {string} region - Canada region
 * @param {number} zoneNumber - USDA zone number
 * @returns {Object} Planting windows
 */
function calculateCAPlantingWindows(plant, region, zoneNumber) {
  const currentYear = new Date().getFullYear();
  const windows = {};
  
  // Adjustment based on region (earlier in west_coast, later in northern, etc.)
  let regionAdjustment = 0; // days
  
  if (region === 'west_coast') regionAdjustment = -14; // 2 weeks earlier
  else if (region === 'atlantic') regionAdjustment = 0;
  else if (region === 'central') regionAdjustment = 7; // 1 week later
  else if (region === 'prairie') regionAdjustment = 14; // 2 weeks later
  else if (region === 'northern') regionAdjustment = 21; // 3 weeks later
  
  // Base dates similar to US, but adjusted for Canadian regions
  if (plant.plant_type === 'vegetable') {
    // Cool season vegetables
    if (plant.preferences?.temperature === 'cool') {
      const springStart = new Date(`${currentYear}-${zoneNumber < 5 ? '05' : '04'}-15`);
      springStart.setDate(springStart.getDate() + regionAdjustment);
      
      const springEnd = new Date(`${currentYear}-${zoneNumber < 5 ? '06' : '05'}-30`);
      springEnd.setDate(springEnd.getDate() + regionAdjustment);
      
      windows.spring = {
        start_date: springStart.toISOString().split('T')[0],
        end_date: springEnd.toISOString().split('T')[0],
        method: 'direct sow or transplant'
      };
      
      // Fall planting for cool season (if zone permits)
      if (zoneNumber >= 4) {
        const fallStart = new Date(`${currentYear}-${zoneNumber < 5 ? '07' : '08'}-15`);
        fallStart.setDate(fallStart.getDate() + regionAdjustment);
        
        const fallEnd = new Date(`${currentYear}-${zoneNumber < 5 ? '08' : '09'}-30`);
        fallEnd.setDate(fallEnd.getDate() + regionAdjustment);
        
        windows.fall = {
          start_date: fallStart.toISOString().split('T')[0],
          end_date: fallEnd.toISOString().split('T')[0],
          method: 'direct sow'
        };
      }
    } else {
      // Warm season vegetables (only in appropriate zones)
      if (zoneNumber >= 3) {
        const springStart = new Date(`${currentYear}-${zoneNumber < 5 ? '06' : '05'}-01`);
        springStart.setDate(springStart.getDate() + regionAdjustment);
        
        const springEnd = new Date(`${currentYear}-${zoneNumber < 5 ? '06' : '05'}-30`);
        springEnd.setDate(springEnd.getDate() + regionAdjustment);
        
        windows.spring = {
          start_date: springStart.toISOString().split('T')[0],
          end_date: springEnd.toISOString().split('T')[0],
          method: 'transplant only in colder regions'
        };
      }
    }
  } else if (plant.plant_type === 'herb') {
    const springStart = new Date(`${currentYear}-${zoneNumber < 5 ? '05' : '04'}-15`);
    springStart.setDate(springStart.getDate() + regionAdjustment);
    
    const springEnd = new Date(`${currentYear}-${zoneNumber < 5 ? '06' : '05'}-30`);
    springEnd.setDate(springEnd.getDate() + regionAdjustment);
    
    windows.spring = {
      start_date: springStart.toISOString().split('T')[0],
      end_date: springEnd.toISOString().split('T')[0],
      method: 'direct sow or transplant'
    };
  } else if (plant.plant_type === 'flower') {
    const springStart = new Date(`${currentYear}-${zoneNumber < 5 ? '05' : '04'}-15`);
    springStart.setDate(springStart.getDate() + regionAdjustment);
    
    const springEnd = new Date(`${currentYear}-${zoneNumber < 5 ? '06' : '05'}-30`);
    springEnd.setDate(springEnd.getDate() + regionAdjustment);
    
    windows.spring = {
      start_date: springStart.toISOString().split('T')[0],
      end_date: springEnd.toISOString().split('T')[0],
      method: 'direct sow or transplant'
    };
  }
  
  return windows;
}

/**
 * Calculate planting windows for Australia regions
 * @param {Object} plant - Plant data
 * @param {string} region - Australia region
 * @returns {Object} Planting windows
 */
function calculateAUPlantingWindows(plant, region) {
  const currentYear = new Date().getFullYear();
  const windows = {};
  
  // Australia has opposite seasons from the northern hemisphere
  if (plant.plant_type === 'vegetable') {
    // Cool season vegetables (plant in autumn for winter harvest)
    if (plant.preferences?.temperature === 'cool') {
      windows.autumn = {
        start_date: `${currentYear}-${region === 'northern' ? '04' : '03'}-01`,
        end_date: `${currentYear}-${region === 'northern' ? '05' : '04'}-15`,
        method: 'direct sow or transplant'
      };
      
      // Only for southern regions with cool winters
      if (region === 'southern') {
        windows.spring = {
          start_date: `${currentYear}-09-01`,
          end_date: `${currentYear}-10-15`,
          method: 'direct sow'
        };
      }
    } 
    // Warm season vegetables (plant in spring for summer harvest)
    else {
      windows.spring = {
        start_date: `${currentYear}-${region === 'southern' ? '10' : '09'}-01`,
        end_date: `${currentYear}-${region === 'southern' ? '11' : '10'}-30`,
        method: 'direct sow or transplant'
      };
    }
  } else if (plant.plant_type === 'herb') {
    windows.autumn = {
      start_date: `${currentYear}-${region === 'northern' ? '03' : '02'}-15`,
      end_date: `${currentYear}-${region === 'northern' ? '05' : '04'}-01`,
      method: 'direct sow or transplant'
    };
    windows.spring = {
      start_date: `${currentYear}-${region === 'southern' ? '09' : '08'}-15`,
      end_date: `${currentYear}-${region === 'southern' ? '11' : '10'}-01`,
      method: 'direct sow or transplant'
    };
  } else if (plant.plant_type === 'flower') {
    windows.autumn = {
      start_date: `${currentYear}-${region === 'northern' ? '03' : '02'}-15`,
      end_date: `${currentYear}-${region === 'northern' ? '05' : '04'}-01`,
      method: 'direct sow or transplant'
    };
    windows.spring = {
      start_date: `${currentYear}-${region === 'southern' ? '09' : '08'}-15`,
      end_date: `${currentYear}-${region === 'southern' ? '11' : '10'}-01`,
      method: 'direct sow or transplant'
    };
  }
  
  return windows;
}

/**
 * Adjust planting windows based on current weather conditions
 * @param {Object} windows - Base planting windows
 * @param {Object} weatherData - Current weather data
 * @param {Object} plant - Plant data
 * @returns {Object} Adjusted planting windows
 */
function adjustWindowsForWeather(windows, weatherData, plant) {
  const adjustedWindows = { ...windows };
  
  // Determine temperature-based adjustment
  let adjustmentDays = 0;
  
  // Check if current soil temperature is suitable for this plant
  const optimalSoilTemp = getOptimalSoilTemperature(plant);
  const currentSoilTemp = weatherData.soil_temperature?.surface?.fahrenheit;
  
  if (currentSoilTemp && optimalSoilTemp) {
    const tempDiff = currentSoilTemp - optimalSoilTemp.min;
    
    // If soil is too cold, delay planting
    if (tempDiff < -5) {
      adjustmentDays = Math.ceil(Math.abs(tempDiff) / 3); // 3 days delay per 3°F below minimum
    }
    // If soil is warmer than expected, planting can be earlier
    else if (tempDiff > 5) {
      adjustmentDays = -Math.floor(tempDiff / 5); // 1 day earlier per 5°F above minimum
    }
    
    // Limit adjustment to reasonable range
    adjustmentDays = Math.max(-14, Math.min(14, adjustmentDays));
  }
  
  // Apply adjustment to each window
  Object.keys(adjustedWindows).forEach(season => {
    // Only adjust upcoming windows, not past ones
    const startDate = new Date(adjustedWindows[season].start_date);
    const now = new Date();
    
    if (startDate > now) {
      startDate.setDate(startDate.getDate() + adjustmentDays);
      
      const endDate = new Date(adjustedWindows[season].end_date);
      endDate.setDate(endDate.getDate() + adjustmentDays);
      
      adjustedWindows[season].start_date = startDate.toISOString().split('T')[0];
      adjustedWindows[season].end_date = endDate.toISOString().split('T')[0];
      
      // Add note about adjustment
      adjustedWindows[season].weather_adjustment = {
        days: adjustmentDays,
        reason: adjustmentDays > 0 
          ? 'Delayed due to cooler than optimal soil temperature' 
          : adjustmentDays < 0 
            ? 'Earlier due to warmer than optimal soil temperature'
            : 'No adjustment needed'
      };
    }
  });
  
  return adjustedWindows;
}

/**
 * Calculate first frost date based on zone
 * @param {string} zone - USDA hardiness zone
 * @param {Object} regionInfo - Regional information
 * @returns {string} First frost date (yyyy-mm-dd)
 */
function calculateFirstFrostDate(zone, regionInfo) {
  const currentYear = new Date().getFullYear();
  const baseZone = parseZoneNumber(zone);
  const country = regionInfo?.country_code || 'us';
  const region = regionInfo?.region;
  
  // For southern hemisphere, reverse frost dates
  const isSouthernHemisphere = country === 'au';
  
  if (isSouthernHemisphere) {
    // First frost in southern hemisphere comes after winter (around April-May)
    if (region === 'northern') return `${currentYear}-05-15`; // Tropical, may not get frost
    if (region === 'central') return `${currentYear}-05-01`;
    return `${currentYear}-04-15`; // Southern
  }
  
  // Northern hemisphere first frost (fall/autumn)
  if (country === 'uk') {
    if (region === 'north') return `${currentYear}-10-15`;
    if (region === 'midlands') return `${currentYear}-10-30`;
    return `${currentYear}-11-15`; // South
  }
  
  if (country === 'ca') {
    if (region === 'northern') return `${currentYear}-09-01`;
    if (region === 'prairie') return `${currentYear}-09-15`;
    if (region === 'central') return `${currentYear}-10-01`;
    if (region === 'atlantic') return `${currentYear}-10-15`;
    return `${currentYear}-11-01`; // West coast
  }
  
  // Default US dates based on zone
  let month, day;
  if (baseZone <= 3) {
    month = '09';
    day = '01';
  } else if (baseZone <= 4) {
    month = '09';
    day = '15';
  } else if (baseZone <= 5) {
    month = '10';
    day = '01';
  } else if (baseZone <= 6) {
    month = '10';
    day = '15';
  } else if (baseZone <= 7) {
    month = '11';
    day = '01';
  } else if (baseZone <= 8) {
    month = '11';
    day = '15';
  } else if (baseZone <= 9) {
    month = '12';
    day = '01';
  } else {
    month = '12';
    day = '15';
  }
  
  return `${currentYear}-${month}-${day}`;
}

/**
 * Calculate last frost date based on zone
 * @param {string} zone - USDA hardiness zone
 * @param {Object} regionInfo - Regional information
 * @returns {string} Last frost date (yyyy-mm-dd)
 */
function calculateLastFrostDate(zone, regionInfo) {
  const currentYear = new Date().getFullYear();
  const baseZone = parseZoneNumber(zone);
  const country = regionInfo?.country_code || 'us';
  const region = regionInfo?.region;
  
  // For southern hemisphere, reverse frost dates
  const isSouthernHemisphere = country === 'au';
  
  if (isSouthernHemisphere) {
    // Last frost in southern hemisphere comes at end of winter (around Aug-Sept)
    if (region === 'northern') return `${currentYear}-08-01`; // Tropical, may not get frost
    if (region === 'central') return `${currentYear}-08-15`;
    return `${currentYear}-09-01`; // Southern
  }
  
  // Northern hemisphere last frost (spring)
  if (country === 'uk') {
    if (region === 'north') return `${currentYear}-04-30`;
    if (region === 'midlands') return `${currentYear}-04-15`;
    return `${currentYear}-03-30`; // South
  }
  
  if (country === 'ca') {
    if (region === 'northern') return `${currentYear}-06-15`;
    if (region === 'prairie') return `${currentYear}-05-31`;
    if (region === 'central') return `${currentYear}-05-15`;
    if (region === 'atlantic') return `${currentYear}-05-01`;
    return `${currentYear}-04-15`; // West coast
  }
  
  // Default US dates based on zone
  let month, day;
  if (baseZone <= 3) {
    month = '06';
    day = '01';
  } else if (baseZone <= 4) {
    month = '05';
    day = '15';
  } else if (baseZone <= 5) {
    month = '05';
    day = '01';
  } else if (baseZone <= 6) {
    month = '04';
    day = '15';
  } else if (baseZone <= 7) {
    month = '04';
    day = '01';
  } else if (baseZone <= 8) {
    month = '03';
    day = '15';
  } else if (baseZone <= 9) {
    month = '03';
    day = '01';
  } else {
    month = '02';
    day = '15';
  }
  
  return `${currentYear}-${month}-${day}`;
}

/**
 * Parse zone number from zone string (e.g., "7b" -> 7)
 * @param {string} zone - Zone string
 * @returns {number} Zone number
 */
function parseZoneNumber(zone) {
  if (!zone) return 6; // Default to zone 6 if not provided
  
  // Extract number portion from zone string (e.g., "7b" -> 7)
  const match = zone.match(/^(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  return 6; // Default if parsing fails
}

/**
 * Calculate date range around a given date
 * @param {string} dateString - Date string (yyyy-mm-dd)
 * @param {number} days - Number of days before and after
 * @returns {Object} Earlier and later dates
 */
function calculateDateRange(dateString, days) {
  const date = new Date(dateString);
  
  const earlier = new Date(date);
  earlier.setDate(earlier.getDate() - days);
  
  const later = new Date(date);
  later.setDate(later.getDate() + days);
  
  return {
    earlier: earlier.toISOString().split('T')[0],
    later: later.toISOString().split('T')[0]
  };
}

/**
 * Calculate growing season length in days
 * @param {string} lastFrostDate - Last frost date (yyyy-mm-dd)
 * @param {string} firstFrostDate - First frost date (yyyy-mm-dd)
 * @returns {number} Growing season length in days
 */
function calculateGrowingSeasonLength(lastFrostDate, firstFrostDate) {
  const lastFrost = new Date(lastFrostDate);
  const firstFrost = new Date(firstFrostDate);
  
  // Calculate difference in days
  const diffTime = firstFrost.getTime() - lastFrost.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Get temperature range for a zone
 * @param {string} zone - USDA hardiness zone
 * @returns {Object} Temperature range
 */
function getZoneTemperatureRange(zone) {
  // Try to find the zone in the hardiness zones data
  if (zone && hardinessZones.zones[zone]) {
    const zoneData = hardinessZones.zones[zone];
    return {
      min_f: zoneData.min_temp_f,
      min_c: zoneData.min_temp_c
    };
  }
  
  // Fallback to estimation based on zone number
  const baseZone = parseZoneNumber(zone);
  const minTemp = (baseZone - 1) * 10 - 60; // Zone 1 = -60°F, Zone 2 = -50°F, etc.
  
  return {
    min_f: minTemp,
    min_c: Math.round((minTemp - 32) * 5 / 9)
  };
}

/**
 * Get example cities for a zone
 * @param {string} zone - USDA hardiness zone
 * @returns {Array} Example cities
 */
function getZoneExamples(zone) {
  // Try to find the zone in the hardiness zones data
  if (zone && hardinessZones.zones[zone]) {
    return hardinessZones.zones[zone].examples;
  }
  
  return [];
}

/**
 * Get the optimal soil temperature range for a plant
 * @param {Object} plant - Plant data
 * @returns {Object} Temperature range
 */
function getOptimalSoilTemperature(plant) {
  // Default ranges based on plant type
  const defaultRanges = {
    'vegetable': { min: 60, max: 75 },
    'herb': { min: 65, max: 75 },
    'flower': { min: 55, max: 75 }
  };
  
  // Adjust based on temperature preference
  let tempAdjustment = 0;
  if (plant.preferences && plant.preferences.temperature) {
    if (plant.preferences.temperature === 'cool') {
      tempAdjustment = -15;
    } else if (plant.preferences.temperature === 'warm') {
      tempAdjustment = 10;
    }
  }
  
  // Get base range from plant type
  const baseRange = defaultRanges[plant.plant_type] || defaultRanges.vegetable;
  
  // Apply adjustment
  return {
    min: baseRange.min + tempAdjustment,
    max: baseRange.max + tempAdjustment,
    optimal: Math.floor((baseRange.min + baseRange.max) / 2) + tempAdjustment
  };
}

/**
 * Calculate planting suitability based on current conditions
 * @param {Object} plant - Plant data
 * @param {Object} weatherData - Weather data
 * @param {Object} zoneData - Zone data
 * @returns {Object} Suitability assessment
 */
function calculatePlantingSuitability(plant, weatherData, zoneData) {
  const soilTemp = weatherData.soil_temperature?.surface?.fahrenheit;
  const airTemp = weatherData.current_temp_f;
  const optimalTemp = getOptimalSoilTemperature(plant);
  
  if (!soilTemp || !airTemp || !optimalTemp) {
    return {
      suitable: false,
      score: 0,
      reason: 'Insufficient data to determine suitability'
    };
  }
  
  // Calculate temperature-based score (0-100)
  let tempScore = 0;
  if (soilTemp >= optimalTemp.min && soilTemp <= optimalTemp.max) {
    // Ideal range - score based on how close to optimal
    const distanceFromOptimal = Math.abs(soilTemp - optimalTemp.optimal);
    const rangeSize = (optimalTemp.max - optimalTemp.min) / 2;
    tempScore = 100 - (distanceFromOptimal / rangeSize) * 50;
  } else if (soilTemp < optimalTemp.min) {
    // Too cold - partial score based on how close to minimum
    const degreesBelow = optimalTemp.min - soilTemp;
    tempScore = Math.max(0, 50 - degreesBelow * 5);
  } else {
    // Too warm - partial score based on how close to maximum
    const degreesAbove = soilTemp - optimalTemp.max;
    tempScore = Math.max(0, 50 - degreesAbove * 5);
  }
  
  // Round the score
  tempScore = Math.round(tempScore);
  
  // Determine suitability text
  let suitable = false;
  let reason = '';
  
  if (tempScore >= 80) {
    suitable = true;
    reason = 'Ideal soil temperature for planting';
  } else if (tempScore >= 50) {
    suitable = true;
    reason = 'Acceptable soil temperature, but not optimal';
  } else if (soilTemp < optimalTemp.min) {
    suitable = false;
    reason = `Soil temperature too low (${soilTemp}°F vs. ${optimalTemp.min}°F minimum)`;
  } else {
    suitable = false;
    reason = `Soil temperature too high (${soilTemp}°F vs. ${optimalTemp.max}°F maximum)`;
  }
  
  return {
    suitable,
    score: tempScore,
    reason,
    soil_temp: soilTemp,
    optimal_range: optimalTemp
  };
}

/**
 * Calculate confidence rating based on data sources
 * @param {Object} zoneData - Zone data
 * @param {Object} weatherData - Weather data
 * @param {Object} regionInfo - Region info
 * @returns {number} Confidence rating (0-100)
 */
function calculateConfidenceRating(zoneData, weatherData, regionInfo) {
  let baseConfidence = 60; // Start with a moderate confidence
  
  // Add points based on data source reliability
  if (zoneData) {
    if (zoneData.source.includes('PHZMAPI.org')) {
      baseConfidence += 10; // High quality zone data
    } else if (zoneData.source.includes('Database')) {
      baseConfidence += 8; // Good quality zone data
    } else if (zoneData.source.includes('Estimated')) {
      baseConfidence += 2; // Estimated data
    }
  }
  
  if (weatherData) {
    if (weatherData.source.includes('Open-Meteo')) {
      baseConfidence += 10; // Real-time weather data
    } else if (weatherData.source.includes('OpenWeatherMap')) {
      baseConfidence += 10; // Real-time weather data
    } else if (weatherData.source.includes('Estimated')) {
      baseConfidence += 2; // Estimated data
    }
  }
  
  if (regionInfo) {
    if (regionInfo.source.includes('OpenWeatherMap')) {
      baseConfidence += 10; // High quality region data
    } else if (regionInfo.source.includes('Estimated')) {
      baseConfidence += 2; // Estimated data
    }
  }
  
  // Cap at 0-100
  return Math.min(100, Math.max(0, baseConfidence));
}

/**
 * Get current season based on latitude
 * @param {number} lat - Latitude
 * @returns {string} Current season
 */
function getCurrentSeason(lat) {
  const month = new Date().getMonth();
  const isNorthern = lat >= 0;
  
  if (isNorthern) {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  } else {
    if (month >= 2 && month <= 4) return 'fall';
    if (month >= 5 && month <= 7) return 'winter';
    if (month >= 8 && month <= 10) return 'spring';
    return 'summer';
  }
}

// Access data files
const path = require('path');
const fs = require('fs');
const hardinessZones = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/hardiness-zones.json')));