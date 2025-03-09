const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Create and send token with response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// Register new user
exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      location: req.body.location,
      hardiness_zone: req.body.hardiness_zone,
      experience_level: req.body.experience_level,
      newsletter_subscription: {
        subscribed: req.body.subscribe_to_newsletter || false,
        preferences: {
          weekly_tips: true,
          product_updates: true,
          seasonal_alerts: true,
        }
      }
    });
    
    // Generate email verification token
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    newUser.verification_token = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
      
    newUser.verification_token_expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    await newUser.save({ validateBeforeSave: false });
    
    // Try to connect with existing email subscriber if it exists
    const emailController = require('./emailController');
    await emailController.convertSubscriberToUser(newUser._id, newUser.email);
    
    // Send verification email
    const sendEmail = async (options) => {
      // Implement email sending with your preferred provider
      console.log('Email would be sent with these options:', options);
      // Replace with actual email sending implementation
    };
    
    try {
      await sendEmail({
        email: newUser.email,
        subject: 'Garden App: Verify Your Email',
        message: `Welcome to Garden App! Please verify your email by clicking on this link: ${process.env.FRONTEND_URL}/verify-email/${verificationToken}`,
      });
      
      createSendToken(newUser, 201, res);
    } catch (err) {
      console.error('Error sending verification email:', err);
      // Still create the user, just note that email couldn't be sent
      createSendToken(newUser, 201, res);
    }
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password',
      });
    }

    // If everything is ok, send token to client
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  try {
    // 1) Get token and check if it exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access',
      });
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists',
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'fail',
      message: 'Not authorized',
    });
  }
};

// Middleware to restrict to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};

// Get current user profile
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Update user profile
exports.updateMe = async (req, res, next) => {
  try {
    // 1) Create error if user tries to update password
    if (req.body.password) {
      return res.status(400).json({
        status: 'fail',
        message: 'This route is not for password updates. Please use /updatePassword',
      });
    }

    // 2) Filter out unwanted fields that are not allowed to be updated
    const filteredBody = {};
    const allowedFields = ['name', 'email', 'location', 'hardiness_zone', 'experience_level', 'preferences'];
    
    Object.keys(req.body).forEach(field => {
      if (allowedFields.includes(field)) {
        filteredBody[field] = req.body[field];
      }
    });

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Update password
exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if current password is correct
    if (!(await user.correctPassword(req.body.currentPassword))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your current password is wrong',
      });
    }

    // 3) If so, update password
    user.password = req.body.newPassword;
    await user.save();

    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Verify user email address
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    const crypto = require('crypto');
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    const user = await User.findOne({
      verification_token: hashedToken,
      verification_token_expires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired'
      });
    }
    
    // Update user
    user.email_verified = true;
    user.verification_token = undefined;
    user.verification_token_expires = undefined;
    await user.save({ validateBeforeSave: false });
    
    // Send success response
    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully. You can now login.'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide your email'
      });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that email address'
      });
    }
    
    if (user.email_verified) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email is already verified'
      });
    }
    
    // Generate new verification token
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    user.verification_token = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
      
    user.verification_token_expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    await user.save({ validateBeforeSave: false });
    
    // Send verification email
    const sendEmail = async (options) => {
      // Implement email sending with your preferred provider
      console.log('Email would be sent with these options:', options);
      // Replace with actual email sending implementation
    };
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Garden App: Verify Your Email',
        message: `Please verify your email by clicking on this link: ${process.env.FRONTEND_URL}/verify-email/${verificationToken}`,
      });
      
      res.status(200).json({
        status: 'success',
        message: 'Verification email sent. Please check your inbox.'
      });
    } catch (err) {
      user.verification_token = undefined;
      user.verification_token_expires = undefined;
      await user.save({ validateBeforeSave: false });
      
      return res.status(500).json({
        status: 'fail',
        message: 'There was an error sending the email. Please try again later.'
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};