import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  LogIn,
  Menu,
  X
} from 'lucide-react';
import Login from '../pages/Auth/Login';
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    type: 'login' // 'login' or 'register'
  });

  const openLogin = () => setAuthModal({ isOpen: true, type: 'login' });
  const closeAuth = () => setAuthModal({ isOpen: false, type: 'login' });

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

const navItems = [
  { name: 'Home', path: "/" },
  { name: 'About Us', path: "/about" },
  { name: 'Contact', path: "/contact" },
  ...(isLoggedIn ? [{ name: 'Dashboard', path: "/dashboard" }] : [])
];



  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const itemVariants = {
    closed: {
      opacity: 0,
      y: -20
    },
    open: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-40">
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
                {/* Logo with gradient text */}
                <div className="flex items-center space-x-2">
                  <img
                    src={Logo}
                    alt="Regeve Logo"
                    className="w-20 h-15"
                  />
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    REGEVE
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className="relative flex items-center space-x-1 cursor-pointer text-gray-700 hover:text-blue-600  transition-colors duration-200 font-medium group"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <span>{item.name}</span>
                  
                </motion.button>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {!isLoggedIn &&( 
                <motion.button
                onClick={openLogin}
                className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 hover:text-white transition-all duration-200"
              onClick={toggleMenu}
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                className="md:hidden bg-white border-t border-gray-200"
                initial="closed"
                animate="open"
                exit="closed"
                variants={menuVariants}
              >
                <div className="py-4 space-y-4">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.name}
                      onClick={() => {
                        navigate(item.path);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white rounded-lg transition-all duration-200 font-medium text-left"
                      variants={itemVariants}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span>{item.name}</span>
                    </motion.button>
                  ))}

                  <div className="border-t border-gray-200 pt-4 px-4 space-y-3">
                    <motion.button
                      onClick={() => {
                        openLogin();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:text-white hover:border-transparent transition-all duration-200 font-medium"
                      variants={itemVariants}
                      transition={{ delay: 0.3 }}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </motion.button>
                   
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Auth Modals */}
      <AnimatePresence>
        {authModal.isOpen && authModal.type === 'login' && (
          <Login
            onClose={closeAuth}
           
          />
        )}
       
      </AnimatePresence>
    </>
  );
};

export default Navbar;