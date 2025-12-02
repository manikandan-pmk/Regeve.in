 import React, { useState, useRef, useEffect } from "react";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import { 
  Search, 
  Filter, 
  Mail, 
  CheckCircle, 
  XCircle, 
  User, 
  Phone, 
  IdCard,
  Calendar,
  MapPin,
  Download,
  Users,
  ChevronDown,
  Edit2,
  Share2,
  AlertCircle,
  ArrowLeft,
  Send,
  MoreVertical
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ParticipationForm = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAlert, setShowAlert] = useState({ show: false, message: "", type: "success" });
  const [activeShareMenu, setActiveShareMenu] = useState(null);

  const shareMenuRef = useRef(null);

  const [participants, setParticipants] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+91 98765 43210",
      idNumber: "1234 5678 9012",
      idType: "aadhar",
      address: "123 Main Street, Bangalore, Karnataka - 560001",
      registrationDate: "2024-01-15",
      verified: false,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
      constituency: "Bangalore South",
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 87654 32109",
      idNumber: "ABCD1234567",
      idType: "voterid",
      address: "456 Park Avenue, Mumbai, Maharashtra - 400001",
      registrationDate: "2024-01-16",
      verified: true,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
      constituency: "Mumbai North",
    },
    {
      id: 3,
      name: "Alex Chen",
      email: "alex.chen@example.com",
      phone: "+91 76543 21098",
      idNumber: "P1234567",
      idType: "passport",
      address: "789 Oak Road, Delhi - 110001",
      registrationDate: "2024-01-14",
      verified: false,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
      constituency: "Delhi Central",
    },
    {
      id: 4,
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      phone: "+91 65432 10987",
      idNumber: "DL0420231234567",
      idType: "driving",
      address: "321 Pine Lane, Chennai, Tamil Nadu - 600001",
      registrationDate: "2024-01-17",
      verified: false,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
      constituency: "Chennai Central",
    },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setActiveShareMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show alert function
  const showAlertMessage = (message, type = "success") => {
    setShowAlert({ show: true, message, type });
    setTimeout(() => {
      setShowAlert({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Toggle verification with confirmation
  const toggleVerifyParticipant = (id, name) => {
    const isCurrentlyVerified = participants.find(p => p.id === id)?.verified;
    const action = isCurrentlyVerified ? "unverify" : "verify";
    
    if (window.confirm(`Are you sure you want to ${action} ${name}?`)) {
      setParticipants(prev =>
        prev.map(p => {
          if (p.id === id) {
            const newStatus = !p.verified;
            showAlertMessage(
              `${p.name} ${newStatus ? "verified" : "unverified"} successfully`,
              newStatus ? "success" : "warning"
            );
            return { ...p, verified: newStatus };
          }
          return p;
        })
      );
    }
  };

  // Send verification message
  const sendVerification = (participant, method) => {
    const electionLink = "https://election-portal.example.com/vote";
    const votingId = `VOTE${participant.id.toString().padStart(6, '0')}`;
    
    const message = `🏛️ Election Commission Verification\n\nDear ${participant.name},\n\n✅ Your election participation has been VERIFIED!\n\n📋 Your Details:\n• Voter ID: ${votingId}\n• Constituency: ${participant.constituency}\n\n🔗 Election Portal: ${electionLink}\n\n🗳️ Important Dates:\n• Voting Period: March 15-20, 2024\n• Results Declaration: March 25, 2024\n\nPlease keep your voting credentials secure.\n\nBest regards,\nElection Commission of India`;

    if (method === 'email') {
      const subject = "✅ Election Verification Complete - You Are Eligible to Vote!";
      const mailtoLink = `mailto:${participant.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      window.location.href = mailtoLink;
      showAlertMessage(`Email sent to ${participant.name}`, "success");
    } else if (method === 'whatsapp') {
      const whatsappUrl = `https://wa.me/${participant.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      showAlertMessage(`WhatsApp message sent to ${participant.name}`, "success");
    } else if (method === 'telegram') {
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(electionLink)}&text=${encodeURIComponent(message)}`;
      window.open(telegramUrl, '_blank');
      showAlertMessage(`Telegram message sent to ${participant.name}`, "success");
    }
    
    setActiveShareMenu(null);
  };

  // Start editing
  const startEditing = (participant) => {
    setEditingId(participant.id);
    setEditForm({ ...participant });
  };

  // Save edit
  const saveEdit = () => {
    setParticipants(prev =>
      prev.map(p => p.id === editingId ? { ...p, ...editForm } : p)
    );
    setEditingId(null);
    showAlertMessage("Participant updated successfully", "success");
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.email.toLowerCase().includes(search.toLowerCase()) ||
                         p.idNumber.toLowerCase().includes(search.toLowerCase()) ||
                         p.constituency.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filter === "all" ? true :
      filter === "verified" ? p.verified :
      filter === "pending" ? !p.verified : true;
    
    return matchesSearch && matchesFilter;
  });

  const totalCount = participants.length;
  const verifiedCount = participants.filter((p) => p.verified).length;
  const pendingCount = totalCount - verifiedCount;

  const getIDTypeColor = (type) => {
    const colors = {
      aadhar: "bg-blue-50 text-blue-700 border border-blue-100",
      voterid: "bg-green-50 text-green-700 border border-green-100",
      passport: "bg-purple-50 text-purple-700 border border-purple-100",
      driving: "bg-amber-50 text-amber-700 border border-amber-100"
    };
    return colors[type] || "bg-gray-50 text-gray-700 border border-gray-100";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Alert Messages */}
        {showAlert.show && (
          <div className={`mb-6 p-4 rounded-xl border ${
            showAlert.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : showAlert.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-700'
              : showAlert.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-blue-50 border-blue-200 text-blue-700'
          } shadow-sm animate-fadeIn`}>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">{showAlert.message}</p>
            </div>
          </div>
        )}

        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/candidate-dashboard')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.05)]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Voter Management
              </h1>
              <p className="text-gray-600">
                Manage voter verification and communication
              </p>
            </div>
            
            <button className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 text-sm font-medium bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.05)]">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Total Voters Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.05),0_15px_25px_rgba(0,0,0,0.12)] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Voters</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalCount}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Verified Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.05),0_15px_25px_rgba(0,0,0,0.12)] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Verified</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{verifiedCount}</p>
                <p className="text-green-600 text-xs font-medium mt-2">
                  {((verifiedCount / totalCount) * 100).toFixed(1)}% verified
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Pending Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.05),0_15px_25px_rgba(0,0,0,0.12)] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pendingCount}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <XCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Combined Search and Actions Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08)] p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search and Filter Row */}
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, ID, or constituency..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200 bg-white"
                />
              </div>
              
              {/* Filter Dropdown */}
              <div className="relative min-w-[200px]">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200 bg-white appearance-none cursor-pointer"
                >
                  <option value="all">All Voters</option>
                  <option value="verified">Verified Only</option>
                  <option value="pending">Pending Only</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Participants Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                <tr>
                  <th className="p-6 text-left text-sm font-semibold text-gray-700">Voter Information</th>
                  <th className="p-6 text-left text-sm font-semibold text-gray-700">Contact Details</th>
                  <th className="p-6 text-left text-sm font-semibold text-gray-700">ID Verification</th>
                  <th className="p-6 text-left text-sm font-semibold text-gray-700">Registration</th>
                  <th className="p-6 text-left text-sm font-semibold text-gray-700">Verification Status</th>
                  <th className="p-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredParticipants.map((participant) => (
                  <tr 
                    key={participant.id} 
                    className="hover:bg-blue-50/10 transition-all duration-200"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={participant.image}
                          alt={participant.name}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{participant.name}</p>
                          <p className="text-xs text-gray-500 mt-1">ID: #{participant.id.toString().padStart(4, '0')}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <MapPin className="w-3 h-3 text-blue-500" />
                            <span className="text-xs text-blue-600 font-medium">
                              {participant.constituency}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <Mail className="w-4 h-4 text-gray-500" />
                          </div>
                          <span className="text-sm text-gray-700">{participant.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <Phone className="w-4 h-4 text-gray-500" />
                          </div>
                          <span className="text-sm text-gray-700">{participant.phone}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-6">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${getIDTypeColor(participant.idType)}`}>
                          <IdCard className="w-4 h-4" />
                          {participant.idType.toUpperCase()}
                        </span>
                        <p className="text-sm text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded-lg">
                          {participant.idNumber}
                        </p>
                      </div>
                    </td>
                    
                    <td className="p-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <Calendar className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(participant.registrationDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">Registered Date</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-6">
                      <div className="flex flex-col items-start gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">
                            {participant.verified ? "Verified Voter" : "Pending Verification"}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleVerifyParticipant(participant.id, participant.name)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            participant.verified 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                              : 'bg-gradient-to-r from-gray-300 to-gray-400'
                          }`}
                        >
                          <span className="sr-only">
                            {participant.verified ? "Disable verification" : "Enable verification"}
                          </span>
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${
                              participant.verified ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-xs text-gray-500">
                          Click toggle to {participant.verified ? "revoke" : "grant"} verification
                        </span>
                      </div>
                    </td>
                    
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => startEditing(participant)}
                          className="p-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                          title="Edit Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        {/* Share Menu */}
                        <div className="relative" ref={shareMenuRef}>
                          <button
                            onClick={() => setActiveShareMenu(activeShareMenu === participant.id ? null : participant.id)}
                            className="p-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                            title="Share Verification"
                          >
                            {activeShareMenu === participant.id ? (
                              <Send className="w-4 h-4" />
                            ) : (
                              <Share2 className="w-4 h-4" />
                            )}
                          </button>
                          
                          {activeShareMenu === participant.id && (
                            <div className="absolute right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-10 min-w-[160px]">
                              <div className="p-2 border-b border-gray-100">
                                <p className="text-xs font-medium text-gray-700 px-2 py-1">Send Verification</p>
                              </div>
                              <button
                                onClick={() => sendVerification(participant, 'email')}
                                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 transition-colors"
                              >
                                <div className="p-1.5 bg-blue-50 rounded-lg">
                                  <Mail className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">Email</p>
                                  <p className="text-xs text-gray-500">Send via email</p>
                                </div>
                              </button>
                              <button
                                onClick={() => sendVerification(participant, 'whatsapp')}
                                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 transition-colors"
                              >
                                <div className="p-1.5 bg-green-50 rounded-lg">
                                  <FaWhatsapp className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">WhatsApp</p>
                                  <p className="text-xs text-gray-500">Send via WhatsApp</p>
                                </div>
                              </button>
                              <button
                                onClick={() => sendVerification(participant, 'telegram')}
                                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
                              >
                                <div className="p-1.5 bg-blue-100 rounded-lg">
                                  <FaTelegram className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">Telegram</p>
                                  <p className="text-xs text-gray-500">Send via Telegram</p>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredParticipants.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <User className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-gray-700 text-lg font-semibold mb-2">No voters found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Try adjusting your search criteria or filter to find what you're looking for
              </p>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Edit Voter Details</h3>
                <button
                  onClick={cancelEdit}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Constituency</label>
                  <input
                    type="text"
                    value={editForm.constituency || ''}
                    onChange={(e) => setEditForm({...editForm, constituency: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    placeholder="Enter constituency"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelEdit}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Footer */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredParticipants.length}</span> of{" "}
              <span className="font-semibold text-gray-900">{totalCount}</span> registered voters
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Verified:</span>
                <span className="font-semibold text-gray-900">{verifiedCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-gray-600">Pending:</span>
                <span className="font-semibold text-gray-900">{pendingCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipationForm;