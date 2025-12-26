import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Vote,
  CheckCircle,
  Award,
  Landmark,
  Trophy,
  Crown,
  Phone,
  BarChart3,
  Check,
  X,
  LogOut,
  Clock,
  Calendar,
  AlertCircle,
  Zap,
  ChevronDown,
  Plus,
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
    start_time: null,
    end_time: null,
    election_status: "scheduled",
  });

  const [tick, setTick] = useState(0);
  const [positions, setPositions] = useState([]);
  const [submittedVotes, setSubmittedVotes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
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
  const [hasCompletedVoting, setHasCompletedVoting] = useState(false);
  const [showThankYouPopup, setShowThankYouPopup] = useState(false);
  const [currentVotedPosition, setCurrentVotedPosition] = useState(null);
  const [viewingPosition, setViewingPosition] = useState(null);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    status: "pending", // pending, active, ended
  });
  const [showCountdownPopup, setShowCountdownPopup] = useState(true);
  const [timeInterval, setTimeInterval] = useState(null);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [hasVotingStarted, setHasVotingStarted] = useState(false);
  const [hasVotingEnded, setHasVotingEnded] = useState(false);
  const [showPendingAlert, setShowPendingAlert] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [winnerDetails, setWinnerDetails] = useState([]);
  const [winners, setWinners] = useState({});
  const [selectedWinnerProfile, setSelectedWinnerProfile] = useState(null); // NEW STATE
  const [expandedPositions, setExpandedPositions] = useState({});
  const [autoCollapse, setAutoCollapse] = useState(false);
  const [revealedPositions, setRevealedPositions] = useState(() => {
    const saved = localStorage.getItem(`revealedPositions_${documentId}`);
    return saved ? JSON.parse(saved) : {};
  });
  const countdownRef = useRef(null);
  const lastStatusRef = useRef("pending");

  useEffect(() => {
    const savedParticipant = localStorage.getItem(
      `election_${documentId}_verified`
    );

    if (savedParticipant) {
      try {
        const parsed = JSON.parse(savedParticipant);

        setParticipantData(parsed);
        setIsVerified(true);

        // restore completed state
        const completed = localStorage.getItem(
          `election_${documentId}_completed`
        );
        if (completed === "true") {
          setViewOnly(true);
          setHasCompletedVoting(true);
        }
      } catch (e) {
        console.error("Failed to restore participant session");
        localStorage.removeItem(`election_${documentId}_verified`);
      }
    }
    // Restore revealed positions
    const savedRevealed = localStorage.getItem(
      `revealedPositions_${documentId}`
    );
    if (savedRevealed) {
      setRevealedPositions(JSON.parse(savedRevealed));
    }
  }, [documentId]);

  // Add this function after your other handlers
  const togglePositionExpand = (positionId) => {
    setExpandedPositions((prev) => ({
      ...prev,
      [positionId]: !prev[positionId],
    }));
  };

  const handleViewVotes = (positionId) => {
    setViewingPosition(positionId);

    // Ensure results UI is visible
    setShowResults(true);

    // Auto-expand the position when viewing votes
    setExpandedPositions((prev) => ({
      ...prev,
      [positionId]: true,
    }));
  };

  // Optionally, add a function to expand/collapse all
  const expandAllPositions = () => {
    const allExpanded = {};
    positions.forEach((pos) => {
      allExpanded[pos.id] = true;
    });
    setExpandedPositions(allExpanded);
  };

  const collapseAllPositions = () => {
    setExpandedPositions({});
  };

  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }, []);

  // Get server time to sync with client
  const getServerTime = useCallback(async () => {
    try {
      // const response = await axios.get(`${API_URL}/server-time`);
      // if (response.data && response.data.serverTime) {
      //   const serverTime = new Date(response.data.serverTime).getTime();
      //   const clientTime = Date.now();
      //   setServerTimeOffset(serverTime - clientTime);
      //   return serverTime;
      // }
    } catch (error) {
      console.log("Using client time as fallback");
    }
    return Date.now();
  }, []);

  // Get current time with server offset
  const getCurrentTime = useCallback(() => {
    return Date.now() + serverTimeOffset;
  }, [serverTimeOffset]);

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  };

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return "0s";

    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  // Calculate countdown with server time
  const calculateCountdown = useCallback(() => {
    if (!electionData.start_time || !electionData.end_time) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        status: "pending",
        timeToStart: 0,
        timeToEnd: 0,
      };
    }

    const now = getCurrentTime();
    const start = new Date(electionData.start_time).getTime();
    const end = new Date(electionData.end_time).getTime();

    let status = "pending";
    let totalSeconds = 0;
    let timeToStart = Math.max(0, Math.floor((start - now) / 1000));
    let timeToEnd = Math.max(0, Math.floor((end - now) / 1000));

    if (now < start) {
      status = "pending";
      totalSeconds = timeToStart;
    } else if (now >= start && now <= end) {
      status = "active";
      totalSeconds = timeToEnd;
    } else {
      status = "ended";
      totalSeconds = 0;
    }

    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      days,
      hours,
      minutes,
      seconds,
      totalSeconds,
      status,
      timeToStart,
      timeToEnd,
    };
  }, [electionData.start_time, electionData.end_time, getCurrentTime]);

  const updateCountdown = useCallback(() => {
    const newCountdown = calculateCountdown();
    setCountdown(newCountdown);

    if (lastStatusRef.current !== newCountdown.status) {
      if (
        newCountdown.status === "active" &&
        lastStatusRef.current === "pending"
      ) {
        setHasVotingStarted(true);
        setShowCountdownPopup(false);
      }

      if (
        newCountdown.status === "ended" &&
        lastStatusRef.current !== "ended"
      ) {
        setHasVotingEnded(true);
        setShowResults(true);
        setViewOnly(true);

        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      }

      lastStatusRef.current = newCountdown.status;
    }
  }, [calculateCountdown]);

  // Start countdown interval
  const startCountdownInterval = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    countdownRef.current = setInterval(() => {
      updateCountdown();
    }, 1000);
  }, [updateCountdown]);

  useEffect(() => {
    if (
      electionData.start_time &&
      electionData.end_time &&
      countdown.status !== "ended"
    ) {
      updateCountdown();
      startCountdownInterval();
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [
    electionData.start_time,
    electionData.end_time,
    countdown.status,
    updateCountdown,
    startCountdownInterval,
  ]);

  // Check if user has completed all votes
  const checkIfCompletedAllVotes = useCallback(() => {
    if (!positions.length) return false;

    const allPositionsVoted = positions.every(
      (position) => votedPositions[position.id] || submittedVotes[position.id]
    );

    if (allPositionsVoted) {
      const allRevealed = {};
      positions.forEach((position) => {
        allRevealed[position.id] = true;
      });
      setRevealedPositions(allRevealed);
      localStorage.setItem(
        `revealedPositions_${documentId}`,
        JSON.stringify(allRevealed)
      );
      setHasCompletedVoting(true);
      setViewOnly(true);
      localStorage.setItem(`election_${documentId}_completed`, "true");

      setTimeout(() => {
        setShowThankYouPopup(true);
      }, 500);

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

        const newElectionData = {
          electionName: electionName,
          electionCategory: electionCategory,
          electionType: electionType,
          electionId: apiData.id,
          start_time: apiData.start_time,
          end_time: apiData.end_time,
          election_status: apiData.election_status || "scheduled",
        };

        setElectionData(newElectionData);
        setElectionIdFromApi(apiData.id);

        // Extract winners from API response
        const winnersData = apiData.election_winners || [];
        const winnersMap = {};
        const winnerDetailsArray = [];

        winnersData.forEach((winner) => {
          if (winner.election_candidate_position && winner.candidate) {
            winnersMap[winner.election_candidate_position.id] =
              winner.candidate.id;

            // Build winner details with photo URL
            let photoUrl = null;
            if (winner.candidate.photo) {
              const photo = winner.candidate.photo;
              if (photo.formats?.medium?.url) {
                photoUrl = `${IMAGE_BASE_URL}${photo.formats.medium.url}`;
              } else if (photo.formats?.small?.url) {
                photoUrl = `${IMAGE_BASE_URL}${photo.formats.small.url}`;
              } else if (photo.url) {
                photoUrl = `${IMAGE_BASE_URL}${photo.url}`;
              }
            }

            winnerDetailsArray.push({
              ...winner,
              candidate: {
                ...winner.candidate,
                photoUrl: photoUrl,
              },
            });
          }
        });

        setWinners(winnersMap);
        setWinnerDetails(winnerDetailsArray);

        // Get server time for sync
        await getServerTime();

        // Calculate initial countdown
        const initialCountdown = calculateCountdown();
        setCountdown(initialCountdown);
        lastStatusRef.current = initialCountdown.status;
        startCountdownInterval();

        // Set flags based on initial status
        if (initialCountdown.status === "active") {
          setHasVotingStarted(true);
          setShowCountdownPopup(false);
        } else if (initialCountdown.status === "ended") {
          setHasVotingEnded(true);
          setShowResults(true);
          setViewOnly(true);
        }

        const positionsWithCandidates =
          apiData.election_candidate_positions || [];
        return { positionsWithCandidates, electionData: newElectionData };
      } else {
        console.error("No data in response");
        return { positionsWithCandidates: [], electionData: null };
      }
    } catch (error) {
      console.error("Error fetching election details:", error);
      setFetchError(`Failed to load election: ${error.message}`);
      return { positionsWithCandidates: [], electionData: null };
    }
  }, [documentId, getServerTime, calculateCountdown]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      if (timeInterval) {
        clearInterval(timeInterval);
      }
    };
  }, [timeInterval]);

  // Also ensure startCountdownInterval is called when data loads
  useEffect(() => {
    if (
      electionData.start_time &&
      electionData.end_time &&
      countdown.status === "pending"
    ) {
    }
  }, [
    electionData.start_time,
    electionData.end_time,
    countdown.status,
    startCountdownInterval,
  ]);

  // Show pending votes alert when there are pending votes
  useEffect(() => {
    if (hasVotingStarted && isVerified && positions.length > 0) {
      const pending = positions.filter((p) => !isPositionVoted(p.id));
      if (pending.length > 0) {
        setShowPendingAlert(true);
      }
    }
  }, [positions, hasVotingStarted, isVerified, votedPositions]);

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
      const { positionsWithCandidates } = await fetchElectionDetails();

      if (!positionsWithCandidates || positionsWithCandidates.length === 0) {
        console.log("No election details found");
        setPositions([]);
        setFetchError("No positions found for this election");
        return;
      }

      const positionsData = positionsWithCandidates.map((position) => {
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
          name:
            typeof position.Position === "string"
              ? position.Position
              : typeof position.position === "string"
              ? position.position
              : "Unknown Position",

          position:
            typeof position.Position === "string"
              ? position.Position
              : typeof position.position === "string"
              ? position.position
              : "Unknown Position",

          submitted: false,
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
              votes: candidate.vote_count || 0, // Use vote_count from API
              selected: false,
              isWinner: false,
              showvotes: false,
            };
          }),
        };
      });

      setPositions(positionsData);

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
  }, [
    documentId,
    fetchElectionDetails,
    startCountdownInterval,
    votedPositions,
    submittedVotes,
  ]);

  useEffect(() => {
    if (countdown.status !== "active" || !isVerified) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `${API_URL}/elections/public/${documentId}`
        );

        const updatedPositions =
          res.data.data.election_candidate_positions || [];

        setPositions((prev) =>
          prev.map((pos) => {
            const updatedPos = updatedPositions.find((p) => p.id === pos.id);
            if (!updatedPos) return pos;

            return {
              ...pos,
              candidates: pos.candidates.map((c) => {
                const updatedC = updatedPos.candidates.find(
                  (x) => x.id === c.id
                );
                return updatedC ? { ...c, votes: updatedC.vote_count } : c;
              }),
            };
          })
        );
      } catch (err) {
        console.error("Vote refresh failed", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [countdown.status, isVerified, documentId]);

  useEffect(() => {
    if (documentId) {
      fetchVotingData();
    }
  }, [documentId, fetchVotingData]);

  // Handle vote selection
  const handleVote = (candidateId, positionId) => {
    if (submittedVotes[positionId] || viewOnly || countdown.status !== "active")
      return;

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
    if (viewOnly || countdown.status !== "active") return;

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

      if (response.data && response.data.success) {
        const apiData = response.data.data || response.data;

        const participantDocumentId = apiData.documentId || apiData.document_id;

        if (!participantDocumentId) {
          setVerificationError("Participant documentId missing");
          return;
        }

        const participantData = {
          name: apiData.name,
          phone: cleanPhone,
          documentId: participantDocumentId,
          token: apiData.VoteToken || apiData.token,
          alreadyVoted: apiData.alreadyVoted,
        };

        if (apiData.alreadyVoted) {
          setViewOnly(true);
          setHasCompletedVoting(true);
          localStorage.setItem(`election_${documentId}_completed`, "true");
        }

        setParticipantData(participantData);
        setIsVerified(true);
        setVerificationSuccess(true);

        localStorage.setItem(
          `election_${documentId}_verified`,
          JSON.stringify(participantData)
        );

        if (apiData.alreadyVoted) {
          alert(
            `Welcome back ${participantData.name}! You have already completed voting.`
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
    if (!participantData || viewOnly || countdown.status !== "active") return;
    if (votedPositions[positionId]) return;

    const position = positions.find((p) => p.id === positionId);
    if (!position) return;

    const selectedCandidate = position.candidates.find((c) => c.selected);
    if (!selectedCandidate) return;

    // 🔒 LOCK VOTE IMMEDIATELY (NO WAIT)
    const updatedVotes = { ...votedPositions, [positionId]: true };
    setVotedPositions(updatedVotes);
    setSubmittedVotes((prev) => ({ ...prev, [positionId]: true }));

    localStorage.setItem(
      `votedPositions_${documentId}`,
      JSON.stringify(updatedVotes)
    );

    setCurrentVotedPosition(positionName);
    setToastMessage(`Your vote for "${positionName}" has been submitted!`);

    setRevealedPositions((prev) => ({
      ...prev,
      [positionId]: true,
    }));

    localStorage.setItem(
      `revealedPositions_${documentId}`,
      JSON.stringify({ ...revealedPositions, [positionId]: true })
    );

    // UI update instantly
    setPositions((prev) =>
      prev.map((pos) =>
        pos.id === positionId
          ? {
              ...pos,
              submitted: true,
              candidates: pos.candidates.map((c) =>
                c.id === selectedCandidate.id
                  ? {
                      ...c,
                      votes: (c.votes || 0) + 1,
                      selected: false,
                      showVotes: true,
                    }
                  : { ...c, showVotes: true }
              ),
            }
          : pos
      )
    );
    checkIfCompletedAllVotes();

    // 🔕 BACKEND UPDATE (SILENT)
    try {
      await axios.put(
        `${API_URL}/election-participants/${participantData.documentId}`,
        {
          data: {
            candidate_id: selectedCandidate.id,
            position_id: positionId,
            election_document_id: documentId,
            voted_at: new Date().toISOString(),
          },
        }
      );

      axios.put(`${API_URL}/candidates/${selectedCandidate.id}`, {
        data: { vote_count: (selectedCandidate.votes || 0) + 1 },
      });
    } catch {
      // 🔕 IGNORE ALL ERRORS
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
    localStorage.removeItem(`election_${documentId}_completed`);
    localStorage.removeItem(`revealedPositions_${documentId}`);

    // 🔥 RESET ALL STATES
    setIsVerified(false);
    setPhoneNumber("");
    setVerificationSuccess(false);
    setParticipantData(null);

    setVotedPositions({});
    setSubmittedVotes({});
    setSelectedCandidates({});
    setShowThankYouPopup(false);
    setViewingPosition(null);

    const hasCompleted = localStorage.getItem(
      `election_${documentId}_completed`
    );

    // 🔐 only apply completed logic if user is verified
    if (isVerified && hasCompleted === "true") {
      setViewOnly(true);
      setHasCompletedVoting(true);
    } else {
      setViewOnly(false);
      setHasCompletedVoting(false);
    }
  };

  // Calculate voting progress
  const votingProgress = useMemo(() => {
    if (!positions.length) return 0;
    const votedCount = positions.filter((pos) =>
      isPositionVoted(pos.id)
    ).length;
    return Math.round((votedCount / positions.length) * 100);
  }, [positions, votedPositions, submittedVotes]);

  // Request notification permission
  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const SuccessToast = ({ message, onClose }) => {
    return (
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl shadow-2xl p-4 max-w-sm border border-emerald-300">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold">Vote Submitted!</h4>
              <p className="text-sm opacity-90">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
          {/* Auto-close progress bar */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 5, ease: "linear" }}
            className="h-1 bg-emerald-300 mt-2 rounded-full"
          />
        </div>
      </motion.div>
    );
  };

  // Pending Votes Alert Component
  const PendingVotesAlert = () => {
    const pendingPositions = positions.filter((p) => !isPositionVoted(p.id));

    if (pendingPositions.length === 0 || !hasVotingStarted || viewOnly)
      return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 right-4 z-50"
      >
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-2xl p-4 max-w-sm border border-amber-300">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-1">
                Pending Votes Remaining
              </h4>
              <p className="text-sm opacity-90 mb-2">
                You still have{" "}
                <span className="font-bold">{pendingPositions.length}</span>{" "}
                position{pendingPositions.length !== 1 ? "s" : ""} to vote for.
              </p>
              <div className="space-y-1">
                {pendingPositions.slice(0, 3).map((pos) => (
                  <div
                    key={pos.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{pos.position}</span>
                    <button
                      onClick={() => {
                        const element = document.getElementById(
                          `position-${pos.id}`
                        );
                        if (element) {
                          element.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                        }
                      }}
                      className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded"
                    >
                      Vote Now
                    </button>
                  </div>
                ))}
                {pendingPositions.length > 3 && (
                  <p className="text-xs opacity-80">
                    ...and {pendingPositions.length - 3} more
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowPendingAlert(false)}
              className="text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Winner Profile Modal Component
  // Winner Profile Modal Component - IMPROVED
  // const WinnerProfileModal = ({ winner, onClose }) => {
  //   if (!winner || !winner.candidate) return null;

  //   return (
  //     <AnimatePresence>
  //       <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
  //         {/* Backdrop with smoother animation */}
  //         <motion.div
  //           initial={{ opacity: 0 }}
  //           animate={{ opacity: 1 }}
  //           exit={{ opacity: 0 }}
  //           transition={{ duration: 0.2 }}
  //           className="absolute inset-0 bg-black/80 backdrop-blur-sm"
  //           onClick={onClose}
  //         />

  //         {/* Modal Content - Smoother animation */}
  //         <motion.div
  //           key={winner.id || "winner-modal"}
  //           initial={{
  //             opacity: 0,
  //             scale: 0.95,
  //             y: 20,
  //           }}
  //           animate={{
  //             opacity: 1,
  //             scale: 1,
  //             y: 0,
  //           }}
  //           exit={{
  //             opacity: 0,
  //             scale: 0.95,
  //             y: 20,
  //           }}
  //           transition={{
  //             type: "spring",
  //             damping: 25,
  //             stiffness: 300,
  //             duration: 0.3,
  //           }}
  //           className="relative bg-gradient-to-br from-white via-emerald-50 to-green-50 rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-emerald-200 z-10"
  //           onClick={(e) => e.stopPropagation()}
  //         >
  //           {/* Enhanced Header */}
  //           <div className="relative bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700 p-4 sm:p-6">
  //             {/* Gradient Overlay */}
  //             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-xl sm:rounded-t-2xl"></div>

  //             {/* Close Button - Improved */}
  //             <button
  //               onClick={onClose}
  //               className="absolute top-3 right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-all duration-200 z-20 hover:scale-110 active:scale-95"
  //             >
  //               <X className="w-4 h-4 sm:w-5 sm:h-5" />
  //             </button>

  //             {/* Winner Badge */}
  //             <motion.div
  //               initial={{ scale: 0, rotate: -180 }}
  //               animate={{ scale: 1, rotate: 0 }}
  //               transition={{ delay: 0.1, type: "spring" }}
  //               className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full p-2 shadow-xl z-20"
  //             >
  //               <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
  //             </motion.div>

  //             {/* Title Section */}
  //             <div className="relative z-10 pt-8">
  //               <motion.h2
  //                 initial={{ opacity: 0, y: 10 }}
  //                 animate={{ opacity: 1, y: 0 }}
  //                 transition={{ delay: 0.1 }}
  //                 className="text-lg sm:text-xl font-bold text-white mb-1"
  //               >
  //                 Winner Profile
  //               </motion.h2>
  //               <motion.p
  //                 initial={{ opacity: 0 }}
  //                 animate={{ opacity: 1 }}
  //                 transition={{ delay: 0.2 }}
  //                 className="text-emerald-100 text-sm sm:text-base line-clamp-1"
  //               >
  //                 {winner.election_candidate_position?.Position || "Position"}
  //               </motion.p>
  //             </div>
  //           </div>

  //           {/* Content Grid */}
  //           <div className="p-4 sm:p-6">
  //             <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
  //               {/* Left Column - Photo & Stats */}
  //               <div className="lg:w-1/3 space-y-4">
  //                 {/* Photo Container with Animation */}
  //                 <motion.div
  //                   initial={{ opacity: 0, scale: 0.9 }}
  //                   animate={{ opacity: 1, scale: 1 }}
  //                   transition={{ delay: 0.3 }}
  //                   className="relative"
  //                 >
  //                   <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-xl overflow-hidden border-3 border-emerald-300 shadow-lg bg-white">
  //                     {winner.candidate?.photoUrl ? (
  //                       <img
  //                         src={winner.candidate.photoUrl}
  //                         alt={winner.candidate.name}
  //                         className="w-full h-full object-cover"
  //                         loading="lazy"
  //                       />
  //                     ) : (
  //                       <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
  //                         <span className="text-white text-xl sm:text-2xl font-bold">
  //                           {getInitials(winner.candidate?.name)}
  //                         </span>
  //                       </div>
  //                     )}
  //                   </div>

  //                   {/* Trophy Badge with Animation */}
  //                   <motion.div
  //                     initial={{ scale: 0, rotate: -180 }}
  //                     animate={{ scale: 1, rotate: 0 }}
  //                     transition={{ delay: 0.4, type: "spring" }}
  //                     className="absolute -bottom-2 -right-2 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full p-2 shadow-lg"
  //                   >
  //                     <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
  //                   </motion.div>
  //                 </motion.div>

  //                 {/* Stats Card */}
  //                 <motion.div
  //                   initial={{ opacity: 0, y: 20 }}
  //                   animate={{ opacity: 1, y: 0 }}
  //                   transition={{ delay: 0.4 }}
  //                   className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-lg sm:rounded-xl p-4 border border-emerald-200"
  //                 >
  //                   <h4 className="font-bold text-gray-800 text-center text-sm sm:text-base mb-3">
  //                     Election Stats
  //                   </h4>
  //                   <div className="space-y-3">
  //                     {/* Total Votes */}
  //                     <div className="text-center">
  //                       <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
  //                         {typeof winner.Total_Votes === "number"
  //                           ? winner.Total_Votes
  //                           : 0}
  //                       </div>
  //                       <div className="text-xs sm:text-sm text-gray-600">
  //                         Total Votes
  //                       </div>
  //                     </div>

  //                     <div className="h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>

  //                     {/* Position */}
  //                     <div>
  //                       <div className="text-xs text-gray-600 mb-1">
  //                         Position
  //                       </div>
  //                       <div className="font-medium text-gray-800 text-sm">
  //                         {winner.election_candidate_position?.Position ||
  //                           "N/A"}
  //                       </div>
  //                     </div>

  //                     {/* Election Name */}
  //                     <div>
  //                       <div className="text-xs text-gray-600 mb-1">
  //                         Election
  //                       </div>
  //                       <div className="font-medium text-gray-800 text-sm line-clamp-2">
  //                         {electionData.electionName}
  //                       </div>
  //                     </div>
  //                   </div>
  //                 </motion.div>
  //               </div>

  //               {/* Right Column - Details with Stagger Animation */}
  //               <div className="lg:w-2/3">
  //                 {/* Name and Badges */}
  //                 <motion.div
  //                   initial={{ opacity: 0, y: 10 }}
  //                   animate={{ opacity: 1, y: 0 }}
  //                   transition={{ delay: 0.3 }}
  //                   className="mb-4 sm:mb-6"
  //                 >
  //                   <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 line-clamp-1">
  //                     {winner.candidate?.name || "Unknown Candidate"}
  //                   </h3>
  //                   <div className="flex flex-wrap gap-2">
  //                     <motion.span
  //                       initial={{ opacity: 0, scale: 0.8 }}
  //                       animate={{ opacity: 1, scale: 1 }}
  //                       transition={{ delay: 0.4 }}
  //                       className="px-2 sm:px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 rounded-full text-xs sm:text-sm font-semibold"
  //                     >
  //                       Winner
  //                     </motion.span>
  //                     {winner.candidate?.candidate_id && (
  //                       <motion.span
  //                         initial={{ opacity: 0, scale: 0.8 }}
  //                         animate={{ opacity: 1, scale: 1 }}
  //                         transition={{ delay: 0.45 }}
  //                         className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm"
  //                       >
  //                         ID: {winner.candidate.candidate_id}
  //                       </motion.span>
  //                     )}
  //                   </div>
  //                 </motion.div>

  //                 {/* Personal Details Grid */}
  //                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
  //                   {winner.candidate?.email && (
  //                     <motion.div
  //                       initial={{ opacity: 0, y: 10 }}
  //                       animate={{ opacity: 1, y: 0 }}
  //                       transition={{ delay: 0.5 }}
  //                       className="bg-white rounded-lg sm:rounded-xl p-3 border border-gray-200"
  //                     >
  //                       <div className="text-xs text-gray-600 mb-1">Email</div>
  //                       <div className="font-medium text-gray-900 text-sm truncate">
  //                         {winner.candidate.email}
  //                       </div>
  //                     </motion.div>
  //                   )}

  //                   {winner.candidate?.phone && (
  //                     <motion.div
  //                       initial={{ opacity: 0, y: 10 }}
  //                       animate={{ opacity: 1, y: 0 }}
  //                       transition={{ delay: 0.55 }}
  //                       className="bg-white rounded-lg sm:rounded-xl p-3 border border-gray-200"
  //                     >
  //                       <div className="text-xs text-gray-600 mb-1">Phone</div>
  //                       <div className="font-medium text-gray-900 text-sm">
  //                         {winner.candidate.phone}
  //                       </div>
  //                     </motion.div>
  //                   )}

  //                   {winner.candidate?.department && (
  //                     <motion.div
  //                       initial={{ opacity: 0, y: 10 }}
  //                       animate={{ opacity: 1, y: 0 }}
  //                       transition={{ delay: 0.6 }}
  //                       className="bg-white rounded-lg sm:rounded-xl p-3 border border-gray-200"
  //                     >
  //                       <div className="text-xs text-gray-600 mb-1">
  //                         Department
  //                       </div>
  //                       <div className="font-medium text-gray-900 text-sm">
  //                         {winner.candidate.department}
  //                       </div>
  //                     </motion.div>
  //                   )}

  //                   {winner.candidate?.location && (
  //                     <motion.div
  //                       initial={{ opacity: 0, y: 10 }}
  //                       animate={{ opacity: 1, y: 0 }}
  //                       transition={{ delay: 0.65 }}
  //                       className="bg-white rounded-lg sm:rounded-xl p-3 border border-gray-200"
  //                     >
  //                       <div className="text-xs text-gray-600 mb-1">
  //                         Location
  //                       </div>
  //                       <div className="font-medium text-gray-900 text-sm">
  //                         {winner.candidate.location}
  //                       </div>
  //                     </motion.div>
  //                   )}
  //                 </div>

  //                 {/* Bio Section */}
  //                 {winner.candidate?.bio && (
  //                   <motion.div
  //                     initial={{ opacity: 0, y: 10 }}
  //                     animate={{ opacity: 1, y: 0 }}
  //                     transition={{ delay: 0.7 }}
  //                     className="mb-4 sm:mb-6"
  //                   >
  //                     <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
  //                       About
  //                     </h4>
  //                     <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
  //                       <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">
  //                         {typeof winner.candidate.bio === "string"
  //                           ? winner.candidate.bio
  //                           : "No details available"}
  //                       </p>
  //                     </div>
  //                   </motion.div>
  //                 )}

  //                 {/* Experience */}
  //                 {winner.candidate?.experience && (
  //                   <motion.div
  //                     initial={{ opacity: 0, y: 10 }}
  //                     animate={{ opacity: 1, y: 0 }}
  //                     transition={{ delay: 0.75 }}
  //                   >
  //                     <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
  //                       Experience
  //                     </h4>
  //                     <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-200">
  //                       <p className="text-gray-700 text-sm">
  //                         {winner.candidate.experience}
  //                       </p>
  //                     </div>
  //                   </motion.div>
  //                 )}
  //               </div>
  //             </div>
  //           </div>

  //           {/* Footer */}
  //           <motion.div
  //             initial={{ opacity: 0 }}
  //             animate={{ opacity: 1 }}
  //             transition={{ delay: 0.8 }}
  //             className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 p-3 sm:p-4 border-t border-emerald-200"
  //           >
  //             <div className="text-center">
  //               <p className="text-emerald-700 font-medium text-sm sm:text-base">
  //                 🎉 Congratulations to the winner!
  //               </p>
  //             </div>
  //           </motion.div>
  //         </motion.div>
  //       </div>
  //     </AnimatePresence>
  //   );
  // };

  // Thank You Popup Component
  const ThankYouPopup = () => {
    const remainingPositions = positions.filter(
      (p) => !isPositionVoted(p.id)
    ).length;

    const totalPositions = positions.length;
    const votedPositionsCount = totalPositions - remainingPositions;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={() => setShowThankYouPopup(false)}
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 200,
          }}
          className="bg-gradient-to-br from-white via-emerald-50 to-green-50 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-emerald-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10"></div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center mb-4 relative z-10 shadow-xl"
            >
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2 relative z-10"
            >
              Vote Submitted!
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-emerald-100 font-medium relative z-10"
            >
              Your voice has been heard
            </motion.p>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              {/* Vote Confirmation */}
              <div className="space-y-2">
                <div className="text-5xl">🎉</div>
                <p className="text-gray-700 text-lg font-medium">
                  {currentVotedPosition
                    ? `Your vote for "${currentVotedPosition}" has been recorded successfully!`
                    : "Your vote has been recorded successfully!"}
                </p>
              </div>

              {/* Progress */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Voting Progress
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    {votedPositionsCount}/{totalPositions}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(votedPositionsCount / totalPositions) * 100}%`,
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full"
                  />
                </div>
              </div>

              {/* Remaining Positions Message */}
              {remainingPositions > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200"
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-blue-800">
                      {remainingPositions} Position
                      {remainingPositions > 1 ? "s" : ""} Remaining
                    </h4>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Please continue voting for the remaining position
                    {remainingPositions > 1 ? "s" : ""} to complete your ballot.
                  </p>
                  <div className="mt-3 text-xs text-blue-600 font-medium">
                    ⚡ Your progress is saved automatically
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200"
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Trophy className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-emerald-800">
                      🎊 Voting Complete!
                    </h4>
                  </div>
                  <p className="text-emerald-700 text-sm">
                    You have voted for all positions. Thank you for
                    participating!
                  </p>
                  <div className="mt-3 text-xs text-emerald-600 font-medium">
                    ✅ Your ballot has been submitted successfully
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowThankYouPopup(false)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {remainingPositions > 0 ? "Continue Voting" : "View Summary"}
                </motion.button>

                {remainingPositions > 0 && (
                  <button
                    onClick={() => {
                      setShowThankYouPopup(false);
                      // Scroll to next unvoted position
                      const nextPosition = positions.find(
                        (p) => !isPositionVoted(p.id)
                      );
                      if (nextPosition) {
                        setTimeout(() => {
                          const element = document.getElementById(
                            `position-${nextPosition.id}`
                          );
                          if (element) {
                            element.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }
                        }, 100);
                      }
                    }}
                    className="w-full py-2 text-emerald-600 font-medium text-sm hover:text-emerald-700 transition-colors"
                  >
                    Jump to next position →
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Auto-close indicator */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 5, ease: "linear" }}
            className="h-1 bg-gradient-to-r from-emerald-400 to-green-400"
          />
        </motion.div>
      </motion.div>
    );
  };

  // Pending Votes Notification Component
  const PendingVotesNotification = () => {
    const remainingPositions = positions.filter(
      (p) => !isPositionVoted(p.id)
    ).length;

    if (remainingPositions === 0 || !hasVotingStarted || showThankYouPopup)
      return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 right-4 z-40"
      >
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-2xl p-4 max-w-sm">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold">Pending Votes</h4>
              <p className="text-sm opacity-90">
                {remainingPositions} position{remainingPositions > 1 ? "s" : ""}{" "}
                remaining
              </p>
            </div>
            <button
              onClick={() => {
                const nextPosition = positions.find(
                  (p) => !isPositionVoted(p.id)
                );
                if (nextPosition) {
                  const element = document.getElementById(
                    `position-${nextPosition.id}`
                  );
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }
                }
              }}
              className="bg-white text-amber-600 px-3 py-1 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
            >
              Vote Now
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Full Screen Countdown Component
  const FullScreenCountdown = () => {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white p-4 overflow-auto">
        {/* Main Container */}
        <div className="w-full max-w-4xl text-center mx-auto">
          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-4xl font-bold mb-2 px-4">
              VOTING WILL START IN
            </h1>
            <p className="text-lg md:text-xl text-blue-200 font-medium px-4">
              {electionData.electionName || "Election"}
            </p>
          </div>

          {/* Large Countdown Timer */}
          <div className="mb-8 px-4">
            <div className="flex justify-center items-center space-x-1 md:space-x-2 lg:space-x-3 mx-auto w-fit">
              {/* DAYS */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-b from-blue-600 to-indigo-700 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg border border-blue-500/30">
                  <span className="text-2xl md:text-3xl font-black text-white">
                    {countdown.days.toString().padStart(2, "0")}
                  </span>
                </div>
                <span className="block mt-1 md:mt-2 text-xs md:text-sm font-bold text-blue-200 uppercase">
                  DAYS
                </span>
              </div>

              {/* Separator */}
              <div className="mb-4 md:mb-5">
                <span className="text-xl md:text-2xl font-bold text-blue-400">
                  :
                </span>
              </div>

              {/* HOURS */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-b from-blue-600 to-indigo-700 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg border border-blue-500/30">
                  <span className="text-2xl md:text-3xl font-black text-white">
                    {countdown.hours.toString().padStart(2, "0")}
                  </span>
                </div>
                <span className="block mt-1 md:mt-2 text-xs md:text-sm font-bold text-blue-200 uppercase">
                  HOURS
                </span>
              </div>

              {/* Separator */}
              <div className="mb-4 md:mb-5">
                <span className="text-xl md:text-2xl font-bold text-blue-400">
                  :
                </span>
              </div>

              {/* MINUTES */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-b from-blue-600 to-indigo-700 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg border border-blue-500/30">
                  <span className="text-2xl md:text-3xl font-black text-white">
                    {countdown.minutes.toString().padStart(2, "0")}
                  </span>
                </div>
                <span className="block mt-1 md:mt-2 text-xs md:text-sm font-bold text-blue-200 uppercase">
                  MINUTES
                </span>
              </div>

              {/* Separator */}
              <div className="mb-4 md:mb-5">
                <span className="text-xl md:text-2xl font-bold text-blue-400">
                  :
                </span>
              </div>

              {/* SECONDS */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-b from-blue-600 to-indigo-700 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg border border-blue-500/30">
                  <span className="text-2xl md:text-3xl font-black text-white">
                    {countdown.seconds.toString().padStart(2, "0")}
                  </span>
                </div>
                <span className="block mt-1 md:mt-2 text-xs md:text-sm font-bold text-blue-200 uppercase">
                  SECONDS
                </span>
              </div>
            </div>
          </div>

          {/* Time Information */}
          <div className="w-full max-w-md mx-auto mb-6 px-4">
            <div className="space-y-3">
              <div className="bg-blue-800/40 rounded-lg p-3 md:p-4">
                <h3 className="text-sm md:text-base font-bold text-white mb-1">
                  Start Time
                </h3>
                <p className="text-xs md:text-sm text-blue-100">
                  {formatDateTime(electionData.start_time)}
                </p>
              </div>

              <div className="bg-blue-800/40 rounded-lg p-3 md:p-4">
                <h3 className="text-sm md:text-base font-bold text-white mb-1">
                  End Time
                </h3>
                <p className="text-xs md:text-sm text-blue-100">
                  {formatDateTime(electionData.end_time)}
                </p>
              </div>
            </div>
          </div>

          {/* Small Notice */}
          <div className="w-full max-w-md mx-auto mb-6 px-4">
            <div className="bg-blue-800/30 rounded-lg p-3 md:p-4 border border-blue-400/20">
              <h3 className="text-base md:text-lg font-bold text-white mb-2">
                What to Expect
              </h3>
              <p className="text-xs md:text-sm text-blue-200">
                Phone verification will be required when voting starts. Have
                your registered number ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Voting Status Banner Component
  const VotingStatusBanner = () => {
    if (countdown.status === "pending") {
      return (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Clock className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg md:text-xl mb-1">
                  Voting Starts In
                </h3>
                <p className="text-blue-100 text-sm md:text-base">
                  {formatDateTime(electionData.start_time)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-6">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold bg-white/20 rounded-lg px-3 py-2">
                  {countdown.days.toString().padStart(2, "0")}
                </div>
                <div className="text-xs md:text-sm opacity-90 mt-1">DAYS</div>
              </div>
              <div className="text-gray-300 text-xl">:</div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold bg-white/20 rounded-lg px-3 py-2">
                  {countdown.hours.toString().padStart(2, "0")}
                </div>
                <div className="text-xs md:text-sm opacity-90 mt-1">HOURS</div>
              </div>
              <div className="text-gray-300 text-xl">:</div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold bg-white/20 rounded-lg px-3 py-2">
                  {countdown.minutes.toString().padStart(2, "0")}
                </div>
                <div className="text-xs md:text-sm opacity-90 mt-1">
                  MINUTES
                </div>
              </div>
              <div className="text-gray-300 text-xl">:</div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold bg-white/20 rounded-lg px-3 py-2">
                  {countdown.seconds.toString().padStart(2, "0")}
                </div>
                <div className="text-xs md:text-sm opacity-90 mt-1">
                  SECONDS
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (countdown.status === "active") {
      return (
        <div className="bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Zap className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg md:text-xl mb-1">
                  Voting is Active!
                </h3>
                <p className="text-green-100 text-sm">
                  {electionData.electionName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-6 justify-center">
              {/* HOURS */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-2xl md:text-3xl font-bold bg-white/20 rounded-lg px-4 py-2"
                >
                  {countdown.hours.toString().padStart(2, "0")}
                </motion.div>
                <div className="text-xs md:text-sm opacity-90 mt-1">
                  HOURS LEFT
                </div>
              </div>
              <div className="text-gray-300 text-xl">:</div>
              {/* MINUTES */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-2xl md:text-3xl font-bold bg-white/20 rounded-lg px-4 py-2"
                >
                  {countdown.minutes.toString().padStart(2, "0")}
                </motion.div>
                <div className="text-xs md:text-sm opacity-90 mt-1">
                  MINUTES LEFT
                </div>
              </div>
              <div className="text-gray-300 text-xl">:</div>
              {/* SECONDS */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-2xl md:text-3xl font-bold bg-white/20 rounded-lg px-4 py-2"
                >
                  {countdown.seconds.toString().padStart(2, "0")}
                </motion.div>
                <div className="text-xs md:text-sm opacity-90 mt-1">
                  SECONDS LEFT
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (countdown.status === "ended") {
      return (
        <div className="bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700 text-white p-4 md:p-6 rounded-xl shadow-lg">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Trophy className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg md:text-xl mb-1">
                  🎊 Voting Has Ended
                </h3>
                <p className="text-emerald-100 text-sm md:text-base">
                  Results are now available for {electionData.electionName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg md:text-lg font-bold bg-white/20 rounded-lg px-4 py-2">
                  Results Available
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
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
          <p className="text-gray-600 text-center mb-2">{String(fetchError)}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setRefreshKey((prev) => prev + 1);
              fetchVotingData();
            }}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Show Full Screen Countdown when voting is pending and user not verified
  if (countdown.status === "pending" && !isVerified) {
    return <FullScreenCountdown />;
  }

  // Phone verification required (only shown when voting is active)
  if (countdown.status === "active" && !isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Voting is Active!
            </h1>
          </div>

          {/* VERIFICATION FORM */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Verify Your Identity
              </h2>
              <p className="text-gray-600 text-sm">
                Enter your registered phone number to vote
              </p>
              <p className="text-blue-600 font-semibold text-sm mt-1">
                {electionData.electionName || "this election"}
              </p>
            </div>

            {verificationError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
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
                  placeholder="Enter 10-digit phone number"
                  className="flex-1 px-3 py-3 border-0 focus:ring-0 focus:outline-none text-sm"
                  disabled={verifying}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={verifyPhoneNumber}
              disabled={verifying}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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

            <p className="text-gray-500 text-xs text-center mt-4">
              Only verified participants can vote. Your phone number will be
              verified against the election's participant list.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main voting page (only shown when voting is active and verified)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      {/* Show CountdownPopup as overlay when needed */}
      {showThankYouPopup && <ThankYouPopup />}

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-2 shadow-lg">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {electionData.electionName || "Election"}
                </h1>
                <p className="text-sm text-gray-600">
                  {electionData.electionCategory}
                  {participantData && ` • Verified as ${participantData.name}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full font-semibold flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium text-sm shadow hover:shadow-md flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                {/* Add this button next to the logout button */}
                {positions.length > 1 && (
                  <button
                    onClick={() => {
                      if (
                        Object.keys(expandedPositions).length ===
                        positions.length
                      ) {
                        collapseAllPositions();
                      } else {
                        expandAllPositions();
                      }
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium text-sm shadow hover:shadow-md flex items-center gap-1"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        Object.keys(expandedPositions).length ===
                        positions.length
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                    {Object.keys(expandedPositions).length === positions.length
                      ? "Collapse All"
                      : "Expand All"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Voting Status Banner */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <VotingStatusBanner />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Show message if voting hasn't started */}
        {countdown.status === "pending" && !showCountdownPopup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-6 text-center border-2 border-gray-200"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Voting Not Started Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Voting will begin on {formatDateTime(electionData.start_time)}
            </p>
            <button
              onClick={() => setShowCountdownPopup(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Show Countdown Timer
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {positions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-200/50"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Positions Available
            </h3>
            <p className="text-gray-600 max-w-xl mx-auto mb-6">
              There are no positions registered for this election yet.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setRefreshKey((prev) => prev + 1);
                fetchVotingData();
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg"
            >
              Check Again
            </motion.button>
          </motion.div>
        ) : (
          // Show voting UI only when voting is active
          countdown.status === "active" && (
            <div className="mx-auto max-w-7xl w-full space-y-8">
              {positions.map((position, positionIndex) => {
                const selectedCandidate = position.candidates.find(
                  (c) => c.selected
                );
                const hasSelected = !!selectedCandidate;
                const isVoted = isPositionVoted(position.id);
                const isViewing = viewingPosition === position.id;

                return (
                  <motion.div
                    key={position.id}
                    id={`position-${position.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: positionIndex * 0.1 }}
                    className={`relative w-full bg-white rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl
    ${
      isVoted
        ? "border-emerald-200 ring-1 ring-emerald-50"
        : "border-gray-200 hover:border-gray-300"
    }
  `}
                  >
                    {/* Enhanced Position Header */}
                    <div className="sticky top-0 z-10 bg-white border-b border-gray-100 transition-all duration-300 rounded-t-2xl">
                      <div className="px-6 py-6 flex flex-row items-center justify-between w-full">
                        {/* Left Side: Position Info */}
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Enhanced Chevron icon - NOW CLICKABLE */}
                          <div className="flex-shrink-0">
                            <motion.div
                              animate={{
                                rotate: expandedPositions[position.id]
                                  ? 180
                                  : 0,
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDown
                                className="w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                onClick={() =>
                                  togglePositionExpand(position.id)
                                }
                              />
                            </motion.div>
                          </div>

                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold text-gray-900 truncate">
                                {position.position}
                              </h3>
                              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100 flex-shrink-0">
                                {position.candidates.length}{" "}
                                {position.candidates.length === 1
                                  ? "candidate"
                                  : "candidates"}
                              </span>
                            </div>

                            {/* Added: Progress indicator for voted positions */}
                            {isVoted && (
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Vote submitted successfully
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Side: Enhanced Action Buttons */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* Enhanced Submit Vote Button */}
                          {!viewOnly && !isVoted && hasSelected && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                handleSubmitVote(position.id, position.position)
                              }
                              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Submit Vote
                            </motion.button>
                          )}

                          {/* Enhanced View/Close Buttons */}
                          {isVoted && (
                            <div className="flex items-center gap-2">
                              {isViewing ? (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setViewingPosition(null)}
                                  className="px-5 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all border border-rose-100 hover:border-rose-200"
                                >
                                  <X className="w-4 h-4" />
                                  Close View
                                </motion.button>
                              ) : (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleViewVotes(position.id)}
                                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                                >
                                  <BarChart3 className="w-4 h-4" />
                                  View Votes
                                </motion.button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Candidates Grid - CONDITIONAL RENDER BASED ON EXPANDED STATE */}
                    <AnimatePresence>
                      {expandedPositions[position.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6">
                            {isVoted ? (
                              // Enhanced Post-vote view
                              <div className="relative">
                                {/* Overlay - Enhanced */}
                                {!isViewing && (
                                  <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
                                    <div className="text-center p-8">
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                          type: "spring",
                                          stiffness: 200,
                                          damping: 15,
                                        }}
                                        className="w-24 h-24 mx-auto bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl"
                                      >
                                        <CheckCircle className="w-12 h-12 text-white" />
                                      </motion.div>
                                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        Thank You for Voting!
                                      </h3>
                                      <p className="text-gray-600 mb-4 text-lg">
                                        Your vote for{" "}
                                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                                          "{position.position}"
                                        </span>{" "}
                                        has been recorded.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Enhanced Candidates Grid */}
                                <div
                                  className={`grid gap-4 ${
                                    position.candidates.length === 1
                                      ? "max-w-xs mx-auto grid-cols-1"
                                      : position.candidates.length === 2
                                      ? "grid-cols-1 sm:grid-cols-2"
                                      : position.candidates.length === 3
                                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                  }`}
                                >
                                  {position.candidates.map(
                                    (candidate, candidateIndex) => {
                                      const isWinner =
                                        winners[position.id] === candidate.id;

                                      return (
                                        <motion.div
                                          key={candidate.id}
                                          initial={{ opacity: 0, scale: 0.9 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{
                                            delay: candidateIndex * 0.05,
                                          }}
                                          className={`relative rounded-xl border-2 transition-all duration-300 overflow-hidden hover:shadow-lg ${
                                            isViewing && isWinner && showResults
                                              ? "border-amber-300 bg-gradient-to-br from-amber-50/50 to-yellow-50/30 ring-2 ring-amber-200"
                                              : "border-gray-200 bg-white"
                                          }`}
                                        >
                                          <div className="p-5">
                                            {/* Enhanced Profile Photo */}
                                            <div className="relative mb-4">
                                              <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden border-4 shadow-xl border-white ring-2 ring-offset-2 ring-blue-100">
                                                {candidate.photoUrl ? (
                                                  <img
                                                    src={candidate.photoUrl}
                                                    alt={candidate.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                                  />
                                                ) : (
                                                  <div className="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center">
                                                    <span className="text-white text-3xl font-bold">
                                                      {getInitials(
                                                        candidate.name
                                                      )}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>

                                              {/* Enhanced Winner Badge */}
                                              {isViewing &&
                                                isWinner &&
                                                showResults && (
                                                  <div className="absolute -top-3 -right-3">
                                                    <div className="relative">
                                                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-sm"></div>
                                                      <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full p-4 shadow-2xl">
                                                        <Crown className="w-6 h-6 text-white" />
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}
                                            </div>

                                            {/* Enhanced Candidate Info */}
                                            <div className="text-center">
                                              <h4 className="font-bold text-gray-900 text-lg mb-3 line-clamp-1">
                                                {candidate.name}
                                              </h4>

                                              {/* Enhanced Votes Display */}
                                              <div className="mb-4">
                                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-2.5 rounded-full border border-blue-100 shadow-sm">
                                                  <BarChart3 className="w-5 h-5 text-blue-600" />
                                                  <span className="font-bold text-blue-700 text-lg">
                                                    {countdown.status ===
                                                      "ended" ||
                                                    revealedPositions[
                                                      position.id
                                                    ] ||
                                                    isPositionVoted(
                                                      position.id
                                                    ) ||
                                                    viewOnly
                                                      ? `${
                                                          typeof candidate.vote_count ===
                                                          "number"
                                                            ? candidate.vote_count
                                                            : typeof candidate.votes ===
                                                              "number"
                                                            ? candidate.votes
                                                            : 0
                                                        } `
                                                      : "? "}
                                                    <span className="text-sm font-medium">
                                                      votes
                                                    </span>
                                                  </span>
                                                </div>
                                              </div>

                                              {/* Percentage Bar - New Feature */}
                                              {isViewing && showResults && (
                                                <div className="mt-3">
                                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                    <span>Vote Share</span>
                                                    <span className="font-bold">
                                                      {typeof candidate.vote_percentage ===
                                                      "number"
                                                        ? `${candidate.vote_percentage}%`
                                                        : "0%"}
                                                    </span>
                                                  </div>
                                                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                      initial={{ width: 0 }}
                                                      animate={{
                                                        width: `${
                                                          typeof candidate.vote_percentage ===
                                                          "number"
                                                            ? candidate.vote_percentage
                                                            : 0
                                                        }%`,
                                                      }}
                                                      transition={{
                                                        duration: 1,
                                                        ease: "easeOut",
                                                      }}
                                                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                                    />
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </motion.div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            ) : (
                              // Enhanced Pre-vote view
                              <div className="flex flex-wrap gap-6 items-start">
                                {position.candidates.map(
                                  (candidate, candidateIndex) => {
                                    const isSelected = candidate.selected;
                                    const isOtherSelected =
                                      hasSelected && !isSelected;

                                    return (
                                      <motion.div
                                        key={candidate.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                          delay: candidateIndex * 0.05,
                                        }}
                                        className={`w-full sm:w-[260px] relative rounded-xl border-2 transition-all duration-300 overflow-hidden hover:shadow-lg ${
                                          isSelected
                                            ? "border-emerald-300 bg-gradient-to-br from-emerald-50/50 to-green-50/30 ring-2 ring-emerald-200"
                                            : isOtherSelected
                                            ? "border-gray-200 bg-gray-50/50 opacity-70"
                                            : "border-gray-200 hover:border-blue-300 bg-white"
                                        }`}
                                      >
                                        <div className="p-5">
                                          {/* Enhanced Profile Photo */}
                                          <div className="relative mb-4">
                                            <div className="w-28 h-28 mx-auto rounded-xl overflow-hidden border-3 shadow-lg border-white ring-2 ring-offset-2 ring-blue-100">
                                              {candidate.photoUrl ? (
                                                <img
                                                  src={candidate.photoUrl}
                                                  alt={candidate.name}
                                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                                />
                                              ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                                  <span className="text-white text-2xl font-bold">
                                                    {getInitials(
                                                      candidate.name
                                                    )}
                                                  </span>
                                                </div>
                                              )}
                                            </div>

                                            {/* Enhanced Selection Badge */}
                                            {isSelected && (
                                              <div className="absolute top-0 right-0">
                                                <div className="relative">
                                                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full blur-sm"></div>
                                                  <div className="relative bg-gradient-to-r from-emerald-500 to-green-600 rounded-full p-3 shadow-lg">
                                                    <Check className="w-5 h-5 text-white" />
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>

                                          {/* Enhanced Candidate Info */}
                                          <div className="text-center">
                                            <h4 className="font-bold text-gray-900 text-lg mb-3 truncate">
                                              {candidate.name}
                                            </h4>

                                            {/* Enhanced Votes Display */}
                                            <div className="mb-4">
                                              {/* <span className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full px-4 py-2 text-sm font-bold"> */}
                                              {/* <BarChart3 className="w-4 h-4 text-gray-600" /> */}
                                              {revealedPositions[position.id] ||
                                              isPositionVoted(position.id) ||
                                              viewOnly
                                                ? `${
                                                    candidate.vote_count ||
                                                    candidate.votes ||
                                                    0
                                                  } votes`
                                                : ""}
                                              {/* </span> */}
                                            </div>

                                            {/* Enhanced Vote Button */}
                                            <motion.button
                                              whileHover={
                                                !isOtherSelected
                                                  ? { scale: 1.05 }
                                                  : {}
                                              }
                                              whileTap={
                                                !isOtherSelected
                                                  ? { scale: 0.95 }
                                                  : {}
                                              }
                                              onClick={() =>
                                                !isOtherSelected &&
                                                handleVote(
                                                  candidate.id,
                                                  position.id
                                                )
                                              }
                                              disabled={isOtherSelected}
                                              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
                                                isSelected
                                                  ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700"
                                                  : isOtherSelected
                                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
                                              }`}
                                            >
                                              {isSelected ? (
                                                <span className="flex items-center justify-center gap-2">
                                                  <Check className="w-4 h-4" />
                                                  Selected
                                                </span>
                                              ) : (
                                                "Vote"
                                              )}
                                            </motion.button>

                                            {/* Enhanced Cancel Selection Button */}
                                            {isSelected && (
                                              <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() =>
                                                  handleClearSelection(
                                                    position.id
                                                  )
                                                }
                                                className="w-full py-3 mt-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold text-sm hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all"
                                              >
                                                <span className="flex items-center justify-center gap-2">
                                                  <X className="w-4 h-4" />
                                                  Cancel Selection
                                                </span>
                                              </motion.button>
                                            )}
                                          </div>
                                        </div>
                                      </motion.div>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )
        )}

        {/* Results View when voting ended - IMPROVED DESIGN */}
        {countdown.status === "ended" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            {/* Hero Section - Smaller */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-20 h-20 mx-auto bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-xl mb-4"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-3xl font-bold text-gray-900 mb-3"
              >
                Election Results
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-base text-gray-600 mb-4"
              >
                {electionData.electionName}
              </motion.p>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "150px" }}
                transition={{ delay: 0.3, duration: 1 }}
                className="h-1 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full mx-auto"
              />
            </div>

            {/* Winners Grid - More Compact */}
            {/* Winners Grid - More Compact */}
            {winnerDetails.length > 0 ? (
              <div
                className={`
      mx-auto
      max-w-7xl
      mb-10
      ${
        winnerDetails.length === 1
          ? "flex justify-center max-w-2xl"
          : winnerDetails.length === 2
          ? "grid grid-cols-1 lg:grid-cols-2 gap-8"
          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      }
    `}
              >
                {winnerDetails.map((winner, index) => {
                  const isTopWinner = index === 0;
                  const totalVotes =
                    typeof winner.Total_Votes === "number"
                      ? winner.Total_Votes
                      : typeof winner.candidate?.vote_count === "number"
                      ? winner.candidate.vote_count
                      : 0;

                  // Add validation to prevent empty objects
                  if (!winner || Object.keys(winner).length === 0) {
                    return null; // Skip empty objects
                  }

                  // Validate that we have a candidate
                  if (!winner.candidate) {
                    return null; // Skip items without candidate data
                  }

                  return (
                    <motion.div
                      key={winner.id || index}
                      initial={{ opacity: 0, y: 16, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.08, duration: 0.35 }}
                      className={`
            relative
            w-full
            max-w-3xl
            rounded-2xl
            overflow-hidden
            bg-white
            ${
              isTopWinner
                ? "border-2 border-emerald-400 shadow-xl"
                : "border border-emerald-200 shadow-lg"
            }
            hover:shadow-2xl
            transition-all
            duration-300
          `}
                    >
                      {/* Card Content */}
                      <div className={`p-6 ${isTopWinner ? "pt-12" : ""}`}>
                        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6">
                          {/* LEFT – PHOTO + VOTES */}
                          <div className="flex flex-col items-center md:items-start">
                            <div className="relative mb-4">
                              <div
                                className={`
                      w-28 h-28 rounded-xl overflow-hidden border-2
                      ${
                        isTopWinner ? "border-green-400" : "border-emerald-400"
                      }
                      shadow-md
                    `}
                              >
                                {winner.candidate?.photoUrl ? (
                                  <img
                                    src={winner.candidate.photoUrl}
                                    alt={winner.candidate.name || "Winner"}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center">
                                    <span className="text-white text-2xl font-bold">
                                      {getInitials(
                                        winner.candidate?.name || "W"
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Trophy */}
                              <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full p-2.5 shadow-lg">
                                <Trophy className="w-5 h-5 text-white" />
                              </div>
                            </div>

                            {/* Votes */}
                            <div className="text-center md:text-left">
                              <div className="text-2xl font-extrabold text-emerald-700">
                                {totalVotes.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 tracking-wide">
                                TOTAL VOTES
                              </div>
                            </div>
                          </div>

                          {/* RIGHT – DETAILS */}
                          <div className="w-full">
                            {/* Position */}
                            <div className="mb-3">
                              <div className="text-xs uppercase tracking-widest text-emerald-700 font-semibold mb-1">
                                Winning Position
                              </div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {typeof winner.election_candidate_position
                                  ?.Position === "string"
                                  ? winner.election_candidate_position.Position
                                  : typeof winner.position_name === "string"
                                  ? winner.position_name
                                  : "Position"}
                              </h3>
                            </div>

                            {/* Candidate */}
                            <div className="mb-5">
                              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
                                {winner.candidate.name || "Unknown Candidate"}
                              </h2>
                              {winner.candidate?.candidate_id && (
                                <div className="text-sm text-gray-500">
                                  Candidate ID:{" "}
                                  <span className="font-medium">
                                    {winner.candidate.candidate_id}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Info Pills */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                              {winner.candidate?.department && (
                                <div className="rounded-xl bg-emerald-50 p-3">
                                  <div className="text-xs text-emerald-700 font-semibold mb-1">
                                    Department
                                  </div>
                                  <div className="text-sm font-bold text-gray-900">
                                    {winner.candidate.department}
                                  </div>
                                </div>
                              )}

                              {winner.candidate?.location && (
                                <div className="rounded-xl bg-blue-50 p-3">
                                  <div className="text-xs text-blue-700 font-semibold mb-1">
                                    Location
                                  </div>
                                  <div className="text-sm font-bold text-gray-900">
                                    {winner.candidate.location}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3">
                              {/* <button
                                onClick={() => setSelectedWinnerProfile(winner)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-md hover:shadow-lg transition-all"
                              >
                                <User className="w-4 h-4" />
                                View Profile
                              </button> */}

                              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800">
                                <Award className="w-4 h-4" />
                                Winner 
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              // No Winners Yet State - Smaller
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 mb-8"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Results Being Finalized
                </h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto mb-4">
                  The winners are being calculated and announced. Please check
                  back shortly for the official results.
                </p>
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-emerald-200">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 text-sm font-medium">
                    Updated:{" "}
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Footer Section - Smaller */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center pt-4 border-t border-gray-200"
            >
              <p className="text-xs text-gray-500">
                Election ended on {formatDateTime(electionData.end_time)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                These results are final and have been verified by the election
                committee.
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Render Winner Profile Modal */}
      <AnimatePresence>
        {selectedWinnerProfile && (
          <WinnerProfileModal
            winner={selectedWinnerProfile}
            onClose={() => setSelectedWinnerProfile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default VotingPage;
