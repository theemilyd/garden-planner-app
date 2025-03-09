import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// DEMO MODE: Mock API interceptors
// Instead of making real API calls, we'll return mock data

// This array will store our "database" of gardens
let mockGardens = [
  {
    _id: 'garden-1',
    name: 'Vegetable Garden',
    width: 10,
    length: 15,
    location: 'Backyard',
    soilType: 'Loamy',
    sunlight: 'Full Sun',
    description: 'My main vegetable garden with tomatoes, peppers, and herbs.',
    plants: [
      {
        _id: 'plant-1',
        name: 'Tomato - Roma',
        type: 'Vegetable',
        growingSeason: 'Summer',
        waterNeeds: 'Medium',
        sunlight: 'Full Sun',
        spacing: 24,
        daysToMaturity: 75
      },
      {
        _id: 'plant-2',
        name: 'Bell Pepper',
        type: 'Vegetable',
        growingSeason: 'Summer',
        waterNeeds: 'Medium',
        sunlight: 'Full Sun',
        spacing: 18,
        daysToMaturity: 70
      }
    ],
    createdAt: '2023-05-10T10:30:00Z',
    updatedAt: '2023-05-15T14:20:00Z'
  },
  {
    _id: 'garden-2',
    name: 'Herb Garden',
    width: 5,
    length: 8,
    location: 'Side yard',
    soilType: 'Mixed',
    sunlight: 'Partial Sun',
    description: 'Small herb garden with basil, mint, and cilantro.',
    plants: [
      {
        _id: 'plant-3',
        name: 'Basil',
        type: 'Herb',
        growingSeason: 'Summer',
        waterNeeds: 'Medium',
        sunlight: 'Full Sun',
        spacing: 12,
        daysToMaturity: 30
      }
    ],
    createdAt: '2023-06-05T09:15:00Z',
    updatedAt: '2023-06-10T11:45:00Z'
  }
];

// This array will store our "database" of plants
let mockPlants = [
  {
    _id: 'plant-1',
    name: 'Tomato - Roma',
    type: 'Vegetable',
    growingSeason: 'Summer',
    waterNeeds: 'Medium',
    sunlight: 'Full Sun',
    spacing: 24,
    daysToMaturity: 75,
    description: 'Roma tomatoes are a paste tomato, perfect for making sauces and canning.',
    careInstructions: 'Water regularly, especially during fruit development. Provide support with stakes or cages.',
    harvestInstructions: 'Harvest when fruits are firm and fully red.',
    whenToPlant: 'Plant after danger of frost has passed, soil temperatures should be at least 60°F.',
    whenToHarvest: 'Typically ready to harvest 70-75 days after planting.',
    companionPlants: ['Basil', 'Marigold', 'Onions', 'Carrots'],
    createdAt: '2023-04-10T08:30:00Z',
    updatedAt: '2023-04-15T10:45:00Z'
  },
  {
    _id: 'plant-2',
    name: 'Bell Pepper',
    type: 'Vegetable',
    growingSeason: 'Summer',
    waterNeeds: 'Medium',
    sunlight: 'Full Sun',
    spacing: 18,
    daysToMaturity: 70,
    description: 'Sweet bell peppers are versatile vegetables that can be eaten raw or cooked.',
    careInstructions: 'Keep soil consistently moist but not waterlogged. May need staking to support heavy fruit.',
    harvestInstructions: 'Harvest when peppers reach full size and desired color (green, red, yellow, etc).',
    whenToPlant: 'Plant after all danger of frost, when soil is warm.',
    whenToHarvest: 'Green peppers can be harvested after about 70 days; colored peppers take 2-3 weeks longer.',
    companionPlants: ['Tomatoes', 'Basil', 'Onions'],
    createdAt: '2023-04-10T09:30:00Z',
    updatedAt: '2023-04-12T14:30:00Z'
  },
  {
    _id: 'plant-3',
    name: 'Basil',
    type: 'Herb',
    growingSeason: 'Summer',
    waterNeeds: 'Medium',
    sunlight: 'Full Sun',
    spacing: 12,
    daysToMaturity: 30,
    description: 'Aromatic herb used in many cuisines, especially Italian dishes.',
    careInstructions: 'Pinch off flower buds to promote leaf growth. Water when soil feels dry to touch.',
    harvestInstructions: 'Harvest leaves as needed. For best flavor, harvest in the morning after dew has dried.',
    whenToPlant: 'Plant after all danger of frost has passed.',
    whenToHarvest: 'Begin harvesting when the plant has at least 6-8 leaves.',
    companionPlants: ['Tomatoes', 'Peppers', 'Oregano'],
    createdAt: '2023-04-15T11:20:00Z',
    updatedAt: '2023-04-20T09:15:00Z'
  },
  {
    _id: 'plant-4',
    name: 'Carrot - Nantes',
    type: 'Vegetable',
    growingSeason: 'Spring',
    waterNeeds: 'Medium',
    sunlight: 'Full Sun',
    spacing: 3,
    daysToMaturity: 65,
    description: 'Sweet, cylindrical carrots that are great for fresh eating and storage.',
    careInstructions: 'Keep soil consistently moist during germination. Thin seedlings to 3 inches apart.',
    harvestInstructions: 'Pull when roots reach desired size, usually about 6-7 inches long.',
    whenToPlant: 'Plant 2-3 weeks before last spring frost for spring crop, or in late summer for fall crop.',
    whenToHarvest: 'Ready to harvest about 65-70 days after planting.',
    companionPlants: ['Tomatoes', 'Onions', 'Rosemary'],
    createdAt: '2023-04-18T13:40:00Z',
    updatedAt: '2023-04-22T15:30:00Z'
  },
  {
    _id: 'plant-5',
    name: 'Zucchini',
    type: 'Vegetable',
    growingSeason: 'Summer',
    waterNeeds: 'Medium',
    sunlight: 'Full Sun',
    spacing: 36,
    daysToMaturity: 50,
    description: 'Productive summer squash that grows on bushy plants.',
    careInstructions: 'Water deeply once a week. Watch for powdery mildew and squash bugs.',
    harvestInstructions: 'Harvest when fruits are 6-8 inches long for best flavor and texture.',
    whenToPlant: 'Plant after all danger of frost has passed and soil is warm.',
    whenToHarvest: 'Begin harvesting about 50 days after planting. Check plants daily as fruits grow quickly.',
    companionPlants: ['Beans', 'Corn', 'Nasturtium'],
    createdAt: '2023-04-25T10:10:00Z',
    updatedAt: '2023-04-28T11:25:00Z'
  }
];

