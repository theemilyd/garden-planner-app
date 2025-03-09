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

// Comprehensive database of common garden plants with detailed planting calendar information
const expandedPlantsData = [
  // VEGETABLES
  {
    name: 'Tomato',
    scientific_name: 'Solanum lycopersicum',
    description: 'Popular garden vegetable with varieties for slicing, canning, and small fruits.',
    image_url: 'https://example.com/tomato.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 6.0, max: 6.8 },
      soil_type: ['loam', 'sandy loam'],
      water_needs: 'moderate',
      min_temperature: 50,
      max_temperature: 85,
      soil_temperature: { min: 60, optimal: 70 }
    },
    growing_calendar: {
      indoor_seed_start: { weeks_before_last_frost: 6 },
      transplant: { weeks_after_last_frost: 2 }
    },
    hardiness_zones: { min: '3', max: '11' },
    life_cycle: 'annual',
    days_to_maturity: { min: 60, max: 85 },
    spacing: { plants: 24, rows: 36 },
    planting_depth: 0.25,
    height: { min: 36, max: 72 },
    width: { min: 18, max: 36 },
    tags: ['vegetable', 'fruit', 'summer crop'],
    // Calendar-specific data
    indoorStart: 2, // March
    indoorEnd: 3,   // April
    outdoorStart: 4, // May
    outdoorEnd: 8,   // September
    difficulty: 'moderate'
  },
  {
    name: 'Lettuce',
    scientific_name: 'Lactuca sativa',
    description: 'Cool-season leafy vegetable that comes in loose-leaf, butterhead, romaine, and crisphead varieties.',
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
        spring: { weeks_from_last_frost: -2 }, // 2 weeks before last frost
        fall: { weeks_before_first_frost: 8 }
      }
    },
    hardiness_zones: { min: '4', max: '9' },
    life_cycle: 'annual',
    days_to_maturity: { min: 45, max: 65 },
    spacing: { plants: 6, rows: 12 },
    planting_depth: 0.25,
    height: { min: 6, max: 12 },
    width: { min: 6, max: 12 },
    tags: ['vegetable', 'leafy green', 'cool season'],
    // Calendar-specific data
    indoorStart: 1, // February
    indoorEnd: 2,   // March
    outdoorStart: 2, // March
    outdoorEnd: 4,   // May
    difficulty: 'easy',
    // For fall planting
    fall: {
      outdoorStart: 7, // August
      outdoorEnd: 8    // September
    }
  },
  {
    name: 'Carrot',
    scientific_name: 'Daucus carota',
    description: 'Root vegetable with orange, yellow, purple, red, or white roots.',
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
    height: { min: 12, max: 18 },
    width: { min: 3, max: 4 },
    tags: ['vegetable', 'root crop', 'cool season'],
    // Calendar-specific data
    outdoorStart: 3, // April
    outdoorEnd: 6,   // July
    difficulty: 'moderate',
    // For fall planting
    fall: {
      outdoorStart: 7, // August
      outdoorEnd: 8    // September
    }
  },
  {
    name: 'Broccoli',
    scientific_name: 'Brassica oleracea var. italica',
    description: 'Cold-hardy vegetable grown for its edible flower heads and stems.',
    image_url: 'https://example.com/broccoli.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 6.0, max: 7.0 },
      soil_type: ['loam', 'clay loam'],
      water_needs: 'moderate',
      min_temperature: 40,
      max_temperature: 75,
      soil_temperature: { min: 45, optimal: 65 }
    },
    growing_calendar: {
      indoor_seed_start: { weeks_before_last_frost: 10 },
      transplant: { weeks_before_last_frost: 2 },
      direct_sow: {
        fall: { weeks_before_first_frost: 14 }
      }
    },
    hardiness_zones: { min: '3', max: '10' },
    life_cycle: 'annual',
    days_to_maturity: { min: 60, max: 85 },
    spacing: { plants: 18, rows: 24 },
    planting_depth: 0.5,
    height: { min: 18, max: 30 },
    width: { min: 12, max: 24 },
    tags: ['vegetable', 'brassica', 'cool season'],
    // Calendar-specific data
    indoorStart: 1, // February
    indoorEnd: 2,   // March
    outdoorStart: 3, // April
    outdoorEnd: 5,   // June
    difficulty: 'moderate',
    // For fall planting
    fall: {
      indoorStart: 6, // July
      indoorEnd: 7,   // August
      outdoorStart: 7, // August
      outdoorEnd: 9    // October
    }
  },
  {
    name: 'Cucumber',
    scientific_name: 'Cucumis sativus',
    description: 'Warm-season vining vegetable grown for fresh eating, pickling, or both.',
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
    height: { min: 12, max: 24 },
    width: { min: 24, max: 72 },
    tags: ['vegetable', 'vine', 'summer crop'],
    // Calendar-specific data
    indoorStart: 3, // April
    indoorEnd: 4,   // May
    outdoorStart: 4, // May
    outdoorEnd: 8,   // September
    difficulty: 'easy'
  },
  {
    name: 'Spinach',
    scientific_name: 'Spinacia oleracea',
    description: 'Leafy green vegetable high in iron and vitamins, best grown in cool weather.',
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
        spring: { weeks_from_last_frost: -4 }, // 4 weeks before last frost
        fall: { weeks_before_first_frost: 8 }
      }
    },
    hardiness_zones: { min: '3', max: '9' },
    life_cycle: 'annual',
    days_to_maturity: { min: 35, max: 45 },
    spacing: { plants: 3, rows: 12 },
    planting_depth: 0.5,
    height: { min: 6, max: 12 },
    width: { min: 6, max: 10 },
    tags: ['vegetable', 'leafy green', 'cool season'],
    // Calendar-specific data
    outdoorStart: 2, // March
    outdoorEnd: 4,   // May
    difficulty: 'easy',
    // For fall planting
    fall: {
      outdoorStart: 7, // August
      outdoorEnd: 9    // October
    }
  },
  {
    name: 'Bell Pepper',
    scientific_name: 'Capsicum annuum',
    description: 'Sweet, bell-shaped fruit that can be eaten raw or cooked, available in green, red, yellow, orange, and purple.',
    image_url: 'https://example.com/bell-pepper.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 6.0, max: 6.8 },
      soil_type: ['loam', 'sandy loam'],
      water_needs: 'moderate',
      min_temperature: 65,
      max_temperature: 85,
      soil_temperature: { min: 65, optimal: 75 }
    },
    growing_calendar: {
      indoor_seed_start: { weeks_before_last_frost: 8 },
      transplant: { weeks_after_last_frost: 3 }
    },
    hardiness_zones: { min: '4', max: '11' },
    life_cycle: 'annual',
    days_to_maturity: { min: 70, max: 90 },
    spacing: { plants: 18, rows: 24 },
    planting_depth: 0.25,
    height: { min: 24, max: 36 },
    width: { min: 18, max: 24 },
    tags: ['vegetable', 'fruit', 'summer crop'],
    // Calendar-specific data
    indoorStart: 1, // February
    indoorEnd: 3,   // April
    outdoorStart: 4, // May
    outdoorEnd: 9,   // October
    difficulty: 'moderate'
  },
  {
    name: 'Radish',
    scientific_name: 'Raphanus sativus',
    description: 'Fast-growing root vegetable with a peppery flavor, available in many colors and shapes.',
    image_url: 'https://example.com/radish.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 6.0, max: 7.0 },
      soil_type: ['sandy', 'loam'],
      water_needs: 'moderate',
      min_temperature: 40,
      max_temperature: 85,
      soil_temperature: { min: 45, optimal: 65 }
    },
    growing_calendar: {
      direct_sow: {
        spring: { weeks_from_last_frost: -3 }, // 3 weeks before last frost
        fall: { weeks_before_first_frost: 8 }
      }
    },
    hardiness_zones: { min: '2', max: '11' },
    life_cycle: 'annual',
    days_to_maturity: { min: 21, max: 30 },
    spacing: { plants: 2, rows: 6 },
    planting_depth: 0.5,
    height: { min: 6, max: 12 },
    width: { min: 3, max: 5 },
    tags: ['vegetable', 'root crop', 'quick growing', 'cool season'],
    // Calendar-specific data
    outdoorStart: 2, // March
    outdoorEnd: 4,   // May
    difficulty: 'easy',
    // For fall planting
    fall: {
      outdoorStart: 7, // August
      outdoorEnd: 9    // October
    }
  },
  {
    name: 'Kale',
    scientific_name: 'Brassica oleracea var. sabellica',
    description: 'Nutritious leafy green vegetable that can tolerate frost and continues producing into winter in mild climates.',
    image_url: 'https://example.com/kale.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 6.0, max: 7.5 },
      soil_type: ['loam', 'clay loam'],
      water_needs: 'moderate',
      min_temperature: 20,
      max_temperature: 75,
      soil_temperature: { min: 45, optimal: 65 }
    },
    growing_calendar: {
      indoor_seed_start: { weeks_before_last_frost: 6 },
      direct_sow: {
        spring: { weeks_from_last_frost: -3 }, // 3 weeks before last frost
        fall: { weeks_before_first_frost: 12 }
      },
      transplant: { weeks_before_last_frost: 2 }
    },
    hardiness_zones: { min: '2', max: '11' },
    life_cycle: 'biennial',
    days_to_maturity: { min: 50, max: 65 },
    spacing: { plants: 12, rows: 18 },
    planting_depth: 0.5,
    height: { min: 12, max: 24 },
    width: { min: 12, max: 24 },
    tags: ['vegetable', 'leafy green', 'brassica', 'cool season'],
    // Calendar-specific data
    indoorStart: 2, // March
    indoorEnd: 3,   // April
    outdoorStart: 3, // April
    outdoorEnd: 6,   // July
    difficulty: 'easy',
    // For fall planting
    fall: {
      outdoorStart: 7, // August
      outdoorEnd: 8    // September
    }
  },
  {
    name: 'Onion',
    scientific_name: 'Allium cepa',
    description: 'Bulb vegetable grown for its pungent flavor, available in short-day, long-day, and day-neutral varieties.',
    image_url: 'https://example.com/onion.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 6.0, max: 7.0 },
      soil_type: ['loam', 'sandy loam'],
      water_needs: 'moderate',
      min_temperature: 35,
      max_temperature: 80,
      soil_temperature: { min: 45, optimal: 65 }
    },
    growing_calendar: {
      indoor_seed_start: { weeks_before_last_frost: 10 },
      direct_sow: { spring: { weeks_from_last_frost: -4 } }, // 4 weeks before last frost
      transplant: { weeks_before_last_frost: 2 }
    },
    hardiness_zones: { min: '3', max: '9' },
    life_cycle: 'biennial',
    days_to_maturity: { min: 90, max: 120 },
    spacing: { plants: 4, rows: 12 },
    planting_depth: 0.5,
    height: { min: 12, max: 18 },
    width: { min: 4, max: 6 },
    tags: ['vegetable', 'bulb', 'allium', 'cool season'],
    // Calendar-specific data
    indoorStart: 1, // February
    indoorEnd: 2,   // March
    outdoorStart: 3, // April
    outdoorEnd: 8,   // September
    difficulty: 'moderate'
  },
  {
    name: 'Green Bean',
    scientific_name: 'Phaseolus vulgaris',
    description: 'Warm-season vegetable available in bush and pole varieties; snap beans are harvested young for the entire pod.',
    image_url: 'https://example.com/green-bean.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 6.0, max: 7.0 },
      soil_type: ['loam', 'sandy loam'],
      water_needs: 'moderate',
      min_temperature: 60,
      max_temperature: 85,
      soil_temperature: { min: 60, optimal: 70 }
    },
    growing_calendar: {
      direct_sow: { spring: { weeks_from_last_frost: 2 } }
    },
    hardiness_zones: { min: '3', max: '10' },
    life_cycle: 'annual',
    days_to_maturity: { min: 50, max: 65 },
    spacing: { 
      plants: 4, // for bush beans
      rows: 18 
    },
    planting_depth: 1,
    height: { 
      min: 18, // for bush beans
      max: 96  // for pole beans
    },
    width: { 
      min: 6, 
      max: 18 
    },
    tags: ['vegetable', 'legume', 'summer crop'],
    // Calendar-specific data
    outdoorStart: 4, // May
    outdoorEnd: 8,   // September
    difficulty: 'easy'
  },
  
  // HERBS
  {
    name: 'Basil',
    scientific_name: 'Ocimum basilicum',
    description: 'Aromatic herb used in many cuisines, especially Italian; sensitive to cold temperatures.',
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
    height: { min: 12, max: 24 },
    width: { min: 8, max: 12 },
    tags: ['herb', 'edible', 'culinary', 'summer crop'],
    // Calendar-specific data
    indoorStart: 2, // March
    indoorEnd: 3,   // April
    outdoorStart: 4, // May
    outdoorEnd: 9,   // October
    difficulty: 'easy'
  },
  {
    name: 'Cilantro',
    scientific_name: 'Coriandrum sativum',
    description: 'Herb with leaves used as cilantro and seeds used as coriander; bolts quickly in hot weather.',
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
        spring: { weeks_from_last_frost: -2 }, // 2 weeks before last frost
        fall: { weeks_before_first_frost: 8 }
      }
    },
    hardiness_zones: { min: '3', max: '11' },
    life_cycle: 'annual',
    days_to_maturity: { min: 45, max: 70 },
    spacing: { plants: 6, rows: 12 },
    planting_depth: 0.25,
    height: { min: 12, max: 24 },
    width: { min: 6, max: 12 },
    tags: ['herb', 'edible', 'culinary', 'cool season'],
    // Calendar-specific data
    outdoorStart: 3, // April
    outdoorEnd: 5,   // June
    difficulty: 'moderate',
    // For fall planting
    fall: {
      outdoorStart: 8, // September
      outdoorEnd: 9    // October
    }
  },
  {
    name: 'Dill',
    scientific_name: 'Anethum graveolens',
    description: 'Herb with feathery leaves and seeds used for flavoring pickles, salads, and other dishes.',
    image_url: 'https://example.com/dill.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 5.5, max: 6.5 },
      soil_type: ['loam', 'sandy loam'],
      water_needs: 'moderate',
      min_temperature: 40,
      max_temperature: 85,
      soil_temperature: { min: 60, optimal: 70 }
    },
    growing_calendar: {
      direct_sow: {
        spring: { weeks_from_last_frost: 2 },
        fall: { weeks_before_first_frost: 8 }
      }
    },
    hardiness_zones: { min: '2', max: '11' },
    life_cycle: 'annual',
    days_to_maturity: { min: 40, max: 60 },
    spacing: { plants: 6, rows: 12 },
    planting_depth: 0.25,
    height: { min: 24, max: 36 },
    width: { min: 12, max: 18 },
    tags: ['herb', 'edible', 'culinary'],
    // Calendar-specific data
    outdoorStart: 4, // May
    outdoorEnd: 7,   // August
    difficulty: 'easy'
  },
  {
    name: 'Rosemary',
    scientific_name: 'Salvia rosmarinus',
    description: 'Woody, perennial herb with fragrant, evergreen, needle-like leaves used in cooking.',
    image_url: 'https://example.com/rosemary.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 6.0, max: 7.0 },
      soil_type: ['sandy', 'loam', 'well-drained'],
      water_needs: 'low',
      min_temperature: 30,
      max_temperature: 85,
      soil_temperature: { min: 60, optimal: 70 }
    },
    growing_calendar: {
      indoor_seed_start: { weeks_before_last_frost: 10 },
      transplant: { weeks_after_last_frost: 2 }
    },
    hardiness_zones: { min: '7', max: '10' },
    life_cycle: 'perennial',
    days_to_maturity: { min: 80, max: 180 },
    spacing: { plants: 24, rows: 36 },
    planting_depth: 0.25,
    height: { min: 24, max: 48 },
    width: { min: 24, max: 36 },
    tags: ['herb', 'edible', 'culinary', 'perennial'],
    // Calendar-specific data
    indoorStart: 1, // February
    indoorEnd: 3,   // April
    outdoorStart: 4, // May
    outdoorEnd: 10,  // November (perennial)
    difficulty: 'moderate'
  },
  {
    name: 'Parsley',
    scientific_name: 'Petroselinum crispum',
    description: 'Bright green herb used for its leaf in cooking or as a garnish.',
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
      direct_sow: { spring: { weeks_from_last_frost: 2 } },
      transplant: { weeks_after_last_frost: 2 }
    },
    hardiness_zones: { min: '5', max: '9' },
    life_cycle: 'biennial',
    days_to_maturity: { min: 70, max: 90 },
    spacing: { plants: 6, rows: 12 },
    planting_depth: 0.25,
    height: { min: 12, max: 18 },
    width: { min: 12, max: 18 },
    tags: ['herb', 'edible', 'culinary', 'cool season'],
    // Calendar-specific data
    indoorStart: 1, // February
    indoorEnd: 3,   // April
    outdoorStart: 4, // May
    outdoorEnd: 10,  // November
    difficulty: 'easy'
  },
  
  // FLOWERS
  {
    name: 'Sunflower',
    scientific_name: 'Helianthus annuus',
    description: 'Tall annual flower with large yellow blooms and edible seeds.',
    image_url: 'https://example.com/sunflower.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 6.0, max: 7.5 },
      soil_type: ['loam', 'well-drained'],
      water_needs: 'moderate',
      min_temperature: 45,
      max_temperature: 90,
      soil_temperature: { min: 55, optimal: 70 }
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
    width: { min: 12, max: 24 },
    tags: ['flower', 'edible', 'ornamental', 'summer crop'],
    // Calendar-specific data
    outdoorStart: 4, // May
    outdoorEnd: 8,   // September
    difficulty: 'easy'
  },
  {
    name: 'Zinnia',
    scientific_name: 'Zinnia elegans',
    description: 'Colorful annual flower that attracts butterflies and is great for cut flowers.',
    image_url: 'https://example.com/zinnia.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 5.5, max: 7.5 },
      soil_type: ['loam', 'well-drained'],
      water_needs: 'moderate',
      min_temperature: 55,
      max_temperature: 90,
      soil_temperature: { min: 70, optimal: 75 }
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
    width: { min: 12, max: 24 },
    tags: ['flower', 'ornamental', 'cut flower', 'summer crop'],
    // Calendar-specific data
    indoorStart: 3, // April
    indoorEnd: 4,   // May
    outdoorStart: 4, // May
    outdoorEnd: 8,   // September
    difficulty: 'easy'
  },
  {
    name: 'Marigold',
    scientific_name: 'Tagetes',
    description: 'Easy-to-grow annual with bright flowers that repel some garden pests.',
    image_url: 'https://example.com/marigold.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 6.0, max: 7.5 },
      soil_type: ['loam', 'well-drained'],
      water_needs: 'low',
      min_temperature: 50,
      max_temperature: 90,
      soil_temperature: { min: 65, optimal: 70 }
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
    width: { min: 6, max: 24 },
    tags: ['flower', 'ornamental', 'companion plant', 'summer crop'],
    // Calendar-specific data
    indoorStart: 2, // March
    indoorEnd: 3,   // April
    outdoorStart: 4, // May
    outdoorEnd: 9,   // October
    difficulty: 'easy'
  },
  {
    name: 'Nasturtium',
    scientific_name: 'Tropaeolum majus',
    description: 'Colorful flowers and round leaves that are both edible with a peppery flavor.',
    image_url: 'https://example.com/nasturtium.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 6.0, max: 7.5 },
      soil_type: ['sandy', 'well-drained'],
      water_needs: 'low',
      min_temperature: 50,
      max_temperature: 85,
      soil_temperature: { min: 65, optimal: 70 }
    },
    growing_calendar: {
      direct_sow: { spring: { weeks_from_last_frost: 2 } }
    },
    hardiness_zones: { min: '4', max: '10' },
    life_cycle: 'annual',
    days_to_maturity: { min: 55, max: 70 },
    spacing: { plants: 10, rows: 12 },
    planting_depth: 0.5,
    height: { min: 12, max: 36 },
    width: { min: 12, max: 24 },
    tags: ['flower', 'edible', 'ornamental', 'companion plant', 'summer crop'],
    // Calendar-specific data
    outdoorStart: 4, // May
    outdoorEnd: 9,   // October
    difficulty: 'easy'
  },
  {
    name: 'Lavender',
    scientific_name: 'Lavandula',
    description: 'Aromatic perennial herb with purple flowers used for fragrance, cooking, and medicinal purposes.',
    image_url: 'https://example.com/lavender.jpg',
    growing_requirements: {
      sunlight: 'full sun',
      soil_ph: { min: 6.5, max: 7.5 },
      soil_type: ['sandy', 'well-drained'],
      water_needs: 'low',
      min_temperature: 30,
      max_temperature: 85,
      soil_temperature: { min: 60, optimal: 70 }
    },
    growing_calendar: {
      indoor_seed_start: { weeks_before_last_frost: 10 },
      transplant: { weeks_after_last_frost: 2 }
    },
    hardiness_zones: { min: '5', max: '9' },
    life_cycle: 'perennial',
    days_to_maturity: { min: 90, max: 200 },
    spacing: { plants: 24, rows: 36 },
    planting_depth: 0.25,
    height: { min: 24, max: 36 },
    width: { min: 24, max: 36 },
    tags: ['herb', 'flower', 'perennial', 'fragrant', 'medicinal'],
    // Calendar-specific data
    indoorStart: 1, // February
    indoorEnd: 3,   // April
    outdoorStart: 4, // May
    outdoorEnd: 10,  // November (perennial)
    difficulty: 'moderate'
  },
  // Add more plants as needed
];

