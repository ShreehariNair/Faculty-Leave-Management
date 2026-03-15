/**
 * Analytics Routes — Predictive insights endpoints
 */

const express = require("express");
const router = express.Router();
const {
  getPredictions,
  regeneratePredictions,
  getCacheStats,
  clearCache,
} = require("../controllers/analyticsController");
const { protect, adminOnly } = require("../middleware/auth");

/**
 * GET /api/analytics/predictions
 * Get predictions (system-wide or department-specific)
 * Query params: ?department=CS
 */
router.get("/predictions", protect, getPredictions);

/**
 * POST /api/analytics/regenerate-predictions
 * Force regenerate predictions
 * Admin only
 */
router.post(
  "/regenerate-predictions",
  protect,
  adminOnly,
  regeneratePredictions,
);

/**
 * GET /api/analytics/cache-stats
 * Get cache statistics
 * Admin only
 */
router.get("/cache-stats", protect, adminOnly, getCacheStats);

/**
 * DELETE /api/analytics/clear-cache
 * Clear all cache
 * Admin only
 */
router.delete("/clear-cache", protect, adminOnly, clearCache);

module.exports = router;
