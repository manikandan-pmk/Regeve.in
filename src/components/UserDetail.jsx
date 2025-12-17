import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import {
  FaShareAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaHome,
  FaUser,
  FaUtensils,
  FaUsers,
  FaChild,
  FaBuilding,
  FaWhatsapp,
  FaUserPlus,
  FaEdit,
  FaSave,
  FaTimes,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

// --- Reusable Stat/Action Card Component ---
const StatCard = ({
  icon: Icon,
  label,
  value,
  iconBgColor = "bg-indigo-50",
  iconColor = "text-indigo-600",
  className = "",
}) => (
  <div
    className={`p-4 rounded-xl transition duration-300 bg-white hover:bg-indigo-50/50 flex flex-col items-center text-center border border-gray-100 ${className}`}
  >
    <div
      className={`w-10 h-10 flex items-center justify-center rounded-lg ${iconBgColor} flex-shrink-0 mb-2`}
    >
      <Icon className={`text-xl ${iconColor}`} />
    </div>
    <div className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">
      {label}
    </div>
    <div className="text-xl font-bold text-gray-800">{value || "0"}</div>
  </div>
);

// --- Count Input Card Component ---
const CountInputCard = ({
  icon: Icon,
  label,
  value,
  isEditing,
  onFieldChange,
  iconColor,
  iconBgColor,
  min,
  max,
  error = false,
  className = "",
}) => (
  <div
    className={`p-4 rounded-xl transition duration-300 bg-white border ${
      error ? "border-red-300 bg-red-50" : "border-gray-100 hover:bg-gray-50"
    } flex flex-col items-center text-center ${className}`}
  >
    <div
      className={`w-10 h-10 flex items-center justify-center rounded-lg ${iconBgColor} flex-shrink-0 mb-2`}
    >
      <Icon className={`text-xl ${iconColor}`} />
    </div>
    <div className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">
      {label}
    </div>
    {isEditing ? (
      <div className="w-full">
        <input
          type="number"
          value={value || 0}
          onChange={(e) => onFieldChange(e.target.value)}
          className={`w-full text-xl font-bold px-2 py-1 border rounded text-center ${
            error
              ? "border-red-500 text-red-700"
              : "border-gray-300 text-gray-800"
          }`}
          min={min}
          max={max}
        />
        {error && (
          <p className="text-xs text-red-600 mt-1">Exceeds total count</p>
        )}
      </div>
    ) : (
      <div
        className={`text-xl font-bold ${
          error ? "text-red-600" : "text-gray-800"
        }`}
      >
        {value || 0}
      </div>
    )}
  </div>
);

// --- Enhanced Contact Detail Item ---
const ContactDetailItem = ({
  icon: Icon,
  label,
  value,
  onClick,
  buttonText,
  iconColor = "text-indigo-600",
  isEditing = false,
  fieldName = "",
  onFieldChange = () => {},
  type = "text",
  placeholder = "",
  validation = null,
  actionDisabled = false,
}) => {
  const [validationError, setValidationError] = useState("");

  const handleChange = (newValue) => {
    if (validation) {
      const result = validation(newValue);
      setValidationError(result.isValid ? "" : result.message);
    }
    onFieldChange(fieldName, newValue);
  };

  return (
    <div className="flex items-start py-4 border-b border-gray-100 last:border-b-0">
      <Icon className={`text-xl mt-1 mr-4 flex-shrink-0 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">
          {label}
        </div>
        {isEditing ? (
          <div>
            <input
              type={type}
              value={value || ""}
              onChange={(e) => handleChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 ${
                validationError ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={placeholder}
            />
            {validationError && (
              <p className="text-xs text-red-600 mt-1">{validationError}</p>
            )}
          </div>
        ) : (
          <div className="font-semibold text-gray-700 break-words">
            {value || "N/A"}
          </div>
        )}
      </div>
      {!isEditing && onClick && buttonText && value && !actionDisabled && (
        <button
          onClick={onClick}
          className="ml-4 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-medium text-sm hover:bg-indigo-100 transition-colors flex-shrink-0 shadow-sm hover:shadow-md"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

// --- Enhanced Editable Field Component ---
const EditableField = ({
  label,
  value,
  fieldName,
  isEditing,
  onFieldChange,
  type = "text",
  placeholder = "",
  min,
  max,
  validation = null,
  options = null,
}) => {
  const [validationError, setValidationError] = useState("");

  const handleChange = (newValue) => {
    if (validation) {
      const result = validation(newValue);
      setValidationError(result.isValid ? "" : result.message);
    }
    onFieldChange(fieldName, newValue);
  };

  if (options && isEditing) {
    return (
      <div className="py-3 border-b border-gray-100 last:border-b-0">
        <label className="text-sm font-medium text-gray-500 block mb-2">
          {label}
        </label>
        <select
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {validationError && (
          <p className="text-xs text-red-600 mt-1">{validationError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
      <label className="text-sm font-medium text-gray-500 block mb-2">
        {label}
      </label>
      {isEditing ? (
        <div>
          <input
            type={type}
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 ${
              validationError ? "border-red-500" : "border-gray-300"
            }`}
            placeholder={placeholder}
            min={min}
            max={max}
          />
          {validationError && (
            <p className="text-xs text-red-600 mt-1">{validationError}</p>
          )}
        </div>
      ) : (
        <span className="font-semibold text-gray-800 block">
          {value || "N/A"}
        </span>
      )}
    </div>
  );
};

