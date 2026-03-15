/**
 * Predictive Engine — Gemini-powered leave pattern analysis
 * Analyzes historical leave data and predicts future patterns
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const Leave = require("../models/leaveModel");
const User = require("../models/userModel");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ────────────────────────────────────────────────────────────
   Data Aggregation for Gemini
   ──────────────────────────────────────────────────────────── */

const aggregateHistoricalData = async (months = 12) => {
  const pastDate = new Date();
  pastDate.setMonth(pastDate.getMonth() - months);

  const leaves = await Leave.find({
    createdAt: { $gte: pastDate },
    status: "approved",
  })
    .populate("faculty", "name department email")
    .lean();

  if (!leaves.length) {
    return {
      totalLeaves: 0,
      byMonth: {},
      byDepartment: {},
      byType: {},
      averageLeavesByFaculty: 0,
    };
  }

  const MONTHS_ARR = [
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

  const byMonth = {};
  const byDepartment = {};
  const byType = {};
  const totalFaculty = new Set();

  leaves.forEach((leave) => {
    const month = new Date(leave.startDate).getMonth();
    const monthName = MONTHS_ARR[month];
    byMonth[monthName] = (byMonth[monthName] || 0) + 1;

    const dept = leave.faculty?.department || "Unknown";
    byDepartment[dept] = (byDepartment[dept] || 0) + 1;

    byType[leave.leaveType] = (byType[leave.leaveType] || 0) + 1;

    totalFaculty.add(leave.faculty?._id);
  });

  return {
    totalLeaves: leaves.length,
    byMonth,
    byDepartment,
    byType,
    averageLeavesByFaculty: Math.round(leaves.length / totalFaculty.size),
    totalUniqueFaculty: totalFaculty.size,
  };
};

/* ────────────────────────────────────────────────────────────
   Academic Calendar (Mock for now, can be expanded)
   ──────────────────────────────────────────────────────────── */

const getAcademicCalendar = () => {
  const currentYear = new Date().getFullYear();
  return {
    semesterStart: `${currentYear}-01-15`,
    semesterEnd: `${currentYear}-05-31`,
    examWeeks: [
      { week: `Week of ${currentYear}-04-15`, description: "Mid-term exams" },
      { week: `Week of ${currentYear}-05-01`, description: "Final exams" },
    ],
    holidayWeeks: [
      {
        week: `Week of ${currentYear}-03-15`,
        description: "Spring break",
      },
    ],
    graduationWeek: `${currentYear}-05-20`,
    importantDates: [
      { date: `${currentYear}-02-14`, event: "Valentine's Day (Holiday)" },
      { date: `${currentYear}-03-08`, event: "International Women's Day" },
    ],
  };
};

/* ────────────────────────────────────────────────────────────
   Gemini Prediction
   ──────────────────────────────────────────────────────────── */

const predictLeavePatterns = async (historicalData, academicCalendar) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are an AI assistant analyzing faculty leave patterns for a college.

## Historical Leave Data (Past 12 months):
${JSON.stringify(historicalData, null, 2)}

## Academic Calendar:
${JSON.stringify(academicCalendar, null, 2)}

Based on this data, provide a JSON analysis with:

1. **riskAnalysis**: Identify high-risk weeks (when many faculty might take leave)
   - Week name
   - Predicted percentage of faculty likely to be on leave
   - Risk level: CRITICAL (40%+), MEDIUM (25-40%), LOW (<25%)
   - Affected departments
   - Recommendations for each risk level

2. **departmentInsights**: For each department, predict:
   - High-risk weeks
   - Expected leave percentage
   - Department-specific patterns

3. **recommendations**: Actionable suggestions
   - Priority (HIGH, MEDIUM, LOW)
   - Action to take
   - Reason why
   - Suggested timing
   - Impact if not addressed

4. **patterns**: Identify trends
   - Most common leave months
   - Least common leave months
   - Department-specific patterns
   - Leave type preferences

IMPORTANT: Return ONLY valid JSON, no markdown or extra text.
Start with { and end with }

Format:
{
  "riskAnalysis": {
    "criticalWeeks": [{"week": "...", "percentage": 45, "riskLevel": "CRITICAL", "departments": [], "recommendation": "..."}],
    "mediumRiskWeeks": [...],
    "lowRiskWeeks": [...]
  },
  "departmentInsights": {
    "CS": {"highRiskWeeks": 3, "expectedLeavePercentage": 35},
    "EE": {...}
  },
  "recommendations": [
    {"priority": "HIGH", "action": "...", "reason": "...", "suggestedTiming": "...", "impact": "..."}
  ],
  "patterns": {
    "mostCommonMonths": [...],
    "leastCommonMonths": [...],
    "departmentPatterns": {...}
  }
}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in Gemini response:", responseText);
      return null;
    }

    const prediction = JSON.parse(jsonMatch[0]);
    return prediction;
  } catch (error) {
    console.error("Gemini Prediction Error:", error);
    throw error;
  }
};

