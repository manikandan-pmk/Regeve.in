import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LogIn,
  Menu,
  X,
  LogOut,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Login from "../pages/Auth/Login";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";
import axios from "axios";

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    type: "login", // 'login' or 'register'
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success", // 'success' or 'error'
  });

  const openLogin = () => setAuthModal({ isOpen: true, type: "login" });
  const closeAuth = () => setAuthModal({ isOpen: false, type: "login" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    // Auto hide after 3 seconds
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigate = useNavigate();

  const storedUser = localStorage.getItem("userProfile");
  const userName = storedUser ? JSON.parse(storedUser).name : "";

  const isLoggedIn = !!localStorage.getItem("userToken");

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("userToken");

      await axios.post(
        "http://localhost:1337/admin/logout",
        {}, // backend usually doesn’t need email
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast("Logged out successfully!", "success");
    } catch (error) {
      console.error("Logout error:", error);
      showToast("Logout failed on server, but logging out locally.", "error");
    } finally {
      // ALWAYS log out user locally
      localStorage.removeItem("userToken");
      localStorage.removeItem("userProfile");

      // Update UI instantly
      navigate("/");

      // Reload to reset protected components if needed
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
    {
      name: "Our Services",
      dropdown: true,
      items: [
        { name: "Event Registration", path: "/service/registration" },
        { name: "Lucky Draw System", path: "/service/luckydraw-system-page" },
        { name: "Food Management", path: "/service/food-management" },
        { name: "Event Dashboard", path: "/service/dashboard-system-page" },
        {name: "Election Management", path: "/electionManagementplatform"},
      ],
    },
    ...(isLoggedIn ? [{ name: "Dashboard", path: "/dashboard" }] : []),
  ];

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const itemVariants = {
    closed: {
      opacity: 0,
      y: -20,
    },
    open: {
      opacity: 1,
      y: 0,
    },
  };

  const toastVariants = {
    hidden: {
      opacity: 0,
      y: -100,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      y: -100,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-2 cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => navigate("/")}
            >
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <img src={Logo} alt="Regeve Logo" className="w-20 h-15" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    REGEVE
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item, index) =>
                item.dropdown ? (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === item.name ? null : item.name
                        )
                      }
                      className="flex items-center space-x-1 cursor-pointer text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-blue-50"
                    >
                      <span>{item.name}</span>
                    </button>

                    {/* DROPDOWN */}
                    <div
                      className={`absolute left-0 mt-2  w-56 bg-white border border-gray-200 shadow-lg rounded-lg transition-all duration-200 ${
                        openDropdown === item.name
                          ? "opacity-100 visible"
                          : "opacity-0 invisible"
                      }`}
                    >
                      {item.items.map((sub, i) => (
                        <button
                          key={sub.name}
                          onClick={() => {
                            navigate(sub.path);
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-4 cursor-pointer py-2 text-gray-700 hover:bg-blue-600 hover:text-white transition-colors duration-150 rounded-lg"
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <motion.button
                    key={item.name}
                    onClick={() => navigate(item.path)}
                    className="relative flex items-center space-x-1 cursor-pointer text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium group px-3 py-2 rounded-lg hover:bg-blue-50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <span>{item.name}</span>
                  </motion.button>
                )
              )}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <motion.div
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {/* USER GREETING */}
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-lg border border-blue-100">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {userName}
                    </span>
                  </div>

                  {/* LOGOUT BUTTON */}
                  <motion.button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-sm"
                    whileHover={{
                      scale: 1.05,
                      shadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </motion.button>
                </motion.div>
              ) : (
                <motion.button
                  onClick={openLogin}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-medium shadow-sm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{
                    scale: 1.05,
                    shadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:text-white transition-all duration-200"
              onClick={toggleMenu}
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg"
                initial="closed"
                animate="open"
                exit="closed"
                variants={menuVariants}
              >
                <div className="py-4 space-y-3">
                  {navItems.map((item, index) =>
                    item.dropdown ? (
                      <div key={item.name} className="px-4">
                        <div className="text-gray-700 font-semibold mb-2">
                          {item.name}
                        </div>

                        {item.items.map((sub) => (
                          <button
                            key={sub.name}
                            onClick={() => {
                              navigate(sub.path);
                              setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center px-4 py-2 text-gray-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-200 mb-1"
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <motion.button
                        key={item.name}
                        onClick={() => {
                          navigate(item.path);
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:text-white rounded-lg transition-all duration-200 font-medium text-left mx-2"
                        variants={itemVariants}
                        transition={{ delay: index * 0.1 }}
                      >
                        <span>{item.name}</span>
                      </motion.button>
                    )
                  )}

                  <div className="border-t border-gray-200 pt-4 px-4 space-y-3">
                    {isLoggedIn ? (
                      <>
                        <motion.div
                          className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100 mx-2"
                          variants={itemVariants}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-800 font-medium">
                              {userName}
                            </span>
                          </div>
                        </motion.div>
                        <motion.button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium mx-2"
                          variants={itemVariants}
                          transition={{ delay: 0.4 }}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        onClick={() => {
                          openLogin();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-medium mx-2"
                        variants={itemVariants}
                        transition={{ delay: 0.3 }}
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Login</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg shadow-lg border ${
                toast.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modals */}
      <AnimatePresence>
        {authModal.isOpen && authModal.type === "login" && (
          <Login
            onClose={closeAuth}
            onLoginSuccess={() => {
              closeAuth();
              // The page will refresh due to localStorage change
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
