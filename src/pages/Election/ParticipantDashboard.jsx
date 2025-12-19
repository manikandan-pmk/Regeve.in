import React, { useState, useRef, useEffect } from "react";
import { adminNavigate } from "../../utils/adminNavigation";
import {
  Search,
  Filter,
  Mail,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Clock,
  Check,
  MapPin,
  Download,
  Users,
  ChevronDown,
  Edit2,
  AlertCircle,
  ArrowLeft,
  Save,
  X,
  Share2, // Add this
  Copy,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://api.regeve.in/api",
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const ParticipantDashboard = () => {
  const { adminId, electionDocumentId } = useParams();

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAlert, setShowAlert] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [participants, setParticipants] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [electionName, setElectionName] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [confirmAction, setConfirmAction] = useState(null);
  // Add this state for share modal - place it with your other useState declarations
  const [shareModal, setShareModal] = useState({
    open: false,
    participant: null,
    link: "",
  });

  // Function to generate the share link
  const generateElectionFormLink = () => {
    const baseUrl = window.location.origin;

    // Convert election name to URL-friendly format
    const urlFriendlyElectionName = electionName
      ? encodeURIComponent(electionName.replace(/\s+/g, "-").toLowerCase())
      : "election-form";

    return `${baseUrl}/#/electionForm/${adminId}/${electionDocumentId}/${urlFriendlyElectionName}`;
  };

  // Function to copy to clipboard
  const copyElectionFormLink = () => {
    const link = generateElectionFormLink();

    navigator.clipboard
      .writeText(link)
      .then(() => {
        showAlertMessage("Election form link copied to clipboard!", "success");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        showAlertMessage("Failed to copy link", "error");
      });
  };
  const fetchParticipants = async () => {
    try {
      const response = await axiosInstance.get(
        `/election-participants?populate=*&filters[election][documentId]=${electionDocumentId}`
      );

      const apiData = response.data.data;

      const formatted = apiData.map((item) => ({
        id: item.id,
        participant_id: item.participant_id,
        name: item.name,
        email: item.email,
        phone: item.phone_number,
        whatsapp: item.whatsapp_number,
        age: item.age,
        idNumber: item.id_card,
        gender: item.gender,
        verified: item.isVerified,
        image: item.Photo?.url
          ? `https://api.regeve.in${item.Photo.url}`
          : `https://api.dicebear.com/7.x/initials/svg?seed=${item.name}`,
        constituency: item.constituency || "Unknown",
      }));

      setParticipants(formatted);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const fetchElectionName = async () => {
    try {
      const response = await axiosInstance.get(
        `/election-names/${electionDocumentId}`
      );

      const electionData = response.data?.data;

      if (electionData?.Election_Name) {
        setElectionName(electionData.Election_Name);
      } else {
        setElectionName("Election Form");
      }
    } catch (error) {
      console.error("Error fetching election name:", error);
      setElectionName("Election Form");
    }
  };

  // Call fetchElectionName in useEffect
  useEffect(() => {
    fetchParticipants();
    fetchElectionName();
  }, []);

  // Show alert function
  const showAlertMessage = (message, type = "success") => {
    setShowAlert({ show: true, message, type });
    setTimeout(() => {
      setShowAlert({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Toggle verification with confirmation
  const toggleVerifyParticipant = async (id, name) => {
    const participant = participants.find((p) => p.id === id);
    if (!participant) return;

    const newStatus = !participant.verified;

    try {
      await axiosInstance.put(
        `https://api.regeve.in/api/election-participants/${participant.participant_id}`,
        {
          data: { isVerified: newStatus },
        }
      );

      // Update UI
      setParticipants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, verified: newStatus } : p))
      );

      showAlertMessage(
        `${name} ${newStatus ? "verified" : "unverified"} successfully`,
        "success"
      );
    } catch (error) {
      console.error(error);
      showAlertMessage("Failed to update verification", "error");
    }
  };

  // Start editing - opens modal with animation
  const startEditing = (participant) => {
    setEditingId(participant.id);
    setEditForm({
      id: participant.id,
      name: participant.name,
      email: participant.email,
      phone: participant.phone,
      whatsapp: participant.whatsapp,
      age: participant.age,
      idNumber: participant.idNumber,
      gender: participant.gender,
      participant_id: participant.participant_id,
    });
    setPhotoPreview(participant.image); // 👈 existing photo
    setPhotoFile(null);

    setIsModalOpen(true);
  };

  // Save edit with animation
  const saveEdit = async () => {
    try {
      setIsModalOpen(false);

      let uploadedPhotoId = null;

      // 1️⃣ Upload photo if changed
      if (photoFile) {
        const photoForm = new FormData();
        photoForm.append("files", photoFile);

        const uploadRes = await axiosInstance.post(
          "https://api.regeve.in/api/upload",
          photoForm,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        uploadedPhotoId = uploadRes.data[0].id;
      }

      // 2️⃣ Update participant
      await axiosInstance.put(
        `https://api.regeve.in/api/election-participants/${editForm.participant_id}`,
        {
          data: {
            name: editForm.name,
            email: editForm.email,
            phone_number: editForm.phone,
            whatsapp_number: editForm.whatsapp,
            age: editForm.age,
            id_card: editForm.idNumber,
            gender: editForm.gender,
            participant_id: editForm.participant_id,

            // ✅ Attach photo only if uploaded
            ...(uploadedPhotoId && { Photo: uploadedPhotoId }),
          },
        }
      );

      // showAlertMessage("Participant updated successfully", "success");
      setEditingId(null);
      setEditForm({});
      fetchParticipants();
    } catch (error) {
      console.error("Update error:", error);
      showAlertMessage("Failed to update participant", "error");
      setIsModalOpen(true);
    }
  };

  // Cancel edit with animation
  const cancelEdit = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingId(null);
      setEditForm({});
    }, 300);
  };

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.idNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.constituency.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "verified"
        ? p.verified
        : filter === "pending"
        ? !p.verified
        : true;

    return matchesSearch && matchesFilter;
  });

  const totalCount = participants.length;
  const verifiedCount = participants.filter((p) => p.verified).length;
  const pendingCount = totalCount - verifiedCount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white pt-8 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Alert Messages */}
        {/* Attractive Animated Alert */}
        {showAlert.show && (
          <div className="fixed top-6 right-6 z-50 max-w-md w-full">
            <div
              className={`relative overflow-hidden rounded-2xl shadow-xl transform transition-all duration-500 ${
                showAlert.type === "success"
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                  : showAlert.type === "error"
                  ? "bg-gradient-to-r from-red-50 to-rose-50 border border-red-200"
                  : showAlert.type === "warning"
                  ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200"
                  : "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200"
              } animate-slideIn`}
            >
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 h-1 w-full">
                <div
                  className={`h-full ${
                    showAlert.type === "success"
                      ? "bg-gradient-to-r from-green-400 to-emerald-500"
                      : showAlert.type === "error"
                      ? "bg-gradient-to-r from-red-400 to-rose-500"
                      : showAlert.type === "warning"
                      ? "bg-gradient-to-r from-amber-400 to-orange-500"
                      : "bg-gradient-to-r from-blue-400 to-cyan-500"
                  } animate-progress`}
                />
              </div>

              {/* Alert Content */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Animated Icon */}
                  <div className="relative">
                    <div
                      className={`absolute inset-0 animate-ping ${
                        showAlert.type === "success"
                          ? "bg-green-400"
                          : showAlert.type === "error"
                          ? "bg-red-400"
                          : showAlert.type === "warning"
                          ? "bg-amber-400"
                          : "bg-blue-400"
                      } rounded-full opacity-30`}
                    ></div>
                    <div
                      className={`relative flex items-center justify-center w-12 h-12 rounded-xl ${
                        showAlert.type === "success"
                          ? "bg-gradient-to-br from-green-100 to-emerald-100 text-green-600"
                          : showAlert.type === "error"
                          ? "bg-gradient-to-br from-red-100 to-rose-100 text-red-600"
                          : showAlert.type === "warning"
                          ? "bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600"
                          : "bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600"
                      }`}
                    >
                      {showAlert.type === "success" ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : showAlert.type === "error" ? (
                        <XCircle className="w-6 h-6" />
                      ) : showAlert.type === "warning" ? (
                        <AlertCircle className="w-6 h-6" />
                      ) : (
                        <AlertCircle className="w-6 h-6" />
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex-1">
                    <h3
                      className={`font-bold text-lg mb-1 ${
                        showAlert.type === "success"
                          ? "text-green-800"
                          : showAlert.type === "error"
                          ? "text-red-800"
                          : showAlert.type === "warning"
                          ? "text-amber-800"
                          : "text-blue-800"
                      }`}
                    >
                      {showAlert.type === "success"
                        ? "Success!"
                        : showAlert.type === "error"
                        ? "Error!"
                        : showAlert.type === "warning"
                        ? "Warning!"
                        : "Info"}
                    </h3>
                    <p className="text-gray-700">{showAlert.message}</p>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() =>
                      setShowAlert({
                        show: false,
                        message: "",
                        type: "success",
                      })
                    }
                    className={`p-1.5 rounded-lg hover:bg-white/50 transition-colors ${
                      showAlert.type === "success"
                        ? "text-green-500 hover:text-green-700"
                        : showAlert.type === "error"
                        ? "text-red-500 hover:text-red-700"
                        : showAlert.type === "warning"
                        ? "text-amber-500 hover:text-amber-700"
                        : "text-blue-500 hover:text-blue-700"
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Time Stamp */}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      showAlert.type === "success"
                        ? "bg-green-100 text-green-700"
                        : showAlert.type === "error"
                        ? "bg-red-100 text-red-700"
                        : showAlert.type === "warning"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {showAlert.type.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-12 -right-12 w-24 h-24 opacity-10">
                {showAlert.type === "success" ? (
                  <CheckCircle className="w-full h-full" />
                ) : showAlert.type === "error" ? (
                  <XCircle className="w-full h-full" />
                ) : (
                  <AlertCircle className="w-full h-full" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() =>
                navigate(
                  `/${adminId}/candidate-dashboard/${electionDocumentId}`
                )
              }
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.05)]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Voter Management
              </h1>
              <p className="text-gray-600">
                Manage voter verification and communication
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Share Election Form Button */}
              {/* Share Election Form Button in Header */}
              {/* Share Election Form Button */}
              <button
                onClick={() => {
                  const baseUrl = window.location.origin;

                  // Use the actual election name from state
                  const urlFriendlyElectionName = electionName
                    ? encodeURIComponent(
                        electionName.replace(/\s+/g, "-").toLowerCase()
                      )
                    : "election-form";

                  const electionFormLink = `${baseUrl}/#/electionForm/${adminId}/${electionDocumentId}/${urlFriendlyElectionName}`;

                  navigator.clipboard
                    .writeText(electionFormLink)
                    .then(() => {
                      showAlertMessage(
                        "Election form link copied to clipboard!",
                        "success"
                      );
                    })
                    .catch((err) => {
                      console.error("Failed to copy: ", err);
                      showAlertMessage("Failed to copy link", "error");
                    });
                }}
                className="px-5 py-2.5 border border-green-200 text-green-700 rounded-xl hover:bg-green-50 transition-all duration-200 flex items-center gap-2 text-sm font-medium bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.05)]"
              >
                <Share2 className="w-4 h-4" />
                Share Election Form
              </button>

              {/* Existing Export Data Button */}
              <button className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 text-sm font-medium bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.05)]">
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Total Voters Card - Wave Animation Style */}
          <div className="group relative bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl border border-blue-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] transition-all duration-700 hover:scale-[1.02] overflow-hidden">
            {/* Wave Background Animation */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-float-slow"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-300 rounded-full opacity-10 animate-float-slow [animation-delay:1s]"></div>
            </div>

            {/* Animated Border */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-all duration-500"></div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">
                    Total Voters
                  </p>
                  <div className="relative inline-block">
                    <p className="text-5xl font-black text-gray-900 mt-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent animate-gradient">
                      {totalCount}
                    </p>
                    {/* Animated Counter Effect */}
                    <div className="absolute -right-2 -top-2 w-4 h-4">
                      <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-60"></div>
                      <div className="absolute inset-1 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Interactive Progress Ring */}
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      strokeWidth="6"
                      className="stroke-blue-100 fill-none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      strokeWidth="6"
                      strokeDasharray="220"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      className="stroke-blue-500 fill-none transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full group-hover:rotate-12 transition-transform duration-500">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-blue-300 rounded-full animate-particle"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + i * 10}%`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Verified Card - Glowing Style */}
          <div className="group relative bg-gradient-to-br from-white to-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_0_0_4px_rgba(34,197,94,0.1),0_20px_40px_rgba(34,197,94,0.15)] transition-all duration-700 hover:scale-[1.02] overflow-hidden">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Animated Checkmark Background */}
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <CheckCircle className="w-40 h-40 text-emerald-300 animate-pulse-slow" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">
                    Verified
                  </p>
                  <p className="text-5xl font-black text-gray-900 mt-2 bg-gradient-to-r from-emerald-600 to-green-400 bg-clip-text text-transparent animate-gradient [animation-delay:0.1s]">
                    {verifiedCount}
                  </p>
                </div>
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-500">
                    <CheckCircle className="w-8 h-8 text-emerald-600 animate-checkmark" />
                  </div>
                  {/* Success Rings */}
                  <div className="absolute inset-0 rounded-xl border-2 border-emerald-300 animate-success-ring"></div>
                </div>
              </div>

              {/* Percentage with Growing Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-600 font-bold text-lg">
                    {totalCount > 0
                      ? ((verifiedCount / totalCount) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                  <span className="text-gray-500 text-sm">
                    Verification Rate
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-full relative overflow-hidden group-hover:animate-shimmer"
                    style={{
                      width:
                        totalCount > 0
                          ? `${(verifiedCount / totalCount) * 100}%`
                          : "0%",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Card - Pulsing Style */}
          <div className="group relative bg-gradient-to-br from-white to-amber-50 p-6 rounded-2xl border border-amber-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)] transition-all duration-700 hover:scale-[1.02] overflow-hidden animate-pulse-border">
            {/* Time Wave Animation */}
            <div className="absolute inset-0">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 border-2 border-amber-200 rounded-2xl animate-time-wave"
                  style={{
                    animationDelay: `${i * 0.5}s`,
                    opacity: 0.3 - i * 0.1,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>
                      <div className="absolute inset-1 w-1 h-1 bg-amber-600 rounded-full"></div>
                    </div>
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">
                      Pending Review
                    </p>
                  </div>
                  <p className="text-5xl font-black text-gray-900 mt-2 bg-gradient-to-r from-amber-600 to-orange-400 bg-clip-text text-transparent animate-gradient [animation-delay:0.2s]">
                    {pendingCount}
                  </p>
                </div>

                {/* Animated Clock */}
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl group-hover:animate-spin-clock transition-transform duration-1000">
                    <Clock className="w-8 h-8 text-amber-600" />
                  </div>
                  {/* Clock Hands Animation */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-0.5 h-4 bg-amber-600 origin-bottom animate-clock-hour"></div>
                    <div className="absolute w-0.5 h-6 bg-amber-700 origin-bottom animate-clock-minute"></div>
                  </div>
                </div>
              </div>

              {/* Time Estimation */}
              <div className="mt-8 pt-4 border-t border-amber-100">
                <div className="flex items-center justify-between">
                  <span className="text-amber-600 font-bold text-lg">
                    {totalCount > 0
                      ? ((pendingCount / totalCount) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">Awaiting Action</p>
                    <div className="flex items-center gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 h-1 bg-amber-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Combined Search and Actions Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08)] p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search and Filter Row */}
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, ID, or constituency..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200 bg-white"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="relative min-w-[200px]">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200 bg-white appearance-none cursor-pointer"
                >
                  <option value="all">All Voters</option>
                  <option value="verified">Verified Only</option>
                  <option value="pending">Pending Only</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Participants Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-5 px-7 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Voter
                  </th>
                  <th className="py-5 px-7 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="py-5 px-7 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-5 px-7 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredParticipants.map((participant) => (
                  <tr
                    key={participant.id}
                    className="hover:bg-blue-50/30 transition-colors duration-150"
                  >
                    {/* Voter Information */}
                    <td className="py-6 px-7">
                      <div className="flex items-center space-x-5">
                        <div className="relative">
                          <img
                            src={participant.image}
                            alt={participant.name}
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                          />
                          {participant.verified && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-medium text-gray-900 truncate">
                            {participant.name}
                          </p>
                          <div className="flex items-center mt-2 space-x-3">
                            <span className="inline-flex items-center text-sm text-gray-600">
                              <span className="font-semibold px-1">
                                ID: {participant.participant_id}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="py-6 px-7">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="text-base text-gray-800 truncate max-w-[200px]">
                            {participant.email}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="text-base text-gray-800">
                            {participant.phone}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="py-6 px-7">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              participant.verified
                                ? "bg-green-500"
                                : "bg-yellow-500"
                            }`}
                          ></div>
                          <span
                            className={`text-base font-medium ${
                              participant.verified
                                ? "text-green-700"
                                : "text-yellow-700"
                            }`}
                          >
                            {participant.verified ? "Verified" : "Pending"}
                          </span>
                        </div>

                        {/* Toggle Switch */}
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() =>
                              toggleVerifyParticipant(
                                participant.id,
                                participant.name
                              )
                            }
                            className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            role="switch"
                            aria-checked={participant.verified}
                          >
                            <span className="sr-only">
                              {participant.verified
                                ? "Mark as unverified"
                                : "Mark as verified"}
                            </span>
                            <span
                              className={`pointer-events-none relative inline-block h-6 w-11 transform rounded-full shadow-sm transition duration-200 ease-in-out ${
                                participant.verified
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`absolute left-0.5 top-0.5 h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                  participant.verified
                                    ? "translate-x-5"
                                    : "translate-x-0"
                                }`}
                              />
                            </span>
                          </button>

                          <span className="text-sm text-gray-700 font-medium">
                            {participant.verified ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600">
                          {participant.verified
                            ? "Voter is verified and active"
                            : "Awaiting verification"}
                        </p>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-6 px-7">
                      <div className="flex items-center space-x-3">
                        {/* Edit Button */}
                        <button
                          onClick={() => startEditing(participant)}
                          className="px-4 py-2.5 font-semibold border border-gray-300 rounded-lg cursor-pointer text-gray-700 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                          title="Edit voter details"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredParticipants.length === 0 && (
            <div className="text-center py-20 px-8">
              <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-gray-800 text-xl font-semibold mb-4">
                No voters found
              </h3>
              <p className="text-gray-600 text-base max-w-md mx-auto leading-relaxed">
                Try adjusting your search criteria or filter to find what you're
                looking for
              </p>
            </div>
          )}
        </div>

        {/* Edit Modal with Animation */}
        {(editingId || isModalOpen) && (
          <div
            className={`fixed inset-0 z-50 overflow-y-auto ${
              isModalOpen ? "animate-fadeIn" : "animate-fadeOut"
            }`}
          >
            {/* Backdrop with click handler */}
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={cancelEdit}
            ></div>

            <div className="flex min-h-full items-center justify-center p-4">
              <div
                className={`relative bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl transform transition-all duration-300 ${
                  isModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Edit Voter Details
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Participant ID: {editForm.participant_id}
                    </p>
                  </div>
                  <button
                    onClick={cancelEdit}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* UPDATED FORM LAYOUT TO MATCH IMAGE */}
                <div className="space-y-6 mb-6">
                  {/* First Row */}
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                          Full Name *
                        </label>
                        <div className="w-3/4">
                          <input
                            type="text"
                            value={editForm.name || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                            placeholder="Enter full name"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                          Email Address *
                        </label>
                        <div className="w-3/4">
                          <input
                            type="email"
                            value={editForm.email || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                email: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                            placeholder="Enter email address"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                          Age
                        </label>
                        <div className="w-3/4">
                          <input
                            type="number"
                            value={editForm.age || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                age: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                            placeholder="Enter age"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                          Gender
                        </label>
                        <div className="w-3/4">
                          <select
                            value={editForm.gender || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                gender: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                          Phone Number *
                        </label>
                        <div className="w-3/4">
                          <input
                            type="tel"
                            value={editForm.phone || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                          WhatsApp Number
                        </label>
                        <div className="w-3/4">
                          <input
                            type="tel"
                            value={editForm.whatsapp || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                whatsapp: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                            placeholder="Enter WhatsApp number"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                          ID Number *
                        </label>
                        <div className="w-3/4">
                          <input
                            type="text"
                            value={editForm.idNumber || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                idNumber: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                            placeholder="Enter ID number"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                          Participant ID
                        </label>
                        <div className="w-3/4">
                          <input
                            type="text"
                            value={editForm.participant_id || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                participant_id: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition bg-gray-50"
                            placeholder="Auto-generated"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Photo */}
                <div className="flex items-center gap-6 mb-6">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-xl object-cover border"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setPhotoFile(file);
                          setPhotoPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <span className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                      Change Photo
                    </span>
                  </label>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={cancelEdit}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-200 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Summary Footer */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {filteredParticipants.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">{totalCount}</span>{" "}
              registered voters
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Verified:</span>
                <span className="font-semibold text-gray-900">
                  {verifiedCount}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-gray-600">Pending:</span>
                <span className="font-semibold text-gray-900">
                  {pendingCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
    </div>
  );
};

export default ParticipantDashboard;
