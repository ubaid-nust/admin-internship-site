// src/Admin/View_Batch.jsx
import React, { useState, useEffect } from "react";
import AdminSidebar from "./Sidebar";
import "./admin.css";

const ViewBatch = () => {
  const [batches, setBatches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editingBatch, setEditingBatch] = useState(null);

  const token = localStorage.getItem("token");

  // ===== Fetch Departments =====
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/departments", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch departments");
        const data = await res.json();
        setDepartments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching departments:", err);
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, [token]);

  // ===== Fetch Batches =====
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/batches", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch batches");
        const data = await res.json();
        setBatches(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching batches:", err);
        setBatches([]);
      }
    };
    fetchBatches();
  }, [token]);

  // ===== Open Edit Modal =====
  const handleEditClick = (batch) => {
    setEditingBatch({
      batch_id: String(batch.batch_id ?? ""),
      batch_name: batch.batch_name ?? "",
      batch_year: String(batch.batch_year ?? ""),
      dept_id: String(batch.dept_id ?? ""),
    });
  };

  // ===== Save Batch =====
  const handleSaveBatch = async () => {
    if (!editingBatch) return;

    const payload = {
      batch_year: Number(editingBatch.batch_year),
      batch_name: editingBatch.batch_name,
      dept_id: Number(editingBatch.dept_id) || null,
    };

    try {
      const res = await fetch(
        `http://localhost:5000/api/batches/${encodeURIComponent(
          editingBatch.batch_id
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update batch");
      const { batch: updated } = await res.json(); // ✅ backend returns { message, batch }

      setBatches((prev) =>
        prev.map((b) =>
          String(b.batch_id) === String(editingBatch.batch_id)
            ? { ...b, ...updated }
            : b
        )
      );

      setEditingBatch(null);
      alert("Batch updated successfully!");
    } catch (err) {
      console.error("Error updating batch:", err);
      alert(err.message || "Failed to update batch");
    }
  };

  // ===== Delete Batch =====
  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm("Are you sure you want to delete this batch?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/batches/${encodeURIComponent(batchId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete batch");

      setBatches((prev) =>
        prev.filter((b) => String(b.batch_id) !== String(batchId))
      );
      setEditingBatch(null);
      alert("Batch deleted successfully!");
    } catch (err) {
      console.error("Error deleting batch:", err);
      alert(err.message || "Failed to delete batch");
    }
  };

  // ===== Handle Form Change =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingBatch((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container">
      <AdminSidebar />
      <div className="main-content">
        <div className="batch-management">
          <div className="header-section">
            <h1 className="page-title">Batch Management</h1>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Start Year</th>
                  <th>End Year</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(batches) && batches.length > 0 ? (
                  batches.map((batch) => {
                    const start = Number(batch.batch_year);
                    const end = isNaN(start) ? "" : start + 4;
                    const dept =
                      batch.dept_name ||
                      departments.find((d) => d.dept_id === batch.dept_id)
                        ?.dept_name ||
                      "Unknown";

                    return (
                      <tr key={batch.batch_id}>
                        <td>{batch.batch_name || `Batch-${batch.batch_id}`}</td>
                        <td>{isNaN(start) ? "" : start}</td>
                        <td>{end}</td>
                        <td>{dept}</td>
                        <td className="actions-cell">
                          <button
                            className="button-style edit-button"
                            onClick={() => handleEditClick(batch)}
                          >
                            Edit
                          </button>
                          <button
                            className="button-style delete-button"
                            onClick={() => handleDeleteBatch(batch.batch_id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No batches found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Edit Batch Modal */}
          {editingBatch && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Edit Batch Information</h3>

                <div className="form-group">
                  <label className="label-style">Batch Name</label>
                  <input
                    type="text"
                    name="batch_name"
                    value={editingBatch.batch_name ?? ""}
                    onChange={handleInputChange}
                    className="input-style"
                  />
                </div>

                <div className="form-group">
                  <label className="label-style">Start Year</label>
                  <input
                    type="number"
                    name="batch_year"
                    value={editingBatch.batch_year ?? ""}
                    onChange={handleInputChange}
                    className="input-style"
                    min="2000"
                    max="2100"
                  />
                </div>

                <div className="form-group">
                  <label className="label-style">Department</label>
                  <select
                    name="dept_id"
                    value={editingBatch.dept_id ?? ""}
                    onChange={handleInputChange}
                    className="select-style"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.dept_id} value={dept.dept_id}>
                        {dept.dept_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-actions">
                  <button
                    className="button-style save-button"
                    onClick={handleSaveBatch}
                  >
                    Save Changes
                  </button>
                  <button
                    className="button-style cancel-button"
                    onClick={() => setEditingBatch(null)}
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

export default ViewBatch;
