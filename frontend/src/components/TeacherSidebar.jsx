import { useState } from "react";
import { FaUserCog, FaSchool, FaBookOpen } from "react-icons/fa";
import { MdDashboard, MdMenuBook } from "react-icons/md";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import logo from "../images/logo.png";

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <MdDashboard />, path: "/teacher-dashboard" },
    { id: "students", label: "Student Management", icon: <FaUserCog />, path: "/teacher-student-management" },
    { id: "teachers", label: "Class Management", icon: <FaSchool />, path: "/teacher-class-management" },
  ];


export default function StudentSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (id, path) => {
    setActivePage(id);
    navigate(path); // Navigate to the specified path
  };

  const handleSubItemClick = (id, path) => {
    setActivePage(id);
    navigate(path);
    setShowDropdown(true);
  };

  return (
    <div className={`flex h-screen transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="bg-[#E3D0B4] text-black flex flex-col w-full p-4 shadow-lg">
        {/* Logo and Toggle Button */}
        <div className="flex flex-col items-end mb-8">
          <div className="w-full flex items-center justify-center mb-4">
            <img src={logo} alt="Logo" className={`transition-all duration-300 ${isOpen ? 'w-24' : 'w-10'}`} />
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-[#E3D0B4] p-2 transition-all"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <div
                key={item.id}
                className={`flex items-center space-x-4 p-3 rounded-lg transition-all cursor-pointer ${
                  isActive ? "bg-[#187529] text-white" : "hover:border-black hover:text-white"
                }`}
                onClick={() => handleNavigation(item.id, item.path)}
              >
                <div className="text-xl">{item.icon}</div>
                {isOpen && <span className="text-sm font-medium">{item.label}</span>}
              </div>
            );
          })}

          {/* Learning Management Dropdown */}
          <div className="flex flex-col">
            <div
              onClick={() => setShowDropdown((prev) => !prev)}
              className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${
                activePage.includes("learning") ? "bg-[#187529] text-white" : "hover:border-black hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-xl"><FaBookOpen /></div>
                {isOpen && <span className="text-sm font-medium">Learning Materials</span>}
              </div>
              {isOpen && (showDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
            </div>

            {showDropdown && (
              <div className={`ml-8 mt-2 space-y-1 ${!isOpen && "hidden"}`}>
                <div
                  onClick={() => handleSubItemClick("learning_reading", "/reading-materials")}
                  className={`cursor-pointer text-sm p-2 rounded hover:bg-green-400 ${
                    activePage === "learning_reading" ? "font-bold text-green-800" : ""
                  }`}
                >
                  Reading Materials
                </div>
                <div
                  onClick={() => handleSubItemClick("learning_mock", "/aemock-test")}
                  className={`cursor-pointer text-sm p-2 rounded hover:bg-green-400 ${
                    activePage === "learning_mock" ? "font-bold text-green-800" : ""
                  }`}
                >
                  A&E Mock Up Test
                </div>
                <div
                  onClick={() => handleSubItemClick("progress_report", "/progress-report")}
                  className={`cursor-pointer text-sm p-2 rounded hover:bg-green-400 ${
                    activePage === "learning_practice" ? "font-bold text-green-800" : ""
                  }`}
                >
                  Progress Report
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

  );
}