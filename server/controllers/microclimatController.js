const Microclimate = require('../models/Microclimate');
const User = require('../models/User');

// Get all microclimate profiles for a user
exports.getUserMicroclimates = async (req, res) => {
  try {
    const microclimates = await Microclimate.find({ user: req.user.id });
    
    res.status(200).json({
      status: 'success',
      results: microclimates.length,
      data: {
        microclimates,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get a specific microclimate profile
exports.getMicroclimate = async (req, res) => {
  try {
    const microclimate = await Microclimate.findById(req.params.id);
    
    if (!microclimate) {
      return res.status(404).json({
        status: 'fail',
        message: 'Microclimate profile not found',
      });
    }
    
    // Check if the microclimate belongs to the current user
    if (microclimate.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to access this microclimate profile',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        microclimate,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Create a new microclimate profile
exports.createMicroclimate = async (req, res) => {
  try {
    // Check if user is on free tier - only premium users can create microclimate profiles
    const user = await User.findById(req.user.id);
    if (user.subscription.tier === 'free') {
      return res.status(403).json({
        status: 'fail',
        message: 'Microclimate profiles are only available for premium users. Please upgrade your subscription.',
      });
    }
    
    // Create the microclimate profile
    const newMicroclimate = await Microclimate.create({
      ...req.body,
      user: req.user.id,
    });
    
    // Add microclimate to user's profiles
    await User.findByIdAndUpdate(req.user.id, {
      $push: { microclimate_profiles: newMicroclimate._id },
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        microclimate: newMicroclimate,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Update a microclimate profile
exports.updateMicroclimate = async (req, res) => {
  try {
    const microclimate = await Microclimate.findById(req.params.id);
    
    if (!microclimate) {
      return res.status(404).json({
        status: 'fail',
        message: 'Microclimate profile not found',
      });
    }
    
    // Check if the microclimate belongs to the current user
    if (microclimate.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this microclimate profile',
      });
    }
    
    // Update the microclimate
    const updatedMicroclimate = await Microclimate.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        microclimate: updatedMicroclimate,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Delete a microclimate profile
exports.deleteMicroclimate = async (req, res) => {
  try {
    const microclimate = await Microclimate.findById(req.params.id);
    
    if (!microclimate) {
      return res.status(404).json({
        status: 'fail',
        message: 'Microclimate profile not found',
      });
    }
    
    // Check if the microclimate belongs to the current user
    if (microclimate.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to delete this microclimate profile',
      });
    }
    
    // Delete the microclimate
    await Microclimate.findByIdAndDelete(req.params.id);
    
    // Remove microclimate from user's profiles
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { microclimate_profiles: req.params.id },
    });
    
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

// Apply microclimate adjustments to planting dates
exports.applyMicroclimateAdjustments = async (req, res) => {
  try {
    const { microclimateId, plantingDates } = req.body;
    
    if (!microclimateId || !plantingDates) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a microclimate ID and planting dates',
      });
    }
    
    const microclimate = await Microclimate.findById(microclimateId);
    
    if (!microclimate) {
      return res.status(404).json({
        status: 'fail',
        message: 'Microclimate profile not found',
      });
    }
    
    // Check if the microclimate belongs to the current user
    if (microclimate.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to use this microclimate profile',
      });
    }
    
    // Apply adjustments to each planting date
    const adjustedDates = {};
    
    // Adjust spring planting dates
    if (plantingDates.indoor_seed_start) {
      const date = new Date(plantingDates.indoor_seed_start);
      date.setDate(date.getDate() - microclimate.total_adjustment_days.spring);
      adjustedDates.indoor_seed_start = date;
    }
    
    if (plantingDates.direct_sow_spring) {
      const date = new Date(plantingDates.direct_sow_spring);
      date.setDate(date.getDate() - microclimate.total_adjustment_days.spring);
      adjustedDates.direct_sow_spring = date;
    }
    
    if (plantingDates.transplant) {
      const date = new Date(plantingDates.transplant);
      date.setDate(date.getDate() - microclimate.total_adjustment_days.spring);
      adjustedDates.transplant = date;
    }
    
    // Adjust fall planting dates
    if (plantingDates.direct_sow_fall) {
      const date = new Date(plantingDates.direct_sow_fall);
      date.setDate(date.getDate() + microclimate.total_adjustment_days.fall);
      adjustedDates.direct_sow_fall = date;
    }
    
    // Adjust harvest dates
    if (plantingDates.harvest_begin) {
      // For harvest dates, we need to determine if they're spring or fall plantings
      const harvestBegin = new Date(plantingDates.harvest_begin);
      const month = harvestBegin.getMonth();
      
      // Roughly estimate if it's a spring or fall harvest
      // (Spring harvest: months 3-8, Fall harvest: months 9-2)
      if (month >= 3 && month <= 8) {
        harvestBegin.setDate(harvestBegin.getDate() - microclimate.total_adjustment_days.spring);
      } else {
        harvestBegin.setDate(harvestBegin.getDate() + microclimate.total_adjustment_days.fall);
      }
      
      adjustedDates.harvest_begin = harvestBegin;
    }
    
    if (plantingDates.harvest_end) {
      const harvestEnd = new Date(plantingDates.harvest_end);
      const month = harvestEnd.getMonth();
      
      if (month >= 3 && month <= 8) {
        harvestEnd.setDate(harvestEnd.getDate() - microclimate.total_adjustment_days.spring);
      } else {
        harvestEnd.setDate(harvestEnd.getDate() + microclimate.total_adjustment_days.fall);
      }
      
      adjustedDates.harvest_end = harvestEnd;
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        original_dates: plantingDates,
        adjusted_dates: adjustedDates,
        adjustments: {
          spring: microclimate.total_adjustment_days.spring,
          fall: microclimate.total_adjustment_days.fall,
        },
        microclimate: {
          name: microclimate.name,
          description: microclimate.description,
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