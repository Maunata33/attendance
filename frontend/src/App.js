import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./login";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentReport from "./pages/StudentReport";
import Reports from "./pages/Reports";

// Main routing system
function App() {
  return (
    <Router>
      <Routes>

        {/* Login route */}
        <Route path="/" element={<Login />} />

        {/* Dashboards */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/studentReport" element={<StudentReport />} />
        <Route path="/reports" element={<Reports />} />

      </Routes>
    </Router>
  );
}

export default App;