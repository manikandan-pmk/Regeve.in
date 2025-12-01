 import React, { useState } from "react";
import { Search, CheckCircle, XCircle, Users, Filter, Download } from "lucide-react";

const ElectionDashboard = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, verified, pending

  const [participants, setParticipants] = useState([
    {
      id: 1,
      name: "John Doe",
      image: "https://via.placeholder.com/60",
      verified: true,
      email: "john.doe@example.com",
      registrationDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Priya Sharma",
      image: "https://via.placeholder.com/60",
      verified: false,
      email: "priya.sharma@example.com",
      registrationDate: "2024-01-16",
    },
    {
      id: 3,
      name: "Alex Chen",
      image: "https://via.placeholder.com/60",
      verified: true,
      email: "alex.chen@example.com",
      registrationDate: "2024-01-14",
    },
    {
      id: 4,
      name: "Maria Garcia",
      image: "https://via.placeholder.com/60",
      verified: false,
      email: "maria.garcia@example.com",
      registrationDate: "2024-01-17",
    },
  ]);

  const toggleVerify = (id) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, verified: !p.verified } : p
      )
    );
  };

  const verifyParticipant = (id) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, verified: true } : p))
    );
  };

  const unverifyParticipant = (id) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, verified: false } : p))
    );
  };

  const bulkVerify = (ids) => {
    setParticipants((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, verified: true } : p))
    );
  };

  const filtered = participants.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filter === "all" ? true :
      filter === "verified" ? p.verified :
      filter === "pending" ? !p.verified : true;
    
    return matchesSearch && matchesFilter;
  });

  const totalCount = participants.length;
  const verifiedCount = participants.filter((p) => p.verified).length;
  const pendingCount = totalCount - verifiedCount;

  const selectedParticipants = filtered.filter(p => p.selected);
  const canBulkVerify = selectedParticipants.length > 0 && selectedParticipants.some(p => !p.verified);

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Election Dashboard
          </h1>
          <p className="text-gray-600">Manage and verify election participants</p>
        </div>
        <button className="mt-4 lg:mt-0 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 font-medium">
          <Download className="w-5 h-5" />
          Export Data
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Participants</p>
              <p className="text-3xl font-bold mt-2">{totalCount}</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Verified</p>
              <p className="text-3xl font-bold mt-2">{verifiedCount}</p>
              <p className="text-green-200 text-sm mt-1">
                {((verifiedCount / totalCount) * 100).toFixed(1)}% completed
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Pending Verification</p>
              <p className="text-3xl font-bold mt-2">{pendingCount}</p>
            </div>
            <XCircle className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="flex items-center bg-gray-50 border rounded-xl px-4 py-3 flex-1 max-w-md">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ml-3 w-full outline-none bg-transparent"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center bg-gray-50 border rounded-xl px-4 py-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="ml-3 outline-none bg-transparent"
              >
                <option value="all">All Participants</option>
                <option value="verified">Verified Only</option>
                <option value="pending">Pending Only</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedParticipants.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedParticipants.length} selected
              </span>
              {canBulkVerify && (
                <button
                  onClick={() => bulkVerify(selectedParticipants.map(p => p.id))}
                  className="px-4 py-2 text-sm rounded-xl bg-green-600 text-white hover:bg-green-700 transition font-medium"
                >
                  Verify Selected
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-900">Participant</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-900">Registration</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{p.name}</p>
                        <p className="text-sm text-gray-500">ID: #{p.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-gray-900">{p.email}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-gray-900">{new Date(p.registrationDate).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4">
                    {p.verified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        <XCircle className="w-4 h-4" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {p.verified ? (
                        <button
                          onClick={() => unverifyParticipant(p.id)}
                          className="px-4 py-2 text-sm rounded-xl border border-red-300 text-red-700 hover:bg-red-50 transition font-medium"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => verifyParticipant(p.id)}
                          className="px-4 py-2 text-sm rounded-xl bg-green-600 text-white hover:bg-green-700 transition font-medium"
                        >
                          Verify
                        </button>
                      )}
                      <button className="px-4 py-2 text-sm rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No participants found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          Showing {filtered.length} of {totalCount} participants
        </p>
      </div>
    </div>
  );
};

 
export default ElectionDashboard;