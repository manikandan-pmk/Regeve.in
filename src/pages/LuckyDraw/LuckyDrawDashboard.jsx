import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
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
  Gift,
  Sparkles,
  Ticket,
  TrendingUp,
  PieChart as PieChartIcon,
  CalendarDays,
  Wallet,
  RefreshCw,
  ChevronRight,
  ArrowLeft,
  User,
  BarChart3,
  Home,
} from "lucide-react";

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
  const { adminId, luckydrawDocumentId  } = useParams();
  const navigate = useNavigate();
  const [luckyDrawData, setLuckyDrawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalParticipants: 0,
    totalAmount: 0,
    daysRemaining: 0,
    activeDraws: 0,
  });

  useEffect(() => {
    if (!documentId) {
      setError("Document ID missing in URL");
      setLoading(false);
      return;
    }
    fetchLuckyDrawData();
  }, [documentId]);

  const fetchLuckyDrawData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!documentId || documentId === "undefined") {
        throw new Error("Invalid document ID");
      }

      const response = await axiosWithAuth.get(
        `/lucky-draw-names/${documentId}`
      );
      const data = response.data;

      if (!data || typeof data !== "object") {
        throw new Error("Invalid response data");
      }

      setLuckyDrawData(data);
      setStats({
        totalParticipants: data.Number_of_Peoples || 0,
        totalAmount: parseFloat(data.Amount) || 0,
        daysRemaining: calculateDaysRemaining(
          data.Duration_Value,
          data.Duration_Unit
        ),
        activeDraws: data.LuckyDraw_Status === "Active" ? 1 : 0,
      });
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
      Created: "bg-blue-100 text-blue-800",
      Active: "bg-green-100 text-green-800",
      Completed: "bg-purple-100 text-purple-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md p-8 bg-white rounded-xl border border-gray-200 shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl text-gray-800 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchLuckyDrawData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!luckyDrawData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl text-gray-800 mb-2">
            No Lucky Draw Data Found
          </h2>
          <p className="text-gray-600 mb-4">
            Please check the document ID and try again
          </p>
          <button
            onClick={() => navigate("/lucky-draw")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Lucky Draw Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-6">
      {/* Header with Navigation */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          {/* Navigation Bar */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow border border-gray-100 mb-6">
  {/* Left: Back button */}
  <button
    onClick={() =>navigate(`/${adminId}/LuckyDrawHome`)}
    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors"
  >
    <ArrowLeft className="w-5 h-5 md:mr-2" />
    <span className="hidden md:inline font-medium">Back to LuckyDraw Home</span>
    <span className="md:hidden font-medium">Back</span>
  </button>

  {/* Right: Buttons */}
  <div className="flex items-center gap-2">
    <button
  onClick={() =>
    navigate(`/${adminId}/luckydraw-participant-dashboard/${documentId}`)
  }
  className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors"
>
  <User className="w-5 h-5" />
  <span className="font-medium">Participant Dashboard</span>
</button>

    
    {/* Mobile version */}
    <button
      onClick={() => navigate(`/participants/${documentId}`)}
      className="md:hidden p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      title="Participants"
    >
      <User className="w-5 h-5" />
    </button>
    
    <button
      onClick={fetchLuckyDrawData}
      className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
      title="Refresh"
    >
      <RefreshCw className="w-5 h-5 text-gray-600" />
    </button>
  </div>
</div>

          {/* Main Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                    <Sparkles className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {luckyDrawData.Name || "Lucky Draw"}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(
                          luckyDrawData.LuckyDraw_Status
                        )}`}
                      >
                        {luckyDrawData.LuckyDraw_Status === "Active" && (
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        )}
                        {luckyDrawData.LuckyDraw_Status || "Unknown"}
                      </span>
                      <span className="text-gray-500 text-sm flex items-center gap-2">
                        <Ticket className="w-4 h-4" />
                        ID: {luckyDrawData.LuckyDrawName_ID || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button className="group bg-gradient-to-r from-emerald-500 to-green-600 text-white px-7 py-3.5 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-3">
                <Target className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">Draw Now</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards with Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Participants Card */}
          <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-500 hover:scale-[1.02] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:scale-110 transition-transform duration-500">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-gray-900 mb-1 animate-fade-in">
                  {stats.totalParticipants}
                </div>
                <div className="text-sm text-gray-500">Participants</div>
              </div>
            </div>
            <div className="relative pt-2">
              <div className="text-sm text-gray-600 mb-2">Weekly Growth</div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(
                      (stats.totalParticipants / 100) * 10,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Total Prize Pool Card */}
          <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-200 transition-all duration-500 hover:scale-[1.02] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 group-hover:scale-110 transition-transform duration-500">
                <DollarSign className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-gray-900 mb-1 animate-fade-in">
                  {formatCurrency(stats.totalAmount)}
                </div>
                <div className="text-sm text-gray-500">Prize Pool</div>
              </div>
            </div>
            <div className="relative pt-2">
              <div className="text-sm text-gray-600 mb-2">Daily Increase</div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 font-semibold">+12.5%</span>
              </div>
            </div>
          </div>

          {/* Days Remaining Card */}
          <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-purple-200 transition-all duration-500 hover:scale-[1.02] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 group-hover:scale-110 transition-transform duration-500">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-gray-900 mb-1 animate-fade-in">
                  {stats.daysRemaining}
                </div>
                <div className="text-sm text-gray-500">Days Remaining</div>
              </div>
            </div>
            <div className="relative pt-2">
              <div className="text-sm text-gray-600 mb-2">Time Progress</div>
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

          {/* Duration Card */}
          <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-amber-200 transition-all duration-500 hover:scale-[1.02] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 group-hover:scale-110 transition-transform duration-500">
                <Calendar className="w-8 h-8 text-amber-600" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-gray-900 mb-1 animate-fade-in">
                  {luckyDrawData.Duration_Value || 0}
                </div>
                <div className="text-sm text-gray-500">
                  {luckyDrawData.Duration_Unit || "Days"}
                </div>
              </div>
            </div>
            <div className="relative pt-2">
              <div className="text-sm text-gray-600 mb-2">Total Duration</div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-amber-500" />
                <span className="text-gray-700">
                  {luckyDrawData.Duration_Value} {luckyDrawData.Duration_Unit}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .group:hover .float-animation {
          animation: float 2s ease-in-out infinite;
        }

        .stats-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.7s;
        }

        .stats-card:hover::before {
          left: 100%;
        }

        .gradient-border {
          position: relative;
          background: linear-gradient(white, white) padding-box,
            linear-gradient(45deg, #3b82f6, #8b5cf6) border-box;
          border: 1px solid transparent;
        }
      `}</style>
    </div>
  );
};

export default LuckyDrawDashboard;