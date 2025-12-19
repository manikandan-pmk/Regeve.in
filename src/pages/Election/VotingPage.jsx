import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import {
  User,
  Vote,
  CheckCircle,
  Award,
  Landmark,
  Trophy,
  Crown,
  X,
} from "lucide-react";
import axios from "axios";

const API_URL = "https://api.regeve.in/api";
const IMAGE_BASE_URL = "https://api.regeve.in";

const VotingPage = ({ token = null }) => {
  const params = useParams();
  const documentId = params.electionDocumentId;

  const [electionData, setElectionData] = useState({
    electionName: "",
    electionType: "Custom",
    electionCategory: "Custom Election",
    electionId: null,
  });

  const [positions, setPositions] = useState([]);
  const [submittedVotes, setSubmittedVotes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [winners, setWinners] = useState({});
  const [voteCounts, setVoteCounts] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [electionIdFromApi, setElectionIdFromApi] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState({});

  // Create axios instance with token
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (token) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    return instance;
  }, [token]);

  // Fetch election details
  const fetchElectionDetails = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_URL}/elections/public/${documentId}`
      );

      if (response.data && response.data.data) {
        const apiData = response.data.data;

        // Get election heading from the correct field
        const electionName =
          apiData.Election_Name || apiData.election_name || "Untitled Election";
        const electionCategory =
          apiData.Election_Category || apiData.election_category || "Election";
        const electionType =
          apiData.Election_Type || apiData.election_type || "Custom";

        setElectionData({
          electionName: electionName,
          electionCategory: electionCategory,
          electionType: electionType,
          electionId: apiData.id,
        });

        setElectionIdFromApi(apiData.id);

        const positionsWithCandidates =
          apiData.election_candidate_positions || [];
        return positionsWithCandidates;
      } else {
        console.error("No data in response");
        return [];
      }
    } catch (error) {
      console.error("Error fetching election details:", error);
      setFetchError(`Failed to load election: ${error.message}`);
      return [];
    }
  }, [documentId]);

  // Fetch vote counts
  const fetchVoteCounts = useCallback(async () => {
    try {
      if (!electionIdFromApi) return;

      const votesResponse = await axiosInstance.get("/votes", {
        params: {
          filters: {
            election: {
              id: electionIdFromApi,
            },
          },
          populate: "*",
        },
      });

      if (votesResponse.data && Array.isArray(votesResponse.data)) {
        const counts = {};
        votesResponse.data.forEach((vote) => {
          if (vote.candidate && vote.candidate.id) {
            const candidateId = vote.candidate.id;
            counts[candidateId] = (counts[candidateId] || 0) + 1;
          }
        });

        setVoteCounts(counts);

        setPositions((prevPositions) =>
          prevPositions.map((position) => ({
            ...position,
            candidates: position.candidates.map((candidate) => ({
              ...candidate,
              votes: counts[candidate.id] || 0,
            })),
          }))
        );
      }
    } catch (error) {
      console.log("Could not fetch vote counts:", error);
    }
  }, [axiosInstance, electionIdFromApi]);

  // Fetch winners
  const fetchWinners = useCallback(async () => {
    try {
      if (!electionIdFromApi) return;

      const response = await axiosInstance.get("/winners", {
        params: {
          filters: {
            election: {
              id: electionIdFromApi,
            },
          },
          populate: "*",
        },
      });

      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const winnersMap = {};
        response.data.forEach((winner) => {
          if (
            winner.position &&
            winner.position.id &&
            winner.candidate &&
            winner.candidate.id
          ) {
            winnersMap[winner.position.id] = winner.candidate.id;
          }
        });
        setWinners(winnersMap);
      }
    } catch (error) {
      console.error("Error fetching winners:", error);
    }
  }, [axiosInstance, electionIdFromApi]);

  // Main voting data fetch
  const fetchVotingData = useCallback(async () => {
    if (!documentId) {
      console.log("No documentId available");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const electionDetails = await fetchElectionDetails();

      if (!electionDetails || electionDetails.length === 0) {
        console.log("No election details found");
        setPositions([]);
        setFetchError("No positions found for this election");
        return;
      }

      // Transform API data
      const positionsData = electionDetails.map((position) => {
        let candidates = [];
        if (position.candidates && Array.isArray(position.candidates)) {
          candidates = position.candidates;
        } else if (
          position.election_candidates &&
          Array.isArray(position.election_candidates)
        ) {
          candidates = position.election_candidates;
        }

        return {
          id: position.id,
          name: position.Position || position.position || "Unknown Position",
          position:
            position.Position || position.position || "Unknown Position",
          submitted: submittedVotes[position.id] || false,
          candidates: candidates.map((candidate) => {
            let photoUrl = null;

            if (candidate.photo) {
              const photo = candidate.photo;

              if (photo.formats?.medium?.url) {
                photoUrl = `${IMAGE_BASE_URL}${photo.formats.medium.url}`;
              } else if (photo.formats?.small?.url) {
                photoUrl = `${IMAGE_BASE_URL}${photo.formats.small.url}`;
              } else if (photo.url) {
                photoUrl = `${IMAGE_BASE_URL}${photo.url}`;
              }
            }

            return {
              id: candidate.id,
              name: candidate.name || "Unknown Candidate",
              email: candidate.email || "",
              phone: candidate.phone_number || candidate.phone || "",
              whatsapp: candidate.whatsApp_number || candidate.whatsapp || "",
              age: candidate.age || "",
              gender: candidate.gender || "",
              candidate_id: candidate.candidate_id || candidate.id || "",
              position:
                position.Position || position.position || "Unknown Position",
              photoUrl: photoUrl,
              bio:
                candidate.bio ||
                `${candidate.name} is a candidate for ${
                  position.Position || position.position
                }`,
              location: candidate.location || "Not specified",
              department: candidate.department || "General",
              experience: candidate.experience || "Not specified",
              votes: 0,
              selected: false,
              isWinner: winners[position.id] === candidate.id,
            };
          }),
        };
      });

      setPositions(positionsData);

      if (electionIdFromApi) {
        await fetchVoteCounts();
      }
    } catch (error) {
      console.error("Error fetching voting data:", error);
      setFetchError(
        "Failed to load voting data. Please check the election ID and try again."
      );
      setPositions([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    documentId,
    fetchElectionDetails,
    submittedVotes,
    winners,
    electionIdFromApi,
    fetchVoteCounts,
  ]);

  useEffect(() => {
    if (documentId) {
      fetchVotingData();
    } else {
      setIsLoading(false);
      setFetchError("No election ID provided in URL");
    }
  }, [documentId, fetchVotingData, refreshKey]);

  useEffect(() => {
    if (showResults && electionIdFromApi) {
      fetchWinners();
    }
  }, [showResults, fetchWinners, electionIdFromApi]);

  // Handle vote selection
  const handleVote = (candidateId, positionId) => {
    if (submittedVotes[positionId]) return;

    setSelectedCandidates((prev) => ({
      ...prev,
      [positionId]: candidateId,
    }));

    setPositions((prevPositions) =>
      prevPositions.map((position) => {
        if (position.id === positionId) {
          return {
            ...position,
            candidates: position.candidates.map((candidate) => ({
              ...candidate,
              selected: candidate.id === candidateId,
            })),
          };
        }
        return position;
      })
    );
  };

  // Clear selection for a position
  const handleClearSelection = (positionId) => {
    setSelectedCandidates((prev) => {
      const newSelected = { ...prev };
      delete newSelected[positionId];
      return newSelected;
    });

    setPositions((prevPositions) =>
      prevPositions.map((position) => {
        if (position.id === positionId) {
          return {
            ...position,
            candidates: position.candidates.map((candidate) => ({
              ...candidate,
              selected: false,
            })),
          };
        }
        return position;
      })
    );
  };

  // Handle vote submission
  const handleSubmitVote = async (positionId, positionName) => {
    if (!token) {
      alert("You need to be logged in to vote. Please log in first.");
      return;
    }

    const position = positions.find((p) => p.id === positionId);
    if (!position) return;

    const selectedCandidate = position.candidates.find((c) => c.selected);
    if (!selectedCandidate) {
      alert(`Please select a candidate for ${positionName} before submitting.`);
      return;
    }

    try {
      const voteData = {
        candidate: selectedCandidate.id,
        election: electionIdFromApi,
        position: positionId,
        timestamp: new Date().toISOString(),
      };

      await axiosInstance.post("/votes", {
        data: voteData,
      });

      setVoteCounts((prev) => ({
        ...prev,
        [selectedCandidate.id]: (prev[selectedCandidate.id] || 0) + 1,
      }));

      setPositions((prev) =>
        prev.map((pos) =>
          pos.id === positionId
            ? {
                ...pos,
                submitted: true,
                candidates: pos.candidates.map((candidate) =>
                  candidate.id === selectedCandidate.id
                    ? {
                        ...candidate,
                        votes: (candidate.votes || 0) + 1,
                        selected: false,
                      }
                    : candidate
                ),
              }
            : pos
        )
      );

      setSubmittedVotes((prev) => ({
        ...prev,
        [positionId]: true,
      }));

      handleClearSelection(positionId);

      alert("Vote submitted successfully!");
    } catch (error) {
      console.error(`Error submitting vote for ${positionName}:`, error);

      if (error.response) {
        alert(
          `Failed to submit vote: ${
            error.response.data?.error?.message ||
            error.response.data?.message ||
            "Server error"
          }`
        );
      } else {
        alert(
          "Failed to submit vote. Please check your connection and try again."
        );
      }
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <motion.div
            className="inline-block rounded-full h-16 w-16 border-t-3 border-b-3 border-blue-600 mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-700 text-lg font-medium"
          >
            Loading election data...
          </motion.p>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center px-4"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
            Unable to Load Election
          </h3>
          <p className="text-gray-600 text-center mb-2">{fetchError}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      {/* Header - REMOVED REFRESH BUTTON FROM HERE */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center justify-center gap-3 md:gap-4">
            <motion.div
              className="flex items-center gap-3 md:gap-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg md:rounded-xl p-2 md:p-3 shadow-lg">
                <Landmark className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                  {electionData.electionName || "Election"}
                </h1>
                <p className="text-gray-600 text-xs md:text-sm">
                  {electionData.electionCategory}
                </p>
              </div>
            </motion.div>
            {/* REFRESH BUTTON REMOVED FROM HERE */}
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 md:py-8">
        <AnimatePresence mode="wait">
          {positions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 md:py-16 bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-200/50 mx-2 md:mx-0"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
                <User className="w-12 h-12 md:w-16 md:h-16 text-blue-500" />
              </div>
              <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                No Positions Available
              </h3>
              <p className="text-gray-600 text-sm md:text-lg max-w-xl mx-auto mb-4 md:mb-6 px-4">
                There are no positions registered for this election yet.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRefreshKey((prev) => prev + 1)}
                className="px-6 md:px-8 py-2.5 md:py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg md:rounded-xl font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Check Again
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-4 md:space-y-8">
              {positions.map((position, positionIndex) => {
                const selectedCandidate = position.candidates.find(
                  (c) => c.selected
                );
                const hasSelected = !!selectedCandidate;

                return (
                  <motion.div
                    key={position.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: positionIndex * 0.1,
                      type: "spring",
                      stiffness: 100,
                    }}
                    className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-gray-200/50 mx-2 md:mx-0"
                  >
                    {/* Position Header */}
                    <div className="bg-gradient-to-r from-blue-50/80 to-white px-4 md:px-8 py-4 md:py-6 border-b border-blue-100">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-6">
                        <motion.div
                          className="flex items-center gap-3 md:gap-6"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                            <Award className="w-5 h-5 md:w-7 md:h-7 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-base md:text-2xl font-bold text-gray-900">
                              {position.position}
                            </h3>
                            <p className="text-gray-600 text-xs md:text-base">
                              {position.candidates.length} candidate
                              {position.candidates.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </motion.div>

                        {position.submitted ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full font-semibold flex items-center gap-1 md:gap-2 shadow-lg text-xs md:text-base"
                          >
                            <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                            <span>Voted</span>
                          </motion.div>
                        ) : hasSelected ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700 font-medium text-sm md:text-base">
                              Selected: {selectedCandidate.name}
                            </span>
                            <button
                              onClick={() => handleClearSelection(position.id)}
                              className="p-1 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-right">
                            <p className="text-gray-600 text-xs md:text-base">
                              Select one candidate
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Candidates Grid - 2 columns on mobile */}
                    <div className="p-4 md:p-8">
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                        {position.candidates.map(
                          (candidate, candidateIndex) => {
                            const isWinner =
                              winners[position.id] === candidate.id;
                            const candidateVotes =
                              voteCounts[candidate.id] || candidate.votes || 0;
                            const isSelected = candidate.selected;
                            const isOtherSelected = hasSelected && !isSelected;

                            return (
                              <motion.div
                                key={candidate.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                  delay: candidateIndex * 0.05,
                                  type: "spring",
                                  stiffness: 120,
                                }}
                                whileHover={{
                                  scale: isOtherSelected ? 1 : 1.03,
                                  y: isOtherSelected ? 0 : -5,
                                }}
                                className={`relative rounded-lg md:rounded-xl border-2 transition-all duration-300 overflow-hidden shadow-md hover:shadow-xl ${
                                  isWinner && showResults
                                    ? "border-amber-300 bg-gradient-to-br from-amber-50/50 to-yellow-50/30"
                                    : isSelected
                                    ? "border-emerald-300 bg-gradient-to-br from-emerald-50/50 to-green-50/30"
                                    : isOtherSelected
                                    ? "border-red-200 bg-gradient-to-br from-red-50/30 to-red-50/20 opacity-70"
                                    : "border-gray-200 hover:border-blue-300 bg-white"
                                }`}
                              >
                                <div className="p-3 md:p-5">
                                  {/* Candidate Profile */}
                                  <div className="flex flex-col items-center mb-3 md:mb-4">
                                    <motion.div
                                      className="relative mb-3 md:mb-4"
                                      whileHover={{
                                        scale: isOtherSelected ? 1 : 1.05,
                                      }}
                                    >
                                      <div
                                        className={`w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden mx-auto shadow-xl ${
                                          isWinner && showResults
                                            ? "border-2 md:border-4 border-amber-300"
                                            : isSelected
                                            ? "border-2 md:border-4 border-emerald-300"
                                            : isOtherSelected
                                            ? "border-2 md:border-4 border-red-200"
                                            : "border-2 md:border-4 border-gray-100"
                                        }`}
                                      >
                                        {candidate.photoUrl ? (
                                          <img
                                            src={candidate.photoUrl}
                                            alt={candidate.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) =>
                                              (e.currentTarget.style.display =
                                                "none")
                                            }
                                          />
                                        ) : null}

                                        {!candidate.photoUrl && (
                                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                            <span className="text-white font-bold text-sm md:text-xl">
                                              {getInitials(candidate.name)}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Status Badges */}
                                      <div className="absolute -top-1 -right-1 flex flex-col gap-1">
                                        {isSelected && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring" }}
                                            className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-full p-1 md:p-2 shadow-lg"
                                          >
                                            <CheckCircle className="w-2 h-2 md:w-4 md:h-4 text-white" />
                                          </motion.div>
                                        )}
                                        {isWinner && showResults && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                              delay: 0.2,
                                              type: "spring",
                                            }}
                                            className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full p-1 md:p-2 shadow-lg"
                                          >
                                            <Crown className="w-2 h-2 md:w-4 md:h-4 text-white" />
                                          </motion.div>
                                        )}
                                      </div>
                                    </motion.div>

                                    <div className="text-center">
                                      <h4 className="font-bold text-gray-900 text-sm md:text-xl truncate w-full px-1">
                                        {candidate.name}
                                      </h4>
                                      {showResults && (
                                        <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          className="mt-1 md:mt-2"
                                        >
                                          <p className="text-gray-700 font-bold text-xs md:text-lg bg-gradient-to-r from-gray-100 to-gray-200 rounded-full px-2 py-1 inline-block">
                                            {candidateVotes} votes
                                          </p>
                                        </motion.div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Status Tags */}
                                  <div className="flex flex-wrap justify-center gap-1 md:gap-2 mb-3 md:mb-4">
                                    {isWinner && showResults && (
                                      <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="px-2 py-0.5 md:px-3 md:py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full text-[10px] md:text-xs font-bold shadow"
                                      >
                                        🏆 Winner
                                      </motion.span>
                                    )}
                                    {isSelected && (
                                      <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="px-2 py-0.5 md:px-3 md:py-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-[10px] md:text-xs font-bold shadow"
                                      >
                                        ✓ Your Choice
                                      </motion.span>
                                    )}
                                  </div>

                                  {/* Action Button */}
                                  <div className="mt-3 md:mt-4 flex justify-center">
                                    {!position.submitted ? (
                                      <motion.button
                                        whileHover={{
                                          y: isOtherSelected ? 0 : -2,
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() =>
                                          !isOtherSelected &&
                                          handleVote(candidate.id, position.id)
                                        }
                                        disabled={isOtherSelected}
                                        className={`w-full py-1.5 md:py-3 rounded-lg font-bold text-white text-xs md:text-sm transition-all ${
                                          isSelected
                                            ? "bg-gradient-to-r from-emerald-600 to-green-600 cursor-not-allowed"
                                            : isOtherSelected
                                            ? "bg-gradient-to-r from-red-400 to-red-500 cursor-not-allowed opacity-70"
                                            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                                        }`}
                                      >
                                        {isSelected ? "Selected" : "Vote"}
                                      </motion.button>
                                    ) : (
                                      <div className="text-center py-1.5 md:py-3">
                                        <p className="text-gray-500 font-medium text-xs md:text-sm">
                                          Vote Submitted
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          }
                        )}
                      </div>

                      {/* Submit Section */}
                      {!position.submitted && hasSelected && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: "spring" }}
                          className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-200"
                        >
                          <div className="flex justify-center">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                handleSubmitVote(position.id, position.position)
                              }
                              className="px-6 md:px-8 py-2.5 md:py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg md:rounded-xl font-bold text-sm md:text-lg flex items-center justify-center gap-2 md:gap-3 shadow-lg hover:shadow-xl w-full max-w-md hover:from-blue-700 hover:to-indigo-700 transition-all"
                            >
                              <Vote className="w-4 h-4 md:w-5 md:h-5" />
                              Submit Vote
                            </motion.button>
                          </div>
                        </motion.div>
                      )}

                      {/* Winner Announcement */}
                      {showResults && winners[position.id] && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring" }}
                          className="mt-6 md:mt-8 p-4 md:p-8 bg-gradient-to-r from-amber-50 via-yellow-50/50 to-amber-50 rounded-xl md:rounded-2xl border-2 border-amber-300"
                        >
                          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-8">
                            <div className="flex items-center gap-3 md:gap-6">
                              <div className="relative">
                                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg md:rounded-xl p-3 md:p-4 shadow-xl">
                                  <Trophy className="w-6 h-6 md:w-10 md:h-10 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-6 md:h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                                  <div className="w-2 h-2 md:w-3 md:h-3 bg-yellow-500 rounded-full animate-pulse" />
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2">
                                  🎉 Winner Announced!
                                </h4>
                                <p className="text-gray-700 text-xs md:text-base">
                                  Congratulations to{" "}
                                  <span className="font-bold text-amber-700">
                                    {
                                      position.candidates.find(
                                        (c) => c.id === winners[position.id]
                                      )?.name
                                    }
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="bg-white rounded-lg md:rounded-xl px-4 py-3 md:px-8 md:py-6 shadow-lg border-2 border-amber-200">
                              <p className="text-xl md:text-3xl font-bold text-amber-600">
                                {voteCounts[winners[position.id]] || 0}
                              </p>
                              <p className="text-gray-600 font-medium text-xs md:text-base">
                                Total Votes
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VotingPage;
