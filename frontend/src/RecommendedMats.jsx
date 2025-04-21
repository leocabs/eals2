import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import axios from "axios";
import { useLocation } from "react-router-dom";

function RecommendedMats() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [ready, setReady] = useState(null);
  const [weakAreas, setWeakAreas] = useState([]);
  const location = useLocation();

  // Fetch recommendations when component mounts or when refresh state changes
  useEffect(() => {
    const userId = parseInt(localStorage.getItem("user_id"));
    const weakStrands = Array.isArray(location.state?.weakAreas)
      ? location.state.weakAreas
      : [];

    console.log("User ID from localStorage:", userId); // Debug log
    console.log("Weak areas from location state:", weakStrands); // Debug log

    if (userId && weakStrands) {
      axios
        .post("http://localhost:5000/api/recommendations", {
          student_id: userId,
          weak_strands: weakStrands, // Pass the weak strands to the API
        })
        .then((response) => {
          setReady(response.data.ready);
          setWeakAreas(response.data.weak_areas);
        })
        .catch((error) => {
          console.error("Error fetching recommended materials:", error);
        });
    } else {
      console.log("No user_id or weak_strands found.");
    }
  }, [location.state?.refresh, location.state?.weakAreas]); // Watch for refresh or weak areas changes
  return (
    <>
      <Header handleShow={() => setShowSidebar(!showSidebar)} />
      <div className="flex">
        {/* Sidebar - Visible on mobile when showSidebar is true */}
        <div
          className={`${
            showSidebar ? "block" : "hidden"
          } md:block w-full md:w-64 fixed z-20 bg-gray-800`}
        >
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className={`p-6 md:p-10 w-full md:ml-64`}>
          {ready !== null ? (
            <div className="text-center mt-10">
              {ready ? (
                <>
                  <h2 className="text-2xl font-semibold">
                    🎉 You're ready for the A&E Exam!
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Try our Mock-Up Test to simulate the exam.
                  </p>
                  <a
                    href="/mock-test"
                    className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Start AE Mock-Up Test
                  </a>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold mb-6">
                    Recommended Learning Materials
                  </h1>
                  <p className="text-gray-600 mb-8">
                    The system recommends reviewing the following areas:
                  </p>

                  <div className="space-y-8">
                    {weakAreas.length > 0 ? (
                      weakAreas.map((strand) => (
                        <div key={strand.id}>
                          <h2 className="text-xl font-semibold text-blue-700 mb-4">
                            {strand.title}
                          </h2>
                          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {strand.materials.map((material) => (
                              <div
                                key={material.id}
                                className="bg-white rounded-xl p-5 shadow hover:shadow-lg transition border"
                              >
                                <h3 className="text-lg font-medium mb-2">
                                  {material.title}
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                  {material.description ||
                                    "Self-paced learning module."}
                                </p>
                                <a
                                  href={material.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                                >
                                  Open Material
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No weak areas found. You're all set!</p>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </>
  );
}

export default RecommendedMats;
