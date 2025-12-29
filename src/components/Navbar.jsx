import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  Menu,
  X,
  LogOut,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  User,
  Settings,
  UserCircle,
} from "lucide-react";
import Login from "../pages/Auth/Login";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/Logo.png";
import axios from "axios";

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    type: "login",
  });
  const [userDropdown, setUserDropdown] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const location = useLocation();
  const navigate = useNavigate();

  const openLogin = () => setAuthModal({ isOpen: true, type: "login" });
  const closeAuth = () => setAuthModal({ isOpen: false, type: "login" });
  const toggleUserDropdown = () => setUserDropdown(!userDropdown);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setMobileDropdown(null);
  };

  const toggleMobileDropdown = (dropdownName) => {
    setMobileDropdown(mobileDropdown === dropdownName ? null : dropdownName);
  };

  const storedUser = localStorage.getItem("userProfile");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;

  const userName = parsedUser?.name || "";
  const userEmail = parsedUser?.email || "";
  const adminId = parsedUser?.adminId || null;
  const isLoggedIn = !!localStorage.getItem("jwt");

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("jwt");
      await axios.post(
        "https://api.regeve.in/admin/logout",
        {},
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
      localStorage.removeItem("jwt");
      localStorage.removeItem("userProfile");
      setUserDropdown(false);
      navigate("/");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Gallery", path: "/eventgallery" },
    {
      name: "Services",
      dropdown: true,
      items: [
        { name: "Event Registration", path: "/service/registration" },
        { name: "Lucky Draw System", path: "/service/luckydraw-system-page" },
        { name: "Food Management", path: "/service/food-management" },
        { name: "Event Dashboard", path: "/service/dashboard-system-page" },
        { name: "Election Management", path: "/electionManagementplatform" },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  // Animation variants
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

  const dropdownVariants = {
    closed: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hover: {
      y: -2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-3 cursor-pointer flex-shrink-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.02 }}
            >
              <img src={Logo} alt="Regeve Logo" className="w-20 h-15" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-800 tracking-tight">
                  REGEVE
                </span>
              </div>
            </motion.div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center justify-center flex-1 px-8">
              <div className="flex items-center space-x-3">
                {navItems.map((item, index) =>
                  item.dropdown ? (
                    <div
                      key={item.name}
                      className="relative "
                      onMouseEnter={() => setOpenDropdown(item.name)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <motion.button
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === item.name ? null : item.name
                          )
                        }
                        className={`flex items-center space-x-1 cursor-pointer px-4 py-2.5 rounded-md font-medium transition-all duration-200 ${
                          openDropdown === item.name
                            ? "text-blue-700 bg-blue-50"
                            : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                        }`}
                        variants={itemVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <span className="text-md">{item.name}</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform duration-200 ${
                            openDropdown === item.name
                              ? "rotate-180 text-blue-600"
                              : "text-gray-400"
                          }`}
                        />
                      </motion.button>

                      {/* Desktop Dropdown */}
                      <AnimatePresence>
                        {openDropdown === item.name && (
                          <motion.div
                            className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-md overflow-hidden"
                            variants={dropdownVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                          >
                            {item.items.map((sub, i) => (
                              <motion.button
                                key={sub.name}
                                onClick={() => {
                                  navigate(sub.path);
                                  setOpenDropdown(null);
                                }}
                                className="w-full text-left px-4 cursor-pointer py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150 border-b border-gray-100 last:border-b-0"
                                whileHover={{ x: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                {sub.name}
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <motion.div
                      key={item.name}
                      className="relative"
                      variants={itemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <button
                        onClick={() => navigate(item.path)}
                        className={`px-4 py-2.5 cursor-pointer rounded-md font-medium transition-all duration-200 text-md ${
                          isActive(item.path)
                            ? "text-blue-700 bg-blue-50"
                            : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                        }`}
                      >
                        {item.name}
                      </button>
                    </motion.div>
                  )
                )}

                {/* Dashboard link for logged in users */}
                {isLoggedIn && (
                  <motion.div
                    className="relative"
                    variants={itemVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <button
                      onClick={() => navigate(`/${adminId}/admindashboard`)}
                      className={`px-4 py-2.5 rounded-md cursor-pointer font-medium transition-all duration-200 text-md ${
                        isActive(`/${adminId}/admindashboard`)
                          ? "text-blue-700 bg-blue-50"
                          : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                      }`}
                    >
                      Dashboard
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Desktop Right Section - User/Auth */}
            <div className="hidden  lg:flex items-center space-x-4 flex-shrink-0">
              {isLoggedIn ? (
                <div className="relative">
                  <motion.button
                    onClick={toggleUserDropdown}
                    className="flex items-center cursor-pointer space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200"
                    variants={itemVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                      {userName ? (
                        <span className="text-white text-sm font-semibold">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm  font-medium text-gray-800">
                        {userName || "Admin"}
                      </span>
                     
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 cursor-pointer transition-transform duration-200 ${
                        userDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </motion.button>

                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {userDropdown && (
                      <motion.div
                        className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden"
                        variants={dropdownVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        onMouseLeave={() => setUserDropdown(false)}
                      >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                              {userName ? (
                                <span className="text-white  font-semibold">
                                  {userName.charAt(0).toUpperCase()}
                                </span>
                              ) : (
                                <User className="w-5 h-5  text-white" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold cursor-pointer text-gray-800">
                                {userName || "Admin User"}
                              </div>
                             
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          
                         
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center cursor-pointer space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-all duration-150"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <motion.button
                    onClick={openLogin}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
                    variants={itemVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-all duration-200"
              onClick={toggleMenu}
              variants={itemVariants}
              whileTap="tap"
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
                className="lg:hidden bg-white border-t border-gray-200 shadow-lg mt-1 rounded-b-lg overflow-hidden"
                initial="closed"
                animate="open"
                exit="closed"
                variants={menuVariants}
              >
                <div className="py-3 space-y-1">
                  {navItems.map((item, index) =>
                    item.dropdown ? (
                      <div key={item.name} className="space-y-1">
                        <motion.button
                          onClick={() => toggleMobileDropdown(item.name)}
                          className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-md transition-all duration-200 font-medium"
                          variants={itemVariants}
                          whileTap="tap"
                        >
                          <span>{item.name}</span>
                          {mobileDropdown === item.name ? (
                            <ChevronUp className="w-4 h-4 text-blue-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </motion.button>

                        {/* Mobile Dropdown Content */}
                        <AnimatePresence>
                          {mobileDropdown === item.name && (
                            <motion.div
                              className="ml-4 space-y-1 border-l-2 border-blue-200 pl-4 py-2"
                              variants={dropdownVariants}
                              initial="closed"
                              animate="open"
                              exit="closed"
                            >
                              {item.items.map((sub) => (
                                <motion.button
                                  key={sub.name}
                                  onClick={() => {
                                    navigate(sub.path);
                                    setIsMenuOpen(false);
                                    setMobileDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-all duration-200 text-sm"
                                  whileHover={{ x: 5 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {sub.name}
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <motion.button
                        key={item.name}
                        onClick={() => {
                          navigate(item.path);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-md transition-all duration-200 font-medium ${
                          isActive(item.path)
                            ? "text-blue-700 bg-blue-50"
                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                        variants={itemVariants}
                        whileTap="tap"
                      >
                        {item.name}
                      </motion.button>
                    )
                  )}

                  {/* Dashboard for mobile */}
                  {isLoggedIn && (
                    <motion.button
                      onClick={() => {
                        navigate(`/${adminId}/admindashboard`);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-md transition-all duration-200 font-medium ${
                        isActive(`/${adminId}/admindashboard`)
                          ? "text-blue-700 bg-blue-50"
                          : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                      variants={itemVariants}
                      whileTap="tap"
                    >
                      Dashboard
                    </motion.button>
                  )}

                  {/* Mobile Auth Section */}
                  <div className="pt-3 border-t border-gray-200 space-y-3">
                    {isLoggedIn ? (
                      <>
                        <div className="px-4 py-3 bg-gray-50 rounded-md border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                              {userName ? (
                                <span className="text-white font-semibold">
                                  {userName.charAt(0).toUpperCase()}
                                </span>
                              ) : (
                                <User className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">
                                {userName || "Admin"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <motion.button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white text-red-600 hover:bg-red-50 border border-red-200 rounded-md font-medium transition-all duration-200"
                          variants={itemVariants}
                          whileTap="tap"
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
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-md font-medium shadow-sm"
                        variants={itemVariants}
                        whileTap="tap"
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
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
          >
            <div
              className={`flex items-center space-x-3 px-6 py-3 rounded-md shadow-lg border ${
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
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
