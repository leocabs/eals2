import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

function EditableStudentTable() {
  const [students, setStudents] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [editedStudent, setEditedStudent] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch students data
  useEffect(() => {
    fetch("http://localhost:3000/users")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("Error fetching students:", err));
  }, []);

  // --- Search Logic ---
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return students.filter((student) => {
      const fullName = `${student.first_name} ${student.middle_name || ""} ${student.last_name}`.toLowerCase();
      return (
        fullName.includes(lowerCaseSearchTerm) ||
        student.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
        student.als_email?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    });
  }, [searchTerm, students]);
  // --- End Search Logic ---

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setEditMode(null);
  };

  const startEditing = (student) => {
    setEditMode(student.student_id);
    setEditedStudent({ ...student });
  };

  const handleInputChange = (field, value) => {
    setEditedStudent((prev) => ({ ...prev, [field]: value }));
  };

  const saveChanges = (id) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.student_id === id ? editedStudent : student
      )
    );
    setEditMode(null);

    // Optional: Send updated student to backend
    // fetch(`http://localhost:3000/update-student/${id}`, {
    //   method: "PUT",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(editedStudent),
    // })
    //   .then((res) => res.json())
    //   .then((data) => console.log("Update response:", data));
  };

  return (
    <div className="p-4 w-full">
      {/* --- Search and Title Row --- */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-96 bg-gray-200 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <h2 className="text-xl font-bold">Student List (Editable)</h2>
      </div>

      <div className="space-y-4">
        {filteredStudents.map((student) => (
          <div key={student.student_id} className="border rounded shadow bg-white">
            <div
              onClick={() => toggleExpand(student.student_id)}
              className="p-4 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
            >
              <span>
                <strong>Student ID:</strong> {student.student_id} —{" "}
                <strong>{student.first_name} {student.last_name}</strong>
              </span>
              <span className="text-sm text-blue-500">
                {expandedId === student.student_id ? "Collapse" : "Expand"}
              </span>
            </div>

            {expandedId === student.student_id && (
              <div className="px-4 pb-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "lrn", "first_name", "middle_name", "last_name", "class_name", "email", "als_email", "status",
                    "address", "date_of_birth", "age", "sex", "marital_status", "occupation",
                    "salary", "living_with_parents", "rented_house"
                  ].map((field) => (
                    <div key={field} className="flex flex-col">
                      <label className="text-xs text-gray-500 capitalize">
                        {field.replace(/_/g, " ")}
                      </label>
                      <input
                        type="text"
                        className="input input-sm input-bordered"
                        value={
                          editMode === student.student_id
                            ? editedStudent[field] || ""
                            : student[field] || ""
                        }
                        onChange={(e) =>
                          editMode === student.student_id &&
                          handleInputChange(field, e.target.value)
                        }
                        disabled={editMode !== student.student_id}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  {editMode === student.student_id ? (
                    <button
                      onClick={() => saveChanges(student.student_id)}
                      className="btn btn-success btn-sm"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditing(student)}
                      className="btn btn-primary btn-sm"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default EditableStudentTable;
