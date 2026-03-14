import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Avatar,
  InputBase,
  Menu,
  MenuItem,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  FormHelperText,
  Select,
} from "@mui/material";
import {
  Search,
  MoreVert,
  Tune,
  CheckCircle,
  PersonAddAlt1,
  Close,
} from "@mui/icons-material";
import API, { getAvatarUrl } from "../api/axiosInstance";
import { useAuth } from "../context/authContext";

const uniq = (arr) => Array.from(new Set(arr));

/**
 * Departments + programs availability (from your table)
 * Backend also enforces this (fat model), but we keep it in UI for better UX.
 */
const COURSE_OPTIONS = ["B.Tech (UG)", "M.Tech (PG)", "Ph.D."];

const DEPARTMENT_COURSE_MATRIX = {
  "Computer Engineering": ["B.Tech (UG)", "M.Tech (PG)", "Ph.D."],
  "Information Technology": ["B.Tech (UG)", "M.Tech (PG)", "Ph.D."],
  "Mechanical Engineering": ["B.Tech (UG)", "M.Tech (PG)", "Ph.D."], // M.Tech ✔*
  "Electronics & Computer Science": ["B.Tech (UG)"],
  "Electronics & Telecommunication": ["B.Tech (UG)"],
  "Automobile Engineering": ["B.Tech (UG)"],
  "Electronics Engineering": ["M.Tech (PG)", "Ph.D."],
};

const DEPARTMENTS = Object.keys(DEPARTMENT_COURSE_MATRIX);

const DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lab Assistant",
  "Administrative Staff",
];

