import React, { useState } from "react";
import "./AdminLogin.css";
import { useNavigate } from "react-router-dom";
import nustLogo from "../images/nust-logo.png";
import mcsLogo from "../images/mcs-logo.png";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_id: username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || "Login failed");
        return;
      }

      console.log("✅ Login successful:", data);

      // Save admin info and JWT token
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // Navigate to admin dashboard / entity page
      navigate("/admin/entity");
    } catch (err) {
      console.error("Login error:", err);
      setError("Server not responding. Try again later.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box admin-theme">
        <div className="login-box-header">
          <img src={nustLogo} alt="NUST Logo" className="nust-logo" />
          <img src={mcsLogo} alt="MCS Logo" className="mcs-logo" />
        </div>

        <div className="login-header">
          <h1>Admin Login</h1>
          <p>Sign in to your account</p>
        </div>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleLogin}>
          <label htmlFor="username">UserName</label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Log In</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
