const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const plantRoutes = require('./routes/plantRoutes');
const gardenRoutes = require('./routes/gardenRoutes');
const zoneRoutes = require('./routes/zoneRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const aiRoutes = require('./routes/aiRoutes');
const emailRoutes = require('./routes/emailRoutes');
const pdfExportRoutes = require('./routes/pdfExportRoutes');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting to work correctly with X-Forwarded-For header
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS || 'https://mygarden.app' 
    : ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Add helmet for security headers
const helmet = require('helmet');
app.use(helmet());

// Enhanced rate limiting
const rateLimit = require('express-rate-limit');

// Global rate limiter for all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many requests, please try again later',
    errorCode: 'RATE_LIMIT_EXCEEDED'
  }
});

// Apply global rate limiter
app.use(globalLimiter);

// More strict rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 login/register attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many login attempts, please try again later',
    errorCode: 'AUTH_RATE_LIMIT_EXCEEDED'
  }
});

// API rate limiter
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 API requests per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many API requests, please try again later',
    errorCode: 'API_RATE_LIMIT_EXCEEDED'
  }
});

// Connect to MongoDB with enhanced options and retry mechanism
const connectWithRetry = (retryCount = 0, maxRetries = 5) => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10, // Increase for production if needed
      socketTimeoutMS: 45000,
    })
    .then(() => {
      console.log('MongoDB connected successfully');
    })
    .catch((err) => {
      console.error(`MongoDB connection error: ${err.message}`);
      
      if (retryCount < maxRetries) {
        console.log(`Retrying connection (${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => {
          connectWithRetry(retryCount + 1, maxRetries);
        }, 5000); // Wait 5 seconds before retrying
      } else {
        console.error('Max retries reached. Could not connect to MongoDB.');
        process.exit(1);
      }
    });
};

connectWithRetry();

// Routes
// Apply auth rate limiter to authentication routes
app.use('/api/auth', authLimiter);
app.use('/api/users', userRoutes);

// Apply API rate limiter to other API routes
app.use('/api/plants', apiLimiter, plantRoutes);
app.use('/api/gardens', apiLimiter, gardenRoutes);
app.use('/api/zones', apiLimiter, zoneRoutes);
app.use('/api/weather', apiLimiter, weatherRoutes);
app.use('/api/ai', apiLimiter, aiRoutes);
app.use('/api/email', apiLimiter, emailRoutes);
app.use('/api/export', apiLimiter, pdfExportRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Any route that is not an API route will be redirected to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing