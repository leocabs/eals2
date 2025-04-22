import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';

const notify = () => toast('asd');

// Admin Layout Components
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

// Admin Pages
import AdminDashboard from "./AdminDashboard";
import Students from "./components/EditableStudentTable";
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
import StudentTable from "./components/EditableStudentTable";
import "./AEMockTest.css";
import StudentSidebar from "./components/StudentSidebar";

// Teacher Component
import Teachers from "./Teachers";
import TeacherDashboard from "./pages/Dashboard";
import StudentManagement from "./pages/StudentManagement";
import ClassManagement from "./pages/ClassManagement";
import ReadingMaterials from "./pages/ReadingMaterials";
import MockupTest from "./pages/MockupTest";
import QuestionList from "./pages/QuestionList";
import ProgressReport from "./pages/ProgressReport";
import QuestionEditor from "./components/QuestionEditorModal";
import TeacherHeader from "./components/TeacherHeader";
import TeacherSidebar from "./components/TeacherSidebar";
import UploadMaterial from "./pages/UploadMaterials";

function AdminLayout({ children }) {
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <AdminHeader />
        <div className="flex-grow bg-gray-50 ">{children}</div>
      </div>
    </div>
  );
}

function TeacherLayout({ children }) {
  return (
    <div className="flex h-screen ">
      <TeacherSidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <TeacherHeader />
        <div className="flex-grow bg-gray-50 ">{children}</div>
      </div>
    </div>
  );
}

function StudentLayout({ children }) {
  return (
    <div className="flex h-screen">
      <StudentSidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <TeacherHeader />
        <div className="flex-grow bg-gray-50 p-4">{children}</div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ResetPass />} />

        {/* Student Protected Layout Routes */}

        {/* Student Protected Layout Routes */}
        <Route path="/student-dashboard" element={<StudentLayout >
          <StudentDashboard />
        </StudentLayout>}
        />

        <Route path="/prediction" element={<StudentLayout >
          <Prediction />
        </StudentLayout>}
        />

        <Route path="/profile" element={<StudentLayout >
          <Profile />
        </StudentLayout>}
        />

        <Route path="/learning-materials" element={<StudentLayout >
          <RecommendedMats />
        </StudentLayout>}
        />

        <Route path="/mock-test" element={<StudentLayout >
          <AEMock />
        </StudentLayout>}
        />



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
          path="/upload-materials"
          element={
            <TeacherLayout>
              <UploadMaterial />
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
        
        {/* For viewing of questions */}
        <Route
          path="/mock-test/:ls_id"
          element={
            <TeacherLayout>
              <QuestionList />
            </TeacherLayout>
          }
        />

        {/* For adding questions */}
        <Route
          path="/mock-test/:ls_id/add"
          element={
            <TeacherLayout>
              <QuestionEditor />
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
        <Route
          path="/students"
          element={
            <AdminLayout>
              <Students />
            </AdminLayout>
          }
        />

      </Routes>
    </Router>
  );
}
export default App;