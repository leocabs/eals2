import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QuestionEditorModal from "../components/QuestionEditorModal";


const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center">
      <div className="bg-white rounded-md p-6 shadow-lg">
        <p className="mb-4 text-lg">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function QuestionList() {
  const { ls_id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [questionToDeleteId, setQuestionToDeleteId] = useState(null);

  const refreshQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/students/questions/${ls_id}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      console.log("Fetched Data:", data);

      if (Array.isArray(data) && data.every((q) => q && q.id !== undefined)) {
        setQuestions(data);
      } else {
        console.error("Invalid question data structure:", data);
        setQuestions([]);
        setError("Invalid data format received from the server.");
      }
    } catch (err) {
      console.error("Error fetching:", err);
      setQuestions([]);
      setError("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ls_id]);

  const handleDeleteApi = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:3000/students/questions/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      // Optimistically update UI
      setQuestions(questions.filter((q) => q.id !== id));
    } catch (err) {
      console.error("Error deleting:", err);
      setError("Failed to delete the question.");
      // Optionally, revert the UI update if deletion failed
      refreshQuestions();
    } finally {
      setIsConfirmationOpen(false);
      setQuestionToDeleteId(null);
    }
  };

  const handleShowConfirmation = (id) => {
    setQuestionToDeleteId(id);
    setIsConfirmationOpen(true);
  };

  const handleCancelDelete = () => {
    setIsConfirmationOpen(false);
    setQuestionToDeleteId(null);
  };

  const handleConfirmDelete = () => {
    if (questionToDeleteId !== null) {
      handleDeleteApi(questionToDeleteId);
    }
  };

  const handleEdit = (q) => {
    setEditQuestion({ ...q }); // Create a copy to avoid direct state modification
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditQuestion(null); // Set to null for adding a new question
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async (savedQuestion) => {
    setIsModalOpen(false);
    setLoading(true);
    setError(null);

    try {
      const method = savedQuestion.id ? "PUT" : "POST";
      const url = savedQuestion.id
        ? `http://localhost:3000/students/questions/${savedQuestion.id}`
        : `http://localhost:3000/students/questions/${ls_id}`;

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(savedQuestion),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      refreshQuestions(); // Refresh the question list after saving
    } catch (err) {
      refreshQuestions();
    } finally {
      setLoading(false);
    }
    setEditQuestion(null);
  };

  if (loading) {
    return <p className="text-gray-600 italic">Loading questions...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="bg-gray-50 p-6 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Questions – {ls_id}</h2>
        <button
          onClick={handleAdd}
          className="bg-green-100 text-green-800 font-semibold px-6 py-2 rounded-full shadow hover:bg-green-200 transition"
        >
          + Add Question
        </button>
      </div>

      {questions.length === 0 ? (
        <p className="text-gray-600 italic">No questions have been added yet.</p>
      ) : (
        <ul className="space-y-4">
          {questions
            .filter((q) => q && q.id !== undefined)
            .map((q, index) => (
              <li
                key={q.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition duration-300 ease-in-out transform hover:scale-101"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-4">
                  <p className="font-semibold text-lg text-gray-900 mb-2">{q.text}</p>
                  <div className="ml-4 mt-2 space-y-1 text-sm text-gray-700">
                    {q.choices.map((choice, i) => (
                      <p key={i}>
                        <strong>{String.fromCharCode(65 + i)}:</strong> {choice}
                      </p>
                    ))}
                  </div>
                  <p className="mt-2 text-green-600 text-sm">
                    Answer: <strong className="font-medium">{q.answer}</strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Difficulty: <span className="font-normal">{q.difficulty}</span>
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => handleEdit(q)}
                      className="bg-blue-100 text-blue-800 font-semibold px-5 py-2 rounded-full shadow hover:bg-blue-200 transition focus:outline-none"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleShowConfirmation(q.id)}
                      className="bg-red-100 text-red-800 font-semibold px-5 py-2 rounded-full shadow hover:bg-red-200 transition focus:outline-none"
                    >
                      Delete
                    </button>
                  </div>
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
        onSave={handleSaveQuestion}
      />

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this question?"
      />
    </div>
  );
}