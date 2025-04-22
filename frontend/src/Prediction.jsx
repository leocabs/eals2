import React, { useState, useEffect } from "react";
import passed from "./assets/images/passed.png";
import failed from "./assets/images/failed.png";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const card = {
  Good: {
    image: passed,
    status: "Passed",
    message: "Congratulations! You are ready for the A&E exam.",
    button: "Go to AE Mock Test",
  },
  Bad: {
    image: failed,
    status: "Failed",
    message: "You need more preparation. Keep studying!",
    button: "View Learning Materials",
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
    user_id: 0,
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
  const [close, setClose] = useState(false);
  const [displayFltScore, setDisplayFltScore] = useState(false); // New state for displaying FLT score

  const history = useNavigate();

  useEffect(() => {
    const userId = parseInt(localStorage.getItem("user_id"));
    if (userId) {
      setFormData((prev) => ({ ...prev, user_id: userId }));
    }
  }, []);

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
    const flt = calculateFltScore();
    setLoading(true);

    const requestData = {
      ...formData,
      flt_score: flt,
    };

    try {
      // Save the prediction data
      const saveResponse = await fetch("http://localhost:3000/save-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save prediction data.");
      }

      // Get prediction result
      const predictionResponse = await fetch("http://localhost:5000/api/prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const prediction = await predictionResponse.json();

      // Set result to state (optional for display)
      setPredictionResult({
        ready: prediction.ready,
        weakStrands: prediction.weak_areas || {},
      });


    } catch (error) {
      console.error("Prediction Error:", error);
    } finally {
      setLoading(false);
      setDisplayFltScore(true); // optional display logic
    }
  };

  const handleClick = () => {
    if (predictionResult?.ready) {
      history("/mock-test");
    } else {
      // Navigate to learning materials page for failed learners
      history("/learning-materials", {
        state: {
          refresh: true,
          weakAreas: predictionResult?.weakStrands || {} // Pass the weak areas here
        }
      });
    }
  };

  return (
    <div className="px-4 md:px-10 py-6 w-full flex justify-center">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Accreditation & Equivalency Performance Prediction
        </h1>
        <p className="mb-4 text-slate-800">Enter your details and scores</p>

        <div className="w-full bg-white p-6 md:p-8 rounded-xl shadow-2xl">
    {/* Prediction Result Display */}
    <div className="flex justify-center mb-6">
          <AnimatePresence>
            {!close && predictionResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative flex flex-col items-center text-center p-4 space-y-4 bg-slate-200 rounded-lg w-full max-w-xs"
              >
                <img
                  src={predictionResult.ready ? card.Good.image : card.Bad.image}
                  alt="Result"
                  className="w-20 h-20"
                />
                <p className="text-2xl font-bold">
                  {predictionResult.ready ? "Good" : "Needs Improvement"}
                </p>
                <p className="text-sm text-gray-500">
                  {predictionResult.ready ? card.Good.message : card.Bad.message}
                </p>
                <button
                  className="text-xs bg-teal-600/80 px-4 py-2 rounded-2xl font-bold text-white"
                  onClick={handleClick}
                >
                  {predictionResult.ready ? card.Good.button : card.Bad.button}
                </button>

                <CloseIcon
                  className="absolute top-1 right-1 cursor-pointer"
                  onClick={() => setClose(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

          {/* Display FLT score after submitting */}
          {displayFltScore && (
            <div className="mt-4 mb-6 text-center">
              <h2 className="text-xl font-bold">FLT Score: {fltScore}</h2>
            </div>
          )}

          {/* Score Inputs */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {Object.entries(scoreLimits).map(([id, max], index) => (
              <div key={index}>
                <label htmlFor={id} className="block font-semibold mb-1">
                  {id
                    .replace("score", "LS ")
                    .replace("1English", "1 - Communication (ENGLISH)")
                    .replace("1Filipino", "1 - Communication (FILIPINO)")
                    .replace(
                      "2SLCT",
                      "2 - Scientific Literacy and Critical Thinking"
                    )
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
                <p className="text-xs text-gray-500 mt-1">
                  Max allowed: {max}
                </p>
              </div>
            ))}
            <div className="md:col-span-2 flex justify-center mt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white py-2 px-6 rounded-md shadow hover:bg-blue-600 transition"
              >
                {loading ? "Loading..." : "Predict Results"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default Prediction;
