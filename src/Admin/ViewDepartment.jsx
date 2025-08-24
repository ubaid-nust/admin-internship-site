// src/Admin/View_Department.jsx
import React, { useState, useEffect } from 'react';
import AdminSidebar from './Sidebar';
import './admin.css';

const ViewDepartment = () => {
  const [departments, setDepartments] = useState([]);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [newName, setNewName] = useState('');

  // ✅ Fetch departments from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/departments", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(err => console.error("Error fetching departments:", err));
  }, []);

  const handleEditClick = (dept) => {
    setEditingDepartment(dept.dept_id);
    setNewName(dept.dept_name);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/departments/${editingDepartment}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ dept_name: newName })
      });

      if (!res.ok) throw new Error("Failed to update department");
      const data = await res.json();

      setDepartments(departments.map(d =>
        d.dept_id === editingDepartment ? data.department : d
      ));

      setEditingDepartment(null);
      setNewName('');
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // ✅ Delete department
  const handleDelete = async (deptId) => {
    if (!window.confirm("Are you sure you want to delete this Department?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/departments/${deptId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!res.ok) throw new Error("Failed to delete department");

      setDepartments(departments.filter(d => d.dept_id !== deptId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="container">
      <AdminSidebar />
      <div className="main-content">
        <h1 className="page-title">Department Management</h1>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.dept_id}>
                  <td>
                    {editingDepartment === dept.dept_id ? (
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="input-style"
                      />
                    ) : (
                      dept.dept_name
                    )}
                  </td>
                  <td>
                    {editingDepartment === dept.dept_id ? (
                      <>
                        <button className="button-style save-button" onClick={handleSave}>
                          Save
                        </button>
                        <button
                          className="button-style cancel-button"
                          onClick={() => setEditingDepartment(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="button-style edit-button"
                          onClick={() => handleEditClick(dept)}
                        >
                          Edit
                        </button>
                        <button
                          className="button-style delete-button"
                          onClick={() => handleDelete(dept.dept_id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center' }}>
                    No Departments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewDepartment;