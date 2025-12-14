 // components/CandidateDashboard.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import ElectionDashboard from "./ElectionDashboard ";

const API_URL = "https://api.regeve.in/api";

const CandidateDashboard = ({ token = null }) => {
  const location = useLocation();
  const [candidates, setCandidates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [sections, setSections] = useState([]);
  const [newSectionName, setNewSectionName] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [selectedWinnerSection, setSelectedWinnerSection] = useState(null);
  const [winners, setWinners] = useState({});
  const [isFetchingCandidates, setIsFetchingCandidates] = useState(false);
  const [showDeleteSectionConfirm, setShowDeleteSectionConfirm] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [fieldFocus, setFieldFocus] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    whatsApp_number: "",
    age: "",
    position: "",
    gender: "",
    sectionId: null,
  });
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);

  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  // Get election data from navigation state
  const electionData = location.state || {
    electionName: "Untitled Election",
    electionType: "Custom",
    electionCategory: "Custom Election",
    electionId: null,
  };

  const formModalRef = useRef(null);
  const detailsModalRef = useRef(null);
  const deleteModalRef = useRef(null);
  const addSectionRef = useRef(null);
  const winnerPopupRef = useRef(null);
  const deleteSectionModalRef = useRef(null);

  // Show alert message with auto-dismiss
  const showAlert = (type, text, duration = 5000, field = null) => {
    setMessage({ type, text, field });
    if (field) {
      setFieldFocus(field);
    }
    setTimeout(() => {
      setMessage(null);
      setFieldFocus(null);
    }, duration);
  };

  // Auto-focus on field with error
  useEffect(() => {
    if (fieldFocus && formModalRef.current) {
      const input = formModalRef.current.querySelector(`[name="${fieldFocus}"]`);
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [fieldFocus]);

  // Fetch candidates from backend
  useEffect(() => {
    if (sections.length > 0 && electionData.electionId) {
      fetchCandidates();
    }
  }, [electionData.electionId, sections]);

  // Fetch sections from backend
  useEffect(() => {
    fetchSections();
  }, []);

  // Click outside to close modals
  useEffect(() => {
    const handleClickOutside = (event) => {
      const modals = [
        { show: showForm, ref: formModalRef },
        { show: showDetails, ref: detailsModalRef },
        { show: showDeleteConfirm, ref: deleteModalRef },
        { show: showAddSection, ref: addSectionRef },
        { show: showWinnerPopup, ref: winnerPopupRef },
        { show: showDeleteSectionConfirm, ref: deleteSectionModalRef }
      ];

      modals.forEach(({ show, ref }) => {
        if (show && ref.current && !ref.current.contains(event.target)) {
          if (show === showDeleteSectionConfirm) {
            setShowDeleteSectionConfirm(false);
            setSectionToDelete(null);
          } else if (show === showDeleteConfirm) {
            setShowDeleteConfirm(false);
            setCandidateToDelete(null);
          } else if (show === showForm) {
            setShowForm(false);
          } else if (show === showDetails) {
            setShowDetails(false);
          } else if (show === showAddSection) {
            setShowAddSection(false);
            setNewSectionName("");
          } else if (show === showWinnerPopup) {
            setShowWinnerPopup(false);
            setSelectedWinnerSection(null);
          }
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    showForm,
    showDetails,
    showDeleteConfirm,
    showAddSection,
    showWinnerPopup,
    showDeleteSectionConfirm
  ]);

  // Fetch sections from backend
  const fetchSections = async () => {
    try {
      const response = await axiosInstance.get(
        "/election-candidate-positions",
        {
          params: {
            populate: {
              candidates: {
                populate: ["photo"],
              },
            },
          },
        }
      );

      const list = response?.data ?? [];
      const sectionsData = list.map((section) => ({
        id: section.id,
        name: section.Position,
        position: section.Position,
        isOpen: true,
        candidates:
          section.candidates?.map((c) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone_number,
            whatsapp: c.whatsApp_number,
            age: c.age,
            gender: c.gender,
            candidate_id: c.candidate_id,
            position: section.Position,
            photoUrl: c.photo?.url
              ? `https://api.regeve.in${c.photo.url}`
              : null,
          })) || [],
      }));

      setSections(sectionsData);
    } catch (err) {
      console.error("Error fetching sections:", err);
      showAlert("error", "Failed to fetch sections");
    }
  };

  // Fetch candidates from backend
  const fetchCandidates = async () => {
    try {
      const response = await axiosInstance.get("/candidates", {
        params: { populate: ["photo", "election_candidate_position"] },
      });

      const candidatesData = response.data.data.map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone_number,
        whatsapp: candidate.whatsApp_number,
        age: candidate.age,
        gender: candidate.gender,
        candidate_id: candidate.candidate_id,
        section: candidate.section || null,
        position: candidate.position || null,
        photoUrl: candidate.photo?.url
          ? `https://api.regeve.in${candidate.photo.url}`
          : null,
      }));

      setCandidates(candidatesData);

      const updatedSections = sections.map((section) => ({
        ...section,
        candidates: candidatesData.filter((c) => c.section === section.id),
      }));

      setSections(updatedSections);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      showAlert("error", "Failed to fetch candidates");
    }
  };

  // Check for duplicate email, phone, or whatsapp
  const checkDuplicates = (candidateData = formData) => {
    const allCandidates = sections.flatMap(section => section.candidates);
    const errors = {};
    
    // Skip duplicates check if editing existing candidate
    if (selectedCandidate && candidateData.email === selectedCandidate.email) {
      // If email hasn't changed, don't check
    } else if (candidateData.email && allCandidates.some(c => c.email === candidateData.email)) {
      errors.email = "This email is already registered";
      showAlert("error", "A candidate with this email already exists. Please use a different email.", 5000, "email");
    }
    
    if (candidateData.phone_number && allCandidates.some(c => c.phone === candidateData.phone_number)) {
      errors.phone_number = "This phone number is already registered";
      showAlert("error", "A candidate with this phone number already exists. Please use a different number.", 5000, "phone_number");
    }
    
    if (candidateData.whatsApp_number && allCandidates.some(c => c.whatsapp === candidateData.whatsApp_number)) {
      errors.whatsApp_number = "This WhatsApp number is already registered";
      showAlert("error", "A candidate with this WhatsApp number already exists. Please use a different number.", 5000, "whatsApp_number");
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length > 0;
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    const requiredFields = ['name', 'email', 'phone_number', 'sectionId'];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = `${field.replace('_', ' ')} is required`;
      }
    });
    
    // Email format validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Phone number validation - relaxed
    if (formData.phone_number && !/^\d+$/.test(formData.phone_number)) {
      errors.phone_number = "Please enter only numbers";
    }
    
    if (formData.whatsApp_number && !/^\d+$/.test(formData.whatsApp_number)) {
      errors.whatsApp_number = "Please enter only numbers";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
    
    if (name === "sectionId") {
      const id = Number(value);
      const selectedSection = sections.find((s) => s.id === id);
      
      setFormData((prev) => ({
        ...prev,
        sectionId: id,
        position: selectedSection?.position,
      }));
      return;
    }
    
    if (type === "file") {
      setPhoto(files[0]);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      
      // Real-time duplicate check for critical fields
      if (['email', 'phone_number', 'whatsApp_number'].includes(name)) {
        setTimeout(() => {
          checkDuplicates({ ...formData, [name]: value });
        }, 500);
      }
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  // Validate required fields
  if (!validateForm()) {
    const firstErrorField = Object.keys(formErrors)[0];
    if (firstErrorField) {
      showAlert("error", formErrors[firstErrorField], 5000, firstErrorField);
    }
    setLoading(false);
    return;
  }
  
  // Check for duplicates
  if (checkDuplicates()) {
    setLoading(false);
    return;
  }

  try {
    let photoId = null;

    if (photo) {
      const fd = new FormData();
      fd.append("files", photo);

      const uploadResp = await axiosInstance.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (uploadResp.data && uploadResp.data.length > 0) {
        photoId = uploadResp.data[0].id;
      }
    }

    const selectedSection = sections.find(
      (s) => s.id === parseInt(formData.sectionId)
    );

    const payload = {
      data: {
        name: formData.name,
        email: formData.email,
        phone_number: Number(formData.phone_number) || null,
        whatsApp_number: Number(formData.whatsApp_number) || null,
        age: Number(formData.age) || null,
        gender: formData.gender,
        photo: photoId,
        election: electionData.electionId,
        position: selectedSection?.position,
        section: selectedSection?.id,
      },
    };

    const response = await axiosInstance.post("/candidates", payload);

    try {
      const sectionId = Number(formData.sectionId);
      const createdCandidateId = response.data.data.candidate_id;

      await axiosInstance.post(
        `/election-candidate-positions/${sectionId}/add-candidate`,
        { candidateId: createdCandidateId }
      );

      // ✅ IMPORTANT: Update the UI immediately
      const newCandidate = {
        id: response.data.data.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone_number,
        whatsapp: formData.whatsApp_number,
        age: formData.age,
        gender: formData.gender,
        candidate_id: createdCandidateId,
        position: selectedSection?.position,
        section: sectionId,
        photoUrl: photoId ? `https://api.regeve.in${uploadResp.data[0].url}` : null,
      };

      // ✅ Update candidates state
      setCandidates(prev => [...prev, newCandidate]);

      // ✅ Update sections state to show the new candidate immediately
      setSections(prevSections =>
        prevSections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                candidates: [...section.candidates, newCandidate]
              }
            : section
        )
      );

    } catch (err) {
      console.error("❌ Failed to update relation:", err);
      showAlert("error", "Candidate created, but failed to link to election position");
    }

    showAlert("success", "Candidate added successfully");
    
    // Clear form and close modal
    setShowForm(false);
    setFormData({
      name: "",
      email: "",
      phone_number: "",
      whatsApp_number: "",
      age: "",
      gender: "",
      position: "",
      sectionId: null,
    });
    setPhoto(null);
    setFormErrors({});
    
    // Optional: Force fetch updated data from server
    setTimeout(() => {
      fetchSections();
      fetchCandidates();
    }, 500);
    
  } catch (err) {
    console.error(err);
    showAlert("error", `Failed to submit candidate: ${err.response?.data?.error?.message || err.message}`);
  }

  setLoading(false);
};

  // Create new section (Election Position)
  const handleAddSection = async () => {
    if (!newSectionName.trim()) {
      showAlert("error", "Please enter a position name");
      return;
    }

    // Check if section with same name already exists
    if (sections.some(section => section.name.toLowerCase() === newSectionName.trim().toLowerCase())) {
      showAlert("error", "A position with this name already exists");
      return;
    }

    try {
      const payload = {
        data: {
          Position: newSectionName.trim(),
        },
      };

      await axiosInstance.post("/election-candidate-positions", payload);
      await fetchSections();

      setNewSectionName("");
      setShowAddSection(false);
      showAlert("success", `Position "${newSectionName}" created successfully`);
    } catch (err) {
      console.error("Error creating position:", err);
      showAlert("error", "Failed to create position");
    }
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDetails(true);
  };

  const handleDeleteClick = (candidate) => {
    setCandidateToDelete(candidate);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!candidateToDelete) return;

    try {
      await axiosInstance.delete(`/candidates/${candidateToDelete.id}`);

      setSections(
        sections.map((section) => ({
          ...section,
          candidates: section.candidates.filter(
            (c) => c.id !== candidateToDelete.id
          ),
        }))
      );

      setCandidates((prev) =>
        prev.filter((c) => c.id !== candidateToDelete.id)
      );

      showAlert("success", "Candidate deleted successfully");
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to delete candidate");
    }

    setShowDeleteConfirm(false);
    setCandidateToDelete(null);
  };

  const handleDeleteSectionClick = (sectionId, e) => {
    e.stopPropagation();
    const section = sections.find(s => s.id === sectionId);
    setSectionToDelete(section);
    setShowDeleteSectionConfirm(true);
  };

  const handleConfirmDeleteSection = async () => {
    if (!sectionToDelete) return;

    if (sections.length <= 1) {
      showAlert("error", "Cannot delete the last position");
      setShowDeleteSectionConfirm(false);
      setSectionToDelete(null);
      return;
    }

    try {
      await axiosInstance.delete(`/election-candidate-positions/${sectionToDelete.id}`);
      
      setSections(sections.filter((section) => section.id !== sectionToDelete.id));
      await fetchSections();

      showAlert("success", "Position deleted successfully");
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to delete position");
    }

    setShowDeleteSectionConfirm(false);
    setSectionToDelete(null);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleSection = (sectionId) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, isOpen: !section.isOpen }
          : section
      )
    );
  };

  const handleDeclareWinner = (sectionId) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section || section.candidates.length === 0) {
      showAlert("error", "No candidates in this position to declare as winner");
      return;
    }
    setSelectedWinnerSection(section);
    setShowWinnerPopup(true);
  };

  const handleSelectWinner = async (candidate) => {
    try {
      await axiosInstance.put(`/candidates/${candidate.id}`, {
        data: {
          is_winner: true,
          winner_section: selectedWinnerSection.id,
        },
      });

      setWinners((prev) => ({
        ...prev,
        [selectedWinnerSection.id]: candidate,
      }));

      showAlert("success", `${candidate.name} declared as winner for ${selectedWinnerSection.name}`);

      setShowWinnerPopup(false);
      setSelectedWinnerSection(null);
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to declare winner");
    }
  };

  const getWinnerForSection = (sectionId) => {
    return winners[sectionId];
  };

  // Calculate total candidates across all sections
  const totalCandidates = sections.reduce(
    (total, section) => total + section.candidates.length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      {/* Alert Message Container */}
      {message && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] animate-slideDown`}>
          <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
            message.type === "error" 
              ? "bg-red-50 border border-red-200 text-red-800" 
              : "bg-emerald-50 border border-emerald-200 text-emerald-800"
          }`}>
            {message.type === "success" ? (
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            to="/electionhome"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors duration-200 group"
          >
            <svg
              className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-medium">Back to select election</span>
          </Link>
        </div>

        {/* Main Dashboard Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Election Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    {electionData.electionCategory}
                  </span>
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  {totalCandidates} Candidate{totalCandidates !== 1 ? "s" : ""}
                </span>
                <div className="w-px h-4 bg-slate-300"></div>
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {sections.length} Position{sections.length !== 1 ? "s" : ""}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                {electionData.electionName}
              </h1>

              <p className="text-slate-600 text-lg">
                {electionData.electionType} • Candidate Management
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={() => setShowAddSection(true)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl min-w-[160px]"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Position
              </button>

              <button
                onClick={() => navigate("/participationForm")}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl min-w-[160px]"
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Participations
              </button>
            </div>
          </div>
        </div>

        {/* Add Section Modal */}
        {showAddSection && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div
              ref={addSectionRef}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Add Election Position</h3>
                  <p className="text-slate-600 text-sm">Create a new position for candidates</p>
                </div>
              </div>
              
              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Enter position name (e.g., President, Secretary)"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4 text-sm"
                onKeyPress={(e) => e.key === "Enter" && handleAddSection()}
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddSection(false);
                    setNewSectionName("");
                  }}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSection}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium"
                >
                  Create Position
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isFetchingCandidates && (
          <div className="mb-6 text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-slate-600">Loading candidates...</p>
          </div>
        )}

        {/* Sections with Candidates */}
        <div className="space-y-6">
          {sections.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No Election Positions Yet</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Create your first election position for{" "}
                  <strong className="text-blue-600">{electionData.electionName}</strong>
                  . Each position will have its own section of candidates.
                </p>
                <button
                  onClick={() => setShowAddSection(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create First Position
                </button>
              </div>
            </div>
          ) : (
            sections.map((section) => {
              const winner = getWinnerForSection(section.id);

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Section Header */}
                  <div
                    className="p-5 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className={`w-5 h-5 transform transition-transform ${
                          section.isOpen ? "rotate-90 text-blue-600" : "text-slate-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                          {section.name}
                        </h3>
                        <p className="text-sm text-slate-600">
                          Position: {section.position}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                        {section.candidates.length} candidate{section.candidates.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {winner && (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-semibold">Winner Selected</span>
                        </div>
                      )}

                      {section.candidates.length > 0 && !winner && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeclareWinner(section.id);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          Declare Winner
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData((prev) => ({
                            ...prev,
                            sectionId: section.id,
                          }));
                          setShowForm(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Candidate
                      </button>

                      {sections.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteSectionClick(section.id, e)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete position"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Section Content */}
                  {section.isOpen && (
                    <div className="p-5">
                      {/* Winner Display */}
                      {winner && (
                        <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl shadow-inner">
                          <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                              {winner.photoUrl ? (
                                <img
                                  src={winner.photoUrl}
                                  alt={winner.name}
                                  className="w-24 h-24 rounded-full object-cover border-4 border-emerald-400 shadow-xl"
                                />
                              ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center border-4 border-emerald-400 shadow-xl">
                                  <span className="text-white font-bold text-2xl">
                                    {getInitials(winner.name)}
                                  </span>
                                </div>
                              )}
                              <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                            <div className="mb-4">
                              <h4 className="font-bold text-emerald-900 text-xl mb-1">
                                Winner: {winner.name}
                              </h4>
                              <p className="text-emerald-700 text-lg">{winner.position}</p>
                              <p className="text-emerald-600 text-sm mt-2">
                                Winner of {section.name}
                              </p>
                            </div>
                            <button
                              onClick={() => handleViewDetails(winner)}
                              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                            >
                              View Winner Profile
                            </button>
                          </div>
                        </div>
                      )}

                      {section.candidates.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-slate-900 mb-2">
                            No candidates for {section.position}
                          </h4>
                          <button
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                sectionId: section.id,
                              }));
                              setShowForm(true);
                            }}
                            className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                          >
                            Add First Candidate
                          </button>
                        </div>
                      ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {section.candidates.map((candidate) => (
    <div
      key={candidate.id}
      className="bg-white rounded-2xl p-6 border-2 border-black shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
    >
                              <div className="flex flex-col items-center text-center">
                                {/* Candidate Photo with Black Shadow */}
                                 <div className="mb-7 relative">
  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl transform translate-y-1 scale-110"></div>
  {candidate.photoUrl ? (
    <img
      src={candidate.photoUrl}
      alt={candidate.name}
      className="relative w-24 h-24     object-cover mx-auto border-3 border-black shadow-2xl"
    />
                                  ) : (
                                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-xl">
                                      <span className="text-white font-bold text-xl">
                                        {getInitials(candidate.name)}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="w-full text-center mb-6">
  {/* Candidate Name */}
  <h5 className="font-bold text-slate-900 text-xl mb-3">
    {candidate.name}
  </h5>
  
  {/* Position - Make it prominent like in image */}
  <div className="mb-3">
    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
      Position
    </div>
    <div className="text-blue-700 font-bold text-lg bg-gradient-to-r from-blue-100 to-blue-50 px-4 py-2 rounded-lg inline-block">
      {candidate.position}
    </div>
  </div>
  
  {/* Candidate ID */}
  {candidate.candidate_id && (
    <div className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg inline-block">
      ID: {candidate.candidate_id}
    </div>
  )}
</div>

                                <div className="flex gap-3 w-full mt-6">
  <button
    onClick={() => handleViewDetails(candidate)}
    className="flex-1 text-sm bg-gradient-to-r cursor-pointer from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
  >
    View Profile
  </button>
  <button
    onClick={() => handleDeleteClick(candidate)}
    className="flex-1 text-sm bg-gradient-to-r cursor-pointer from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
  >
    Delete
  </button>
</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Candidate Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            ref={formModalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 z-10 rounded-t-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Add New Candidate</h2>
                    <p className="text-slate-600 text-sm mt-1">{electionData.electionName}</p>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Election Position *
                    {formErrors.sectionId && (
                      <span className="text-red-600 text-xs ml-2">({formErrors.sectionId})</span>
                    )}
                  </label>
                  <select
                    name="sectionId"
                    value={formData.sectionId || ""}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                      formErrors.sectionId 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-slate-300'
                    }`}
                  >
                    <option value="">Choose an election position</option>
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.position}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-5 border border-blue-100">
                      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Personal Information
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Full Name *
                            {formErrors.name && (
                              <span className="text-red-600 text-xs ml-2">({formErrors.name})</span>
                            )}
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                              formErrors.name 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                                : 'border-slate-300'
                            }`}
                            placeholder="Enter candidate full name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email Address *
                            {formErrors.email && (
                              <span className="text-red-600 text-xs ml-2">({formErrors.email})</span>
                            )}
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                              formErrors.email 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                                : 'border-slate-300'
                            } ${fieldFocus === 'email' ? 'ring-2 ring-blue-200' : ''}`}
                            placeholder="Enter email address"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Age</label>
                            <input
                              type="number"
                              name="age"
                              value={formData.age}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              placeholder="Age"
                              min="18"
                              max="100"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                              <option value="">Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="others">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Professional Information */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-5 border border-blue-100">
                      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Contact Information
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Phone Number *
                            {formErrors.phone_number && (
                              <span className="text-red-600 text-xs ml-2">({formErrors.phone_number})</span>
                            )}
                          </label>
                          <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                              formErrors.phone_number 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                                : 'border-slate-300'
                            } ${fieldFocus === 'phone_number' ? 'ring-2 ring-blue-200' : ''}`}
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            WhatsApp Number
                            {formErrors.whatsApp_number && (
                              <span className="text-red-600 text-xs ml-2">({formErrors.whatsApp_number})</span>
                            )}
                          </label>
                          <input
                            type="tel"
                            name="whatsApp_number"
                            value={formData.whatsApp_number}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                              formErrors.whatsApp_number 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                                : 'border-slate-300'
                            }`}
                            placeholder="Enter WhatsApp number"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Profile Photo</label>
                          <input
                            type="file"
                            name="photo"
                            onChange={handleInputChange}
                            accept="image/*"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-blue-600 file:text-white hover:file:from-blue-600 hover:file:to-blue-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Adding Candidate..." : "Add Candidate"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Winner Selection Popup */}
      {showWinnerPopup && selectedWinnerSection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            ref={winnerPopupRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 z-10 rounded-t-2xl p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Declare Winner</h2>
                  <p className="text-slate-600 text-sm mt-1">Select the winner for {selectedWinnerSection.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowWinnerPopup(false);
                    setSelectedWinnerSection(null);
                  }}
                  className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedWinnerSection.candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {candidate.photoUrl ? (
                        <img
                          src={candidate.photoUrl}
                          alt={candidate.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-lg">{getInitials(candidate.name)}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{candidate.name}</h4>
                        <p className="text-sm text-slate-600">{candidate.position}</p>
                        {candidate.candidate_id && (
                          <p className="text-xs text-slate-500">ID: {candidate.candidate_id}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleSelectWinner(candidate)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all"
                      >
                        Select Winner
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowWinnerPopup(false);
                    setSelectedWinnerSection(null);
                  }}
                  className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Details Modal - IMPROVED LAYOUT */}
      {showDetails && selectedCandidate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            ref={detailsModalRef}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Candidate Profile</h2>
                  <p className="text-blue-100 text-sm mt-1">Complete candidate information</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Photo and Basic Info */}
                <div className="lg:w-1/3">
                  <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-black/20 rounded-full blur-lg transform scale-110"></div>
                        {selectedCandidate.photoUrl ? (
                          <img
                            src={selectedCandidate.photoUrl}
                            alt={selectedCandidate.name}
                            className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl"
                          />
                        ) : (
                          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center border-4 border-white shadow-2xl">
                            <span className="text-white font-bold text-3xl">
                              {getInitials(selectedCandidate.name)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
                        {selectedCandidate.name}
                      </h3>
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                        {selectedCandidate.position}
                      </div>
                      
                      {selectedCandidate.candidate_id && (
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-1">Candidate ID</p>
                          <p className="text-sm font-medium text-slate-900">{selectedCandidate.candidate_id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:w-2/3">
                  <div className="space-y-6">
                    {/* Contact Information */}
                    <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-6 border border-blue-100">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contact Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Email</p>
                          <p className="text-slate-900 font-medium">{selectedCandidate.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Phone</p>
                          <p className="text-slate-900 font-medium">{selectedCandidate.phone}</p>
                        </div>
                        {selectedCandidate.whatsapp && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">WhatsApp</p>
                            <p className="text-slate-900 font-medium">{selectedCandidate.whatsapp}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Personal Details */}
                    <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-6 border border-blue-100">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Personal Details
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Age</p>
                          <p className="text-slate-900 font-medium">{selectedCandidate.age || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Gender</p>
                          <p className="text-slate-900 font-medium capitalize">{selectedCandidate.gender || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Applied Date</p>
                          <p className="text-slate-900 font-medium">{selectedCandidate.appliedDate || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Candidate Confirmation Modal */}
      {showDeleteConfirm && candidateToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            ref={deleteModalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delete Candidate</h3>
                  <p className="text-sm text-slate-600">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-slate-600 mb-6">
                Are you sure you want to delete <strong className="text-slate-900">{candidateToDelete.name}</strong>? This will remove the candidate from the election permanently.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setCandidateToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-semibold"
                >
                  Delete Candidate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Section Confirmation Modal */}
      {showDeleteSectionConfirm && sectionToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            ref={deleteSectionModalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delete Position</h3>
                  <p className="text-sm text-slate-600">This will delete the position and all its candidates</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-medium mb-2">Warning!</p>
                <p className="text-sm text-red-700">
                  Deleting <strong className="font-semibold">{sectionToDelete.name}</strong> will remove all {sectionToDelete.candidates.length} candidate{sectionToDelete.candidates.length !== 1 ? 's' : ''} in this position. This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteSectionConfirm(false);
                    setSectionToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteSection}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-semibold"
                >
                  Delete Position
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-slate-200 pt-8 mt-8">
        <ElectionDashboard />
      </div>
    </div>
  );
};

export default CandidateDashboard;