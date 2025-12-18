import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const API_URL = "https://api.regeve.in/api/election-participants";

export default function ElectionParticipantForm({ token = null }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    whatsapp_number: "",
    age: "",
    gender: "",
    id_card: "",
  });

  const [errors, setErrors] = useState({});
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const { adminId, electionDocumentId } = useParams();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function validateForm() {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.phone_number.replace(/\D/g, ""))) {
      newErrors.phone_number = "Phone number must be 10 digits";
    }

    if (
      form.whatsapp_number &&
      !/^\d{10}$/.test(form.whatsapp_number.replace(/\D/g, ""))
    ) {
      newErrors.whatsapp_number = "WhatsApp number must be 10 digits";
    }

    if (form.age) {
      const ageNum = parseInt(form.age);
      if (isNaN(ageNum) || ageNum < 18) {
        newErrors.age = "Age must be 18 or above";
      }
    }

    if (!form.gender) newErrors.gender = "Gender is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleFiles(e) {
    const files = Array.from(e.target.files);

    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      setMessage({
        type: "error",
        text: "Only image files under 5MB are allowed.",
      });
      return;
    }

    setPhotos(validFiles);

    // Preview first image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(validFiles[0]);
  }

  async function uploadPhoto(files, token) {
    if (!files || files.length === 0) return null;

    const fd = new FormData();
    files.forEach((file) => fd.append("files", file));

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const uploadResp = await axios.post(
      "https://api.regeve.in/api/upload",
      fd,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...headers,
        },
      }
    );

    return uploadResp.data[0].id; // ✅ Return uploaded image ID
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      setMessage({
        type: "error",
        text: "Please fix the errors in the form.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // ✅ 1. Upload Image Using Upload API
      const uploadedPhotoId = await uploadPhoto(photos, token);

      // ✅ 2. Prepare Exact Backend Payload
      const payload = {
        data: {
          name: form.name,
          email: form.email,
          phone_number: Number(form.phone_number),
          whatsapp_number: Number(form.whatsapp_number),
          age: Number(form.age),
          id_card: form.id_card,
          gender: form.gender, // "male" | "female" | "others"
          Photo: uploadedPhotoId ? [uploadedPhotoId] : [],
          // ✅ NUMERIC ADMIN ID
          adminId: Number(adminId),
          electionDocumentId,
        },
      };

      console.log("✅ FINAL PAYLOAD =>", payload);

      // ✅ 3. Save Election Participant
      await axios.post(API_URL, payload, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      // ✅ 4. Reset After Success
      setMessage({
        type: "success",
        text: "Candidate application submitted successfully!",
      });

      setForm({
        name: "",
        email: "",
        phone_number: "",
        whatsapp_number: "",
        age: "",
        gender: "",
        id_card: "",
      });

      setPhotos([]);
      setPhotoPreview(null);
      setErrors({});
    } catch (err) {
      console.error("Upload/Submit Error:", err);

      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to submit application. Please try again.";

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  async function checkExistingUser(email, phone) {
    try {
      const response = await axios.get(
        `${API_URL}?filters[email][$eq]=${email}&filters[phone_number][$eq]=${phone}`
      );
      return response.data.data.length > 0;
    } catch (error) {
      console.error("Check user error:", error);
      return false;
    }
  }

  return (
    <div className="min-h-screen mt-10 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Alert Message */}
        {message && (
          <div
            className={`fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 rounded-lg p-4 border-l-4 shadow-lg animate-fade-in ${
              message.type === "success"
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 text-green-800"
                : "bg-gradient-to-r from-red-50 to-rose-50 border-red-500 text-red-800"
            }`}
            style={{ animation: "fadeIn 0.3s ease-out" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {message.type === "success" ? (
                  <svg
                    className="h-6 w-6 text-green-500 mr-3 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6 text-red-500 mr-3 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
              <button
                onClick={() => setMessage(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Election Participant Application
            </h1>
            <p className="text-blue-100 text-base mb-4">
              Complete the form below to submit your application for the
              upcoming election
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mx-auto"></div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <form
              id="election-participant-form"
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* Photo Upload Section - Moved below header */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Photo Preview - Square */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-40 h-40 rounded-xl border-3 border-blue-200 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md">
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <svg
                              className="w-16 h-16 text-blue-300"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <p className="text-xs text-gray-500 mt-2">
                              No photo selected
                            </p>
                          </div>
                        )}
                      </div>
                      {photos.length > 0 && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                          {photos.length}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Button and Instructions */}
                  <div className="flex-grow">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                      <svg
                        className="w-6 h-6 mr-2 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Profile Photo
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Upload a clear passport-size photo. Maximum file size:
                      5MB. Allowed formats: JPG, PNG, GIF.
                    </p>
                    <label
                      htmlFor="photo-upload"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      {photos.length > 0 ? "Change Photo" : "Upload Photo"}
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFiles}
                      className="hidden"
                    />
                    {photos.length > 0 && (
                      <p className="text-sm text-green-600 mt-3 font-medium">
                        ✓ Photo uploaded successfully
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <svg
                      className="w-6 h-6 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Personal Information
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Fill in your basic details
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        className={`w-full px-4 py-3.5 pl-12 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500 ${
                          errors.name ? "border-red-400 bg-red-50" : ""
                        }`}
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    </div>
                    {errors.name && (
                      <p className="text-xs text-red-600 font-medium flex items-center mt-1">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        className={`w-full px-4 py-3.5 pl-12 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500 ${
                          errors.email ? "border-red-400 bg-red-50" : ""
                        }`}
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email address"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-600 font-medium flex items-center mt-1">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        className={`w-full px-4 py-3.5 pl-12 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500 ${
                          errors.phone_number ? "border-red-400 bg-red-50" : ""
                        }`}
                        name="phone_number"
                        value={form.phone_number}
                        onChange={handleChange}
                        required
                        placeholder="Enter 10-digit phone number"
                        maxLength="10"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                    </div>
                    {errors.phone_number && (
                      <p className="text-xs text-red-600 font-medium flex items-center mt-1">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.phone_number}
                      </p>
                    )}
                  </div>

                  {/* WhatsApp Number */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      WhatsApp Number
                    </label>
                    <div className="relative">
                      <input
                        className={`w-full px-4 py-3.5 pl-12 border rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500 ${
                          errors.whatsapp_number
                            ? "border-red-400 bg-red-50"
                            : ""
                        }`}
                        name="whatsapp_number"
                        value={form.whatsapp_number}
                        onChange={handleChange}
                        placeholder="Enter WhatsApp number"
                        maxLength="10"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.897 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.262-6.177-3.55-8.439" />
                        </svg>
                      </div>
                    </div>
                    {errors.whatsapp_number && (
                      <p className="text-xs text-red-600 font-medium flex items-center mt-1">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.whatsapp_number}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* ID Card */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      ID Number
                    </label>
                    <div className="relative">
                      <input
                        className={`w-full px-4 py-3.5 pl-12 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500 ${
                          errors.id_card ? "border-red-400 bg-red-50" : ""
                        }`}
                        name="id_card"
                        value={form.id_card}
                        onChange={handleChange}
                        placeholder="Enter Aadhaar/Voter/College ID"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                          />
                        </svg>
                      </div>
                    </div>
                    {errors.id_card && (
                      <p className="text-xs text-red-600 font-medium flex items-center mt-1">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.id_card}
                      </p>
                    )}
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Age
                    </label>
                    <div className="relative">
                      <input
                        className={`w-full px-4 py-3.5 pl-12 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500 ${
                          errors.age ? "border-red-400 bg-red-50" : ""
                        }`}
                        type="number"
                        name="age"
                        value={form.age}
                        onChange={handleChange}
                        placeholder="25"
                        min="18"
                        max="100"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"
                          />
                        </svg>
                      </div>
                    </div>
                    {errors.age && (
                      <p className="text-xs text-red-600 font-medium flex items-center mt-1">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.age}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Gender */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className={`w-full px-4 py-3.5 pl-12 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 appearance-none bg-gray-50 border-gray-200 text-gray-800 ${
                          errors.gender ? "border-red-400 bg-red-50" : ""
                        }`}
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="" className="text-gray-500">
                          Select gender
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="others">Other</option>
                      </select>
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 3.75l-.75.75m-7.5 0l-.75.75m5.25-3.75H3"
                          />
                        </svg>
                      </div>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                    {errors.gender && (
                      <p className="text-xs text-red-600 font-medium flex items-center mt-1">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  {/* Empty column to maintain alignment */}
                  <div></div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <div className="border-t border-gray-200 pt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white text-base transition-all duration-300 shadow-md hover:shadow-lg ${
                      loading
                        ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-90"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing Your Application...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Submit Application
                      </div>
                    )}
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-4">
                    By submitting, you agree to our terms and conditions. All
                    fields marked with * are required.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
