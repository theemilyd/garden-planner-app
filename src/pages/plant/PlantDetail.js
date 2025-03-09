import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { plantAPI, gardenAPI } from '../../api';

const PlantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [gardens, setGardens] = useState([]);
  const [selectedGarden, setSelectedGarden] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingToGarden, setAddingToGarden] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plantData, gardensData] = await Promise.all([
        plantAPI.getPlant(id),
        gardenAPI.getAllGardens()
      ]);
      setPlant(plantData.data);
      setGardens(gardensData.data);
      setError('');
    } catch (err) {
      setError('Failed to load plant details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this plant?')) {
      try {
        await plantAPI.deletePlant(id);
        navigate('/plants');
      } catch (err) {
        setError('Failed to delete plant. Please try again.');
        console.error(err);
      }
    }
  };

  const handleAddToGarden = async (e) => {
    e.preventDefault();
    if (!selectedGarden) {
      setError('Please select a garden');
      return;
    }

    try {
      setAddingToGarden(true);
      await gardenAPI.addPlantToGarden({ 
        gardenId: selectedGarden, 
        plantId: id 
      });
      setSuccess(`Successfully added ${plant.name} to garden!`);
      setError('');
      setSelectedGarden('');
    } catch (err) {
      setError('Failed to add plant to garden. Please try again.');
      console.error(err);
    } finally {
      setAddingToGarden(false);
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

  if (!plant) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">
          {error || 'Plant not found'}
        </div>
        <Link to="/plants" className="btn btn-primary">
          Back to Plants
        </Link>
      </div>
    );
  }

  return (
    <div className="container my-4">
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="d-flex justify-content-between align-items-start mb-4">
        <h1>{plant.name}</h1>
        <div>
          <Link to={`/plants/${id}/edit`} className="btn btn-outline-primary me-2">
            <i className="fas fa-edit me-1"></i> Edit Plant
          </Link>
          <button className="btn btn-outline-danger" onClick={handleDelete}>
            <i className="fas fa-trash me-1"></i> Delete Plant
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              <h3 className="mb-0">Plant Details</h3>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <p><strong>Type:</strong> {plant.type}</p>
                  <p><strong>Growing Season:</strong> {plant.growingSeason}</p>
                  <p><strong>Days to Maturity:</strong> {plant.daysToMaturity || 'Not specified'}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Water Needs:</strong> {plant.waterNeeds}</p>
                  <p><strong>Sunlight:</strong> {plant.sunlight}</p>
                  <p><strong>Spacing:</strong> {plant.spacing ? `${plant.spacing} inches` : 'Not specified'}</p>
                </div>
              </div>
              
              {plant.description && (
                <div className="mb-3">
                  <h5>Description</h5>
                  <p>{plant.description}</p>
                </div>
              )}

              {plant.careInstructions && (
                <div className="mb-3">
                  <h5>Care Instructions</h5>
                  <p>{plant.careInstructions}</p>
                </div>
              )}

              {plant.harvestInstructions && (
                <div>
                  <h5>Harvest Instructions</h5>
                  <p>{plant.harvestInstructions}</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header bg-success text-white">
              <h3 className="mb-0">Planting Calendar</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h5>When to Plant</h5>
                  <p>{plant.whenToPlant || 'Optimal planting times depend on your zone. Generally, plant after danger of frost has passed for warm-season crops, or in early spring or fall for cool-season crops.'}</p>
                </div>
                <div className="col-md-6">
                  <h5>When to Harvest</h5>
                  <p>{plant.whenToHarvest || `Typically ready to harvest after about ${plant.daysToMaturity || '60-90'} days, depending on growing conditions.`}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Add to Garden</h3>
            </div>
            <div className="card-body">
              {gardens.length === 0 ? (
                <div className="text-center py-3">
                  <p>You don't have any gardens yet.</p>
                  <Link to="/gardens/new" className="btn btn-success">
                    Create a Garden
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleAddToGarden}>
                  <div className="mb-3">
                    <label htmlFor="gardenSelect" className="form-label">Select Garden</label>
                    <select
                      className="form-select"
                      id="gardenSelect"
                      value={selectedGarden}
                      onChange={(e) => setSelectedGarden(e.target.value)}
                      required
                    >
                      <option value="">Choose a garden...</option>
                      {gardens.map(garden => (
                        <option key={garden._id} value={garden._id}>
                          {garden.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={addingToGarden || !selectedGarden}
                  >
                    {addingToGarden ? 'Adding...' : 'Add to Garden'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header bg-info text-white">
              <h3 className="mb-0">Companion Plants</h3>
            </div>
            <div className="card-body">
              {plant.companionPlants && plant.companionPlants.length > 0 ? (
                <div>
                  <h5>Good Companions</h5>
                  <ul>
                    {plant.companionPlants.map((companion, idx) => (
                      <li key={idx}>{companion}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No companion plant information available for this plant.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Link to="/plants" className="btn btn-secondary">
        <i className="fas fa-arrow-left me-2"></i> Back to Plants
      </Link>
    </div>
  );
};

export default PlantDetail;