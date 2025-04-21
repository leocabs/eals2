// apiService.js  
import axios from "axios";

export const predictExamReadiness = async (scores) => {
  try {
    const response = await axios.post("http://localhost:5000/api/prediction", scores);
    return response.data;
  } catch (error) {
    console.error("Prediction API error:", error);
    throw error;
  }
};


export const getRecommendations = async (scores) => {
  try {
    const response = await axios.post("http://localhost:5000/api/recommendations", scores);
    return response.data;
  } catch (error) {
    console.error("Recommendations API error:", error);
    throw error;
  }
};
