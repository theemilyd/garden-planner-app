const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zoneController');
const authController = require('../controllers/authController');

// Public routes
router.get('/', zoneController.getAllZones);
router.get('/lookup', zoneController.getZoneByLocation);
router.get('/:zone', zoneController.getZone);

// Admin only routes
router.use(authController.protect);
// router.use(authController.restrictTo('admin'));

router.post('/', zoneController.createZone);
router.patch('/:zone', zoneController.updateZone);
router.delete('/:zone', zoneController.deleteZone);

module.exports = router;