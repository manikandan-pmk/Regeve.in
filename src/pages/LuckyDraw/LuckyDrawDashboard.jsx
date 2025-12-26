import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FaTrophy,
  FaUserCheck,
  FaUsers,
  FaSearch,
  FaRandom,
  FaTimes,
  FaFilter,
  FaCrown,
  FaUserTimes,
  FaUserClock,
} from "react-icons/fa";

const LuckyDrawDashboard = () => {
  const navigate = useNavigate();
  const adminId = localStorage.getItem("adminId");

  // ----------------------------- STATES -----------------------------
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    totalRegistered: 0,
    totalVerified: 0,
    totalWinners: 0,
    notVerified: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    verifiedOnly: false,
    presentOnly: false,
    hasNotWon: false,
  });

  const [selectedWinner, setSelectedWinner] = useState(null);
  const [winnersList, setWinnersList] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newImageFile, setNewImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [activeParticipant, setActiveParticipant] = useState(null);
  const [editForm, setEditForm] = useState({
    Name: "",
    Email: "",
    Phone_Number: "",
    Gender: "",
    Age: "",
    ID_card: "",
  });

  const openViewModal = (user) => {
    setActiveParticipant(user);
    setShowViewModal(true);
  };

  const openEditModal = (user) => {
    setActiveParticipant(user);

    setEditForm({
      Name: user.name || "",
      Email: user.email || "",
      Phone_Number: user.phone || "",
      Gender: user.gender || "",
      Age: user.age || "",
      ID_card: user.userId || "",
    });

    setImagePreview(user.userImage);
    setNewImageFile(null);

    setShowEditModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem("jwt");
      let uploadedImageId = null;

      // 1️⃣ Upload image if changed
      if (newImageFile) {
        const formData = new FormData();
        formData.append("files", newImageFile);

        const uploadRes = await axios.post(
          "https://api.regeve.in/api/upload",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        uploadedImageId = uploadRes.data[0].id;
      }

      // 2️⃣ Update participant data
      await axios.put(
        `${API_URL}/${activeParticipant.luckyDrawId}`,
        {
          data: {
            Name: editForm.Name,
            Email: editForm.Email,
            Phone_Number: editForm.Phone_Number,
            Gender: editForm.Gender,
            Age: editForm.Age,
            ID_card: editForm.ID_card,
            ...(uploadedImageId && { Photo: uploadedImageId }),
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 3️⃣ Update UI instantly
      setAllUsers((prev) =>
        prev.map((u) =>
          u.luckyDrawId === activeParticipant.luckyDrawId
            ? {
                ...u,
                name: editForm.Name,
                email: editForm.Email,
                phone: editForm.Phone_Number,
                gender: editForm.Gender,
                age: editForm.Age,
                userId: editForm.ID_card,
                userImage: uploadedImageId ? imagePreview : u.userImage,
              }
            : u
        )
      );

      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const API_URL = "https://api.regeve.in/api/lucky-draw-forms";

  const fetchParticipants = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const token = localStorage.getItem("jwt");

      const response = await axios.get(`${API_URL}?pagination[pageSize]=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const users = response.data.data.map((item) => ({
        id: item.id,
        name: item.Name,
        userId: item.ID_card,
        luckyDrawId: item.LuckyDraw_ID,
        isVerified: item.isVerified ?? false,
        isWinner: false,
        isPresent: true,
        userImage: item.Photo?.url
          ? `https://api.regeve.in${item.Photo.url}`
          : "https://via.placeholder.com/150",
        email: item.Email,
        phone: item.Phone_Number,
        gender: item.Gender,
        age: item.Age,
      }));

      // ✅ MERGE instead of replace
      setAllUsers((prev) => {
        const map = new Map(prev.map((u) => [u.luckyDrawId, u]));

        users.forEach((u) => {
          map.set(u.luckyDrawId, {
            ...map.get(u.luckyDrawId),
            ...u,
          });
        });

        return Array.from(map.values());
      });
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch participants
  useEffect(() => {
    fetchParticipants(); // initial load with loader

    const interval = setInterval(() => {
      fetchParticipants(true); // silent refresh
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Update dashboard data whenever allUsers changes
  useEffect(() => {
    setDashboardData({
      totalRegistered: allUsers.length,
      totalVerified: allUsers.filter((u) => u.isVerified).length,
      totalWinners: allUsers.filter((u) => u.isWinner).length,
      notVerified: allUsers.filter((u) => !u.isVerified).length,
    });
  }, [allUsers]); // This runs whenever allUsers changes

  // ----------------------------- FILTER LOGIC -----------------------------
  useEffect(() => {
  let result = [...allUsers];

  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    result = result.filter(
      (u) =>
        u.name?.toLowerCase().includes(term) ||
        u.userId?.toLowerCase().includes(term) ||
        u.phone?.toString().toLowerCase().includes(term)
    );
  }

  if (filters.verifiedOnly) {
    result = result.filter((u) => u.isVerified);
  }

  if (filters.presentOnly) {
    result = result.filter((u) => u.isPresent);
  }

  if (filters.hasNotWon) {
    result = result.filter((u) => !u.isWinner);
  }

  setFilteredUsers(result);
}, [allUsers, searchTerm, filters]);


  // ----------------------------- VERIFICATION TOGGLE -----------------------------
  const handleVerificationToggle = async (luckyDrawId, currentStatus) => {
    try {
      const token = localStorage.getItem("jwt");
      const newStatus = !currentStatus;

      await axios.put(
        `https://api.regeve.in/api/lucky-draw-forms/${luckyDrawId}`,
        {
          data: { isVerified: newStatus },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ instant UI update for allUsers AND dashboardData
      setAllUsers((prev) =>
        prev.map((u) =>
          u.luckyDrawId === luckyDrawId ? { ...u, isVerified: newStatus } : u
        )
      );

      // ✅ No need to manually update dashboardData here because
      // the useEffect above will automatically recalculate it
    } catch (error) {
      console.error(error);
      alert("Verification update failed");
    }
  };

  // ----------------------------- RESET WINNER -----------------------------
  const resetWinner = (memberId) => {
    if (!window.confirm("Are you sure you want to remove this winner?")) return;

    // Remove from winners list
    const updatedWinners = winnersList.filter((w) => w.userId !== memberId);
    setWinnersList(updatedWinners);
    localStorage.setItem("luckyDrawWinners", JSON.stringify(updatedWinners));

    // Reset winner status in local state
    setAllUsers((prev) =>
      prev.map((u) => (u.userId === memberId ? { ...u, isWinner: false } : u))
    );
  };

  // ----------------------------- CLEAR ALL WINNERS -----------------------------
  const clearAllWinners = () => {
    if (
      !window.confirm(
        "Are you sure you want to clear all winners? This cannot be undone."
      )
    )
      return;

    setWinnersList([]);
    localStorage.removeItem("luckyDrawWinners");

    // Reset winner status for all users
    setAllUsers((prev) => prev.map((u) => ({ ...u, isWinner: false })));
  };

  // ----------------------------- UI -----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
              🎉 Lucky Draw Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-base md:text-lg">
              Manage lucky draws for verified participants in real-time
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {showCopySuccess && (
              <div className="fixed bottom-4 right-4 animate-fade-in-up z-50">
                <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce-in">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Participant form link copied to clipboard!</span>
                </div>
              </div>
            )}
            {/* Lucky Draw Register Form Button */}
            <button
              onClick={async (event) => {
                const baseUrl = window.location.origin;
                const participantFormLink = `${baseUrl}/#/${adminId}/luckydraw-form`;

                try {
                  await navigator.clipboard.writeText(participantFormLink);

                  // Show success animation
                  setShowCopySuccess(true);

                  // Auto-hide after 3 seconds
                  setTimeout(() => {
                    setShowCopySuccess(false);
                  }, 3000);

                  // Optional: Add button animation
                  event.currentTarget.classList.add("animate-pulse");
                  setTimeout(() => {
                    event.currentTarget.classList.remove("animate-pulse");
                  }, 500);
                } catch (err) {
                  console.error("Failed to copy: ", err);
                  // Show error state if needed
                  event.currentTarget.classList.add("animate-shake");
                  setTimeout(() => {
                    event.currentTarget.classList.remove("animate-shake");
                  }, 500);
                }
              }}
              className="px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 hover:bg-blue-700 text-white hover:from-blue-700 hover:to-emerald-700 text-white font-semibold rounded-xl md:rounded-2xl shadow-md  flex items-center gap-2"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-200 group-hover:rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Participant Form
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-8 md:mb-10">
        {/* Total Registered - Slot Machine Theme */}
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl md:rounded-4xl p-5 md:p-7 shadow-2xl border-2 border-indigo-200/50 transform hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl"></div>
          <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-gradient-to-tr from-blue-300/5 to-cyan-300/5 rounded-full blur-lg"></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                  <p className="text-blue-700/90 font-semibold text-sm md:text-base tracking-wide uppercase">
                    Total Tickets
                  </p>
                </div>
                <div className="relative">
                  <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-1 animate-count-up">
                    {dashboardData.totalRegistered}
                  </h3>
                  <div className="absolute -right-2 -top-2 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce"></div>
                </div>
                <p className="text-xs text-gray-600/80 mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  All participants entered
                </p>
              </div>
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl md:rounded-3xl shadow-2xl group-hover:scale-110 group-hover:rotate-[360deg] transition-all duration-700">
                  <FaUsers className="text-white text-xl md:text-2xl" />
                </div>
                {/* Ring effect */}
                <div className="absolute inset-0 rounded-2xl md:rounded-3xl border-2 border-blue-400/30 animate-ping opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
            {/* Animated progress bar with slot machine effect */}
            <div className="mt-6 relative">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Ticket Pool</span>
                <span className="font-semibold">100%</span>
              </div>
              <div className="h-2 bg-gradient-to-r from-blue-100/50 to-purple-100/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Users - Golden Ticket Theme */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-3xl md:rounded-4xl p-5 md:p-7 shadow-2xl border-2 border-emerald-200/50 transform hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden">
          {/* Ticket perforation effect */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-full flex flex-col justify-between">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gradient-to-b from-emerald-100 to-white rounded-full"
              ></div>
            ))}
          </div>

          <div className="relative z-10 pl-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
                  <p className="text-emerald-700/90 font-semibold text-sm md:text-base tracking-wide uppercase">
                    Verified Tickets
                  </p>
                </div>
                <div className="relative">
                  <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mt-1 animate-count-up">
                    {dashboardData.totalVerified}
                  </h3>
                  <div className="absolute -right-2 -top-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600/80 mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce"></span>
                  {(
                    (dashboardData.totalVerified /
                      dashboardData.totalRegistered) *
                      100 || 0
                  ).toFixed(1)}
                  % verified rate
                </p>
              </div>
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl md:rounded-3xl shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  <FaUserCheck className="text-white text-xl md:text-2xl" />
                </div>
                {/* Sparkle effect */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
            </div>
            {/* Golden ratio progress */}
            <div className="mt-6 relative">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Verification Status</span>
                <span className="font-semibold">
                  {(
                    (dashboardData.totalVerified /
                      dashboardData.totalRegistered) *
                      100 || 0
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="h-2 bg-gradient-to-r from-emerald-100/50 to-teal-100/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
                  style={{
                    width: `${
                      (dashboardData.totalVerified /
                        dashboardData.totalRegistered) *
                        100 || 0
                    }%`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-100/20 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Winners - Trophy Theme */}
        <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-3xl md:rounded-4xl p-5 md:p-7 shadow-2xl border-2 border-amber-200/50 transform hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden">
          {/* Confetti particles */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-gradient-to-br ${
                i % 3 === 0
                  ? "from-yellow-400 to-amber-400"
                  : i % 3 === 1
                  ? "from-pink-400 to-rose-400"
                  : "from-blue-400 to-cyan-400"
              } rounded-full animate-float`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${20 + i * 10}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            ></div>
          ))}

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-spin"></div>
                  <p className="text-amber-700/90 font-semibold text-sm md:text-base tracking-wide uppercase">
                    Jackpot Winners
                  </p>
                </div>
                <div className="relative">
                  <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mt-1 animate-count-up">
                    {dashboardData.totalWinners}
                  </h3>
                  <div className="absolute -right-3 -top-3">
                    <div className="relative w-6 h-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
                      <div className="absolute inset-1 bg-gradient-to-r from-yellow-300 to-amber-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600/80 mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 bg-amber-400 rounded-full"></span>
                  {(
                    (dashboardData.totalWinners / dashboardData.totalVerified) *
                      100 || 0
                  ).toFixed(1)}
                  % win rate
                </p>
              </div>
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-2xl md:rounded-3xl shadow-2xl group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500">
                  <FaTrophy className="text-white text-xl md:text-2xl drop-shadow-lg" />
                </div>
                {/* Crown effect */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <div className="w-4 h-2 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-t-full"></div>
                </div>
              </div>
            </div>
            {/* Winning progress bar */}
            <div className="mt-6 relative">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Win Ratio</span>
                <span className="font-semibold">
                  {(
                    (dashboardData.totalWinners / dashboardData.totalVerified) *
                      100 || 0
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="h-2 bg-gradient-to-r from-amber-100/50 to-orange-100/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
                  style={{
                    width: `${
                      (dashboardData.totalWinners /
                        dashboardData.totalVerified) *
                        100 || 0
                    }%`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                </div>
              </div>
              {/* Star markers */}
              <div className="flex justify-between mt-1">
                {[0, 25, 50, 75, 100].map((mark) => (
                  <div key={mark} className="relative">
                    <div className="w-1 h-1 bg-amber-300 rounded-full"></div>
                    {mark % 25 === 0 && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-amber-600">
                        {mark}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Not Verified - Pending Spin Theme */}
        <div className="bg-gradient-to-br from-rose-50 via-white to-pink-50 rounded-3xl md:rounded-4xl p-5 md:p-7 shadow-2xl border-2 border-rose-200/50 transform hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden">
          {/* Spinning wheel effect */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 border-4 border-rose-200/20 rounded-full">
            <div className="absolute left-1/2 top-0 w-1 h-4 bg-gradient-to-b from-rose-400 to-pink-400 rounded-t-full -translate-x-1/2 animate-spin-slow"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse"></div>
                  <p className="text-rose-700/90 font-semibold text-sm md:text-base tracking-wide uppercase">
                    Pending Verified
                  </p>
                </div>
                <div className="relative">
                  <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mt-1 animate-count-up">
                    {dashboardData.notVerified}
                  </h3>
                  <div className="absolute -right-2 -top-2">
                    <div className="relative w-5 h-5">
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full animate-ping opacity-20"></div>
                      <div className="absolute inset-1 bg-gradient-to-r from-rose-300 to-pink-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600/80 mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 bg-rose-400 rounded-full animate-pulse"></span>
                  {(
                    (dashboardData.notVerified /
                      dashboardData.totalRegistered) *
                      100 || 0
                  ).toFixed(1)}
                  % awaiting verification
                </p>
              </div>
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 rounded-2xl md:rounded-3xl shadow-2xl group-hover:scale-110 group-hover:rotate-[-15deg] transition-all duration-500">
                  <FaUserTimes className="text-white text-xl md:text-2xl" />
                </div>
                {/* Warning triangle */}
                <div className="absolute -top-2 -right-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-rose-400 to-pink-400 rounded-sm rotate-45"></div>
                </div>
              </div>
            </div>
            {/* Urgent progress bar */}
            <div className="mt-6 relative">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Pending Status</span>
                <span className="font-semibold">
                  {(
                    (dashboardData.notVerified /
                      dashboardData.totalRegistered) *
                      100 || 0
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="h-2 bg-gradient-to-r from-rose-100/50 to-pink-100/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500 rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
                  style={{
                    width: `${
                      (dashboardData.notVerified /
                        dashboardData.totalRegistered) *
                        100 || 0
                    }%`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast"></div>
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[8px] text-rose-500 font-semibold">
                  Verify Now
                </span>
                <span className="text-[8px] text-rose-500 font-semibold">
                  Required
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Draw Controls Section */}
      <div className=" rounded-2xl md:rounded-3xl bg-white border border-blue-100 p-4 md:p-6 mb-6 md:mb-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 flex items-center">
              <FaCrown className="mr-2 text-indigo-600" />
              🎲 Lucky Draw Controls
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Select random winners from eligible participants. Only verified
              users can win.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                if (!adminId) {
                  alert("Admin ID not found");
                  return;
                }
                navigate(`/${adminId}/luckydraw`);
              }}
              className={`px-6 md:px-8 py-3 md:py-3.5 text-white font-semibold rounded-xl md:rounded-2xl shadow-lg transform transition-all duration-200 flex items-center justify-center gap-2 ${
                isDrawing
                  ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 hover:shadow-xl active:scale-95"
              }`}
            >
              <FaRandom className="text-lg md:text-xl" />
              {isDrawing ? "Selecting..." : "Run Lucky Draw"}
            </button>

            {winnersList.length > 0 && (
              <button
                onClick={clearAllWinners}
                className="px-4 md:px-6 py-3 md:py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold rounded-xl md:rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                Clear All Winners
              </button>
            )}
          </div>
        </div>

        {/* Selected Winner Display */}
        {selectedWinner && (
          <div className="mt-6 p-4 md:p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img
                      src={selectedWinner.userImage}
                      alt={selectedWinner.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-xs">🏆</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs md:text-sm bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium">
                      NEW WINNER
                    </span>
                    {isDrawing && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium animate-pulse">
                        Selecting...
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">
                    {selectedWinner.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs md:text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                      ID: {selectedWinner.userId}
                    </span>
                    <span className="text-xs md:text-sm text-gray-600">
                      Company: {selectedWinner.companyId}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-4xl md:text-5xl text-emerald-500">🎉</div>
            </div>

            {isDrawing && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-blue-700 font-medium">
                    Randomly selecting winner from{" "}
                    {
                      allUsers.filter(
                        (u) => u.isVerified && u.isPresent && !u.isWinner
                      ).length
                    }{" "}
                    eligible participants...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Winners List */}
      {winnersList.length > 0 && (
        <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl md:rounded-3xl shadow-lg border border-indigo-100 p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-md">
                <FaTrophy className="text-white text-xl md:text-2xl" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  Winners List{" "}
                  <span className="text-violet-600">
                    ({winnersList.length})
                  </span>
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Celebrating our lucky participants! 🎊
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = `data:text/json;charset=utf-8,${encodeURIComponent(
                  JSON.stringify(winnersList, null, 2)
                )}`;
                link.download = `winners-${
                  new Date().toISOString().split("T")[0]
                }.json`;
                link.click();
              }}
              className="px-4 md:px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export Winners
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {winnersList.slice(0, 8).map((winner, index) => (
              <div
                key={winner.id}
                className="bg-white rounded-xl border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all duration-300 p-4 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <img
                          src={winner.userImage}
                          alt={winner.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-sm ${
                          index < 3
                            ? "bg-gradient-to-br from-violet-500 to-purple-600"
                            : "bg-gradient-to-br from-sky-500 to-blue-600"
                        }`}
                      >
                        <span className="text-xs font-bold text-white">
                          {index < 3
                            ? ["🥇", "🥈", "🥉"][index]
                            : `#${index + 1}`}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate max-w-[140px]">
                        {winner.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate max-w-[140px]">
                        ID: {winner.userId}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => resetWinner(winner.userId)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Remove winner"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        index < 3 ? "bg-violet-500" : "bg-sky-500"
                      }`}
                    ></div>
                    <span
                      className={`text-xs font-medium ${
                        index < 3 ? "text-violet-700" : "text-sky-700"
                      }`}
                    >
                      {index === 0
                        ? "First Prize Winner"
                        : index === 1
                        ? "Second Prize Winner"
                        : index === 2
                        ? "Third Prize Winner"
                        : "Lucky Winner"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-lg">
                        {winner.companyId}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {winnersList.length > 8 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                className="w-full py-3 text-center text-violet-600 hover:text-violet-700 font-medium rounded-lg hover:bg-violet-50 transition-colors duration-200"
                onClick={() => {
                  // Show all winners functionality
                  alert(`Showing all ${winnersList.length} winners`);
                }}
              >
                View All {winnersList.length} Winners
                <svg
                  className="inline-block ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Participants Table */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-8">
          {/* Header with Search & Filters */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Participants ({filteredUsers.length})
              </h2>
              <p className="text-gray-500 mt-1 text-sm md:text-base">
                Click the verification toggle to update user status
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400 text-sm md:text-base" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, ID..."
                  className="pl-10 pr-4 py-2.5 w-full sm:w-64 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-sm md:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold flex items-center gap-2 hover:bg-gray-50 w-full sm:w-auto justify-center"
                >
                  <FaFilter />
                  Filters
                  {Object.values(filters).some((f) => f) && (
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {showFilters && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowFilters(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
                      <div className="space-y-3">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.verifiedOnly}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                verifiedOnly: e.target.checked,
                              }))
                            }
                            className="mr-3 w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">Verified Only</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.presentOnly}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                presentOnly: e.target.checked,
                              }))
                            }
                            className="mr-3 w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">Present Only</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.hasNotWon}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                hasNotWon: e.target.checked,
                              }))
                            }
                            className="mr-3 w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">Has Not Won</span>
                        </label>
                        <button
                          onClick={() =>
                            setFilters({
                              verifiedOnly: false,
                              presentOnly: false,
                              hasNotWon: false,
                            })
                          }
                          className="w-full mt-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 uppercase">
                    S.No
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 uppercase">
                    Participant
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 uppercase">
                    ID Card
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 uppercase">
                    Verification
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 uppercase">
                    Eligibility
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-gray-700 font-medium">
                          Loading participants...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.slice(0, 15).map((user, index) => (
                    <tr
                      key={user.luckyDrawId}
                      className="hover:bg-gray-50 transition"
                    >
                      {/* S.NO */}
                      <td className="px-6 py-5 text-center">
                        <span className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold mx-auto">
                          {index + 1}
                        </span>
                      </td>

                      {/* PARTICIPANT */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={user.userImage}
                            alt={user.name}
                            className="w-14 h-14 rounded-full object-cover border"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.luckyDrawId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ID CARD */}
                      <td className="px-6 py-5 text-center">
                        <code className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-mono">
                          {user.userId}
                        </code>
                      </td>

                      {/* VERIFICATION */}
                      <td className="px-6 py-5 text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={user.isVerified}
                            onChange={() =>
                              handleVerificationToggle(
                                user.luckyDrawId,
                                user.isVerified
                              )
                            }
                            className="hidden"
                          />
                          <div
                            className={`w-12 h-6 rounded-full transition ${
                              user.isVerified ? "bg-green-500" : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 bg-white rounded-full mt-1 ml-1 transition ${
                                user.isVerified ? "translate-x-6" : ""
                              }`}
                            />
                          </div>
                          <span
                            className={`ml-3 text-sm font-medium ${
                              user.isVerified
                                ? "text-green-600"
                                : "text-gray-600"
                            }`}
                          >
                            {user.isVerified ? "Verified" : "Unverified"}
                          </span>
                        </label>
                      </td>

                      {/* ELIGIBILITY */}
                      <td className="px-6 py-5 text-center">
                        {user.isVerified && user.isPresent && !user.isWinner ? (
                          <span className="text-green-700 font-semibold text-sm flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Eligible
                          </span>
                        ) : (
                          <span className="text-gray-500 font-medium text-sm">
                            Not Eligible
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => openViewModal(user)}
                            className="px-3 py-1.5 border-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-semibold"
                          >
                            View
                          </button>

                          <button
                            onClick={() => openEditModal(user)}
                            className="px-3 py-1.5 border-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 text-sm font-semibold"
                          >
                            Edit
                          </button>
                        </div>
                        {/*Edit Popup */}
                        {showEditModal && activeParticipant && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            {/* Backdrop with subtle animation */}
                            <div
                              className="absolute inset-0 bg-black/10 backdrop-blur-sm transition-opacity duration-200"
                              onClick={() => setShowEditModal(false)}
                            />

                            {/* Modal with slide-in animation */}
                            <div
                              className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-2xl 
                 max-h-[90vh] overflow-hidden transform transition-all duration-200 scale-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Header - Classic card style */}
                              <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h2 className="text-2xl font-semibold text-gray-800">
                                      Edit Participant
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                      Update participant information
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                                    aria-label="Close"
                                  >
                                    <svg
                                      className="w-5 h-5 text-gray-500"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>

                              {/* Body */}
                              <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh]">
                                {/* Profile Image Section */}
                                <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg border">
                                  <div className="relative">
                                    <img
                                      src={imagePreview}
                                      className="w-24 h-24 rounded-lg object-cover border-2 border-white shadow-sm"
                                      alt="Profile preview"
                                    />
                                    <div className="absolute inset-0 rounded-lg ring-1 ring-black/5"></div>
                                  </div>
                                  <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Profile Picture
                                    </label>
                                    <div className="flex items-center gap-3">
                                      <label
                                        className="cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded-lg 
                             hover:bg-gray-50 transition-colors duration-150 text-sm font-medium
                             flex items-center gap-2"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                          />
                                        </svg>
                                        Upload New
                                        <input
                                          type="file"
                                          onChange={handleImageChange}
                                          className="hidden"
                                          accept="image/*"
                                        />
                                      </label>
                                      <span className="text-sm text-gray-500">
                                        JPG, PNG up to 2MB
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Form Grid - Classic two-column layout */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {[
                                    {
                                      label: "Full Name",
                                      key: "Name",
                                      placeholder: "John Smith",
                                    },
                                    {
                                      label: "Email Address",
                                      key: "Email",
                                      placeholder: "john@example.com",
                                      type: "email",
                                    },
                                    {
                                      label: "Phone Number",
                                      key: "Phone_Number",
                                      placeholder: "+1 (555) 000-0000",
                                    },
                                    {
                                      label: "Gender",
                                      key: "Gender",
                                      placeholder: "Select gender",
                                    },
                                    {
                                      label: "Age",
                                      key: "Age",
                                      placeholder: "25",
                                    },
                                    {
                                      label: "ID Card Number",
                                      key: "ID_card",
                                      placeholder: "AB123456",
                                    },
                                  ].map(
                                    ({
                                      label,
                                      key,
                                      placeholder,
                                      type = "text",
                                    }) => (
                                      <div key={key} className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                          {label}
                                          <span className="text-red-500 ml-1">
                                            *
                                          </span>
                                        </label>
                                        <input
                                          type={type}
                                          value={editForm[key]}
                                          onChange={(e) =>
                                            setEditForm((prev) => ({
                                              ...prev,
                                              [key]: e.target.value,
                                            }))
                                          }
                                          placeholder={placeholder}
                                          className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         transition-all duration-150 placeholder-gray-400
                         hover:border-gray-400"
                                        />
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>

                              {/* Footer - Classic action bar */}
                              <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm text-gray-500">
                                    All fields marked with{" "}
                                    <span className="text-red-500">*</span> are
                                    required
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={handleEditSave}
                                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium
                       hover:bg-blue-700 transition-colors duration-150
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       flex items-center gap-2"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                      Save Changes
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {showViewModal && activeParticipant && (
                          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            {/* Backdrop */}
                            <div
                              className="absolute inset-0 bg-black/0 backdrop-blur-sm"
                              onClick={() => setShowViewModal(false)}
                            />

                            {/* Modal */}
                            <div
                              className="relative z-[110] bg-gradient-to-br from-white to-gray-50 
                 rounded-3xl shadow-2xl w-full max-w-xl 
                 max-h-[90vh] flex flex-col"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Header */}
                              <div className="px-8 pt-8 pb-6 flex items-start justify-between shrink-0">
                                <div>
                                  <h2 className="text-2xl font-bold text-gray-900">
                                    Participant Profile
                                  </h2>
                                  <p className="text-gray-500 text-sm mt-1">
                                    View participant information
                                  </p>
                                </div>
                                <button
                                  onClick={() => setShowViewModal(false)}
                                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-700"
                                >
                                  ✕
                                </button>
                              </div>

                              {/* Content (Scrollable) */}
                              <div className="px-8 pb-8 overflow-y-auto flex-1">
                                {/* Avatar */}
                                <div className="flex flex-col items-center mb-1">
                                  <img
                                    src={activeParticipant.userImage}
                                    alt={activeParticipant.name}
                                    className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                                  />

                                  {activeParticipant.isVerified && (
                                    <span className="mt-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                      Verified
                                    </span>
                                  )}

                                  <h3 className="text-xl font-bold mt-4">
                                    {activeParticipant.name}
                                  </h3>
                                  <p className="text-gray-500 text-sm">
                                    ID: {activeParticipant.userId}
                                  </p>
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <InfoRow
                                    label="Email"
                                    value={activeParticipant.email}
                                  />
                                  <InfoRow
                                    label="Phone"
                                    value={activeParticipant.phone}
                                  />
                                  <InfoRow
                                    label="Gender"
                                    value={activeParticipant.gender}
                                  />
                                  <InfoRow
                                    label="Age"
                                    value={
                                      activeParticipant.age
                                        ? `${activeParticipant.age} years`
                                        : "-"
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-gray-600">
                      No participants found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuckyDrawDashboard;

const InfoRow = ({ label, value }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-1">{value || "-"}</p>
    </div>
  );
};
