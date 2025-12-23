// components/ElectionHome.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminNavigate } from "../../utils/adminNavigation";
import axios from "axios";

const ElectionHome = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showSelectionPopup, setShowSelectionPopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [electionName, setElectionName] = useState("");
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const { adminId } = useParams();

  const storedAdminId = localStorage.getItem("adminId");

  // Added a second category for a more realistic dropdown example
  const electionCategories = {
    "Education Based": [
      "School Election",
      "College Election",
      "Class Representative Election",
      "Student Council Election",
      "Department Election",
      "Sports Team Captain Election",
    ],
    "Community & Organization": [
      "Club President Election",
      "Non-Profit Board Election",
      "Homeowners Association (HOA) Election",
      "Employee of the Month",
    ],
  };

  const token = localStorage.getItem("jwt");

  const fetchElections = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://api.regeve.in/api/election-names?populate=*",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setElections(res.data.data || []);
    } catch (err) {
      console.error("Error fetching elections", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleCreateElection = async () => {
    if (!electionName.trim()) return;

    try {
      setCreating(true);

      const res = await axios.post(
        "https://api.regeve.in/api/election-names",
        {
          data: { Election_Name: electionName },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ ALWAYS REFRESH FROM DB
      await fetchElections();
      console.log(
        "Navigating to:",
        `/${adminId}/candidate-dashboard/${res.data.data.documentId}`
      );

      // FIXED: Use adminNavigate function instead of direct navigate
      navigate(`/${adminId}/candidate-dashboard/${res.data.data.documentId}`);

      setShowCreatePopup(false);
      setElectionName("");
    } catch (err) {
      console.error("Create election failed", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteElection = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this election?"))
      return;

    try {
      setDeletingId(documentId);

      await axios.delete(
        `https://api.regeve.in/api/election-names/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ Remove from UI after successful delete
      setElections((prev) => prev.filter((e) => e.documentId !== documentId));
    } catch (err) {
      alert("Failed to delete election");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectElectionType = async (category, type) => {
    try {
      const res = await axios.post(
        "https://api.regeve.in/api/election-names",
        {
          data: {
            Election_Name: type,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const savedElection = res.data.data;

      // Add to UI immediately
      await fetchElections();

      // FIXED: Use adminNavigate function
      navigate(`/${adminId}/candidate-dashboard/${savedElection.documentId}`);

      // No need to set showSelectionPopup since we're navigating away
    } catch (error) {
      console.error("Saving election type failed", error);
    }
  };
  const handleStartSelectedElection = () => {
    if (!selectedCategory) return;

    // You must already have created the election BEFORE this popup
    // So for now, just close popup safely
    setShowSelectionPopup(false);
    setSelectedCategory(null);
  };

  // New function to close popups by clicking the backdrop
  const closePopup = (setter) => (e) => {
    if (e.target === e.currentTarget) {
      setter(false);
      if (setter === setShowCreatePopup) setElectionName("");
      if (setter === setShowSelectionPopup) setSelectedCategory(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 ">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="text-center mx-auto">
          {/* Header Section */}
          <header className="mb-16 mt-20">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-8 tracking-tight">
              Digital Election Platform
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Create and manage secure, transparent elections for schools,
              organizations, and communities with our easy-to-use digital
              platform.
            </p>
          </header>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Start New Election Button */}
            <button
              onClick={() => setShowCreatePopup(true)}
              className="group bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl flex items-center gap-3 w-full sm:w-auto min-w-[240px] justify-center text-lg"
            >
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Start New Election
            </button>

            {/* Dropdown for Select Election */}
            <div className="relative w-full sm:w-auto min-w-[240px]">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="group bg-white text-slate-700 px-8 py-4 rounded-xl border border-slate-300 hover:border-blue-500 transition-all duration-300 font-bold shadow-lg hover:shadow-xl flex items-center gap-3 w-full justify-center text-lg"
              >
                Select Election Type
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${
                    showDropdown ? "rotate-180 text-blue-600" : "text-slate-500"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showDropdown && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-96 overflow-y-auto"
                  onMouseLeave={() => setShowDropdown(false)}
                  role="menu"
                >
                  {Object.entries(electionCategories).map(
                    ([category, types]) => (
                      <div
                        key={category}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <div className="px-4 py-3 bg-slate-100 font-bold text-slate-800 border-b border-slate-200 text-xs uppercase tracking-wider">
                          {category}
                        </div>
                        <ul className="py-1" role="none">
                          {types.map((type) => (
                            <li key={type}>
                              <button
                                onClick={() =>
                                  handleSelectElectionType(category, type)
                                }
                                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200 text-sm text-slate-700 hover:text-blue-700 flex items-center gap-2"
                                role="menuitem"
                              >
                                <span className="text-blue-500">•</span>
                                <div className="font-medium">{type}</div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- My Elections List --- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Section Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            My Elections
          </h2>
          <p className="text-slate-500">
            Manage and monitor your election campaigns
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 text-sm">Loading elections...</p>
            </div>
          </div>
        ) : elections.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2"
                />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">
              No elections created yet
            </p>
          </div>
        ) : (
          /* Election Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election, index) => (
              <div
                key={election.documentId}
                className="relative group bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-sm
               rounded-2xl border border-slate-200/80 p-6
               hover:border-blue-300/50 hover:shadow-2xl hover:shadow-blue-100/50
               transition-all duration-500 ease-out
               hover:-translate-y-2 hover:scale-[1.02]
               animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Accent Bar with subtle animation */}
                <div
                  className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl
                 bg-gradient-to-b from-blue-500 via-blue-400 to-indigo-400
                 group-hover:from-blue-600 group-hover:via-blue-500 group-hover:to-indigo-500
                 transition-all duration-500"
                />

                {/* Floating status indicator */}
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white rounded-full blur-sm"></div>
                    <div className="relative bg-gradient-to-r from-slate-50 to-white rounded-full p-1.5 shadow-lg shadow-slate-200/50">
                      {election.election_status && (
                        <div
                          className={`w-2 h-2 rounded-full animate-pulse
                ${
                  election.election_status === "active"
                    ? "bg-emerald-500"
                    : election.election_status === "scheduled"
                    ? "bg-yellow-500"
                    : "bg-rose-500"
                }`}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                      </div>
                      <h3
                        className="text-xl font-bold text-slate-900 leading-tight line-clamp-2
                       group-hover:text-blue-700 transition-colors duration-300
                       pr-4"
                      >
                        {election.Election_Name}
                      </h3>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1 shrink-0">
                      {/* Status Badge */}
                      {election.election_status && (
                        <div className="relative group/status">
                          <span
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border
                    ${
                      election.election_status === "active"
                        ? "bg-emerald-50/80 text-emerald-700 border-emerald-200/60"
                        : election.election_status === "scheduled"
                        ? "bg-yellow-50/80 text-yellow-700 border-yellow-200/60"
                        : "bg-rose-50/80 text-rose-700 border-rose-200/60"
                    } backdrop-blur-sm shadow-sm`}
                          >
                            {election.election_status === "active" && "Active"}
                            {election.election_status === "scheduled" &&
                              "Scheduled"}
                            {election.election_status === "ended" && "Ended"}
                          </span>
                        </div>
                      )}

                      {/* Delete Button with tooltip */}
                      <div className="relative group/delete">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteElection(election.documentId);
                          }}
                          title="Delete election"
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500
                         bg-gradient-to-b from-slate-50 to-white
                         border border-slate-200/60
                         hover:border-rose-200 hover:bg-gradient-to-b hover:from-rose-50 hover:to-white
                         hover:scale-110 active:scale-95
                         transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          <svg
                            className="w-4.5 h-4.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                        <div className="absolute right-0 top-full mt-2 px-2 py-1 text-xs font-medium text-white bg-slate-900 rounded-md opacity-0 group-hover/delete:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                          Delete Election
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div
                      className="relative overflow-hidden rounded-xl p-4 text-center
                       bg-gradient-to-br from-white to-slate-50
                       border border-slate-200/40
                       group-hover:from-blue-50/80 group-hover:to-blue-100/50
                       transition-all duration-500"
                    >
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-100/20 rounded-full blur-xl"></div>
                      <p className="text-3xl font-black text-slate-900 mb-1">
                        {election.positionsCount ?? 0}
                      </p>
                      <div className="flex items-center justify-center space-x-1">
                        <div className="p-0.5 rounded bg-blue-100/60">
                          <svg
                            className="w-3 h-3 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Positions
                        </p>
                      </div>
                    </div>

                    <div
                      className="relative overflow-hidden rounded-xl p-4 text-center
                       bg-gradient-to-br from-white to-slate-50
                       border border-slate-200/40
                       group-hover:from-indigo-50/80 group-hover:to-indigo-100/50
                       transition-all duration-500"
                    >
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-100/20 rounded-full blur-xl"></div>
                      <p className="text-3xl font-black text-slate-900 mb-1">
                        {election.candidatesCount ?? 0}
                      </p>
                      <div className="flex items-center justify-center space-x-1">
                        <div className="p-0.5 rounded bg-indigo-100/60">
                          <svg
                            className="w-3 h-3 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Candidates
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Meta Information */}
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 rounded bg-slate-100/60">
                          <svg
                            className="w-3.5 h-3.5 text-slate-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <span className="font-medium text-slate-600">
                          Created
                        </span>
                      </div>
                      <span className="text-slate-500 font-medium">
                        {election.createdAt
                          ? new Date(election.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() =>
                      navigate(
                        `/${adminId}/candidate-dashboard/${election.documentId}`
                      )
                    }
                    className="group/btn w-full py-3.5 rounded-xl
                   bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600
                   text-white font-semibold text-sm tracking-wide
                   hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700
                   active:scale-[0.98]
                   transition-all duration-300 ease-out
                   shadow-lg hover:shadow-xl hover:shadow-blue-500/20
                   relative overflow-hidden"
                  >
                    {/* Shine effect */}
                    <div
                      className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full 
                       transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />

                    <div className="relative flex items-center justify-center space-x-2">
                      <span>Open Dashboard</span>
                      <svg
                        className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- Popups --- */}

      {/* Create Election Popup */}
      {showCreatePopup && (
        // Added onClick to backdrop to close the popup
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={closePopup(setShowCreatePopup)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-election-title"
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto border border-slate-200 animate-slide-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3
                  id="create-election-title"
                  className="text-2xl font-bold text-slate-900"
                >
                  Create New Election
                </h3>
                <button
                  onClick={() => {
                    setShowCreatePopup(false);
                    setElectionName("");
                  }}
                  className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center text-2xl leading-none"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              <p className="text-slate-600 mb-6 text-base">
                Enter a name for your new custom election. You can set up roles
                and positions on the next screen.
              </p>

              <input
                type="text"
                value={electionName}
                onChange={(e) => setElectionName(e.target.value)}
                placeholder="e.g., Student Council Election 2024"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white placeholder-slate-400 text-base"
                onKeyPress={(e) => e.key === "Enter" && handleCreateElection()}
                autoFocus
                aria-label="Election Name"
              />

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setShowCreatePopup(false);
                    setElectionName("");
                  }}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors duration-200 font-semibold text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateElection}
                  disabled={!electionName.trim() || creating}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Election"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selection Confirmation Popup */}
      {showSelectionPopup && selectedCategory && (
        // Added onClick to backdrop to close the popup
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={closePopup(setShowSelectionPopup)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-selection-title"
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto border border-slate-200 animate-slide-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3
                  id="confirm-selection-title"
                  className="text-2xl font-bold text-slate-900"
                >
                  Confirm Election Type
                </h3>
                <button
                  onClick={() => {
                    setShowSelectionPopup(false);
                    setSelectedCategory(null);
                  }}
                  className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center text-2xl leading-none"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              <div className="bg-blue-50 rounded-xl p-5 mb-6 border border-blue-200">
                <div className="text-xs text-blue-700 font-bold mb-1 uppercase tracking-widest">
                  Selected Template
                </div>
                <div className="text-xl font-extrabold text-blue-900 mb-1">
                  {selectedCategory.type}
                </div>
                <div className="text-sm text-blue-700">
                  {selectedCategory.category}
                </div>
              </div>

              <p className="text-slate-600 mb-8 text-base leading-relaxed">
                You've selected the **{selectedCategory.type}** template. Click
                **"Start Election"** to proceed to the setup dashboard where you
                can define candidates, positions, and voting rules.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSelectionPopup(false);
                    setSelectedCategory(null);
                  }}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors duration-200 font-semibold text-base"
                >
                  Go Back
                </button>
                <button
                  onClick={handleStartSelectedElection}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-semibold text-base"
                >
                  Start Election
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionHome;
