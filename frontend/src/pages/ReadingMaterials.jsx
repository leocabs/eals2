import React from "react";
import { useNavigate } from "react-router-dom";
import { Folder } from "lucide-react";

const folders = [
  { name: "LS1", subjects: ["ENGLISH", "FILIPINO"] },
  { name: "LS2", subjects: ["Scientific Literacy and Critical Thinking Skills"] },
  { name: "LS3", subjects: ["Mathematical and Problem Solving Skills"] },
  { name: "LS4", subjects: ["Life and Career Skills"] },
  { name: "LS5", subjects: ["Understanding the Self and Society"] },
  { name: "LS6", subjects: ["Digital Citizenship"] },
];

export default function ReadingMaterials() {
  const navigate = useNavigate();

  const handleRedirect = (folder) => {
    if (folder.subjects.length === 1) {
      // If only one subject, go directly to the module list
      const subjectSlug = folder.subjects[0].toLowerCase().replace(/\s+/g, "-");
      navigate(`/reading-materials/${folder.name.toLowerCase()}/${subjectSlug}`);
    } else {
      // If multiple subjects, go to subject selector page
      navigate(`/reading-materials/${folder.name.toLowerCase()}`);
    }
  };

  return (
    <div className="p-6 bg-[#F5F5F5] min-h-screen">
      <h2 className="text-2xl font-semibold mb-6">Reading Materials</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {folders.map((folder, idx) => (
          <div
            key={idx}
            onClick={() => handleRedirect(folder)}
            className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center cursor-pointer hover:bg-gray-100 transition-all"
          >
            <Folder className="w-12 h-12 text-blue-600 mb-3" />
            <p className="text-lg font-medium">{folder.name}</p>
            <p className="text-sm text-gray-500">
              {folder.subjects.length > 1
                ? `${folder.subjects.length} Subjects`
                : folder.subjects[0]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
