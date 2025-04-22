import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bg from "./assets/images/signup-bg.png";
import logo from "./assets/images/ALS-Logo.png";
import toast, { Toaster } from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Email regex pattern to validate emails
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleLogin = async () => {
    // Validate fields
    if (!email || !password) {
      toast.error("All fields are required.");
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Invalid email address.");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Logging in...");

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        const { user, role } = data;

        // Save user data to localStorage
        localStorage.setItem("user_id", user.id);
        localStorage.setItem("user_email", user.email);
        localStorage.setItem("user_firstname", user.firstName);
        localStorage.setItem("user_lastname", user.lastName);
        localStorage.setItem("role", role);

        toast.success("Login successful!");

        // Redirect based on the role
        if (role === "teacher") {
          navigate("/teacher-dashboard");
        } else if (role === "student") {
          navigate("/student-dashboard");
        } else if (role === "admin") {
          navigate("/admin-dashboard");
        }
      } else {
        toast.error(data.message || "Login failed.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
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

      <Toaster /> {/* Add this to display the toasts */}
    </div>
  );
}

export default Login;
