import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Gift,
  Utensils,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BarChart,
} from "lucide-react";
import Img1 from "../assets/hero_section/img1.jpg";
import Img2 from "../assets/hero_section/img2.jpg";
import Img3 from "../assets/hero_section/img3.jpg";
import Img4 from "../assets/election/vote333.jpg";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Register Participants",
      subtitle: "Seamless Event Registration",
      buttonText: "Start Registration",
      icon: Users,
      theme: "from-blue-600 to-cyan-600",
      bgImage: Img1,
      features: [
        "Instant Digital Passes",
        "Real-time Analytics",
        "Custom Forms",
        "Auto Reminders",
      ],
      path: "/event-form",
    },
    {
      id: 2,
      title: "Lucky Draw Spin",
      subtitle: "Interactive Prize Experience",
      buttonText: "Spin to Win",
      icon: Gift,
      theme: "from-purple-600 to-pink-600",
      bgImage: Img2,
      features: [
        "Live Spin Wheel",
        "Instant Winners",
        "Prize Management",
        "Audit Trail",
      ],
      path: "/luckydraw",
    },
    {
      id: 3,
      title: "Manage Food Counter",
      subtitle: "Smart Veg/Non-Veg Tracking",
      buttonText: "Manage Counters",
      icon: Utensils,
      theme: "from-green-600 to-emerald-600",
      bgImage: Img3,
      features: [
        "Real-time Tracking",
        "Dietary Preferences",
        "Consumption Analytics",
        "Waste Reduction",
      ],
      path: "/dashboard",
    },
    {
      id: 4,
      title: "Live Election Platform",
      subtitle: "real-time Election Management",
      buttonText: "Start Election",
      icon: BarChart,
      theme: "from-orange-600 to-red-600",
      bgImage: Img4,
      features: [
        "Secure Voting",
        "Real-time Results",
        "Candidate Management",
        "Voter Analytics",
      ],
      path: "/electionManagementplatform",
    },
  ];

  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("jwt") !== null;

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1.1,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180, opacity: 0 },
    visible: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 200, damping: 15, delay: 0.5 },
    },
  };

  const textVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const featureVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: { delay: i * 0.2 + 0.8, duration: 0.6, ease: "easeOut" },
    }),
  };

  const buttonVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 15, delay: 1.2 },
    },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => setCurrentSlide(index);

  const IconComponent = slides[currentSlide].icon;

  return (
    <section className="relative min-h-screen pt-20 pb-12 overflow-hidden bg-gray-900 flex items-center">
      {/* Background Slides */}
      <AnimatePresence mode="wait" custom={currentSlide}>
        <motion.div
          key={currentSlide}
          custom={currentSlide}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 },
            scale: { duration: 0.8 },
          }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slides[currentSlide].bgImage})` }}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].theme} opacity-80 mix-blend-multiply`}
          />
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center min-h-[75vh]">
            {/* LEFT CONTENT */}
            <motion.div
              className="text-white text-center lg:text-left"
              initial="hidden"
              animate="visible"
              key={currentSlide}
            >
              {slides[currentSlide].id === 4 && isLoggedIn && (
                <motion.div
                  className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Live Tracking
                </motion.div>
              )}
              {/* ICON */}
              <motion.div
                variants={iconVariants}
                className="mb-6 flex justify-center lg:justify-start"
              >
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-r ${slides[currentSlide].theme} flex items-center justify-center shadow-xl`}
                >
                  <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </motion.div>
              {/* TITLE */}
              <motion.h1
                variants={textVariants}
                className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-3 leading-tight"
              >
                {slides[currentSlide].title}
              </motion.h1>
              {/* SUBTITLE */}
              <motion.p
                variants={textVariants}
                className="text-lg sm:text-xl text-gray-200 mb-3 font-light"
              >
                {slides[currentSlide].subtitle}
              </motion.p>
              {/* DESCRIPTION */}
              {slides[currentSlide].description && (
                <motion.p
                  variants={textVariants}
                  className="text-base sm:text-lg text-gray-300 mb-6 leading-relaxed max-w-xl mx-auto lg:mx-0"
                >
                  {slides[currentSlide].description}
                </motion.p>
              )}

              {/* FEATURES */}
              <motion.div
                variants={textVariants}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-w-md mx-auto lg:mx-0"
              >
                {slides[currentSlide].features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    custom={index}
                    variants={featureVariants}
                    className="flex items-center justify-center lg:justify-start gap-2 text-gray-200"
                  >
                    <div
                      className={`w-2 h-2 rounded-full bg-gradient-to-r ${slides[currentSlide].theme}`}
                    />
                    <span className="text-sm sm:text-base">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
              {/* BUTTON */}
              {isLoggedIn && (
                <motion.button
                  variants={buttonVariants}
                  onClick={() => navigate(slides[currentSlide].path)}
                  whileHover="hover"
                  whileTap="tap"
                  className="group flex items-center justify-center gap-3 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-fit mx-auto lg:mx-0"
                >
                  <span>{slides[currentSlide].buttonText}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
              )}
            </motion.div>

            {/* RIGHT VISUAL */}
            <motion.div
              className="hidden lg:flex items-center justify-center"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <div className="relative">
                {/* Glow Background */}
                <motion.div
                  className={`w-80 h-80 rounded-full bg-gradient-to-r ${slides[currentSlide].theme} opacity-20 blur-3xl`}
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />

                {/* Floating Box */}
                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  animate={{ y: [0, -20, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="w-28 h-28 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                    <IconComponent className="w-14 h-14 text-white" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* MOBILE ARROWS */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-white/50 z-20"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 5, ease: "linear" }}
        key={currentSlide}
      />
    </section>
  );
};

export default HeroSection;
