import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { gardenAPI } from '../../api';

const GardenDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [garden, setGarden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    loadGarden();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadGarden = async () => {
    try {
      setLoading(true);
      const response = await gardenAPI.getGarden(id);
      const data = response.data;
      setGarden(data);
      
      // Mock weather data for now
      setWeatherData({
        temperature: 72,
        condition: 'Sunny',
        humidity: 45,
        windSpeed: 5,
        forecast: [
          { day: 'Today', high: 75, low: 62, condition: 'Sunny' },
          { day: 'Tomorrow', high: 78, low: 64, condition: 'Partly Cloudy' },
          { day: 'Wednesday', high: 80, low: 65, condition: 'Sunny' },
        ]
      });
      
      setError('');
    } catch (err) {
      setError('Failed to load garden details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this garden?')) {
      try {
        await gardenAPI.deleteGarden(id);
        navigate('/gardens');
      } catch (err) {
        setError('Failed to delete garden. Please try again.');
        console.error(err);
      }
    }
  };

  const handleRemovePlant = async (plantId) => {
    try {
      // This API model expects a plant index, not an ID, so we need to find the index
      const plantIndex = garden.plants.findIndex(p => p._id === plantId);
      if (plantIndex !== -1) {
        await gardenAPI.removePlantFromGarden(id, plantIndex);
      }
      setGarden(prev => ({
        ...prev,
        plants: prev.plants.filter(plant => plant._id !== plantId)
      }));
    } catch (err) {
      setError('Failed to remove plant from garden. Please try again.');
      console.error(err);
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

  if (!garden) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">
          {error || 'Garden not found'}
        </div>
        <Link to="/gardens" className="btn btn-primary">
          Back to Gardens
        </Link>
      </div>
    );
  }

  return (
    <div className="container my-4">
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="d-flex justify-content-between align-items-start mb-4">
        <h1>{garden.name}</h1>
        <div>
          <Link to={`/gardens/${id}/edit`} className="btn btn-outline-primary me-2">
            <i className="fas fa-edit me-1"></i> Edit Garden
          </Link>
          <button className="btn btn-outline-danger" onClick={handleDelete}>
            <i className="fas fa-trash me-1"></i> Delete Garden
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              <h3 className="mb-0">Garden Details</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Size:</strong> {garden.width} x {garden.length} ft</p>
                  <p><strong>Location:</strong> {garden.location || 'Not specified'}</p>
                  <p><strong>Soil Type:</strong> {garden.soilType || 'Not specified'}</p>
                  <p><strong>Sunlight:</strong> {garden.sunlight || 'Not specified'}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Created:</strong> {new Date(garden.createdAt).toLocaleDateString()}</p>
                  <p><strong>Last Updated:</strong> {new Date(garden.updatedAt).toLocaleDateString()}</p>
                  <p><strong>Plants:</strong> {garden.plants ? garden.plants.length : 0}</p>
                </div>
              </div>
              {garden.description && (
                <div className="mt-3">
                  <h5>Description</h5>
                  <p>{garden.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Plants in this Garden</h3>
              <Link to="/plants" className="btn btn-light btn-sm">
                <i className="fas fa-plus me-1"></i> Add Plants
              </Link>
            </div>
            <div className="card-body">
              {garden.plants && garden.plants.length > 0 ? (
                <div className="row">
                  {garden.plants.map(plant => (
                    <div className="col-md-6 mb-3" key={plant._id}>
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">{plant.name}</h5>
                          <p className="card-text">
                            <strong>Type:</strong> {plant.type}
                          </p>
                          <p className="card-text">
                            <strong>Growing Season:</strong> {plant.growingSeason}
                          </p>
                          <div className="d-flex justify-content-between mt-2">
                            <Link to={`/plants/${plant._id}`} className="btn btn-outline-primary btn-sm">
                              View Details
                            </Link>
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleRemovePlant(plant._id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p>No plants added to this garden yet.</p>
                  <Link to="/plants" className="btn btn-primary">
                    Browse Plants to Add
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          {weatherData && (
            <div className="card mb-4">
              <div className="card-header bg-info text-white">
                <h3 className="mb-0">Local Weather</h3>
              </div>
              <div className="card-body">
                <div className="text-center mb-3">
                  <i className="fas fa-sun display-1 text-warning"></i>
                  <h2 className="mb-0">{weatherData.temperature}°F</h2>
                  <p>{weatherData.condition}</p>
                </div>
                <div className="row">
                  <div className="col-6">
                    <p><i className="fas fa-tint me-2"></i> Humidity: {weatherData.humidity}%</p>
                  </div>
                  <div className="col-6">
                    <p><i className="fas fa-wind me-2"></i> Wind: {weatherData.windSpeed} mph</p>
                  </div>
                </div>
                <hr />
                <h5 className="mb-3">3-Day Forecast</h5>
                {weatherData.forecast.map((day, index) => (
                  <div className="d-flex justify-content-between align-items-center mb-2" key={index}>
                    <span>{day.day}</span>
                    <span><i className="fas fa-sun me-2 text-warning"></i></span>
                    <span>{day.high}° / {day.low}°</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header bg-success text-white">
              <h3 className="mb-0">Planting Calendar</h3>
            </div>
            <div className="card-body">
              <p className="mb-3">Optimal planting times for your zone:</p>
              <div className="mb-3">
                <h5>Spring Planting</h5>
                <p>Start seeds indoors: February - March</p>
                <p>Direct sowing: April - May</p>
              </div>
              <div className="mb-3">
                <h5>Summer Planting</h5>
                <p>Warm season crops: May - June</p>
              </div>
              <div>
                <h5>Fall Planting</h5>
                <p>Cool season crops: August - September</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Link to="/gardens" className="btn btn-secondary">
        <i className="fas fa-arrow-left me-2"></i> Back to Gardens
      </Link>
    </div>
  );
};

export default GardenDetail;