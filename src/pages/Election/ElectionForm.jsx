import React, { useState } from "react";
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
  Link,
  Briefcase,
  Building2,
  MapPin,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const ElectionForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    organization: "",
    department: "",
    position: "",
    agreesToTerms: false, // Initial state for checkbox
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    if (!formData.age) newErrors.age = "Age is required";
    else if (parseInt(formData.age) < 18)
      newErrors.age = "Must be 18+ years old";

    if (!formData.organization.trim())
      newErrors.organization = "Organization is required";

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

  const handleCopyLink = () => {
    const link = `${window.location.origin}/election-invite/${Date.now()}`;
    navigator.clipboard.writeText(link);
    toast.success("Invitation link copied!");
  };

  const shareOptions = [
    {
      platform: "WhatsApp",
      color: "hover:bg-green-50 hover:text-green-600",
      icon: <MessageSquare className="w-5 h-5" />,
      onClick: () => {
        const text = `Join our corporate election! Register at: ${window.location.origin}/election-invite`;
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text)}`,
          "_blank"
        );
      },
      tooltip: "Share via WhatsApp",
    },
    {
      platform: "Email",
      color: "hover:bg-blue-50 hover:text-blue-600",
      icon: <Mail className="w-5 h-5" />,
      onClick: () => {
        const subject = "Join Our Corporate Election";
        const body = `You're invited to participate!\n\nRegister here: ${window.location.origin}/election-invite`;
        window.location.href = `mailto:?subject=${encodeURIComponent(
          subject
        )}&body=${encodeURIComponent(body)}`;
      },
      tooltip: "Share via Email",
    },
    {
      platform: "Copy Link",
      color: "hover:bg-gray-50 hover:text-gray-700",
      icon: <Link className="w-5 h-5" />,
      onClick: handleCopyLink,
      tooltip: "Copy invitation link",
    },
  ];

  const InputField = ({
    label,
    name,
    type = "text",
    icon: Icon,
    placeholder,
    required = false,
    maxLength = 255, // Default max length
  }) => (
    <div className="space-y-2">
      <label className="flex items-center justify-between text-sm font-medium text-gray-700">
        <span className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>
        {/* Character Counter for text inputs */}
        {type === "text" && (
          <span className="text-xs text-gray-400">
            {formData[name]?.length || 0}/{maxLength}
          </span>
        )}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength} // Prevents unlimited text
        className={`w-full px-4 py-3 rounded-xl border-2 ${
          errors[name]
            ? "border-red-300 focus:border-red-500"
            : "border-gray-300 focus:border-blue-500"
        } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all duration-200 bg-white`}
      />
      {errors[name] && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4" />
          {errors[name]}
        </motion.p>
      )}
    </div>
  );

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
              setFormData((prev) => ({
                ...prev,
                fullName: "",
                email: "",
                phone: "",
              })); // Reset basics
            }}
            className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:opacity-90"
          >
            Register Another
          </button>
        </motion.div>
      </div>
    );
  }
  const handleWhatsAppShare = () => {
    const message = `Here is my election form details:\n\nName: ${formData.name}\nPhone: ${formData.phone}\nAge: ${formData.age}`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Main Form View
  return (
    // Added pt-24 to fix navbar overlap
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4 pt-24 pb-12">
      <Toaster position="top-right" />

      {/* Centered Container: Removed Grid, added max-w-2xl mx-auto */}
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
                    placeholder="John Doe"
                    required
                    maxLength={50}
                  />
                </div>
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  icon={Mail}
                  placeholder="john@example.com"
                  required
                />
                <InputField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  icon={Phone}
                  placeholder="+1 (555) 123-4567"
                  required
                  maxLength={15}
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
                  />
                </div>
              </div>
            </div>

            {/* Organization Details */}
            <div className="bg-gray-50 p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Organization Details
              </h3>

              <InputField
                label="Organization/School"
                name="organization"
                icon={Building2}
                placeholder="ABC Corporation"
                required
                maxLength={80} // Limit long text
              />

              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="Department"
                  name="department"
                  icon={MapPin}
                  placeholder="Marketing"
                  maxLength={50}
                />
                <InputField
                  label="Position"
                  name="position"
                  icon={Briefcase}
                  placeholder="Manager"
                  maxLength={50}
                />
              </div>
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
                className=" ml-0 sm:ml-40 w-full sm:w-60 py-4  bg-blue-600  text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300  disabled:opacity-50 disabled:cursor-not-allowed  flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5  " />
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
