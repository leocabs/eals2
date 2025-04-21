import { useEffect, useState } from 'react';
import PerformanceChart from '../components/PerformanceChart';
import StudentStatusDonut from '../components/StudentStatusDonut';
import AtRiskDropdown from '../components/AtRiskDropdown';

export default function Dashboard() {
  const teacherId = localStorage.getItem("user_id");

  const [studentCount, setStudentCount] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    atRiskCount: 0,
    completionRate: 0,
  });


  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const res = await fetch(`http://localhost:3000/students/count?user_id=${teacherId}`);
        const data = await res.json();
        setStudentCount(data.total);
      } catch (err) {
        console.error("Failed to fetch student count", err);
      }
    };
  
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/students/dashboard-data?teacher_id=${teacherId}`);
        const data = await res.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };
    
  
    fetchStudentCount();
    fetchDashboardData();
  }, []);
  

  return (
    <>
      <div className="bg-[#F1F1F1] min-h-screen p-6">
        <h1 className="text-lg font-semibold text-black-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-3 gap-4">
          {/* Total Students Enrolled */}
          <div className="bg-white shadow rounded-xl p-4 flex items-center space-x-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0zM4 13a4 4 0 014-4h4a4 4 0 014 4v1H4v-1z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Students Enrolled</p>
            <p className="text-xl font-bold text-gray-800">{studentCount}</p>
          </div>
        </div>

          {/* At-Risk Students */}
          <div className="bg-white shadow rounded-xl p-4 flex items-center space-x-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0zM4 13a4 4 0 014-4h4a4 4 0 014 4v1H4v-1z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">At-Risk Students</p>
              <p className="text-lg font-semibold text-blue-600">
              {dashboardData.atRiskCount ?? "--"}
            </p>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white shadow rounded-xl p-4 flex items-center space-x-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0zM4 13a4 4 0 014-4h4a4 4 0 014 4v1H4v-1z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-lg font-semibold text-black">
            {dashboardData.completionRate ?? "--"}%
                </p>
            </div>
          </div>
        </div>

        {/* Line Graph */}
        <div className="mt-6">
          <PerformanceChart />
        </div>

        {/* Donut & Dropdown */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div className="col-span-1">
            <StudentStatusDonut />
          </div>
          <div className="col-span-1 md:col-span-2">
            <AtRiskDropdown />
          </div>
        </div>
      </div>
    </>
  );
}
