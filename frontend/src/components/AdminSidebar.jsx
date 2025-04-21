import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUserGraduate, FaChalkboardTeacher, FaChartBar } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { ChevronLeft, ChevronRight } from "lucide-react";
import logo from "../assets/images/ealsLogo.png";

const navItems = [
  { label: "Dashboard", icon: <MdDashboard /> },
  { label: "Students", icon: <FaUserGraduate /> },
  { label: "Teachers", icon: <FaChalkboardTeacher /> },
];

export default function aSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  return (
    <div className={`flex h-screen transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'} sticky top-0`}>
      <div className="bg-[#E3D0B4] text-black flex flex-col w-full p-4 shadow-lg">
        {/* Logo  */}
        <div className="flex flex-col items-end mb-8">
          <div className="w-full flex items-center justify-center mb-1">
            <img src={logo} alt="Logo" className={`transition-all duration-300 ${isOpen ? 'w-24' : 'w-10'}`} />
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-[#E3D0B4] p-2 transition-all"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-6 flex-grow">
          {navItems.map((item, index) => {
            const path = `/${item.label === "Dashboard" ? "admin-dashboard" : item.label.toLowerCase()}`;
            const isActive = location.pathname === path;

            return (
              <Link
                to={path === "/" ? "/admin-dashboard" : path}
                key={index}
                className={`flex items-center space-x-4 p-3 rounded-lg transition-all cursor-pointer
                  ${isActive ? "bg-[#187529] text-white" : "hover:bg-[#187529] hover:text-white"}`}
              >
                <div className="text-xl">{item.icon}</div>
                {isOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}