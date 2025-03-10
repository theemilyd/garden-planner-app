const mongoose = require('mongoose');

const gardenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A garden must have a name'],
      trim: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A garden must belong to a user'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dimensions: {
      width: {
        type: Number,
        required: [true, 'Garden width is required'],
        min: [1, 'Width must be at least 1 foot'],
      },
      length: {
        type: Number,
        required: [true, 'Garden length is required'],
        min: [1, 'Length must be at least 1 foot'],
      },
      unit: {
        type: String,
        enum: ['feet', 'meters'],
        default: 'feet',
      },
    },
    location: {
      type: {
        type: String,
        enum: ['indoor', 'outdoor'],
        default: 'outdoor',
      },
      specific: {
        type: String,
        enum: ['ground', 'raised bed', 'container', 'greenhouse', 'windowsill'],
        default: 'ground',
      },
      sun_exposure: {
        type: String,
        enum: ['full sun', 'partial sun', 'partial shade', 'full shade'],
        index: true,
      },
    },
    soil: {
      type: {
        type: String,
        enum: ['clay', 'loam', 'sandy', 'silt', 'chalky', 'peaty', 'custom'],
      },
      ph: Number,
      amendments: [String],
    },
    plants: [
      {
        plant: {
          type: mongoose.Schema.ObjectId,
          ref: 'Plant',
          required: [true, 'A garden plant must reference a plant'],
        },
        position: {
          x: Number, // grid position
          y: Number, // grid position
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, 'Quantity must be at least 1'],
        },
        status: {
          type: String,
          enum: [
            'planned',
            'planted',
            'germinated',
            'growing',
            'flowering',
            'harvesting',
            'finished',
          ],
          default: 'planned',
        },
        planting_date: Date,
        germination_date: Date,
        first_harvest_date: Date,
        last_harvest_date: Date,
        notes: String,
        tasks: [
          {
            type: {
              type: String,
              enum: [
                'water',
                'fertilize',
                'prune',
                'harvest',
                'pest control',
                'weed',
                'other',
              ],
            },
            description: String,
            completed: {
              type: Boolean,
              default: false,
            },
            due_date: Date,
            reminder: Boolean,
          },
        ],
        journal: [
          {
            date: {
              type: Date,
              default: Date.now,
            },
            entry: String,
            images: [String],
          },
        ],
      },
    ],
    notes: String,
    creation_date: {
      type: Date,
      default: Date.now,
    },
    last_modified: {
      type: Date,
      default: Date.now,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    season: {
      type: String,
      enum: ['spring', 'summer', 'fall', 'winter', 'year-round'],
      default: 'year-round',
    },
    weather_data: {
      first_frost_date: Date,
      last_frost_date: Date,
      average_temperatures: {
        january: Number,
        february: Number,
        march: Number,
        april: Number,
        may: Number,
        june: Number,
        july: Number,
        august: Number,
        september: Number,
        october: Number,
        november: Number,
        december: Number,
      },
      annual_rainfall: Number,
    },
    zone: {
      type: Number,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Update the lastModified date before saving
gardenSchema.pre('save', function (next) {
  this.last_modified = Date.now();
  next();
});

// Index for better query performance
gardenSchema.index({ user: 1 });
gardenSchema.index({ 'location.type': 1 });
gardenSchema.index({ 'plants.plant': 1 });

// Add compound index for common query patterns
gardenSchema.index({ user: 1, creation_date: -1 });
gardenSchema.index({ user: 1, zone: 1 });

// Add method to get gardens by user with projection
gardenSchema.statics.findByUser = function (userId, limit = 10) {
  return this.find({ user: userId })
    .sort({ creation_date: -1 })
    .limit(limit)
    .select('name description location zone width length creation_date')
    .lean();
};

// Add method to get garden with plants
gardenSchema.statics.findWithPlants = function (gardenId, userId) {
  return this.findOne({ _id: gardenId, user: userId })
    .populate('plants.plant', 'name scientificName imageUrl sunRequirements waterRequirements')
    .lean();
};

const Garden = mongoose.model('Garden', gardenSchema);

module.exports = Garden;