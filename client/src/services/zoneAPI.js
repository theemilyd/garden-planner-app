import axios from 'axios';

// Set the base URL for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get all zones
export const getAllZones = async () => {
  try {
    const response = await api.get('/zones');
    return response.data;
  } catch (error) {
    console.error('Error fetching zones:', error);
    throw error;
  }
};

// Get a specific zone
export const getZoneByCode = async (zoneCode) => {
  try {
    const response = await api.get(`/zones/${zoneCode}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching zone with code ${zoneCode}:`, error);
    throw error;
  }
};

// Get zone by location (postal code or coordinates)
export const getZoneByLocation = async (params) => {
  try {
    const response = await api.get('/zones/location', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching zone by location:', error);
    throw error;
  }
};

// Mock function for fallback zone data when API is not available
export const getMockZoneData = (country, postalCode) => {
  // Parse the postal code to generate predictable mock data
  let zoneName, lastFrostDate, firstFrostDate, growingDays, zoneSystem, dataSource;
  
  switch(country) {
    case 'US':
      // Simple US zone calculation
      const firstDigit = parseInt(postalCode.charAt(0));
      zoneName = `${10-firstDigit}${['a','b'][Math.floor(Math.random() * 2)]}`;
      lastFrostDate = ['March 30', 'April 15', 'April 30', 'May 15'][Math.floor(Math.random() * 4)];
      firstFrostDate = ['October 1', 'October 15', 'October 30', 'November 15'][Math.floor(Math.random() * 4)];
      growingDays = Math.floor(Math.random() * 50) + 150;
      zoneSystem = 'USDA';
      dataSource = 'USDA Plant Hardiness Zone Map';
      break;
      
    case 'CA':
      zoneName = `${Math.floor(Math.random() * 5) + 2}${['a','b'][Math.floor(Math.random() * 2)]}`;
      lastFrostDate = ['April 15', 'May 1', 'May 15', 'May 30'][Math.floor(Math.random() * 4)];
      firstFrostDate = ['September 15', 'September 30', 'October 15'][Math.floor(Math.random() * 3)];
      growingDays = Math.floor(Math.random() * 40) + 120;
      zoneSystem = 'Canadian';
      dataSource = 'Agriculture and Agri-Food Canada';
      break;
      
    case 'GB':
      // Set a deterministic value
      zoneName = 'H3';
      lastFrostDate = 'May 1';
      firstFrostDate = 'October 30';
      growingDays = 150; // Shorter growing season than US
      zoneSystem = 'RHS';
      dataSource = 'Royal Horticultural Society';
      break;
      
    case 'AU':
      zoneName = `${Math.floor(Math.random() * 7) + 1}`;
      lastFrostDate = 'N/A'; // Many parts of Australia don't have frost
      firstFrostDate = 'N/A';
      growingDays = 365; // Year-round growing in many areas
      zoneSystem = 'Australian';
      dataSource = 'Australian National Botanic Gardens';
      break;
      
    default:
      zoneName = `${Math.floor(Math.random() * 10) + 1}`;
      lastFrostDate = 'April 15';
      firstFrostDate = 'October 15';
      growingDays = 180;
      zoneSystem = 'International';
      dataSource = 'International Association of Horticultural Producers';
  }
  
  return {
    status: 'success',
    data: {
      country,
      postalCode,
      zoneName,
      lastFrostDate,
      firstFrostDate,
      growingDays,
      zoneSystem,
      dataSource
    }
  };
};

const zoneAPI = {
  getAllZones,
  getZoneByCode,
  getZoneByLocation,
  getMockZoneData,
};

export default zoneAPI;