const UserDetail = () => {
  const { Member_ID } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMember, setEditedMember] = useState(null);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  //photo
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoError, setPhotoError] = useState("");

  //edit option
  const isEditAllowed = localStorage.getItem("edit") === "true";

  // 🔔 Send scan event when user opens via QR code
  useEffect(() => {
    if (!Member_ID) return;

    axios
      .post("https://api.regeve.in/api/event", { Member_ID })
      .then(() => console.log("Scan event sent to backend"))
      .catch((err) => console.error("Scan event error:", err));
  }, [Member_ID]);

  // Data Fetching
  // Data Fetching
  useEffect(() => {
    const loadMember = async () => {
      try {
        const response = await axios.get(
          `https://api.regeve.in/api/event/${Member_ID}`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            withCredentials: false,
          }
        );
        const memberData = response.data?.data;
        setMember(memberData);
        setEditedMember(memberData);
      } catch (err) {
        console.error("Error fetching member data:", err);
        // Fallback or error handling
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, [Member_ID]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `https://api.regeve.in/api/event/${Member_ID}`
        );
        setMember(res.data?.data);
        setEditedMember(res.data?.data);
      } catch (err) {
        console.error("Auto-refresh error:", err);
      }
    }, 60000); // 🔥 refresh every 2 seconds

    return () => clearInterval(interval); // cleanup
  }, [Member_ID]);

  // Helper Functions
  // Helper Functions
  const getFieldValue = (fieldName) => {
    return isEditing ? editedMember?.[fieldName] : member?.[fieldName];
  };

  // FIXED: Total guests calculation
  const getTotalGuests = () => {
    const adults = parseInt(getFieldValue("Adult_Count") || 0);
    const children = parseInt(getFieldValue("Children_Count") || 0);
    const self = parseInt(getFieldValue("Self") || 1);
    return adults + children + self; // ✅ This is correct
  };

  // ADD THIS MISSING FUNCTION
  const getTotalMeals = () => {
    const veg = parseInt(getFieldValue("Veg_Count") || 0);
    const nonVeg = parseInt(getFieldValue("Non_Veg_Count") || 0);
    return veg + nonVeg;
  };

  // FIXED: Use getTotalGuests() instead of getPartySize()
  const hasMealCountErrors = () => {
    const totalGuests = getTotalGuests(); // ✅ Use the actual total
    const totalMeals = getTotalMeals();
    return totalMeals > totalGuests;
  };

  const getMealValidationStatus = () => {
    const totalGuests = getTotalGuests(); // ✅ Use the actual total
    const totalMeals = getTotalMeals();

    if (totalMeals > totalGuests) return "error";
    if (totalMeals === totalGuests) return "success";
    return "warning";
  };

  // Validation Functions
  const validatePhoneNumber = (value) => {
    if (!value) return { isValid: true };
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return {
      isValid: phoneRegex.test(value.replace(/[\s\-\(\)]/g, "")),
      message: "Please enter a valid phone number",
    };
  };

  const validateEmail = (value) => {
    if (!value) return { isValid: true };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: emailRegex.test(value),
      message: "Please enter a valid email address",
    };
  };

  const validateAge = (value) => {
    if (!value) return { isValid: true };
    const age = parseInt(value);
    return {
      isValid: age >= 0 && age <= 120,
      message: "Age must be between 0 and 120",
    };
  };

  const validateCompanyId = (value) => {
    if (!value) return { isValid: true };
    return {
      isValid: value.length >= 2 && value.length <= 20,
      message: "Company ID must be between 2-20 characters",
    };
  };

  // Handler Functions
  const handleShare = () => {
    if (!member) return;
    const profileURL = window.location.href;
    const shareMessage = `View Member Profile for ${member.Name} (ID: ${Member_ID}).\n\nProfile Link:\n${profileURL}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      shareMessage
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, "_self");
    }
  };

  const handleWhatsApp = (whatsappNumber) => {
    if (whatsappNumber) {
      const formattedNumber = whatsappNumber.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${formattedNumber}`, "_blank");
    }
  };

  const handleEmail = (email) => {
    if (email) {
      window.open(`mailto:${email}`, "_blank");
    }
  };

  // Edit Functions
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to original data
      setEditedMember(member);
      setValidationErrors({});
    }
    setIsEditing(!isEditing);
  };

  const handlePhotoClick = () => {
    if (isEditing) {
      setShowPhotoModal(true);
      setPhotoError("");
      setSelectedFile(null);
      setPhotoPreview("");
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select a valid image file (JPEG, PNG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("File must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setPhotoError("");

    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) {
      setPhotoError("Please select a file first");
      return;
    }

    setUploadingPhoto(true);
    setPhotoError("");

    try {
      const fileExtension = selectedFile.name.split(".").pop();
      const customFileName = `${Member_ID}_${member.Name}.${fileExtension}`;

      const customFile = new File([selectedFile], customFileName, {
        type: selectedFile.type,
      });

      const formData = new FormData();
      formData.append("files", customFile);

      const uploadResponse = await axios.post(
        "https://api.regeve.in/api/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (uploadResponse.data && uploadResponse.data[0]) {
        const uploadedFile = uploadResponse.data[0];

        await axios.put(
          `https://api.regeve.in/api/event/${Member_ID}`,
          { data: { Photo: uploadedFile.id } },
          { headers: { "Content-Type": "application/json" } }
        );

        const refreshResponse = await axios.get(
          `https://api.regeve.in/api/event/${Member_ID}`
        );

        const updatedMemberData = refreshResponse.data?.data;
        setMember(updatedMemberData);
        setEditedMember(updatedMemberData);
        setImageError(false);

        setShowPhotoModal(false);
        setSelectedFile(null);

        setPhotoPreview("");

        alert("Photo updated successfully!");
      }
    } catch (error) {
      console.error(error);
      setPhotoError("Failed to upload. Try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCloseModal = () => {
    setShowPhotoModal(false);
    setSelectedFile(null);
    setPhotoPreview("");
    setPhotoError("");
  };

  const handleFieldChange = (fieldName, value) => {
    if (fieldName === "IsPresent") {
      if (!editedMember?.IsVerified_Member && value === true) {
        alert("Only verified members can be marked as Present.");
        return; // stop update
      }
    }
    // Convert numeric fields to numbers immediately
    let finalValue = value;
    if (
      [
        "Age",
        "Adult_Count",
        "Children_Count",
        "Veg_Count",
        "Non_Veg_Count",
      ].includes(fieldName)
    ) {
      finalValue = value === "" ? "" : parseInt(value, 10) || 0;
    }

    setEditedMember((prev) => ({
      ...prev,
      [fieldName]: finalValue,
    }));
  };

  const validateAllFields = () => {
    const errors = {};

    // Phone validation
    if (editedMember.Phone_Number) {
      const phoneValidation = validatePhoneNumber(editedMember.Phone_Number);
      if (!phoneValidation.isValid)
        errors.Phone_Number = phoneValidation.message;
    }

    // Email validation
    if (editedMember.Email) {
      const emailValidation = validateEmail(editedMember.Email);
      if (!emailValidation.isValid) errors.Email = emailValidation.message;
    }

    // Age validation
    if (editedMember.Age) {
      const ageValidation = validateAge(editedMember.Age);
      if (!ageValidation.isValid) errors.Age = ageValidation.message;
    }

    // Company ID validation
    if (editedMember.Company_ID) {
      const companyValidation = validateCompanyId(editedMember.Company_ID);
      if (!companyValidation.isValid)
        errors.Company_ID = companyValidation.message;
    }

    // Meal count validation
    // Meal count validation
    if (hasMealCountErrors()) {
      errors.MealCount = "Total meals exceed total guests"; // Updated message
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!editedMember) return;

    if (
      editedMember.IsPresent === true &&
      editedMember.IsVerified_Member !== true
    ) {
      alert("❌ User must be verified by admin before marking Present.");
      return;
    }

    if (!validateAllFields()) {
      alert("Please fix validation errors before saving.");
      return;
    }

    setSaving(true);

    try {
      const cleanData = {
        Name: editedMember.Name?.trim(),
        Age: editedMember.Age,
        Gender: editedMember.Gender,
        Phone_Number: editedMember.Phone_Number?.trim(),
        WhatsApp_Number: editedMember.WhatsApp_Number?.trim(),
        Email: editedMember.Email?.trim(),
        Self: editedMember.Self || 1,
        Adult_Count: editedMember.Adult_Count,
        Children_Count: editedMember.Children_Count,
        Veg_Count: editedMember.Veg_Count,
        Non_Veg_Count: editedMember.Non_Veg_Count,
        Company_ID: editedMember.Company_ID?.trim(),
        IsPresent: editedMember.IsPresent,
        Travel_Mode: editedMember.Travel_Mode,
        Pickup_Location: editedMember.Pickup_Location,
      };

      // Remove undefined and empty strings for optional fields
      Object.keys(cleanData).forEach((key) => {
        if (cleanData[key] === undefined || cleanData[key] === "") {
          delete cleanData[key];
        }
      });

      const response = await axios.put(
        `https://api.regeve.in/api/event/${Member_ID}`,
        { data: cleanData },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setMember(editedMember);
      setIsEditing(false);
      setValidationErrors({});
      alert("Updated successfully!");
    } catch (error) {
      console.error("UPDATE ERROR:", error.response?.data || error);
      alert("Failed to update member details. Check console.");
    } finally {
      setSaving(false);
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-indigo-600 border-gray-300 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-indigo-600 font-medium">
            Loading Member Profile...
          </p>
        </div>
      </div>
    );
  }

  // NOT FOUND STATE
  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full border border-gray-200">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="text-3xl text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Member Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            The requested member profile could not be loaded.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const mealStatus = getMealValidationStatus();
  const totalGuests = getTotalGuests();
  const totalMeals = getTotalMeals();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* PROFILE HEADER & ACTIONS */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Image & Main Info */}
            <div className="flex items-center gap-6 flex-1 min-w-0">
              {/* Profile Image/Placeholder */}
              <div className="flex-shrink-0">
                {/* ⭐ CLICKABLE WHEN EDITING (NO OTHER CHANGE) */}
                <div
                  className={
                    isEditing ? "cursor-pointer inline-block" : "inline-block"
                  }
                  onClick={isEditing ? handlePhotoClick : undefined}
                >
                  {member.Photo?.url && !imageError ? (
                    <img
                      src={`https://api.regeve.in${
                        member.Photo.url
                      }?t=${Date.now()}`}
                      alt="Profile"
                      className="w-28 h-28 rounded-xl border-4 border-indigo-200 shadow-md"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center border-4 border-indigo-200 shadow-md">
                      <FaUser className="text-4xl text-gray-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Name and Meta */}
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1 break-words leading-tight w-full">
                  {isEditing && (
                    <div className="py-3 border-b border-gray-100 flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <span className="text-indigo-600 text-lg">✔</span>
                        Mark as Present
                      </label>

                      <label
                        className={`relative inline-flex items-center cursor-pointer transition-all duration-300 ${
                          !editedMember?.IsVerified_Member ? "opacity-60" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={editedMember?.IsPresent || false}
                          onChange={(e) => {
                            const newValue = e.target.checked;

                            // 🛑 BLOCK if not verified
                            if (
                              newValue === true &&
                              !editedMember?.IsVerified_Member
                            ) {
                              alert(
                                "❌ User must be verified by admin before marking Present."
                              );

                              // 🔥 FORCE UI TO STAY OFF
                              e.target.checked = false;

                              // 🔥 FORCE React to re-render the correct value
                              setEditedMember((prev) => ({
                                ...prev,
                                IsPresent: false,
                              }));

                              return;
                            }

                            // ✅ User is verified → update normally
                            handleFieldChange("IsPresent", newValue);
                          }}
                          className="sr-only peer"
                        />

                        <div
                          className={`w-16 h-8 rounded-full transition-all duration-300 shadow-inner
      ${editedMember?.IsPresent ? "bg-green-500" : "bg-gray-300"}
    `}
                        >
                          <div
                            className={`absolute top-0.5 left-0.5 w-7 h-7 bg-white rounded-full shadow-lg transform transition-all duration-300
        ${editedMember?.IsPresent ? "translate-x-8" : "translate-x-0"}
      `}
                          ></div>
                        </div>
                      </label>

                      {!editedMember?.IsVerified_Member && (
                        <p className="text-xs text-red-600 mt-1 animate-pulse">
                          User is not verified by admin
                        </p>
                      )}
                    </div>
                  )}

                  {isEditing ? (
                    <input
                      type="text"
                      value={editedMember?.Name || ""}
                      onChange={(e) =>
                        handleFieldChange("Name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-2xl sm:text-3xl font-extrabold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Member Name"
                    />
                  ) : (
                    <>
                      {member.Name}
                      {member.IsPresent && (
                        <span className="text-green-600 text-2xl ml-4">✔</span>
                      )}
                    </>
                  )}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 mt-3 gap-y-1 text-sm text-gray-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <FaBuilding className="text-indigo-500 text-xs" />
                    Company ID: {member.Company_ID || "N/A"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <FaInfoCircle className="text-indigo-500 text-xs" />
                    Member ID: {member.Member_ID || "N/A"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaUser className="text-indigo-500 text-xs" />
                    Reg Date:{" "}
                    {member.createdAt
                      ? new Date(member.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </span>
                  <span className="px-3 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    Registered
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-shrink-0 gap-3 w-full lg:w-auto mt-4 lg:mt-0 justify-end">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-all duration-300 shadow-lg"
                title="Share Profile via WhatsApp"
              >
                <FaShareAlt />
                <span className="hidden sm:inline">Share</span>
              </button>

              <div className="hidden lg:flex flex-shrink-0 gap-3 w-full lg:w-auto mt-4 lg:mt-0 justify-end">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg disabled:opacity-50"
                      title="Save Changes"
                    >
                      <FaSave />
                      {saving ? "Saving..." : "Save"}
                    </button>

                    <button
                      onClick={handleEditToggle}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all duration-300 shadow-lg"
                      title="Cancel Editing"
                    >
                      <FaTimes />
                      <span className="hidden sm:inline">Cancel</span>
                    </button>
                  </>
                ) : (
                  isEditAllowed && ( // ⭐ show only if localStorage.edit === "true"
                    <button
                      onClick={handleEditToggle}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-lg"
                    >
                      <FaEdit />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-1 space-y-8">
            {/* Guest & Meal Count */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaUsers className="mr-3 text-indigo-600" />
                Party & Meal Count
              </h2>

              {isEditing && hasMealCountErrors() && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600 font-medium">
                    Meal counts exceed party size
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <CountInputCard
                  icon={FaUsers}
                  iconColor="text-teal-600"
                  iconBgColor="bg-teal-100"
                  label="Self"
                  value={getFieldValue("Self")}
                  isEditing={false} // 🔒 ALWAYS non-editable
                />
                <CountInputCard
                  icon={FaUsers}
                  iconColor="text-teal-600"
                  iconBgColor="bg-teal-100"
                  label="Adults"
                  value={getFieldValue("Adult_Count")}
                  isEditing={isEditing}
                  onFieldChange={(value) =>
                    handleFieldChange("Adult_Count", value)
                  }
                  min="0"
                  max="50"
                />

                <CountInputCard
                  icon={FaChild}
                  iconColor="text-teal-600"
                  iconBgColor="bg-teal-100"
                  label="Children"
                  value={getFieldValue("Children_Count")}
                  isEditing={isEditing}
                  onFieldChange={(value) =>
                    handleFieldChange("Children_Count", value)
                  }
                  min="0"
                  max="50"
                />

                <CountInputCard
                  icon={FaUtensils}
                  iconColor="text-green-600"
                  iconBgColor="bg-green-100"
                  label="Veg Meals"
                  value={getFieldValue("Veg_Count")}
                  isEditing={isEditing}
                  onFieldChange={(value) =>
                    handleFieldChange("Veg_Count", value)
                  }
                  min="0"
                  max={totalGuests}
                  error={getFieldValue("Veg_Count") > totalGuests}
                />

                <CountInputCard
                  icon={FaUtensils}
                  iconColor="text-red-600"
                  iconBgColor="bg-red-100"
                  label="Non-Veg Meals"
                  value={getFieldValue("Non_Veg_Count")}
                  isEditing={isEditing}
                  onFieldChange={(value) =>
                    handleFieldChange("Non_Veg_Count", value)
                  }
                  min="0"
                  max={totalGuests}
                  error={getFieldValue("Non_Veg_Count") > totalGuests}
                />

                <div className="col-span-2 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {" "}
                    {/* Changed to 2 columns */}
                    {/* Total Guests */}
                    <div className="text-center">
                      <div className="text-gray-600 font-medium mb-1">
                        Total Guests
                      </div>
                      <div className="font-bold text-purple-600">
                        {totalGuests}
                      </div>
                    </div>
                    {/* Total Meals */}
                    <div className="text-center">
                      <div className="text-gray-600 font-medium mb-1">
                        Total Meals
                      </div>
                      <div
                        className={`font-bold ${
                          mealStatus === "error"
                            ? "text-red-600"
                            : mealStatus === "success"
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      >
                        {totalMeals}
                      </div>
                    </div>
                  </div>

                  {mealStatus !== "success" && (
                    <p
                      className={`text-xs mt-2 text-center ${
                        mealStatus === "error"
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    >
                      {mealStatus === "error"
                        ? "Meals exceed total guests!"
                        : "Meals don't match total guests"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaPhoneAlt className="mr-3 text-indigo-600" />
              Contact Information
            </h2>

            <div className="space-y-1">
              <ContactDetailItem
                icon={FaWhatsapp}
                label="WhatsApp Number"
                value={getFieldValue("WhatsApp_Number")}
                buttonText="WhatsApp"
                iconColor="text-green-600"
                isEditing={isEditing}
                fieldName="WhatsApp_Number"
                onFieldChange={handleFieldChange}
                type="tel"
                placeholder="+1 (555) 123-4567"
                validation={validatePhoneNumber}
                actionDisabled={!getFieldValue("WhatsApp_Number")}
              />

              <ContactDetailItem
                icon={FaEnvelope}
                label="Email Address"
                value={getFieldValue("Email")}
                buttonText="Email"
                iconColor="text-indigo-600"
                isEditing={isEditing}
                fieldName="Email"
                onFieldChange={handleFieldChange}
                type="email"
                placeholder="name@company.com"
                validation={validateEmail}
                actionDisabled={!getFieldValue("Email")}
              />
            </div>
            {/* TRAVEL INFORMATION BELOW CONTACT INFORMATION */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-indigo-600" />
                Travel Information
              </h2>

              {/* TRAVEL MODE */}
              <div className="mb-4">
                <EditableField
                  label="Travel Mode"
                  value={getFieldValue("Travel_Mode")}
                  fieldName="Travel_Mode"
                  isEditing={isEditing}
                  onFieldChange={handleFieldChange}
                  options={[
                    { label: "Self", value: "Self" },
                    { label: "Company Bus", value: "Company Bus" },
                  ]}
                />
              </div>

              {/* PICKUP LOCATION — only when Company Bus selected */}
              {getFieldValue("Travel_Mode") === "Company Bus" && (
                <EditableField
                  label="Pickup Location"
                  value={getFieldValue("Pickup_Location")}
                  fieldName="Pickup_Location"
                  isEditing={isEditing}
                  onFieldChange={handleFieldChange}
                  placeholder="Enter pickup location"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ PHOTO UPLOAD MODAL (ADDED — NOTHING ELSE CHANGED) */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Upload Profile Photo
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-full border-4 border-indigo-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-indigo-200">
                    <FaUser className="text-3xl text-gray-500" />
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />

              {photoError && (
                <p className="text-red-600 text-sm">{photoError}</p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUploadPhoto}
                  disabled={!selectedFile || uploadingPhoto}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                >
                  {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
