import React, { useState } from "react";
import { useParams } from "react-router-dom";
import booky from "../images/book.png";

const allModules = {
  ls1: {
    english: [
      { title: "LS1 English - Module 1", pdfUrl: "/modules/LS1M1.pdf" },
      { title: "LS1 English - Module 2", pdfUrl: "/modules/LS1M2.pdf" },
      { title: "LS1 English - Module 3", pdfUrl: "/modules/LS1M3.pdf" },
      { title: "LS1 English - Module 4", pdfUrl: "/modules/LS1M4.pdf" },
      { title: "LS1 English - Module 5", pdfUrl: "/modules/LS1M5.pdf" },
      { title: "LS1 English - Module 6", pdfUrl: "/modules/LS1M6.pdf" },
      { title: "LS1 English - Module 7", pdfUrl: "/modules/LS1M7.pdf" },
      { title: "LS1 English - Module 8", pdfUrl: "/modules/LS1M8.pdf" },
    ],
    filipino: [
      { title: "LS1 Filipino - Module 1", pdfUrl: "/modules/LS1F1.pdf" },
      { title: "LS1 Filipino - Module 2", pdfUrl: "/modules/LS1F2.pdf" },
      { title: "LS1 Filipino - Module 3", pdfUrl: "/modules/LS1F3.pdf" },
      { title: "LS1 Filipino - Module 4", pdfUrl: "/modules/LS1F4.pdf" },
      { title: "LS1 Filipino - Module 5", pdfUrl: "/modules/LS1F5.pdf" },
      { title: "LS1 Filipino - Module 6", pdfUrl: "/modules/LS1F6.pdf" },
      { title: "LS1 Filipino - Module 7", pdfUrl: "/modules/LS1F7.pdf" },
    ],
  },
  ls2: {
    "scientific-literacy-and-critical-thinking-skills": [
      { title: "LS2 Module 1", pdfUrl: "/modules/LS2M1.pdf" },
      { title: "LS2 Module 2", pdfUrl: "/modules/LS2M2.pdf" },
      { title: "LS2 Module 3", pdfUrl: "/modules/LS2M3.pdf" },
      { title: "LS2 Module 4", pdfUrl: "/modules/LS2M4.pdf" },
      { title: "LS2 Module 5", pdfUrl: "/modules/LS2M5.pdf" },
      { title: "LS2 Module 6", pdfUrl: "/modules/LS2M6.pdf" },
      { title: "LS2 Module 7", pdfUrl: "/modules/LS2M7.pdf" },
    ],
  },
  ls3: {
    "mathematical-and-problem-solving-skills": [
      { title: "LS3 Module 1", pdfUrl: "/modules/LS3M1.pdf" },
      { title: "LS3 Module 2", pdfUrl: "/modules/LS3M2.pdf" },
      { title: "LS3 Module 3", pdfUrl: "/modules/LS3M3.pdf" },
      { title: "LS3 Module 4", pdfUrl: "/modules/LS3M4.pdf" },
      { title: "LS3 Module 5", pdfUrl: "/modules/LS3M5.pdf" },
      { title: "LS3 Module 6", pdfUrl: "/modules/LS3M6.pdf" },
      { title: "LS3 Module 7", pdfUrl: "/modules/LS3M7.pdf" },
    ],
  },
  ls4: {
    "life-and-career-skills": [
      { title: "LS4 Module 1", pdfUrl: "/modules/LS4M1.pdf" },
      { title: "LS4 Module 2", pdfUrl: "/modules/LS4M2.pdf" },
      { title: "LS4 Module 3", pdfUrl: "/modules/LS4M3.pdf" },
      { title: "LS4 Module 4", pdfUrl: "/modules/LS4M4.pdf" },
      { title: "LS4 Module 5", pdfUrl: "/modules/LS4M5.pdf" },
      { title: "LS4 Module 6", pdfUrl: "/modules/LS4M6.pdf" },
      { title: "LS4 Module 7", pdfUrl: "/modules/LS4M7.pdf" },
    ],
  },
  ls5: {
    "understanding-the-self-and-society": [
      { title: "LS5 Module 1", pdfUrl: "/modules/LS5M1.pdf" },
      { title: "LS5 Module 2", pdfUrl: "/modules/LS5M2.pdf" },
      { title: "LS5 Module 3", pdfUrl: "/modules/LS5M3.pdf" },
      { title: "LS5 Module 4", pdfUrl: "/modules/LS5M4.pdf" },
      { title: "LS5 Module 5", pdfUrl: "/modules/LS5M5.pdf" },
      { title: "LS5 Module 6", pdfUrl: "/modules/LS5M6.pdf" },
      { title: "LS5 Module 7", pdfUrl: "/modules/LS5M7.pdf" },
    ],
  },
  ls6: {
    "digital-citizenship": [
      { title: "LS6 Module 1", pdfUrl: "/modules/LS6M1.pdf" },
      { title: "LS6 Module 2", pdfUrl: "/modules/LS6M2.pdf" },
      { title: "LS6 Module 3", pdfUrl: "/modules/LS6M3.pdf" },
      { title: "LS6 Module 4", pdfUrl: "/modules/LS6M4.pdf" },
      { title: "LS6 Module 5", pdfUrl: "/modules/LS6M5.pdf" },
      { title: "LS6 Module 6", pdfUrl: "/modules/LS6M6.pdf" },
      { title: "LS6 Module 7", pdfUrl: "/modules/LS6M7.pdf" },
    ],
  }
};

export default function SubjectModules() {
  const { folderName, subjectName } = useParams();
  const modules = allModules[folderName]?.[subjectName] || [];
  const [selectedPdf, setSelectedPdf] = useState(null);

  const prettySubjectName = subjectName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="p-6 bg-[#F5F5F5] min-h-screen">
      <h2 className="text-xl font-semibold mb-4 uppercase">
        {folderName.toUpperCase()} - {prettySubjectName}
      </h2>

      {modules.length === 0 ? (
        <p className="text-gray-600">No modules found for this subject.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {modules.map((mod, idx) => (
            <div
              key={idx}
              className="bg-white shadow-md rounded-lg p-4 text-center"
            >
              <img
                src={booky}
                alt="Module Cover"
                className="w-20 h-20 mx-auto mb-3 object-contain"
              />
              <p className="text-sm font-semibold">{mod.title}</p>
              <div className="flex justify-center gap-3 mt-3 text-xs text-blue-700 font-medium">
                <button
                  onClick={() => setSelectedPdf(mod.pdfUrl)}
                  className="hover:underline"
                >
                  VIEW
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-[90%] max-w-4xl h-[80vh] rounded-lg shadow-lg overflow-hidden relative">
            <button
              onClick={() => setSelectedPdf(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-lg font-bold"
            >
              ✕
            </button>
            <iframe
              src={selectedPdf}
              title="PDF Preview"
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
