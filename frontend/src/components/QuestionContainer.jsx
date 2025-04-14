import React from 'react';
import './QuestionContainer.css';

const QuestionContainer = ({ 
  question, 
  options, 
  selectedOption,
  onOptionChange,
  questionNumber,
  totalQuestions
}) => {
  // Label array for A, B, C, D, etc.
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="question-container">
      <div className="question-header">
        <h3>Question {questionNumber} of {totalQuestions}</h3>
      </div>
      <div className="question-content">
        <p>{question}</p>
        <div className="options">
          {options.map((option, index) => (
            <label className="radio-option" key={index}>
              <input
                type="radio"
                className="radio-input"
                name={`question-${questionNumber}`}  
                value={option}
                checked={selectedOption === option}
                onChange={() => {
                  onOptionChange(option);
                }}
              />
              <span className="option-text">{optionLabels[index]}: {option}</span>  {/* Option Label (A, B, C, D) */}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionContainer;
