/**
 * Insights Skeleton — Loading state component
 */

import React from "react";
import { Card, CardContent, Box, Skeleton } from "@mui/material";

const InsightsSkeleton = () => {
  return (
    <Card
      sx={{
        borderRadius: "16px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
        mb: 2.5,
      }}
    >
      <CardContent sx={{ p: 3.5 }}>
        {/* Header Skeleton */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
        </Box>

        {/* Content Skeleton */}
        {[1, 2, 3].map((i) => (
          <Box key={i} sx={{ mb: 3 }}>
            <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={80}
              sx={{ borderRadius: "8px", mb: 1 }}
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={80}
              sx={{ borderRadius: "8px" }}
            />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default InsightsSkeleton;
