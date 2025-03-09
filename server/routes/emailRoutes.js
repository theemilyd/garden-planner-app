const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const authController = require('../controllers/authController');

// Public routes for newsletter subscriptions
router.post('/subscribe', emailController.subscribeToNewsletter);
router.get('/verify/:token', emailController.verifySubscriberEmail);
router.get('/unsubscribe/:token', emailController.unsubscribeFromNewsletter);

// Email-gated downloadable resources
router.post('/planting-calendar', emailController.getPlantingCalendar);
router.post('/garden-recommendations', emailController.getPersonalizedRecommendations);


// Routes that can be accessed with or without authentication
router.post('/preferences', emailController.updateNewsletterPreferences);


// Protected routes that require authentication
router.use(authController.protect);

// Additional protected routes can be added here

module.exports = router;