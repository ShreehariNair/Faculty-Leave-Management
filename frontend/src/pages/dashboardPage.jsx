import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  LinearProgress,
  InputBase,
} from "@mui/material";
import {
  ArrowUpward,
  ArrowDownward,
  EventNote,
  Search,
  FilterList,
  AutoAwesome,
  KeyboardArrowRight,
  CheckCircle,
} from "@mui/icons-material";
import { useAuth } from "../context/authContext";
import API, { getAvatarUrl } from "../api/axiosInstance";

const MONTHS = [
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

const leaveTypeEmoji = {
  casual: "🏖",
  medical: "🏥",
  earned: "⭐",
  compensatory: "🔄",
  onDuty: "🏛️",
  special: "📋",
  leaveWithoutPay: "⏸️",
};
const leaveTypeColor = {
  casual: "#7c3aed",
  medical: "#ef4444",
  earned: "#10b981",
  compensatory: "#0891b2",
  onDuty: "#8b5cf6",
  special: "#f59e0b",
  leaveWithoutPay: "#64748b",
};
const statusBadge = (status) =>
  ({
    pending: { label: "Pending", bg: "#fef9c3", color: "#854d0e" },
    hod_approved: { label: "HOD Approved", bg: "#dbeafe", color: "#1e40af" },
    approved: { label: "Approved", bg: "#dcfce7", color: "#166534" },
    rejected: { label: "Rejected", bg: "#fee2e2", color: "#991b1b" },
    cancelled: { label: "Cancelled", bg: "#f1f5f9", color: "#475569" },
  })[status] || { label: status, bg: "#f1f5f9", color: "#64748b" };

/* ── College Staff ID Card ───────────────────────────────── */
const CollegeStaffIDCard = ({ user }) => {
  const employeeId = user?._id?.slice(-8).toUpperCase() || "00000000";
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "FA";
  const avatarUrl = getAvatarUrl(user?.avatar);

  /*
    SVG viewBox = 300 × 630
    Inner white card: x=30, y=90, w=238.4, h=495
    As percentages of viewBox:
      left   = 30/300    = 10%
      top    = 90/630    = 14.29%
      width  = 238.4/300 = 79.47%
      height = 495/630   = 78.57%
  */

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      {/* ── SVG shell ── */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 300 630"
        width="100%"
        style={{ display: "block" }}
      >
        <defs>
          <filter
            id="card-shadow2"
            x="-10%"
            y="-10%"
            width="130%"
            height="130%"
          >
            <feDropShadow
              dx="0"
              dy="10"
              stdDeviation="15"
              floodColor="#000000"
              floodOpacity="0.2"
            />
          </filter>
          <linearGradient
            id="lanyard-gradient2"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ff66b3" />
            <stop offset="100%" stopColor="#ff99cc" />
          </linearGradient>
          <linearGradient id="card-surface2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f0f2f5" />
          </linearGradient>
        </defs>

        <g filter="url(#card-shadow2)">
          <path
            d="
            M 35,80
            L 75,80
            L 90,50
            L 208.4,50
            L 223.4,80
            L 263.4,80
            A 15,15 0 0 1 278.4,95
            L 278.4,575
            A 25,25 0 0 1 253.4,600
            L 45,600
            A 25,25 0 0 1 20,575
            L 20,95
            A 15,15 0 0 1 35,80 Z
          "
            fill="#202124"
          />
          <rect x="114.2" y="60" width="70" height="10" rx="5" fill="#ffffff" />
          <rect
            x="30"
            y="90"
            width="238.4"
            height="495"
            rx="8"
            fill="url(#card-surface2)"
          />
          <rect x="15" y="280" width="25" height="120" rx="4" fill="#202124" />
          <rect
            x="258.4"
            y="280"
            width="25"
            height="120"
            rx="4"
            fill="#202124"
          />
          <rect x="15" y="570" width="20" height="15" rx="3" fill="#202124" />
          <rect
            x="263.4"
            y="570"
            width="20"
            height="15"
            rx="3"
            fill="#202124"
          />
        </g>

        <path
          d="M 124.2,0 L 174.2,0 L 174.2,55 L 124.2,55 Z"
          fill="url(#lanyard-gradient2)"
        />
        <circle
          cx="149.2"
          cy="25"
          r="6"
          fill="#e0e0e0"
          stroke="#a0a0a0"
          strokeWidth="1"
        />
        <circle cx="149.2" cy="25" r="3" fill="#c0c0c0" />
        <rect x="134.2" y="45" width="30" height="25" rx="4" fill="#111111" />
      </svg>

      {/* ── Content overlay ── */}
      <Box
        sx={{
          position: "absolute",
          top: "14.29%",
          left: "10%",
          width: "79.47%",
          height: "78.57%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: "8px",
        }}
      >
        {/* PHOTO — top 56% */}
        <Box
          sx={{
            flex: "0 0 56%",
            bgcolor: "#e8eaed",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {avatarUrl ? (
            <Box
              component="img"
              src={avatarUrl}
              alt="Profile"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top center",
              }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(160deg, #e8d5f5 0%, #d5e8f5 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "clamp(2.4rem, 10vw, 4rem)",
                  fontWeight: 900,
                  color: "#7c3aed",
                  letterSpacing: 3,
                }}
              >
                {initials}
              </Typography>
            </Box>
          )}
        </Box>

        {/* NAME STRIP — dark band */}
        <Box
          sx={{
            bgcolor: "#202124",
            px: 1.5,
            py: 0.85,
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              color: "white",
              fontWeight: 900,
              fontSize: "clamp(0.7rem, 3.5vw, 1rem)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user?.name || "Faculty Member"}
          </Typography>
        </Box>

        {/* INFO SECTION — white */}
        <Box
          sx={{
            flex: 1,
            bgcolor: "white",
            px: 1.5,
            pt: 1,
            pb: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Designation + Department */}
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "clamp(0.6rem, 2.4vw, 0.8rem)",
                color: "#0f172a",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.designation ||
                (user?.role
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  : "Faculty")}
            </Typography>
            <Typography
              sx={{
                fontSize: "clamp(0.54rem, 2vw, 0.72rem)",
                color: "#334155",
                mt: 0.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.department}
            </Typography>
          </Box>

          {/* Footer: website + barcode + ref */}
          <Box>
            <Divider sx={{ borderColor: "#e2e8f0", mb: 0.6 }} />
            <Typography
              sx={{
                fontSize: "clamp(0.42rem, 1.6vw, 0.58rem)",
                color: "#94a3b8",
                mb: 0.5,
              }}
            >
              faculty.leaveai.edu
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 0.5,
              }}
            >
              {/* CSS barcode */}
              <Box
                sx={{
                  flex: 1,
                  height: 36,
                  backgroundImage:
                    "repeating-linear-gradient(to right, #111 0px, #111 1.5px, #fff 1.5px, #fff 3px, #111 3px, #111 5px, #fff 5px, #fff 6px, #111 6px, #111 7px, #fff 7px, #fff 9px, #111 9px, #111 10px, #fff 10px, #fff 12px)",
                  flexShrink: 1,
                }}
              />
              {/* Ref */}
              <Box sx={{ flexShrink: 0, textAlign: "right", ml: 0.5 }}>
                <Typography
                  sx={{
                    fontSize: "clamp(0.42rem, 1.6vw, 0.58rem)",
                    fontWeight: 700,
                    color: "#111",
                    fontFamily: "monospace",
                    display: "block",
                    lineHeight: 1.5,
                    letterSpacing: "0.04em",
                  }}
                >
                  {initials}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "clamp(0.42rem, 1.6vw, 0.58rem)",
                    fontWeight: 700,
                    color: "#111",
                    fontFamily: "monospace",
                    letterSpacing: "0.04em",
                  }}
                >
                  {employeeId}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/* ── Mini bar chart ──────────────────────────────────────── */
const MiniBarChart = ({ data, barColor, accentColor }) => {
  const max = Math.max(...data, 1);
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        gap: "3px",
        height: 72,
        mt: 1.5,
      }}
    >
      {data.map((v, i) => {
        const isHighest = v === Math.max(...data) && v > 0;
        return (
          <Box
            key={i}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
            }}
          >
            {isHighest && (
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  color: "text.primary",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {v}
              </Typography>
            )}
            <Box
              sx={{
                width: "100%",
                height: `${Math.max((v / max) * 52, v > 0 ? 6 : 3)}px`,
                borderRadius: "2px 2px 0 0",
                bgcolor: isHighest ? accentColor : barColor,
                transition: "height 0.3s",
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
};

/* ── Faculty quick-select row ────────────────────────────── */
const FacultyRow = ({ users }) => {
  const colors = ["#7c3aed", "#0891b2", "#059669", "#d97706", "#dc2626"];
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        overflowX: "auto",
        "&::-webkit-scrollbar": { height: 0 },
      }}
    >
      {users.slice(0, 6).map((u, i) => (
        <Box
          key={u._id}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.5,
            flexShrink: 0,
          }}
        >
          <Avatar
            src={getAvatarUrl(u?.avatar) || undefined}
            sx={{
              width: 42,
              height: 42,
              fontSize: 14,
              fontWeight: 700,
              background: getAvatarUrl(u?.avatar)
                ? "none"
                : `linear-gradient(135deg, ${colors[i % 5]}, ${colors[(i + 1) % 5]})`,
              cursor: "pointer",
              transition: "transform 0.15s",
              "&:hover": { transform: "scale(1.06)" },
            }}
          >
            {!getAvatarUrl(u?.avatar) && u.name?.charAt(0)}
          </Avatar>
          <Typography
            sx={{
              fontSize: "0.68rem",
              fontWeight: 600,
              color: "text.primary",
              whiteSpace: "nowrap",
            }}
          >
            {u.name?.split(" ")[0]}
          </Typography>
          <Typography sx={{ fontSize: "0.62rem", color: "text.disabled" }}>
            {u.department?.split(" ")[0]}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

/* ── Main Dashboard ──────────────────────────────────────── */
const DashboardPage = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTx, setSearchTx] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await API.get("/leaves");
      setLeaves(data);
    };

    fetchData();

    const handler = () => fetchData();
    window.addEventListener("leaves:changed", handler);
    return () => window.removeEventListener("leaves:changed", handler);
  }, []);

  useEffect(() => {
    Promise.all([
      API.get("/leaves"),
      API.get("/leaves/balance"),
      API.get("/users"),
    ])
      .then(([l, b, u]) => {
        setLeaves(l.data);
        setBalance(b.data);
        setAllUsers(u.data.filter((u2) => u2._id !== user?._id));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="70vh"
      >
        <CircularProgress sx={{ color: "#7c3aed" }} />
      </Box>
    );

  const monthlyApproved = MONTHS.map(
    (_, mi) =>
      leaves.filter(
        (l) =>
          l.status === "approved" && new Date(l.startDate).getMonth() === mi,
      ).length,
  );
  const monthlyPending = MONTHS.map(
    (_, mi) =>
      leaves.filter(
        (l) =>
          l.status === "pending" && new Date(l.startDate).getMonth() === mi,
      ).length,
  );

  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "pending").length,
    approved: leaves.filter((l) => l.status === "approved").length,
    rejected: leaves.filter((l) => l.status === "rejected").length,
    totalDaysUsed: leaves
      .filter((l) => l.status === "approved")
      .reduce((s, l) => s + (l.totalDays || 0), 0),
  };

  const filteredLeaves = leaves.filter(
    (l) =>
      !searchTx ||
      l.faculty?.name?.toLowerCase().includes(searchTx.toLowerCase()) ||
      l.leaveType?.toLowerCase().includes(searchTx.toLowerCase()) ||
      l.reason?.toLowerCase().includes(searchTx.toLowerCase()),
  );

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2.5,
        minHeight: "100%",
        alignItems: "flex-start",
      }}
    >
      {/* ── Main column ───────────────────────────────── */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontSize: "0.7rem",
            }}
          >
            Total Leave Days Used This Year
          </Typography>
          <Box
            sx={{ display: "flex", alignItems: "flex-end", gap: 2, mt: 0.4 }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: "text.primary",
                letterSpacing: "-1px",
                lineHeight: 1,
              }}
            >
              {stats.totalDaysUsed}
              <Typography
                component="span"
                sx={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "text.secondary",
                  ml: 0.8,
                }}
              >
                days
              </Typography>
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
            {[
              {
                label: "Approved",
                icon: <ArrowUpward sx={{ fontSize: 11 }} />,
                color: "#059669",
                bg: "#ecfdf5",
                count: stats.approved,
              },
              {
                label: "Pending",
                icon: <ArrowDownward sx={{ fontSize: 11 }} />,
                color: "#d97706",
                bg: "#fffbeb",
                count: stats.pending,
              },
              {
                label: "Total Applied",
                icon: <EventNote sx={{ fontSize: 11 }} />,
                color: "#7c3aed",
                bg: "#f5f3ff",
                count: stats.total,
              },
            ].map((a) => (
              <Chip
                key={a.label}
                icon={a.icon}
                label={`${a.count} ${a.label}`}
                size="small"
                sx={{
                  bgcolor: a.bg,
                  color: a.color,
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  border: `1px solid ${a.color}20`,
                  borderRadius: "8px",
                  "& .MuiChip-icon": { color: a.color },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Available substitutes */}
        {allUsers.filter((u) => u.isAvailable).length > 0 && (
          <Card sx={{ mb: 2.5, borderRadius: "8px" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontSize: "0.67rem",
                  display: "block",
                  mb: 1.5,
                }}
              >
                Available Substitutes
              </Typography>
              <FacultyRow users={allUsers.filter((u) => u.isAvailable)} />
            </CardContent>
          </Card>
        )}

        {/* Mini charts */}
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          {[
            {
              title: "Approved Leaves",
              count: stats.approved,
              data: monthlyApproved,
              bar: "#bbf7d0",
              accent: "#16a34a",
              chipLabel: "Approved",
              chipSx: { bgcolor: "#dcfce7", color: "#166534" },
            },
            {
              title: "Pending Leaves",
              count: stats.pending,
              data: monthlyPending,
              bar: "#fef08a",
              accent: "#ca8a04",
              chipLabel: "Need Review",
              chipSx: { bgcolor: "#fef9c3", color: "#854d0e" },
            },
          ].map((item) => (
            <Grid item xs={12} sm={6} key={item.title}>
              <Card sx={{ borderRadius: "8px" }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      {item.title}
                    </Typography>
                    <Chip
                      label="This Year"
                      size="small"
                      sx={{
                        bgcolor: "background.default",
                        color: "text.secondary",
                        fontSize: "0.67rem",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "8px",
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 800, color: "text.primary" }}
                    >
                      {item.count}
                    </Typography>
                    <Chip
                      size="small"
                      label={item.chipLabel}
                      sx={{
                        ...item.chipSx,
                        fontWeight: 700,
                        fontSize: "0.67rem",
                        height: 20,
                        borderRadius: "8px",
                      }}
                    />
                  </Box>
                  <MiniBarChart
                    data={item.data}
                    barColor={item.bar}
                    accentColor={item.accent}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 0.5,
                    }}
                  >
                    {[
                      "J",
                      "F",
                      "M",
                      "A",
                      "M",
                      "J",
                      "J",
                      "A",
                      "S",
                      "O",
                      "N",
                      "D",
                    ].map((m, i) => (
                      <Typography
                        key={i}
                        sx={{ fontSize: "0.55rem", color: "text.disabled" }}
                      >
                        {m}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Leave history table */}
        <Card sx={{ borderRadius: "8px" }}>
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                px: 2.5,
                py: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "text.primary" }}
              >
                Leave History
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "background.default",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "8px",
                    px: 1.2,
                    py: 0.5,
                    "&:focus-within": { borderColor: "#c4b5fd" },
                  }}
                >
                  <Search
                    sx={{ color: "text.disabled", fontSize: 14, mr: 0.5 }}
                  />
                  <InputBase
                    placeholder="Search leave..."
                    value={searchTx}
                    onChange={(e) => setSearchTx(e.target.value)}
                    sx={{
                      fontSize: "0.8rem",
                      width: 130,
                      color: "text.primary",
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1.2,
                    py: 0.5,
                    bgcolor: "background.default",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "8px",
                    cursor: "pointer",
                    "&:hover": { borderColor: "#c4b5fd" },
                  }}
                >
                  <FilterList sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: "text.secondary" }}
                  >
                    Filter
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "background.default" }}>
                  <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                    <Checkbox size="small" sx={{ color: "text.disabled" }} />
                  </TableCell>
                  {[
                    "ID",
                    "Leave Type",
                    "Date Applied",
                    "Duration",
                    "Status",
                  ].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        color: "text.disabled",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        py: 1.2,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {h.toUpperCase()}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLeaves.slice(0, 7).map((leave) => {
                  const badge = statusBadge(leave.status);
                  const lColor = leaveTypeColor[leave.leaveType] || "#7c3aed";
                  const emoji = leaveTypeEmoji[leave.leaveType] || "📋";
                  return (
                    <TableRow
                      key={leave._id}
                      hover
                      sx={{
                        "&:hover": { bgcolor: "rgba(124,58,237,0.025)" },
                        cursor: "pointer",
                      }}
                    >
                      <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                        <Checkbox
                          size="small"
                          sx={{ color: "text.disabled" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.8,
                          }}
                        >
                          <Typography
                            sx={{ fontSize: "0.73rem", color: "text.disabled" }}
                          >
                            📄
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              fontWeight: 500,
                              fontSize: "0.75rem",
                            }}
                          >
                            LV_{leave._id?.slice(-6).toUpperCase()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: "8px",
                              bgcolor: lColor + "15",
                              border: `1px solid ${lColor}25`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 13,
                              flexShrink: 0,
                            }}
                          >
                            {emoji}
                          </Box>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.81rem",
                                color: "text.primary",
                                textTransform: "capitalize",
                              }}
                            >
                              {leave.leaveType === "leaveWithoutPay"
                                ? "LWP"
                                : leave.leaveType === "compensatory"
                                  ? "Compensatory"
                                  : leave.leaveType === "onDuty"
                                    ? "On Duty"
                                    : leave.leaveType}{" "}
                              Leave
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.disabled",
                                fontSize: "0.71rem",
                              }}
                            >
                              {leave.faculty?.name || user?.name}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", fontSize: "0.77rem" }}
                        >
                          {new Date(leave.startDate).toLocaleDateString(
                            "en-US",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.83rem",
                            color: "text.primary",
                          }}
                        >
                          {leave.totalDays}d
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            bgcolor: badge.bg,
                            px: 1,
                            py: 0.25,
                            borderRadius: "8px",
                          }}
                        >
                          {leave.status === "approved" && (
                            <CheckCircle
                              sx={{ fontSize: 10, color: badge.color }}
                            />
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: badge.color,
                              fontSize: "0.71rem",
                            }}
                          >
                            {badge.label}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredLeaves.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{ py: 5, color: "text.disabled" }}
                    >
                      No leave records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Box>

      {/* ── Right sidebar ─────────────────────────────── */}
      <Box
        sx={{
          width: 260,
          flexShrink: 0,
          display: { xs: "none", lg: "flex" },
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* SVG ID Card */}
        <CollegeStaffIDCard user={user} />

        {/* Leave balance */}
        <Card
          sx={{ bgcolor: "#1e1b4b", borderRadius: "8px", overflow: "hidden" }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.8,
              }}
            >
              <Typography
                sx={{ fontWeight: 700, color: "white", fontSize: "0.87rem" }}
              >
                Leave Balance
              </Typography>
              <Chip
                label={new Date().getFullYear()}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "0.67rem",
                  fontWeight: 700,
                  borderRadius: "8px",
                }}
              />
            </Box>
            {balance &&
              [
                "casual",
                "medical",
                "earned",
                "compensatory",
                "onDuty",
                "special",
                "leaveWithoutPay",
              ].map((type) => {
                const b = balance[type];
                if (!b || b.total === 0) return null;
                const pct = (b.used / b.total) * 100;
                const remaining = b.total - b.used;
                const color = leaveTypeColor[type] || "#7c3aed";
                return (
                  <Box key={type} sx={{ mb: 1.4 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.35,
                      }}
                    >
                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.65)",
                          fontSize: "0.72rem",
                          textTransform: "capitalize",
                        }}
                      >
                        {type === "leaveWithoutPay"
                          ? "LWP"
                          : type === "compensatory"
                            ? "Comp"
                            : type === "onDuty"
                              ? "On Duty"
                              : type}
                      </Typography>
                      <Typography
                        sx={{
                          color: "white",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                        }}
                      >
                        {remaining}/{b.total}d
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 3,
                        borderRadius: "2px",
                        bgcolor: "rgba(255,255,255,0.1)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: "2px",
                          bgcolor:
                            pct > 80 ? "#f87171" : pct > 50 ? "#fbbf24" : color,
                        },
                      }}
                    />
                  </Box>
                );
              })}
          </CardContent>
        </Card>

        {/* AI Actions */}
        <Card sx={{ borderRadius: "8px" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.8,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                AI Actions
              </Typography>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AutoAwesome sx={{ color: "white", fontSize: 12 }} />
              </Box>
            </Box>

            {[
              {
                emoji: "⏳",
                title: `${stats.pending} Pending`,
                sub: "Needs Approval",
                subColor: "#f59e0b",
                dark: true,
                arrow: true,
              },
              {
                emoji: "✅",
                title: `${stats.approved} Approved`,
                sub: "Processed",
                subColor: "#10b981",
                dark: false,
                arrow: false,
              },
              {
                emoji: "🔄",
                title: `${allUsers.filter((u) => u.isAvailable).length} Available`,
                sub: "Substitutes Ready",
                subColor: "#7c3aed",
                dark: false,
                arrow: false,
              },
            ].map((item, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.4,
                  borderRadius: "8px",
                  bgcolor: item.dark ? "#0f172a" : "background.default",
                  mb: i < 2 ? 1 : 0,
                  cursor: "pointer",
                  "&:hover": { opacity: 0.88 },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    bgcolor: item.subColor + (item.dark ? "30" : "15"),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {item.emoji}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.81rem",
                      color: item.dark ? "white" : "text.primary",
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: item.subColor,
                      fontWeight: 600,
                      fontSize: "0.69rem",
                    }}
                  >
                    {item.sub}
                  </Typography>
                </Box>
                {item.arrow && (
                  <KeyboardArrowRight
                    sx={{ color: "rgba(255,255,255,0.3)", fontSize: 16 }}
                  />
                )}
              </Box>
            ))}

            <Box
              sx={{
                mt: 1.5,
                p: 1.4,
                bgcolor: "#f5f3ff",
                borderRadius: "8px",
                border: "1px solid #e0d7ff",
              }}
            >
              <Typography
                sx={{
                  color: "#6d28d9",
                  fontWeight: 700,
                  fontSize: "0.74rem",
                  mb: 0.2,
                }}
              >
                {user?.department}
              </Typography>
              <Typography sx={{ color: "#7c3aed", fontSize: "0.69rem" }}>
                {stats.total} total requests this year
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardPage;
