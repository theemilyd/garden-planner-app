import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gardenAPI } from '../../api';
import validate from '../../components/forms/FormValidation';

const GardenForm = () => {
  // Determine if editing based on URL params
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    width: '',
    length: '',
    location: '',
    soilType: '',
    sunlight: '',
    description: ''
  });
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isEditing && id) {
      loadGarden();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, id]);

  const loadGarden = async () => {
    try {
      setLoading(true);
      const response = await gardenAPI.getGarden(id);
      const data = response.data;
      setFormData({
        name: data.name || '',
        width: data.width || '',
        length: data.length || '',
        location: data.location || '',
        soilType: data.soilType || '',
        sunlight: data.sunlight || '',
        description: data.description || ''
      });
      setError('');
    } catch (err) {
      setError('Failed to load garden details. Please try again.');
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

  const validateForm = () => {
    // Validation schema
    const validationSchema = {
      name: validate.required,
      width: [validate.required, validate.isNumber, validate.min(0.1)],
      length: [validate.required, validate.isNumber, validate.min(0.1)]
    };
    
    // Run validation
    const errors = validate.validateForm(formData, validationSchema);
    setValidationErrors(errors);
    
    // Return true if no errors
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the form first
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      // Convert numeric fields to numbers
      const gardenData = {
        ...formData,
        width: parseFloat(formData.width),
        length: parseFloat(formData.length)
      };

      if (isEditing && id) {
        await gardenAPI.updateGarden(id, gardenData);
        navigate(`/gardens/${id}`);
      } else {
        const response = await gardenAPI.createGarden(gardenData);
        const newGarden = response.data;
        navigate(`/gardens/${newGarden._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save garden. Please try again.');
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
      <h1>{isEditing ? 'Edit Garden' : 'Create New Garden'}</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Garden Name*</label>
              <input
                type="text"
                className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {validationErrors.name && (
                <div className="invalid-feedback">{validationErrors.name}</div>
              )}
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="width" className="form-label">Width (ft)*</label>
                <input
                  type="number"
                  className={`form-control ${validationErrors.width ? 'is-invalid' : ''}`}
                  id="width"
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  min="0.1"
                  step="0.1"
                  required
                />
                {validationErrors.width && (
                  <div className="invalid-feedback">{validationErrors.width}</div>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="length" className="form-label">Length (ft)*</label>
                <input
                  type="number"
                  className={`form-control ${validationErrors.length ? 'is-invalid' : ''}`}
                  id="length"
                  name="length"
                  value={formData.length}
                  onChange={handleChange}
                  min="0.1"
                  step="0.1"
                  required
                />
                {validationErrors.length && (
                  <div className="invalid-feedback">{validationErrors.length}</div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="location" className="form-label">Location</label>
              <input
                type="text"
                className="form-control"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Backyard, Front yard, etc."
              />
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="soilType" className="form-label">Soil Type</label>
                <select
                  className="form-select"
                  id="soilType"
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleChange}
                >
                  <option value="">Select Soil Type</option>
                  <option value="Clay">Clay</option>
                  <option value="Sandy">Sandy</option>
                  <option value="Loamy">Loamy</option>
                  <option value="Silty">Silty</option>
                  <option value="Peaty">Peaty</option>
                  <option value="Chalky">Chalky</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="sunlight" className="form-label">Sunlight Exposure</label>
                <select
                  className="form-select"
                  id="sunlight"
                  name="sunlight"
                  value={formData.sunlight}
                  onChange={handleChange}
                >
                  <option value="">Select Sunlight Exposure</option>
                  <option value="Full Sun">Full Sun (6+ hours direct sun)</option>
                  <option value="Partial Sun">Partial Sun (4-6 hours direct sun)</option>
                  <option value="Partial Shade">Partial Shade (2-4 hours direct sun)</option>
                  <option value="Full Shade">Full Shade (less than 2 hours direct sun)</option>
                </select>
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
                rows="4"
                placeholder="Describe your garden..."
              ></textarea>
            </div>

            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/gardens')}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (isEditing ? 'Update Garden' : 'Create Garden')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GardenForm;