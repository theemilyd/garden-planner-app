/**
 * Enhanced in-memory cache service for API responses
 * Reduces duplicate API calls and handles temporary outages
 * With persistent backup for critical data
 */

const fs = require('fs');
const path = require('path');

class CacheService {
  constructor() {
    this.cache = {};
    this.persistentCachePath = path.join(__dirname, '../data/cache-backup');
    
    // Ensure cache backup directory exists
    if (!fs.existsSync(this.persistentCachePath)) {
      try {
        fs.mkdirSync(this.persistentCachePath, { recursive: true });
      } catch (error) {
        console.error('Failed to create cache backup directory:', error);
      }
    }
    
    // Try to restore critical cache items from disk
    this.restorePersistentCache();
    
    // Clean cache entries periodically
    setInterval(() => this.cleanExpiredEntries(), 1000 * 60 * 60); // Every hour
    
    // Backup critical cache items periodically
    setInterval(() => this.backupPersistentCache(), 1000 * 60 * 60 * 12); // Every 12 hours
  }
  
  /**
   * Get an item from the cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(key) {
    const entry = this.cache[key];
    
    if (!entry) {
      // Try to get from persistent backup for critical items
      return this.getFromPersistentCache(key);
    }
    
    // Check if entry has expired
    if (entry.expires < Date.now()) {
      delete this.cache[key];
      return null;
    }
    
    return entry.value;
  }
  
  /**
   * Set an item in the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlSeconds - Time to live in seconds
   * @param {boolean} persistent - Whether to back up to disk (for critical items)
   */
  set(key, value, ttlSeconds, persistent = false) {
    const expires = Date.now() + (ttlSeconds * 1000);
    
    this.cache[key] = {
      value,
      expires,
      persistent
    };
    
    // Save to persistent cache if marked as critical
    if (persistent) {
      this.saveToPersistentCache(key);
    }
  }
  
  /**
   * Remove an item from the cache
   * @param {string} key - Cache key
   */
  remove(key) {
    delete this.cache[key];
    
    // Remove from persistent cache if exists
    this.removeFromPersistentCache(key);
  }
  
  /**
   * Clean expired entries from the cache
   */
  cleanExpiredEntries() {
    const now = Date.now();
    
    Object.keys(this.cache).forEach(key => {
      if (this.cache[key].expires < now) {
        delete this.cache[key];
      }
    });
  }
  
  /**
   * Get stats about the cache
   * @returns {Object} Cache statistics
   */
  getStats() {
    const now = Date.now();
    let active = 0;
    let expired = 0;
    let persistent = 0;
    
    Object.values(this.cache).forEach(entry => {
      if (entry.expires > now) {
        active++;
        if (entry.persistent) {
          persistent++;
        }
      } else {
        expired++;
      }
    });
    
    return {
      total: Object.keys(this.cache).length,
      active,
      expired,
      persistent
    };
  }
  
  /**
   * Save an item to persistent cache
   * @param {string} key - Cache key
   * @private
   */
  saveToPersistentCache(key) {
    if (!this.cache[key] || !this.cache[key].persistent) {
      return;
    }
    
    try {
      const cacheFile = path.join(this.persistentCachePath, `${key.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`);
      fs.writeFileSync(cacheFile, JSON.stringify({
        value: this.cache[key].value,
        expires: this.cache[key].expires
      }));
    } catch (error) {
      console.error(`Failed to save cache item ${key} to disk:`, error);
    }
  }
  
  /**
   * Get an item from persistent cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   * @private
   */
  getFromPersistentCache(key) {
    try {
      const cacheFile = path.join(this.persistentCachePath, `${key.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`);
      
      if (!fs.existsSync(cacheFile)) {
        return null;
      }
      
      const data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      
      // Check if entry has expired
      if (data.expires < Date.now()) {
        fs.unlinkSync(cacheFile);
        return null;
      }
      
      // Restore to memory cache and return
      this.cache[key] = {
        value: data.value,
        expires: data.expires,
        persistent: true
      };
      
      return data.value;
    } catch (error) {
      console.error(`Failed to get cache item ${key} from disk:`, error);
      return null;
    }
  }
  
  /**
   * Remove an item from persistent cache
   * @param {string} key - Cache key
   * @private
   */
  removeFromPersistentCache(key) {
    try {
      const cacheFile = path.join(this.persistentCachePath, `${key.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`);
      
      if (fs.existsSync(cacheFile)) {
        fs.unlinkSync(cacheFile);
      }
    } catch (error) {
      console.error(`Failed to remove cache item ${key} from disk:`, error);
    }
  }
  
  /**
   * Backup all persistent cache items to disk
   * @private
   */
  backupPersistentCache() {
    Object.keys(this.cache).forEach(key => {
      if (this.cache[key].persistent) {
        this.saveToPersistentCache(key);
      }
    });
  }
  
  /**
   * Restore persistent cache items from disk at startup
   * @private
   */
  restorePersistentCache() {
    try {
      if (!fs.existsSync(this.persistentCachePath)) {
        return;
      }
      
      const files = fs.readdirSync(this.persistentCachePath);
      
      files.forEach(file => {
        if (file.endsWith('.json')) {
          try {
            const cacheFile = path.join(this.persistentCachePath, file);
            const data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
            
            // Skip expired items
            if (data.expires < Date.now()) {
              fs.unlinkSync(cacheFile);
              return;
            }
            
            // Extract key from filename
            const key = file.replace('.json', '').replace(/_/g, ':');
            
            // Restore to memory cache
            this.cache[key] = {
              value: data.value,
              expires: data.expires,
              persistent: true
            };
          } catch (error) {
            console.error(`Failed to restore cache item ${file}:`, error);
          }
        }
      });
      
      console.log(`Restored ${Object.keys(this.cache).length} cache items from disk`);
    } catch (error) {
      console.error('Failed to restore persistent cache:', error);
    }
  }
}

// Export singleton instance
module.exports = new CacheService();