/**
 * AI Engine — updated for Pillai College leave types
 */

const PILLAI_LEAVE_TYPES = [
  "casual",
  "medical",
  "earned",
  "compensatory",
  "onDuty",
  "special",
  "leaveWithoutPay",
];

const predictLeaveRisk = (leaveHistory) => {
  if (!leaveHistory?.length) return 0;
  const currentMonth = new Date().getMonth();
  const sameMonthLeaves = leaveHistory.filter(
    (l) => new Date(l.startDate).getMonth() === currentMonth,
  );
  return Math.round(
    Math.min(100, (sameMonthLeaves.length / leaveHistory.length) * 100),
  );
};

const mongoose = require("mongoose");

const getLeaveModel = () => mongoose.models.Leave || mongoose.model("Leave");

const suggestSubstitutes = async (availableFaculty, requestingFaculty) => {
  const Leave = getLeaveModel();
  
  // Predict current substitute workload to balance load amongst faculty
  const now = new Date();
  const futureLeaves = await Leave.find({
    substituteAssigned: { $in: availableFaculty.map(f => f._id) },
    status: { $in: ['pending', 'hod_approved', 'approved'] },
    endDate: { $gte: now }
  });

  const substituteLoadMap = {};
  futureLeaves.forEach(l => {
    if (!l.substituteAssigned) return;
    const subId = l.substituteAssigned.toString();
    substituteLoadMap[subId] = (substituteLoadMap[subId] || 0) + (l.totalDays || 1);
  });

  const scoredCandidates = availableFaculty
    .filter((f) => f._id.toString() !== requestingFaculty._id.toString())
    .map((faculty) => {
      let score = 0;
      
      // 1. Department match
      if (faculty.department === requestingFaculty.department) score += 50;
      
      // 2. Availability priority
      if (faculty.isAvailable) score += 30;
      
      // 3. Subject expertise match
      const commonSubjects = (faculty.subjects || []).filter((s) =>
        (requestingFaculty.subjects || []).includes(s),
      );
      score += commonSubjects.length * 20;

      // 4. Designation match (Prefer peers covering for each other)
      if (faculty.designation && requestingFaculty.designation && faculty.designation === requestingFaculty.designation) {
        score += 15;
      }

      // 5. Workload balancing (Penalize heavily if they already have substitute duties)
      const currentLoad = substituteLoadMap[faculty._id.toString()] || 0;
      score -= (currentLoad * 10); 
      
      return { faculty, score };
    });

  // Sort primarily by score descending, then randomly to distribute load among equals
  return scoredCandidates
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return Math.random() - 0.5; // randomize tie-breakers
    })
    .slice(0, 3)
    .map((i) => i.faculty);
};

const analyzeWorkloadImpact = (leaves, department) => {
  const deptLeaves = leaves.filter(
    (l) =>
      l.faculty?.department === department &&
      l.status === "approved" &&
      new Date(l.endDate) >= new Date(),
  );
  const impact = deptLeaves.length;
  let level = "low",
    suggestion = "No immediate adjustments needed.";
  if (impact >= 3) {
    level = "high";
    suggestion =
      "High leave overlap detected. Consider rescheduling non-critical sessions.";
  } else if (impact >= 2) {
    level = "medium";
    suggestion = "Moderate leave overlap. Prepare backup schedules.";
  }
  return { level, suggestion, activeLeaves: impact };
};

const detectAnomalies = (leaveHistory) => {
  const alerts = [];
  const monthCounts = Array(12).fill(0);
  leaveHistory.forEach((l) => {
    monthCounts[new Date(l.startDate).getMonth()]++;
  });
  const nonZero = monthCounts.filter((c) => c > 0);
  const avg = nonZero.length
    ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length
    : 1;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  monthCounts.forEach((count, idx) => {
    if (count > avg * 2 && count > 2)
      alerts.push(`High leave frequency in ${months[idx]} (${count} leaves)`);
  });

  /* Pillai-specific: flag excessive LWP */
  const lwpCount = leaveHistory.filter(
    (l) => l.leaveType === "leaveWithoutPay",
  ).length;
  if (lwpCount >= 3)
    alerts.push(
      `${lwpCount} Leave Without Pay instances detected — may affect salary.`,
    );

  /* Flag SP usage */
  const spCount = leaveHistory.filter((l) => l.leaveType === "special").length;
  if (spCount >= 2)
    alerts.push(`${spCount} Special Leave instances — no salary applicable.`);

  return alerts;
};

const generateRecommendations = (faculty, leaveHistory, currentLeaves) => {
  const recommendations = [];
  const riskScore = predictLeaveRisk(leaveHistory);

  if (riskScore > 60)
    recommendations.push({
      type: "warning",
      message: `High leave risk (${riskScore}%). Plan substitutes in advance.`,
    });

  const pendingCount = currentLeaves.filter(
    (l) => l.status === "pending",
  ).length;
  if (pendingCount > 2)
    recommendations.push({
      type: "info",
      message: `${pendingCount} leave requests pending HOD/Principal approval.`,
    });

  const now = new Date();
  const monthlyUsage = leaveHistory.filter((l) => {
    const d = new Date(l.startDate);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;
  if (monthlyUsage >= 3)
    recommendations.push({
      type: "alert",
      message: "Frequent leaves this month may impact academic continuity.",
    });

  /* Check if any leaves lack advance notice */
  const lwpRisk = leaveHistory.filter((l) => l.treatAsLWP).length;
  if (lwpRisk > 0)
    recommendations.push({
      type: "warning",
      message: `${lwpRisk} leave(s) were treated as LWP due to insufficient advance notice.`,
    });

  return recommendations;
};

module.exports = {
  predictLeaveRisk,
  suggestSubstitutes,
  analyzeWorkloadImpact,
  detectAnomalies,
  generateRecommendations,
  PILLAI_LEAVE_TYPES,
};
