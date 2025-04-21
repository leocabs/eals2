import React, { useState } from "react";

export default function UploadMaterial() {
  const [formData, setFormData] = useState({
    ls_id: "1",
    material_title: "",
    description: "",
    file: null,
  });
  const [message, setMessage] = useState("");

  // Handle changes in form fields
  const handleChange = (e) => {
    if (e.target.name === "file") {
      const selectedFile = e.target.files[0];
      if (selectedFile && selectedFile.type !== "application/pdf") {
        alert("Only PDF files are allowed.");
        return;
      }
      setFormData({ ...formData, file: selectedFile });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields before sending
    if (!formData.material_title || !formData.description || !formData.file) {
      setMessage("Please fill out all fields and upload a file.");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("ls_id", formData.ls_id);
    uploadData.append("material_title", formData.material_title);
    uploadData.append("description", formData.description);
    uploadData.append("file", formData.file);

    try {
      const res = await fetch("http://localhost:3000/students/upload_material", {
        method: "POST",
        body: uploadData,
      });

      const result = await res.json();
      if (res.ok) {
        setMessage(result.message || "Upload successful!");
        // Optionally, reset the form
        setFormData({
          ls_id: "1",
          material_title: "",
          description: "",
          file: null,
        });
      } else {
        setMessage(result.message || "Upload failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Upload failed. Please check your connection.");
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-lg mx-auto mt-20">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">Upload Reading Material</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2 text-gray-600">Learning Strand</label>
          <select
            name="ls_id"
            value={formData.ls_id}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">LS1 - English</option>
            <option value="2">LS1 - Filipino</option>
            <option value="3">LS2 - SLCT</option>
            <option value="4">LS3 - MPSS</option>
            <option value="5">LS4 - LCS</option>
            <option value="6">LS5 - USS</option>
            <option value="7">LS6 - Digital Citizenship</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2 text-gray-600">Material Title</label>
          <input
            name="material_title"
            type="text"
            value={formData.material_title}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter material title"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2 text-gray-600">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide a short description"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2 text-gray-600">Upload PDF</label>
          <input
            name="file"
            type="file"
            accept="application/pdf"
            onChange={handleChange}
            className="w-full border p-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            Upload Material
          </button>
        </div>
      </form>

      {message && (
        <div className={`mt-6 text-center ${message.includes("successful") ? "text-green-600" : "text-red-600"}`}>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
