import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaTimes,
  FaUser,
  FaPhone,
  FaCalendar,
  FaInfoCircle,
  FaIdCard,
  FaSave,
  FaEdit,
  FaEye,
  FaCamera,
  FaTrash,
  FaDownload,
  FaCopy,
  FaSearch,
  FaFilter,
  FaArrowLeft,
  FaUserCheck,
  FaUsers,
  FaRandom,
  FaTrophy,
  FaCrown,
  FaUserTimes,
  FaCheckCircle,
  FaCalendarAlt,
  FaUserEdit,
} from "react-icons/fa";

const LuckyDrawParticipantDashboard = () => {
  const { adminId, luckydrawDocumentId } = useParams();
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    Name: "",
    Email: "",
    Phone_Number: "",
    Gender: "",
    Age: "",
    ID_card: "",
  });

  const [activeParticipant, setActiveParticipant] = useState(null);
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const API_URL = "https://api.regeve.in/api/lucky-draw-names";

  // Fetch specific lucky draw with participants
  const fetchLuckyDrawData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const token = localStorage.getItem("jwt");

      const response = await axios.get(`${API_URL}/${luckydrawDocumentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      setLuckyDrawData(data);

      const users = (data.lucky_draw_forms || []).map((item) => ({
        id: item.id,
        documentId: item.documentId,
        luckyDrawId: item.LuckyDraw_ID,

        name: item.Name,
        email: item.Email,
        phone: item.Phone_Number,
        gender: item.Gender,
        age: item.Age,
        userId: item.ID_card,

        isVerified: item.isVerified ?? false,
        isWinner: item.IsWinnedParticipant ?? false,

        createdAt: item.createdAt,
        updatedAt: item.updatedAt,

        photo: item.Photo?.url
          ? `https://api.regeve.in${item.Photo.url}`
          : null,

        // ✅ ID PROOF (ARRAY)
        idPhotos: Array.isArray(item.Id_Photo)
          ? item.Id_Photo.map((img) => ({
              id: img.id,
              url: `https://api.regeve.in${img.url}`,
            }))
          : [],
      }));

      setAllUsers(users);
      setWinnersList(data.lucky_draw_winners || []);
    } catch (err) {
      console.error("Error fetching lucky draw:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch lucky draw data
  useEffect(() => {
    if (!luckydrawDocumentId) return;

    fetchLuckyDrawData();

    const interval = setInterval(() => {
      fetchLuckyDrawData(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [luckydrawDocumentId]);

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
  const handleVerificationToggle = async (participantDocumentId, newStatus) => {
    const token = localStorage.getItem("jwt");

    try {
      await axios.put(
        `https://api.regeve.in/api/lucky-draw-names/${luckydrawDocumentId}`,
        {
          data: {
            lucky_draw_forms: {
              update: [
                {
                  where: { documentId: participantDocumentId },
                  data: { isVerified: newStatus },
                },
              ],
            },
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ update UI only AFTER backend success
      setAllUsers((prev) =>
        prev.map((u) =>
          u.documentId === participantDocumentId
            ? { ...u, isVerified: newStatus }
            : u
        )
      );
    } catch (err) {
      console.error("Toggle failed", err);
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
      const randomIndex = Math.floor(
        Math.random() * eligibleParticipants.length
      );
      setSelectedWinner(eligibleParticipants[randomIndex]);
      count++;

      if (count >= maxCount) {
        clearInterval(interval);

        // Final selection
        const finalIndex = Math.floor(
          Math.random() * eligibleParticipants.length
        );
        const finalWinner = eligibleParticipants[finalIndex];

        setSelectedWinner(finalWinner);

        // Add to winners list
        const newWinner = {
          ...finalWinner,
          winDate: new Date().toISOString(),
          luckyDrawName: luckyDrawData?.Name || "Unknown",
        };

        const updatedWinners = [...winnersList, newWinner];
        setWinnersList(updatedWinners);

        // Update user winner status
        setAllUsers((prev) =>
          prev.map((u) =>
            u.documentId === finalWinner.documentId
              ? { ...u, isWinner: true }
              : u
          )
        );

        // Save to localStorage
        localStorage.setItem(
          `luckyDrawWinners_${luckydrawDocumentId}`,
          JSON.stringify(updatedWinners)
        );

        // Update API - mark as winner
        updateParticipantAsWinner(finalWinner.documentId);

        setIsDrawing(false);
      }
    }, 100);
  };

  const updateParticipantAsWinner = async (participantDocumentId) => {
    const token = localStorage.getItem("jwt");

    await axios.put(
      `https://api.regeve.in/api/lucky-draw-names/${luckydrawDocumentId}`,
      {
        data: {
          lucky_draw_forms: {
            update: [
              {
                where: { documentId: participantDocumentId },
                data: { IsWinnedParticipant: true },
              },
            ],
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  };

  // ----------------------------- RESET WINNER -----------------------------
  const resetWinner = async (participantDocumentId) => {
    const token = localStorage.getItem("jwt");

    await axios.put(
      `https://api.regeve.in/api/lucky-draw-names/${luckydrawDocumentId}`,
      {
        data: {
          lucky_draw_forms: {
            update: [
              {
                where: { documentId: participantDocumentId },
                data: { IsWinnedParticipant: false },
              },
            ],
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  };

  // ----------------------------- DELETE PARTICIPANT -----------------------------
  const deleteParticipant = async () => {
    if (!activeParticipant) return;

    const token = localStorage.getItem("jwt");

    try {
      await axios.delete(
        `https://api.regeve.in/api/lucky-draw-names/${luckydrawDocumentId}/participants/${activeParticipant.documentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await fetchLuckyDrawData(true);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Delete participant failed", err);
    }
  };

  // ----------------------------- CLEAR ALL WINNERS -----------------------------
  const clearAllWinners = async () => {
    const token = localStorage.getItem("jwt");

    await axios.put(
      `https://api.regeve.in/api/lucky-draw-names/${luckydrawDocumentId}`,
      {
        data: {
          lucky_draw_forms: {
            update: allUsers.map((u) => ({
              where: { documentId: u.documentId },
              data: { IsWinnedParticipant: false },
            })),
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    setAllUsers((prev) => prev.map((u) => ({ ...u, isWinner: false })));
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
    setPhotoPreview(user.photo);
    setNewPhotoFile(null);
    setShowEditModal(true);
  };

  const openDeleteConfirm = (user) => {
    setActiveParticipant(user);
    setShowDeleteConfirm(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSave = async () => {
    const token = localStorage.getItem("jwt");

    try {
      await axios.put(
        `https://api.regeve.in/api/lucky-draw-names/${luckydrawDocumentId}`,
        {
          data: {
            lucky_draw_forms: {
              update: [
                {
                  where: { documentId: activeParticipant.documentId },
                  data: {
                    Name: editForm.Name,
                    Email: editForm.Email,
                    Phone_Number: editForm.Phone_Number,
                    Gender: editForm.Gender,
                    Age: Number(editForm.Age),
                    ID_card: editForm.ID_card,
                  },
                },
              ],
            },
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await fetchLuckyDrawData(true);
      setShowEditModal(false);
    } catch (err) {
      console.error("Edit failed", err);
    }
  };

  // ----------------------------- ENHANCED UI COMPONENTS -----------------------------

  // Enhanced Stats Cards
  const StatsCard = ({
    title,
    value,
    icon: Icon,
    color,
    percent,
    description,
  }) => (
    <div
      className={`bg-gradient-to-br ${color.from} ${color.via} ${color.to} rounded-3xl p-6 shadow-2xl transform hover:scale-[1.02] transition-all duration-500 group`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 ${color.dot} rounded-full animate-pulse`}
            ></div>
            <p className="text-gray-700/90 font-semibold text-sm uppercase tracking-wider">
              {title}
            </p>
          </div>
          <div className="relative">
            <h3 className="text-4xl font-bold text-gray-900 mt-1">{value}</h3>
            {percent && (
              <span className="absolute -right-2 -top-2 text-xs font-bold bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full">
                {percent}%
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600/80 mt-2">{description}</p>
        </div>
        <div
          className={`p-4 ${color.iconBg} rounded-2xl shadow-xl transform group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="text-white text-2xl" />
        </div>
      </div>
    </div>
  );

  // Participant Table Row
  const ParticipantRow = ({ user, index }) => (
    <tr
      key={user.id}
      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 group"
    >
      <td className="px-6 py-5 text-center">
        <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg mx-auto shadow-lg">
          {index + 1}
        </span>
      </td>

      <td className="px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-2xl text-gray-400">👤</div>
              )}
            </div>
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <FaUserCheck className="text-white text-xs" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-900">{user.name}</p>
              {user.isWinner && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 text-xs font-bold rounded-full">
                  🏆 Winner
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{user.phone}</p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
          <code className="font-mono font-bold text-gray-800">
            {user.luckyDrawId}
          </code>
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="flex flex-col items-center justify-center">
          <label
            className="relative inline-flex items-center cursor-pointer group"
            onClick={() =>
              handleVerificationToggle(user.documentId, !user.isVerified)
            }
          >
            <input
              type="checkbox"
              checked={user.isVerified}
              readOnly
              className="sr-only"
            />

            {/* Enhanced Toggle Container */}
            <div className="flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-300 group-hover:bg-gray-50">
              {/* Toggle Switch with Glow */}
              <div className="relative">
                {/* Background Glow */}
                {user.isVerified && (
                  <div className="absolute -inset-2 bg-emerald-100 rounded-full blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                {/* Toggle */}
                <div
                  className={`relative w-12 h-6 rounded-full transition-all duration-500 ${
                    user.isVerified
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-200/50"
                      : "bg-gradient-to-r from-gray-300 to-gray-400"
                  }`}
                >
                  {/* Knob */}
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-500 flex items-center justify-center ${
                      user.isVerified ? "translate-x-6" : "translate-x-0"
                    }`}
                  >
                    {user.isVerified && (
                      <FaCheckCircle className="w-3 h-3 text-emerald-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Status with Icon */}
              <div className="flex flex-col items-start min-w-[80px]">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      user.isVerified
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      user.isVerified ? "text-emerald-700" : "text-gray-700"
                    }`}
                  >
                    {user.isVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
                <span className="text-xs text-gray-500 mt-0.5">
                  {user.isVerified ? "Active account" : "Needs verification"}
                </span>
              </div>
            </div>
          </label>
        </div>
      </td>

      <td className="px-6 py-5 text-center">
        <div
          className={`px-4 py-2 rounded-full font-bold ${
            user.isWinner
              ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 animate-pulse"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {user.isWinner ? "🎉 WINNER" : "Not Winner"}
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="flex justify-center gap-2">
          <button
            onClick={() => openViewModal(user)}
            className="p-2.5 cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 group"
            title="View Details"
          >
            <FaEye className="group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => openEditModal(user)}
            className="p-2.5 cursor-pointer bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-600 rounded-xl hover:from-emerald-100 hover:to-teal-100 transition-all duration-300 group"
            title="Edit Participant"
          >
            <FaEdit className="group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => openDeleteConfirm(user)}
            className="p-2.5 cursor-pointer bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 rounded-xl hover:from-rose-100 hover:to-pink-100 transition-all duration-300 group"
            title="Delete Participant"
          >
            <FaTrash className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-4">
            <button
              onClick={() =>
                navigate(
                  `/${adminId}/luckydraw-dashboard/${luckydrawDocumentId}`
                )
              }
              className="flex items-center cursor-pointer gap-3 text-gray-600 hover:text-blue-600 font-medium group"
            >
              <div className="p-2 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                <FaArrowLeft />
              </div>
              Back to Dashboard
            </button>

            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                {luckyDrawData?.Name || "Lucky Draw"}
              </h1>
              <p className="text-gray-600 text-lg">
                Manage participants and select winners
              </p>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  🎯 ID: {luckyDrawData?.LuckyDrawName_ID || "Loading..."}
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  👥 {allUsers.length} Participants
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Copy Link Button */}
            <button
              onClick={async () => {
                const baseUrl = window.location.origin;
                const participantFormLink = `${baseUrl}/#/${adminId}/luckydraw-form/${luckydrawDocumentId}`;

                try {
                  await navigator.clipboard.writeText(participantFormLink);
                  setShowCopySuccess(true);
                  setTimeout(() => setShowCopySuccess(false), 3000);
                } catch (err) {
                  console.error("Failed to copy:", err);
                }
              }}
              className="px-6 cursor-pointer py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 group"
            >
              <FaCopy className="group-hover:rotate-12 transition-transform" />
              Copy Registration Link
            </button>

            {/* Export Data Button */}
            <button
              onClick={() => {
                const csvContent = [
                  [
                    "Name",
                    "Email",
                    "Phone",
                    "Gender",
                    "Age",
                    "ID",
                    "Verified",
                    "Winner",
                  ],
                  ...allUsers.map((user) => [
                    user.name,
                    user.email,
                    user.phone,
                    user.gender,
                    user.age,
                    user.userId,
                    user.isVerified ? "Yes" : "No",
                    user.isWinner ? "Yes" : "No",
                  ]),
                ]
                  .map((row) => row.join(","))
                  .join("\n");

                const link = document.createElement("a");
                link.href =
                  "data:text/csv;charset=utf-8," +
                  encodeURIComponent(csvContent);
                link.download = `participants-${
                  new Date().toISOString().split("T")[0]
                }.csv`;
                link.click();
              }}
              className="px-6 py-3 cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 group"
            >
              <FaDownload className="group-hover:animate-bounce" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Participants"
          value={dashboardData.totalRegistered}
          icon={FaUsers}
          color={{
            from: "from-indigo-50",
            via: "via-white",
            to: "to-purple-50",
            dot: "bg-gradient-to-r from-blue-500 to-purple-500",
            iconBg:
              "bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600",
          }}
          description="All registered participants"
        />

        <StatsCard
          title="Verified"
          value={dashboardData.totalVerified}
          icon={FaUserCheck}
          color={{
            from: "from-emerald-50",
            via: "via-white",
            to: "to-teal-50",
            dot: "bg-gradient-to-r from-emerald-500 to-teal-500",
            iconBg:
              "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600",
          }}
          description="Verified participants"
        />

        <StatsCard
          title="Winners"
          value={dashboardData.totalWinners}
          icon={FaTrophy}
          color={{
            from: "from-amber-50",
            via: "via-white",
            to: "to-orange-50",
            dot: "bg-gradient-to-r from-amber-500 to-orange-500",
            iconBg:
              "bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500",
          }}
          description="Lucky winners"
        />

        <StatsCard
          title="Pending"
          value={dashboardData.notVerified}
          icon={FaUserTimes}
          color={{
            from: "from-rose-50",
            via: "via-white",
            to: "to-pink-50",
            dot: "bg-gradient-to-r from-rose-500 to-pink-500",
            iconBg: "bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600",
          }}
          description="Awaiting verification"
        />
      </div>

      {/* Enhanced Participants Table */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Enhanced Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Participants Management
              </h2>
              <p className="text-gray-600">
                Showing {filteredUsers.length} of {allUsers.length} participants
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {/* Enhanced Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search participants..."
                  className="pl-12 pr-4 py-3 w-full sm:w-72 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Enhanced Filters */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-5 cursor-pointer py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold flex items-center gap-3 hover:bg-gray-50 w-full sm:w-auto justify-center"
                >
                  <FaFilter />
                  Filters
                  {Object.values(filters).some((f) => f) && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </button>

                {showFilters && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-4">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">
                        Filter Participants
                      </h3>
                      {[
                        { label: "Verified Only", key: "verifiedOnly" },
                        { label: "Has Not Won", key: "hasNotWon" },
                      ].map(({ label, key }) => (
                        <label
                          key={key}
                          className="flex items-center cursor-pointer group"
                        >
                          <div
                            className={`relative w-10 h-6 rounded-full transition-colors ${
                              filters[key] ? "bg-blue-500" : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                filters[key] ? "left-5" : "left-1"
                              }`}
                            ></div>
                          </div>
                          <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                            {label}
                          </span>
                        </label>
                      ))}
                      <button
                        onClick={() =>
                          setFilters({ verifiedOnly: false, hasNotWon: false })
                        }
                        className="w-full mt-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase">
                    S.No
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                    Participant
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase">
                    Draw ID
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase">
                    Winner
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-gray-700 font-semibold">
                          Loading participants...
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Fetching latest data
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers
                    .slice(0, 15)
                    .map((user, index) => (
                      <ParticipantRow key={user.id} user={user} index={index} />
                    ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                          <FaUsers className="text-gray-400 text-3xl" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          No participants found
                        </h3>
                        <p className="text-gray-600 max-w-md">
                          {searchTerm || Object.values(filters).some((f) => f)
                            ? "Try adjusting your search or filters"
                            : "No participants have registered yet"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination/Info */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              Showing{" "}
              <span className="font-bold">
                {Math.min(filteredUsers.length, 15)}
              </span>{" "}
              of <span className="font-bold">{filteredUsers.length}</span>{" "}
              participants
            </p>
            {filteredUsers.length > 15 && (
              <button className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-300">
                Load More Participants
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Compact Edit Modal */}
      {showEditModal && activeParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FaUserEdit className="text-blue-600" />
                    Edit Participant
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    ID: {activeParticipant.luckyDrawId}
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 cursor-pointer hover:bg-red-400 duration-300 hover:scale-105  rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <FaTimes className="text-gray-500 hover:text-white text-lg" />
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column - Photo */}
                <div className="lg:col-span-4">
                  <div className="sticky top-0 space-y-6">
                    {/* Profile Photo */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
                      <div className="relative inline-block mb-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto">
                          {photoPreview ? (
                            <img
                              src={photoPreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : activeParticipant.photo ? (
                            <img
                              src={activeParticipant.photo}
                              alt={activeParticipant.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 text-4xl text-gray-400">
                              <FaUser />
                            </div>
                          )}
                        </div>
                        <label className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105">
                          <FaCamera className="text-sm" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        Click camera icon to upload new photo
                      </p>
                    </div>

                    {/* Current Info Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                      <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <FaInfoCircle className="text-blue-500" />
                        Current Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              activeParticipant.isWinner
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {activeParticipant.isWinner ? "Winner" : "Active"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                          <span className="text-sm text-gray-600">
                            Verified:
                          </span>
                          <span
                            className={
                              activeParticipant.isVerified
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          >
                            {activeParticipant.isVerified ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Form */}
                <div className="lg:col-span-8">
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="rounded-xl border border-gray-200 p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaUser className="text-blue-600" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editForm.Name}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                Name: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Enter full name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ID Card Number{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editForm.ID_card}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                ID_card: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Enter ID card number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender
                          </label>
                          <select
                            value={editForm.Gender}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                Gender: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                          >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Age
                          </label>
                          <input
                            type="number"
                            value={editForm.Age}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                Age: e.target.value,
                              }))
                            }
                            min="1"
                            max="120"
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Enter age"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="rounded-xl border border-gray-200 p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaPhone className="text-green-600" />
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={editForm.Email}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                Email: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Enter email address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={editForm.Phone_Number}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                Phone_Number: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-500">
                  <span className="text-red-500">*</span> Required fields
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-5 cursor-pointer py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors min-w-[100px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    className="px-5 cursor-pointer py-2.5 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow hover:shadow-lg flex items-center gap-2 min-w-[120px] justify-center"
                  >
                    <FaSave className="text-sm" /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact View Modal */}
      {showViewModal && activeParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FaUser className="text-blue-600" />
                    Participant Details
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Lucky Draw ID: {activeParticipant.luckyDrawId}
                  </p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2  cursor-pointer hover:bg-red-400 duration-300 hover:scale-105 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <FaTimes className="text-gray-500 hover:text-white text-lg" />
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column - Profile */}
                <div className="lg:col-span-4">
                  <div className="space-y-6">
                    {/* Profile Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto mb-4">
                        {activeParticipant.photo ? (
                          <img
                            src={activeParticipant.photo}
                            alt={activeParticipant.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 text-4xl text-gray-400">
                            <FaUser />
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {activeParticipant.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {activeParticipant.email}
                      </p>

                      <div className="flex flex-wrap gap-2 justify-center">
                        <span className="px-3 py-1 text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full font-medium border border-blue-200">
                          Participant
                        </span>
                        {activeParticipant.isWinner && (
                          <span className="px-3 py-1 text-xs bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 rounded-full font-medium border border-yellow-200 flex items-center gap-1">
                            <FaTrophy className="text-xs" /> Winner
                          </span>
                        )}
                        {activeParticipant.isVerified && (
                          <span className="px-3 py-1 text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full font-medium border border-green-200 flex items-center gap-1">
                            <FaCheckCircle className="text-xs" /> Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5">
                      <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <FaInfoCircle className="text-blue-500" />
                        Quick Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                          <span className="text-sm text-gray-600">Age:</span>
                          <span className="font-medium text-gray-900">
                            {activeParticipant.age || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                          <span className="text-sm text-gray-600">Gender:</span>
                          <span className="font-medium text-gray-900">
                            {activeParticipant.gender || "Not specified"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              activeParticipant.isWinner
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {activeParticipant.isWinner ? "Winner" : "Active"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contact Information */}
                    <div className="rounded-xl border border-gray-200 p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaPhone className="text-green-600" />
                        Contact Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Email Address
                          </p>
                          <p className="font-medium text-gray-900 break-all">
                            {activeParticipant.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Phone Number
                          </p>
                          <p className="font-medium text-gray-900">
                            {activeParticipant.phone || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Identification */}
                    <div className="rounded-xl border border-gray-200 p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaIdCard className="text-purple-600" />
                        Identification
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            ID Card Number
                          </p>
                          <p className="font-medium text-gray-900 break-all">
                            {activeParticipant.userId}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Lucky Draw ID
                          </p>
                          <p className="font-medium text-gray-900">
                            {activeParticipant.luckyDrawId}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ID Proof Photo */}
                    {activeParticipant.idPhotos?.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm font-medium text-gray-700">
                          ID Proof Photos ({activeParticipant.idPhotos.length})
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          {activeParticipant.idPhotos.map((img) => (
                            <div
                              key={img.id}
                              className="relative aspect-square rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                            >
                              <img
                                src={img.url}
                                alt="ID Proof"
                                className="w-full h-full object-contain p-2"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                                <a
                                  href={img.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white text-gray-800 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors shadow-lg"
                                >
                                  View Full Size
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-sm text-gray-500 text-center">
                          No ID proof documents uploaded
                        </p>
                      </div>
                    )}

                    {/* Registration Info */}
                    <div className="md:col-span-2 rounded-xl border border-gray-200 p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaCalendarAlt className="text-orange-600" />
                        Registration Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Registered Date
                          </p>
                          <p className="font-medium text-gray-900">
                            {new Date(
                              activeParticipant.createdAt
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Last Updated
                          </p>
                          <p className="font-medium text-gray-900">
                            {new Date(
                              activeParticipant.updatedAt
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-500">
                  <span className="text-green-500 mr-1">●</span>
                  Last updated:{" "}
                  {new Date(activeParticipant.updatedAt).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      // Optionally open edit modal
                      // setShowEditModal(true);
                    }}
                    className="px-5 cursor-pointer py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors min-w-[100px]"
                  >
                    Close
                  </button>
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && activeParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
                <FaTrash className="text-rose-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Delete Participant
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-bold">{activeParticipant.name}</span>?
                This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteParticipant}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-medium hover:from-rose-600 hover:to-pink-700 transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy Success Toast */}
      {showCopySuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <FaCopy className="text-white" />
            </div>
            <div>
              <p className="font-semibold">Link Copied!</p>
              <p className="text-sm opacity-90">
                Registration link copied to clipboard
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LuckyDrawParticipantDashboard;