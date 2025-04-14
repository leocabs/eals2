import React, { useState, useEffect } from "react";

function Table({ columns }) {
  const [assessments, setAssessments] = useState([]);
  const studentId = localStorage.getItem("user_id");
  const [totalAssessments, setTotalAssessments] = useState(0);

  useEffect(() => {
    if (studentId) {
      fetch(`http://localhost:3000/aemock-results`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "user_id": studentId, // Send user_id in the headers
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setAssessments(data); // Set the fetched data to assessments state
          setTotalAssessments(data.length); // Set the total number of assessments
        })
        .catch((error) => {
          console.error("Error fetching assessments:", error);
        });
    }
  }, [studentId]);

  return (
    <div className="overflow-y-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left bg-slate-50">
        <thead className="bg-gray-200">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-6 py-3">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {assessments.map((assessment) => (
            <tr key={assessment.result_id} className="hover:bg-gray-100">
              <td className="px-6 py-4">This is a placeholder</td>
              <td className="px-6 py-4">{assessment.score}</td>
              <td className="px-6 py-4">{assessment.date_taken}</td>
              <td className="px-6 py-4">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-emerald-700 h-4 rounded-full p-0.5 leading-none text-xs font-medium text-blue-100 text-center"
                    style={{ width: `${assessment.progress}%` }}
                  >
                    100%
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
