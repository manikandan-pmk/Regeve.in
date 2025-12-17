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
} from "lucide-react";
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

const ElectionDashboard = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [participants, setParticipants] = useState([]);
  const [candidates, setCandidates] = useState([]);

  // Use unique identifiers to prevent duplication
  const allPeople = React.useMemo(() => {
    const people = [];
    const seenEmails = new Set(); // Use email to deduplicate

    // Add candidates first (they take priority)
    candidates.forEach((candidate) => {
      if (!seenEmails.has(candidate.email)) {
        seenEmails.add(candidate.email);
        people.push({
          ...candidate,
          id: `candidate-${candidate.documentId || candidate.id}`, // Use documentId for unique ID
          role: "Candidate",
        });
      }
    });

    // Add participants who are NOT already candidates
    participants.forEach((participant) => {
      if (!seenEmails.has(participant.email)) {
        seenEmails.add(participant.email);
        people.push({
          ...participant,
          id: `participant-${participant.id}`,
          role: "Voter",
        });
      }
    });

    return people;
  }, [participants, candidates]);

  // Calculate deduplicated counts
  const totalCandidates = React.useMemo(() => {
    const seenEmails = new Set();
    return candidates.filter((candidate) => {
      if (!seenEmails.has(candidate.email)) {
        seenEmails.add(candidate.email);
        return true;
      }
      return false;
    }).length;
  }, [candidates]);

  const totalParticipants = participants.length;

  const totalVoters = React.useMemo(() => {
    // Get all candidate emails (deduplicated)
    const candidateEmails = new Set();
    candidates.forEach((candidate) => {
      candidateEmails.add(candidate.email);
    });

    // Count participants who are NOT candidates
    return participants.filter((p) => !candidateEmails.has(p.email)).length;
  }, [participants, candidates]);

  const totalVotes = React.useMemo(() => {
    const seenEmails = new Set();
    return candidates.reduce((sum, candidate) => {
      if (!seenEmails.has(candidate.email)) {
        seenEmails.add(candidate.email);
        return sum + (candidate.votes || 0);
      }
      return sum;
    }, 0);
  }, [candidates]);

  // -----------------------------
  // FETCH PARTICIPANTS & CANDIDATES
  // -----------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Participants
        const participantRes = await axiosInstance.get(
          "/election-participants?populate=*"
        );

        const participantArray = participantRes.data.data || [];

        const formattedParticipants = participantArray.map((item) => {
          const photoUrl = item.attributes?.photo?.data?.attributes?.url
            ? `https://api.regeve.in${item.attributes.photo.data.attributes.url}`
            : `https://api.dicebear.com/7.x/initials/svg?seed=${
                item.attributes?.name || "User"
              }`;

          return {
            id: item.id,
            documentId: item.documentId,
            name: item.attributes?.name || "Unknown",
            email: item.attributes?.email || "",
            registrationDate: item.attributes?.createdAt || item.createdAt,
            image: photoUrl,
            votes: 0,
            party: null,
            isVerified: item.attributes?.isVerified || false,
          };
        });

        // Fetch Candidates
        const candidateRes = await axiosInstance.get(
          "/candidates?populate[photo]=true&populate[election_candidate_position]=true"
        );

        const candidateArray = candidateRes.data.data || [];
        const formattedCandidates = candidateArray.map((item) => {
          // Handle both Strapi v4 and v5 structures
          const attributes = item.attributes || item;
          const photoData =
            attributes?.photo?.data?.attributes || attributes?.photo;
          const positionData =
            attributes?.election_candidate_position?.data?.attributes ||
            attributes?.election_candidate_position;

          const photoUrl = photoData?.url
            ? `https://api.regeve.in${photoData.url}`
            : `https://api.dicebear.com/7.x/initials/svg?seed=${
                attributes?.name || "Candidate"
              }`;

          return {
            id: item.id,
            documentId: item.documentId,
            name: attributes?.name || "Unknown Candidate",
            email: attributes?.email || "",
            registrationDate: attributes?.createdAt || item.createdAt,
            image: photoUrl,
            votes: attributes?.votes || 0,
            party: attributes?.party || null,
            position: positionData?.Position || "Candidate",
          };
        });

        // Filter only verified participants
        const verifiedParticipants = formattedParticipants.filter(
          (p) => p.isVerified === true
        );

        setParticipants(verifiedParticipants);
        setCandidates(formattedCandidates);
      } catch (error) {
        console.error("API Fetch Error:", error);
      }
    };

    fetchData();
  }, []);

  // Filtering Logic
  const filteredList = allPeople.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.party && p.party.toLowerCase().includes(search.toLowerCase())) ||
      (p.position && p.position.toLowerCase().includes(search.toLowerCase()));

    const matchesFilter =
      filter === "all" ||
      (filter === "candidate" && p.role === "Candidate") ||
      (filter === "voter" && p.role === "Voter");

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="pt-6 md:pt-10 px-3 md:px-4 lg:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 md:mb-6">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Election Analytics Dashboard
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
              Monitor election progress and participant analytics
            </p>
          </div>
          <button className="w-full md:w-auto px-4 md:px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm shadow-sm hover:shadow">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Stats Grid - Fixed for mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-10">
          <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.05),0_15px_25px_rgba(0,0,0,0.12)] transition-all duration-300">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-blue-50">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <span className="text-xs md:text-sm text-green-600 font-medium">
                +8%
              </span>
            </div>
            <p className="text-gray-500 text-xs md:text-sm font-medium mb-1 md:mb-2">
              Total Participants
            </p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">
              {totalParticipants.toLocaleString()}
            </p>
            <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm text-gray-500">
              <UserPlus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span>
                {totalCandidates} candidates • {totalVoters} voters
              </span>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.05),0_15px_25px_rgba(0,0,0,0.12)] transition-all duration-300">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-green-50">
                <UserCheck className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <span className="text-xs md:text-sm text-blue-600 font-medium">
                Active
              </span>
            </div>
            <p className="text-gray-500 text-xs md:text-sm font-medium mb-1 md:mb-2">
              Total Candidates
            </p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">
              {totalCandidates}
            </p>
            <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm text-gray-500">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span>Active contenders in race</span>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.05),0_15px_25px_rgba(0,0,0,0.12)] transition-all duration-300">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-purple-50">
                <Vote className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
              <span className="text-xs md:text-sm text-purple-600 font-medium">
                Cast
              </span>
            </div>
            <p className="text-gray-500 text-xs md:text-sm font-medium mb-1 md:mb-2">
              Total Votes
            </p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">
              {totalVotes.toLocaleString()}
            </p>
            <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm text-gray-500">
              <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span>Votes recorded to date</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl md:rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Candidates Directory
              </h2>
              <p className="text-gray-500 text-xs md:text-sm mt-1">
                Manage and view all election Candidates
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="text-xs md:text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  {filteredList.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {allPeople.length}
                </span>{" "}
                participants
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-4 md:p-6 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search candidates by name, email, or position..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3.5 bg-white border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 placeholder-gray-500 text-sm md:text-base shadow-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center bg-white border border-gray-300 rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 shadow-sm">
                <div className="outline-none bg-transparent text-gray-700 text-sm md:text-base">
                  Candidates
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table - Made responsive */}
        <div className="overflow-x-auto">
          {/* Mobile Cards View */}
          <div className="block md:hidden">
            {filteredList.map((p) => (
              <div
                key={p.id}
                className="p-4 border-b border-gray-200 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-100/30 transition-all duration-200"
              >
                {/* Participant Info */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="relative">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-md"
                    />
                    {p.role === "Candidate" && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                        <UserCheck className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {p.name}
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
                        {p.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role & Position */}
                <div className="mb-3">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${
                      p.role === "Candidate"
                        ? "bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 border border-blue-200"
                        : "bg-gradient-to-r from-gray-50 to-gray-100/50 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {p.role === "Candidate" ? (
                      <>
                        <UserCheck className="w-3 h-3 mr-1.5" /> Candidate
                      </>
                    ) : (
                      <>
                        <Users className="w-3 h-3 mr-1.5" /> Voter
                      </>
                    )}
                  </span>
                  {p.position && (
                    <div className="text-xs text-gray-600 mt-2">
                      <span className="font-medium">Position:</span>{" "}
                      {p.position}
                    </div>
                  )}
                </div>

                {/* Registration Date */}
                <div className="flex items-center gap-2 text-gray-700 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {new Date(p.registrationDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Registered</div>
                  </div>
                </div>

                {/* Performance / Votes */}
                <div>
                  {p.role === "Candidate" ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Votes:</span>
                        <span className="font-bold text-gray-900 text-sm">
                          {(p.votes || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-1.5 rounded-full shadow-sm"
                          style={{
                            width:
                              totalVotes > 0
                                ? `${((p.votes || 0) / totalVotes) * 100}%`
                                : "0%",
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {totalVotes > 0
                          ? `${(((p.votes || 0) / totalVotes) * 100).toFixed(
                              1
                            )}% of total votes`
                          : "0% of total votes"}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="p-1.5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                        <Vote className="w-4 h-4" />
                      </div>
                      <span className="text-sm">Eligible Voter</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <table className="w-full hidden md:table">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
              <tr>
                <th className="p-4 lg:p-6 text-left text-sm font-semibold text-gray-700">
                  Participant
                </th>
                <th className="p-4 lg:p-6 text-left text-sm font-semibold text-gray-700">
                  Role & Position
                </th>
                <th className="p-4 lg:p-6 text-left text-sm font-semibold text-gray-700">
                  Registration
                </th>
                <th className="p-4 lg:p-6 text-left text-sm font-semibold text-gray-700">
                  Performance
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200/50">
              {filteredList.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-100/30 transition-all duration-200"
                >
                  {/* Participant Column */}
                  <td className="p-4 lg:p-6">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="relative">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 lg:w-14 lg:h-14 rounded-lg lg:rounded-xl object-cover border-2 border-white shadow-md"
                        />
                        {p.role === "Candidate" && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                            <UserCheck className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm lg:text-base">
                          {p.name}
                        </h3>
                        <div className="flex items-center gap-1 lg:gap-2 mt-1 lg:mt-1.5">
                          <svg
                            className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400"
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
                          <span className="text-xs lg:text-sm text-gray-600 truncate max-w-[150px] lg:max-w-[180px]">
                            {p.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role Column */}
                  <td className="p-4 lg:p-6">
                    <div className="space-y-1 lg:space-y-2">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-medium ${
                          p.role === "Candidate"
                            ? "bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 border border-blue-200"
                            : "bg-gradient-to-r from-gray-50 to-gray-100/50 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {p.role === "Candidate" ? (
                          <>
                            <UserCheck className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5 lg:mr-2" />{" "}
                            Candidate
                          </>
                        ) : (
                          <>
                            <Users className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5 lg:mr-2" />{" "}
                            Voter
                          </>
                        )}
                      </span>
                      {p.position && (
                        <div className="text-xs lg:text-sm text-gray-600">
                          <span className="font-medium">Position:</span>{" "}
                          {p.position}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Registration Date */}
                  <td className="p-4 lg:p-6">
                    <div className="flex items-center gap-2 lg:gap-3 text-gray-700">
                      <div className="p-2 lg:p-2.5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                        <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm lg:text-base">
                          {new Date(p.registrationDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </div>
                        <div className="text-xs lg:text-sm text-gray-500 mt-0.5">
                          Registered
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Performance / Votes */}
                  <td className="p-4 lg:p-6">
                    {p.role === "Candidate" ? (
                      <div className="space-y-2 lg:space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs lg:text-sm text-gray-600">
                            Votes:
                          </span>
                          <span className="font-bold text-gray-900 text-sm lg:text-base">
                            {(p.votes || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 lg:h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-1.5 lg:h-2 rounded-full shadow-sm"
                            style={{
                              width:
                                totalVotes > 0
                                  ? `${((p.votes || 0) / totalVotes) * 100}%`
                                  : "0%",
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {totalVotes > 0
                            ? `${(((p.votes || 0) / totalVotes) * 100).toFixed(
                                1
                              )}% of total votes`
                            : "0% of total votes"}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 lg:gap-3 text-gray-500">
                        <div className="p-2 lg:p-2.5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                          <Vote className="w-4 h-4 lg:w-5 lg:h-5" />
                        </div>
                        <span className="text-sm">Eligible Voter</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredList.length === 0 && (
            <div className="text-center py-12 md:py-20">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-inner">
                <Users className="w-8 h-8 md:w-12 md:h-12 text-gray-400" />
              </div>
              <h3 className="text-gray-700 text-lg md:text-xl font-semibold mb-2 md:mb-3">
                No participants found
              </h3>
              <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto px-4">
                Try adjusting your search criteria or filter to find what you're
                looking for
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredList.length > 0 && (
          <div className="px-4 md:px-6 py-3 md:py-5 border-t border-gray-200 bg-gradient-to-r from-gray-50/50 to-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
              <div className="text-xs md:text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {filteredList.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {allPeople.length}
                </span>{" "}
                participants
              </div>
              <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                  <span className="text-gray-600">Candidates:</span>
                  <span className="font-semibold text-gray-900">
                    {totalCandidates}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gradient-to-r from-gray-400 to-gray-500"></div>
                  <span className="text-gray-600">Voters:</span>
                  <span className="font-semibold text-gray-900">
                    {totalVoters}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectionDashboard;
