import { useEffect, useState } from 'react';
import StudentModal from './TeacherModal';

export default function AtRiskDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [atRiskStudents, setAtRiskStudents] = useState([]);

  const teacherId = localStorage.getItem("user_id"); // Make sure this key exists in localStorage

  if (!teacherId) {
    console.error("No user_id found in localStorage");
    return;
  }

  // Fetch real at-risk students
  useEffect(() => {
    const fetchAtRisk = async () => {
      try {
        const res = await fetch(`http://localhost:3000/students/dashboard-data?teacher_id=${teacherId}`);
        const data = await res.json();
        // Assuming the API response has a structure with an "atRiskStudents" array
        setAtRiskStudents(data.atRiskStudents);
      } catch (error) {
        console.error("Failed to fetch at-risk students:", error);
      }
    };

    fetchAtRisk();
  }, []);

  return (
    <div className="bg-white shadow rounded-xl p-4 w-full">
      <div
        className="flex justify-between items-center cursor-pointer mb-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-md font-semibold">At-Risk Students</h2>
        <span className="text-blue-500 text-sm">View All</span>
      </div>

      {isOpen && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {atRiskStudents.length > 0 ? (
            atRiskStudents.map((student, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-2 rounded hover:bg-gray-100"
              >
                <div>
                  <p className="text-sm font-medium">
                    {student.first_name} {student.middle_name} {student.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{student.school}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-red-500">No at-risk students.</p>
          )}
        </div>
      )}

      {/* Modal */}
      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
