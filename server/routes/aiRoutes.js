const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authController = require('../controllers/authController');

// All AI routes require authentication
router.use(authController.protect);

router.get('/recommendations', aiController.getPersonalizedRecommendations);
router.get('/companions/:plant_id', aiController.getCompanionPlantingSuggestions);
router.post('/question', aiController.answerGardeningQuestion);
router.post('/garden-layout', aiController.generateGardenLayout);
router.get('/seasonal-tips', aiController.getSeasonalGardeningTips);

module.exports = router;