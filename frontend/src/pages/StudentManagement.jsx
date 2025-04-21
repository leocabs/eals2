import { useEffect, useState } from "react";
import AddStudentModal from "../components/AddStudentModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch students from backend
  const fetchStudents = async () => {
    const teacherId = localStorage.getItem('user_id'); // Assuming logged-in teacher ID is stored here
  
    if (!teacherId) {
      console.error("Teacher ID is missing. User might not be logged in.");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:3000/students/students?teacher_id=${teacherId}`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };
  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSave = async (student) => {
    try {
      if (isEditModalOpen) {
        // Update student
        await fetch(`http://localhost:3000/students/update-student/${student.student_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(student),
        });
      } else {
        // Create new student
        await fetch("http://localhost:3000/students/create-student", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(student),
        });
      }
      fetchStudents();
      closeModals();
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  const confirmDelete = (id) => setDeleteId(id);

  const handleDelete = async () => {
    try {
      // Delete related records in aemock_results first
      await fetch(`http://localhost:3000/students/aemock-results/delete-by-student/${deleteId}`, {
        method: "DELETE",
      });
  
      // Now delete the student
      await fetch(`http://localhost:3000/students/delete-student/${deleteId}`, {
        method: "DELETE",
      });
  
      fetchStudents();
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };
  

  const closeModals = () => {
    setShowAddModal(false);
    setIsEditModalOpen(false);
    setSelectedStudent(null);
  };


  const fetchStudentById = async (studentId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/students/${studentId}`);
      const data = await res.json();
      if (data.success) {
        return data.data;
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };
  
  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Student Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add Student
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">#</th>
              <th className="border p-2">Full Name</th>
              <th className="border p-2">Gender</th>
              <th className="border p-2">School</th>
              <th className="border p-2">LRN</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => (
              <tr key={student.student_id}>
                <td className="border p-2">{idx + 1}</td>
                <td className="border p-2">
                  {`${student.first_name} ${student.middle_name} ${student.last_name}`}
                </td>
                <td className="border p-2">{student.sex}</td>
                <td className="border p-2">{student.school}</td>
                <td className="border p-2">{student.lrn}</td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setIsEditModalOpen(true);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(student.student_id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan="6" className="border p-4 text-center text-gray-500">
                  No student records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add or Edit Modal */}
      <AddStudentModal
        isOpen={showAddModal || isEditModalOpen}
        onClose={closeModals}
        onSave={handleSave}
        initialData={selectedStudent}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
