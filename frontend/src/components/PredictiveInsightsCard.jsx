/**
 * Admin Dashboard — Predictive Insights Card
 * System-wide leave pattern analysis
 */

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp,
  Refresh,
  Warning,
  CheckCircle,
  Info,
} from "@mui/icons-material";
import { predictiveService } from "../services/predictiveService";
import InsightsSkeleton from "./InsightsSkeleton";

const PredictiveInsightsCard = () => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await predictiveService.getPredictions();
      setPredictions(response.data);
    } catch (err) {
      console.error("Error fetching predictions:", err);
      setError("Failed to load predictions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await predictiveService.regeneratePredictions();
      setPredictions(response.data);
    } catch (err) {
      console.error("Error regenerating predictions:", err);
      setError("Failed to refresh predictions. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <InsightsSkeleton />;

  if (error)
    return (
      <Alert severity="error" sx={{ mb: 2.5 }}>
        {error}
      </Alert>
    );

  if (!predictions)
    return (
      <Alert severity="info" sx={{ mb: 2.5 }}>
        No prediction data available
      </Alert>
    );

  const { riskAnalysis, recommendations, departmentInsights, patterns } =
    predictions;

  return (
    <Card
      sx={{
        borderRadius: "16px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
        mb: 2.5,
        bgcolor: "#ffffff",
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3.5,
            py: 2.5,
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp sx={{ color: "white", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                📊 Predictive Insights
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                AI-powered leave pattern analysis
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Refresh predictions">
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              size="small"
              sx={{
                bgcolor: "#f3f4f6",
                "&:hover": { bgcolor: "#e5e7eb" },
              }}
            >
              {refreshing ? (
                <CircularProgress size={20} />
              ) : (
                <Refresh sx={{ fontSize: 20 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3.5 }}>
          {/* Risk Analysis Section */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
              }}
            >
              <Warning sx={{ fontSize: 20, color: "#f59e0b" }} />
              <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
                High-Risk Weeks
              </Typography>
              <Chip
                label={riskAnalysis?.criticalWeeks?.length || 0}
                size="small"
                sx={{
                  bgcolor: "#fee2e2",
                  color: "#991b1b",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                }}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {riskAnalysis?.criticalWeeks?.map((week, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 1.5,
                    bgcolor: "#fef9c3",
                    borderRadius: "8px",
                    border: "1px solid #fcd34d",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.8,
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                      {week.week}
                    </Typography>
                    <Chip
                      label={`${week.percentage}%`}
                      size="small"
                      sx={{
                        bgcolor: "#f59e0b",
                        color: "white",
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={week.percentage}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "#fcd34d",
                      mb: 0.8,
                      "& .MuiLinearProgress-bar": {
                        bgcolor: "#f59e0b",
                        borderRadius: 3,
                      },
                    }}
                  />
                  {week.departments && week.departments.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        mb: 0.8,
                        flexWrap: "wrap",
                      }}
                    >
                      {week.departments.map((dept) => (
                        <Chip
                          key={dept}
                          label={dept}
                          size="small"
                          sx={{
                            bgcolor: "#ffffff",
                            color: "#854d0e",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  <Typography sx={{ fontSize: "0.8rem", color: "#854d0e" }}>
                    💡 {week.recommendation}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Recommendations Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Info sx={{ fontSize: 20, color: "#7c3aed" }} />
              <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
                Action Items
              </Typography>
              <Chip
                label={recommendations?.length || 0}
                size="small"
                sx={{
                  bgcolor: "#f0f4ff",
                  color: "#7c3aed",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                }}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {recommendations?.map((rec, idx) => {
                const priorityColor = {
                  HIGH: "#ef4444",
                  MEDIUM: "#f59e0b",
                  LOW: "#10b981",
                };
                return (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      bgcolor: "#f9fafb",
                      borderRadius: "8px",
                      border: `2px solid ${priorityColor[rec.priority] || "#e5e7eb"}`,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 0.8,
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                        {rec.action}
                      </Typography>
                      <Chip
                        label={rec.priority}
                        size="small"
                        sx={{
                          bgcolor: priorityColor[rec.priority],
                          color: "white",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                        }}
                      />
                    </Box>
                    <Typography
                      sx={{ fontSize: "0.8rem", color: "#6b7280", mb: 0.8 }}
                    >
                      📌 {rec.reason}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.8rem", color: "#374151", mb: 0.5 }}
                    >
                      ⏰ <strong>Timing:</strong> {rec.suggestedTiming}
                    </Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: "#374151" }}>
                      💥 <strong>Impact:</strong> {rec.impact}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Department Insights */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <CheckCircle sx={{ fontSize: 20, color: "#10b981" }} />
              <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
                Department Breakdown
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 1.5,
              }}
            >
              {Object.entries(departmentInsights || {}).map(
                ([dept, insights]) => (
                  <Box
                    key={dept}
                    sx={{
                      p: 1.5,
                      bgcolor: "#f0fdf4",
                      borderRadius: "8px",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: 700, fontSize: "0.9rem", mb: 0.5 }}
                    >
                      {dept}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.8,
                      }}
                    >
                      <Typography
                        sx={{ fontSize: "0.8rem", color: "text.secondary" }}
                      >
                        High-risk weeks:
                      </Typography>
                      <Chip
                        label={insights?.highRiskWeeks || 0}
                        size="small"
                        sx={{
                          bgcolor: "#dcfce7",
                          color: "#166534",
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{ fontSize: "0.8rem", color: "text.secondary" }}
                      >
                        Leave %:
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={insights?.expectedLeavePercentage || 0}
                        sx={{
                          flex: 1,
                          ml: 1,
                          height: 4,
                          borderRadius: 2,
                          bgcolor: "#e5e7eb",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: "#10b981",
                            borderRadius: 2,
                          },
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          ml: 1,
                          color: "#10b981",
                        }}
                      >
                        {insights?.expectedLeavePercentage || 0}%
                      </Typography>
                    </Box>
                  </Box>
                ),
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PredictiveInsightsCard;
