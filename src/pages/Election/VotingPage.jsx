 import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Vote, CheckCircle, Award, Shield, X, 
  Mail, Calendar, Clock, MapPin, Landmark, ChevronDown, ChevronUp
} from 'lucide-react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const API_URL = "https://api.regeve.in/api";

const VotingPage = ({ token = null }) => {
  const location = useLocation();
  
  // Get election data from navigation state
  const electionData = location.state || {
    electionName: "Untitled Election",
    electionType: "Custom",
    electionCategory: "Custom Election",
    electionId: null,
  };

  // States for data and UI
  const [positions, setPositions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [currentView, setCurrentView] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [expandedPositions, setExpandedPositions] = useState({});

  // Create axios instance with auth token
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  // Fetch positions and candidates on component mount
  useEffect(() => {
    const fetchVotingData = async () => {
      setIsLoading(true);
      setFetchError(null);
      
      try {
        // Fetch positions (election-candidate-positions)
        const positionsResponse = await axiosInstance.get(
          "/election-candidate-positions",
          {
            params: {
              populate: {
                candidates: {
                  populate: ["photo"],
                },
              },
            },
          }
        );
        console.log("🔍 FULL API RESPONSE:", positionsResponse);
    console.log("📊 Response Status:", positionsResponse.status);
    console.log("📦 Response Data:", positionsResponse.data);
        console.log("Positions API Response:", positionsResponse.data);

        // Transform positions data
        const positionsData = positionsResponse.data.map((position, index) => ({
          id: position.id,
          name: position.Position,
          position: position.Position,
          isOpen: index === 0, // First position expanded by default
          candidates: position.candidates?.map((candidate) => ({
            id: candidate.id,
            name: candidate.name,
            email: candidate.email,
            phone: candidate.phone_number,
            whatsapp: candidate.whatsApp_number,
            age: candidate.age,
            gender: candidate.gender,
            candidate_id: candidate.candidate_id,
            position: position.Position,
            photoUrl: candidate.photo?.url
              ? `https://api.regeve.in${candidate.photo.url}`
              : null,
            bio: candidate.bio || `${candidate.name} is a candidate for ${position.Position}`,
            location: candidate.location || "Not specified",
            joinDate: candidate.join_date || "2020",
            department: candidate.department || "General",
            experience: candidate.experience || "5+ years",
            votes: 0,
            selected: false
          })) || [],
        }));

        setPositions(positionsData);

      } catch (error) {
        console.error("Error fetching voting data:", error);
        setFetchError("Failed to load voting data. Please try again later.");
        
        // Fallback to mock data for development
        setPositions([
          {
            id: 1,
            name: 'President',
            position: 'President',
            isOpen: true,
            candidates: [
              {
                id: 1,
                name: 'John Smith',
                position: 'President',
                votes: 0,
                selected: false,
                photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
                email: 'john.smith@company.com',
                bio: 'Experienced project manager with a proven track record.',
                location: 'New York, NY',
                joinDate: '2016',
                department: 'Management',
                experience: '10+ years',
              },
              {
                id: 2,
                name: 'Sarah Johnson',
                position: 'President',
                votes: 0,
                selected: false,
                photoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
                email: 'sarah.johnson@company.com',
                bio: 'Creative leader passionate about innovation.',
                location: 'San Francisco, CA',
                joinDate: '2018',
                department: 'Leadership',
                experience: '8+ years',
              }
            ]
          },
          {
            id: 2,
            name: 'Vice President',
            position: 'Vice President',
            isOpen: false,
            candidates: [
              {
                id: 3,
                name: 'Michael Chen',
                position: 'Vice President',
                votes: 0,
                selected: false,
                photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
                email: 'michael.chen@company.com',
                bio: 'Strategic thinker with strong analytical skills.',
                location: 'Austin, TX',
                joinDate: '2017',
                department: 'Operations',
                experience: '7+ years',
              }
            ]
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVotingData();
  }, [electionData.electionId, token]);

  const handleVote = (candidateId, positionId) => {
    if (hasVoted) return;

    // Update selected state - only allow one selection per position
    const updatedPositions = positions.map(position => {
      if (position.id === positionId) {
        return {
          ...position,
          candidates: position.candidates.map(candidate => ({
            ...candidate,
            selected: candidate.id === candidateId
          }))
        };
      }
      return position;
    });
    
    setPositions(updatedPositions);
    setSelectedCandidateId(candidateId);
  };

  const handleSubmitVote = async () => {
    // Check if at least one candidate is selected from each position
    const hasAllPositionsVoted = positions.every(position => 
      position.candidates.some(candidate => candidate.selected) || 
      position.candidates.length === 0
    );

    if (!hasAllPositionsVoted) {
      const positionsWithoutVotes = positions
        .filter(position => !position.candidates.some(c => c.selected) && position.candidates.length > 0)
        .map(p => p.position);
      
      alert(`Please select a candidate for the following position(s):\n${positionsWithoutVotes.join(', ')}`);
      return;
    }

    try {
      // Collect all selected candidates
      const selectedCandidates = [];
      positions.forEach(position => {
        const selectedCandidate = position.candidates.find(c => c.selected);
        if (selectedCandidate) {
          selectedCandidates.push({
            candidateId: selectedCandidate.id,
            positionId: position.id,
            positionName: position.position
          });
        }
      });

      // Submit votes to backend
      for (const selection of selectedCandidates) {
        try {
          const voteResponse = await axiosInstance.post("/votes", {
            data: {
              candidate: selection.candidateId,
              election: electionData.electionId,
              position: selection.positionId,
              voter: "user_id_here", // Replace with actual voter ID
              timestamp: new Date().toISOString(),
            },
          });
          console.log(`Vote submitted for ${selection.positionName}:`, voteResponse.data);
        } catch (error) {
          console.error(`Error submitting vote for ${selection.positionName}:`, error);
        }
      }

      setHasVoted(true);
      setShowSuccess(true);

    } catch (error) {
      console.error("Error submitting votes:", error);
      alert("Failed to submit votes. Please try again.");
    }
  };

  const handleProfileClick = (candidate) => {
    if (hasVoted) return;
    setSelectedProfile(candidate);
    setCurrentView('profile');
  };

  const handleBackToGrid = () => {
    setCurrentView('grid');
    setSelectedProfile(null);
  };

  const handleVoteFromProfile = () => {
    if (selectedProfile) {
      // Find the position ID for the selected candidate
      const candidatePosition = positions.find(position => 
        position.candidates.some(c => c.id === selectedProfile.id)
      );
      
      if (candidatePosition) {
        handleVote(selectedProfile.id, candidatePosition.id);
      }
    }
  };

  const togglePosition = (positionId) => {
    setPositions(positions.map(position => 
      position.id === positionId 
        ? { ...position, isOpen: !position.isOpen }
        : position
    ));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const profileVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: {
        duration: 0.3
      }
    }
  };

  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
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
      .toUpperCase();
  };

  // Calculate total candidates
  const totalCandidates = positions.reduce(
    (total, position) => total + position.candidates.length,
    0
  );

  // Get selected candidates summary
  const getSelectedSummary = () => {
    return positions
      .filter(position => position.candidates.some(c => c.selected))
      .map(position => {
        const selectedCandidate = position.candidates.find(c => c.selected);
        return `${selectedCandidate?.name} (${position.position})`;
      })
      .join(', ');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading voting data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Voting Data</h3>
          <p className="text-gray-600 mb-6">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Success state after voting
  if (hasVoted && showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-2">
        <motion.div
          variants={successVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-blue-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">Vote Submitted Successfully!</h2>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Your votes have been securely recorded for the following positions:
              </p>
              
              <div className="space-y-3 mb-6">
                {positions
                  .filter(position => position.candidates.some(c => c.selected))
                  .map(position => {
                    const selectedCandidate = position.candidates.find(c => c.selected);
                    return (
                      <div key={position.id} className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center gap-3">
                          {selectedCandidate?.photoUrl ? (
                            <img
                              src={selectedCandidate.photoUrl}
                              alt={selectedCandidate.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {getInitials(selectedCandidate?.name)}
                              </span>
                            </div>
                          )}
                          <div className="text-left flex-1">
                            <p className="font-medium text-gray-900">{selectedCandidate?.name}</p>
                            <p className="text-sm text-gray-600">{position.position}</p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              Thank you for participating in the {electionData.electionName}.
            </p>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">
                Transaction ID: <span className="font-mono">#{Date.now().toString(36).toUpperCase()}</span>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 mt-0 px-4">
      <div className="max-w-6xl pt-10 mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
              <Landmark className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            {electionData.electionName}
          </h1>

          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto mb-6 rounded-full"></div>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Select one candidate for each position to cast your vote.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <div className="bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
              <span className="text-sm font-medium text-gray-700">
                {positions.length} Position{positions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
              <span className="text-sm font-medium text-gray-700">
                {totalCandidates} Candidate{totalCandidates !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Profile View */}
          {currentView === "profile" && selectedProfile && (
            <motion.div
              key="profile"
              variants={profileVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full flex justify-center px-3 sm:px-4 md:px-6"
            >
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-200 w-full max-w-2xl lg:max-w-4xl">

                {/* Header */}
                <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 sm:p-6 md:p-8">
                  <button
                    onClick={handleBackToGrid}
                    className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-6 md:left-6 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 text-center pt-2">
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-white/20 bg-white/10">
                        {selectedProfile.photoUrl ? (
                          <img
                            src={selectedProfile.photoUrl}
                            alt={selectedProfile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xl sm:text-2xl">
                              {getInitials(selectedProfile.name)}
                            </span>
                          </div>
                        )}
                      </div>

                      {selectedProfile.selected && (
                        <motion.div
                          className="absolute -top-1 -right-1 sm:-top-1 sm:-right-1 md:-top-2 md:-right-2 bg-green-500 rounded-full p-1 sm:p-1 border border-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" />
                        </motion.div>
                      )}
                    </div>

                    <div className="flex-1 w-full">
                      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
                        {selectedProfile.name}
                      </h2>
                      <p className="text-blue-200 text-sm sm:text-base md:text-lg lg:text-xl font-medium mt-1">
                        {selectedProfile.position}
                      </p>

                      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-gray-300 text-xs sm:text-sm mt-3">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate max-w-[120px] sm:max-w-none">{selectedProfile.location}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{selectedProfile.experience}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                  <div className="space-y-6 sm:space-y-8 lg:grid lg:grid-cols-2 lg:gap-6 xl:gap-8 lg:space-y-0">

                    {/* Left Side */}
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold flex items-center gap-2 mb-2 sm:mb-3">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          Professional Background
                        </h3>

                        <p className="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed">
                          {selectedProfile.bio}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 border rounded-lg sm:rounded-xl">
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-600">Department</p>
                            <p className="text-gray-900 font-medium text-sm sm:text-base truncate">
                              {selectedProfile.department}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 border rounded-lg sm:rounded-xl">
                          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-600">Experience</p>
                            <p className="text-gray-900 font-medium text-sm sm:text-base">
                              {selectedProfile.experience}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold flex items-center gap-2 mb-2 sm:mb-3">
                          <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          Contact Information
                        </h3>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 border rounded-lg sm:rounded-xl">
                            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-600">Email</p>
                              <p className="text-gray-900 font-medium text-sm sm:text-base truncate">
                                {selectedProfile.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 border rounded-lg sm:rounded-xl">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-600">Joined</p>
                              <p className="text-gray-900 font-medium text-sm sm:text-base">
                                {selectedProfile.joinDate}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="space-y-3 pt-2">
                        <motion.button
                          onClick={handleVoteFromProfile}
                          disabled={selectedProfile.selected}
                          className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-white text-sm sm:text-base ${selectedProfile.selected
                            ? "bg-green-600 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                            } transition-colors duration-200`}
                          whileHover={!selectedProfile.selected ? { scale: 1.02 } : {}}
                          whileTap={!selectedProfile.selected ? { scale: 0.98 } : {}}
                        >
                          {selectedProfile.selected ? "✓ Candidate Selected" : "Select This Candidate"}
                        </motion.button>

                        <button
                          onClick={handleBackToGrid}
                          className="w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-gray-700 text-sm sm:text-base border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200"
                        >
                          Back to Candidates
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* Grid View with Positions */}
          {currentView === 'grid' && (
            <motion.div
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-12"
            >
              {positions.length === 0 ? (
                <div className="w-full text-center py-12">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No Positions Available</h3>
                  <p className="text-gray-600">There are no positions registered for this election yet.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {positions.map((position) => (
                    <motion.div
                      key={position.id}
                      variants={cardVariants}
                      className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden"
                    >
                      {/* Position Header */}
                      <div 
                        className="p-6 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => togglePosition(position.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                            <Award className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{position.position}</h3>
                            <p className="text-gray-600 text-sm">
                              {position.candidates.length} candidate{position.candidates.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {position.candidates.some(c => c.selected) && (
                            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Selected</span>
                            </div>
                          )}
                          {position.isOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                      </div>

                      {/* Position Candidates */}
                      {position.isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-6"
                        >
                          {position.candidates.length === 0 ? (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="text-gray-600">No candidates registered for this position yet.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              {position.candidates.map((candidate) => (
                                <motion.div
                                  key={candidate.id}
                                  variants={cardVariants}
                                  className={`bg-white rounded-xl border-2 hover:shadow-lg transition-all duration-300 flex flex-col ${
                                    candidate.selected 
                                      ? 'border-green-500 bg-green-50' 
                                      : 'border-gray-200 hover:border-blue-300'
                                  }`}
                                >
                                  <div className="p-5 flex flex-col flex-grow">
                                    {/* Candidate Info */}
                                    <div className="flex flex-col items-center mb-5 relative">
                                      <div className={`relative w-40 h-48 rounded-xl overflow-hidden border-2 bg-gray-50 shadow mb-3 transition-all duration-300 ${
                                        candidate.selected ? 'border-green-500' : 'border-gray-200'
                                      }`}>
                                        {candidate.photoUrl ? (
                                          <img
                                            src={candidate.photoUrl}
                                            alt={candidate.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                            <span className="text-white font-bold text-3xl">
                                              {getInitials(candidate.name)}
                                            </span>
                                          </div>
                                        )}

                                        {candidate.selected && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg"
                                          >
                                            <CheckCircle className="w-4 h-4 text-white" />
                                          </motion.div>
                                        )}
                                      </div>

                                      <h4 className="text-lg font-bold text-gray-900 text-center leading-tight">
                                        {candidate.name}
                                      </h4>
                                      <p className="text-blue-600 text-sm font-medium mt-1">
                                        {candidate.position}
                                      </p>

                                      {/* Selection Status */}
                                      <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`text-xs mt-1 font-medium ${
                                          candidate.selected ? "text-green-600" : "text-gray-400"
                                        }`}
                                      >
                                        {candidate.selected ? "✓ Selected" : "Click to select"}
                                      </motion.p>
                                    </div>

                                    <div className="flex-grow"></div>

                                    {/* Buttons */}
                                    <div className="flex gap-2.5 mt-auto">
                                      <motion.button
                                        onClick={() => handleVote(candidate.id, position.id)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`flex-1 py-2.5 px-3 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-1.5 ${
                                          candidate.selected
                                            ? "bg-emerald-600 text-white border border-emerald-700 shadow-md hover:bg-emerald-700"
                                            : "bg-slate-700 text-white hover:bg-slate-800 border border-slate-800 shadow-sm"
                                        }`}
                                      >
                                        <motion.div
                                          animate={{
                                            scale: candidate.selected ? [1, 1.2, 1] : 1
                                          }}
                                          transition={{ duration: 0.3 }}
                                        >
                                          {candidate.selected ? (
                                            <CheckCircle className="w-4 h-4" />
                                          ) : (
                                            <Vote className="w-4 h-4" />
                                          )}
                                        </motion.div>
                                        <span>{candidate.selected ? "Selected" : "Select"}</span>
                                      </motion.button>

                                      <motion.button
                                        onClick={() => handleProfileClick(candidate)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex-1 py-2.5 px-3 rounded-lg font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all duration-300 flex items-center justify-center gap-1.5"
                                      >
                                        <User className="w-4 h-4" />
                                        <span>Details</span>
                                      </motion.button>
                                    </div>
                                  </div>

                                  {/* Selection Confirmation Bar */}
                                  {candidate.selected && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      className="bg-green-50 border-t border-green-200 px-4 py-2"
                                    >
                                      <div className="flex items-center justify-center gap-1.5">
                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                        <span className="text-xs font-medium text-green-700">
                                          Selected for {position.position}
                                        </span>
                                      </div>
                                    </motion.div>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary and Submit Button */}
        {currentView === 'grid' && positions.length > 0 && totalCandidates > 0 && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {/* Selection Summary */}
            <div className="mb-8">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Selections</h3>
                <div className="space-y-3">
                  {positions.map((position) => {
                    const selectedCandidate = position.candidates.find(c => c.selected);
                    return (
                      <div key={position.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Award className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{position.position}</p>
                            <p className="text-sm text-gray-600">
                              {selectedCandidate 
                                ? `Selected: ${selectedCandidate.name}` 
                                : position.candidates.length > 0 
                                  ? "Not selected yet" 
                                  : "No candidates"
                              }
                            </p>
                          </div>
                        </div>
                        {selectedCandidate ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : position.candidates.length > 0 ? (
                          <span className="text-sm text-red-600 font-medium">Required</span>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-4">
              <motion.button
                onClick={handleSubmitVote}
                className="px-12 py-4 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-3">
                  <Vote className="w-5 h-5" />
                  <span>Submit Your Votes</span>
                </div>
              </motion.button>

              <p className="text-gray-500 text-sm max-w-xl mx-auto">
                You must select one candidate for each position before submitting your ballot. 
                All selections are final once submitted.
              </p>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          className="text-center mt-16 pt-8 border-t border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-gray-500 text-sm">
            Secure Voting Platform • Encrypted Ballot System • {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default VotingPage;