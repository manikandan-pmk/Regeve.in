import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "/re.png";
import { adminNavigate } from "../utils/adminNavigation";

import {
  FiLogOut,
  FiRefreshCw,
  FiChevronRight,
  FiCheckCircle,
  FiLock,
  FiStar,
  FiActivity,
  FiBarChart2,
  FiZap,
  FiHelpCircle,
  FiUsers,
  FiCalendar,
  FiTrendingUp,
} from "react-icons/fi";
import {
  RiDashboardLine,
  RiRestaurantLine,
  RiVipDiamondLine,
} from "react-icons/ri";
import {
  MdHowToVote,
  MdCardGiftcard,
  MdDescription,
  MdEventAvailable,
} from "react-icons/md";

// Service Card Component
const ServiceCard = ({
  icon,
  title,
  description,
  onClick,
  color,
  isActive = true,
  isNew = false,
  isLoading = false,
  stats = null,
}) => {
  const IconComponent = icon;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        relative rounded-2xl overflow-hidden
        ${
          isActive
            ? "bg-gradient-to-br from-white to-gray-50/80 shadow-lg hover:shadow-2xl cursor-pointer"
            : "bg-gradient-to-br from-gray-50/50 to-gray-100/50 shadow-md cursor-not-allowed"
        }
        border border-gray-200/70 backdrop-blur-sm
        group transition-all duration-300
      `}
      onClick={isActive && !isLoading ? onClick : null}
    >
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <motion.div
              className={`
                w-14 h-14 rounded-xl flex items-center justify-center
                transition-all duration-500 group-hover:scale-110
                ${isActive ? color : `${color.split(" ")[0]} opacity-30`}
                shadow-lg
              `}
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              {typeof icon === "string" ? (
                <span className="text-2xl text-white">{icon}</span>
              ) : (
                <IconComponent className="w-7 h-7 text-white" />
              )}
            </motion.div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                {isNew && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full"
                  >
                    NEW
                  </motion.span>
                )}
              </div>

              <p className="text-sm text-gray-600 mt-1 max-w-xs">
                {description}
              </p>
            </div>
          </div>

          <motion.div
            animate={{
              scale: isActive ? [1, 1.1, 1] : 1,
              transition: { repeat: Infinity, duration: 2 },
            }}
          >
            {isActive ? (
              <div className="flex items-center gap-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                <FiCheckCircle className="w-4 h-4" />
                <span className="text-xs font-semibold">ACTIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 px-3 py-1.5 rounded-full border border-gray-300">
                <FiLock className="w-4 h-4" />
                <span className="text-xs font-semibold">LOCKED</span>
              </div>
            )}
          </motion.div>
        </div>

        {stats && isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gradient-to-r from-gray-50/50 to-white/30 rounded-xl border border-gray-200/50"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        <div
          className={`
          flex items-center justify-between mt-6 pt-4
          ${isActive ? "border-t border-gray-200" : "border-t border-gray-300"}
        `}
        >
          <div className="flex items-center">
            <span
              className={`
              text-sm font-medium transition-colors duration-300
              ${
                isActive
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                  : "text-gray-400"
              }
            `}
            >
              {isActive ? "Launch Service →" : "Upgrade to Access"}
            </span>
          </div>

          <motion.div
            animate={
              isActive
                ? {
                    x: [0, 5, 0],
                    transition: { repeat: Infinity, duration: 1.5 },
                  }
                : {}
            }
          >
            <FiChevronRight
              className={`
              w-5 h-5 transition-all duration-300
              ${
                isActive
                  ? "text-blue-600 group-hover:translate-x-1"
                  : "text-gray-400"
              }
            `}
            />
          </motion.div>
        </div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Launching...</p>
            </div>
          </motion.div>
        )}
      </div>

      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
};

// Stats Card Component
const StatsCard = ({
  icon,
  title,
  value,
  change,
  color,
  gradient,
  isLoading = false,
}) => {
  const IconComponent = icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className={`
        relative overflow-hidden rounded-2xl p-6
        ${gradient || "bg-gradient-to-br from-white to-gray-50"}
        shadow-lg border border-gray-200/50
      `}
    >
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} shadow-lg`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          {change && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
                change > 0
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700"
                  : "bg-gradient-to-r from-red-50 to-rose-50 text-rose-700"
              }`}
            >
              {change > 0 ? "↗" : "↘"} {Math.abs(change)}%
            </motion.div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>
        ) : (
          <>
            <motion.div
              className="text-3xl font-bold text-gray-900 mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {value}
            </motion.div>

            <div className="text-sm text-gray-600 font-medium">{title}</div>

            <div className="mt-4 relative">
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

// Main Dashboard Component
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({
    accessible: 0,
    upgradeAvailable: 0,
    usagePercentage: 0,
    totalUsers: 0,
    totalEvents: 0,
  });
  const [loadingStates, setLoadingStates] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const adminId = localStorage.getItem("adminId");

  // Services configuration
  const servicesConfig = {
    "Digital Registration": {
      id: "digitalRegistration",
      icon: MdDescription,
      title: "Digital Registration",
      description:
        "Manage event registrations, attendee forms, and digital sign-ups",
      color: "bg-gradient-to-r from-indigo-500 to-purple-600",
      route: "/event-form",
      dataKey: "Digital Registration",
    },
    "Food Management": {
      id: "foodManagement",
      icon: RiRestaurantLine,
      title: "Food Management",
      description: "Catering orders, menu planning, and vendor coordination",
      color: "bg-gradient-to-r from-emerald-500 to-teal-600",
      route: "/dashboard",
      dataKey: "Food Management",
    },
    "Election System": {
      id: "electionSystem",
      icon: MdHowToVote,
      title: "Election System",
      description: "Event voting, polls, and real-time decision making",
      color: "bg-gradient-to-r from-blue-500 to-cyan-600",
      route: "/electionhome",
      dataKey: "Election System",
    },
    "Lucky Draw": {
      id: "luckydraw",
      icon: MdCardGiftcard,
      title: "Lucky Draw",
      description: "Raffles, giveaways, and prize distribution management",
      color: "bg-gradient-to-r from-pink-500 to-rose-600",
      route: "/LuckyDrawHome",
      dataKey: "Lucky Draw",
    },
    Dashboard: {
      id: "dashboard",
      icon: RiDashboardLine,
      title: "Event Analytics",
      description: "Real-time event metrics and performance dashboards",
      color: "bg-gradient-to-r from-amber-500 to-orange-600",
      route: "/dashboard",
      isNew: true,
    },
  };

  // Fetch admin data from API
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("jwt");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "https://api.regeve.in/api/admin/find",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          const admin = response.data.admin;
          const userServices = response.data.services || {};

          // count only services shown in UI
          const accessibleServices = Object.keys(servicesConfig).filter(
            (key) => userServices[key] === true
          );

          const activeServicesCount = accessibleServices.length;
          const totalServices = Object.keys(servicesConfig).length;

          setAdminData({
            name: admin.name,
            email: admin.email,
            subscription: admin.subscription || "Professional",
            lastLogin: admin.lastLogin || new Date().toISOString(),
            services: userServices,
          });

          setStats({
            accessible: activeServicesCount,
            upgradeAvailable: totalServices - activeServicesCount,
          });

          const processedServices = Object.keys(servicesConfig).map((key) => ({
            ...servicesConfig[key],
            isActive: userServices[key] === true,
            isLoading: false,
          }));

          setServices(processedServices);
        } else {
          throw new Error("Failed to fetch admin data");
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);

        // Fallback to localStorage data
        const storedData = localStorage.getItem("userProfile");
        if (storedData) {
          try {
            const data = JSON.parse(storedData);
            const userServices = data.Services || {};
            const accessibleServices = Object.keys(userServices).filter(
              (key) => userServices[key] === true
            );
            const activeServicesCount = accessibleServices.length;
            const totalServices = Object.keys(servicesConfig).length;
            const usagePercentage = Math.round(
              (activeServicesCount / totalServices) * 100
            );

            setAdminData({
              name: data.name || "Event Manager",
              email: data.email || "manager@example.com",
              services: userServices,
              accessibleServices,
              activeServicesCount,
              totalUsers: data.totalUsers || 0,
              totalEvents: data.totalEvents || 0,
            });

            setStats({
              accessible: activeServicesCount,
              upgradeAvailable: totalServices - activeServicesCount,
              usagePercentage,
              totalUsers: data.totalUsers || 0,
              totalEvents: data.totalEvents || 0,
            });

            const processedServices = Object.keys(servicesConfig).map(
              (key) => ({
                ...servicesConfig[key],
                isActive: Boolean(userServices[key]),
                isLoading: false,
              })
            );
            setServices(processedServices);
          } catch (parseError) {
            console.error("Error parsing stored data:", parseError);
            navigate("/login");
          }
        } else {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  const handleServiceClick = async (service) => {
    if (!service.isActive) {
      setShowUpgradeModal(true);
      return;
    }

    // Parse current URL to see what adminId is in the URL
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    console.log("Path parts:", pathParts);

    if (pathParts.length > 0) {
      console.log("AdminId from URL:", pathParts[0]);
    }

    setLoadingStates((prev) => ({ ...prev, [service.id]: true }));
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoadingStates((prev) => ({ ...prev, [service.id]: false }));

    // Try navigation with the adminId from current URL
    const currentAdminId = pathParts[0] || adminId;
    if (currentAdminId) {
      navigate(`/${currentAdminId}${service.route}`);
    } else {
      navigate("/regeve-admin");
    }
  };
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleUpgradeAccess = () => {
    setShowUpgradeModal(true);
  };

  const handleRefresh = async () => {
    setLoading(true);
    window.location.reload();
  };

  const filteredServices = services
    .filter((service) => {
      if (activeTab === "active") return service.isActive;
      if (activeTab === "locked") return !service.isActive;
      return true;
    })
    .filter(
      (service) =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Active services first
      return Number(b.isActive) - Number(a.isActive);
    });

  const accessibleServices = services.filter((s) => s.isActive);
  const lockedServices = services.filter((s) => !s.isActive);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 border-4 border-blue-600/20 rounded-full"></div>
            <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full absolute inset-0 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
              />
            </div>
          </div>
          <p className="mt-6 text-gray-700 font-semibold text-lg">
            Loading Event Dashboard...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Fetching your data from API
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>

      {/* Top Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-white/90 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-200/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <img
                src={Logo}
                alt="Regeve Logo"
                className="h-16 w-auto object-contain"
              />
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar removed as requested */}

              {showUpgradeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border"
                  >
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <RiVipDiamondLine className="w-10 h-10 text-white" />
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Upgrade Required
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Access premium event management features.
                      </p>

                      <div className="space-y-3">
                        <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold">
                          Contact Support
                        </button>

                        <button
                          onClick={() => setShowUpgradeModal(false)}
                          className="w-full py-3 bg-gray-100 rounded-xl text-gray-700"
                        >
                          Maybe Later
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* User Profile */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">
                    {adminData?.name || "Event Manager"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {adminData?.subscription || "Professional"} Plan
                  </p>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {adminData?.name?.charAt(0)?.toUpperCase() || "E"}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
              </motion.div>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-4 py-2.5 cursor-pointer text-sm font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2 shadow-sm"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {adminData?.name || "Event Manager"}
                </span>
                <span className="ml-2 inline-block animate-float">🎯</span>
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your event services and access real-time analytics
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="px-4 py-2.5 cursor-pointer bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-2 shadow-sm"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUpgradeAccess}
                className="px-4 py-2.5 cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2 shadow-lg"
              >
                <FiStar className="w-4 h-4" />
                <span>Upgrade</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid - Removed Usage Percentage, Total Users, and Total Events as requested */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8"
        >
          <StatsCard
            icon={FiCheckCircle}
            title="Active Services"
            value={stats.accessible}
            color="bg-gradient-to-r from-green-500 to-emerald-600"
            gradient="bg-gradient-to-br from-white to-emerald-50/50"
            isLoading={loading}
          />

          <StatsCard
            icon={FiActivity}
            title="Upgrade Available"
            value={stats.upgradeAvailable}
            color="bg-gradient-to-r from-blue-500 to-cyan-600"
            gradient="bg-gradient-to-br from-white to-blue-50/50"
            isLoading={loading}
          />
        </motion.div>

        {/* Services Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
            {["all", "active", "locked"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-all duration-300
                  ${
                    activeTab === tab
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }
                `}
              >
                {tab === "all" && "All Services"}
                {tab === "active" && `Active (${accessibleServices.length})`}
                {tab === "locked" && `Locked (${lockedServices.length})`}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Services Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-gray-200/50"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Event Management Services
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {filteredServices.length} services available
                  </p>
                </div>

                <div className="mt-4 sm:mt-0">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mr-2"></div>
                      <span className="text-sm text-gray-600">Active</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 mr-2"></div>
                      <span className="text-sm text-gray-600">Locked</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Grid */}
              {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  <AnimatePresence>
                    {filteredServices.map((service, index) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ServiceCard
                          icon={service.icon}
                          title={service.title}
                          description={service.description}
                          color={service.color}
                          isActive={service.isActive}
                          isNew={service.isNew}
                          isLoading={loadingStates[service.id]}
                          onClick={() => handleServiceClick(service)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-gradient-to-br from-gray-50/50 to-white/30 rounded-2xl border-2 border-dashed border-gray-300"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Services Found
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchQuery
                      ? "Try a different search term"
                      : "No services match your current filter"}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Account Summary */}
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-100/50 rounded-2xl p-6 border border-blue-200/50 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FiBarChart2 className="w-5 h-5 mr-2 text-blue-600" />
                Account Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-bold text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 rounded-full text-sm">
                    {adminData?.subscription || "Professional"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Services Used</span>
                  <span className="font-bold text-gray-900">
                    {stats.accessible}/{services.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Active</span>
                  <span className="text-sm text-gray-500">
                    {adminData?.lastLogin
                      ? new Date(adminData.lastLogin).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "Just now"}
                  </span>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/50 rounded-2xl p-6 border border-purple-200/50 shadow-lg overflow-hidden">
              <div className="relative">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-full blur-xl" />

                <div className="relative text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FiHelpCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Need Help?
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    24/7 event support and technical assistance
                  </p>
                  <button className="w-full cursor-pointer px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 shadow-md">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Compact Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white/90 backdrop-blur-sm border-t border-gray-200/50 py-4 mt-4"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-3 md:mb-0">
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} Regeve Event Management
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {adminData?.name || "Manager"} •{" "}
                {adminData?.email || "manager@example.com"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                Privacy
              </button>
              <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                Terms
              </button>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors flex items-center"
              >
                <FiLogOut className="w-3 h-3 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </motion.footer>
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <RiVipDiamondLine className="w-10 h-10 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Upgrade Required
              </h3>
              <p className="text-gray-600 mb-6">
                Access premium event management features.
              </p>

              <div className="space-y-3">
                <button className="w-full cursor-pointer py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold">
                  Contact Support
                </button>

                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full py-3 cursor-pointer bg-gray-100 rounded-xl text-gray-700"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
