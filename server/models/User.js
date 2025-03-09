const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    verification_token: {
      type: String,
      select: false,
    },
    verification_token_expires: {
      type: Date,
      select: false,
    },
    newsletter_subscription: {
      subscribed: {
        type: Boolean,
        default: false,
      },
      preferences: {
        weekly_tips: {
          type: Boolean,
          default: true,
        },
        product_updates: {
          type: Boolean,
          default: true,
        },
        seasonal_alerts: {
          type: Boolean,
          default: true,
        },
      },
      unsubscribe_token: {
        type: String,
        select: false,
      },
    },
    location: {
      address: String,
      zipCode: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
        },
      },
    },
    hardiness_zone: {
      type: String,
    },
    gardens: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Garden',
      },
    ],
    experience_level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
    preferences: {
      notifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
    },
    // Added subscription tier information
    subscription: {
      tier: {
        type: String,
        enum: ['free', 'starter', 'garden_pro', 'market_garden'],
        default: 'free',
      },
      limits: {
        plants: {
          type: Number,
          default: 10, // Free tier default
        },
        inventory_items: {
          type: Number,
          default: 5, // Free tier default
        },
        succession_plans: {
          type: Number,
          default: 3, // Free tier default
        },
      },
      start_date: Date,
      renewal_date: Date,
      payment_method: {
        type: String,
        select: false,
      },
      status: {
        type: String,
        enum: ['active', 'canceled', 'past_due'],
        default: 'active',
      },
    },
    // Added historical tracking for plant success
    plant_history: [
      {
        plant: {
          type: mongoose.Schema.ObjectId,
          ref: 'Plant',
        },
        year: Number,
        actual_planting_date: Date,
        germination_success_rate: {
          type: Number,
          min: 0,
          max: 100,
        },
        harvest_start_date: Date,
        harvest_end_date: Date,
        yield_rating: {
          type: Number,
          min: 1, 
          max: 5,
        },
        notes: String,
        variety: String,
        seed_source: String,
      },
    ],
    // Added microclimate profiles
    microclimate_profiles: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Microclimate',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create location index for geospatial queries
userSchema.index({ 'location.coordinates': '2dsphere' });

// Pre-save middleware to hash the password
userSchema.pre('save', async function (next) {
  // Only run if password is modified
  if (!this.isModified('password')) return next();
  
  // Hash the password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to compare passwords
userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;