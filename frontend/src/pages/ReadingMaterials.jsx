import React, { useState, useEffect } from "react";
import { Folder } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom

const folders = [
  { name: "LS1", subjects: ["ENGLISH"], ls_id: 1 },
  { name: "LS1", subjects: ["FILIPINO"], ls_id: 2 },
  {
    name: "LS2",
    subjects: ["Scientific Literacy and Critical Thinking Skills"],
    ls_id: 3,
  },
  {
    name: "LS3",
    subjects: ["Mathematical and Problem Solving Skills"],
    ls_id: 4,
  },
  { name: "LS4", subjects: ["Life and Career Skills"], ls_id: 5 },
  { name: "LS5", subjects: ["Understanding the Self and Society"], ls_id: 6 },
  { name: "LS6", subjects: ["Digital Citizenship"], ls_id: 7 },
];

export default function ReadingMaterials() {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    setModules([]); // Clear old data
  };

  const fetchMaterials = async (ls_id) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/students/reading_materials/${ls_id}`
      );
      const data = await response.json();
      setModules(data);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFolder) {
      fetchMaterials(selectedFolder.ls_id);
    }
  }, [selectedFolder]);

  // Handle the redirect to UploadMaterial
  const handleRedirect = () => {
    navigate("/upload-materials"); // Programmatically navigate to /upload-material
  };

  return (
    <div className="p-6 bg-[#F5F5F5] min-h-screen">
      <h2 className="text-2xl font-semibold mb-6">Reading Materials</h2>
      
      {/* Move the Upload New Material button to the right */}
      <div className="flex justify-end mb-5">
        <button
          onClick={handleRedirect}
          className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-500"
        >
          Upload New Material
        </button>
      </div>
      
      {/* Display the folder list */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-10">
        {folders.map((folder, idx) => (
          <div
            key={idx}
            onClick={() => handleFolderClick(folder)}
            className={`bg-white shadow-md rounded-lg p-6 flex flex-col items-center cursor-pointer hover:bg-gray-100 transition-all ${
              selectedFolder?.ls_id === folder.ls_id
                ? "ring-2 ring-blue-500"
                : ""
            }`}
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
      
      {/* Only show the materials table if a folder is selected */}
      {selectedFolder && (
        <div>
          {loading ? (
            <p>Loading materials...</p>
          ) : (
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Title</th>
                  <th className="border px-4 py-2">Description</th>
                  <th className="border px-4 py-2">Download</th>
                </tr>
              </thead>
              <tbody>
                {modules.length > 0 ? (
                  modules.map((material) => (
                    <tr key={material.lmaterials_id}>
                      <td className="border px-4 py-2">
                        {material.material_title}
                      </td>
                      <td className="border px-4 py-2">{material.description}</td>
                      <td className="border px-4 py-2">
                        <a
                          href={material.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4">
                      No materials found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
