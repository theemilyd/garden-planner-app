/**
 * Script to integrate Gardenate data with the existing plant database
 * 
 * This script:
 * 1. Reads the Gardenate data from the JSON files
 * 2. Formats it to match the existing database structure
 * 3. Integrates the data with the existing plant database
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Plant = require('../models/Plant');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Map Gardenate climate zones to our hardiness zones
const climateZoneToHardinessZone = {
  'Australia - arid': { min: '9a', max: '11b' },
  'Australia - cool/mountain': { min: '7a', max: '9b' },
  'Australia - sub-tropical': { min: '9a', max: '11b' },
  'Australia - temperate': { min: '8a', max: '10b' },
  'Australia - tropical': { min: '10a', max: '13b' },
  'New Zealand - cool/mountain': { min: '7a', max: '9b' },
  'New Zealand - sub-tropical': { min: '9a', max: '11b' },
  'New Zealand - temperate': { min: '8a', max: '10b' },
  'United Kingdom - cool/temperate': { min: '6a', max: '9b' },
  'United Kingdom - warm/temperate': { min: '7a', max: '10b' }
};

// Map Gardenate monthly calendar codes to our planting types
const calendarCodeMapping = {
  'S': 'indoor_seed', // Plant undercover in seed trays
  'T': 'transplant',  // Transplant seedlings
  'P': 'direct_sow'   // Plant directly in the ground
};

// Path to the Gardenate data directory
const gardenateDataPath = path.join(__dirname, '../../garden_data');

/**
 * Read all plant data from the Gardenate data directory
 * @returns {Array} Array of plant data objects
 */
async function readGardenateData() {
  try {
    console.log(`Reading Gardenate data from ${gardenateDataPath}`);
    
    // Check if the directory exists
    if (!fs.existsSync(gardenateDataPath)) {
      console.error(`Directory not found: ${gardenateDataPath}`);
      return [];
    }
    
    // Read all files in the directory
    const files = fs.readdirSync(gardenateDataPath);
    console.log(`Found ${files.length} files in the directory`);
    
    // Filter for plant JSON files (*.json) that don't have prefixes
    const plantFiles = files.filter(file => 
      file.endsWith('.json') && 
      !file.startsWith('all_') && 
      !file.startsWith('complete_') && 
      !file.startsWith('final_') && 
      !file.startsWith('improved_') &&
      !file.includes('test_plants')
    );
    console.log(`Found ${plantFiles.length} plant JSON files`);
    
    if (plantFiles.length === 0) {
      console.error('No plant JSON files found');
      return [];
    }
    
    // Read each plant file
    const plants = [];
    for (const file of plantFiles) {
      const filePath = path.join(gardenateDataPath, file);
      console.log(`Reading file: ${filePath}`);
      
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        const plantData = JSON.parse(data);
        plants.push(plantData);
      } catch (fileError) {
        console.error(`Error reading file ${file}:`, fileError);
      }
    }
    
    console.log(`Successfully read ${plants.length} plant data files`);
    return plants;
  } catch (error) {
    console.error('Error reading Gardenate data:', error);
    return [];
  }
}

/**
 * Convert Gardenate monthly calendar to our format
 * @param {Object} monthlyCalendar - Gardenate monthly calendar object
 * @returns {Object} Formatted monthly calendar
 */
function formatMonthlyCalendar(monthlyCalendar) {
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

  // Process each month in the calendar
  for (const [month, codes] of Object.entries(monthlyCalendar)) {
    const monthNumber = monthMap[month.toLowerCase()];
    
    if (codes && Array.isArray(codes)) {
      codes.forEach(code => {
        const plantingType = calendarCodeMapping[code];
        if (plantingType && !formattedCalendar[plantingType].includes(monthNumber)) {
          formattedCalendar[plantingType].push(monthNumber);
        }
      });
    }
  }

  // Sort the month arrays for better display
  formattedCalendar.indoor_seed.sort((a, b) => a - b);
  formattedCalendar.direct_sow.sort((a, b) => a - b);
  formattedCalendar.transplant.sort((a, b) => a - b);

  return formattedCalendar;
}

/**
 * Format spacing information from Gardenate
 * @param {String} spacingText - Spacing text from Gardenate
 * @returns {Object} Formatted spacing object
 */
