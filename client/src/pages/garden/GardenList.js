import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gardenAPI } from '../../api';

const GardenList = () => {
  const [gardens, setGardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGardens();
  }, []);

  const loadGardens = async () => {
    try {
      setLoading(true);
      const response = await gardenAPI.getAllGardens();
      const data = response.data;
      setGardens(data);
      setError('');
    } catch (err) {
      setError('Failed to load gardens. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this garden?')) {
      try {
        await gardenAPI.deleteGarden(id);
        setGardens(gardens.filter(garden => garden._id !== id));
      } catch (err) {
        setError('Failed to delete garden. Please try again.');
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
        <h1>My Gardens</h1>
        <Link to="/gardens/new" className="btn btn-success">
          <i className="fas fa-plus me-2"></i> New Garden
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {gardens.length === 0 ? (
        <div className="card">
          <div className="card-body text-center">
            <p className="mb-4">You don't have any gardens yet. Create your first garden to get started!</p>
            <Link to="/gardens/new" className="btn btn-primary">
              Create Your First Garden
            </Link>
          </div>
        </div>
      ) : (
        <div className="row">
          {gardens.map(garden => (
            <div className="col-md-4 mb-4" key={garden._id}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{garden.name}</h5>
                  <p className="card-text">
                    <strong>Size:</strong> {garden.width} x {garden.length} ft
                  </p>
                  <p className="card-text">
                    <strong>Location:</strong> {garden.location || 'Not specified'}
                  </p>
                  <p className="card-text">
                    <strong>Plants:</strong> {garden.plants ? garden.plants.length : 0}
                  </p>
                </div>
                <div className="card-footer bg-transparent d-flex justify-content-between">
                  <Link to={`/gardens/${garden._id}`} className="btn btn-outline-primary btn-sm">
                    <i className="fas fa-eye me-1"></i> View
                  </Link>
                  <Link to={`/gardens/${garden._id}/edit`} className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-edit me-1"></i> Edit
                  </Link>
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(garden._id)}
                  >
                    <i className="fas fa-trash me-1"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GardenList;