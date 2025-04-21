import React, { useState, useEffect } from "react";

export default function QuestionEditorModal({ sectionCode, isOpen, onClose, onSave, initialData }) {
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.text);
      setChoices(initialData.choices);
      setAnswer(initialData.answer);
    } else {
      setQuestion("");
      setChoices(["", "", "", ""]);
      setAnswer("");
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!question.trim()) newErrors.question = "Question cannot be empty.";
    if (choices.some((choice) => !choice.trim())) newErrors.choices = "All choices must be filled.";
    if (!answer.trim()) newErrors.answer = "Correct answer cannot be empty.";
    else if (!choices.includes(answer)) newErrors.answer = "Answer must match one of the choices.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
  
    const newQuestion = {
      text: question,
      choices,
      answer,
      section_code: sectionCode,
    };
  
    try {
      if (initialData) {
        // Update existing
        await fetch(`http://localhost:3001/students/questions/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newQuestion),
        });
      } else {
        // Create new
        await fetch(`http://localhost:3001/students/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newQuestion),
        });
      }
  
      onSave();
      onClose();
    } catch (err) {
      console.error("Failed to save question:", err);
    }
  };  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl">
        <h2 className="text-lg font-bold mb-4">
          {initialData ? "Edit Question" : "Add New Question"}
        </h2>

        <input
          type="text"
          placeholder="Enter question"
          className="w-full p-2 border rounded mb-1"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        {errors.question && <p className="text-red-500 text-sm mb-2">{errors.question}</p>}

        {choices.map((choice, index) => (
          <div key={index} className="mb-1">
            <input
              type="text"
              placeholder={`Choice ${index + 1}`}
              className="w-full p-2 border rounded"
              value={choice}
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
          placeholder="Correct answer"
          className="w-full p-2 border rounded mb-1"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        {errors.answer && <p className="text-red-500 text-sm mb-2">{errors.answer}</p>}

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">
            {initialData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
