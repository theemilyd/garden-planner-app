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

// Get weather data for a location
export const getWeatherData = async (country, postalCode) => {
  try {
    const params = { country, postalCode };
    const response = await api.get('/weather', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Get weather forecast for a location
export const getWeatherForecast = async (country, postalCode, days = 7) => {
  try {
    const params = { country, postalCode, days };
    const response = await api.get('/weather/forecast', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};

// Get frost alerts for a location
export const getFrostAlerts = async (country, postalCode) => {
  try {
    const params = { country, postalCode };
    const response = await api.get('/weather/frost-alerts', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching frost alerts:', error);
    throw error;
  }
};

export default {
  getWeatherData,
  getWeatherForecast,
  getFrostAlerts,
};