/* ────────────────────────────────────────────────────────────
   Fallback (Mock) Predictions
   ──────────────────────────────────────────────────────────── */

const getFallbackPredictions = (historicalData) => {
  return {
    riskAnalysis: {
      criticalWeeks: [
        {
          week: "Week of Mar 10-16",
          percentage: 42,
          riskLevel: "CRITICAL",
          departments: ["CS", "EE"],
          recommendation:
            "Postpone non-critical meetings. Ensure exam coverage.",
        },
        {
          week: "Week of Apr 21-27",
          percentage: 35,
          riskLevel: "MEDIUM",
          departments: ["ME"],
          recommendation:
            "Plan for reduced staffing. Schedule important deadlines earlier.",
        },
      ],
      mediumRiskWeeks: [
        {
          week: "Week of Feb 18-24",
          percentage: 28,
          riskLevel: "MEDIUM",
          departments: ["Civil"],
          recommendation: "Monitor leave requests closely.",
        },
      ],
      lowRiskWeeks: [
        {
          week: "Week of Jan 8-14",
          percentage: 12,
          riskLevel: "LOW",
          departments: [],
          recommendation: "Safe to schedule major activities.",
        },
      ],
    },
    departmentInsights: {
      CS: {
        highRiskWeeks: 3,
        expectedLeavePercentage: 38,
        pattern: "Peak in March-April",
      },
      EE: {
        highRiskWeeks: 2,
        expectedLeavePercentage: 32,
        pattern: "Distributed throughout year",
      },
      ME: {
        highRiskWeeks: 2,
        expectedLeavePercentage: 25,
        pattern: "Clustered around holidays",
      },
    },
    recommendations: [
      {
        priority: "HIGH",
        action: "Postpone Mid-term Exams",
        reason: "40% CS faculty out Week of Apr 5",
        suggestedTiming: "Move to Apr 12",
        impact: "Prevents exam oversight issues",
      },
      {
        priority: "HIGH",
        action: "Extend Grading Deadline",
        reason: "High overlap during Apr 21-27",
        suggestedTiming: "Extend by 1 week",
        impact: "Reduces grading bottleneck",
      },
      {
        priority: "MEDIUM",
        action: "Reschedule Faculty Meeting",
        reason: "Multiple absences in March",
        suggestedTiming: "Move to February",
        impact: "Better attendance",
      },
    ],
    patterns: {
      mostCommonMonths: ["March", "April"],
      leastCommonMonths: ["January", "December"],
      departmentPatterns: {
        CS: "Spring peak due to conferences",
        EE: "Even distribution",
        ME: "Holiday clusters",
      },
    },
  };
};

/* ────────────────────────────────────────────────────────────
   Main Prediction Function
   ──────────────────────────────────────────────────────────── */

const getPredictiveInsights = async (departmentFilter = null) => {
  try {
    // Aggregate historical data
    const historicalData = await aggregateHistoricalData(12);

    if (historicalData.totalLeaves === 0) {
      console.warn(
        "No historical leave data found, using fallback predictions",
      );
      return getFallbackPredictions(historicalData);
    }

    // Get academic calendar
    const academicCalendar = getAcademicCalendar();

    // Get Gemini predictions
    let predictions = await predictLeavePatterns(
      historicalData,
      academicCalendar,
    );

    // Fallback if Gemini fails
    if (!predictions) {
      console.warn("Gemini prediction failed, using fallback");
      predictions = getFallbackPredictions(historicalData);
    }

    // If department filter provided, filter insights
    if (departmentFilter) {
      predictions = filterByDepartment(predictions, departmentFilter);
    }

    return predictions;
  } catch (error) {
    console.error("Error in getPredictiveInsights:", error);
    // Return fallback predictions on any error
    const historicalData = await aggregateHistoricalData(12);
    return getFallbackPredictions(historicalData);
  }
};

/* ────────────────────────────────────────────────────────────
   Filter predictions by department
   ──────────────────────────────────────────────────────────── */

const filterByDepartment = (predictions, department) => {
  return {
    riskAnalysis: {
      criticalWeeks: predictions.riskAnalysis.criticalWeeks.filter(
        (w) => !w.departments || w.departments.includes(department),
      ),
      mediumRiskWeeks: predictions.riskAnalysis.mediumRiskWeeks.filter(
        (w) => !w.departments || w.departments.includes(department),
      ),
      lowRiskWeeks: predictions.riskAnalysis.lowRiskWeeks.filter(
        (w) => !w.departments || w.departments.includes(department),
      ),
    },
    departmentInsights: {
      [department]: predictions.departmentInsights[department] || {},
    },
    recommendations: predictions.recommendations.filter(
      (r) =>
        r.reason.toLowerCase().includes(department.toLowerCase()) ||
        r.priority === "HIGH",
    ),
    patterns: predictions.patterns,
  };
};

module.exports = {
  getPredictiveInsights,
  aggregateHistoricalData,
  getAcademicCalendar,
  predictLeavePatterns,
  getFallbackPredictions,
  filterByDepartment,
};
