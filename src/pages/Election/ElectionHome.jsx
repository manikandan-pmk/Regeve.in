// components/ElectionHome.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
          data: {
            Election_Name: electionName,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newElection = res.data.data;

      // Update dropdown immediately
      setElections((prev) => [newElection, ...prev]);

      // Close popup
      setShowCreatePopup(false);
      setElectionName("");

      // Navigate
      navigate("/candidate-dashboard", {
        state: {
          electionId: newElection.id,
          electionName: newElection.Election_Name,
        },
      });
    } catch (err) {
      console.error("Create election failed", err);
    } finally {
      setCreating(false);
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
      setElections((prev) => [savedElection, ...prev]);

      // Navigate
      navigate("/candidate-dashboard", {
        state: {
          electionId: savedElection.id,
          electionName: savedElection.Election_Name,
        },
      });
    } catch (error) {
      console.error("Saving election type failed", error);
    }
  };

  const handleStartSelectedElection = () => {
    if (selectedCategory) {
      setShowSelectionPopup(false);
      // Navigate to dashboard with pre-defined election details
      navigate("/candidate-dashboard", {
        state: {
          electionName: selectedCategory.type,
          electionType: selectedCategory.category,
          electionCategory: selectedCategory.category,
        },
      });
    }
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
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            My Elections
          </h2>
          <p className="text-slate-500">
            Manage and monitor your election campaigns
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-slate-500">Loading elections...</p>
            </div>
          </div>
        ) : elections.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No elections yet
            </h3>
            <p className="text-slate-500">
              Create your first election to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => {
              const attrs = election.attributes ?? election;

              return (
                <div
                  key={election.id}
                  className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] relative overflow-hidden"
                  onClick={() =>
                    navigate("/candidate-dashboard", {
                      state: {
                        electionId: election.id,
                        electionName: attrs.Election_Name,
                      },
                    })
                  }
                >
                  {/* Decorative accent */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-300"></div>

                  {/* Election content */}
                  <div className="ml-3">
                    {/* Election name with icon */}
                    <div className="flex items-start mb-4">
                      <div className="mr-3 mt-1 p-2 rounded-lg bg-blue-50 text-blue-600">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                          {attrs.Election_Name}
                        </h3>
                        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-xs font-medium">
                          <span className="w-2 h-2 mr-2 rounded-full bg-blue-500"></span>
                          Active
                        </div>
                      </div>
                    </div>

                    {/* Metadata section */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <div className="flex items-center text-slate-600">
                        <svg
                          className="w-4 h-4 mr-2 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-medium">Created</p>
                          <p className="text-slate-500 text-sm">
                            {attrs.createdAt
                              ? new Date(attrs.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )
                              : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-slate-600">
                        <svg
                          className="w-4 h-4 mr-2 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-medium">Last Updated</p>
                          <p className="text-slate-500 text-sm">
                            {attrs.updatedAt
                              ? new Date(attrs.updatedAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                  }
                                )
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <button className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors group-hover:bg-blue-100 flex items-center justify-center">
                        View Dashboard
                        <svg
                          className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
