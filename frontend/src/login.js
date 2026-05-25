import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./App.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      alert(response.data.message);

      const user = response.data.user;

      if (user.role === "admin") navigate("/admin");
      else if (user.role === "teacher") navigate("/teacher");
      else navigate("/studentReport");

    } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          width: "360px",
          padding: "30px",
          borderRadius: "16px",
          background: "white",
          boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "5px", color: "#333" }}>
          🎓 Attendance System
        </h1>

        <p style={{ color: "#777", marginBottom: "20px" }}>
          Login to continue
        </p>

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            outline: "none",
          }}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "18px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            outline: "none",
          }}
        />

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: loading
              ? "#999"
              : "linear-gradient(135deg, #4CAF50, #2e7d32)",
            color: "white",
            fontWeight: "bold",
            transition: "0.2s",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ fontSize: "12px", marginTop: "15px", color: "#888" }}>
         Teacher • Student Login
        </p>
      </div>
    </div>
  );
}

export default Login;