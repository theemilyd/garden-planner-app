const Plant = require('../models/Plant');
const User = require('../models/User');
const Zone = require('../models/Zone');

// Calculate succession planting schedule
exports.calculateSuccessionSchedule = async (req, res) => {
  try {
    const { plantId, harvestDuration, successionCount, zoneId, microclimateId } = req.body;
    
    // Validate input
    if (!plantId || !harvestDuration || !successionCount || !zoneId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide plantId, harvestDuration, successionCount, and zoneId',
      });
    }
    
    // Check if user has reached succession plan limit
    const user = await User.findById(req.user.id);
    
    // Check if user is on free tier and has reached their limit
    if (user.subscription.tier === 'free' && 
        user.subscription.limits.succession_plans < successionCount) {
      return res.status(403).json({
        status: 'fail',
        message: `Free tier users are limited to ${user.subscription.limits.succession_plans} succession plantings. Please upgrade your subscription for more.`,
      });
    }
    
    // Get plant data
    const plant = await Plant.findById(plantId);
    if (!plant) {
      return res.status(404).json({ 
        status: 'fail', 
        message: 'Plant not found' 
      });
    }
    
    // Get zone data for frost dates
    const zone = await Zone.findById(zoneId);
    if (!zone) {
      return res.status(404).json({ 
        status: 'fail', 
        message: 'Zone not found' 
      });
    }
    
    // Calculate growing season length in days
    const lastFrostMonth = zone.average_frost_dates.last_spring_frost.month - 1; // Convert to 0-indexed month
    const lastFrostDay = zone.average_frost_dates.last_spring_frost.day;
    const firstFrostMonth = zone.average_frost_dates.first_fall_frost.month - 1; // Convert to 0-indexed month
    const firstFrostDay = zone.average_frost_dates.first_fall_frost.day;
    
    const currentYear = new Date().getFullYear();
    const lastFrostDate = new Date(currentYear, lastFrostMonth, lastFrostDay);
    const firstFrostDate = new Date(currentYear, firstFrostMonth, firstFrostDay);
    
    // Calculate days to maturity
    const daysToMaturity = plant.days_to_maturity.min || plant.days_to_maturity.max || 60; // Default to 60 if not specified
    
    // Calculate intervals
    let interval = 0;
    if (plant.growing_calendar.succession_planting && plant.growing_calendar.succession_planting.interval_days) {
      interval = plant.growing_calendar.succession_planting.interval_days;
    } else {
      // If no specific interval is defined, calculate based on harvest duration
      interval = harvestDuration * 7; // Convert weeks to days
    }
    
    // Calculate first planting date based on plant growing calendar
    let firstPlantingDate;
    if (plant.growing_calendar.direct_sow && plant.growing_calendar.direct_sow.spring && plant.growing_calendar.direct_sow.spring.weeks_from_last_frost) {
      // Direct sow
      const weeksAfterFrost = plant.growing_calendar.direct_sow.spring.weeks_from_last_frost;
      firstPlantingDate = new Date(lastFrostDate);
      firstPlantingDate.setDate(firstPlantingDate.getDate() + (weeksAfterFrost * 7));
    } else if (plant.growing_calendar.transplant && plant.growing_calendar.transplant.weeks_after_last_frost) {
      // Transplant date
      const weeksAfterFrost = plant.growing_calendar.transplant.weeks_after_last_frost;
      firstPlantingDate = new Date(lastFrostDate);
      firstPlantingDate.setDate(firstPlantingDate.getDate() + (weeksAfterFrost * 7));
    } else {
      // Default to 2 weeks after last frost
      firstPlantingDate = new Date(lastFrostDate);
      firstPlantingDate.setDate(firstPlantingDate.getDate() + 14);
    }
    
    // Calculate last possible planting date (first frost minus days to maturity)
    const lastPossiblePlantingDate = new Date(firstFrostDate);
    lastPossiblePlantingDate.setDate(lastPossiblePlantingDate.getDate() - daysToMaturity);
    
    // Generate succession schedule
    const schedule = [];
    
    for (let i = 0; i < successionCount; i++) {
      const plantingDate = new Date(firstPlantingDate);
      plantingDate.setDate(plantingDate.getDate() + (i * interval));
      
      // Check if the planting date is still before the last possible planting date
      if (plantingDate > lastPossiblePlantingDate) {
        break;
      }
      
      // Calculate harvest window
      const harvestStartDate = new Date(plantingDate);
      harvestStartDate.setDate(harvestStartDate.getDate() + daysToMaturity);
      
      const harvestEndDate = new Date(harvestStartDate);
      harvestEndDate.setDate(harvestEndDate.getDate() + (harvestDuration * 7));
      
      schedule.push({
        planting_number: i + 1,
        planting_date: plantingDate,
        days_to_maturity: daysToMaturity,
        harvest_start_date: harvestStartDate,
        harvest_end_date: harvestEndDate,
      });
    }
    
    // Return the schedule
    res.status(200).json({
      status: 'success',
      data: {
        plant: {
          name: plant.name,
          id: plant._id,
        },
        succession_schedule: schedule,
        details: {
          interval_days: interval,
          harvest_duration_weeks: harvestDuration,
          total_plantings: schedule.length,
          zone: zone.zone,
          growing_season: {
            last_frost: lastFrostDate,
            first_frost: firstFrostDate,
            length_days: zone.growing_season_length,
          },
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Save a succession plan
exports.saveSuccessionPlan = async (req, res) => {
  try {
    const { plantId, name, schedule } = req.body;
    
    if (!plantId || !name || !schedule) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide plantId, name, and schedule',
      });
    }
    
    // Check if user has reached succession plan limit
    const user = await User.findById(req.user.id);
    
    // Get current succession plans count (we'll store these in the user document later)
    // For now, use a placeholder
    const currentPlansCount = 0;
    
    // Check if user is on free tier and has reached their limit
    if (user.subscription.tier === 'free' && 
        currentPlansCount >= user.subscription.limits.succession_plans) {
      return res.status(403).json({
        status: 'fail',
        message: `Free tier users are limited to ${user.subscription.limits.succession_plans} succession plans. Please upgrade your subscription for more.`,
      });
    }
    
    // For now, return success (in a real implementation, we would save to the database)
    res.status(200).json({
      status: 'success',
      data: {
        message: 'Succession plan saved successfully',
        name,
        plant_id: plantId,
        plantings: schedule.length,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get optimized succession schedule for multiple plants
exports.getOptimizedSuccessionSchedule = async (req, res) => {
  try {
    const { plants, zoneId } = req.body;
    
    // Check if premium feature
    const user = await User.findById(req.user.id);
    if (user.subscription.tier === 'free') {
      return res.status(403).json({
        status: 'fail',
        message: 'Optimized succession planning for multiple plants is a premium feature. Please upgrade your subscription.',
      });
    }
    
    // This would be a complex algorithm in a real implementation
    // For now, return a placeholder response
    res.status(200).json({
      status: 'success',
      data: {
        message: 'Optimized succession schedule calculated',
        plants_count: plants.length,
        zone: zoneId,
        // Further implementation would provide actual optimized schedule
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};