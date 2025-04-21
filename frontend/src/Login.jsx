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
      alert("Please enter a valid email address.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      
      console.log("Login response:", data); // ✅ Debug output
  
      if (data.success && data.user) {
        // ✅ Destructure safely inside if-block
        const userId = data.user.id;
        const userFirstName = data.user.firstName;
        const userLastName = data.user.lastName;
        const userEmail = data.user.email;
        const userRole = data.role;
  
        // ✅ Save to localStorage
        localStorage.setItem("user_id", userId);
        localStorage.setItem("user_email", userEmail);
        localStorage.setItem("user_firstname", userFirstName);
        localStorage.setItem("user_lastname", userLastName);
        localStorage.setItem("role", userRole);
  
        // ✅ Navigate by role
        if (userRole === "teacher") {
          navigate("/teacher-dashboard");
        } else if (userRole === "student") {
          navigate("/student-dashboard");
        } else if (userRole === "admin") {
          navigate("/admin-dashboard");
        }
      } else {
        alert(data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred. Please try again.");
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
