/**
 * Script to run the Gardenate data integration
 * 
 * This script:
 * 1. Runs the integration script to add Gardenate data to the database
 * 2. Provides instructions for using the integrated data
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Gardenate data integration...');

// Check if garden_data directory exists
const gardenDataPath = path.join(__dirname, 'garden_data');
if (!fs.existsSync(gardenDataPath)) {
  console.error(`Error: The garden_data directory does not exist at ${gardenDataPath}`);
  console.log('Please make sure you have run the data extraction script (extract_complete.py) first.');
  process.exit(1);
}

// Check if there are files in the garden_data directory
const files = fs.readdirSync(gardenDataPath);
const plantFiles = files.filter(file => file.startsWith('all_') && file.endsWith('.json'));
if (plantFiles.length === 0) {
  console.error('Error: No plant data files found in the garden_data directory.');
  console.log('Please make sure you have run the data extraction script (extract_complete.py) first.');
  process.exit(1);
}

console.log(`Found ${plantFiles.length} plant data files in garden_data directory.`);
console.log('Running integration script...');

// Run the integration script
const scriptPath = path.join(__dirname, 'server', 'scripts', 'integrateGardenateData.js');
const child = exec(`node ${scriptPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  
  console.log(stdout);
  
  console.log('\nGardenate data integration complete!');
  console.log('\nThe Gardenate data has been integrated with your existing plant database.');
  console.log('\nChanges made:');
  console.log('1. Added Gardenate monthly planting calendars to each plant');
  console.log('2. Added companion planting recommendations');
  console.log('3. Added spacing guidelines');
  console.log('4. Added harvest timelines');
  console.log('5. Added detailed growing information');
  console.log('6. Updated growing calendar notes with Gardenate recommendations');
  console.log('\nTo use the integrated data:');
  console.log('1. Restart your server');
  console.log('2. The seed sowing calendar will now show Gardenate planting recommendations');
  console.log('3. Plant details will include Gardenate companion planting recommendations');
  console.log('4. Search results will include all Gardenate plants');
  console.log('\nIf you still don\'t see the data in your calendar, try clearing your browser cache or using incognito mode.');
});

// Log output in real-time
child.stdout.on('data', (data) => {
  console.log(data);
});

child.stderr.on('data', (data) => {
  console.error(data);
}); 