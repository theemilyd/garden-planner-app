import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Card, ListGroup, Badge, Modal, Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt, faSearch, faPlus, faTimes, faInfoCircle, faPrint,
  faCloudSun, faTemperatureHigh, faLeaf, faSeedling, faCalendarAlt, faList,
  faCheckCircle, faTimesCircle, faEdit, faTrashAlt, faWater, faSun
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Import sub-components
import SuccessionPlanner from './SuccessionPlanner';
import WeatherWidget from './WeatherWidget';
import TaskManager from './TaskManager';
import JournalEntry from './JournalEntry';

// Define the primary colors
const PRIMARY_COLOR = '#4A9C59';
const LIGHT_COLOR = '#E8F5E9';
const INDOOR_COLOR = '#E3F2FD';
const OUTDOOR_COLOR = '#DCEDC8';
const HARVEST_COLOR = '#FFF9C4';

const GlobalSeedSowingCalendar = ({ userLocation }) => {
  // State management
  const [country, setCountry] = useState('US');
  const [postalCode, setPostalCode] = useState('');
  const [plantInput, setPlantInput] = useState('');
  const [plantFilter, setPlantFilter] = useState('All');
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [zone, setZone] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPlantDetailsModal, setShowPlantDetailsModal] = useState(false);
  const [selectedPlantDetails, setSelectedPlantDetails] = useState(null);
  const [seasonalView, setSeasonalView] = useState('year');
  const [isNorthernHemisphere, setIsNorthernHemisphere] = useState(true);
  const [weather, setWeather] = useState(null);
  const [weatherForecast, setWeatherForecast] = useState(null);
  const [showSuccessionPlanner, setShowSuccessionPlanner] = useState(false);
  const [successionPlant, setSuccessionPlant] = useState(null);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [draggedPlant, setDraggedPlant] = useState(null);
  const [plantingAdjustments, setPlantingAdjustments] = useState({});
  
  // Mock plants database for development
  const plantDatabase = [
    {
      id: 1,
      name: 'Tomato',
      type: 'Vegetable',
      indoorStart: { weeks: 6, relativeTo: 'lastFrost' }, // 6 weeks before last frost
      outdoorStart: { weeks: 2, relativeTo: 'afterLastFrost' }, // 2 weeks after last frost
      daysToMaturity: { min: 60, max: 90 },
      description: 'Warm-season vegetable, needs full sun and consistent water.',
      spacing: '18-36"',
      companions: ['Basil', 'Marigold', 'Nasturtium'],
      enemies: ['Potato', 'Fennel', 'Corn'],
      notes: 'Plant deeply to develop strong roots.',
      succession: {
        suitable: true,
        interval: 14, // days
        maxPlantings: 3
      }
    },
    {
      id: 2,
      name: 'Lettuce',
      type: 'Vegetable',
      indoorStart: { weeks: 4, relativeTo: 'lastFrost' }, // 4 weeks before last frost
      outdoorStart: { weeks: 0, relativeTo: 'lastFrost' }, // Right at last frost
      daysToMaturity: { min: 45, max: 60 },
      description: 'Cool-season crop that bolts in hot weather.',
      spacing: '8-12"',
      companions: ['Carrots', 'Radishes', 'Strawberries'],
      enemies: ['Cabbage Family'],
      notes: 'Sow every 2 weeks for continuous harvest.',
      succession: {
        suitable: true,
        interval: 14, // days
        maxPlantings: 8
      }
    },
    {
      id: 3,
      name: 'Carrot',
      type: 'Vegetable',
      indoorStart: null, // Not suitable for indoor starting
      outdoorStart: { weeks: 2, relativeTo: 'beforeLastFrost' }, // 2 weeks before last frost
      daysToMaturity: { min: 60, max: 80 },
      description: 'Root vegetable preferring loose, sandy soil.',
      spacing: '2-3"',
      companions: ['Onions', 'Leeks', 'Tomatoes'],
      enemies: ['Dill', 'Fennel'],
      notes: 'Keep soil consistently moist until germination.',
      succession: {
        suitable: true,
        interval: 21, // days
        maxPlantings: 4
      }
    },
    {
      id: 4,
      name: 'Basil',
      type: 'Herb',
      indoorStart: { weeks: 6, relativeTo: 'lastFrost' }, // 6 weeks before last frost
      outdoorStart: { weeks: 2, relativeTo: 'afterLastFrost' }, // 2 weeks after last frost
      daysToMaturity: { min: 30, max: 45 },
      description: 'Aromatic herb that pairs well with tomatoes.',
      spacing: '8-12"',
      companions: ['Tomatoes', 'Peppers'],
      enemies: ['Rue'],
      notes: 'Pinch off flowers to extend harvest.',
      succession: {
        suitable: true,
        interval: 30, // days
        maxPlantings: 2
      }
    },
    {
      id: 5,
      name: 'Sunflower',
      type: 'Flower',
      indoorStart: { weeks: 4, relativeTo: 'lastFrost' }, // 4 weeks before last frost
      outdoorStart: { weeks: 1, relativeTo: 'afterLastFrost' }, // 1 week after last frost
      daysToMaturity: { min: 70, max: 100 },
      description: 'Tall flower that tracks the sun throughout the day.',
      spacing: '12-24"',
      companions: ['Cucumber', 'Corn'],
      enemies: ['Potato', 'Beans'],
      notes: 'Plant in a location protected from strong winds.',
      succession: {
        suitable: false
      }
    },
    {
      id: 6,
      name: 'Kale',
      type: 'Vegetable',
      indoorStart: { weeks: 5, relativeTo: 'lastFrost' }, // 5 weeks before last frost
      outdoorStart: { weeks: 2, relativeTo: 'beforeLastFrost' }, // 2 weeks before last frost
      daysToMaturity: { min: 50, max: 65 },
      description: 'Cold-hardy leafy green, sweeter after frost.',
      spacing: '12-18"',
      companions: ['Beets', 'Celery', 'Herbs'],
      enemies: ['Strawberries', 'Tomatoes'],
      notes: 'Can be grown as a fall/winter crop in many zones.',
      succession: {
        suitable: true,
        interval: 21, // days
        maxPlantings: 3
      }
    },
    {
      id: 7,
      name: 'Zinnia',
      type: 'Flower',
      indoorStart: { weeks: 4, relativeTo: 'lastFrost' }, // 4 weeks before last frost
      outdoorStart: { weeks: 1, relativeTo: 'afterLastFrost' }, // 1 week after last frost
      daysToMaturity: { min: 60, max: 70 },
      description: 'Easy-to-grow annual with colorful blooms.',
      spacing: '8-12"',
      companions: ['Vegetables', 'Tomatoes'],
      enemies: [],
      notes: 'Attracts beneficial insects like butterflies and bees.',
      succession: {
        suitable: true,
        interval: 21, // days
        maxPlantings: 2
      }
    },
    {
      id: 8,
      name: 'Radish',
      type: 'Vegetable',
      indoorStart: null, // Not suitable for indoor starting
      outdoorStart: { weeks: 4, relativeTo: 'beforeLastFrost' }, // 4 weeks before last frost
      daysToMaturity: { min: 21, max: 30 },
      description: 'Quick-growing root vegetable, perfect for beginners.',
      spacing: '1-2"',
      companions: ['Lettuce', 'Spinach', 'Peas'],
      enemies: ['Hyssop'],
      notes: 'Harvest promptly to prevent becoming woody.',
      succession: {
        suitable: true,
        interval: 7, // days
        maxPlantings: 10
      }
    },
    {
      id: 9,
      name: 'Cucumber',
      type: 'Vegetable',
      indoorStart: { weeks: 3, relativeTo: 'lastFrost' }, // 3 weeks before last frost
      outdoorStart: { weeks: 1, relativeTo: 'afterLastFrost' }, // 1 week after last frost
      daysToMaturity: { min: 50, max: 70 },
      description: 'Vining plant that produces crisp, refreshing fruits.',
      spacing: '12-18"',
      companions: ['Sunflowers', 'Corn', 'Peas'],
      enemies: ['Potatoes', 'Sage'],
      notes: 'Provide trellis for vertical growth to save space.',
      succession: {
        suitable: true,
        interval: 21, // days
        maxPlantings: 2
      }
    },
    {
      id: 10,
      name: 'Marigold',
      type: 'Flower',
      indoorStart: { weeks: 6, relativeTo: 'lastFrost' }, // 6 weeks before last frost
      outdoorStart: { weeks: 0, relativeTo: 'lastFrost' }, // At last frost
      daysToMaturity: { min: 50, max: 60 },
      description: 'Pest-deterring flowers with bright orange and yellow blooms.',
      spacing: '8-12"',
      companions: ['Most vegetables'],
      enemies: ['Beans'],
      notes: 'Natural pest repellent for many common garden pests.',
      succession: {
        suitable: false
      }
    }
  ];
  
  // Define the mock countries and postal code formats
  const countries = [
    { code: 'US', name: 'United States', format: '#####' },
    { code: 'CA', name: 'Canada', format: 'A#A #A#' },
    { code: 'GB', name: 'United Kingdom', format: 'AA## #AA' },
    { code: 'AU', name: 'Australia', format: '####' },
    { code: 'NZ', name: 'New Zealand', format: '####' }
  ];
  
  // Mock zone data for testing
  const mockZoneData = {
    '90210-US': { zone: '10a', system: 'USDA', lastFrost: 'January 15', firstFrost: 'December 15', growingDays: 334 },
    '10001-US': { zone: '7b', system: 'USDA', lastFrost: 'April 15', firstFrost: 'October 30', growingDays: 198 },
    '48104-US': { zone: '6a', system: 'USDA', lastFrost: 'May 1', firstFrost: 'October 15', growingDays: 167 },
    'M5V-CA': { zone: '6a', system: 'Canada', lastFrost: 'May 9', firstFrost: 'October 15', growingDays: 159 },
    'SW1A-GB': { zone: 'H3', system: 'RHS', lastFrost: 'April 15', firstFrost: 'October 30', growingDays: 198 },
    '3000-AU': { zone: '3', system: 'Australia', lastFrost: 'August 15', firstFrost: 'May 15', growingDays: 273 }
  };
  
  // Initialize on component mount
  useEffect(() => {
    // Check for saved location
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      const parsed = JSON.parse(savedLocation);
      setCountry(parsed.country);
      setPostalCode(parsed.postalCode);
      lookupZone(parsed.country, parsed.postalCode);
    } else if (userLocation) {
      // Try to reverse geocode the user's location
      reverseGeocode(userLocation.lat, userLocation.lng);
    } else {
      // Show location modal if no saved location
      setShowLocationModal(true);
    }
    
    // Load any saved plants
    const savedPlants = localStorage.getItem('selectedPlants');
    if (savedPlants) {
      setSelectedPlants(JSON.parse(savedPlants));
    }
  }, [userLocation]);
  
  // Save selected plants to local storage when they change
  useEffect(() => {
    if (selectedPlants.length > 0) {
      localStorage.setItem('selectedPlants', JSON.stringify(selectedPlants));
    }
  }, [selectedPlants]);
  
  // Filter plants by type
  const getFilteredPlants = () => {
    if (plantFilter === 'All') {
      return plantDatabase;
    }
    return plantDatabase.filter(plant => plant.type === plantFilter);
  };
  
  // Filter plants by search term
  const getSearchResults = useCallback(() => {
    if (!plantInput) return [];
    const lowercasedInput = plantInput.toLowerCase();
    return getFilteredPlants().filter(plant => 
      plant.name.toLowerCase().includes(lowercasedInput)
    );
  }, [plantInput, plantFilter]);
  
  // Update suggestions when input changes
  useEffect(() => {
    setSuggestions(getSearchResults());
  }, [plantInput, getSearchResults]);
  
  // Reverse geocode coordinates to get postal code and country
  const reverseGeocode = async (lat, lng) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call to a geocoding service
      // For this demo, we'll simulate a response
      
      // Mock response for demo purposes
      setTimeout(() => {
        if (lat > 40) {
          setCountry('US');
          setPostalCode('10001');
        } else if (lat > 35) {
          setCountry('US');
          setPostalCode('90210');
        } else {
          setCountry('AU');
          setPostalCode('3000');
        }
        
        setLoading(false);
        lookupZone(country, postalCode);
      }, 1000);
    } catch (error) {
      setError('Failed to detect location. Please enter your location manually.');
      setLoading(false);
    }
  };
  
  // Get zone from postal code and country
  const lookupZone = (countryCode, postal) => {
    setLoading(true);
    
    // In a real app, this would be an API call to a hardiness zone lookup service
    setTimeout(() => {
      const key = `${postal}-${countryCode}`;
      const zoneInfo = mockZoneData[key] || mockZoneData['10001-US']; // Default to NYC if not found
      
      setZone(zoneInfo);
      setLoading(false);
      
      // If we found a zone, also get weather data
      if (zoneInfo) {
        fetchWeatherData();
      }
    }, 800);
  };
  
  // Fetch current weather and forecast
  const fetchWeatherData = () => {
    // In a real app, this would be an API call to a weather service
    // For this demo, we'll simulate a response with mock data
    
    // Mock current weather
    setWeather({
      temperature: 68,
      condition: 'Partly Cloudy',
      humidity: 55,
      wind: '8 mph',
      icon: 'cloud-sun'
    });
    
    // Mock 5-day forecast
    setWeatherForecast([
      { day: 'Monday', high: 72, low: 58, condition: 'Sunny', icon: 'sun' },
      { day: 'Tuesday', high: 68, low: 54, condition: 'Partly Cloudy', icon: 'cloud-sun' },
      { day: 'Wednesday', high: 65, low: 53, condition: 'Rain', icon: 'cloud-rain' },
      { day: 'Thursday', high: 64, low: 52, condition: 'Showers', icon: 'cloud-showers-heavy' },
      { day: 'Friday', high: 70, low: 55, condition: 'Sunny', icon: 'sun' }
    ]);
  };
  
  // Handle location form submission
  const handleLocationSubmit = (e) => {
    e.preventDefault();
    // Save location
    const locationData = { country, postalCode };
    localStorage.setItem('userLocation', JSON.stringify(locationData));
    
    // Look up zone
    lookupZone(country, postalCode);
    
    // Close modal
    setShowLocationModal(false);
  };
  
  // Add a plant to the selected list
  const addPlant = (plant) => {
    if (!selectedPlants.some(p => p.id === plant.id)) {
      setSelectedPlants([...selectedPlants, plant]);
    }
    setPlantInput('');
    setSuggestions([]);
  };
  
  // Remove a plant from the selected list
  const removePlant = (plantId) => {
    setSelectedPlants(selectedPlants.filter(plant => plant.id !== plantId));
  };
  
  // Calculate planting and harvest dates based on frost dates
  const calculatePlantingDates = (plant) => {
    if (!zone) return null;
    
    const currentYear = new Date().getFullYear();
    
    // Parse frost dates
    const lastFrostParts = zone.lastFrost.split(' ');
    const lastFrostMonth = getMonthNumber(lastFrostParts[0]);
    const lastFrostDay = parseInt(lastFrostParts[1]);
    
    const firstFrostParts = zone.firstFrost.split(' ');
    const firstFrostMonth = getMonthNumber(firstFrostParts[0]);
    const firstFrostDay = parseInt(firstFrostParts[1]);
    
    // Create Date objects for frost dates
    let lastFrostDate = new Date(currentYear, lastFrostMonth, lastFrostDay);
    let firstFrostDate = new Date(currentYear, firstFrostMonth, firstFrostDay);
    
    // Adjust for southern hemisphere if needed
    if (!isNorthernHemisphere) {
      lastFrostDate = new Date(currentYear, (lastFrostMonth + 6) % 12, lastFrostDay);
      firstFrostDate = new Date(currentYear, (firstFrostMonth + 6) % 12, firstFrostDay);
    }
    
    const dates = {};
    
    // Calculate indoor start date if applicable
    if (plant.indoorStart) {
      const indoorStartDate = new Date(lastFrostDate);
      if (plant.indoorStart.relativeTo === 'lastFrost') {
        // Weeks before last frost
        indoorStartDate.setDate(indoorStartDate.getDate() - (plant.indoorStart.weeks * 7));
      } else if (plant.indoorStart.relativeTo === 'afterLastFrost') {
        // Weeks after last frost
        indoorStartDate.setDate(indoorStartDate.getDate() + (plant.indoorStart.weeks * 7));
      }
      dates.indoorStart = indoorStartDate;
    }
    
    // Calculate outdoor sowing date
    const outdoorStartDate = new Date(lastFrostDate);
    if (plant.outdoorStart.relativeTo === 'lastFrost') {
      // At last frost date
      // No adjustment needed
    } else if (plant.outdoorStart.relativeTo === 'beforeLastFrost') {
      // Weeks before last frost
      outdoorStartDate.setDate(outdoorStartDate.getDate() - (plant.outdoorStart.weeks * 7));
    } else if (plant.outdoorStart.relativeTo === 'afterLastFrost') {
      // Weeks after last frost
      outdoorStartDate.setDate(outdoorStartDate.getDate() + (plant.outdoorStart.weeks * 7));
    }
    dates.outdoorStart = outdoorStartDate;
    
    // Calculate harvest start date (based on earliest maturity)
    const harvestStartDate = new Date(outdoorStartDate);
    harvestStartDate.setDate(harvestStartDate.getDate() + plant.daysToMaturity.min);
    dates.harvestStart = harvestStartDate;
    
    // Calculate harvest end date (based on latest maturity)
    const harvestEndDate = new Date(outdoorStartDate);
    harvestEndDate.setDate(harvestEndDate.getDate() + plant.daysToMaturity.max);
    dates.harvestEnd = harvestEndDate;
    
    // Apply any custom adjustments the user has made
    if (plantingAdjustments[plant.id]) {
      const adjustments = plantingAdjustments[plant.id];
      
      if (adjustments.indoorStart) {
        dates.indoorStart = new Date(adjustments.indoorStart);
      }
      
      if (adjustments.outdoorStart) {
        dates.outdoorStart = new Date(adjustments.outdoorStart);
      }
    }
    
    return dates;
  };
  
  // Helper to convert month name to number
  const getMonthNumber = (monthName) => {
    const months = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
      'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
    };
    return months[monthName];
  };
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };
  
  // Get all months for the year
  const getMonths = () => {
    return [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  };
  
  // Handle drag start event for plants
  const handleDragStart = (e, plant) => {
    setDraggedPlant(plant);
    e.dataTransfer.setData('text/plain', plant.id);
  };
  
  // Handle drag over event for calendar cells
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  // Handle drop event for calendar cells
  const handleDrop = (e, month, type) => {
    e.preventDefault();
    if (!draggedPlant) return;
    
    // Parse the month name to get a date object for the 1st of that month
    const monthNumber = getMonthNumber(month);
    const year = new Date().getFullYear();
    const newDate = new Date(year, monthNumber, 15); // Middle of the month
    
    // Update the planting adjustments
    setPlantingAdjustments({
      ...plantingAdjustments,
      [draggedPlant.id]: {
        ...plantingAdjustments[draggedPlant.id],
        [type === 'indoor' ? 'indoorStart' : 'outdoorStart']: newDate
      }
    });
    
    setDraggedPlant(null);
  };
  
  // Handle plant click to show details
  const handlePlantClick = (plant) => {
    setSelectedPlantDetails(plant);
    setShowPlantDetailsModal(true);
  };
  
  // Handle succession planner open
  const handleSuccessionPlannerOpen = (plant) => {
    setSuccessionPlant(plant);
    setShowSuccessionPlanner(true);
  };
  
  // Render the planting calendar
  const renderCalendar = () => {
    const months = getMonths();
    
    // Create calendar grid with months as columns
    return (
      <div className="planting-calendar">
        <table className="calendar-table w-100">
          <thead>
            <tr>
              <th className="plant-column">Plant</th>
              {months.map(month => (
                <th key={month} className="month-column">{month}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedPlants.map(plant => {
              const dates = calculatePlantingDates(plant);
              if (!dates) return null;
              
              return (
                <tr key={plant.id}>
                  <td 
                    className="plant-name-cell"
                    onClick={() => handlePlantClick(plant)}
                  >
                    <div className="d-flex align-items-center">
                      <span className="plant-icon mr-2">
                        {plant.type === 'Vegetable' ? '🥕' : 
                         plant.type === 'Herb' ? '🌿' : '🌸'}
                      </span>
                      <span>{plant.name}</span>
                    </div>
                    <Badge 
                      pill 
                      bg="light" 
                      text="dark" 
                      className="plant-type-badge"
                    >
                      {plant.type}
                    </Badge>
                  </td>
                  
                  {months.map(month => {
                    // Check if this month is within the indoor starting period
                    const monthIndex = getMonthNumber(month);
                    const monthDate = new Date(new Date().getFullYear(), monthIndex, 15);
                    
                    const isIndoorMonth = dates.indoorStart && 
                      monthDate.getMonth() === dates.indoorStart.getMonth();
                    
                    const isOutdoorMonth = dates.outdoorStart && 
                      monthDate.getMonth() === dates.outdoorStart.getMonth();
                    
                    const isHarvestMonth = dates.harvestStart && dates.harvestEnd &&
                      monthDate >= dates.harvestStart && monthDate <= dates.harvestEnd;
                    
                    let cellStyle = {};
                    let cellContent = '';
                    
                    if (isIndoorMonth) {
                      cellStyle = { backgroundColor: INDOOR_COLOR };
                      cellContent = 'Start indoors';
                    } else if (isOutdoorMonth) {
                      cellStyle = { backgroundColor: OUTDOOR_COLOR };
                      cellContent = 'Direct sow/transplant';
                    } else if (isHarvestMonth) {
                      cellStyle = { backgroundColor: HARVEST_COLOR };
                      cellContent = 'Harvest';
                    }
                    
                    return (
                      <td 
                        key={`${plant.id}-${month}`} 
                        style={cellStyle}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, month, isIndoorMonth ? 'indoor' : 'outdoor')}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <div className="calendar-legend mt-3 d-flex justify-content-center">
          <div className="legend-item d-flex align-items-center me-4">
            <div className="legend-color" style={{ backgroundColor: INDOOR_COLOR, width: '20px', height: '20px', marginRight: '5px' }}></div>
            <span>Start indoors</span>
          </div>
          <div className="legend-item d-flex align-items-center me-4">
            <div className="legend-color" style={{ backgroundColor: OUTDOOR_COLOR, width: '20px', height: '20px', marginRight: '5px' }}></div>
            <span>Direct sow/transplant outdoors</span>
          </div>
          <div className="legend-item d-flex align-items-center">
            <div className="legend-color" style={{ backgroundColor: HARVEST_COLOR, width: '20px', height: '20px', marginRight: '5px' }}></div>
            <span>Harvest period</span>
          </div>
        </div>
      </div>
    );
  };
  
  // Print the calendar
  const handlePrintCalendar = () => {
    window.print();
  };
  
  // Render plant details modal
  const renderPlantDetailsModal = () => {
    if (!selectedPlantDetails) return null;
    
    const dates = calculatePlantingDates(selectedPlantDetails);
    
    return (
      <Modal show={showPlantDetailsModal} onHide={() => setShowPlantDetailsModal(false)} size="lg">
        <Modal.Header closeButton style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
          <Modal.Title>
            {selectedPlantDetails.name} ({selectedPlantDetails.type})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <h5>Growing Information</h5>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Days to Maturity:</strong> {selectedPlantDetails.daysToMaturity.min}-{selectedPlantDetails.daysToMaturity.max} days
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Spacing:</strong> {selectedPlantDetails.spacing}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Description:</strong> {selectedPlantDetails.description}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Notes:</strong> {selectedPlantDetails.notes}
                </ListGroup.Item>
              </ListGroup>
              
              <h5 className="mt-3">Companions</h5>
              <div className="d-flex flex-wrap">
                {selectedPlantDetails.companions.map((companion, index) => (
                  <Badge 
                    key={index} 
                    bg="success" 
                    style={{ margin: '2px', backgroundColor: PRIMARY_COLOR }}
                  >
                    {companion}
                  </Badge>
                ))}
              </div>
              
              <h5 className="mt-3">Plants to Avoid</h5>
              <div className="d-flex flex-wrap">
                {selectedPlantDetails.enemies.map((enemy, index) => (
                  <Badge 
                    key={index} 
                    bg="danger" 
                    style={{ margin: '2px' }}
                  >
                    {enemy}
                  </Badge>
                ))}
              </div>
            </Col>
            
            <Col md={6}>
              <h5>Planting Dates for Your Location</h5>
              {dates ? (
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>Start Indoors:</strong> {selectedPlantDetails.indoorStart 
                      ? formatDate(dates.indoorStart) 
                      : 'Not recommended'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Outdoor Planting:</strong> {formatDate(dates.outdoorStart)}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Harvest Period:</strong> {formatDate(dates.harvestStart)} to {formatDate(dates.harvestEnd)}
                  </ListGroup.Item>
                </ListGroup>
              ) : (
                <Alert variant="warning">
                  Set your location to see customized planting dates.
                </Alert>
              )}
              
              {selectedPlantDetails.succession.suitable && (
                <div className="mt-3">
                  <h5>Succession Planting</h5>
                  <p>
                    This plant is suitable for succession planting. 
                    Plant every {selectedPlantDetails.succession.interval} days for continuous harvest.
                  </p>
                  <Button 
                    variant="success" 
                    style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                    onClick={() => handleSuccessionPlannerOpen(selectedPlantDetails)}
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    Create Succession Plan
                  </Button>
                </div>
              )}
              
              <div className="mt-3">
                <h5>Task Management</h5>
                <Button 
                  variant="outline-primary" 
                  className="me-2"
                  onClick={() => setShowTaskManager(true)}
                >
                  <FontAwesomeIcon icon={faList} className="me-2" />
                  Manage Tasks
                </Button>
                <Button 
                  variant="outline-success"
                  onClick={() => setShowJournal(true)}
                >
                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                  Garden Journal
                </Button>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPlantDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
  
  // Main render
  return (
    <Container fluid className="seed-sowing-calendar">
      <style>
        {`
          @media print {
            .no-print {
              display: none;
            }
            .planting-calendar {
              width: 100%;
            }
            .calendar-table {
              border-collapse: collapse;
            }
            .calendar-table th, .calendar-table td {
              border: 1px solid #ddd;
              padding: 8px;
              font-size: 12px;
            }
            .plant-name-cell {
              font-weight: bold;
            }
          }
          
          .calendar-table {
            border-collapse: collapse;
          }
          .calendar-table th, .calendar-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
          }
          .month-column {
            width: 7.5%;
          }
          .plant-column {
            width: 10%;
          }
          .plant-name-cell {
            cursor: pointer;
            text-align: left;
            position: relative;
          }
          .plant-name-cell:hover {
            background-color: ${LIGHT_COLOR};
          }
          .plant-type-badge {
            position: absolute;
            top: 5px;
            right: 5px;
            font-size: 0.6rem;
          }
          .plant-item {
            cursor: pointer;
            padding: 8px;
            border-bottom: 1px solid #eee;
            transition: background-color 0.2s;
          }
          .plant-item:hover {
            background-color: ${LIGHT_COLOR};
          }
          .plant-item.selected {
            background-color: ${LIGHT_COLOR};
          }
          .plant-item .remove-btn {
            visibility: hidden;
          }
          .plant-item:hover .remove-btn {
            visibility: visible;
          }
        `}
      </style>
      
      <Row className="mb-4 no-print">
        {/* Location and zone information */}
        <Col md={6}>
          <Card className="h-100">
            <Card.Header style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
              <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
              Your Growing Location
            </Card.Header>
            <Card.Body>
              {zone ? (
                <div>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5>{postalCode}, {countries.find(c => c.code === country)?.name}</h5>
                      <p className="mb-1">
                        <strong>Zone System:</strong> {zone.system}
                      </p>
                      <p className="mb-1">
                        <strong>Zone:</strong> {zone.zone}
                      </p>
                      <p className="mb-1">
                        <strong>Last Frost Date:</strong> {zone.lastFrost}
                      </p>
                      <p className="mb-1">
                        <strong>First Frost Date:</strong> {zone.firstFrost}
                      </p>
                      <p className="mb-0">
                        <strong>Growing Season:</strong> {zone.growingDays} days
                      </p>
                    </div>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => setShowLocationModal(true)}
                    >
                      Change
                    </Button>
                  </div>
                  
                  <div className="form-check mt-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="hemisphereCheck"
                      checked={isNorthernHemisphere}
                      onChange={(e) => setIsNorthernHemisphere(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="hemisphereCheck">
                      Northern Hemisphere
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  {loading ? (
                    <div>
                      <Spinner animation="border" variant="success" />
                      <p className="mt-3">Detecting your growing zone...</p>
                    </div>
                  ) : (
                    <div>
                      <p>Set your location to get customized planting dates.</p>
                      <Button 
                        variant="success" 
                        onClick={() => setShowLocationModal(true)}
                        style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                      >
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                        Set Location
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        {/* Weather widget */}
        <Col md={6}>
          <Card className="h-100">
            <Card.Header style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
              <FontAwesomeIcon icon={faCloudSun} className="me-2" />
              Weather & Growing Conditions
            </Card.Header>
            <Card.Body>
              {weather ? (
                <Row>
                  <Col md={5}>
                    <div className="text-center">
                      <h5>Current Conditions</h5>
                      <div className="current-weather">
                        <FontAwesomeIcon 
                          icon={faCloudSun} 
                          style={{ fontSize: '2.5rem', color: PRIMARY_COLOR }}
                        />
                        <h2>{weather.temperature}°F</h2>
                        <p>{weather.condition}</p>
                        <p>
                          <FontAwesomeIcon icon={faWater} className="me-1" />
                          Humidity: {weather.humidity}%
                        </p>
                      </div>
                    </div>
                  </Col>
                  <Col md={7}>
                    <h5>Forecast</h5>
                    <div className="forecast-wrapper">
                      <div className="d-flex justify-content-between">
                        {weatherForecast && weatherForecast.slice(0, 3).map((day, index) => (
                          <div key={index} className="text-center">
                            <div>{day.day.substring(0, 3)}</div>
                            <FontAwesomeIcon icon={faSun} />
                            <div>{day.high}°/{day.low}°</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="soil-temp mt-3">
                      <h5>Growing Recommendations</h5>
                      <p className="mb-1">
                        <FontAwesomeIcon icon={faTemperatureHigh} className="me-2" />
                        Current soil temperature is good for:
                      </p>
                      <div className="d-flex flex-wrap">
                        <Badge bg="success" className="me-1 mb-1" style={{ backgroundColor: PRIMARY_COLOR }}>
                          Cool-season crops
                        </Badge>
                        <Badge bg="secondary" className="me-1 mb-1">
                          Waiting for warm-season crops
                        </Badge>
                      </div>
                    </div>
                  </Col>
                </Row>
              ) : zone ? (
                <div className="text-center">
                  <p>Weather data is loading...</p>
                  <Spinner animation="border" variant="success" />
                </div>
              ) : (
                <div className="text-center">
                  <p>Set your location to view weather data and growing recommendations.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4 no-print">
        {/* Plant selection column */}
        <Col md={4}>
          <Card className="mb-3">
            <Card.Header style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
              <FontAwesomeIcon icon={faLeaf} className="me-2" />
              Add Plants to Your Calendar
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <div className="d-flex">
                  <Form.Control 
                    type="text" 
                    placeholder="Search for plants..." 
                    value={plantInput}
                    onChange={(e) => setPlantInput(e.target.value)}
                  />
                  <Button 
                    variant="success" 
                    className="ms-2"
                    onClick={() => {
                      const plant = suggestions[0];
                      if (plant) addPlant(plant);
                    }}
                    disabled={!suggestions.length}
                    style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </Button>
                </div>
              </Form.Group>
              
              <div className="d-flex mb-3">
                {['All', 'Vegetable', 'Herb', 'Flower'].map(filter => (
                  <Button
                    key={filter}
                    variant={plantFilter === filter ? 'success' : 'outline-success'}
                    size="sm"
                    className="me-2"
                    onClick={() => setPlantFilter(filter)}
                    style={plantFilter === filter ? 
                      { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR } : 
                      { color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }
                    }
                  >
                    {filter}
                  </Button>
                ))}
              </div>
              
              {plantInput && suggestions.length > 0 && (
                <Card className="search-results mb-3">
                  <ListGroup variant="flush">
                    {suggestions.map(plant => (
                      <ListGroup.Item 
                        key={plant.id} 
                        action 
                        onClick={() => addPlant(plant)}
                      >
                        <div className="d-flex align-items-center">
                          <span style={{ marginRight: '10px' }}>
                            {plant.type === 'Vegetable' ? '🥕' : 
                             plant.type === 'Herb' ? '🌿' : '🌸'}
                          </span>
                          <div>
                            <div>{plant.name}</div>
                            <small className="text-muted">{plant.type}</small>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card>
              )}
              
              <h6 className="mb-3">Selected Plants</h6>
              <div className="selected-plants" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {selectedPlants.length === 0 ? (
                  <Alert variant="light">
                    No plants selected. Add plants to see your planting calendar.
                  </Alert>
                ) : (
                  <ListGroup variant="flush">
                    {selectedPlants.map(plant => (
                      <ListGroup.Item key={plant.id} className="plant-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div 
                            className="d-flex align-items-center w-100"
                            draggable
                            onDragStart={(e) => handleDragStart(e, plant)}
                            onClick={() => handlePlantClick(plant)}
                          >
                            <span style={{ marginRight: '10px' }}>
                              {plant.type === 'Vegetable' ? '🥕' : 
                               plant.type === 'Herb' ? '🌿' : '🌸'}
                            </span>
                            <div>
                              <div>{plant.name}</div>
                              <small className="text-muted">{plant.type}</small>
                            </div>
                          </div>
                          <Button 
                            variant="link" 
                            className="p-0 text-danger remove-btn"
                            onClick={() => removePlant(plant.id)}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              Calendar Instructions
            </Card.Header>
            <Card.Body>
              <p className="small mb-1">
                <FontAwesomeIcon icon={faCheckCircle} className="text-success me-2" />
                Click on a plant name to see detailed growing information.
              </p>
              <p className="small mb-1">
                <FontAwesomeIcon icon={faCheckCircle} className="text-success me-2" />
                Drag and drop plants to adjust planting dates.
              </p>
              <p className="small mb-1">
                <FontAwesomeIcon icon={faCheckCircle} className="text-success me-2" />
                Use the succession planner for continuous harvests.
              </p>
              <p className="small mb-1">
                <FontAwesomeIcon icon={faCheckCircle} className="text-success me-2" />
                Create tasks and journal entries to track your garden's progress.
              </p>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Calendar column */}
        <Col md={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center" style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
              <div>
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Seed Sowing Calendar
              </div>
              <div>
                <Button 
                  variant="light" 
                  size="sm" 
                  className="ms-2"
                  onClick={handlePrintCalendar}
                >
                  <FontAwesomeIcon icon={faPrint} className="me-2" />
                  Print Calendar
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {selectedPlants.length === 0 ? (
                <Alert variant="info">
                  Select plants to view your personalized planting calendar.
                </Alert>
              ) : !zone ? (
                <Alert variant="info">
                  Set your location to view planting dates.
                </Alert>
              ) : (
                renderCalendar()
              )}
            </Card.Body>
          </Card>
          
          {selectedPlants.length > 0 && zone && (
            <div className="mt-3">
              <Row>
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Header style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
                      <FontAwesomeIcon icon={faSeedling} className="me-2" />
                      Succession Planting
                    </Card.Header>
                    <Card.Body>
                      <p>Plan successive plantings for continuous harvests.</p>
                      <Button 
                        variant="outline-success" 
                        onClick={() => {
                          // Find first suitable plant for succession
                          const plant = selectedPlants.find(p => p.succession.suitable);
                          if (plant) {
                            handleSuccessionPlannerOpen(plant);
                          }
                        }}
                        disabled={!selectedPlants.some(p => p.succession.suitable)}
                        style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                      >
                        Create Succession Plan
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Header style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
                      <FontAwesomeIcon icon={faList} className="me-2" />
                      Task Management
                    </Card.Header>
                    <Card.Body>
                      <p>Create and track garden tasks throughout the season.</p>
                      <Button 
                        variant="outline-success" 
                        onClick={() => setShowTaskManager(true)}
                        style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                      >
                        Manage Tasks
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Header style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
                      <FontAwesomeIcon icon={faEdit} className="me-2" />
                      Garden Journal
                    </Card.Header>
                    <Card.Body>
                      <p>Keep notes on your garden's progress and results.</p>
                      <Button 
                        variant="outline-success" 
                        onClick={() => setShowJournal(true)}
                        style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                      >
                        Garden Journal
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Col>
      </Row>
      
      {/* Location Modal */}
      <Modal show={showLocationModal} onHide={() => setShowLocationModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
          <Modal.Title>
            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
            Set Your Location
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleLocationSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Select 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                {countries.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                Postal Code
                <small className="text-muted ms-2">
                  (Format: {countries.find(c => c.code === country)?.format})
                </small>
              </Form.Label>
              <Form.Control 
                type="text" 
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder={countries.find(c => c.code === country)?.format}
                required
              />
            </Form.Group>
            
            <Button 
              variant="success" 
              type="submit"
              style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
              className="w-100"
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : 'Find Zone'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Render plant details modal */}
      {renderPlantDetailsModal()}
      
      {/* Render succession planner modal as a placeholder */}
      <Modal show={showSuccessionPlanner} onHide={() => setShowSuccessionPlanner(false)} size="lg">
        <Modal.Header closeButton style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
          <Modal.Title>
            Succession Planting for {successionPlant?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Succession planting allows you to have continuous harvests throughout the growing season.</p>
          <p>For {successionPlant?.name}, we recommend planting every {successionPlant?.succession.interval} days for up to {successionPlant?.succession.maxPlantings} plantings.</p>
          
          <Alert variant="success">
            In the full implementation, this would calculate optimal planting dates based on your frost dates, current weather, and growing season length.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSuccessionPlanner(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Task Manager modal as a placeholder */}
      <Modal show={showTaskManager} onHide={() => setShowTaskManager(false)}>
        <Modal.Header closeButton style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
          <Modal.Title>
            <FontAwesomeIcon icon={faList} className="me-2" />
            Garden Task Manager
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="success">
            The Task Manager would allow you to create, edit, and track garden tasks throughout the growing season.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTaskManager(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Journal modal as a placeholder */}
      <Modal show={showJournal} onHide={() => setShowJournal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}>
          <Modal.Title>
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            Garden Journal
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="success">
            The Garden Journal would allow you to keep notes on your garden's progress, record observations, and upload photos.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowJournal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GlobalSeedSowingCalendar;