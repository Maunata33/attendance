import React, { useEffect, useState } from "react";
import axios from "axios";

function StudentReport() {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("USER:", user);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        if (!user?.studentId) return;

        setLoading(true);

        const res = await axios.get(
  `http://localhost:5000/report/${user.studentId}`
);

        // backend returns array → take first student
        setReport(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [user?.studentId]);

  if (!user) return <h2>Not logged in</h2>;
  if (loading) return <h2>Loading report...</h2>;
  if (!report) return <h2>No attendance records found</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>📊 My Attendance Report</h2>
      console.log("Student ID:", user.studentId);

      <h3>{report.student?.name}</h3>

      <p>Total: {report.totalClasses}</p>
      <p>Present: {report.presentCount}</p>
      <p>Absent: {report.absentCount}</p>
      <p>Percentage: {report.percentage}%</p>

      <h3>Daily Records</h3>

      {report.records?.map((r) => (
        <div key={r._id}>
          {new Date(r.date).toDateString()} - {r.status}
        </div>
      ))}
    </div>
  );
}

export default StudentReport;