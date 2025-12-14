 import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Vote, CheckCircle, Award, Shield, X, 
  Mail, Calendar, Clock, MapPin, Landmark
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
  const [submittedVotes, setSubmittedVotes] = useState({}); // Track submitted positions
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [currentView, setCurrentView] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // For refresh functionality

  // Create axios instance with auth token
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  // Function to fetch all positions and candidates
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
      
      console.log("📊 Positions API Response:", positionsResponse.data);

      // Transform positions data
      const positionsData = positionsResponse.data.map((position) => ({
        id: position.id,
        name: position.Position,
        position: position.Position,
        submitted: submittedVotes[position.id] || false, // Track if position is submitted
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
          submitted: false,
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
          submitted: false,
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

  // Fetch data on component mount and when refreshKey changes
  useEffect(() => {
    fetchVotingData();
  }, [electionData.electionId, token, refreshKey]);

  const handleVote = (candidateId, positionId) => {
    // Don't allow voting if position is already submitted
    if (submittedVotes[positionId]) return;

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
  };

  const handleSubmitVote = async (positionId, positionName) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    // Check if a candidate is selected
    const selectedCandidate = position.candidates.find(c => c.selected);
    if (!selectedCandidate) {
      alert(`Please select a candidate for ${positionName} before submitting.`);
      return;
    }

    try {
      // Submit vote to backend
      const voteResponse = await axiosInstance.post("/votes", {
        data: {
          candidate: selectedCandidate.id,
          election: electionData.electionId,
          position: positionId,
          voter: "user_id_here", // Replace with actual voter ID
          timestamp: new Date().toISOString(),
        },
      });
      
      console.log(`Vote submitted for ${positionName}:`, voteResponse.data);
      
      // Mark position as submitted
      setSubmittedVotes(prev => ({
        ...prev,
        [positionId]: true
      }));
      
      // Update position status
      const updatedPositions = positions.map(pos => 
        pos.id === positionId 
          ? { ...pos, submitted: true }
          : pos
      );
      setPositions(updatedPositions);

    } catch (error) {
      console.error(`Error submitting vote for ${positionName}:`, error);
      alert("Failed to submit vote. Please try again.");
    }
  };

  const handleProfileClick = (candidate) => {
    // Don't allow profile view if position is submitted
    const candidatePosition = positions.find(position => 
      position.candidates.some(c => c.id === candidate.id)
    );
    
    if (candidatePosition?.submitted) return;
    
    setSelectedProfile(candidate);
    setCurrentView('profile');
  };

  const handleBackToGrid = () => {
    setCurrentView('grid');
    setSelectedProfile(null);
  };

  const handleVoteFromProfile = () => {
    if (selectedProfile) {
      // Find the position for the selected candidate
      const candidatePosition = positions.find(position => 
        position.candidates.some(c => c.id === selectedProfile.id)
      );
      
      if (candidatePosition && !candidatePosition.submitted) {
        handleVote(selectedProfile.id, candidatePosition.id);
        handleBackToGrid();
      }
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
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
            onClick={handleRefresh}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 mt-0 px-3 sm:px-4">
      <div className="max-w-6xl pt-6 sm:pt-8 md:pt-10 mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-8 sm:mb-10 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="font-medium">Refresh</span>
            </button>
            
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 border border-gray-200">
              <Landmark className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">
            {electionData.electionName}
          </h1>

          <div className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto mb-4 sm:mb-6 rounded-full"></div>

          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Select one candidate for each position to cast your vote. You can submit each position individually.
          </p>

          <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
            <div className="bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gray-200 shadow-sm">
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {positions.length} Position{positions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gray-200 shadow-sm">
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {totalCandidates} Candidate{totalCandidates !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gray-200 shadow-sm">
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {Object.values(submittedVotes).filter(Boolean).length} Submitted
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
              className="w-full flex justify-center px-2 sm:px-4"
            >
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 w-full max-w-3xl lg:max-w-4xl">

                {/* Header */}
                <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 sm:p-5 md:p-6">
                  <button
                    onClick={handleBackToGrid}
                    className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-5 md:left-5 bg-white/10 hover:bg-white/20 rounded-full p-1.5 sm:p-2 transition-all"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>

                  <div className="flex flex-col items-center gap-3 sm:gap-4 text-center pt-1">
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 border-white/20 bg-white/10">
                        {selectedProfile.photoUrl ? (
                          <img
                            src={selectedProfile.photoUrl}
                            alt={selectedProfile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg sm:text-xl">
                              {getInitials(selectedProfile.name)}
                            </span>
                          </div>
                        )}
                      </div>

                      {selectedProfile.selected && (
                        <motion.div
                          className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 sm:p-1 border border-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                        </motion.div>
                      )}
                    </div>

                    <div className="flex-1 w-full">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
                        {selectedProfile.name}
                      </h2>
                      <p className="text-blue-200 text-sm sm:text-base md:text-lg font-medium mt-0.5">
                        {selectedProfile.position}
                      </p>

                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-gray-300 text-xs mt-2">
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span className="truncate max-w-[100px] sm:max-w-none">{selectedProfile.location}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>{selectedProfile.experience}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 md:p-6">
                  <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:grid lg:grid-cols-2 lg:gap-4 md:gap-5 lg:space-y-0">

                    {/* Left Side */}
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                          Professional Background
                        </h3>

                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                          {selectedProfile.bio}
                        </p>
                      </div>

                      <div className="space-y-2 sm:space-y-2.5">
                        <div className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 bg-gray-50 border rounded-lg">
                          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-5 text-purple-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-600">Department</p>
                            <p className="text-gray-900 font-medium text-sm truncate">
                              {selectedProfile.department}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 bg-gray-50 border rounded-lg">
                          <Award className="w-3.5 h-3.5 sm:w-4 sm:h-5 text-yellow-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-600">Experience</p>
                            <p className="text-gray-900 font-medium text-sm">
                              {selectedProfile.experience}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                          Contact Information
                        </h3>

                        <div className="space-y-2 sm:space-y-2.5">
                          <div className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 bg-gray-50 border rounded-lg">
                            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-5 text-blue-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-600">Email</p>
                              <p className="text-gray-900 font-medium text-sm truncate">
                                {selectedProfile.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 bg-gray-50 border rounded-lg">
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-5 text-green-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-600">Joined</p>
                              <p className="text-gray-900 font-medium text-sm">
                                {selectedProfile.joinDate}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="space-y-2 pt-1">
                        <motion.button
                          onClick={handleVoteFromProfile}
                          disabled={selectedProfile.selected}
                          className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold text-white text-sm ${selectedProfile.selected
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
                          className="w-full py-2.5 sm:py-3 rounded-lg font-semibold text-gray-700 text-sm border border-gray-300 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200"
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
              className="mb-8 sm:mb-10 md:mb-12"
            >
              {positions.length === 0 ? (
                <div className="w-full text-center py-8 sm:py-10">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Positions Available</h3>
                  <p className="text-gray-600 text-sm sm:text-base">There are no positions registered for this election yet.</p>
                </div>
              ) : (
                <div className="space-y-6 sm:space-y-8">
                  {positions.map((position) => (
                    <motion.div
                      key={position.id}
                      variants={cardVariants}
                      className={`bg-white rounded-xl sm:rounded-2xl shadow-lg border ${position.submitted ? 'border-green-500' : 'border-gray-200'} overflow-hidden`}
                    >
                      {/* Position Header */}
                      <div className="p-4 sm:p-5 md:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center ${position.submitted 
                                ? 'bg-gradient-to-br from-green-100 to-green-200' 
                                : 'bg-gradient-to-br from-blue-100 to-blue-200'
                              }`}>
                              <Award className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${position.submitted ? 'text-green-600' : 'text-blue-600'}`} />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{position.position}</h3>
                                {position.submitted && (
                                  <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium">
                                    ✓ Submitted
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-xs sm:text-sm">
                                {position.candidates.length} candidate{position.candidates.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Position Candidates */}
                      <div className="p-4 sm:p-5 md:p-6">
                        {position.candidates.length === 0 ? (
                          <div className="text-center py-6 sm:py-8">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                              <User className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-sm sm:text-base">No candidates registered for this position yet.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                            {position.candidates.map((candidate) => (
                              <motion.div
                                key={candidate.id}
                                variants={cardVariants}
                                className={`bg-white rounded-lg sm:rounded-xl border hover:shadow-md transition-all duration-300 flex flex-col ${candidate.selected 
                                    ? 'border-green-500 bg-green-50' 
                                    : 'border-gray-200 hover:border-blue-300'
                                  } ${position.submitted ? 'opacity-80' : ''}`}
                              >
                                <div className="p-3 sm:p-4 flex flex-col flex-grow">
                                  {/* Candidate Info */}
                                  <div className="flex flex-col items-center mb-3 sm:mb-4 relative">
                                    <div className={`relative w-32 h-36 sm:w-36 sm:h-40 md:w-40 md:h-44 rounded-lg sm:rounded-xl overflow-hidden border bg-gray-50 shadow mb-2 sm:mb-3 ${candidate.selected ? 'border-green-500' : 'border-gray-200'}`}>
                                      {candidate.photoUrl ? (
                                        <img
                                          src={candidate.photoUrl}
                                          alt={candidate.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                          <span className="text-white font-bold text-xl sm:text-2xl">
                                            {getInitials(candidate.name)}
                                          </span>
                                        </div>
                                      )}

                                      {candidate.selected && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-green-500 rounded-full p-0.5 sm:p-1 shadow-md"
                                        >
                                          <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                                        </motion.div>
                                      )}
                                    </div>

                                    <h4 className="text-base sm:text-lg font-bold text-gray-900 text-center leading-tight">
                                      {candidate.name}
                                    </h4>
                                    <p className="text-blue-600 text-xs sm:text-sm font-medium mt-0.5">
                                      {candidate.position}
                                    </p>

                                    {/* Selection Status */}
                                    <motion.p
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className={`text-xs mt-0.5 font-medium ${candidate.selected ? "text-green-600" : "text-gray-400"}`}
                                    >
                                      {candidate.selected ? "✓ Selected" : "Click to select"}
                                    </motion.p>
                                  </div>

                                  <div className="flex-grow"></div>

                                  {/* Buttons */}
                                  <div className="flex flex-col gap-2 mt-auto">
                                    {!position.submitted ? (
                                      <>
                                        <motion.button
                                          onClick={() => handleVote(candidate.id, position.id)}
                                          disabled={candidate.selected}
                                          whileHover={!candidate.selected ? { scale: 1.02 } : {}}
                                          whileTap={!candidate.selected ? { scale: 0.98 } : {}}
                                          className={`w-full py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-1 ${candidate.selected
                                              ? "bg-emerald-600 text-white border border-emerald-700 cursor-not-allowed"
                                              : "bg-slate-700 text-white hover:bg-slate-800 border border-slate-800"
                                            }`}
                                        >
                                          {candidate.selected ? (
                                            <>
                                              <CheckCircle className="w-3 h-3" />
                                              <span>Selected</span>
                                            </>
                                          ) : (
                                            <>
                                              <Vote className="w-3 h-3" />
                                              <span>Select Candidate</span>
                                            </>
                                          )}
                                        </motion.button>

                                        <motion.button
                                          onClick={() => handleProfileClick(candidate)}
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                          className="w-full py-2 rounded-lg font-semibold text-xs sm:text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all duration-300 flex items-center justify-center gap-1"
                                        >
                                          <User className="w-3 h-3" />
                                          <span>View Details</span>
                                        </motion.button>
                                      </>
                                    ) : (
                                      <div className="text-center py-1.5 px-2 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-700 text-xs font-medium">
                                          ✓ Vote Submitted
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {/* Submit Button for Position */}
                        {!position.submitted && position.candidates.length > 0 && (
                          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                              <div className="text-center sm:text-left">
                                <p className="text-gray-700 font-medium text-sm sm:text-base">
                                  Selected: {position.candidates.find(c => c.selected)?.name || "No candidate selected"}
                                </p>
                                <p className="text-gray-500 text-xs sm:text-sm">
                                  Submit your vote for {position.position} once you've made your selection
                                </p>
                              </div>
                              <motion.button
                                onClick={() => handleSubmitVote(position.id, position.position)}
                                disabled={!position.candidates.some(c => c.selected)}
                                whileHover={position.candidates.some(c => c.selected) ? { scale: 1.05 } : {}}
                                whileTap={position.candidates.some(c => c.selected) ? { scale: 0.95 } : {}}
                                className={`px-6 py-2.5 sm:px-8 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-white text-sm sm:text-base flex items-center gap-1.5 sm:gap-2 ${position.candidates.some(c => c.selected)
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-gray-400 cursor-not-allowed'
                                  }`}
                              >
                                <Vote className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Submit Vote for {position.position}</span>
                              </motion.button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          className="text-center mt-12 sm:mt-14 md:mt-16 pt-6 sm:pt-8 border-t border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-gray-500 text-xs sm:text-sm">
            Secure Voting Platform • Encrypted Ballot System • {new Date().getFullYear()}
          </p>
          <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500"></div>
              <span className="text-xs sm:text-sm text-gray-600">
                Submitted: {Object.values(submittedVotes).filter(Boolean).length}/{positions.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-500"></div>
              <span className="text-xs sm:text-sm text-gray-600">
                Pending: {positions.length - Object.values(submittedVotes).filter(Boolean).length}/{positions.length}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VotingPage;