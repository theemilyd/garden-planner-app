import axios from 'axios';

// Create axios instance with defaults
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for auth
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for handling common errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized globally - redirect to login
    if (error.response && error.response.status === 401) {
      // Check if error is not from the login endpoint itself
      if (!error.config.url.includes('login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?session=expired';
      }
    }
    
    // Format error message for better client handling
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      'An unexpected error occurred';
    
    // Add custom error handler
    if (!error.response) {
      // Network error
      console.error('Network Error:', error);
      error.customMessage = 'Network error. Please check your connection.';
    } else {
      // Server error with response
      console.error('API Error:', error.response?.data || error);
      error.customMessage = errorMessage;
    }
    
    return Promise.reject(error);
  }
);

// API modules
export const authAPI = {
  register: (userData) => API.post('/users/register', userData),
  login: (credentials) => API.post('/users/login', credentials),
  forgotPassword: (email) => API.post('/users/forgot-password', { email }),
  resetPassword: (resetData) => API.post('/users/reset-password', resetData),
  updateProfile: (userData) => API.patch('/users/profile', userData),
  updatePassword: (passwordData) => API.patch('/users/password', passwordData),
  getProfile: () => API.get('/users/profile'),
};

export const plantAPI = {
  getAllPlants: (params) => API.get('/plants', { params }),
  getPlant: (id) => API.get(`/plants/${id}`),
  searchPlants: (query) => API.get('/plants/search', { params: { q: query } }),
  getPlantingCalendar: (params) => API.get('/plants/calendar', { params }),
};

export const gardenAPI = {
  getAllGardens: () => API.get('/gardens'),
  getGarden: (id) => API.get(`/gardens/${id}`),
  createGarden: (gardenData) => API.post('/gardens', gardenData),
  updateGarden: (id, gardenData) => API.patch(`/gardens/${id}`, gardenData),
  deleteGarden: (id) => API.delete(`/gardens/${id}`),
  
  // Plant management within gardens
  addPlantToGarden: (plantData) => API.post('/gardens/plant', plantData),
  updatePlantInGarden: (gardenId, plantIndex, updateData) => 
    API.patch(`/gardens/plant/${gardenId}/${plantIndex}`, updateData),
  removePlantFromGarden: (gardenId, plantIndex) => 
    API.delete(`/gardens/plant/${gardenId}/${plantIndex}`),
    
  // Tasks and journals
  addTask: (gardenId, plantIndex, taskData) => 
    API.post(`/gardens/task/${gardenId}/${plantIndex}`, taskData),
  updateTask: (gardenId, plantIndex, taskIndex, taskData) => 
    API.patch(`/gardens/task/${gardenId}/${plantIndex}/${taskIndex}`, taskData),
  addJournalEntry: (gardenId, plantIndex, entryData) => 
    API.post(`/gardens/journal/${gardenId}/${plantIndex}`, entryData),
};

export const zoneAPI = {
  getZoneByZipCode: (zipCode) => API.get(`/zones/zipcode/${zipCode}`),
  getZoneByCoordinates: (lat, lng) => API.get(`/zones/coordinates/${lat}/${lng}`),
  getZonePlantingDates: (zoneCode) => API.get(`/zones/${zoneCode}/planting-dates`),
};

export const weatherAPI = {
  getCurrentWeather: (lat, lng) => API.get(`/weather/current/${lat}/${lng}`),
  getForecast: (lat, lng, days = 7) => API.get(`/weather/forecast/${lat}/${lng}`, { params: { days } }),
  getSoilTemperature: (lat, lng) => API.get(`/weather/soil/${lat}/${lng}`),
};

export const successionAPI = {
  generatePlan: (params) => API.post('/succession/generate', params),
  getSavedPlans: () => API.get('/succession/plans'),
  savePlan: (planData) => API.post('/succession/plans', planData),
  updatePlan: (id, planData) => API.patch(`/succession/plans/${id}`, planData),
  deletePlan: (id) => API.delete(`/succession/plans/${id}`),
};

export const microclimatAPI = {
  getUserMicroclimates: () => API.get('/microclimates'),
  getMicroclimate: (id) => API.get(`/microclimates/${id}`),
  createMicroclimate: (data) => API.post('/microclimates', data),
  updateMicroclimate: (id, data) => API.patch(`/microclimates/${id}`, data),
  deleteMicroclimate: (id) => API.delete(`/microclimates/${id}`),
};

export const aiAPI = {
  getPlantRecommendations: (params) => API.get('/ai/recommend', { params }),
  getPlantingAdvice: (plantName, params) => 
    API.get(`/ai/advice/${encodeURIComponent(plantName)}`, { params }),
  getTroubleshooting: (data) => API.post('/ai/troubleshoot', data),
};

export default API;