/**
 * Cache Service — In-memory cache with TTL
 * Simple, lightweight caching for predictive insights
 */

class CacheService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Set cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlMinutes - Time to live in minutes (default: 1440 = 24 hours)
   */
  set(key, value, ttlMinutes = 1440) {
    const expiryTime = Date.now() + ttlMinutes * 60 * 1000;
    this.cache.set(key, {
      value,
      expiry: expiryTime,
    });
  }

  /**
   * Get value from cache if not expired
   * @param {string} key - Cache key
   * @returns {any|null}
   */
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const cached = this.cache.get(key);
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    if (!this.cache.has(key)) {
      return false;
    }

    const cached = this.cache.get(key);
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear specific cache entry
   * @param {string} key - Cache key
   */
  clear(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAll() {
    this.cache.clear();
  }

  /**
   * Get cache stats
   * @returns {object}
   */
  getStats() {
    let validKeys = 0;
    let expiredKeys = 0;

    for (const [key, cached] of this.cache) {
      if (Date.now() > cached.expiry) {
        expiredKeys++;
      } else {
        validKeys++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries: validKeys,
      expiredEntries: expiredKeys,
    };
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
