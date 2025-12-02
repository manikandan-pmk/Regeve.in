import React, { useState } from "react";
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

const ElectionDashboard = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [participants, setParticipants] = useState([
    {
      id: 1,
      name: "John Doe",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      email: "john.doe@example.com",
      registrationDate: "2024-01-15",
      role: "Candidate",
      votes: 1250,
      party: "National Progressive",
      status: "active",
    },
    {
      id: 2,
      name: "Priya Sharma",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop",
      email: "priya.sharma@example.com",
      registrationDate: "2024-01-16",
      role: "Voter",
      votes: 0,
      party: null,
      status: "registered",
    },
    {
      id: 3,
      name: "Alex Chen",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      email: "alex.chen@example.com",
      registrationDate: "2024-01-14",
      role: "Candidate",
      votes: 980,
      party: "Unity Alliance",
      status: "active",
    },
    {
      id: 4,
      name: "Maria Garcia",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      email: "maria.garcia@example.com",
      registrationDate: "2024-01-17",
      role: "Voter",
      votes: 0,
      party: null,
      status: "registered",
    },
    {
      id: 5,
      name: "David Wilson",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      email: "david.wilson@example.com",
      registrationDate: "2024-01-13",
      role: "Candidate",
      votes: 2100,
      party: "Democratic Front",
      status: "active",
    },
    {
      id: 6,
      name: "Sarah Johnson",
      image:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
      email: "sarah.johnson@example.com",
      registrationDate: "2024-01-18",
      role: "Candidate",
      votes: 1875,
      party: "Green Initiative",
      status: "active",
    },
  ]);

  const filtered = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.party && p.party.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "candidate"
        ? p.role === "Candidate"
        : filter === "voter"
        ? p.role === "Voter"
        : true;

    return matchesSearch && matchesFilter;
  });

  const totalParticipants = participants.length;
  const totalCandidates = participants.filter(
    (p) => p.role === "Candidate"
  ).length;
  const totalVoters = participants.filter((p) => p.role === "Voter").length;
  const totalVotes = participants.reduce((sum, p) => sum + p.votes, 0);
  const leadingCandidate = participants
    .filter((p) => p.role === "Candidate")
    .sort((a, b) => b.votes - a.votes)[0];

  return (
    <div className="pt-20 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Election Analytics Dashboard
            </h1>
            <p className="text-gray-500">
              Monitor election progress and participant analytics
            </p>
          </div>
          <button className="mt-4 lg:mt-0 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 font-medium text-sm shadow-sm hover:shadow">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            className="bg-white p-6 rounded-2xl border border-gray-100 
shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08)]
hover:shadow-[0_4px_8px_rgba(0,0,0,0.05),0_15px_25px_rgba(0,0,0,0.12)]
transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-50">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+8%</span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-2">
              Total Participation
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {totalParticipants.toLocaleString()}
            </p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <UserPlus className="w-4 h-4 mr-2" />
              <span>
                {totalCandidates} candidates • {totalVoters} voters
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 
shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08)]
hover:shadow-[0_4px_8px_rgba(0,0,0,0.05),0_15px_25px_rgba(0,0,0,0.12)]
transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-50">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-blue-600 font-medium">Active</span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-2">
              Total Candidates
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {totalCandidates}
            </p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span>Active contenders in race</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 
shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08)]
hover:shadow-[0_4px_8px_rgba(0,0,0,0.05),0_15px_25px_rgba(0,0,0,0.12)]
transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-50">
                <Vote className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-purple-600 font-medium">Cast</span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-2">
              Total Votes
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {totalVotes.toLocaleString()}
            </p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Votes recorded to date</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 
shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08)]
hover:shadow-[0_4px_8px_rgba(0,0,0,0.05),0_15px_25px_rgba(0,0,0,0.12)]
transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-amber-50">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-sm text-amber-600 font-medium">
                Leading
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-2">
              Front Runner
            </p>
            <p className="text-xl font-bold text-gray-900 truncate">
              {leadingCandidate?.name || "N/A"}
            </p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-500">Votes:</span>
                <span className="font-semibold text-gray-900">
                  {leadingCandidate?.votes.toLocaleString() || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full"
                  style={{
                    width: `${
                      ((leadingCandidate?.votes || 0) / totalVotes) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Participants Directory
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Manage and view all election participants
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  {filtered.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {totalParticipants}
                </span>{" "}
                participants
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-6 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search participants by name, email, or party..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 placeholder-gray-500 shadow-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white border border-gray-300 rounded-xl px-4 py-3 shadow-sm">
                <Filter className="w-5 h-5 text-gray-400 mr-3" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="outline-none bg-transparent text-gray-700 cursor-pointer pr-8"
                >
                  <option value="all">All Participants</option>
                  <option value="candidate">Candidates</option>
                  <option value="voter">Voters</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
              <tr>
                <th className="p-6 text-left text-sm font-semibold text-gray-700">
                  Participant
                </th>
                <th className="p-6 text-left text-sm font-semibold text-gray-700">
                  Role & Affiliation
                </th>
                <th className="p-6 text-left text-sm font-semibold text-gray-700">
                  Registration
                </th>
                <th className="p-6 text-left text-sm font-semibold text-gray-700">
                  Performance
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200/50">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-100/30 transition-all duration-200"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-md"
                        />
                        {p.role === "Candidate" && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                            <svg
                              className="w-3.5 h-3.5 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {p.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <svg
                            className="w-4 h-4 text-gray-400"
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
                          <span className="text-sm text-gray-600 truncate max-w-[180px]">
                            {p.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-2">
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                          p.role === "Candidate"
                            ? "bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 border border-blue-200"
                            : "bg-gradient-to-r from-gray-50 to-gray-100/50 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {p.role === "Candidate" ? (
                          <>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Candidate
                          </>
                        ) : (
                          <>
                            <Users className="w-4 h-4 mr-2" />
                            Voter
                          </>
                        )}
                      </span>
                      {p.party && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Affiliation:</span>{" "}
                          {p.party}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="p-2.5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {new Date(p.registrationDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          Registered
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    {p.role === "Candidate" ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Votes:</span>
                          <span className="font-bold text-gray-900">
                            {p.votes.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full shadow-sm"
                            style={{
                              width: `${(p.votes / totalVotes) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {((p.votes / totalVotes) * 100).toFixed(1)}% of total
                          votes
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-gray-500">
                        <div className="p-2.5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                          <Vote className="w-5 h-5" />
                        </div>
                        <span>Eligible Voter</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-gray-700 text-xl font-semibold mb-3">
                No participants found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Try adjusting your search criteria or filter to find what you're
                looking for
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-200 bg-gradient-to-r from-gray-50/50 to-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {filtered.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {totalParticipants}
                </span>{" "}
                participants
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                  <span className="text-gray-600">Candidates:</span>
                  <span className="font-semibold text-gray-900">
                    {totalCandidates}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-400 to-gray-500"></div>
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

      {/* Summary Section */}
      {/* <div className="mt-8 p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-200/50 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Election Progress Summary</h3>
            <p className="text-gray-600 text-sm mt-1">Real-time analytics and participant insights</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalVotes.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Votes Cast</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {((totalVotes / (totalVoters || 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Voter Turnout</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {(totalVotes / (totalCandidates || 1)).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Avg Votes per Candidate</div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default ElectionDashboard;
