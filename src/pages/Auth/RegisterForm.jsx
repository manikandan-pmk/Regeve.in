import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    email: "",
    dob: "",
    gender: "",
    occupation: "",
    phoneNumber: "",
    idCard: "",
    password: "",
    confirmPassword: "",
  });

  const [selectedServices, setSelectedServices] = useState({
    foodManagement: false,
    electionSystem: false,
    luckydraw: false,
    dashboard: false,
    digitalRegistration: false,
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Payment related states
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [uploadError, setUploadError] = useState("");

  const handleServiceChange = (service) => {
    setSelectedServices((prev) => ({
      ...prev,
      [service]: !prev[service],
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company Name is required";
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = "Company Name must be at least 2 characters";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.dob) {
      newErrors.dob = "Date of Birth is required";
    } else {
      const dob = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) {
        newErrors.dob = "Must be at least 18 years old";
      }
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.occupation.trim()) {
      newErrors.occupation = "Occupation is required";
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone Number is required";
    } else if (!/^\d{10,15}$/.test(formData.phoneNumber.replace(/\D/g, ""))) {
      newErrors.phoneNumber = "Phone Number must be 10-15 digits";
    }

    if (!formData.idCard.trim()) {
      newErrors.idCard = "ID Card is required";
    } else if (formData.idCard.trim().length < 5) {
      newErrors.idCard = "ID Card must be at least 5 characters";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase and number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!isOtpVerified) {
      newErrors.otp = "Please verify your email address";
    }

    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    const selectedCount =
      Object.values(selectedServices).filter(Boolean).length;
    if (selectedCount === 0) {
      newErrors.services = "Please select at least one service";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "email" && (isOtpSent || isOtpVerified)) {
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setOtp("");
      setOtpError("");
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const newErrors = validateStep1();
    setErrors((prev) => ({
      ...prev,
      [name]: newErrors[name],
    }));
  };

  const sendOtp = async () => {
    if (!formData.email || errors.email) {
      setOtpError("Please enter a valid email address first");
      return;
    }

    setIsSendingOtp(true);
    setOtpError("");

    try {
      const requestData = { Email: formData.email };
      await axios.post(
        "https://api.regeve.in/api/admin/requestOtp",
        requestData,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      setIsOtpSent(true);
      setOtpError("OTP sent successfully! Check your email.");
      setTimeout(() => setOtpError(""), 3000);
    } catch (error) {
      console.error("Error sending OTP:", error);
      if (error.response) {
        const serverMessage =
          error.response.data?.error?.message ||
          error.response.data?.message ||
          "Failed to send OTP. Please try again.";
        setOtpError(`Server Error: ${serverMessage}`);
      } else if (error.request) {
        setOtpError("No response from server. Please check your connection.");
      } else {
        setOtpError(`Error: ${error.message}`);
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      setOtpError("Please enter the OTP");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      const requestData = {
        Email: formData.email,
        Email_Otp: otp.trim(),
      };

      await axios.post(
        "https://api.regeve.in/api/admin/verifyOtp",
        requestData,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      setIsOtpVerified(true);
      setOtpError("");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      if (error.response) {
        const serverMessage =
          error.response.data?.error?.message ||
          error.response.data?.message ||
          "Invalid OTP. Please try again.";
        setOtpError(`Verification Failed: ${serverMessage}`);
      } else if (error.request) {
        setOtpError("No response from server. Please check your connection.");
      } else {
        setOtpError(`Error: ${error.message}`);
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const uploadPaymentProof = async (file) => {
    const formData = new FormData();
    formData.append("files", file);

    const res = await axios.post("https://api.regeve.in/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data[0]; // uploaded file object
  };

  const submitToAPI = async (proofId) => {
    // 1. Add proofId parameter
    const apiData = {
      Company_Name: formData.companyName.trim(),
      Name: formData.name.trim(),
      Email: formData.email.trim().toLowerCase(),
      DOB: formData.dob,
      Gender:
        formData.gender === "other"
          ? "Others"
          : formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1),
      Occupation: formData.occupation.trim(),
      Phone_Number: Number(formData.phoneNumber.replace(/\D/g, "")),
      ID_Card: formData.idCard.trim(),
      Password: formData.password,
      Email_Verify: true,
      Approved_Admin: false,
      Payment_Status: "pending",
      // 2. Add the payment proof ID here
      Payment_Proof: proofId,
      Services: {
        "Digital Registration": selectedServices.digitalRegistration,
        "Food Management": selectedServices.foodManagement,
        "Election System": selectedServices.electionSystem,
        "Lucky Draw": selectedServices.luckydraw,
        Dashboard: selectedServices.dashboard,
      },
    };

    try {
      // ... rest of the function remains the same
      const response = await axios.post(
        "https://api.regeve.in/api/admin/create",
        { data: apiData },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 15000,
        }
      );
      return response.data;
    } catch (error) {
      // ... error handling remains the same
      console.error("Error submitting form:", error);
      // ...
      throw new Error(errorMessage); // Ensure you keep the throw logic
    }
  };

  const fetchPaymentDetails = async () => {
    try {
      const response = await axios.get(
        "https://api.regeve.in/api/payment-admins?populate=*"
      );

      if (response.data.data && response.data.data.length > 0) {
        const paymentData = response.data.data[0];
        setPaymentData({
          upiId: paymentData.Upi_Id,
          qrCode: paymentData.QRcode?.[0]?.url
            ? `https://api.regeve.in${paymentData.QRcode[0].url}`
            : null,
        });
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
      // Set default payment data if API fails
      setPaymentData({
        upiId: "dreamzmediaevents@okicici",
        qrCode: null,
      });
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      const newErrors = validateStep1();
      setErrors(newErrors);

      if (Object.keys(newErrors).length === 0) {
        const allTouched = {};
        Object.keys(formData).forEach((key) => {
          allTouched[key] = true;
        });
        setTouched(allTouched);
        setCurrentStep(2);
      } else {
        const allTouched = {};
        Object.keys(formData).forEach((key) => {
          allTouched[key] = true;
        });
        setTouched(allTouched);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep === 2) {
      const newErrors = validateStep2();
      setErrors(newErrors);

      if (Object.keys(newErrors).length === 0) {
        // REMOVED: setIsSubmitting(true);
        // REMOVED: await submitToAPI(); <-- Don't create account yet!

        try {
          // Keep fetching payment details so QR code shows up in next step
          await fetchPaymentDetails();

          // Move to payment step
          setCurrentStep(3);
          setShowPayment(true);
        } catch (error) {
          console.error("Error preparing payment:", error);
          alert("Could not load payment details. Please try again.");
        }
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingProof(true);
    setUploadError("");

    try {
      // 1️⃣ Upload file to Strapi
      const uploadedFile = await uploadPaymentProof(file);

      // 2️⃣ Save to state
      setPaymentProof(uploadedFile);
      setPaymentStatus("uploaded");
    } catch (err) {
      console.error(err);
      setUploadError("Payment proof upload failed");
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handlePaymentComplete = async () => {
    if (!paymentProof) {
      alert("Please upload payment proof");
      return;
    }

    setIsSubmitting(true); // Start loading state

    try {
      // 1. Call submitToAPI with the uploaded file's ID
      await submitToAPI(paymentProof.id);

      // 2. Show Success Popup on successful API response
      setShowSuccess(true);
      
      setTimeout(() => {
        navigate("/");
      }, 4000);

    } catch (error) {
      alert(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false); // Stop loading state
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
          <div className="relative bg-gradient-to-b from-white to-gray-50 rounded-xl p-8 max-w-md mx-4 shadow-2xl border border-gray-200 transform transition-all duration-500">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
            </div>
            <div className="pt-8 text-center">
              <h3 className="text-2xl font-serif font-bold text-gray-800 mb-3">
                Registration Complete!
              </h3>
              <p className="text-gray-600 mb-6">
                Your admin account has been created. Payment verification is
                pending.
              </p>
              <div className="space-y-3 text-left max-w-xs mx-auto">
                <div className="flex items-center space-x-3 text-sm text-gray-500 animate-fade-in-up">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Account created successfully</span>
                </div>
                <div
                  className="flex items-center space-x-3 text-sm text-gray-500 animate-fade-in-up"
                  style={{ animationDelay: "0.1s" }}
                >
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Payment proof uploaded</span>
                </div>
                <div
                  className="flex items-center space-x-3 text-sm text-gray-500 animate-fade-in-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Verification in progress</span>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full animate-progress"></div>
                </div>
                <p className="text-sm text-gray-500 mt-3 animate-pulse">
                  Redirecting to login page...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold border-4 border-white shadow-lg transition-all duration-300 ${
                    currentStep >= step
                      ? "bg-gradient-to-r from-blue-600 to-blue-800"
                      : "bg-gray-300"
                  }`}
                >
                  {step}
                </div>
                <div className="text-center mt-3">
                  <div
                    className={`text-sm font-medium tracking-wide ${
                      currentStep >= step ? "text-blue-800" : "text-gray-500"
                    }`}
                  >
                    {step === 1
                      ? "Admin Details"
                      : step === 2
                        ? "Services"
                        : "Payment"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Form Header */}
          <div className="border-b border-gray-200 bg-white">
            <div className="px-8 py-10">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                    <span>Setup Wizard</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span className="font-medium text-blue-600">
                      {currentStep === 1
                        ? "Admin Registration"
                        : currentStep === 2
                          ? "Service Selection"
                          : "Payment"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        {currentStep === 1
                          ? "Register as Administrator"
                          : currentStep === 2
                            ? "Select Your Services"
                            : "Complete Payment"}
                      </h1>
                      <p className="text-gray-600 text-lg">
                        {currentStep === 1
                          ? "Provide your details to create an administrator account"
                          : currentStep === 2
                            ? "Choose the services you want to enable for your organization"
                            : "Make payment to activate your account"}
                      </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="hidden lg:block">
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">
                          Progress
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500"
                              style={{
                                width:
                                  currentStep === 1
                                    ? "33%"
                                    : currentStep === 2
                                      ? "66%"
                                      : "100%",
                              }}
                            ></div>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {currentStep === 1
                              ? "1/3"
                              : currentStep === 2
                                ? "2/3"
                                : "3/3"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Step 1: Admin Details */}
            {currentStep === 1 && (
              <>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleNextStep();
                  }}
                  className="space-y-8"
                >
                  {/* Form Grid - Same as before */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Company Name */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="companyName"
                          className="block text-sm font-semibold text-gray-800"
                        >
                          Company Name
                        </label>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`pl-10 w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                            touched.companyName && errors.companyName
                              ? "border-red-400 bg-red-50/50"
                              : "border-gray-300 hover:border-gray-400 focus:shadow-lg"
                          }`}
                          placeholder="Enter your company name"
                        />
                      </div>
                      {touched.companyName && errors.companyName && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{errors.companyName}</span>
                        </div>
                      )}
                    </div>

                    {/* Full Name */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="name"
                          className="block text-sm font-semibold text-gray-800"
                        >
                          Full Name
                        </label>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`pl-10 w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                            touched.name && errors.name
                              ? "border-red-400 bg-red-50/50"
                              : "border-gray-300 hover:border-gray-400 focus:shadow-lg"
                          }`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {touched.name && errors.name && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{errors.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Email with OTP */}
                    <div className="lg:col-span-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="email"
                          className="block text-sm font-semibold text-gray-800"
                        >
                          Email Address
                        </label>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative group flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`pl-10 w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                              touched.email && errors.email
                                ? "border-red-400 bg-red-50/50"
                                : isOtpVerified
                                  ? "border-green-500 bg-green-50/30"
                                  : "border-gray-300 hover:border-gray-400 focus:shadow-lg"
                            }`}
                            placeholder="name@company.com"
                            disabled={isOtpVerified}
                          />
                          {isOtpVerified && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-green-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={sendOtp}
                          disabled={
                            !formData.email ||
                            errors.email ||
                            isOtpVerified ||
                            isSendingOtp
                          }
                          className={`px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center justify-center space-x-2 ${
                            !formData.email ||
                            errors.email ||
                            isOtpVerified ||
                            isSendingOtp
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-blue-600 cursor-pointer to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          }`}
                        >
                          {isSendingOtp ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4 text-white"
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
                              <span>Sending...</span>
                            </>
                          ) : isOtpVerified ? (
                            <>
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>Verified</span>
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                              <span>Get OTP</span>
                            </>
                          )}
                        </button>
                      </div>

                      {touched.email && errors.email && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{errors.email}</span>
                        </div>
                      )}
                    </div>

                    {/* OTP Verification Section */}
                    {isOtpSent && !isOtpVerified && (
                      <div className="lg:col-span-2 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-semibold text-gray-800">
                            Email Verification
                          </label>
                          <span className="text-xs text-blue-600 font-medium">
                            Enter code sent to your email
                          </span>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative group flex-1">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                  className="w-5 h-5 text-blue-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  />
                                </svg>
                              </div>
                              <input
                                type="text"
                                value={otp}
                                onChange={(e) =>
                                  setOtp(
                                    e.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 6)
                                  )
                                }
                                className="pl-10 w-full px-4 py-3.5 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                                {otp.length}/6
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={verifyOtp}
                              disabled={otp.length !== 6 || isVerifyingOtp}
                              className={`px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                                otp.length !== 6 || isVerifyingOtp
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-gradient-to-r from-green-600 cursor-pointer to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                              }`}
                            >
                              {isVerifyingOtp ? (
                                <>
                                  <svg
                                    className="animate-spin h-4 w-4 text-white"
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
                                  <span>Verifying...</span>
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span >Verify OTP</span>
                                </>
                              )}
                            </button>
                          </div>

                          {otpError && (
                            <div
                              className={`mt-4 flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium ${
                                otpError.includes("successfully")
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}
                            >
                              {otpError.includes("successfully") ? (
                                <svg
                                  className="w-5 h-5 text-green-600 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-5 h-5 text-red-600 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                              <span>{otpError}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="dob"
                          className="block text-sm font-semibold text-gray-800"
                        >
                          Date of Birth
                        </label>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <input
                          type="date"
                          id="dob"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`pl-10 w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                            touched.dob && errors.dob
                              ? "border-red-400 bg-red-50/50"
                              : "border-gray-300 hover:border-gray-400 focus:shadow-lg"
                          }`}
                        />
                      </div>
                      {touched.dob && errors.dob && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{errors.dob}</span>
                        </div>
                      )}
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="gender"
                          className="block text-sm font-semibold text-gray-800"
                        >
                          Gender
                        </label>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 0h-5m0 0V8m0 4h5"
                            />
                          </svg>
                        </div>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`pl-10 w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none ${
                            touched.gender && errors.gender
                              ? "border-red-400 bg-red-50/50"
                              : "border-gray-300 hover:border-gray-400 focus:shadow-lg"
                          }`}
                        >
                          <option value="" className="text-gray-400">
                            Select your gender
                          </option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Prefer not to say</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                      {touched.gender && errors.gender && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{errors.gender}</span>
                        </div>
                      )}
                    </div>

                    {/* Occupation */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="occupation"
                          className="block text-sm font-semibold text-gray-800"
                        >
                          Occupation
                        </label>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="occupation"
                          name="occupation"
                          value={formData.occupation}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`pl-10 w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                            touched.occupation && errors.occupation
                              ? "border-red-400 bg-red-50/50"
                              : "border-gray-300 hover:border-gray-400 focus:shadow-lg"
                          }`}
                          placeholder="e.g., Software Engineer"
                        />
                      </div>
                      {touched.occupation && errors.occupation && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{errors.occupation}</span>
                        </div>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="phoneNumber"
                          className="block text-sm font-semibold text-gray-800"
                        >
                          Phone Number
                        </label>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`pl-10 w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                            touched.phoneNumber && errors.phoneNumber
                              ? "border-red-400 bg-red-50/50"
                              : "border-gray-300 hover:border-gray-400 focus:shadow-lg"
                          }`}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      {touched.phoneNumber && errors.phoneNumber && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{errors.phoneNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* ID Card */}
                    <div className="lg:col-span-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="idCard"
                          className="block text-sm font-semibold text-gray-800"
                        >
                          ID Card Number
                        </label>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="idCard"
                          name="idCard"
                          value={formData.idCard}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`pl-10 w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                            touched.idCard && errors.idCard
                              ? "border-red-400 bg-red-50/50"
                              : "border-gray-300 hover:border-gray-400 focus:shadow-lg"
                          }`}
                          placeholder="Enter your ID card number"
                        />
                      </div>
                      {touched.idCard && errors.idCard && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{errors.idCard}</span>
                        </div>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="password"
                          className="block text-sm font-semibold text-gray-800"
                        >
                          Password
                        </label>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`pl-10 pr-12 w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                            touched.password && errors.password
                              ? "border-red-400 bg-red-50/50"
                              : "border-gray-300 hover:border-gray-400 focus:shadow-lg"
                          }`}
                          placeholder="Create a strong password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showPassword ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {touched.password && errors.password && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{errors.password}</span>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-semibold text-gray-800"
                        >
                          Confirm Password
                        </label>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`pl-10 pr-12 w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                            touched.confirmPassword && errors.confirmPassword
                              ? "border-red-400 bg-red-50/50"
                              : formData.password ===
                                    formData.confirmPassword &&
                                  formData.confirmPassword
                                ? "border-green-400 bg-green-50/30"
                                : "border-gray-300 hover:border-gray-400 focus:shadow-lg"
                          }`}
                          placeholder="Confirm your password"
                        />
                        {formData.password === formData.confirmPassword &&
                          formData.confirmPassword && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-green-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className={`absolute inset-y-0 right-0 ${
                            formData.password === formData.confirmPassword &&
                            formData.confirmPassword
                              ? "pr-10"
                              : "pr-3"
                          } flex items-center text-gray-500 hover:text-gray-700 transition-colors`}
                        >
                          {showConfirmPassword ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {touched.confirmPassword && errors.confirmPassword && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{errors.confirmPassword}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Next Button */}
                  <div className="pt-8 border-t border-gray-200 mt-10">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        All fields marked with{" "}
                        <span className="text-red-500">*</span> are required
                      </div>
                      <button
                        type="submit"
                        className="group cursor-pointer px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-3"
                      >
                        <span>Continue to Services</span>
                        <svg
                          className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}

            {/* Step 2: Service Selection */}
            {currentStep === 2 && (
              <>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Service Selection
                  </h3>
                  <p className="text-gray-600">
                    Choose the services you need for your organization
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Service Cards - Same as before */}
                    {[
                      {
                        id: "digitalRegistration",
                        name: "Digital Registration",
                        description:
                          "Online form submissions and e-registration",
                        icon: "📝",
                        borderColor: "border-blue-500",
                        checkColor: "text-blue-500",
                        bgColor: "bg-blue-50",
                        hoverBorder: "hover:border-blue-300",
                      },
                      {
                        id: "foodManagement",
                        name: "Food Management",
                        description: "Manage menus, orders, and operations",
                        icon: "🍽️",
                        borderColor: "border-green-500",
                        checkColor: "text-green-500",
                        bgColor: "bg-green-50",
                        hoverBorder: "hover:border-green-300",
                      },
                      {
                        id: "electionSystem",
                        name: "Election System",
                        description: "Conduct polls and voting processes",
                        icon: "🗳️",
                        borderColor: "border-purple-500",
                        checkColor: "text-purple-500",
                        bgColor: "bg-purple-50",
                        hoverBorder: "hover:border-purple-300",
                      },
                      {
                        id: "luckydraw",
                        name: "Lucky Draw",
                        description: "Create raffles and prize distributions",
                        icon: "🎁",
                        borderColor: "border-pink-500",
                        checkColor: "text-pink-500",
                        bgColor: "bg-pink-50",
                        hoverBorder: "hover:border-pink-300",
                      },
                      {
                        id: "dashboard",
                        name: "Dashboard",
                        description: "Analytics and data visualization",
                        icon: "📊",
                        borderColor: "border-orange-500",
                        checkColor: "text-orange-500",
                        bgColor: "bg-orange-50",
                        hoverBorder: "hover:border-orange-300",
                      },
                    ].map((service) => (
                      <div
                        key={service.id}
                        className={`relative group cursor-pointer transition-all duration-300`}
                        onClick={() => handleServiceChange(service.id)}
                      >
                        <div
                          className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                            selectedServices[service.id]
                              ? "scale-[1.02] shadow-lg"
                              : "scale-100 shadow-sm hover:shadow-md"
                          }`}
                        >
                          <div
                            className={`relative p-6 bg-white border-2 transition-all duration-300 ${
                              selectedServices[service.id]
                                ? `${service.borderColor} ${service.bgColor}`
                                : `border-gray-200 group-hover:border-gray-300`
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div
                                  className={`relative w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all duration-300 ${
                                    selectedServices[service.id]
                                      ? `${service.bgColor} ${service.checkColor}`
                                      : "bg-gray-50 text-gray-600 group-hover:bg-gray-100"
                                  }`}
                                >
                                  <span>{service.icon}</span>
                                </div>
                                <div className="flex-1">
                                  <h4
                                    className={`font-medium transition-colors duration-300 ${
                                      selectedServices[service.id]
                                        ? "text-gray-900"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {service.name}
                                  </h4>
                                  <p
                                    className={`text-sm transition-colors duration-300 ${
                                      selectedServices[service.id]
                                        ? "text-gray-700"
                                        : "text-gray-600"
                                    } mt-1`}
                                  >
                                    {service.description}
                                  </p>
                                </div>
                              </div>
                              <div className="relative">
                                <div
                                  className={`relative w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                                    selectedServices[service.id]
                                      ? `${service.borderColor} bg-white`
                                      : "border-gray-300 bg-white group-hover:border-gray-400"
                                  }`}
                                >
                                  <svg
                                    className={`w-3 h-3 transition-all duration-300 ${
                                      selectedServices[service.id]
                                        ? "opacity-100 scale-100"
                                        : "opacity-0 scale-50"
                                    } ${service.checkColor}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    strokeWidth="3"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                                {selectedServices[service.id] && (
                                  <div
                                    className={`absolute -inset-1 rounded border ${service.borderColor.replace("500", "200")} animate-pulse`}
                                    style={{ animationDelay: "100ms" }}
                                  />
                                )}
                              </div>
                            </div>
                            <div
                              className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 ${
                                selectedServices[service.id]
                                  ? `${service.bgColor.replace("50", "400")}`
                                  : "bg-transparent"
                              }`}
                            />
                          </div>
                          <div
                            className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                              selectedServices[service.id]
                                ? `opacity-5 ${service.bgColor.replace("50", "100")}`
                                : "opacity-0 group-hover:opacity-5 group-hover:bg-gray-100"
                            }`}
                          />
                        </div>
                        {selectedServices[service.id] && (
                          <div
                            className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${service.borderColor} bg-white border shadow-sm`}
                          >
                            <svg
                              className={`w-3 h-3 ${service.checkColor}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                              strokeWidth="3"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Selected Services Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <h4 className="font-semibold text-gray-800 mb-4">
                      Selected Services
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedServices).map(
                        ([key, value]) =>
                          value && (
                            <span
                              key={key}
                              className="px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm text-blue-700 font-medium flex items-center space-x-2 shadow-sm"
                            >
                              <span>✓</span>
                              <span>
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                            </span>
                          )
                      )}
                      {Object.values(selectedServices).filter(Boolean)
                        .length === 0 && (
                        <div className="text-gray-500 text-sm italic">
                          No services selected yet
                        </div>
                      )}
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      Total selected:{" "}
                      <span className="font-semibold">
                        {Object.values(selectedServices).filter(Boolean).length}{" "}
                        of 5 services
                      </span>
                    </div>
                  </div>

                  {errors.services && (
                    <div className="text-red-500 text-sm flex items-center space-x-2 bg-red-50 p-3 rounded-lg border border-red-200">
                      <span>⚠️</span>
                      <span>{errors.services}</span>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-8 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="px-6 cursor-pointer py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 font-medium flex items-center space-x-2"
                    >
                      <span>←</span>
                      <span>Back to Details</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-8 py-3 rounded-lg text-white font-medium transition duration-200 flex items-center space-x-2 ${
                        isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r cursor-pointer from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow hover:shadow-md"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
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
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Proceed to Payment</span>
                          <span>→</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <>
                <div className="space-y-8">
                  {/* Account Created Success */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Account Created Successfully!
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Your registration is complete. Please complete payment
                          to activate your account.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">
                      Payment Information
                    </h4>

                    <div className="space-y-6">
                      {/* QR Code Display */}
                      {paymentData?.qrCode && (
                        <div className="text-center">
                          <div className="mb-3">
                            <span className="text-sm text-gray-500">
                              Scan QR Code to Pay
                            </span>
                          </div>
                          <div className="inline-block p-4 bg-white border-2 border-gray-100 rounded-lg">
                            <img
                              src={paymentData.qrCode}
                              alt="QR Code"
                              className="w-48 h-48 object-contain"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentElement.innerHTML = `
                                  <div class="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                                    <span class="text-gray-400">QR Code not available</span>
                                  </div>
                                `;
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* UPI ID */}
                      <div className="text-center">
                        <div className="mb-2">
                          <span className="text-sm text-gray-500">
                            UPI ID for Payment
                          </span>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-center space-x-3">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            <span className="text-lg font-mono font-bold text-gray-800">
                              {paymentData?.upiId ||
                                "dreamzmediaevents@okicici"}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  paymentData?.upiId ||
                                    "dreamzmediaevents@okicici"
                                );
                                alert("UPI ID copied to clipboard!");
                              }}
                              className="text-blue-600 cursor-pointer hover:text-blue-800 text-sm font-medium"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Upload Payment Proof */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Upload Payment Proof
                          </label>
                          <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                              isUploadingProof
                                ? "border-blue-300 bg-blue-50"
                                : uploadError
                                  ? "border-red-300 bg-red-50"
                                  : paymentProof
                                    ? "border-green-300 bg-green-50"
                                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="file"
                              id="paymentProof"
                              accept="image/*,.pdf"
                              onChange={handleFileUpload}
                              disabled={
                                isUploadingProof || paymentStatus === "uploaded"
                              }
                              className="hidden"
                            />
                            <label
                              htmlFor="paymentProof"
                              className="cursor-pointer"
                            >
                              {isUploadingProof ? (
                                <div className="space-y-3">
                                  <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg
                                      className="animate-spin h-6 w-6 text-blue-600"
                                      xmlns="http://www.w3.org/2000/svg"
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
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                  </div>
                                  <p className="text-blue-600 font-medium">
                                    Uploading...
                                  </p>
                                </div>
                              ) : paymentProof ? (
                                <div className="space-y-3">
                                  <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                    <svg
                                      className="h-6 w-6 text-green-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-green-600 font-medium">
                                      Uploaded Successfully!
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {paymentProof.name}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg
                                      className="h-6 w-6 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                      />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-700">
                                      Click to upload payment proof
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      Screenshot or PDF of transaction (Max 5MB)
                                    </p>
                                  </div>
                                </div>
                              )}
                            </label>
                          </div>
                          {uploadError && (
                            <div className="text-red-500 text-sm mt-2 flex items-center space-x-2 bg-red-50 p-3 rounded-lg">
                              <span>⚠️</span>
                              <span>{uploadError}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-8 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="px-2 cursor-pointer py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 font-medium flex items-center space-x-2"
                    >
                      <span>←</span>
                      <span>Back to Services</span>
                    </button>

                    <div className="space-x-4">
                      <button
                        type="button"
                        onClick={handlePaymentComplete}
                        disabled={!paymentProof || paymentStatus !== "uploaded"}
                        className={`px-8 py-3 rounded-lg text-white font-medium transition duration-200 flex items-center space-x-2 ${
                          !paymentProof || paymentStatus !== "uploaded"
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow hover:shadow-md"
                        }`}
                      >
                        <span>Complete Registration</span>
                        <span>✓</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-progress {
          animation: progress 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
