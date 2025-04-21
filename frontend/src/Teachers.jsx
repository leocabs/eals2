import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen } from "lucide-react";

// ajas ng teachers per page
const ITEMS_PER_PAGE = 10;

const Teachers = () => {
  const [teachers, setTeachers] = useState([]); 
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    sex: '',
    contact_number: '',
    address: '',
    bachelors_degree: '',
    masters_degree: '',
    doctorate_degree: '',
    bachelors_school: '',
    masters_school: '',
    doctorate_school: '',
    password: '',
  });

  const [editing, setEditing] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [teacherId, setTeacherId] = useState(''); 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  

  // Function to fetch teachers
  const fetchTeachers = async () => {
    try {
        const response = await fetch('http://localhost:3000/teachers');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTeachers(data);
    } catch (error) {
        console.error("Failed to fetch teachers:", error);
    }
  };


  useEffect(() => {
    fetchTeachers();
  }, []); // Fetch teachers on initial component mount


 // --- Search Logic ---
const filteredTeachers = useMemo(() => {
  if (!searchTerm) {
    return teachers; 
  }

  const lowerCaseSearchTerm = searchTerm.toLowerCase();

  return (
    firstName.includes(lowerCaseSearchTerm) ||
    middleName.includes(lowerCaseSearchTerm) ||
    lastName.includes(lowerCaseSearchTerm) ||
    email.includes(lowerCaseSearchTerm) ||
    `${firstName} ${middleName} ${lastName}`.includes(lowerCaseSearchTerm) ||
    `${firstName} ${lastName}`.includes(lowerCaseSearchTerm)
  );
});
// --- End Search Logic ---



  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE);

  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTeachers.slice(startIndex, endIndex);
  }, [filteredTeachers, currentPage]); 

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const goToPreviousPage = () => {
      handlePageChange(currentPage - 1);
  };

  const goToNextPage = () => {
      handlePageChange(currentPage + 1);
  };
  // --- End Pagination Logic ---


  // --- Event Handlers ---
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const updatedFormData = { ...prev, [name]: value };

        // Generate password if first_name or last_name changes, and teacherId is present (only for editing existing or after generating for new)
        if ((name === 'first_name' || name === 'last_name') && teacherId) {
             const generatedPassword = `${teacherId}${updatedFormData.last_name}`.toLowerCase();
             updatedFormData.password = generatedPassword;
        }
        return updatedFormData;
    });

    // Special handling for password generation *before* submitting a *new* teacher
     if (!editing && (name === 'first_name' || name === 'last_name')) {
       // We need the ID *before* saving, which is tricky with the current ID generation logic.
       // The password will be fully set in handleConfirmationSubmit just before sending.
       // We could *preview* it here if needed, but the final version depends on the generated ID.
       console.log("Password will be generated upon submission.");
     }
  };

  // Function to reset form and close modal
  const resetFormAndCloseModal = () => {
     setFormData({
       email: '', first_name: '', middle_name: '', last_name: '',
       date_of_birth: '', sex: '', contact_number: '', address: '',
       bachelors_degree: '', masters_degree: '', doctorate_degree: '',
       bachelors_school: '', masters_school: '', doctorate_school: '',
       password: '',
     });
     setEditing(false);
     setEditingTeacherId(null);
     setModalOpen(false);
     setTeacherId(''); 
     setConfirmationOpen(false); 
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // The teacher ID is generated inside handleConfirmationSubmit for new teachers
    // For editing, the teacherId is already set in handleEdit
    setConfirmationOpen(true);
  };

  const handleConfirmationSubmit = async () => {
    console.log('handleConfirmationSubmit called');
    console.log('editing:', editing);
  
    let currentTeacherId = teacherId; 
    let finalPassword = formData.password;
  
    // Generate a teacher ID and password if creating a *new* teacher
    if (!editing) {
      const newTeacherId = `eals${Math.floor(1000 + Math.random() * 9000)}`;
      currentTeacherId = newTeacherId; 
      finalPassword = `${newTeacherId}${formData.last_name}`.toLowerCase(); // Generate final password
      console.log('Generated new teacher ID:', newTeacherId);
    }
  
    console.log('final teacherId:', currentTeacherId);
    console.log('final password:', finalPassword);
  
    const method = editing ? 'PUT' : 'POST';
    const url = editing
      ? `http://localhost:3000/teacher/update/${editingTeacherId}`  // Corrected URL format for PUT
      : `http://localhost:3000/teacher/add`;
  
    console.log('method:', method);
    console.log('url:', url);
  
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          teacher_id: currentTeacherId, // Send the correct teacher_id
          password: finalPassword // Send the correct password
        }),
      });
  
      console.log('response status:', response.status);
  
      if (response.ok) {
        console.log('response ok');
        resetFormAndCloseModal();
        await fetchTeachers(); 
      } else {
        console.log('response not ok');
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error JSON' })); 
        console.error('Error from backend:', errorData);
        alert(`Error: ${errorData.message || 'Failed to submit teacher data.'}`);
      }
    } catch (error) {
      console.error('Network or other error:', error);
      alert(`Network error: ${error.message || 'Could not connect to the server.'}`);
    } finally {
      setConfirmationOpen(false); 
    }
  };
  


  const handleEdit = (teacher) => {
    const formattedDate = teacher.date_of_birth ? new Date(teacher.date_of_birth).toISOString().split('T')[0] : '';

    setFormData({
      email: teacher.email || '',
      first_name: teacher.first_name || '',
      middle_name: teacher.middle_name || '',
      last_name: teacher.last_name || '',
      date_of_birth: formattedDate,
      sex: teacher.sex || '',
      contact_number: teacher.contact_number || '',
      address: teacher.address || '',
      bachelors_degree: teacher.bachelors_degree || '',
      masters_degree: teacher.masters_degree || '',
      doctorate_degree: teacher.doctorate_degree || '',
      bachelors_school: teacher.bachelors_school || '',
      masters_school: teacher.masters_school || '',
      doctorate_school: teacher.doctorate_school || '',
      password: teacher.password || '', 
    });
    setEditing(true);
    setEditingTeacherId(teacher.teacher_id); 
    setTeacherId(teacher.teacher_id); 
    setModalOpen(true);
    setConfirmationOpen(false);
    setDeleteConfirmationOpen(false); 
  };

  const handleDeleteClick = (teacher) => {
    setTeacherToDelete(teacher);
    setDeleteConfirmationOpen(true);
  };

  const handleDelete = async () => {
    if (!teacherToDelete) return;

    try {
        const response = await fetch(`http://localhost:3000/teacher/remove/${teacherToDelete.teacher_id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setDeleteConfirmationOpen(false);
          setTeacherToDelete(null);
          await fetchTeachers(); 
        } else {
           console.error('Failed to delete teacher');
           const errorData = await response.json().catch(() => ({ message: 'Failed to parse error JSON' }));
           alert(`Error: ${errorData.message || 'Failed to delete teacher.'}`);
        }
    } catch (error) {
        console.error("Network error during delete:", error);
        alert(`Network error: ${error.message || 'Could not connect to the server.'}`);
    } finally {
        setDeleteConfirmationOpen(false); 
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationOpen(false);
    setTeacherToDelete(null);
  };

  const openAddModal = () => {
    resetFormAndCloseModal(); 
    setEditing(false);
    setModalOpen(true);
  }
  // --- End Event Handlers ---


  return (
  
    <div className="p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3 mb-2">
        <BookOpen className="text-red-700 w-8 h-8" />
          <h1 className="text-2xl font-bold">E-ALS Teachers Management</h1>
        </div>
        <p className="text-gray-700">Add, Update, and Delete Teachers.</p>
      </div>
      
    <div className="p-6 bg-white rounded-lg shadow-lg mx-1 my-5 max-w-9xl">
        {/* --- Search and Add Button Row --- */}
        <div className="flex justify-between items-center mb-4">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-2xl bg-gray-200 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />


            {/* Add Teacher Button */}
            <button
              onClick={openAddModal}
              className="bg-green-100 text-green-800 font-semibold px-6 py-2 rounded-full shadow hover:bg-green-200 transition"
            >
              Add Teacher
            </button>

        </div>
        {/* --- End Search and Add Button Row --- */}


        {/* --- Teachers Table --- */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto bg-white rounded-xl shadow-md overflow-hidden animate-fade-in transition-all duration-300">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide">Contact Number</th>
                <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTeachers.length > 0 ? (
                paginatedTeachers.map((teacher, index) => (
                  <tr
                    key={teacher.teacher_id}
                    className={`transition-all duration-300 hover:bg-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <td className="px-6 py-4 text-sm">{teacher.first_name} {teacher.middle_name} {teacher.last_name}</td>
                    <td className="px-6 py-4 text-sm">{teacher.email}</td>
                    <td className="px-6 py-4 text-sm">{teacher.contact_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="bg-blue-100 text-blue-800 font-semibold px-4 py-1.5 rounded-full shadow hover:bg-blue-200 transition text-sm mr-2"
                      >
                        View or Edit Info
                      </button>
                      <button
                        onClick={() => handleDeleteClick(teacher)}
                        className="bg-red-100 text-red-800 font-semibold px-4 py-1.5 rounded-full shadow hover:bg-red-200 transition text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center px-6 py-6 text-gray-500">
                    {searchTerm ? 'No teachers found matching your search.' : 'No teachers available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>  
      {/* --- End Teachers Table --- */}


      {/* --- Pagination Controls --- */}
       {totalPages > 1 && ( 
           <div className="flex justify-between items-center mt-4">
             {/* Page Info */}
             <span>
               Page {currentPage} of {totalPages} (Total: {filteredTeachers.length} teachers)
             </span>

             {/* Navigation Buttons */}
             <div className="flex gap-2">
             <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="bg-blue-100 text-blue-800 font-semibold px-4 py-1.5 rounded-full shadow hover:bg-blue-200 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="bg-blue-100 text-blue-800 font-semibold px-4 py-1.5 rounded-full shadow hover:bg-blue-200 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
             </div>
           </div>
       )}
      {/* --- End Pagination Controls --- */}


      {/* --- Add/Edit Modal --- */}
      {modalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 p-4"> 
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"> 
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">{editing ? 'Edit Teacher' : 'Add Teacher'}</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Information */}
              <div className="md:col-span-2 font-medium text-lg mb-2 text-blue-700">Personal Information</div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email<span className="text-red-500">*</span></label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
              </div>

              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name<span className="text-red-500">*</span></label>
                <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleInputChange} className="mt-1 border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
              </div>

              <div>
                <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700">Middle Name</label>
                <input type="text" id="middle_name" name="middle_name" value={formData.middle_name} onChange={handleInputChange} className="mt-1 border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name<span className="text-red-500">*</span></label>
                <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleInputChange} className="mt-1 border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
              </div>

              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input type="date" id="date_of_birth" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} className="mt-1 border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label htmlFor="sex" className="block text-sm font-medium text-gray-700">Sex</label>
                <select id="sex" name="sex" value={formData.sex} onChange={handleInputChange} className="mt-1 border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input type="tel" id="contact_number" name="contact_number" value={formData.contact_number} onChange={handleInputChange} className="mt-1 border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} className="mt-1 border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>

              {/* Educational Background */}
              <div className="md:col-span-2 font-medium text-lg mt-4 mb-2 text-blue-700 border-t pt-4">Educational Background</div>

              <div>
                <label htmlFor="bachelors_degree" className="block text-sm font-medium text-gray-700">Bachelor's Degree</label>
                <input type="text" id="bachelors_degree" name="bachelors_degree" value={formData.bachelors_degree} onChange={handleInputChange} className="mt-1 border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label htmlFor="bachelors_school" className="block text-sm font-medium text-gray-700">School (Bachelor's)</label>
                <input type="text" id="bachelors_school" name="bachelors_school" value={formData.bachelors_school} onChange={handleInputChange} className="mt-1 border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label htmlFor="masters_degree" className="block text-sm font-medium text-gray-700">Master's Degree</label>
                <input type="text" id="masters_degree" name="masters_degree" value={formData.masters_degree} onChange={handleInputChange} className="mt-1 border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label htmlFor="masters_school" className="block text-sm font-medium text-gray-700">School (Master's)</label>
                <input type="text" id="masters_school" name="masters_school" value={formData.masters_school} onChange={handleInputChange} className="mt-1 border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label htmlFor="doctorate_degree" className="block text-sm font-medium text-gray-700">Doctorate Degree</label>
                <input type="text" id="doctorate_degree" name="doctorate_degree" value={formData.doctorate_degree} onChange={handleInputChange} className="mt-1 border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label htmlFor="doctorate_school" className="block text-sm font-medium text-gray-700">School (Doctorate)</label>
                <input type="text" id="doctorate_school" name="doctorate_school" value={formData.doctorate_school} onChange={handleInputChange} className="mt-1 border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>

              {/* Password (display only, generated on submit for new, shown for existing) */}
              {formData.password && (
                <div className="md:col-span-2 mt-4 border-t pt-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">System Generated Password</label>
                  <input
                    type="text"
                    id="password"
                    name="password"
                    value={formData.password}
                    readOnly
                    className="mt-1 border border-gray-300 p-2 w-full rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                  />
                   <p className="text-xs text-gray-500 mt-1">
                      {editing ? "Existing password shown." : "Password (TeacherID + LastName) will be generated upon saving."}
                   </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="md:col-span-2 flex justify-end gap-3 mt-6 border-t pt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="bg-gray-100 text-gray-800 font-semibold px-6 py-2 rounded-full shadow hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="bg-blue-100 text-blue-800 font-semibold px-6 py-2 rounded-full shadow hover:bg-blue-200 transition"
              >
                {editing ? 'Update Teacher' : 'Add Teacher'}
              </button>

              </div>
            </form>

            {/* Close Button (Top Right) */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
              onClick={() => setModalOpen(false)} // Simple close
            >
              &times; {/* Use times symbol for 'X' */}
            </button>
          </div>
        </div>
      )}
      {/* --- End Add/Edit Modal --- */}


      {/* --- Confirmation Modal --- */}
      {confirmationOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Confirm Submission</h2>
            <p className="mb-4">Are you sure you want to {editing ? 'update this teacher\'s details' : 'add this new teacher'}?</p>
            <div className="flex justify-end gap-3">
            <button
              onClick={() => setConfirmationOpen(false)}
              className="bg-gray-100 text-gray-800 font-semibold px-6 py-2 rounded-full shadow hover:bg-gray-200 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmationSubmit}
              className="bg-blue-100 text-blue-800 font-semibold px-6 py-2 rounded-full shadow hover:bg-blue-200 transition"
            >
              Confirm
            </button>
            </div>
          </div>
        </div>
      )}
      {/* --- End Confirmation Modal --- */}

      {/* --- Delete Confirmation Modal --- */}
       {deleteConfirmationOpen && teacherToDelete && ( 
         <div className="fixed inset-0 flex justify-center items-center z-50">
           <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
             <h2 className="text-lg font-semibold mb-4 text-red-600">Confirm Deletion</h2>
             <p className="mb-4">
               Are you sure you want to delete teacher: <strong className="font-medium">{teacherToDelete.first_name} {teacherToDelete.last_name}</strong>?
               <br/>
               <span className="text-sm text-red-700">This action cannot be undone.</span>
             </p>
             <div className="flex justify-end gap-3">
             <button
                onClick={handleCancelDelete}
                className="bg-gray-100 text-gray-800 font-semibold px-6 py-2 rounded-full shadow hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="bg-red-100 text-red-800 font-semibold px-6 py-2 rounded-full shadow hover:bg-red-200 transition"
              >
                Delete
              </button>

             </div>
           </div>
         </div>
       )}
      {/* --- End Delete Confirmation Modal --- */}

    </div>
  );
};

export default Teachers;