function formatSpacing(spacingText) {
  if (!spacingText) return { plants: null, rows: null };

  // Try to extract numbers from the spacing text
  const numbers = spacingText.match(/\d+/g);
  if (!numbers || numbers.length === 0) return { plants: null, rows: null };

  // If there's only one number, use it for both plants and rows
  if (numbers.length === 1) {
    return { plants: parseInt(numbers[0]), rows: parseInt(numbers[0]) };
  }

  // If there are two numbers, use the first for plants and the second for rows
  return { plants: parseInt(numbers[0]), rows: parseInt(numbers[1]) };
}

/**
 * Format harvest time information from Gardenate
 * @param {String} harvestText - Harvest time text from Gardenate
 * @returns {Object} Formatted days to maturity object
 */
function formatHarvestTime(harvestText) {
  if (!harvestText) return { min: null, max: null };

  // Try to extract numbers from the harvest text
  const numbers = harvestText.match(/\d+/g);
  if (!numbers || numbers.length === 0) return { min: null, max: null };

  // If there's only one number, use it for both min and max
  if (numbers.length === 1) {
    return { min: parseInt(numbers[0]), max: parseInt(numbers[0]) };
  }

  // If there are two numbers, use the smaller for min and the larger for max
  const num1 = parseInt(numbers[0]);
  const num2 = parseInt(numbers[1]);
  return { min: Math.min(num1, num2), max: Math.max(num1, num2) };
}

/**
 * Format companion plants from Gardenate
 * @param {Array} companionPlants - Array of companion plant names
 * @returns {Array} Formatted companion plants array
 */
function formatCompanionPlants(companionPlants) {
  if (!companionPlants || !Array.isArray(companionPlants)) return [];

  return companionPlants.map(plant => ({
    plant: null, // Will be populated later with plant ID
    relationship: 'beneficial',
    notes: `Recommended companion plant from Gardenate`
  }));
}

/**
 * Format plants to avoid from Gardenate
 * @param {Array} avoidPlants - Array of plants to avoid
 * @returns {Array} Formatted plants to avoid array
 */
function formatAvoidPlants(avoidPlants) {
  if (!avoidPlants || !Array.isArray(avoidPlants)) return [];

  return avoidPlants.map(plant => ({
    plant: null, // Will be populated later with plant ID
    relationship: 'harmful',
    notes: `Avoid planting together according to Gardenate`
  }));
}

/**
 * Format growing requirements from Gardenate
 * @param {Object} growingInfo - Growing info from Gardenate
 * @returns {Object} Formatted growing requirements
 */
function formatGrowingRequirements(growingInfo) {
  const requirements = {
    sunlight: 'full sun', // Default value
    soil_ph: { min: null, max: null },
    soil_type: [],
    water_needs: 'moderate', // Default value
    min_temperature: null,
    max_temperature: null,
    soil_temperature: { min: null, optimal: null, maximum: null }
  };

  // Extract soil temperature if available
  if (growingInfo.soil_temperature) {
    const tempMatch = growingInfo.soil_temperature.match(/(\d+)°C and (\d+)°C/);
    if (tempMatch) {
      requirements.soil_temperature.min = parseInt(tempMatch[1]);
      requirements.soil_temperature.optimal = (parseInt(tempMatch[1]) + parseInt(tempMatch[2])) / 2;
      requirements.soil_temperature.maximum = parseInt(tempMatch[2]);
    }
  }

  // Extract sunlight requirements from notes
  if (growingInfo.additional_notes && Array.isArray(growingInfo.additional_notes)) {
    for (const note of growingInfo.additional_notes) {
      if (note.toLowerCase().includes('shade') || note.toLowerCase().includes('partial sun')) {
        requirements.sunlight = 'partial shade';
      }
      if (note.toLowerCase().includes('full shade')) {
        requirements.sunlight = 'full shade';
      }
      if (note.toLowerCase().includes('water') && note.toLowerCase().includes('regular')) {
        requirements.water_needs = 'high';
      }
      if (note.toLowerCase().includes('drought') || note.toLowerCase().includes('dry')) {
        requirements.water_needs = 'low';
      }
    }
  }

  return requirements;
}

/**
 * Format a Gardenate plant to match our database structure
 * @param {Object} gardenatePlant - Plant data from Gardenate
 * @returns {Object} Formatted plant data
 */
