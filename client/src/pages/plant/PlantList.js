import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { plantAPI } from '../../api';
import { searchPlantDatabase, varietyDatabase, plantDatabase } from '../../data/plantDatabase';

const PlantList = () => {
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    growingSeason: '',
  });
  
  // Add state for local database search results
  const [localSearchResults, setLocalSearchResults] = useState([]);
  const [usingLocalDatabase, setUsingLocalDatabase] = useState(false);

  useEffect(() => {
    loadPlants();
    // Initialize local database for search
    console.log(`Local plant database has ${plantDatabase.length} plants and ${varietyDatabase?.length || 0} varieties`);
  }, []);

  useEffect(() => {
    if (usingLocalDatabase) {
      // When using local database, update filtered plants from local search results
      setFilteredPlants(localSearchResults);
    } else {
      // When using API data, apply filters to plants from API
      applyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plants, filters, localSearchResults, usingLocalDatabase]);

  const loadPlants = async () => {
    try {
      setLoading(true);
      const response = await plantAPI.getAllPlants();
      const data = response.data;
      setPlants(data);
      setFilteredPlants(data);
      setError('');
    } catch (err) {
      setError('Failed to load plants. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If this is a search field change, also search the local database
    if (name === 'search') {
      searchLocalDatabase(value);
    }
  };
  
  // Function to search the local plant database
  const searchLocalDatabase = (searchTerm) => {
    if (!searchTerm) {
      setUsingLocalDatabase(false);
      return;
    }
    
    try {
      // Use our enhanced search function from plantDatabase.js
      const results = searchPlantDatabase(searchTerm, {
        type: filters.type || undefined,
        // Map growingSeason to season for our search function
        season: filters.growingSeason?.toLowerCase() || undefined
      });
      
      console.log(`Found ${results.length} plants/varieties matching "${searchTerm}"`);
      
      // Transform results to match API format for display
      const formattedResults = results.map(plant => ({
        _id: plant.id || `local-${Math.random().toString(36).substring(2, 9)}`,
        name: plant.name,
        type: plant.type,
        growingSeason: getSeasonFromPlant(plant),
        waterNeeds: 'Medium', // Default
        sunlight: plant.specifics?.sunlight || 'Full Sun', // Default 
        description: getDescriptionFromPlant(plant),
        // Include the original plant data for reference
        originalPlant: plant
      }));
      
      setLocalSearchResults(formattedResults);
      setUsingLocalDatabase(true);
    } catch (err) {
      console.error('Error searching local database:', err);
      setLocalSearchResults([]);
      setUsingLocalDatabase(false);
    }
  };
  
  // Helper to extract a meaningful description from our plant database format
  const getDescriptionFromPlant = (plant) => {
    if (plant.specifics?.notes) {
      return plant.specifics.notes;
    }
    
    if (plant.harvestInfo?.instructions) {
      return plant.harvestInfo.instructions;
    }
    
    if (plant.variety) {
      return `${plant.variety} variety of ${plant.baseType || plant.name}`;
    }
    
    return '';
  };
  
  // Helper to determine growing season from plant data
  const getSeasonFromPlant = (plant) => {
    if (plant.outdoorStart >= 2 && plant.outdoorStart <= 4) {
      return 'Spring';
    } else if (plant.outdoorStart >= 5 && plant.outdoorStart <= 7) {
      return 'Summer';  
    } else if (plant.outdoorStart >= 8 && plant.outdoorStart <= 10) {
      return 'Fall';
    }
    return 'Year-round'; // Default
  };

  const applyFilters = () => {
    let result = [...plants];
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(plant => 
        plant.name.toLowerCase().includes(searchTerm) || 
        (plant.description && plant.description.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply type filter
    if (filters.type) {
      result = result.filter(plant => plant.type === filters.type);
    }
    
    // Apply growing season filter
    if (filters.growingSeason) {
      result = result.filter(plant => plant.growingSeason === filters.growingSeason);
    }
    
    setFilteredPlants(result);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      type: '',
      growingSeason: '',
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plant?')) {
      try {
        await plantAPI.deletePlant(id);
        setPlants(plants.filter(plant => plant._id !== id));
      } catch (err) {
        setError('Failed to delete plant. Please try again.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Plants</h1>
        <Link to="/plants/new" className="btn btn-success">
          <i className="fas fa-plus me-2"></i> Add New Plant
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Filter Plants</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="search" className="form-label">Search By Name or Variety</label>
              <input
                type="text"
                className="form-control"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="E.g., Roma Tomato, Buttercrunch Lettuce, Purple Basil"
              />
              {usingLocalDatabase && (
                <div className="form-text text-success">
                  Showing results from comprehensive variety database ({localSearchResults.length} varieties found)
                </div>
              )}
            </div>
            <div className="col-md-3">
              <label htmlFor="type" className="form-label">Plant Type</label>
              <select
                className="form-select"
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="Vegetable">Vegetable</option>
                <option value="Fruit">Fruit</option>
                <option value="Herb">Herb</option>
                <option value="Flower">Flower</option>
                <option value="Tree">Tree</option>
                <option value="Shrub">Shrub</option>
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="growingSeason" className="form-label">Growing Season</label>
              <select
                className="form-select"
                id="growingSeason"
                name="growingSeason"
                value={filters.growingSeason}
                onChange={handleFilterChange}
              >
                <option value="">All Seasons</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Fall">Fall</option>
                <option value="Winter">Winter</option>
                <option value="Year-round">Year-round</option>
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredPlants.length === 0 ? (
        <div className="alert alert-info">
          No plants found matching your criteria. Try adjusting your filters or add a new plant.
        </div>
      ) : (
        <div className="row">
          {filteredPlants.map(plant => (
            <div className="col-md-4 mb-4" key={plant._id}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{plant.name}</h5>
                  <p className="card-text">
                    <span className="badge bg-primary me-2">{plant.type}</span>
                    <span className="badge bg-success">{plant.growingSeason}</span>
                    {plant.originalPlant?.variety && (
                      <span className="badge bg-info ms-2">Variety</span>
                    )}
                  </p>
                  
                  {/* Show variety-specific information if available */}
                  {plant.originalPlant?.specifics && (
                    <div className="variety-details" style={{padding: '8px', backgroundColor: '#f0f8ff', borderRadius: '4px', marginBottom: '8px'}}>
                      {plant.originalPlant.variety && (
                        <p className="card-text" style={{fontWeight: 'bold', marginBottom: '5px'}}>
                          Variety: {plant.originalPlant.variety}
                        </p>
                      )}
                      
                      {plant.originalPlant.specifics.color && (
                        <p className="card-text" style={{margin: '2px 0'}}>
                          <strong>Color:</strong> {plant.originalPlant.specifics.color}
                        </p>
                      )}
                      
                      {plant.originalPlant.specifics.days && (
                        <p className="card-text" style={{margin: '2px 0'}}>
                          <strong>Days to Maturity:</strong> {plant.originalPlant.specifics.days}
                        </p>
                      )}
                      
                      {plant.originalPlant.harvestInfo && (
                        <p className="card-text" style={{margin: '2px 0'}}>
                          <strong>Harvest:</strong> {plant.originalPlant.harvestInfo.timing?.period || "See details"}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Show standard information */}
                  {!plant.originalPlant && (
                    <>
                      <p className="card-text">
                        <strong>Water Needs:</strong> {plant.waterNeeds}
                      </p>
                      <p className="card-text">
                        <strong>Sunlight:</strong> {plant.sunlight}
                      </p>
                    </>
                  )}
                  
                  {/* Show harvest info if available */}
                  {plant.originalPlant?.harvestInfo?.instructions && (
                    <p className="card-text">
                      <strong>Harvest:</strong> {plant.originalPlant.harvestInfo.instructions.substring(0, 100)}
                      {plant.originalPlant.harvestInfo.instructions.length > 100 ? '...' : ''}
                    </p>
                  )}
                  
                  {/* Show description */}
                  {plant.description && (
                    <p className="card-text">{plant.description.substring(0, 100)}
                      {plant.description.length > 100 ? '...' : ''}
                    </p>
                  )}
                </div>
                <div className="card-footer bg-transparent d-flex justify-content-between">
                  {plant.originalPlant ? (
                    // For local database plants, just show view button
                    <button className="btn btn-outline-primary btn-sm" 
                      onClick={() => alert('Detailed variety information available in the database')}>
                      <i className="fas fa-eye me-1"></i> View Details
                    </button>
                  ) : (
                    // For API plants, show full action buttons
                    <>
                      <Link to={`/plants/${plant._id}`} className="btn btn-outline-primary btn-sm">
                        <i className="fas fa-eye me-1"></i> View
                      </Link>
                      <Link to={`/plants/${plant._id}/edit`} className="btn btn-outline-secondary btn-sm">
                        <i className="fas fa-edit me-1"></i> Edit
                      </Link>
                      <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(plant._id)}
                      >
                        <i className="fas fa-trash me-1"></i> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlantList;