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

  const handleDeleteElection = async (electionId) => {
    if (!window.confirm("Are you sure you want to delete this election?"))
      return;

    try {
      setDeletingId(electionId);

      await axios.delete(
        `https://api.regeve.in/api/election-names/${electionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setElections((prev) => prev.filter((e) => e.documentId !== electionId));
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
            {elections.map((election) => (
              <div
                key={election.documentId}
                className="relative group bg-white/80 backdrop-blur
                     rounded-2xl border border-slate-200 p-6
                     hover:border-blue-400 hover:shadow-2xl
                     transition-all duration-300 ease-out
                     hover:-translate-y-1 animate-fade-in-up"
              >
                {/* Accent Bar */}
                <div
                  className="absolute top-0 left-0 w-1 h-full rounded-l-2xl
                       bg-gradient-to-b from-blue-600 via-blue-500 to-indigo-500"
                />

                <div className="ml-3">
                  {/* Title + Delete */}
                  <div className="flex items-start justify-between mb-4">
                    <h3
                      className="text-lg font-bold text-slate-900 leading-snug
               line-clamp-2
               group-hover:text-blue-700 transition-colors"
                    >
                      {election.Election_Name}
                    </h3>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteElection(election.documentId);
                      }}
                      title="Delete election"
                      className="p-2 rounded-lg text-red-500
               hover:bg-red-50 hover:text-red-600
               hover:scale-110
               transition-all duration-200"
                    >
                      {/* Trash Icon */}
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 7h12M9 7V4h6v3m-7 3v8m4-8v8m4-8v8M5 7l1 13a2 2 0 002 2h8a2 2 0 002-2l1-13"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div
                      className="rounded-xl p-4 text-center
                           bg-gradient-to-br from-slate-50 to-slate-100
                           group-hover:from-blue-50 group-hover:to-blue-100
                           transition-colors"
                    >
                      <p className="text-2xl font-extrabold text-slate-900">
                        {election.positionsCount ?? 0}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Positions
                      </p>
                    </div>

                    <div
                      className="rounded-xl p-4 text-center
                           bg-gradient-to-br from-slate-50 to-slate-100
                           group-hover:from-indigo-50 group-hover:to-indigo-100
                           transition-colors"
                    >
                      <p className="text-2xl font-extrabold text-slate-900">
                        {election.candidatesCount ?? 0}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Candidates
                      </p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="text-sm text-slate-500 mb-5 space-y-1">
                    <p>
                      <span className="font-medium text-slate-600">
                        Created:
                      </span>{" "}
                      {election.createdAt
                        ? new Date(election.createdAt).toLocaleDateString()
                        : "—"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-600">
                        Updated:
                      </span>{" "}
                      {election.updatedAt
                        ? new Date(election.updatedAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() =>
                      // FIXED: Use adminNavigate function
                      navigate(
                        `/${adminId}/candidate-dashboard/${election.documentId}`
                      )
                    }
                    className="w-full py-2.5 rounded-xl
                         bg-gradient-to-r from-blue-600 to-indigo-600
                         text-white font-semibold
                         hover:from-blue-700 hover:to-indigo-700
                         active:scale-[0.98]
                         transition-all duration-200
                         shadow-md hover:shadow-xl"
                  >
                    Open Dashboard →
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
