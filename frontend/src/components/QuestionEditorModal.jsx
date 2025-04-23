import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function QuestionEditorModal({ sectionCode, isOpen, onClose, onSave, initialData }) {
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.text || "");
      setChoices(initialData.choices || ["", "", "", ""]);
      setAnswer(getAnswerLetter(initialData.answer, initialData.choices));
    } else {
      setQuestion("");
      setChoices(["", "", "", ""]);
      setAnswer("");
    }
    setErrors({});
  }, [initialData, isOpen]);

  const getAnswerLetter = (answerText, choiceList) => {
    const index = choiceList.findIndex((choice) => choice === answerText);
    
    return index >= 0 ? String.fromCharCode(65 + index) : "";
  };

  const validate = () => {
    const newErrors = {};
    if (!question.trim()) newErrors.question = "Question cannot be empty.";
    if (choices.some((choice) => !choice.trim())) newErrors.choices = "All choices must be filled.";
    if (!answer.trim()) {
      newErrors.answer = "Correct answer cannot be empty.";
    } else if (!["A", "B", "C", "D"].includes(answer.toUpperCase())) {
      newErrors.answer = "Answer must be one of A, B, C, or D.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const indexMap = { A: 0, B: 1, C: 2, D: 3 };
    const answerIndex = indexMap[answer.toUpperCase()];
    const actualAnswer = choices[answerIndex];

    if (!actualAnswer) {
      alert("The selected answer letter does not match any of the choices.");
      return;
    }

    const truncatedAnswer = actualAnswer.substring(0, 45);

    const questionData = {
      question: question,
      option_a: choices[0],
      option_b: choices[1],
      option_c: choices[2],
      option_d: choices[3],
      correct_answer: truncatedAnswer,
      difficulty: initialData?.difficulty || "medium",
      ls_id: sectionCode,
    };

    try {
      let response;
      if (initialData && initialData.id) {
        response = await fetch(`http://localhost:3000/students/questions/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(questionData),
        });
      } else {
        response = await fetch("http://localhost:3000/students/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(questionData),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Server error: ${response.status} ${errorText}`);
      }

      onSave();
      onClose();
    } catch (err) {
      console.error("Failed to save question:", err);
      alert("An error occurred while saving the question. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white shadow-[0px_0px_40px_8px_rgba(0,_0,_0,_0.1)] rounded-lg p-6 w-full max-w-xl">
        <h2 className="text-lg font-bold mb-4">
          {initialData ? "Edit Question" : "Add New Question"}
        </h2>

        <input
          type="text"
          placeholder="Enter question"
          className="w-full p-2 border rounded mb-1"
          value={question || ""}
          onChange={(e) => setQuestion(e.target.value)}
        />
        {errors.question && <p className="text-red-500 text-sm mb-2">{errors.question}</p>}

        {choices.map((choice, index) => (
          <div key={index} className="mb-1">
            <input
              type="text"
              placeholder={`Choice ${String.fromCharCode(65 + index)}`}
              className="w-full p-2 border rounded"
              value={choice || ""}
              onChange={(e) => {
                const updated = [...choices];
                updated[index] = e.target.value;
                setChoices(updated);
              }}
            />
          </div>
        ))}
        {errors.choices && <p className="text-red-500 text-sm mb-2">{errors.choices}</p>}

        <input
          type="text"
          placeholder="Correct answer letter (A–D)"
          className="w-full p-2 border rounded mb-1"
          value={answer || ""}
          onChange={(e) => setAnswer(e.target.value.toUpperCase())}
        />
        {errors.answer && <p className="text-red-500 text-sm mb-2">{errors.answer}</p>}

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="bg-gray-100 text-gray-800 font-semibold px-6 py-2 rounded-full shadow hover:bg-gray-200 transition">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-green-100 text-green-800 font-semibold px-6 py-2 rounded-full shadow hover:bg-green-200 transition">
            {initialData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
