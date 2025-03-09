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

// Common vegetables with detailed growing information
const vegetables = [
  {
    name: 'Carrot',
    scientific_name: 'Daucus carota subsp. sativus',
    description: 'Root vegetable, typically orange in color, though different varieties exist.',
    image_url: 'https://example.com/carrot.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 6.0, max: 7.0 },
      soil_type: ['sandy', 'loam'],
      water_needs: 'moderate',
      min_temperature: 45,
      max_temperature: 80,
      soil_temperature: { min: 45, optimal: 65 }
    },
    growing_calendar: {
      direct_sow: {
        spring: { weeks_from_last_frost: 2 },
        fall: { weeks_before_first_frost: 10 }
      }
    },
    hardiness_zones: { min: '3', max: '10' },
    life_cycle: 'biennial',
    days_to_maturity: { min: 60, max: 80 },
    spacing: { plants: 2, rows: 12 },
    planting_depth: 0.25,
    tags: ['vegetable', 'root crop']
  },
  {
    name: 'Lettuce',
    scientific_name: 'Lactuca sativa',
    description: 'Leafy green vegetable used primarily for salads.',
    image_url: 'https://example.com/lettuce.jpg',
    growing_requirements: {
      sunlight: 'partial sun',
      soil_ph: { min: 6.0, max: 7.0 },
      soil_type: ['loam', 'rich'],
      water_needs: 'moderate',
      min_temperature: 40,
      max_temperature: 75,
      soil_temperature: { min: 40, optimal: 65 }
    },
    growing_calendar: {
      direct_sow: {
        spring: { weeks_from_last_frost: 2 },
        fall: { weeks_before_first_frost: 8 }
      }
    },
    hardiness_zones: { min: '4', max: '9' },
    life_cycle: 'annual',
    days_to_maturity: { min: 45, max: 65 },
    spacing: { plants: 6, rows: 12 },
    planting_depth: 0.25,
    tags: ['vegetable', 'leafy green', 'salad']
  },
  {
    name: 'Cucumber',
    scientific_name: 'Cucumis sativus',
    description: 'Creeping vine plant that bears cylindrical fruits used as vegetables.',
    image_url: 'https://example.com/cucumber.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 6.0, max: 7.0 },
      soil_type: ['loam', 'rich'],
      water_needs: 'high',
      min_temperature: 60,
      max_temperature: 90,
      soil_temperature: { min: 60, optimal: 70 }
    },
    growing_calendar: {
      indoor_seed_start: { weeks_before_last_frost: 3 },
      direct_sow: { spring: { weeks_from_last_frost: 2 } },
      transplant: { weeks_after_last_frost: 2 }
    },
    hardiness_zones: { min: '4', max: '12' },
    life_cycle: 'annual',
    days_to_maturity: { min: 50, max: 70 },
    spacing: { plants: 12, rows: 36 },
    planting_depth: 0.5,
    companion_plants: [],
    tags: ['vegetable', 'vine', 'summer crop']
  },
  {
    name: 'Tomato',
    scientific_name: 'Solanum lycopersicum',
    description: 'Edible berry of the tomato plant, commonly red when ripe.',
    image_url: 'https://example.com/tomato.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 6.0, max: 6.8 },
      soil_type: ['loam', 'rich'],
      water_needs: 'moderate',
      min_temperature: 50,
      max_temperature: 85,
      soil_temperature: { min: 60, optimal: 70 }
    },
    growing_calendar: {
      indoor_seed_start: { weeks_before_last_frost: 6 },
      transplant: { weeks_after_last_frost: 2 }
    },
    hardiness_zones: { min: '5', max: '11' },
    life_cycle: 'annual',
    days_to_maturity: { min: 60, max: 100 },
    spacing: { plants: 24, rows: 36 },
    planting_depth: 0.25,
    tags: ['vegetable', 'fruit', 'summer crop']
  },
  {
    name: 'Spinach',
    scientific_name: 'Spinacia oleracea',
    description: 'Leafy green vegetable high in iron and vitamins.',
    image_url: 'https://example.com/spinach.jpg',
    growing_requirements: {
      sunlight: 'partial sun',
      soil_ph: { min: 6.0, max: 7.5 },
      soil_type: ['loam', 'rich'],
      water_needs: 'moderate',
      min_temperature: 35,
      max_temperature: 75,
      soil_temperature: { min: 40, optimal: 60 }
    },
    growing_calendar: {
      direct_sow: {
        spring: { weeks_from_last_frost: -4 }, // Negative means 4 weeks before last frost
        fall: { weeks_before_first_frost: 8 }
      }
    },
    hardiness_zones: { min: '3', max: '9' },
    life_cycle: 'annual',
    days_to_maturity: { min: 35, max: 45 },
    spacing: { plants: 3, rows: 12 },
    planting_depth: 0.5,
    tags: ['vegetable', 'leafy green', 'cool season']
  }
];

