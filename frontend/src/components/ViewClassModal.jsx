export default function ViewClassModal({ isOpen, onClose, classData, failingStudents }) {
  if (!isOpen || !classData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Students failing in {classData.name}</h2>

        {failingStudents.length > 0 ? (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {failingStudents.map((student) => (
              <li key={student.student_id} className="border p-2 rounded">
                {student.first_name} {student.last_name} — Score: {student.score}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No students below threshold.</p>
        )}

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
