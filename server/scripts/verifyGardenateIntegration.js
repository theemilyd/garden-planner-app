/**
 * Script to verify that the Gardenate data is properly integrated in the database
 * 
 * This script:
 * 1. Connects to the MongoDB database
 * 2. Retrieves all plants
 * 3. Checks if they have Gardenate data
 * 4. Prints a summary of the integration status
 */

const mongoose = require('mongoose');
const Plant = require('../models/Plant');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function verifyGardenateIntegration() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Retrieve all plants
    const plants = await Plant.find({});
    console.log(`Found ${plants.length} plants in the database`);

    // Check if they have Gardenate data
    let plantsWithGardenateData = 0;
    let plantsWithMonthlyCalendars = 0;
    let plantsWithCompanionPlants = 0;
    let plantsWithGrowingCalendarNotes = 0;

    for (const plant of plants) {
      // Check if the plant has Gardenate data
      if (plant.gardenate_data) {
        plantsWithGardenateData++;

        // Check if the plant has monthly calendars
        if (plant.gardenate_data.monthly_calendars && 
            Object.keys(plant.gardenate_data.monthly_calendars).length > 0) {
          plantsWithMonthlyCalendars++;
        }
      }

      // Check if the plant has companion plants
      if (plant.companion_plants && plant.companion_plants.length > 0) {
        plantsWithCompanionPlants++;
      }

      // Check if the plant has growing calendar notes
      if (plant.growing_calendar) {
        let hasGardenateNotes = false;

        // Check indoor seed start notes
        if (plant.growing_calendar.indoor_seed_start && 
            plant.growing_calendar.indoor_seed_start.notes && 
            plant.growing_calendar.indoor_seed_start.notes.includes('Gardenate')) {
          hasGardenateNotes = true;
        }

        // Check transplant notes
        if (plant.growing_calendar.transplant && 
            plant.growing_calendar.transplant.notes && 
            plant.growing_calendar.transplant.notes.includes('Gardenate')) {
          hasGardenateNotes = true;
        }

        // Check direct sow notes
        if (plant.growing_calendar.direct_sow && 
            plant.growing_calendar.direct_sow.spring && 
            plant.growing_calendar.direct_sow.spring.notes && 
            plant.growing_calendar.direct_sow.spring.notes.includes('Gardenate')) {
          hasGardenateNotes = true;
        }

        if (hasGardenateNotes) {
          plantsWithGrowingCalendarNotes++;
        }
      }
    }

    // Print a summary of the integration status
    console.log('\nGardenate Integration Status:');
    console.log(`Total plants: ${plants.length}`);
    console.log(`Plants with Gardenate data: ${plantsWithGardenateData} (${Math.round(plantsWithGardenateData / plants.length * 100)}%)`);
    console.log(`Plants with monthly calendars: ${plantsWithMonthlyCalendars} (${Math.round(plantsWithMonthlyCalendars / plants.length * 100)}%)`);
    console.log(`Plants with companion plants: ${plantsWithCompanionPlants} (${Math.round(plantsWithCompanionPlants / plants.length * 100)}%)`);
    console.log(`Plants with growing calendar notes: ${plantsWithGrowingCalendarNotes} (${Math.round(plantsWithGrowingCalendarNotes / plants.length * 100)}%)`);

    // Print a list of plants with Gardenate data
    console.log('\nPlants with Gardenate data:');
    for (const plant of plants) {
      if (plant.gardenate_data) {
        console.log(`- ${plant.name}`);
      }
    }

    // Print a list of plants without Gardenate data
    console.log('\nPlants without Gardenate data:');
    for (const plant of plants) {
      if (!plant.gardenate_data) {
        console.log(`- ${plant.name}`);
      }
    }

  } catch (error) {
    console.error('Error verifying Gardenate integration:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the verification script
verifyGardenateIntegration(); 