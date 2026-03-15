/**
 * HOD Dashboard — Department-Specific Predictive Card
 * Departmental leave pattern analysis
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
} from "@mui/material";
import { TrendingUp, Refresh, AlertTriangle } from "@mui/icons-material";
import { useAuth } from "../context/authContext";
import { predictiveService } from "../services/predictiveService";
import InsightsSkeleton from "./InsightsSkeleton";

const DepartmentPredictiveCard = () => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.department) {
      fetchPredictions();
    }
  }, [user?.department]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await predictiveService.getPredictions(user?.department);
      setPredictions(response.data);
    } catch (err) {
      console.error("Error fetching predictions:", err);
      setError("Failed to load department predictions.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await predictiveService.regeneratePredictions(
        user?.department,
      );
      setPredictions(response.data);
    } catch (err) {
      console.error("Error regenerating predictions:", err);
      setError("Failed to refresh predictions.");
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
        No prediction data available for {user?.department}
      </Alert>
    );

  const { riskAnalysis, recommendations, departmentInsights } = predictions;
  const deptInsight = departmentInsights?.[user?.department] || {};

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
            background: "linear-gradient(135deg, #f59e0b15, #f5970015)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
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
                📈 {user?.department} Insights
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                Department-specific predictions
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Refresh">
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              size="small"
              sx={{
                bgcolor: "#fef9c3",
                "&:hover": { bgcolor: "#fcd34d" },
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
          {/* Department Summary */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mb: 2.5,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                bgcolor: "#fef9c3",
                borderRadius: "8px",
                border: "1px solid #fcd34d",
              }}
            >
              <Typography
                sx={{ fontSize: "0.8rem", color: "#854d0e", mb: 0.5 }}
              >
                High-Risk Weeks
              </Typography>
              <Typography
                sx={{ fontSize: "1.5rem", fontWeight: 900, color: "#d97706" }}
              >
                {deptInsight?.highRiskWeeks || 0}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.5,
                bgcolor: "#dbeafe",
                borderRadius: "8px",
                border: "1px solid #93c5fd",
              }}
            >
              <Typography
                sx={{ fontSize: "0.8rem", color: "#1e40af", mb: 0.5 }}
              >
                Expected Leave %
              </Typography>
              <Typography
                sx={{ fontSize: "1.5rem", fontWeight: 900, color: "#1e40af" }}
              >
                {deptInsight?.expectedLeavePercentage || 0}%
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Risk Breakdown */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <AlertTriangle sx={{ fontSize: 20, color: "#f59e0b" }} />
              <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
                Upcoming Risks
              </Typography>
            </Box>

            {riskAnalysis?.criticalWeeks &&
            riskAnalysis.criticalWeeks.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {riskAnalysis.criticalWeeks.slice(0, 3).map((week, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.2,
                      bgcolor: "#fef9c3",
                      borderRadius: "8px",
                      borderLeft: "4px solid #f59e0b",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
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
                          fontSize: "0.7rem",
                        }}
                      />
                    </Box>
                    <Typography sx={{ fontSize: "0.8rem", color: "#854d0e" }}>
                      {week.recommendation}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Alert severity="success">✅ No high-risk weeks predicted</Alert>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Quick Tips */}
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", mb: 1 }}>
              💡 Quick Tips
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {recommendations?.slice(0, 2).map((rec, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 1.2,
                    bgcolor: "#f0f4ff",
                    borderRadius: "8px",
                    borderLeft: "4px solid #7c3aed",
                  }}
                >
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {rec.action}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.8rem", color: "#6b7280", mt: 0.3 }}
                  >
                    {rec.reason}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DepartmentPredictiveCard;
