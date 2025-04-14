import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import passed from "./assets/images/passed.png";
import failed from "./assets/images/failed.png";
import CloseIcon from "@mui/icons-material/Close";

const card = {
  Good: {
    image: passed,
    status: "Passed",
    message: "Congratulations! You are ready for the A&E exam.",
    button: "Go to Dashboard",
  },
  Bad: {
    image: failed,
    status: "Failed",
    message: "You need more preparation. Keep studying!",
    button: "Let's go and fix it",
  },
};

const scoreLimits = {
  score1English: 15,
  score1Filipino: 15,
  score2SLCT: 13,
  score3MPSS: 15,
  score4LCS: 10,
  score5USS: 10,
  score6DC: 10,
  pisScore: 10,
};

const keyMap = {
  score1English: "ls1_total_english",
  score1Filipino: "ls1_total_filipino",
  score2SLCT: "ls2_slct",
  score3MPSS: "ls3_mpss",
  score4LCS: "ls4_lcs",
  score5USS: "ls5_uss",
  score6DC: "ls6_dc",
  pisScore: "pis_score",
};

const Prediction = () => {
  const [formData, setFormData] = useState({
    user_id: 1,
    pis_score: 0,
    ls1_total_english: 0,
    ls1_total_filipino: 0,
    ls2_slct: 0,
    ls3_mpss: 0,
    ls4_lcs: 0,
    ls5_uss: 0,
    ls6_dc: 0,
  });

  const [inputScores, setInputScores] = useState({
    score1English: "",
    score1Filipino: "",
    score2SLCT: "",
    score3MPSS: "",
    score4LCS: "",
    score5USS: "",
    score6DC: "",
    pisScore: "",
  });

  const [fltScore, setFltScore] = useState(0);
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [close, setClose] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    const limit = scoreLimits[id];

    if (/^\d*$/.test(value)) {
      const numericValue = value === "" ? "" : parseInt(value);
      if (numericValue === "" || numericValue <= limit) {
        setInputScores((prev) => ({ ...prev, [id]: value }));
        setFormData((prev) => ({
          ...prev,
          [keyMap[id]]: numericValue || 0,
        }));
        setPredictionResult(null);
        setClose(false);
      }
    }
  };

  const calculateFltScore = () => {
    const flt = Object.values(formData).reduce((acc, val) => {
      if (typeof val === "number" && !isNaN(val)) {
        return acc + val;
      }
      return acc;
    }, 0);
    setFltScore(flt);
    return flt;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const flt = calculateFltScore(); // Ensure FLT score is calculated
    setLoading(true);
  
    try {
      const saveResponse = await fetch("http://localhost:3000/save-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          flt_score: flt, // Sending flt_score
        }),
      });
  
      if (!saveResponse.ok) {
        throw new Error("Failed to save prediction data.");
      }
  
      // Proceed with prediction request to Flask
      const predictionResponse = await fetch("http://localhost:5000/api/prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          flt_score: flt, // Sending flt_score
        }),
      });
  
      const prediction = await predictionResponse.json();
      setPredictionResult(prediction);
    } catch (error) {
      console.error("Prediction Error:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <>
    <Header handleShow={() => setShowSidebar(!showSidebar)} />
    <div className="flex ">
      {showSidebar && (
        <div className="w-64 fixed h-full z-20">
          <Sidebar />
        </div>
      )}
    
        <div className="m-10 p-4 w-full">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Accreditation & Equivalency Performance Prediction
          </h1>
          <p className="mb-4 text-slate-800">Enter your details and scores</p>

          <div className="w-full bg-white p-8 rounded-xl shadow-2xl">
            {/* Prediction Result Display */}
            <div className="flex justify-center">
              {!close && predictionResult && (
                <div className="relative flex flex-col items-center text-center p-4 space-y-4 bg-slate-200 rounded-lg w-64">
                  <img
                    src={predictionResult.ready ? card.Good.image : card.Bad.image}
                    alt="Result"
                    className="size-20"
                  />
                  <p className="text-2xl font-bold">
                    {predictionResult.ready ? "Good" : "Needs Improvement"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {predictionResult.ready ? card.Good.message : card.Bad.message}
                  </p>
                  <button className="text-xs bg-teal-600/80 px-4 py-2 rounded-2xl font-bold text-white">
                    {predictionResult.ready ? card.Good.button : card.Bad.button}
                  </button>
                  {predictionResult.weakStrands && !predictionResult.ready && (
                    <div className="text-xs mt-2 text-gray-600">
                      <p className="font-semibold mb-1">Recommended Modules:</p>
                      <ul className="list-disc list-inside text-left">
                        {Object.entries(predictionResult.weakStrands).map(([strand, link]) => (
                          <li key={strand}>
                            {strand}:{" "}
                            <a href={link} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                              View
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <CloseIcon className="absolute top-1 right-1 cursor-pointer" onClick={() => setClose(true)} />
                </div>
              )}
            </div>

            {/* Score Inputs */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {Object.entries(scoreLimits).map(([id, max], index) => (
                <div key={index}>
                  <label htmlFor={id} className="block font-semibold mb-1">
                    {id
                      .replace("score", "LS ")
                      .replace("1English", "1 - Communication (ENGLISH)")
                      .replace("1Filipino", "1 - Communication (FILIPINO)")
                      .replace("2SLCT", "2 - Scientific Literacy and Critical Thinking")
                      .replace("3MPSS", "3 - Mathematics and Problem-Solving")
                      .replace("4LCS", "4 - Life and Career Skills")
                      .replace("5USS", "5 - Understanding Self and Society")
                      .replace("6DC", "6 - Digital Citizenship")
                      .replace("pisScore", "PIS Score")}
                  </label>
                  <input
                    type="number"
                    id={id}
                    value={inputScores[id]}
                    onChange={handleChange}
                    min="0"
                    max={max}
                    className="w-full rounded border px-2 py-1 border-slate-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max allowed: {max}</p>
                </div>
              ))}
              {/* Submit and FLT Score */}
              <div className="md:col-span-2 flex flex-col items-center mt-6 space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition hover:scale-105 disabled:opacity-50"
                >
                  {loading ? "Predicting..." : "Submit Scores"}
                </button>
                <p className="text-md font-medium text-slate-600">
                  Total FLT Score: <span className="font-bold">{fltScore}</span>
                </p>
              </div>
            </form>
          </div>
          </div>
          </div>
  </>
  );
};

export default Prediction;
