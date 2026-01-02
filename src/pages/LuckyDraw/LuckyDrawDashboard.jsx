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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "https://api.regeve.in/api";

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
  const [loading, setLoading] = useState(true);
  const [winnersLoading, setWinnersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [stats, setStats] = useState({
    totalParticipants: 0,
    totalAmount: 0,
    daysRemaining: 0,
    activeDraws: 0,
    winnersCount: 0,
  });

  useEffect(() => {
    if (!luckydrawDocumentId) {
      setError("Lucky Draw ID missing in URL");
      setLoading(false);
      return;
    }
    fetchLuckyDrawData();
    fetchWinners();
  }, [luckydrawDocumentId]);

  const fetchLuckyDrawData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!luckydrawDocumentId || luckydrawDocumentId === "undefined") {
        throw new Error("Invalid lucky draw ID");
      }

      const response = await axiosWithAuth.get(
        `/lucky-draw-names/${luckydrawDocumentId}`
      );

      const data = response.data;

      if (!data || typeof data !== "object") {
        throw new Error("Invalid response data");
      }

      setLuckyDrawData(data);
      setStats((prev) => ({
        ...prev,
        totalParticipants: data.Number_of_Peoples || 0,
        totalAmount: parseFloat(data.Amount) || 0,
        daysRemaining: calculateDaysRemaining(
          data.Duration_Value,
          data.Duration_Unit
        ),
        activeDraws: data.LuckyDraw_Status === "Active" ? 1 : 0,
      }));
    } catch (error) {
      console.error("Axios Error:", error);
      if (error.response) {
        if (error.response.status === 401) {
          setError("Unauthorized. Please login again.");
        } else if (error.response.status === 403) {
          setError("Access forbidden. Permission denied.");
        } else {
          setError(
            error.response.data?.message ||
              `API Error: ${error.response.status}`
          );
        }
      } else {
        setError(error.message || "Failed to load data");
      }
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

  // Winner Detail Modal Component
  const WinnerDetailModal = ({ winner, onClose }) => {
    if (!winner) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Popup Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Winner Details
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Popup Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Profile */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center">
                    {/* Large Profile Image */}
                    <div className="relative mb-6">
                      <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden border-8 border-white shadow-2xl">
                        {winner.Photo?.url ? (
                          <img
                            src={`${winner.Photo.url.startsWith("http") ? "" : API_BASE_URL}${winner.Photo.url}`}
                            alt={winner.Name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentNode.innerHTML = `
                                <div class="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                  <svg class="w-24 h-24 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                  </svg>
                                </div>
                              `;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            <User className="w-24 h-24 text-blue-400" />
                          </div>
                        )}
                      </div>
                      {winner.isVerified && (
                        <div className="absolute bottom-2 right-2 lg:right-auto lg:left-1/2 lg:transform lg:-translate-x-1/2 w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {winner.Name || "Unknown"}
                    </h2>
                    <p className="text-gray-600 mb-4">{winner.Email}</p>

                    {/* Winner Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full mb-6">
                      <Crown className="w-5 h-5" />
                      <span className="font-bold">WINNER</span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" />
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Full Name
                          </p>
                          <p className="font-medium text-gray-900">
                            {winner.Name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Gender</p>
                          <p className="font-medium text-gray-900">
                            {winner.Gender || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Age</p>
                          <p className="font-medium text-gray-900">
                            {winner.Age || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Date of Birth
                          </p>
                          <p className="font-medium text-gray-900">
                            {winner.DOB || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-500" />
                        Contact Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Email Address
                          </p>
                          <p className="font-medium text-gray-900">
                            {winner.Email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Phone Number
                          </p>
                          <p className="font-medium text-gray-900">
                            {winner.Phone_Number || "N/A"}
                          </p>
                        </div>
                        {winner.Address && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-500 mb-1">
                              Address
                            </p>
                            <p className="font-medium text-gray-900">
                              {winner.Address}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-purple-500" />
                        Additional Information
                      </h4>
                      <div className="space-y-3">
                        {winner.Prize && (
                          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                            <Gift className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-sm text-gray-500">Prize Won</p>
                              <p className="font-bold text-blue-700">
                                {winner.Prize}
                              </p>
                            </div>
                          </div>
                        )}

                        {winner.WinningDate && (
                          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                            <div>
                              <p className="text-sm text-gray-500">
                                Winning Date
                              </p>
                              <p className="font-medium text-gray-900">
                                {new Date(
                                  winner.WinningDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Popup Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Add action for full profile view
                    console.log("View full profile:", winner);
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-300"
                >
                  View Full Profile
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-[6px] border-blue-100"></div>
              <div className="absolute inset-4 rounded-full border-[6px] border-blue-300 animate-ping"></div>
              <div className="absolute inset-6 rounded-full border-[6px] border-blue-500 animate-spin"></div>
            </div>
            <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          </div>
          <p className="text-gray-700 text-lg font-medium">
            Loading dashboard...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Preparing your lucky draw experience
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md p-8 bg-white rounded-2xl border border-gray-200 shadow-xl hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-pink-100 rounded-full"></div>
            <AlertCircle className="w-12 h-12 text-red-500 absolute inset-0 m-auto animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Failed to Load Data
          </h2>
          <p className="text-gray-600 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {error}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={fetchLuckyDrawData}
              className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 group"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Retry
            </button>
            <button
              onClick={() => navigate("/lucky-draw")}
              className="cursor-pointer px-6 py-3 rounded-xl border border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 text-gray-700 hover:text-blue-700"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!luckyDrawData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl border border-gray-200 shadow-xl">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            No Lucky Draw Data Found
          </h2>
          <p className="text-gray-600 mb-6">
            Please check the document ID and try again
          </p>
          <button
            onClick={() => navigate("/lucky-draw")}
            className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Go to Lucky Draw Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Navigation */}
        <div className="sticky top-4 z-10">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Navigation */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-4"
              >
                <div className="flex items-center justify-between">
                  <button
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
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Right Actions */}
            <div className="flex gap-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-4 "
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      navigate(
                        `/${adminId}/luckydraw-participant-dashboard/${luckydrawDocumentId}`
                      )
                    }
                    className="cursor-pointer flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group"
                  >
                    <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold hidden md:inline">
                      Participants
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      fetchLuckyDrawData();
                      fetchWinners();
                    }}
                    className="cursor-pointer p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 group"
                    title="Refresh Dashboard"
                  >
                    <RefreshCw className="w-5 h-5 text-gray-600 group-hover:text-blue-600 group-hover:rotate-180 transition-all duration-500" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden"
        >
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Sparkles className="w-8 h-8 text-blue-800" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
                        {luckyDrawData.Name || "Lucky Draw"}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                            luckyDrawData.LuckyDraw_Status
                          )}`}
                        >
                          {luckyDrawData.LuckyDraw_Status === "Active" && (
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-ping mr-2"></span>
                          )}
                          {luckyDrawData.LuckyDraw_Status || "Unknown"}
                        </span>
                        <span className="text-black/80 text-sm flex items-center gap-2">
                          <Ticket className="w-4 h-4" />
                          ID: {luckyDrawData.LuckyDrawName_ID || "N/A"}
                        </span>
                        <span className="text-black/80 text-sm flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          Created: {formatDate(luckyDrawData.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate(`/${adminId}/luckydraw/${luckydrawDocumentId}`)
                  }
                  className="cursor-pointer group bg-gradient-to-r from-white to-blue-100 text-blue-700 hover:text-blue-800 px-8 py-4 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3 shadow-lg"
                >
                  <Target className="w-6 h-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                  <div className="text-left">
                    <span className="font-bold text-lg">Draw Now</span>
                    <p className="text-sm text-blue-600 opacity-80">
                      Start the lucky draw
                    </p>
                  </div>
                  <ChevronsRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Participants Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group cursor-pointer bg-white rounded-2xl p-6 border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.totalParticipants}
                  </div>
                  <div className="text-sm text-gray-500">Participants</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Daily Growth</span>
                  <span className="flex items-center gap-1 text-green-600 font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    +5.2%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(stats.totalParticipants * 0.5, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Total Prize Pool Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group cursor-pointer bg-white rounded-2xl p-6 border border-emerald-100 hover:border-emerald-300 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl">
                  <DollarSign className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(stats.totalAmount)}
                  </div>
                  <div className="text-sm text-gray-500">Prize Pool</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Amount per winner</span>
                  <span className="text-emerald-600 font-semibold">
                    {stats.winnersCount > 0
                      ? formatCurrency(stats.totalAmount / stats.winnersCount)
                      : formatCurrency(0)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(
                        (stats.totalAmount / 10000) * 10,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Winners Count Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group cursor-pointer bg-white rounded-2xl p-6 border border-amber-100 hover:border-amber-300 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl">
                  <Crown className="w-7 h-7 text-amber-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.winnersCount}
                  </div>
                  <div className="text-sm text-gray-500">Winners</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Win Rate</span>
                  <span className="text-amber-600 font-semibold flex items-center gap-1">
                    <Percent className="w-4 h-4" />
                    {stats.totalParticipants > 0
                      ? (
                          (stats.winnersCount / stats.totalParticipants) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${
                        stats.totalParticipants > 0
                          ? (stats.winnersCount / stats.totalParticipants) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Days Remaining Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group cursor-pointer bg-white rounded-2xl p-6 border border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                  <Calendar className="w-7 h-7 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.daysRemaining}
                  </div>
                  <div className="text-sm text-gray-500">Days Left</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="text-purple-600 font-semibold">
                    {Math.min(
                      Math.round((stats.daysRemaining / 365) * 100),
                      100
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(
                        (stats.daysRemaining / 365) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Winners Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
        >
          <div className="p-6 md:p-8">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <Crown className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Winners List
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Congratulations to all our lucky winners!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-semibold text-blue-700">
                    Total: {winners.length} Winner
                    {winners.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <button
                  onClick={fetchWinners}
                  disabled={winnersLoading}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${winnersLoading ? "animate-spin" : ""}`}
                  />
                  <span className="font-medium hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Winners Grid */}
            {winnersLoading ? (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center mb-4">
                  <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600">Loading winners...</p>
              </div>
            ) : winners.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  No Winners Yet
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  The draw hasn't been conducted yet. Winners will appear here
                  once selected.
                </p>
                <button
                  onClick={() =>
                    navigate(`/${adminId}/luckydraw/${luckydrawDocumentId}`)
                  }
                  className="cursor-pointer inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Zap className="w-5 h-5" />
                  Start First Draw
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {winners.map((winner, index) => (
                  <motion.div
                    key={winner.documentId || index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 overflow-hidden"
                    onClick={() => {
                      setSelectedWinner(winner);
                      setShowWinnerModal(true);
                    }}
                  >
                    {/* Winner Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Crown className="w-3 h-3 text-white fill-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Profile */}
                      <div className="flex flex-col items-center text-center mb-5">
                        <div className="relative mb-4">
                          <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                            {winner.Photo?.url ? (
                              <img
                                src={`${winner.Photo.url.startsWith("http") ? "" : API_BASE_URL}${winner.Photo.url}`}
                                alt={winner.Name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.parentNode.innerHTML = `
                                    <div class="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                      <svg class="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                      </svg>
                                    </div>
                                  `;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                <User className="w-16 h-16 text-blue-400" />
                              </div>
                            )}
                          </div>
                          {winner.isVerified && (
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
                          {winner.Name || "Unknown"}
                        </h3>
                        <p className="text-gray-500 text-sm mb-3 truncate w-full">
                          {winner.Email || "No email"}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            {winner.Gender || "N/A"}
                          </span>
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                            Age: {winner.Age || "N/A"}
                          </span>
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                            {winner.Phone_Number || "No Phone"}
                          </span>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group">
                        <Eye className="w-4 h-4" />
                        View Details
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
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

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .shimmer {
          position: relative;
          overflow: hidden;
        }

        .shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shimmer 2s infinite;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .gradient-text {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% auto;
          animation: gradient 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LuckyDrawDashboard;