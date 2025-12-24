import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  UserCheck,
  Trophy,
  Filter,
  Download,
  Calendar,
  Vote,
  UserPlus,
  TrendingUp,
  Award,
} from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

const ElectionDashboard = () => {
  const { electionDocumentId } = useParams();
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [participants, setParticipants] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract unique positions from candidates
  const positions = React.useMemo(() => {
    const uniquePositions = new Set();
    candidates.forEach((candidate) => {
      if (candidate.position) {
        uniquePositions.add(candidate.position);
      }
    });
    return Array.from(uniquePositions).sort();
  }, [candidates]);

  // Only show candidates (no voters)
  const allCandidates = React.useMemo(() => {
    const seenIds = new Set();
    const uniqueCandidates = [];

    candidates.forEach((candidate) => {
      const uniqueKey = candidate.email || `candidate-${candidate.id}`;

      if (!seenIds.has(uniqueKey)) {
        seenIds.add(uniqueKey);
        uniqueCandidates.push({
          ...candidate,
          id: `candidate-${candidate.id}`,
          role: "Candidate",
          name: candidate.name || "Unknown",
          email: candidate.email || "",
          registrationDate: candidate.registrationDate || candidate.createdAt,
          image:
            candidate.image ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`,
          isVerified: true,
          votes: candidate.votes || 0,
          position: candidate.position || null,
          party: candidate.party || null,
        });
      }
    });

    return uniqueCandidates;
  }, [candidates]);

  // Calculate deduplicated counts
  const totalCandidates = React.useMemo(() => {
    return allCandidates.length;
  }, [allCandidates]);

  // Total participants count (only for stats)
  const totalParticipants = React.useMemo(() => {
    const seen = new Set();
    participants.forEach((p) => {
      const key = p.documentId || p.id;
      if (key) seen.add(key);
    });
    return seen.size;
  }, [participants]);

  // Total voters count (only for stats)
  const totalVoters = React.useMemo(() => {
    if (participants.length === 0) return 0;

    // Get all candidate emails
    const candidateEmails = new Set();
    candidates.forEach((candidate) => {
      if (candidate.email) candidateEmails.add(candidate.email);
    });

    // Count participants who are NOT candidates
    const seenEmails = new Set();
    const uniqueVoters = participants.filter((p) => {
      if (p.email && !seenEmails.has(p.email)) {
        seenEmails.add(p.email);
        return !candidateEmails.has(p.email);
      }
      return false;
    });

    return uniqueVoters.length;
  }, [participants, candidates]);

  const totalVotes = React.useMemo(() => {
    return allCandidates.reduce((sum, candidate) => {
      return sum + (candidate.votes || 0);
    }, 0);
  }, [allCandidates]);

  // Calculate maximum votes for percentage calculation
  const maxVotes = React.useMemo(() => {
    if (allCandidates.length === 0) return 1;
    const max = Math.max(...allCandidates.map((c) => c.votes || 0));
    return max > 0 ? max : 1;
  }, [allCandidates]);

  // ===============================
  // EXPORT TO EXCEL HANDLER
  // ===============================
  const exportToExcel = () => {
    if (allCandidates.length === 0) {
      alert("No candidate data to export");
      return;
    }

    const excelData = allCandidates.map((c, index) => ({
      "S.No": index + 1,
      "Candidate Name": c.name,
      Email: c.email,
      Phone: c.phone || "-",
      "WhatsApp Number": c.whatsapp || "-",
      Gender: c.gender || "-",
      Age: c.age || "-",
      Position: c.position || "-",
      Votes: c.votes || 0,
      Winner: c.IsWinnedCandidate ? "YES" : "NO",
      "Registration Date": c.registrationDate
        ? new Date(c.registrationDate).toLocaleDateString()
        : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `Election_${electionDocumentId}_Candidates.xlsx`);
  };

  // -----------------------------
  // FETCH DATA FUNCTIONS
  // -----------------------------

  const fetchCandidates = async () => {
    try {
      const sectionRes = await axiosInstance.get(
        `/election-candidate-positions?electionId=${electionDocumentId}`
      );

      const sections = sectionRes.data.data || [];

      // Extract candidates from sections
      const extractedCandidates = sections.flatMap((section) =>
        (section.candidates || []).map((c) => ({
          id: c.id,
          documentId: c.documentId,
          name: c.name,
          phone: c.phone_number ? String(c.phone_number) : "",
          whatsapp: c.whatsApp_number ? String(c.whatsApp_number) : "",
          gender: c.gender || "",
          age: c.age || "",
          email: c.email || "",
          registrationDate: c.createdAt,
          image: c.photo?.url
            ? `https://api.regeve.in${c.photo.url}`
            : `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`,
          votes: c.vote_count || 0,
          party: c.party || null,
          position: section.Position,
          IsWinnedCandidate: c.IsWinnedCandidate === true,
        }))
      );

      return extractedCandidates;
    } catch (err) {
      console.error("Error fetching candidates:", err);
      throw err;
    }
  };

  const fetchParticipants = async () => {
    try {
      const res = await axiosInstance.get(
        `/election-participants?electionDocumentId=${electionDocumentId}`
      );

      if (!res.data?.success || !Array.isArray(res.data.data)) {
        return [];
      }

      return res.data.data.map((item) => ({
        id: item.id,
        documentId: item.documentId,
        name: item.name || "Unknown",
        email: item.email || "",
        isVerified: item.isVerified === true,
        registrationDate: item.createdAt,
        image: `https://api.dicebear.com/7.x/initials/svg?seed=${
          item.name || "User"
        }`,
      }));
    } catch (err) {
      console.error("Participants fetch failed:", err);
      return [];
    }
  };

  // Update the main fetchData function
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [candidatesData, participantsData] = await Promise.all([
        fetchCandidates(),
        fetchParticipants(),
      ]);

      setCandidates(candidatesData);
      setParticipants(participantsData);

      // If no participants found but we have candidates, log it
      if (participantsData.length === 0 && candidatesData.length > 0) {
        console.log("No participants found, but showing candidates");
      }
    } catch (err) {
      console.error("ElectionDashboard fetch error:", err);
      setError("Failed to load election data. Please try again.");
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    if (!electionDocumentId) {
      setError("No election ID provided");
      setLoading(false);
      return;
    }
    fetchData();
  }, [electionDocumentId]);

  // Filtering Logic with position filter
  const filteredCandidates = React.useMemo(() => {
    return allCandidates.filter((candidate) => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(search.toLowerCase()) ||
        (candidate.party &&
          candidate.party.toLowerCase().includes(search.toLowerCase())) ||
        (candidate.position &&
          candidate.position.toLowerCase().includes(search.toLowerCase()));

      const matchesPositionFilter =
        positionFilter === "all" ||
        (candidate.position && candidate.position === positionFilter);

      return matchesSearch && matchesPositionFilter;
    });
  }, [allCandidates, search, positionFilter]);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="pt-6 md:pt-10 px-3 md:px-4 lg:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 md:mb-6">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 animate-fade-in">
              Election Analytics Dashboard
            </h1>
            <p className="text-gray-500 text-sm md:text-base animate-fade-in animation-delay-100">
              Monitor election progress and candidate analytics
            </p>
          </div>
          <button
            onClick={exportToExcel}
            className="w-full md:w-auto px-4 md:px-5 py-2.5 bg-white border border-gray-200
  text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300
  flex items-center justify-center gap-2 font-medium text-sm shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid - Updated to show only candidate-focused stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-10">
          {loading ? (
            // Loading skeleton for stats cards
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-100 animate-pulse"
              >
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-gray-200">
                    <div className="w-5 h-5 md:w-6 md:h-6"></div>
                  </div>
                  <div className="w-10 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 md:h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : (
            <>
              {/* Total Candidates Card */}
              <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.05),0_15px_25px_rgba(0,0,0,0.12)] transition-all duration-500 ease-out hover:scale-[1.02] transform animate-slide-up">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-blue-50 animate-pulse-once">
                    <UserCheck className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <span className="text-xs md:text-sm text-green-600 font-medium animate-fade-in">
                    {totalCandidates > 0 ? "Active" : "No Candidates"}
                  </span>
                </div>
                <p className="text-gray-500 text-xs md:text-sm font-medium mb-1 md:mb-2">
                  Total Candidates
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 animate-count-up">
                  {totalCandidates}
                </p>
                <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm text-gray-500">
                  <UserCheck className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-bounce-once" />
                  <span>
                    {positions.length} position
                    {positions.length !== 1 ? "s" : ""} available
                  </span>
                </div>
              </div>

              {/* Total Positions Card */}
              <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.05),0_15px_25px_rgba(0,0,0,0.12)] transition-all duration-500 ease-out hover:scale-[1.02] transform animate-slide-up animation-delay-100">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-green-50 animate-pulse-once">
                    <Award className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                  <span className="text-xs md:text-sm text-blue-600 font-medium animate-fade-in">
                    {positions.length > 0 ? "Available" : "No Positions"}
                  </span>
                </div>
                <p className="text-gray-500 text-xs md:text-sm font-medium mb-1 md:mb-2">
                  Total Positions
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 animate-count-up animation-delay-100">
                  {positions.length}
                </p>
                <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm text-gray-500">
                  <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-bounce-once animation-delay-100" />
                  <span>
                    {positions.length > 0
                      ? "Contested positions"
                      : "No positions defined"}
                  </span>
                </div>
              </div>

              {/* Total Votes Card */}
              <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.05),0_15px_25px_rgba(0,0,0,0.12)] transition-all duration-500 ease-out hover:scale-[1.02] transform animate-slide-up animation-delay-200">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-purple-50 animate-pulse-once">
                    <Vote className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  </div>
                  <span className="text-xs md:text-sm text-purple-600 font-medium animate-fade-in">
                    {totalVotes > 0 ? "Cast" : "No Votes"}
                  </span>
                </div>
                <p className="text-gray-500 text-xs md:text-sm font-medium mb-1 md:mb-2">
                  Total Votes
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 animate-count-up animation-delay-200">
                  {totalVotes.toLocaleString()}
                </p>
                <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm text-gray-500">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-bounce-once animation-delay-200" />
                  <span>
                    {totalVotes > 0
                      ? "Votes recorded to date"
                      : "Awaiting first vote"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl md:rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-fade-in animation-delay-300">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Candidate Directory
              </h2>
              <p className="text-gray-500 text-xs md:text-sm mt-1">
                View and manage all election candidates
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="text-xs md:text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  {filteredCandidates.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {totalCandidates}
                </span>{" "}
                candidates
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-4 md:p-6 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 transition-transform duration-300 group-hover:scale-110" />
                <input
                  type="text"
                  placeholder="Search candidates by name, email, position ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3.5 bg-white border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 text-gray-700 placeholder-gray-500 text-sm md:text-base shadow-sm hover:shadow-md focus:shadow-lg"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {/* Position Filter Only */}
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="flex items-center bg-white border border-gray-300 rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 hover:shadow-md text-sm md:text-base min-w-[180px]"
                disabled={positions.length === 0}
              >
                <option value="all">All Positions</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            // Loading skeleton for table
            <div className="p-4 md:p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Mobile Cards View - Only Candidates */}
              <div className="block md:hidden">
                {filteredCandidates.length === 0 ? (
                  <div className="text-center py-12 animate-fade-in">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <UserCheck className="w-8 h-8 text-gray-400 animate-pulse" />
                    </div>
                    <h3 className="text-gray-700 text-lg font-semibold mb-2">
                      No candidates found
                    </h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto px-4">
                      {search || positionFilter !== "all"
                        ? "Try adjusting your search or position filter"
                        : "No candidates registered for this election"}
                    </p>
                  </div>
                ) : (
                  filteredCandidates.map((candidate, index) => (
                    <div
                      key={candidate.id}
                      className="p-4 border-b border-gray-200 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-100/30 transition-all duration-300 ease-out animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Candidate Info */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="relative">
                          <img
                            src={candidate.image}
                            alt={candidate.name}
                            className="w-12 h-12 rounded-lg transition-transform duration-300 hover:scale-110"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md animate-pulse-slow">
                            <UserCheck className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {candidate.name}
                          </h3>
                          <div className="flex items-center gap-1 mt-1">
                            <svg
                              className="w-3 h-3 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-xs text-gray-600 truncate">
                              {candidate.email}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Position & Party */}
                      <div className="mb-3 space-y-2">
                        {candidate.position && (
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Position:</span>{" "}
                            {candidate.position}
                          </div>
                        )}
                        {candidate.party && (
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Party:</span>{" "}
                            {candidate.party}
                          </div>
                        )}
                      </div>

                      {/* Registration Date */}
                      <div className="flex items-center gap-2 text-gray-700 mb-3">
                        <div className="p-1.5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg transition-transform duration-300 hover:scale-110">
                          <Calendar className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {candidate.registrationDate
                              ? new Date(
                                  candidate.registrationDate
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Not specified"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Registered
                          </div>
                        </div>
                      </div>

                      {/* Votes Performance */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Votes:</span>
                          <span className="font-bold text-gray-900 text-sm animate-count-up">
                            {(candidate.votes || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-1.5 rounded-full shadow-sm transition-all duration-1000 ease-out"
                            style={{
                              width: `${
                                ((candidate.votes || 0) / maxVotes) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {maxVotes > 0
                            ? `${(
                                ((candidate.votes || 0) / maxVotes) *
                                100
                              ).toFixed(1)}% of highest votes`
                            : "No votes yet"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View - Only Candidates */}
              <table className="w-full hidden md:table">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                  <tr>
                    <th className="p-4 lg:p-6 text-left text-sm font-semibold text-gray-700">
                      Candidate
                    </th>
                    <th className="p-4 lg:p-6 text-left text-sm font-semibold text-gray-700">
                      Position
                    </th>
                    <th className="p-4 lg:p-6 text-left text-sm font-semibold text-gray-700">
                      Registration
                    </th>
                    <th className="p-4 lg:p-6 text-left text-sm font-semibold text-gray-700">
                      Vote Performance
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200/50">
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center mb-4 shadow-inner">
                            <UserCheck className="w-8 h-8 text-gray-400 animate-pulse" />
                          </div>
                          <h3 className="text-gray-700 text-lg font-semibold mb-2">
                            No candidates found
                          </h3>
                          <p className="text-gray-500 text-sm max-w-md">
                            {search || positionFilter !== "all"
                              ? "Try adjusting your search or position filter"
                              : "No candidates registered for this election"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((candidate, index) => (
                      <tr
                        key={candidate.id}
                        className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-100/30 transition-all duration-300 ease-out animate-slide-up"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        {/* Candidate Column */}
                        <td className="p-4 lg:p-6">
                          <div className="flex items-center gap-3 lg:gap-4">
                            <div className="relative">
                              <img
                                src={candidate.image}
                                alt={candidate.name}
                                className="w-14 h-14 rounded-lg transition-transform duration-300 hover:scale-110"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-base">
                                {candidate.name}
                                {candidate.IsWinnedCandidate && (
                                  <span
                                    className="inline-flex ml-4 items-center gap-1 px-2 py-0.5
      text-sm font-semibold bg-green-100 text-green-800
      border border-green-300 rounded-full"
                                  >
                                    <Trophy className="w-3 h-3" />
                                    Winner
                                  </span>
                                )}
                              </h3>
                              <div className="flex items-center gap-2 mt-1.5">
                                <svg
                                  className="w-4 h-4 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                                <span className="text-sm text-gray-600 truncate max-w-[200px]">
                                  {candidate.email}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Position & Party Column */}
                        <td className="p-4 lg:p-6">
                          <div className="space-y-2">
                            {candidate.position && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">
                                  {" "}
                                  {candidate.position}{" "}
                                </span>
                              </div>
                            )}
                            {candidate.party && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Party:</span>{" "}
                                {candidate.party}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Registration Date */}
                        <td className="p-4 lg:p-6">
                          <div className="flex items-center gap-3 text-gray-700">
                            <div className="p-2.5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg transition-transform duration-300 hover:scale-110">
                              <Calendar className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-base">
                                {candidate.registrationDate
                                  ? new Date(
                                      candidate.registrationDate
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "Not specified"}
                              </div>
                              <div className="text-sm text-gray-500 mt-0.5">
                                Registered
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Vote Performance */}
                        <td className="p-4 lg:p-6">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Votes:
                              </span>
                              <span className="font-bold text-gray-900 text-base animate-count-up">
                                {(candidate.votes || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full shadow-sm transition-all duration-1000 ease-out"
                                style={{
                                  width: `${
                                    ((candidate.votes || 0) / maxVotes) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {maxVotes > 0
                                ? `${(
                                    ((candidate.votes || 0) / maxVotes) *
                                    100
                                  ).toFixed(1)}% of highest votes`
                                : "No votes yet"}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Footer */}
        {filteredCandidates.length > 0 && !loading && (
          <div className="px-4 md:px-6 py-3 md:py-5 border-t border-gray-200 bg-gradient-to-r from-gray-50/50 to-white animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
              <div className="text-xs md:text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {filteredCandidates.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {totalCandidates}
                </span>{" "}
                candidates
                {positionFilter !== "all" && (
                  <span className="ml-2 text-blue-600">
                    • Position: {positionFilter}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse"></div>
                  <span className="text-gray-600">Candidates:</span>
                  <span className="font-semibold text-gray-900">
                    {totalCandidates}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 animate-pulse animation-delay-200"></div>
                  <span className="text-gray-600">Total Votes:</span>
                  <span className="font-semibold text-gray-900">
                    {totalVotes.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 animate-pulse animation-delay-100"></div>
                  <span className="text-gray-600">Positions:</span>
                  <span className="font-semibold text-gray-900">
                    {positions.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes countUp {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulseOnce {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes bounceOnce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes pulseSlow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-count-up {
          animation: countUp 1s ease-out forwards;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animate-pulse-once {
          animation: pulseOnce 0.5s ease-out;
        }

        .animate-bounce-once {
          animation: bounceOnce 0.5s ease-out;
        }

        .animate-pulse-slow {
          animation: pulseSlow 2s infinite;
        }

        .animation-delay-100 {
          animation-delay: 100ms;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
};

export default ElectionDashboard;
