import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "https://api.regeve.in/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// For file uploads
const uploadApi = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
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

export default function LuckyDrawHome() {
  const { adminId } = useParams();
  const navigate = useNavigate();
  
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  
  // Create Draw States - Modified for two-step flow
  const [showNameModal, setShowNameModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newDrawData, setNewDrawData] = useState({
    Name: "",
    Number_of_Peoples: "",
    Amount: "",
    Upi_Id: "",
    Duration_Value: "",
    Duration_Unit: "Week",
    LuckyDraw_Status: "Created"
  });
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState(null);
  const [creatingDraw, setCreatingDraw] = useState(false);
  
  // Details Modal State
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [showDrawDetailsModal, setShowDrawDetailsModal] = useState(false);
  
  // Refs
  const nameModalRef = useRef(null);
  const detailsModalRef = useRef(null);
  const drawDetailsModalRef = useRef(null);
  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);

  const checkAuth = () => {
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
  };

  const fetchDraws = async () => {
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
            admin: { fields: ['id'] }
          },
          filters: {
            admin: { id: { $eq: adminId } }
          }
        }
      });
      
      if (res.status === 200) {
        setDraws(res.data.data || []);
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
  };

  useEffect(() => {
    fetchDraws();
  }, [adminId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDrawData({
      ...newDrawData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrCodeFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadQRCode = async () => {
    if (!qrCodeFile) return null;

    const formData = new FormData();
    formData.append('files', qrCodeFile);
    
    try {
      const response = await uploadApi.post('/upload', formData);
      if (response.data && response.data.length > 0) {
        return response.data[0].id;
      }
    } catch (error) {
      console.error("Failed to upload QR code:", error);
      throw error;
    }
    return null;
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
      
      // Upload QR code if exists
      if (qrCodeFile) {
        qrCodeId = await uploadQRCode();
      }

      const drawPayload = {
        data: {
          ...newDrawData,
          Number_of_Peoples: parseInt(newDrawData.Number_of_Peoples) || 0,
          Amount: parseInt(newDrawData.Amount) || 0,
          Duration_Value: parseInt(newDrawData.Duration_Value) || 1,
          admin: { connect: [adminId] }
        }
      };

      // Add QR code if uploaded
      if (qrCodeId) {
        drawPayload.data.QRcode = { connect: [qrCodeId] };
      }

      const response = await api.post("/lucky-draw-names", drawPayload);
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

  const resetCreateForm = () => {
    setNewDrawData({
      Name: "",
      Number_of_Peoples: "",
      Amount: "",
      Upi_Id: "",
      Duration_Value: "",
      Duration_Unit: "Week",
      LuckyDraw_Status: "Created"
    });
    setQrCodeFile(null);
    setQrCodePreview(null);
  };

  const handleDeleteDraw = async (draw) => {
    if (!checkAuth()) {
      alert("Please login to delete a lucky draw");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${draw.Name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/lucky-draw-names/${draw.id}`);
      
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
  };

  const handleUpdateStatus = async (draw, newStatus) => {
    if (!checkAuth()) {
      alert("Please login to update draw status");
      return;
    }

    if (draw.LuckyDraw_Status === "Completed") {
      alert("Completed draws cannot be updated");
      return;
    }

    if (!window.confirm(`Change draw status from "${draw.LuckyDraw_Status}" to "${newStatus}"?`)) {
      return;
    }

    try {
      const response = await api.put(
        `/lucky-draw-names/${draw.id}`,
        {
          data: { LuckyDraw_Status: newStatus }
        }
      );
      
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
  };

  const handleViewDetails = (draw) => {
    setSelectedDraw(draw);
    setShowDrawDetailsModal(true);
  };

  const handleBackdropClick = (e, modalType) => {
    if (modalType === 'name' && nameModalRef.current && !nameModalRef.current.contains(e.target)) {
      setShowNameModal(false);
    }
    if (modalType === 'details' && detailsModalRef.current && !detailsModalRef.current.contains(e.target)) {
      setShowDetailsModal(false);
      resetCreateForm();
    }
    if (modalType === 'drawDetails' && drawDetailsModalRef.current && !drawDetailsModalRef.current.contains(e.target)) {
      setShowDrawDetailsModal(false);
      setSelectedDraw(null);
    }
  };

  const handleNameSubmit = () => {
    if (!newDrawData.Name.trim()) {
      alert("Please enter a draw name");
      return;
    }
    setShowNameModal(false);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Created": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Running": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Created": return "📝";
      case "Running": return "🎯";
      case "Completed": return "🏆";
      default: return "📌";
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return "₹0";
    const num = Number(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Step 1: Name Modal
  const NameModal = () => (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => handleBackdropClick(e, 'name')}
    >
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300" />
      
      <div 
        ref={nameModalRef}
        className="relative w-full max-w-md transform transition-all duration-300 scale-100 animate-fadeIn"
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
                  <h3 className="text-xl font-bold text-gray-900">Create New Lucky Draw</h3>
                  <p className="mt-1 text-sm text-gray-500">Step 1: Enter draw name</p>
                </div>
              </div>
              <button
                onClick={() => setShowNameModal(false)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 hover:scale-110 active:scale-95"
                type="button"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                value={newDrawData.Name}
                onChange={handleInputChange}
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
              onClick={() => setShowNameModal(false)}
              className="rounded-xl px-6 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:scale-[1.02] active:scale-95"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleNameSubmit}
              disabled={!newDrawData.Name.trim()}
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

  // Step 2: Details Modal
  const CreateDetailsModal = () => (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => handleBackdropClick(e, 'details')}
    >
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300" />
      
      <div 
        ref={detailsModalRef}
        className="relative w-full max-w-4xl transform transition-all duration-300 scale-100 animate-fadeIn"
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
                  <h3 className="text-xl font-bold text-gray-900">Complete Draw Details</h3>
                  <p className="mt-1 text-sm text-gray-500">Step 2: Add draw details for "{newDrawData.Name}"</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  resetCreateForm();
                }}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 hover:scale-110 active:scale-95"
                type="button"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">DRAW INFORMATION</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Number of People
                      </label>
                      <input
                        type="number"
                        name="Number_of_Peoples"
                        value={newDrawData.Number_of_Peoples}
                        onChange={handleInputChange}
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
                        value={newDrawData.Amount}
                        onChange={handleInputChange}
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
                        value={newDrawData.Duration_Value}
                        onChange={handleInputChange}
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
                        value={newDrawData.Duration_Unit}
                        onChange={handleInputChange}
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
                        value={newDrawData.Upi_Id}
                        onChange={handleInputChange}
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
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">QR CODE UPLOAD</h4>
                  
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
                        onChange={handleFileChange}
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
                              setQrCodeFile(null);
                              setQrCodePreview(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove QR Code
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <p className="text-gray-600">Click to upload QR code</p>
                          <p className="text-sm text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="rounded-xl bg-gray-50 p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">DRAW PREVIEW</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Draw Name:</span>
                      <span className="text-sm font-semibold text-gray-900">{newDrawData.Name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">People:</span>
                      <span className="text-sm font-medium text-gray-900">{newDrawData.Number_of_Peoples || "0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Prize Amount:</span>
                      <span className="text-sm font-bold text-gray-900">{formatAmount(newDrawData.Amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {newDrawData.Duration_Value || "1"} {newDrawData.Duration_Unit}
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
              onClick={() => {
                setShowDetailsModal(false);
                setShowNameModal(true);
              }}
              className="rounded-xl px-6 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:scale-[1.02] active:scale-95"
              type="button"
            >
              ← Back
            </button>
            
            <button
              onClick={handleSubmitDraw}
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

  // Details Modal Component
  const DrawDetailsModal = () => {
    if (!selectedDraw) return null;

    const qrCodeUrl = selectedDraw.QRcode?.url 
      ? (selectedDraw.QRcode.url.startsWith('http') 
          ? selectedDraw.QRcode.url 
          : `${API_BASE}${selectedDraw.QRcode.url}`)
      : null;

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => handleBackdropClick(e, 'drawDetails')}
      >
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300" />
        
        <div 
          ref={drawDetailsModalRef}
          className="relative w-full max-w-2xl transform transition-all duration-300 scale-100 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6 sticky top-0 bg-white/95 backdrop-blur-sm z-10 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getStatusColor(selectedDraw.LuckyDraw_Status)}`}>
                    <span className="text-xl">{getStatusIcon(selectedDraw.LuckyDraw_Status)}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedDraw.Name}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(selectedDraw.LuckyDraw_Status)} border`}>
                        {selectedDraw.LuckyDraw_Status}
                      </span>
                      <span className="text-sm text-gray-500">ID: {selectedDraw.LuckyDrawName_ID}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDrawDetailsModal(false)}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 hover:scale-110 active:scale-95"
                  type="button"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                    <h4 className="text-sm font-semibold text-gray-500 mb-3">DRAW INFORMATION</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Participants:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedDraw.Number_of_Peoples || "0"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Prize Amount:</span>
                        <span className="text-sm font-semibold text-gray-900">{formatAmount(selectedDraw.Amount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Duration:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedDraw.Duration_Value} {selectedDraw.Duration_Unit || "Week"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">UPI ID:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedDraw.Upi_Id || "Not set"}</span>
                      </div>
                      {selectedDraw.Last_Luckydraw_Spin_Date && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Last Draw:</span>
                          <span className="text-sm font-medium text-gray-900">{formatDate(selectedDraw.Last_Luckydraw_Spin_Date)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {qrCodeUrl && (
                    <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm text-center">
                      <h4 className="text-sm font-semibold text-gray-500 mb-3">QR CODE</h4>
                      <div className="flex justify-center">
                        <img 
                          src={qrCodeUrl} 
                          alt="QR Code"
                          className="w-48 h-48 object-contain rounded-lg border border-gray-300"
                        />
                      </div>
                      <p className="mt-3 text-xs text-gray-500">Scan to participate</p>
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
                      <div className="text-sm font-semibold text-green-800">Total Entries</div>
                      <div className="text-lg font-bold text-green-900">
                        {selectedDraw.lucky_draw_forms?.count || 0}
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
                      <div className="text-sm font-semibold text-purple-800">Winners</div>
                      <div className="text-lg font-bold text-purple-900">
                        {selectedDraw.lucky_draw_winners?.count || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end space-x-3 pt-6 border-t border-gray-200 p-6">
              <button
                onClick={() => setShowDrawDetailsModal(false)}
                className="rounded-xl px-6 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:scale-[1.02] active:scale-95"
                type="button"
              >
                Close
              </button>
              {selectedDraw.LuckyDraw_Status !== "Completed" && (
                <button
                  onClick={() => {
                    setShowDrawDetailsModal(false);
                    handleDeleteDraw(selectedDraw);
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

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="h-6 w-32 rounded-lg bg-gray-200" />
              <div className="h-4 w-20 rounded-full bg-gray-200" />
            </div>
            <div className="mb-6 space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex justify-between">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="h-4 w-16 rounded bg-gray-200" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-10 rounded-lg bg-gray-200" />
              <div className="h-10 rounded-lg bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty State
  const EmptyState = () => (
    <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-12 text-center shadow-lg border border-gray-200 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-blue-200 animate-bounce">
        <span className="text-4xl">🎲</span>
      </div>
      <h3 className="mb-3 text-2xl font-bold text-gray-900">No lucky draws yet</h3>
      <p className="mb-8 text-gray-500 max-w-md mx-auto">
        Create your first lucky draw to start accepting entries and selecting winners
      </p>
      <button
        onClick={() => setShowNameModal(true)}
        className="group relative rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 font-medium text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:scale-[1.05] hover:shadow-xl active:scale-95 overflow-hidden"
        type="button"
      >
        <span className="relative z-10 flex items-center gap-2">
          <svg className="h-5 w-5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create First Draw
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
    </div>
  );

  // Auth Error State
  const AuthErrorState = () => (
    <div className="rounded-2xl bg-gradient-to-br from-red-50 to-white p-12 text-center shadow-lg border border-red-100 animate-shake">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-red-100 to-red-200">
        <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.771-.833-2.542 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="mb-3 text-2xl font-bold text-gray-900">Authentication Required</h3>
      <p className="mb-8 text-gray-500">Please login to access lucky draw management</p>
      <button
        onClick={() => navigate("/")}
        className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:scale-[1.05] hover:shadow-xl"
        type="button"
      >
        Go to Login
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <div className="relative border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:gap-0">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🎯 Lucky Draw Manager
              </h1>
              <p className="text-gray-600 mb-2">Create and manage your lucky draws</p>
              {adminId && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                  <span>Admin ID:</span>
                  <span className="font-mono">{adminId}</span>
                </div>
              )}
            </div>
            {!authError && !loading && (
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={fetchDraws}
                  disabled={loading}
                  className="group rounded-xl border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:scale-[1.02] active:scale-95 hover:border-gray-400 disabled:opacity-50"
                  type="button"
                >
                  <span className="flex items-center gap-2">
                    <svg className={`h-4 w-4 transition-transform ${loading ? "animate-spin" : "group-hover:rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {loading ? "Refreshing..." : "Refresh"}
                  </span>
                </button>
                <button
                  onClick={() => setShowNameModal(true)}
                  className="group relative rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:scale-[1.05] hover:shadow-xl active:scale-95 overflow-hidden"
                  type="button"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="h-5 w-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Lucky Draw
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        {!authError && !loading && draws.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 animate-fadeIn">
            <div className="group rounded-2xl bg-white p-6 shadow-lg border border-gray-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Draws</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {draws.length}
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎲</span>
                </div>
              </div>
            </div>
            
            <div className="group rounded-2xl bg-white p-6 shadow-lg border border-gray-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Prize Pool</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                    {formatAmount(draws.reduce((total, draw) => total + (Number(draw.Amount) || 0), 0))}
                  </p>
                </div>
                <div className="rounded-xl bg-green-50 p-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
            
            <div className="group rounded-2xl bg-white p-6 shadow-lg border border-gray-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Draws</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {draws.filter(draw => draw.LuckyDraw_Status === "Running").length}
                  </p>
                </div>
                <div className="rounded-xl bg-purple-50 p-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">⚡</span>
                </div>
              </div>
            </div>
          </div>
        )}

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
                className="group overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:border-blue-300 animate-slideIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  {/* Draw Header */}
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(draw.LuckyDraw_Status)} border`}>
                          {getStatusIcon(draw.LuckyDraw_Status)}
                          {draw.LuckyDraw_Status || "Created"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {draw.Name}
                      </h3>
                      <p className="mt-1 text-sm font-mono text-gray-500">
                        ID: {draw.LuckyDrawName_ID}
                      </p>
                    </div>
                  </div>

                  {/* Draw Details */}
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-500 flex items-center gap-2">
                        <span>👥</span>
                        Participants:
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {draw.Number_of_Peoples || "0"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-500 flex items-center gap-2">
                        <span>💰</span>
                        Prize Amount:
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatAmount(draw.Amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-500 flex items-center gap-2">
                        <span>⏱️</span>
                        Duration:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {draw.Duration_Value || "1"} {draw.Duration_Unit || "Week"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-500 flex items-center gap-2">
                        <span>📱</span>
                        UPI ID:
                      </span>
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                        {draw.Upi_Id || "Not set"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {/* Status Buttons */}
                    {draw.LuckyDraw_Status !== "Completed" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(draw, "Running")}
                          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                            draw.LuckyDraw_Status === "Running"
                              ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg"
                              : "bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100"
                          }`}
                          type="button"
                        >
                          {draw.LuckyDraw_Status === "Running" ? "🏃 Running" : "▶️ Start"}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(draw, "Completed")}
                          className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-green-600 hover:to-green-700 active:scale-95"
                          type="button"
                        >
                          🏆 Complete
                        </button>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(draw)}
                        className="flex-1 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white px-4 py-2.5 text-sm font-medium text-blue-700 transition-all duration-200 hover:scale-[1.02] hover:border-blue-300 hover:bg-blue-50 active:scale-95 group/view"
                        type="button"
                      >
                        <span className="flex items-center justify-center gap-2">
                          👁️ View Details
                          <svg className="w-4 h-4 transition-transform group-hover/view:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </button>
                      
                      {draw.LuckyDraw_Status !== "Completed" && (
                        <button
                          onClick={() => handleDeleteDraw(draw)}
                          className="flex-1 rounded-xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 transition-all duration-200 hover:scale-[1.02] hover:bg-red-100 hover:border-red-300 active:scale-95 group/delete"
                          type="button"
                        >
                          <span className="flex items-center justify-center gap-2">
                            🗑️ Delete
                            <svg className="w-4 h-4 transition-transform group-hover/delete:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showNameModal && <NameModal />}
      {showDetailsModal && <CreateDetailsModal />}
      {showDrawDetailsModal && <DrawDetailsModal />}

      {/* Add custom animations to global styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
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
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        
        .backdrop-blur-sm {
          backdrop-filter: blur(8px);
        }
      `}</style>
    </div>
  );
}