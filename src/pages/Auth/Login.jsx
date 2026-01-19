import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import Img1 from "../../assets/Auth.jpg";
import { useNavigate } from "react-router-dom";

const Login = ({ onClose, onSwitchToRegister, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  // ------------------------
  // FORM VALIDATION
  // ------------------------
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    setApiError("");

    return Object.keys(newErrors).length === 0;
  };

  // ------------------------
  // SUBMIT HANDLER
  // ------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError("");

    try {
      const response = await fetch("https://api.regeve.in/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        // FIXED PAYLOAD (API requires lowercase fields)
        body: JSON.stringify({
          identifier: formData.email,
          password: formData.password,
        }),
      });
      console.log("EMAIL:", formData.email);
      console.log("PASSWORD:", formData.password);

      const data = await response.json();

      if (response.ok && data.jwt) {
        const adminId = data.adminId; // ✅ DEFINE IT HERE

        if (!adminId) {
          throw new Error("Admin ID missing from login response");
        }

        setSuccess(true);

        // 🔐 store auth
        localStorage.setItem("jwt", data.jwt);
        localStorage.setItem("adminId", adminId);

        localStorage.setItem(
          "userProfile",
          JSON.stringify({
            name: data.admin?.name || "",
            email: data.user?.email,
            userId: data.user?.id,
            adminId,
          })
        );

        setTimeout(() => {
          navigate(`/${adminId}/admindashboard`);
          onClose();
        }, 1500);
      } else {
        const errorMessage =
          data?.message ||
          data?.error?.message ||
          data?.response ||
          "Login failed. Please try again.";

        setApiError(errorMessage);
      }
    } catch (err) {
      console.error("Login Error:", err);
      setApiError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------
  // ON CHANGE HANDLER
  // ------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiError) setApiError("");
  };

  // ------------------------
  // SUCCESS ANIMATION
  // ------------------------
  const SuccessAnimation = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 space-y-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
      >
        <CheckCircle className="w-12 h-12 text-green-600" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold text-gray-800"
      >
        Login Successful!
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-gray-600 text-center"
      >
        Welcome back! Redirecting...
      </motion.p>
    </motion.div>
  );

  // ------------------------
  // MAIN RETURN
  // ------------------------
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Image */}
          <div className="hidden md:block md:w-1/2 relative">
            <img src={Img1} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Right Content */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-blue-600">Welcome Back</h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-2 cursor-pointer  rounded-lg"
              >
                <X className="w-5 h-5 hover:bg-red-800  hover:bg-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {success ? (
                <SuccessAnimation />
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* API Error */}
                  {apiError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-100 text-red-700 p-3 rounded-lg"
                    >
                      {apiError}
                    </motion.div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full px-4 py-3 border rounded-lg ${
                        errors.email
                          ? "border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`w-full px-4 py-3 border rounded-lg pr-12 ${
                          errors.password
                            ? "border-red-500"
                            : "border-gray-300 focus:border-blue-500"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full cursor-pointer bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </button>

                  {/* Switch */}
                  <div className="text-center pt-2">
                    <p className="text-gray-600">
                      Don't have an account? Please Contact Management
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
