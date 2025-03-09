const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema(
  {
    zone: {
      type: String,
      required: [true, 'Zone identifier is required'],
      unique: true,
      trim: true,
    },
    temperature_range: {
      min: {
        type: Number,
        required: [true, 'Minimum temperature is required'],
      },
      max: {
        type: Number,
        required: [true, 'Maximum temperature is required'],
      },
    },
    description: {
      type: String,
      trim: true,
    },
    average_frost_dates: {
      last_spring_frost: {
        month: {
          type: Number, // 1-12 for January-December
          min: 1,
          max: 12,
        },
        day: {
          type: Number,
          min: 1,
          max: 31,
        },
      },
      first_fall_frost: {
        month: {
          type: Number, // 1-12 for January-December
          min: 1,
          max: 12,
        },
        day: {
          type: Number,
          min: 1,
          max: 31,
        },
      },
    },
    growing_season_length: {
      type: Number, // in days
      required: [true, 'Growing season length is required'],
    },
    regions: [String], // Regions where this zone is typically found
    recommended_plants: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Plant',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
zoneSchema.index({ zone: 1 });
zoneSchema.index({ 'temperature_range.min': 1, 'temperature_range.max': 1 });
zoneSchema.index({ growing_season_length: 1 });

const Zone = mongoose.model('Zone', zoneSchema);

module.exports = Zone;