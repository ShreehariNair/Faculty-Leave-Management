/**
 * Predictive Service — API client for analytics endpoints
 */

import API from "../api/axiosInstance";

export const predictiveService = {
  /**
   * Fetch predictions (system-wide or department-specific)
   */
  async getPredictions(department = null) {
    try {
      const params = department ? { department } : {};
      const response = await API.get("/analytics/predictions", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching predictions:", error);
      throw error;
    }
  },

  /**
   * Regenerate predictions (force refresh, admin only)
   */
  async regeneratePredictions(department = null) {
    try {
      const response = await API.post("/analytics/regenerate-predictions", {
        department,
      });
      return response.data;
    } catch (error) {
      console.error("Error regenerating predictions:", error);
      throw error;
    }
  },

  /**
   * Get cache statistics (admin only)
   */
  async getCacheStats() {
    try {
      const response = await API.get("/analytics/cache-stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching cache stats:", error);
      throw error;
    }
  },

  /**
   * Clear all cache (admin only)
   */
  async clearCache() {
    try {
      const response = await API.delete("/analytics/clear-cache");
      return response.data;
    } catch (error) {
      console.error("Error clearing cache:", error);
      throw error;
    }
  },
};
