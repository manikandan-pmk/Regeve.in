// components/RegistrationForm.jsx
import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import {
  User,
  Mail,
  Phone,
  Hash,
  Calendar,
  Upload,
  Camera,
  Award,
  Trophy,
  Star,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const RegistrationFormLuckydraw = () => {
  const { adminId } = useParams();
  const [formData, setFormData] = useState({
    ID_card: "",
    Name: "",
    Email: "",
    Phone_Number: "",
    Gender: "",
    Age: "",
    Photo: null,
    imagePreview: null,
  });

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const fileInputRef = useRef(null);

  const API_URL = "https://api.regeve.in/api/lucky-draw-forms";

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Name.trim()) newErrors.Name = "Name is required";
    if (!formData.ID_card.trim()) newErrors.ID_card = "ID card is required";

    if (!formData.Email.trim()) {
      newErrors.Email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.Email)) {
      newErrors.Email = "Email is invalid";
    }

    if (!formData.Phone_Number.trim()) {
      newErrors.Phone_Number = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.Phone_Number)) {
      newErrors.Phone_Number = "Phone number must be 10 digits";
    }

    if (!formData.Gender) newErrors.Gender = "Gender is required";

    if (!formData.Age) {
      newErrors.Age = "Age is required";
    } else if (Number(formData.Age) < 18 || Number(formData.Age) > 100) {
      newErrors.Age = "Age must be between 18 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          Photo: "File size must be less than 5MB",
        }));
        return;
      }

      // Check file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          Photo: "Only JPG, PNG, and GIF images are allowed",
        }));
        return;
      }

      setIsUploading(true);

      setTimeout(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            Photo: file,
            imagePreview: reader.result,
          }));
          setIsUploading(false);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 2000);
        };
        reader.readAsDataURL(file);
      }, 1000);

      if (errors.Photo) {
        setErrors((prev) => ({ ...prev, Photo: "" }));
      }
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      Photo: null,
      imagePreview: null,
    }));
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const uploadImageToStrapi = async (file) => {
    const formData = new FormData();
    formData.append("files", file);

    const response = await axios.post(
      "https://api.regeve.in/api/upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      }
    );

    return response.data[0].id;
  };

  const checkDuplicateUser = async () => {
    try {
      const response = await axios.get(API_URL, {
        params: {
          "filters[$or][0][Phone_Number][$eq]": formData.Phone_Number,
          "filters[$or][1][Email][$eq]": formData.Email,
          "filters[$or][2][ID_card][$eq]": formData.ID_card,
        },
      });

      if (response.data.data.length > 0) {
        const existing = response.data.data[0].attributes;

        const newErrors = {};

        if (existing.Phone_Number === formData.Phone_Number) {
          newErrors.Phone_Number = "Phone number already registered";
        }

        if (existing.Email === formData.Email) {
          newErrors.Email = "Email already registered";
        }

        if (existing.ID_card === formData.ID_card) {
          newErrors.ID_card = "ID Card already registered";
        }

        setErrors(newErrors);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Duplicate check failed", error);
      return true; // allow submission if check fails
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ type: "", message: "" });

    if (!validateForm()) return;

    // ✅ DUPLICATE CHECK
    const isUnique = await checkDuplicateUser();
    if (!isUnique) return;

    if (!adminId) {
      setSubmitStatus({
        type: "error",
        message: "Admin not found. Please login again.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let photoId = null;

      if (formData.Photo) {
        photoId = await uploadImageToStrapi(formData.Photo);
      }

      const submitData = {
        data: {
          admin: Number(adminId),
          ID_card: formData.ID_card,
          Name: formData.Name,
          Email: formData.Email,
          Phone_Number: formData.Phone_Number,
          Gender: formData.Gender,
          Age: Number(formData.Age),
          isVerified: false,
          ...(photoId && { Photo: photoId }),
        },
      };

      await axios.post(API_URL, submitData);

      setSubmitStatus({
        type: "success",
        message: "Registration successful!",
      });

      resetForm();
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error.response?.data?.error?.message || "Server error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ID_card: "",
      Name: "",
      Email: "",
      Phone_Number: "",
      Gender: "",
      Age: "",
      Photo: null,
      imagePreview: null,
    });
    setErrors({});
  };

  const ageOptions = Array.from({ length: 83 }, (_, i) => i + 18);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-400 rounded-full flex items-center justify-center shadow-md">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center shadow-md">
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Lucky Draw Registration
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-blue-600 mx-auto mb-4 rounded-full"></div>

          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Join our exclusive lucky draw for a chance to win amazing prizes!
          </p>
        </div>

        {/* Status Messages */}
        {submitStatus.message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              submitStatus.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-3">
              {submitStatus.type === "success" ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="text-sm font-medium">{submitStatus.message}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Participant Information
              </h2>
              <p className="text-gray-600">
                Please fill in all required fields for registration
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* ID Card Input */}
                <div className="space-y-2">
                  <label className="flex items-center text-gray-800 font-medium text-sm">
                    <Hash className="w-4 h-4 mr-2 text-amber-600" />
                    ID Card Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="ID_card"
                      value={formData.ID_card}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 pl-10 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 ${
                        errors.ID_card ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="A123456789"
                    />
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.ID_card && (
                    <p className="text-red-500 text-xs animate-pulse">
                      {errors.ID_card}
                    </p>
                  )}
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <label className="flex items-center text-gray-800 font-medium text-sm">
                    <User className="w-4 h-4 mr-2 text-purple-600" />
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="Name"
                      value={formData.Name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 pl-10 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
                        errors.Name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="John Doe"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.Name && (
                    <p className="text-red-500 text-xs animate-pulse">
                      {errors.Name}
                    </p>
                  )}
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="flex items-center text-gray-800 font-medium text-sm">
                    <Mail className="w-4 h-4 mr-2 text-rose-600" />
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="Email"
                      value={formData.Email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 pl-10 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all duration-200 ${
                        errors.Email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="john@example.com"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.Email && (
                    <p className="text-red-500 text-xs animate-pulse">
                      {errors.Email}
                    </p>
                  )}
                </div>

                {/* Phone Input */}
                <div className="space-y-2">
                  <label className="flex items-center text-gray-800 font-medium text-sm">
                    <Phone className="w-4 h-4 mr-2 text-emerald-600" />
                    Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="Phone_Number"
                      value={formData.Phone_Number}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ""); // remove non-digits
                        if (value.length <= 10) {
                          handleChange({
                            target: { name: "Phone_Number", value },
                          });
                        }
                      }}
                      className={`w-full px-4 py-3 pl-10 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                        errors.Phone_Number
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="9876543210"
                    />

                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.Phone_Number && (
                    <p className="text-red-500 text-xs animate-pulse">
                      {errors.Phone_Number}
                    </p>
                  )}
                </div>

                {/* Gender Selection */}
                <div className="space-y-2">
                  <label className="flex items-center text-gray-800 font-medium text-sm">
                    <User className="w-4 h-4 mr-2 text-orange-600" />
                    Gender *
                  </label>
                  <div className="relative">
                    <select
                      name="Gender"
                      value={formData.Gender}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 pl-10 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none transition-all duration-200 ${
                        errors.Gender ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="" className="text-gray-400">
                        Select Gender
                      </option>
                      <option value="Male" className="text-gray-800">
                        Male
                      </option>
                      <option value="Female" className="text-gray-800">
                        Female
                      </option>
                      <option value="Others" className="text-gray-800">
                        Others
                      </option>
                    </select>
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.Gender && (
                    <p className="text-red-500 text-xs animate-pulse">
                      {errors.Gender}
                    </p>
                  )}
                </div>

                {/* Age Selection */}
                <div className="space-y-2">
                  <label className="flex items-center text-gray-800 font-medium text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    Age *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="Age"
                      value={formData.Age}
                      onChange={handleChange}
                      min="0"
                      max="150"
                      step="1"
                      className={`w-full px-4 py-3 pl-10 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                        errors.Age ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your age"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.Age && (
                    <p className="text-red-500 text-xs animate-pulse">
                      {errors.Age}
                    </p>
                  )}
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <label className="flex items-center text-gray-800 font-medium">
                  <Camera className="w-4 h-4 mr-2 text-indigo-600" />
                  Profile Photo
                  <span className="ml-1 text-xs text-gray-500">
                    (Recommended)
                  </span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex flex-col md:flex-row gap-4 items-start">
                  {/* Upload Area */}
                  <div
                    onClick={triggerFileInput}
                    className={`flex-1 cursor-pointer border-2 border-dashed rounded-lg p-4 transition-all duration-200 flex flex-col items-center justify-center min-h-[120px] ${
                      errors.Photo
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
                    }`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <p className="text-gray-600 text-sm">Uploading...</p>
                      </div>
                    ) : uploadSuccess ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                        <p className="text-emerald-600 text-sm">
                          Upload Successful!
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                          <Upload className="w-6 h-6 text-indigo-600" />
                        </div>
                        <p className="text-gray-700 text-sm font-medium mb-1">
                          Click to upload photo
                        </p>
                        <p className="text-gray-500 text-xs text-center">
                          PNG, JPG up to 5MB
                        </p>
                      </>
                    )}
                  </div>

                  {/* Preview Area */}
                  {formData.imagePreview && (
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-md overflow-hidden border-2 border-white shadow-sm">
                          <img
                            src={formData.imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-gray-600 text-xs mt-1">Preview</p>
                    </div>
                  )}
                </div>

                {errors.Photo && (
                  <p className="text-red-500 text-xs animate-pulse">
                    {errors.Photo}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-lg transform hover:scale-[1.01] transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 ${
                    isSubmitting
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:from-teal-700 hover:to-cyan-700"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5" />
                      Complete Registration
                      <Award className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-gray-600 text-xs">
                    By submitting this form, you agree to our{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Terms
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationFormLuckydraw;
