/**
 * Analytics Controller — Handles predictive insights endpoints
 */

const { getPredictiveInsights } = require("../utils/predictiveEngine");
const cacheService = require("../utils/cacheService");

/**
 * GET /api/analytics/predictions
 * Get system-wide or department-specific predictions
 */
exports.getPredictions = async (req, res) => {
  try {
    const { department } = req.query;

    // Generate cache key
    const cacheKey = department
      ? `predictions_${department}`
      : "predictions_system";

    // Check cache first
    const cachedPredictions = cacheService.get(cacheKey);
    if (cachedPredictions) {
      return res.status(200).json({
        success: true,
        data: cachedPredictions,
        source: "cache",
        cachedAt: new Date(Date.now() - 24 * 60 * 1000), // Approximate
      });
    }

    // Get fresh predictions from Gemini
    const predictions = await getPredictiveInsights(department);

    // Cache for 24 hours
    cacheService.set(cacheKey, predictions, 1440);

    return res.status(200).json({
      success: true,
      data: predictions,
      source: "fresh",
      cachedAt: new Date(),
    });
  } catch (error) {
    console.error("Error in getPredictions:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching predictions",
      error: error.message,
    });
  }
};

/**
 * POST /api/analytics/regenerate-predictions
 * Force regenerate predictions (clear cache and fetch fresh)
 * Admin only
 */
exports.regeneratePredictions = async (req, res) => {
  try {
    const { department } = req.body;

    // Clear cache
    const cacheKey = department
      ? `predictions_${department}`
      : "predictions_system";
    cacheService.clear(cacheKey);

    // Get fresh predictions
    const predictions = await getPredictiveInsights(department);

    // Cache for 24 hours
    cacheService.set(cacheKey, predictions, 1440);

    return res.status(200).json({
      success: true,
      message: "Predictions regenerated successfully",
      data: predictions,
      cachedAt: new Date(),
    });
  } catch (error) {
    console.error("Error in regeneratePredictions:", error);
    return res.status(500).json({
      success: false,
      message: "Error regenerating predictions",
      error: error.message,
    });
  }
};

/**
 * GET /api/analytics/cache-stats
 * Get cache statistics (Admin only)
 */
exports.getCacheStats = async (req, res) => {
  try {
    const stats = cacheService.getStats();
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error in getCacheStats:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching cache stats",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/analytics/clear-cache
 * Clear all cache (Admin only)
 */
exports.clearCache = async (req, res) => {
  try {
    cacheService.clearAll();
    return res.status(200).json({
      success: true,
      message: "Cache cleared successfully",
    });
  } catch (error) {
    console.error("Error in clearCache:", error);
    return res.status(500).json({
      success: false,
      message: "Error clearing cache",
      error: error.message,
    });
  }
};
