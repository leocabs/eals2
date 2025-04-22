import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/ealsLogo.png";

function Sidebar() {
  return (
    <>
    <div className="w-max">

    <div className="w-64 h-screen bg-[#E3D0B4]  text-white p-4 space-y-4">
      <div className="flex justify-center mb-5">
        <img src={logo} alt="EALS logo" className="w-48" />
      </div>

      <ul className="space-y-2">
        <li>
          <Link
            to="/student-dashboard"
            className="block font-medium hover:bg-green-700 p-2 rounded"
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/prediction" className="block font-medium hover:bg-green-700 p-2 rounded">
            Predict Performance
          </Link>
        </li>
        <li>
          <Link to="/learning-materials" className="block font-medium hover:bg-green-700 p-2 rounded">
            Recommended Materials
          </Link>
        </li>
        <li>
          <Link to="/mock-test" className="block font-medium hover:bg-green-700 p-2 rounded">
            A&E Mock-Up Test
          </Link>
        </li>
      

      </ul>
    </div>
    </div>
    
    </>
  );
}

export default Sidebar;
