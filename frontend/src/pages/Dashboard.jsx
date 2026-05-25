import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Reports from "./Reports";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "students", label: "Students", icon: "👥" },
  { key: "faculty", label: "Faculty", icon: "🏫" },
  { key: "teachers", label: "Teachers", icon: "👨‍🏫" },
  { key: "reports", label: "Reports", icon: "📈" },
];

const DEFAULT_BAR_DATA = [
  { m: "Jan", h: 40 },
  { m: "Feb", h: 55 },
  { m: "Mar", h: 45 },
  { m: "Apr", h: 85 },
  { m: "May", h: 70 },
  { m: "Jun", h: 95 },
];

const EMPTY_STUDENT_FORM = {
  username: "",
  password: "",
  name: "",
  rollNumber: "",
  faculty: "",
  semester: "",
};

// ─── Add Student Modal ────────────────────────────────────────────────────────

function AddStudentModal({ onClose, onSubmit, submitting, faculties }) {
  const [form, setForm] = useState(EMPTY_STUDENT_FORM);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = "Required";
    if (!form.password.trim()) errs.password = "Required";
    if (!form.name.trim()) errs.name = "Required";
    if (!form.rollNumber.trim()) errs.rollNumber = "Required";
    if (!form.faculty.trim()) errs.faculty = "Required";
    if (!form.semester.trim()) errs.semester = "Required";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const field = (label, key, type = "text", placeholder = "") => (
    <div style={modal.field}>
      <label style={modal.label}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={set(key)}
        placeholder={placeholder}
        style={{ ...modal.input, ...(errors[key] ? modal.inputError : {}) }}
      />
      {errors[key] && <span style={modal.errorText}>{errors[key]}</span>}
    </div>
  );

  return (
    <div style={modal.backdrop} onClick={onClose}>
      <div style={modal.card} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={modal.header}>
          <div>
            <h2 style={modal.title}>Add New Student</h2>
            <p style={modal.subtitle}>Fill in the student's account and academic details.</p>
          </div>
          <button style={modal.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div style={modal.body}>
          <div style={modal.section}>
            <p style={modal.sectionLabel}>Account credentials</p>
            <div style={modal.row}>
              {field("Username", "username", "text", "e.g. Astha Koiraxa")}
              {field("Password", "password", "password", "Min. 6 characters")}
            </div>
          </div>

          <div style={modal.section}>
            <p style={modal.sectionLabel}>Personal information</p>
            <div style={modal.row}>
              {field("Full name", "name", "text", "e.g. Astha Koirala")}
              {field("Roll number", "rollNumber", "text", "e.g. 10")}
            </div>
          </div>

          <div style={modal.section}>
            <p style={modal.sectionLabel}>Academic details</p>
            <div style={modal.row}>
              <div style={modal.field}>
                <label style={modal.label}>Faculty</label>
                {faculties && faculties.length > 0 ? (
                  <select
                    value={form.faculty}
                    onChange={set("faculty")}
                    style={{ ...modal.input, ...(errors.faculty ? modal.inputError : {}) }}
                  >
                    <option value="">Select faculty…</option>
                    {faculties.map((f) => (
                      <option key={f._id} value={f._id}>{f.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.faculty}
                    onChange={set("faculty")}
                    placeholder="Faculty ID"
                    style={{ ...modal.input, ...(errors.faculty ? modal.inputError : {}) }}
                  />
                )}
                {errors.faculty && <span style={modal.errorText}>{errors.faculty}</span>}
              </div>

              <div style={modal.field}>
                <label style={modal.label}>Semester</label>
                <select
                  value={form.semester}
                  onChange={set("semester")}
                  style={{ ...modal.input, ...(errors.semester ? modal.inputError : {}) }}
                >
                  <option value="">Select semester…</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={String(s)}>Semester {s}</option>
                  ))}
                </select>
                {errors.semester && <span style={modal.errorText}>{errors.semester}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={modal.footer}>
          <button style={modal.cancelBtn} onClick={onClose} disabled={submitting}>Cancel</button>
          <button style={modal.submitBtn} onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creating…" : "Create Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

const modal = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16,
  },
  card: {
    background: "#ffffff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 600,
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "24px 28px 20px",
    borderBottom: "1px solid #e5e7eb",
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#6b7280",
  },
  closeBtn: {
    border: "none",
    background: "#f3f4f6",
    borderRadius: 8,
    width: 32,
    height: 32,
    cursor: "pointer",
    fontSize: 14,
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  body: {
    padding: "20px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  sectionLabel: {
    margin: 0,
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#9ca3af",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1.5px solid #d1d5db",
    fontSize: 14,
    outline: "none",
    color: "#111827",
    background: "#fff",
    transition: "border-color 0.15s",
  },
  inputError: {
    borderColor: "#dc2626",
    background: "#fff5f5",
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    padding: "16px 28px 24px",
    borderTop: "1px solid #e5e7eb",
  },
  cancelBtn: {
    padding: "11px 20px",
    borderRadius: 12,
    border: "1.5px solid #d1d5db",
    background: "transparent",
    color: "#374151",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
  },
  submitBtn: {
    padding: "11px 24px",
    borderRadius: 12,
    border: "none",
    background: "#0f766e",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
  },
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [facultyName, setFacultyName] = useState("");
  const [teacherUsername, setTeacherUsername] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [creatingTeacher, setCreatingTeacher] = useState(false);
  const [creatingFaculty, setCreatingFaculty] = useState(false);

  // Modal state
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [creatingStudent, setCreatingStudent] = useState(false);

  const user = useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  }, []);

  const token = localStorage.getItem("token");

  const api = useMemo(() => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axios.create({ baseURL: "http://localhost:5000", headers });
  }, [token]);

  const filteredStudents = useMemo(() => {
    if (!search) return students;
    return students.filter((student) =>
      student.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, students]);

  const totalStudents = students.length;
  const totalFaculty = faculties.length;
  const totalTeachers = teachers.length;
  const totalAttendance = attendance.length;
  const presentCount = attendance.filter((record) =>
    ["Present", "present"].includes(record.status)
  ).length;
  const attendanceRate =
    totalAttendance === 0 ? 0 : Math.round((presentCount / totalAttendance) * 100);

  const barData = useMemo(() => {
    if (!attendance.length) return DEFAULT_BAR_DATA;
    const monthCounts = {};
    attendance.forEach((record) => {
      const date = new Date(record.date);
      if (Number.isNaN(date.getTime())) return;
      const label = date.toLocaleString("en-US", { month: "short" });
      monthCounts[label] = (monthCounts[label] || 0) + 1;
    });
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((m) => ({
      m,
      h: Math.min((monthCounts[m] || 0) * 10 + 35, 100),
      bold: m === "Apr",
    }));
  }, [attendance]);

  useEffect(() => {
    if (!user || !token) { navigate("/"); return; }
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [studentRes, facultyRes, teacherRes, attendanceRes] = await Promise.all([
        api.get("/students"),
        api.get("/faculties"),
        api.get("/teachers"),
        api.get("/attendance"),
      ]);
      setStudents(studentRes.data || []);
      setFaculties(facultyRes.data || []);
      setTeachers(teacherRes.data || []);
      setAttendance(attendanceRes.data || []);
    } catch (error) {
      console.error("Dashboard load failed", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleAddFaculty = async () => {
    if (!facultyName.trim()) { alert("Enter a faculty name before adding."); return; }
    setCreatingFaculty(true);
    try {
      await api.post("/faculties", { name: facultyName.trim() });
      setFacultyName("");
      fetchDashboardData();
    } catch (error) {
      console.error("Add faculty failed", error);
      alert(error.response?.data?.message || "Unable to add faculty.");
    } finally {
      setCreatingFaculty(false);
    }
  };

  const handleAddTeacher = async () => {
    if (!teacherUsername.trim() || !teacherPassword.trim()) {
      alert("Enter teacher username and password.");
      return;
    }
    setCreatingTeacher(true);
    try {
      await api.post("/teachers", {
        username: teacherUsername.trim(),
        password: teacherPassword.trim(),
      });
      setTeacherUsername("");
      setTeacherPassword("");
      fetchDashboardData();
    } catch (error) {
      console.error("Add teacher failed", error);
      alert(error.response?.data?.message || "Unable to add teacher.");
    } finally {
      setCreatingTeacher(false);
    }
  };

  // Opens modal
  const handleAddStudent = useCallback(() => setShowStudentModal(true), []);

  // Called by modal on submit
  const handleStudentSubmit = async (formData) => {
    setCreatingStudent(true);
    try {
      await api.post("/admin/create-student", {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        rollNumber: formData.rollNumber,
        faculty: formData.faculty,
        semester: formData.semester,
      });
      setShowStudentModal(false);
      fetchDashboardData();
    } catch (error) {
      console.error("Create student failed", error);
      alert(error.response?.data?.message || "Unable to create student.");
    } finally {
      setCreatingStudent(false);
    }
  };

  if (!user) return null;

  return (
    <div style={styles.page}>
      {/* Add Student Modal */}
      {showStudentModal && (
        <AddStudentModal
          onClose={() => setShowStudentModal(false)}
          onSubmit={handleStudentSubmit}
          submitting={creatingStudent}
          faculties={faculties}
        />
      )}

      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div>
            <h1 style={styles.brandTitle}>EduAdmin Pro</h1>
            <p style={styles.brandSubtitle}>Administrative Portal</p>
          </div>
        </div>
        <nav style={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                style={{
                  ...styles.navButton,
                  ...(active ? styles.navButtonActive : styles.navButtonInactive),
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
        <div style={styles.profileCard}>
          <div style={styles.profileMeta}>
            <div style={styles.avatar} />
            <div>
              <p style={styles.profileName}>{user.username || "Academic HQ"}</p>
              <p style={styles.profileRole}>{user.role || "System Admin"}</p>
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h2 style={styles.pageTitle}>Attendance Report</h2>
            <p style={styles.pageDescription}>Institutional dashboard for academic operations.</p>
          </div>
          <div style={styles.headerActions}>
            <div style={styles.searchWrapper}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search students, faculty, or IDs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <button style={styles.iconButton}>🔔</button>
            <button style={styles.iconButton}>⚙️</button>
          </div>
        </header>

        <div style={styles.content}>
          {activeTab === "dashboard" && (
            <section>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <p style={styles.statLabel}>Total Students</p>
                  <h3 style={styles.statValue}>{totalStudents}</h3>
                </div>
                <div style={styles.statCard}>
                  <p style={styles.statLabel}>Active Faculty</p>
                  <h3 style={styles.statValue}>{totalFaculty}</h3>
                </div>
                <div style={styles.statCard}>
                  <p style={styles.statLabel}>Teachers</p>
                  <h3 style={styles.statValue}>{totalTeachers}</h3>
                </div>
                <div style={styles.statCard}>
                  <p style={styles.statLabel}>Attendance Rate</p>
                  <h3 style={styles.statValue}>{attendanceRate}%</h3>
                </div>
              </div>

              <div style={styles.chartCard}>
                <div style={styles.chartHeader}>
                  <h4 style={styles.cardTitle}>Student Enrollment Trend</h4>
                  <button style={styles.smallButton} onClick={() => setActiveTab("reports")}>
                    View Reports
                  </button>
                </div>
                <div style={styles.chartGrid}>
                  {barData.map((bar) => (
                    <div key={bar.m} style={styles.barColumn}>
                      <div
                        style={{
                          ...styles.barFill,
                          height: `${bar.h}%`,
                          background: bar.bold ? "#0f766e" : "#2563eb",
                        }}
                      />
                      <span style={styles.barLabel}>{bar.m}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.quickActions}>
                <button style={styles.actionButton} onClick={handleAddStudent}>
                  Add New Student
                </button>
                <button style={styles.actionButton} onClick={() => setActiveTab("reports")}>
                  Generate Report
                </button>
                <button
                  style={styles.actionButton}
                  onClick={() => alert("Faculty meeting has been scheduled.")}
                >
                  Schedule Meeting
                </button>
              </div>
            </section>
          )}

          {activeTab === "students" && (
            <section>
              <div style={styles.sectionHeader}>
                <div>
                  <h3 style={styles.sectionTitle}>Student Directory</h3>
                  <p style={styles.sectionSubtitle}>
                    Manage enrolled student profiles and attendance records.
                  </p>
                </div>
                <button style={styles.primaryButton} onClick={handleAddStudent}>
                  Add Student
                </button>
              </div>

              <div style={styles.tableWrapper}>
                {loading ? (
                  <p>Loading students…</p>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Roll Number</th>
                        <th style={styles.th}>Faculty</th>
                        <th style={styles.th}>Semester</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student._id} style={styles.tr}>
                          <td style={styles.td}>{student.name}</td>
                          <td style={styles.td}>{student.rollNumber}</td>
                          <td style={styles.td}>{student.faculty?.name || "N/A"}</td>
                          <td style={styles.td}>{student.semester}</td>
                          <td style={styles.td}>{student.userId ? "Active" : "Pending"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {activeTab === "faculty" && (
            <section>
              <div style={styles.sectionHeader}>
                <div>
                  <h3 style={styles.sectionTitle}>Faculty Management</h3>
                  <p style={styles.sectionSubtitle}>Add and review faculty departments.</p>
                </div>
              </div>
              <div style={styles.inlineForm}>
                <input
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  placeholder="Faculty Name"
                  style={styles.input}
                />
                <button
                  style={styles.primaryButton}
                  onClick={handleAddFaculty}
                  disabled={creatingFaculty}
                >
                  {creatingFaculty ? "Adding..." : "Add Faculty"}
                </button>
              </div>
              <div style={styles.cardGrid}>
                {faculties.map((faculty) => (
                  <div key={faculty._id} style={styles.smallCard}>
                    <p style={styles.cardHeading}>{faculty.name}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === "teachers" && (
            <section>
              <div style={styles.sectionHeader}>
                <div>
                  <h3 style={styles.sectionTitle}>Teachers</h3>
                  <p style={styles.sectionSubtitle}>
                    Manage teacher accounts and assignments.
                  </p>
                </div>
              </div>
              <div style={styles.inlineForm}>
                <input
                  placeholder="Username"
                  value={teacherUsername}
                  onChange={(e) => setTeacherUsername(e.target.value)}
                  style={styles.input}
                />
                <input
                  placeholder="Password"
                  type="password"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  style={styles.input}
                />
                <button
                  style={styles.primaryButton}
                  onClick={handleAddTeacher}
                  disabled={creatingTeacher}
                >
                  {creatingTeacher ? "Adding..." : "Add Teacher"}
                </button>
              </div>
              <div style={styles.cardGrid}>
                {teachers.map((teacher) => (
                  <div key={teacher._id} style={styles.smallCard}>
                    <p style={styles.cardHeading}>{teacher.username}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === "reports" && (
            <section>
              <Reports />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    background: "#f3f4f6",
  },
  sidebar: {
    width: 280,
    minHeight: "100vh",
    background: "#111827",
    color: "white",
    display: "flex",
    flexDirection: "column",
    padding: 24,
    boxSizing: "border-box",
    position: "sticky",
    top: 0,
  },
  brand: { marginBottom: 24 },
  brandTitle: { margin: 0, fontSize: 22, fontWeight: 700 },
  brandSubtitle: { marginTop: 8, color: "#9ca3af", fontSize: 12 },
  nav: { display: "flex", flexDirection: "column", gap: 10, flex: 1 },
  navButton: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "12px 16px",
    border: "none",
    borderRadius: 12,
    fontSize: 14,
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.2s, color 0.2s",
  },
  navButtonActive: { background: "rgba(255,255,255,0.1)", color: "white" },
  navButtonInactive: { background: "transparent", color: "#9ca3af" },
  navIcon: { width: 28, display: "inline-flex", justifyContent: "center" },
  profileCard: {
    marginTop: 32,
    paddingTop: 24,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  profileMeta: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
  avatar: { width: 50, height: 50, borderRadius: 14, background: "#1f2937" },
  profileName: { margin: 0, fontSize: 14, fontWeight: 700 },
  profileRole: { margin: 0, fontSize: 12, color: "#9ca3af" },
  logoutBtn: {
    width: "100%",
    padding: "12px 16px",
    border: "none",
    borderRadius: 12,
    background: "#dc2626",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
  },
  main: { flex: 1, padding: 24, paddingLeft: 32 },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  pageTitle: { margin: 0, fontSize: 28, fontWeight: 700 },
  pageDescription: { margin: "8px 0 0", color: "#6b7280" },
  headerActions: { display: "flex", gap: 12, alignItems: "center" },
  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "white",
    borderRadius: 12,
    padding: "0 12px",
    minWidth: 260,
    border: "1px solid #d1d5db",
  },
  searchIcon: { marginRight: 8, color: "#6b7280" },
  searchInput: { border: "none", outline: "none", flex: 1, height: 42, fontSize: 14 },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    border: "none",
    background: "white",
    cursor: "pointer",
    fontSize: 18,
  },
  content: { display: "flex", flexDirection: "column", gap: 24 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: "white",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  },
  statLabel: {
    margin: 0,
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  statValue: { margin: "16px 0 0", fontSize: 32, fontWeight: 700 },
  chartCard: {
    background: "white",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  cardTitle: { margin: 0, fontSize: 18, fontWeight: 700 },
  smallButton: {
    border: "1px solid #2563eb",
    background: "transparent",
    color: "#2563eb",
    borderRadius: 9999,
    padding: "10px 16px",
    cursor: "pointer",
  },
  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
    gap: 16,
    alignItems: "flex-end",
    minHeight: 240,
  },
  barColumn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  barFill: { width: "100%", borderRadius: 16, transition: "height 0.3s ease" },
  barLabel: { fontSize: 12, color: "#6b7280" },
  quickActions: { display: "flex", gap: 12, flexWrap: "wrap" },
  actionButton: {
    flex: 1,
    minWidth: 180,
    padding: "14px 18px",
    borderRadius: 16,
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 15px 30px rgba(37, 99, 235, 0.12)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  sectionTitle: { margin: 0, fontSize: 22, fontWeight: 700 },
  sectionSubtitle: { margin: "8px 0 0", color: "#6b7280" },
  primaryButton: {
    border: "none",
    borderRadius: 14,
    background: "#0f766e",
    color: "white",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },
  tableWrapper: {
    overflowX: "auto",
    background: "white",
    borderRadius: 20,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
    padding: 20,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: 14,
    textAlign: "left",
    color: "#374151",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  tr: { transition: "background 0.2s ease" },
  td: { padding: 14, borderBottom: "1px solid #e5e7eb", color: "#4b5563" },
  inlineForm: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  input: {
    flex: 1,
    minWidth: 220,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #d1d5db",
    outline: "none",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
  },
  smallCard: {
    background: "white",
    borderRadius: 20,
    padding: 18,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  },
  cardHeading: { margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" },
};

export default Dashboard;
