const Garden = require('../models/Garden');
const Plant = require('../models/Plant');

// Get all gardens for the current user
exports.getAllGardens = async (req, res) => {
  try {
    const gardens = await Garden.find({ user: req.user.id })
      .sort('-creation_date');

    res.status(200).json({
      status: 'success',
      results: gardens.length,
      data: {
        gardens,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get a specific garden
exports.getGarden = async (req, res) => {
  try {
    const garden = await Garden.findById(req.params.id)
      .populate({
        path: 'plants.plant',
        select: 'name image_url growing_requirements days_to_maturity spacing',
      });

    if (!garden) {
      return res.status(404).json({
        status: 'fail',
        message: 'Garden not found',
      });
    }

    // Check if the garden belongs to the current user
    if (garden.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to access this garden',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        garden,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Create a new garden
exports.createGarden = async (req, res) => {
  try {
    // Set the user ID from the authenticated user
    req.body.user = req.user.id;

    const newGarden = await Garden.create(req.body);

    // Update user with the new garden
    await req.user.updateOne({
      $push: { gardens: newGarden._id },
    });

    res.status(201).json({
      status: 'success',
      data: {
        garden: newGarden,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Update a garden
exports.updateGarden = async (req, res) => {
  try {
    const garden = await Garden.findById(req.params.id);

    if (!garden) {
      return res.status(404).json({
        status: 'fail',
        message: 'Garden not found',
      });
    }

    // Check if the garden belongs to the current user
    if (garden.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this garden',
      });
    }

    // Update the garden
    const updatedGarden = await Garden.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        garden: updatedGarden,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Delete a garden
exports.deleteGarden = async (req, res) => {
  try {
    const garden = await Garden.findById(req.params.id);

    if (!garden) {
      return res.status(404).json({
        status: 'fail',
        message: 'Garden not found',
      });
    }

    // Check if the garden belongs to the current user
    if (garden.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to delete this garden',
      });
    }

    // Delete the garden
    await Garden.findByIdAndDelete(req.params.id);

    // Remove the garden from the user's gardens array
    await req.user.updateOne({
      $pull: { gardens: req.params.id },
    });

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

// Add a plant to a garden
exports.addPlantToGarden = async (req, res) => {
  try {
    const { garden_id, plant_id, position, quantity, status, planting_date } = req.body;

    // Check if the garden exists and belongs to the user
    const garden = await Garden.findById(garden_id);

    if (!garden) {
      return res.status(404).json({
        status: 'fail',
        message: 'Garden not found',
      });
    }

    if (garden.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this garden',
      });
    }

    // Check if the plant exists
    const plant = await Plant.findById(plant_id);

    if (!plant) {
      return res.status(404).json({
        status: 'fail',
        message: 'Plant not found',
      });
    }

    // Create new plant entry
    const newPlantEntry = {
      plant: plant_id,
      position,
      quantity: quantity || 1,
      status: status || 'planned',
      planting_date: planting_date || null,
    };

    // Add plant to garden
    garden.plants.push(newPlantEntry);
    await garden.save();

    res.status(200).json({
      status: 'success',
      data: {
        garden,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Update a plant in a garden
exports.updatePlantInGarden = async (req, res) => {
  try {
    const { garden_id, plant_index } = req.params;
    
    // Check if the garden exists and belongs to the user
    const garden = await Garden.findById(garden_id);

    if (!garden) {
      return res.status(404).json({
        status: 'fail',
        message: 'Garden not found',
      });
    }

    if (garden.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this garden',
      });
    }

    // Check if the plant index is valid
    if (plant_index < 0 || plant_index >= garden.plants.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'Plant not found in garden',
      });
    }

    // Update the plant fields
    const updateFields = [
      'position', 'quantity', 'status', 'planting_date',
      'germination_date', 'first_harvest_date', 'last_harvest_date',
      'notes'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        garden.plants[plant_index][field] = req.body[field];
      }
    });

    // Handle tasks separately - append new tasks if provided
    if (req.body.tasks) {
      if (!garden.plants[plant_index].tasks) {
        garden.plants[plant_index].tasks = [];
      }
      garden.plants[plant_index].tasks.push(...req.body.tasks);
    }

    // Handle journal entries separately - append new entries if provided
    if (req.body.journal) {
      if (!garden.plants[plant_index].journal) {
        garden.plants[plant_index].journal = [];
      }
      garden.plants[plant_index].journal.push(...req.body.journal);
    }

    await garden.save();

    res.status(200).json({
      status: 'success',
      data: {
        garden,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Remove a plant from a garden
exports.removePlantFromGarden = async (req, res) => {
  try {
    const { garden_id, plant_index } = req.params;
    
    // Check if the garden exists and belongs to the user
    const garden = await Garden.findById(garden_id);

    if (!garden) {
      return res.status(404).json({
        status: 'fail',
        message: 'Garden not found',
      });
    }

    if (garden.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this garden',
      });
    }

    // Check if the plant index is valid
    if (plant_index < 0 || plant_index >= garden.plants.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'Plant not found in garden',
      });
    }

    // Remove the plant
    garden.plants.splice(plant_index, 1);
    await garden.save();

    res.status(200).json({
      status: 'success',
      data: {
        garden,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Add or update a task for a plant in a garden
exports.updateTask = async (req, res) => {
  try {
    const { garden_id, plant_index, task_index } = req.params;
    
    // Check if the garden exists and belongs to the user
    const garden = await Garden.findById(garden_id);

    if (!garden) {
      return res.status(404).json({
        status: 'fail',
        message: 'Garden not found',
      });
    }

    if (garden.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this garden',
      });
    }

    // Check if the plant index is valid
    if (plant_index < 0 || plant_index >= garden.plants.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'Plant not found in garden',
      });
    }

    // If task_index is provided, update existing task
    if (task_index !== undefined) {
      // Check if the task index is valid
      if (task_index < 0 || !garden.plants[plant_index].tasks || task_index >= garden.plants[plant_index].tasks.length) {
        return res.status(404).json({
          status: 'fail',
          message: 'Task not found for this plant',
        });
      }

      // Update the task
      Object.keys(req.body).forEach(key => {
        garden.plants[plant_index].tasks[task_index][key] = req.body[key];
      });
    } 
    // Otherwise, add a new task
    else {
      // Initialize tasks array if it doesn't exist
      if (!garden.plants[plant_index].tasks) {
        garden.plants[plant_index].tasks = [];
      }

      // Add the new task
      garden.plants[plant_index].tasks.push(req.body);
    }

    await garden.save();

    res.status(200).json({
      status: 'success',
      data: {
        garden,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Add a journal entry for a plant in a garden
exports.addJournalEntry = async (req, res) => {
  try {
    const { garden_id, plant_index } = req.params;
    const { entry, images } = req.body;
    
    // Check if the garden exists and belongs to the user
    const garden = await Garden.findById(garden_id);

    if (!garden) {
      return res.status(404).json({
        status: 'fail',
        message: 'Garden not found',
      });
    }

    if (garden.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this garden',
      });
    }

    // Check if the plant index is valid
    if (plant_index < 0 || plant_index >= garden.plants.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'Plant not found in garden',
      });
    }

    // Initialize journal array if it doesn't exist
    if (!garden.plants[plant_index].journal) {
      garden.plants[plant_index].journal = [];
    }

    // Add the new journal entry
    garden.plants[plant_index].journal.push({
      date: new Date(),
      entry,
      images: images || [],
    });

    await garden.save();

    res.status(200).json({
      status: 'success',
      data: {
        garden,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};