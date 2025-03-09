import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { authAPI, zoneAPI } from '../api';

const Profile = () => {
  const { currentUser, updateCurrentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    zipCode: '',
    zone: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        zipCode: currentUser.zipCode || '',
        zone: currentUser.zone || '',
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleZipCodeChange = async (e) => {
    const zipCode = e.target.value;
    setFormData(prev => ({
      ...prev,
      zipCode
    }));

    if (zipCode.length === 5) {
      try {
        const response = await zoneAPI.getZoneByLocation({ zipCode });
        const zone = response.data;
        setFormData(prev => ({
          ...prev,
          zone: zone.zoneName
        }));
      } catch (err) {
        console.error("Error fetching zone:", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        zipCode: formData.zipCode,
        zone: formData.zone,
      };

      const response = await authAPI.updateProfile(userData);
      const updatedUser = response.data;
      updateCurrentUser(updatedUser);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h2 className="mb-0">My Profile</h2>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              {successMessage && <div className="alert alert-success">{successMessage}</div>}

              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
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
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="zipCode" className="form-label">ZIP Code</label>
                    <input
                      type="text"
                      className="form-control"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleZipCodeChange}
                      pattern="[0-9]{5}"
                      maxLength="5"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="zone" className="form-label">Growing Zone</label>
                    <input
                      type="text"
                      className="form-control"
                      id="zone"
                      name="zone"
                      value={formData.zone}
                      readOnly
                    />
                    <div className="form-text">Your growing zone is determined by your ZIP code.</div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-success me-2"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div>
                  <div className="mb-3">
                    <h5>Name</h5>
                    <p>{formData.name}</p>
                  </div>
                  <div className="mb-3">
                    <h5>Email</h5>
                    <p>{formData.email}</p>
                  </div>
                  <div className="mb-3">
                    <h5>ZIP Code</h5>
                    <p>{formData.zipCode || 'Not set'}</p>
                  </div>
                  <div className="mb-3">
                    <h5>Growing Zone</h5>
                    <p>{formData.zone || 'Not determined'}</p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;