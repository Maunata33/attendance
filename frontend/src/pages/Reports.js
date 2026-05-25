import React, { useEffect, useState } from "react";
import axios from "axios";

function ReportPage() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [data, setData] = useState([]);
  const [faculties, setFaculties] = useState([]);

  const [faculty, setFaculty] = useState("");
  const [semester, setSemester] = useState("");

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    const res = await axios.get("http://localhost:5000/faculties");
    setFaculties(res.data);
  };

  const fetchReport = async () => {
    try {
      if (!user) {
        console.warn("Reports: no logged-in user");
        return;
      }

      let url = "http://localhost:5000/report";

      const params = [];

      if (user.role === "student") {
        params.push(`studentId=${user.id}`);
      }

      if (faculty) {
        params.push(`faculty=${faculty}`);
      }

      if (semester) {
        params.push(`semester=${semester}`);
      }

      if (params.length > 0) {
        url += "?" + params.join("&");
      }

      const res = await axios.get(url);
      setData(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Please login to view attendance reports</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>📊 Attendance Report</h2>

      {/* FILTERS */}
      {user.role !== "student" && (
        <div style={{ marginBottom: "20px" }}>
          <select
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
          >
            <option value="">Select Faculty</option>

            {faculties.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name}
              </option>
            ))}
          </select>

          <input
            placeholder="Semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            style={{ marginLeft: "10px" }}
          />

          <button
            onClick={fetchReport}
            style={{ marginLeft: "10px" }}
          >
            View Report
          </button>
        </div>
      )}

      {/* DATA */}
      {data.map((d) => (
        <div
          key={d.student._id}
          style={{
            border: "1px solid #ddd",
            margin: "10px",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <h3>{d.student.name}</h3>

          <p>Total: {d.total}</p>
          <p>Present: {d.present}</p>
          <p>Absent: {d.absent}</p>
          <p>Percentage: {d.percentage}%</p>

          <div style={{ fontSize: "12px", color: "gray" }}>
            {d.records.map((r) => (
              <div key={r._id}>
                {new Date(r.date).toDateString()} — {r.status}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReportPage;