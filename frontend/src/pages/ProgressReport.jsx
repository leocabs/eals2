import { useState, useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import jsPDF from "jspdf";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registering necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


export default function ProgressReport() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const teacherId = localStorage.getItem("user_id");
  const chartRef = useRef(null);  // Use a ref for the chart container

  const exportToPDF = () => {
    const input = chartRef.current;
  
    if (input) {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
  
      pdf.html(input, {
        callback: function (doc) {
          doc.save(`${selectedStudent.name}-progress-report.pdf`);
        },
        margin: [10, 10, 10, 10],
        autoPaging: "text",
        html2canvas: {
          scale: 0.8,
          scrollY: 0,
        },
      });
    }
  };
  

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/students/progress-report?teacher_id=${teacherId}`
        );
        const data = await res.json();
        setStudents(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching student progress:", err);
        setLoading(false);
      }
    };
    fetchStudents();
  }, [teacherId]);

  const getStudentStatus = (progress) => {
    if (!progress?.length) return "No Data";
    const average =
      progress.reduce((sum, p) => sum + p.score, 0) / progress.length;
    return average >= progress.length ? "Ready" : "At-risk";
  };

  const classes = [...new Set(students.map((s) => s.class))];
  const filteredStudents = students.filter((student) => {
    const matchName = (student.name || "").toLowerCase().includes((search || "").toLowerCase());
    const matchClass = selectedClass ? student.class === selectedClass : true;
    return matchName && matchClass;
  });

  const fetchRecommendations = async (studentId) => {
    setLoadingRecommendations(true);
    try {
      const response = await fetch("http://localhost:5000/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ student_id: studentId }),
      });
      const data = await response.json();
      setRecommendations(data.weak_areas);
      setLoadingRecommendations(false);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setLoadingRecommendations(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row justify-between gap-6 items-center mb-6">
        <input
          type="text"
          placeholder="Search student by name..."
          className="border rounded-lg p-4 w-full md:w-1/3 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded-lg p-4 w-full md:w-1/3 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">All Classes</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {filteredStudents.map((student) => {
          const status = getStudentStatus(student.progress);
          const statusColor =
            status === "Ready" ? "bg-green-500" : "bg-red-500";

          return (
            <div
              key={student.lrn}
              className="flex justify-between items-center p-4 border-b cursor-pointer hover:bg-gray-100 transition-all duration-300"
              onClick={() => {
                setSelectedStudent(student);
                fetchRecommendations(student.student_id);
              }}
            >
              <div className="flex-1">
                <span className="text-lg font-semibold">{student.name}</span>
                <span className="text-sm text-gray-500 p-2">{student.lrn}</span>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${statusColor}`}
              >
                {status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full border-4 border-t-4 border-blue-500 w-12 h-12"></div>
        </div>
      )}

      {/* Progress Graph */}
      {selectedStudent && (
        <div className="bg-white p-6 rounded-md shadow-md space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {selectedStudent.name}'s Progress
          </h2>

          {/* Progress Bar Chart */}
          <div
            className="bg-white p-6 rounded-md shadow-md space-y-4"
            ref={chartRef}  // Referencing chart container for PDF export
            style={{ width: "100%", height: "300px", backgroundColor: "#ffffff" }}

          >
            <Bar
              data={{
                labels: selectedStudent.progress.map((p) => p.strand),
                datasets: [
                  {
                    label: "Score",
                    data: selectedStudent.progress.map((p) => p.score),
                    backgroundColor: [
                      "rgba(13, 179, 158, 0.8)",  // teal
                      "rgba(52, 160, 164, 0.8)",  // teal-blue
                      "rgba(22, 138, 173, 0.8)",  // blue
                      "rgba(238, 108, 77, 0.8)",  // red-orange
                      "rgba(155, 197, 61, 0.8)",  // green
                      "rgba(192, 132, 252, 0.8)", // purple
                      "rgba(255, 165, 0, 0.8)",   // orange
                    ],
                    
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 20,
                  },
                },
              }}
            />
          </div>

          {/* Action Plan */}
          {loadingRecommendations ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full border-4 border-t-4 border-blue-500 w-12 h-12"></div>
            </div>
          ) : (
            <div>
              {recommendations?.map((weakArea) => (
                <div key={weakArea.id} className="space-y-4 border p-4 rounded-md bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-800">{weakArea.title}</h4>

                  {/* Collapsible Content */}
                  <details className="group space-y-2">
                    <summary className="cursor-pointer text-blue-600">View Recommendations</summary>
                    <div className="pl-4 space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Study Tip:</strong> Focus on understanding the core concepts.
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Estimated Study Time:</strong> 2–3 hours
                      </p>

                      <div className="mt-2">
                        <h5 className="font-medium text-gray-700">Recommended Materials:</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {weakArea.materials.map((mat) => (
                            <li key={mat.lmaterials_id}>
                              <a href={mat.file_url} target="_blank" className="text-blue-600 underline">
                                {mat.material_title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4">
                        <h5 className="font-medium text-gray-700">To-Do Checklist:</h5>
                        <ul className="space-y-2 pl-4">
                          <li>
                            <input type="checkbox" id={`understood-${weakArea.id}`} className="mr-2" />
                            <label htmlFor={`understood-${weakArea.id}`}>Understand the main concepts</label>
                          </li>
                          <li>
                            <input type="checkbox" id={`quiz-${weakArea.id}`} className="mr-2" />
                            <label htmlFor={`quiz-${weakArea.id}`}>Take practice quizzes</label>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Export Button */}
      {selectedStudent && (
        <button
          onClick={exportToPDF}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
        >
          Export Progress
        </button>
      )}
    </div>
  );
}
