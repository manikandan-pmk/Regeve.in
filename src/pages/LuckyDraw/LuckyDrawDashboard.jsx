import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  Users,
  DollarSign,
  Clock,
  Calendar,
  Trophy,
  QrCode,
  Target,
  AlertCircle,
  Award,
  Phone,
  Eye,
  Gift,
  Sparkles,
  Crown,
  RefreshCw,
  Zap,
  User,
  CheckCircle,
  ChevronRight,
  X,
  Info,
  Ticket,
  TrendingUp,
  PieChart as PieChartIcon,
  CalendarDays,
  Wallet,
  ArrowLeft,
  BarChart3,
  Home,
  Star,
  Medal,
  ChevronLeft,
  ChevronsRight,
  TrendingDown,
  Percent,
  Shield,
  Bell,
  Settings,
  CreditCard,
  Filter,
  Search,
  Download,
  Check,
  XCircle,
  Loader,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "https://api.regeve.in/api";
const MEDIA_BASE_URL = "https://api.regeve.in";

const axiosWithAuth = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach JWT automatically
axiosWithAuth.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const LuckyDrawDashboard = () => {
  const { adminId, luckydrawDocumentId } = useParams();
  const navigate = useNavigate();
  const [luckyDrawData, setLuckyDrawData] = useState(null);
  const [winners, setWinners] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [winnersLoading, setWinnersLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [stats, setStats] = useState({
    totalParticipants: 0,
    totalAmount: 0,
    maxParticipants: 0,
    verifiedParticipants: 0,
    daysRemaining: 0,
    activeDraws: 0,
    winnersCount: 0,
    totalPaidAmount: 0,
    totalPendingAmount: 0,
    paidCount: 0,
    pendingCount: 0,
  });
  const [hoveredCard, setHoveredCard] = useState(null);

  // Payment filter states
  const [paymentFilter, setPaymentFilter] = useState("all"); // all, paid, pending
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyingPaymentId, setVerifyingPaymentId] = useState(null);
  const [paymentStats, setPaymentStats] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    if (!luckydrawDocumentId) {
      setError("Lucky Draw ID missing in URL");
      setLoading(false);
      return;
    }
    fetchLuckyDrawData();
    fetchWinners();
    fetchPayments();
  }, [luckydrawDocumentId]);

  const fetchLuckyDrawData = async () => {
    try {
      setLoading(true);

      const response = await axiosWithAuth.get(
        `/lucky-draw-names/${luckydrawDocumentId}`
      );

      const data = response.data;
      const participants = data.lucky_draw_forms || [];

      const verifiedCount = participants.filter(
        (p) => p.isVerified === true
      ).length;

      setLuckyDrawData(data);

      setStats((prev) => ({
        ...prev,
        totalParticipants: participants.length,
        verifiedParticipants: verifiedCount,
        maxParticipants: data.Number_of_Peoples || 0,
        totalAmount: parseFloat(data.Amount) || 0,
        daysRemaining: calculateDaysRemaining(
          data.Duration_Value,
          data.Duration_Unit
        ),
        activeDraws: data.LuckyDraw_Status === "Active" ? 1 : 0,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWinners = async () => {
    try {
      setWinnersLoading(true);
      setError(null);

      if (!luckydrawDocumentId || luckydrawDocumentId === "undefined") {
        throw new Error("Invalid lucky draw ID");
      }

      const response = await axiosWithAuth.get(
        `/lucky-draw-names/${luckydrawDocumentId}`
      );

      const data = response.data;

      if (!data || !data.lucky_draw_forms) {
        throw new Error("No participants data found");
      }

      const winnersList = data.lucky_draw_forms.filter(
        (participant) => participant.IsWinnedParticipant === true
      );

      setWinners(winnersList);
      setStats((prev) => ({
        ...prev,
        winnersCount: winnersList.length,
      }));
    } catch (error) {
      console.error("Error fetching winners:", error);
      setError(error.message || "Failed to fetch winners");
    } finally {
      setWinnersLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);
      const response = await axiosWithAuth.get(
        `/lucky-draw-names/${luckydrawDocumentId}`
      );
      const data = response.data;
      const paymentsData = data.payments || [];

      // Process payments data
      let paidAmount = 0;
      let pendingAmount = 0;
      let paidCount = 0;
      let pendingCount = 0;

      paymentsData.forEach((payment) => {
        const amount = parseFloat(payment.Amount) || 0;
        if (payment.isVerified === true) {
          paidAmount += amount;
          paidCount++;
        } else {
          pendingAmount += amount;
          pendingCount++;
        }
      });

      setPayments(paymentsData);
      setStats((prev) => ({
        ...prev,
        totalPaidAmount: paidAmount,
        totalPendingAmount: pendingAmount,
        paidCount: paidCount,
        pendingCount: pendingCount,
      }));

      setPaymentStats({
        totalPaid: paidCount,
        totalPending: pendingCount,
        totalAmount: paidAmount + pendingAmount,
      });
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError(error.message || "Failed to fetch payments");
    } finally {
      setPaymentsLoading(false);
    }
  };

const verifyPayment = async (paymentDocumentId, verify) => {
  try {
    setVerifyingPaymentId(paymentDocumentId);

await axiosWithAuth.put(
  `/lucky-draw-names/${luckydrawDocumentId}`,
  {
    data: {
      participant_payments: {
        update: [
          {
            where: {
              documentId: paymentDocumentId,
            },
            data: {
              isVerified: verify,
            },
          },
        ],
      },
    },
  }
);


    // Optimistic UI update
    setPayments((prev) =>
      prev.map((p) =>
        p.documentId === paymentDocumentId
          ? {
              ...p,
              isVerified: verify,
              Verified_At: verify ? new Date().toISOString() : null,
            }
          : p
      )
    );
  } catch (error) {
    console.error(
      "Payment verification failed:",
      error?.response?.data || error
    );
    alert("Failed to update payment");
  } finally {
    setVerifyingPaymentId(null);
  }
};




  const calculateDaysRemaining = (value, unit) => {
    const unitMap = {
      Day: 1,
      Week: 7,
      Month: 30,
      Year: 365,
    };
    return value * (unitMap[unit] || 1);
  };

  const getStatusColor = (status) => {
    const colors = {
      Created: "bg-blue-100 text-blue-800 border-blue-200",
      Active: "bg-green-100 text-green-800 border-green-200",
      Completed: "bg-purple-100 text-purple-800 border-purple-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Filter payments based on status and search
  const filteredPayments = payments.filter((payment) => {
    const matchesFilter =
      paymentFilter === "all" ||
      (paymentFilter === "paid" && payment.isVerified === true) ||
      (paymentFilter === "pending" && payment.isVerified !== true);

    const matchesSearch =
      searchQuery === "" ||
      payment.lucky_draw_form?.Name?.toLowerCase().includes(
        searchQuery.toLowerCase()
      ) ||
      payment.lucky_draw_form?.Email?.toLowerCase().includes(
        searchQuery.toLowerCase()
      ) ||
      payment.Payment_Cycle?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Loading Animation Component
  const LoadingAnimation = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>

        <div className="relative">
          <motion.div
            className="relative w-32 h-32 mx-auto mb-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-[8px] border-blue-100/50"></div>
            {/* Middle Ring */}
            <motion.div
              className="absolute inset-6 rounded-full border-[6px] border-blue-300"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            ></motion.div>
            {/* Inner Ring */}
            <div className="absolute inset-12 rounded-full border-[4px] border-blue-500 animate-pulse"></div>
            {/* Center */}
            <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Sparkles className="w-12 h-12 text-blue-500" />
            </div>
          </motion.div>

          <div className="text-center space-y-4">
            <motion.p
              className="text-xl font-semibold text-gray-800"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Loading Dashboard...
            </motion.p>
            <p className="text-gray-500 text-sm">
              Preparing your lucky draw experience
            </p>
            {/* Loading Dots */}
            <div className="flex justify-center space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Winner Detail Modal Component
  const WinnerDetailModal = ({ winner, onClose }) => {
    if (!winner) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed  inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-white/20 flex flex-col"
          >
            {/* Popup Header - Fixed */}
            <div className="shrink-0 relative px-8 py-6 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-b border-white/20">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-4"
              >
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Winner Details
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Complete profile information
                  </p>
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 cursor-pointer hover:bg-red-600 hover:text-white rounded-xl transition-colors"
              >
                <X className="w-6 h-6 hover:text-white" />
              </motion.button>
            </div>

            {/* Animated Background Pattern */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 bg-blue-200/20 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, Math.random() * 20 - 10, 0],
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>

            {/* Main Content - Scrollable with full width layout */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                {/* Left Column - Profile (30% width) */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="lg:col-span-4 space-y-6"
                >
                  {/* Profile Card */}
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-xl border border-white/50 h-full">
                    <div className="flex flex-col items-center h-full">
                      {/* Profile Image */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="relative mb-6 w-full"
                      >
                        <div className="relative w-40 h-40 mx-auto">
                          {/* Glow Effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur-xl opacity-30"></div>

                          {/* Image Container */}
                          <div className="relative w-full h-full rounded-2xl overflow-hidden border-8 border-white shadow-2xl">
                            {winner.Photo?.url ? (
                              <motion.img
                                src={
                                  winner.Photo?.url
                                    ? `${MEDIA_BASE_URL}${winner.Photo.url}`
                                    : "/default-avatar.png"
                                }
                                alt={winner.Name}
                                className="w-full h-full object-cover"
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5 }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.parentNode.innerHTML = `
                              <div class="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                <svg class="w-20 h-20 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                              </div>
                            `;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                <User className="w-20 h-20 text-blue-400" />
                              </div>
                            )}
                          </div>

                          {/* Verified Badge */}
                          {winner.isVerified && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.4, duration: 0.3 }}
                              className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white"
                              whileHover={{ scale: 1.1, rotate: 360 }}
                            >
                              <CheckCircle className="w-6 h-6 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>

                      {/* Name & Title */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center mb-6"
                      >
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          {winner.Name || "Unknown"}
                        </h2>
                        <p className="text-gray-600 text-sm truncate w-full">
                          {winner.Email}
                        </p>
                      </motion.div>

                      {/* Winner Badge */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 text-white rounded-full mb-6 shadow-lg relative overflow-hidden"
                      >
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        <Crown className="w-4 h-4" />
                        <span className="font-bold text-sm">WINNER</span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Right Column - Details (70% width) */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-8 space-y-6"
                >
                  {/* Personal Information Section */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 h-full">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      Personal Information
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {[
                        {
                          label: "Full Name",
                          value: winner.Name,
                          icon: User,
                          color: "blue",
                        },
                        {
                          label: "Gender",
                          value: winner.Gender || "N/A",
                          icon: User,
                          color: "pink",
                        },
                        {
                          label: "Age",
                          value: winner.Age || "N/A",
                          icon: Calendar,
                          color: "emerald",
                        },

                        {
                          label: "Email Address",
                          value: winner.Email,
                          icon: "mail",
                          color: "indigo",
                        },
                        {
                          label: "Phone Number",
                          value: winner.Phone_Number || "N/A",
                          icon: Phone,
                          color: "green",
                        },
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="bg-white p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 flex items-start gap-3"
                        >
                          <div className={`p-2 bg-${item.color}-50 rounded-lg`}>
                            {typeof item.icon === "string" ? (
                              <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full"></div>
                            ) : (
                              <item.icon
                                className={`w-5 h-5 text-${item.color}-600`}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">
                              {item.label}
                            </p>
                            <p className="font-medium text-gray-900 truncate">
                              {item.value}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Address Section - Full Width */}
                    {winner.Address && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <Home className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium text-gray-900">
                              {winner.Address}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Fixed Footer */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="shrink-0 bg-gradient-to-r from-white to-blue-50 border-t border-white/20 px-8 py-4"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-6 cursor-pointer shadow-md hover:text-white hover:bg-red-600 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Payment Tracking Modal Component
  const PaymentTrackingModal = ({ onClose }) => {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden border border-white/20 flex flex-col"
          >
            {/* Header */}
            <div className="shrink-0 relative px-8 py-6 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-b border-white/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Payment Tracking
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Total: {paymentStats.totalPaid + paymentStats.totalPending}{" "}
                    payments • Paid: {paymentStats.totalPaid} • Pending:{" "}
                    {paymentStats.totalPending}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg font-medium flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Paid: {paymentStats.totalPaid}
                  </div>
                  <div className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Pending: {paymentStats.totalPending}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 cursor-pointer hover:bg-red-600 hover:text-white rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 hover:text-white" />
                </motion.button>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="px-8 py-4 border-b border-gray-100 bg-white/50">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {["all", "paid", "pending"].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setPaymentFilter(filter)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                          paymentFilter === filter
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by name, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchPayments}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow hover:shadow-lg transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="flex-1 overflow-hidden">
              {paymentsLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                  <p className="text-gray-600 text-lg">Loading payments...</p>
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <CreditCard className="w-24 h-24 text-gray-300 mb-4" />
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">
                    No payments found
                  </h4>
                  <p className="text-gray-500 max-w-md text-center">
                    {searchQuery || paymentFilter !== "all"
                      ? "Try changing your search or filter"
                      : "No payments recorded yet"}
                  </p>
                </div>
              ) : (
                <div className="h-full overflow-y-auto">
                  <table className="w-full border-collapse">
                    {/* Table Header */}
                    <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Participant
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Amount
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Payment Cycle
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4" />
                            Due Date
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Status
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Proof
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Actions
                          </div>
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-gray-100">
                      {filteredPayments.map((payment) => (
                        <motion.tr
                          key={payment.documentId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-blue-50/50 transition-colors duration-200"
                        >
                          {/* Participant Column */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {payment.lucky_draw_form?.Photo?.url ? (
                                  <img
                                    src={`${MEDIA_BASE_URL}${payment.lucky_draw_form.Photo.url}`}
                                    alt={payment.lucky_draw_form.Name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.parentNode.innerHTML = `
                                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-2 border-white shadow">
                                        <User class="w-5 h-5 text-blue-400" />
                                      </div>
                                    `;
                                    }}
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-2 border-white shadow">
                                    <User className="w-5 h-5 text-blue-400" />
                                  </div>
                                )}
                                {payment.lucky_draw_form?.isVerified && (
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <Check className="w-2 h-2 text-white" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {payment.lucky_draw_form?.Name || "Unknown"}
                                </p>
                                <p className="text-sm text-gray-500 truncate max-w-[150px]">
                                  {payment.lucky_draw_form?.Email || "No email"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Amount Column */}
                          <td className="py-4 px-6">
                            <div className="font-bold text-lg text-gray-900">
                              {formatCurrency(payment.Amount)}
                            </div>
                          </td>

                          {/* Payment Cycle Column */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                {payment.Payment_Cycle || "N/A"}
                              </span>
                            </div>
                          </td>

                          {/* Due Date Column */}
                          <td className="py-4 px-6">
                            <div className="text-gray-700">
                              {formatDate(payment.due_date)}
                            </div>
                          </td>

                          {/* Status Column */}
                          <td className="py-4 px-6">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                                payment.isVerified
                                  ? "bg-green-100 text-green-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {payment.isVerified ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  Paid
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-4 h-4" />
                                  Pending
                                </>
                              )}
                            </div>
                            {payment.Verified_At && (
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(payment.Verified_At)}
                              </p>
                            )}
                          </td>

                          {/* Proof Column */}
                          <td className="py-4 px-6">
                            {payment.Payment_Photo?.[0]?.url ? (
                              <div className="relative group">
                                <button
                                  onClick={() =>
                                    window.open(
                                      `${MEDIA_BASE_URL}${payment.Payment_Photo[0].url}`,
                                      "_blank"
                                    )
                                  }
                                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Proof
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">
                                No proof
                              </span>
                            )}
                          </td>

                          {/* Actions Column */}
                          <td className="py-4 px-6">
                            <div className="flex gap-2">
                              {!payment.isVerified ? (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    verifyPayment(payment.documentId, true)
                                  }
                                  disabled={
                                    verifyingPaymentId === payment.documentId
                                  }
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {verifyingPaymentId === payment.documentId ? (
                                    <>
                                      <Loader className="w-4 h-4 animate-spin" />
                                      Verifying...
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-4 h-4" />
                                      Mark Paid
                                    </>
                                  )}
                                </motion.button>
                              ) : (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    verifyPayment(payment.documentId, false)
                                  }
                                  disabled={
                                    verifyingPaymentId === payment.documentId
                                  }
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {verifyingPaymentId === payment.documentId ? (
                                    <>
                                      <Loader className="w-4 h-4 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4" />
                                      Mark Pending
                                    </>
                                  )}
                                </motion.button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 bg-gradient-to-r from-white to-blue-50 border-t border-white/20 px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {filteredPayments.length} of {payments.length}{" "}
                  payments • Total Amount:{" "}
                  {formatCurrency(paymentStats.totalAmount)}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 cursor-pointer bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 hover:text-gray-900 rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring" }}
          className="relative max-w-md w-full"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>

          <div className="relative p-8 bg-white/90 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative w-24 h-24 mx-auto mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-pink-100 rounded-full"></div>
              <AlertCircle className="w-16 h-16 text-red-500 absolute inset-0 m-auto" />
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl font-bold text-gray-800 mb-3 text-center"
            >
              Failed to Load Data
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 mb-6 p-4 bg-gray-50/50 rounded-xl border border-gray-200 text-center"
            >
              {error}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchLuckyDrawData}
                className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl flex items-center gap-2 group"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4"
                >
                  <RefreshCw className="w-full h-full" />
                </motion.div>
                Retry
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/lucky-draw")}
                className="cursor-pointer px-6 py-3 rounded-xl border border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 text-gray-700 hover:text-blue-700"
              >
                Go Back
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (!luckyDrawData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md p-8 bg-white rounded-3xl border border-white/20 shadow-2xl"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-12 h-12 text-amber-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            No Lucky Draw Data Found
          </h2>
          <p className="text-gray-600 mb-6">
            Please check the document ID and try again
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/lucky-draw")}
            className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl"
          >
            Go to Lucky Draw Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Stats Cards with Payment Tracking
  const statsCards = [
    {
      key: "verified",
      title: "Total Participants",
      value: stats.verifiedParticipants,
      icon: Users,
      color: "blue",
      delay: 0.15,
      progress:
        stats.totalParticipants > 0
          ? (stats.verifiedParticipants / stats.totalParticipants) * 100
          : 0,
      progressPercent:
        stats.totalParticipants > 0
          ? Math.round(
              (stats.verifiedParticipants / stats.totalParticipants) * 100
            )
          : 0,
    },
    {
      key: "amount",
      title: "Total Prize Pool",
      value: formatCurrency(stats.totalAmount),
      icon: DollarSign,
      color: "emerald",
      delay: 0.2,
      progress: Math.min((stats.totalAmount / 10000) * 10, 100),
      amountPerWinner:
        stats.winnersCount > 0
          ? formatCurrency(stats.totalAmount / stats.winnersCount)
          : formatCurrency(0),
    },
    {
      key: "payments",
      title: "Payment Tracking",
      value: `${stats.paidCount}/${stats.paidCount + stats.pendingCount}`,
      icon: CreditCard,
      color: "amber",
      delay: 0.25,
      progress:
        stats.paidCount + stats.pendingCount > 0
          ? (stats.paidCount / (stats.paidCount + stats.pendingCount)) * 100
          : 0,
      progressPercent:
        stats.paidCount + stats.pendingCount > 0
          ? Math.round(
              (stats.paidCount / (stats.paidCount + stats.pendingCount)) * 100
            )
          : 0,
      clickable: true,
      onClick: () => setShowPaymentsModal(true),
    },
    {
      key: "winners",
      title: "Winners Count",
      value: stats.winnersCount,
      icon: Crown,
      color: "purple",
      delay: 0.3,
      progress:
        stats.totalParticipants > 0
          ? (stats.winnersCount / stats.totalParticipants) * 100
          : 0,
      winRate:
        stats.totalParticipants > 0
          ? ((stats.winnersCount / stats.totalParticipants) * 100).toFixed(1)
          : 0,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6 overflow-x-hidden"
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 bg-gradient-to-r from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* Header Navigation */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="sticky top-4 z-10"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Navigation */}
            <motion.div whileHover={{ scale: 1.02 }} className="flex-1">
              <div className=" backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <motion.button
                    whileHover={{ x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/${adminId}/LuckyDrawHome`)}
                    className="cursor-pointer flex items-center gap-3 text-gray-700 hover:text-blue-600 px-4 py-3 rounded-xl hover:bg-blue-50 transition-all duration-300 group"
                  >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <div>
                      <span className="font-semibold hidden sm:inline">
                        Back to Dashboard
                      </span>
                      <span className="font-semibold sm:hidden">Back</span>
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Right Actions */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex gap-4"
            >
              <div className=" backdrop-blur-sm rounded-2xl p-4 ">
                <div className="flex items-center gap-3">
                  {/* Payment Tracking Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPaymentsModal(true)}
                    className="cursor-pointer flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-xl group"
                  >
                    <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold hidden md:inline">
                      Payment Tracking
                    </span>
                    <div className="px-2 py-1 bg-white/20 rounded text-xs">
                      {stats.paidCount}/{stats.paidCount + stats.pendingCount}
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      navigate(
                        `/${adminId}/luckydraw-participant-dashboard/${luckydrawDocumentId}`
                      )
                    }
                    className="cursor-pointer flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-xl group"
                  >
                    <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold hidden md:inline">
                      Participants
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      fetchLuckyDrawData();
                      fetchWinners();
                      fetchPayments();
                    }}
                    className="cursor-pointer p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                    title="Refresh Dashboard"
                  >
                    <RefreshCw className="w-5 h-5 text-gray-600 hover:text-blue-600" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Header Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 20, delay: 0.1 }}
          className="relative bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20 overflow-hidden group"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-4 mb-4"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-lg"
                  >
                    <Sparkles className="w-8 h-8 text-blue-600" />
                  </motion.div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      {luckyDrawData.Name || "Lucky Draw"}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                          luckyDrawData.LuckyDraw_Status
                        )} flex items-center gap-2`}
                      >
                        {luckyDrawData.LuckyDraw_Status === "Active" && (
                          <motion.span
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="inline-block w-2 h-2 rounded-full bg-green-500"
                          />
                        )}
                        {luckyDrawData.LuckyDraw_Status || "Unknown"}
                      </motion.span>
                      <span className="text-gray-600 text-sm flex items-center gap-2">
                        <Ticket className="w-4 h-4" />
                        ID: {luckyDrawData.LuckyDrawName_ID || "N/A"}
                      </span>
                      <span className="text-gray-600 text-sm flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Created: {formatDate(luckyDrawData.createdAt)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  navigate(`/${adminId}/luckydraw/${luckydrawDocumentId}`)
                }
                className="cursor-pointer group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-3 relative overflow-hidden"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 animate-pulse"></div>
                <Target className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                <div className="text-left relative z-10">
                  <span className="font-bold text-lg">Draw Now</span>
                  <p className="text-sm text-blue-100 opacity-90">
                    Start the lucky draw
                  </p>
                </div>
                <ChevronsRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: stat.delay, type: "spring" }}
              whileHover={{
                y: -10,
                transition: { type: "spring", stiffness: 300 },
              }}
              onMouseEnter={() => setHoveredCard(stat.key)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={stat.clickable ? stat.onClick : undefined}
              className={`group ${
                stat.clickable ? "cursor-pointer" : ""
              } bg-white rounded-2xl p-6 border border-${
                stat.color
              }-100 hover:border-${
                stat.color
              }-300 hover:shadow-2xl transition-all duration-500 relative overflow-hidden`}
            >
              {/* Animated background on hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100/50`}
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredCard === stat.key ? 0.3 : 0 }}
                transition={{ duration: 0.3 }}
              />

              {/* Floating particles */}
              {hoveredCard === stat.key && (
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-2 h-2 bg-${stat.color}-400 rounded-full`}
                      initial={{
                        x: Math.random() * 100 + "%",
                        y: "120%",
                        opacity: 0,
                      }}
                      animate={{
                        y: "-20%",
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.2,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </div>
              )}

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    animate={{
                      rotate: hoveredCard === stat.key ? [0, 360] : 0,
                      scale: hoveredCard === stat.key ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`p-3 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 rounded-xl shadow-lg`}
                  >
                    <stat.icon className={`w-7 h-7 text-${stat.color}-600`} />
                  </motion.div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500">{stat.title}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {stat.key === "payments"
                        ? `Paid: ${stats.paidCount} | Pending: ${stats.pendingCount}`
                        : stat.growth
                        ? "Daily Growth"
                        : stat.amountPerWinner
                        ? "Amount per winner"
                        : stat.winRate
                        ? "Win Rate"
                        : "Progress"}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-${stat.color}-600 font-semibold`}
                    >
                      {stat.growth && <TrendingUp className="w-4 h-4" />}
                      {stat.growth ||
                        stat.amountPerWinner ||
                        (stat.winRate
                          ? `${stat.winRate}%`
                          : `${stat.progressPercent}%`)}
                    </span>
                  </div>

                  {/* Animated progress bar */}
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.progress}%` }}
                      transition={{ duration: 1, delay: stat.delay + 0.2 }}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ["0%", "100%"] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: stat.delay,
                        }}
                        style={{ width: "50%" }}
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Winners Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl overflow-hidden"
        >
          <div className="p-6 md:p-8">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-4"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-lg"
                >
                  <Crown className="w-7 h-7 text-blue-600" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Winners List
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Congratulations to all our lucky winners!
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-semibold text-blue-700">
                    Total: {winners.length} Winner
                    {winners.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchWinners}
                  disabled={winnersLoading}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <motion.div
                    animate={{ rotate: winnersLoading ? 360 : 0 }}
                    transition={{
                      duration: winnersLoading ? 1 : 0,
                      repeat: winnersLoading ? Infinity : 0,
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.div>
                  <span className="font-medium hidden sm:inline">Refresh</span>
                </motion.button>
              </motion.div>
            </div>

            {/* Winners Grid */}
            {winnersLoading ? (
              <div className="py-16 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-flex items-center justify-center mb-4"
                >
                  <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full"></div>
                </motion.div>
                <p className="text-gray-600">Loading winners...</p>
              </div>
            ) : winners.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 px-4"
              >
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Trophy className="w-12 h-12 text-blue-400" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  No Winners Yet
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  The draw hasn't been conducted yet. Winners will appear here
                  once selected.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {winners.map((winner, index) => (
                  <motion.div
                    key={winner.documentId || index}
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.05, type: "spring" }}
                    whileHover={{
                      y: -10,
                      transition: { type: "spring", stiffness: 300 },
                    }}
                    className="group cursor-pointer bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 overflow-hidden relative"
                    onClick={() => {
                      setSelectedWinner(winner);
                      setShowWinnerModal(true);
                    }}
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Floating particles */}
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-blue-400 rounded-full"
                          initial={{
                            x: Math.random() * 100 + "%",
                            y: "120%",
                            opacity: 0,
                          }}
                          animate={{
                            y: "-20%",
                            opacity: [0, 0.8, 0],
                          }}
                          transition={{
                            duration: 2,
                            delay: i * 0.3,
                            repeat: Infinity,
                          }}
                        />
                      ))}
                    </div>

                    {/* Winner Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">
                            #{index + 1}
                          </span>
                        </div>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center"
                        >
                          <Crown className="w-3 h-3 text-white fill-white" />
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="relative p-5">
                      {/* Profile */}
                      <div className="flex flex-col items-center text-center mb-5">
                        <div className="relative mb-4">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl relative"
                          >
                            {/* Image glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-md"></div>

                            {winner.Photo?.url ? (
                              <img
                                src={
                                  winner.Photo?.url
                                    ? `${MEDIA_BASE_URL}${winner.Photo.url}`
                                    : "/default-avatar.png"
                                }
                                alt={winner.Name}
                                className="relative w-full h-full object-cover z-10"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.parentNode.innerHTML = `
                                    <div class="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center z-10 relative">
                                      <svg class="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                      </svg>
                                    </div>
                                  `;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center z-10 relative">
                                <User className="w-16 h-16 text-blue-400" />
                              </div>
                            )}
                          </motion.div>
                          {winner.isVerified && (
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-20"
                            >
                              <CheckCircle className="w-5 h-5 text-white" />
                            </motion.div>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
                          {winner.Name || "Unknown"}
                        </h3>
                        <p className="text-gray-500 text-sm mb-3 truncate w-full">
                          {winner.Email || "No email"}
                        </p>

                        {/* Animated Stats */}
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {[
                            { bg: "blue", text: winner.Gender || "N/A" },
                            {
                              bg: "indigo",
                              text: `Age: ${winner.Age || "N/A"}`,
                            },
                            {
                              bg: "emerald",
                              text: winner.Phone_Number || "No Phone",
                            },
                          ].map((tag, tagIndex) => (
                            <motion.span
                              key={tagIndex}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 + tagIndex * 0.1 }}
                              whileHover={{ scale: 1.1 }}
                              className={`px-3 py-1 bg-${tag.bg}-100 text-${tag.bg}-700 text-xs font-semibold rounded-full`}
                            >
                              {tag.text}
                            </motion.span>
                          ))}
                        </div>
                      </div>

                      {/* View Details Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-3 cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
                      >
                        {/* Button shimmer */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                        <Eye className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">View Details</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Winner Detail Modal */}
      {showWinnerModal && (
        <WinnerDetailModal
          winner={selectedWinner}
          onClose={() => {
            setShowWinnerModal(false);
            setSelectedWinner(null);
          }}
        />
      )}

      {/* Payment Tracking Modal */}
      {showPaymentsModal && (
        <PaymentTrackingModal onClose={() => setShowPaymentsModal(false)} />
      )}

      {/* Global Styles */}
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        /* Smooth scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(59, 130, 246, 0.1);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
    </motion.div>
  );
};

export default LuckyDrawDashboard;