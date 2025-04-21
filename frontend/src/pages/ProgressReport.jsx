import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ProgressReport() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

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

    // Fetch data on mount
    useEffect(() => {
      const fetchStudents = async () => {
        try {
          const res = await fetch("http://localhost:3001/students/progress-report");
          const data = await res.json();
          setStudents(data);
        } catch (err) {
          console.error("Error fetching student progress:", err);
        }
      };
      fetchStudents();
    }, []);

    const getStudentStatus = (progress) => {
      if (!progress?.length) return "No Data";
      const average = progress.reduce((sum, p) => sum + p.score, 0) / progress.length;
      return average >= 75 ? "Ready" : "At-risk";
    };

    const classes = [...new Set(students.map((s) => s.class))];
    const filteredStudents = students.filter((student) => {
      const matchName = student.name.toLowerCase().includes(search.toLowerCase());
      const matchClass = selectedClass ? student.class === selectedClass : true;
      return matchName && matchClass;
    });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <input
          type="text"
          placeholder="Search student..."
          className="border rounded p-2 w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded p-2"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">All Classes</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      {/* Student List */}
      <div className="bg-gray-100 rounded shadow overflow-hidden">
        {filteredStudents.map((student) => {
          const status = getStudentStatus(student.progress);
          const statusColor = status === "Ready" ? "bg-green-500" : "bg-red-500";

          return (
            <div
              key={student.lrn}
              className="flex justify-between items-center p-4 border-b cursor-pointer hover:bg-gray-200"
              onClick={() => setSelectedStudent(student)}
            >
              <span>{student.name}</span>
              <span>{student.lrn}</span>
              <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${statusColor}`}>
                {status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress Graph */}
      {selectedStudent && (
        <div className="bg-white p-4 rounded shadow space-y-4" id="student-progress">
          <h2 className="text-xl font-semibold">{selectedStudent.name}'s Progress Report</h2>
          <Bar
            data={{
              labels: selectedStudent.progress.map((p) => p.strand),
              datasets: [
                {
                  label: "Score",
                  data: selectedStudent.progress.map((p) => p.score),
                  backgroundColor: [
                    "#0db39e", "#34a0a4", "#168aad", "#ee6c4d", "#9bc53d", "#c084fc", "#ffa500"
                  ],
                },
              ],
            }}
            options={{
              scales: {
                y: { beginAtZero: true, max: 100 },
              },
            }}
          />
          <button
            onClick={exportToPDF}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Export Progress
          </button>
        </div>
      )}
    </div>
  );
}
