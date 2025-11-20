import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaUtensils,
  FaGift,
  FaSearch,
  FaEdit,
  FaUserCircle,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";


/* -----------------------------------------------------
   VIEW POPUP COMPONENT (MERGED)
----------------------------------------------------- */
const ViewPopup = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-6xl w-full max-h-[95vh] overflow-y-auto animate-slideUp transform transition-all duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-3xl">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Participant Details
            </h2>
            <p className="text-gray-600 mt-1 text-lg">
              View complete participant information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl cursor-pointer hover:bg-red-50 text-red-500 hover:text-red-600 transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col xl:flex-row gap-8 p-8">
          {/* Left Side - Profile Photo & Summary */}
          <div className="w-full xl:w-1/3 flex flex-col items-center">
            <div className="w-64 h-64 rounded-3xl overflow-hidden border-4 border-white shadow-2xl ring-4 ring-blue-100">
              <img
                src={user.userImage}
                className="w-full h-full object-cover"
                alt="Profile"
              />
            </div>

            {/* Member ID Badge */}
            <div className="mt-8 w-full max-w-xs">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-purple-100">
                <h4 className="font-bold text-amber-800 text-lg mb-4 text-center">
                  Member Information
                </h4>
                <div className="space-y-4 text-center">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-black mb-3 font-semibold mb-1">
                      Member ID
                    </p>
                    <code className="text-lg font-mono font-bold text-purple-900 bg-white px-3 py-2 rounded-lg border border-purple-200">
                      {user.userId}
                    </code>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-black font-semibold mb-1">
                      Company ID
                    </p>
                    <p className="text-base font-semibold text-purple-900">
                      {user.companyId || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 w-full max-w-xs">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border border-green-100">
                <h4 className="font-bold text-black text-lg mb-4 text-center">
                  Attendance Summary
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-black">Adults:</span>
                    <span className="font-semibold text-black">
                      {user.adultcount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Children:</span>
                    <span className="font-semibold text-black">
                      {user.childrencount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Total:</span>
                    <span className="font-semibold text-black">
                      {(user.adultcount || 0) + (user.childrencount || 0)}
                    </span>
                  </div>
                  <div className="border-t border-green-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-black">Vegetarian:</span>
                      <span className="font-semibold text-black">
                        {user.vegcount || 0}
                      </span>
                    </div>
                    <br />
                    <div className="flex justify-between">
                      <span className="text-black">Non-Veg:</span>
                      <span className="font-semibold text-black">
                        {user.nonvegcount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="flex-1">
            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-2xl mr-3">👤</span>
                Personal Information
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                  ["Full Name", user.name, "📝"],
                  ["Age", user.age, "🎂"],
                  ["Gender", user.gender, "⚥"],
                  ["Email", user.email, "📧"],
                  ["Phone", user.phone, "📞"],
                  ["WhatsApp", user.whatsapp, "💬"],
                ].map(([label, value, icon], i) => (
                  <div
                    key={i}
                    className="p-5 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">{icon}</span>
                      <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold">
                        {label}
                      </p>
                    </div>
                    <p className="text-base font-medium text-gray-800">
                      {value || "N/A"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Address - Full Width */}
              <div className="mt-6 group">
                <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">🏠</span>
                    <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold">
                      Address
                    </p>
                  </div>
                  <p className="text-base font-medium text-gray-800 leading-relaxed">
                    {user.address || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-2xl mr-3">📊</span>
                Additional Information
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                  ["Vegetarian Count", user.vegcount, "🥗"],
                  ["Non-Veg Count", user.nonvegcount, "🍗"],
                  ["Adult Count", user.adultcount],
                  ["Children Count", user.childrencount],
                ].map(([label, value, icon], i) => (
                  <div
                    key={i}
                    className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-md mr-2">{icon}</span>
                      <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold">
                        {label}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-gray-800">
                      {value || 0}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-8 py-3.5 cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaEye className="w-4 h-4" />
                Close Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          0% { transform: translateY(30px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

/* -----------------------------------------------------
   EDIT POPUP COMPONENT (MERGED)
----------------------------------------------------- */
const EditPopup = ({ user, onClose, onSaved }) => {
  const [form, setForm] = useState({
    Name: "",
    Member_ID: "",
    Address: "",
    Age: "",
    Gender: "",
    Phone_Number: "",
    WhatsApp_Number: "",
    Email: "",
    Children_Count: "",
    Adult_Count: "",
    Non_Veg_Count: "",
    Veg_Count: "",
    Company_ID: "",
    Food: "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    setForm({
      Name: user.name || "",
      Member_ID: user.userId || "",
      Address: user.address || "",
      Age: user.age || "",
      Gender: user.gender || "",
      Phone_Number: user.phone || "",
      WhatsApp_Number: user.whatsapp || "",
      Email: user.email || "",
      Children_Count: user.childrencount || "",
      Adult_Count: user.adultcount || "",
      Company_ID: user.companyId || "",
      Veg_Count: user.vegcount || "",
      Non_Veg_Count: user.nonvegcount || "",
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhotoFile(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      let uploadedPhoto = null;

      if (photoFile) {
        const fd = new FormData();
        fd.append("files", photoFile);

        const uploadRes = await axios.post(
          "https://api.moviemads.com/api/upload",
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (Array.isArray(uploadRes.data) && uploadRes.data.length > 0) {
          uploadedPhoto = uploadRes.data[0];
        }
      }

      const payload = {
        Name: form.Name,
        Member_ID: form.Member_ID,
        Address: form.Address,
        Age: Number(form.Age) || 0,
        Gender: form.Gender,
        Phone_Number: form.Phone_Number ? Number(form.Phone_Number) : null,
        WhatsApp_Number: form.WhatsApp_Number
          ? Number(form.WhatsApp_Number)
          : null,
        Email: form.Email,
        Children_Count: Number(form.Children_Count) || 0,
        Adult_Count: Number(form.Adult_Count) || 0,
        Veg_Count: Number(form.Veg_Count) || 0,
        Non_Veg_Count: Number(form.Non_Veg_Count) || 0,
        Company_ID: form.Company_ID,
        Food: form.Food,
        IsWinned: form.IsWinned,
        IsGiftReceived: form.IsGiftReceived,
      };

      if (uploadedPhoto) {
        payload.Photo = uploadedPhoto.id;
      }

      await axios.put(
        `https://api.moviemads.com/api/event-forms/${user.userId}`,
        { data: payload }
      );

      setSaving(false);
      onSaved();
    } catch (err) {
      console.error("Update error:", err);
      setSaving(false);
      setError(
        "Failed to update participant. Please check all required fields and try again."
      );
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-6xl w-full max-h-[95vh] overflow-y-auto animate-slideUp transform transition-all duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-3xl">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Edit Participant
            </h2>
            <p className="text-gray-600  mt-1 text-lg">
              Update participant information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl cursor-pointer hover:bg-red-50 text-red-500 hover:text-red-600 transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col xl:flex-row gap-8 p-8">
          {/* Left Side - Photo Upload */}
          <div className="w-full xl:w-1/3 flex flex-col items-center">
            <div className="w-64 h-64 rounded-3xl overflow-hidden border-4 border-white shadow-2xl ring-4 ring-green-100 transform hover:scale-105 transition-transform duration-300">
              <img
                src={
                  photoFile ? URL.createObjectURL(photoFile) : user.userImage
                }
                className="w-full h-full object-cover"
                alt="Profile"
              />
            </div>

            {/* File Upload Section */}
            <div className="mt-8 w-full max-w-xs">
              <label className="block text-lg font-semibold text-gray-700 mb-4 text-center">
                Update Profile Photo
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="block w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  Choose New Photo
                </label>
              </div>
              {photoFile && (
                <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-200">
                  <p className="text-green-700 font-medium text-center">
                    Selected:{" "}
                    <span className="font-bold">{photoFile.name}</span>
                  </p>
                  <p className="text-green-600 text-sm text-center mt-1">
                    Photo will be updated when you save changes
                  </p>
                </div>
              )}
            </div>

            {/* Current Info Summary */}
            <div className="mt-8 w-full max-w-xs">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-purple-100">
                <h4 className="font-bold text-purple-800 text-lg mb-4 text-center">
                  Current Summary
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-700">Adults:</span>
                    <span className="font-semibold text-purple-900">
                      {user.adultcount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Children:</span>
                    <span className="font-semibold text-purple-900">
                      {user.childrencount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Veg:</span>
                    <span className="font-semibold text-purple-900">
                      {user.vegcount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Non-Veg:</span>
                    <span className="font-semibold text-purple-900">
                      {user.nonvegcount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                ["Full Name", "Name", "text", "👤"],
                ["Member ID", "Member_ID", "text", "🆔"],
                ["Phone Number", "Phone_Number", "tel", "📞"],
                ["WhatsApp Number", "WhatsApp_Number", "tel", "💬"],
                ["Email Address", "Email", "email", "📧"],
                ["Company ID", "Company_ID", "text", "🏢"],
                ["Age", "Age", "number", "🎂"],
                ["Gender", "Gender", "text", "⚥"],
                ["Adult Count", "Adult_Count", "number"],
                ["Children Count", "Children_Count", "number"],
                ["Veg Count", "Veg_Count", "number", "🥗"],
                ["Non-Veg Count", "Non_Veg_Count", "number", "🍗"],
              ].map(([label, field, type, icon]) => (
                <div key={field} className="group">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-lg mr-2">{icon}</span>
                    {label}
                  </label>
                  <input
                    type={type}
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 px-4 py-3.5 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 group-hover:border-blue-300"
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                </div>
              ))}

              {/* Address - Full Width */}
              <div className="lg:col-span-2 group">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <span className="text-lg mr-2">🏠</span>
                  Address
                </label>
                <textarea
                  name="Address"
                  value={form.Address}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 px-4 py-3.5 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 group-hover:border-blue-300 resize-vertical"
                  rows={4}
                  placeholder="Enter complete address"
                ></textarea>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl animate-shake">
                <p className="text-red-700 font-medium text-center">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-8 py-3.5 bg-gradient-to-r cursor-pointer from-gray-500 to-gray-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3.5 bg-gradient-to-r cursor-pointer from-green-500 to-green-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <FaEdit className="w-4 h-4" />
                    Update Participant
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          0% { transform: translateY(30px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};
// Dashboard.jsx

const Dashboard = () => {
  // ----------------------------- STATES -----------------------------
  const [users, setUsers] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalMembers: 0,
    totalNonVeg: 0,
    totalVeg: 0,
    gifts: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);

  const usersPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    navigate("/"); // redirect home
  }
}, []);


  // ----------------------------- FETCH API -----------------------------
  const fetchData = async () => {
    try {
      const response = await axios.get(
        "https://api.moviemads.com/api/event-forms"
      );

      const data = response.data.data;

      const formatted = data.map((item) => ({
        id: item.id,
        name: item.Name,
        userId: item.Member_ID,
        userImage: item.Photo?.url
          ? `https://api.moviemads.com${item.Photo.url}`
          : "https://via.placeholder.com/150?text=No+Image",
        food: item.Food,
        address: item.Address,
        age: item.Age,
        gender: item.Gender,
        phone: item.Phone_Number,
        whatsapp: item.WhatsApp_Number,
        email: item.Email,
        adultcount: Number(item.Adult_Count) || 0,
        childrencount: Number(item.Children_Count) || 0,
        vegcount: Number(item.Veg_Count) || 0,
        nonvegcount: Number(item.Non_Veg_Count) || 0,
        companyId: item.Company_ID,
        qrCode: item.QRCode?.url
          ? `https://api.moviemads.com${item.QRCode.url}`
          : null,
        raw: item,
        isGiftReceived: item.IsGiftReceived === true,
      }));

      // IMPORTANT: update users
      setUsers(formatted);

      // Total Users
      const totalUsers = formatted.length;

      // Total Members = Adults + Children
      const totalMembers = formatted.reduce(
        (sum, u) => sum + (u.adultcount || 0) + (u.childrencount || 0),
        0
      );

      // Total Veg
      const totalVeg = formatted.reduce((sum, u) => sum + (u.vegcount || 0), 0);

      // Total Non-Veg
      const totalNonVeg = formatted.reduce(
        (sum, u) => sum + (u.nonvegcount || 0),
        0
      );

      // Count:
      const totalGifts = formatted.filter((u) => u.isGiftReceived).length;

      // UPDATE DASHBOARD STATE
      setDashboardData({
        totalUsers,
        totalMembers,
        totalVeg,
        totalNonVeg,
        gifts: totalGifts,
      });
    } catch (err) {
      console.log("API Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ----------------------------- FILTERS + PAGINATION -----------------------------
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.userId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // ----------------------------- ACTION HANDLERS -----------------------------
  const handleView = (user) => {
    // Receive the formatted user object (with .raw)
    setViewUser(user);
  };

  const handleEdit = (user) => {
    setEditUser(user);
  };

  // Called by EditPopup on successful save
  const handleAfterEdit = async () => {
    setEditUser(null);
    await fetchData(); // refresh table after edit
  };

  const handleCloseView = () => {
    setViewUser(null);
  };

  const handleCloseEdit = () => {
    setEditUser(null);
  };

  // ----------------------------- UI BELOW (UNCHANGED except actions) -----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br  from-gray-50 to-blue-50 p-6">
      {/* View & Edit Popups */}
      {viewUser && (
        <ViewPopup user={viewUser} onClose={() => setViewUser(null)} />
      )}
      {editUser && (
        <EditPopup
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={handleAfterEdit}
        />
      )}

      {/* ---------------- HEADER SECTION (UNCHANGED) ---------------- */}
      <div className="mb-8">
        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Event Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Real-time overview of event metrics
            </p>
          </div>
          <div>
            <button
              onClick={() => navigate("/")}
              className="fixed top-6 right-6 z-50 bg-gradient-to-br from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white px-5 py-2.5 rounded-lg shadow-lg cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105 font-medium text-sm border border-blue-500"
            >
              ← Go Home
            </button>
          </div>
        </div>

      </div>


      {/* ---------------- STATS CARDS (LIVE DATA INSERTED) ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* PEOPLE */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 shadow-2xl border border-blue-100 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-blue-500/20 rounded-2xl shadow-inner">
                    <FaUsers className="text-blue-600 text-2xl" />
                  </div>
                  <div>
                    <p className="text-blue-600 font-semibold text-lg">
                      Total Attendees
                    </p>
                    <h3 className="text-4xl font-bold text-gray-800 mt-1">
                      {dashboardData.totalUsers}
                    </h3>
                  </div>
                </div>

                {/* Circle Progress */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-20 h-20 transform -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="url(#blueGradient)"
                        strokeWidth="3"
                        strokeDasharray={`${(dashboardData.totalUsers / 200) * 100
                          }, 100`}
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient
                          id="blueGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#1D4ED8" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">
                      {Math.min(
                        100,
                        (dashboardData.totalUsers / 200) * 100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 text-center">
                  Venue capacity • {dashboardData.totalUsers}/200
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOD */}
        <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl p-6 shadow-2xl border border-green-100 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-green-500/20 rounded-2xl shadow-inner">
                  <FaUtensils className="text-green-600 text-2xl" />
                </div>
                <div>
                  <p className="text-green-600 font-semibold text-lg">
                    Food Distribution
                  </p>
                  <h3 className="text-4xl font-bold text-gray-800 mt-1 animate-pulse">
                    {dashboardData.totalMembers}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 rounded-2xl p-4 shadow-lg border border-green-200 transform hover:scale-105 transition-all duration-200">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-bold text-green-600">
                        🥗
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {dashboardData.totalVeg}
                    </p>
                    <p className="text-xs text-green-700 font-medium mt-1">
                      Vegetarian
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 rounded-2xl p-4 shadow-lg border border-orange-200 transform hover:scale-105 transition-all duration-200">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-bold text-orange-600">
                        🍗
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {dashboardData.totalNonVeg}
                    </p>
                    <p className="text-xs text-orange-700 font-medium mt-1">
                      Non-Veg
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GIFTS */}
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-6 shadow-2xl border border-purple-100 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-purple-500/20 rounded-2xl shadow-inner">
                  <FaGift className="text-purple-600 text-2xl" />
                </div>
                <div>
                  <p className="text-purple-600 font-semibold text-lg">
                    Gifts Distributed
                  </p>
                  <h3 className="text-4xl font-bold text-gray-800 mt-1">
                    {dashboardData.gifts}
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Delivered
                    </span>
                    <span className="text-gray-800 font-bold">
                      {dashboardData.gifts}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${dashboardData.totalUsers === 0
                            ? 0
                            : (dashboardData.gifts / dashboardData.totalUsers) *
                            100
                          }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-500 flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                      Pending
                    </span>
                    <span className="text-gray-800 font-bold">
                      {dashboardData.totalUsers - dashboardData.gifts}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${dashboardData.totalUsers === 0
                            ? 0
                            : ((dashboardData.totalUsers -
                              dashboardData.gifts) /
                              dashboardData.totalUsers) *
                            100
                          }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Completion:{" "}
                  {dashboardData.totalUsers === 0
                    ? "0%"
                    : (
                      (dashboardData.gifts / dashboardData.totalUsers) *
                      100
                    ).toFixed(1) + "%"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- USERS TABLE (UPDATED TABLE HEADERS) ---------------- */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div className="mb-6 lg:mb-0">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Participant Management
              </h2>
              <p className="text-gray-500 mt-2 text-lg">
                Manage and track all event participants in real-time
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 text-lg" />
              </div>
              <input
                type="text"
                placeholder="Search by name or member ID..."
                className="pl-12 pr-6 py-3.5 w-96 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 text-lg"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                    <th className="px-8 py-6 text-left">
                      <span className="text-base font-semibold text-gray-700 uppercase tracking-wider">
                        S.No
                      </span>
                    </th>
                    <th className="px-8 py-6 text-left">
                      <span className="text-base font-semibold text-gray-700 uppercase tracking-wider">
                        User Details
                      </span>
                    </th>
                    <th className="px-8 py-6 text-left">
                      <span className="text-base font-semibold text-gray-700 uppercase tracking-wider">
                        Member ID
                      </span>
                    </th>
                    <th className="px-8 py-6 text-center">
                      <span className="text-base font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200 group"
                      >
                        {/* Serial Number */}
                        <td className="px-8 py-6">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-white">
                                {indexOfFirst + index + 1}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* User Details */}
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-inner">
                              <span className="w-8 h-8 rounded-full">
                                <img
                                  src={user.userImage}
                                  alt={user.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              </span>
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-gray-900 mb-1">
                                {user.name}
                              </p>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Registered
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Member ID */}
                        <td className="px-8 py-6">
                          <code className="text-base font-mono font-bold bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 text-gray-800">
                            {user.userId}
                          </code>
                        </td>

                        {/* Actions */}
                        <td className="px-8 py-6">
                          <div className="flex justify-center space-x-3">
                            {/* VIEW */}
                            <button
                              onClick={() => handleView(user)}
                              className="inline-flex items-center cursor-pointer px-4 py-3 border-2 border-gray-300 rounded-xl text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                              title="View"
                            >
                              <FaEye className="w-5 h-5 mr-2 text-gray-500" />
                              View
                            </button>

                            {/* EDIT */}
                            <button
                              onClick={() => handleEdit(user)}
                              className="inline-flex cursor-pointer items-center px-6 py-3 border-2 border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              <FaEdit className="w-5 h-5 mr-3" />
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <FaUserCircle className="text-gray-400 text-5xl" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-3">
                            No Participants Found
                          </h3>
                          <p className="text-gray-500 text-lg mb-6">
                            No users matched your search criteria.
                          </p>
                          <button
                            onClick={() => setSearchTerm("")}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
                          >
                            Clear Search
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination - Modern Style */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-200 space-y-4 sm:space-y-0">
              <div className="text-gray-600 text-lg">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {indexOfFirst + 1}-
                  {Math.min(indexOfLast, filteredUsers.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {filteredUsers.length}
                </span>{" "}
                participants
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 border-2 border-gray-300 rounded-xl text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page =
                      currentPage <= 3
                        ? i + 1
                        : currentPage >= totalPages - 2
                          ? totalPages - 4 + i
                          : currentPage - 2 + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-12 h-12 rounded-xl text-base font-semibold transition-all duration-200 ${currentPage === page
                            ? "bg-blue-600 text-white shadow-lg"
                            : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((c) => Math.min(c + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-5 py-2.5 border-2 border-gray-300 rounded-xl text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                >
                  Next
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
