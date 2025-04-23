import { useEffect, useState } from "react";
import AddStudentModal from "../components/AddStudentModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      toast.error("Failed to load students.");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSave = async (student) => {
    try {
      let successMessage = "";
      const headers = { "Content-Type": "application/json" };
      const body = JSON.stringify(student);
      let response;

      if (isEditModalOpen) {
        // Update student
        response = await fetch(`http://localhost:3000/students/update-student/${student.student_id}`, {
          method: "PUT",
          headers,
          body,
        });
        successMessage = "Student updated successfully!";
      } else {
        // Create new student
        response = await fetch("http://localhost:3000/students/create-student", {
          method: "POST",
          headers,
          body,
        });
        successMessage = "Student created successfully!";
      }

      if (response.ok) {
        fetchStudents();
        closeModals();
        toast.success(successMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } else {
        const errorData = await response.json();
        console.error("Failed to save student:", errorData);
        toast.error(errorData?.message || "Failed to save student.");
      }
    } catch (error) {
      console.error("Error saving student:", error);
      toast.error("Error saving student.");
    }
  };

  const confirmDelete = (id) => setDeleteId(id);

  const handleDelete = async () => {
    try {
      // Delete related records in aemock_results first
      const deleteResultsResponse = await fetch(`http://localhost:3000/students/aemock-results/delete-by-student/${deleteId}`, {
        method: "DELETE",
      });

      if (!deleteResultsResponse.ok) {
        const errorData = await deleteResultsResponse.json();
        console.error("Failed to delete related results:", errorData);
        toast.error(errorData?.message || "Failed to delete related records.");
        return;
      }

      // Now delete the student
      const deleteStudentResponse = await fetch(`http://localhost:3000/students/delete-student/${deleteId}`, {
        method: "DELETE",
      });

      if (deleteStudentResponse.ok) {
        toast.success("Student deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        fetchStudents();
        setDeleteId(null);
      } else {
        const errorData = await deleteStudentResponse.json();
        console.error("Failed to delete student:", errorData);
        toast.error(errorData?.message || "Failed to delete student.");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Error deleting student.");
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
        toast.error(data.message || "Failed to fetch student details.");
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error("Error fetching student details.");
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <ToastContainer /> {/* Add the ToastContainer here */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Student Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-100 text-green-800 font-semibold px-6 py-2 rounded-full shadow hover:bg-green-200 transition"
        >
          + Add Student
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-white rounded-xl shadow-md overflow-hidden animate-fade-in transition-all duration-300">
          <thead>
            <tr className="bg-gray-100 text-gray-800">
              <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide">#</th>
              <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide">Full Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide">Gender</th>
              <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide">School</th>
              <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide">LRN</th>
              <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((student, idx) => (
                <tr
                  key={student.student_id}
                  className={`transition-all duration-300 hover:bg-gray-100 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <td className="px-6 py-4 text-sm">{idx + 1}</td>
                  <td className="px-6 py-4 text-sm">
                    {`${student.first_name} ${student.middle_name} ${student.last_name}`}
                  </td>
                  <td className="px-6 py-4 text-sm">{student.sex}</td>
                  <td className="px-6 py-4 text-sm">{student.school}</td>
                  <td className="px-6 py-4 text-sm">{student.lrn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setIsEditModalOpen(true);
                      }}
                      className="bg-blue-100 text-blue-800 font-semibold px-4 py-1.5 rounded-full shadow hover:bg-blue-200 transition text-sm mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(student.student_id)}
                      className="bg-red-100 text-red-800 font-semibold px-4 py-1.5 rounded-full shadow hover:bg-red-200 transition text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center px-6 py-6 text-gray-500">
                  No student records available.
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