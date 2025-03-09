const Plant = require('../models/Plant');

// Get all plants with filtering, sorting, and pagination
exports.getAllPlants = async (req, res) => {
  try {
    console.log('getAllPlants API called with query:', req.query);
    
    // Build query
    let query = Plant.find();

    // Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(field => delete queryObj[field]);

    // Advanced filtering (for ranges like water_needs, etc.)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
    query = query.find(JSON.parse(queryStr));

    // Specific filtering for hardiness zone compatibility
    if (req.query.hardiness_zone) {
      const zone = req.query.hardiness_zone;
      query = query.find({
        $and: [
          { 'hardiness_zones.min': { $lte: zone } },
          { 'hardiness_zones.max': { $gte: zone } }
        ]
      });
    }

    // FIXED: Simplified search with direct regex matching instead of text search
    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      const searchRegex = new RegExp(searchTerm, 'i');
      console.log(`Searching for plants with term: "${searchTerm}"`);
      
      // Switch to direct regex search for better results
      query = Plant.find({
        $or: [
          { name: searchRegex },
          { scientific_name: searchRegex },
          { tags: searchRegex },
          { description: searchRegex }
        ]
      });
    }

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('name');
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // Execute query
    const plants = await query;

    // Send response
    res.status(200).json({
      status: 'success',
      results: plants.length,
      data: {
        plants,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get a single plant
exports.getPlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);

    if (!plant) {
      return res.status(404).json({
        status: 'fail',
        message: 'Plant not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        plant,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Create a new plant
exports.createPlant = async (req, res) => {
  try {
    const newPlant = await Plant.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        plant: newPlant,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Update a plant
exports.updatePlant = async (req, res) => {
  try {
    const plant = await Plant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!plant) {
      return res.status(404).json({
        status: 'fail',
        message: 'Plant not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        plant,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Delete a plant
exports.deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findByIdAndDelete(req.params.id);

    if (!plant) {
      return res.status(404).json({
        status: 'fail',
        message: 'Plant not found',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get companion plants
exports.getCompanionPlants = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);

    if (!plant) {
      return res.status(404).json({
        status: 'fail',
        message: 'Plant not found',
      });
    }

    // Get all beneficial companions
    const companionPlantIds = plant.companion_plants
      .filter(companion => companion.relationship === 'beneficial')
      .map(companion => companion.plant);

    const companionPlants = await Plant.find({
      _id: { $in: companionPlantIds },
    });

    res.status(200).json({
      status: 'success',
      data: {
        plant: plant.name,
        companions: companionPlants,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get plants by tags (categories)
exports.getPlantsByTag = async (req, res) => {
  try {
    const tag = req.params.tag;
    const plants = await Plant.find({ tags: tag }).sort('name');

    res.status(200).json({
      status: 'success',
      results: plants.length,
      data: {
        tag,
        plants,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get planting schedule for a plant based on zone and season
exports.getPlantingSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { zone, lastFrostDate, firstFrostDate } = req.query;

    const plant = await Plant.findById(id);
    if (!plant) {
      return res.status(404).json({
        status: 'fail',
        message: 'Plant not found',
      });
    }

    // Check if we have Gardenate data for this plant
    let gardenateCalendar = null;
    if (plant.gardenate_data && plant.gardenate_data.monthly_calendars) {
      // Try to find the best matching climate zone based on the user's zone
      // This is a simplified mapping - you may need to expand this based on your needs
      let bestMatchingZone = null;
      
      // If the user is in Australia
      if (zone && zone.startsWith('AU')) {
        if (parseInt(zone.replace('AU', '')) >= 9) {
          bestMatchingZone = 'Australia - tropical';
        } else if (parseInt(zone.replace('AU', '')) >= 8) {
          bestMatchingZone = 'Australia - sub-tropical';
        } else if (parseInt(zone.replace('AU', '')) >= 7) {
          bestMatchingZone = 'Australia - temperate';
        } else {
          bestMatchingZone = 'Australia - cool/mountain';
        }
      } 
      // If the user is in the UK
      else if (zone && zone.startsWith('UK')) {
        if (parseInt(zone.replace('UK', '')) >= 8) {
          bestMatchingZone = 'United Kingdom - warm/temperate';
        } else {
          bestMatchingZone = 'United Kingdom - cool/temperate';
        }
      }
      // If the user is in New Zealand
      else if (zone && zone.startsWith('NZ')) {
        if (parseInt(zone.replace('NZ', '')) >= 8) {
          bestMatchingZone = 'New Zealand - sub-tropical';
        } else if (parseInt(zone.replace('NZ', '')) >= 7) {
          bestMatchingZone = 'New Zealand - temperate';
        } else {
          bestMatchingZone = 'New Zealand - cool/mountain';
        }
      }
      // For US/Canada zones, map to the closest Australian/UK zone
      else if (zone) {
        const zoneNumber = parseInt(zone.replace(/[a-zA-Z]/g, ''));
        if (zoneNumber >= 9) {
          bestMatchingZone = 'Australia - tropical';
        } else if (zoneNumber >= 8) {
          bestMatchingZone = 'Australia - sub-tropical';
        } else if (zoneNumber >= 7) {
          bestMatchingZone = 'Australia - temperate';
        } else if (zoneNumber >= 6) {
          bestMatchingZone = 'Australia - cool/mountain';
        } else {
          bestMatchingZone = 'United Kingdom - cool/temperate';
        }
      }
      
      // Get the calendar for the best matching zone
      if (bestMatchingZone && plant.gardenate_data.monthly_calendars.get(bestMatchingZone)) {
        gardenateCalendar = plant.gardenate_data.monthly_calendars.get(bestMatchingZone).calendar;
      } else {
        // If no specific match, try to get any available calendar
        for (const [zoneName, zoneData] of plant.gardenate_data.monthly_calendars.entries()) {
          gardenateCalendar = zoneData.calendar;
          break;
        }
      }
    }

    // Calculate planting schedule based on frost dates
    // This is the existing logic
    const schedule = calculatePlantingSchedule(plant, lastFrostDate, firstFrostDate);
    
    // If we have Gardenate data, enhance the schedule with it
    if (gardenateCalendar) {
      schedule.gardenate = {
        indoor_seed: gardenateCalendar.indoor_seed || [],
        direct_sow: gardenateCalendar.direct_sow || [],
        transplant: gardenateCalendar.transplant || []
      };
      
      // Add color codes for the calendar
      schedule.colorCodes = {
        indoor_seed: '#E3F2FD', // Light blue
        direct_sow: '#DCEDC8',  // Light green
        transplant: '#E8F5E9'   // Very light green
      };
    }

    res.status(200).json({
      status: 'success',
      data: {
        plant: plant.name,
        schedule,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

/**
 * Calculate planting schedule based on frost dates
 * @param {Object} plant - Plant object from database
 * @param {String} lastFrostDate - Last frost date string
 * @param {String} firstFrostDate - First frost date string
 * @returns {Object} Planting schedule
 */
function calculatePlantingSchedule(plant, lastFrostDate, firstFrostDate) {
  // Initialize schedule object
  const schedule = {
    plant_name: plant.name,
    indoor_seed_start: null,
    direct_sow_spring: null,
    direct_sow_fall: null,
    transplant: null,
    harvest_begin: null,
    harvest_end: null,
  };

  // If no frost dates provided, return empty schedule
  if (!lastFrostDate || !firstFrostDate) {
    return schedule;
  }

  // Convert frost dates to JavaScript Date objects
  const lastFrost = new Date(lastFrostDate);
  const firstFrost = new Date(firstFrostDate);

  // Calculate indoor seed starting date
  if (plant.growing_calendar.indoor_seed_start && plant.growing_calendar.indoor_seed_start.weeks_before_last_frost) {
    const weeks = plant.growing_calendar.indoor_seed_start.weeks_before_last_frost;
    const seedDate = new Date(lastFrost);
    seedDate.setDate(seedDate.getDate() - (weeks * 7));
    schedule.indoor_seed_start = seedDate;
  }

  // Calculate direct sow date (spring)
  if (plant.growing_calendar.direct_sow && plant.growing_calendar.direct_sow.spring && plant.growing_calendar.direct_sow.spring.weeks_from_last_frost) {
    const weeks = plant.growing_calendar.direct_sow.spring.weeks_from_last_frost;
    const sowDate = new Date(lastFrost);
    sowDate.setDate(sowDate.getDate() + (weeks * 7));
    schedule.direct_sow_spring = sowDate;
  }

  // Calculate direct sow date (fall)
  if (plant.growing_calendar.direct_sow && plant.growing_calendar.direct_sow.fall && plant.growing_calendar.direct_sow.fall.weeks_before_first_frost) {
    const weeks = plant.growing_calendar.direct_sow.fall.weeks_before_first_frost;
    const sowDate = new Date(firstFrost);
    sowDate.setDate(sowDate.getDate() - (weeks * 7));
    schedule.direct_sow_fall = sowDate;
  }

  // Calculate transplant date
  if (plant.growing_calendar.transplant && plant.growing_calendar.transplant.weeks_after_last_frost) {
    const weeks = plant.growing_calendar.transplant.weeks_after_last_frost;
    const transplantDate = new Date(lastFrost);
    transplantDate.setDate(transplantDate.getDate() + (weeks * 7));
    schedule.transplant = transplantDate;
  }

  // Calculate harvest window if days to maturity is available
  if (plant.days_to_maturity && (schedule.direct_sow_spring || schedule.transplant)) {
    const plantingDate = schedule.transplant || schedule.direct_sow_spring;
    
    // Earliest possible harvest date
    if (plant.days_to_maturity.min) {
      const harvestBegin = new Date(plantingDate);
      harvestBegin.setDate(harvestBegin.getDate() + plant.days_to_maturity.min);
      schedule.harvest_begin = harvestBegin;
    }

    // Latest possible harvest date
    if (plant.days_to_maturity.max) {
      const harvestEnd = new Date(plantingDate);
      harvestEnd.setDate(harvestEnd.getDate() + plant.days_to_maturity.max);
      schedule.harvest_end = harvestEnd;
    }
  }

  return schedule;
}