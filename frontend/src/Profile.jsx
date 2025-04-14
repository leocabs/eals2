import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { FiEdit2, FiX, FiSave } from "react-icons/fi";
import UserIcon from "./assets/images/icon-maleUser.png";
import data from "./data.js";

const Profile = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(data);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSave = () => {
    alert("Profile updated successfully!");
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditMode(false);
    // Optionally, reset the profile data if needed
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {showSidebar && <div className="w-64 fixed h-full z-20"><Sidebar /></div>}

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
                className={`absolute inset-0 bg-black bg-opacity-40 opacity-0  flex items-center justify-center rounded-full transition ${editMode ? "opacity-100" : ""}`}
              >
                <span className="text-white text-xs">{editMode ? "Update" : "Edit"}</span>
              </div>
            </label>

            {/* Info */}
            <dl className="flex-1 divide-y divide-gray-200 text-sm w-full">
              <div className="grid grid-cols-3 gap-4 py-3">
                <dt className="font-medium text-gray-900">First Name</dt>
                <dd className="text-gray-700 col-span-2">{form.firstName}</dd>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3">
                <dt className="font-medium text-gray-900">Last Name</dt>
                <dd className="text-gray-700 col-span-2">{form.lastName}</dd>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3">
                <dt className="font-medium text-gray-900">Email</dt>
                <dd className="text-gray-700 col-span-2">{form.email}</dd>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3">
                <dt className="font-medium text-gray-900">Phone</dt>
                <dd className="col-span-2">
                  {editMode ? (
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full border p-1 rounded"
                    />
                  ) : (
                    <span className="text-gray-700">{form.phone}</span>
                  )}
                </dd>
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
