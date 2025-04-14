import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import ResetPass from "./ResetPass";
import StudentDashboard from "./StudentDashboard";
import Prediction from "./Prediction";
import Profile from "./Profile";
import RecommendedMats from "./RecommendedMats";
import Passed from "./components/PassedCard";
import ExamPredictionTest from "./examPredictionTest";
import AEMock from "./AEMock";
import PracticeTest from "./PracticeTest";
import './AEMockTest.css';
import StudentTable from "./components/StudentTable";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ResetPass />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/prediction" element={<Prediction />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/learning-materials" element={<RecommendedMats />} />
        <Route path="/passed" element={<Passed />} />
        <Route path="/exam-prediction" element={<ExamPredictionTest />} />
        <Route path="/practice-test" element={<PracticeTest />} />
        <Route path="/mock-test" element={<AEMock />} />
        <Route path="/students" element={<StudentTable />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
