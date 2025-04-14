import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import materials from "./materialsData"; // dynamic material data

function RecommendedMats() {
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <>
    <Header handleShow={() => setShowSidebar(!showSidebar)} />
     <div className="flex ">
     {showSidebar && (
          <div className="w-64 fixed h-full z-20">
            <Sidebar />
          </div>
        )}
        <div className="p-10">
          {materials.prediction === "Ready" ? (
            <div className="text-center mt-10">
              <h2 className="text-2xl font-semibold">
                🎉 You're ready for the A&E Exam!
              </h2>
              <p className="text-gray-600 mt-2">
                Try our Mock-Up Test to simulate the exam.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-6">
                 Recommended Learning Materials
              </h1>
              <p className="text-gray-600 mb-8">
                The system recommends reviewing the following areas:
              </p>

              <div className="space-y-8">
                {Object.entries(materials.weakAreas).map(([strand, items]) => (
                  <div key={strand}>
                    <h2 className="text-xl font-semibold text-blue-700 mb-4">
                      {strand}
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl p-5 shadow hover:shadow-lg transition border"
                        >
                          <h3 className="text-lg font-medium mb-2">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-4">
                            {item.description || "Self-paced learning module."}
                          </p>
                          <a
                            href={item.link}
                            className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                          >
                            Open Material
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
</>
  );
}

export default RecommendedMats;
