import React from 'react';

export default function StudentModal({ student, onClose }){
 if (!student) return null;

 return(
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg w-[500px] p-6 relative shadow-lg">
    <button onClick={onClose} className="absolute top-2 right-3 text-xl font-bold">×</button>
    
    <h2 className="text-lg font-semibold mb-2">{student.name}</h2>
    <p>Email Address: <a href={`mailto:${student.email}`} className="text-blue-600">{student.email}</a></p>
    <p>Learning Center: {student.center}</p>
    <p>Assigned Class: {student.class}</p>
    <p>
      Performance Level:
      <span className="ml-2 px-2 py-1 bg-yellow-400 rounded text-white text-sm">Needs Improvement</span>
    </p>

    <div className="mt-4 grid grid-cols-2 gap-4">
      <div className="bg-green-100 p-2 text-center rounded">
        <p className="text-xl font-bold">{student.predicted}%</p>
        <p className="text-sm">Average Performance Predicted</p>
      </div>
      <div className="bg-yellow-100 p-2 text-center rounded">
        <p className="text-xl font-bold">{student.latest}%</p>
        <p className="text-sm">Latest Practice Test Score</p>
      </div>
    </div>

    <div className="mt-4">
      <h3 className="text-md font-semibold mb-2">Completion Rate</h3>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-1 border">Assessment Name</th>
            <th className="p-1 border">Score</th>
            <th className="p-1 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {student.assessments.map((assess, index) => (
            <tr key={index}>
              <td className="p-1 border">{assess.subject}</td>
              <td className="p-1 border">{assess.score}%</td>
              <td className="p-1 border text-blue-500 cursor-pointer">View Report</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </div>
</div>
 );
}