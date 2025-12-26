import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
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

  // Service selection state
  const [selectedServices, setSelectedServices] = useState({
    foodManagement: false,
    electionSystem: false,
    luckydraw: false,
    dashboard: false,
    digitalRegistration: false,
  });

  const navigate = useNavigate()

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification States
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Handle service checkbox changes
  const handleServiceChange = (service) => {
    setSelectedServices((prev) => ({
      ...prev,
      [service]: !prev[service],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Company Name validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company Name is required";
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = "Company Name must be at least 2 characters";
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Date of Birth validation
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

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    // Occupation validation
    if (!formData.occupation.trim()) {
      newErrors.occupation = "Occupation is required";
    }

    // Phone Number validation
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone Number is required";
    } else if (!/^\d{10,15}$/.test(formData.phoneNumber.replace(/\D/g, ""))) {
      newErrors.phoneNumber = "Phone Number must be 10-15 digits";
    }

    // ID Card validation
    if (!formData.idCard.trim()) {
      newErrors.idCard = "ID Card is required";
    } else if (formData.idCard.trim().length < 5) {
      newErrors.idCard = "ID Card must be at least 5 characters";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase and number";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Service selection validation
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

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Reset OTP verification if email changes
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

    // Validate specific field
    const newErrors = validateForm();
    setErrors((prev) => ({
      ...prev,
      [name]: newErrors[name],
    }));
  };

  // Send OTP API call using Axios
  const sendOtp = async () => {
    if (!formData.email || errors.email) {
      setOtpError("Please enter a valid email address first");
      return;
    }

    setIsSendingOtp(true);
    setOtpError("");

    try {
      const requestData = {
        Email: formData.email,
      };

      console.log("Sending OTP request with data:", requestData);

      const response = await axios.post(
        "https://api.regeve.in/api/admin/requestOtp",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("OTP Sent Success:", response.data);
      setIsOtpSent(true);
      setOtpError("");

      // Show success message
      setOtpError("OTP sent successfully! Check your email.");
      setTimeout(() => setOtpError(""), 3000);
    } catch (error) {
      console.error("Error sending OTP:", error);

      if (error.response) {
        console.error("OTP Error Response:", error.response.data);
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

  // Verify OTP API call using Axios
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

      console.log("Verifying OTP with data:", requestData);

      const response = await axios.post(
        "https://api.regeve.in/api/admin/verifyOtp",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("OTP Verified Success:", response.data);
      setIsOtpVerified(true);
      setOtpError("");
    } catch (error) {
      console.error("Error verifying OTP:", error);

      if (error.response) {
        console.error("OTP Verification Error Response:", error.response.data);
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

  // Submit form with selected services
  const submitToAPI = async (data) => {
    const apiData = {
      Company_Name: data.companyName.trim(),
      Name: data.name.trim(),
      Email: data.email.trim().toLowerCase(),
      DOB: data.dob,
      Gender:
        data.gender === "other"
          ? "Others"
          : data.gender.charAt(0).toUpperCase() + data.gender.slice(1),
      Occupation: data.occupation.trim(),
      Phone_Number: Number(data.phoneNumber.replace(/\D/g, "")),
      ID_Card: data.idCard.trim(),
      Password: data.password,
      Email_Verify: true,
      Approved_Admin: false,
      // Add selected services
      Services: {
        "Digital Registration": selectedServices.digitalRegistration,
        "Food Management": selectedServices.foodManagement,
        "Election System": selectedServices.electionSystem,
        "Lucky Draw": selectedServices.luckydraw,
        "Dashboard": selectedServices.dashboard,
      },
    };

    console.log("Submitting form data to API:", apiData);

    try {
      const response = await axios.post(
        "https://api.regeve.in/api/admin/create",
        {
          data: apiData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      console.log("API Response Success:", response.data);
      navigate("/")
      return response.data;
    } catch (error) {
      console.error("Error submitting form - Full Error:", error);
      console.error("Error response data:", error.response?.data);

      let errorMessage = "Registration failed. Please try again.";

      if (error.response) {
        if (error.response.data?.error?.details?.errors) {
          const validationErrors = error.response.data.error.details.errors;
          errorMessage =
            "Validation errors: " +
            Object.values(validationErrors)
              .map((err) => err.message)
              .join(", ");
        } else if (error.response.data?.error?.message) {
          errorMessage = error.response.data.error.message;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please check the data and try again.";
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = `Error: ${error.message}`;
      }

      throw new Error(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if email is verified
    if (!isOtpVerified) {
      setOtpError("Please verify your email address before submitting");
      return;
    }

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      setOtpError("");

      try {
        const result = await submitToAPI(formData);
        console.log("Final API Response:", result);

        // Show success popup
        setShowSuccess(true);

        // Reset form after successful submission
        setFormData({
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
        setSelectedServices({
          foodManagement: false,
          electionSystem: false,
          luckydraw: false,
          dashboard: false,
        });
        setIsOtpSent(false);
        setIsOtpVerified(false);
        setOtp("");

        // Hide success popup after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      } catch (error) {
        console.error("Submission error:", error);
        alert(error.message || "Registration failed. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Mark all fields as touched to show errors
      const allTouched = {};
      Object.keys(formData).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const errorClass = "text-red-500 text-sm mt-1";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 transform transition-all duration-500 scale-100 animate-bounce-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
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
              <h3 className="text-2xl font-bold text-gray-900 mb-2 animate-pulse">
                Registration Successful!
              </h3>
              <p className="text-gray-600 mb-4">
                Admin account has been created successfully. Please wait for
                approval.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p
                  className="animate-fade-in-up"
                  style={{ animationDelay: "0.1s" }}
                >
                  ✓ Account created successfully
                </p>
                <p
                  className="animate-fade-in-up"
                  style={{ animationDelay: "0.3s" }}
                >
                  ✓ Details submitted for verification
                </p>
                <p
                  className="animate-fade-in-up"
                  style={{ animationDelay: "0.5s" }}
                >
                  ✓ You will be notified via email
                </p>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Service Selection Panel */}
          <div className="lg:w-2/3">
            <div className="bg-white py-8 px-6 shadow rounded-lg h-full">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  Admin Registration
                </h2>
                <p className="mt-2 text-gray-600">Create a new admin account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Name */}
                <div>
                  <label htmlFor="companyName" className={labelClass}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${inputClass} ${
                      touched.companyName && errors.companyName
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Enter your company name"
                  />
                  {touched.companyName && errors.companyName && (
                    <div className={errorClass}>{errors.companyName}</div>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${inputClass} ${
                      touched.name && errors.name ? "border-red-500" : ""
                    }`}
                    placeholder="Enter your full name"
                  />
                  {touched.name && errors.name && (
                    <div className={errorClass}>{errors.name}</div>
                  )}
                </div>

                {/* Email with OTP Verification */}
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email Address *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${inputClass} flex-1 ${
                        touched.email && errors.email ? "border-red-500" : ""
                      }`}
                      placeholder="Enter your email"
                      disabled={isOtpVerified}
                    />
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={
                        !formData.email ||
                        errors.email ||
                        isOtpVerified ||
                        isSendingOtp
                      }
                      className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${
                        !formData.email ||
                        errors.email ||
                        isOtpVerified ||
                        isSendingOtp
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isSendingOtp
                        ? "Sending..."
                        : isOtpVerified
                        ? "Verified ✓"
                        : "Get OTP"}
                    </button>
                  </div>
                  {touched.email && errors.email && (
                    <div className={errorClass}>{errors.email}</div>
                  )}
                </div>

                {/* OTP Verification Section */}
                {isOtpSent && !isOtpVerified && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <label htmlFor="otp" className={labelClass}>
                      Enter OTP *
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className={`${inputClass} flex-1`}
                        placeholder="Enter OTP sent to your email"
                        maxLength={6}
                      />
                      <button
                        type="button"
                        onClick={verifyOtp}
                        disabled={!otp.trim() || isVerifyingOtp}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${
                          !otp.trim() || isVerifyingOtp
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                      </button>
                    </div>
                    {otpError && (
                      <div
                        className={`text-sm mt-2 ${
                          otpError.includes("successfully")
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {otpError}
                      </div>
                    )}
                    <p className="text-sm text-blue-600 mt-2">
                      We've sent a verification code to your email address.
                    </p>
                  </div>
                )}

                {/* OTP Verified Success */}
                {isOtpVerified && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 text-green-700">
                      <svg
                        className="w-5 h-5"
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
                      <span className="font-medium">
                        Email verified successfully!
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="dob" className={labelClass}>
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${inputClass} ${
                        touched.dob && errors.dob ? "border-red-500" : ""
                      }`}
                    />
                    {touched.dob && errors.dob && (
                      <div className={errorClass}>{errors.dob}</div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="gender" className={labelClass}>
                      Gender *
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${inputClass} ${
                        touched.gender && errors.gender ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {touched.gender && errors.gender && (
                      <div className={errorClass}>{errors.gender}</div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="occupation" className={labelClass}>
                    Occupation *
                  </label>
                  <input
                    type="text"
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${inputClass} ${
                      touched.occupation && errors.occupation
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Enter your occupation"
                  />
                  {touched.occupation && errors.occupation && (
                    <div className={errorClass}>{errors.occupation}</div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phoneNumber" className={labelClass}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${inputClass} ${
                        touched.phoneNumber && errors.phoneNumber
                          ? "border-red-500"
                          : ""
                      }`}
                      placeholder="Enter phone number"
                      maxLength={10}
                    />
                    {touched.phoneNumber && errors.phoneNumber && (
                      <div className={errorClass}>{errors.phoneNumber}</div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="idCard" className={labelClass}>
                      ID Card Number *
                    </label>
                    <input
                      type="text"
                      id="idCard"
                      name="idCard"
                      value={formData.idCard}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${inputClass} ${
                        touched.idCard && errors.idCard ? "border-red-500" : ""
                      }`}
                      placeholder="Enter ID card number"
                    />
                    {touched.idCard && errors.idCard && (
                      <div className={errorClass}>{errors.idCard}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label htmlFor="password" className={labelClass}>
                      Password *
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${inputClass} ${
                        touched.password && errors.password
                          ? "border-red-500"
                          : ""
                      }`}
                      placeholder="Enter password"
                    />
                    <span
                      className="absolute right-3 top-10 cursor-pointer text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "👁️‍🗨️" : "👁️"}
                    </span>
                    {touched.password && errors.password && (
                      <div className={errorClass}>{errors.password}</div>
                    )}
                  </div>

                  <div className="relative">
                    <label htmlFor="confirmPassword" className={labelClass}>
                      Confirm Password *
                    </label>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${inputClass} ${
                        touched.confirmPassword && errors.confirmPassword
                          ? "border-red-500"
                          : ""
                      }`}
                      placeholder="Confirm your password"
                    />
                    <span
                      className="absolute right-3 top-10 cursor-pointer text-gray-600"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
                    </span>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <div className={errorClass}>{errors.confirmPassword}</div>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !isOtpVerified}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-200 ${
                      isSubmitting || !isOtpVerified
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        Submitting...
                      </div>
                    ) : (
                      "Register Admin"
                    )}
                  </button>
                  {!isOtpVerified && (
                    <div className="text-orange-500 text-sm mt-2 text-center">
                      Please verify your email address before submitting
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="lg:w-1/3">
            <div className="bg-white py-8 px-6 shadow rounded-lg h-full">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Choose Services
                </h2>
                <p className="mt-2 text-gray-600">
                  Select the services you want to use
                </p>
              </div>

              <div className="space-y-4">
                {/* Digital Registration */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition duration-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="digitalRegistration"
                      checked={selectedServices.digitalRegistration}
                      onChange={() =>
                        handleServiceChange("digitalRegistration")
                      }
                      className="h-6 w-6 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="digitalRegistration"
                      className="ml-3 flex items-center"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600 text-xl">📝</span>
                      </div>
                      <div>
                        <span className="block font-medium text-gray-900">
                          Digital Registration
                        </span>
                        <span className="block text-sm text-gray-500">
                          Online form submissions, digital applications, and
                          e-registration
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Food Management Service */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition duration-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="foodManagement"
                      checked={selectedServices.foodManagement}
                      onChange={() => handleServiceChange("foodManagement")}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="foodManagement"
                      className="ml-3 flex items-center"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-green-600 text-xl">🍽️</span>
                      </div>
                      <div>
                        <span className="block font-medium text-gray-900">
                          Food Management
                        </span>
                        <span className="block text-sm text-gray-500">
                          Manage menus, orders, and restaurant operations
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Election System Service */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition duration-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="electionSystem"
                      checked={selectedServices.electionSystem}
                      onChange={() => handleServiceChange("electionSystem")}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="electionSystem"
                      className="ml-3 flex items-center"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600 text-xl">🗳️</span>
                      </div>
                      <div>
                        <span className="block font-medium text-gray-900">
                          Election System
                        </span>
                        <span className="block text-sm text-gray-500">
                          Conduct polls, surveys, and voting processes
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Lucky Draw Service */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition duration-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="luckydraw"
                      checked={selectedServices.luckydraw}
                      onChange={() => handleServiceChange("luckydraw")}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="luckydraw"
                      className="ml-3 flex items-center"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-purple-600 text-xl">🎁</span>
                      </div>
                      <div>
                        <span className="block font-medium text-gray-900">
                          Lucky Draw
                        </span>
                        <span className="block text-sm text-gray-500">
                          Create raffles, contests, and prize distributions
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Dashboard Service */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition duration-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="dashboard"
                      checked={selectedServices.dashboard}
                      onChange={() => handleServiceChange("dashboard")}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="dashboard"
                      className="ml-3 flex items-center"
                    >
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-orange-600 text-xl">📊</span>
                      </div>
                      <div>
                        <span className="block font-medium text-gray-900">
                          Dashboard
                        </span>
                        <span className="block text-sm text-gray-500">
                          Analytics, reports, and data visualization tools
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Service Summary */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Selected Services
                  </h3>
                  <div className="space-y-1">
                    {Object.entries(selectedServices).map(
                      ([key, value]) =>
                        value && (
                          <div key={key} className="flex items-center text-sm">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            <span className="capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                          </div>
                        )
                    )}
                    {Object.values(selectedServices).filter(Boolean).length ===
                      0 && (
                      <p className="text-gray-500 text-sm italic">
                        No services selected
                      </p>
                    )}
                  </div>
                </div>

                {errors.services && (
                  <div className="text-red-500 text-sm mt-2">
                    {errors.services}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes fade-in-up {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
}
