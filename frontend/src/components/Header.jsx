import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu';

function Header({ handleShow }) {
  const [profile, setProfile] = useState();
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userProfilePic, setUserProfilePic] = useState("");
  const [userRoleName, setUserRoleName] = useState("");

  const studentId = localStorage.getItem("user_id"); // ✅ Correct localStorage reference

  const deleteUserId = () => {
    localStorage.removeItem("user_firstname");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_lastname");
    localStorage.removeItem("user_email");
    localStorage.removeItem("role");
  };

  useEffect(() => {
    if (studentId) {
      fetch(`http://localhost:3000/student-dashboard?student_id=${studentId}`) // ✅ Include student_id in query
        .then((res) => res.json())
        .then((data) => {
          if (data.first_name && data.last_name && data.role_name) {
            setUserFirstName(data.first_name);
            setUserLastName(data.last_name);
            setUserProfilePic(data.profile_pic);
            setUserRoleName(data.role_name);
            setProfile(data);
          } else {
            console.error("Profile data is incomplete");
          }
        })
        .catch((err) => console.error("Failed to fetch user data 😿", err));
    }
  }, [studentId]);

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="navbar p-5 bg-slate-200 shadow-sm flex justify-between">
      <MenuIcon onClick={handleShow} />
      <div className="flex gap-2 items-center">
       
        <div className="font-medium text-end w-34">
          <div className="text-xs text-gray-600">
            {`${capitalizeFirstLetter(userFirstName)} ${capitalizeFirstLetter(userLastName)}`}
          </div>
          <div className="text-xs text-gray-600">{capitalizeFirstLetter(userRoleName)}</div>
        </div>
        <div className="dropdown dropdown-end flex gap-2">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="size-10 rounded-full">
              <img
                alt="User Profile"
                src={userProfilePic || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
              />
            </div>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-10 w-52 p-2 shadow">
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <a>Settings</a>
            </li>
            <li>
              <Link onClick={deleteUserId} to="/">Logout</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Header;
