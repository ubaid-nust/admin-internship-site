// src/Admin/AdminInternships.jsx
import React, { useEffect, useState } from "react";
import AdminSidebar from "./Sidebar";

const ViewInternships = () => {
  const [internships, setInternships] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [batchFilter, setBatchFilter] = useState("");
  const [expandedBatches, setExpandedBatches] = useState({});

  const token = localStorage.getItem("token");

  const fetchInternships = async (batchId) => {
    try {
      const res = await fetch("http://localhost:5000/api/internships/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = await res.json();
      if (batchId) data = data.filter((i) => i.batch_id === Number(batchId));
      setInternships(data);
    } catch (err) {
      console.error("Error fetching internships:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/internships/no-internship",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/batches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBatches(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInternships(batchFilter);
    fetchStudents();
    fetchBatches();
  }, [batchFilter]);

  const getBatchName = (id) => {
    const batch = batches.find((b) => b.batch_id === id);
    return batch ? `${batch.batch_name} (${batch.batch_year})` : id;
  };

  const openFile = async (internshipId, type) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/internships/${internshipId}/files/${type}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("File not found");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Could not open file");
    }
  };

  const toggleBatch = (batchId) => {
    setExpandedBatches((prev) => ({
      ...prev,
      [batchId]: !prev[batchId],
    }));
  };

  const studentsByBatch = {};
  batches.forEach((b) => {
    studentsByBatch[b.batch_id] = students.filter(
      (s) => s.batch_id === b.batch_id
    );
  });

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        background: "#f8f9fa",
      }}
    >
      <AdminSidebar style={{ flexShrink: 0 }} />
      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            marginBottom: "20px",
            color: "#0b2e5c",
            borderBottom: "2px solid #0b2e5c",
            paddingBottom: "6px",
          }}
        >
          Internship Management
        </h1>

        {/* Batch Filter for Internships */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
            gap: "15px",
          }}
        >
          <label style={{ fontWeight: "bold", color: "#333" }}>
            Filter by batch:
          </label>
          <select
            style={{
              padding: "8px 12px",
              fontSize: "14px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: "#fff",
              minWidth: "180px",
            }}
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
          >
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b.batch_id} value={b.batch_id}>
                {b.batch_name} ({b.batch_year})
              </option>
            ))}
          </select>
        </div>

        {/* Internships Table */}
        <div
          style={{
            overflowX: "auto",
            marginBottom: "30px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead
              style={{
                background: "#0b2e5c",
                color: "#fff",
                paddingLeft: "-50px",
              }}
            >
              <tr>
                <th style={{ padding: "12px" }}>Student Name</th>
                <th>Batch</th>
                <th>Organization</th>
                <th>Type</th>
                <th>Year</th>
                <th>Files</th>
              </tr>
            </thead>
            <tbody>
              {internships.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "15px",
                      color: "#555",
                    }}
                  >
                    No internships found
                  </td>
                </tr>
              ) : (
                internships.map((i, idx) => (
                  <tr
                    key={i.internship_id}
                    style={{ background: idx % 2 === 0 ? "#f9f9f9" : "#fff" }}
                  >
                    <td style={{ padding: "30px", color: "#222" }}>
                      {i.student_name}
                    </td>
                    <td>{getBatchName(i.batch_id)}</td>
                    <td>{i.organization}</td>
                    <td>{i.internship_type}</td>
                    <td>{i.year_of_completion}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {["evidences", "survey1", "survey2", "survey3"].map(
                          (type) =>
                            i[type] && (
                              <button
                                key={type}
                                style={{
                                  flex: "1 1 45%",
                                  padding: "6px 0",
                                  fontSize: "13px",
                                  borderRadius: "5px",
                                  border: "none",
                                  background: "#08A224",
                                  color: "#fff",
                                  cursor: "pointer",
                                  textTransform: "capitalize",
                                }}
                                onClick={() => openFile(i.internship_id, type)}
                              >
                                {type}
                              </button>
                            )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Students Without Internships */}
        <div>
          <h3 style={{ marginBottom: "15px", color: "#0b2e5c" }}>
            Students Without Internships
          </h3>
          {batches.map((batch) => (
            <div
              key={batch.batch_id}
              style={{
                marginBottom: "15px",
                borderRadius: "8px",
                background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "#0b2e5c",
                  color: "#fff",
                  padding: "10px 15px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontWeight: "bold",
                }}
                onClick={() => toggleBatch(batch.batch_id)}
              >
                <span>
                  {batch.batch_name} ({batch.batch_year}) —{" "}
                  {studentsByBatch[batch.batch_id].length} student(s)
                </span>
              </div>
              {expandedBatches[batch.batch_id] && (
                <div
                  style={{
                    marginTop: "8px",
                    overflowX: "auto",
                    padding: "10px 20px",
                  }}
                >
                  {studentsByBatch[batch.batch_id].length === 0 ? (
                    <p style={{ padding: "6px 0", color: "#555" }}>
                      No students without internships
                    </p>
                  ) : (
                    <table
                      className="students-list-table"
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        background: "#fff",
                        borderRadius: "8px",
                        overflow: "hidden",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            background: "#f5f7fb",
                            borderBottom: "1px solid #e5e7eb",
                          }}
                        >
                          <th
                            style={{
                              padding: "10px 12px",
                              textAlign: "left",
                              color: "#0b2e5c",
                            }}
                          >
                            Name
                          </th>
                          <th
                            style={{
                              padding: "10px 12px",
                              textAlign: "left",
                              color: "#0b2e5c",
                            }}
                          >
                            Registration#
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsByBatch[batch.batch_id].map((s, idx) => (
                          <tr
                            key={s.student_id}
                            style={{
                              background: idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                              borderBottom: "1px solid #eef0f3",
                            }}
                          >
                            <td style={{ padding: "10px 12px", color: "#222" }}>
                              {s.student_name}
                            </td>
                            <td style={{ padding: "10px 12px", color: "#222" }}>
                              {s.registration_number}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewInternships;
