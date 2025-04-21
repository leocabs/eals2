import { Menu, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function TeacherHeader() {
  const [userFirstName, setUserFirstName] = useState(localStorage.getItem("user_firstname") || "");
  const [userLastName, setUserLastName] = useState(localStorage.getItem("user_lastname") || "");
  const [userRoleName, setUserRoleName] = useState(localStorage.getItem("role") || "");
  const [userProfilePic, setUserProfilePic] = useState("");


  const teacherId = localStorage.getItem("user_id");

  const deleteUserId = () => {
    localStorage.removeItem("user_firstname");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_lastname");
    localStorage.removeItem("user_email");
    localStorage.removeItem("role");
  };

  useEffect(() => {
    if (teacherId) {
      fetch(`http://localhost:3000/teacher-dashboard?teacher_id=${teacherId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.profile_pic) {
            setUserProfilePic(data.profile_pic);
            setProfile(data);
          }
        })
        .catch((err) => console.error("Failed to fetch profile pic", err));
    }
  }, [teacherId]);

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <header className="bg-[#E3D0B4] flex justify-between items-center px-4 py-3 shadow-md">
      <div className="flex items-center gap-4">
        
      </div>

      <div className="flex items-center gap-4">
        <button className="relative">
          <Bell size={22} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="dropdown dropdown-end flex items-center gap-2">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="size-10 rounded-full">
              {userProfilePic ? (
                <img alt="User Profile" src={userProfilePic} />
              ) : (
                <img
                  alt="Default User"
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                />
              )}
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">
              {`${capitalizeFirstLetter(userFirstName)} ${capitalizeFirstLetter(userLastName)}`}
            </p>
            <p className="text-xs text-gray-600">
              {capitalizeFirstLetter(userRoleName)}
            </p>
          </div>

          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-29 w-52 p-2 shadow"
          >
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <a>Settings</a>
            </li>
            <li>
              <Link onClick={deleteUserId} to="/">
                Logout
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}

export default TeacherHeader;
