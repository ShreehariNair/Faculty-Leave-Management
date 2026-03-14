import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  TextField,
  MenuItem,
  InputBase,
  CircularProgress,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  Search,
  CheckCircle,
  Cancel,
  HowToReg,
  Info,
} from "@mui/icons-material";
import { useAuth } from "../context/authContext";
import API from "../api/axiosInstance";
import { LEAVE_TYPE_META, STATUS_META } from "../constants/leavePolicy";

const ManageLeavesPage = () => {
  const { user } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true); // initial page load
  const [actionLoading, setActionLoading] = useState(false); // approve/reject/hod
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const [rejectDialog, setRejectDialog] = useState({
    open: false,
    leaveId: null,
    reason: "",
  });

  const fetchLeaves = async ({ showSpinner = false } = {}) => {
    if (showSpinner) setLoading(true);
    setError("");
    try {
      const { data } = await API.get("/leaves");
      setLeaves(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load leaves.");
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves({ showSpinner: true });
  }, []);

  // helper: merge an updated leave into the table immediately
  const patchLeaveInState = (updatedLeave) => {
    if (!updatedLeave?._id) return;
    setLeaves((prev) =>
      prev.map((l) =>
        l._id === updatedLeave._id ? { ...l, ...updatedLeave } : l,
      ),
    );
    if (selected?._id === updatedLeave._id) {
      setSelected((prev) => (prev ? { ...prev, ...updatedLeave } : prev));
    }
  };

  const runAction = async (fn) => {
    setActionLoading(true);
    setError("");
    try {
      const updated = await fn();
      // if API returns leave object, patch it
      if (updated?.leave) patchLeaveInState(updated.leave);
      // re-fetch to stay source-of-truth (and to refresh populated fields)
      await fetchLeaves();
    } catch (e) {
      setError(e?.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleHodApprove = async (id) => {
    await runAction(async () => {
      const { data } = await API.put(`/leaves/${id}/hod-approve`, {
        remarks: "",
      });
      return data; // expected { message, leave } in your backend
    });
  };

  const handleApprove = async (id) => {
    await runAction(async () => {
      const { data } = await API.put(`/leaves/${id}/approve`, { remarks: "" });
      return data;
    });
  };

  const handleReject = async () => {
    const { leaveId, reason } = rejectDialog;
    await runAction(async () => {
      const { data } = await API.put(`/leaves/${leaveId}/reject`, {
        rejectionReason: reason,
      });
      return data;
    });
    setRejectDialog({ open: false, leaveId: null, reason: "" });
  };

  const handleMlCertificate = async (id) => {
    await runAction(async () => {
      const { data } = await API.put(`/leaves/${id}/ml-certificate`);
      return data;
    });
  };

  const filtered = useMemo(() => {
    return leaves.filter((l) => {
      const matchSearch =
        !search ||
        l.faculty?.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.leaveType?.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "all" || l.status === filter;
      return matchSearch && matchFilter;
    });
  }, [leaves, search, filter]);

  const canHodOrAdmin = user?.role === "hod" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress sx={{ color: "#7c3aed" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Manage Leaves
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.4 }}>
          Two-step approval: HOD → Principal/Admin
        </Typography>
      </Box>

      {actionLoading && (
        <Box sx={{ mb: 1.5 }}>
          <LinearProgress sx={{ borderRadius: 1 }} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 2.5, borderRadius: "8px" }}>
        <CardContent
          sx={{
            p: 2,
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
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
              minWidth: 200,
              "&:focus-within": { borderColor: "#c4b5fd" },
            }}
          >
            <Search sx={{ color: "text.disabled", fontSize: 14, mr: 0.5 }} />
            <InputBase
              placeholder="Search faculty or leave type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ fontSize: "0.8rem", flex: 1 }}
            />
          </Box>

          <TextField
            select
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{
              minWidth: 180,
              "& .MuiOutlinedInput-root": { borderRadius: "8px" },
            }}
          >
            {[
              "all",
              "pending",
              "hod_approved",
              "approved",
              "rejected",
              "cancelled",
            ].map((s) => (
              <MenuItem
                key={s}
                value={s}
                sx={{ fontSize: "0.82rem", textTransform: "capitalize" }}
              >
                {s === "all" ? "All Statuses" : STATUS_META?.[s]?.label || s}
              </MenuItem>
            ))}
          </TextField>
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: "8px" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "background.default" }}>
              {[
                "Faculty",
                "Leave Type",
                "Duration",
                "Days",
                "Substitute",
                "Status",
                "LWP?",
                "Actions",
              ].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    color: "text.disabled",
                    letterSpacing: "0.04em",
                    py: 1.2,
                  }}
                >
                  {h.toUpperCase()}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((leave) => {
              const meta = LEAVE_TYPE_META?.[leave.leaveType] || {};
              const status = STATUS_META?.[leave.status] || {
                label: leave.status,
                bg: "#f1f5f9",
                color: "#64748b",
              };

              return (
                <TableRow
                  key={leave._id}
                  hover
                  sx={{
                    "&:hover": { bgcolor: "rgba(124,58,237,0.02)" },
                    cursor: "pointer",
                  }}
                  onClick={() => setSelected(leave)}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: 11,
                          fontWeight: 700,
                          bgcolor: "#7c3aed",
                          borderRadius: "6px",
                        }}
                      >
                        {leave.faculty?.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography
                          sx={{ fontWeight: 700, fontSize: "0.8rem" }}
                        >
                          {leave.faculty?.name}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "0.68rem", color: "text.disabled" }}
                        >
                          {leave.faculty?.department}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        textTransform: "capitalize",
                      }}
                    >
                      {meta.label || leave.leaveType}
                    </Typography>
                    {leave.mlCertificateRequired &&
                      !leave.mlCertificateReceived && (
                        <Typography
                          sx={{
                            fontSize: "0.62rem",
                            color: "#ef4444",
                            fontWeight: 700,
                          }}
                        >
                          Cert pending
                        </Typography>
                      )}
                  </TableCell>

                  <TableCell>
                    <Typography
                      sx={{ fontSize: "0.75rem", color: "text.secondary" }}
                    >
                      {new Date(leave.startDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                      {" → "}
                      {new Date(leave.endDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.82rem" }}>
                      {leave.dayType === "HALF"
                        ? "0.5d"
                        : `${leave.totalDays}d`}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.65rem", color: "text.disabled" }}
                    >
                      {leave.workingDays} working
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      sx={{ fontSize: "0.75rem", color: "text.secondary" }}
                    >
                      {leave.substituteAssigned?.name ||
                        leave.substituteRequested ||
                        "—"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={status.label}
                      size="small"
                      sx={{
                        bgcolor: status.bg,
                        color: status.color,
                        fontWeight: 700,
                        fontSize: "0.68rem",
                        borderRadius: "6px",
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    {leave.treatAsLWP ? (
                      <Chip
                        label="LWP"
                        size="small"
                        sx={{
                          bgcolor: "#fee2e2",
                          color: "#991b1b",
                          fontWeight: 700,
                          fontSize: "0.65rem",
                          borderRadius: "6px",
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{ fontSize: "0.72rem", color: "text.disabled" }}
                      >
                        —
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {leave.status === "pending" && canHodOrAdmin && (
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={actionLoading}
                          onClick={() => handleHodApprove(leave._id)}
                          startIcon={<HowToReg sx={{ fontSize: 12 }} />}
                          sx={{
                            fontSize: "0.68rem",
                            py: 0.3,
                            px: 1,
                            borderRadius: "6px",
                            borderColor: "#bfdbfe",
                            color: "#1e40af",
                            "&:hover": { bgcolor: "#eff6ff" },
                          }}
                        >
                          HOD ✓
                        </Button>
                      )}

                      {(leave.status === "pending" ||
                        leave.status === "hod_approved") &&
                        isAdmin && (
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={actionLoading}
                            onClick={() => handleApprove(leave._id)}
                            startIcon={<CheckCircle sx={{ fontSize: 12 }} />}
                            sx={{
                              fontSize: "0.68rem",
                              py: 0.3,
                              px: 1,
                              borderRadius: "6px",
                              borderColor: "#bbf7d0",
                              color: "#166534",
                              "&:hover": { bgcolor: "#f0fdf4" },
                            }}
                          >
                            Approve
                          </Button>
                        )}

                      {["pending", "hod_approved"].includes(leave.status) &&
                        user?.role !== "faculty" && (
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={actionLoading}
                            onClick={() =>
                              setRejectDialog({
                                open: true,
                                leaveId: leave._id,
                                reason: "",
                              })
                            }
                            startIcon={<Cancel sx={{ fontSize: 12 }} />}
                            sx={{
                              fontSize: "0.68rem",
                              py: 0.3,
                              px: 1,
                              borderRadius: "6px",
                              borderColor: "#fecaca",
                              color: "#991b1b",
                              "&:hover": { bgcolor: "#fef2f2" },
                            }}
                          >
                            Reject
                          </Button>
                        )}

                      {leave.leaveType === "medical" &&
                        leave.status === "approved" &&
                        leave.mlCertificateRequired &&
                        !leave.mlCertificateReceived &&
                        user?.role !== "faculty" && (
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={actionLoading}
                            onClick={() => handleMlCertificate(leave._id)}
                            startIcon={<Info sx={{ fontSize: 12 }} />}
                            sx={{
                              fontSize: "0.68rem",
                              py: 0.3,
                              px: 1,
                              borderRadius: "6px",
                              borderColor: "#fed7aa",
                              color: "#92400e",
                              "&:hover": { bgcolor: "#fff7ed" },
                            }}
                          >
                            Cert ✓
                          </Button>
                        )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  align="center"
                  sx={{ py: 5, color: "text.disabled" }}
                >
                  No leave records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Reject dialog */}
      <Dialog
        open={rejectDialog.open}
        onClose={() =>
          setRejectDialog({ open: false, leaveId: null, reason: "" })
        }
        PaperProps={{ sx: { borderRadius: "8px", minWidth: 380 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Reject Leave</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason"
            value={rejectDialog.reason}
            onChange={(e) =>
              setRejectDialog((d) => ({ ...d, reason: e.target.value }))
            }
            sx={{ mt: 1, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() =>
              setRejectDialog({ open: false, leaveId: null, reason: "" })
            }
            sx={{ borderRadius: "8px" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleReject}
            disabled={actionLoading || !rejectDialog.reason.trim()}
            sx={{
              borderRadius: "8px",
              bgcolor: "#ef4444",
              "&:hover": { bgcolor: "#dc2626" },
              boxShadow: "none",
            }}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leave details dialog (optional) */}
      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        PaperProps={{ sx: { borderRadius: "8px", minWidth: 420 } }}
      >
        {selected && (
          <>
            <DialogTitle sx={{ fontWeight: 800, pb: 0 }}>
              Leave Details
            </DialogTitle>
            <DialogContent sx={{ pt: 1.5 }}>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, mb: 1 }}>
                {selected.faculty?.name} · {selected.faculty?.department}
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                {selected.reason}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setSelected(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ManageLeavesPage;
