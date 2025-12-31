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
  FaArrowLeft,
} from "react-icons/fa";

const LuckyDrawParticipantDashboard = () => {
  const { adminId, luckydrawDocumentId  } = useParams();
  const navigate = useNavigate();

  // ----------------------------- STATES -----------------------------
  const [luckyDrawData, setLuckyDrawData] = useState(null);
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

  const API_URL = "https://api.regeve.in/api/lucky-draws";

  // Fetch specific lucky draw with participants
 const fetchLuckyDrawData = async (silent = false) => {
  try {
    if (!silent) setLoading(true);

    const token = localStorage.getItem("jwt");

    const response = await axios.get(
      `${API_URL}?filters[documentId][$eq]=${documentId}&populate[lucky_draw_forms][populate]=*&populate[lucky_draw_winners]=*`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = response.data.data[0];

    if (!data) {
      console.error("Lucky Draw not found for documentId:", documentId);
      return;
    }

    setLuckyDrawData(data);

    const users = data.lucky_draw_forms.map((item) => ({
      id: item.id,
      documentId: item.documentId,
      luckyDrawId: item.LuckyDraw_ID,
      name: item.Name,
      userId: item.ID_card,
      email: item.Email,
      phone: item.Phone_Number,
      gender: item.Gender,
      age: item.Age,
      isVerified: item.isVerified ?? false,
      isWinner: item.IsWinnedParticipant || false,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    setAllUsers(users);
    setWinnersList(data.lucky_draw_winners || []);
  } catch (err) {
    console.error("Error fetching lucky draw data:", err);
  } finally {
    if (!silent) setLoading(false);
  }
};

  // Fetch lucky draw data
  useEffect(() => {
    fetchLuckyDrawData();

    const interval = setInterval(() => {
      fetchLuckyDrawData(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [documentId]);

  // Update dashboard data whenever allUsers changes
  useEffect(() => {
    setDashboardData({
      totalRegistered: allUsers.length,
      totalVerified: allUsers.filter((u) => u.isVerified).length,
      totalWinners: allUsers.filter((u) => u.isWinner).length,
      notVerified: allUsers.filter((u) => !u.isVerified).length,
    });
  }, [allUsers]);

  // ----------------------------- FILTER LOGIC -----------------------------
  useEffect(() => {
    let result = [...allUsers];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(term) ||
          u.userId?.toLowerCase().includes(term) ||
          u.phone?.toString().toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
      );
    }

    if (filters.verifiedOnly) {
      result = result.filter((u) => u.isVerified);
    }

    if (filters.hasNotWon) {
      result = result.filter((u) => !u.isWinner);
    }

    setFilteredUsers(result);
  }, [allUsers, searchTerm, filters]);

  // ----------------------------- VERIFICATION TOGGLE -----------------------------
  const handleVerificationToggle = async (participantId, currentStatus) => {
    try {
      const token = localStorage.getItem("jwt");
      const newStatus = !currentStatus;

      // Update the participant's verification status
      await axios.put(
        `https://api.regeve.in/api/lucky-draw-forms/${participantId}`,
        {
          data: { isVerified: newStatus },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === participantId ? { ...u, isVerified: newStatus } : u
        )
      );

    } catch (error) {
      console.error("Error updating verification:", error);
      alert("Verification update failed");
    }
  };

  // ----------------------------- LUCKY DRAW SELECTION -----------------------------
  const runLuckyDraw = () => {
    setIsDrawing(true);
    
    // Get eligible participants (verified and not winners)
    const eligibleParticipants = allUsers.filter(
      (u) => u.isVerified && !u.isWinner
    );

    if (eligibleParticipants.length === 0) {
      alert("No eligible participants for the draw!");
      setIsDrawing(false);
      return;
    }

    // Animation effect
    let count = 0;
    const maxCount = 20;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
      setSelectedWinner(eligibleParticipants[randomIndex]);
      count++;

      if (count >= maxCount) {
        clearInterval(interval);
        
        // Final selection
        const finalIndex = Math.floor(Math.random() * eligibleParticipants.length);
        const finalWinner = eligibleParticipants[finalIndex];
        
        setSelectedWinner(finalWinner);
        
        // Add to winners list
        const newWinner = {
          ...finalWinner,
          winDate: new Date().toISOString(),
          luckyDrawName: luckyDrawData?.Name || "Unknown"
        };

        const updatedWinners = [...winnersList, newWinner];
        setWinnersList(updatedWinners);
        
        // Update user winner status
        setAllUsers(prev =>
          prev.map(u =>
            u.id === finalWinner.id ? { ...u, isWinner: true } : u
          )
        );

        // Save to localStorage
        localStorage.setItem(
          `luckyDrawWinners_${documentId}`,
          JSON.stringify(updatedWinners)
        );

        // Update API - mark as winner
        updateParticipantAsWinner(finalWinner.id);

        setIsDrawing(false);
      }
    }, 100);
  };

  const updateParticipantAsWinner = async (participantId) => {
    try {
      const token = localStorage.getItem("jwt");
      
      // Update participant's IsWinnedParticipant field
      await axios.put(
        `https://api.regeve.in/api/lucky-draw-forms/${participantId}`,
        {
          data: { IsWinnedParticipant: true },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Also add to lucky draw winners collection
      await axios.post(
        `https://api.regeve.in/api/lucky-draw-winners`,
        {
          data: {
            LuckyDraw_ID: allUsers.find(u => u.id === participantId)?.luckyDrawId,
            Participant_Name: allUsers.find(u => u.id === participantId)?.name,
            LuckyDraw: documentId,
            Win_Date: new Date().toISOString(),
          }
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

    } catch (error) {
      console.error("Error updating winner status:", error);
    }
  };

  // ----------------------------- RESET WINNER -----------------------------
  const resetWinner = async (participantId) => {
    if (!window.confirm("Are you sure you want to remove this winner?")) return;

    try {
      // Remove from winners list
      const updatedWinners = winnersList.filter(
  (w) => w.LuckyDraw_ID !== allUsers.find(u => u.id === participantId)?.luckyDrawId
);

      setWinnersList(updatedWinners);
      localStorage.setItem(
        `luckyDrawWinners_${documentId}`,
        JSON.stringify(updatedWinners)
      );

      // Reset winner status in local state
      setAllUsers((prev) =>
        prev.map((u) => (u.id === participantId ? { ...u, isWinner: false } : u))
      );

      // Update API
      const token = localStorage.getItem("jwt");
      await axios.put(
        `https://api.regeve.in/api/lucky-draw-forms/${participantId}`,
        {
          data: { IsWinnedParticipant: false },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

    } catch (error) {
      console.error("Error resetting winner:", error);
    }
  };

  // ----------------------------- CLEAR ALL WINNERS -----------------------------
  const clearAllWinners = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear all winners? This cannot be undone."
      )
    )
      return;

    try {
      // Clear local state
      setWinnersList([]);
      localStorage.removeItem(`luckyDrawWinners_${documentId}`);

      // Reset winner status for all users
      setAllUsers((prev) => prev.map((u) => ({ ...u, isWinner: false })));

      // Update all participants in API
      const token = localStorage.getItem("jwt");
      const updatePromises = allUsers.map(user =>
        axios.put(
          `https://api.regeve.in/api/lucky-draw-forms/${user.id}`,
          {
            data: { IsWinnedParticipant: false },
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      );

      await Promise.all(updatePromises);

    } catch (error) {
      console.error("Error clearing winners:", error);
    }
  };

  // ----------------------------- MODAL FUNCTIONS -----------------------------
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
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem("jwt");

      await axios.put(
        `https://api.regeve.in/api/lucky-draw-forms/${activeParticipant.id}`,
        {
          data: editForm,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update UI instantly
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === activeParticipant.id
            ? {
                ...u,
                name: editForm.Name,
                email: editForm.Email,
                phone: editForm.Phone_Number,
                gender: editForm.Gender,
                age: editForm.Age,
                userId: editForm.ID_card,
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

  // ----------------------------- UI -----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            {/* Back to Lucky Draw Dashboard Button */}
            <button
              onClick={() => navigate(`/${adminId}/luckydraw-dashboard/${documentId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-2"
            >
              <FaArrowLeft />
              Back to LuckyDraw Dashboard
            </button>

            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
              {luckyDrawData?.Name || "Lucky Draw"} - Participants
            </h1>
            <p className="text-gray-600 mt-2 text-base md:text-lg">
              Lucky Draw ID: {luckyDrawData?.LuckyDrawName_ID || "Loading..."}
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {showCopySuccess && (
              <div className="fixed bottom-4 right-4 animate-fade-in-up z-50">
                <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce-in">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Participant form link copied to clipboard!</span>
                </div>
              </div>
            )}

            {/* Lucky Draw Register Form Button */}
            <button
              onClick={async (event) => {
                const baseUrl = window.location.origin;
                const participantFormLink = `${baseUrl}/#/${adminId}/luckydraw-form/${documentId}`;

                try {
                  await navigator.clipboard.writeText(participantFormLink);
                  setShowCopySuccess(true);
                  setTimeout(() => setShowCopySuccess(false), 3000);
                  
                  event.currentTarget.classList.add("animate-pulse");
                  setTimeout(() => {
                    event.currentTarget.classList.remove("animate-pulse");
                  }, 500);
                } catch (err) {
                  console.error("Failed to copy: ", err);
                  event.currentTarget.classList.add("animate-shake");
                  setTimeout(() => {
                    event.currentTarget.classList.remove("animate-shake");
                  }, 500);
                }
              }}
              className="px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl md:rounded-2xl shadow-md flex items-center gap-2 group"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-200 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Registration Link
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-8 md:mb-10">
        {/* Total Registered Card */}
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl md:rounded-4xl p-5 md:p-7 shadow-2xl border-2 border-indigo-200/50 transform hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                  <p className="text-blue-700/90 font-semibold text-sm md:text-base tracking-wide uppercase">Total Participants</p>
                </div>
                <div className="relative">
                  <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-1">{dashboardData.totalRegistered}</h3>
                </div>
                <p className="text-xs text-gray-600/80 mt-2">All registered participants</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl md:rounded-3xl shadow-2xl">
                <FaUsers className="text-white text-xl md:text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Verified Users Card */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-3xl md:rounded-4xl p-5 md:p-7 shadow-2xl border-2 border-emerald-200/50 transform hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
                  <p className="text-emerald-700/90 font-semibold text-sm md:text-base tracking-wide uppercase">Verified</p>
                </div>
                <div className="relative">
                  <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mt-1">{dashboardData.totalVerified}</h3>
                </div>
                <p className="text-xs text-gray-600/80 mt-2">
                  {((dashboardData.totalVerified / dashboardData.totalRegistered) * 100 || 0).toFixed(1)}% verified
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl md:rounded-3xl shadow-2xl">
                <FaUserCheck className="text-white text-xl md:text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Winners Card */}
        <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-3xl md:rounded-4xl p-5 md:p-7 shadow-2xl border-2 border-amber-200/50 transform hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                  <p className="text-amber-700/90 font-semibold text-sm md:text-base tracking-wide uppercase">Winners</p>
                </div>
                <div className="relative">
                  <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mt-1">{dashboardData.totalWinners}</h3>
                </div>
                <p className="text-xs text-gray-600/80 mt-2">
                  {((dashboardData.totalWinners / dashboardData.totalVerified) * 100 || 0).toFixed(1)}% win rate
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-2xl md:rounded-3xl shadow-2xl">
                <FaTrophy className="text-white text-xl md:text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Verification Card */}
        <div className="bg-gradient-to-br from-rose-50 via-white to-pink-50 rounded-3xl md:rounded-4xl p-5 md:p-7 shadow-2xl border-2 border-rose-200/50 transform hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse"></div>
                  <p className="text-rose-700/90 font-semibold text-sm md:text-base tracking-wide uppercase">Pending</p>
                </div>
                <div className="relative">
                  <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mt-1">{dashboardData.notVerified}</h3>
                </div>
                <p className="text-xs text-gray-600/80 mt-2">
                  {((dashboardData.notVerified / dashboardData.totalRegistered) * 100 || 0).toFixed(1)}% pending
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 rounded-2xl md:rounded-3xl shadow-2xl">
                <FaUserTimes className="text-white text-xl md:text-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Draw Controls Section */}
      <div className="rounded-2xl md:rounded-3xl bg-white border border-blue-100 p-4 md:p-6 mb-6 md:mb-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 flex items-center">
              <FaCrown className="mr-2 text-indigo-600" />
              🎲 Lucky Draw Controls
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Select random winners from verified participants. Only verified users can win.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={runLuckyDraw}
              disabled={isDrawing}
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
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                    <div className="text-2xl">👤</div>
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
                      ID: {selectedWinner.luckyDrawId}
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
                    {allUsers.filter((u) => u.isVerified && !u.isWinner).length}{" "}
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
                  Winners List <span className="text-violet-600">({winnersList.length})</span>
                </h2>
                <p className="text-gray-600 text-sm mt-1">Celebrating our lucky participants! 🎊</p>
              </div>
            </div>
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = `data:text/json;charset=utf-8,${encodeURIComponent(
                  JSON.stringify(winnersList, null, 2)
                )}`;
                link.download = `winners-${new Date().toISOString().split("T")[0]}.json`;
                link.click();
              }}
              className="px-4 md:px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Winners
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {winnersList.slice(0, 8).map((winner, index) => (
              <div key={winner.id} className="bg-white rounded-xl border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all duration-300 p-4 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-200 flex items-center justify-center">
                        <div className="text-lg">👤</div>
                      </div>
                      <div className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-sm ${
                        index < 3 ? "bg-gradient-to-br from-violet-500 to-purple-600" : "bg-gradient-to-br from-sky-500 to-blue-600"
                      }`}>
                        <span className="text-xs font-bold text-white">
                          {index < 3 ? ["🥇", "🥈", "🥉"][index] : `#${index + 1}`}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate max-w-[140px]">{winner.name || winner.Participant_Name}</h3>
                      <p className="text-xs text-gray-500 truncate max-w-[140px]">ID: {winner.luckyDrawId || winner.LuckyDraw_ID}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => resetWinner(winner.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Remove winner"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Won on: {new Date(winner.winDate || winner.Win_Date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
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
                  placeholder="Search by name, ID, email..."
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
                    <div className="fixed inset-0 z-40" onClick={() => setShowFilters(false)}></div>
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
                      <div className="space-y-3">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.verifiedOnly}
                            onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                            className="mr-3 w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">Verified Only</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.hasNotWon}
                            onChange={(e) => setFilters(prev => ({ ...prev, hasNotWon: e.target.checked }))}
                            className="mr-3 w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">Has Not Won</span>
                        </label>
                        <button
                          onClick={() => setFilters({ verifiedOnly: false, hasNotWon: false })}
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
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 uppercase">S.No</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 uppercase">Participant</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 uppercase">Lucky Draw ID</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 uppercase">Verification</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 uppercase">Winner Status</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-gray-700 font-medium">Loading participants...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.slice(0, 15).map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      {/* S.NO */}
                      <td className="px-6 py-5 text-center">
                        <span className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold mx-auto">
                          {index + 1}
                        </span>
                      </td>

                      {/* PARTICIPANT */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                            <div className="text-2xl">👤</div>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">{user.phone}</p>
                          </div>
                        </div>
                      </td>

                      {/* LUCKY DRAW ID */}
                      <td className="px-6 py-5 text-center">
                        <code className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-mono">
                          {user.luckyDrawId}
                        </code>
                      </td>

                      {/* VERIFICATION */}
                      <td className="px-6 py-5 text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={user.isVerified}
                            onChange={() => handleVerificationToggle(user.id, user.isVerified)}
                            className="hidden"
                          />
                          <div className={`w-12 h-6 rounded-full transition ${user.isVerified ? "bg-green-500" : "bg-gray-300"}`}>
                            <div className={`w-4 h-4 bg-white rounded-full mt-1 ml-1 transition ${user.isVerified ? "translate-x-6" : ""}`} />
                          </div>
                          <span className={`ml-3 text-sm font-medium ${user.isVerified ? "text-green-600" : "text-gray-600"}`}>
                            {user.isVerified ? "Verified" : "Unverified"}
                          </span>
                        </label>
                      </td>

                      {/* WINNER STATUS */}
                      <td className="px-6 py-5 text-center">
                        {user.isWinner ? (
                          <span className="text-yellow-700 font-semibold text-sm flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                            Winner
                          </span>
                        ) : (
                          <span className="text-gray-500 font-medium text-sm">Not Winner</span>
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

      {/* Edit Modal */}
      {showEditModal && activeParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800">Edit Participant</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Full Name", key: "Name", placeholder: "John Smith" },
                  { label: "Email Address", key: "Email", placeholder: "john@example.com", type: "email" },
                  { label: "Phone Number", key: "Phone_Number", placeholder: "+1 (555) 000-0000" },
                  { label: "Gender", key: "Gender", placeholder: "Select gender" },
                  { label: "Age", key: "Age", placeholder: "25", type: "number" },
                  { label: "ID Card Number", key: "ID_card", placeholder: "AB123456" },
                ].map(({ label, key, placeholder, type = "text" }) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">{label}</label>
                    <input
                      type={type}
                      value={editForm[key]}
                      onChange={(e) => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleEditSave} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && activeParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-auto">
            <div className="px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800">Participant Details</h2>
                <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
              </div>
            </div>

            <div className="p-8">
              <div className="flex flex-col items-center mb-8">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <div className="text-4xl">👤</div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{activeParticipant.name}</h3>
                <p className="text-gray-500 mt-2">Lucky Draw ID: {activeParticipant.luckyDrawId}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoRow label="Email" value={activeParticipant.email} />
                <InfoRow label="Phone" value={activeParticipant.phone} />
                <InfoRow label="Gender" value={activeParticipant.gender} />
                <InfoRow label="Age" value={activeParticipant.age} />
                <InfoRow label="ID Card" value={activeParticipant.userId} />
                <InfoRow label="Registered On" value={new Date(activeParticipant.createdAt).toLocaleDateString()} />
                <InfoRow label="Verification Status" value={activeParticipant.isVerified ? "Verified" : "Not Verified"} />
                <InfoRow label="Winner Status" value={activeParticipant.isWinner ? "Winner" : "Not Winner"} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LuckyDrawParticipantDashboard;

const InfoRow = ({ label, value }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-lg font-semibold text-gray-900 mt-1">{value || "-"}</p>
    </div>
  );
};