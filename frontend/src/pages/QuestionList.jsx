import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QuestionEditorModal from "../components/QuestionEditorModal";

export default function QuestionList() {
  const { ls_id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);

  const refreshQuestions = async () => {
    try {
      const res = await fetch(`http://localhost:3000/students/questions/${ls_id}`);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      console.log("Fetched Data:", data);

      if (Array.isArray(data) && data.every(q => q && q.id)) {
        setQuestions(data);
      } else {
        console.error("Invalid question data structure:", data);
      setQuestions([]);
      }
    } catch (err) {
      console.error("Error fetching:", err);
      setQuestions([]);
    }
  };

  useEffect(() => {
    refreshQuestions();
  }, [ls_id]);

  const handleDelete = async (id) => {
    console.log("Deleting question with id:", id);
    try {
      const res = await fetch(
        `http://localhost:3000/students/questions/${id}`, 
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(res.statusText);
      refreshQuestions();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };


  // Handle adding or editing the question
  const handleEdit = (q) => {
    setEditQuestion({
      id: q.id,
      text: q.text,
      choices: q.choices,
      answer: q.answer,
      difficulty: q.difficulty,
    });
    setIsModalOpen(true);
  };
  
  const handleAdd = () => {
    setEditQuestion(null);  // Set to null for adding a new question
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async () => {
    // Always refresh from the server to ensure consistency
    await refreshQuestions();
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Questions – {ls_id}</h2>
        <button
          onClick={handleAdd}  // Use handleAdd for adding
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          + Add Question
        </button>
      </div>
  
      {questions.length === 0 ? (
        <p className="text-gray-600">No questions yet.</p>
      ) : (
<ul className="space-y-4">
  {questions
    .filter((q) => q && q.id !== undefined)
    .map((q) => (
      <li key={q.id} className="p-4 bg-white shadow rounded-lg">
        <p className="font-semibold text-lg">{q.text}</p>
        <div className="ml-4 mt-2 space-y-1 text-sm text-gray-700">
          {q.choices.map((choice, i) => (
            <p key={i}>
              <strong>{String.fromCharCode(65 + i)}:</strong> {choice}
            </p>
          ))}
        </div>
        <p className="mt-2 text-green-700 text-sm">
          Answer: <strong>{q.answer}</strong>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Difficulty: {q.difficulty}
        </p>
        <div className="flex gap-3 mt-3 text-sm">
          <button
            onClick={() => handleEdit(q)}
            className="text-blue-600 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(q.id)}
            className="text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      </li>
    ))}
</ul>

      )}
  
          <QuestionEditorModal
          isOpen={isModalOpen}
          sectionCode={ls_id}
          initialData={editQuestion}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveQuestion}  // Use the new function
        />
    </div>
  );
  
}
