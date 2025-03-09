const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plant = require('../models/Plant');

// Load environment variables
dotenv.config();

// Connect to database
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('DB connection successful'))
  .catch(err => {
    console.error('DB connection error:', err);
    process.exit(1);
  });

// API configurations
const trefleConfig = {
  baseURL: 'https://trefle.io/api/v1/',
  token: process.env.TREFLE_API_TOKEN,
  limit: 100 // Number of plants to fetch per request
};

const openFarmConfig = {
  baseURL: 'https://openfarm.cc/api/v1/',
  limit: 100
};

// Transform Trefle.io data to our Plant model
const transformTrefleData = (trefleData) => {
  return {
    name: trefleData.common_name || trefleData.scientific_name,
    scientific_name: trefleData.scientific_name,
    description: trefleData.main_species?.description || '',
    image_url: trefleData.image_url,
    growing_requirements: {
      sunlight: mapSunlight(trefleData.main_species?.growth?.light),
      soil_ph: {
        min: trefleData.main_species?.growth?.ph_minimum,
        max: trefleData.main_species?.growth?.ph_maximum
      },
      soil_type: mapSoilTypes(trefleData.main_species?.growth?.soil_texture),
      water_needs: mapWaterNeeds(trefleData.main_species?.growth?.moisture_use),
      min_temperature: trefleData.main_species?.growth?.minimum_temperature?.deg_f,
      max_temperature: trefleData.main_species?.growth?.maximum_temperature?.deg_f
    },
    hardiness_zones: {
      min: mapMinZone(trefleData.main_species?.growth?.minimum_temperature?.deg_f),
      max: mapMaxZone(trefleData.main_species?.growth?.maximum_temperature?.deg_f)
    },
    life_cycle: mapLifeCycle(trefleData.main_species?.specifications?.growth_form),
    tags: generateTags(trefleData)
  };
};

// Transform OpenFarm data to our Plant model
const transformOpenFarmData = (openFarmData) => {
  const cropData = openFarmData.data.attributes;
  return {
    name: cropData.name,
    description: cropData.description || '',
    image_url: cropData.main_image_path,
    growing_requirements: {
      sunlight: mapOpenFarmSunlight(cropData.sun_requirements),
      soil_type: cropData.growing_degree_days ? ['loam'] : [],
      water_needs: mapOpenFarmWaterNeeds(cropData.growing_degree_days)
    },
    growing_calendar: extractGrowingCalendar(cropData),
    hardiness_zones: {
      min: '3', // Default values if not specified
      max: '9'
    },
    life_cycle: determineLifeCycle(cropData),
    days_to_maturity: {
      min: cropData.growing_degree_days ? Math.floor(cropData.growing_degree_days / 10) : null,
      max: cropData.growing_degree_days ? Math.ceil(cropData.growing_degree_days / 8) : null
    },
    spacing: {
      plants: cropData.row_spacing,
      rows: cropData.height
    },
    tags: ['vegetable', 'edible']
  };
};

// Helper functions for data mapping
const mapSunlight = (light) => {
  if (!light) return 'full sun';
  // Map Trefle light values to our model
  if (light >= 8) return 'full sun';
  if (light >= 6) return 'partial sun';
  if (light >= 4) return 'partial shade';
  return 'full shade';
};

const mapSoilTypes = (texture) => {
  if (!texture) return ['loam'];
  const soilMap = {
    'fine': ['clay'],
    'medium': ['loam'],
    'coarse': ['sandy']
  };
  return soilMap[texture] || ['loam'];
};

const mapWaterNeeds = (moisture) => {
  if (!moisture) return 'moderate';
  // Map Trefle moisture values to our model
  if (moisture >= 8) return 'high';
  if (moisture >= 4) return 'moderate';
  return 'low';
};

const mapMinZone = (temp) => {
  if (!temp) return '5';
  // Simple mapping of minimum temperature to USDA zone
  if (temp <= -50) return '1';
  if (temp <= -40) return '2';
  if (temp <= -30) return '3';
  if (temp <= -20) return '4';
  if (temp <= -10) return '5';
  if (temp <= 0) return '6';
  if (temp <= 10) return '7';
  if (temp <= 20) return '8';
  if (temp <= 30) return '9';
  if (temp <= 40) return '10';
  return '11';
};

const mapMaxZone = (temp) => {
  if (!temp) return '9';
  // Simple mapping of maximum temperature to USDA zone
  return '13';
};

const mapLifeCycle = (form) => {
  if (!form) return 'annual';
  if (form.includes('Annual')) return 'annual';
  if (form.includes('Biennial')) return 'biennial';
  return 'perennial';
};

const generateTags = (plant) => {
  const tags = [];
  
  if (plant.vegetable) tags.push('vegetable');
  if (plant.edible) tags.push('edible');
  if (plant.flower) tags.push('flower');
  if (plant.fruit) tags.push('fruit');
  if (plant.herb) tags.push('herb');
  
  return tags.length ? tags : ['plant'];
};

// OpenFarm specific mappers
const mapOpenFarmSunlight = (sunRequirement) => {
  if (!sunRequirement) return 'full sun';
  
  if (sunRequirement.includes('Full')) return 'full sun';
  if (sunRequirement.includes('Partial')) return 'partial sun';
  return 'partial shade';
};