// Common herbs with detailed growing information
const herbs = [
  {
    name: 'Basil',
    scientific_name: 'Ocimum basilicum',
    description: 'Culinary herb with a sweet, aromatic flavor.',
    image_url: 'https://example.com/basil.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 6.0, max: 7.5 },
      soil_type: ['loam', 'rich'],
      water_needs: 'moderate',
      min_temperature: 50,
      max_temperature: 85,
      soil_temperature: { min: 65, optimal: 70 }
    },
    growing_calendar: {
      indoor_seed_start: { weeks_before_last_frost: 6 },
      direct_sow: { spring: { weeks_from_last_frost: 2 } },
      transplant: { weeks_after_last_frost: 2 }
    },
    hardiness_zones: { min: '4', max: '10' },
    life_cycle: 'annual',
    days_to_maturity: { min: 50, max: 70 },
    spacing: { plants: 8, rows: 12 },
    planting_depth: 0.25,
    tags: ['herb', 'edible', 'culinary']
  },
  {
    name: 'Cilantro',
    scientific_name: 'Coriandrum sativum',
    description: 'Herb with leaves used as cilantro and seeds used as coriander.',
    image_url: 'https://example.com/cilantro.jpg',
    growing_requirements: {
      sunlight: 'partial sun',
      soil_ph: { min: 6.2, max: 6.8 },
      soil_type: ['loam', 'well-drained'],
      water_needs: 'moderate',
      min_temperature: 40,
      max_temperature: 75,
      soil_temperature: { min: 55, optimal: 65 }
    },
    growing_calendar: {
      direct_sow: {
        spring: { weeks_from_last_frost: 2 },
        fall: { weeks_before_first_frost: 8 }
      }
    },
    hardiness_zones: { min: '3', max: '11' },
    life_cycle: 'annual',
    days_to_maturity: { min: 45, max: 70 },
    spacing: { plants: 6, rows: 12 },
    planting_depth: 0.25,
    tags: ['herb', 'edible', 'culinary']
  },
  {
    name: 'Parsley',
    scientific_name: 'Petroselinum crispum',
    description: 'Herb used in many cuisines as a garnish and flavoring.',
    image_url: 'https://example.com/parsley.jpg',
    growing_requirements: {
      sunlight: 'partial sun',
      soil_ph: { min: 5.5, max: 7.0 },
      soil_type: ['loam', 'rich'],
      water_needs: 'moderate',
      min_temperature: 40,
      max_temperature: 80,
      soil_temperature: { min: 50, optimal: 70 }
    },
    growing_calendar: {
      indoor_seed_start: { weeks_before_last_frost: 8 },
      direct_sow: { spring: { weeks_from_last_frost: 4 } },
      transplant: { weeks_after_last_frost: 2 }
    },
    hardiness_zones: { min: '5', max: '9' },
    life_cycle: 'biennial',
    days_to_maturity: { min: 70, max: 90 },
    spacing: { plants: 6, rows: 12 },
    planting_depth: 0.25,
    tags: ['herb', 'edible', 'culinary']
  }
];

// Common flowers with detailed growing information
const flowers = [
  {
    name: 'Sunflower',
    scientific_name: 'Helianthus annuus',
    description: 'Tall annual flower with large yellow blooms that follow the sun.',
    image_url: 'https://example.com/sunflower.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 6.0, max: 7.5 },
      soil_type: ['loam', 'well-drained'],
      water_needs: 'moderate',
      min_temperature: 45,
      max_temperature: 90
    },
    growing_calendar: {
      direct_sow: { spring: { weeks_from_last_frost: 1 } }
    },
    hardiness_zones: { min: '4', max: '10' },
    life_cycle: 'annual',
    days_to_maturity: { min: 70, max: 100 },
    spacing: { plants: 12, rows: 24 },
    planting_depth: 1,
    height: { min: 24, max: 120 },
    tags: ['flower', 'edible', 'ornamental']
  },
  {
    name: 'Marigold',
    scientific_name: 'Tagetes',
    description: 'Annual flower with bright orange, yellow, or red blooms.',
    image_url: 'https://example.com/marigold.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 6.0, max: 7.5 },
      soil_type: ['loam', 'well-drained'],
      water_needs: 'low',
      min_temperature: 50,
      max_temperature: 90
    },
    growing_calendar: {
      indoor_seed_start: { weeks_before_last_frost: 6 },
      direct_sow: { spring: { weeks_from_last_frost: 2 } },
      transplant: { weeks_after_last_frost: 2 }
    },
    hardiness_zones: { min: '2', max: '11' },
    life_cycle: 'annual',
    days_to_maturity: { min: 50, max: 70 },
    spacing: { plants: 8, rows: 12 },
    planting_depth: 0.25,
    height: { min: 6, max: 36 },
    tags: ['flower', 'ornamental', 'companion plant']
  },
  {
    name: 'Zinnia',
    scientific_name: 'Zinnia elegans',
    description: 'Annual flower with bright, daisy-like blooms in many colors.',
    image_url: 'https://example.com/zinnia.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 5.5, max: 7.5 },
      soil_type: ['loam', 'well-drained'],
      water_needs: 'moderate',
      min_temperature: 55,
      max_temperature: 90
    },
    growing_calendar: {
      indoor_seed_start: { weeks_before_last_frost: 4 },
      direct_sow: { spring: { weeks_from_last_frost: 2 } },
      transplant: { weeks_after_last_frost: 2 }
    },
    hardiness_zones: { min: '3', max: '10' },
    life_cycle: 'annual',
    days_to_maturity: { min: 60, max: 70 },
    spacing: { plants: 6, rows: 12 },
    planting_depth: 0.25,
    height: { min: 12, max: 36 },
    tags: ['flower', 'ornamental', 'cut flower']
  }
];

// Combine all plant categories
const allPlants = [...vegetables, ...herbs, ...flowers];

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

// Run the import
const importManualPlants = async () => {
  console.log('Starting manual plant import process...');
  
  console.log(`Total plants to import: ${allPlants.length}`);
  
  // Save to database
  await savePlantsToDatabase(allPlants);
  
  // Disconnect from database
  mongoose.disconnect();
  console.log('Import process finished');
};

importManualPlants();