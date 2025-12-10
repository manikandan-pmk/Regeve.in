import React, { useState } from "react";
import axios from "axios";

const API_URL = "https://api.regeve.in/api/voter-registrations";

export default function ElectionForm({ token = null }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    whatsapp_number: "",
    age: "",
    gender: "",
    experience: "",
  });

  const [errors, setErrors] = useState({});
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

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
    if (!form.experience.trim())
      newErrors.experience = "Experience is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleFiles(e) {
    const files = Array.from(e.target.files);

    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setMessage({
        type: "error",
        text: "Some files were skipped. Only images under 5MB are allowed.",
      });
    }

    setPhotos(validFiles);

    if (validFiles.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(validFiles[0]);
    } else {
      setPhotoPreview(null);
    }
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

    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      let uploadedMedia = [];

      if (photos.length > 0) {
        const fd = new FormData();
        photos.forEach((file) => fd.append("files", file));

        const uploadResp = await axios.post(
          "https://api.regeve.in/api/upload",
          fd,
          { headers: { "Content-Type": "multipart/form-data", ...authHeaders } }
        );

        uploadedMedia = uploadResp.data.map((file) => file.id);
      }

      const payload = {
        data: {
          name: form.name,
          email: form.email,
          Phone_Number: form.phone_number,
          WhatsApp_Number: form.whatsapp_number,
          age: Number(form.age),
          gender: form.gender,
          experience: form.experience,
          photo: uploadedMedia,
        },
      };

      await axios.post(API_URL, payload, {
        headers: { "Content-Type": "application/json", ...authHeaders },
      });

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
        experience: "",
      });
      setPhotos([]);
      setPhotoPreview(null);
      setErrors({});
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to submit application. Please try again.";

      setMessage({
        type: "error",
        text: errorMessage,
      });
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-28 pb-8 py-8 px-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Alert Message */}
        {message && (
          <div
            className={`fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 rounded-lg p-4 border-l-4  ${
              message.type === "success"
                ? "bg-green-50 border-green-400 text-green-700"
                : "bg-red-50 border-red-400 text-red-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {message.type === "success" ? (
                  <svg
                    className="h-5 w-5 text-green-400 mr-3"
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
                    className="h-5 w-5 text-red-400 mr-3"
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
                className="text-gray-400 hover:text-gray-500"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header with Profile Photo */}
          <div className="bg-white p-6 text-center">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full border-2 border-blue-500 overflow-hidden bg-gray-50">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 bg-blue-400 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:bg-blue-600 transition-colors border border-white"
                >
                  <svg
                    className="w-4 h-4"
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
                  <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {photos.length}
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-bold text-black mb-2">
                Candidate Application
              </h1>
              <p className="text-black text-sm mb-2">
                Complete the form below to submit your application
              </p>
              <div className="w-16 h-1 bg-gray-800 rounded-full"></div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-colors ${
                        errors.name ? "border-red-300" : "border-gray-300"
                      }`}
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-colors ${
                        errors.email ? "border-red-300" : "border-gray-300"
                      }`}
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="Eter your email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-colors ${
                        errors.phone_number
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      name="phone_number"
                      value={form.phone_number}
                      onChange={handleChange}
                      required
                      placeholder="Enter your phone number"
                      maxLength="10"
                    />
                    {errors.phone_number && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.phone_number}
                      </p>
                    )}
                  </div>

                  {/* WhatsApp Number */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-colors ${
                        errors.whatsapp_number
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      name="whatsapp_number"
                      value={form.whatsapp_number}
                      onChange={handleChange}
                      placeholder="Enter your WhatsApp number"
                      maxLength="10"
                    />
                    {errors.whatsapp_number && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.whatsapp_number}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Age
                    </label>
                    <input
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-colors ${
                        errors.age ? "border-red-300" : "border-gray-300"
                      }`}
                      type="number"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      placeholder="25"
                      min="18"
                      max="100"
                    />
                    {errors.age && (
                      <p className="mt-1 text-xs text-red-600">{errors.age}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-900">Must be 18+</p>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-colors bg-white ${
                        errors.gender ? "border-red-300" : "border-gray-300"
                      }`}
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.gender}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Experience & Background{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-colors min-h-[100px] ${
                    errors.experience ? "border-red-300" : "border-gray-300"
                  }`}
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  required
                  placeholder="Describe your experience, qualifications, and vision..."
                />
                {errors.experience && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.experience}
                  </p>
                )}
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">Required field</p>
                  <p className="text-xs text-gray-500">
                    {form.experience.length} characters
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-auto min-w-[140px] mx-auto block py-3 cursor-pointer px-6 rounded-lg font-medium text-white text-sm md:text-base transition-colors ${
                    loading
                      ? "bg-gray- cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
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
                      Submitting...
                    </div>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
