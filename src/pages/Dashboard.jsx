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
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

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
                src={`${user.userImage}?t=${Date.now()}`}
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
                      {user.companyId}
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
                    <span className="text-black">Self:</span>
                    <span className="font-semibold text-black">
                      {user.self || 0}
                    </span>
                  </div>
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
                      {(user.adultcount || 0) +
                        (user.childrencount || 0) +
                        (user.self || 0)}
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
                  ["Travel Mode", user.travelmode, "🚌"],
                  ["Pickup Location", user.pickuplocation, "📍"],
                  [
                    "Present",
                    user.isPresent ? "Yes" : "No",
                    user.isPresent ? "🟢" : "🔴",
                  ],

                  [
                    "Gift Received",
                    user.isGiftReceived ? "Yes" : "No",
                    user.isGiftReceived ? "🟢" : "🔴",
                  ],
                  [
                    "Lucky Draw Winner",
                    user.isPresent && user.isWinned ? "Yes" : "No",
                    user.isPresent && user.isWinned ? "🟢" : "🔴",
                  ],
                  [
                    "Registration Date",
                    formatDate(user.registrationDate),
                    "📅",
                  ],
                  [
                    "Last Updated",
                    user.updatedDate === user.registrationDate
                      ? "N/A"
                      : formatDate(user.updatedDate),
                    "⏱️",
                  ],
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
                  ["Self", user.self, "👥"],
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
    IsGiftReceived: false,
    Self: "",
    Travel_Mode: "",
    Pickup_Location: "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    setForm({
      Name: user.name || "",
      Member_ID: user.userId || "",
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
      IsGiftReceived: user.isGiftReceived || false,
      Self: user.self || "",
      Travel_Mode: user.travelmode || "",
      Pickup_Location: user.pickuplocation || "",
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
    const totalPeople =
      (Number(form.Self) || 0) +
      (Number(form.Adult_Count) || 0) +
      (Number(form.Children_Count) || 0);

    const totalFood =
      (Number(form.Veg_Count) || 0) + (Number(form.Non_Veg_Count) || 0);

    if (totalPeople !== totalFood) {
      setSaving(false);
      setError(
        `People count (${totalPeople}) must equal Food count (${totalFood}).`
      );
      return;
    }

    if (form.Travel_Mode === "Company Bus" && !form.Pickup_Location.trim()) {
      setSaving(false);
      setError("Pickup Location is required when Travel Mode is Company Bus.");
      return;
    }
    // ⭐ Prevent gift received if user is not verified OR not present
    if (!user.IsVerified_Member || !user.isPresent) {
      if (form.IsGiftReceived === true) {
        setSaving(false);
        setError("User must be VERIFIED & PRESENT before receiving gift.");
        return;
      }
    }

    try {
      let uploadedPhoto = null;

      if (photoFile) {
        const fd = new FormData();
        fd.append("files", photoFile);

        const uploadRes = await axios.post(
          "https://api.regeve.in/api/upload",
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
        IsGiftReceived: form.IsGiftReceived === true ? true : false,
        Self: Number(form.Self) || 0,
        Travel_Mode: form.Travel_Mode,
        Pickup_Location: form.Pickup_Location,
      };

      if (uploadedPhoto) payload.Photo = uploadedPhoto.id;

      await axios.put(`https://api.regeve.in/api/event-forms/${user.userId}`, {
        data: payload,
      });

      setSaving(false);
      onSaved({
        updated: {
          ...user,

          // BASIC FIELDS
          name: form.Name,
          age: Number(form.Age) || 0,
          gender: form.Gender,
          email: form.Email,
          phone: form.Phone_Number,
          whatsapp: form.WhatsApp_Number,
          companyId: form.Company_ID,

          // TRAVEL
          pickuplocation: form.Pickup_Location,
          travelmode: form.Travel_Mode,

          // FOOD & COUNTS (convert to numbers!)
          self: Number(form.Self) || 0,
          adultcount: Number(form.Adult_Count) || 0,
          childrencount: Number(form.Children_Count) || 0,
          vegcount: Number(form.Veg_Count) || 0,
          nonvegcount: Number(form.Non_Veg_Count) || 0,

          // BOOLEAN FIELDS
          isGiftReceived: form.IsGiftReceived,
          isPresent: user.isPresent,
          IsVerified_Member: user.IsVerified_Member,

          // IMAGE
          userImage: photoFile
            ? URL.createObjectURL(photoFile)
            : user.userImage,

          // TIMESTAMPS — keep old ones so dashboard doesn’t break
          registrationDate: user.registrationDate,
          updatedDate: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error("Update error:", err);
      setSaving(false);
      setError(
        "Failed to update participant. Please check all required fields and try again."
      );
    }
  };

  if (!user) return null;

  /* ----------------------------------------- */
  /* ----------- UI RETURN BELOW ------------- */
  /* ----------------------------------------- */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      {/* BG overlay */}
      <div
        className="absolute inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-6xl w-full max-h-[95vh] overflow-y-auto animate-slideUp">
        {/* HEADER */}
        <div className="sticky top-0 flex justify-between items-center px-8 py-6 bg-gradient-to-r from-green-100 to-green-50 border-b border-gray-200 rounded-t-3xl">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Edit Participant
            </h2>
            <p className="text-gray-600 mt-1 text-lg">
              Update participant information
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-red-100 text-red-600 transition-all duration-200"
          >
            <FaTimes size={26} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col xl:flex-row gap-10 p-8">
          {/* LEFT SIDE */}
          <div className="w-full xl:w-1/3 flex flex-col items-center">
            {/* Profile Photo */}
            <div className="w-60 h-60 rounded-3xl overflow-hidden shadow-xl ring-4 ring-green-200 border border-gray-100">
              <img
                src={
                  photoFile
                    ? URL.createObjectURL(photoFile)
                    : `${user.userImage}?t=${Date.now()}`
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Photo Upload */}
            <div className="mt-8 w-full max-w-xs">
              <label className="block text-lg font-semibold text-gray-700 mb-3 text-center">
                Update Profile Photo
              </label>

              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="hidden"
                />

                <div className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold rounded-2xl shadow-lg">
                  Choose New Photo
                </div>
              </label>

              {photoFile && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl">
                  <p className="text-green-700 text-center font-medium">
                    Selected: <b>{photoFile.name}</b>
                  </p>
                </div>
              )}
            </div>

            {/* Gift Switch */}
            <div className="mt-6 flex items-center justify-between w-full max-w-xs bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
              <span className="text-gray-700 font-semibold flex items-center">
                🎁 Gift Received
              </span>

              <label
                className={`flex items-center ${
                  !user.isPresent || !user.IsVerified_Member
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.IsGiftReceived}
                  disabled={!user.isPresent || !user.IsVerified_Member} // ⭐ RESTRICTION
                  onChange={(e) =>
                    setForm((p) => ({ ...p, IsGiftReceived: e.target.checked }))
                  }
                  className="hidden"
                />

                <div
                  className={`w-14 h-7 rounded-full flex items-center p-1 transition ${
                    form.IsGiftReceived ? "bg-green-500" : "bg-gray-300"
                  } ${
                    !user.isPresent || !user.IsVerified_Member
                      ? "opacity-60"
                      : ""
                  }`}
                >
                  <div
                    className={`bg-white w-6 h-6 rounded-full shadow-md transform transition ${
                      form.IsGiftReceived ? "translate-x-7" : "translate-x-0"
                    }`}
                  ></div>
                </div>
              </label>
            </div>

            {(!user.isPresent || !user.IsVerified_Member) && (
              <p className="text-xs text-red-600 mt-2 text-center">
                User must be PRESENT & VERIFIED to receive gift.
              </p>
            )}
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                ["Full Name", "Name", "text", "👤"],
                ["Member ID", "Member_ID", "text", "🆔", true],
                ["Phone Number", "Phone_Number", "tel", "📞"],
                ["WhatsApp Number", "WhatsApp_Number", "tel", "💬"],
                ["Email Address", "Email", "email", "📧"],
                ["Company ID", "Company_ID", "text", "🏢", true],
                ["Age", "Age", "number", "🎂"],
                ["Gender", "Gender", "select", "⚥"],
                ["Travel Mode", "Travel_Mode", "select", "🚌"],

                ...(form.Travel_Mode === "Company Bus"
                  ? [["Pickup Location", "Pickup_Location", "text", "📍"]]
                  : []),

                ["Self", "Self", "text", "👥", true],
                ["Adult Count", "Adult_Count", "number"],
                ["Children Count", "Children_Count", "number"],
                ["Veg Count", "Veg_Count", "number", "🥗"],
                ["Non-Veg Count", "Non_Veg_Count", "number", "🍗"],
              ].map(([label, field, type, icon, readOnly]) => (
                <div key={field}>
                  <label className="flex items-center text-sm font-semibold mb-2 text-gray-700">
                    <span className="mr-2 text-lg">{icon}</span>
                    {label}
                  </label>

                  {field === "Gender" ? (
                    <SelectBox
                      name="Gender"
                      value={form.Gender}
                      onChange={handleChange}
                      options={["Male", "Female", "Others"]}
                    />
                  ) : field === "Travel_Mode" ? (
                    <SelectBox
                      name="Travel_Mode"
                      value={form.Travel_Mode}
                      onChange={handleChange}
                      options={["Self", "Company Bus"]}
                    />
                  ) : (
                    <input
                      type={type}
                      name={field}
                      disabled={readOnly}
                      value={form[field]}
                      onChange={readOnly ? undefined : handleChange}
                      className={`w-full px-4 py-3.5 rounded-2xl border-2 shadow-sm transition ${
                        readOnly
                          ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                          : "border-gray-200 focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
                      }`}
                      placeholder={`Enter ${label}`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="mt-10 flex justify-end gap-4 border-t pt-6">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-8 py-3.5 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-2xl shadow-md transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaEdit />
                )}
                {saving ? "Updating..." : "Update Participant"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
        .animate-slideUp { animation: slideUp 0.35s ease-out; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

/* SMALL COMPONENTS */
const SummaryRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-purple-700">{label}:</span>
    <span className="font-semibold text-purple-900">{value || 0}</span>
  </div>
);

const SelectBox = ({ name, value, onChange, options }) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    className="w-full border-2 border-gray-200 px-4 py-3.5 rounded-2xl shadow-sm bg-white focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition"
  >
    <option value="">Select {name.replace("_", " ")}</option>
    {options.map((v) => (
      <option key={v} value={v}>
        {v}
      </option>
    ))}
  </select>
);

// Dashboard.jsx

const Dashboard = () => {
  // ----------------------------- STATES -----------------------------
  const [users, setUsers] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    totalRegisteredUsers: 0,
    totalMembers: 0,
    totalNonVeg: 0,
    totalVeg: 0,
    totalGifts: 0,
    totalForms: 0, // ➕ added
    totalPresent: 0,
    verifiedNotPresentVeg: 0,
    verifiedNotPresentNonVeg: 0,
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
        "https://api.regeve.in/api/event-forms?populate=*&fields=*"
      );
      const data = response.data?.data || [];

      const formatted = data.map((item) => ({
        id: item.id,
        name: item.Name,
        userId: item.Member_ID,
        userImage: item.Photo?.url
          ? `https://api.regeve.in${item.Photo.url}`
          : "https://via.placeholder.com/150?text=No+Image",
        age: item.Age,
        gender: item.Gender,
        phone: item.Phone_Number,
        whatsapp: item.WhatsApp_Number,
        email: item.Email,
        companyId: item.Company_ID,
        pickuplocation: item.Pickup_Location,
        travelmode: item.Travel_Mode,
        self: item.Self,
        adultcount: Number(item.Adult_Count) || 0,
        childrencount: Number(item.Children_Count) || 0,
        vegcount: Number(item.Veg_Count) || 0,
        nonvegcount: Number(item.Non_Veg_Count) || 0,
        isPresent: item.IsPresent === true,
        isWinned: item.IsWinnned === true,
        IsVerified_Member: item.IsVerified_Member === true,
        isGiftReceived:
          item.IsGiftReceived === true ||
          item.IsGiftReceived === 1 ||
          item.IsGiftReceived === "true",
        registrationDate: item.createdAt,
        updatedDate: item.updatedAt,
        checkInTime: item.CheckIn_Time || null, // safe (if doesn't exist)

        raw: item,
      }));

      setUsers(formatted);

      // -----------------------------
      // TOTAL REGISTERED USERS
      // -----------------------------
      const totalRegisteredUsers = formatted.length;

      // ONLY VERIFIED USERS ARE COUNTED AS REGISTERED
      const totalAdminverfied = formatted.filter(
        (u) => u.IsVerified_Member === true
      ).length;

      // -----------------------------
      // PRESENT USERS ONLY
      // -----------------------------
      const presentUsers = formatted.filter((u) => u.isPresent);

      // VERIFIED BUT NOT PRESENT (THIS WAS MISSING)
      const verifiedNotPresent = formatted.filter(
        (u) => u.IsVerified_Member === true && u.isPresent === false
      );

      // FOOD COUNTS FOR VERIFIED NOT PRESENT
      const verifiedNotPresentVeg = verifiedNotPresent.reduce(
        (sum, u) => sum + u.vegcount,
        0
      );

      const verifiedNotPresentNonVeg = verifiedNotPresent.reduce(
        (sum, u) => sum + u.nonvegcount,
        0
      );

      // -----------------------------
      // GIFTS
      // -----------------------------
      const totalGifts = presentUsers.filter(
        (u) => u.isGiftReceived === true
      ).length;

      // -----------------------------
      // TOTAL ATTENDEES (PRESENT USERS)
      // -----------------------------
      const totalAttendees = presentUsers.length;

      // -----------------------------
      // HEAD COUNTS
      // -----------------------------
      const totalAdults = presentUsers.reduce(
        (sum, u) => sum + u.adultcount,
        0
      );
      const totalChildren = presentUsers.reduce(
        (sum, u) => sum + u.childrencount,
        0
      );
      const totalVeg = presentUsers.reduce((sum, u) => sum + u.vegcount, 0);
      const totalNonVeg = presentUsers.reduce(
        (sum, u) => sum + u.nonvegcount,
        0
      );

      // UPDATE DASHBOARD
      setDashboardData({
        totalRegisteredUsers,
        totalAdminverfied,
        totalAttendees,
        totalAdults,
        totalChildren,
        totalVeg,
        totalNonVeg,
        totalGifts,
        verifiedNotPresentVeg,
        verifiedNotPresentNonVeg,
      });
    } catch (err) {
      console.log("API Error:", err);
    }
  };

  const handleVerificationToggle = async (memberId, newStatus) => {
    try {
      // update UI instantly
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === memberId ? { ...u, IsVerified_Member: newStatus } : u
        )
      );

      // send correct body structure expected by backend
      await axios.put(
        `https://api.regeve.in/api/event-forms/${memberId}`,
        {
          data: {
            IsVerified_Member: newStatus,
          },
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Updated verified:", memberId);
    } catch (error) {
      console.error("Verification failed:", error);

      // rollback
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === memberId ? { ...u, IsVerified_Member: !newStatus } : u
        )
      );
    }
  };

  const refreshStatsOnly = async () => {
    try {
      const response = await axios.get(
        "https://api.regeve.in/api/event-forms?populate=*&fields=*"
      );

      const data = response.data?.data || [];
      const formatted = data.map((item) => ({
        adultcount: Number(item.Adult_Count) || 0,
        childrencount: Number(item.Children_Count) || 0,
        vegcount: Number(item.Veg_Count) || 0,
        nonvegcount: Number(item.Non_Veg_Count) || 0,
        isPresent: item.IsPresent === true,
        isGiftReceived:
          item.IsGiftReceived === true ||
          item.IsGiftReceived === 1 ||
          item.IsGiftReceived === "true",
        IsVerified_Member: item.IsVerified_Member === true,
        self: Number(item.Self) || 1,
      }));

      const totalAdminverfied = formatted.filter(
        (u) => u.IsVerified_Member === true
      ).length;

      const presentUsers = formatted.filter((u) => u.isPresent);
      const totalSelf = presentUsers.reduce((sum, u) => sum + (u.self || 0), 0);

      const verifiedNotPresent = formatted.filter(
        (u) => u.IsVerified_Member === true
      );

      const verifiedNotPresentVeg = verifiedNotPresent.reduce(
        (sum, u) => sum + u.vegcount,
        0
      );

      const verifiedNotPresentNonVeg = verifiedNotPresent.reduce(
        (sum, u) => sum + u.nonvegcount,
        0
      );

      const totalGifts = presentUsers.filter(
        (u) => u.isGiftReceived === true
      ).length;

      const totalAttendees = presentUsers.length;

      const totalAdults = presentUsers.reduce(
        (sum, u) => sum + u.adultcount,
        0
      );

      const totalChildren = presentUsers.reduce(
        (sum, u) => sum + u.childrencount,
        0
      );

      const totalVeg = presentUsers.reduce((sum, u) => sum + u.vegcount, 0);
      const totalNonVeg = presentUsers.reduce(
        (sum, u) => sum + u.nonvegcount,
        0
      );

      setDashboardData((prev) => ({
        ...prev,
        totalSelf,
        totalAdminverfied,
        totalAttendees,
        totalAdults,
        totalChildren,
        totalVeg,
        totalNonVeg,
        totalGifts,
        verifiedNotPresentVeg,
        verifiedNotPresentNonVeg,
      }));
    } catch (err) {
      console.log("Stats Refresh Error:", err);
    }
  };

  useEffect(() => {
    fetchData(); // initial load

    const interval = setInterval(() => {
      refreshStatsOnly();
    }, 1000); // every 1 minute

    return () => clearInterval(interval);
  }, []);

  // ----------------------------- FILTERS + PAGINATION -----------------------------
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.companyId?.toLowerCase().includes(searchTerm.toLowerCase())
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
    fetchData();
  };

  // Called by EditPopup on successful save
  const handleAfterEdit = ({ updated }) => {
    setEditUser(null);

    setUsers((prev) =>
      prev.map((u) => (u.userId === updated.userId ? updated : u))
    );
    setTimeout(() => {
      fetchData(); // <-- THIS FIXES THE DASHBOARD STATS
    }, 300);
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
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-5 mb-8 overflow-visible">
        {/* TOTAL REGISTERED USERS */}
        <div
          className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 shadow-2xl 
                  border border-blue-100 transform transform-gpu hover:scale-105 
                  transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-start space-x-4">
            <div className="p-4 bg-blue-500/20 rounded-2xl shadow-inner">
              <FaUsers className="text-blue-600 text-xl" />
            </div>

            <div>
              <p className="text-blue-600 font-semibold text-base">
                Admin Verified Users
              </p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">
                {dashboardData.totalAdminverfied}
              </h3>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href =
                  "https://api.regeve.in/api/event-forms/export-verified";
                link.setAttribute("download", "verified-users.xlsx");
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
              className="px-2 py-1 ml-12 bg-gray-600 text-white rounded-xl shadow-lg text-sm font-semibold"
            >
              📄 Export
            </button>
          </div>
        </div>

        {/* VERIFIED NOT PRESENT - FOOD COUNT */}
        <div
          className="bg-gradient-to-br from-white to-orange-50 rounded-3xl p-6 shadow-2xl 
                  border border-orange-200 transform transform-gpu hover:scale-105 
                  transition-all duration-300"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-4 bg-orange-500/20 rounded-2xl shadow-inner">
              <FaUtensils className="text-orange-600 text-xl" />
            </div>

            <div>
              <p className="text-orange-600 font-semibold text-base">
                Food Count (Admin Verified, Not Present)
              </p>

              <h3 className="text-xl font-bold text-gray-800 mt-1 animate-pulse">
                {dashboardData.verifiedNotPresentVeg +
                  dashboardData.verifiedNotPresentNonVeg}{" "}
                Head
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            <div className="bg-white/80 rounded-2xl p-4 shadow-lg border border-green-200 text-center">
              <span className="text-2xl">🥗</span>
              <p className="text-xl font-bold text-green-700 mt-2">
                {dashboardData.verifiedNotPresentVeg}
              </p>
              <p className="text-xs text-green-700 font-medium">Veg</p>
            </div>

            <div className="bg-white/80 rounded-2xl p-4 shadow-lg border border-red-200 text-center">
              <span className="text-2xl">🍗</span>
              <p className="text-xl font-bold text-red-700 mt-2">
                {dashboardData.verifiedNotPresentNonVeg}
              </p>
              <p className="text-xs text-red-700 font-medium">Non-Veg</p>
            </div>
          </div>
        </div>

        {/* TOTAL ATTENDEES WITH CIRCLE PROGRESS */}
        <div
          className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 shadow-2xl 
                  border border-blue-100 transform transform-gpu hover:scale-105 
                  transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-blue-500/20 rounded-2xl shadow-inner">
                  <FaUsers className="text-blue-600 text-xl" />
                </div>

                <div>
                  <p className="text-blue-600 font-semibold text-base">
                    Total Attendees
                  </p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">
                    {dashboardData.totalAttendees}
                  </h3>
                </div>
              </div>
            </div>

            {/* FIXED CIRCLE PROGRESS INSIDE CARD */}
            <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
              <svg
                className="w-16 h-16 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  d="M18 2.0845 a15.9155 15.9155 0 0 1 0 31.831 a15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a15.9155 15.9155 0 0 1 0 31.831 a15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#blueGradient)"
                  strokeWidth="3"
                  strokeDasharray={`${
                    dashboardData.totalAdminverfied === 0
                      ? 0
                      : (dashboardData.totalAttendees /
                          dashboardData.totalAdminverfied) *
                        100
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

              <div className="absolute text-xs font-bold text-blue-700">
                {dashboardData.totalAdminverfied === 0
                  ? 0
                  : (
                      (dashboardData.totalAttendees /
                        dashboardData.totalAdminverfied) *
                      100
                    ).toFixed(0)}
                %
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-600 text-center mt-4">
            Capacity • {dashboardData.totalAttendees}/
            {dashboardData.totalAdminverfied}
          </p>

          <div className="mt-6">
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href =
                  "https://api.regeve.in/api/event-forms/export-present";
                link.setAttribute("download", "present-users.xlsx");
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
              className="px-2 py-1 ml-12 bg-gray-600 text-white rounded-xl shadow-lg text-sm font-semibold"
            >
              📄 Export
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br transform-gpu from-white to-green-50 rounded-3xl p-6 shadow-2xl border border-green-100 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-green-500/20 rounded-2xl shadow-inner">
                  <FaUtensils className="text-green-600 text-xl" />
                </div>

                <div>
                  <p className="text-green-600 font-semibold text-base">
                    Food Distribution
                  </p>

                  <h3 className="text-2xl font-bold text-gray-800 mt-1 animate-pulse">
                    {dashboardData.totalAdults +
                      dashboardData.totalChildren +
                      dashboardData.totalSelf}{" "}
                    Head
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Veg */}
                <div className="bg-white/80 rounded-2xl p-4 shadow-lg border border-green-200 transform hover:scale-105 transition-all duration-200">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-bold text-green-600">
                        🥗
                      </span>
                    </div>

                    <p className="text-xl font-bold text-green-600">
                      {dashboardData.totalVeg}
                    </p>

                    <p className="text-xs text-green-700 font-medium mt-1">
                      Vegetarian
                    </p>
                  </div>
                </div>

                {/* Non-Veg */}
                <div className="bg-white/80 rounded-2xl p-4 shadow-lg border border-orange-200 transform hover:scale-105 transition-all duration-200">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-bold text-orange-600">
                        🍗
                      </span>
                    </div>

                    <p className="text-xl font-bold text-orange-600">
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
        <div className="bg-gradient-to-br transform-gpu from-white to-purple-50 rounded-3xl p-6 shadow-2xl border border-purple-100 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-purple-500/20 rounded-2xl shadow-inner">
                  <FaGift className="text-purple-600 text-xl" />
                </div>

                <div>
                  <p className="text-purple-600 font-semibold text-base">
                    Gifts Distributed
                  </p>

                  <h3 className="text-3xl font-bold text-gray-800 mt-1">
                    {dashboardData.totalGifts}
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                {/* Delivered */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Delivered
                    </span>

                    <span className="text-gray-800 font-bold">
                      {dashboardData.totalGifts}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${
                          dashboardData.totalAttendees === 0
                            ? 0
                            : (dashboardData.totalGifts /
                                dashboardData.totalAttendees) *
                              100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Pending */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-500 flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                      Pending
                    </span>

                    <span className="text-gray-800 font-bold">
                      {dashboardData.totalAttendees - dashboardData.totalGifts}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${
                          dashboardData.totalAttendees === 0
                            ? 0
                            : ((dashboardData.totalAttendees -
                                dashboardData.totalGifts) /
                                dashboardData.totalAttendees) *
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
                  {dashboardData.totalAttendees === 0
                    ? "0%"
                    : (
                        (dashboardData.totalGifts /
                          dashboardData.totalAttendees) *
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
                Participant Management ({dashboardData.totalRegisteredUsers})
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
                        Verified
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
                                  src={`${user.userImage}?t=${Date.now()}`}
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

                        {/* Verified Checkbox */}
                        <td className="px-8 py-6">
                          <div className="flex justify-center">
                            <label className="inline-flex items-center cursor-pointer">
                              {/* CHECKBOX (Uses Member_ID here!) */}
                              <input
                                type="checkbox"
                                checked={user.IsVerified_Member || false}
                                onChange={(e) =>
                                  handleVerificationToggle(
                                    user.userId,
                                    e.target.checked
                                  )
                                }
                                className="hidden"
                              />

                              {/* Toggle UI */}
                              <div
                                className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
                                  user.IsVerified_Member
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                }`}
                              >
                                <div
                                  className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                                    user.IsVerified_Member
                                      ? "translate-x-7"
                                      : "translate-x-0"
                                  }`}
                                />
                              </div>

                              <span
                                className={`ml-3 text-sm font-medium ${
                                  user.IsVerified_Member
                                    ? "text-green-600"
                                    : "text-gray-500"
                                }`}
                              >
                                {user.IsVerified_Member
                                  ? "Verified"
                                  : "Unverified"}
                              </span>
                            </label>
                          </div>
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
                      <td colSpan="5" className="px-8 py-20 text-center">
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
        </div>
      </div>

      {/* Pagination - Modern Style */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-200 space-y-4 sm:space-y-0">
          <div className="text-gray-600 text-lg">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {indexOfFirst + 1}-{Math.min(indexOfLast, filteredUsers.length)}
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
                    className={`w-12 h-12 rounded-xl text-base font-semibold transition-all duration-200 ${
                      currentPage === page
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
              onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
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
  );
};

export default Dashboard;
