import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { fetchRawGardenateData, getPlantingMonths } from '../../utils/gardenateData';
import PlantDetails from './PlantDetails';

// Enhanced geolocation helpers
const getAccurateLocation = (callback) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accurateLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: 'device_gps',
          timestamp: new Date()
        };
        callback(accurateLocation);
      },
      (error) => {
        console.warn("Geolocation error:", error);
        // Fallback to IP-based location would go here
        callback(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    console.warn("Geolocation not supported");
    callback(null);
  }
};

const months = [
  'January', 'February', 'March', 'April', 
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

// Enhanced frost date calculation with multiple data sources
const getPrecisionFrostDates = (zoneInfo) => {
  // If we don't have zoneInfo, return null
  if (!zoneInfo) return null;
  
  // Get base frost dates from zoneInfo
  const baseFrostDates = {
    last_frost: new Date(zoneInfo.lastFrostDate),
    first_frost: new Date(zoneInfo.firstFrostDate)
  };
  
  // Calculate confidence based on available data
  let confidence = 0.7; // Default confidence
  
  // If we have multiple data sources, increase confidence
  if (zoneInfo.dataSources && zoneInfo.dataSources.length > 1) {
    confidence = Math.min(0.9, 0.7 + (zoneInfo.dataSources.length * 0.05));
  }
  
  // If we have microclimates, adjust the dates
  if (zoneInfo.microclimate) {
    const { elevation, slope, aspect, waterProximity } = zoneInfo.microclimate;
    
    // Calculate days to adjust based on microclimate
    let lastFrostAdjustment = 0;
    let firstFrostAdjustment = 0;
    
    // Adjust for elevation (higher = later spring frost, earlier fall frost)
    if (elevation) {
      const elevationAdjustment = Math.round(elevation / 100 * 1.5);
      lastFrostAdjustment += elevationAdjustment;
      firstFrostAdjustment -= elevationAdjustment;
    }
    
    // Adjust for slope and aspect
    if (slope && aspect) {
      // South-facing slopes warm earlier in spring
      if (aspect >= 135 && aspect <= 225 && slope > 5) {
        lastFrostAdjustment -= Math.round(slope / 5);
      }
      
      // North-facing slopes cool earlier in fall
      if ((aspect >= 315 || aspect <= 45) && slope > 5) {
        firstFrostAdjustment -= Math.round(slope / 5);
      }
    }
    
    // Adjust for water proximity (moderates temperatures)
    if (waterProximity && waterProximity < 3) {
      lastFrostAdjustment -= 3;
      firstFrostAdjustment += 7;
    }
    
    // Apply adjustments to dates
    if (lastFrostAdjustment !== 0) {
      baseFrostDates.last_frost.setDate(baseFrostDates.last_frost.getDate() + lastFrostAdjustment);
    }
    
    if (firstFrostAdjustment !== 0) {
      baseFrostDates.first_frost.setDate(baseFrostDates.first_frost.getDate() + firstFrostAdjustment);
    }
    
    // If we made microclimate adjustments, add to result
    baseFrostDates.microclimate_adjustments = {
      last_frost_days_adjusted: lastFrostAdjustment,
      first_frost_days_adjusted: firstFrostAdjustment
    };
  }
  
  return {
    ...baseFrostDates,
    confidence
  };
};

/**
 * Get planting months from Gardenate data
 * @param {Object} plant - Plant object with Gardenate data
 * @param {String} plantingType - Type of planting (indoor_seed, direct_sow, transplant)
 * @param {Object} zoneInfo - Zone information for the user's location
 * @returns {Array} Array of month numbers (0-11)
 */
const getGardenatePlantingMonths = (plant, plantingType, zoneInfo) => {
  if (!plant) return [];
  
  // First check if we have the new Gardenate data structure
  if (plant.zones && Array.isArray(plant.zones) && plant.zones.length > 0) {
    console.log("Using raw Gardenate data structure for", plant.name);
    
    // Determine the best matching zone based on user's location
    let zonePreference = ['Australia - temperate', 'Australia - sub-tropical', 'Australia - cool/mountain'];
    
    // If we have location information, prioritize the appropriate region
    if (zoneInfo && zoneInfo.country) {
      const country = zoneInfo.country.toLowerCase();
      console.log("Country from zoneInfo:", country); // Debug log
      
      if (country === 'gb' || country === 'uk' || country.includes('united kingdom') || country.includes('great britain')) {
        console.log("Using UK zones"); // Debug log
        zonePreference = [
          'United Kingdom - cool/temperate', 
          'United Kingdom - warm/temperate',
          'Australia - temperate' // Fallback
        ];
      } else if (country === 'nz' || country.includes('new zealand')) {
        console.log("Using NZ zones"); // Debug log
        zonePreference = [
          'New Zealand - temperate',
          'New Zealand - sub-tropical',
          'New Zealand - cool/mountain',
          'Australia - temperate' // Fallback
        ];
      } else if (country === 'au' || country.includes('australia')) {
        console.log("Using AU zones"); // Debug log
        // Keep the default Australian zones
        zonePreference = [
          'Australia - temperate',
          'Australia - sub-tropical',
          'Australia - cool/mountain',
          'Australia - tropical',
          'Australia - arid'
        ];
      }
    }
    
    console.log("Zone preference:", zonePreference); // Debug log
    
    // Find the best matching zone
    let bestZone = null;
    for (const zoneName of zonePreference) {
      const matchingZone = plant.zones.find(zone => zone.zone_name === zoneName);
      if (matchingZone) {
        bestZone = matchingZone;
        console.log("Found matching zone:", zoneName); // Debug log
        break;
      }
    }
    
    // If no preferred zone found, use any available zone
    if (!bestZone && plant.zones.length > 0) {
      bestZone = plant.zones[0];
      console.log("Using default zone:", bestZone.zone_name); // Debug log
    }
    
    if (!bestZone || !bestZone.data || !bestZone.data.monthly_calendar) {
      console.log("No valid calendar data found for", plant.name);
      return [];
    }
    
    // Map the monthly calendar to our format
    const monthlyCalendar = bestZone.data.monthly_calendar;
    const formattedCalendar = {
      indoor_seed: [],
      direct_sow: [],
      transplant: []
    };
    
    // Map month names to numbers (0-indexed)
    const monthMap = {
      'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
      'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
    };
    
    // Map Gardenate codes to our planting types
    const codeMapping = {
      'S': 'indoor_seed', // Plant undercover in seed trays
      'T': 'transplant',  // Transplant seedlings
      'P': 'direct_sow'   // Plant directly in the ground
    };
    
    // Process each month in the calendar
    for (const [month, codes] of Object.entries(monthlyCalendar)) {
      const monthNumber = monthMap[month.toLowerCase()];
      
      if (codes && Array.isArray(codes)) {
        codes.forEach(code => {
          const mappedType = codeMapping[code];
          if (mappedType && !formattedCalendar[mappedType].includes(monthNumber)) {
            formattedCalendar[mappedType].push(monthNumber);
          }
        });
      }
    }
    
    // Sort the month arrays for better display
    formattedCalendar.indoor_seed.sort((a, b) => a - b);
    formattedCalendar.direct_sow.sort((a, b) => a - b);
    formattedCalendar.transplant.sort((a, b) => a - b);
    
    console.log("Formatted calendar for", plant.name, ":", formattedCalendar);
    
    // Return the months for the requested planting type
    return formattedCalendar[plantingType] || [];
  }
  
  // Fall back to the old structure if the new one isn't available
  if (!plant.gardenate_data || !plant.gardenate_data.monthly_calendars) {
    return [];
  }

  // Determine the best matching zone based on user's location
  let zonePreference = ['Australia - temperate', 'Australia - sub-tropical', 'Australia - cool/mountain'];
  
  // If we have location information, prioritize the appropriate region
  if (zoneInfo && zoneInfo.country) {
    const country = zoneInfo.country.toLowerCase();
    console.log("Country from zoneInfo:", country); // Debug log
    
    if (country === 'gb' || country === 'uk' || country.includes('united kingdom') || country.includes('great britain')) {
      console.log("Using UK zones"); // Debug log
      zonePreference = [
        'United Kingdom - cool/temperate', 
        'United Kingdom - warm/temperate',
        'Australia - temperate' // Fallback
      ];
    } else if (country === 'nz' || country.includes('new zealand')) {
      console.log("Using NZ zones"); // Debug log
      zonePreference = [
        'New Zealand - temperate',
        'New Zealand - sub-tropical',
        'New Zealand - cool/mountain',
        'Australia - temperate' // Fallback
      ];
    } else if (country === 'au' || country.includes('australia')) {
      console.log("Using AU zones"); // Debug log
      // Keep the default Australian zones
      zonePreference = [
        'Australia - temperate',
        'Australia - sub-tropical',
        'Australia - cool/mountain',
        'Australia - tropical',
        'Australia - arid'
      ];
    }
  }
  
  console.log("Zone preference:", zonePreference); // Debug log
  
  let bestCalendar = null;

  // First try preferred zones
  for (const zoneName of zonePreference) {
    if (plant.gardenate_data.monthly_calendars[zoneName]) {
      bestCalendar = plant.gardenate_data.monthly_calendars[zoneName].calendar;
      console.log("Found calendar for zone:", zoneName); // Debug log
      break;
    }
  }

  // If no preferred zone found, use any available calendar
  if (!bestCalendar) {
    for (const zoneName in plant.gardenate_data.monthly_calendars) {
      if (plant.gardenate_data.monthly_calendars[zoneName].calendar) {
        bestCalendar = plant.gardenate_data.monthly_calendars[zoneName].calendar;
        break;
      }
    }
  }

  // Return the months for the requested planting type
  return bestCalendar && bestCalendar[plantingType] ? bestCalendar[plantingType] : [];
};

/**
 * Generate planting calendar data for a plant
 * @param {Object} plant - Plant object
 * @param {Object} zoneInfo - Zone information
 * @returns {Object} Calendar data for the plant
 */
const generatePlantCalendarData = async (plant, zoneInfo) => {
  if (!plant) return null;

  console.log("Generating calendar data for plant:", plant.name);
  console.log("Zone info:", zoneInfo);

  // Try to fetch raw Gardenate data
  const rawGardenateData = await fetchRawGardenateData(plant.name);
  console.log("Raw Gardenate data for", plant.name, ":", rawGardenateData ? "Found" : "Not found");
  
  if (rawGardenateData) {
    console.log("Data structure:", Object.keys(rawGardenateData));
    if (rawGardenateData.zones) {
      console.log(`Found ${rawGardenateData.zones.length} zones`);
      console.log("Zone names:", rawGardenateData.zones.map(zone => zone.zone_name));
    }
  }

  // Create the calendar data object
  const calendarData = {
    indoor_seed: [],
    direct_sow: [],
    transplant: [],
    harvest: []
  };

  // If we have raw Gardenate data, use it
  if (rawGardenateData) {
    console.log("Using raw Gardenate data for", plant.name);
    calendarData.indoor_seed = getPlantingMonths(rawGardenateData, 'indoor_seed', zoneInfo);
    calendarData.direct_sow = getPlantingMonths(rawGardenateData, 'direct_sow', zoneInfo);
    calendarData.transplant = getPlantingMonths(rawGardenateData, 'transplant', zoneInfo);
    
    console.log("Calendar data from Gardenate:", {
      indoor_seed: calendarData.indoor_seed,
      direct_sow: calendarData.direct_sow,
      transplant: calendarData.transplant
    });
  } else {
    // Fall back to the database data
    console.log("Falling back to database data for", plant.name);
    calendarData.indoor_seed = getGardenatePlantingMonths(plant, 'indoor_seed', zoneInfo);
    calendarData.direct_sow = getGardenatePlantingMonths(plant, 'direct_sow', zoneInfo);
    calendarData.transplant = getGardenatePlantingMonths(plant, 'transplant', zoneInfo);
    
    console.log("Calendar data from database:", {
      indoor_seed: calendarData.indoor_seed,
      direct_sow: calendarData.direct_sow,
      transplant: calendarData.transplant
    });
  }
  
  // Calculate harvest months based on planting months and days to maturity
  if (plant.daysToMaturity) {
    const daysToMaturity = parseInt(plant.daysToMaturity);
    console.log(`Days to maturity for ${plant.name}: ${daysToMaturity}`);
    
    if (!isNaN(daysToMaturity)) {
      // Combine all planting months
      const allPlantingMonths = [
        ...calendarData.indoor_seed,
        ...calendarData.direct_sow,
        ...calendarData.transplant
      ];
      
      // Remove duplicates
      const uniquePlantingMonths = [...new Set(allPlantingMonths)];
      
      console.log("Unique planting months:", uniquePlantingMonths);
      console.log("Days to maturity:", daysToMaturity);
      
      // Calculate harvest months (approximately)
      const harvestMonths = uniquePlantingMonths.map(month => {
        // Roughly convert days to months (30 days per month)
        const monthsToMaturity = Math.ceil(daysToMaturity / 30);
        console.log(`For planting month ${month}, months to maturity: ${monthsToMaturity}`);
        
        // Calculate harvest month (handle wrapping around to next year)
        return (month + monthsToMaturity) % 12;
      });
      
      // Add unique harvest months
      harvestMonths.forEach(month => {
        if (!calendarData.harvest.includes(month)) {
          calendarData.harvest.push(month);
          console.log(`Added harvest month: ${month}`);
        }
      });
      
      // Sort harvest months
      calendarData.harvest.sort((a, b) => a - b);
      
      console.log("Calculated harvest months:", calendarData.harvest);
    } else {
      console.log(`Invalid days to maturity for ${plant.name}: ${plant.daysToMaturity}`);
    }
  } else {
    console.log(`No days to maturity data for ${plant.name}`);
  }
  
  console.log("Final calendar data for", plant.name, ":", calendarData);
  return calendarData;
};

const PlantingCalendar = ({ zoneInfo, selectedPlants, weatherData, onExportCalendar, isMobile = false }) => {
  const [activeMonth, setActiveMonth] = useState(null);
  const [activeDetails, setActiveDetails] = useState(null);
  const [precisionFrostDates, setPrecisionFrostDates] = useState(null);
  const [locationData, setLocationData] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [confidenceRating, setConfidenceRating] = useState(0.7); // Default confidence
  const [plantCalendarData, setPlantCalendarData] = useState({});
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);
  
  // Create a ref for the calendar container for PDF export
  const calendarRef = useRef(null);
  
  // Initialize precision frost dates and location data when component mounts
  useEffect(() => {
    // Calculate precision frost dates from zoneInfo
    if (zoneInfo) {
      const frostDates = getPrecisionFrostDates(zoneInfo);
      setPrecisionFrostDates(frostDates);
      setConfidenceRating(frostDates?.confidence || 0.7);
    }
    
    // Try to get accurate location if not already available
    if (zoneInfo?.location) {
      getAccurateLocation((coords) => {
        setLocationData(coords);
      });
    } else if (zoneInfo?.coordinates) {
      setLocationData(zoneInfo.coordinates);
    }
  }, [zoneInfo, locationData]);

  // Load calendar data for selected plants
  useEffect(() => {
    const loadCalendarData = async () => {
      const calendarDataMap = {};
      
      for (const plant of selectedPlants) {
        if (plant && plant.name) {
          try {
            const data = await generatePlantCalendarData(plant, zoneInfo);
            calendarDataMap[plant.id || plant._id || plant.name] = data;
          } catch (error) {
            console.error(`Error generating calendar data for ${plant.name}:`, error);
          }
        }
      }
      
      setPlantCalendarData(calendarDataMap);
    };
    
    if (selectedPlants && selectedPlants.length > 0 && zoneInfo) {
      loadCalendarData();
    }
  }, [selectedPlants, zoneInfo]);
  
  // Calculate planting dates for each plant based on zone with enhanced precision
  const calculatePlantingDates = (plant) => {
    // Default values
    let indoorStart = null;
    let indoorEnd = null;
    let outdoorStart = null;
    let outdoorEnd = null;
    // Initialize confidence with a default value
    let confidence = 0.7; // Default confidence rating
    
    // Debug output - you can see this in browser console
    console.log(`Calculating dates for ${plant.name} (${plant.type || 'unknown type'})`);
    
    // Determine which frost dates to use - prefer precision frost dates if available
    const frostDates = precisionFrostDates || (zoneInfo ? {
      last_frost: new Date(zoneInfo.lastFrostDate),
      first_frost: new Date(zoneInfo.firstFrostDate)
    } : null);
    
    // If we don't have frost dates, we can't calculate accurate planting dates
    if (!frostDates) {
      console.warn(`No frost dates available for ${plant.name}`);
      confidence = 0.4; // Lower confidence when using fallback data
    }
    
    // Use plant data if it's in our standard format from the API
    // This would be the preferred method when the API provides this data
    if (plant.growingCalendar || plant.growing_calendar) {
      const calendar = plant.growingCalendar || plant.growing_calendar;
      
      // Try to extract planting windows from API data
      if (calendar) {
        console.log(`Using API calendar data for ${plant.name}`);
        confidence = Math.min(0.95, confidence + 0.1); // Increase confidence with specific plant data
        
        // Extract indoor seed starting dates if available
        if (calendar.indoor_seed_start && calendar.indoor_seed_start.weeks_before_last_frost && frostDates) {
          // Calculate indoor start dates based on frost dates
          const weeksBefore = calendar.indoor_seed_start.weeks_before_last_frost;
          const lastFrost = frostDates.last_frost;
          
          const indoorStartDate = new Date(lastFrost);
          indoorStartDate.setDate(lastFrost.getDate() - (weeksBefore * 7));
          indoorStart = indoorStartDate.getMonth();
          
          // Indoor end is typically 2-3 weeks before last frost
          const indoorEndDate = new Date(lastFrost);
          indoorEndDate.setDate(lastFrost.getDate() - 14); // 2 weeks before last frost
          indoorEnd = indoorEndDate.getMonth();
          
          // If seed starting needs a specific soil temperature, refine the date
          if (plant.growing_requirements?.soil_temperature?.min) {
            const minSoilTemp = plant.growing_requirements.soil_temperature.min;
            // Here we would check soil temperature data and potentially adjust
            console.log(`${plant.name} requires min soil temp of ${minSoilTemp}°F`);
          }
        }
        
        // Extract direct sowing dates if available
        if (calendar.direct_sow && frostDates) {
          if (calendar.direct_sow.spring) {
            const lastFrost = frostDates.last_frost;
            const weeksFromFrost = calendar.direct_sow.spring.weeks_from_last_frost || 0;
            
            const outdoorStartDate = new Date(lastFrost);
            outdoorStartDate.setDate(lastFrost.getDate() + (weeksFromFrost * 7));
            outdoorStart = outdoorStartDate.getMonth();
            
            // Default to growing until 2 weeks before first frost
            const firstFrost = frostDates.first_frost;
            const outdoorEndDate = new Date(firstFrost);
            outdoorEndDate.setDate(firstFrost.getDate() - 14); // 2 weeks before first frost
            outdoorEnd = outdoorEndDate.getMonth();
            
            // Check if the growing season makes sense
            const growingDays = (outdoorEndDate - outdoorStartDate) / (1000 * 60 * 60 * 24);
            
            // If days to maturity is provided, use it to validate the growing window
            if (plant.days_to_maturity && plant.days_to_maturity.max) {
              if (growingDays < plant.days_to_maturity.max) {
                console.warn(`Growing season for ${plant.name} may be too short (${growingDays} days)`);
                confidence = Math.max(0.5, confidence - 0.1); // Reduce confidence slightly
              }
            }
          }
          
          // Add fall planting if applicable
          if (calendar.direct_sow.fall && frostDates) {
            const firstFrost = frostDates.first_frost;
            const weeksBeforeFirstFrost = calendar.direct_sow.fall.weeks_before_first_frost || 8;
            
            // For fall plantings we use the first frost date
            const fallStartDate = new Date(firstFrost);
            fallStartDate.setDate(firstFrost.getDate() - (weeksBeforeFirstFrost * 7));
            
            // If we don't already have an outdoor start date or it's later than the fall date,
            // use the fall planting date
            if (outdoorStart === null || outdoorStart > fallStartDate.getMonth()) {
              outdoorStart = fallStartDate.getMonth();
            }
          }
        }
        
        // Extract transplant dates if available (for indoor-started plants)
        if (calendar.transplant && !outdoorStart && frostDates) {
          if (calendar.transplant.weeks_after_last_frost) {
            const lastFrost = frostDates.last_frost;
            const weeksAfter = calendar.transplant.weeks_after_last_frost;
            
            const outdoorStartDate = new Date(lastFrost);
            outdoorStartDate.setDate(lastFrost.getDate() + (weeksAfter * 7));
            outdoorStart = outdoorStartDate.getMonth();
            
            // Default to growing until 2 weeks before first frost
            const firstFrost = frostDates.first_frost;
            const outdoorEndDate = new Date(firstFrost);
            outdoorEndDate.setDate(firstFrost.getDate() - 14); // 2 weeks before first frost
            outdoorEnd = outdoorEndDate.getMonth();
          }
        }
        
        // If we've calculated dates from API data, return them
        if (indoorStart !== null || outdoorStart !== null) {
          console.log(`${plant.name} - API data calculated planting dates:`, {
            indoorStart: indoorStart !== null ? months[indoorStart] : 'None',
            indoorEnd: indoorEnd !== null ? months[indoorEnd] : 'None',
            outdoorStart: outdoorStart !== null ? months[outdoorStart] : 'None',
            outdoorEnd: outdoorEnd !== null ? months[outdoorEnd] : 'None',
            confidence: confidence.toFixed(2)
          });
          return { 
            indoorStart, 
            indoorEnd, 
            outdoorStart, 
            outdoorEnd,
            confidence: confidence
          };
        }
      }
    }
    
    // Fallback to hardcoded values based on plant type and name
    console.log(`${plant.name} (${plant.type || 'unknown'}) - Using hardcoded planting windows`);
    
    // Custom indoor/outdoor dates based on plant type
    const type = (plant.type || '').toLowerCase();
    
    if (type === 'vegetable') {
      const name = plant.name.toLowerCase();
      
      // Different vegetables have different planting times
      if (name.includes('tomato') || name.includes('pepper') || name.includes('eggplant')) {
        // Warm season crops typically started indoors Feb-Apr
        indoorStart = 1; // February
        indoorEnd = 3;   // April
        outdoorStart = 4; // May
        outdoorEnd = 8;   // September
      }
      else if (name.includes('lettuce') || name.includes('kale') || name.includes('cabbage') || 
              name.includes('broccoli') || name.includes('cauliflower')) {
        // Cool season crops typically started indoors Jan-Mar
        indoorStart = 0; // January
        indoorEnd = 2;   // March
        outdoorStart = 2; // March
        outdoorEnd = 4;   // May (spring planting)
      }
      else if (name.includes('cucumber') || name.includes('zucchini') || 
              name.includes('squash') || name.includes('melon')) {
        // Tender plants typically started indoors Apr-May
        indoorStart = 3; // April
        indoorEnd = 4;   // May
        outdoorStart = 4; // May
        outdoorEnd = 8;   // September
      }
      else if (name.includes('bean') || name.includes('pea')) {
        // Direct sow cool season legumes
        indoorStart = null; // Direct sow only
        outdoorStart = 3; // April
        outdoorEnd = 5;   // June
      }
      else if (name.includes('beet') || name.includes('carrot') || 
               name.includes('radish') || name.includes('turnip')) {
        // Root vegetables
        indoorStart = null; // Direct sow only
        outdoorStart = 2; // March
        outdoorEnd = 7;   // August (succession planting)
      }
      else {
        // Generic vegetable
        indoorStart = 1; // February 
        indoorEnd = 3;   // April
        outdoorStart = 4; // May
        outdoorEnd = 7;   // August
      }
    } 
    // Add indoor seed starting info for herbs
    else if (type === 'herb') {
      const name = plant.name.toLowerCase();
      if (name.includes('basil') || name.includes('oregano') || 
          name.includes('thyme') || name.includes('parsley')) {
        indoorStart = 1; // February
        indoorEnd = 3;   // April
        outdoorStart = 4; // May
        outdoorEnd = 8;   // September
      }
      else if (name.includes('cilantro') || name.includes('dill')) {
        indoorStart = 2; // March
        indoorEnd = 3;   // April
        outdoorStart = 3; // April
        outdoorEnd = 6;   // July
      }
      else {
        // Generic herb
        indoorStart = 2; // March
        indoorEnd = 3;   // April
        outdoorStart = 4; // May
        outdoorEnd = 7;   // August
      }
    }
    // Add indoor seed starting for flowers
    else if (type === 'flower') {
      const name = plant.name.toLowerCase();
      if (name.includes('sunflower') || name.includes('zinnia') || 
          name.includes('marigold')) {
        indoorStart = 2; // March
        indoorEnd = 3;   // April
        outdoorStart = 4; // May
        outdoorEnd = 6;   // July
      }
      else {
        // Generic flower
        indoorStart = 1; // February
        indoorEnd = 3;   // April
        outdoorStart = 4; // May
        outdoorEnd = 6;   // July
      }
    } 
    // Default for any unknown plant type
    else {
      // Most conservative growing window
      indoorStart = 2; // March
      indoorEnd = 3;   // April
      outdoorStart = 4; // May
      outdoorEnd = 7;   // August
    }
    
    // Now, if we have frost dates, we can refine these dates
    if (frostDates) {
      // Get frost date months
      const lastFrostMonth = frostDates.last_frost.getMonth();
      const firstFrostMonth = frostDates.first_frost.getMonth();
      
      confidence = Math.min(0.92, confidence + 0.05); // Slight boost when we have frost dates
      
      // Enhanced data based on plant name for more specific sowing windows
      // This provides more realistic and useful data per plant
      const plantSpecificData = getPlantSpecificData(plant.name, plant.type);
      
      if (plantSpecificData) {
        console.log(`Found specific frost-based data for ${plant.name}`);
        confidence = Math.min(0.95, confidence + 0.1); // Further confidence boost with specific plant data
        
        // Only apply specific data if we have valid values
        if (indoorStart !== null && plantSpecificData.indoorStartOffset !== undefined) {
          // Calculate adjusted indoor start date based on frost date
          let adjustedIndoorStart = Math.floor(lastFrostMonth + plantSpecificData.indoorStartOffset);
          if (adjustedIndoorStart < 0) adjustedIndoorStart = (adjustedIndoorStart + 12) % 12;
          else adjustedIndoorStart = adjustedIndoorStart % 12;
          
          console.log(`  Adjusting indoor start for ${plant.name} from ${months[indoorStart]} to ${months[adjustedIndoorStart]}`);
          indoorStart = adjustedIndoorStart;
          
          // Only adjust indoor end if we have a valid offset
          if (plantSpecificData.indoorEndOffset !== undefined) {
            let adjustedIndoorEnd = Math.floor(lastFrostMonth + plantSpecificData.indoorEndOffset);
            if (adjustedIndoorEnd < 0) adjustedIndoorEnd = (adjustedIndoorEnd + 12) % 12;
            else adjustedIndoorEnd = adjustedIndoorEnd % 12;
            
            console.log(`  Adjusting indoor end for ${plant.name} from ${indoorEnd !== null ? months[indoorEnd] : 'none'} to ${months[adjustedIndoorEnd]}`);
            indoorEnd = adjustedIndoorEnd;
          }
        }
        
        // Adjust outdoor dates based on frost dates
        if (outdoorStart !== null && plantSpecificData.outdoorStartOffset !== undefined) {
          let adjustedOutdoorStart = Math.floor(lastFrostMonth + plantSpecificData.outdoorStartOffset);
          if (adjustedOutdoorStart < 0) adjustedOutdoorStart = (adjustedOutdoorStart + 12) % 12;
          else adjustedOutdoorStart = adjustedOutdoorStart % 12;
          
          console.log(`  Adjusting outdoor start for ${plant.name} from ${months[outdoorStart]} to ${months[adjustedOutdoorStart]}`);
          outdoorStart = adjustedOutdoorStart;
          
          // Only adjust outdoor end if we have a valid offset
          if (plantSpecificData.outdoorEndOffset !== undefined) {
            let adjustedOutdoorEnd = Math.floor(firstFrostMonth + plantSpecificData.outdoorEndOffset);
            if (adjustedOutdoorEnd < 0) adjustedOutdoorEnd = (adjustedOutdoorEnd + 12) % 12;
            else adjustedOutdoorEnd = adjustedOutdoorEnd % 12;
            
            console.log(`  Adjusting outdoor end for ${plant.name} from ${outdoorEnd !== null ? months[outdoorEnd] : 'none'} to ${months[adjustedOutdoorEnd]}`);
            outdoorEnd = adjustedOutdoorEnd;
          }
        }
      }
      
      // Handle case where indoorEnd is earlier in the year than indoorStart
      // For example, if indoorStart is November (10) and indoorEnd is January (0)
      if (indoorStart !== null && indoorEnd !== null && indoorStart > indoorEnd) {
        console.log(`Fixing wrap-around for ${plant.name}: Indoor start ${months[indoorStart]} > end ${months[indoorEnd]}`);
        // If indoor end month is earlier in the year than start, we're crossing January
        indoorEnd += 12;
      }
      
      // Same for outdoor planting period
      if (outdoorStart !== null && outdoorEnd !== null && outdoorStart > outdoorEnd) {
        console.log(`Fixing wrap-around for ${plant.name}: Outdoor start ${months[outdoorStart]} > end ${months[outdoorEnd]}`);
        outdoorEnd += 12;
      }
      
      // Apply weather data adjustments if available
      if (weatherData) {
        // More sophisticated weather adjustment
        let temperatureAdjustment = 0;
        
        // Check for temperature anomalies
        if (weatherData.averageTemp && weatherData.historicalAverage) {
          const tempDiff = weatherData.averageTemp - weatherData.historicalAverage;
          
          // Significant cold
          if (tempDiff < -5) {
            temperatureAdjustment = 0.5; // Delay planting by about 2 weeks
            console.log(`  Weather is significantly colder than normal (${tempDiff.toFixed(1)}°F)`);
          } 
          // Moderate cold
          else if (tempDiff < -2) {
            temperatureAdjustment = 0.25; // Delay planting by about 1 week
            console.log(`  Weather is colder than normal (${tempDiff.toFixed(1)}°F)`);
          }
          // Significant warmth
          else if (tempDiff > 5) {
            temperatureAdjustment = -0.5; // Advance planting by about 2 weeks
            console.log(`  Weather is significantly warmer than normal (${tempDiff.toFixed(1)}°F)`);
          }
          // Moderate warmth
          else if (tempDiff > 2) {
            temperatureAdjustment = -0.25; // Advance planting by about 1 week
            console.log(`  Weather is warmer than normal (${tempDiff.toFixed(1)}°F)`);
          }
        }
        
        // Apply soil temperature adjustments if available
        if (weatherData.soilTemperature && plant.growing_requirements?.soil_temperature?.min) {
          const minSoilTemp = plant.growing_requirements.soil_temperature.min;
          const currentSoilTemp = weatherData.soilTemperature.surface?.fahrenheit;
          
          if (currentSoilTemp) {
            const soilTempDiff = currentSoilTemp - minSoilTemp;
            
            // Soil too cold
            if (soilTempDiff < -5) {
              // Further delay planting
              temperatureAdjustment += 0.25;
              console.log(`  Soil temperature too cold for ${plant.name} (${currentSoilTemp}°F vs ${minSoilTemp}°F needed)`);
            }
            // Soil perfect
            else if (soilTempDiff >= 0 && soilTempDiff < 10) {
              // Optimal conditions, slightly advance planting
              temperatureAdjustment -= 0.1;
              console.log(`  Soil temperature ideal for ${plant.name} (${currentSoilTemp}°F)`);
            }
          }
        }
        
        // Apply the calculated temperature adjustment to outdoor dates
        if (temperatureAdjustment !== 0 && outdoorStart !== null) {
          // eslint-disable-next-line no-unused-vars
          const oldOutdoorStart = outdoorStart;
          const adjustedOutdoorStart = (outdoorStart + temperatureAdjustment + 12) % 12;
          
          // Only adjust the month if it's actually changing
          if (Math.floor(adjustedOutdoorStart) !== Math.floor(outdoorStart)) {
            console.log(`  Weather adjustment: Moving ${plant.name} outdoor start from ${months[Math.floor(outdoorStart)]} to ${months[Math.floor(adjustedOutdoorStart)]}`);
            outdoorStart = Math.floor(adjustedOutdoorStart);
          }
        }
      }
    } else {
      // If frost dates are missing, ensure we still have some reasonable planting data
      console.warn(`Using fallback date ranges for ${plant.name} due to missing frost data`);
      confidence = Math.max(0.4, confidence - 0.2); // Reduce confidence with fallback data
      
      if (outdoorStart === null) {
        outdoorStart = 4; // May
      }
      if (outdoorEnd === null) {
        outdoorEnd = 7;   // August
      }
    }
    
    // Debug output of the calculated dates with month names for clarity
    console.log(`${plant.name} - FINAL Planting dates (${(confidence * 100).toFixed(0)}% confidence):`, {
      indoorStart: indoorStart !== null ? months[indoorStart] : 'None',
      indoorEnd: indoorEnd !== null ? (indoorEnd >= 12 ? months[indoorEnd % 12] + ' (next year)' : months[indoorEnd]) : 'None',
      outdoorStart: outdoorStart !== null ? months[outdoorStart] : 'None', 
      outdoorEnd: outdoorEnd !== null ? (outdoorEnd >= 12 ? months[outdoorEnd % 12] + ' (next year)' : months[outdoorEnd]) : 'None'
    });
    
    return {
      indoorStart,
      indoorEnd,
      outdoorStart,
      outdoorEnd,
      confidence: confidence
    };
  };
  
  // Helper function to provide specific data for common plants
  const getPlantSpecificData = (plantName, plantType) => {
    // Normalized plant name for matching
    const normalizedName = plantName.toLowerCase();
    
    const specificData = {
      // Vegetables
      "tomato": {
        indoorStartOffset: -2.5, // 10 weeks before last frost
        indoorEndOffset: -0.5,   // 2 weeks before last frost
        outdoorStartOffset: 0.5,  // 2 weeks after last frost
        outdoorEndOffset: -2,     // 2 months before first frost
      },
      "roma": {  // Roma tomato
        indoorStartOffset: -2.5, // 10 weeks before last frost
        indoorEndOffset: -0.5,   // 2 weeks before last frost
        outdoorStartOffset: 0.5,  // 2 weeks after last frost
        outdoorEndOffset: -2,     // 2 months before first frost
      },
      "brandywine": {  // Brandywine tomato (heirloom)
        indoorStartOffset: -2.5, // 10 weeks before last frost
        indoorEndOffset: -0.5,   // 2 weeks before last frost
        outdoorStartOffset: 0.5,  // 2 weeks after last frost
        outdoorEndOffset: -2,     // 2 months before first frost
      },
      "cherry tomato": {
        indoorStartOffset: -2, // 8 weeks before last frost
        indoorEndOffset: -0.5, // 2 weeks before last frost
        outdoorStartOffset: 0.5, // 2 weeks after last frost
        outdoorEndOffset: -1.5, // 6 weeks before first frost
      },
      "pepper": {
        indoorStartOffset: -3,    // 12 weeks before last frost
        indoorEndOffset: -0.5,    // 2 weeks before last frost
        outdoorStartOffset: 0.5,   // 2 weeks after last frost
        outdoorEndOffset: -1.5,    // 6 weeks before first frost
      },
      "bell pepper": {
        indoorStartOffset: -3,    // 12 weeks before last frost
        indoorEndOffset: -0.5,    // 2 weeks before last frost
        outdoorStartOffset: 0.5,   // 2 weeks after last frost
        outdoorEndOffset: -1.5,    // 6 weeks before first frost
      },
      "chili": {
        indoorStartOffset: -2.75, // 11 weeks before last frost
        indoorEndOffset: -0.5,    // 2 weeks before last frost
        outdoorStartOffset: 0.5,   // 2 weeks after last frost
        outdoorEndOffset: -1.25,   // 5 weeks before first frost
      },
      "lettuce": {
        indoorStartOffset: -1,    // 4 weeks before last frost
        indoorEndOffset: 0,       // up to last frost
        outdoorStartOffset: -0.5,  // 2 weeks before last frost (cool season crop)
        outdoorEndOffset: -3,      // stops in hot weather, then can restart
      },
      "buttercrunch": {  // Buttercrunch lettuce
        indoorStartOffset: -1,    // 4 weeks before last frost
        indoorEndOffset: 0,       // up to last frost
        outdoorStartOffset: -0.5,  // 2 weeks before last frost
        outdoorEndOffset: -3,      // stops in hot weather
      },
      "kale": {
        indoorStartOffset: -1.5,  // 6 weeks before last frost
        indoorEndOffset: -0.25,   // 1 week before last frost
        outdoorStartOffset: -0.25, // 1 week before last frost
        outdoorEndOffset: 0,       // can survive frost
      },
      "lacinato": {  // Lacinato/Dinosaur kale
        indoorStartOffset: -1.5,  // 6 weeks before last frost
        indoorEndOffset: -0.25,   // 1 week before last frost
        outdoorStartOffset: -0.25, // 1 week before last frost
        outdoorEndOffset: 0.25,    // can survive after first frost
      },
      "peas": {
        indoorStartOffset: -1,    // 4 weeks before last frost
        indoorEndOffset: -0.25,   // 1 week before last frost
        outdoorStartOffset: -0.75, // 3 weeks before last frost
        outdoorEndOffset: -3,      // doesn't do well in heat
      },
      "sugar snap": {  // Sugar snap peas
        indoorStartOffset: -1,    // 4 weeks before last frost
        indoorEndOffset: -0.25,   // 1 week before last frost
        outdoorStartOffset: -0.75, // 3 weeks before last frost
        outdoorEndOffset: -3,      // doesn't do well in heat
      },
      "cucumber": {
        indoorStartOffset: -1,    // 4 weeks before last frost
        indoorEndOffset: -0.25,   // 1 week before last frost
        outdoorStartOffset: 0.25,  // 1 week after last frost
        outdoorEndOffset: -2,      // 2 months before first frost
      },
      "marketmore": {  // Marketmore cucumber
        indoorStartOffset: -1,    // 4 weeks before last frost
        indoorEndOffset: -0.25,   // 1 week before last frost
        outdoorStartOffset: 0.25,  // 1 week after last frost
        outdoorEndOffset: -2,      // 2 months before first frost
      },
      "beet": {
        indoorStartOffset: -1,    // 4 weeks before last frost
        indoorEndOffset: -0.25,   // 1 week before last frost
        outdoorStartOffset: -0.5,  // 2 weeks before last frost
        outdoorEndOffset: -2,      // 2 months before first frost
      },
      "detroit": {  // Detroit Dark Red beet
        indoorStartOffset: -1,    // 4 weeks before last frost
        indoorEndOffset: -0.25,   // 1 week before last frost
        outdoorStartOffset: -0.5,  // 2 weeks before last frost
        outdoorEndOffset: -1.5,    // 6 weeks before first frost
      },
      
      // Herbs
      "basil": {
        indoorStartOffset: -1.5,  // 6 weeks before last frost
        indoorEndOffset: 0,       // until last frost
        outdoorStartOffset: 0.25,  // 1 week after last frost
        outdoorEndOffset: -0.5,    // 2 weeks before first frost
      },
      "genovese": {  // Genovese basil
        indoorStartOffset: -1.5,  // 6 weeks before last frost
        indoorEndOffset: 0,       // until last frost
        outdoorStartOffset: 0.25,  // 1 week after last frost
        outdoorEndOffset: -0.5,    // 2 weeks before first frost
      },
      "cilantro": {
        indoorStartOffset: -1,    // 4 weeks before last frost
        indoorEndOffset: 0,       // until last frost
        outdoorStartOffset: -0.5,  // 2 weeks before last frost
        outdoorEndOffset: -3,      // bolts in hot weather
      },
      "coriander": {  // Same as cilantro
        indoorStartOffset: -1,    // 4 weeks before last frost
        indoorEndOffset: 0,       // until last frost
        outdoorStartOffset: -0.5,  // 2 weeks before last frost
        outdoorEndOffset: -3,      // bolts in hot weather
      },
      "rosemary": {
        indoorStartOffset: -3,    // 12 weeks before last frost
        indoorEndOffset: -0.25,   // 1 week before last frost
        outdoorStartOffset: 0.5,   // 2 weeks after last frost
        outdoorEndOffset: -1,      // 4 weeks before first frost
      },
      "tuscan": {  // Tuscan rosemary
        indoorStartOffset: -3,    // 12 weeks before last frost
        indoorEndOffset: -0.25,   // 1 week before last frost
        outdoorStartOffset: 0.5,   // 2 weeks after last frost
        outdoorEndOffset: -1,      // 4 weeks before first frost
      },
      "mint": {
        indoorStartOffset: -2,    // 8 weeks before last frost
        indoorEndOffset: 0,       // until last frost
        outdoorStartOffset: 0,     // at last frost
        outdoorEndOffset: 0,       // perennial, survives frost
      },
      "spearmint": {  // Spearmint
        indoorStartOffset: -2,    // 8 weeks before last frost
        indoorEndOffset: 0,       // until last frost
        outdoorStartOffset: 0,     // at last frost
        outdoorEndOffset: 0,       // perennial, survives frost
      },
      
      // Flowers
      "zinnia": {
        indoorStartOffset: -1.5,  // 6 weeks before last frost
        indoorEndOffset: -0.25,   // 1 week before last frost
        outdoorStartOffset: 0,     // at last frost
        outdoorEndOffset: -2,      // 2 months before first frost
      },
      "california": {  // California Giant zinnia
        indoorStartOffset: -1.5,  // 6 weeks before last frost
        indoorEndOffset: -0.25,   // 1 week before last frost
        outdoorStartOffset: 0,     // at last frost
        outdoorEndOffset: -2,      // 2 months before first frost
      },
      "sunflower": {
        indoorStartOffset: -1,    // 4 weeks before last frost
        indoorEndOffset: -0.25,   // 1 week before last frost
        outdoorStartOffset: 0.25,  // 1 week after last frost
        outdoorEndOffset: -2,      // 2 months before first frost
      },
      "mammoth": {  // Mammoth sunflower
        indoorStartOffset: -1,    // 4 weeks before last frost
        indoorEndOffset: -0.25,   // 1 week before last frost
        outdoorStartOffset: 0.25,  // 1 week after last frost
        outdoorEndOffset: -2,      // 2 months before first frost
      },
      "marigold": {
        indoorStartOffset: -1.5,  // 6 weeks before last frost
        indoorEndOffset: -0.25,   // 1 week before last frost
        outdoorStartOffset: 0,     // at last frost
        outdoorEndOffset: -1.5,    // 6 weeks before first frost
      },
      "french": {  // French marigold
        indoorStartOffset: -1.5,  // 6 weeks before last frost
        indoorEndOffset: -0.25,   // 1 week before last frost
        outdoorStartOffset: 0,     // at last frost
        outdoorEndOffset: -1.5,    // 6 weeks before first frost
      },
    };
    
    // Check for matches based on plant name containing key words
    for (const [key, data] of Object.entries(specificData)) {
      if (normalizedName.includes(key)) {
        return data;
      }
    }
    
    // No specific data found
    return null;
  };
  
  // Determine the CSS class for a calendar cell
  // eslint-disable-next-line no-unused-vars
  const getCellClass = (plant, monthIndex) => {
    if (!plant || !plant.id) {
      console.log("No plant data for cell class");
      return '';
    }
    
    // Get the calendar data for this plant
    const calData = plantCalendarData[plant.id];
    if (!calData) {
      console.log(`No calendar data for plant ${plant.name} (ID: ${plant.id})`);
      return '';
    }
    
    console.log(`Checking cell class for ${plant.name}, month ${monthIndex}:`, calData);
    
    // Check if this month is for indoor seeding
    const hasIndoor = calData.indoor_seed && calData.indoor_seed.includes(monthIndex);
    
    // Check if this month is for direct sowing or transplanting
    const hasDirectSow = calData.direct_sow && calData.direct_sow.includes(monthIndex);
    const hasTransplant = calData.transplant && calData.transplant.includes(monthIndex);
    const hasOutdoor = hasDirectSow || hasTransplant;
    
    // Check if this month is for harvesting
    const hasHarvest = calData.harvest && calData.harvest.includes(monthIndex);
    
    console.log(`Month ${monthIndex} for ${plant.name}: indoor=${hasIndoor}, outdoor=${hasOutdoor}, harvest=${hasHarvest}`);
    
    // Prioritize: indoor > outdoor > harvest
    if (hasIndoor) {
      return 'indoor-planting';
    } else if (hasOutdoor) {
      return 'outdoor-planting';
    } else if (hasHarvest) {
      return 'harvesting';
    }
    
    return '';
  };
  
  // Helper functions to check if a month has specific planting activities
  // eslint-disable-next-line no-unused-vars
  const hasSeedIndoors = (plant, monthIndex) => {
    if (!plant || !plant.id || !plantCalendarData[plant.id]) return false;
    return plantCalendarData[plant.id].indoor_seed && 
           plantCalendarData[plant.id].indoor_seed.includes(monthIndex);
  };
  
  // eslint-disable-next-line no-unused-vars
  const hasOutdoorPlanting = (plant, monthIndex) => {
    if (!plant || !plant.id || !plantCalendarData[plant.id]) return false;
    return (plantCalendarData[plant.id].direct_sow && 
            plantCalendarData[plant.id].direct_sow.includes(monthIndex)) ||
           (plantCalendarData[plant.id].transplant && 
            plantCalendarData[plant.id].transplant.includes(monthIndex));
  };
  
  // eslint-disable-next-line no-unused-vars
  const hasTransplanting = (plant, monthIndex) => {
    if (!plant || !plant.id || !plantCalendarData[plant.id]) return false;
    return plantCalendarData[plant.id].transplant && 
           plantCalendarData[plant.id].transplant.includes(monthIndex);
  };
  
  // eslint-disable-next-line no-unused-vars
  const hasHarvesting = (plant, monthIndex) => {
    if (!plant || !plant.id || !plantCalendarData[plant.id]) return false;
    return plantCalendarData[plant.id].harvest && 
           plantCalendarData[plant.id].harvest.includes(monthIndex);
  };
  
  // Handle cell click to show planting details
  const handleCellClick = (plant, monthIndex, isIndoor, isOutdoor) => {
    setActiveMonth(monthIndex);
    
    if (isIndoor || isOutdoor) {
      setActiveDetails({
        plant,
        month: months[monthIndex],
        isIndoor,
        isOutdoor,
        tips: getPlantingTips(plant, monthIndex, isIndoor, isOutdoor)
      });
    } else {
      setActiveDetails(null);
    }
  };
  
  // Handle cell hover to preview planting details
  const handleCellHover = (plant, monthIndex) => {
    // This would be implemented to show a tooltip with plant info on hover
    // For mobile, this could be a light tap that shows info without selecting
  };
  
  // Get plant-specific planting tips based on the exact plant, time of year and indoor/outdoor context
  const getPlantingTips = (plant, monthIndex, isIndoor, isOutdoor) => {
    const dates = calculatePlantingDates(plant);
    // eslint-disable-next-line no-unused-vars
    const confidence = dates.confidence || 0.7;
    
    // Check if this is an optimal planting time
    let isOptimal = false;
    let optimalText = '';
    
    if (isIndoor && dates.indoorStart !== null && dates.indoorEnd !== null) {
      // For indoor, optimal is the middle of the window
      const indoorMiddle = Math.floor((dates.indoorStart + 
          (dates.indoorEnd >= 12 ? dates.indoorEnd - 12 : dates.indoorEnd)) / 2);
      isOptimal = (monthIndex === indoorMiddle);
      
      if (isOptimal) {
        optimalText = "This is the optimal time to start seeds indoors for best results.";
      }
    } else if (isOutdoor && dates.outdoorStart !== null && dates.outdoorEnd !== null) {
      // For outdoor, optimal is the first quarter of the window
      const windowStart = dates.outdoorStart;
      const windowEnd = dates.outdoorEnd >= 12 ? 
        dates.outdoorEnd - 12 : dates.outdoorEnd;
      
      // Calculate optimal month as first 25% of growing window
      const windowLength = windowEnd >= windowStart ? 
        windowEnd - windowStart : (windowEnd + 12) - windowStart;
      const optimalMonth = (windowStart + Math.floor(windowLength * 0.25)) % 12;
      
      isOptimal = (monthIndex === optimalMonth);
      
      if (isOptimal) {
        optimalText = "This is the optimal time for planting outdoors for maximum growing season.";
      }
    }
    
    // PLANT-SPECIFIC GROWING INFORMATION DATABASE
    // This database provides specific growing advice for individual plants
    const plantSpecificAdvice = {
      // VEGETABLES
      "tomato": {
        indoor: "Sow tomato seeds 1/4 inch deep in seed starting mix. Keep at 70-75°F for germination. Provide 14-16 hours of strong light once emerged. Transplant when 6-8 inches tall after hardening off for 7-10 days.",
        outdoor: "Plant tomatoes deeply, burying 2/3 of the stem to encourage root development. Space 24-36 inches apart in fertile, well-draining soil. Add calcium to prevent blossom end rot. Provide support with cages or stakes.",
        spacing: "24-36 inches apart",
        soil: "Rich, well-draining soil with pH 6.0-6.8",
        care: "Regular pruning of suckers improves air circulation and fruit size. Water deeply at base to prevent disease."
      },
      "roma tomato": {
        indoor: "Sow Roma tomato seeds 1/4 inch deep in seed starting mix. Keep at 70-75°F for germination. Provide 14-16 hours of light once emerged. These determinate tomatoes require less pruning than indeterminate varieties.",
        outdoor: "Plant deeply, burying 2/3 of the stem. Space 18-24 inches apart - Roma tomatoes can be spaced more closely than other varieties. Provide cages or stakes for support.",
        spacing: "18-24 inches apart",
        soil: "Well-draining soil with added compost and pH 6.0-6.8",
        care: "Minimal pruning needed as these are determinate types. Keep water consistent to prevent blossom end rot and cracking."
      },
      "cherry tomato": {
        indoor: "Start cherry tomato seeds 1/4 inch deep in seed starting mix. Maintain 75°F for fast germination. Once emerged, provide 14-16 hours of light daily. These are often more vigorous seedlings that grow quickly.",
        outdoor: "Plant deeply with 2/3 of the stem buried. Most cherry tomatoes are indeterminate (vining) varieties that require sturdy 6-foot supports. Space plants 24-36 inches apart.",
        spacing: "24-36 inches apart",
        soil: "Well-draining soil with compost. Cherry tomatoes are less susceptible to blossom end rot but benefit from consistent soil moisture.",
        care: "Prune for air circulation. Can withstand more drought conditions than larger fruited varieties."
      },
      "lettuce": {
        indoor: "Sow lettuce seeds just barely covered with soil, as they need light to germinate. Optimal soil temperature is 60-70°F. Does not transplant well, so use biodegradable pots if starting indoors.",
        outdoor: "Direct sow seeds 1/8 inch deep, barely covered with soil. For heat-sensitive varieties, provide afternoon shade in warmer months. Succession plant every 2-3 weeks for continuous harvest.",
        spacing: "Head lettuce: 10-12 inches apart. Leaf lettuce: 4-6 inches apart",
        soil: "Rich soil with plenty of organic matter. Consistent moisture is key for sweet, non-bitter leaves.",
        care: "Harvest outer leaves for cut-and-come-again production. Bolt-resistant varieties extend the season."
      },
      "kale": {
        indoor: "Sow kale seeds 1/4 inch deep. Germination occurs at 45-85°F, with optimal being 70°F. Seedlings can be transplanted when they have 4-5 true leaves, typically 4-6 weeks after sowing.",
        outdoor: "Direct sow seeds 1/4-1/2 inch deep. Kale is very cold tolerant and flavor improves after light frost. For fall crop, plant 6-8 weeks before first frost date.",
        spacing: "12-18 inches apart, rows 18-24 inches apart",
        soil: "Rich soil with pH 6.0-7.5. Add compost for best results.",
        care: "Harvest outer leaves first and the plant will continue producing. Watch for cabbage worms - row covers help."
      },
      "carrot": {
        indoor: "Carrots don't transplant well - direct sowing is strongly recommended.",
        outdoor: "Sow carrot seeds 1/4 inch deep in loose, stone-free soil. Keep soil consistently moist until germination, which can take 14-21 days. Thin seedlings to 2-3 inches apart for proper root development.",
        spacing: "2-3 inches between plants, rows 12-18 inches apart",
        soil: "Deep, loose, stone-free soil that's well-draining. Heavy or rocky soil produces forked or stunted carrots.",
        care: "Consistent moisture produces sweeter carrots. Cover shoulders with soil to prevent greening."
      },
      "cucumber": {
        indoor: "Start cucumber seeds in peat pots 3-4 weeks before last frost. Sow 1/2 inch deep. Keep soil at 70-90°F for germination. Transplant carefully to avoid root disturbance.",
        outdoor: "Direct sow 1/2 inch deep after soil has warmed to at least 60°F. Plant in hills or rows, with trellising for best disease prevention and straight fruits.",
        spacing: "Hills: 3 plants per hill, hills 3-4 feet apart. Rows: 8-12 inches apart, rows 3-4 feet apart. Closer if trellised.",
        soil: "Rich, well-draining soil with pH 6.0-7.0. Add compost for best yields.",
        care: "Keep consistently moist - irregular watering leads to bitter fruit. Harvest frequently for continued production."
      },
      "pepper": {
        indoor: "Start pepper seeds indoors 8-10 weeks before last frost. Sow 1/4 inch deep. Maintain 80-90°F soil temperature for germination, which can take 14-21 days. Provide 16 hours of light for stocky seedlings.",
        outdoor: "Transplant after soil has warmed to at least 65°F and night temperatures stay above 55°F. Space 18-24 inches apart with 24-36 inches between rows.",
        spacing: "18-24 inches apart, rows 24-36 inches apart",
        soil: "Well-draining soil with moderate fertility. Too much nitrogen produces foliage at the expense of fruit.",
        care: "Consistent watering prevents blossom end rot. Provide support for plants with heavy fruit load."
      },
      
      // HERBS
      "basil": {
        indoor: "Sow basil seeds just lightly covered with soil. Basil needs temperatures of 70-75°F for germination, which typically takes 5-10 days. Provide plenty of light to prevent leggy seedlings.",
        outdoor: "Transplant after all danger of frost has passed and night temperatures stay above 50°F. Space 12-18 inches apart. Can also direct sow when soil has warmed.",
        spacing: "12-18 inches apart",
        soil: "Rich, well-draining soil with pH 6.0-7.0",
        care: "Pinch off flower buds and top few inches regularly to encourage bushier growth. Water at the base to avoid fungal issues."
      },
      "cilantro": {
        indoor: "Cilantro doesn't transplant well due to its taproot. If started indoors, use deep pots and biodegradable containers for transplanting. Seeds should be lightly crushed before sowing to improve germination.",
        outdoor: "Direct sow 1/4 inch deep. Succession plant every 2-3 weeks for continuous harvest. Cilantro bolts quickly in heat, so spring and fall plantings work best in most climates.",
        spacing: "2-4 inches between plants, rows 12 inches apart",
        soil: "Well-draining soil with moderate fertility",
        care: "Harvest by cutting outer stems first. Once flowering begins, seed production (coriander) follows quickly."
      },
      "mint": {
        indoor: "Mint is best propagated from cuttings rather than seeds for true-to-type plants. If growing from seed, surface sow and provide light for germination.",
        outdoor: "Always plant mint in containers, even when planting outdoors, as it spreads aggressively. Space plants 12-18 inches apart.",
        spacing: "12-18 inches apart in containers",
        soil: "Adaptable to most soils but prefers moist conditions",
        care: "Harvest regularly to encourage bushier growth. Container growing prevents invasive spreading."
      },
      "rosemary": {
        indoor: "Rosemary seeds germinate slowly (14-30 days) and have low germination rates. Surface sow and mist to keep moist. Temperatures of 70-85°F speed germination.",
        outdoor: "Transplant to well-draining soil in a location with full sun. Space plants 24-36 inches apart as rosemary can grow quite large.",
        spacing: "24-36 inches apart",
        soil: "Well-draining soil with low fertility; rosemary dislikes wet feet and prefers almost dry conditions",
        care: "Drought tolerant once established. In zones below 7, move to containers and bring indoors for winter."
      },
      
      // FLOWERS
      "zinnia": {
        indoor: "Start zinnia seeds 4-6 weeks before last frost date. Sow 1/4 inch deep. Provide warm temperatures (70-75°F) for germination. Zinnias transplant easily when young.",
        outdoor: "Direct sow after last frost when soil has warmed. Sow seeds 1/4 inch deep. Thin seedlings to proper spacing for good air circulation.",
        spacing: "6-18 inches apart depending on variety size",
        soil: "Average, well-draining soil. Tolerates poor soil but performs best in fertile conditions.",
        care: "Deadhead regularly to encourage continuous blooming. Good air circulation prevents powdery mildew."
      },
      "sunflower": {
        indoor: "Sunflowers don't transplant well due to their long taproot, but can be started in deep peat pots. Sow 1/2 inch deep 2-4 weeks before last frost.",
        outdoor: "Direct sow 1/2 inch deep after last frost date. Some varieties need staking, particularly in windy areas. Succession plant for continuous blooms.",
        spacing: "6-24 inches apart depending on variety size",
        soil: "Average, well-draining soil. Sunflowers are not fussy about soil quality.",
        care: "Protect seedlings from birds and squirrels. Taller varieties may need staking."
      },
      "marigold": {
        indoor: "Sow marigold seeds 1/4 inch deep 4-6 weeks before last frost. Germination occurs in 5-10 days at 70-75°F. Provide good air circulation to prevent damping off.",
        outdoor: "Direct sow after all danger of frost has passed. Sow seeds 1/4 inch deep. Thin seedlings for proper spacing.",
        spacing: "8-12 inches apart for dwarf varieties, 12-18 inches for larger types",
        soil: "Adaptable to most soils, but prefers well-draining conditions",
        care: "Deadhead to encourage continuous blooming. Some varieties are excellent companion plants for vegetables."
      }
    };
    
    // Get the plant name in lowercase for matching
    const plantLower = plant.name?.toLowerCase() || '';
    
    // Try to find exact match first, then fallback to partial matches
    let matchedPlant = plantSpecificAdvice[plantLower];
    
    if (!matchedPlant) {
      // Look for partial matches (e.g., "roma tomato" should match if we have data for it)
      const partialMatches = Object.keys(plantSpecificAdvice).filter(key => 
        plantLower.includes(key) || key.includes(plantLower)
      );
      
      if (partialMatches.length > 0) {
        // Use the longest matching key (most specific)
        const bestMatch = partialMatches.reduce((a, b) => a.length > b.length ? a : b);
        matchedPlant = plantSpecificAdvice[bestMatch];
        console.log(`Found partial match for ${plantLower}: ${bestMatch}`);
      }
    }
    
    // Default generic advice based on plant type if no specific match is found
    let baseTips = '';
    const type = plant.type?.toLowerCase() || '';
    
    if (isIndoor) {
      if (matchedPlant && matchedPlant.indoor) {
        baseTips = matchedPlant.indoor;
      } else if (type === 'vegetable') {
        baseTips = "Start seeds in a sterile seed-starting mix. Keep soil consistently moist but not waterlogged. Provide 12-16 hours of light once seedlings emerge.";
      } else if (type === 'herb') {
        baseTips = "Herbs generally prefer well-draining soil. Most herb seeds are small and should be sown shallowly. Some herbs prefer to be direct sown.";
      } else if (type === 'flower') {
        baseTips = "Most flower seeds need light to germinate - press them onto the soil surface rather than burying them. Check specific varieties for exceptions.";
      } else {
        baseTips = "Start seeds in sterile seed-starting mix under grow lights or in a sunny window. Keep soil consistently moist but not waterlogged.";
      }
    } else if (isOutdoor) {
      if (matchedPlant && matchedPlant.outdoor) {
        baseTips = matchedPlant.outdoor;
      } else {
        // Calculate if this is early, mid, or late season for this plant
        const seasonLength = dates.outdoorEnd - dates.outdoorStart;
        const position = monthIndex - dates.outdoorStart;
        const seasonStage = position / seasonLength;
        
        if (seasonStage < 0.3) {
          baseTips = "Early season planting. Be prepared to protect plants from late frosts. Harden off seedlings by gradually exposing them to outdoor conditions over 7-10 days.";
        } else if (seasonStage > 0.7) {
          baseTips = "Late season planting. Consider season extension techniques like row covers for cold-sensitive plants. Focus on quick-maturing varieties.";
        } else {
          baseTips = "Main season planting. Maintain regular watering and monitor for pests and diseases. Consider succession planting for continuous harvests.";
        }
      }
      
      // Create formatted sections with icons and better spacing
      
      // Add spacing information if available
      if (matchedPlant && matchedPlant.spacing) {
        baseTips += `\n\nSpacing: ${matchedPlant.spacing}`;
      } else if (plant.spacing && plant.spacing.plants) {
        baseTips += `\n\nSpacing: ${plant.spacing.plants} inches between plants${plant.spacing.rows ? `, ${plant.spacing.rows} inches between rows` : ''}`;
      }
      
      // Add soil preference if available
      if (matchedPlant && matchedPlant.soil) {
        baseTips += `\n\nSoil: ${matchedPlant.soil}`;
      } else if (plant.growing_requirements && plant.growing_requirements.soil_type) {
        const soilTypes = Array.isArray(plant.growing_requirements.soil_type) 
          ? plant.growing_requirements.soil_type.join(', ') 
          : plant.growing_requirements.soil_type;
        baseTips += `\n\nSoil: ${soilTypes}`;
      }
      
      // Add general care tips
      if (matchedPlant && matchedPlant.care) {
        baseTips += `\n\nCare: ${matchedPlant.care}`;
      }
    } else {
      return "";
    }
    
    // Calculate days to maturity information if available
    let maturityInfo = '';
    if (plant.days_to_maturity && plant.days_to_maturity.min && isOutdoor) {
      const minDays = plant.days_to_maturity.min;
      const maxDays = plant.days_to_maturity.max || minDays + 15;
      
      const plantDate = new Date();
      plantDate.setMonth(monthIndex);
      
      const harvestMinDate = new Date(plantDate);
      harvestMinDate.setDate(plantDate.getDate() + minDays);
      
      const harvestMaxDate = new Date(plantDate);
      harvestMaxDate.setDate(plantDate.getDate() + maxDays);
      
      maturityInfo = `\n\nApproximate harvest: ${harvestMinDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${harvestMaxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${minDays}-${maxDays} days)`;
    }
    
    // Improve the formatting of the text with clear section headers and spacing
    let formattedTips = baseTips;
    
    // Clean up any formatting in the base tips
    formattedTips = formattedTips.trim();
    
    // Add optimal timing message with proper formatting
    if (optimalText) {
      formattedTips += `\n\nOptimal Timing: ${optimalText}`;
    }
    
    // Add maturity info with proper formatting
    if (maturityInfo) {
      // Extract just the harvest dates without the leading newlines
      const cleanMaturityInfo = maturityInfo.replace(/^\n\nApproximate harvest: /, '');
      formattedTips += `\n\nHarvest: ${cleanMaturityInfo}`;
    }
    
    return formattedTips;
  };
  
  // Function to prepare calendar for export
  const prepareCalendarForExport = () => {
    // Make sure the calendar ref exists
    if (!calendarRef.current) {
      console.error('Calendar reference not found');
      return null;
    }
    
    try {
      // Clone the calendar element to avoid modifying the actual DOM
      const calendarClone = calendarRef.current.cloneNode(true);
      
      // Add necessary styles for PDF
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        @page { size: landscape; margin: 10mm; }
        body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }
        .calendar-container { width: 100%; }
        .calendar-header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; }
        .calendar-title { font-size: 24px; margin: 0; }
        .calendar-subtitle { font-size: 16px; margin: 5px 0; }
        .calendar-grid { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .calendar-grid th, .calendar-grid td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        .calendar-grid th { background-color: #f2f2f2; }
        .indoor-planting { background-color: rgba(66, 153, 225, 0.35) !important; }
        .outdoor-planting { background-color: rgba(72, 187, 120, 0.35) !important; }
        .plant-name { font-weight: bold; }
        .plant-type { font-size: 12px; color: #666; }
        .legend { display: flex; justify-content: center; margin: 10px 0; }
        .legend-item { display: flex; align-items: center; margin: 0 10px; }
        .color-swatch { width: 20px; height: 20px; margin-right: 5px; border: 1px solid #ccc; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      `;
      
      // Create a simple HTML representation of the calendar
      const calendarTable = document.createElement('table');
      calendarTable.className = 'calendar-grid';
      
      // Create header row
      const headerRow = document.createElement('tr');
      const plantHeader = document.createElement('th');
      plantHeader.textContent = 'Plant';
      headerRow.appendChild(plantHeader);
      
      // Add month headers
      months.forEach(month => {
        const monthHeader = document.createElement('th');
        monthHeader.textContent = month;
        headerRow.appendChild(monthHeader);
      });
      
      calendarTable.appendChild(headerRow);
      
      // Add plant rows
      selectedPlants.forEach(plant => {
        const plantRow = document.createElement('tr');
        
        // Plant name cell
        const nameCell = document.createElement('td');
        nameCell.innerHTML = `<div class="plant-name">${plant.name}</div><div class="plant-type">${plant.type || ''}</div>`;
        plantRow.appendChild(nameCell);
        
        // Calculate planting dates for this plant
        const plantDates = calculatePlantingDates(plant);
        
        // Add month cells
        months.forEach((month, idx) => {
          const cell = document.createElement('td');
          
          let indoor = false;
          let outdoor = false;
          
          // Check for indoor planting window
          if (plantDates.indoorStart !== null && plantDates.indoorEnd !== null) {
            if (plantDates.indoorStart <= plantDates.indoorEnd) {
              indoor = (idx >= plantDates.indoorStart && idx <= plantDates.indoorEnd);
            } else {
              indoor = (idx >= plantDates.indoorStart || idx <= plantDates.indoorEnd);
            }
          }
          
          // Check for outdoor planting window
          if (plantDates.outdoorStart !== null && plantDates.outdoorEnd !== null) {
            if (plantDates.outdoorStart <= plantDates.outdoorEnd) {
              outdoor = (idx >= plantDates.outdoorStart && idx <= plantDates.outdoorEnd);
            } else {
              outdoor = (idx >= plantDates.outdoorStart || idx <= plantDates.outdoorEnd);
            }
          }
          
          // Get calendar data for this plant
          const calData = plantCalendarData[plant.id];
          
          // Define the planting type variables
          let directSow = false;
          let transplant = false;
          let harvest = false;
          
          // Check if calendar data exists
          if (calData) {
            // Check for direct sowing in this month
            directSow = calData.direct_sow && calData.direct_sow.includes(idx);
            
            // Check for transplanting in this month
            transplant = calData.transplant && calData.transplant.includes(idx);
            
            // Check for harvesting in this month
            harvest = calData.harvest && calData.harvest.includes(idx);
          }
          
          // Set cell class based on planting type
          if (indoor) {
            cell.className = 'indoor-planting';
            console.log(`Cell for ${plant.name}, month ${idx} (${months[idx]}) is indoor-planting`);
          } else if (directSow || transplant) {
            cell.className = 'outdoor-planting';
            console.log(`Cell for ${plant.name}, month ${idx} (${months[idx]}) is outdoor-planting`);
          } else if (harvest) {
            cell.className = 'harvesting';
            console.log(`Cell for ${plant.name}, month ${idx} (${months[idx]}) is harvesting`);
          }
          
          plantRow.appendChild(cell);
        });
        
        calendarTable.appendChild(plantRow);
      });
      
      // Create a complete HTML document for the PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Your Planting Calendar</title>
          ${styleElement.outerHTML}
        </head>
        <body>
          <div class="calendar-container">
            <div class="calendar-header">
              <h1 class="calendar-title">Your Planting Calendar</h1>
              <h2 class="calendar-subtitle">Zone: ${zoneInfo?.zone || 'Unknown'}</h2>
              ${zoneInfo?.lastFrostDate ? `<p class="frost-dates">Last Frost: ${zoneInfo.lastFrostDate} | First Frost: ${zoneInfo.firstFrostDate || 'Unknown'}</p>` : ''}
              <p class="generation-date">Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            ${calendarTable.outerHTML}
          </div>
        </body>
        </html>
      `;
      
      console.log('Generated HTML content length:', htmlContent.length);
      return htmlContent;
    } catch (error) {
      console.error('Error generating calendar HTML:', error);
      
      // Fallback to a simple HTML document
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Garden Planting Calendar</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #3a7b5e; }
            .zone { font-weight: bold; color: #56a978; }
            .date { color: #666; font-style: italic; }
          </style>
        </head>
        <body>
          <h1>Garden Planting Calendar</h1>
          <p class="zone">Zone: ${zoneInfo?.zone || 'Unknown'}</p>
          <p class="date">Generated on: ${new Date().toLocaleDateString()}</p>
          <p>This calendar includes planting information for ${selectedPlants.length} plants.</p>
          <p>Sorry, we encountered an error generating the detailed calendar. Please try again later.</p>
        </body>
        </html>
      `;
    }
  };
  
  // Handle export button click
  const handleExportClick = () => {
    const htmlContent = prepareCalendarForExport();
    
    // Call the parent component's export handler with the HTML content
    if (onExportCalendar && typeof onExportCalendar === 'function') {
      onExportCalendar({
        htmlContent,
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
        month: new Date().getMonth() + 1,
        zoneId: zoneInfo?.id || null,
        frostDates: {
          lastFrost: zoneInfo?.lastFrostDate,
          firstFrost: zoneInfo?.firstFrostDate
        }
      });
    }
  };

  // Handle clicking on a plant name to show detailed information
  const handlePlantNameClick = (plant) => {
    setSelectedPlant(plant);
    setShowDetailedInfo(true);
  };
  
  // Add event listener for closing plant details
  useEffect(() => {
    const handleClosePlantDetails = () => {
      setShowDetailedInfo(false);
    };
    
    window.addEventListener('closePlantDetails', handleClosePlantDetails);
    
    return () => {
      window.removeEventListener('closePlantDetails', handleClosePlantDetails);
    };
  }, []);
  
  return (
    <CalendarContainer ref={calendarRef}>
      <CardHeader>
        <h2>Planting Calendar</h2>
        <ExportButton onClick={handleExportClick}>
          Export Calendar
        </ExportButton>
      </CardHeader>
      
      <CardContent>
        <Legend>
          <LegendItem hasIcon={true}>
            <ColorSwatch 
              color="rgba(66, 153, 225, 0.3)" 
              borderColor="rgba(66, 153, 225, 0.9)" 
            />
            <span>Start indoors (S)</span>
          </LegendItem>
          <LegendItem hasIcon={true}>
            <ColorSwatch 
              color="rgba(72, 187, 120, 0.3)" 
              borderColor="rgba(72, 187, 120, 0.9)" 
            />
            <span>Direct sow/transplant outdoors (P/T)</span>
          </LegendItem>
          <LegendItem hasIcon={true}>
            <ColorSwatch 
              color="rgba(237, 137, 54, 0.3)" 
              borderColor="rgba(237, 137, 54, 0.9)" 
            />
            <span>Harvest</span>
          </LegendItem>
        </Legend>
        
        <CalendarGrid>
          <HeaderRow isMobile={isMobile}>
            <HeaderCell>Plant</HeaderCell>
            {months.map((month, idx) => (
              <HeaderCell key={idx}>{month}</HeaderCell>
            ))}
          </HeaderRow>
          
          {selectedPlants.map(plant => (
            <PlantRow key={plant.id || plant._id || plant.name} isMobile={isMobile}>
              <PlantCell onClick={() => handlePlantNameClick(plant)}>
                <PlantName>{plant.name}</PlantName>
                <PlantTypeLabel>{plant.type}</PlantTypeLabel>
              </PlantCell>
              
              {months.map((month, idx) => {
                // Get calendar data for this plant
                const plantId = plant.id || plant._id || plant.name;
                const calendarData = plantCalendarData[plantId];
                
                // Check if this month has any planting or harvesting activity
                const indoor = calendarData && calendarData.indoor_seed && calendarData.indoor_seed.includes(idx);
                const directSow = calendarData && calendarData.direct_sow && calendarData.direct_sow.includes(idx);
                const transplant = calendarData && calendarData.transplant && calendarData.transplant.includes(idx);
                const harvest = calendarData && calendarData.harvest && calendarData.harvest.includes(idx);
                
                console.log(`Cell for ${plant.name}, month ${idx} (${months[idx]}):`, {
                  indoor,
                  directSow,
                  transplant,
                  harvest
                });
                
                // Determine cell class
                let cellClass = '';
                if (indoor) {
                  cellClass = 'indoor-planting';
                  console.log(`Cell for ${plant.name}, month ${idx} (${months[idx]}) is indoor-planting`);
                } else if (directSow || transplant) {
                  cellClass = 'outdoor-planting';
                  console.log(`Cell for ${plant.name}, month ${idx} (${months[idx]}) is outdoor-planting`);
                } else if (harvest) {
                  cellClass = 'harvesting';
                  console.log(`Cell for ${plant.name}, month ${idx} (${months[idx]}) is harvesting`);
                }
                
                // Determine if this is optimal timing
                let isOptimalTiming = false;
                
                // For indoor seeding, the optimal time is typically the middle of the window
                if (indoor && calendarData && calendarData.indoor_seed) {
                  const indoorMonths = calendarData.indoor_seed;
                  if (indoorMonths.length > 0) {
                    const middleIndex = Math.floor(indoorMonths.length / 2);
                    isOptimalTiming = (idx === indoorMonths[middleIndex]);
                  }
                }
                
                // For outdoor planting, the optimal time is typically the beginning of the window
                if ((directSow || transplant) && !indoor) {
                  const outdoorMonths = [...(calendarData?.direct_sow || []), ...(calendarData?.transplant || [])];
                  if (outdoorMonths.length > 0) {
                    // Sort to find the earliest month
                    outdoorMonths.sort((a, b) => a - b);
                    isOptimalTiming = (idx === outdoorMonths[0]);
                  }
                }
                
                return (
                  <CalendarCell 
                    key={idx}
                    className={cellClass}
                    active={activeMonth === idx && activeDetails?.plant.id === plant.id}
                    onClick={() => handleCellClick(plant, idx, indoor, directSow || transplant)}
                    onMouseEnter={() => handleCellHover(plant, idx)}
                    onFocus={() => handleCellHover(plant, idx)}
                    role="button"
                    tabIndex={cellClass ? 0 : -1}
                    aria-label={`${plant.name} in ${months[idx]} ${indoor ? 'start indoors' : (directSow || transplant) ? 'direct sow or transplant outdoors' : harvest ? 'harvest' : 'not recommended'}`}
                    isPlantable={cellClass !== ''}
                    data-plant={plant.name}
                    data-month={month}
                    data-activity={indoor ? 'indoor' : (directSow || transplant) ? 'outdoor' : harvest ? 'harvest' : 'none'}
                    data-optimal={isOptimalTiming}
                    style={{
                      opacity: cellClass ? 0.9 : 1,
                      borderWidth: isOptimalTiming ? '2px' : '1px'
                    }}
                  />
                );
              })}
            </PlantRow>
          ))}
        </CalendarGrid>
        
        {activeDetails && (
          <DetailPanel>
            <DetailHeader>
              <PlantDetailName>{activeDetails.plant.name}</PlantDetailName>
              <MonthName>{activeDetails.month}</MonthName>
            </DetailHeader>
            
            <DetailBody>
              <ActionType>
                {activeDetails.isIndoor ? 'Start indoors' : 'Direct sow/transplant outdoors'}
              </ActionType>
              <PlantingTips dangerouslySetInnerHTML={{ 
                __html: activeDetails.tips
                  .replace(/Spacing: /g, '<strong>Spacing: </strong>')
                  .replace(/Soil: /g, '<strong>Soil: </strong>')
                  .replace(/Care: /g, '<strong>Care: </strong>')
                  .replace(/Optimal Timing: /g, '<strong>Optimal Timing: </strong>')
                  .replace(/Harvest: /g, '<strong>Harvest: </strong>')
              }} />
            </DetailBody>
          </DetailPanel>
        )}
        
        {showDetailedInfo && selectedPlant && (
          <div>
            <CloseButton onClick={() => setShowDetailedInfo(false)}>×</CloseButton>
            <PlantDetails plant={selectedPlant} zoneInfo={zoneInfo} />
          </div>
        )}
      </CardContent>
    </CalendarContainer>
  );
};

// Styled Components
const CardHeader = styled.div`
  background: linear-gradient(135deg, #3A7B5E, #56A978);
  color: white;
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
    letter-spacing: -0.3px;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 767.98px) {
    padding: 16px 20px;
    
    h2 {
      font-size: 1.3rem;
    }
  }
  
  @media (max-width: 575.98px) {
    padding: 14px 16px;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    
    h2 {
      font-size: 1.2rem;
    }
  }
`;

const ExportButton = styled.button`
  background: linear-gradient(to right, var(--sage-600), var(--sage-700));
  border-color: var(--sage-700);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  padding: 0.625rem 1.25rem;
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.01em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: linear-gradient(to right, var(--sage-700), var(--sage-800));
    border-color: var(--sage-800);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &.btn-ripple:after {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, white 10%, transparent 10%);
    background-repeat: no-repeat;
    background-position: 50%;
    transform: scale(10, 10);
    opacity: 0;
    transition: transform 0.5s, opacity 0.5s;
  }
  
  &.btn-ripple:active:after {
    transform: scale(0, 0);
    opacity: 0.3;
    transition: 0s;
  }
  
  @media (max-width: 767.98px) {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
  
  @media (max-width: 575.98px) {
    width: 100%;
    padding: 0.5rem;
    font-size: 0.85rem;
  }
`;

const CardContent = styled.div`
  padding: 24px;
  
  @media (max-width: 767.98px) {
    padding: 20px;
  }
  
  @media (max-width: 575.98px) {
    padding: 16px;
  }
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 24px;
  background-color: #F7FAFC;
  padding: 16px;
  border-radius: 8px;
  
  @media (max-width: 767.98px) {
    gap: 16px;
    margin-bottom: 20px;
    padding: 14px;
  }
  
  @media (max-width: 575.98px) {
    gap: 12px;
    margin-bottom: 16px;
    padding: 12px;
    flex-direction: column;
  }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #4A5568;
  
  &:hover ${props => props.hasIcon && `
    transform: translateY(-1px);
    
    & > *:first-child {
      transform: scale(1.1);
    }
  `}
  
  @media (max-width: 767.98px) {
    font-size: 0.85rem;
    gap: 8px;
  }
  
  @media (max-width: 575.98px) {
    width: 100%;
    font-size: 0.85rem;
  }
`;

const ColorSwatch = styled.div`
  width: 24px;
  height: 20px;
  border-radius: 4px;
  background-color: ${props => props.color};
  position: relative;
  transition: transform 0.2s ease;
  
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: ${props => props.borderColor || props.color};
  }
  
  @media (max-width: 767.98px) {
    width: 22px;
    height: 18px;
  }
  
  @media (max-width: 575.98px) {
    width: 20px;
    height: 16px;
  }
`;

const CalendarGrid = styled.div`
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  overflow-x: auto;
  overflow-y: visible;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  max-width: 100%;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: var(--sage-400) var(--sage-100); /* Firefox */
  margin-bottom: 20px;

  /* Custom scrollbar for better visibility */
  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--sage-100);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--sage-400);
    border-radius: 10px;
    border: 2px solid var(--sage-100);
  }
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 160px repeat(12, minmax(70px, 1fr));
  border-bottom: 1px solid #E2E8F0;
  min-width: 1000px; /* Ensures decent display on tablets */
  background: linear-gradient(135deg, #3A7B5E, #56A978);
  
  @media (max-width: 767.98px) {
    grid-template-columns: 130px repeat(12, minmax(60px, 1fr));
    min-width: 950px;
  }
  
  @media (max-width: 575.98px) {
    grid-template-columns: 110px repeat(12, minmax(55px, 1fr));
    min-width: 820px;
  }
`;

const HeaderCell = styled.div`
  padding: 16px 10px;
  text-align: center;
  font-weight: 600;
  color: white;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 0.9rem;
  background: linear-gradient(135deg, #3A7B5E, #56A978);
  box-sizing: border-box;
  
  &:first-child {
    text-align: left;
    padding-left: 16px;
    position: sticky;
    left: 0;
    z-index: 2;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  }
  
  &:last-child {
    border-right: none;
  }
  
  @media (max-width: 767.98px) {
    padding: 14px 8px;
    font-size: 0.85rem;
  }
  
  @media (max-width: 575.98px) {
    padding: 12px 6px;
    font-size: 0.8rem;
  }
`;

const PlantRow = styled.div`
  display: grid;
  grid-template-columns: 160px repeat(12, minmax(70px, 1fr));
  border-bottom: 1px solid #E2E8F0;
  background-color: white;
  transition: background-color 0.15s ease;
  min-width: 1000px; /* Match HeaderRow */
  
  &:hover {
    background-color: #F9FAFB;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 767.98px) {
    grid-template-columns: 130px repeat(12, minmax(60px, 1fr));
    min-width: 950px;
  }
  
  @media (max-width: 575.98px) {
    grid-template-columns: 110px repeat(12, minmax(55px, 1fr));
    min-width: 820px;
  }
`;

const PlantCell = styled.div`
  padding: 12px 16px;
  text-align: left;
  position: sticky;
  left: 0;
  background-color: white;
  z-index: 1;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f7fafc;
  }
  
  @media (max-width: 767.98px) {
    padding: 10px 12px;
  }
  
  @media (max-width: 575.98px) {
    padding: 8px 10px;
  }
`;

const PlantName = styled.div`
  font-weight: 600;
  color: #2D3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 767.98px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 575.98px) {
    font-size: 0.85rem;
  }
`;

const PlantTypeLabel = styled.div`
  font-size: 0.75rem;
  color: #718096;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  
  @media (max-width: 767.98px) {
    font-size: 0.7rem;
    letter-spacing: 0.3px;
  }
  
  @media (max-width: 575.98px) {
    font-size: 0.65rem;
    letter-spacing: 0.2px;
  }
`;

const CalendarCell = styled.div`
  padding: 12px 10px;
  text-align: center;
  border: 1px solid #E2E8F0;
  position: relative;
  transition: all 0.2s ease;
  cursor: ${props => props.isPlantable ? 'pointer' : 'default'};
  
  &.indoor-planting {
    background-color: rgba(66, 153, 225, 0.3);
    border-color: rgba(66, 153, 225, 0.9);
  }
  
  &.outdoor-planting {
    background-color: rgba(72, 187, 120, 0.3);
    border-color: rgba(72, 187, 120, 0.9);
  }
  
  &.harvesting {
    background-color: rgba(237, 137, 54, 0.3);
    border-color: rgba(237, 137, 54, 0.9);
  }
  
  ${props => props.isPlantable && `
    &:hover {
      transform: scale(1.05);
      z-index: 1;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    &::after {
      content: '✓';
      position: absolute;
      top: 2px;
      right: 2px;
      font-size: 8px;
      color: #2D3748;
    }
  `}
  
  ${props => props.active && `
    transform: scale(1.05);
    z-index: 1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  `}
  
  @media (max-width: 767.98px) {
    padding: 10px 8px;
  }
  
  @media (max-width: 575.98px) {
    padding: 8px 6px;
  }
`;

const DetailPanel = styled.div`
  margin-top: 24px;
  background: linear-gradient(to bottom, #F7FAFC, #EDF2F7);
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  @media (max-width: 767.98px) {
    margin-top: 20px;
    border-radius: 8px;
  }
  
  @media (max-width: 575.98px) {
    margin-top: 16px;
    border-radius: 6px;
  }
`;

const DetailHeader = styled.div`
  background: linear-gradient(135deg, #3A7B5E, #56A978);
  color: white;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 767.98px) {
    padding: 12px 16px;
  }
  
  @media (max-width: 575.98px) {
    padding: 10px 14px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const PlantDetailName = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: -0.3px;
  
  @media (max-width: 767.98px) {
    font-size: 1rem;
  }
  
  @media (max-width: 575.98px) {
    font-size: 0.95rem;
  }
`;

const MonthName = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  background-color: rgba(255, 255, 255, 0.3);
  padding: 4px 12px;
  border-radius: 100px;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 767.98px) {
    font-size: 0.9rem;
    padding: 3px 10px;
  }
  
  @media (max-width: 575.98px) {
    font-size: 0.85rem;
    padding: 3px 8px;
    border-radius: 4px;
    align-self: flex-start;
  }
`;

const DetailBody = styled.div`
  padding: 20px;
  
  @media (max-width: 767.98px) {
    padding: 16px;
  }
  
  @media (max-width: 575.98px) {
    padding: 14px;
  }
`;

const ActionType = styled.div`
  font-weight: 600;
  margin-bottom: 16px;
  color: white;
  font-size: 1.05rem;
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #3A7B5E, #56A978);
  padding: 8px 16px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 767.98px) {
    font-size: 1rem;
    padding: 5px 12px;
  }
  
  @media (max-width: 575.98px) {
    font-size: 0.95rem;
    padding: 4px 10px;
    border-radius: 4px;
  }
`;

const PlantingTips = styled.div`
  line-height: 1.6;
  color: #4A5568;
  background-color: white;
  padding: 18px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  border: 1px solid #E2E8F0;
  white-space: pre-wrap; /* This preserves line breaks and spacing */
  
  & span {
    display: block;
    margin-bottom: 0.5rem;
  }
  
  & span:first-of-type {
    font-weight: normal;
  }
  
  /* Bold the labels for spacing, soil, care, etc. */
  & span strong {
    font-weight: 700;
  }
  
  @media (max-width: 767.98px) {
    padding: 14px;
    line-height: 1.5;
    font-size: 0.95rem;
  }
  
  @media (max-width: 575.98px) {
    padding: 12px;
    line-height: 1.4;
    font-size: 0.9rem;
    border-radius: 6px;
  }
`;

const CalendarContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  color: var(--sage-600);
  cursor: pointer;
  z-index: 2;
  
  &:hover {
    color: var(--sage-800);
  }
`;

export default PlantingCalendar;