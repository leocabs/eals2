import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import bg from "./assets/images/signup-bg.png";
import logo from "./assets/images/ALS-Logo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("Login successful", data);
        // Store student_id and first name in localStorage for future use
        localStorage.setItem("user_id", data.user.student_id);  // Store the student_id
        localStorage.setItem("user_firstname", data.user.firstName);  // Store first name
        localStorage.setItem("user_lastname", data.user.lastName); // Optionally store last name

        // Redirect to dashboard or homepage
        navigate('/student-dashboard');
      } else {
        alert(data.message);  // Show error message from backend
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="flex">
      <div className="w-1/2 h-screen">
        <img src={bg} alt="ALS Background" className="w-full h-full object-cover object-center" />
      </div>

      <div className="w-1/2">
        <div className="flex flex-col space-y-6">
          <div className="flex w-full justify-center">
            <img src={logo} alt="ALS Logo" className="w-70 pt-10" />
          </div>
          <div className="text-2xl font-bold text-gray-800 text-center">Welcome ALS Learner!</div>
        </div>

        <div className="h-1/2 px-20 flex flex-col space-y-4 w-full items-center justify-center">
          <input
            type="text"
            placeholder="Enter your e-mail address"
            className="bg-gray-200 rounded-xl p-4 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && <p className="text-red-500 text-sm w-full">{emailError}</p>}

          <input
            type="password"
            placeholder="Enter your password"
            className="bg-gray-200 rounded-xl p-4 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="w-full flex justify-end">
            <Link to="/forgot-password" className="text-blue-400 cursor-pointer">Forgot password?</Link>
          </div>

          {loginError && <p className="text-red-500 text-sm w-full">{loginError}</p>}

          <div className="w-full flex justify-center">
            <button
              className="bg-green-400 rounded-xl w-96 py-4 font-bold text-white hover:bg-green-600"
              onClick={handleLogin}
              disabled={isLoading} // Disable button while loading
            >
              {isLoading ? "Logging in..." : "LOG IN"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
