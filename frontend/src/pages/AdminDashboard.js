import React, { useState, useEffect } from "react";
import axios from "axios";
import Reports from "./Reports";

function AdminDashboard() {
  // ================= STATES =================
  const [user, setUser] = useState(null);

  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);

  const [facultyName, setFacultyName] = useState("");

  const [tUsername, setTUsername] = useState("");
  const [tPassword, setTPassword] = useState("");
  const [teachers, setTeachers] = useState([]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");

  const [creatingStudent, setCreatingStudent] = useState(false);
  const [studentCreated, setStudentCreated] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    rollNumber: "",
    faculty: "",
    semester: "",
  });

  // ================= LOAD DATA =================
  useEffect(() => {
    if (user) {
      fetchStudents();
      fetchFaculties();
      fetchTeachers();
    }
  }, [user]);

  // ================= FETCH =================
  const fetchStudents = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://localhost:5000/students", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setStudents(res.data);
  };

  const fetchFaculties = async () => {
    const res = await axios.get("http://localhost:5000/faculties");
    setFaculties(res.data);
  };

  const fetchTeachers = async () => {
    const res = await axios.get("http://localhost:5000/teachers");
    setTeachers(res.data);
  };

  // ================= CREATE STUDENT LOGIN =================
  const createStudent = async () => {
    try {
      setCreatingStudent(true);
      setStudentCreated(false);

      await axios.post(
        "http://localhost:5000/admin/create-student",
        form
      );

      setStudentCreated(true);

      alert("Student created successfully");

      setForm({
        username: "",
        password: "",
        name: "",
        rollNumber: "",
        faculty: "",
        semester: "",
      });

      fetchStudents();

    } catch (error) {
      console.log(error);

    } finally {
      setCreatingStudent(false);

      // remove green highlight after 2s
      setTimeout(() => setStudentCreated(false), 2000);
    }
  };

  // ================= ADD FACULTY =================
  const addFaculty = async () => {
    await axios.post("http://localhost:5000/faculties", {
      name: facultyName,
    });

    setFacultyName("");
    fetchFaculties();
  };

  // ================= ADD TEACHER =================
  const addTeacher = async () => {
    await axios.post("http://localhost:5000/teachers", {
      username: tUsername,
      password: tPassword,
    });

    setTUsername("");
    setTPassword("");
    fetchTeachers();
  };

  // ================= FILTER =================
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // ================= LOGIN =================
if (!user) {
  return (
    <div style={styles.loginWrapper}>
      <div style={styles.loginCard}>
        <h1 style={styles.loginTitle}>Admin Login</h1>

        <input style={styles.loginInput} placeholder="Username" />
        <input style={styles.loginInput} type="password" placeholder="Password" />

        <button
          style={styles.loginButton}
          onClick={() => setUser({ name: "Admin" })}
        >
          Login
        </button>
      </div>
    </div>
  );
}

  // ================= UI =================
  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2>🎓 Admin Panel</h2>

        <button
          style={
            activeTab === "dashboard"
              ? styles.activeBtn
              : styles.sideBtn
          }
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>

        <button
          style={
            activeTab === "students"
              ? styles.activeBtn
              : styles.sideBtn
          }
          onClick={() => setActiveTab("students")}
        >
          Students
        </button>

        <button
          style={
            activeTab === "faculty"
              ? styles.activeBtn
              : styles.sideBtn
          }
          onClick={() => setActiveTab("faculty")}
        >
          Faculty
        </button>

        <button
          style={
            activeTab === "teachers"
              ? styles.activeBtn
              : styles.sideBtn
          }
          onClick={() => setActiveTab("teachers")}
        >
          Teachers
        </button>

        <button
          style={
            activeTab === "reports"
              ? styles.activeBtn
              : styles.sideBtn
          }
          onClick={() => setActiveTab("reports")}
        >
          Reports
        </button>

        <button
          style={styles.logoutBtn}
          onClick={() => setUser(null)}
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={styles.main}>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div>
            <h1>📊 Overview</h1>

            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                Students: {students.length}
              </div>

              <div style={styles.statCard}>
                Faculty: {faculties.length}
              </div>

              <div style={styles.statCard}>
                Teachers: {teachers.length}
              </div>
            </div>
          </div>
        )}

        {/* STUDENTS */}
{activeTab === "students" && (
  <div>
    <h2>Students</h2>

    {/* SEARCH */}
    <input
      style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "6px", marginBottom: "10px", width: "100%" }}
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search student..."
    />

    {/* CREATE STUDENT */}
    <div style={styles.card}>
      <h3>Create Student Login</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

        <input
          style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
          placeholder="Username"
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
        />

        <input
          style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <input
          style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
          placeholder="Roll Number"
          value={form.rollNumber}
          onChange={(e) =>
            setForm({ ...form, rollNumber: e.target.value })
          }
        />

        <select
          style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
          value={form.faculty}
          onChange={(e) =>
            setForm({ ...form, faculty: e.target.value })
          }
        >
          <option value="">Select Faculty</option>
          {faculties.map((f) => (
            <option key={f._id} value={f._id}>
              {f.name}
            </option>
          ))}
        </select>

        <input
          style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
          placeholder="Semester"
          value={form.semester}
          onChange={(e) =>
            setForm({ ...form, semester: e.target.value })
          }
        />

        <button
          onClick={createStudent}
          disabled={creatingStudent || studentCreated}
          style={{
            padding: "10px",
            background: studentCreated
              ? "#2e7d32"
              : creatingStudent
              ? "#555"
              : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {creatingStudent
            ? "Creating..."
            : studentCreated
            ? "✔ Created"
            : "Create Student"}
        </button>
      </div>
    </div>

    {/* STUDENT LIST */}
    <div style={styles.card}>
      <h3>Student List</h3>

      {filteredStudents.map((s) => (
        <div key={s._id} style={styles.listItem}>
          {s.name} — Sem {s.semester}
        </div>
      ))}
    </div>
  </div>
)}
        {/* FACULTY */}
        {activeTab === "faculty" && (
          <div>
            <h2>Faculty</h2>

            <input
              value={facultyName}
              onChange={(e) =>
                setFacultyName(e.target.value)
              }
              placeholder="Faculty Name"
            />

            <button onClick={addFaculty}>
              Add Faculty
            </button>

            {faculties.map((f) => (
              <div key={f._id}>{f.name}</div>
            ))}
          </div>
        )}

        {/* TEACHERS */}
        {activeTab === "teachers" && (
          <div>
            <h2>Teachers</h2>

            <input
              value={tUsername}
              onChange={(e) =>
                setTUsername(e.target.value)
              }
              placeholder="Username"
            />

            <input
              value={tPassword}
              onChange={(e) =>
                setTPassword(e.target.value)
              }
              placeholder="Password"
            />

            <button onClick={addTeacher}>
              Add Teacher
            </button>

            {teachers.map((t) => (
              <div key={t._id}>{t.username}</div>
            ))}
          </div>
        )}

        {/* REPORTS */}
        {activeTab === "reports" && (
  <div>
    <Reports />
  </div>
)}
      </div>
    </div>
  );
}

