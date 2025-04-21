import React, { useState, useEffect } from "react";

export default function AddClassModal({ isOpen, onClose, onSave, initialData }) {
  const [classData, setClassData] = useState({
    id: Date.now(),
    name: "",
    students: 0,
    gradeLevel: "",
    modeOfLearning: "",
    classSchedule: "",
    learningStrand: [],
  });

  useEffect(() => {
    if (initialData) {
      setClassData({
        id: initialData.id || Date.now(),
        name: initialData.name || "",
        students: initialData.students ?? 0,
        gradeLevel: initialData.gradeLevel || "",
        modeOfLearning: initialData.modeOfLearning || "",
        classSchedule: initialData.classSchedule || "",
        learningStrand: initialData.learningStrand || [],
        performance: initialData.performance || [60, 70, 80],
      });
    } else {
      setClassData({
        id: Date.now(),
        name: "",
        students: 0,
        gradeLevel: "",
        modeOfLearning: "",
        classSchedule: "",
        learningStrand: [],
        performance: [60, 70, 80],
      });
    }
  }, [initialData, isOpen]);
  

  const learningStrands = ["LS1", "LS2", "LS3", "LS4", "LS5", "LS6"];

  const toggleStrand = (strand) => {
    setClassData((prev) => ({
      ...prev,
      learningStrand: prev.learningStrand.includes(strand)
        ? prev.learningStrand.filter((s) => s !== strand)
        : [...prev.learningStrand, strand],
    }));
  };

  const handleSubmit = () => {
    if (!classData.name || !classData.gradeLevel || !classData.modeOfLearning || !classData.classSchedule) {
      alert("Please fill out all required fields.");
      return;
    }

    onSave({
      ...classData,
      performance: classData.performance || [60, 70, 80], // fallback if missing
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[500px] relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-4 text-2xl font-bold text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-lg font-semibold mb-2">ADD NEW CLASS</h2>
        <p className="text-sm text-gray-600 mb-4">
          Fill in the information below to add a new student account. Fields marked with * are required. Please ensure all required fields are filled out before submitting.
        </p>

        {/* Form Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm block mb-1">Class Name*</label>
            <input
              type="text"
              value={classData.name}
              onChange={(e) => setClassData({ ...classData, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm block mb-1">Grade Level / Learning Level*</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={classData.gradeLevel}
              onChange={(e) => setClassData({ ...classData, gradeLevel: e.target.value })}
              required
            >
              <option value="">Select Grade Level</option>
              <option value="Grade 7">Grade 7</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
            </select>
          </div>

          <div>
            <label className="text-sm block mb-1">Mode of Learning*</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={classData.modeOfLearning}
              onChange={(e) => setClassData({ ...classData, modeOfLearning: e.target.value })}
              required
            >
              <option value="">Select Mode</option>
              <option value="Online">Online</option>
              <option value="Face-to-Face">Face-to-Face</option>
              <option value="Modular">Modular</option>
            </select>
          </div>

          <div>
            <label className="text-sm block mb-1">Class Schedule*</label>
            <input
              type="text"
              value={classData.classSchedule}
              onChange={(e) => setClassData({ ...classData, classSchedule: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>

        {/* Learning Strand Buttons */}
        <div className="mt-4">
          <label className="text-sm block mb-2">Learning Strand Name*</label>
          <div className="flex flex-wrap gap-2">
            {learningStrands.map((ls) => (
              <button
                key={ls}
                type="button"
                onClick={() => toggleStrand(ls)}
                className={`px-4 py-2 rounded border ${
                  classData.learningStrand.includes(ls)
                    ? "bg-green-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                {ls}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 text-right">
          <button
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded"
            onClick={handleSubmit}
          >
            {initialData ? "SAVE CHANGES" : "ADD CLASS"}
          </button>
        </div>
      </div>
    </div>
  );
}
