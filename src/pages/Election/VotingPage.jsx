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

  const [forceUpdate, setForceUpdate] = useState(0);
  const [tick, setTick] = useState(0);
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

  const countdownRef = useRef(null);
  const lastStatusRef = useRef("pending");

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
      const response = await axios.get(`${API_URL}/server-time`);
      if (response.data && response.data.serverTime) {
        const serverTime = new Date(response.data.serverTime).getTime();
        const clientTime = Date.now();
        setServerTimeOffset(serverTime - clientTime);
        return serverTime;
      }
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

  // Update countdown and check status changes
  const updateCountdown = useCallback(() => {
    const newCountdown = calculateCountdown();
    setCountdown(newCountdown);

    // Check if status changed
    if (lastStatusRef.current !== newCountdown.status) {
      console.log(
        `Status changed from ${lastStatusRef.current} to ${newCountdown.status}`
      );

      if (
        newCountdown.status === "active" &&
        lastStatusRef.current === "pending"
      ) {
        // Voting just started
        console.log("VOTING STARTED! Showing voting UI...");
        setHasVotingStarted(true);
        setShowCountdownPopup(false);

        // Force re-render to show voting UI
        setRefreshKey((prev) => prev + 1);

        // Play notification sound or show alert
        if (Notification.permission === "granted") {
          new Notification("Voting Started!", {
            body: `Voting for ${electionData.electionName} has started!`,
            icon: "/voting-icon.png",
          });
        }

        // Show alert for testing
        alert(
          `🎉 Voting for "${electionData.electionName}" has started! You can now vote.`
        );
      }

      if (
        newCountdown.status === "ended" &&
        lastStatusRef.current === "active"
      ) {
        // Voting just ended
        console.log("VOTING ENDED! Showing results...");
        setHasVotingEnded(true);
        setShowResults(true);
        setViewOnly(true);

        // Force fetch winners
        if (electionIdFromApi) {
          fetchWinners();
        }

        // Play notification sound or show alert
        if (Notification.permission === "granted") {
          new Notification("Voting Ended!", {
            body: `Voting for ${electionData.electionName} has ended. Results are available.`,
            icon: "/voting-icon.png",
          });
        }

        // Show alert for testing
        alert(
          `⏰ Voting for "${electionData.electionName}" has ended. Results are now available.`
        );
      }

      lastStatusRef.current = newCountdown.status;
    }

    // Auto-hide countdown popup when voting starts
    if (newCountdown.status === "active" && showCountdownPopup) {
      setShowCountdownPopup(false);
    }

    return newCountdown;
  }, [
    calculateCountdown,
    electionData.electionName,
    electionIdFromApi,
    showCountdownPopup,
  ]);

  // Start countdown interval
  const startCountdownInterval = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    const interval = setInterval(() => {
      const newCountdown = updateCountdown();

      // Check if we need to stop the interval
      if (newCountdown.status === "ended" && newCountdown.totalSeconds <= 0) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    }, 1000);

    countdownRef.current = interval;
    setTimeInterval(interval);
    return interval;
  }, [updateCountdown]);

  // Check if user has completed all votes
  const checkIfCompletedAllVotes = useCallback(() => {
    if (!positions.length) return false;

    const allPositionsVoted = positions.every(
      (position) => votedPositions[position.id] || submittedVotes[position.id]
    );

    if (allPositionsVoted) {
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

        // Get server time for sync
        await getServerTime();

        // Calculate initial countdown
        const initialCountdown = calculateCountdown();
        setCountdown(initialCountdown);
        lastStatusRef.current = initialCountdown.status;

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

  // Force countdown update every second when active
  useEffect(() => {
    if (countdown.status === "active") {
      const timer = setInterval(() => {
        setForceUpdate((prev) => prev + 1);
        updateCountdown();
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdown.status, updateCountdown]);

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

  // Ensure countdown updates every second when pending
  useEffect(() => {
    if (countdown.status === "pending" && !isVerified) {
      const interval = setInterval(() => {
        updateCountdown();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [countdown.status, isVerified, updateCountdown]);

  // Also ensure startCountdownInterval is called when data loads
  useEffect(() => {
    if (
      electionData.start_time &&
      electionData.end_time &&
      countdown.status === "pending"
    ) {
      startCountdownInterval();
    }
  }, [
    electionData.start_time,
    electionData.end_time,
    countdown.status,
    startCountdownInterval,
  ]);

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
        setShowResults(true);
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
          name: position.Position || position.position || "Unknown Position",
          position:
            position.Position || position.position || "Unknown Position",
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
              votes: candidate.votes || Math.floor(Math.random() * 100) + 20,
              selected: false,
              isWinner: false,
            };
          }),
        };
      });

      setPositions(positionsData);

      // Start the countdown interval after data is loaded
      startCountdownInterval();

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
    if (documentId) {
      fetchVotingData();
    }
  }, [documentId, fetchVotingData]);

  // Fetch winners when election ends
  useEffect(() => {
    if (hasVotingEnded && electionIdFromApi && !Object.keys(winners).length) {
      fetchWinners();
    }
  }, [hasVotingEnded, electionIdFromApi, winners, fetchWinners]);

  // Update positions with winners
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
    if (!participantData) {
      alert("Please verify your phone number first");
      return;
    }

    if (viewOnly) {
      alert("You have already completed voting.");
      return;
    }

    if (countdown.status !== "active") {
      alert("Voting is not active at this moment.");
      return;
    }

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
      const voteData = {
        candidate_id: selectedCandidate.id,
        position_id: positionId,
        position_name: positionName,
        candidate_name: selectedCandidate.name,
        election_document_id: documentId,
      };

      const response = await axios.put(
        `${API_URL}/election-participants/${participantDocumentId}`,
        { data: voteData }
      );

      if (response.data.success) {
        const result = response.data.data;

        const updatedVotes = { ...votedPositions, [positionId]: true };
        setVotedPositions(updatedVotes);
        setCurrentVotedPosition(positionName);

        localStorage.setItem(
          `votedPositions_${documentId}`,
          JSON.stringify(updatedVotes)
        );

        // Update positions state
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

        // Clear selection
        handleClearSelection(positionId);

        // Check if all votes completed
        const allCompleted = checkIfCompletedAllVotes();

        // Show popup after a short delay to allow state updates
        setTimeout(() => {
          if (!allCompleted) {
            setShowThankYouPopup(true);

            // Auto-close after 5 seconds
            setTimeout(() => {
              setShowThankYouPopup(false);
            }, 5000);
          }
        }, 300);
      }
    } catch (error) {
      console.error("Error submitting vote:", error.response || error);

      if (error.response?.status === 400) {
        alert(
          error.response.data?.message ||
            "You have already voted for this position"
        );
        const updatedVotes = { ...votedPositions, [positionId]: true };
        setVotedPositions(updatedVotes);
        localStorage.setItem(
          `votedPositions_${documentId}`,
          JSON.stringify(updatedVotes)
        );

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
    if (hasCompleted === "true") {
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
                  key={`hours-${forceUpdate}`}
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
                  key={`minutes-${forceUpdate}`}
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
                  key={`seconds-${forceUpdate}`}
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
        <div className="bg-gradient-to-r from-red-500 via-pink-600 to-rose-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Trophy className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg md:text-xl mb-1">
                  Voting Has Ended
                </h3>
                <p className="text-red-100 text-sm md:text-base">
                  Election closed at {formatDateTime(electionData.end_time)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setShowResults(true);
                  if (!Object.keys(winners).length && electionIdFromApi) {
                    fetchWinners();
                  }
                }}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
              >
                View Results
              </button>
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
          <p className="text-gray-600 text-center mb-2">{fetchError}</p>
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
        {/* Show message if voting hasn't started or has ended */}
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

        {countdown.status === "ended" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-6 text-center border-2 border-gray-200"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Voting Has Ended
            </h3>
            <p className="text-gray-600 mb-4">
              Voting ended on {formatDateTime(electionData.end_time)}
            </p>
            <button
              onClick={() => {
                setShowResults(true);
                if (!Object.keys(winners).length && electionIdFromApi) {
                  fetchWinners();
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              View Election Results
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
            <div className="space-y-6">
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
                    className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all duration-300 ${
                      isVoted
                        ? "border-emerald-200/50 bg-gradient-to-br from-emerald-50/20 to-white"
                        : "border-gray-200/50"
                    }`}
                  >
                    {/* Position Header */}
                    {/* Position Header */}
                    <div
                      className={`px-6 py-4 transition-all duration-300 ${
                        isVoted
                          ? "bg-gradient-to-r from-emerald-50/80 to-white"
                          : "bg-gradient-to-r from-blue-50/80 to-white"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        {/* Position Info - Left Side */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isVoted
                                ? "bg-gradient-to-br from-emerald-100 to-green-100"
                                : "bg-gradient-to-br from-blue-100 to-indigo-100"
                            }`}
                          >
                            {isVoted ? (
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Award className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {position.position}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {position.candidates.length} candidate
                              {position.candidates.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons - Dynamic Positioning */}
                        <div
                          className={`flex items-center gap-3 w-full md:w-auto ${
                            isViewing
                              ? "justify-end" // Right aligned when viewing
                              : "justify-end"
                          }`}
                        >
                          {/* Submit Vote Button */}
                          {!viewOnly && !isVoted && hasSelected && (
                            <button
                              onClick={() =>
                                handleSubmitVote(position.id, position.position)
                              }
                              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                            >
                              Submit Vote
                            </button>
                          )}

                          {/* View/Close Buttons */}
                          {isVoted && (
                            <>
                              {isViewing ? (
                                <button
                                  onClick={() => setViewingPosition(null)}
                                  className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group -mt-1 sm:mt-0"
                                >
                                  <X className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
                                  <span className="text-sm sm:text-base">
                                    Close View
                                  </span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setViewingPosition(position.id);
                                  }}
                                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                                >
                                  <BarChart3 className="w-5 h-5 transition-transform group-hover:scale-110" />
                                  <span>View Votes</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Candidates Grid */}
                    <div className="p-4 sm:p-6">
                      {isVoted ? (
                        // Post-vote view
                        <div
                          className={`relative ${
                            !isViewing
                              ? "filter blur-sm pointer-events-none"
                              : ""
                          }`}
                        >
                          <div
                            className={`grid grid-cols-2 gap-3 sm:gap-4 ${
                              position.candidates.length === 1
                                ? "max-w-xs mx-auto grid-cols-1"
                                : position.candidates.length === 2
                                ? "sm:grid-cols-2"
                                : position.candidates.length === 3
                                ? "sm:grid-cols-2 lg:grid-cols-3"
                                : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
                                    className={`relative rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                                      isViewing && isWinner && showResults
                                        ? "border-amber-300 bg-gradient-to-br from-amber-50/50 to-yellow-50/30 shadow-lg"
                                        : "border-gray-200 bg-white"
                                    }`}
                                  >
                                    <div className="p-5">
                                      {/* Profile Photo with Better Styling */}
                                      <div className="relative mb-4">
                                        <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden border-3 shadow-xl border-white ring-2 ring-offset-2 ring-blue-100">
                                          {candidate.photoUrl ? (
                                            <img
                                              src={candidate.photoUrl}
                                              alt={candidate.name}
                                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                            />
                                          ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center">
                                              <span className="text-white text-3xl font-bold">
                                                {getInitials(candidate.name)}
                                              </span>
                                            </div>
                                          )}
                                        </div>

                                        {/* Winner Badge - Improved */}
                                        {isViewing &&
                                          isWinner &&
                                          showResults && (
                                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full p-3 shadow-2xl animate-pulse">
                                              <Crown className="w-5 h-5 text-white" />
                                            </div>
                                          )}
                                      </div>

                                      {/* Candidate Info - Improved */}
                                      <div className="text-center">
                                        <h4 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
                                          {candidate.name}
                                        </h4>

                                        {/* Votes Display - More Prominent */}
                                        <div className="mb-4">
                                          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-100">
                                            <BarChart3 className="w-4 h-4 text-blue-600" />
                                            <span className="font-bold text-blue-700 text-base">
                                              {candidate.votes} votes
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      ) : (
                        // Pre-vote view
                        <div
                          className={`flex flex-wrap justify-center gap-4 ${
                            position.candidates.length === 1
                              ? "max-w-xs mx-auto"
                              : position.candidates.length === 2
                              ? "grid grid-cols-1 sm:grid-cols-2"
                              : position.candidates.length === 3
                              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                          }`}
                        >
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
                                  transition={{ delay: candidateIndex * 0.05 }}
                                  className={`relative rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                                    isSelected
                                      ? "border-emerald-300 bg-gradient-to-br from-emerald-50/50 to-green-50/30 shadow-lg"
                                      : isOtherSelected
                                      ? "border-gray-200 bg-gray-50/50 opacity-70"
                                      : "border-gray-200 hover:border-blue-300 hover:shadow-md bg-white"
                                  }`}
                                >
                                  <div className="p-4">
                                    {/* Profile Photo */}
                                    <div className="relative mb-3">
                                      <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden border-2 shadow-lg">
                                        {candidate.photoUrl ? (
                                          <img
                                            src={candidate.photoUrl}
                                            alt={candidate.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                            <span className="text-white text-2xl font-bold">
                                              {getInitials(candidate.name)}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Selection Badge */}
                                      {isSelected && (
                                        <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full p-2 shadow-lg">
                                          <Check className="w-4 h-4 text-white" />
                                        </div>
                                      )}
                                    </div>

                                    {/* Candidate Info */}
                                    <div className="text-center">
                                      <h4 className="font-bold text-gray-900 text-base mb-1 truncate">
                                        {candidate.name}
                                      </h4>

                                      <div className="mb-3">
                                        <span className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full px-3 py-1 text-sm font-bold">
                                          {candidate.votes} votes
                                        </span>
                                      </div>

                                      {/* Vote Button */}
                                      <button
                                        onClick={() =>
                                          !isOtherSelected &&
                                          handleVote(candidate.id, position.id)
                                        }
                                        disabled={isOtherSelected}
                                        className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                                          isSelected
                                            ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md"
                                            : isOtherSelected
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg"
                                        }`}
                                      >
                                        {isSelected ? "Selected ✓" : "Vote"}
                                      </button>

                                      {/* Cancel Selection Button */}
                                      {isSelected && (
                                        <button
                                          onClick={() =>
                                            handleClearSelection(position.id)
                                          }
                                          className="w-full py-2 mt-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold text-sm hover:from-red-600 hover:to-red-700 shadow-md"
                                        >
                                          Cancel
                                        </button>
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

                    {/* Winner Announcement (shown when voting ended) */}
                    {countdown.status === "ended" && winners[position.id] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 mx-4 mb-4 p-4 bg-gradient-to-r from-amber-50 via-yellow-50/50 to-amber-50 rounded-xl border-2 border-amber-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg p-2">
                              <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">
                                Winner Announced!
                              </h4>
                              <p className="text-gray-700">
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
                          <div className="text-right">
                            <p className="text-gray-600 text-sm">Total Votes</p>
                            <p className="text-amber-700 font-bold text-xl">
                              {position.candidates.find(
                                (c) => c.id === winners[position.id]
                              )?.votes || 0}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )
        )}

        {/* Results View when voting ended */}
        {countdown.status === "ended" &&
          showResults &&
          Object.keys(winners).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl shadow-lg p-8 mb-6 border-2 border-amber-200"
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mb-4">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Election Results
                </h3>
                <p className="text-gray-600">
                  Final results for {electionData.electionName}
                </p>
              </div>

              <div className="space-y-6">
                {positions.map((position) => {
                  const winnerCandidate = position.candidates.find(
                    (c) => winners[position.id] === c.id
                  );

                  if (!winnerCandidate) return null;

                  return (
                    <div
                      key={position.id}
                      className="bg-white rounded-xl p-6 border border-amber-100 shadow-md"
                    >
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-shrink-0">
                          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-amber-300 shadow-lg">
                            {winnerCandidate.photoUrl ? (
                              <img
                                src={winnerCandidate.photoUrl}
                                alt={winnerCandidate.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                                <span className="text-white text-3xl font-bold">
                                  {getInitials(winnerCandidate.name)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <div className="mb-4">
                            <h4 className="text-2xl font-bold text-gray-900">
                              {position.position}
                            </h4>
                            <div className="inline-block mt-2 px-4 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full font-bold">
                              Winner
                            </div>
                          </div>
                          <h3 className="text-3xl font-bold text-amber-700 mb-2">
                            {winnerCandidate.name}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm text-gray-600">
                                Total Votes
                              </p>
                              <p className="text-2xl font-bold text-gray-900">
                                {winnerCandidate.votes}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm text-gray-600">
                                Department
                              </p>
                              <p className="text-lg font-semibold text-gray-900">
                                {winnerCandidate.department}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm text-gray-600">Location</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {winnerCandidate.location}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
      </div>
    </div>
  );
};

export default VotingPage;
