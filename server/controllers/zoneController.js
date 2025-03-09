const Zone = require('../models/Zone');
const axios = require('axios');

// Get all zones
exports.getAllZones = async (req, res) => {
  try {
    const zones = await Zone.find().sort('zone');
    
    res.status(200).json({
      status: 'success',
      results: zones.length,
      data: {
        zones,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get a specific zone
exports.getZone = async (req, res) => {
  try {
    const zone = await Zone.findOne({ zone: req.params.zone })
      .populate({
        path: 'recommended_plants',
        select: 'name image_url description tags',
      });
    
    if (!zone) {
      return res.status(404).json({
        status: 'fail',
        message: 'Zone not found',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        zone,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get zone by location
exports.getZoneByLocation = async (req, res) => {
  try {
    const { zipCode, lat, lng } = req.query;
    
    // If zipCode is provided, use that for lookup
    if (zipCode) {
      try {
        // This would typically use a real API like the USDA Plant Hardiness Zone API
        // Here we're mocking the response for demonstration purposes
        const response = await mockZipCodeLookup(zipCode);
        
        const zoneData = response.data;
        
        // Get the full zone information from our database
        const zone = await Zone.findOne({ zone: zoneData.zone })
          .populate({
            path: 'recommended_plants',
            select: 'name image_url description tags',
          });
        
        if (!zone) {
          return res.status(404).json({
            status: 'fail',
            message: 'Zone information not found for this location',
          });
        }
        
        res.status(200).json({
          status: 'success',
          data: {
            zone,
            frost_dates: zoneData.frost_dates,
          },
        });
      } catch (error) {
        return res.status(400).json({
          status: 'fail',
          message: 'Error looking up zone by zip code',
          error: error.message,
        });
      }
    } 
    // If lat/lng are provided, use those for lookup
    else if (lat && lng) {
      try {
        // This would typically use a real API like the USDA Plant Hardiness Zone API
        // Here we're mocking the response for demonstration purposes
        const response = await mockCoordinateLookup(lat, lng);
        
        const zoneData = response.data;
        
        // Get the full zone information from our database
        const zone = await Zone.findOne({ zone: zoneData.zone })
          .populate({
            path: 'recommended_plants',
            select: 'name image_url description tags',
          });
        
        if (!zone) {
          return res.status(404).json({
            status: 'fail',
            message: 'Zone information not found for this location',
          });
        }
        
        res.status(200).json({
          status: 'success',
          data: {
            zone,
            frost_dates: zoneData.frost_dates,
          },
        });
      } catch (error) {
        return res.status(400).json({
          status: 'fail',
          message: 'Error looking up zone by coordinates',
          error: error.message,
        });
      }
    } else {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide either zipCode or lat and lng parameters',
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Create a new zone (admin only)
exports.createZone = async (req, res) => {
  try {
    const newZone = await Zone.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        zone: newZone,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Update a zone (admin only)
exports.updateZone = async (req, res) => {
  try {
    const zone = await Zone.findOneAndUpdate(
      { zone: req.params.zone },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    
    if (!zone) {
      return res.status(404).json({
        status: 'fail',
        message: 'Zone not found',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        zone,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Delete a zone (admin only)
exports.deleteZone = async (req, res) => {
  try {
    const zone = await Zone.findOneAndDelete({ zone: req.params.zone });
    
    if (!zone) {
      return res.status(404).json({
        status: 'fail',
        message: 'Zone not found',
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Mock functions for demonstration purposes
// In a real application, these would be API calls to real services
async function mockZipCodeLookup(zipCode) {
  // Simulate API response delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Map zipCode to a hardiness zone (simplified example)
  let zone;
  let frost_dates = {};
  
  const zipNum = parseInt(zipCode, 10);
  
  if (zipNum >= 10000 && zipNum < 20000) {
    zone = '7a';
    frost_dates = {
      last_spring_frost: '2023-04-15',
      first_fall_frost: '2023-10-15',
    };
  } else if (zipNum >= 20000 && zipNum < 30000) {
    zone = '6b';
    frost_dates = {
      last_spring_frost: '2023-05-01',
      first_fall_frost: '2023-10-01',
    };
  } else if (zipNum >= 30000 && zipNum < 40000) {
    zone = '8a';
    frost_dates = {
      last_spring_frost: '2023-03-30',
      first_fall_frost: '2023-11-01',
    };
  } else if (zipNum >= 40000 && zipNum < 50000) {
    zone = '5b';
    frost_dates = {
      last_spring_frost: '2023-05-15',
      first_fall_frost: '2023-09-15',
    };
  } else if (zipNum >= 90000 && zipNum < 100000) {
    zone = '10a';
    frost_dates = {
      last_spring_frost: '2023-02-01',
      first_fall_frost: '2023-12-15',
    };
  } else {
    zone = '6a';
    frost_dates = {
      last_spring_frost: '2023-04-30',
      first_fall_frost: '2023-10-01',
    };
  }
  
  return {
    data: {
      zone,
      frost_dates,
    },
  };
}

async function mockCoordinateLookup(lat, lng) {
  // Simulate API response delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Map coordinates to a hardiness zone (simplified example)
  let zone;
  let frost_dates = {};
  
  // Northern regions
  if (lat > 40) {
    if (lng < -100) { // Northwest
      zone = '4b';
      frost_dates = {
        last_spring_frost: '2023-05-30',
        first_fall_frost: '2023-09-01',
      };
    } else { // Northeast
      zone = '5a';
      frost_dates = {
        last_spring_frost: '2023-05-15',
        first_fall_frost: '2023-09-15',
      };
    }
  } 
  // Middle regions
  else if (lat > 35) {
    if (lng < -100) { // West
      zone = '6b';
      frost_dates = {
        last_spring_frost: '2023-04-15',
        first_fall_frost: '2023-10-15',
      };
    } else { // East
      zone = '7a';
      frost_dates = {
        last_spring_frost: '2023-04-01',
        first_fall_frost: '2023-11-01',
      };
    }
  } 
  // Southern regions
  else {
    if (lng < -100) { // Southwest
      zone = '8b';
      frost_dates = {
        last_spring_frost: '2023-03-01',
        first_fall_frost: '2023-11-15',
      };
    } else { // Southeast
      zone = '9a';
      frost_dates = {
        last_spring_frost: '2023-02-15',
        first_fall_frost: '2023-12-01',
      };
    }
  }
  
  return {
    data: {
      zone,
      frost_dates,
    },
  };
}