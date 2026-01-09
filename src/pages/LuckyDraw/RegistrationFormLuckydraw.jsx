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
  PartyPopper,
  Star,
  Gift,
} from "lucide-react";

const RegistrationFormLuckydraw = () => {
  const { adminId, luckydrawDocumentId } = useParams();
  const navigate = useNavigate();

  const idFrontFileInputRef = useRef(null);
  const idBackFileInputRef = useRef(null);
  const profileFileInputRef = useRef(null);
  const formRef = useRef(null);

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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);
  const [isValidLink, setIsValidLink] = useState(true);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formProgress, setFormProgress] = useState(0);
  const [confettiActive, setConfettiActive] = useState(false);

  // Animation states
  const [isLoaded, setIsLoaded] = useState(false);
  const [shakeErrors, setShakeErrors] = useState({});
  const [luckyDrawInfo, setLuckyDrawInfo] = useState(null);

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
        setLuckyDrawInfo(res.data);
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

      // Show success popup with confetti
      setShowSuccessPopup(true);
      setConfettiActive(true);

      // Reset confetti after animation
      setTimeout(() => setConfettiActive(false), 3000);

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
      }, 3000);
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

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
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
    <>
      <div
        className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 px-4 py-6 md:py-8 transition-all duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        ref={formRef}
      >
        {/* Confetti Animation */}
        {confettiActive && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}vw`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                  fontSize: `${10 + Math.random() * 20}px`,
                  opacity: 0.7 + Math.random() * 0.3,
                }}
              >
                {
                  ["🎉", "🎊", "🎈", "✨", "🥳", "🎁", "⭐", "🏆"][
                    Math.floor(Math.random() * 8)
                  ]
                }
              </div>
            ))}
          </div>
        )}

        {/* Viewport Indicator - For debugging */}
        {process.env.NODE_ENV === "development" && (
          <div className="fixed bottom-4 right-4 z-40 px-3 py-1 bg-black/80 text-white text-xs rounded-full backdrop-blur-sm">
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
          <div className="text-center mb-6 md:mb-10 animate-slide-down">
            <div className="flex justify-center items-center gap-3 mb-4 md:mb-5 relative">
              <div className="relative">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-float">
                  <Trophy className="w-6 h-6 md:w-10 md:h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 animate-ping">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                </div>
              </div>
              <div className="relative">
                <div
                  className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg animate-float"
                  style={{ animationDelay: "0.2s" }}
                >
                  <Award className="w-6 h-6 md:w-10 md:h-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -left-1 md:-bottom-2 md:-left-2 animate-pulse">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                </div>
              </div>
            </div>

            {luckyDrawInfo && (
              <>
                {/* Lucky Draw Name */}
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold mb-3 text-center">
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {luckyDrawInfo.Name} Registration
                  </span>
                </h1>

                <div className="flex flex-wrap justify-center gap-3 md:gap-6 mt-4">
                  {/* Participants */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow ">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-md font-semibold text-gray-800">
                      {luckyDrawInfo.Number_of_Peoples ??
                        luckyDrawInfo.lucky_draw_forms?.length ??
                        0}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">Participants</span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow ">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-md font-semibold text-gray-800">
                      {luckyDrawInfo.Duration_Value}{" "}
                      {luckyDrawInfo.Duration_Unit}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow ">
                    <Gift className="w-4 h-4 text-green-600" />
                    <span className="text-md font-semibold text-gray-800">
                      ₹{luckyDrawInfo.Amount}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Status Messages with Animation */}
          {submitStatus.message && submitStatus.type !== "success" && (
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
                </div>
              </div>
            </div>
          )}

          {/* Main Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden animate-fade-in">
            <div className="p-4 md:p-6 lg:p-8">
              {/* Form Header */}
              <div className="mb-4 md:mb-8">
                <div className="flex items-center gap-3 mb-2 md:mb-3">
                  <div className="p-2 md:p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl md:rounded-2xl">
                    <User className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-3xl font-bold text-gray-900">
                      Participant Details
                    </h2>
                    <p className="text-gray-600 text-xs md:text-base">
                      Fill in your information to join the lucky draw
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4 md:space-y-8"
                ref={formRef}
              >
                {/* Grid Layout - Responsive adjustments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 animate-slide-up">
                  {/* Name Input */}
                  <div
                    className={`space-y-1 md:space-y-2 transition-all duration-300 ${
                      shakeErrors.Name ? "animate-shake" : ""
                    }`}
                  >
                    <label className="flex items-center text-gray-800 font-semibold text-xs md:text-sm">
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mr-2">
                        <User className="w-2 h-2 md:w-3 md:h-3 text-purple-600" />
                      </div>
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="Name"
                        value={formData.Name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2.5 md:px-4 md:py-3.5 pl-10 md:pl-12 bg-gray-50/80 border-2 rounded-lg md:rounded-xl focus:outline-none transition-all duration-300 text-sm md:text-base ${
                          errors.Name
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        }`}
                        placeholder="John Doe"
                        required
                      />
                      <User className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    {errors.Name && (
                      <p className="text-red-500 text-xs md:text-sm animate-fade-in flex items-center gap-1">
                        <AlertCircle className="w-2 h-2 md:w-3 md:h-3" />
                        {errors.Name}
                      </p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div
                    className={`space-y-1 md:space-y-2 transition-all duration-300 ${
                      shakeErrors.Email ? "animate-shake" : ""
                    }`}
                  >
                    <label className="flex items-center text-gray-800 font-semibold text-xs md:text-sm">
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center mr-2">
                        <Mail className="w-2 h-2 md:w-3 md:h-3 text-pink-600" />
                      </div>
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="Email"
                        value={formData.Email}
                        onChange={handleChange}
                        className={`w-full px-3 py-2.5 md:px-4 md:py-3.5 pl-10 md:pl-12 bg-gray-50/80 border-2 rounded-lg md:rounded-xl focus:outline-none transition-all duration-300 text-sm md:text-base ${
                          errors.Email
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        }`}
                        placeholder="john@example.com"
                        required
                      />
                      <Mail className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    {errors.Email && (
                      <p className="text-red-500 text-xs md:text-sm animate-fade-in flex items-center gap-1">
                        <AlertCircle className="w-2 h-2 md:w-3 md:h-3" />
                        {errors.Email}
                      </p>
                    )}
                  </div>

                  {/* Phone Input */}
                  <div
                    className={`space-y-1 md:space-y-2 transition-all duration-300 ${
                      shakeErrors.Phone_Number ? "animate-shake" : ""
                    }`}
                  >
                    <label className="flex items-center text-gray-800 font-semibold text-xs md:text-sm">
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg flex items-center justify-center mr-2">
                        <Phone className="w-2 h-2 md:w-3 md:h-3 text-emerald-600" />
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
                        className={`w-full px-3 py-2.5 md:px-4 md:py-3.5 pl-10 md:pl-12 bg-gray-50/80 border-2 rounded-lg md:rounded-xl focus:outline-none transition-all duration-300 text-sm md:text-base ${
                          errors.Phone_Number
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        }`}
                        placeholder="Phone Number"
                        required
                      />
                      <Phone className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    {errors.Phone_Number && (
                      <p className="text-red-500 text-xs md:text-sm animate-fade-in flex items-center gap-1">
                        <AlertCircle className="w-2 h-2 md:w-3 md:h-3" />
                        {errors.Phone_Number}
                      </p>
                    )}
                  </div>

                  {/* Gender Selection */}
                  <div
                    className={`space-y-1 md:space-y-2 transition-all duration-300 ${
                      shakeErrors.Gender ? "animate-shake" : ""
                    }`}
                  >
                    <label className="flex items-center text-gray-800 font-semibold text-xs md:text-sm">
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center mr-2">
                        <User className="w-2 h-2 md:w-3 md:h-3 text-orange-600" />
                      </div>
                      Gender *
                    </label>
                    <div className="relative">
                      <select
                        name="Gender"
                        value={formData.Gender}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 py-2.5 md:px-4 md:py-3.5 pl-10 md:pl-12 bg-gray-50/80 border-2 rounded-lg md:rounded-xl focus:outline-none appearance-none transition-all duration-300 text-sm md:text-base ${
                          errors.Gender
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                      <User className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4" />
                      <ChevronLeft className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    {errors.Gender && (
                      <p className="text-red-500 text-xs md:text-sm animate-fade-in flex items-center gap-1">
                        <AlertCircle className="w-2 h-2 md:w-3 md:h-3" />
                        {errors.Gender}
                      </p>
                    )}
                  </div>

                  {/* Age Selection - Full width on mobile, half on desktop */}
                  <div
                    className={`space-y-1 md:space-y-2 md:col-span-2 lg:col-span-1 transition-all duration-300 ${
                      shakeErrors.Age ? "animate-shake" : ""
                    }`}
                  >
                    <label className="flex items-center text-gray-800 font-semibold text-xs md:text-sm">
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center mr-2">
                        <Calendar className="w-2 h-2 md:w-3 md:h-3 text-blue-600" />
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
                        required
                        className={`w-full px-3 py-2.5 md:px-4 md:py-3.5 pl-10 md:pl-12 bg-gray-50/80 border-2 rounded-lg md:rounded-xl focus:outline-none transition-all duration-300 text-sm md:text-base ${
                          errors.Age
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        }`}
                        placeholder="Enter your age"
                      />
                      <Calendar className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    {errors.Age && (
                      <p className="text-red-500 text-xs md:text-sm animate-fade-in flex items-center gap-1">
                        <AlertCircle className="w-2 h-2 md:w-3 md:h-3" />
                        {errors.Age}
                      </p>
                    )}
                  </div>
                </div>

                {/* Profile Photo Section */}
                <div
                  className="pt-4 md:pt-6 border-t border-gray-200/50 animate-slide-up"
                  style={{ animationDelay: "0.1s" }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 md:mb-4 gap-2 md:gap-3">
                    <div className="flex items-center">
                      <div className="p-2 md:p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl md:rounded-2xl mr-2 md:mr-3">
                        <Camera className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                          Profile Photo
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500">
                          Optional - PNG, JPG up to 5MB
                        </p>
                      </div>
                    </div>
                    {formData.Photo && (
                      <button
                        type="button"
                        onClick={() => removeImage("Photo")}
                        className="px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg transition-colors self-start"
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
                        className="group relative overflow-hidden border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl md:rounded-2xl p-4 md:p-6 text-center transition-all duration-300 hover:bg-indigo-50/50 active:scale-95"
                      >
                        <div className="relative z-10">
                          <div className="mx-auto w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Upload className="w-4 h-4 md:w-6 md:h-6 text-indigo-600 group-hover:animate-bounce" />
                          </div>
                          <p className="font-semibold text-gray-900 text-sm md:text-base">
                            Upload Photo
                          </p>
                          <p className="text-xs md:text-sm text-gray-500 mt-1">
                            Click to select file
                          </p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 p-3 md:p-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-xl md:rounded-2xl animate-fade-in">
                      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden border-2 border-white shadow-lg">
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
                            className="px-2 py-1 md:px-3 md:py-1 text-xs md:text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                  className="pt-4 md:pt-6 border-t border-gray-200/50 animate-slide-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="flex items-start mb-4 md:mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        <Shield className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                      </div>
                    </div>
                    <div className="ml-3 md:ml-4">
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                        Identity Verification
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        Upload clear images of your Aadhaar Card or PAN Card
                        (both sides)
                      </p>
                    </div>
                  </div>

                  {/* ID Upload Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                    {/* Front Side */}
                    <div
                      className={`transition-all duration-300 ${
                        shakeErrors.IdDocumentFront ? "animate-shake" : ""
                      }`}
                    >
                      <div className="flex items-center mb-2 md:mb-3">
                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mr-2 animate-pulse"></div>
                        <label className="font-semibold text-gray-900 text-sm md:text-base">
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

                      <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl md:rounded-2xl p-3 md:p-5 h-full border border-amber-100">
                        {!formData.IdDocumentFront ? (
                          <div className="text-center h-full flex flex-col justify-center min-h-[180px] md:min-h-[200px]">
                            <FileImage className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 md:mb-3 opacity-50" />
                            <p className="font-semibold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">
                              Front Side Required
                            </p>
                            <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
                              Front side of ID document
                            </p>
                            <button
                              type="button"
                              onClick={() => triggerFileInput("idFront")}
                              className="inline-flex items-center cursor-pointer justify-center px-3 py-2 md:px-4 md:py-3 bg-gradient-to-r from-blue-500 to-sky-500 text-white font-medium rounded-lg md:rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg text-xs md:text-sm"
                            >
                              <Upload className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              Upload Front
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col h-full min-h-[180px] md:min-h-[200px]">
                            <div className="flex-grow">
                              <div className="mb-3 md:mb-4 flex justify-center">
                                <div className="w-24 h-24 md:w-36 md:h-36 rounded-lg md:rounded-xl overflow-hidden border-2 border-white shadow-lg">
                                  <img
                                    src={previews.idFrontImagePreview}
                                    alt="ID Front"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center">
                                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-1 md:mr-2 animate-scale" />
                                  <p className="font-semibold text-gray-900 text-sm md:text-base">
                                    Front Side Uploaded
                                  </p>
                                </div>
                                <p className="text-xs md:text-sm text-gray-600 mt-1">
                                  Ready for verification
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-amber-200">
                              <button
                                type="button"
                                onClick={() => triggerFileInput("idFront")}
                                className="flex-1 cursor-pointer px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-white transition-colors"
                              >
                                Replace
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage("IdDocumentFront")}
                                className="flex-1 cursor-pointer px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      {errors.IdDocumentFront && (
                        <p className="text-red-500 text-xs md:text-sm mt-2 animate-fade-in flex items-center gap-1">
                          <AlertCircle className="w-2 h-2 md:w-3 md:h-3" />
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
                      <div className="flex items-center mb-2 md:mb-3">
                        <div
                          className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mr-2 animate-pulse"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <label className="font-semibold text-gray-900 text-sm md:text-base">
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

                      <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl md:rounded-2xl p-3 md:p-5 h-full border border-amber-100">
                        {!formData.IdDocumentBack ? (
                          <div className="text-center h-full flex flex-col justify-center min-h-[180px] md:min-h-[200px]">
                            <FileImage className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 md:mb-3 opacity-50" />
                            <p className="font-semibold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">
                              Back Side Required
                            </p>
                            <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
                              Back side of ID document
                            </p>
                            <button
                              type="button"
                              onClick={() => triggerFileInput("idBack")}
                              className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-3 bg-gradient-to-r from-blue-500 to-sky-500 text-white font-medium rounded-lg md:rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg text-xs md:text-sm"
                            >
                              <Upload className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              Upload Back
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col h-full min-h-[180px] md:min-h-[200px]">
                            <div className="flex-grow">
                              <div className="mb-3 md:mb-4 flex justify-center">
                                <div className="w-24 h-24 md:w-36 md:h-36 rounded-lg md:rounded-xl overflow-hidden border-2 border-white shadow-lg">
                                  <img
                                    src={previews.idBackImagePreview}
                                    alt="ID Back"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center">
                                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-1 md:mr-2 animate-scale" />
                                  <p className="font-semibold text-gray-900 text-sm md:text-base">
                                    Back Side Uploaded
                                  </p>
                                </div>
                                <p className="text-xs md:text-sm text-gray-600 mt-1">
                                  Ready for verification
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-amber-200">
                              <button
                                type="button"
                                onClick={() => triggerFileInput("idBack")}
                                className="flex-1 cursor-pointer px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-white transition-colors"
                              >
                                Replace
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage("IdDocumentBack")}
                                className="flex-1 cursor-pointer px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      {errors.IdDocumentBack && (
                        <p className="text-red-500 text-xs md:text-sm mt-2 animate-fade-in flex items-center gap-1">
                          <AlertCircle className="w-2 h-2 md:w-3 md:h-3" />
                          {errors.IdDocumentBack}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Section */}
                <div
                  className="pt-4 md:pt-6 border-t border-gray-200/50 animate-slide-up"
                  style={{ animationDelay: "0.3s" }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                        Ready to Join?
                      </h4>
                      <p className="text-xs md:text-sm text-gray-600">
                        Submit your entry for the lucky draw
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                      <Shield className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Your data is secure and encrypted</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 md:py-4 px-4 md:px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl md:rounded-2xl transition-all duration-500 transform ${
                      isSubmitting
                        ? "opacity-90 cursor-wait"
                        : "hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
                    } shadow-lg relative overflow-hidden group`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700"></div>
                        <div className="relative flex items-center justify-center gap-2 md:gap-3">
                          <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                          <span className="text-sm md:text-base">
                            Processing Registration...
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center gap-2 md:gap-3">
                          <Trophy className="w-4 h-4 md:w-5 md:h-5 group-hover:animate-bounce" />
                          <span className="text-sm md:text-base">
                            Complete Registration & Enter Draw
                          </span>
                          <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </>
                    )}
                  </button>

                  <div className="mt-3 md:mt-4 text-center">
                    <p className="text-gray-600 text-xs md:text-sm">
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
          <div className="h-4 md:h-8"></div>
        </div>
      </div>
      {/* Success Popup Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop - Centered content with blur */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={closeSuccessPopup}
          ></div>

          {/* Popup Content */}
          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-up border border-white/20">
            {/* Decorative top gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"></div>

            <div className="relative p-8 md:p-10 flex flex-col items-center text-center">
              {/* Animated Success Icon Area */}
              <div className="mb-6 relative">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                {/* Decorative Sparkles around icon */}
                <Sparkles className="absolute -top-2 -right-2 text-yellow-500 w-6 h-6 animate-pulse" />
              </div>

              {/* Text Content with refined alignment */}
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Registration <br /> Successful!
                </h2>

                <div className="space-y-2 px-2">
                  <p className="text-gray-600 font-medium text-sm md:text-base leading-relaxed">
                    Congratulations! You've been entered into the lucky draw.
                  </p>
                  <p className="text-gray-400 text-xs md:text-sm italic">
                    Winners will be notified via email and phone.
                  </p>
                </div>
              </div>

              {/* Action Button for better layout closure */}
              <button
                onClick={closeSuccessPopup}
                className="mt-8 w-full py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
              >
                Got it!
              </button>
            </div>

            {/* Background Decorative Blur Blobs */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-200/30 rounded-full blur-2xl -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-2xl -z-10"></div>
          </div>
        </div>
      )}

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
        
        @keyframes scale-up {
          from { 
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
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
          50% { transform: translateY(-10px); }
        }
        
        @keyframes confetti {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
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
        
        .animate-scale-up {
          animation: scale-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
        
        .animate-confetti {
          animation: confetti linear forwards;
        }
        
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          input, select, button {
            font-size: 16px !important; /* Prevents iOS zoom on focus */
          }
          
          .animate-slide-up {
            animation: slide-up 0.4s ease-out;
          }
          
          .animate-scale-up {
            animation: scale-up 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
        }
        
        @media (min-width: 768px) {
          .grid-cols-1 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
          
          .md\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </>
  );
};

export default RegistrationFormLuckydraw;
