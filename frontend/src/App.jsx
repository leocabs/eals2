import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Admin Layout Components
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

// Admin Pages
import AdminDashboard from "./AdminDashboard";
import Students from "./Students";
import CreateTeachers from "./CreateTeachers";

// Student Pages
import Login from "./Login";
import ResetPass from "./ResetPass";
import StudentDashboard from "./StudentDashboard";
import Prediction from "./Prediction";
import Profile from "./Profile";
import RecommendedMats from "./RecommendedMats";
import AEMock from "./AEMock";

// Student Component
import StudentTable from "./components/StudentTable";
import "./AEMockTest.css";

// Teacher Component
import Teachers from "./Teachers";
import TeacherDashboard from "./pages/Dashboard";
import StudentManagement from "./pages/StudentManagement";
import ClassManagement from "./pages/ClassManagement";
import ReadingMaterials from "./pages/ReadingMaterials";
import SubjectModules from "./pages/SubjectModules";
import SubjectSelector from "./pages/SubjectSelector";
import MockupTest from "./pages/MockupTest";
import QuestionList from "./pages/QuestionList";
import ProgressReport from "./pages/ProgressReport";
import QuestionEditor from "./components/QuestionEditorModal";
import TeacherHeader from "./components/TeacherHeader"
import TeacherSidebar from "./components/TeacherSidebar";

function AdminLayout({ children }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <AdminHeader />
        <div className="flex-grow bg-gray-50 min-h-screen">{children}</div>
      </div>
    </div>
  );
}

function TeacherLayout({ children }) {
  return (
    <div className="flex">
      <TeacherSidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <TeacherHeader/>
        <div className="flex-grow bg-gray-50 min-h-screen">{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Student Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ResetPass />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/prediction" element={<Prediction />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/learning-materials" element={<RecommendedMats />} />
        <Route path="/mock-test" element={<AEMock />} />
        <Route path="/students" element={<StudentTable />} />

        {/* Teacher Routes (with Sidebar + Header) */}
        <Route
          path="/teacher-dashboard"
          element={
            <TeacherLayout>
              <TeacherDashboard />
            </TeacherLayout>
          }
        />

        <Route
          path="/teacher-student-management"
          element={
            <TeacherLayout>
              <StudentManagement />
            </TeacherLayout>
          }
        />

        <Route
          path="/teacher-class-management"
          element={
            <TeacherLayout>
              <ClassManagement />
            </TeacherLayout>
          }
        />

        <Route
          path="/reading-materials"
          element={
            <TeacherLayout>
              <ReadingMaterials />
            </TeacherLayout>
          }
        />

        <Route
          path="/aemock-test"
          element={
            <TeacherLayout>
              <MockupTest />
            </TeacherLayout>
          }
        />

        <Route
          path="/progress-report"
          element={
            <TeacherLayout>
              <ProgressReport />
            </TeacherLayout>
          }
        />

        {/* Admin Routes (with Sidebar + Header) */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          }
        />
        <Route
          path="/create-students"
          element={
            <AdminLayout>
              <Students />
            </AdminLayout>
          }
        />
        <Route
          path="/create-teachers"
          element={
            <AdminLayout>
              <CreateTeachers />
            </AdminLayout>
          }
        />
        <Route
          path="/student-table"
          element={
            <AdminLayout>
              <StudentTable />
            </AdminLayout>
          }
        />
        <Route
          path="/teachers"
          element={
            <AdminLayout>
              <Teachers />
            </AdminLayout>
          }
        />
      </Routes>
    </Router>
  );
}
