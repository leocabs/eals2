import React, { useState } from "react";
import bg from "./assets/images/signup-bg.png";
import logo from "./assets/images/ALS-Logo.png";
import { Link } from "react-router-dom";

function ResetPass() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleReset = () => {
    if (!email.includes("@")) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
      // Logic to send reset email goes here
      console.log("Reset link sent to:", email);
      alert("Reset link sent! Please check your email.");
    }
  };

  return (
    <div className="flex">
      <div className="w-1/2 h-screen">
        <img
          src={bg}
          alt="ALS Background"
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="w-1/2">
        <div className="flex w-full justify-center">
          <img src={logo} className="w-70 pt-10" />
        </div>

        <div className="h-1/2 px-20 flex space-y-4 flex-col w-full items-center justify-center">
          <div className="text-2xl font-bold text-gray-800 text-center">
            Forgot Your Password?
          </div>
          <p className="text-gray-600 text-center">
            Enter your email and we'll send you a link to reset your password.
          </p>

          <input
            type="text"
            placeholder="Enter your e-mail address"
            className="bg-gray-200 rounded-xl p-4 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && (
            <p className="text-red-500 text-sm w-full">{emailError}</p>
          )}

          <div className="w-full flex justify-center">
            <button
              className="bg-green-400 rounded-xl w-96 py-4 font-bold text-white hover:bg-green-600"
              onClick={handleReset}
            >
              Send Reset Link
            </button>
          </div>
          <Link to="/" className="text-blue-400 cursor-pointer">
            Click here to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPass;
