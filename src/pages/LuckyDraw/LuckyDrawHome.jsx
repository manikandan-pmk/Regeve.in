import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "https://api.regeve.in/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

const uploadApi = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

uploadApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Modal Components moved outside
const NameModal = ({
  isOpen,
  onClose,
  onNext,
  drawName,
  onNameChange,
  nameInputRef,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300" />

      <div
        className="relative w-full max-w-md transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-2xl border border-gray-200">
          {/* Modal Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
                  <span className="text-xl">🎲</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Create New Lucky Draw
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Step 1: Enter draw name
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 hover:scale-110 active:scale-95"
                type="button"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Lucky Draw Name *
              </label>
              <input
                ref={nameInputRef}
                type="text"
                name="Name"
                value={drawName}
                onChange={onNameChange}
                placeholder="Enter draw name"
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg"
                required
                autoFocus
              />
              <p className="mt-2 text-sm text-gray-500">
                You'll be able to add more details in the next step
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="mt-6 flex justify-end space-x-3 pt-6 border-t border-gray-200 p-6">
            <button
              onClick={onClose}
              className="rounded-xl px-6 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:scale-[1.02] active:scale-95"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={onNext}
              disabled={!drawName.trim()}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateDetailsModal = ({
  isOpen,
  onClose,
  onBack,
  onSubmit,
  drawData,
  onInputChange,
  qrCodePreview,
  onFileChange,
  onRemoveFile,
  creatingDraw,
  fileInputRef,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return "₹0";
    const num = Number(amount);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300" />

      <div
        className="relative w-full max-w-4xl transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
          {/* Modal Header */}
          <div className="border-b border-gray-200 p-6 sticky top-0 bg-white/95 backdrop-blur-sm z-10 rounded-t-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
                  <span className="text-xl">🎲</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Complete Draw Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Step 2: Add draw details for "{drawData.Name}"
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 hover:scale-110 active:scale-95"
                type="button"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">
                    DRAW INFORMATION
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Number of People
                      </label>
                      <input
                        type="number"
                        name="Number_of_Peoples"
                        value={drawData.Number_of_Peoples}
                        onChange={onInputChange}
                        placeholder="Enter number"
                        min="1"
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Prize Amount (₹)
                      </label>
                      <input
                        type="number"
                        name="Amount"
                        value={drawData.Amount}
                        onChange={onInputChange}
                        placeholder="Enter amount"
                        min="0"
                        step="100"
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Duration Value
                      </label>
                      <input
                        type="number"
                        name="Duration_Value"
                        value={drawData.Duration_Value}
                        onChange={onInputChange}
                        placeholder="e.g., 2"
                        min="1"
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Duration Unit
                      </label>
                      <select
                        name="Duration_Unit"
                        value={drawData.Duration_Unit}
                        onChange={onInputChange}
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="Week">Week</option>
                        <option value="Month">Month</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        UPI ID (Optional)
                      </label>
                      <input
                        type="text"
                        name="Upi_Id"
                        value={drawData.Upi_Id}
                        onChange={onInputChange}
                        placeholder="Enter UPI ID"
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - QR Code */}
              <div className="space-y-4">
                <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">
                    QR CODE UPLOAD
                  </h4>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-4">
                      Upload a QR code image for participants to scan (Optional)
                    </p>

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-blue-500 transition-colors duration-200"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        className="hidden"
                      />

                      {qrCodePreview ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={qrCodePreview}
                            alt="QR Code Preview"
                            className="w-48 h-48 object-contain rounded-lg mb-4 border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveFile();
                            }}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove QR Code
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                          </div>
                          <p className="text-gray-600">
                            Click to upload QR code
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="rounded-xl bg-gray-50 p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">
                    DRAW PREVIEW
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Draw Name:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {drawData.Name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">People:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {drawData.Number_of_Peoples || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Prize Amount:
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatAmount(drawData.Amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {drawData.Duration_Value || "1"}{" "}
                        {drawData.Duration_Unit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="mt-6 flex justify-between space-x-3 pt-6 border-t border-gray-200 p-6">
            <button
              onClick={onBack}
              className="rounded-xl px-6 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:scale-[1.02] active:scale-95"
              type="button"
            >
              ← Back
            </button>

            <button
              onClick={onSubmit}
              disabled={creatingDraw}
              className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-green-800 hover:scale-[1.02] hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              {creatingDraw ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </span>
              ) : (
                "Create Draw"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DrawDetailsModal = ({ isOpen, onClose, draw, onDelete, API_BASE }) => {
  if (!isOpen || !draw) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "Created":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Running":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Created":
        return "📝";
      case "Running":
        return "🎯";
      case "Completed":
        return "🏆";
      default:
        return "📌";
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return "₹0";
    const num = Number(amount);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const qrCodeUrl = draw.QRcode?.url
    ? draw.QRcode.url.startsWith("http")
      ? draw.QRcode.url
      : `${API_BASE}${draw.QRcode.url}`
    : null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300" />

      <div
        className="relative w-full max-w-2xl transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
          {/* Modal Header */}
          <div className="border-b border-gray-200 p-6 sticky top-0 bg-white/95 backdrop-blur-sm z-10 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${getStatusColor(
                    draw.LuckyDraw_Status
                  )}`}
                >
                  <span className="text-xl">
                    {getStatusIcon(draw.LuckyDraw_Status)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {draw.Name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                        draw.LuckyDraw_Status
                      )} border`}
                    >
                      {draw.LuckyDraw_Status}
                    </span>
                    <span className="text-sm text-gray-500">
                      ID: {draw.LuckyDrawName_ID}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 hover:scale-110 active:scale-95"
                type="button"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">
                    DRAW INFORMATION
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Participants:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {draw.Number_of_Peoples || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Prize Amount:
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatAmount(draw.Amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Duration:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {draw.Duration_Value} {draw.Duration_Unit || "Week"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">UPI ID:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {draw.Upi_Id || "Not set"}
                      </span>
                    </div>
                    {draw.Last_Luckydraw_Spin_Date && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Last Draw:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(draw.Last_Luckydraw_Spin_Date)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {qrCodeUrl && (
                  <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm text-center">
                    <h4 className="text-sm font-semibold text-gray-500 mb-3">
                      QR CODE
                    </h4>
                    <div className="flex justify-center">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="w-48 h-48 object-contain rounded-lg border border-gray-300"
                      />
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                      Scan to participate
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Related Data */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-gradient-to-r from-green-50 to-green-100 p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-200">
                    <span className="text-lg">📋</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-green-800">
                      Total Entries
                    </div>
                    <div className="text-lg font-bold text-green-900">
                      {draw.lucky_draw_forms?.count || 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 p-4 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-200">
                    <span className="text-lg">🏅</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-purple-800">
                      Winners
                    </div>
                    <div className="text-lg font-bold text-purple-900">
                      {draw.lucky_draw_winners?.count || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="mt-6 flex justify-end space-x-3 pt-6 border-t border-gray-200 p-6">
            <button
              onClick={onClose}
              className="rounded-xl px-6 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:scale-[1.02] active:scale-95"
              type="button"
            >
              Close
            </button>
            {draw.LuckyDraw_Status !== "Completed" && (
              <button
                onClick={() => {
                  onClose();
                  onDelete(draw);
                }}
                className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-red-600 hover:to-red-700 hover:scale-[1.02] hover:shadow-xl active:scale-95"
                type="button"
              >
                Delete Draw
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function LuckyDrawHome() {
  const { adminId } = useParams();
  const navigate = useNavigate();

  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Create Draw States
  const [showNameModal, setShowNameModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDrawDetailsModal, setShowDrawDetailsModal] = useState(false);
  const [newDrawData, setNewDrawData] = useState({
    Name: "",
    Number_of_Peoples: "",
    Amount: "",
    Upi_Id: "",
    Duration_Value: "",
    Duration_Unit: "Week",
    LuckyDraw_Status: "Created",
  });
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState(null);
  const [creatingDraw, setCreatingDraw] = useState(false);
  const [selectedDraw, setSelectedDraw] = useState(null);

  // Refs
  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
    const storedAdminId = localStorage.getItem("adminId");

    if (!token) {
      console.log("No token found");
      return false;
    }

    if (adminId && storedAdminId && adminId !== storedAdminId) {
      console.warn("Admin ID mismatch");
      return false;
    }

    return true;
  }, [adminId]);

  const fetchDraws = useCallback(async () => {
    console.log("Starting fetchDraws for admin:", adminId);

    if (!checkAuth()) {
      console.log("Authentication failed");
      setAuthError(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setAuthError(false);

    try {
      const res = await api.get(`/lucky-draw-names`, {
        params: {
          populate: {
            QRcode: true,
            lucky_draw_forms: { count: true },
            lucky_draw_winners: { count: true },
            admin: { fields: ["id"] },
          },
          filters: {
            admin: { id: { $eq: adminId } },
          },
        },
      });

      if (res.status === 200) {
        setDraws(res.data || []);
        setAuthError(false);
      } else if (res.status === 401 || res.status === 403) {
        setAuthError(true);
        localStorage.removeItem("jwt");
        sessionStorage.removeItem("jwt");
      } else {
        console.error("Server error:", res.status);
      }
    } catch (err) {
      console.error("Failed to fetch draws:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        setAuthError(true);
        localStorage.removeItem("jwt");
        sessionStorage.removeItem("jwt");
      } else {
        console.error("API Error:", err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [adminId, checkAuth]);

  useEffect(() => {
    fetchDraws();
  }, [fetchDraws]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewDrawData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setQrCodeFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setQrCodeFile(null);
    setQrCodePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const uploadQRCode = async () => {
    if (!qrCodeFile) return null;

    const formData = new FormData();
    formData.append("files", qrCodeFile);

    try {
      const res = await uploadApi.post("/upload", formData);

      console.log("Upload response:", res.data);

      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data[0].id; // ✅ media ID
      }

      return null;
    } catch (err) {
      console.error("QR upload failed:", err.response?.data || err.message);
      throw err;
    }
  };

  const handleSubmitDraw = async () => {
    if (!checkAuth()) {
      alert("Please login to create a lucky draw");
      return;
    }

    if (!newDrawData.Name.trim()) {
      alert("Please enter a draw name");
      return;
    }

    setCreatingDraw(true);
    try {
      let qrCodeId = null;

      if (qrCodeFile) {
        qrCodeId = await uploadQRCode();
      }

      const drawPayload = {
        data: {
          ...newDrawData,
          Number_of_Peoples: parseInt(newDrawData.Number_of_Peoples) || 0,
          Amount: parseInt(newDrawData.Amount) || 0,
          Duration_Value: parseInt(newDrawData.Duration_Value) || 1,
          admin: adminId,
        },
      };
      if (qrCodeId) {
        drawPayload.data.QRcode = qrCodeId;
      }

      await api.post("/lucky-draw-names", drawPayload);
      alert("Lucky draw created successfully!");
      await fetchDraws();
      resetCreateForm();
      setShowDetailsModal(false);
    } catch (err) {
      console.error("Failed to create draw:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired. Please login again.");
      } else if (err.response?.data?.error?.message) {
        alert(`Error: ${err.response.data.error.message}`);
      } else if (err.response?.status === 409) {
        alert("A draw with this name already exists.");
      } else {
        alert("Failed to create lucky draw. Please try again.");
      }
    } finally {
      setCreatingDraw(false);
    }
  };

  const resetCreateForm = useCallback(() => {
    setNewDrawData({
      Name: "",
      Number_of_Peoples: "",
      Amount: "",
      Upi_Id: "",
      Duration_Value: "",
      Duration_Unit: "Week",
      LuckyDraw_Status: "Created",
    });
    setQrCodeFile(null);
    setQrCodePreview(null);
  }, []);

  const handleDeleteDraw = useCallback(
    async (draw) => {
      if (!checkAuth()) {
        alert("Please login to delete a lucky draw");
        return;
      }

      if (
        !window.confirm(
          `Are you sure you want to delete "${draw.Name}"? This action cannot be undone.`
        )
      ) {
        return;
      }

      try {
        const response = await api.delete(
          `/lucky-draw-names/${draw.documentId}`
        );

        if (response.status === 200 || response.status === 204) {
          await fetchDraws();
          alert("Lucky draw deleted successfully!");
        } else {
          throw new Error(`Unexpected status: ${response.status}`);
        }
      } catch (err) {
        console.error("Failed to delete draw:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert("Session expired. Please login again.");
        } else if (err.response?.status === 404) {
          alert("Draw not found. It may have already been deleted.");
          await fetchDraws();
        } else {
          alert("Failed to delete lucky draw. Please try again.");
        }
      }
    },
    [checkAuth, fetchDraws]
  );

  const handleUpdateStatus = useCallback(
    async (draw, newStatus) => {
      if (!checkAuth()) {
        alert("Please login to update draw status");
        return;
      }

      if (draw.LuckyDraw_Status === "Completed") {
        alert("Completed draws cannot be updated");
        return;
      }

      if (
        !window.confirm(
          `Change draw status from "${draw.LuckyDraw_Status}" to "${newStatus}"?`
        )
      ) {
        return;
      }

      try {
        const response = await api.put(`/lucky-draw-names/${draw.documentId}`, {
          data: { LuckyDraw_Status: newStatus },
        });

        if (response.status === 200) {
          await fetchDraws();
          alert(`Draw status updated to ${newStatus}`);
        } else {
          throw new Error(`Unexpected status: ${response.status}`);
        }
      } catch (err) {
        console.error("Failed to update status:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert("Session expired. Please login again.");
        } else if (err.response?.status === 404) {
          alert("Draw not found.");
          await fetchDraws();
        } else {
          alert("Failed to update status. Please try again.");
        }
      }
    },
    [checkAuth, fetchDraws]
  );

  const handleViewDetails = useCallback(async (draw) => {
    try {
      const res = await api.get(`/lucky-draw-names/${draw.documentId}`, {
        params: {
          populate: {
            QRcode: true,
            lucky_draw_forms: { count: true },
            lucky_draw_winners: { count: true },
          },
        },
      });
      console.log("Clicked draw:", draw);

      setSelectedDraw(res.data);
      setShowDrawDetailsModal(true);
    } catch (err) {
      console.error("Failed to fetch draw details", err);
      alert("Failed to load draw details");
    }
  }, []);

  const handleNameSubmit = useCallback(() => {
    if (!newDrawData.Name.trim()) {
      alert("Please enter a draw name");
      return;
    }
    setShowNameModal(false);
    setShowDetailsModal(true);
  }, [newDrawData.Name]);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case "Created":
        return "bg-blue-100/80 text-blue-700 border-blue-200/60";
      case "Running":
        return "bg-yellow-100/80 text-yellow-700 border-yellow-200/60";
      case "Completed":
        return "bg-green-100/80 text-green-700 border-green-200/60";
      default:
        return "bg-gray-100/80 text-gray-700 border-gray-200/60";
    }
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case "Created":
        return "📝";
      case "Running":
        return "🎯";
      case "Completed":
        return "🏆";
      default:
        return "📌";
    }
  }, []);

  const formatAmount = useCallback((amount) => {
    if (!amount) return "₹0";
    const num = Number(amount);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(num);
  }, []);

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-sm border border-slate-200/80 p-6"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl bg-gradient-to-b from-blue-500 via-blue-400 to-indigo-400" />
          <div className="ml-4">
            <div className="mb-4 flex items-start justify-between">
              <div className="h-6 w-32 rounded-lg bg-slate-200" />
              <div className="h-4 w-20 rounded-full bg-slate-200" />
            </div>
            <div className="mb-6 space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex justify-between">
                  <div className="h-4 w-24 rounded bg-slate-200" />
                  <div className="h-4 w-16 rounded bg-slate-200" />
                </div>
              ))}
            </div>
            <div className="h-10 rounded-xl bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );

  // Empty State
  const EmptyState = () => (
    <div className="rounded-2xl bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-sm p-12 text-center shadow-lg border border-slate-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-blue-200">
        <span className="text-4xl">🎲</span>
      </div>
      <h3 className="mb-3 text-2xl font-bold text-slate-900">
        No lucky draws yet
      </h3>
      <p className="mb-8 text-slate-500 max-w-md mx-auto">
        Create your first lucky draw to start accepting entries and selecting winners
      </p>
    </div>
  );

  // Auth Error State
  const AuthErrorState = () => (
    <div className="rounded-2xl bg-gradient-to-br from-red-50 to-white p-12 text-center shadow-lg border border-red-100">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-red-100 to-red-200">
        <svg
          className="h-12 w-12 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.771-.833-2.542 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="mb-3 text-2xl font-bold text-slate-900">
        Authentication Required
      </h3>
      <p className="mb-8 text-slate-500">
        Please login to access lucky draw management
      </p>
      <button
        onClick={() => navigate("/")}
        className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:scale-[1.05] hover:shadow-xl"
        type="button"
      >
        Go to Login
      </button>
    </div>
  );

  // Close popup by clicking backdrop
  const closePopup = (setter) => (e) => {
    if (e.target === e.currentTarget) {
      setter(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with Back Button */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="text-center mx-auto">
          {/* Header Section */}
          <header className="mb-16 relative">
            <button
              onClick={() => navigate(`/${adminId}/admindashboard`)}
              className="absolute left-0 -top-12 flex items-center gap-2
                text-slate-600 hover:text-blue-600 font-semibold
                transition-colors duration-200 cursor-pointer"
            >
              <svg
                className="w-5 h-5"
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
              Back to Dashboard
            </button>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-8 tracking-tight">
              🎯 Lucky Draw Manager
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Create and manage exciting lucky draws with prizes, QR code support, and real-time tracking for your events and campaigns.
            </p>
          </header>

          {/* Action Buttons */}
          {!authError && !loading && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Refresh Button */}
              <button
                onClick={fetchDraws}
                disabled={loading}
                className="group bg-white text-slate-700 px-8 py-4 rounded-xl border border-slate-300 hover:border-blue-500 transition-all duration-300 font-bold shadow-lg hover:shadow-xl flex items-center gap-3 w-full sm:w-auto min-w-[240px] justify-center text-lg cursor-pointer"
                type="button"
              >
                <svg
                  className={`h-5 w-5 transition-transform ${
                    loading ? "animate-spin" : "group-hover:rotate-180"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              {/* Create Draw Button */}
              <button
                onClick={() => setShowNameModal(true)}
                className="group bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl flex items-center gap-3 w-full sm:w-auto min-w-[240px] justify-center text-lg cursor-pointer"
                type="button"
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
                New Lucky Draw
              </button>
            </div>
          )}
        </div>
      </section>

      {/* My Lucky Draws Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Section Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            My Lucky Draws
          </h2>
          <p className="text-slate-500">
            Manage and monitor your lucky draw campaigns
          </p>
        </div>

        {/* Content Area */}
        {authError ? (
          <AuthErrorState />
        ) : loading ? (
          <LoadingSkeleton />
        ) : draws.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {draws.map((draw, index) => (
              <div
                key={draw.id}
                className="relative group bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-sm
                 rounded-2xl border border-slate-200/80 p-6
                 hover:border-blue-300/50 hover:shadow-2xl hover:shadow-blue-100/50
                 transition-all duration-500 ease-out
                 hover:-translate-y-2 hover:scale-[1.02] cursor-pointer
                 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleViewDetails(draw)}
              >
                {/* Accent Bar */}
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
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        draw.LuckyDraw_Status === "Running" 
                          ? "bg-emerald-500" 
                          : draw.LuckyDraw_Status === "Created" 
                          ? "bg-yellow-500" 
                          : "bg-blue-500"
                      }`} />
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                            draw.LuckyDraw_Status
                          )} border backdrop-blur-sm shadow-sm`}
                        >
                          {getStatusIcon(draw.LuckyDraw_Status)}
                          {draw.LuckyDraw_Status || "Created"}
                        </span>
                      </div>
                      <h3
                        className="text-xl font-bold text-slate-900 leading-tight line-clamp-2
                         group-hover:text-blue-700 transition-colors duration-300
                         pr-4"
                      >
                        {draw.Name}
                      </h3>
                      <p className="mt-1 text-sm font-mono text-slate-500">
                        ID: {draw.LuckyDrawName_ID}
                      </p>
                    </div>

                    {/* Delete Button with tooltip */}
                    {draw.LuckyDraw_Status !== "Completed" && (
                      <div className="relative group/delete">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDraw(draw);
                          }}
                          title="Delete draw"
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500
                           bg-gradient-to-b from-slate-50 to-white
                           border border-slate-200/60
                           hover:border-rose-200 hover:bg-gradient-to-b hover:from-rose-50 hover:to-white
                           hover:scale-110 active:scale-95
                           transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
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
                          Delete Draw
                        </div>
                      </div>
                    )}
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
                        {draw.Number_of_Peoples || 0}
                      </p>
                      <div className="flex items-center justify-center space-x-1">
                        <div className="p-0.5 rounded bg-blue-100/60">
                          <span className="text-blue-600 text-sm">👥</span>
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Participants
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
                        {formatAmount(draw.Amount).replace('₹', '')}
                      </p>
                      <div className="flex items-center justify-center space-x-1">
                        <div className="p-0.5 rounded bg-indigo-100/60">
                          <span className="text-indigo-600 text-sm">💰</span>
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Prize
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Meta Information */}
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 rounded bg-slate-100/60">
                          <span className="text-slate-500">⏱️</span>
                        </div>
                        <span className="font-medium text-slate-600">
                          Duration
                        </span>
                      </div>
                      <span className="text-slate-500 font-medium">
                        {draw.Duration_Value || "1"} {draw.Duration_Unit || "Week"}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/${draw.id}`);
                    }}
                    className="group/btn w-full py-3.5 rounded-xl
                   bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600
                   text-white font-semibold text-sm tracking-wide
                   hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700
                   active:scale-[0.98]
                   transition-all duration-300 ease-out
                   shadow-lg hover:shadow-xl hover:shadow-blue-500/20
                   relative overflow-hidden cursor-pointer"
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

      {/* Modals */}
      <NameModal
        isOpen={showNameModal}
        onClose={() => setShowNameModal(false)}
        onNext={handleNameSubmit}
        drawName={newDrawData.Name}
        onNameChange={handleInputChange}
        nameInputRef={nameInputRef}
      />

      <CreateDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          resetCreateForm();
        }}
        onBack={() => {
          setShowDetailsModal(false);
          setShowNameModal(true);
        }}
        onSubmit={handleSubmitDraw}
        drawData={newDrawData}
        onInputChange={handleInputChange}
        qrCodePreview={qrCodePreview}
        onFileChange={handleFileChange}
        onRemoveFile={handleRemoveFile}
        creatingDraw={creatingDraw}
        fileInputRef={fileInputRef}
      />

      <DrawDetailsModal
        isOpen={showDrawDetailsModal}
        onClose={() => {
          setShowDrawDetailsModal(false);
          setSelectedDraw(null);
        }}
        draw={selectedDraw}
        onDelete={handleDeleteDraw}
        API_BASE={API_BASE}
      />

      {/* Add custom animations to global styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.3s ease-out forwards;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .backdrop-blur-sm {
          backdrop-filter: blur(8px);
        }
      `}</style>
    </div>
  );
}