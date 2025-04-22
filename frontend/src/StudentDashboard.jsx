import React, { useState, useEffect } from "react";
import Card from "./components/Card";
import Table from "./components/Table";
import AnnouncementCard from "./components/AnnouncementCard";

function StudentDashboard() {
  const [totalAssessments, setTotalAssessments] = useState(0);
  const [assessments, setAssessments] = useState([]);
  const [highScore, setHighScore] = useState(0);
  const [lowScore, setLowScore] = useState(0);

  const stats = [
    { count: totalAssessments, label: "Total Assessments" },
    { count: lowScore, label: "Lowest Score" },
    { count: highScore, label: "Highest Score" },
    { count: "85%", label: "A&E Preparedness" },
  ];

  const columns = ["Assessment", "Score", "Date Taken", "Progress"];

  const announcements = [];

  useEffect(() => {
    const studentId = localStorage.getItem("user_id");

    if (studentId) {
      fetch("http://localhost:3000/aemock-results", {
        headers: {
          "user_id": studentId
        }
      })
        .then((response) => response.json())
        .then((data) => {
          const fetchedAssessments = Array.isArray(data) ? data : [];

          setAssessments(fetchedAssessments);
          setTotalAssessments(fetchedAssessments.length);
//connect the query in aemock-results
        })
        .catch((error) => {
          console.error("Error fetching assessments:", error);
        });
    }
  }, []);

  return (
    <div className="w-full gap-4 px-4 mt-10 h-screen overflow-y-auto">
      <div className="text-xl font-bold">DASHBOARD</div>

      <div className="flex justify-between items-center space-x-4 mt-4 w-full flex-wrap">
        {stats.map((item, index) => (
          <Card key={index} count={item.count} label={item.label} />
        ))}
      </div>

      <div className="w-3/4 mt-10">
        <div className="font-medium text-lg">ASSESSMENT HISTORY</div>
        <Table assessment={assessments} columns={columns} />
      </div>

      <div className="font-medium text-lg mt-5">ANNOUNCEMENT</div>
      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((announcement, index) => (
            <AnnouncementCard key={index} {...announcement} />
          ))
        ) : (
          <div className="bg-gray-100 text-gray-500 text-center py-6 rounded-xl border border-gray-200">
            📭 No announcements at the moment.
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
