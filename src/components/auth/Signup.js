import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { zoneAPI } from '../../api';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    zipCode: '',
    experience_level: 'beginner',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [hardiness_zone, setHardinessZone] = useState('');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  
  const { signup, error } = useAuth();
  const navigate = useNavigate();

  // Get user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({
            coordinates: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
          });
          
          // Get hardiness zone from coordinates
          fetchZoneFromLocation(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocationLoading(false);
        }
      );
    }
  };

  // Fetch zone from location
  const fetchZoneFromLocation = async (lat, lng) => {
    try {
      const response = await zoneAPI.getZoneByLocation({ lat, lng });
      if (response.data.data.zone) {
        setHardinessZone(response.data.data.zone.zone);
      }
    } catch (err) {
      console.error('Error fetching zone:', err);
    } finally {
      setIsLocationLoading(false);
    }
  };

  // Fetch zone from ZIP code
  const fetchZoneFromZip = async (zipCode) => {
    if (zipCode.length === 5) {
      setIsLocationLoading(true);
      try {
        const response = await zoneAPI.getZoneByLocation({ zipCode });
        if (response.data.data.zone) {
          setHardinessZone(response.data.data.zone.zone);
        }
      } catch (err) {
        console.error('Error fetching zone from ZIP:', err);
      } finally {
        setIsLocationLoading(false);
      }
    }
  };

  // Handle ZIP code change
  useEffect(() => {
    if (formData.zipCode.length === 5) {
      fetchZoneFromZip(formData.zipCode);
    }
  }, [formData.zipCode]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear specific error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare user data
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        experience_level: formData.experience_level,
        hardiness_zone,
        location: {
          zipCode: formData.zipCode,
          ...userLocation,
        },
      };
      
      const success = await signup(userData);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Signup error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create an Account</h2>
        <p>Join the Garden Planner community</p>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="Enter your name"
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="Enter your email"
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Create a password"
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <div className="invalid-feedback">{errors.confirmPassword}</div>
            )}
          </div>
          
          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor="zipCode">ZIP Code</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your ZIP code"
              />
            </div>
            
            <div className="form-group col-md-6">
              <label htmlFor="hardiness_zone">Hardiness Zone</label>
              <div className="input-group">
                <input
                  type="text"
                  id="hardiness_zone"
                  className="form-control"
                  value={hardiness_zone}
                  readOnly
                  placeholder="Determined by location"
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={getUserLocation}
                    disabled={isLocationLoading}
                  >
                    {isLocationLoading ? 'Loading...' : 'Detect'}
                  </button>
                </div>
              </div>
              <small className="form-text text-muted">
                We'll determine your garden zone based on your location
              </small>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="experience_level">Gardening Experience</label>
            <select
              id="experience_level"
              name="experience_level"
              value={formData.experience_level}
              onChange={handleChange}
              className="form-control"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="signup-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;