const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A plant must have a name'],
      trim: true,
      index: true
    },
    scientific_name: {
      type: String,
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
    },
    image_url: String,
    growing_requirements: {
      sunlight: {
        type: String,
        enum: ['full sun', 'partial sun', 'partial shade', 'full shade'],
        required: [true, 'Sunlight requirement must be specified'],
        index: true
      },
      soil_ph: {
        min: {
          type: Number,
          min: 0,
          max: 14,
        },
        max: {
          type: Number,
          min: 0,
          max: 14,
        },
      },
      soil_type: [String],
      water_needs: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        required: [true, 'Water needs must be specified'],
        index: true
      },
      min_temperature: Number, // in Fahrenheit
      max_temperature: Number, // in Fahrenheit
      soil_temperature: {
        min: Number, // in Fahrenheit
        optimal: Number, // in Fahrenheit
        maximum: Number, // in Fahrenheit, added for better germination guidance
      },
    },
    growing_calendar: {
      indoor_seed_start: {
        weeks_before_last_frost: Number,
        notes: String,
      },
      direct_sow: {
        spring: {
          weeks_from_last_frost: Number,
          soil_temperature_required: Number, // in Fahrenheit
          notes: String,
        },
        fall: {
          weeks_before_first_frost: Number,
          notes: String,
        },
      },
      transplant: {
        weeks_after_last_frost: Number,
        hardening_off_days: Number, // Days needed to harden off seedlings
        notes: String,
      },
      // Added for succession planting support
      succession_planting: {
        recommended: {
          type: Boolean,
          default: false,
        },
        interval_days: {
          type: Number,
          default: 14,
        },
        max_plantings: {
          type: Number,
          default: 3,
        },
        notes: String,
      },
    },
    hardiness_zones: {
      min: {
        type: String,
        required: [true, 'Minimum hardiness zone must be specified'],
      },
      max: {
        type: String,
        required: [true, 'Maximum hardiness zone must be specified'],
      },
    },
    // Added for microclimate adjustments
    microclimate_adjustments: {
      heat_sensitivity: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        default: 'moderate',
      },
      cold_sensitivity: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        default: 'moderate',
      },
      wind_sensitivity: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        default: 'moderate',
      },
      shade_tolerance: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        default: 'moderate',
      },
    },
    life_cycle: {
      type: String,
      enum: ['annual', 'biennial', 'perennial'],
      required: [true, 'Life cycle must be specified'],
    },
    days_to_maturity: {
      min: Number,
      max: Number,
      optimal_conditions: String,
    },
    days_to_germination: {
      min: Number,
      max: Number,
      optimal_temp: Number, // in Fahrenheit
    },
    spacing: {
      plants: Number, // inches between plants
      rows: Number, // inches between rows
      intensive: Number, // inches for intensive spacing methods
    },
    planting_depth: Number, // inches
    height: {
      min: Number, // inches
      max: Number, // inches
    },
    width: {
      min: Number, // inches
      max: Number, // inches
    },
    companion_plants: [
      {
        plant: {
          type: mongoose.Schema.ObjectId,
          ref: 'Plant',
        },
        relationship: {
          type: String,
          enum: ['beneficial', 'neutral', 'harmful'],
        },
        notes: String,
      },
    ],
    pests: [
      {
        name: String,
        description: String,
        prevention: [String],
        treatment: [String],
      },
    ],
    diseases: [
      {
        name: String,
        description: String,
        prevention: [String],
        treatment: [String],
      },
    ],
    harvesting: {
      instructions: String,
      storage: String,
      // Added for better harvest tracking
      indicators: [String], // Signs that the plant is ready to harvest
      window_length: Number, // Days that the harvest window lasts
      preservation_methods: [String],
    },
    edible_parts: [String],
    culinary_uses: [String],
    tags: [String], // For categorizing plants (vegetables, herbs, flowers, etc.)
    // Added for historical success tracking
    community_success_rates: {
      germination: {
        type: Number,
        min: 0,
        max: 100,
      },
      yield: {
        type: Number,
        min: 0,
        max: 5,
      },
      difficulty: {
        type: Number,
        min: 1, // 1 = easiest
        max: 5, // 5 = most difficult
      },
    },
    // Added icons for visual display
    icon: {
      type: String,
      default: 'default_plant',
    },
    plant_family: String,
    plant_family_icon: String,
    // Added Gardenate data
    gardenate_data: {
      monthly_calendars: {
        type: Map,
        of: {
          zone_number: Number,
          calendar: {
            indoor_seed: [Number], // Array of months (0-11) for indoor seed starting
            direct_sow: [Number],  // Array of months (0-11) for direct sowing
            transplant: [Number]   // Array of months (0-11) for transplanting
          }
        }
      },
      alternative_names: [String],
      notes: [String]
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create indexes for better search performance
plantSchema.index({ name: 'text', scientific_name: 'text', tags: 'text' });
plantSchema.index({ 'hardiness_zones.min': 1, 'hardiness_zones.max': 1 });
plantSchema.index({ 'growing_requirements.sunlight': 1 });
plantSchema.index({ 'growing_requirements.water_needs': 1 });
plantSchema.index({ life_cycle: 1 });

// Add text index for full-text search
plantSchema.index({ 
  name: 'text', 
  scientific_name: 'text', 
  description: 'text',
  tags: 'text'
}, {
  weights: {
    name: 10,
    scientific_name: 5,
    tags: 3,
    description: 1
  },
  name: 'plant_text_index'
});

// Add compound index for common query patterns
plantSchema.index({ 'hardiness_zones.min': 1, 'hardiness_zones.max': 1 });
plantSchema.index({ 'growing_requirements.sunlight': 1 });
plantSchema.index({ 'growing_requirements.water_needs': 1 });
plantSchema.index({ life_cycle: 1 });

const Plant = mongoose.model('Plant', plantSchema);

module.exports = Plant;