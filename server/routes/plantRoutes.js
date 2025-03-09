const express = require('express');
const router = express.Router();
const plantController = require('../controllers/plantController');
const authController = require('../controllers/authController');

// Public routes
router.get('/', plantController.getAllPlants);
router.get('/:id', plantController.getPlant);
router.get('/tag/:tag', plantController.getPlantsByTag);

// Protected routes (require authentication)
router.use(authController.protect);

router.get('/:id/companions', plantController.getCompanionPlants);
router.get('/:id/planting-schedule', plantController.getPlantingSchedule);

// Admin only routes
// router.use(authController.restrictTo('admin'));
router.post('/', plantController.createPlant);
router.patch('/:id', plantController.updatePlant);
router.delete('/:id', plantController.deletePlant);

module.exports = router;