import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { FiEdit2, FiX, FiSave } from "react-icons/fi";
import UserIcon from "./assets/images/icon-maleUser.png";

const Profile = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    dob: "",
    photo: null,
  });

  const studentId = localStorage.getItem("user_id");
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userDOB, setUserDOB] = useState("");
  const [userProfilePic, setUserProfilePic] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  useEffect(() => {
    if (studentId) {
      fetch(`http://localhost:3000/student-dashboard?student_id=${studentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.first_name && data.last_name) {
            const formattedDOB = new Date(data.date_of_birth).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            setUserFirstName(data.first_name);
            setUserLastName(data.last_name);
            setUserEmail(data.email);
            setUserDOB(formattedDOB);
            setUserPassword(data.password);
            setUserProfilePic(data.profile_pic);
            setForm({
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              password: data.password,
              dob: formattedDOB, // Set formatted date in the form
              photo: data.profile_pic,
            });
          } else {
            console.error("Profile data is incomplete");
          }
        })
        .catch((err) => console.error("Failed to fetch user data 😿", err));
    }
  }, [studentId]);
  

  const handleSave = () => {
    // Send updated profile data (including password) to the backend
    const updatedProfile = {
      student_id: studentId,
      password: form.password,
      profile_pic: form.photo || userProfilePic,
    };

    fetch(`http://localhost:3000/update-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProfile),
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Profile updated successfully!");
        setEditMode(false);
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        alert("Failed to update profile.");
      });
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm({
      first_name: userFirstName,
      last_name: userLastName,
      email: userEmail,
      password: userPassword,
      date_of_birth: userDOB,
      photo: userProfilePic,
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {showSidebar && (
        <div className="w-64 fixed h-full z-20">
          <Sidebar />
        </div>
      )}

      <div className={`flex-1 ${showSidebar ? "ml-64" : ""}`}>
        <Header handleShow={() => setShowSidebar(!showSidebar)} />

        <div className="max-w-4xl mx-auto mt-10 bg-white rounded-xl shadow-md p-6 relative">
          {/* Edit Icon */}
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="absolute top-4 right-4 text-gray-600 hover:text-blue-600 transition"
              title="Edit"
            >
              <FiEdit2 size={20} />
            </button>
          ) : (
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleSave}
                className="text-green-600 hover:text-green-800 transition"
                title="Save"
              >
                <FiSave size={20} />
              </button>
              <button
                onClick={handleCancel}
                className="text-red-600 hover:text-red-800 transition"
                title="Cancel"
              >
                <FiX size={20} />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Avatar */}
            <label className="relative cursor-pointer group w-24 h-24">
              {editMode && (
                <input
                  type="file"
                  name="photo"
                  onChange={handleChange}
                  className="absolute inset-0 opacity-0 w-full h-full"
                />
              )}
              <img
                src={form.photo ? URL.createObjectURL(form.photo) : UserIcon}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border"
              />
              <div
                className={`absolute inset-0 bg-black bg-opacity-40 opacity-0 flex items-center justify-center rounded-full transition ${
                  editMode ? "opacity-100" : ""
                }`}
              >
                <span className="text-white text-xs">
                  {editMode ? "Update" : "Edit"}
                </span>
              </div>
            </label>

            {/* Info */}
            <dl className="flex-1 divide-y divide-gray-200 text-sm w-full">
              <div className="grid grid-cols-3 gap-4 py-3">
                <dt className="font-medium text-gray-900">First Name</dt>
                <dd className="text-gray-700 col-span-2">{userFirstName}</dd>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3">
                <dt className="font-medium text-gray-900">Last Name</dt>
                <dd className="text-gray-700 col-span-2">{userLastName}</dd>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3">
                <dt className="font-medium text-gray-900">Email</dt>
                <dd className="text-gray-700 col-span-2">{userEmail}</dd>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3">
                <dt className="font-medium text-gray-900">Date of Birth</dt>
                <dd className="text-gray-700 col-span-2">{userDOB}</dd>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3">
                <dt className="font-medium text-gray-900">Password</dt>
                <dd className="col-span-2">
                  {editMode ? (
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full border p-1 rounded"
                    />
                  ) : (
                    <span className="text-gray-500">••••••••</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