function formatPlantData(gardenatePlant) {
  // Check if the plant has zones data
  if (!gardenatePlant || !gardenatePlant.zones || gardenatePlant.zones.length === 0) {
    console.warn('Invalid plant data structure:', gardenatePlant?.name || 'Unknown plant');
    return null;
  }

  // Get the first zone data (we'll merge data from all zones)
  const firstZoneData = gardenatePlant.zones[0]?.data;
  if (!firstZoneData) return null;

  // Initialize the formatted plant data
  const formattedPlant = {
    name: gardenatePlant.name || firstZoneData.plant_name,
    scientific_name: firstZoneData.scientific_name || '',
    description: '',
    image_url: '',
    growing_requirements: formatGrowingRequirements(firstZoneData.growing_info),
    growing_calendar: {
      indoor_seed_start: { weeks_before_last_frost: null, notes: '' },
      direct_sow: {
        spring: { weeks_from_last_frost: null, soil_temperature_required: null, notes: '' },
        fall: { weeks_before_first_frost: null, notes: '' }
      },
      transplant: { weeks_after_last_frost: null, hardening_off_days: 7, notes: '' },
      succession_planting: {
        recommended: false,
        interval_days: 14,
        max_plantings: 3,
        notes: ''
      }
    },
    hardiness_zones: { min: '1a', max: '13b' }, // Default to all zones, will be refined later
    microclimate_adjustments: {
      heat_sensitivity: 'moderate',
      cold_sensitivity: 'moderate',
      wind_sensitivity: 'moderate',
      shade_tolerance: 'moderate'
    },
    life_cycle: 'annual', // Default value
    days_to_maturity: formatHarvestTime(firstZoneData.growing_info?.harvest_time),
    days_to_germination: { min: null, max: null, optimal_temp: null },
    spacing: formatSpacing(firstZoneData.growing_info?.spacing),
    planting_depth: null,
    height: { min: null, max: null },
    width: { min: null, max: null },
    companion_plants: formatCompanionPlants(firstZoneData.companion_plants),
    pests: [],
    diseases: [],
    harvesting: {
      instructions: '',
      storage: '',
      indicators: [],
      window_length: null,
      preservation_methods: []
    },
    edible_parts: [],
    culinary_uses: firstZoneData.culinary_hints || [],
    tags: [],
    community_success_rates: {
      germination: null,
      yield: null,
      difficulty: 3 // Default medium difficulty
    },
    icon: 'default_plant',
    plant_family: firstZoneData.family || '',
    plant_family_icon: '',
    // Add Gardenate-specific data
    gardenate_data: {
      monthly_calendars: {},
      alternative_names: firstZoneData.alternative_names || [],
      notes: firstZoneData.growing_info?.additional_notes || []
    }
  };

  // Add description from notes
  if (firstZoneData.growing_info?.additional_notes && firstZoneData.growing_info.additional_notes.length > 0) {
    formattedPlant.description = firstZoneData.growing_info.additional_notes.join(' ');
  }

  // Add harvesting instructions
  if (firstZoneData.growing_info?.additional_notes) {
    const harvestNotes = firstZoneData.growing_info.additional_notes.filter(note => 
      note.toLowerCase().includes('harvest') || 
      note.toLowerCase().includes('pick') || 
      note.toLowerCase().includes('collect')
    );
    if (harvestNotes.length > 0) {
      formattedPlant.harvesting.instructions = harvestNotes.join(' ');
    }
  }

  // Add culinary uses
  if (firstZoneData.culinary_hints && firstZoneData.culinary_hints.length > 0) {
    formattedPlant.harvesting.storage = firstZoneData.culinary_hints.filter(hint => 
      hint.toLowerCase().includes('store') || 
      hint.toLowerCase().includes('keep') || 
      hint.toLowerCase().includes('preserve')
    ).join(' ');
  }

  // Process monthly calendars from all zones
  gardenatePlant.zones.forEach(zone => {
    if (zone.data && zone.data.monthly_calendar) {
      formattedPlant.gardenate_data.monthly_calendars[zone.zone_name] = {
        zone_number: zone.zone_number,
        calendar: formatMonthlyCalendar(zone.data.monthly_calendar)
      };
    }
  });

  // Set tags based on plant family
  if (firstZoneData.family) {
    if (firstZoneData.family.toLowerCase().includes('solanaceae')) {
      formattedPlant.tags.push('nightshade');
    }
    if (firstZoneData.family.toLowerCase().includes('brassicaceae') || 
        firstZoneData.family.toLowerCase().includes('cruciferae')) {
      formattedPlant.tags.push('brassica');
    }
    if (firstZoneData.family.toLowerCase().includes('apiaceae') || 
        firstZoneData.family.toLowerCase().includes('umbelliferae')) {
      formattedPlant.tags.push('umbelliferous');
    }
    if (firstZoneData.family.toLowerCase().includes('fabaceae') || 
        firstZoneData.family.toLowerCase().includes('leguminosae')) {
      formattedPlant.tags.push('legume');
    }
    if (firstZoneData.family.toLowerCase().includes('cucurbitaceae')) {
      formattedPlant.tags.push('cucurbit');
    }
    if (firstZoneData.family.toLowerCase().includes('asteraceae') || 
        firstZoneData.family.toLowerCase().includes('compositae')) {
      formattedPlant.tags.push('composite');
    }
    if (firstZoneData.family.toLowerCase().includes('lamiaceae') || 
        firstZoneData.family.toLowerCase().includes('labiatae')) {
      formattedPlant.tags.push('herb');
    }
    if (firstZoneData.family.toLowerCase().includes('alliaceae') || 
        firstZoneData.family.toLowerCase().includes('amaryllidaceae')) {
      formattedPlant.tags.push('allium');
    }
  }

  // Add vegetable tag by default
  if (!formattedPlant.tags.includes('herb')) {
    formattedPlant.tags.push('vegetable');
  }

  return formattedPlant;
}

