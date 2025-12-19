import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Vote,
  CheckCircle,
  Award,
  Landmark,
  Trophy,
  Crown,
  X,
  Phone, // ADD THIS
  Shield, // ADD THIS
  Eye, // ADD THIS FOR VIEW MODE
} from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";

const API_URL = "https://api.regeve.in/api";
const IMAGE_BASE_URL = "https://api.regeve.in";

const VotingPage = () => {
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
  const [showResults, setShowResults] = useState(false);
  const [electionIdFromApi, setElectionIdFromApi] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [isVerified, setIsVerified] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [participantData, setParticipantData] = useState(null);
  const [votedPositions, setVotedPositions] = useState(() => {
    const saved = localStorage.getItem(`votedPositions_${documentId}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [viewOnly, setViewOnly] = useState(false);
  const [hasCompletedVoting, setHasCompletedVoting] = useState(false); // NEW: Track if user completed voting

  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }, []);

  // Check if user has completed all votes
  const checkIfCompletedAllVotes = useCallback(() => {
    if (!positions.length) return false;

    // Check if all positions have been voted
    const allPositionsVoted = positions.every(
      (position) => votedPositions[position.id] || submittedVotes[position.id]
    );

    if (allPositionsVoted) {
      console.log("All positions voted - enabling view-only mode");
      setHasCompletedVoting(true);
      setViewOnly(true);

      // Save completion state to localStorage
      localStorage.setItem(`election_${documentId}_completed`, "true");
      return true;
    }

    return false;
  }, [positions, votedPositions, submittedVotes, documentId]);

  // Fetch election details
  const fetchElectionDetails = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_URL}/elections/public/${documentId}`
      );

      if (response.data && response.data.data) {
        const apiData = response.data.data;

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
  // FIX THIS: Simplify the fetchVotingData dependencies
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
          submitted: false, // Don't use submittedVotes here to avoid dependency
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
              isWinner: false, // Don't use winners here to avoid dependency
            };
          }),
        };
      });

      setPositions(positionsData);

      // Check completion AFTER setting positions
      setTimeout(() => {
        const allVoted = positionsData.every(
          (pos) => votedPositions[pos.id] || submittedVotes[pos.id]
        );
        if (allVoted) {
          setViewOnly(true);
          setHasCompletedVoting(true);
        }
      }, 100);
    } catch (error) {
      console.error("Error fetching voting data:", error);
      setFetchError(
        "Failed to load voting data. Please check the election ID and try again."
      );
      setPositions([]);
    } finally {
      setIsLoading(false);
    }
  }, [documentId, fetchElectionDetails]); // ← ONLY these dependencies!

  // FIX THIS useEffect:
  useEffect(() => {
    if (documentId) {
      fetchVotingData();
    }
  }, [documentId]); // ← Run only when documentId changes

  // Separate useEffect for winners update
  useEffect(() => {
    // Update winners after positions are set
    if (positions.length > 0 && showResults && electionIdFromApi) {
      fetchWinners();
    }
  }, [positions, showResults, electionIdFromApi, fetchWinners]);

  // Separate useEffect to update positions with winners
  useEffect(() => {
    if (Object.keys(winners).length > 0) {
      setPositions((prev) =>
        prev.map((position) => ({
          ...position,
          candidates: position.candidates.map((candidate) => ({
            ...candidate,
            isWinner: winners[position.id] === candidate.id,
          })),
        }))
      );
    }
  }, [winners]);

  // Handle vote selection
  const handleVote = (candidateId, positionId) => {
    if (submittedVotes[positionId] || viewOnly) return;

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
    if (viewOnly) return;

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

  // Phone verification function
  const verifyPhoneNumber = async () => {
    if (!phoneNumber.trim()) {
      setVerificationError("Please enter your phone number");
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setVerificationError("Please enter a valid phone number");
      return;
    }

    setVerifying(true);
    setVerificationError("");

    try {
      const response = await axios.post(`${API_URL}/vote/verify-phone`, {
        phone_number: cleanPhone,
        electionDocumentId: documentId,
      });

      console.log("Full verification response:", response.data); // Debug

      if (response.data && response.data.success) {
        const apiData = response.data.data || response.data;

        // CRITICAL: Extract document_id properly
        const participantDocumentId = apiData.documentId || apiData.document_id;

        if (!participantDocumentId) {
          setVerificationError("Participant documentId missing");
          return;
        }

        const participantData = {
          name: apiData.name,
          phone: cleanPhone,
          documentId: participantDocumentId, // ✅ REQUIRED
          token: apiData.VoteToken || apiData.token,
          alreadyVoted: apiData.alreadyVoted,
        };

        // Check if user has already voted (from API response)
        if (apiData.alreadyVoted) {
          console.log("User has already voted - enabling view-only mode");
          setViewOnly(true); // 🔑 VIEW ONLY MODE
          setHasCompletedVoting(true);

          // Save completion state
          localStorage.setItem(`election_${documentId}_completed`, "true");
        }

        console.log("Saving participant data:", participantData);

        setParticipantData(participantData);
        setIsVerified(true);
        setVerificationSuccess(true);

        // Save to localStorage
        localStorage.setItem(
          `election_${documentId}_verified`,
          JSON.stringify(participantData)
        );

        if (apiData.alreadyVoted) {
          alert(
            `Welcome back ${participantData.name}! You have already completed voting. You can now view the election results.`
          );
        } else {
          alert(`Welcome ${participantData.name}! You can now vote.`);
        }
      } else {
        setVerificationError(response.data?.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      if (error.response?.status === 401) {
        setVerificationError("Phone number not authorized for this election");
      } else if (error.response?.data?.message) {
        setVerificationError(error.response.data.message);
      } else {
        setVerificationError("Verification failed. Please try again.");
      }
    } finally {
      setVerifying(false);
    }
  };

  // Handle vote submission
  const handleSubmitVote = async (positionId, positionName) => {
    if (!participantData) {
      alert("Please verify your phone number first");
      return;
    }

    if (viewOnly) {
      alert(
        "You have already completed voting. You can only view the results now."
      );
      return;
    }

    console.log("Participant data:", participantData); // Debug log

    // Get document_id directly from participantData
    const participantDocumentId = participantData.documentId;

    if (!participantDocumentId) {
      console.error(
        "No document_id found in participantData:",
        participantData
      );
      alert(
        "Error: Participant identification not found. Please verify again."
      );
      setIsVerified(false);
      localStorage.removeItem(`election_${documentId}_verified`);
      return;
    }

    if (votedPositions[positionId]) {
      alert(`You have already voted for ${positionName}.`);
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
      // Prepare vote data
      const voteData = {
        candidate_id: selectedCandidate.id,
        position_id: positionId,
        position_name: positionName,
        candidate_name: selectedCandidate.name,
        election_document_id: documentId,
      };

      console.log("Submitting vote:", {
        participantDocumentId: participantDocumentId,
        voteData: voteData,
      });

      // Call API with document_id
      const response = await axios.put(
        `${API_URL}/election-participants/${participantDocumentId}`,
        { data: voteData }
      );

      if (response.data.success) {
        const result = response.data.data;

        // Update local state
        const updatedVotes = { ...votedPositions, [positionId]: true };
        setVotedPositions(updatedVotes);

        localStorage.setItem(
          `votedPositions_${documentId}`,
          JSON.stringify(updatedVotes)
        );

        // Update positions with new vote count
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
                          votes:
                            result.candidate?.vote_count || candidate.votes + 1,
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

        // Check if all positions are voted
        const allVotedNow = positions.every(
          (pos) =>
            pos.id === positionId ||
            votedPositions[pos.id] ||
            submittedVotes[pos.id]
        );

        if (
          allVotedNow ||
          result.voting_progress?.completed ||
          result.has_completed_all_votes
        ) {
          console.log("🎉 All votes completed - switching to view-only mode");

          // Mark all positions as voted
          const allVoted = {};
          positions.forEach((pos) => {
            allVoted[pos.id] = true;
          });
          setVotedPositions(allVoted);

          // Enable view-only mode
          setViewOnly(true);
          setHasCompletedVoting(true);

          // Save completion state to localStorage
          localStorage.setItem(`election_${documentId}_completed`, "true");

          alert(
            "🎉 Congratulations! You have successfully voted for all positions! You can now view the results."
          );
        } else {
          const remaining =
            result.voting_progress?.remaining ||
            positions.length -
              Object.keys({ ...votedPositions, [positionId]: true }).length;

          alert(`✅ Vote submitted successfully! 
        Remaining: ${remaining} position(s)`);
        }
      }
    } catch (error) {
      console.error("Error submitting vote:", error.response || error);

      if (error.response?.status === 400) {
        alert(
          error.response.data?.message ||
            "You have already voted for this position"
        );
        // Update local state to reflect already voted
        const updatedVotes = { ...votedPositions, [positionId]: true };
        setVotedPositions(updatedVotes);
        localStorage.setItem(
          `votedPositions_${documentId}`,
          JSON.stringify(updatedVotes)
        );

        // Check if all votes are completed after this error
        checkIfCompletedAllVotes();
      } else if (error.response?.status === 401) {
        alert("Invalid voting session. Please verify again.");
        setIsVerified(false);
        localStorage.removeItem(`election_${documentId}_verified`);
      } else if (error.response?.status === 404) {
        alert(
          `Participant with document_id ${participantDocumentId} not found. Please verify again.`
        );
        setIsVerified(false);
        localStorage.removeItem(`election_${documentId}_verified`);
      } else if (error.response) {
        alert(
          `Failed to submit vote: ${
            error.response.data?.message || "Server error"
          }`
        );
      } else {
        alert("Failed to submit vote. Please check your connection.");
      }
    }
  };

  // Helper function to check if position is voted
  const isPositionVoted = (positionId) => {
    return submittedVotes[positionId] || votedPositions[positionId] || viewOnly;
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

  // Clear all local data on logout
  const handleLogout = () => {
    localStorage.removeItem(`election_${documentId}_verified`);
    localStorage.removeItem(`votedPositions_${documentId}`);
    // IMPORTANT: Don't remove completion status on logout
    // localStorage.removeItem(`election_${documentId}_completed`);

    setIsVerified(false);
    setPhoneNumber("");
    setVerificationSuccess(false);
    setParticipantData(null);
    setVotedPositions({});
    setSubmittedVotes({});
    setSelectedCandidates({});

    // Reset view mode based on completion status
    const hasCompleted = localStorage.getItem(
      `election_${documentId}_completed`
    );
    if (hasCompleted === "true") {
      // If user had completed voting, they should remain in view-only mode
      setViewOnly(true);
      setHasCompletedVoting(true);
      alert("You have completed voting. You can only view results.");
    } else {
      setViewOnly(false);
      setHasCompletedVoting(false);
    }
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

  // Phone verification required
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100"
        >
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Identity
            </h2>
            <p className="text-gray-600 mb-1">
              Enter your registered phone number to vote in
            </p>
            <p className="text-blue-600 font-semibold">
              {electionData.electionName || "this election"}
            </p>
            {hasCompletedVoting && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                <p className="text-blue-700 text-sm">
                  <Eye className="inline w-4 h-4 mr-1" />
                  You have already completed voting. You can view results after
                  verification.
                </p>
              </div>
            )}
          </div>

          {verificationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm">{verificationError}</p>
            </motion.div>
          )}

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Registered Phone Number
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <div className="px-3 py-3 bg-gray-50">
                <Phone className="w-5 h-5 text-gray-500" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                maxLength={10}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your 10-digit phone number"
                className="flex-1 px-3 py-3 border-0 focus:ring-0 focus:outline-none"
                disabled={verifying}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={verifyPhoneNumber}
            disabled={verifying}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                Verifying...
              </div>
            ) : (
              "Verify Phone Number"
            )}
          </motion.button>

          <p className="text-gray-500 text-sm text-center mt-6">
            Only verified participants can vote. Your phone number will be
            verified against the election's participant list.
          </p>
        </motion.div>
      </div>
    );
  }

  // Main voting page
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      {/* Header with responsive improvements */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-2 sm:p-2.5 md:p-3 shadow-lg flex-shrink-0">
                <Landmark className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1 sm:flex-initial">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate leading-tight">
                  {electionData.electionName || "Election"}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {electionData.electionCategory}
                  {participantData && ` • Verified as ${participantData.name}`}
                </p>
              </div>
            </div>

            {/* Verification status and controls */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-normal mt-2 sm:mt-0">
              <div className="flex items-center gap-2">
                <div
                  className={`px-2 py-1 sm:px-3 sm:py-1.5 text-white rounded-full font-semibold flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                    viewOnly
                      ? "bg-gradient-to-r from-purple-500 to-indigo-600"
                      : "bg-gradient-to-r from-emerald-500 to-green-600"
                  }`}
                >
                  {viewOnly ? (
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  <span>{viewOnly ? "View Mode" : "Verified"}</span>
                </div>

                {/* Results Toggle for Mobile/Desktop */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowResults(!showResults)}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium text-xs sm:text-sm shadow hover:shadow-md transition-shadow"
                  >
                    {showResults ? "Hide Results" : "Show Results"}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs sm:text-sm transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* View Only Banner */}
      {viewOnly && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200"
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2">
            <div className="flex items-center justify-center gap-2">
              <Eye className="w-4 h-4 text-purple-600" />
              <p className="text-purple-700 text-sm font-medium">
                {hasCompletedVoting
                  ? "🎉 You have completed voting for all positions! You can now view the results."
                  : "You have already voted. You can only view the election results."}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content with improved responsiveness */}
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-6 py-3 sm:py-4 lg:py-6">
        <AnimatePresence mode="wait">
          {positions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 sm:py-12 md:py-16 bg-white rounded-xl shadow-lg border border-gray-200/50 mx-1 sm:mx-2"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8">
                <User className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-blue-500" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 px-4">
                No Positions Available
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg max-w-xl mx-auto mb-4 sm:mb-6 px-4">
                There are no positions registered for this election yet.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRefreshKey((prev) => prev + 1)}
                className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg md:rounded-xl font-semibold text-xs sm:text-sm md:text-base lg:text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Check Again
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
              {positions.map((position, positionIndex) => {
                const selectedCandidate = position.candidates.find(
                  (c) => c.selected
                );
                const hasSelected = !!selectedCandidate;
                const isVoted = isPositionVoted(position.id);

                return (
                  <motion.div
                    key={position.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: positionIndex * 0.1,
                      type: "spring",
                      stiffness: 100,
                    }}
                    className={`bg-white rounded-xl shadow-lg overflow-hidden border ${
                      viewOnly ? "border-purple-100" : "border-gray-200/50"
                    } mx-1 sm:mx-2`}
                  >
                    {/* Position Header with responsive design */}
                    <div
                      className={`${
                        viewOnly
                          ? "bg-gradient-to-r from-purple-50/80 to-white"
                          : "bg-gradient-to-r from-blue-50/80 to-white"
                      } px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 border-b ${
                        viewOnly ? "border-purple-100" : "border-blue-100"
                      }`}
                    >
                      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 sm:gap-3 md:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                          <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0 ${
                              viewOnly
                                ? "bg-gradient-to-br from-purple-100 to-indigo-100"
                                : "bg-gradient-to-br from-blue-100 to-indigo-100"
                            }`}
                          >
                            <Award
                              className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 ${
                                viewOnly ? "text-purple-600" : "text-blue-600"
                              }`}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 truncate">
                              {position.position}
                            </h3>
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                              <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                                {position.candidates.length} candidate
                                {position.candidates.length !== 1 ? "s" : ""}
                              </p>
                              {viewOnly || isVoted ? (
                                // 🔒 VIEW ONLY MODE or Already Voted
                                <div className="text-center py-2 sm:py-3">
                                  <p
                                    className={`font-semibold text-xs sm:text-sm ${
                                      viewOnly
                                        ? "text-purple-600"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {viewOnly ? "View Only" : "Already Voted"}
                                  </p>
                                </div>
                              ) : !isVoted ? (
                                <>
                                  {hasSelected ? (
                                    // Selected state
                                    <div className="flex flex-col items-center gap-1 sm:gap-2 w-full">
                                      <motion.button className="w-full py-1.5 sm:py-2 md:py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-bold text-xs sm:text-sm cursor-not-allowed">
                                        Selected ✓
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                          handleClearSelection(position.id)
                                        }
                                        className="w-full py-1 sm:py-1.5 md:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold text-xs sm:text-sm"
                                      >
                                        Cancel Selection
                                      </motion.button>
                                    </div>
                                  ) : (
                                    // Normal vote button
                                    <motion.button
                                      whileHover={{ y: -2 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() =>
                                        handleVote(candidate.id, position.id)
                                      }
                                      className="w-full py-1.5 sm:py-2 md:py-3 rounded-lg font-bold text-white text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-indigo-600"
                                    >
                                      Vote
                                    </motion.button>
                                  )}
                                </>
                              ) : (
                                <div className="text-center py-1.5 sm:py-2 md:py-3">
                                  <p className="text-gray-500 font-medium text-xs sm:text-sm">
                                    Vote Submitted
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Selection status with responsive layout */}
                        <div className="flex items-center gap-2 sm:gap-3 self-end xs:self-center mt-2 xs:mt-0">
                          {isVoted ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`px-2 py-1 sm:px-3 sm:py-1.5 text-white rounded-full font-semibold flex items-center gap-1 sm:gap-2 text-xs sm:text-sm shadow-lg ${
                                viewOnly
                                  ? "bg-gradient-to-r from-purple-500 to-indigo-600"
                                  : "bg-gradient-to-r from-emerald-500 to-green-600"
                              }`}
                            >
                              {viewOnly ? (
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              ) : (
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              )}
                              <span>{viewOnly ? "View Only" : "Voted"}</span>
                            </motion.div>
                          ) : hasSelected ? (
                            <div className="flex items-center gap-1 sm:gap-2 bg-blue-50 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2">
                              <div className="min-w-0">
                                <p className="text-gray-700 font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[150px]">
                                  Selected: {selectedCandidate.name}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleClearSelection(position.id)
                                }
                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                              >
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-right">
                              <p className="text-gray-600 text-xs sm:text-sm">
                                Select one candidate
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Candidates Grid with responsive columns */}
                    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                        {position.candidates.map(
                          (candidate, candidateIndex) => {
                            const isWinner =
                              winners[position.id] === candidate.id;

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
                                  scale: isOtherSelected || viewOnly ? 1 : 1.03,
                                  y: isOtherSelected || viewOnly ? 0 : -5,
                                }}
                                className={`relative rounded-lg md:rounded-xl border-2 transition-all duration-300 overflow-hidden shadow-md hover:shadow-xl ${
                                  isWinner && showResults
                                    ? "border-amber-300 bg-gradient-to-br from-amber-50/50 to-yellow-50/30"
                                    : isSelected && !viewOnly
                                    ? "border-emerald-300 bg-gradient-to-br from-emerald-50/50 to-green-50/30"
                                    : isOtherSelected && !viewOnly
                                    ? "border-red-200 bg-gradient-to-br from-red-50/30 to-red-50/20 opacity-70"
                                    : viewOnly
                                    ? "border-purple-100 bg-gradient-to-br from-purple-50/30 to-indigo-50/20"
                                    : "border-gray-200 hover:border-blue-300 bg-white"
                                }`}
                              >
                                <div className="p-3 sm:p-4 md:p-5">
                                  {/* Candidate Profile with responsive sizing */}
                                  <div className="flex flex-col items-center mb-2 sm:mb-3 md:mb-4">
                                    <div className="relative mb-2 sm:mb-3 md:mb-4">
                                      <motion.div
                                        className="relative"
                                        whileHover={{
                                          scale:
                                            isOtherSelected || viewOnly
                                              ? 1
                                              : 1.05,
                                        }}
                                      >
                                        {/* Square photo container - responsive sizing */}
                                        <div
                                          className={`w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden mx-auto shadow-lg ${
                                            isWinner && showResults
                                              ? "border-2 border-amber-300"
                                              : isSelected && !viewOnly
                                              ? "border-2 border-emerald-300"
                                              : isOtherSelected && !viewOnly
                                              ? "border-2 border-red-200"
                                              : viewOnly
                                              ? "border-2 border-purple-200"
                                              : "border border-gray-200"
                                          }`}
                                        >
                                          {candidate.photoUrl ? (
                                            <img
                                              src={candidate.photoUrl}
                                              alt={candidate.name}
                                              className="w-full h-full object-cover"
                                              onError={(e) => {
                                                e.currentTarget.style.display =
                                                  "none";
                                                const fallback =
                                                  e.target.parentElement.querySelector(
                                                    ".photo-fallback"
                                                  );
                                                if (fallback)
                                                  fallback.style.display =
                                                    "flex";
                                              }}
                                            />
                                          ) : null}

                                          {/* Photo fallback with initials */}
                                          <div
                                            className="photo-fallback w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
                                            style={{
                                              display: candidate.photoUrl
                                                ? "none"
                                                : "flex",
                                            }}
                                          >
                                            <span className="text-white font-bold text-base xs:text-lg sm:text-xl md:text-2xl">
                                              {getInitials(candidate.name)}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Status Badges - responsive sizing */}
                                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 flex flex-col gap-0.5 sm:gap-1">
                                          {isSelected && !viewOnly && (
                                            <motion.div
                                              initial={{ scale: 0 }}
                                              animate={{ scale: 1 }}
                                              transition={{ type: "spring" }}
                                              className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-full p-1 sm:p-1.5 md:p-2 shadow-lg"
                                            >
                                              <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" />
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
                                              className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full p-1 sm:p-1.5 md:p-2 shadow-lg"
                                            >
                                              <Crown className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" />
                                            </motion.div>
                                          )}
                                          {viewOnly && (
                                            <motion.div
                                              initial={{ scale: 0 }}
                                              animate={{ scale: 1 }}
                                              className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full p-1 sm:p-1.5 md:p-2 shadow-lg"
                                            >
                                              <Eye className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" />
                                            </motion.div>
                                          )}
                                        </div>
                                      </motion.div>
                                    </div>

                                    <div className="text-center w-full px-1">
                                      <h4 className="font-bold text-gray-900 text-xs xs:text-sm sm:text-base md:text-lg truncate mb-1">
                                        {candidate.name}
                                      </h4>
                                      {showResults && (
                                        <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          className="mt-1"
                                        >
                                          <p className="text-gray-700 font-bold text-xs sm:text-sm md:text-base bg-gradient-to-r from-gray-100 to-gray-200 rounded-full px-2 py-1 inline-block">
                                            {candidate.votes || 0} votes
                                          </p>
                                        </motion.div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Status Tags - responsive text sizing */}
                                  <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5 md:gap-2 mb-2 sm:mb-3 md:mb-4">
                                    {isWinner && showResults && (
                                      <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-3 md:py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full text-[9px] xs:text-[10px] sm:text-xs font-bold shadow"
                                      >
                                        🏆 Winner
                                      </motion.span>
                                    )}
                                    {isSelected && !viewOnly && (
                                      <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-3 md:py-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-[9px] xs:text-[10px] sm:text-xs font-bold shadow"
                                      >
                                        ✓ Your Choice
                                      </motion.span>
                                    )}
                                    {viewOnly && (
                                      <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-3 md:py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full text-[9px] xs:text-[10px] sm:text-xs font-bold shadow"
                                      >
                                        👁️ View Only
                                      </motion.span>
                                    )}
                                  </div>

                                  {/* Action Button - responsive sizing */}
                                  <div className="mt-2 sm:mt-3 md:mt-4 flex justify-center flex-col items-center gap-1 sm:gap-2">
                                    {viewOnly || isVoted ? (
                                      // View Only or Already Voted state
                                      <div className="text-center py-1.5 sm:py-2 md:py-3">
                                        <p
                                          className={`font-medium text-xs sm:text-sm ${
                                            viewOnly
                                              ? "text-purple-600"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          {viewOnly
                                            ? "View Mode"
                                            : "Vote Submitted"}
                                        </p>
                                      </div>
                                    ) : !isVoted ? (
                                      <>
                                        {isSelected ? (
                                          // Selected state with cancel button
                                          <div className="flex flex-col items-center gap-1 sm:gap-2 w-full">
                                            <motion.button
                                              whileHover={{ y: -2 }}
                                              whileTap={{ scale: 0.98 }}
                                              className="w-full py-1.5 sm:py-2 md:py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-bold text-xs xs:text-sm sm:text-sm md:text-sm cursor-not-allowed"
                                            >
                                              Selected ✓
                                            </motion.button>
                                            <motion.button
                                              whileHover={{ scale: 1.05 }}
                                              whileTap={{ scale: 0.95 }}
                                              onClick={() =>
                                                handleClearSelection(
                                                  position.id
                                                )
                                              }
                                              className="w-full py-1 sm:py-1.5 md:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold text-xs xs:text-sm sm:text-sm md:text-sm hover:from-red-600 hover:to-red-700 shadow hover:shadow-md transition-all"
                                            >
                                              Cancel Selection
                                            </motion.button>
                                          </div>
                                        ) : (
                                          // Not selected state - normal vote button
                                          <motion.button
                                            whileHover={{
                                              y: isOtherSelected ? 0 : -2,
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() =>
                                              !isOtherSelected &&
                                              handleVote(
                                                candidate.id,
                                                position.id
                                              )
                                            }
                                            disabled={isOtherSelected}
                                            className={`w-full py-1.5 sm:py-2 md:py-3 rounded-lg font-bold text-white text-xs xs:text-sm sm:text-sm md:text-sm transition-all ${
                                              isOtherSelected
                                                ? "bg-gradient-to-r from-red-400 to-red-500 cursor-not-allowed opacity-70"
                                                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                                            }`}
                                          >
                                            Vote
                                          </motion.button>
                                        )}
                                      </>
                                    ) : (
                                      // Already voted state
                                      <div className="text-center py-1.5 sm:py-2 md:py-3">
                                        <p className="text-gray-500 font-medium text-xs sm:text-sm">
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

                      {/* Submit Section - responsive padding */}
                      {!viewOnly && !isVoted && hasSelected && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: "spring" }}
                          className="mt-4 sm:mt-6 md:mt-8 pt-4 sm:pt-6 md:pt-8 border-t border-gray-200"
                        >
                          <div className="flex justify-center">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                handleSubmitVote(position.id, position.position)
                              }
                              className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3.5 
    rounded-lg md:rounded-xl font-bold text-xs sm:text-sm md:text-base lg:text-lg 
    flex items-center justify-center gap-1 sm:gap-2 md:gap-3 shadow-lg w-full 
    max-w-sm sm:max-w-md transition-all
    bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
                            >
                              <Vote className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                              Submit Vote
                            </motion.button>
                          </div>
                        </motion.div>
                      )}

                      {/* Winner Announcement - responsive layout */}
                      {showResults && winners[position.id] && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring" }}
                          className="mt-4 sm:mt-6 md:mt-8 p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-r from-amber-50 via-yellow-50/50 to-amber-50 rounded-xl border-2 border-amber-300"
                        >
                          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 flex-1 min-w-0">
                              <div className="relative flex-shrink-0">
                                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg p-2 sm:p-2.5 md:p-3 lg:p-4 shadow-xl">
                                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-white" />
                                </div>
                                <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 md:-top-2 md:-right-2 w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-yellow-500 rounded-full animate-pulse" />
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-gray-900 mb-1">
                                  🎉 Winner Announced!
                                </h4>
                                <p className="text-gray-700 text-xs sm:text-sm md:text-base truncate">
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
                            <div className="bg-white rounded-lg px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 lg:px-8 lg:py-6 shadow-lg border-2 border-amber-200 flex-shrink-0">
                              <p className="text-gray-600 font-medium text-xs sm:text-sm md:text-base">
                                Total Votes
                              </p>
                              <p className="text-amber-700 font-bold text-lg sm:text-xl md:text-2xl">
                                {position.candidates.find(
                                  (c) => c.id === winners[position.id]
                                )?.votes || 0}
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

      {/* Floating Action Button for Mobile */}
      <motion.button
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setShowResults(!showResults)}
        className="fixed bottom-4 right-4 sm:hidden z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-3 shadow-xl hover:shadow-2xl"
      >
        {showResults ? (
          <span className="text-sm font-bold">Hide Results</span>
        ) : (
          <span className="text-sm font-bold">Show Results</span>
        )}
      </motion.button>
    </div>
  );
};

export default VotingPage;
