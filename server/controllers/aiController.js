const axios = require('axios');
const User = require('../models/User');
const Plant = require('../models/Plant');
const Garden = require('../models/Garden');

// Get personalized recommendations based on user's garden, experience, and zone
exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user information
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }
    
    // Get user's existing gardens and plants
    const userGardens = await Garden.find({ user: userId })
      .populate({
        path: 'plants.plant',
        select: 'name tags growing_requirements hardiness_zones',
      });

    // Extract relevant user data for the AI
    const userData = {
      hardiness_zone: user.hardiness_zone,
      experience_level: user.experience_level,
      location: user.location,
      existing_plants: [],
    };
    
    // Extract plants from user's gardens
    userGardens.forEach(garden => {
      garden.plants.forEach(plant => {
        if (plant.plant) {
          userData.existing_plants.push({
            name: plant.plant.name,
            tags: plant.plant.tags,
            status: plant.status,
          });
        }
      });
    });
    
    // Call Claude API for personalized recommendations
    // In a real application, this would use the actual Claude API
    // For now, we're using a mock function
    const recommendations = await getClaudeRecommendations(userData);
    
    res.status(200).json({
      status: 'success',
      data: {
        recommendations,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get companion planting suggestions for a specific plant
exports.getCompanionPlantingSuggestions = async (req, res) => {
  try {
    const { plant_id } = req.params;
    
    // Get the plant
    const plant = await Plant.findById(plant_id);
    
    if (!plant) {
      return res.status(404).json({
        status: 'fail',
        message: 'Plant not found',
      });
    }
    
    // Prepare plant data for AI
    const plantData = {
      name: plant.name,
      scientific_name: plant.scientific_name,
      tags: plant.tags,
      growing_requirements: plant.growing_requirements,
    };
    
    // Get user's hardiness zone
    const user = await User.findById(req.user.id);
    
    // Call Claude API for companion planting suggestions
    // In a real application, this would use the actual Claude API
    // For now, we're using a mock function
    const suggestions = await getClaudeCompanionPlants(plantData, user.hardiness_zone);
    
    res.status(200).json({
      status: 'success',
      data: {
        plant: plant.name,
        companion_suggestions: suggestions,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Answer gardening questions with AI
exports.answerGardeningQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a question',
      });
    }
    
    // Get user context for more relevant answers
    const user = await User.findById(req.user.id);
    
    const userContext = {
      hardiness_zone: user.hardiness_zone,
      experience_level: user.experience_level,
      location: user.location,
    };
    
    // Call Claude API to answer the gardening question
    // In a real application, this would use the actual Claude API
    // For now, we're using a mock function
    const answer = await getClaudeGardeningAnswer(question, userContext);
    
    res.status(200).json({
      status: 'success',
      data: {
        question,
        answer,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Generate a garden layout suggestion based on user input
exports.generateGardenLayout = async (req, res) => {
  try {
    const { 
      width, 
      length, 
      desired_plants, 
      garden_type, 
      sun_exposure,
      soil_type
    } = req.body;
    
    if (!width || !length || !desired_plants || !garden_type || !sun_exposure) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide width, length, desired_plants, garden_type, and sun_exposure',
      });
    }
    
    // Get user context
    const user = await User.findById(req.user.id);
    
    // Verify plants exist and get their details
    const plantIds = desired_plants.map(plant => plant.id);
    const plants = await Plant.find({ _id: { $in: plantIds } });
    
    if (plants.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No valid plants found',
      });
    }
    
    // Prepare input for AI
    const layoutInput = {
      dimensions: { width, length },
      garden_type,
      sun_exposure,
      soil_type: soil_type || 'unknown',
      hardiness_zone: user.hardiness_zone,
      plants: plants.map(plant => ({
        id: plant._id,
        name: plant.name,
        quantity: desired_plants.find(dp => dp.id === plant._id.toString())?.quantity || 1,
        spacing: plant.spacing,
        sun_needs: plant.growing_requirements.sunlight,
      })),
    };
    
    // Call Claude API for garden layout suggestions
    // In a real application, this would use the actual Claude API
    // For now, we're using a mock function
    const layout = await getClaudeGardenLayout(layoutInput);
    
    res.status(200).json({
      status: 'success',
      data: {
        layout,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get gardening tips based on season, location, and experience level
exports.getSeasonalGardeningTips = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }
    
    // Determine current season based on hemisphere and month
    const currentDate = new Date();
    const month = currentDate.getMonth(); // 0-11 (Jan-Dec)
    
    // Default to Northern Hemisphere
    let season;
    if (month >= 2 && month <= 4) {
      season = 'spring';
    } else if (month >= 5 && month <= 7) {
      season = 'summer';
    } else if (month >= 8 && month <= 10) {
      season = 'fall';
    } else {
      season = 'winter';
    }
    
    // If location has latitude and it's negative, we're in Southern Hemisphere
    // So invert the seasons
    if (user.location && 
        user.location.coordinates && 
        user.location.coordinates.coordinates && 
        user.location.coordinates.coordinates[1] < 0) {
      switch (season) {
        case 'spring':
          season = 'fall';
          break;
        case 'summer':
          season = 'winter';
          break;
        case 'fall':
          season = 'spring';
          break;
        case 'winter':
          season = 'summer';
          break;
      }
    }
    
    const tipsInput = {
      season,
      hardiness_zone: user.hardiness_zone,
      experience_level: user.experience_level,
    };
    
    // Call Claude API for seasonal gardening tips
    // In a real application, this would use the actual Claude API
    // For now, we're using a mock function
    const tips = await getClaudeSeasonalTips(tipsInput);
    
    res.status(200).json({
      status: 'success',
      data: {
        season,
        zone: user.hardiness_zone,
        tips,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// ============= MOCK FUNCTIONS FOR CLAUDE API CALLS ================
// In a real application, these would be actual API calls to Claude

async function getClaudeRecommendations(userData) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Construct mock recommendations based on user data
  const recommendations = {
    recommended_plants: [],
    recommendations_by_category: {},
    personalized_advice: '',
  };
  
  // Based on hardiness zone
  const zoneRecommendations = getPlantSuggestionsByZone(userData.hardiness_zone);
  recommendations.recommended_plants.push(...zoneRecommendations);
  
  // Based on experience level
  let advice = '';
  switch (userData.experience_level) {
    case 'beginner':
      advice = 'As a beginner, focus on easy-to-grow plants like tomatoes, zucchini, and marigolds. Start small with a few plants and expand as you gain confidence. Regular watering and observation are key to success.';
      recommendations.recommended_plants.push(
        { name: 'Cherry Tomatoes', reason: 'Easy to grow and prolific producers' },
        { name: 'Zucchini', reason: 'Fast-growing and high-yielding' },
        { name: 'Marigolds', reason: 'Low-maintenance and help repel pests' }
      );
      break;
    case 'intermediate':
      advice = 'With your intermediate experience, you can experiment with more varied crops and techniques like succession planting and companion planting. Consider adding some perennials to your garden for year-after-year harvests.';
      recommendations.recommended_plants.push(
        { name: 'Eggplant', reason: 'Ready for a more challenging vegetable' },
        { name: 'Cucumber', reason: 'Good for practicing trellising techniques' },
        { name: 'Basil', reason: 'Great companion for tomatoes and peppers' }
      );
      break;
    case 'advanced':
      advice = 'As an advanced gardener, consider heirloom varieties and more unusual plants. You might enjoy starting seeds indoors, grafting, or experimenting with season extension techniques.';
      recommendations.recommended_plants.push(
        { name: 'Heirloom Tomatoes', reason: 'Diverse flavors and colors' },
        { name: 'Artichokes', reason: 'Challenging but rewarding perennial' },
        { name: 'Asparagus', reason: 'Long-term perennial vegetable' }
      );
      break;
    case 'expert':
      advice = 'With your expert knowledge, you might enjoy more specialized growing techniques like hydroponics or aquaponics. Consider rare heirloom varieties, breeding projects, or plants that are challenging in your climate.';
      recommendations.recommended_plants.push(
        { name: 'Rare Pepper Varieties', reason: 'Unique flavors and growing challenges' },
        { name: 'Exotic Fruits', reason: 'Pushing the boundaries of your growing zone' },
        { name: 'Native Wildflowers', reason: 'Creating habitat for beneficial insects' }
      );
      break;
  }
  
  recommendations.personalized_advice = advice;
  
  // Create category-based recommendations
  recommendations.recommendations_by_category = {
    vegetables: [
      { name: 'Tomatoes', reason: 'Versatile and rewarding' },
      { name: 'Lettuce', reason: 'Quick-growing for regular harvests' },
      { name: 'Bell Peppers', reason: 'Colorful and nutritious' },
    ],
    herbs: [
      { name: 'Basil', reason: 'Aromatic and pairs well with tomatoes' },
      { name: 'Rosemary', reason: 'Drought-tolerant perennial' },
      { name: 'Thyme', reason: 'Low-maintenance ground cover' },
    ],
    flowers: [
      { name: 'Sunflowers', reason: 'Cheerful and attract pollinators' },
      { name: 'Zinnias', reason: 'Long-blooming and great for cutting' },
      { name: 'Nasturtiums', reason: 'Edible flowers and natural pest deterrent' },
    ]
  };
  
  return recommendations;
}

function getPlantSuggestionsByZone(zone) {
  // Extract just the number from zone (e.g., "7a" -> 7)
  const zoneNum = parseInt(zone);
  
  // Default suggestions
  const suggestions = [];
  
  if (zoneNum <= 4) {
    // Cold hardy plants for northern zones
    suggestions.push(
      { name: 'Kale', reason: 'Cold-tolerant and nutritious' },
      { name: 'Potatoes', reason: 'Reliable crop for cooler climates' },
      { name: 'Rhubarb', reason: 'Hardy perennial that thrives in cold winters' }
    );
  } else if (zoneNum <= 7) {
    // Temperate zone plants
    suggestions.push(
      { name: 'Tomatoes', reason: 'Perfect for your growing season' },
      { name: 'Peppers', reason: 'Thrive in your warm summers' },
      { name: 'Strawberries', reason: 'Perennial that produces well in your zone' }
    );
  } else if (zoneNum <= 10) {
    // Warm zone plants
    suggestions.push(
      { name: 'Citrus Trees', reason: 'Well-suited to your mild winters' },
      { name: 'Okra', reason: 'Thrives in hot summers' },
      { name: 'Sweet Potatoes', reason: 'Long growing season crop' }
    );
  } else {
    // Tropical zone plants
    suggestions.push(
      { name: 'Avocado', reason: 'Perfect for your frost-free climate' },
      { name: 'Papaya', reason: 'Fast-growing tropical fruit' },
      { name: 'Banana', reason: 'Thrives in your tropical conditions' }
    );
  }
  
  return suggestions;
}

async function getClaudeCompanionPlants(plantData, zone) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock companion planting suggestions based on plant type
  const companions = {
    beneficial: [],
    harmful: [],
    neutral: [],
  };
  
  // Check plant tags to determine type
  const isVegetable = plantData.tags && plantData.tags.some(tag => 
    ['vegetable', 'tomato', 'pepper', 'bean', 'squash', 'brassica', 'root'].includes(tag.toLowerCase())
  );
  
  const isHerb = plantData.tags && plantData.tags.some(tag => 
    ['herb', 'mint', 'basil', 'cilantro', 'dill', 'parsley'].includes(tag.toLowerCase())
  );
  
  const isFlower = plantData.tags && plantData.tags.some(tag => 
    ['flower', 'annual', 'perennial', 'rose', 'sunflower'].includes(tag.toLowerCase())
  );
  
  // Generate companion suggestions based on plant type
  if (plantData.name.toLowerCase().includes('tomato') || (plantData.tags && plantData.tags.includes('tomato'))) {
    companions.beneficial = [
      { name: 'Basil', benefit: 'Improves flavor and repels pests' },
      { name: 'Marigolds', benefit: 'Repel nematodes and other pests' },
      { name: 'Carrots', benefit: 'Grow well together and maximize space' },
    ];
    companions.harmful = [
      { name: 'Potatoes', reason: 'Share diseases and pests' },
      { name: 'Cabbage', reason: 'Inhibits tomato growth' },
      { name: 'Fennel', reason: 'Allelopathic effects inhibit growth' },
    ];
    companions.neutral = [
      { name: 'Lettuce', note: 'Can be interplanted for shade' },
      { name: 'Radishes', note: 'Quick-growing crop for between tomato plants' },
    ];
  } else if (isHerb) {
    companions.beneficial = [
      { name: 'Tomatoes', benefit: 'Many herbs improve tomato flavor' },
      { name: 'Roses', benefit: 'Herbs repel pests that attack roses' },
      { name: 'Brassicas', benefit: 'Herbs mask the scent of brassicas from pests' },
    ];
    companions.harmful = [
      { name: 'Other Herbs', reason: 'Some herbs compete for resources' },
    ];
    companions.neutral = [
      { name: 'Most Vegetables', note: 'Generally compatible' },
      { name: 'Flowers', note: 'Aesthetic and functional combinations' },
    ];
  } else if (isFlower) {
    companions.beneficial = [
      { name: 'Vegetables', benefit: 'Flowers attract pollinators and beneficial insects' },
      { name: 'Herbs', benefit: 'Combination provides pest management' },
    ];
    companions.harmful = [
      { name: 'Competitive Flowers', reason: 'May compete for resources' },
    ];
    companions.neutral = [
      { name: 'Most Plants', note: 'Generally compatible' },
    ];
  } else if (isVegetable) {
    companions.beneficial = [
      { name: 'Marigolds', benefit: 'Natural pest deterrent' },
      { name: 'Nasturtiums', benefit: 'Trap crop for aphids' },
      { name: 'Herbs', benefit: 'Many herbs repel pests' },
    ];
    companions.harmful = [
      { name: 'Plants in same family', reason: 'Share pests and diseases' },
    ];
    companions.neutral = [
      { name: 'Most vegetables in different families', note: 'Generally compatible' },
    ];
  } else {
    // Generic companions for unknown plant types
    companions.beneficial = [
      { name: 'Marigolds', benefit: 'Pest deterrent for most plants' },
      { name: 'Herbs', benefit: 'Attract beneficial insects' },
    ];
    companions.neutral = [
      { name: 'Most plants', note: 'Research specific companions for best results' },
    ];
  }
  
  return companions;
}

async function getClaudeGardeningAnswer(question, userContext) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Basic question parsing
  const lowerQuestion = question.toLowerCase();
  
  // Common gardening questions and answers
  if (lowerQuestion.includes('when to plant') || lowerQuestion.includes('planting time')) {
    return `Based on your hardiness zone (${userContext.hardiness_zone}), the best planting times depend on the specific crop. For cool-season crops like lettuce and peas, plant 2-4 weeks before your last spring frost date. For warm-season crops like tomatoes and peppers, plant after all danger of frost has passed. Check a planting calendar specific to your zone for more precise dates.`;
  }
  
  if (lowerQuestion.includes('how often') && lowerQuestion.includes('water')) {
    return `Watering frequency depends on your soil type, plant needs, and weather conditions. Generally, vegetables need about 1-1.5 inches of water per week, either from rainfall or irrigation. It's better to water deeply and less frequently to encourage deep root growth. Check soil moisture by inserting your finger about 2 inches into the soil - if it feels dry at that depth, it's time to water.`;
  }
  
  if (lowerQuestion.includes('pest') || lowerQuestion.includes('bug') || lowerQuestion.includes('insect')) {
    return `For organic pest control, start with prevention through healthy soil, crop rotation, and companion planting. For active infestations, try insecticidal soap, neem oil, or diatomaceous earth for soft-bodied pests. Encourage beneficial insects like ladybugs and lacewings. For your ${userContext.experience_level} level, row covers can also be an effective preventative measure for many common garden pests.`;
  }
  
  if (lowerQuestion.includes('fertilize') || lowerQuestion.includes('fertilizer') || lowerQuestion.includes('feed')) {
    return `For most garden plants, apply a balanced organic fertilizer (like compost or a 10-10-10 mix) at planting time. During the growing season, side-dress heavy feeders like tomatoes every 4-6 weeks. Leafy greens benefit from nitrogen-rich fertilizers, while flowering and fruiting plants need more phosphorus. In your hardiness zone (${userContext.hardiness_zone}), you might need to adjust timing based on your growing season length.`;
  }
  
  if (lowerQuestion.includes('soil') && (lowerQuestion.includes('improve') || lowerQuestion.includes('amend'))) {
    return `To improve your soil, add organic matter like compost, aged manure, or leaf mold. Aim to incorporate 2-3 inches of compost into your garden beds annually. For clay soil, also add coarse sand or fine gravel to improve drainage. For sandy soil, focus on adding more organic matter to improve water retention. Regular soil tests can help you identify specific amendments needed for your garden.`;
  }
  
  // Default response for other questions
  return `Thank you for your question about "${question}". As an experienced gardener would advise, the answer depends on several factors including your specific plants, soil conditions, and local climate. In your hardiness zone (${userContext.hardiness_zone}), you'll want to consider seasonal timing and microclimate factors. For more specific guidance, try asking about particular plants or gardening techniques.`;
}

async function getClaudeGardenLayout(layoutInput) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create a mock garden layout based on input
  const { dimensions, garden_type, sun_exposure, plants } = layoutInput;
  
  // Sort plants by sun needs to group them appropriately
  const fullSunPlants = plants.filter(p => p.sun_needs === 'full sun');
  const partialSunPlants = plants.filter(p => p.sun_needs === 'partial sun' || p.sun_needs === 'partial shade');
  const shadePlants = plants.filter(p => p.sun_needs === 'full shade');
  
  // Create a layout object with grid and recommendations
  const layout = {
    garden_type,
    dimensions: { width: dimensions.width, length: dimensions.length },
    grid: [],
    plant_placement: [],
    companion_recommendations: [],
    layout_description: '',
  };
  
  // Create a mockup grid representation (simplified)
  const gridWidth = Math.ceil(dimensions.width);
  const gridLength = Math.ceil(dimensions.length);
  
  // Initialize empty grid
  for (let y = 0; y < gridLength; y++) {
    layout.grid[y] = Array(gridWidth).fill('empty');
  }
  
  // Place plants based on sun needs and garden type
  // This is a simplified placement algorithm
  
  // For raised beds or containers, we'll place larger plants at the back (north)
  // and shorter plants toward the front
  if (garden_type === 'raised bed' || garden_type === 'container') {
    let currentRow = 0;
    
    // Place full sun plants at the back (assuming north side of bed)
    if (fullSunPlants.length > 0) {
      for (let i = 0; i < fullSunPlants.length && currentRow < gridLength; i++) {
        const plant = fullSunPlants[i];
        for (let x = 0; x < gridWidth; x++) {
          if (x < plant.quantity && currentRow < gridLength) {
            layout.grid[currentRow][x] = plant.name;
            layout.plant_placement.push({
              name: plant.name,
              position: { row: currentRow, column: x },
              sun_needs: plant.sun_needs,
            });
          }
        }
        currentRow++;
      }
    }
    
    // Place partial sun plants in the middle
    if (partialSunPlants.length > 0) {
      for (let i = 0; i < partialSunPlants.length && currentRow < gridLength; i++) {
        const plant = partialSunPlants[i];
        for (let x = 0; x < gridWidth; x++) {
          if (x < plant.quantity && currentRow < gridLength) {
            layout.grid[currentRow][x] = plant.name;
            layout.plant_placement.push({
              name: plant.name,
              position: { row: currentRow, column: x },
              sun_needs: plant.sun_needs,
            });
          }
        }
        currentRow++;
      }
    }
    
    // Place shade plants at the front
    if (shadePlants.length > 0) {
      for (let i = 0; i < shadePlants.length && currentRow < gridLength; i++) {
        const plant = shadePlants[i];
        for (let x = 0; x < gridWidth; x++) {
          if (x < plant.quantity && currentRow < gridLength) {
            layout.grid[currentRow][x] = plant.name;
            layout.plant_placement.push({
              name: plant.name,
              position: { row: currentRow, column: x },
              sun_needs: plant.sun_needs,
            });
          }
        }
        currentRow++;
      }
    }
    
    layout.layout_description = `This ${dimensions.width}' x ${dimensions.length}' ${garden_type} is oriented with taller plants at the back (north side) to prevent shading smaller plants. Plants are grouped according to their sun and water needs. Consider adding a layer of mulch to retain moisture and suppress weeds.`;
  } 
  // For in-ground gardens, we'll create a more block-based layout
  else {
    // Divide the garden into sun exposure zones
    const fullSunZone = { startRow: 0, endRow: Math.floor(gridLength / 3) };
    const partialSunZone = { startRow: Math.floor(gridLength / 3), endRow: Math.floor(2 * gridLength / 3) };
    const shadeZone = { startRow: Math.floor(2 * gridLength / 3), endRow: gridLength };
    
    // Place full sun plants
    if (fullSunPlants.length > 0) {
      let col = 0;
      for (let i = 0; i < fullSunPlants.length; i++) {
        const plant = fullSunPlants[i];
        for (let q = 0; q < plant.quantity; q++) {
          const row = fullSunZone.startRow + Math.floor(Math.random() * (fullSunZone.endRow - fullSunZone.startRow));
          if (col < gridWidth) {
            layout.grid[row][col] = plant.name;
            layout.plant_placement.push({
              name: plant.name,
              position: { row, column: col },
              sun_needs: plant.sun_needs,
            });
            col++;
          }
        }
      }
    }
    
    // Place partial sun plants
    if (partialSunPlants.length > 0) {
      let col = 0;
      for (let i = 0; i < partialSunPlants.length; i++) {
        const plant = partialSunPlants[i];
        for (let q = 0; q < plant.quantity; q++) {
          const row = partialSunZone.startRow + Math.floor(Math.random() * (partialSunZone.endRow - partialSunZone.startRow));
          if (col < gridWidth) {
            layout.grid[row][col] = plant.name;
            layout.plant_placement.push({
              name: plant.name,
              position: { row, column: col },
              sun_needs: plant.sun_needs,
            });
            col++;
          }
        }
      }
    }
    
    // Place shade plants
    if (shadePlants.length > 0) {
      let col = 0;
      for (let i = 0; i < shadePlants.length; i++) {
        const plant = shadePlants[i];
        for (let q = 0; q < plant.quantity; q++) {
          const row = shadeZone.startRow + Math.floor(Math.random() * (shadeZone.endRow - shadeZone.startRow));
          if (col < gridWidth) {
            layout.grid[row][col] = plant.name;
            layout.plant_placement.push({
              name: plant.name,
              position: { row, column: col },
              sun_needs: plant.sun_needs,
            });
            col++;
          }
        }
      }
    }
    
    layout.layout_description = `This ${dimensions.width}' x ${dimensions.length}' in-ground garden is divided into zones based on sun exposure. The northern section gets the most sun, while the southern section is more shaded. Plants are grouped according to their light requirements and companion planting principles.`;
  }
  
  // Add companion planting recommendations
  layout.companion_recommendations = [
    'Consider adding marigolds throughout your garden to repel pests',
    'Basil planted near tomatoes improves flavor and repels pests',
    'Nasturtiums can serve as trap crops for aphids',
    'Avoid planting members of the same family together to prevent disease spread',
  ];
  
  return layout;
}

async function getClaudeSeasonalTips(tipsInput) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const { season, hardiness_zone, experience_level } = tipsInput;
  
  // Extract just the number from zone (e.g., "7a" -> 7)
  const zoneNum = parseInt(hardiness_zone);
  
  // Seasonal tips based on season, zone, and experience level
  const tips = {
    tasks: [],
    planting_suggestions: [],
    maintenance: [],
    harvesting: [],
    preparation: [],
  };
  
  // Generate seasonal tasks
  switch (season) {
    case 'spring':
      tips.tasks = [
        'Prepare garden beds by removing weeds and adding compost',
        'Test soil pH and amend as needed',
        'Set up irrigation systems',
        'Start warm-season seeds indoors',
      ];
      
      if (zoneNum <= 4) {
        tips.planting_suggestions = [
          'Peas and fava beans',
          'Leafy greens like spinach and lettuce',
          'Cool-season flowers like pansies',
        ];
      } else if (zoneNum <= 7) {
        tips.planting_suggestions = [
          'Broccoli and cabbage',
          'Root crops like carrots and radishes',
          'Hardy herbs like parsley and cilantro',
        ];
      } else {
        tips.planting_suggestions = [
          'Tomatoes and peppers',
          'Warm-season herbs',
          'Summer flowering bulbs',
        ];
      }
      
      tips.maintenance = [
        'Monitor for early-season pests like aphids',
        'Apply mulch after soil has warmed',
        'Thin seedlings as needed',
      ];
      
      tips.preparation = [
        'Prepare trellises for climbing plants',
        'Clean and maintain garden tools',
        'Plan crop rotation for the season',
      ];
      break;
      
    case 'summer':
      tips.tasks = [
        'Monitor and maintain consistent watering schedule',
        'Apply side dressings of compost to heavy feeders',
        'Stake tall plants as needed',
        'Monitor for pests and diseases regularly',
      ];
      
      if (zoneNum <= 4) {
        tips.planting_suggestions = [
          'Succession plantings of lettuce and spinach',
          'Bush beans and summer squash',
          'Hardy annuals for late-season color',
        ];
      } else if (zoneNum <= 7) {
        tips.planting_suggestions = [
          'Heat-tolerant greens like Swiss chard',
          'Sweet corn and melons',
          'Fall crops of brassicas',
        ];
      } else {
        tips.planting_suggestions = [
          'Heat-loving crops like okra and sweet potatoes',
          'Tropical plants and southern peas',
          'Start planning for fall garden',
        ];
      }
      
      tips.maintenance = [
        'Water deeply and less frequently to encourage deep roots',
        'Mulch heavily to conserve moisture and suppress weeds',
        'Prune tomatoes and remove suckers if desired',
      ];
      
      tips.harvesting = [
        'Harvest vegetables regularly to encourage production',
        'Harvest herbs before they flower for best flavor',
        'Consider preserving excess produce through canning or freezing',
      ];
      break;
      
    case 'fall':
      tips.tasks = [
        'Clean up diseased plant material',
        'Add compost to garden beds',
        'Plant cover crops in vacant areas',
        'Collect seeds from open-pollinated varieties',
      ];
      
      if (zoneNum <= 4) {
        tips.planting_suggestions = [
          'Garlic and onion sets',
          'Cold-hardy spinach varieties',
          'Spring-flowering bulbs',
        ];
      } else if (zoneNum <= 7) {
        tips.planting_suggestions = [
          'Lettuce, kale, and other greens',
          'Root vegetables like turnips and beets',
          'Cool-season herbs',
        ];
      } else {
        tips.planting_suggestions = [
          'Broccoli and cauliflower',
          'Fall peas',
          'Cool-season flowers',
        ];
      }
      
      tips.maintenance = [
        'Reduce watering as temperatures cool',
        'Monitor for late-season pests',
        'Protect tender plants from early frosts',
      ];
      
      tips.harvesting = [
        'Harvest winter squash when rinds are hard',
        'Dig root crops before ground freezes',
        'Harvest green tomatoes before frost and ripen indoors',
      ];
      
      tips.preparation = [
        'Clean and sharpen garden tools',
        'Winterize irrigation systems',
        'Start planning next year\'s garden',
      ];
      break;
      
    case 'winter':
      tips.tasks = [
        'Review last season\'s garden journal',
        'Inventory and order seeds',
        'Repair and maintain garden structures and tools',
        'Plan crop rotations for coming season',
      ];
      
      if (zoneNum <= 4) {
        tips.planting_suggestions = [
          'Start seed viability tests',
          'Start slow-growing flowers indoors',
          'Force bulbs for indoor color',
        ];
      } else if (zoneNum <= 7) {
        tips.planting_suggestions = [
          'Start onions and leeks indoors',
          'Plant bare-root roses and fruit trees',
          'Start cool-season crops in cold frames',
        ];
      } else {
        tips.planting_suggestions = [
          'Cool-season vegetables',
          'Bare-root perennials',
          'Frost-tolerant annuals',
        ];
      }
      
      tips.maintenance = [
        'Apply winter mulch after ground freezes',
        'Protect sensitive perennials',
        'Check stored produce for spoilage',
      ];
      
      tips.preparation = [
        'Clean and organize seed starting supplies',
        'Test soil and order amendments',
        'Prune dormant trees and shrubs',
      ];
      break;
  }
  
  // Add experience-specific tips
  if (experience_level === 'beginner') {
    tips.tasks.push('Focus on a small number of easy crops to build confidence');
    tips.maintenance.push('Take time to observe your garden daily to learn plant needs');
  } else if (experience_level === 'intermediate') {
    tips.tasks.push('Try succession planting to extend your harvest season');
    tips.maintenance.push('Experiment with organic pest management techniques');
  } else if (experience_level === 'advanced' || experience_level === 'expert') {
    tips.tasks.push('Consider experimenting with breeding projects or seed saving');
    tips.maintenance.push('Implement advanced techniques like grafting or espalier');
  }
  
  return tips;
}