// ================= STYLES =================
const styles = {
  container: {
    display: "flex",
    fontFamily: "Arial",
    minHeight: "100vh",
    background: "#f4f6f8",
  },

  sidebar: {
    width: "240px",
    background: "#111827",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  main: {
    flex: 1,
    padding: "20px",
  },

  sideBtn: {
    padding: "10px",
    background: "transparent",
    border: "1px solid #374151",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
    textAlign: "left",
  },

  activeBtn: {
    padding: "10px",
    background: "#4CAF50",
    border: "none",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
    textAlign: "left",
  },

  logoutBtn: {
    marginTop: "20px",
    background: "#ef4444",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  card: {
    background: "white",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "8px",
  },

  statCard: {
    padding: "15px",
    background: "white",
    borderRadius: "8px",
    flex: 1,
  },

  statsRow: {
    display: "flex",
    gap: "10px",
  },

  listItem: {
    padding: "8px",
    borderBottom: "1px solid #ddd",
  },

  loginPage: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  loginWrapper: {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #111827, #1f2937)",
},

loginCard: {
  width: "350px",
  padding: "30px",
  borderRadius: "12px",
  background: "white",
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
},

loginTitle: {
  marginBottom: "10px",
  textAlign: "center",
  color: "#111827",
},

loginInput: {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  outline: "none",
  fontSize: "14px",
},

loginButton: {
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  background: "#4CAF50",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "0.2s",
}
};

export default AdminDashboard;