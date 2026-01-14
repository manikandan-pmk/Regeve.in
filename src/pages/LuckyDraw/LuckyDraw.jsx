import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlay,
  FaStop,
  FaTrophy,
  FaStar,
  FaAward,
  FaUser,
} from "react-icons/fa";
import {
  GiSparkles,
  GiExplosionRays,
  GiSpinningBlades,
  GiCardRandom,
} from "react-icons/gi";
import { IoRocket } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import React, { useState, useEffect } from "react";

// Animation variants (NO CHANGES)
const containerVariants = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const boxVariants = {
  initial: {
    rotateX: 0,
    scale: 1,
    y: 0,
  },
  flip: {
    rotateX: [0, 360, 360, 0],
    scale: [1, 1.2, 1.1, 1],
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
  blast: {
    scale: [1, 2, 0.5, 1.2, 1],
    rotate: [0, 180, 360, 180, 0],
    y: [0, -50, 20, 0],
    transition: {
      duration: 2,
      ease: "easeOut",
    },
  },
  sticky: {
    scale: 1,
    rotateX: 0,
    y: 0,
  },
};

const numberShake = {
  shake: {
    x: [0, -15, 15, -15, 15, 0],
    y: [0, -8, 8, -8, 8, 0],
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.4,
      repeat: Infinity,
    },
  },
  stable: {
    x: 0,
    y: 0,
    scale: 1,
  },
};

const blastParticles = {
  initial: {
    scale: 0,
    opacity: 0,
    x: 0,
    y: 0,
    rotate: 0,
  },
  animate: (i) => ({
    scale: [0, 2, 0],
    opacity: [0, 1, 0.8, 0],
    x: Math.cos(i * 0.3) * (400 + Math.random() * 200),
    y: Math.sin(i * 0.3) * (400 + Math.random() * 200),
    rotate: [0, 720],
    transition: {
      duration: 2 + Math.random() * 1,
      delay: i * 0.03,
      ease: [0.34, 1.56, 0.64, 1],
    },
  }),
};

const blastWaves = [
  {
    initial: { scale: 0, opacity: 1 },
    animate: {
      scale: [0, 4],
      opacity: [1, 0],
      transition: {
        duration: 1.5,
        ease: "easeOut",
      },
    },
  },
  {
    initial: { scale: 0, opacity: 0.7 },
    animate: {
      scale: [0, 6],
      opacity: [0.7, 0],
      transition: {
        duration: 2,
        delay: 0.3,
        ease: "easeOut",
      },
    },
  },
  {
    initial: { scale: 0, opacity: 0.4 },
    animate: {
      scale: [0, 8],
      opacity: [0.4, 0],
      transition: {
        duration: 2.5,
        delay: 0.6,
        ease: "easeOut",
      },
    },
  },
];

const floatingParticles = {
  initial: { scale: 0, opacity: 0, y: 0 },
  animate: (i) => ({
    scale: [0, 1, 1, 0],
    opacity: [0, 1, 1, 0],
    y: [0, -100 - Math.random() * 100],
    x: [0, (Math.random() - 0.5) * 100],
    rotate: [0, 360],
    transition: {
      duration: 3 + Math.random() * 2,
      delay: 1 + i * 0.1,
      ease: "easeOut",
    },
  }),
};

