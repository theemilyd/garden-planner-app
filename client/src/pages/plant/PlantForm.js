import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { plantAPI } from '../../api';

const PlantForm = ({ isEditing }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    growingSeason: '',
    daysToMaturity: '',
    waterNeeds: '',
    sunlight: '',
    spacing: '',
    description: '',
    careInstructions: '',
    harvestInstructions: '',
    whenToPlant: '',
    whenToHarvest: '',
    companionPlants: '',
  });
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      loadPlant();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, id]);

  const loadPlant = async () => {
    try {
      setLoading(true);
      const response = await plantAPI.getPlant(id);
      const data = response.data;
      setFormData({
        name: data.name || '',
        type: data.type || '',
        growingSeason: data.growingSeason || '',
        daysToMaturity: data.daysToMaturity || '',
        waterNeeds: data.waterNeeds || '',
        sunlight: data.sunlight || '',
        spacing: data.spacing || '',
        description: data.description || '',
        careInstructions: data.careInstructions || '',
        harvestInstructions: data.harvestInstructions || '',
        whenToPlant: data.whenToPlant || '',
        whenToHarvest: data.whenToHarvest || '',
        companionPlants: data.companionPlants ? data.companionPlants.join(', ') : '',
      });
      setError('');
    } catch (err) {
      setError('Failed to load plant details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Process companion plants
      const companionPlantsArray = formData.companionPlants
        ? formData.companionPlants.split(',').map(plant => plant.trim()).filter(Boolean)
        : [];

      // Convert numeric fields
      const plantData = {
        ...formData,
        daysToMaturity: formData.daysToMaturity ? parseInt(formData.daysToMaturity) : undefined,
        spacing: formData.spacing ? parseInt(formData.spacing) : undefined,
        companionPlants: companionPlantsArray,
      };

      if (isEditing && id) {
        await plantAPI.updatePlant(id, plantData);
        navigate(`/plants/${id}`);
      } else {
        const response = await plantAPI.createPlant(plantData);
        const newPlant = response.data;
        navigate(`/plants/${newPlant._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to save plant. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
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
      <h1>{isEditing ? 'Edit Plant' : 'Add New Plant'}</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Plant Name*</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <label htmlFor="type" className="form-label">Type*</label>
                <select
                  className="form-select"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Vegetable">Vegetable</option>
                  <option value="Fruit">Fruit</option>
                  <option value="Herb">Herb</option>
                  <option value="Flower">Flower</option>
                  <option value="Tree">Tree</option>
                  <option value="Shrub">Shrub</option>
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="growingSeason" className="form-label">Growing Season*</label>
                <select
                  className="form-select"
                  id="growingSeason"
                  name="growingSeason"
                  value={formData.growingSeason}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Season</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                  <option value="Winter">Winter</option>
                  <option value="Year-round">Year-round</option>
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="daysToMaturity" className="form-label">Days to Maturity</label>
                <input
                  type="number"
                  className="form-control"
                  id="daysToMaturity"
                  name="daysToMaturity"
                  value={formData.daysToMaturity}
                  onChange={handleChange}
                  min="1"
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <label htmlFor="waterNeeds" className="form-label">Water Needs*</label>
                <select
                  className="form-select"
                  id="waterNeeds"
                  name="waterNeeds"
                  value={formData.waterNeeds}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Water Needs</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="sunlight" className="form-label">Sunlight*</label>
                <select
                  className="form-select"
                  id="sunlight"
                  name="sunlight"
                  value={formData.sunlight}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Sunlight</option>
                  <option value="Full Sun">Full Sun</option>
                  <option value="Partial Sun">Partial Sun</option>
                  <option value="Partial Shade">Partial Shade</option>
                  <option value="Full Shade">Full Shade</option>
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="spacing" className="form-label">Spacing (inches)</label>
                <input
                  type="number"
                  className="form-control"
                  id="spacing"
                  name="spacing"
                  value={formData.spacing}
                  onChange={handleChange}
                  min="1"
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>

            <div className="mb-3">
              <label htmlFor="careInstructions" className="form-label">Care Instructions</label>
              <textarea
                className="form-control"
                id="careInstructions"
                name="careInstructions"
                value={formData.careInstructions}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>

            <div className="mb-3">
              <label htmlFor="harvestInstructions" className="form-label">Harvest Instructions</label>
              <textarea
                className="form-control"
                id="harvestInstructions"
                name="harvestInstructions"
                value={formData.harvestInstructions}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="whenToPlant" className="form-label">When to Plant</label>
                <textarea
                  className="form-control"
                  id="whenToPlant"
                  name="whenToPlant"
                  value={formData.whenToPlant}
                  onChange={handleChange}
                  rows="2"
                ></textarea>
              </div>
              <div className="col-md-6">
                <label htmlFor="whenToHarvest" className="form-label">When to Harvest</label>
                <textarea
                  className="form-control"
                  id="whenToHarvest"
                  name="whenToHarvest"
                  value={formData.whenToHarvest}
                  onChange={handleChange}
                  rows="2"
                ></textarea>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="companionPlants" className="form-label">Companion Plants</label>
              <input
                type="text"
                className="form-control"
                id="companionPlants"
                name="companionPlants"
                value={formData.companionPlants}
                onChange={handleChange}
                placeholder="Enter plant names separated by commas"
              />
              <div className="form-text">Enter plant names separated by commas (e.g., "Tomatoes, Basil, Marigold")</div>
            </div>

            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/plants')}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (isEditing ? 'Update Plant' : 'Add Plant')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlantForm;