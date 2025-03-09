const mongoose = require('mongoose');

const microclimateFactor = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A factor must have a name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  adjustment_days: {
    type: Number,
    required: [true, 'An adjustment value in days is required'],
    default: 0,
  },
  adjustment_type: {
    type: String,
    enum: ['earlier', 'later'],
    default: 'earlier',
  },
});

const microclimateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A microclimate profile must have a name'],
      trim: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A microclimate profile must belong to a user'],
    },
    default_profile: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    slope: {
      direction: {
        type: String,
        enum: ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'flat'],
        default: 'flat',
      },
      severity: {
        type: String,
        enum: ['none', 'gentle', 'moderate', 'steep'],
        default: 'none',
      },
      adjustment_days: {
        type: Number,
        default: 0,
      },
    },
    urban_heat_island: {
      intensity: {
        type: String,
        enum: ['none', 'mild', 'moderate', 'strong'],
        default: 'none',
      },
      adjustment_days: {
        type: Number,
        default: 0,
      },
    },
    water_bodies: {
      present: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        enum: ['none', 'small_pond', 'large_pond', 'stream', 'lake', 'ocean'],
        default: 'none',
      },
      distance: {
        type: Number, // in meters
        default: 0,
      },
      adjustment_days: {
        type: Number,
        default: 0,
      },
    },
    shelter: {
      type: {
        type: String,
        enum: ['none', 'fence', 'hedge', 'wall', 'building', 'forest'],
        default: 'none',
      },
      direction: {
        type: String,
        enum: ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'all', 'none'],
        default: 'none',
      },
      adjustment_days: {
        type: Number,
        default: 0,
      },
    },
    soil_type: {
      type: String,
      enum: ['clay', 'loam', 'sandy', 'silty', 'peaty', 'chalky', 'unknown'],
      default: 'unknown',
    },
    soil_drainage: {
      type: String,
      enum: ['poor', 'moderate', 'good', 'excellent', 'unknown'],
      default: 'unknown',
    },
    custom_factors: [microclimateFactor],
    total_adjustment_days: {
      spring: {
        type: Number,
        default: 0,
      },
      fall: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate total adjustment days when saving
microclimateSchema.pre('save', function(next) {
  // Calculate spring adjustment (positive means earlier, negative means later)
  let springAdjustment = 0;
  
  // Slope adjustments
  if (this.slope.direction === 'south' || this.slope.direction === 'southeast' || this.slope.direction === 'southwest') {
    // South-facing slopes warm up earlier in spring
    if (this.slope.severity === 'gentle') springAdjustment += 3;
    if (this.slope.severity === 'moderate') springAdjustment += 5;
    if (this.slope.severity === 'steep') springAdjustment += 7;
  } else if (this.slope.direction === 'north' || this.slope.direction === 'northeast' || this.slope.direction === 'northwest') {
    // North-facing slopes warm up later in spring
    if (this.slope.severity === 'gentle') springAdjustment -= 3;
    if (this.slope.severity === 'moderate') springAdjustment -= 5;
    if (this.slope.severity === 'steep') springAdjustment -= 7;
  }
  
  // Urban heat island effect
  if (this.urban_heat_island.intensity === 'mild') springAdjustment += 3;
  if (this.urban_heat_island.intensity === 'moderate') springAdjustment += 5;
  if (this.urban_heat_island.intensity === 'strong') springAdjustment += 7;
  
  // Water bodies (generally delay warming in spring but extend season in fall)
  if (this.water_bodies.present) {
    if (this.water_bodies.type === 'small_pond') {
      springAdjustment -= 1;
    } else if (this.water_bodies.type === 'large_pond' || this.water_bodies.type === 'stream') {
      springAdjustment -= 2;
    } else if (this.water_bodies.type === 'lake') {
      springAdjustment -= 4;
    } else if (this.water_bodies.type === 'ocean') {
      springAdjustment -= 7;
    }
    
    // Adjust based on distance (effect diminishes with distance)
    if (this.water_bodies.distance > 500) {
      springAdjustment = Math.round(springAdjustment / 2);
    } else if (this.water_bodies.distance > 1000) {
      springAdjustment = Math.round(springAdjustment / 3);
    }
  }
  
  // Shelter can protect from cold winds in spring
  if (this.shelter.type !== 'none' && 
      (this.shelter.direction === 'north' || 
       this.shelter.direction === 'northeast' || 
       this.shelter.direction === 'northwest' ||
       this.shelter.direction === 'all')) {
    springAdjustment += 2;
  }
  
  // Add any custom factor adjustments
  if (this.custom_factors && this.custom_factors.length > 0) {
    this.custom_factors.forEach(factor => {
      if (factor.adjustment_type === 'earlier') {
        springAdjustment += factor.adjustment_days;
      } else {
        springAdjustment -= factor.adjustment_days;
      }
    });
  }
  
  // Calculate fall adjustment (most factors have opposite effects in fall)
  let fallAdjustment = 0;
  
  // Slope adjustments (south-facing slopes cool down later in fall)
  if (this.slope.direction === 'south' || this.slope.direction === 'southeast' || this.slope.direction === 'southwest') {
    if (this.slope.severity === 'gentle') fallAdjustment += 3;
    if (this.slope.severity === 'moderate') fallAdjustment += 5;
    if (this.slope.severity === 'steep') fallAdjustment += 7;
  } else if (this.slope.direction === 'north' || this.slope.direction === 'northeast' || this.slope.direction === 'northwest') {
    if (this.slope.severity === 'gentle') fallAdjustment -= 3;
    if (this.slope.severity === 'moderate') fallAdjustment -= 5;
    if (this.slope.severity === 'steep') fallAdjustment -= 7;
  }
  
  // Urban heat island effect extends fall growing season
  if (this.urban_heat_island.intensity === 'mild') fallAdjustment += 3;
  if (this.urban_heat_island.intensity === 'moderate') fallAdjustment += 5;
  if (this.urban_heat_island.intensity === 'strong') fallAdjustment += 7;
  
  // Water bodies extend fall season
  if (this.water_bodies.present) {
    if (this.water_bodies.type === 'small_pond') {
      fallAdjustment += 2;
    } else if (this.water_bodies.type === 'large_pond' || this.water_bodies.type === 'stream') {
      fallAdjustment += 3;
    } else if (this.water_bodies.type === 'lake') {
      fallAdjustment += 5;
    } else if (this.water_bodies.type === 'ocean') {
      fallAdjustment += 10;
    }
    
    // Adjust based on distance
    if (this.water_bodies.distance > 500) {
      fallAdjustment = Math.round(fallAdjustment / 2);
    } else if (this.water_bodies.distance > 1000) {
      fallAdjustment = Math.round(fallAdjustment / 3);
    }
  }
  
  // Add custom factor adjustments for fall
  if (this.custom_factors && this.custom_factors.length > 0) {
    this.custom_factors.forEach(factor => {
      if (factor.adjustment_type === 'later') {
        fallAdjustment += factor.adjustment_days;
      } else {
        fallAdjustment -= factor.adjustment_days;
      }
    });
  }
  
  // Save the calculated adjustments
  this.total_adjustment_days.spring = springAdjustment;
  this.total_adjustment_days.fall = fallAdjustment;
  
  next();
});

// Create indexes for better query performance
microclimateSchema.index({ user: 1 });
microclimateSchema.index({ default_profile: 1 });

const Microclimate = mongoose.model('Microclimate', microclimateSchema);

module.exports = Microclimate;