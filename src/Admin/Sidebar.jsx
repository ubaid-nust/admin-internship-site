// src/Admin/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './admin.css'; // Make sure to import your CSS file

const AdminSidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo-space">
        Student Internship Management System
      </div>
      
      <NavLink 
        to="/admin/entity" 
        className={({ isActive }) => 
          `sidebar-button ${isActive ? 'active' : ''}`
        }
      >
        Add Record
      </NavLink>
      
      <NavLink 
        to="/admin/view-students" 
        className={({ isActive }) => 
          `sidebar-button ${isActive ? 'active' : ''}`
        }
      >
        View Students
      </NavLink>

      <NavLink 
        to="/admin/view-internships" 
        className={({ isActive }) => 
          `sidebar-button ${isActive ? 'active' : ''}`
        }
      >
        View Internships
      </NavLink>
      
      <NavLink 
        to="/admin/view-batch" 
        className={({ isActive }) => 
          `sidebar-button ${isActive ? 'active' : ''}`
        }
      >
        View Batches
      </NavLink>
      
      <NavLink 
        to="/admin/view-course-advisor" 
        className={({ isActive }) => 
          `sidebar-button ${isActive ? 'active' : ''}`
        }
      >
        View Course Advisors
      </NavLink>
      
      <NavLink 
        to="/admin/view-department" 
        className={({ isActive }) => 
          `sidebar-button ${isActive ? 'active' : ''}`
        }
      >
        View Departments
      </NavLink>
      
      <NavLink 
        to="/login/admin" 
        className="sidebar-button"
      >
        Logout
      </NavLink>
    </div>
  );
};

export default AdminSidebar;