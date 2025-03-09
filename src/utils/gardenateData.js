/**
 * Utility functions for fetching and processing Gardenate data
 */

// Cache for Gardenate data to avoid repeated fetches
const gardenateCache = {};

/**
 * Fetch raw Gardenate data for a plant
 * @param {string} plantName - The name of the plant to fetch data for
 * @returns {Promise<Object|null>} - The raw Gardenate data or null if not found
 */
export const fetchRawGardenateData = async (plantName) => {
  if (!plantName) return null;
  
  // Check cache first
  if (gardenateCache[plantName]) {
    console.log(`Using cached Gardenate data for ${plantName}`);
    return gardenateCache[plantName];
  }
  
  console.log(`Loading data for plant: ${plantName}`);
  
  // Special case for Broad Beans - hardcoded data as fallback
  if (plantName === "Broad Beans" || plantName.includes("Broad")) {
    console.log("Using hardcoded data for Broad Beans");
    
    // Simplified version of the Broad Beans data
    const hardcodedData = {
      "name": "Broad Beans",
      "zones": [
        {
          "zone_name": "United Kingdom - cool/temperate",
          "zone_number": 0,
          "data": {
            "plant_name": "Broad Beans",
            "alternative_names": ["Fava Beans"],
            "scientific_name": "Vicia faba",
            "family": "Fabaceae / the pea or legume family",
            "climate_zone": "United Kingdom - cool/temperate",
            "monthly_calendar": {
              "jan": [],
              "feb": ["P"],
              "mar": ["P"],
              "apr": ["P"],
              "may": [],
              "jun": [],
              "jul": [],
              "aug": [],
              "sep": ["P"],
              "oct": ["P"],
              "nov": ["P"],
              "dec": []
            },
            "growing_info": {
              "spacing": "Plant 20-30cm apart in rows 60-90cm apart.",
              "sowing_method": "Sow seeds directly in the garden where they are to grow.",
              "additional_notes": [
                "Broad beans are a cool season crop that grows best in temperatures between 15-20°C (60-70°F).",
                "They are hardy and can withstand frost, making them suitable for autumn/winter growing in mild areas.",
                "Provide support for plants as they grow tall and can be damaged by strong winds.",
                "Broad beans are one of the oldest known cultivated plants, dating back to at least 6,000 BC. They are a staple in Mediterranean and Middle Eastern cuisine. The plants grow to about 1-1.5m tall and produce large, flattened pods containing 4-8 seeds. They are relatively easy to grow and are nitrogen-fixing, improving soil fertility."
              ]
            },
            "culinary_hints": [
              "Young tender pods can be eaten whole.",
              "The young leaves can be eaten as a vegetable.",
              "Beans can be eaten fresh or dried for later use."
            ],
            "companion_plants": ["Potatoes", "Peas", "Carrots", "Lettuce"],
            "avoid_plants": ["Onions", "Garlic"]
          }
        },
        {
          "zone_name": "Australia - temperate",
          "zone_number": 1,
          "data": {
            "plant_name": "Broad Beans",
            "alternative_names": ["Fava Beans"],
            "scientific_name": "Vicia faba",
            "family": "Fabaceae / the pea or legume family",
            "climate_zone": "Australia - temperate",
            "monthly_calendar": {
              "jan": [],
              "feb": [],
              "mar": [],
              "apr": ["P"],
              "may": ["P"],
              "jun": ["P"],
              "jul": ["P"],
              "aug": ["P"],
              "sep": [],
              "oct": [],
              "nov": [],
              "dec": []
            },
            "growing_info": {
              "spacing": "Plant 20-30cm apart in rows 60-90cm apart.",
              "sowing_method": "Sow seeds directly in the garden where they are to grow.",
              "additional_notes": [
                "Broad beans are a cool season crop that grows best in temperatures between 15-20°C (60-70°F).",
                "They are hardy and can withstand frost, making them suitable for autumn/winter growing in mild areas.",
                "Provide support for plants as they grow tall and can be damaged by strong winds.",
                "Broad beans are one of the oldest known cultivated plants, dating back to at least 6,000 BC. They are a staple in Mediterranean and Middle Eastern cuisine. The plants grow to about 1-1.5m tall and produce large, flattened pods containing 4-8 seeds. They are relatively easy to grow and are nitrogen-fixing, improving soil fertility."
              ]
            },
            "culinary_hints": [
              "Young tender pods can be eaten whole.",
              "The young leaves can be eaten as a vegetable.",
              "Beans can be eaten fresh or dried for later use."
            ],
            "companion_plants": ["Potatoes", "Peas", "Carrots", "Lettuce"],
            "avoid_plants": ["Onions", "Garlic"]
          }
        }
      ]
    };
    
    // Cache the data
    gardenateCache[plantName] = hardcodedData;
    
    return hardcodedData;
  }
  
  try {
    // Use process.env.PUBLIC_URL to ensure we're using the correct path
    const publicUrl = process.env.PUBLIC_URL || '';
    
    // Try different file name patterns, first in enhanced data directory, then in original
    const filePatterns = [
      // Enhanced data directory
      `${publicUrl}/garden_data_enhanced/all_${plantName}.json`,
      `${publicUrl}/garden_data_enhanced/all_${encodeURIComponent(plantName)}.json`,
      `${publicUrl}/garden_data_enhanced/all_${plantName.trim().split(' ')[0]}.json`,
      `${publicUrl}/garden_data_enhanced/all_${plantName.toLowerCase()}.json`,
      `${publicUrl}/garden_data_enhanced/all_${plantName.charAt(0).toUpperCase() + plantName.slice(1)}.json`,
      
      // Original data directory
      `${publicUrl}/garden_data/all_${plantName}.json`,
      `${publicUrl}/garden_data/all_${encodeURIComponent(plantName)}.json`,
      `${publicUrl}/garden_data/all_${plantName.trim().split(' ')[0]}.json`,
      `${publicUrl}/garden_data/all_${plantName.toLowerCase()}.json`,
      `${publicUrl}/garden_data/all_${plantName.charAt(0).toUpperCase() + plantName.slice(1)}.json`,
      
      // Other formats
      `${publicUrl}/garden_data/${plantName}.json`,
      `${publicUrl}/garden_data/complete_${plantName}.json`,
      `${publicUrl}/garden_data/final_${plantName}.json`
    ];
    
    let data = null;
    let successfulPattern = null;
    
    // Try each pattern until we find a file that exists
    for (const pattern of filePatterns) {
      console.log(`Trying to fetch ${pattern}`);
      try {
        const response = await fetch(pattern, {
          // Add cache control to prevent browser caching
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const text = await response.text();
          console.log(`Successfully loaded data from ${pattern}, content length: ${text.length}`);
          try {
            data = JSON.parse(text);
            successfulPattern = pattern;
            break;
          } catch (parseError) {
            console.error(`Error parsing JSON from ${pattern}:`, parseError);
          }
        } else {
          console.log(`Failed to fetch ${pattern}: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.log(`Error fetching ${pattern}: ${err.message}`);
      }
    }
    
    if (!data) {
      console.warn(`No Gardenate data found for ${plantName}`);
      return null;
    }
    
    console.log(`Successfully loaded data for ${plantName} from ${successfulPattern}`);
    console.log(`Data structure: ${JSON.stringify(Object.keys(data))}`);
    if (data.zones) {
      console.log(`Found ${data.zones.length} zones`);
      if (data.zones.length > 0) {
        console.log(`First zone: ${data.zones[0].zone_name}`);
      }
    }
    
    // Cache the data
    gardenateCache[plantName] = data;
    
    return data;
  } catch (error) {
    console.error(`Error fetching Gardenate data for ${plantName}:`, error);
    return null;
  }
};

/**
 * Get the best matching zone data for a plant based on location
 * @param {Object} gardenateData - The raw Gardenate data
 * @param {Object} zoneInfo - The user's zone information
 * @returns {Object|null} - The best matching zone data or null if not found
 */
export const getBestMatchingZone = (gardenateData, zoneInfo) => {
  if (!gardenateData || !gardenateData.zones || !zoneInfo) {
    console.log("Missing data for zone matching:", { gardenateData: !!gardenateData, zones: gardenateData?.zones?.length, zoneInfo: !!zoneInfo });
    return null;
  }
  
  // Determine the best matching zone based on user's location
  let zonePreference = ['Australia - temperate', 'Australia - sub-tropical', 'Australia - cool/mountain'];
  
  // If we have location information, prioritize the appropriate region
  if (zoneInfo.country) {
    const country = zoneInfo.country.toLowerCase();
    console.log("Country from zoneInfo:", country);
    
    if (country === 'gb' || country === 'uk' || country.includes('united kingdom') || country.includes('great britain')) {
      console.log("Using UK zones");
      zonePreference = [
        'United Kingdom - cool/temperate', 
        'United Kingdom - warm/temperate',
        'Australia - temperate' // Fallback
      ];
    } else if (country === 'nz' || country.includes('new zealand')) {
      console.log("Using NZ zones");
      zonePreference = [
        'New Zealand - temperate',
        'New Zealand - sub-tropical',
        'New Zealand - cool/mountain',
        'Australia - temperate' // Fallback
      ];
    } else if (country === 'au' || country.includes('australia')) {
      console.log("Using AU zones");
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
  
  console.log("Zone preference:", zonePreference);
  console.log("Available zones:", gardenateData.zones.map(zone => zone.zone_name));
  
  // Find the best matching zone
  let bestZone = null;
  for (const zoneName of zonePreference) {
    const matchingZone = gardenateData.zones.find(zone => zone.zone_name === zoneName);
    if (matchingZone) {
      bestZone = matchingZone;
      console.log("Found matching zone:", zoneName);
      break;
    }
  }
  
  // If no preferred zone found, use any available zone
  if (!bestZone && gardenateData.zones.length > 0) {
    bestZone = gardenateData.zones[0];
    console.log("Using default zone:", bestZone.zone_name);
  }
  
  if (!bestZone || !bestZone.data || !bestZone.data.monthly_calendar) {
    console.log("No valid calendar data found");
    return null;
  }
  
  return bestZone;
};

/**
 * Get planting months for a specific planting type
 * @param {Object} gardenateData - The raw Gardenate data
 * @param {string} plantingType - The type of planting (indoor_seed, direct_sow, transplant)
 * @param {Object} zoneInfo - The user's zone information
 * @returns {Array<number>} - Array of months (0-11) for the planting type
 */
export const getPlantingMonths = (gardenateData, plantingType, zoneInfo) => {
  if (!gardenateData) {
    console.log("No Gardenate data provided");
    return [];
  }
  
  // Log the structure of the data to help debug
  console.log("Gardenate data structure:", Object.keys(gardenateData));
  
  // Handle different data structures
  let zones = null;
  
  // Check if this is the all_ file format
  if (gardenateData.zones) {
    zones = gardenateData.zones;
    console.log(`Found ${zones.length} zones in all_ format`);
  } 
  // Check if this is the complete_ file format
  else if (gardenateData.data && gardenateData.data.zones) {
    zones = gardenateData.data.zones;
    console.log(`Found ${zones.length} zones in complete_ format`);
  }
  // Check if this is another format we might have
  else if (gardenateData.monthly_calendars) {
    // This is likely the database format, handle it differently
    console.log("Using database format with monthly_calendars");
    return getMonthsFromDatabaseFormat(gardenateData, plantingType, zoneInfo);
  }
  
  if (!zones || zones.length === 0) {
    console.log("No zones found in Gardenate data");
    return [];
  }
  
  // Get the best matching zone based on user's location
  const bestZone = getBestMatchingZone(gardenateData, zoneInfo);
  
  if (!bestZone || !bestZone.data || !bestZone.data.monthly_calendar) {
    console.log("No valid calendar data found in best matching zone");
    return [];
  }
  
  // Map the monthly calendar to our format
  const monthlyCalendar = bestZone.data.monthly_calendar;
  console.log("Monthly calendar for zone", bestZone.zone_name, ":", monthlyCalendar);
  
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
    'S': 'indoor_seed',  // 'S' means "Plant undercover in seed trays" (indoor seeding)
    'P': 'direct_sow',   // 'P' means "Plant directly in the ground" (direct sowing)
    'T': 'transplant'    // 'T' means "Transplant seedlings" (transplanting)
  };
  
  console.log("Monthly calendar data:", monthlyCalendar);
  console.log("Using code mapping:", codeMapping);
  
  // Process each month in the calendar
  for (const [month, codes] of Object.entries(monthlyCalendar)) {
    const monthNumber = monthMap[month.toLowerCase()];
    
    console.log(`Processing month ${month} (${monthNumber}) with codes:`, codes);
    
    if (codes && Array.isArray(codes)) {
      codes.forEach(code => {
        const mappedType = codeMapping[code];
        if (mappedType && !formattedCalendar[mappedType].includes(monthNumber)) {
          formattedCalendar[mappedType].push(monthNumber);
          console.log(`Added month ${month} (${monthNumber}) to ${mappedType} for code ${code}`);
        } else if (!mappedType) {
          console.log(`Warning: Unknown code ${code} for month ${month}`);
        }
      });
    } else {
      console.log(`Warning: Invalid codes format for month ${month}:`, codes);
    }
  }
  
  // Sort the month arrays for better display
  formattedCalendar.indoor_seed.sort((a, b) => a - b);
  formattedCalendar.direct_sow.sort((a, b) => a - b);
  formattedCalendar.transplant.sort((a, b) => a - b);
  
  console.log("Formatted calendar for", plantingType, ":", formattedCalendar[plantingType]);
  
  // Return the months for the requested planting type
  return formattedCalendar[plantingType] || [];
};

/**
 * Get planting months from the database format
 * @param {Object} gardenateData - The database format Gardenate data
 * @param {string} plantingType - The type of planting
 * @param {Object} zoneInfo - The user's zone information
 * @returns {Array<number>} - Array of months (0-11) for the planting type
 */
const getMonthsFromDatabaseFormat = (gardenateData, plantingType, zoneInfo) => {
  if (!gardenateData.monthly_calendars) return [];
  
  // Determine the best matching zone based on user's location
  let zonePreference = ['Australia - temperate', 'Australia - sub-tropical', 'Australia - cool/mountain'];
  
  // If we have location information, prioritize the appropriate region
  if (zoneInfo && zoneInfo.country) {
    const country = zoneInfo.country.toLowerCase();
    
    if (country === 'gb' || country === 'uk' || country.includes('united kingdom') || country.includes('great britain')) {
      zonePreference = [
        'United Kingdom - cool/temperate', 
        'United Kingdom - warm/temperate',
        'Australia - temperate' // Fallback
      ];
    } else if (country === 'nz' || country.includes('new zealand')) {
      zonePreference = [
        'New Zealand - temperate',
        'New Zealand - sub-tropical',
        'New Zealand - cool/mountain',
        'Australia - temperate' // Fallback
      ];
    } else if (country === 'au' || country.includes('australia')) {
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
  
  // Find the best matching zone
  let bestCalendar = null;
  
  // First try preferred zones
  for (const zoneName of zonePreference) {
    if (gardenateData.monthly_calendars[zoneName]) {
      bestCalendar = gardenateData.monthly_calendars[zoneName].calendar;
      console.log("Found calendar for zone:", zoneName);
      break;
    }
  }
  
  // If no preferred zone found, use any available calendar
  if (!bestCalendar) {
    for (const zoneName in gardenateData.monthly_calendars) {
      if (gardenateData.monthly_calendars[zoneName].calendar) {
        bestCalendar = gardenateData.monthly_calendars[zoneName].calendar;
        break;
      }
    }
  }
  
  // Return the months for the requested planting type
  return bestCalendar && bestCalendar[plantingType] ? bestCalendar[plantingType] : [];
}; 