import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QuestionEditorModal from "../components/QuestionEditorModal";

export default function QuestionList() {
  const { sectionCode } = useParams();
  const [questions, setQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null); // Holds question to edit

  const refreshQuestions = async () => {
    const res = await fetch(`http://localhost:3001/students/questions/${sectionCode}`);
    const data = await res.json();
    setQuestions(data);

        // Safeguard: Ensure choices is always an array
        const formattedData = data.map((q) => ({
          ...q,
          choices: Array.isArray(q.choices) ? q.choices : JSON.parse(q.choices || '[]'), // Ensure it's always an array
        }));
    
        setQuestions(formattedData);
  };

  useEffect(() => {
    refreshQuestions();
  }, [sectionCode]);

  const handleDelete = async (id) => {
    await fetch(`http://localhost:3001/students/questions/${id}`, { method: "DELETE" });
    refreshQuestions();
  };
  

  const handleEdit = (question) => {
    setEditQuestion(question);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Questions - {sectionCode}</h2>
        <button
          onClick={() => {
            setEditQuestion(null); // Reset modal for new question
            setIsModalOpen(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          + Add Question
        </button>
      </div>

      {questions.length === 0 ? (
        <p className="text-gray-600">No questions yet.</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((q, idx) => (
            <li key={idx} className="p-4 bg-white shadow rounded-lg">
              <p className="font-semibold">{q.text}</p>
              <ul className="ml-4 list-disc text-sm text-gray-700 mt-2">
                {q.choices.map((choice, i) => (
                  <li key={i}>{choice}</li>
                ))}
              </ul>
              <p className="mt-2 text-green-700 text-sm">Answer: {q.answer}</p>

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
        sectionCode={sectionCode}
        initialData={editQuestion}
        onClose={() => setIsModalOpen(false)}
        onSave={refreshQuestions}
      />
    </div>
  );
}
