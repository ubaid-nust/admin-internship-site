// src/Admin/View_Course_Advisors.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "./Sidebar";
import "./admin.css";

const ViewCourseAdvisor = () => {
  const [advisors, setAdvisors] = useState([]);
  const [editingAdvisor, setEditingAdvisor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [batches, setBatches] = useState([]);

  const token = localStorage.getItem("token");

  // fetch data (advisors + batches) — reusable so we can call after update/delete
  const fetchData = async () => {
    try {
      const [advisorRes, batchRes] = await Promise.all([
        axios.get("http://localhost:5000/api/course-advisors", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/batches", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setAdvisors(
        Array.isArray(advisorRes.data)
          ? advisorRes.data
          : advisorRes.data.advisors || []
      );

      setBatches(
        Array.isArray(batchRes.data)
          ? batchRes.data
          : batchRes.data.batches || []
      );
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleEditClick = (advisor) => {
    // initialize password as empty so admin doesn't see hashed password and can enter a new one
    setEditingAdvisor({
      ...advisor,
      password: "",           // empty by default (editable)
      batch_id: advisor.batch_id ?? "" // ensure batch_id present for select value
    });
  };

  const handleDeleteAdvisor = async (advisorId) => {
    if (!window.confirm("Are you sure you want to delete this advisor?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/course-advisors/${advisorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // refresh list
      await fetchData();

      setEditingAdvisor(null);
      alert("Advisor deleted successfully!");
    } catch (err) {
      console.error("Error deleting advisor:", err.response?.data || err);
      alert("Failed to delete advisor: " + (err.response?.data?.error || "Unknown error"));
    }
  };

  const handleSaveAdvisor = async () => {
    try {
      if (!editingAdvisor) return;

      const payload = {
        login_id: editingAdvisor.login_id,
        advisor_name: editingAdvisor.advisor_name,
        batch_id: Number(editingAdvisor.batch_id) || null, // ensure number or null
        // do NOT send admin_id; server uses req.admin
      };

      // include password only if admin typed one
      if (editingAdvisor.password && editingAdvisor.password.trim() !== "") {
        payload.password = editingAdvisor.password;
      }

      const res = await axios.put(
        `http://localhost:5000/api/course-advisors/${editingAdvisor.advisor_id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh list from server (ensures batch_name etc are in sync)
      await fetchData();

      setEditingAdvisor(null);
      alert("Advisor updated successfully!");
    } catch (err) {
      console.error("Error updating advisor:", err.response?.data || err);
      alert("Failed to update advisor: " + (err.response?.data?.error || "Unknown error"));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingAdvisor) {
      setEditingAdvisor({ ...editingAdvisor, [name]: value });
    }
  };

  const filteredAdvisors = advisors.filter(
    (advisor) =>
      advisor.advisor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advisor.login_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <AdminSidebar />
      <div className="main-content">
        <div className="advisor-management">
          <div className="header-section">
            <h1 className="page-title">Course Advisor Management</h1>
          </div>

          <div className="search-section">
            <input
              type="text"
              placeholder="Search advisors by name or ID..."
              className="input-style search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Login ID</th>
                  <th>Advisor Name</th>
                  <th>Assigned Batch</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdvisors.map((advisor) => (
                  <tr key={advisor.advisor_id}>
                    <td>{advisor.login_id}</td>
                    <td>{advisor.advisor_name}</td>
                    <td>
                      {advisor.batch_name ??
                        (batches.find((b) => b.batch_id === advisor.batch_id)?.batch_name ?? "Unknown")}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="button-style edit-button"
                        onClick={() => handleEditClick(advisor)}
                      >
                        Edit
                      </button>
                      <button
                        className="button-style delete-button"
                        onClick={() => handleDeleteAdvisor(advisor.advisor_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAdvisors.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">👨‍🏫</div>
                <p className="empty-text">
                  {searchTerm ? "No advisors match your search" : "No advisors found."}
                </p>
              </div>
            )}
          </div>

          {editingAdvisor && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Edit Advisor Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label-style">Login ID</label>
                    <input
                      type="text"
                      name="login_id"
                      value={editingAdvisor.login_id}
                      onChange={handleInputChange}
                      className="input-style"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label-style">Advisor Name</label>
                    <input
                      type="text"
                      name="advisor_name"
                      value={editingAdvisor.advisor_name}
                      onChange={handleInputChange}
                      className="input-style"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label-style">Assigned Batch</label>
                  <select
                    name="batch_id"
                    value={editingAdvisor.batch_id ?? ""}
                    onChange={handleInputChange}
                    className="select-style"
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch) => (
                      <option key={batch.batch_id} value={batch.batch_id}>
                        {batch.batch_name} ({batch.batch_year})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label-style">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={editingAdvisor.password ?? ""}
                      onChange={handleInputChange}
                      placeholder="Leave blank to keep the password same"
                      className="input-style"
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="button-style save-button"
                    onClick={handleSaveAdvisor}
                  >
                    Save Changes
                  </button>
                  <button
                    className="button-style cancel-button"
                    onClick={() => setEditingAdvisor(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ViewCourseAdvisor;