// Enhanced germination data for PlantingCalendar integration
const germinationEnhancements = {
  'Tomato': {
    germination: {
      soilTemp: { min: 60, max: 85, optimal: 75 },
      daysToGerminate: { min: 5, max: 10 },
      seedDepth: 0.25,
      lightNeeded: false,
      specialTechniques: []
    }
  },
  'Lettuce': {
    germination: {
      soilTemp: { min: 40, max: 75, optimal: 65 },
      daysToGerminate: { min: 2, max: 10 },
      seedDepth: 0.25,
      lightNeeded: true,
      specialTechniques: ["Light exposure needed"]
    }
  },
  'Carrot': {
    germination: {
      soilTemp: { min: 45, max: 80, optimal: 70 },
      daysToGerminate: { min: 7, max: 21 },
      seedDepth: 0.25,
      lightNeeded: false,
      specialTechniques: ["Keep consistently moist"]
    }
  },
  'Broccoli': {
    germination: {
      soilTemp: { min: 45, max: 85, optimal: 70 },
      daysToGerminate: { min: 4, max: 10 },
      seedDepth: 0.5,
      lightNeeded: false,
      specialTechniques: []
    }
  },
  'Cucumber': {
    germination: {
      soilTemp: { min: 60, max: 90, optimal: 80 },
      daysToGerminate: { min: 3, max: 10 },
      seedDepth: 0.5,
      lightNeeded: false,
      specialTechniques: ["Pre-soaking"]
    }
  },
  'Spinach': {
    germination: {
      soilTemp: { min: 45, max: 75, optimal: 65 },
      daysToGerminate: { min: 5, max: 14 },
      seedDepth: 0.5,
      lightNeeded: false,
      specialTechniques: ["Pre-soaking"]
    }
  },
  'Bell Pepper': {
    germination: {
      soilTemp: { min: 65, max: 85, optimal: 80 },
      daysToGerminate: { min: 8, max: 21 },
      seedDepth: 0.25,
      lightNeeded: false,
      specialTechniques: ["Bottom heat"]
    }
  },
  'Radish': {
    germination: {
      soilTemp: { min: 45, max: 85, optimal: 65 },
      daysToGerminate: { min: 3, max: 7 },
      seedDepth: 0.5,
      lightNeeded: false,
      specialTechniques: []
    }
  },
  'Kale': {
    germination: {
      soilTemp: { min: 45, max: 85, optimal: 70 },
      daysToGerminate: { min: 5, max: 10 },
      seedDepth: 0.5,
      lightNeeded: false,
      specialTechniques: []
    }
  },
  'Onion': {
    germination: {
      soilTemp: { min: 50, max: 85, optimal: 70 },
      daysToGerminate: { min: 7, max: 14 },
      seedDepth: 0.25,
      lightNeeded: false,
      specialTechniques: []
    }
  },
  'Green Bean': {
    germination: {
      soilTemp: { min: 60, max: 85, optimal: 75 },
      daysToGerminate: { min: 5, max: 10 },
      seedDepth: 1,
      lightNeeded: false,
      specialTechniques: ["Pre-soaking"]
    }
  },
  'Basil': {
    germination: {
      soilTemp: { min: 65, max: 85, optimal: 75 },
      daysToGerminate: { min: 5, max: 10 },
      seedDepth: 0.25,
      lightNeeded: true,
      specialTechniques: ["Light exposure needed"]
    }
  },
  'Cilantro': {
    germination: {
      soilTemp: { min: 55, max: 75, optimal: 65 },
      daysToGerminate: { min: 7, max: 14 },
      seedDepth: 0.25,
      lightNeeded: false,
      specialTechniques: []
    }
  },
  'Dill': {
    germination: {
      soilTemp: { min: 60, max: 80, optimal: 70 },
      daysToGerminate: { min: 7, max: 14 },
      seedDepth: 0.25,
      lightNeeded: false,
      specialTechniques: []
    }
  },
  'Rosemary': {
    germination: {
      soilTemp: { min: 65, max: 85, optimal: 75 },
      daysToGerminate: { min: 14, max: 28 },
      seedDepth: 0.25,
      lightNeeded: false,
      specialTechniques: ["Bottom heat"]
    }
  },
  'Parsley': {
    germination: {
      soilTemp: { min: 50, max: 85, optimal: 75 },
      daysToGerminate: { min: 14, max: 28 },
      seedDepth: 0.25,
      lightNeeded: false,
      specialTechniques: ["Pre-soaking"]
    }
  },
  'Sunflower': {
    germination: {
      soilTemp: { min: 55, max: 85, optimal: 75 },
      daysToGerminate: { min: 7, max: 14 },
      seedDepth: 1,
      lightNeeded: false,
      specialTechniques: []
    }
  },
  'Zinnia': {
    germination: {
      soilTemp: { min: 70, max: 85, optimal: 75 },
      daysToGerminate: { min: 5, max: 10 },
      seedDepth: 0.25,
      lightNeeded: false,
      specialTechniques: []
    }
  },
  'Marigold': {
    germination: {
      soilTemp: { min: 65, max: 85, optimal: 75 },
      daysToGerminate: { min: 5, max: 10 },
      seedDepth: 0.25,
      lightNeeded: false,
      specialTechniques: []
    }
  },
  'Nasturtium': {
    germination: {
      soilTemp: { min: 65, max: 85, optimal: 70 },
      daysToGerminate: { min: 7, max: 14 },
      seedDepth: 0.5,
      lightNeeded: false,
      specialTechniques: ["Scarification"]
    }
  },
  'Lavender': {
    germination: {
      soilTemp: { min: 65, max: 80, optimal: 70 },
      daysToGerminate: { min: 14, max: 28 },
      seedDepth: 0.25,
      lightNeeded: true,
      specialTechniques: ["Light exposure needed", "Cold stratification"]
    }
  }
};