const FacultyDirectoryPage = () => {
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTx, setSearchTx] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  const [editDlg, setEditDlg] = useState({
    open: false,
    row: null,
    subjectsText: "",
  });
  const [savingSubjects, setSavingSubjects] = useState(false);

  /* Create dialog (admin-only) */
  const [createDlg, setCreateDlg] = useState({
    open: false,
    name: "",
    email: "",
    password: "",
    department: "",
    course: "", // UI field -> backend `program`
    designation: "",
    phone: "",
    role: "faculty", // faculty | hod
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const isAdmin = user?.role === "admin";
  const isHod = user?.role === "hod";

  const fetchData = async () => {
    setLoading(true);
    try {
      // Separate roles backend:
      // Admin: /users/faculty/all
      // HOD:   /users/faculty/department
      const url = isAdmin ? "/users/faculty/all" : "/users/faculty/department";

      const params = {};
      if (isAdmin && deptFilter !== "all") params.department = deptFilter;

      const { data } = await API.get(url, { params });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deptFilter]);

  const departmentsFromData = useMemo(() => {
    return ["all", ...uniq(rows.map((r) => r.department).filter(Boolean))];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = searchTx.trim().toLowerCase();
    return rows.filter((r) => {
      if (!q) return true;
      return (
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.department?.toLowerCase().includes(q) ||
        r.designation?.toLowerCase().includes(q) ||
        r.program?.toLowerCase().includes(q) ||
        (r.subjects || []).join(", ").toLowerCase().includes(q)
      );
    });
  }, [rows, searchTx]);

  const allChecked =
    filtered.length > 0 && filtered.every((r) => selectedIds.has(r._id));

  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (allChecked) {
      filtered.forEach((r) => next.delete(r._id));
    } else {
      filtered.forEach((r) => next.add(r._id));
    }
    setSelectedIds(next);
  };

  const toggleOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const openMenu = (e, row) => {
    setMenuAnchor(e.currentTarget);
    setActiveRow(row);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setActiveRow(null);
  };

  const openEditSubjects = (row) => {
    setEditDlg({
      open: true,
      row,
      subjectsText: (row.subjects || []).join(", "),
    });
    closeMenu();
  };

  const saveSubjects = async () => {
    if (!editDlg.row) return;
    setSavingSubjects(true);
    try {
      const subjects = editDlg.subjectsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await API.put(`/users/${editDlg.row._id}/subjects`, { subjects });

      setEditDlg({ open: false, row: null, subjectsText: "" });
      await fetchData();
    } catch {
      // ignore; backend error handling can be added later
    } finally {
      setSavingSubjects(false);
    }
  };

  /* Admin Create */
  const openCreate = () => {
    setCreateError("");
    setCreateDlg({
      open: true,
      name: "",
      email: "",
      password: "",
      department: "",
      course: "",
      designation: "",
      phone: "",
      role: "faculty",
    });
  };

  const closeCreate = () => {
    setCreateDlg((d) => ({ ...d, open: false }));
    setCreateError("");
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;

    setCreateDlg((d) => {
      // If department changes, reset course if invalid
      if (name === "department") {
        const allowed = DEPARTMENT_COURSE_MATRIX[value] || [];
        const nextCourse = allowed.includes(d.course) ? d.course : "";
        return { ...d, department: value, course: nextCourse };
      }
      return { ...d, [name]: value };
    });

    setCreateError("");
  };

  const allowedCoursesForSelectedDept =
    DEPARTMENT_COURSE_MATRIX[createDlg.department] || [];

  const submitCreate = async () => {
    if (!isAdmin) return;
    setCreateError("");

    const { name, email, password, department, course, role } = createDlg;
    if (!name || !email || !password || !department || !course || !role) {
      setCreateError(
        "Please fill all required fields (name, email, password, department, course, role).",
      );
      return;
    }

    // extra client-side validation (backend also checks)
    if (!allowedCoursesForSelectedDept.includes(course)) {
      setCreateError(
        "Selected course is not available for the selected department.",
      );
      return;
    }

    setCreating(true);
    try {
      await API.post("/auth/create-user", {
        name: createDlg.name,
        email: createDlg.email,
        password: createDlg.password,
        role: createDlg.role, // faculty | hod
        department: createDlg.department,
        program: createDlg.course, // ✅ matches backend schema
        designation: createDlg.designation,
        phone: createDlg.phone,
        subjects: [],
      });

      closeCreate();
      await fetchData();
    } catch (err) {
      console.error(
        "Create user error:",
        err?.response?.status,
        err?.response?.data,
        err,
      );
      setCreateError(
        err?.response?.data?.message ||
          `Failed to create faculty (status ${err?.response?.status || "?"}).`,
      );
    } finally {
      setCreating(false);
    }
  };

  if (!isAdmin && !isHod) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Typography sx={{ color: "text.secondary" }}>
          Not authorized.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Box
        sx={{
          mb: 2.5,
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Faculty Directory
          </Typography>
          <Typography
            sx={{ color: "text.secondary", mt: 0.3, fontSize: "0.9rem" }}
          >
            {isAdmin
              ? "All faculties in the college (admin view)."
              : `Department view — ${user?.department}`}
          </Typography>
        </Box>

        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<PersonAddAlt1 />}
            onClick={openCreate}
            sx={{
              borderRadius: "10px",
              px: 2,
              py: 1.05,
              fontWeight: 800,
              bgcolor: "#7c3aed",
              "&:hover": { bgcolor: "#6d28d9" },
              boxShadow: "none",
              alignSelf: "flex-start",
            }}
          >
            Add Faculty
          </Button>
        )}
      </Box>

      <Card sx={{ borderRadius: "12px" }}>
        <CardContent sx={{ p: 0 }}>
          {/* Toolbar (filters + search) */}
          <Box
            sx={{
              px: 2.5,
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {isAdmin && (
                <>
                  <Chip
                    icon={<Tune sx={{ fontSize: 16 }} />}
                    label={
                      deptFilter === "all" ? "All departments" : deptFilter
                    }
                    sx={{
                      bgcolor: "background.default",
                      border: "1px solid",
                      borderColor: "divider",
                      fontWeight: 600,
                      borderRadius: "10px",
                    }}
                  />
                  <TextField
                    select
                    size="small"
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    sx={{
                      minWidth: 260,
                      "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                      "& fieldset": { borderColor: "#e2e8f0" },
                    }}
                  >
                    {departmentsFromData.map((d) => (
                      <MenuItem key={d} value={d} sx={{ fontSize: "0.9rem" }}>
                        {d === "all" ? "All departments" : d}
                      </MenuItem>
                    ))}
                  </TextField>
                </>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                borderRadius: "10px",
                px: 1.5,
                py: 0.6,
                minWidth: { xs: "100%", sm: 340 },
                "&:focus-within": { borderColor: "#c4b5fd" },
              }}
            >
              <Search sx={{ color: "text.disabled", fontSize: 18 }} />
              <InputBase
                placeholder="Search"
                value={searchTx}
                onChange={(e) => setSearchTx(e.target.value)}
                sx={{ flex: 1, fontSize: "0.9rem" }}
              />
            </Box>
          </Box>

          <Divider />

          {/* Table */}
          {loading ? (
            <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
              <CircularProgress sx={{ color: "#7c3aed" }} />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "background.default" }}>
                  <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                    <Checkbox checked={allChecked} onChange={toggleAll} />
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.72rem",
                      color: "text.disabled",
                    }}
                  >
                    CUSTOMER
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.72rem",
                      color: "text.disabled",
                    }}
                  >
                    ROLE
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.72rem",
                      color: "text.disabled",
                    }}
                  >
                    DEPARTMENT
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.72rem",
                      color: "text.disabled",
                    }}
                  >
                    PROGRAM
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.72rem",
                      color: "text.disabled",
                    }}
                  >
                    SUBJECTS
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.72rem",
                      color: "text.disabled",
                      pr: 2.5,
                    }}
                  >
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filtered.map((r) => {
                  const avatarUrl = getAvatarUrl(r.avatar);
                  const isSelected = selectedIds.has(r._id);

                  return (
                    <TableRow
                      key={r._id}
                      hover
                      sx={{ "&:hover": { bgcolor: "rgba(124,58,237,0.02)" } }}
                    >
                      <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleOne(r._id)}
                        />
                      </TableCell>

                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.2,
                          }}
                        >
                          <Avatar
                            src={avatarUrl || undefined}
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: "10px",
                              bgcolor: avatarUrl ? "transparent" : "#7c3aed",
                              fontWeight: 800,
                            }}
                          >
                            {!avatarUrl && r.name?.charAt(0)}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                color: "text.primary",
                              }}
                            >
                              {r.name}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.78rem",
                                color: "text.secondary",
                              }}
                            >
                              {r.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: 14 }} />}
                          label={r.role?.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: "#ecfdf5",
                            color: "#166534",
                            fontWeight: 800,
                            borderRadius: "999px",
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{ fontSize: "0.85rem", color: "text.secondary" }}
                        >
                          {r.department}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{ fontSize: "0.85rem", color: "text.secondary" }}
                        >
                          {r.program || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {(r.subjects || []).length === 0 ? (
                          <Typography
                            sx={{ fontSize: "0.82rem", color: "text.disabled" }}
                          >
                            —
                          </Typography>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.6,
                              flexWrap: "wrap",
                              maxWidth: 380,
                            }}
                          >
                            {(r.subjects || []).slice(0, 4).map((s) => (
                              <Chip
                                key={s}
                                label={s}
                                size="small"
                                sx={{
                                  bgcolor: "background.default",
                                  border: "1px solid",
                                  borderColor: "divider",
                                  borderRadius: "999px",
                                  fontSize: "0.72rem",
                                  fontWeight: 600,
                                }}
                              />
                            ))}
                            {(r.subjects || []).length > 4 && (
                              <Chip
                                label={`+${(r.subjects || []).length - 4}`}
                                size="small"
                                sx={{
                                  bgcolor: "#f5f3ff",
                                  color: "#7c3aed",
                                  borderRadius: "999px",
                                  fontWeight: 800,
                                }}
                              />
                            )}
                          </Box>
                        )}
                      </TableCell>

                      <TableCell align="right" sx={{ pr: 2.5 }}>
                        <IconButton onClick={(e) => openMenu(e, r)}>
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 6, color: "text.disabled" }}
                    >
                      No faculty records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Row menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
      >
        {isHod && activeRow?.role === "faculty" && (
          <MenuItem onClick={() => openEditSubjects(activeRow)}>
            Edit Subjects
          </MenuItem>
        )}
        <MenuItem onClick={closeMenu}>Close</MenuItem>
      </Menu>

      {/* Edit subjects dialog */}
      <Dialog
        open={editDlg.open}
        onClose={() => setEditDlg({ open: false, row: null, subjectsText: "" })}
        PaperProps={{ sx: { borderRadius: "12px", minWidth: 420 } }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Allocate Subjects</DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Typography
            sx={{ color: "text.secondary", mb: 1.5, fontSize: "0.85rem" }}
          >
            Faculty: <strong>{editDlg.row?.name}</strong>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Subjects (comma separated)"
            value={editDlg.subjectsText}
            onChange={(e) =>
              setEditDlg((d) => ({ ...d, subjectsText: e.target.value }))
            }
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          />
          <Typography
            sx={{ mt: 1, fontSize: "0.75rem", color: "text.disabled" }}
          >
            Example: DSA, DBMS, OS
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() =>
              setEditDlg({ open: false, row: null, subjectsText: "" })
            }
            sx={{ borderRadius: "10px" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveSubjects}
            disabled={savingSubjects}
            sx={{
              borderRadius: "10px",
              bgcolor: "#7c3aed",
              "&:hover": { bgcolor: "#6d28d9" },
              boxShadow: "none",
              fontWeight: 800,
            }}
          >
            {savingSubjects ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Faculty dialog (admin only) */}
      <Dialog
        open={createDlg.open}
        onClose={closeCreate}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            width: "100%",
            maxWidth: 720,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ px: 3, py: 2.2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: "1.25rem",
                  color: "text.primary",
                }}
              >
                Add Faculty
              </Typography>
              <Typography
                sx={{ fontSize: "0.85rem", color: "text.secondary", mt: 0.4 }}
              >
                Admin-only: create a new faculty/HOD account
              </Typography>
            </Box>

            <IconButton
              onClick={closeCreate}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "10px",
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 2.5 }}>
          {createError && (
            <Box
              sx={{
                mb: 2,
                p: 1.2,
                borderRadius: "12px",
                bgcolor: "#fef2f2",
                border: "1px solid #fecaca",
              }}
            >
              <Typography
                sx={{ color: "#991b1b", fontWeight: 700, fontSize: "0.86rem" }}
              >
                {createError}
              </Typography>
            </Box>
          )}

          <Typography
            sx={{
              fontSize: "0.82rem",
              fontWeight: 800,
              color: "text.secondary",
              mb: 0.7,
            }}
          >
            Full name *
          </Typography>
          <TextField
            fullWidth
            name="name"
            placeholder="Enter full name"
            value={createDlg.name}
            onChange={handleCreateChange}
            size="small"
            sx={{
              mb: 2.2,
              "& .MuiOutlinedInput-root": { borderRadius: "12px" },
            }}
          />

          <Grid container spacing={2} sx={{ mb: 2.2 }}>
            <Grid item xs={12} md={7}>
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  color: "text.secondary",
                  mb: 0.7,
                }}
              >
                Email *
              </Typography>
              <TextField
                fullWidth
                name="email"
                type="email"
                placeholder="name@pce.edu"
                value={createDlg.email}
                onChange={handleCreateChange}
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  color: "text.secondary",
                  mb: 0.7,
                }}
              >
                Phone
              </Typography>
              <TextField
                fullWidth
                name="phone"
                placeholder="9999999999"
                value={createDlg.phone}
                onChange={handleCreateChange}
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              />
            </Grid>
          </Grid>

          {/* Department + Course */}
          <Grid container spacing={2} sx={{ mb: 2.2 }}>
            <Grid item xs={12} md={7}>
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  color: "text.secondary",
                  mb: 0.7,
                }}
              >
                Department *
              </Typography>
              <TextField
                fullWidth
                select
                name="department"
                value={createDlg.department}
                onChange={handleCreateChange}
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              >
                {DEPARTMENTS.map((d) => (
                  <MenuItem key={d} value={d} sx={{ fontSize: "0.9rem" }}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={5}>
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  color: "text.secondary",
                  mb: 0.7,
                }}
              >
                Course *
              </Typography>

              <FormControl fullWidth size="small">
                <Select
                  name="course"
                  value={createDlg.course}
                  onChange={handleCreateChange}
                  displayEmpty
                  disabled={!createDlg.department}
                  sx={{ borderRadius: "12px" }}
                >
                  <MenuItem value="">
                    <Typography
                      sx={{ color: "text.disabled", fontSize: "0.9rem" }}
                    >
                      Select course
                    </Typography>
                  </MenuItem>

                  {COURSE_OPTIONS.map((c) => {
                    const disabled =
                      !createDlg.department ||
                      !allowedCoursesForSelectedDept.includes(c);
                    return (
                      <MenuItem
                        key={c}
                        value={c}
                        disabled={disabled}
                        sx={{ fontSize: "0.9rem" }}
                      >
                        {c}
                        {createDlg.department &&
                        !allowedCoursesForSelectedDept.includes(c)
                          ? " (Not available)"
                          : ""}
                      </MenuItem>
                    );
                  })}
                </Select>

                <FormHelperText sx={{ ml: 0, mt: 0.8 }}>
                  {createDlg.department
                    ? `Available: ${allowedCoursesForSelectedDept.join(", ")}`
                    : "Choose department first"}
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>

          {/* Designation */}
          <Typography
            sx={{
              fontSize: "0.82rem",
              fontWeight: 800,
              color: "text.secondary",
              mb: 0.7,
            }}
          >
            Designation
          </Typography>
          <TextField
            fullWidth
            select
            name="designation"
            value={createDlg.designation}
            onChange={handleCreateChange}
            size="small"
            sx={{
              mb: 2.2,
              "& .MuiOutlinedInput-root": { borderRadius: "12px" },
            }}
          >
            <MenuItem
              value=""
              sx={{ color: "text.disabled", fontSize: "0.9rem" }}
            >
              Select designation
            </MenuItem>
            {DESIGNATIONS.map((d) => (
              <MenuItem key={d} value={d} sx={{ fontSize: "0.9rem" }}>
                {d}
              </MenuItem>
            ))}
          </TextField>

          {/* Role selector */}
          <Typography
            sx={{
              fontSize: "0.82rem",
              fontWeight: 800,
              color: "text.secondary",
              mb: 0.9,
            }}
          >
            Role *
          </Typography>
          <ToggleButtonGroup
            value={createDlg.role}
            exclusive
            onChange={(e, v) => v && setCreateDlg((d) => ({ ...d, role: v }))}
            sx={{
              mb: 2.2,
              bgcolor: "background.default",
              p: 0.5,
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              "& .MuiToggleButton-root": {
                border: "none",
                borderRadius: "10px",
                px: 2,
                fontWeight: 800,
                textTransform: "none",
              },
              "& .Mui-selected": {
                bgcolor: "#ffffff !important",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              },
            }}
          >
            <ToggleButton value="faculty">Faculty</ToggleButton>
            <ToggleButton value="hod">HOD</ToggleButton>
          </ToggleButtonGroup>

          {/* Password */}
          <Typography
            sx={{
              fontSize: "0.82rem",
              fontWeight: 800,
              color: "text.secondary",
              mb: 0.7,
            }}
          >
            Temporary password *
          </Typography>
          <TextField
            fullWidth
            name="password"
            type="password"
            placeholder="Set a temporary password"
            value={createDlg.password}
            onChange={handleCreateChange}
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />
          <Typography
            sx={{ mt: 1, fontSize: "0.75rem", color: "text.disabled" }}
          >
            Tip: share this password with the staff member and ask them to
            change it later.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.2, bgcolor: "background.paper" }}>
          <Button onClick={closeCreate} sx={{ borderRadius: "12px", px: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submitCreate}
            disabled={creating}
            sx={{
              borderRadius: "12px",
              px: 2.5,
              fontWeight: 900,
              bgcolor: "#2563eb",
              "&:hover": { bgcolor: "#1d4ed8" },
              boxShadow: "none",
            }}
          >
            {creating ? "Creating..." : "Create Faculty"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacultyDirectoryPage;
