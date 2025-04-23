import React, { useState, useEffect } from "react";
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';

export default function AddStudentModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
}) {
  const defaultForm = {
    first_name: "",
    middle_name: "",
    last_name: "",
    extension_name: "",
    date_of_birth: "",
    sex: "",
    marital_status: "",
    occupation: "",
    monthly_salary: "",
    mother_name: "",
    mother_occupation: "",
    father_name: "",
    father_occupation: "",
    household_salary: "",
    housing: "",
    living_arrangement: "",
    school: "",
    grade_level: "",
    email: "",
    psi_level: "",
    lrn: "",
    address: "",
  };

  const [formData, setFormData] = useState(defaultForm);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...defaultForm,
        ...Object.fromEntries(
          Object.entries(initialData).map(([key, value]) => [
            key,
            value === null ? "" : value,
          ])
        ),
        date_of_birth: initialData.date_of_birth?.split("T")[0] || "",
        psi_level: initialData.psi_level?.toString() || "",
        monthly_salary: initialData.monthly_salary?.toString() || "",
        household_salary: initialData.household_salary?.toString() || "",
      });
    } else {
      setFormData(defaultForm);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateRandomNumbers = (length) => {
    return Math.random().toString().slice(2, 2 + length);
  };

  const generateAlsEmail = (lastName) => {
    const formattedLastName = lastName.toLowerCase().replace(/\s+/g, '.');
    const randomNumbers = generateRandomNumbers(4);
    return `${formattedLastName}${randomNumbers}@als.edu.ph`;
  };

  const generatePassword = (lastName) => {
    const formattedLastName = lastName.toLowerCase().replace(/\s+/g, '');
    const randomNumbers = generateRandomNumbers(6);
    return `${formattedLastName}als${randomNumbers}`;
  };

  const handleSubmit = () => {
    const errors = {};
    const als_email = generateAlsEmail(formData.last_name); // Use the new function with last name
    const password = generatePassword(formData.last_name); // Use the new function with last name
    const hashed_password_display = "*****";

    // Required fields
    const requiredFields = [
      "first_name",
      "last_name",
      "date_of_birth",
      "sex",
      "marital_status",
      "school",
      "grade_level",
      "email",
      "psi_level",
      "lrn",
      "housing",
      "living_arrangement",
    ];

    requiredFields.forEach((field) => {
      if (
        !formData[field] ||
        (typeof formData[field] === "string" && formData[field].trim() === "")
      ) {
        errors[field] = "This field is required.";
      }
    });

    // Birth date validation
    const today = new Date();
    const birthDate = new Date(formData.date_of_birth);
    if (formData.date_of_birth && birthDate >= today) {
      errors.date_of_birth = "Invalid Birth date.";
    }

    // PSI validation
    const psi = parseInt(formData.psi_level, 10);
    if (isNaN(psi) || psi < 1 || psi > 10) {
      errors.psi_level = "Must be a number between 1 and 10.";
    }

    // Email format validation (for the student's personal email)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "Enter a valid email address.";
    }

    // LRN validation
    if (!/^\d{12}$/.test(formData.lrn)) {
      errors.lrn = "LRN must be exactly 12 digits.";
    }

    // Salary fields numeric check
    ["monthly_salary", "household_salary"].forEach((field) => {
      if (formData[field] && isNaN(formData[field])) {
        errors[field] = "Must be a number.";
      }
    });

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) return;

    const loggedInTeacherId = localStorage.getItem("user_id");

    const studentData = initialData
      ? {
          ...formData,
          student_id: initialData.student_id,
          als_email,
          password,
          teacher_id: loggedInTeacherId,
        }
      : { ...formData, als_email, password, teacher_id: loggedInTeacherId };
    studentData.monthly_salary = formData.monthly_salary ? parseFloat(formData.monthly_salary) : null;
    studentData.household_salary = formData.household_salary ? parseFloat(formData.household_salary) : null;

    onSave(studentData);

    const fullName = `${formData.first_name} ${formData.last_name}`;
    const successMessage = initialData ? `${fullName} updated successfully!` : `${fullName} added successfully!`;

    toast.success(successMessage, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

    // Send email only if adding new student
    if (!initialData) {
      toast.info(
        <div>
          <p>Account Created for: <strong>{fullName}</strong></p>
          <p>E-ALS Email: <strong>{als_email}</strong></p>
          <p>Password: <strong>{hashed_password_display}</strong> (sent via email)</p>
          <small>Please inform the student that the initial password has been sent to their provided email address.</small>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          style: { whiteSpace: 'pre-line' }
        }
      );

      emailjs.send(
        'service_ibtbbmm',
        'template_xw398r6',
        {
          to_name: fullName,
          to_email: formData.email,
          email: als_email,
          password,
        },
        '9weiJR5xudRSUEcIN'
      ).then(() => {
        console.log('Email sent successfully');
        toast.success('Email sent to student!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }).catch((err) => {
        console.error('Failed to send email:', err);
        toast.error('Failed to send email to student.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      });
    }

    setValidationErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const renderInput = (
    label,
    name,
    type = "text",
    isRequired = false,
    pattern = null
  ) => (
    <div className="flex flex-col">
      <input
        type={type}
        name={name}
        placeholder={label + (isRequired ? "*" : "")}
        value={formData[name]}
        onChange={handleChange}
        className="border p-2 rounded"
        pattern={pattern}
        required={isRequired}
      />
      {validationErrors[name] && (
        <span className="text-red-600 text-sm mt-1">
          {validationErrors[name]}
        </span>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-5xl rounded-lg p-8 shadow-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-semibold mb-6">
          {initialData ? "Update Student" : "Add New Student"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {renderInput("First Name", "first_name", "text", true)}
          {renderInput("Middle Name", "middle_name")}
          {renderInput("Last Name", "last_name", "text", true)}
          {renderInput("Extension Name", "extension_name")}
          {renderInput("Date of Birth", "date_of_birth", "date", true)}
          <div>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="border p-2 rounded"
            >
              <option value="">Select Gender*</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {validationErrors.sex && (
              <span className="text-red-600 text-sm">
                {validationErrors.sex}
              </span>
            )}
          </div>
          <div>
            <select
              name="marital_status"
              value={formData.marital_status}
              onChange={handleChange}
              className="border p-2 rounded"
            >
              <option value="">Marital Status*</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Single Parent">Single Parent</option>
            </select>
            {validationErrors.marital_status && (
              <span className="text-red-600 text-sm">
                {validationErrors.marital_status}
              </span>
            )}
          </div>
          {renderInput("Occupation", "occupation")}
          {renderInput("Monthly Salary", "monthly_salary", "number")}
          {renderInput("Mother's Name", "mother_name")}
          {renderInput("Mother's Occupation", "mother_occupation")}
          {renderInput("Father's Name", "father_name")}
          {renderInput("Father's Occupation", "father_occupation")}
          {renderInput("Household Salary", "household_salary", "number")}
          {renderInput("Housing", "housing", "text", true)}
          {renderInput(
            "Living Arrangement",
            "living_arrangement",
            "text",
            true
          )}
          {renderInput("School", "school", "text", true)}
          {renderInput("Grade Level", "grade_level", "text", true)}
          {renderInput("Email", "email", "email", true)}
          {renderInput("PSI Level (1-10)", "psi_level", "number", true)}
          {renderInput("LRN (12 digits)", "lrn", "text", true, "\\d{12}")}
          {renderInput("Address", "address")}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {initialData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}