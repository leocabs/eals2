import React, { useState, useEffect } from "react";
import "./AEMockTest.css";
import QuestionContainer from "./components/QuestionContainer";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const TOTAL_TEST_TIME = 2 * 60 * 60;
const PER_QUESTION_TIME = 2 * 60;

function AEMock() {
  const [timeLeft, setTimeLeft] = useState(TOTAL_TEST_TIME);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(PER_QUESTION_TIME);
  const [isTestActive, setIsTestActive] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selected, setSelected] = useState('');
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const progressValue = (currentQuestion / (questions.length || 1)) * 100;

  useEffect(() => {
    if (isTestActive && timeLeft > 0) {
      const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [isTestActive, timeLeft]);

  useEffect(() => {
    if (isTestActive && questionTimeLeft > 0) {
      const interval = setInterval(() => setQuestionTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
    if (isTestActive && questionTimeLeft === 0) {
      handleNextQuestion();
    }
  }, [isTestActive, questionTimeLeft]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startTest = () => {
    setShowConfirmation(false);
    setIsTestActive(true);
    setTimeLeft(TOTAL_TEST_TIME);
    setQuestionTimeLeft(PER_QUESTION_TIME);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length) {
      setCurrentQuestion(prev => prev + 1);
      setSelected('');
      setQuestionTimeLeft(PER_QUESTION_TIME);
    } else {
      alert("You have completed all the questions!");
      setIsTestActive(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
      setSelected('');
      setQuestionTimeLeft(PER_QUESTION_TIME);
    }
  };

  const shuffleArray = (array) => {
    let shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await fetch("http://localhost:3000/questions");
      const data = await response.json();
      const shuffledQuestions = shuffleArray(data).slice(0, 5);
      setQuestions(shuffledQuestions);
    };
    fetchQuestions();
  }, []);

  const handleAnswer = (option) => {
    const question = questions[currentQuestion - 1];
    const correctAnswerLetter = question.correct_answer;
    const correctOptionValue = question[`option_${correctAnswerLetter.toLowerCase()}`];
    const isCorrect = option === correctOptionValue;

    setSelected(option);

    setUserAnswers((prev) => {
      const updated = [...prev];
      updated[currentQuestion - 1] = {
        question_id: question.id,
        selected: option,
        correct: correctAnswerLetter,
        isCorrect,
      };
      return updated;
    });
  };

  const handleSubmitTest = async () => {
    if (!questions.length || userAnswers.length !== questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    const correctAnswers = userAnswers.filter((a) => a.isCorrect).length;
    const totalQuestions = questions.length;
    const score = (correctAnswers / totalQuestions) * 100;
    const timeTaken = TOTAL_TEST_TIME - timeLeft;
    const dateTaken = new Date().toISOString().split("T")[0];
    const studentId = parseInt(localStorage.getItem("user_id"), 10);

    if (!studentId) {
      alert("User not logged in.");
      return;
    }
    console.log(studentId)

    const payload = {
      student_id: studentId,
      total_time_taken: timeTaken,
      questions_answered: totalQuestions,
      correct_answers: correctAnswers,
      incorrect_answers: totalQuestions - correctAnswers,
      score: parseFloat(score.toFixed(2)),
      date_taken: dateTaken,
    };

    try {
      const response = await fetch("http://localhost:3000/ae-mock-test-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to submit");
      const data = await response.json();
      console.log(data)
      alert("Submitted! Your score: " + data.score);
      setIsTestActive(false);
    } catch (error) {
      console.error(error);
      alert("Submission failed.");
    }
  };

  return (
    <div className="app-container">
      <div className="mock-test-container">
        {!isTestActive ? (
          <div className="test-intro">
            <h2>A&E Mock Test</h2>
            <p>This test will assess your readiness for the actual A&E exam.</p>
            <p>You will have 2 hours to complete the test.</p>
            <button className="start-button" onClick={() => setShowConfirmation(true)}>Start Test</button>
            {showConfirmation && (
              <div className="confirmation-modal">
                <div className="modal-content">
                  <h3>Test Instructions</h3>
                  <ul>
                    <li>2-hour time limit</li>
                    <li>2 minutes per question</li>
                    <li>No pausing</li>
                    <li>Timer runs even if you leave</li>
                  </ul>
                  <div className="modal-buttons">
                    <button onClick={() => setShowConfirmation(false)}>Cancel</button>
                    <button onClick={startTest}>Confirm Start</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center bg-white shadow p-4 mb-4">
              <div>Time Left: <span className="font-mono text-red-600">{formatTime(timeLeft)}</span></div>
              <div>Per Question: <span className="font-mono text-yellow-600">{formatTime(questionTimeLeft)}</span></div>
              <div>Question {currentQuestion} of {questions.length}</div>
            </div>

            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Box sx={{ width: "100%", mr: 1 }}>
                <LinearProgress variant="determinate" value={progressValue} />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2">{`${Math.round(progressValue)}%`}</Typography>
              </Box>
            </Box>

            {questions.length > 0 && (
              <QuestionContainer
                question={questions[currentQuestion - 1].question}
                options={[questions[currentQuestion - 1].option_a, questions[currentQuestion - 1].option_b, questions[currentQuestion - 1].option_c, questions[currentQuestion - 1].option_d]}
                selectedOption={selected}
                onOptionChange={handleAnswer}
                questionNumber={currentQuestion}
                totalQuestions={questions.length}
              />
            )}

            <div className="flex justify-between mt-4">
              {currentQuestion > 1 && (
                <button onClick={handlePreviousQuestion} className="previous-button">Previous Question</button>
              )}

              {currentQuestion < questions.length ? (
                <button onClick={handleNextQuestion} className="next-button">Next Question</button>
              ) : (
                <button onClick={handleSubmitTest} className="submit-button">Submit Test</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AEMock;
