import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaIdCard,
  FaBirthdayCake,
  FaUsers,
  FaTimes,
  FaBuilding,
} from "react-icons/fa";

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

            w-full
            max-w-[90vw]
            max-h-[90vh]
            h-auto

            p-6
            overflow-hidden
          "
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-slate-900/90 hover:bg-red-600 transition p-2 rounded-xl shadow-xl"
          >
            <FaTimes className="text-lg" />
          </button>

          {/* HEADER */}
          <div className="flex flex-col items-center gap-3 mt-3">

            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-blue-500 overflow-hidden shadow-lg bg-black">
              {userData.image ? (
                <img src={userData.image} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full bg-blue-600">
                  <FaUser className="text-white text-3xl" />
                </div>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-wide text-center">
              {userData.name}
            </h2>

            <span className="bg-blue-600/80 px-3 py-1 rounded-full text-xs font-mono">
              ID: {luckyNumber}
            </span>
          </div>

          {/* DIVIDER */}
          <div className="w-full h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 my-4" />

          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* COMPANY */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 text-sm">
              <h3 className="text-blue-400 font-semibold flex items-center gap-2 text-base">
                <FaBuilding /> Company
              </h3>
              <p className="mt-2">
                <span className="font-medium text-white">ID: </span>
                {userData.companyId}
              </p>
            </div>

            {/* CONTACT */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 text-sm">
              <h3 className="text-blue-400 font-semibold flex items-center gap-2 text-base">
                <FaPhone /> Contact
              </h3>
              <p className="mt-2 flex items-center gap-2">
                <FaPhone className="text-green-500" /> {userData.phone}
              </p>
              <p className="flex items-center gap-2">
                <FaWhatsapp className="text-green-400" /> {userData.whatsapp}
              </p>
              <p className="flex items-center gap-2 break-all">
                <FaEnvelope className="text-blue-400" /> {userData.email}
              </p>
            </div>

            {/* PERSONAL */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 text-sm">
              <h3 className="text-blue-400 font-semibold flex items-center gap-2 text-base">
                <FaIdCard /> Personal
              </h3>
              <p className="mt-2">
                <FaBirthdayCake className="inline text-orange-400" /> Age: {userData.age}
              </p>
              <p>
                <FaUsers className="inline text-teal-400" /> Family: {userData.familyMembers}
              </p>
              <p>
                <FaUser className="inline text-purple-400" /> Gender: {userData.gender}
              </p>
            </div>


            {/* ADDRESS */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 text-sm lg:col-span-2">
              <h3 className="text-blue-400 font-semibold flex items-center gap-2 text-base">
                <FaMapMarkerAlt /> Address
              </h3>
              <p className="mt-2">{userData.address}</p>
            </div>
          </div>

          {/* FOOTER */}
          <p className="text-center text-slate-400 text-xs mt-5">
            Member Profile • {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfilePopup;
