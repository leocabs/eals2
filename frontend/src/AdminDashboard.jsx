import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { GraduationCap, BookOpenCheck, Trash2 } from 'lucide-react'; 

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityLogError, setActivityLogError] = useState(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [logIdToDelete, setLogIdToDelete] = useState(null);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const COLORS = ['#2563EB', '#EF4444']; // kolay blue nd red
  const ACTIVITY_LOG_ENDPOINT = 'http://localhost:3000/teacher/activity';

  const fetchActivityLog = async () => {
    try {
      const activityResponse = await fetch(ACTIVITY_LOG_ENDPOINT);
      if (!activityResponse.ok) {
        console.error('Failed to fetch teacher activity log');
        setActivityLogError(`Failed to fetch activity log: ${activityResponse.status}`);
      } else {
        const activityData = await activityResponse.json();
        setActivityLog(activityData);
        setActivityLogError(null);
      }
    } catch (error) {
      console.error('Error fetching teacher activity log:', error);
      setActivityLogError('Error fetching activity log');
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const studentResponse = await fetch('http://localhost:3000/student/count');
        if (!studentResponse.ok) {
          throw new Error(`HTTP error! status: ${studentResponse.status}`);
        }
        const studentData = await studentResponse.json();
        setStudentCount(studentData.count || 0);

        const teacherResponse = await fetch('http://localhost:3000/teacher/count');
        if (!teacherResponse.ok) {
          throw new Error(`HTTP error! status: ${teacherResponse.status}`);
        }
        const teacherData = await teacherResponse.json();
        setTeacherCount(teacherData.count || 0);

        await fetchActivityLog();
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    const intervalId = setInterval(fetchActivityLog, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const data = [
    { name: 'Students', value: studentCount },
    { name: 'Teachers', value: teacherCount },
  ];

  const handleClearAllLogs = () => {
    setShowClearConfirmation(true);
  };

  const confirmClearAllLogs = async () => {
    setIsClearingAll(true);
    try {
      const response = await fetch(`${ACTIVITY_LOG_ENDPOINT}/clear`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setActivityLog([]);
      } else {
        const errorData = await response.json();
        setActivityLogError(`Failed to clear activity log: ${errorData.error || response.status}`);
      }
    } catch (error) {
      console.error('Error clearing activity log:', error);
      setActivityLogError('Error clearing activity log');
    } finally {
      setIsClearingAll(false);
      setShowClearConfirmation(false);
    }
  };

  const handleClearSingleLog = (logId) => {
    setLogIdToDelete(logId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteSingleLog = async () => {
    if (!logIdToDelete) return;
    try {
      const response = await fetch(`${ACTIVITY_LOG_ENDPOINT}/${logIdToDelete}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setActivityLog(activityLog.filter(log => log.id !== logIdToDelete));
      } else {
        const errorData = await response.json();
        setActivityLogError(`Failed to delete activity log: ${errorData.message || response.status}`);
      }
    } catch (error) {
      console.error('Error deleting activity log:', error);
      setActivityLogError('Error deleting activity log');
    } finally {
      setLogIdToDelete(null);
      setShowDeleteConfirmation(false);
    }
  };

  const cancelClearAll = () => {
    setShowClearConfirmation(false);
  };

  const cancelDeleteSingle = () => {
    setShowDeleteConfirmation(false);
    setLogIdToDelete(null);
  };

  if (loading) {
    return <div className="p-6">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="p-6">Error loading dashboard data: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between items-start h-32">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-700">Welcome to the dashboard overview page mosico team.</p>
      </div>

      {/* Donut Chart Section */}
      <div className="mt-10 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Total Accounts Registered</h2>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2 flex flex-col items-start mt-6 md:mt-0 md:pl-10 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-blue-600" />
              <div>
                <p className="text-md font-semibold text-gray-700">Total Students</p>
                <p className="text-lg font-bold text-blue-600">{studentCount}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <div>
                <p className="text-md font-semibold text-gray-700">Total Teachers</p>
                <p className="text-lg font-bold text-red-500">{teacherCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats container */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div
          onClick={() => navigate('/students')}
          className="bg-white p-6 rounded-lg shadow-lg flex justify-between items-center cursor-pointer transform hover:scale-98 transition-all duration-100 ease-in-out"
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Total Students</h2>
            <p className="text-xl font-bold text-blue-600">{studentCount}</p>
          </div>
          <div className="text-gray-600 text-4xl">
            <GraduationCap size={40} />
          </div>
        </div>

        <div
          onClick={() => navigate('/teachers')}
          className="bg-white p-6 rounded-lg shadow-lg flex justify-between items-center cursor-pointer transform hover:scale-98 transition-all duration-100 ease-in-out"
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Total Teachers</h2>
            <p className="text-xl font-bold text-red-500">{teacherCount}</p>
          </div>
          <div className="text-gray-600 text-4xl">
            <BookOpenCheck size={40} />
          </div>
        </div>
      </div>

        {/* Activity Log Section with Clear Buttons */}
        <div className="mt-10 bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">E-ALS Teacher Management Activity Log</h2>
            <div>
              <button
                onClick={handleClearAllLogs}
                className="bg-red-100 text-red-700 hover:bg-red-200 font-semibold px-3 py-1 rounded-md text-sm transition duration-150 ease-in-out"
              >
                Clear All
              </button>
            </div>
          </div>
          {activityLogError && <p className="text-red-500 mb-2">{activityLogError}</p>}
          {activityLog.length > 0 ? (
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {activityLog.map((log, index) => {
                try {
                  const details = log.details ? JSON.parse(log.details) : {};
                  let actionText = '';
                  let actionColor = '';

                  switch (log.action) {
                    case 'add':
                      actionText = 'added';
                      actionColor = 'text-green-600'; // green for added
                      break;
                    case 'update':
                      actionText = 'updated';
                      actionColor = 'text-blue-600'; // blue for updated
                      break;
                    case 'delete':
                      actionText = 'deleted';
                      actionColor = 'text-red-600'; // red for deleted
                      break;
                    default:
                      actionText = log.action;
                      actionColor = 'text-gray-600'; // gray for unknown
                  }

                  return (
                    <li key={log.id} className="py-1 flex items-center justify-between">
                      <span>
                        E-ALS Teacher: {details.name}{' '}
                        <span className={`${actionColor} font-semibold`}>{actionText}</span> -{' '}
                        <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                      </span>
                      <button
                        onClick={() => handleClearSingleLog(log.id)}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                        aria-label="Clear log"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  );
                } catch (e) {
                  console.error('Error parsing log details:', e, log);
                  return (
                    <li key={log.id} className="py-1 text-red-500">
                      Error displaying log - <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                    </li>
                  );
                }
              })}
            </ul>
          ) : (
            <p className="text-gray-500">{activityLogError || 'No recent activity in teacher management.'}</p>
          )}
        </div>


      {/* Clear All Confirmation Modal */}
      {showClearConfirmation && (
        <div className="fixed inset-0 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Clear All Activity Logs?</h2>
            <p className="text-gray-700 mb-4">Are you sure you want to clear all the activity logs? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={cancelClearAll} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Cancel</button>
              <button onClick={confirmClearAllLogs} disabled={isClearingAll} className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                {isClearingAll ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Delete This Activity Log?</h2>
            <p className="text-gray-700 mb-4">Are you sure you want to delete this activity log entry?</p>
            <div className="flex justify-end gap-3">
              <button onClick={cancelDeleteSingle} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Cancel</button>
              <button onClick={confirmDeleteSingleLog} className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;