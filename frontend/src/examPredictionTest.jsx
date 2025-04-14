import React, { useState } from "react";
import { predictExamReadiness } from "./apiService";

const examPredictionTest = () => {
  const [data, setData] = useState({
    user_id: 1,
    psi_score: 0,
    ls1_total_english: 0,
    ls1_total_filipino: 0,
    ls2_slct: 0,
    ls3_mpss: 0,
    ls4_lcs: 0,
    ls5_uss: 0,
    ls6_dc: 0
  });
  const [fltScore, setFltScore] = useState(0); // New state for flt_score
  const [predictionResult, setPredictionResult] = useState(null);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  // Calculate flt_score and update the state
  const calculateFltScore = () => {
    const calculatedFltScore =
      parseInt(data.psi_score || 0) +
      parseInt(data.ls1_total_english || 0) +
      parseInt(data.ls1_total_filipino || 0) +
      parseInt(data.ls2_slct || 0) +
      parseInt(data.ls3_mpss || 0) +
      parseInt(data.ls4_lcs || 0) +
      parseInt(data.ls5_uss || 0) +
      parseInt(data.ls6_dc || 0);
    setFltScore(calculatedFltScore);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await predictExamReadiness({ ...data, flt_score: fltScore });
      setPredictionResult(response.ready ? "Ready for exam!" : "Not ready for exam.");
    } catch (error) {
      console.error("Error predicting exam readiness:", error);
    }
  };

  return (
    <div>
      <h2>Exam Prediction Test</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>PSI Score:</label>
          <input
            type="number"
            name="psi_score"
            value={data.psi_score}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>LS1 Total English:</label>
          <input
            type="number"
            name="ls1_total_english"
            value={data.ls1_total_english}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>LS1 Total Filipino:</label>
          <input
            type="number"
            name="ls1_total_filipino"
            value={data.ls1_total_filipino}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>LS2 SLCT:</label>
          <input
            type="number"
            name="ls2_slct"
            value={data.ls2_slct}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>LS3 MPSS:</label>
          <input
            type="number"
            name="ls3_mpss"
            value={data.ls3_mpss}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>LS4 LCS:</label>
          <input
            type="number"
            name="ls4_lcs"
            value={data.ls4_lcs}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>LS5 USS:</label>
          <input
            type="number"
            name="ls5_uss"
            value={data.ls5_uss}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>LS6 DC:</label>
          <input
            type="number"
            name="ls6_dc"
            value={data.ls6_dc}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>FLT Score:</label>
          <input type="number" value={fltScore} disabled />
        </div>
        <button type="button" onClick={calculateFltScore}>
          Calculate FLT Score
        </button>
        <button type="submit">Submit</button>
      </form>

      {predictionResult && <h3>{predictionResult}</h3>}
    </div>
  );
};

export default examPredictionTest;