// No actual API requests will be made in demo mode
api.interceptors.request.use(
  (config) => {
    // Just pass the config through
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Mock response handling
api.interceptors.response.use(
  (response) => {
    // Real response from server (though in demo mode, this shouldn't happen)
    return response;
  },
  (error) => {
    // If there's an error, we'll just simulate a successful response
    console.log('Intercepting error in demo mode:', error);
    
    // For demo purposes, we'll just return a successful response
    return Promise.reject(error);
  }
);

// DEMO MODE: All API functions return mock data

// Auth API calls
export const authAPI = {
  login: (credentials) => {
    console.log('Mock login with:', credentials);
    return Promise.resolve({ 
      data: {
        token: 'demo-token',
        data: {
          user: {
            _id: 'demo-user-id',
            name: 'Demo User',
            email: credentials.email || 'demo@example.com',
            zipCode: '10001',
            zone: '7b',
            role: 'user',
            createdAt: new Date().toISOString()
          }
        }
      }
    });
  },
  signup: (userData) => {
    console.log('Mock signup with:', userData);
    return Promise.resolve({ 
      data: {
        token: 'demo-token',
        data: {
          user: {
            _id: 'demo-user-id',
            name: userData.name || 'Demo User',
            email: userData.email || 'demo@example.com',
            zipCode: userData.zipCode || '10001',
            zone: userData.zone || '7b',
            role: 'user',
            createdAt: new Date().toISOString()
          }
        }
      }
    });
  },
  getMe: () => {
    return Promise.resolve({ 
      data: {
        data: {
          user: {
            _id: 'demo-user-id',
            name: 'Demo User',
            email: 'demo@example.com',
            zipCode: '10001',
            zone: '7b',
            role: 'user',
            createdAt: new Date().toISOString()
          }
        }
      }
    });
  },
  updateProfile: (userData) => {
    console.log('Mock profile update with:', userData);
    return Promise.resolve({ 
      data: {
        data: {
          user: {
            _id: 'demo-user-id',
            name: userData.name || 'Demo User',
            email: userData.email || 'demo@example.com',
            zipCode: userData.zipCode || '10001',
            zone: userData.zone || '7b',
            role: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      }
    });
  },
  updatePassword: (passwordData) => {
    console.log('Mock password update with:', passwordData);
    return Promise.resolve({ 
      data: {
        message: 'Password updated successfully'
      }
    });
  },
};

// Plant API calls
export const plantAPI = {
  getAllPlants: (params) => {
    console.log('Mock get all plants with params:', params);
    return Promise.resolve({ data: mockPlants });
  },
  getPlant: (id) => {
    console.log('Mock get plant with id:', id);
    const plant = mockPlants.find(p => p._id === id) || mockPlants[0];
    return Promise.resolve({ data: plant });
  },
  getPlantsByTag: (tag) => {
    console.log('Mock get plants by tag:', tag);
    const plants = mockPlants.filter(p => p.type === tag || p.growingSeason === tag);
    return Promise.resolve({ data: plants });
  },
  getCompanionPlants: (id) => {
    console.log('Mock get companion plants for:', id);
    const plant = mockPlants.find(p => p._id === id) || mockPlants[0];
    const companions = plant.companionPlants?.map(name => {
      return mockPlants.find(p => p.name.includes(name)) || {
        _id: `companion-${Math.random().toString(36).substr(2, 9)}`,
        name: name,
        type: 'Vegetable',
        growingSeason: 'Summer'
      };
    }) || [];
    return Promise.resolve({ data: companions });
  },
  getPlantingSchedule: (id, params) => {
    console.log('Mock get planting schedule for:', id, 'with params:', params);
    return Promise.resolve({ 
      data: {
        plant: mockPlants.find(p => p._id === id) || mockPlants[0],
        schedule: {
          startIndoors: 'March 1 - March 15',
          transplant: 'April 15 - May 1',
          directSow: 'May 1 - May 15',
          harvest: 'July 15 - September 30'
        }
      }
    });
  },
  createPlant: (plantData) => {
    console.log('Mock create plant with:', plantData);
    const newPlant = {
      _id: `plant-${Math.random().toString(36).substr(2, 9)}`,
      ...plantData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockPlants.push(newPlant);
    return Promise.resolve({ data: newPlant });
  },
  updatePlant: (id, plantData) => {
    console.log('Mock update plant:', id, 'with:', plantData);
    const plantIndex = mockPlants.findIndex(p => p._id === id);
    if (plantIndex !== -1) {
      mockPlants[plantIndex] = {
        ...mockPlants[plantIndex],
        ...plantData,
        updatedAt: new Date().toISOString()
      };
      return Promise.resolve({ data: mockPlants[plantIndex] });
    }
    return Promise.reject(new Error('Plant not found'));
  },
  deletePlant: (id) => {
    console.log('Mock delete plant:', id);
    const plantIndex = mockPlants.findIndex(p => p._id === id);
    if (plantIndex !== -1) {
      mockPlants.splice(plantIndex, 1);
      return Promise.resolve({ data: { message: 'Plant deleted successfully' } });
    }
    return Promise.reject(new Error('Plant not found'));
  },
};

// Garden API calls
export const gardenAPI = {
  getAllGardens: () => {
    console.log('Mock get all gardens');
    return Promise.resolve({ data: mockGardens });
  },
  getGarden: (id) => {
    console.log('Mock get garden with id:', id);
    const garden = mockGardens.find(g => g._id === id) || mockGardens[0];
    return Promise.resolve({ data: garden });
  },
  createGarden: (gardenData) => {
    console.log('Mock create garden with:', gardenData);
    const newGarden = {
      _id: `garden-${Math.random().toString(36).substr(2, 9)}`,
      ...gardenData,
      plants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockGardens.push(newGarden);
    return Promise.resolve({ data: newGarden });
  },
  updateGarden: (id, gardenData) => {
    console.log('Mock update garden:', id, 'with:', gardenData);
    const gardenIndex = mockGardens.findIndex(g => g._id === id);
    if (gardenIndex !== -1) {
      mockGardens[gardenIndex] = {
        ...mockGardens[gardenIndex],
        ...gardenData,
        updatedAt: new Date().toISOString()
      };
      return Promise.resolve({ data: mockGardens[gardenIndex] });
    }
    return Promise.reject(new Error('Garden not found'));
  },
  deleteGarden: (id) => {
    console.log('Mock delete garden:', id);
    const gardenIndex = mockGardens.findIndex(g => g._id === id);
    if (gardenIndex !== -1) {
      mockGardens.splice(gardenIndex, 1);
      return Promise.resolve({ data: { message: 'Garden deleted successfully' } });
    }
    return Promise.reject(new Error('Garden not found'));
  },
  addPlantToGarden: (plantData) => {
    console.log('Mock add plant to garden:', plantData);
    const { gardenId, plantId } = plantData;
    const garden = mockGardens.find(g => g._id === gardenId);
    const plant = mockPlants.find(p => p._id === plantId);
    
    if (garden && plant) {
      garden.plants.push(plant);
      garden.updatedAt = new Date().toISOString();
      return Promise.resolve({ data: garden });
    }
    return Promise.reject(new Error('Garden or plant not found'));
  },
  updatePlantInGarden: (gardenId, plantIndex, plantData) => {
    console.log('Mock update plant in garden:', gardenId, 'at index:', plantIndex, 'with:', plantData);
    const garden = mockGardens.find(g => g._id === gardenId);
    if (garden && garden.plants[plantIndex]) {
      garden.plants[plantIndex] = {
        ...garden.plants[plantIndex],
        ...plantData
      };
      garden.updatedAt = new Date().toISOString();
      return Promise.resolve({ data: garden });
    }
    return Promise.reject(new Error('Garden or plant not found'));
  },
  removePlantFromGarden: (gardenId, plantIndex) => {
    console.log('Mock remove plant from garden:', gardenId, 'at index:', plantIndex);
    const garden = mockGardens.find(g => g._id === gardenId);
    if (garden && garden.plants[plantIndex]) {
      garden.plants.splice(plantIndex, 1);
      garden.updatedAt = new Date().toISOString();
      return Promise.resolve({ data: garden });
    }
    return Promise.reject(new Error('Garden or plant not found'));
  },
  updateTask: (gardenId, plantIndex, taskData, taskIndex) => {
    console.log('Mock update task in garden:', gardenId, 'for plant:', plantIndex);
    return Promise.resolve({ data: { message: 'Task updated/added successfully' } });
  },
  addJournalEntry: (gardenId, plantIndex, entryData) => {
    console.log('Mock add journal entry to garden:', gardenId, 'for plant:', plantIndex);
    return Promise.resolve({ data: { message: 'Journal entry added successfully' } });
  },
};

// Zone API calls
export const zoneAPI = {
  getAllZones: () => {
    console.log('Mock get all zones');
    return Promise.resolve({ 
      data: [
        { id: '1a', zoneName: '1a', minTemp: -60, maxTemp: -55 },
        { id: '1b', zoneName: '1b', minTemp: -55, maxTemp: -50 },
        { id: '2a', zoneName: '2a', minTemp: -50, maxTemp: -45 },
        { id: '2b', zoneName: '2b', minTemp: -45, maxTemp: -40 },
        { id: '3a', zoneName: '3a', minTemp: -40, maxTemp: -35 },
        { id: '3b', zoneName: '3b', minTemp: -35, maxTemp: -30 },
        { id: '4a', zoneName: '4a', minTemp: -30, maxTemp: -25 },
        { id: '4b', zoneName: '4b', minTemp: -25, maxTemp: -20 },
        { id: '5a', zoneName: '5a', minTemp: -20, maxTemp: -15 },
        { id: '5b', zoneName: '5b', minTemp: -15, maxTemp: -10 },
        { id: '6a', zoneName: '6a', minTemp: -10, maxTemp: -5 },
        { id: '6b', zoneName: '6b', minTemp: -5, maxTemp: 0 },
        { id: '7a', zoneName: '7a', minTemp: 0, maxTemp: 5 },
        { id: '7b', zoneName: '7b', minTemp: 5, maxTemp: 10 },
        { id: '8a', zoneName: '8a', minTemp: 10, maxTemp: 15 },
        { id: '8b', zoneName: '8b', minTemp: 15, maxTemp: 20 },
        { id: '9a', zoneName: '9a', minTemp: 20, maxTemp: 25 },
        { id: '9b', zoneName: '9b', minTemp: 25, maxTemp: 30 },
        { id: '10a', zoneName: '10a', minTemp: 30, maxTemp: 35 },
        { id: '10b', zoneName: '10b', minTemp: 35, maxTemp: 40 },
        { id: '11a', zoneName: '11a', minTemp: 40, maxTemp: 45 },
        { id: '11b', zoneName: '11b', minTemp: 45, maxTemp: 50 },
        { id: '12a', zoneName: '12a', minTemp: 50, maxTemp: 55 },
        { id: '12b', zoneName: '12b', minTemp: 55, maxTemp: 60 },
        { id: '13a', zoneName: '13a', minTemp: 60, maxTemp: 65 },
        { id: '13b', zoneName: '13b', minTemp: 65, maxTemp: 70 },
      ]
    });
  },
  getZone: (zone) => {
    console.log('Mock get zone:', zone);
    return Promise.resolve({ 
      data: {
        id: zone,
        zoneName: zone,
        minTemp: 5,
        maxTemp: 10,
        firstFrostDate: 'October 15',
        lastFrostDate: 'April 15',
        growingSeasonLength: 183
      }
    });
  },
  getZoneByLocation: (params) => {
    console.log('Mock get zone by location with params:', params);
    return Promise.resolve({ 
      data: {
        zipCode: params.zipCode || '10001',
        zoneName: '7b',
        minTemp: 5,
        maxTemp: 10,
        firstFrostDate: 'October 15',
        lastFrostDate: 'April 15',
        growingSeasonLength: 183
      }
    });
  },
};

// Weather API calls
export const weatherAPI = {
  getCurrentWeather: (params) => {
    console.log('Mock get current weather with params:', params);
    return Promise.resolve({ 
      data: {
        zipCode: params.zipCode || '10001',
        location: 'New York, NY',
        temperature: 72,
        condition: 'Sunny',
        humidity: 45,
        windSpeed: 5,
        precipitation: 0,
        uvIndex: 7,
        timestamp: new Date().toISOString()
      }
    });
  },
  getWeatherForecast: (params) => {
    console.log('Mock get weather forecast with params:', params);
    return Promise.resolve({ 
      data: {
        zipCode: params.zipCode || '10001',
        location: 'New York, NY',
        forecast: [
          { 
            day: 'Today', 
            high: 75, 
            low: 62, 
            condition: 'Sunny', 
            precipitation: 0,
            humidity: 45,
            windSpeed: 5
          },
          { 
            day: 'Tomorrow', 
            high: 78, 
            low: 64, 
            condition: 'Partly Cloudy', 
            precipitation: 10,
            humidity: 48,
            windSpeed: 7
          },
          { 
            day: 'Wednesday', 
            high: 80, 
            low: 65, 
            condition: 'Sunny', 
            precipitation: 0,
            humidity: 42,
            windSpeed: 6
          },
          { 
            day: 'Thursday', 
            high: 77, 
            low: 63, 
            condition: 'Scattered Showers', 
            precipitation: 40,
            humidity: 55,
            windSpeed: 8
          },
          { 
            day: 'Friday', 
            high: 74, 
            low: 60, 
            condition: 'Partly Cloudy', 
            precipitation: 20,
            humidity: 50,
            windSpeed: 7
          }
        ]
      }
    });
  },
  getSoilTemperature: (params) => {
    console.log('Mock get soil temperature with params:', params);
    return Promise.resolve({ 
      data: {
        zipCode: params.zipCode || '10001',
        location: 'New York, NY',
        soilTemperature: 65,
        soilMoisture: 'Medium',
        soilpH: 6.5,
        timestamp: new Date().toISOString()
      }
    });
  },
  getGardenAlerts: (gardenId) => {
    console.log('Mock get garden alerts for:', gardenId);
    return Promise.resolve({ 
      data: {
        garden: mockGardens.find(g => g._id === gardenId) || mockGardens[0],
        alerts: [
          {
            type: 'frost',
            severity: 'warning',
            message: 'Possible light frost tonight. Consider covering sensitive plants.',
            date: new Date().toISOString()
          },
          {
            type: 'drought',
            severity: 'info',
            message: 'Low rainfall predicted for the next week. Water deeply twice this week.',
            date: new Date().toISOString()
          }
        ]
      }
    });
  },
  updateGardenWeatherData: (gardenId, weatherData) => {
    console.log('Mock update garden weather data for:', gardenId);
    return Promise.resolve({ 
      data: {
        message: 'Garden weather data updated successfully'
      }
    });
  },
};

// AI API calls
export const aiAPI = {
  getPersonalizedRecommendations: () => {
    console.log('Mock get personalized recommendations');
    return Promise.resolve({ 
      data: {
        recommendations: [
          {
            title: 'Plant Cool-Season Crops',
            description: 'Based on your zone and the current season, it\'s a great time to plant cool-season crops like lettuce, spinach, and peas.',
            plants: mockPlants.filter(p => p.growingSeason === 'Spring').slice(0, 3)
          },
          {
            title: 'Protect from Frost',
            description: 'Temperatures are expected to drop this weekend. Consider covering sensitive plants or moving containers indoors.',
            severity: 'warning'
          },
          {
            title: 'Soil Amendment Recommendation',
            description: 'Based on common plants in your garden, adding compost now would benefit your soil before the main growing season begins.',
            actionItem: 'Add 2-3 inches of compost to garden beds'
          }
        ]
      }
    });
  },
  getCompanionPlantingSuggestions: (plantId) => {
    console.log('Mock get companion planting suggestions for:', plantId);
    const plant = mockPlants.find(p => p._id === plantId) || mockPlants[0];
    return Promise.resolve({ 
      data: {
        plant: plant,
        goodCompanions: plant.companionPlants?.map(name => ({
          name,
          benefits: 'Improves growth and flavor, repels pests'
        })) || [],
        badCompanions: [
          {
            name: 'Fennel',
            reason: 'Inhibits growth'
          },
          {
            name: 'Potatoes',
            reason: 'Compete for nutrients'
          }
        ]
      }
    });
  },
  answerGardeningQuestion: (question) => {
    console.log('Mock answer gardening question:', question);
    return Promise.resolve({ 
      data: {
        question,
        answer: `Here's an answer to your question about "${question}":\n\nGardening is all about patience, observation, and learning from experience. For your specific question, I recommend starting with good quality soil, appropriate watering, and making sure your plants get the right amount of sunlight.\n\nRemember that different plants have different needs, so it's important to research the specific requirements of whatever you're growing.`,
        sources: [
          {
            title: 'University Extension Guide to Home Gardening',
            url: 'https://example.com/gardening-guide'
          },
          {
            title: 'Organic Gardening Principles',
            url: 'https://example.com/organic-gardening'
          }
        ],
        timestamp: new Date().toISOString()
      }
    });
  },
  generateGardenLayout: (layoutData) => {
    console.log('Mock generate garden layout with:', layoutData);
    return Promise.resolve({ 
      data: {
        layout: [
          {
            name: 'Tomatoes',
            cells: [ [0, 0], [0, 1], [1, 0], [1, 1] ]
          },
          {
            name: 'Basil',
            cells: [ [2, 0], [2, 1] ]
          },
          {
            name: 'Carrots',
            cells: [ [0, 2], [1, 2] ]
          },
          {
            name: 'Lettuce',
            cells: [ [2, 2], [3, 0], [3, 1], [3, 2] ]
          }
        ],
        recommendations: 'This layout optimizes companion planting benefits and sun exposure based on your garden dimensions.'
      }
    });
  },
  getSeasonalGardeningTips: () => {
    console.log('Mock get seasonal gardening tips');
    return Promise.resolve({ 
      data: {
        season: 'Spring',
        tips: [
          {
            title: 'Prepare Your Soil',
            content: 'Test your soil pH and add amendments as needed. Work in compost to enrich the soil.'
          },
          {
            title: 'Start Seeds Indoors',
            content: 'Begin warm-season crops like tomatoes and peppers indoors 6-8 weeks before last frost.'
          },
          {
            title: 'Direct Sow Cool-Season Crops',
            content: 'Plant peas, spinach, lettuce, and other cool-season vegetables as soon as soil can be worked.'
          },
          {
            title: 'Prune Before New Growth',
            content: 'Finish pruning shrubs and trees before new growth begins in earnest.'
          },
          {
            title: 'Clean Up Garden Beds',
            content: 'Remove debris, pull early weeds, and divide perennials that are outgrowing their space.'
          }
        ]
      }
    });
  },
};

export default api;