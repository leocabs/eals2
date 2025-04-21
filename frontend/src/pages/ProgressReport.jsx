import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ProgressReport() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null); // For storing recommendations
  const [loadingRecommendations, setLoadingRecommendations] = useState(false); // For loading state of recommendations
  const teacherId = localStorage.getItem("user_id");

  const exportToPDF = () => {
    const chart = document.getElementById("student-progress");
    html2canvas(chart).then((canvas) => {
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const width = 190;
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, width, height);
      pdf.save(`${selectedStudent.name}-progress-report.pdf`);
    });
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
    const matchName = student.name.toLowerCase().includes(search.toLowerCase());
    const matchClass = selectedClass ? student.class === selectedClass : true;
    return matchName && matchClass;
  });

  const fetchRecommendations = async (studentId) => {
    setLoadingRecommendations(true); // Set loading state to true while fetching
    try {
      const response = await fetch("http://localhost:5000/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ student_id: studentId }),
      });
      const data = await response.json();
      setRecommendations(data.weak_areas); // Update state with recommendation data
      setLoadingRecommendations(false); // Set loading state to false once data is fetched
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
                fetchRecommendations(student.lrn); // Fetch recommendations when student is selected
              }}
            >
              <div className="flex-1">
                <span className="text-lg font-semibold">{student.name}</span>
                <span className="text-sm text-gray-500">{student.lrn}</span>
                <span className="text-sm text-gray-500">{student.class}</span>
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
            {selectedStudent.name}'s Progress Report
          </h2>

          {/* Academic Progress */}
          <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left">Learning Strand</th>
                <th className="py-2 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedStudent.progress.map((p) => (
                <tr key={p.strand} className="border-b">
                  <td className="py-2 px-4">{p.strand}</td>
                  <td className="py-2 px-4">
                    {getStudentStatus([p]) === "Ready" ? (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Ready
                      </span>
                    ) : (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Needs Improvement
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Progress Bar Chart */}
          <div
            className="bg-white p-6 rounded-md shadow-md space-y-4"
            id="student-progress"
            style={{ width: "100%", height: "300px" }}
          >
            <Bar
              data={{
                labels: selectedStudent.progress.map((p) => p.strand),
                datasets: [
                  {
                    label: "Score",
                    data: selectedStudent.progress.map((p) => p.score),
                    backgroundColor: [
                      "#0db39e",
                      "#34a0a4",
                      "#168aad",
                      "#ee6c4d",
                      "#9bc53d",
                      "#c084fc",
                      "#ffa500",
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
            recommendations && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Action Plan</h3>
                {recommendations.map((weakArea) => (
                  <div key={weakArea.id} className="space-y-2">
                    <h4 className="text-lg font-semibold">{weakArea.title}</h4>
                    <ul className="list-disc pl-5">
                      {weakArea.materials.map((mat) => (
                        <li key={mat.lmaterials_id}>
                          <a href={mat.file_url} target="_blank" className="text-blue-600">
                            {mat.material_title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )
          )}

          <button
            onClick={exportToPDF}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
          >
            Export Progress
          </button>
        </div>
      )}
    </div>
  );
}
