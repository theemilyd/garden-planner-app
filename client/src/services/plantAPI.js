import axios from 'axios';

// Set the base URL for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get all plants with optional filtering
export const getAllPlants = async (filters = {}) => {
  try {
    const params = { ...filters };
    const response = await api.get('/plants', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching plants:', error);
    throw error;
  }
};

// Get a specific plant by ID
export const getPlantById = async (id) => {
  try {
    const response = await api.get(`/plants/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching plant with ID ${id}:`, error);
    throw error;
  }
};

// Get planting schedule for a plant based on zone and frost dates
export const getPlantingSchedule = async (plantId, zoneInfo) => {
  try {
    const params = {
      zone: zoneInfo.zoneName,
      lastFrostDate: zoneInfo.lastFrostDate,
      firstFrostDate: zoneInfo.firstFrostDate,
    };
    
    const response = await api.get(`/plants/${plantId}/planting-schedule`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching planting schedule for plant ID ${plantId}:`, error);
    throw error;
  }
};

// Get plants by tag/category
export const getPlantsByTag = async (tag) => {
  try {
    const response = await api.get(`/plants/tags/${tag}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching plants with tag ${tag}:`, error);
    throw error;
  }
};

// Get companion plants for a specific plant
export const getCompanionPlants = async (plantId) => {
  try {
    const response = await api.get(`/plants/${plantId}/companions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching companion plants for plant ID ${plantId}:`, error);
    throw error;
  }
};

// Utility function to format a plant for display in the UI
export const formatPlantForUI = (plant) => {
  return {
    id: plant._id,
    name: plant.name,
    type: plant.tags && plant.tags.length > 0 ? 
      plant.tags[0].charAt(0).toUpperCase() + plant.tags[0].slice(1) : 
      'Vegetable',
    scientific_name: plant.scientific_name,
    image_url: plant.image_url,
    description: plant.description,
    growing_requirements: plant.growing_requirements,
    days_to_maturity: plant.days_to_maturity,
    hardiness_zones: plant.hardiness_zones,
    life_cycle: plant.life_cycle,
    planting_depth: plant.planting_depth,
    spacing: plant.spacing,
    // Additional fields as needed
  };
};

const plantAPI = {
  getAllPlants,
  getPlantById,
  getPlantingSchedule,
  getPlantsByTag,
  getCompanionPlants,
  formatPlantForUI,
};

export default plantAPI;
