import Report from "./ReadingMaterials";
import React, { useEffect, useState } from "react";
import axios from "axios";
import ViewClassModal from "../components/ViewClassModal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaBook } from "react-icons/fa";

export default function ClassManagement() {
  const initialClasses = [
    {
      id: 1,
      name: "English",
      subject: "LS 1 English",
      performance: [],
      studentsList: []
    },
    {
      id: 2,
      name: "FILIPINO",
      subject: "LS 1 Filipino",
      performance: [],
      studentsList: []
    },
    {
      id: 3,
      name: "Scientific Literacy and Critical Thinking Skills",
      subject: "LS 2",
      performance: [],
      studentsList: [],
    },
    {
      id: 4,
      name: "Mathematical and Problem Solving Skills",
      subject: "LS 3",
      studentsList: [],
    },
    {
      id: 5,
      name: "Life and Career Skills",
      subject: "LS 4",
      studentsList: [],
    },
    {
      id: 6,
      name: "Understanding the Self and Society",
      subject: "LS 5",
      studentsList: [],
    },
    {
      id: 7,
      name: "Digital Citizenship",
      subject: "LS 6",
      studentsList: [],
    }
  ];  

  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStrand, setSelectedStrand] = useState(null);
  const [lowPerformingStudents, setLowPerformingStudents] = useState([]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Get teacher ID from localStorage
        const teacherId = localStorage.getItem('user_id');
        
        if (!teacherId) {
          console.error("Teacher ID is missing. User might not be logged in.");
          return;
        }
        
        // Update the API endpoint to include teacher_id parameter
        const { data } = await axios.get(`http://localhost:3000/students/students-below-threshold?teacher_id=${teacherId}`);
        
        // Create the updated list with fetched data
        const updatedClasses = initialClasses.map(cls => ({
          ...cls,
          students: data.find(d => d.strand === cls.subject)?.student_count || 0
        }));
        
        setClasses(updatedClasses);
        setSelectedClass(updatedClasses[0]);
      } catch (err) {
        console.error("Error fetching student counts:", err);
      }
    };
  
    fetchCounts();
  }, []);
  
  useEffect(() => {
    const fetchBelowThreshold = async () => {
      try {
        // Get teacher ID from localStorage
        const teacherId = localStorage.getItem('user_id');
        
        if (!teacherId) {
          console.error("Teacher ID is missing. User might not be logged in.");
          return;
        }
        
        const res = await axios.get(`http://localhost:3000/students/students-below-threshold?teacher_id=${teacherId}`);
        setSubjectPerformance(res.data);
      } catch (error) {
        console.error("Error fetching students below threshold:", error);
      }
    };
  
    fetchBelowThreshold();
  }, []);
  
  useEffect(() => {
    if (!selectedStrand) return;
  
    const fetchStudentsForStrand = async () => {
      try {
        // Get teacher ID from localStorage
        const teacherId = localStorage.getItem('user_id');
        
        if (!teacherId) {
          console.error("Teacher ID is missing. User might not be logged in.");
          return;
        }
        
        const res = await axios.get(
          `http://localhost:3000/students/students-below-threshold/${encodeURIComponent(selectedStrand)}?teacher_id=${teacherId}`
        );
        setLowPerformingStudents(res.data);
      } catch (error) {
        console.error("Error fetching students for strand:", error);
      }
    };
  
    fetchStudentsForStrand();
  }, [selectedStrand]);  
  
  const handleView = async (classItem) => {
    setSelectedClass(classItem);
    setViewModalOpen(true);
  
    try {
      // Get teacher ID from localStorage
      const teacherId = localStorage.getItem('user_id');
      
      if (!teacherId) {
        console.error("Teacher ID is missing. User might not be logged in.");
        return;
      }
      
      const res = await axios.get(
        `http://localhost:3000/students/failing-subject/${encodeURIComponent(classItem.subject)}?teacher_id=${teacherId}`
      );
      setLowPerformingStudents(res.data);
    } catch (error) {
      console.error("Error fetching failing students:", error);
    }
  };  
  
  const validStudentCounts = classes
    .map((cls) => Number(cls.students))
    .filter((num) => !isNaN(num));

  const avgStudents =
    validStudentCounts.length > 0
      ? Math.floor(validStudentCounts.reduce((sum, n) => sum + n, 0) / validStudentCounts.length)
      : 0;

  const chartData = subjectPerformance.map(entry => ({
    name: entry.strand,
    Students: entry.student_count
  }));
  
  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-xl font-semibold mb-4">Class Management</h1>

        {/* Top Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#f0f4ff] p-4 rounded-lg">
            <h2 className="text-sm text-gray-600">Learning Strands (LS)</h2>
            <p className="text-2xl font-bold">{classes.length}</p>
          </div>
          <div className="bg-[#f0f4ff] p-4 rounded-lg">
            <h2 className="text-sm text-gray-600">
              Average Students Per LS
            </h2>
            <p className="text-2xl font-bold">{avgStudents}</p>
          </div>
          <div className="bg-[#f0f4ff] p-4 rounded-lg">
            <h2 className="text-sm text-gray-600">Upcoming Exams</h2>
          </div>
        </div>

        {/* Chart */}
        {subjectPerformance.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-md font-semibold mb-2">
            Students with Low Grade Per Learning Strand
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="Students" fill="#FF6B6B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-64 p-6 border-l border-gray-200">

        <div className="space-y-4">
          {classes.map((cls, idx) => (
            <div
              key={cls.id}
              onClick={() => setSelectedClass(cls)}
              className={`p-3 border rounded cursor-pointer hover:bg-gray-100 ${
                selectedClass?.id === cls.id ? "bg-gray-100" : ""
              }`}
            >
              <div className="space-x-2 mt-2">
                <button
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(cls);
                }}
              >
                View
              </button>
              </div>
              <div className="flex items-center space-x-3 mt-2">
                <FaBook className="text-2xl text-green-600" />
                <div>
                  <p className="font-semibold">{cls.name}</p>
                  <p className="text-sm text-gray-500">
                    Subject: {cls.subject}
                  </p>
                </div>
              </div>
              <p className="text-md font-bold mt-2">{cls.students} Students</p>
              {selectedClass?.id === cls.id && lowPerformingStudents.length > 0 }
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <ViewClassModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setLowPerformingStudents([]);      // clear on close
        }}
        classData={selectedClass}
        failingStudents={lowPerformingStudents}
      />
  </div>
  );
}
