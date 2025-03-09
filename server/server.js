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
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => {
      console.error(`MongoDB connection error (attempt ${retryCount + 1}/${maxRetries}):`, err);
      if (retryCount < maxRetries) {
        console.log(`Retrying connection in ${Math.min(10000, 1000 * 2 ** retryCount)}ms...`);
        setTimeout(() => connectWithRetry(retryCount + 1, maxRetries), 
          Math.min(10000, 1000 * 2 ** retryCount)); // Exponential backoff with 10s max
      } else {
        console.error('Max retries reached. Could not connect to MongoDB.');
        process.exit(1); // Exit with error if we can't establish connection after multiple retries
      }
    });
};

// Initial connection attempt
connectWithRetry();

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully');
});

// Handle uncaught exceptions
process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err);
  // Graceful shutdown
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(1);
  } catch (closeError) {
    console.error('Error closing MongoDB connection:', closeError);
    process.exit(1);
  }
});

// Rate limiting middleware for API routes
const rateLimit = require('express-rate-limit');

// Apply rate limiting to sensitive routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // limit each IP to 120 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limits to routes BEFORE registering route handlers
// Apply to auth-related routes
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/users/forgot-password', authLimiter);
// Apply general rate limit to all API routes
app.use('/api/', apiLimiter);

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/gardens', gardenRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/newsletter', emailRoutes);
app.use('/api/pdfexport', pdfExportRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Serve garden data files
  app.use('/garden_data', express.static(path.join(__dirname, '../garden_data')));
  
  // Serve enhanced garden data files
  app.use('/garden_data_enhanced', express.static(path.join(__dirname, '../garden_data_enhanced')));
  
  // Handle any requests that don't match the ones above
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Import centralized error handler
const { errorHandler } = require('./middleware/errorHandler');

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing