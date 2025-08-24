// src/Admin/EntityMaking.jsx
import React, { useState, useEffect } from "react";
import AdminSidebar from "./Sidebar";
import bcrypt from "bcryptjs";
import "./admin.css";

const EntityMaking = () => {
  const [selectedEntity, setSelectedEntity] = useState("");
  const [formData, setFormData] = useState({});

  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);

  // const savedAdmin = JSON.parse(localStorage.getItem("admin"));
  // const [admin] = useState(savedAdmin || {});

  const token = localStorage.getItem("token");

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/departments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setDepartments([]);
    }
  };

  // Fetch batches
  const fetchBatches = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/batches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching batches:", err);
      setBatches([]);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDepartments();
      fetchBatches();
    }
  }, [token]);

  const handleEntityChange = (e) => {
    setSelectedEntity(e.target.value);
    setFormData({});
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      let dataToSend = { ...formData };

      let url = "";
      switch (selectedEntity) {
        case "Student":
          url = "http://localhost:5000/api/students";
          // dataToSend.admin_id = admin.admin_id;
          break;
        case "Course Advisor":
          url = "http://localhost:5000/api/course-advisors";
          // dataToSend.admin_id = admin.admin_id;
          break;
        case "Batch":
          url = "http://localhost:5000/api/batches";
          break;
        case "Department":
          url = "http://localhost:5000/api/departments";
          break;
        default:
          alert("Please select an entity");
          return;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();
      if (!response.ok) {
        alert(`Error: ${result.error || result.message}`);
        return;
      }

      alert(`${selectedEntity} added successfully!`);
      setFormData({});
      setSelectedEntity("");

      // Refresh dropdowns if needed
      if (selectedEntity === "Department") fetchDepartments();
      if (selectedEntity === "Batch") fetchBatches();
    } catch (error) {
      console.error("Add Entity Error:", error);
      alert("Server error. Please try again.");
    }
  };

  const renderForm = () => {
    switch (selectedEntity) {
      case "Batch":
        return (
          <>
            <label className="label-style">Batch Name</label>
            <input name="batch_name" className="input-style" onChange={handleInputChange} required />
            <label className="label-style">Batch Year</label>
            <input
              name="batch_year"
              type="number"
              min="2000"
              max="2100"
              className="input-style"
              onChange={handleInputChange}
              required
            />
            <label className="label-style">Department</label>
            <select name="dept_id" className="select-style" onChange={handleInputChange} required>
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.dept_id} value={dept.dept_id}>
                  {dept.dept_name}
                </option>
              ))}
            </select>
          </>
        );

      case "Department":
        return (
          <>
            <label className="label-style">Department Name</label>
            <input name="dept_name" className="input-style" onChange={handleInputChange} required />
          </>
        );

      case "Student":
        return (
          <>
            <label className="label-style">Login ID</label>
            <input name="login_id" className="input-style" onChange={handleInputChange} required />
            <label className="label-style">Password</label>
            <input type="password" name="password" className="input-style" onChange={handleInputChange} required />
            <label className="label-style">Student Name</label>
            <input name="student_name" className="input-style" onChange={handleInputChange} required />
            <label className="label-style">Registration Number</label>
            <input name="registration_number" className="input-style" onChange={handleInputChange} required />
            <label className="label-style">Batch</label>
            <select name="batch_id" className="select-style" onChange={handleInputChange} required>
              <option value="">Select Batch</option>
              {batches.map((batch) => (
                <option key={batch.batch_id} value={batch.batch_id}>
                  {batch.batch_name} ({batch.batch_year})
                </option>
              ))}
            </select>
          </>
        );

      case "Course Advisor":
        return (
          <>
            <label className="label-style">Login ID</label>
            <input name="login_id" className="input-style" onChange={handleInputChange} required />
            <label className="label-style">Password</label>
            <input type="password" name="password" className="input-style" onChange={handleInputChange} required />
            <label className="label-style">Advisor Name</label>
            <input name="advisor_name" className="input-style" onChange={handleInputChange} required />
            <label className="label-style">Batch</label>
            <select name="batch_id" className="select-style" onChange={handleInputChange} required>
              <option value="">Select Batch</option>
              {batches.map((batch) => (
                <option key={batch.batch_id} value={batch.batch_id}>
                  {batch.batch_name} ({batch.batch_year})
                </option>
              ))}
            </select>
          </>
        );

      default:
        return (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p className="empty-text">Select an entity type to start adding records</p>
          </div>
        );
    }
  };

  return (
    <div className="container">
      <AdminSidebar />
      <div className="main-content">
        <div className="form-container">
          <h1 className="page-title">Add New Record</h1>

          <div className="entity-selector">
            <label className="label-style">Select Entity Type</label>
            <select className="select-style" value={selectedEntity} onChange={handleEntityChange}>
              <option value="">Select Entity</option>
              <option value="Student">Student</option>
              <option value="Course Advisor">Course Advisor</option>
              <option value="Batch">Batch</option>
              <option value="Department">Department</option>
            </select>
          </div>

          <div className="form-section">{renderForm()}</div>

          {selectedEntity && (
            <button onClick={handleAdd} className="button-style submit-button">
              Add {selectedEntity}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntityMaking;