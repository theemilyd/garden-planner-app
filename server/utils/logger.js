const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;
require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log format
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let meta = '';
  if (Object.keys(metadata).length > 0) {
    meta = JSON.stringify(metadata);
  }
  return `${timestamp} [${level}]: ${message} ${meta}`;
});

// Create file transports for different log levels
const fileTransport = new transports.DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info'
});

const errorFileTransport = new transports.DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error'
});

// Create console transport with colors for development
const consoleTransport = new transports.Console({
  format: combine(
    colorize(),
    logFormat
  ),
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

// Create the logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: { service: 'plantperfectly-api' },
  transports: [
    fileTransport,
    errorFileTransport
  ],
  exitOnError: false
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(consoleTransport);
}

// Create a stream object for Morgan
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Helper functions for common log patterns
const logAPIRequest = (req, extraInfo = {}) => {
  logger.info(`API Request: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user ? req.user.id : 'anonymous',
    userAgent: req.get('User-Agent'),
    ...extraInfo
  });
};

const logAPIResponse = (req, res, responseTime, extraInfo = {}) => {
  logger.info(`API Response: ${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms`, {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime,
    ...extraInfo
  });
};

const logError = (error, req = null, extraInfo = {}) => {
  const logData = {
    message: error.message,
    stack: error.stack,
    ...extraInfo
  };
  
  if (req) {
    logData.method = req.method;
    logData.url = req.originalUrl;
    logData.ip = req.ip;
    logData.userId = req.user ? req.user.id : 'anonymous';
  }
  
  logger.error(`Error: ${error.message}`, logData);
};

module.exports = {
  logger,
  logAPIRequest,
  logAPIResponse,
  logError
}; 