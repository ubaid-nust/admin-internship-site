import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import AdminSignUp from "./Admin/adminSignUp";
import AdminLogin from "./LoginScreens/AdminLogin";
import EntityMaking from "./Admin/EntityMaking";
import AdminSidebar from "./Admin/Sidebar";
import ViewBatch from "./Admin/ViewBatch";
import ViewCourseAdvisor from "./Admin/ViewCourseAdvisors";
import ViewDepartment from "./Admin/ViewDepartment";
import ViewStudentsAdmin from "./Admin/ViewStudents";
import ViewInternships from "./Admin/ViewInternships";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/mcsinternshipPortalAdminSignUp63784" element={<AdminSignUp />} />
        <Route path="/admin/entity" element={<EntityMaking />} />
        <Route path="/admin/sidebar" element={<AdminSidebar />} />
        <Route path="/admin/view-batch" element={<ViewBatch />} />
        <Route path="/admin/view-course-advisor" element={<ViewCourseAdvisor />}/>
        <Route path="/admin/view-department" element={<ViewDepartment />} />
        <Route path="/admin/view-students" element={<ViewStudentsAdmin />} />
        <Route path="/admin/view-internships" element={<ViewInternships />} />
      </Routes>
    </Router>
  );
}

export default App;
