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

// Count all plants in the database
const countPlants = async () => {
  try {
    const count = await Plant.countDocuments();
    console.log(`Total plants in database: ${count}`);
    
    // List some plants
    const plants = await Plant.find().limit(10).select('name tags');
    console.log('Sample plants:');
    plants.forEach(plant => {
      console.log(`- ${plant.name} (Tags: ${plant.tags.join(', ')})`);
    });
    
    // Check for specific plants
    const radish = await Plant.findOne({ name: 'Radish' });
    console.log('Radish found:', radish ? 'Yes' : 'No');
    
    const celery = await Plant.findOne({ name: 'Celery' });
    console.log('Celery found:', celery ? 'Yes' : 'No');
    
    // Count plants by tags
    const vegetables = await Plant.countDocuments({ tags: 'vegetable' });
    console.log(`Vegetable count: ${vegetables}`);
    
    const herbs = await Plant.countDocuments({ tags: 'herb' });
    console.log(`Herb count: ${herbs}`);
    
    const flowers = await Plant.countDocuments({ tags: 'flower' });
    console.log(`Flower count: ${flowers}`);
    
  } catch (error) {
    console.error('Error checking plants:', error);
  } finally {
    mongoose.disconnect();
  }
};

countPlants();