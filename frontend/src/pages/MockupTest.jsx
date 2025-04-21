import React from "react";
import { useNavigate } from "react-router-dom";

const testSections = [
  { code: "ls1-eng", label: "LS1 – English" },
  { code: "ls1-fil", label: "LS1 – Filipino" },
  { code: "ls2", label: "LS2 – Scientific & Critical Thinking" },
  { code: "ls3", label: "LS3 – Mathematical and Problem Solving Skills" },
  { code: "ls4", label: "LS4 – Life and Career Skills" },
  { code: "ls5", label: "LS5 – Understanding the Self and Society" },
  { code: "ls6", label: "LS6 – Digital Citizenship" }
];

export default function MockupTest() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Mockup Test Question Bank</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {testSections.map((section) => (
          <div
            key={section.code}
            onClick={() => navigate(`/mock-test/${section.code}`)}
            className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-gray-100"
          >
            <h2 className="text-lg font-semibold">{section.label}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