// Combine data and add extra fields for PlantingCalendar
const enhancedPlants = expandedPlantsData.map(plant => {
  // Add germination data for calendar functionality
  if (germinationEnhancements[plant.name]) {
    plant = { ...plant, ...germinationEnhancements[plant.name] };
  }
  
  // Fill in default values for families
  plant.family = plant.family || plant.scientific_name.split(' ')[0];
  
  // Add variety and seed viability information
  plant.varieties = [];
  plant.seedViability = {
    years: plant.name === 'Onion' ? 1 : 
           plant.name === 'Parsley' ? 2 : 
           plant.name === 'Pepper' ? 3 : 4,
    notes: `Store seeds in a cool, dry place in an airtight container.`
  };
  
  // Add instruction text
  plant.germination = plant.germination || {};
  plant.germination.instructions = plant.germination.instructions || 
    `Plant seeds ${plant.planting_depth} inches deep. Keep soil moist until germination.`;
  
  plant.germination.notes = plant.germination.notes || 
    `Optimal soil temperature for germination is ${plant.germination?.soilTemp?.optimal || 70}°F.`;
    
  return plant;
});

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
const importExpandedPlants = async () => {
  console.log('Starting enhanced plant import process...');
  
  console.log(`Total plants to import: ${enhancedPlants.length}`);
  
  // Save to database
  await savePlantsToDatabase(enhancedPlants);
  
  // Disconnect from database
  mongoose.disconnect();
  console.log('Import process finished');
};

importExpandedPlants();