import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Card from "./components/Card";
import Table from "./components/Table";
import AnnouncementCard from "./components/AnnouncementCard";

function StudentDashboard() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [totalAssessments, setTotalAssessments] = useState(0);

  const stats = [
    { count: totalAssessments, label: "Total Assessments" },
    { count: "72%", label: "Lowest Score" },
    { count: "80%", label: "Highest Score" },
    { count: "85%", label: "A&E Preparedness" },
  ];

  const assessments = [
    {
      id: 1,
      name: "Module 1 Practice Test",
      score: "90%",
      date_taken: "11/07/2014",
      progress: 80,
    },
    {
      id: 2,
      name: "Module 5 Practice Test",
      score: "56%",
      date_taken: "11/08/2014",
      progress: 50,
    },
    // Add more...
  ];

  const columns = ["Assessment", "Score", "Date Taken", "Progress"];

  const announcements = [
    // Example:
    // {
    //   title: "System Maintenance",
    //   message: "The platform will be unavailable on April 10 from 1 AM to 3 AM for scheduled maintenance.",
    //   date: "April 9, 2025",
    //   isNew: true,
    // },
  ];

  useEffect(() => {
    const studentId = localStorage.getItem("user_id");
  
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
          setTotalAssessments(data.length);
        })
        .catch((error) => {
          console.error("Error fetching assessments:", error);
        });
      
    }
  }, []);
  

  return (
    <>
      <Header handleShow={() => setShowSidebar(!showSidebar)} />
      <div className="flex">
        {showSidebar && (
          <div className="w-64 fixed h-full z-20">
            <Sidebar />
          </div>
        )}
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
      </div>
    </>
  );
}

export default StudentDashboard;