const mapOpenFarmWaterNeeds = (growingDays) => {
  if (!growingDays) return 'moderate';
  
  if (growingDays > 120) return 'high';
  if (growingDays > 60) return 'moderate';
  return 'low';
};

const determineLifeCycle = (cropData) => {
  // Try to determine life cycle from OpenFarm data
  if (cropData.perennial) return 'perennial';
  return 'annual';
};

const extractGrowingCalendar = (cropData) => {
  const calendar = {
    indoor_seed_start: {},
    direct_sow: { spring: {}, fall: {} },
    transplant: {}
  };
  
  // Extract calendar data if available
  if (cropData.sowing_method === 'indoor') {
    calendar.indoor_seed_start.weeks_before_last_frost = 6; // Default value
  }
  
  return calendar;
};

// Fetch plants from Trefle API
const fetchFromTrefle = async () => {
  try {
    const response = await axios.get(`${trefleConfig.baseURL}plants`, {
      params: {
        token: trefleConfig.token,
        limit: trefleConfig.limit,
        filter: {
          edible: true
        }
      }
    });
    
    console.log(`Fetched ${response.data.data.length} plants from Trefle`);
    
    return response.data.data.map(plant => transformTrefleData(plant));
  } catch (error) {
    console.error('Error fetching from Trefle:', error.message);
    return [];
  }
};

// Fetch plants from OpenFarm API
const fetchFromOpenFarm = async () => {
  try {
    const response = await axios.get(`${openFarmConfig.baseURL}crops`, {
      params: {
        limit: openFarmConfig.limit
      }
    });
    
    console.log(`Fetched ${response.data.data.length} plants from OpenFarm`);
    
    return response.data.data.map(plant => transformOpenFarmData(plant));
  } catch (error) {
    console.error('Error fetching from OpenFarm:', error.message);
    return [];
  }
};

// Add vegetable data manually for common vegetables not well covered by APIs
const getCommonVegetables = () => {
  return [
    {
      name: 'Radish',
      scientific_name: 'Raphanus sativus',
      description: 'A quick-growing, round or oblong root vegetable with a peppery flavor.',
      image_url: 'https://example.com/radish.jpg',
      growing_requirements: {
        sunlight: 'full sun',
        soil_ph: { min: 6.0, max: 7.0 },
        soil_type: ['sandy', 'loam'],
        water_needs: 'moderate',
        min_temperature: 40,
        max_temperature: 85
      },
      growing_calendar: {
        direct_sow: {
          spring: { weeks_from_last_frost: 0 },
          fall: { weeks_before_first_frost: 8 }
        }
      },
      hardiness_zones: { min: '2', max: '11' },
      life_cycle: 'annual',
      days_to_maturity: { min: 21, max: 30 },
      spacing: { plants: 2, rows: 6 },
      planting_depth: 0.5,
      tags: ['vegetable', 'root crop', 'quick growing']
    },
    {
      name: 'Celery',
      scientific_name: 'Apium graveolens',
      description: 'A marshland plant with long fibrous stalks that taper into leaves.',
      image_url: 'https://example.com/celery.jpg',
      growing_requirements: {
        sunlight: 'full sun',
        soil_ph: { min: 6.0, max: 7.0 },
        soil_type: ['rich', 'moist', 'loam'],
        water_needs: 'high',
        min_temperature: 40,
        max_temperature: 75
      },
      growing_calendar: {
        indoor_seed_start: { weeks_before_last_frost: 10 },
        transplant: { weeks_after_last_frost: 2 }
      },
      hardiness_zones: { min: '3', max: '10' },
      life_cycle: 'biennial',
      days_to_maturity: { min: 85, max: 120 },
      spacing: { plants: 6, rows: 24 },
      planting_depth: 0.25,
      tags: ['vegetable', 'slow growing']
    },
    // Add more common vegetables here
  ];
};

// Save plants to the database
const savePlantsToDatabase = async (plants) => {
  let savedCount = 0;
  let errorCount = 0;
  
  for (const plant of plants) {
    try {
      // Check if this plant already exists by name
      const existingPlant = await Plant.findOne({ name: plant.name });
      
      if (existingPlant) {
        console.log(`Plant "${plant.name}" already exists, skipping`);
        continue;
      }
      
      // Create the new plant
      await Plant.create(plant);
      savedCount++;
      console.log(`Saved plant: ${plant.name}`);
    } catch (error) {
      errorCount++;
      console.error(`Error saving plant ${plant.name}:`, error.message);
    }
  }
  
  console.log(`Import complete: ${savedCount} plants saved, ${errorCount} errors`);
};

// Main function to run the import
const importPlants = async () => {
  console.log('Starting plant import process...');
  
  // Collect plants from different sources
  const treflePlants = await fetchFromTrefle();
  const openFarmPlants = await fetchFromOpenFarm();
  const commonVegetables = getCommonVegetables();
  
  // Combine all plant data
  const allPlants = [
    ...treflePlants,
    ...openFarmPlants,
    ...commonVegetables
  ];
  
  console.log(`Total plants to import: ${allPlants.length}`);
  
  // Save to database
  await savePlantsToDatabase(allPlants);
  
  // Disconnect from database
  mongoose.disconnect();
  console.log('Import process finished');
};

// Run the import
importPlants();