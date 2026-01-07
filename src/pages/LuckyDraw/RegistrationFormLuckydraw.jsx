// components/RegistrationForm.jsx
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Upload,
  Camera,
  Award,
  Trophy,
  FileImage,
  X,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Shield,
  Sparkles,
  Check,
  Loader2,
  ArrowRight,
  Smartphone,
  Monitor,
} from "lucide-react";

const RegistrationFormLuckydraw = () => {
  const { adminId, luckydrawDocumentId } = useParams();
  const navigate = useNavigate();

  const idFrontFileInputRef = useRef(null);
  const idBackFileInputRef = useRef(null);
  const profileFileInputRef = useRef(null);

  // Form states with better structure
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Phone_Number: "",
    Gender: "",
    Age: "",
    Photo: null,
    IdDocumentFront: null,
    IdDocumentBack: null,
  });

  // Preview states
  const [previews, setPreviews] = useState({
    imagePreview: null,
    idFrontImagePreview: null,
    idBackImagePreview: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const [showBackButton, setShowBackButton] = useState(false);
  const [isValidLink, setIsValidLink] = useState(true);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formProgress, setFormProgress] = useState(0);

  // Animation states
  const [isLoaded, setIsLoaded] = useState(false);
  const [shakeErrors, setShakeErrors] = useState({});

  const API_URL = "https://api.regeve.in/api/lucky-draw-forms";

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initial load animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Update form progress
  useEffect(() => {
    const totalFields = 7;
    const filledFields = Object.values(formData).filter((val) => {
      if (val === null) return false;
      return String(val).trim().length > 0;
    }).length;

    const progress = Math.min(
      100,
      Math.round((filledFields / totalFields) * 100)
    );
    setFormProgress(progress);
  }, [formData]);

  // Scroll handling with animation
  useEffect(() => {
    const handleScroll = () => {
      setShowBackButton(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Validate link
  useEffect(() => {
    const isInvalidParams =
      !adminId ||
      !luckydrawDocumentId ||
      typeof adminId !== "string" ||
      typeof luckydrawDocumentId !== "string" ||
      luckydrawDocumentId.length < 10;

    if (isInvalidParams) {
      setIsValidLink(false);
      setIsCheckingLink(false);
      return;
    }

    const verifyLink = async () => {
      try {
        const res = await axios.get(
          `https://api.regeve.in/api/public/lucky-draw-names/${luckydrawDocumentId}`
        );
        setIsValidLink(true);
      } catch (err) {
        setIsValidLink(false);
      } finally {
        setIsCheckingLink(false);
      }
    };

    verifyLink();
  }, [luckydrawDocumentId, adminId]);

  // Enhanced validation with animations
  const validateForm = () => {
    const newErrors = {};
    const newShakeErrors = {};

    if (!formData.Name.trim()) {
      newErrors.Name = "Please enter your full name";
      newShakeErrors.Name = true;
    }

    if (!formData.Email.trim()) {
      newErrors.Email = "Email is required";
      newShakeErrors.Email = true;
    } else if (!/\S+@\S+\.\S+/.test(formData.Email)) {
      newErrors.Email = "Please enter a valid email address";
      newShakeErrors.Email = true;
    }

    if (!formData.Phone_Number.trim()) {
      newErrors.Phone_Number = "Phone number is required";
      newShakeErrors.Phone_Number = true;
    } else if (!/^\d{10}$/.test(formData.Phone_Number)) {
      newErrors.Phone_Number = "Enter a valid 10-digit phone number";
      newShakeErrors.Phone_Number = true;
    }

    if (!formData.Gender) {
      newErrors.Gender = "Please select your gender";
      newShakeErrors.Gender = true;
    }

    if (!formData.Age) {
      newErrors.Age = "Age is required";
      newShakeErrors.Age = true;
    } else if (Number(formData.Age) < 18 || Number(formData.Age) > 100) {
      newErrors.Age = "Age must be between 18 and 100 years";
      newShakeErrors.Age = true;
    }

    if (!formData.IdDocumentFront) {
      newErrors.IdDocumentFront = "Front side of ID is required";
      newShakeErrors.IdDocumentFront = true;
    }

    if (!formData.IdDocumentBack) {
      newErrors.IdDocumentBack = "Back side of ID is required";
      newShakeErrors.IdDocumentBack = true;
    }

    setErrors(newErrors);
    setShakeErrors(newShakeErrors);

    // Clear shake animation after 500ms
    setTimeout(() => setShakeErrors({}), 500);

    return Object.keys(newErrors).length === 0;
  };

  // Enhanced change handler with animations
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Enhanced file handler with better UX
  const handleFileChange = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File size validation with user-friendly message
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [type]: "File too large (max 5MB)" }));
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [type]: "Only JPG, PNG images allowed",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        [type]: file,
      }));

      setPreviews((prev) => ({
        ...prev,
        [type === "Photo"
          ? "imagePreview"
          : type === "IdDocumentFront"
          ? "idFrontImagePreview"
          : "idBackImagePreview"]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: null,
    }));

    setPreviews((prev) => ({
      ...prev,
      [type === "Photo"
        ? "imagePreview"
        : type === "IdDocumentFront"
        ? "idFrontImagePreview"
        : "idBackImagePreview"]: null,
    }));
  };

  // Trigger file input with animation
  const triggerFileInput = (type) => {
    const element =
      type === "profile"
        ? profileFileInputRef.current
        : type === "idFront"
        ? idFrontFileInputRef.current
        : idBackFileInputRef.current;
    element?.click();
  };

  const uploadImageToStrapi = async (file) => {
    const formData = new FormData();
    formData.append("files", file);
    const response = await axios.post(
      "https://api.regeve.in/api/upload",
      formData
    );
    return response.data[0].id;
  };




  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ type: "", message: "" });

    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

   

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
      let idFrontId = null;
      let idBackId = null;

      // Upload images
      if (formData.Photo) {
        photoId = await uploadImageToStrapi(formData.Photo);
      }
      if (formData.IdDocumentFront) {
        idFrontId = await uploadImageToStrapi(formData.IdDocumentFront);
      }
      if (formData.IdDocumentBack) {
        idBackId = await uploadImageToStrapi(formData.IdDocumentBack);
      }

      const submitData = {
        data: {
          adminId: Number(adminId),
          luckyDrawNameDocumentId: luckydrawDocumentId,
          Name: formData.Name,
          Email: formData.Email,
          Phone_Number: formData.Phone_Number,
          Gender: formData.Gender,
          Age: Number(formData.Age),
          isVerified: false,
          ...(photoId && { Photo: photoId }),
          ...(idFrontId || idBackId
            ? { Id_Photo: [idFrontId, idBackId].filter(Boolean) }
            : {}),
        },
      };

      await axios.post(API_URL, submitData);

      setSubmitStatus({
        type: "success",
        message: "🎉 Registration successful! You're entered into the draw!",
      });

      // Reset form after success
      setTimeout(() => {
        setFormData({
          Name: "",
          Email: "",
          Phone_Number: "",
          Gender: "",
          Age: "",
          Photo: null,
          IdDocumentFront: null,
          IdDocumentBack: null,
        });
        setPreviews({
          imagePreview: null,
          idFrontImagePreview: null,
          idBackImagePreview: null,
        });
      }, 2000);
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          error.response?.data?.error?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isCheckingLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <Sparkles className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Lucky Draw
          </h3>
          <p className="text-gray-600 animate-pulse">
            Checking registration link...
          </p>
        </div>
      </div>
    );
  }

  // Invalid link state
  if (!isValidLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 text-center animate-fade-in">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-pink-100 mb-6 animate-bounce">
            <AlertCircle className="w-12 h-12 text-red-600 animate-pulse" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Invalid Registration Link
          </h1>

          <p className="text-gray-600 mb-6 leading-relaxed">
            This Lucky Draw registration link is either expired or no longer
            active. Please contact the organizer for a valid link.
          </p>

          <div className="flex flex-col gap-3 animate-slide-up">
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-lg hover:shadow-xl font-medium"
            >
              Go Back
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 font-medium"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 px-4 py-6 md:py-8 transition-all duration-500 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Viewport Indicator - For debugging */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 z-50 px-3 py-1 bg-black/80 text-white text-xs rounded-full backdrop-blur-sm">
          {isMobile ? (
            <div className="flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              <span>Mobile View</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Monitor className="w-3 h-3" />
              <span>Desktop View</span>
            </div>
          )}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Animated Header */}
        <div className="text-center mb-8 md:mb-10 animate-slide-down">
          <div className="flex justify-center items-center gap-3 mb-5 relative">
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-float">
                <Trophy className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 animate-ping">
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <div className="relative">
              <div
                className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg animate-float"
                style={{ animationDelay: "0.2s" }}
              >
                <Award className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -left-2 animate-pulse">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Lucky Draw Registration
            </span>
          </h1>

          <div className="w-20 h-1.5 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 mx-auto mb-4 rounded-full animate-width-grow"></div>

          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base px-4 leading-relaxed">
            Register now for a chance to win amazing prizes! Complete all fields
            to enter the draw.
          </p>
        </div>

        {/* Status Messages with Animation */}
        {submitStatus.message && (
          <div
            className={`mb-6 p-4 rounded-2xl mx-2 md:mx-0 transform transition-all duration-500 ${
              submitStatus.type === "success"
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                : "bg-gradient-to-r from-red-50 to-pink-50 border border-red-200"
            } animate-slide-up`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-full ${
                  submitStatus.type === "success"
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                {submitStatus.type === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-600 animate-scale" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 animate-shake" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    submitStatus.type === "success"
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {submitStatus.message}
                </p>
                {submitStatus.type === "success" && (
                  <p className="text-sm text-green-600 mt-1 animate-pulse">
                    Good luck! Winners will be announced soon.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden animate-fade-in">
          <div className="p-4 md:p-6 lg:p-8">
            {/* Form Header */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Participant Details
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base">
                    Fill in your information to join the lucky draw
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-slide-up">
                {/* Name Input */}
                <div
                  className={`space-y-2 transition-all duration-300 ${
                    shakeErrors.Name ? "animate-shake" : ""
                  }`}
                >
                  <label className="flex items-center text-gray-800 font-semibold text-sm">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mr-2">
                      <User className="w-3 h-3 text-purple-600" />
                    </div>
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="Name"
                      value={formData.Name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3.5 pl-12 bg-gray-50/80 border-2 rounded-xl focus:outline-none transition-all duration-300 text-base ${
                        errors.Name
                          ? "border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      }`}
                      placeholder="John Doe"
                    />
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.Name && (
                    <p className="text-red-500 text-sm animate-fade-in flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.Name}
                    </p>
                  )}
                </div>

                {/* Email Input */}
                <div
                  className={`space-y-2 transition-all duration-300 ${
                    shakeErrors.Email ? "animate-shake" : ""
                  }`}
                >
                  <label className="flex items-center text-gray-800 font-semibold text-sm">
                    <div className="w-6 h-6 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center mr-2">
                      <Mail className="w-3 h-3 text-pink-600" />
                    </div>
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="Email"
                      value={formData.Email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3.5 pl-12 bg-gray-50/80 border-2 rounded-xl focus:outline-none transition-all duration-300 text-base ${
                        errors.Email
                          ? "border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                      }`}
                      placeholder="john@example.com"
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.Email && (
                    <p className="text-red-500 text-sm animate-fade-in flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.Email}
                    </p>
                  )}
                </div>

                {/* Phone Input */}
                <div
                  className={`space-y-2 transition-all duration-300 ${
                    shakeErrors.Phone_Number ? "animate-shake" : ""
                  }`}
                >
                  <label className="flex items-center text-gray-800 font-semibold text-sm">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg flex items-center justify-center mr-2">
                      <Phone className="w-3 h-3 text-emerald-600" />
                    </div>
                    Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="Phone_Number"
                      value={formData.Phone_Number}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 10) {
                          handleChange({
                            target: { name: "Phone_Number", value },
                          });
                        }
                      }}
                      className={`w-full px-4 py-3.5 pl-12 bg-gray-50/80 border-2 rounded-xl focus:outline-none transition-all duration-300 text-base ${
                        errors.Phone_Number
                          ? "border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      }`}
                      placeholder="9876543210"
                    />
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.Phone_Number && (
                    <p className="text-red-500 text-sm animate-fade-in flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.Phone_Number}
                    </p>
                  )}
                </div>

                {/* Gender Selection */}
                <div
                  className={`space-y-2 transition-all duration-300 ${
                    shakeErrors.Gender ? "animate-shake" : ""
                  }`}
                >
                  <label className="flex items-center text-gray-800 font-semibold text-sm">
                    <div className="w-6 h-6 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center mr-2">
                      <User className="w-3 h-3 text-orange-600" />
                    </div>
                    Gender *
                  </label>
                  <div className="relative">
                    <select
                      name="Gender"
                      value={formData.Gender}
                      onChange={handleChange}
                      className={`w-full px-4 py-3.5 pl-12 bg-gray-50/80 border-2 rounded-xl focus:outline-none appearance-none transition-all duration-300 text-base ${
                        errors.Gender
                          ? "border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
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
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <ChevronLeft className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.Gender && (
                    <p className="text-red-500 text-sm animate-fade-in flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.Gender}
                    </p>
                  )}
                </div>

                {/* Age Selection */}
                <div
                  className={`space-y-2 md:col-span-2 lg:col-span-1 transition-all duration-300 ${
                    shakeErrors.Age ? "animate-shake" : ""
                  }`}
                >
                  <label className="flex items-center text-gray-800 font-semibold text-sm">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center mr-2">
                      <Calendar className="w-3 h-3 text-blue-600" />
                    </div>
                    Age *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="Age"
                      value={formData.Age}
                      onChange={handleChange}
                      min="18"
                      max="100"
                      step="1"
                      className={`w-full px-4 py-3.5 pl-12 bg-gray-50/80 border-2 rounded-xl focus:outline-none transition-all duration-300 text-base ${
                        errors.Age
                          ? "border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      }`}
                      placeholder="Enter your age"
                    />
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.Age && (
                    <p className="text-red-500 text-sm animate-fade-in flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.Age}
                    </p>
                  )}
                </div>
              </div>

              {/* Profile Photo Section */}
              <div
                className="pt-6 border-t border-gray-200/50 animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mr-3">
                      <Camera className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Profile Photo
                      </h3>
                      <p className="text-sm text-gray-500">
                        Optional - PNG, JPG up to 5MB
                      </p>
                    </div>
                  </div>
                  {formData.Photo && (
                    <button
                      type="button"
                      onClick={() => removeImage("Photo")}
                      className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg transition-colors self-start"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={profileFileInputRef}
                  onChange={(e) => handleFileChange("Photo", e)}
                  accept="image/*"
                  className="hidden"
                />

                {!formData.Photo ? (
                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                    <button
                      type="button"
                      onClick={() => triggerFileInput("profile")}
                      className="group relative overflow-hidden border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-2xl p-6 text-center transition-all duration-300 hover:bg-indigo-50/50 active:scale-95"
                    >
                      <div className="relative z-10">
                        <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Upload className="w-6 h-6 text-indigo-600 group-hover:animate-bounce" />
                        </div>
                        <p className="font-semibold text-gray-900">
                          Upload Photo
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Click to select file
                        </p>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-2xl animate-fade-in">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                      <img
                        src={previews.imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        Profile Photo Added
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        Ready for submission
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => triggerFileInput("profile")}
                          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ID Verification Section */}
              <div
                className="pt-6 border-t border-gray-200/50 animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-start mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Identity Verification
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Upload clear images of your Aadhaar Card or PAN Card (both
                      sides)
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                      <p className="text-xs font-medium text-green-600">
                        Required for verification
                      </p>
                    </div>
                  </div>
                </div>

                {/* ID Upload Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Front Side */}
                  <div
                    className={`transition-all duration-300 ${
                      shakeErrors.IdDocumentFront ? "animate-shake" : ""
                    }`}
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mr-2 animate-pulse"></div>
                      <label className="font-semibold text-gray-900">
                        Front Side
                      </label>
                      <span className="ml-2 text-xs text-red-500 font-medium">
                        (Required)
                      </span>
                    </div>

                    <input
                      type="file"
                      ref={idFrontFileInputRef}
                      onChange={(e) => handleFileChange("IdDocumentFront", e)}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-2xl p-5 h-full border border-amber-100">
                      {!formData.IdDocumentFront ? (
                        <div className="text-center h-full flex flex-col justify-center">
                          <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
                          <p className="font-semibold text-gray-900 mb-2">
                            Front Side Required
                          </p>
                          <p className="text-sm text-gray-600 mb-4">
                            Front side of ID document
                          </p>
                          <button
                            type="button"
                            onClick={() => triggerFileInput("idFront")}
                            className="inline-flex items-center cursor-pointer justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-sky-500 text-white font-medium rounded-xl  transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Front
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col h-full">
                          <div className="flex-grow">
                            <div className="mb-4 flex justify-center">
                              <div className="w-36 h-36 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                                <img
                                  src={previews.idFrontImagePreview}
                                  alt="ID Front"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2 animate-scale" />
                                <p className="font-semibold text-gray-900">
                                  Front Side Uploaded
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Ready for verification
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4 pt-4 border-t border-amber-200">
                            <button
                              type="button"
                              onClick={() => triggerFileInput("idFront")}
                              className="flex-1 cursor-pointer px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white transition-colors"
                            >
                              Replace
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage("IdDocumentFront")}
                              className="flex-1 cursor-pointer px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.IdDocumentFront && (
                      <p className="text-red-500 text-sm mt-2 animate-fade-in flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.IdDocumentFront}
                      </p>
                    )}
                  </div>

                  {/* Back Side */}
                  <div
                    className={`transition-all duration-300 ${
                      shakeErrors.IdDocumentBack ? "animate-shake" : ""
                    }`}
                  >
                    <div className="flex items-center mb-3">
                      <div
                        className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mr-2 animate-pulse"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <label className="font-semibold text-gray-900">
                        Back Side
                      </label>
                      <span className="ml-2 text-xs text-red-500 font-medium">
                        (Required)
                      </span>
                    </div>

                    <input
                      type="file"
                      ref={idBackFileInputRef}
                      onChange={(e) => handleFileChange("IdDocumentBack", e)}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-2xl p-5 h-full border border-amber-100">
                      {!formData.IdDocumentBack ? (
                        <div className="text-center h-full flex flex-col justify-center">
                          <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
                          <p className="font-semibold text-gray-900 mb-2">
                            Back Side Required
                          </p>
                          <p className="text-sm text-gray-600 mb-4">
                            Back side of ID document
                          </p>
                          <button
                            type="button"
                            onClick={() => triggerFileInput("idBack")}
                            className="inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-sky-500 text-white font-medium rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Back
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col h-full">
                          <div className="flex-grow">
                            <div className="mb-4 flex justify-center">
                              <div className="w-36 h-36 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                                <img
                                  src={previews.idBackImagePreview}
                                  alt="ID Back"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2 animate-scale" />
                                <p className="font-semibold text-gray-900">
                                  Back Side Uploaded
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Ready for verification
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4 pt-4 border-t border-amber-200">
                            <button
                              type="button"
                              onClick={() => triggerFileInput("idBack")}
                              className="flex-1 cursor-pointer px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white transition-colors"
                            >
                              Replace
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage("IdDocumentBack")}
                              className="flex-1 cursor-pointer  px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.IdDocumentBack && (
                      <p className="text-red-500 text-sm mt-2 animate-fade-in flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.IdDocumentBack}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Section */}
              <div
                className="pt-6 border-t border-gray-200/50 animate-slide-up"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Ready to Join?
                    </h4>
                    <p className="text-sm text-gray-600">
                      Submit your entry for the lucky draw
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Your data is secure and encrypted</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-2xl transition-all duration-500 transform ${
                    isSubmitting
                      ? "opacity-90 cursor-wait"
                      : "hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl"
                  } shadow-lg relative overflow-hidden group`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700"></div>
                      <div className="relative flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Registration...</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center gap-3">
                        <Trophy className="w-5 h-5 group-hover:animate-bounce" />
                        <span>Complete Registration & Enter Draw</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </>
                  )}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-gray-600 text-xs">
                    By submitting, you agree to our{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
                    >
                      Terms
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Winners will be contacted via email and phone
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Mobile Bottom Safe Area */}
        <div className="h-8 md:h-0"></div>
      </div>

      {/* Add custom animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-down {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes width-grow {
          from { width: 0; opacity: 0; }
          to { width: 80px; opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-scale {
          animation: scale 0.3s ease-in-out;
        }
        
        .animate-width-grow {
          animation: width-grow 1s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .animate-ping {
          animation: ping 1s ease-in-out infinite;
        }
        
        .animate-bounce {
          animation: bounce 0.5s ease-in-out infinite;
        }
        
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        
        /* Smooth transitions for mobile */
        @media (max-width: 768px) {
          input, select, button {
            font-size: 16px !important; /* Prevents iOS zoom on focus */
          }
          
          .animate-slide-up {
            animation: slide-up 0.4s ease-out;
          }
        }
      `}</style>
    </div>
  );
};

export default RegistrationFormLuckydraw;
