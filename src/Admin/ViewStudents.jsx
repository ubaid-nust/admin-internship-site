// src/Admin/View_Students.jsx
import React, { useState, useEffect } from "react";
import AdminSidebar from "./Sidebar";
import "./admin.css";

const ViewStudentsAdmin = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [batches, setBatches] = useState([]);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Fetch batches
  const fetchBatches = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/batches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch batches");
      const data = await res.json();
      setBatches(data);
    } catch (err) {
      console.error("Batch fetch error:", err);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Student fetch error:", err);
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchStudents();
  }, []);

  const getBatchInfo = (batchId) => {
    const batch = batches.find((b) => b.batch_id === batchId);
    return batch ? `${batch.batch_name} (${batch.batch_year})` : batchId;
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registration_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesBatch = batchFilter
      ? student.batch_id === Number(batchFilter)
      : true;

    return matchesSearch && matchesBatch;
  });

  const handleViewClick = async (student) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/students/${student.student_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch student details");
      const fresh = await res.json();
      setSelectedStudent(fresh);
    } catch (e) {
      console.error(e);
      setSelectedStudent(student);
    }
  };

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setSelectedStudent({ ...selectedStudent, [name]: value });
  };

  const handleSaveStudent = async () => {
    try {
      const updateData = { ...selectedStudent };
      if (!updateData.password) delete updateData.password;

      const original = students.find(
        (s) => s.student_id === selectedStudent.student_id
      );
      if (updateData.login_id === original.login_id) delete updateData.login_id;

      const response = await fetch(
        `http://localhost:5000/api/students/${selectedStudent.student_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update student");
      }

      await fetchStudents();
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error updating student:", error);
      alert(error.message);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    try {
      const response = await fetch(`http://localhost:5000/api/students/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || data.message || "Failed to delete student"
        );

      setStudents((prev) => prev.filter((s) => s.student_id !== id));
      alert(data.message || "Student deleted successfully");
    } catch (error) {
      console.error("Error deleting student:", error);
      alert(error.message);
    }
  };

  const downloadCV = async (studentId) => {
    if (!studentId) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/students/${studentId}/cv/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Failed to download CV");

      // ✅ Get filename from Content-Disposition
      const disposition = res.headers.get("Content-Disposition");
      let filename = `CV_${studentId}`;
      if (disposition && disposition.includes("filename=")) {
        filename = disposition
          .split("filename=")[1]
          .replace(/["']/g, "")
          .trim();
      }

      // ✅ Create blob with correct mime type
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // ✅ Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // ✅ Cleanup
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("CV download error:", e);
      alert("Could not download CV");
    }
  };

  const openCV = async (studentId) => {
    if (!studentId) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/students/${studentId}/cv/open`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to open CV");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (e) {
      console.error(e);
      alert("Could not open CV");
    }
  };

  return (
    <div className="container">
      <AdminSidebar />
      <div className="main-content">
        <div className="student-management">
          <div className="header-section">
            <h1 className="page-title">Student Management</h1>
            <div className="summary-stats">
              <span>Total Students: {students.length}</span>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-section">
            <div className="search-filter">
              <input
                type="text"
                placeholder="Search students by name or ID..."
                className="input-style search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Batch:</label>
              <select
                className="select-style filter-select"
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
              >
                <option value="">All Batches</option>
                {batches.map((batch) => (
                  <option key={batch.batch_id} value={batch.batch_id}>
                    {batch.batch_name} ({batch.batch_year})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Login ID</th>
                  <th>Student Name</th>
                  <th>Batch</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.student_id}>
                    <td>{student.login_id}</td>
                    <td>{student.student_name}</td>
                    <td>{getBatchInfo(student.batch_id)}</td>
                    <td className="actions-cell">
                      <button
                        className="button-style view-button"
                        onClick={() => handleViewClick(student)}
                      >
                        View/Edit
                      </button>
                      {role === "admin" && (
                        <button
                          className="button-style delete-button"
                          onClick={() =>
                            handleDeleteStudent(student.student_id)
                          }
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">👨‍🎓</div>
                <p className="empty-text">
                  {searchTerm || batchFilter
                    ? "No students match your search criteria"
                    : "No students found. Add students to get started."}
                </p>
              </div>
            )}
          </div>

          {/* Modal */}
          {selectedStudent && (
            <div className="modal-overlay">
              <div className="modal-content wide-modal">
                <h3>Student Details: {selectedStudent.student_name}</h3>
                <div className="detail-section">
                  <div className="detail-group">
                    <h4 className="detail-heading">Personal Information</h4>
                    <div className="detail-row">
                      <span className="detail-label">Registration Number:</span>
                      <input
                        type="text"
                        name="registration_number"
                        value={selectedStudent.registration_number}
                        onChange={handleStudentChange}
                        className="input-style"
                      />
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Student Name:</span>
                      <input
                        type="text"
                        name="student_name"
                        value={selectedStudent.student_name}
                        onChange={handleStudentChange}
                        className="input-style"
                      />
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email/Login ID:</span>
                      <input
                        type="text"
                        name="login_id"
                        value={selectedStudent.login_id}
                        onChange={handleStudentChange}
                        className="input-style"
                      />
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Password:</span>
                      <input
                        type="password"
                        name="password"
                        value={selectedStudent.password || ""}
                        onChange={handleStudentChange}
                        placeholder="Leave blank to keep current"
                        className="input-style"
                      />
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Batch:</span>
                      <select
                        name="batch_id"
                        value={selectedStudent.batch_id}
                        onChange={handleStudentChange}
                        className="select-style"
                      >
                        {batches.map((batch) => (
                          <option key={batch.batch_id} value={batch.batch_id}>
                            {batch.batch_name} ({batch.batch_year})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* CV Section */}
                  <div className="detail-group">
                    <h4 className="detail-heading">CV Document</h4>
                    {selectedStudent.cv ? (
                      <div className="cv-actions">
                        <button
                          className="button-style download-button"
                          onClick={() => downloadCV(selectedStudent.student_id)}
                        >
                          Download CV
                        </button>
                        <button
                          className="button-style open-button"
                          onClick={() => openCV(selectedStudent.student_id)}
                        >
                          Open CV
                        </button>
                      </div>
                    ) : (
                      <p>No CV uploaded</p>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="button-style save-button"
                    onClick={handleSaveStudent}
                  >
                    Save Changes
                  </button>
                  <button
                    className="button-style cancel-button"
                    onClick={() => setSelectedStudent(null)}
                  >
                    Close
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

export default ViewStudentsAdmin;
