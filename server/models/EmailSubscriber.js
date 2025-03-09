const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');

const emailSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verification_token: String,
    verification_token_expires: Date,
    subscribed_at: {
      type: Date,
      default: Date.now,
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
    marketing_consent: {
      type: Boolean,
      default: true,
    },
    unsubscribe_token: String,
    converted_to_user: {
      type: Boolean,
      default: false,
    },
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    last_campaign_sent: Date,
    source: {
      type: String,
      enum: ['homepage', 'blog', 'referral', 'social', 'other'],
      default: 'homepage',
    },
    utm_parameters: {
      source: String,
      medium: String,
      campaign: String,
    },
  },
  {
    timestamps: true,
  }
);

// Method to generate verification token
emailSubscriberSchema.methods.createVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.verification_token = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  this.verification_token_expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Method to generate unsubscribe token
emailSubscriberSchema.methods.createUnsubscribeToken = function() {
  const unsubscribeToken = crypto.randomBytes(32).toString('hex');
  
  this.unsubscribe_token = crypto
    .createHash('sha256')
    .update(unsubscribeToken)
    .digest('hex');
    
  return unsubscribeToken;
};

const EmailSubscriber = mongoose.model('EmailSubscriber', emailSubscriberSchema);

module.exports = EmailSubscriber;