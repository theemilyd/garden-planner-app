const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const authController = require('../controllers/authController');

// Public routes
router.get('/current', weatherController.getCurrentWeather);
router.get('/forecast', weatherController.getWeatherForecast);
router.get('/soil', weatherController.getSoilTemperature);

// Protected routes
router.use(authController.protect);

router.get('/garden/:garden_id/alerts', weatherController.getGardenAlerts);
router.post('/garden/:garden_id/update-data', weatherController.updateGardenWeatherData);

module.exports = router;