/**
 * Integrate Gardenate data with the existing plant database
 */
async function integrateGardenateData() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Read Gardenate data
    const gardenatePlants = await readGardenateData();
    console.log(`Read ${gardenatePlants.length} plants from Gardenate data`);

    if (gardenatePlants.length === 0) {
      console.error('No plants found in Gardenate data. Aborting integration.');
      return;
    }

    // Check if there are any plants in the database
    const existingPlantsCount = await Plant.countDocuments();
    console.log(`Found ${existingPlantsCount} existing plants in the database`);

    // Process each plant
    let updatedCount = 0;
    let createdCount = 0;
    
    for (const gardenatePlant of gardenatePlants) {
      // Skip if the plant data is invalid
      if (!gardenatePlant || !gardenatePlant.zones || gardenatePlant.zones.length === 0) {
        console.warn('Skipping invalid plant data:', gardenatePlant?.name || 'Unknown plant');
        continue;
      }
      
      const formattedPlant = formatPlantData(gardenatePlant);
      if (!formattedPlant) {
        console.warn('Failed to format plant data:', gardenatePlant?.name || 'Unknown plant');
        continue;
      }

      // Check if the plant already exists in the database
      const existingPlant = await Plant.findOne({ 
        $or: [
          { name: { $regex: new RegExp(`^${formattedPlant.name}$`, 'i') } },
          { name: { $regex: new RegExp(`^${formattedPlant.name.split(' ')[0]}$`, 'i') } } // Match on first word
        ]
      });

      if (existingPlant) {
        console.log(`Updating existing plant: ${formattedPlant.name}`);
        
        // Update the existing plant with Gardenate data
        existingPlant.gardenate_data = formattedPlant.gardenate_data;
        
        // Update scientific name if it's empty
        if (!existingPlant.scientific_name && formattedPlant.scientific_name) {
          existingPlant.scientific_name = formattedPlant.scientific_name;
        }
        
        // Update description if it's empty
        if (!existingPlant.description && formattedPlant.description) {
          existingPlant.description = formattedPlant.description;
        }
        
        // Update plant family if it's empty
        if (!existingPlant.plant_family && formattedPlant.plant_family) {
          existingPlant.plant_family = formattedPlant.plant_family;
        }
        
        // Update culinary uses if they're empty
        if ((!existingPlant.culinary_uses || existingPlant.culinary_uses.length === 0) && 
            formattedPlant.culinary_uses && formattedPlant.culinary_uses.length > 0) {
          existingPlant.culinary_uses = formattedPlant.culinary_uses;
        }
        
        // Update companion plants if they're empty
        if ((!existingPlant.companion_plants || existingPlant.companion_plants.length === 0) && 
            formattedPlant.companion_plants && formattedPlant.companion_plants.length > 0) {
          existingPlant.companion_plants = formattedPlant.companion_plants;
        }
        
        // Update spacing if it's empty
        if ((!existingPlant.spacing || !existingPlant.spacing.plants) && 
            formattedPlant.spacing && formattedPlant.spacing.plants) {
          existingPlant.spacing = formattedPlant.spacing;
        }
        
        // Update days to maturity if it's empty
        if ((!existingPlant.days_to_maturity || !existingPlant.days_to_maturity.min) && 
            formattedPlant.days_to_maturity && formattedPlant.days_to_maturity.min) {
          existingPlant.days_to_maturity = formattedPlant.days_to_maturity;
        }
        
        // Update growing calendar with Gardenate recommendations
        if (formattedPlant.gardenate_data && formattedPlant.gardenate_data.monthly_calendars) {
          // Find the most relevant calendar for the plant's growing zone
          let bestCalendar = null;
          const zonePreference = ['Australia - temperate', 'Australia - sub-tropical', 'Australia - cool/mountain'];
          
          for (const zoneName of zonePreference) {
            if (formattedPlant.gardenate_data.monthly_calendars[zoneName]) {
              bestCalendar = formattedPlant.gardenate_data.monthly_calendars[zoneName].calendar;
              break;
            }
          }
          
          // If no preferred zone found, use any available calendar
          if (!bestCalendar) {
            for (const [zoneName, zoneData] of Object.entries(formattedPlant.gardenate_data.monthly_calendars)) {
              bestCalendar = zoneData.calendar;
              break;
            }
          }
          
          // Update growing calendar with Gardenate data
          if (bestCalendar) {
            // Add notes about Gardenate recommendations
            if (bestCalendar.indoor_seed && bestCalendar.indoor_seed.length > 0) {
              const months = bestCalendar.indoor_seed.map(m => {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return monthNames[m];
              }).join(', ');
              
              if (!existingPlant.growing_calendar) {
                existingPlant.growing_calendar = {};
              }
              
              if (!existingPlant.growing_calendar.indoor_seed_start) {
                existingPlant.growing_calendar.indoor_seed_start = {};
              }
              
              existingPlant.growing_calendar.indoor_seed_start.notes = 
                `Gardenate recommends starting indoors in: ${months}`;
            }
            
            if (bestCalendar.transplant && bestCalendar.transplant.length > 0) {
              const months = bestCalendar.transplant.map(m => {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return monthNames[m];
              }).join(', ');
              
              if (!existingPlant.growing_calendar) {
                existingPlant.growing_calendar = {};
              }
              
              if (!existingPlant.growing_calendar.transplant) {
                existingPlant.growing_calendar.transplant = {};
              }
              
              existingPlant.growing_calendar.transplant.notes = 
                `Gardenate recommends transplanting in: ${months}`;
            }
            
            if (bestCalendar.direct_sow && bestCalendar.direct_sow.length > 0) {
              const months = bestCalendar.direct_sow.map(m => {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return monthNames[m];
              }).join(', ');
              
              if (!existingPlant.growing_calendar) {
                existingPlant.growing_calendar = {};
              }
              
              if (!existingPlant.growing_calendar.direct_sow) {
                existingPlant.growing_calendar.direct_sow = {
                  spring: {},
                  fall: {}
                };
              }
              
              existingPlant.growing_calendar.direct_sow.spring.notes = 
                `Gardenate recommends direct sowing in: ${months}`;
            }
          }
        }
        
        // Save the updated plant
        await existingPlant.save();
        updatedCount++;
      } else {
        console.log(`Creating new plant: ${formattedPlant.name}`);
        
        // Create a new plant with the Gardenate data
        await Plant.create(formattedPlant);
        createdCount++;
      }
    }

    // If there are no plants in the database, create them directly from the Gardenate data
    if (existingPlantsCount === 0 && createdCount === 0) {
      console.log('No existing plants found. Creating plants directly from Gardenate data...');
      
      const plantsToCreate = [];
      
      for (const gardenatePlant of gardenatePlants) {
        if (!gardenatePlant || !gardenatePlant.zones || gardenatePlant.zones.length === 0) {
          continue;
        }
        
        const formattedPlant = formatPlantData(gardenatePlant);
        if (!formattedPlant) {
          continue;
        }
        
        plantsToCreate.push(formattedPlant);
      }
      
      if (plantsToCreate.length > 0) {
        console.log(`Creating ${plantsToCreate.length} plants...`);
        await Plant.insertMany(plantsToCreate);
        createdCount = plantsToCreate.length;
      }
    }

    console.log(`Gardenate data integration complete. Updated ${updatedCount} plants, created ${createdCount} new plants.`);
  } catch (error) {
    console.error('Error integrating Gardenate data:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the integration script
integrateGardenateData(); 