const LuckyDraw = () => {
  const { adminId, luckydrawDocumentId } = useParams();

  // STATES
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [currentValues, setCurrentValues] = useState(["", "", "0", "0", "0"]);
  const [finalValues, setFinalValues] = useState(["", "", "0", "0", "0"]);
  const [drawLetters, setDrawLetters] = useState(["", ""]);
  const [blastAnimation, setBlastAnimation] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // ✅ REMOVE cycleInfo and currentCycle states
  const [drawStartDate, setDrawStartDate] = useState(null);
  const [durationUnit, setDurationUnit] = useState("Week");
  const [durationValue, setDurationValue] = useState(1);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ CORRECTED: Each cycle is 1 unit (Day, Week, or Month)
  const calculateCurrentCycleFromPC = () => {
    if (!drawStartDate) return 1;

    const start = new Date(drawStartDate);
    const now = new Date();

    if (isNaN(start.getTime())) return 1;

    // EACH CYCLE = 1 unit
    let cycleLengthMs = 0;

    if (durationUnit === "Day") {
      cycleLengthMs = 24 * 60 * 60 * 1000; // 1 day = 1 cycle
    } else if (durationUnit === "Week") {
      cycleLengthMs = 7 * 24 * 60 * 60 * 1000; // 1 week = 1 cycle
    } else if (durationUnit === "Month") {
      cycleLengthMs = 30 * 24 * 60 * 60 * 1000; // 1 month = 1 cycle (30 days)
    }

    if (!cycleLengthMs) return 1;

    const diff = now - start;
    const currentCycle = Math.floor(diff / cycleLengthMs) + 1;

    console.log("🔢 CORRECT Cycle calculation:", {
      start: drawStartDate,
      now: now.toISOString(),
      durationUnit,
      durationValue,
      cycleLengthDays: cycleLengthMs / (24 * 60 * 60 * 1000),
      daysPassed: diff / (24 * 60 * 60 * 1000),
      calculatedCycle: currentCycle,
      maxCycles: durationValue,
    });

    // If Duration_Value limits total cycles
    // Example: Duration_Value = 3 means only 3 cycles total
    if (durationValue && currentCycle > durationValue) {
      return durationValue; // Stay on last cycle
    }

    return currentCycle < 1 ? 1 : currentCycle;
  };

  // Get current cycle for display
  const currentCycle = calculateCurrentCycleFromPC();

  // Update display values when letters change
  useEffect(() => {
    if (drawLetters[0]) {
      setCurrentValues([drawLetters[0], drawLetters[1], "0", "0", "0"]);
      setFinalValues([drawLetters[0], drawLetters[1], "0", "0", "0"]);
    }
  }, [drawLetters]);

  // ✅ FETCH DRAW INFO
  const fetchDrawInfo = async () => {
    const token = localStorage.getItem("jwt");

    const res = await axios.get(
      `https://api.regeve.in/api/lucky-draw-names/${luckydrawDocumentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = res.data?.data || res.data;

    // ✅ SET DRAW INFO
    setDrawStartDate(data.createdAt);
    setDurationUnit(data.Duration_Unit || "Week");
    setDurationValue(data.Duration_Value || 1);

    const companyName = data?.admin?.Company_Name || "";
    const letters = companyName
      .replace(/[^A-Za-z]/g, "")
      .toUpperCase()
      .padEnd(2, "X")
      .slice(0, 2);

    setDrawLetters([letters[0], letters[1]]);
  };

  // ✅ FETCH PARTICIPANTS
  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwt");

      const res = await axios.get(
        `https://api.regeve.in/api/lucky-draw-names/${luckydrawDocumentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data?.data || res.data;
      const payments = data?.payments || [];

      const currentCycle = calculateCurrentCycleFromPC();

      console.log("📊 PARTICIPANT FILTERING:");
      console.log("Total payments:", payments.length);
      console.log("Looking for cycle:", currentCycle);
      console.log("Duration Value (max cycles):", durationValue);

      // ✅ FILTER BY CURRENT CYCLE
      const eligible = payments
        .filter((p) => {
          const paymentCycle = Number(p.Payment_Cycle);
          const isEligible =
            p.isVerified &&
            paymentCycle === currentCycle && // MUST match current cycle
            p.lucky_draw_form?.isVerified &&
            !p.lucky_draw_form?.IsWinnedParticipant;

          if (p.isVerified) {
            console.log(`Payment ${p.documentId}:`, {
              paymentCycle,
              currentCycle,
              matches: paymentCycle === currentCycle,
              participantVerified: p.lucky_draw_form?.isVerified,
              isWinner: p.lucky_draw_form?.IsWinnedParticipant,
            });
          }

          return isEligible;
        })
        .map((p) => p.lucky_draw_form);

      console.log(
        "✅ Eligible participants for cycle",
        currentCycle,
        ":",
        eligible.length
      );

      setParticipants(eligible);
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ INITIAL FETCH
  useEffect(() => {
    if (luckydrawDocumentId) {
      fetchDrawInfo();
    }
  }, [luckydrawDocumentId]);

  // ✅ FETCH PARTICIPANTS WHEN DATA CHANGES
  useEffect(() => {
    if (drawStartDate) {
      fetchParticipants();
    }
  }, [drawStartDate, durationUnit, durationValue]);

  // ✅ START SPINNING
  const startSpinning = () => {
    if (participants.length === 0) {
      alert("No verified participants available!");
      return;
    }

    setIsSpinning(true);
    setShowResult(false);
    setResult(null);
    setBlastAnimation(false);
    setShowProfile(false);
  };

  const stopSpinning = async () => {
    try {
      setIsSpinning(false);
      setBlastAnimation(true);

      const token = localStorage.getItem("jwt");
      const currentCycle = calculateCurrentCycleFromPC();

      console.log("🎯 Current cycle (frontend):", currentCycle);

      // Check if we have participants for this cycle
      if (participants.length === 0) {
        console.warn("No participants available for cycle", currentCycle);
        setBlastAnimation(false);
        alert(`No eligible participants found for Cycle ${currentCycle}!`);
        return;
      }

      const clientNow = new Date().toISOString();
      console.log("📤 Sending to backend:", {
        clientNow,
        currentCycle,
      });

      const res = await axios.post(
        `https://api.regeve.in/api/lucky-draw-names/${luckydrawDocumentId}/spin`,
        {
          clientNow,
          // Optionally send cycleNumber too if backend accepts it
          cycleNumber: currentCycle,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Backend response:", res.data);

      const winner = res.data.winner;

      // Extract digits
      const digits = winner.LuckyDraw_ID.replace(/\D/g, "")
        .slice(-3)
        .padStart(3, "0")
        .split("");

      // Update display
      setFinalValues([
        drawLetters[0],
        drawLetters[1],
        digits[0],
        digits[1],
        digits[2],
      ]);

      setResult({
        message: `Cycle ${res.data.currentCycle} Winner!`,
        memberId: winner.LuckyDraw_ID,
        winner,
        updateSuccess: true,
      });

      await fetchParticipants();

      setTimeout(() => setShowResult(true), 2000);
    } catch (err) {
      console.error("❌ Spin failed:", err);
      setBlastAnimation(false);

      if (err.response?.data?.error?.message) {
        const errorMsg = err.response.data.error.message;
        console.error("Backend error:", errorMsg);

        // Handle specific error cases
        if (errorMsg.includes("Winner already selected")) {
          // Extract cycle number from error message
          const cycleMatch = errorMsg.match(/Cycle (\d+)/);
          const cycleNumber = cycleMatch ? cycleMatch[1] : "current";

          alert(
            `⚠️ Winner already selected for Cycle ${cycleNumber}!\n\nPlease wait for the next cycle or reset the draw.`
          );

          // You could add a button to view the existing winner
          setResult({
            message: `Cycle ${cycleNumber} already has a winner`,
            memberId: "Already Selected",
            updateSuccess: false,
          });
          setTimeout(() => setShowResult(true), 1000);
        } else if (errorMsg.includes("No verified participants")) {
          alert(
            `No verified participants available for the current cycle.\n\nPlease verify participant payments first.`
          );
        } else {
          alert(`Error: ${errorMsg}`);
        }
      } else if (err.message) {
        alert(`Error: ${err.message}`);
      } else {
        alert("An unknown error occurred");
      }
    }
  };
  // Reset lucky draw
  const resetLuckyDraw = () => {
    setIsSpinning(false);
    setResult(null);
    setShowResult(false);
    setBlastAnimation(false);

    const values = [drawLetters[0] || "", drawLetters[1] || "", "0", "0", "0"];
    setCurrentValues(values);
    setFinalValues(values);
  };

  // View profile
  const handleViewProfile = () => {
    setShowProfile(true);
  };

  // Close profile
  const closeProfile = () => {
    setShowProfile(false);
    setTimeout(() => {
      resetLuckyDraw();
    }, 300);
  };

  // Update current values during spinning
  useEffect(() => {
    let interval;

    if (isSpinning) {
      interval = setInterval(() => {
        const randomNumber = Math.floor(Math.random() * 300) + 1;
        const numberStr = randomNumber.toString().padStart(3, "0");
        setCurrentValues((prev) => [
          prev[0],
          prev[1],
          numberStr[0],
          numberStr[1],
          numberStr[2],
        ]);
      }, 60);
    } else {
      setCurrentValues(finalValues);
    }

    return () => clearInterval(interval);
  }, [isSpinning, finalValues]);

  // ✅ JSX RENDER (ONLY UPDATED THE HEADER SECTION)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center p-4 font-serif relative">
      {/* Profile Popup - Static Version (NO CHANGES) */}
      <motion.button
        onClick={() =>
          navigate(`/${adminId}/luckydraw-dashboard/${luckydrawDocumentId}`)
        }
        className="fixed top-6 right-6 z-50 bg-gradient-to-br from-slate-900 via-purple-900 hover:from-blue-700 hover:to-cyan-800 text-white px-5 py-2.5 rounded-lg shadow-lg cursor-pointer"
      >
        ← Go Back
      </motion.button>

      <AnimatePresence>
        {showProfile && result?.winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={closeProfile}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-3xl p-8 max-w-2xl w-full m-4 border border-purple-500/30 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-purple-500/30">
                <h2 className="text-2xl font-bold text-white">
                  🏆 Winner Profile
                </h2>
                <button
                  onClick={closeProfile}
                  className="text-white text-xl hover:text-yellow-400 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Left side - Image section */}
                <div className="md:w-1/3 flex flex-col items-center">
                  <div className="w-48 h-48 mb-6 rounded-xl overflow-hidden border-4 border-yellow-400 shadow-lg">
                    <img
                      src={
                        result.winner.Photo?.url
                          ? `https://api.regeve.in${result.winner.Photo.url}`
                          : "/default-avatar.png"
                      }
                      alt={result.winner.Name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {result.winner.Name}
                    </h3>
                    <div className="inline-block bg-purple-800/50 px-4 py-2 rounded-lg">
                      <p className="text-yellow-400 font-mono font-semibold">
                        ID: {result.memberId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side - Details section */}
                <div className="md:w-2/3">
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-yellow-400 mb-4 pb-2 border-b border-yellow-400/30">
                      Personal Information
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-400 text-sm">
                            Phone Number
                          </label>
                          <p className="text-white font-medium mt-1">
                            {result.winner.Phone_Number}
                          </p>
                        </div>

                        <div>
                          <label className="text-gray-400 text-sm">
                            Email Address
                          </label>
                          <p className="text-white font-medium mt-1">
                            {result.winner.Email}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-400 text-sm">Age</label>
                          <p className="text-white font-medium mt-1">
                            {result.winner.Age} years
                          </p>
                        </div>

                        <div>
                          <label className="text-gray-400 text-sm">
                            Gender
                          </label>
                          <p className="text-white font-medium mt-1">
                            {result.winner.Gender}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Congratulations Banner */}
                  <div className="mt-6 p-6 bg-gradient-to-r from-yellow-500/10 to-purple-600/10 rounded-xl border border-yellow-400/20">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-300 mb-3">
                        🎉 CONGRATULATIONS! 🎉
                      </p>
                      <p className="text-gray-200 text-lg">
                        You are the lucky winner of this draw!
                      </p>
                      <p className="text-gray-300 mt-2">
                        Your prize will be processed shortly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Background Elements (NO CHANGES) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 text-6xl text-purple-500/30"
        >
          <GiSpinningBlades />
        </motion.div>
        <motion.div
          animate={{
            y: [0, -150, 0],
            x: [0, 80, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-3/4 right-1/3 text-4xl text-blue-500/30"
        >
          <GiCardRandom />
        </motion.div>
      </div>

      {/* Ultra Enhanced Blast Animation (NO CHANGES) */}
      <AnimatePresence>
        {blastAnimation && (
          <>
            {/* Multiple Blast Waves */}
            {blastWaves.map((wave, index) => (
              <motion.div
                key={`wave-${index}`}
                variants={wave}
                initial="initial"
                animate="animate"
                className="fixed top-1/2 left-1/2 rounded-full pointer-events-none border-2"
                style={{
                  borderColor: ["#FFD700", "#FF6B6B", "#4ECDC4"][index],
                  transform: "translate(-50%, -50%)",
                  width: "4px",
                  height: "4px",
                }}
              />
            ))}

            {/* Central Explosion Core */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 10, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 1,
                ease: "easeOut",
              }}
              className="fixed top-1/2 left-1/2 bg-yellow-400 rounded-full pointer-events-none"
              style={{
                transform: "translate(-50%, -50%)",
                width: "20px",
                height: "20px",
                boxShadow: "0 0 100px 50px rgba(255, 215, 0, 0.8)",
              }}
            />

            {/* Blast Particles */}
            {[...Array(80)].map((_, i) => (
              <motion.div
                key={`main-${i}`}
                className="fixed top-1/2 left-1/2 text-3xl pointer-events-none"
                variants={blastParticles}
                initial="initial"
                animate="animate"
                custom={i}
                style={{
                  color: [
                    "#FF6B6B",
                    "#4ECDC4",
                    "#45B7D1",
                    "#96CEB4",
                    "#FECA57",
                    "#FF9FF3",
                    "#F368E0",
                    "#FF9F43",
                    "#54A0FF",
                    "#00D2D3",
                  ][i % 10],
                  fontSize: `${25 + Math.random() * 20}px`,
                  filter: `blur(${Math.random() * 2}px)`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {
                  [
                    "⭐",
                    "✨",
                    "🔸",
                    "🔹",
                    "♦️",
                    "🎊",
                    "🎉",
                    "💫",
                    "🌟",
                    "⚡",
                    "💥",
                    "🔥",
                    "💎",
                    "❤️",
                    "💙",
                    "💚",
                    "💛",
                    "💜",
                    "🧡",
                    "💖",
                  ][i % 20]
                }
              </motion.div>
            ))}

            {/* Sparkle Particles */}
            {[...Array(60)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="fixed top-1/2 left-1/2 text-xl pointer-events-none"
                initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                  x: (Math.random() - 0.5) * 600,
                  y: (Math.random() - 0.5) * 600,
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 1.5 + Math.random() * 1,
                  delay: i * 0.02,
                  ease: "easeOut",
                }}
                style={{
                  color: "#FFFFFF",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <GiSparkles />
              </motion.div>
            ))}

            {/* Rocket Particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`rocket-${i}`}
                className="fixed top-1/2 left-1/2 text-2xl pointer-events-none"
                initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: (Math.random() - 0.5) * 800,
                  y: (Math.random() - 0.5) * 800,
                  rotate: [0, 720],
                }}
                transition={{
                  duration: 2.5 + Math.random() * 1,
                  delay: 0.5 + i * 0.05,
                  ease: "easeOut",
                }}
                style={{
                  color: "#FF6B6B",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <IoRocket />
              </motion.div>
            ))}

            {/* Floating Particles */}
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={`float-${i}`}
                className="fixed top-1/2 left-1/2 text-xl pointer-events-none"
                variants={floatingParticles}
                initial="initial"
                animate="animate"
                custom={i}
                style={{
                  color: ["#FFD700", "#4ECDC4", "#FF6B6B", "#96CEB4"][i % 4],
                  transform: "translate(-50%, -50%)",
                }}
              >
                {["✨", "🌟", "⭐", "💫"][i % 4]}
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main Lucky Draw Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`bg-gradient-to-br from-slate-800/90 to-purple-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/30 p-8 max-w-md w-full relative overflow-hidden transition-all duration-300 ${
          showProfile ? "blur-sm opacity-70" : "opacity-100"
        }`}
      >
        {/* Decorative Corner Elements */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-400 rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-400 rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-400 rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-400 rounded-br-lg"></div>

        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-8 relative"
        >
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-2 -left-2 text-yellow-400 text-2xl"
          >
            <FaStar />
          </motion.div>
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-2 -right-2 text-yellow-400 text-2xl"
          >
            <FaStar />
          </motion.div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-3 font-serif tracking-wider">
            LUCKY DRAW
          </h1>
          <p className="text-gray-300 text-lg font-light tracking-wide">
            Spin to reveal your amazing prize!
          </p>

          {/* ✅ UPDATED CYCLE DISPLAY */}
          {drawStartDate && (
            <p className="text-sm text-yellow-400 mt-2">
              Current Cycle: {durationUnit} {currentCycle}
            </p>
          )}
        </motion.div>

        {/* Number Boxes (NO CHANGES) */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center gap-3 mb-8 relative"
        >
          {currentValues.map((value, index) => (
            <motion.div key={index} className="relative">
              <motion.div
                variants={boxVariants}
                animate={
                  index < 2
                    ? "sticky"
                    : isSpinning
                    ? "flip"
                    : blastAnimation
                    ? "blast"
                    : "initial"
                }
                className="w-16 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-2xl border-2 border-purple-400 flex items-center justify-center relative overflow-hidden"
              >
                {index > 1 && (
                  <motion.div
                    animate={{
                      x: [-150, 150],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                )}

                <div className="absolute inset-0 bg-purple-500/20 rounded-xl blur-sm" />

                <motion.span
                  animate={index < 2 ? "stable" : isSpinning ? "shake" : {}}
                  variants={numberShake}
                  className="text-3xl font-bold text-white font-mono tracking-wider z-10"
                >
                  {value}
                </motion.span>

                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 font-mono">
                  {index < 2 ? "L" : "0-9"}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Buttons (NO CHANGES) */}
        <motion.div variants={itemVariants} className="flex gap-4 mb-6">
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 30px rgba(34, 197, 94, 0.6)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={startSpinning}
            disabled={isSpinning || loading}
            className="flex-1 bg-gradient-to-r cursor-pointer from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-400 relative overflow-hidden"
          >
            <motion.div
              animate={isSpinning ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <FaPlay className="text-sm" />
            </motion.div>
            {loading ? "LOADING..." : "START"}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 30px rgba(239, 68, 68, 0.6)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={stopSpinning}
            disabled={!isSpinning}
            className="flex-1 bg-gradient-to-r cursor-pointer from-red-500 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-red-400 relative overflow-hidden"
          >
            <motion.div
              animate={isSpinning ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.4, repeat: Infinity }}
            >
              <FaStop className="text-sm" />
            </motion.div>
            STOP
          </motion.button>
        </motion.div>

        {/* Result (NO CHANGES) */}
        <AnimatePresence>
          {showResult && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0, rotateY: 180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0, rotateY: -180 }}
              className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-center text-white shadow-2xl border-2 border-white/20 relative overflow-hidden"
            >
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute top-2 right-2 text-white/20 text-2xl"
              >
                <GiExplosionRays />
              </motion.div>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="text-5xl mb-4"
              >
                <FaAward />
              </motion.div>

              <motion.h3
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold mb-2 font-serif tracking-wide"
              >
                {result.updateSuccess === false &&
                result.message.includes("Error")
                  ? "ERROR"
                  : "CONGRATULATIONS!"}
              </motion.h3>

              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg font-semibold mb-4"
              >
                {result.message}
              </motion.p>

              {result.memberId !== "B000" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-sm font-mono bg-black/30 rounded-lg py-2 px-3 mb-4"
                >
                  Lucky Number:{" "}
                  <span className="text-yellow-300 font-bold">
                    {result.memberId}
                  </span>
                </motion.p>
              )}

              {result.updateSuccess === false && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-sm text-red-200 bg-red-500/30 rounded-lg py-2 px-3 mb-4"
                >
                  Note: Winner status update failed
                </motion.p>
              )}

              {result.winner && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                >
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 25px rgba(59, 130, 246, 0.6)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleViewProfile}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-bold text-lg shadow-2xl flex items-center justify-center gap-3 border border-blue-400 relative overflow-hidden"
                  >
                    <FaUser className="text-sm" />
                    VIEW PROFILE
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.8, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="absolute inset-0 bg-gradient-to-r cursor-pointer from-transparent via-white/25 to-transparent"
                    />
                  </motion.button>
                </motion.div>
              )}

              {result.updateSuccess !== false && (
                <>
                  <motion.div
                    animate={{
                      y: [0, -25, 0],
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                    className="absolute -top-2 -left-2 text-yellow-300 text-2xl"
                  >
                    <FaTrophy />
                  </motion.div>
                  <motion.div
                    animate={{
                      y: [0, -20, 0],
                      rotate: [0, -20, 20, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: 0.5,
                    }}
                    className="absolute -top-2 -right-2 text-yellow-300 text-2xl"
                  >
                    <FaTrophy />
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simple Instructions */}
        <motion.div
          variants={itemVariants}
          className="text-center text-sm text-gray-400 mt-6"
        >
          <p className="font-light">Press START to begin your lucky draw!</p>
          {participants.length > 0 && (
            <p className="text-xs mt-1 text-green-400">
              {participants.length} verified participants loaded
            </p>
          )}
          {participants.length === 0 && !loading && (
            <p className="text-xs mt-1 text-red-400">
              No verified participants found
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LuckyDraw;
