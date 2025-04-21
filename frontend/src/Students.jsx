import { useState, useEffect } from "react";
import { GraduationCap} from "lucide-react";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [viewStudent, setViewStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const getFullName = (student) => {
    return [student.firstName, student.middleName, student.extensionName, student.lastName]
      .filter(Boolean)
      .join(" ");
  };

  const handleView = (student) => {
    setViewStudent(student);
  };

  const closeModal = () => {
    setViewStudent(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredStudents = students.filter((student) =>
    getFullName(student).toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lrn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.gender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.school?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

   const formatDate = (dateString) => {
    if (!dateString) {
      return "N/A";
    }
    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; 
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg mb-5">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="text-blue-700 w-8 h-8" /> 
          <h1 className="text-2xl font-bold">E-ALS Students Master List</h1>
        </div>
        <p className="text-gray-700">View E-ALS Learners informations.</p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-lg mx-1 my-5 max-w-9xl">
        {/* Search Filter */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search by name, LRN, gender, or school..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-2xl bg-gray-200 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto bg-white rounded-xl shadow-md overflow-hidden animate-fade-in transition-all duration-300">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide">LRN</th>
                <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide">Full Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide">Gender</th>
                <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide">School</th>
                <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.length > 0 ? (
                currentStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className={`transition-all duration-300 hover:bg-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <td className="px-6 py-4 text-sm">{student.lrn}</td>
                    <td className="px-6 py-4 text-sm">{getFullName(student)}</td>
                    <td className="px-6 py-4 text-sm">{student.gender}</td>
                    <td className="px-6 py-4 text-sm">{student.school}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleView(student)}
                        className="bg-blue-100 text-blue-800 font-semibold px-4 py-1.5 rounded-full shadow hover:bg-blue-200 transition text-sm mr-2"
                      >
                        View Info 
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center px-6 py-6 text-gray-500">
                    {searchTerm ? 'No students found matching your search.' : 'No students available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <span>
              Page {currentPage} of {totalPages} (Total: {filteredStudents.length} students)
            </span>
            <div className="flex gap-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="bg-blue-100 text-blue-800 font-semibold px-4 py-1.5 rounded-full shadow hover:bg-blue-200 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="bg-blue-100 text-blue-800 font-semibold px-4 py-1.5 rounded-full shadow hover:bg-blue-200 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      

      {/* Modal */}
      {viewStudent && (
        <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative p-8">

            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-2xl"
              onClick={closeModal}
            >
              &times;
            </button>

            {/* Modal Header */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
              Student Information
            </h2>

            {/* Modal Content - Categorized */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">

              {/* Personal Information Category */}
              <div className="md:col-span-2 mb-4 border-b pb-2">
                <h3 className="font-semibold text-lg text-blue-600">Personal Information</h3>
              </div>
              {Object.entries(viewStudent)
                .filter(([key]) => ['firstName', 'middleName', 'extensionName', 'lastName', 'dateOfBirth', 'gender', 'password', 'lrn'].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    {key === 'password' ? (
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={value ?? "N/A"}
                          readOnly
                          className="font-medium pr-8" // Add padding for the icon
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute top-0 right-0 h-full flex items-center px-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322c1.397-2.287 4.792-2.287 6.189 0l5.656 8.657c1.399 2.287 4.794 2.287 6.193 0L21.964 12.322c1.397-2.287 4.792-2.287 6.189 0l-5.657 8.657c-1.399 2.287-4.794-2.287-6.193 0L2.036 12.322z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c4.756 0 8.773-3.162 10.065-7.5M3.98 8.223h16.04M3.98 8.223a1.99 1.99 0 01-.398-1.03A1.99 1.99 0 014.987 5.23l.318.03c.426.04.85.112 1.268.213m-3.763 15.75a1.99 1.99 0 01-.398-1.03 1.99 1.99 0 011.08-1.96l.318.03c.426.04.85.112 1.268.213m10.058-15.75a1.99 1.99 0 01.398-1.03c.135-.37.34-.717.65-.95A1.99 1.99 0 0118.013 5.23l-.318.03c-.426.04-.85.112-1.268.213m3.763 15.75a1.99 1.99 0 01.398-1.03c.135-.37.34-.717.65-.95a1.99 1.99 0 01-1.08-1.96l-.318.03c-.426.04-.85.112-1.268.213" />
                            </svg>
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="font-medium">{key === 'dateOfBirth' ? formatDate(value) : (value ?? "N/A")}</span>
                    )}
                  </div>
                ))}

              {/* Contact Information Category */}
              {Object.keys(viewStudent).some(key => ['email', 'alsEmail', 'address'].includes(key)) && (
                <>
                  <div className="md:col-span-2 mb-4 border-b pb-2 mt-4">
                    <h3 className="font-semibold text-lg text-blue-600">Contact Information</h3>
                  </div>
                  {Object.entries(viewStudent)
                    .filter(([key]) => ['email', 'alsEmail', 'address'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-medium">{value ?? "N/A"}</span>
                      </div>
                    ))}
                </>
              )}

              {/* Educational Information Category */}
              {Object.keys(viewStudent).some(key => ['school', 'gradeLevel', 'psilevel'].includes(key)) && (
                <>
                  <div className="md:col-span-2 mb-4 border-b pb-2 mt-4">
                    <h3 className="font-semibold text-lg text-blue-600">Educational Information</h3>
                  </div>
                  {Object.entries(viewStudent)
                    .filter(([key]) => ['school', 'gradeLevel', 'psilevel'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-medium">{value ?? "N/A"}</span>
                      </div>
                    ))}
                </>
              )}

              {/* Other Information Category (Catch-all for remaining fields) */}
              {Object.keys(viewStudent).filter(key => !['firstName', 'middleName', 'extensionName', 'lastName', 'dateOfBirth', 'gender', 'password', 'lrn', 'email', 'alsEmail', 'address', 'school', 'gradeLevel', 'psilevel', 'id'].includes(key)).length > 0 && (
                <>
                  <div className="md:col-span-2 mb-4 border-b pb-2 mt-4">
                    <h3 className="font-semibold text-lg text-blue-600">Other Information</h3>
                  </div>
                  {Object.entries(viewStudent)
                    .filter(([key]) => !['firstName', 'middleName', 'extensionName', 'lastName', 'dateOfBirth', 'gender', 'password', 'lrn', 'email', 'alsEmail', 'address', 'school', 'gradeLevel', 'psilevel', 'id'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-medium">{value ?? "N/A"}</span>
                      </div>
                    ))}
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}