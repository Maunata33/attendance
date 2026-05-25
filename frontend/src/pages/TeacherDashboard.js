import React, { useEffect, useState } from "react";
import axios from "axios";

function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const [attendance, setAttendance] = useState({});

  const token = localStorage.getItem("token");

  // =====================
  // LOAD FACULTIES
  // =====================
  const fetchFaculties = async () => {
    try {
      const res = await axios.get("http://localhost:5000/faculties");
      setFacultyList(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  // =====================
  // FETCH STUDENTS
  // =====================
  const fetchStudents = async () => {
    try {
      if (!token) {
        console.warn("TeacherDashboard: no auth token available");
        return;
      }

      const res = await axios.get("http://localhost:5000/students", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const filtered = res.data.filter((s) => {
        return (
          s.faculty?._id === selectedFaculty &&
          String(s.semester) === String(selectedSemester)
        );
      });

      setStudents(filtered);
    } catch (error) {
      console.log(error);
    }
  };

  // =====================
  // LOAD TODAY ATTENDANCE
  // =====================
  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const res = await axios.get("http://localhost:5000/attendance");

      const todayMap = {};

      res.data.forEach((a) => {
        if (a.date === today) {
          todayMap[a.studentId] = a.status;
        }
      });

      setAttendance(todayMap);
    } catch (error) {
      console.log(error);
    }
  };

  // =====================
  // LOAD CLASS
  // =====================
  const handleSearch = async () => {
    if (!selectedFaculty || !selectedSemester) {
      alert("Select faculty and semester");
      return;
    }

    await fetchStudents();
    await fetchTodayAttendance();
  };

  // =====================
  // MARK ATTENDANCE
  // =====================
  const submitAttendanceDirect = async (studentId, status) => {
    try {
      if (attendance[studentId]) return;

      const today = new Date().toISOString().split("T")[0];

      await axios.post("http://localhost:5000/attendance", {
        studentId,
        status,
        date: today,
      });

      setAttendance((prev) => ({
        ...prev,
        [studentId]: status,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>👨‍🏫 Teacher Dashboard</h1>

      {/* FILTER */}
      <div style={styles.card}>
        <h3>📚 Select Class</h3>

        <div style={styles.row}>
          <select
            style={styles.input}
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
          >
            <option value="">Select Faculty</option>
            {facultyList.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name}
              </option>
            ))}
          </select>

          <input
            style={styles.input}
            placeholder="Semester"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          />

          <button style={styles.button} onClick={handleSearch}>
            Load Class
          </button>
        </div>
      </div>

      {/* STUDENTS */}
      <div style={styles.card}>
        <h3>🎓 Students</h3>

        {students.length === 0 && (
          <p style={{ color: "gray" }}>
            No students loaded. Select class first.
          </p>
        )}

        {students.map((s) => (
          <div key={s._id} style={styles.studentCard}>
            <div>
              <strong>{s.name}</strong>
              <div style={{ fontSize: "13px", color: "gray" }}>
                Roll: {s.rollNumber}
              </div>
            </div>

            <div style={styles.buttonRow}>
              <button
                style={{
                  ...styles.presentBtn,
                  background:
                    attendance[s._id] === "Present"
                      ? "#2e7d32"
                      : "#4CAF50",
                  transform:
                    attendance[s._id] === "Present"
                      ? "scale(1.05)"
                      : "scale(1)",
                  opacity: attendance[s._id] ? 0.7 : 1,
                  transition: "0.2s",
                }}
                disabled={attendance[s._id]}
                onClick={() =>
                  submitAttendanceDirect(s._id, "Present")
                }
              >
                ✅ Present
              </button>

              <button
                style={{
                  ...styles.absentBtn,
                  background:
                    attendance[s._id] === "Absent"
                      ? "#b71c1c"
                      : "#f44336",
                  transform:
                    attendance[s._id] === "Absent"
                      ? "scale(1.05)"
                      : "scale(1)",
                  opacity: attendance[s._id] ? 0.7 : 1,
                  transition: "0.2s",
                }}
                disabled={attendance[s._id]}
                onClick={() =>
                  submitAttendanceDirect(s._id, "Absent")
                }
              >
                ❌ Absent
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeacherDashboard;

// =====================
// STYLES
// =====================
const styles = {
  page: {
    padding: "30px",
    fontFamily: "Arial",
    background: "#f4f6f8",
    minHeight: "100vh",
  },

  title: {
    marginBottom: "20px",
  },

  card: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },

  row: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  input: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    flex: 1,
    minWidth: "150px",
  },

  button: {
    padding: "10px 15px",
    background: "#333",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  studentCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    borderBottom: "1px solid #eee",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
  },

  presentBtn: {
    background: "#4CAF50",
    color: "white",
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  absentBtn: {
    background: "#f44336",
    color: "white",
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};