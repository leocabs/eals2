import { useState } from "react";
import { FaUserCog, FaSchool } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.png";

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <MdDashboard />,
    path: "/student-dashboard",
  },
  {
    id: "predict",
    label: "Predict Performance",
    icon: <FaUserCog />,
    path: "/prediction",
  },
  {
    id: "recommendation",
    label: "Recommended Materials",
    icon: <FaSchool />,
    path: "/learning-materials",
  },
  {
    id: "mock",
    label: "A&E Mock Assessment",
    icon: <FaSchool />,
    path: "/mock-test",
  },
];

export default function StudentSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");
  const navigate = useNavigate();

  const handleNavigation = (id, path) => {
    setActivePage(id);
    navigate(path);
  };

  return (
    <div className={`flex h-screen transition-all duration-300 ease-in-out ${isOpen ? "w-64" : "w-20"}`}>
      <div className="bg-[#E3D0B4] text-black flex flex-col w-full p-4 shadow-lg">
        {/* Logo & Collapse Button */}
        <div className="flex flex-col items-end mb-8">
          <div className="w-full flex items-center justify-center mb-4">
            <img src={logo} alt="Logo" className={`transition-all duration-300 ${isOpen ? "w-24" : "w-10"}`} />
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="bg-[#E3D0B4] p-2">
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleNavigation(item.id, item.path)}
                className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-all ${
                  isActive ? "bg-[#187529] text-white" : "hover:text-white"
                }`}
              >
                <div className="text-xl">{item.icon}</div>
                {isOpen && <span className="text-sm font-medium">{item.label}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
