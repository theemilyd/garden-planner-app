import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage or check token
  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    if (token && userString) {
      try {
        // Parse the user JSON
        const user = JSON.parse(userString);
        setCurrentUser(user);
        
        // Check token expiration
        const tokenData = parseJwt(token);
        if (tokenData && tokenData.exp) {
          // If token is expired, logout
          const currentTime = Math.floor(Date.now() / 1000);
          if (tokenData.exp < currentTime) {
            console.log('Token expired, logging out');
            logout();
          }
        }
      } catch (err) {
        console.error('Error parsing user data', err);
        logout(); // Invalid data, clear it
      }
    }
    
    setLoading(false);
  }, []);
  
  // Parse JWT token
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      
      // For demo purposes - would normally make API call to server
      // const response = await authAPI.login({ email, password });
      
      // Create a mock user for demo purposes
      const mockUser = {
        _id: 'demo-user-id',
        name: 'Demo User',
        email: email || 'demo@example.com',
        zipCode: '10001',
        zone: '7b',
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      
      // Create a mock token with expiration time (24 hours from now)
      const expiresIn = 24 * 60 * 60; // 24 hours in seconds
      const expiryTime = Math.floor(Date.now() / 1000) + expiresIn;
      const mockTokenPayload = {
        userId: mockUser._id,
        email: mockUser.email,
        iat: Math.floor(Date.now() / 1000),
        exp: expiryTime
      };
      const mockTokenBase64 = btoa(JSON.stringify(mockTokenPayload));
      const mockToken = `header.${mockTokenBase64}.signature`;
      
      // Set the user as the current user
      setCurrentUser(mockUser);
      
      // Store user and token in localStorage for persistence
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      return false;
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      setError(null);
      
      // For demo purposes - would normally make API call to server
      // const response = await authAPI.signup(userData);
      
      // Create a mock user for demo purposes
      const mockUser = {
        _id: 'demo-user-id',
        name: userData.name || 'Demo User',
        email: userData.email || 'demo@example.com',
        zipCode: userData.zipCode || '10001',
        zone: userData.zone || '7b',
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      
      // Create a mock token with expiration time (24 hours from now)
      const expiresIn = 24 * 60 * 60; // 24 hours in seconds
      const expiryTime = Math.floor(Date.now() / 1000) + expiresIn;
      const mockTokenPayload = {
        userId: mockUser._id,
        email: mockUser.email,
        iat: Math.floor(Date.now() / 1000),
        exp: expiryTime
      };
      const mockTokenBase64 = btoa(JSON.stringify(mockTokenPayload));
      const mockToken = `header.${mockTokenBase64}.signature`;
      
      // Set the user as the current user
      setCurrentUser(mockUser);
      
      // Store user and token in localStorage for persistence
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return true;
    } catch (err) {
      console.error('Signup error:', err);
      setError('Registration failed. Please try again.');
      return false;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.updateProfile(userData);
      
      const { data } = response.data;
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setCurrentUser(data.user);
      return true;
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Update failed. Please try again.');
      return false;
    }
  };

  // Change password
  const updatePassword = async (passwordData) => {
    try {
      setError(null);
      await authAPI.updatePassword(passwordData);
      return true;
    } catch (err) {
      console.error('Update password error:', err);
      setError(err.response?.data?.message || 'Password update failed. Please try again.');
      return false;
    }
  };

  // Auth context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;