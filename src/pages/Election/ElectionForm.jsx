 import React, { useState, memo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Share2,
  MessageSquare,
  Copy,
  Send,
  AlertCircle,
  Briefcase,
  Camera,
  Upload,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

// Move InputField component outside to prevent recreation on every render
const InputField = memo(
  ({
    label,
    name,
    type = "text",
    icon: Icon,
    placeholder,
    required = false,
    maxLength = 255,
    value,
    onChange,
    error,
  }) => (
    <div className="space-y-2">
      <label className="flex items-center justify-between text-sm font-medium text-gray-700">
        <span className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>

        {type === "text" && (
          <span className="text-xs text-gray-400">
            {value?.length || 0}/{maxLength}
          </span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-4 py-3 rounded-xl border-2 ${
          error
            ? "border-red-300 focus:border-red-500"
            : "border-gray-300 focus:border-blue-500"
        } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all duration-200 bg-white`}
      />

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </div>
  )
);

InputField.displayName = "InputField";

const ElectionForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    whatsapp_number: "",
    gender: "",
    age: "",
    position: "",
    experience: "",
    profilePhoto: null,
    agreesToTerms: false,
  });

  const [profilePreview, setProfilePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Clean up object URL when component unmounts or photo changes
  useEffect(() => {
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.whatsapp_number.trim())
      newErrors.whatsapp_number = "whatsapp number is required";
    else if (!/^\d{10}$/.test(formData.whatsapp_number))
      newErrors.whatsapp_number = "WhatsApp number must be exactly 10 digits";

    if (!formData.gender.trim()) newErrors.gender = " gender is required ";

    if (!formData.experience.trim())
      newErrors.experience = " experience is required ";

    if (!formData.profilePhoto)
      newErrors.profilePhoto = "Profile photo is required";

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone number must be exactly 10 digits";

    if (!formData.age) newErrors.age = "Age is required";
    else if (parseInt(formData.age) < 18)
      newErrors.age = "Must be 18+ years old";

    if (!formData.agreesToTerms)
      newErrors.agreesToTerms = "You must agree to the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Registration successful! Invitation sent.");
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Clean up previous object URL if exists
    if (profilePreview) {
      URL.revokeObjectURL(profilePreview);
    }

    // Create new object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setProfilePreview(objectUrl);
    
    setFormData((prev) => ({ ...prev, profilePhoto: file }));
    
    // Clear error if exists
    if (errors.profilePhoto) {
      setErrors((prev) => ({ ...prev, profilePhoto: "" }));
    }
    
    toast.success("Profile photo uploaded!");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please drop an image file");
        return;
      }

      // Clean up previous object URL if exists
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }

      const objectUrl = URL.createObjectURL(file);
      setProfilePreview(objectUrl);
      setFormData((prev) => ({ ...prev, profilePhoto: file }));
      
      if (errors.profilePhoto) {
        setErrors((prev) => ({ ...prev, profilePhoto: "" }));
      }
      
      toast.success("Profile photo uploaded!");
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/election-invite/${Date.now()}`;
    navigator.clipboard.writeText(link);
    toast.success("Invitation link copied!");
  };

  // Fixed WhatsApp share function - now only shares the invitation link
  const handleWhatsAppShare = () => {
    const text = `Join our corporate election! Register at: ${window.location.origin}/election-invite`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Success View
  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Toaster position="top-right" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Registration Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Your election invitation has been sent.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                fullName: "",
                email: "",
                phone: "",
                whatsapp_number: "",
                gender: "",
                age: "",
                position: "",
                experience: "",
                profilePhoto: null,
                agreesToTerms: false,
              });
              if (profilePreview) {
                URL.revokeObjectURL(profilePreview);
                setProfilePreview(null);
              }
            }}
            className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:opacity-90"
          >
            Register Another
          </button>
        </motion.div>
      </div>
    );
  }

  // Main Form View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4 pt-24 pb-12">
      <Toaster position="top-right" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-2xl mx-auto w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Voter Registration
            </h1>
            <p className="text-gray-500">
              Enter your details to participate in the upcoming election
            </p>
          </div>

          {/* Profile Photo Section - Compact and Centered */}
          <div className="mb-10">
            <div className="flex flex-col items-center">
              {/* Compact Profile Photo Container */}
              <div className="w-40 h-40 relative mb-6">
                <div 
                  className={`w-full h-full rounded-full overflow-hidden ${
                    profilePreview ? '' : 'border-2 border-dashed border-blue-300 bg-blue-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {profilePreview ? (
                    <div className="relative group">
                      <img
                        src={profilePreview}
                        alt="Profile Preview"
                        className="w-full h-full object-cover rounded-full"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <User className="w-16 h-16 text-blue-400 mb-2" />
                      <p className="text-xs text-gray-500 text-center px-2">Upload Photo</p>
                    </div>
                  )}
                  
                  {/* Camera Button */}
                  <label htmlFor="profile-upload" className="absolute -bottom-2 -right-2">
                    <div className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:scale-110">
                      <Camera className="w-4 h-4" />
                    </div>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Compact Upload Info */}
              <div className="text-center space-y-3 max-w-xs">
                <div>
                  <label 
                    htmlFor="profile-upload" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg cursor-pointer transition-colors duration-200"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {profilePreview ? 'Change Photo' : 'Upload Photo'}
                    </span>
                  </label>
                </div>
                
                {formData.profilePhoto && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{formData.profilePhoto.name}</span>
                  </p>
                )}
                
                <p className="text-xs text-gray-400">
                  Drag & drop or click to upload • JPG, PNG • Max 5MB
                </p>
              </div>

              {errors.profilePhoto && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 max-w-xs"
                >
                  <p className="text-red-500 text-sm flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.profilePhoto}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <InputField
                    label="Full Name"
                    name="fullName"
                    icon={User}
                    placeholder="Enter your full name"
                    required
                    maxLength={50}
                    value={formData.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                  />
                </div>
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  icon={Mail}
                  placeholder="Enter your email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                />
                <InputField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  icon={Phone}
                  placeholder="+91 0000000000"
                  required
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                />
                <InputField
                  label="WhatsApp Number"
                  name="whatsapp_number"
                  type="tel"
                  icon={Phone}
                  placeholder="+91 0000000000"
                  required
                  maxLength={10}
                  value={formData.whatsapp_number}
                  onChange={handleChange}
                  error={errors.whatsapp_number}
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Age"
                    name="age"
                    type="number"
                    icon={Calendar}
                    placeholder="18"
                    required
                    maxLength={3}
                    value={formData.age}
                    onChange={handleChange}
                    error={errors.age}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>
                    Gender <span className="text-red-500">*</span>
                  </span>
                </label>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.gender
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all duration-200 bg-white`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>

                {errors.gender && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" /> {errors.gender}
                  </motion.p>
                )}
              </div>

              <InputField
                label="Experience"
                name="experience"
                type="text"
                icon={Briefcase}
                placeholder="2 years / Fresher"
                required
                maxLength={50}
                value={formData.experience}
                onChange={handleChange}
                error={errors.experience}
              />
            </div>

            {/* Terms and Share */}
            <div className="pt-2">
              {/* Share Buttons */}
              <div className="bg-gradient-to-r   from-gray-50 to-white rounded-xl border border-gray-200 p-4 md:p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-gray-200 flex-shrink-0">
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1  ">
                      <h4 className="font-medium text-gray-800 text-sm md:text-base">
                        Invite Participants
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Share registration with team
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col xs:flex-row gap-2 sm:gap-2">
                    <button
                      type="button"
                      onClick={handleWhatsAppShare}
                      className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors shadow-sm hover:shadow active:scale-[0.98] min-h-[44px] sm:min-h-0"
                      title="Share via WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium whitespace-nowrap cursor-pointer">
                        WhatsApp
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-lg bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 transition-colors active:scale-[0.98] min-h-[44px] sm:min-h-0"
                      title="Copy invitation link"
                    >
                      <Copy className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium whitespace-nowrap cursor-pointer">
                        Copy Link
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="ml-0 sm:ml-40 w-full sm:w-60 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Registration
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ElectionForm;