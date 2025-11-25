import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaBuilding, FaTimes, FaIdCard } from "react-icons/fa";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const popupVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 16 },
  },
  exit: { opacity: 0, scale: 0.85, y: 20, transition: { duration: 0.2 } },
};

const ProfilePopup = ({ isOpen, onClose, userData, luckyNumber }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          variants={popupVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="
            bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
            border border-slate-700/60 rounded-3xl shadow-2xl text-white relative
            w-full max-w-4xl
            overflow-hidden
          "
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 bg-slate-900/90 hover:bg-red-600 transition p-3 rounded-xl shadow-xl z-10"
          >
            <FaTimes className="text-xl" />
          </button>

          <div className="flex">
            {/* LEFT SIDE - Big Photo Frame */}
            <div className="w-2/5 bg-gradient-to-b from-blue-900/30 to-purple-900/30 p-8 flex items-center justify-center border-r border-slate-700/60">
              <div className="relative">
                {/* Big Profile Image Frame */}
                <div className="w-80 h-80 rounded-3xl border-4 border-white/30 shadow-2xl overflow-hidden relative">
                  {userData.image ? (
                    <img
                      src={userData.image}
                      alt={userData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-600 to-purple-600">
                      <FaUser className="text-white text-8xl" />
                    </div>
                  )}
                 
                  {/* Decorative Corner Elements */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-400/60 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-400/60 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-400/60 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-400/60 rounded-br-lg"></div>
                </div>
               
                {/* Floating ID Badge */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-full border-2 border-white/20 shadow-2xl">
                  <span className="text-white font-bold text-lg font-mono">
                    ID: {luckyNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - Name and Company ID */}
            <div className="w-3/5 p-12 flex flex-col justify-center">
              {/* Header */}
              <div className="mb-12">
                <h3 className="text-4xl font-bold text-white mb-4">Member Profile</h3>
                <div className="w-32 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>

              {/* User Information */}
              <div className="space-y-10">
                {/* Name Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600/20 p-3 rounded-2xl">
                      <FaUser className="text-blue-400 text-3xl" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-lg font-medium">Full Name</p>
                      <h2 className="text-5xl font-bold text-white mt-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                        {userData.name}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Company ID Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-600/20 p-3 rounded-2xl">
                      <FaBuilding className="text-purple-400 text-3xl" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-lg font-medium">Company Identification</p>
                      <div className="mt-3">
                        <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/60 backdrop-blur-sm">
                          <div className="flex items-center gap-4">
                            <FaIdCard className="text-cyan-400 text-2xl flex-shrink-0" />
                            <span className="text-2xl font-mono font-bold text-white">
                              {userData.companyId}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-3 bg-slate-800/40 rounded-2xl p-4 border border-slate-700/60 mt-8">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-semibold text-lg">Active Member</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfilePopup;