import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Button,
  TextField,
  Chip,
  Divider,
} from "@mui/material";
import API from "../api/axiosInstance";
import { useAuth } from "../context/authContext";

const parseSlotsFromText = (text) => {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Accept either "Monday-09:00" or "Monday,09:00"
  const slots = [];
  for (const line of lines) {
    if (line.includes("-")) {
      slots.push(line);
      continue;
    }
    if (line.includes(",")) {
      const [day, time] = line.split(",").map((s) => s.trim());
      if (day && time) slots.push(`${day}-${time}`);
    }
  }
  return Array.from(new Set(slots));
};

const MyTimetablePage = () => {
  const { user } = useAuth();
  const isFaculty = user?.role === "faculty";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [text, setText] = useState("");
  const slots = useMemo(() => parseSlotsFromText(text), [text]);

  useEffect(() => {
    if (!isFaculty) return;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await API.get("/faculty-timetable/me");
        const busySlots = data?.data?.busySlots || [];
        setText(Array.isArray(busySlots) ? busySlots.join("\n") : "");
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load timetable.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isFaculty]);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    try {
      await API.put("/faculty-timetable/me", { busySlots: slots });
      setSuccess("Timetable saved successfully.");
      setTimeout(() => setSuccess(""), 2500);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save timetable.");
    }
  };

  if (!isFaculty) {
    return (
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Alert severity="warning">Only Faculty can upload timetable.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 950, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>
        My Timetable (Upload)
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 2 }}>
        Paste your weekly busy slots. Format: <strong>Monday-09:00</strong>{" "}
        (one per line).
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography sx={{ fontWeight: 800 }}>Busy slots</Typography>
            <Chip label={`${slots.length} slot(s)`} size="small" />
          </Box>
          <Divider sx={{ mb: 1.5 }} />

          <TextField
            fullWidth
            multiline
            minRows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"Monday-09:00\nMonday-10:00\nTuesday-11:00"}
            disabled={loading}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
              sx={{ fontWeight: 900 }}
            >
              Save timetable
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MyTimetablePage;

