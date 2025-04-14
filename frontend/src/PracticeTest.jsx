import { useState, useEffect } from 'react';
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import './PracticeTest.css';

function PracticeTest() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [isTestActive, setIsTestActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleShow = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const subjects = [
    { id: 1, name: 'Mathematics', description: 'Practice algebra, geometry, and calculus problems', icon: '🧮' },
    { id: 2, name: 'Science', description: 'Test your knowledge in physics, chemistry, and biology', icon: '🔬' },
    { id: 3, name: 'English', description: 'Improve grammar, vocabulary, and reading comprehension', icon: '📚' },
    { id: 4, name: 'History', description: 'Explore world history and important events', icon: '🏛️' }
  ];

  // Timer countdown
  useEffect(() => {
    if (!isTestActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsTestActive(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setShowConfirmation(true);
  };

  const startTest = () => {
    setShowConfirmation(false);
    setIsTestActive(true);
  };

  return (
    <div className="flex">
      {isSidebarOpen && <Sidebar />}
      <div className="flex-1 min-h-screen flex flex-col">
        <Header handleShow={handleShow} />

        <div className={`p-6 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-0' : 'ml-0'}`}>
          <div className="practice-test-container">
            {!isTestActive ? (
              <div className="subject-selection">
                <h2 className="text-2xl font-bold mb-4">Select a Subject for Practice Test</h2>
                <div className="subject-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {subjects.map(subject => (
                    <div
                      key={subject.id}
                      className="subject-card bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer"
                      onClick={() => handleSubjectSelect(subject)}
                    >
                      <div className="subject-icon text-3xl">{subject.icon}</div>
                      <h3 className="subject-name text-lg font-semibold">{subject.name}</h3>
                      <p className="subject-description text-sm text-gray-600">{subject.description}</p>
                    </div>
                  ))}
                </div>

                {showConfirmation && selectedSubject && (
                  <div className="confirmation-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="modal-content bg-white p-6 rounded shadow-lg max-w-md w-full">
                      <div className="modal-header mb-4">
                        <h3 className="text-lg font-semibold mb-2">Confirm Test Selection</h3>
                        <div className="modal-subject flex items-center gap-2">
                          <span className="text-xl">{selectedSubject.icon}</span>
                          <span className="font-medium">{selectedSubject.name}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-4">
                        You are about to start the {selectedSubject.name} practice test.
                        This test will assess your knowledge in {selectedSubject.description.toLowerCase()}.
                      </p>
                      <div className="test-details text-sm text-gray-600 mb-4">
                        <p><strong>Duration:</strong> 30 minutes</p>
                        <p><strong>Questions:</strong> 20 multiple choice</p>
                        <p><strong>Passing Score:</strong> 70% or higher</p>
                      </div>
                      <div className="modal-buttons flex justify-end gap-2">
                        <button onClick={() => setShowConfirmation(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                          Cancel
                        </button>
                        <button onClick={startTest} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                          Start Test
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="timer-container mb-4">
                  <h3 className="text-xl font-bold">Time Remaining: {formatTime(timeLeft)}</h3>
                  <h4 className="text-md text-gray-700">{selectedSubject.name} Test</h4>
                </div>

                <div className="test-content bg-white p-6 rounded shadow">
                  {/* Sample Test Question - Replace with actual component later */}
                  <div className="question mb-4">
                    <p className="mb-2 font-medium">
                      1. Lorem ipsum dolor sit amet, consectetur adipiscing elit...
                    </p>
                    <div className="options space-y-2">
                      {['Option A', 'Option B', 'Option C', 'Option D'].map((option, idx) => (
                        <label key={idx} className="flex items-center gap-2">
                          <input type="radio" name="q1" />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="submit-row mt-6 text-right">
                  <button
                    type="button"
                    className="submit-button px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={!isTestActive}
                  >
                    Submit Test
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PracticeTest;
