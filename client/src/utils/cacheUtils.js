/**
 * Utility functions for client-side data caching
 */

// Default cache expiration time (30 minutes)
const DEFAULT_CACHE_EXPIRATION = 30 * 60 * 1000;

/**
 * Cache data in localStorage with expiration
 * 
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} expirationMs - Cache expiration time in milliseconds
 */
export const cacheData = (key, data, expirationMs = DEFAULT_CACHE_EXPIRATION) => {
  try {
    const cacheItem = {
      data,
      expiry: Date.now() + expirationMs,
      timestamp: Date.now()
    };
    
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    return true;
  } catch (error) {
    console.error('Error caching data:', error);
    return false;
  }
};

/**
 * Get cached data from localStorage
 * 
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if not found or expired
 */
export const getCachedData = (key) => {
  try {
    const cachedItem = localStorage.getItem(`cache_${key}`);
    
    if (!cachedItem) return null;
    
    const { data, expiry } = JSON.parse(cachedItem);
    
    // Check if cache has expired
    if (Date.now() > expiry) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error retrieving cached data:', error);
    return null;
  }
};

/**
 * Clear a specific cache item
 * 
 * @param {string} key - Cache key to clear
 */
export const clearCache = (key) => {
  try {
    localStorage.removeItem(`cache_${key}`);
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

/**
 * Clear all cached data
 */
export const clearAllCache = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Error clearing all cache:', error);
    return false;
  }
};

/**
 * Clear expired cache items
 */
export const clearExpiredCache = () => {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        try {
          const cachedItem = localStorage.getItem(key);
          if (cachedItem) {
            const { expiry } = JSON.parse(cachedItem);
            if (now > expiry) {
              localStorage.removeItem(key);
            }
          }
        } catch (e) {
          // If item can't be parsed, remove it
          localStorage.removeItem(key);
        }
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error clearing expired cache:', error);
    return false;
  }
};

/**
 * Get cache statistics
 * 
 * @returns {Object} - Cache statistics
 */
export const getCacheStats = () => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('cache_'));
    const now = Date.now();
    
    let totalSize = 0;
    let expiredCount = 0;
    let validCount = 0;
    
    cacheKeys.forEach(key => {
      const item = localStorage.getItem(key);
      totalSize += (item ? item.length : 0);
      
      try {
        const { expiry } = JSON.parse(item || '{}');
        if (now > expiry) {
          expiredCount++;
        } else {
          validCount++;
        }
      } catch (e) {
        expiredCount++;
      }
    });
    
    return {
      totalItems: cacheKeys.length,
      validItems: validCount,
      expiredItems: expiredCount,
      totalSizeBytes: totalSize,
      totalSizeKB: Math.round(totalSize / 1024 * 100) / 100
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      totalItems: 0,
      validItems: 0,
      expiredItems: 0,
      totalSizeBytes: 0,
      totalSizeKB: 0,
      error: error.message
    };
  }
};

/**
 * Higher-order function to cache API calls
 * 
 * @param {Function} apiCall - API call function to cache
 * @param {string} cacheKey - Cache key
 * @param {number} expirationMs - Cache expiration time in milliseconds
 * @returns {Function} - Wrapped function with caching
 */
export const withCache = (apiCall, cacheKey, expirationMs = DEFAULT_CACHE_EXPIRATION) => {
  return async (...args) => {
    // Try to get data from cache first
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    // If not in cache or expired, make the API call
    const result = await apiCall(...args);
    
    // Cache the result
    cacheData(cacheKey, result, expirationMs);
    
    return result;
  };
}; 