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
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [isEditing, setIsediting] = useState(false);
  const [sections, setSections] = useState([]);
  const [newSectionName, setNewSectionName] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [selectedWinnerSection, setSelectedWinnerSection] = useState(null);
  const [winners, setWinners] = useState({});
  const [isFetchingCandidates, setIsFetchingCandidates] = useState(false);

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

  // Get election data from navigation state with fallback values
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

  // Fetch candidates from backend on component mount
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
      if (
        showForm &&
        formModalRef.current &&
        !formModalRef.current.contains(event.target)
      ) {
        setShowForm(false);
      }
      if (
        showDetails &&
        detailsModalRef.current &&
        !detailsModalRef.current.contains(event.target)
      ) {
        setShowDetails(false);
      }
      if (
        showDeleteConfirm &&
        deleteModalRef.current &&
        !deleteModalRef.current.contains(event.target)
      ) {
        setShowDeleteConfirm(false);
        setCandidateToDelete(null);
      }
      if (
        showAddSection &&
        addSectionRef.current &&
        !addSectionRef.current.contains(event.target)
      ) {
        setShowAddSection(false);
        setNewSectionName("");
      }
      if (
        showWinnerPopup &&
        winnerPopupRef.current &&
        !winnerPopupRef.current.contains(event.target)
      ) {
        setShowWinnerPopup(false);
        setSelectedWinnerSection(null);
      }
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
                populate: ["photo"], // Deep populate photos
              },
            },
          },
        }
      );

      console.log("SECTION RESPONSE:", response.data);

      const list = response?.data ?? []; // IMPORTANT FIX

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
    }
  };

  // Upload files to Strapi
  async function uploadFiles(filesArray = []) {
    if (!filesArray || filesArray.length === 0) return [];
    const fd = new FormData();
    filesArray.forEach((file) => fd.append("files", file));
    const uploadResp = await axiosInstance.post("/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return uploadResp.data || [];
  }

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (name === "sectionId") {
      const id = Number(value); // ✅ convert to NUMBER (very important)
      const selectedSection = sections.find((s) => s.id === id);

      setFormData((prev) => ({
        ...prev,
        sectionId: id, // ✅ store NUMBER instead of string
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedMedia = [];
      let photoId = null;

      if (photo) {
        const fd = new FormData();
        fd.append("files", photo);

        const uploadResp = await axiosInstance.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("Upload response:", uploadResp.data);
        console.log("Uploaded photo object:", uploadedMedia[0]);

        uploadedMedia = uploadResp.data;
        if (uploadedMedia && uploadedMedia.length > 0) {
          photoId = uploadedMedia[0].id;
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
          position: selectedSection?.position, // ADD THIS
          section: selectedSection?.id,
        },
      };

      console.log(
        "📦 Final Payload Sent to Strapi:",
        JSON.stringify(payload, null, 2)
      );

      const response = await axiosInstance.post("/candidates", payload);

      
       
      try {
        const sectionId = Number(formData.sectionId);

        const createdCandidateId = response.data.data.candidate_id; // FIXED

        await axiosInstance.post(
          `/election-candidate-positions/${sectionId}/add-candidate`,
          { candidateId: createdCandidateId } // FIXED
        );

        console.log("🔗 Candidate linked to position successfully!");

        await fetchSections();
        await fetchCandidates();
      } catch (err) {
        console.error("❌ Failed to update relation:", err);
        setMessage({
          type: "error",
          text: "Candidate created, but failed to link to election position.",
        });
      }

      // ------------------------------------------------------

      // Update local state with new candidate
      const newCandidate = {
        id: response.data.data.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone_number,
        whatsapp: formData.whatsApp_number,
        age: formData.age,
        gender: formData.gender,
        position: selectedSection?.position,
        photoUrl: photo ? URL.createObjectURL(photo) : null,
        section: parseInt(formData.sectionId),
        appliedDate: new Date().toLocaleDateString(),
        candidate_id: payload.data.candidate_id,
      };

      // Update sections with new candidate
      setSections(
        sections.map((section) =>
          section.id === parseInt(formData.sectionId)
            ? { ...section, candidates: [...section.candidates, newCandidate] }
            : section
        )
      );

      setCandidates((prev) => [...prev, newCandidate]);

      setMessage({
        type: "success",
        text: "Candidate submitted successfully.",
      });
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
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: `Failed to submit candidate: ${
          err.response?.data?.error?.message || err.message
        }`,
      });
    }

    setLoading(false);
  };

  // Create new section (Election Position)
  const handleAddSection = async () => {
    if (!newSectionName.trim()) {
      setMessage({ type: "error", text: "Please enter a section name." });
      return;
    }

    try {
      const payload = {
        data: {
          Position: newSectionName.trim(),
        },
      };

      const response = await axiosInstance.post(
        "/election-candidate-positions",
        payload
      );

      await fetchSections();

      setNewSectionName("");
      setShowAddSection(false);

      setMessage({
        type: "success",
        text: `Position "${newSectionName}" created successfully.`,
      });
    } catch (err) {
      console.error("Error creating position:", err);
    }
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDetails(true);
  };

  const handleDeleteClick = async (candidate) => {
    setCandidateToDelete(candidate);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!candidateToDelete) return;

    try {
      await axiosInstance.delete(`/candidates/${candidateToDelete.id}`);

      // Remove candidate from sections
      setSections(
        sections.map((section) => ({
          ...section,
          candidates: section.candidates.filter(
            (c) => c.id !== candidateToDelete.id
          ),
        }))
      );

      // Remove candidate from main list
      setCandidates((prev) =>
        prev.filter((c) => c.id !== candidateToDelete.id)
      );

      setMessage({
        type: "success",
        text: "Candidate deleted successfully.",
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to delete candidate." });
    }

    setShowDeleteConfirm(false);
    setCandidateToDelete(null);
  };

  const handleDeleteSection = async (sectionId, e) => {
    e.stopPropagation();

    if (sections.length <= 1) {
      setMessage({ type: "error", text: "Cannot delete the last section." });
      return;
    }

    try {
      await axiosInstance.delete(`/election-candidate-positions/${sectionId}`);
      setSections(sections.filter((section) => section.id !== sectionId));

      await fetchSections();

      setMessage({
        type: "success",
        text: "Section deleted successfully.",
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to delete section." });
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
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
      setMessage({
        type: "error",
        text: "No candidates in this section to declare as winner.",
      });
      return;
    }
    setSelectedWinnerSection(section);
    setShowWinnerPopup(true);
  };

  const handleSelectWinner = async (candidate) => {
    try {
      // Update candidate as winner in backend
      await axiosInstance.put(`/candidates/${candidate.id}`, {
        data: {
          is_winner: true,
          winner_section: selectedWinnerSection.id,
        },
      });

      // Update local state
      setWinners((prev) => ({
        ...prev,
        [selectedWinnerSection.id]: candidate,
      }));

      setMessage({
        type: "success",
        text: `${candidate.name} declared as winner for ${selectedWinnerSection.name}`,
      });

      setShowWinnerPopup(false);
      setSelectedWinnerSection(null);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to declare winner." });
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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            to="/electionhome"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors duration-200 group"
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Election Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    {electionData.electionCategory}
                  </span>
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  {totalCandidates} Candidate
                  {totalCandidates !== 1 ? "s" : ""}
                </span>
                <div className="w-px h-4 bg-slate-300"></div>
                <span className="text-sm font-medium text-black bg-blue-200 px-3 py-1 rounded-full">
                  {sections.length} Election Position
                  {sections.length !== 1 ? "s" : ""}
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
                className="flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all duration-200 font-semibold shadow-sm hover:shadow-md min-w-[160px]"
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
                Add Election Position
              </button>

              <button
                onClick={() => navigate("/participationForm")}
                className="flex items-center justify-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md min-w-[160px]"
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
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Add New Election Position
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                The position name will be used for all candidates in this
                section.
              </p>
              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Enter position name (e.g., President, Secretary)"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mb-4"
                onKeyPress={(e) => e.key === "Enter" && handleAddSection()}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddSection(false);
                    setNewSectionName("");
                  }}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSection}
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Create Position
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message.text}
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  No Election Positions Yet
                </h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Create your first election position for{" "}
                  <strong className="text-purple-600">
                    {electionData.electionName}
                  </strong>
                  . Each position will have its own section of candidates.
                </p>
                <button
                  onClick={() => setShowAddSection(true)}
                  className="bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 transition-all duration-200 font-semibold inline-flex items-center gap-2 shadow-sm hover:shadow-md"
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
                  className="bg-white rounded-xl shadow-sm border border-slate-200"
                >
                  {/* Section Header */}
                  <div
                    className="p-5 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className={`w-5 h-5 transform transition-transform ${
                          section.isOpen ? "rotate-90" : ""
                        }`}
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
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {section.name}
                        </h3>
                        <p className="text-sm text-slate-600">
                          Position: {section.position}
                        </p>
                      </div>
                      <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {section.candidates.length} candidate
                        {section.candidates.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {winner && (
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-medium">
                            Winner Selected
                          </span>
                        </div>
                      )}

                      {section.candidates.length > 0 && !winner && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeclareWinner(section.id);
                          }}
                          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                        >
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
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Candidate
                      </button>

                      {sections.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteSection(section.id, e)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete position"
                        >
                          <svg
                            className="w-4 h-4"
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
                      )}
                    </div>
                  </div>

                  {/* Section Content (Collapsible) */}
                  {section.isOpen && (
                    <div className="p-5">
                      {/* Winner Display - IMPROVED */}
                      {winner && (
                        <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl">
                          <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                              {winner.photoUrl ? (
                                <img
                                  src={winner.photoUrl}
                                  alt={winner.name}
                                  className="w-24 h-24 rounded-full object-cover border-4 border-emerald-400 shadow-lg"
                                />
                              ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center border-4 border-emerald-400 shadow-lg">
                                  <span className="text-white font-bold text-2xl">
                                    {getInitials(winner.name)}
                                  </span>
                                </div>
                              )}
                              <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                <svg
                                  className="w-5 h-5 text-white"
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
                            </div>
                            <div className="mb-4">
                              <h4 className="font-bold text-emerald-900 text-xl mb-1">
                                Winner: {winner.name}
                              </h4>
                              <p className="text-emerald-700 text-lg">
                                {winner.position}
                              </p>
                              <p className="text-emerald-600 text-sm mt-2">
                                Winner of {section.name}
                              </p>
                            </div>
                            <button
                              onClick={() => handleViewDetails(winner)}
                              className="px-6 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                              View Winner Profile
                            </button>
                          </div>
                        </div>
                      )}

                      {section.candidates.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                              className="w-8 h-8 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                              />
                            </svg>
                          </div>
                          <h4 className="text-lg font-medium text-slate-900 mb-2">
                            No candidates for {section.position}
                          </h4>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {section.candidates.map((candidate) => (
                            <div
                              key={candidate.id}
                              className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md"
                            >
                              <div className="flex flex-col items-center text-center">
                                {/* Candidate Photo - IMPROVED */}
                                <div className="mb-4">
                                  {candidate.photoUrl ? (
                                    <img
                                      src={candidate.photoUrl}
                                      alt={candidate.name}
                                      className="w-20 h-20 rounded-full object-cover mx-auto border-3 border-blue-100 shadow-sm"
                                    />
                                  ) : (
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                                      <span className="text-white font-semibold text-xl">
                                        {getInitials(candidate.name)}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="w-full">
                                  <h5 className="font-semibold text-slate-900 text-lg mb-1">
                                    {candidate.name}
                                  </h5>
                                  <p className="text-blue-600 font-medium text-sm mb-2">
                                    {candidate.position}
                                  </p>
                                  {candidate.candidate_id && (
                                    <p className="text-xs text-slate-500 mb-4">
                                      ID: {candidate.candidate_id}
                                    </p>
                                  )}
                                </div>

                                <div className="flex gap-2 w-full mt-4">
                                  <button
                                    onClick={() => handleViewDetails(candidate)}
                                    className="flex-1 text-sm bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                  >
                                    View Profile
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(candidate)}
                                    className="flex-1 text-sm bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium"
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
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 z-10 rounded-t-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Add New Candidate
                    </h2>
                    <p className="text-slate-600 text-sm mt-1">
                      {electionData.electionName}
                    </p>
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Election Position *
                  </label>
                  <select
                    name="sectionId"
                    value={formData.sectionId || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
                  >
                    <option value="">Choose an election position</option>
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.position}
                      </option>
                    ))}
                  </select>

                  {formData.sectionId && (
                    <p className="text-sm text-slate-500 mt-2">
                      All candidates in this position will have the same
                      position title.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Personal Information
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                            placeholder="Enter candidate full name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                            placeholder="Enter email address"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Age
                            </label>
                            <input
                              type="number"
                              name="age"
                              value={formData.age}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                              placeholder="Age"
                              min="18"
                              max="100"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Gender
                            </label>
                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
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
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        Contact & Professional
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            WhatsApp Number
                          </label>
                          <input
                            type="tel"
                            name="whatsApp_number"
                            value={formData.whatsApp_number}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                            placeholder="Enter WhatsApp number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Profile Photo
                          </label>
                          <input
                            type="file"
                            name="photo"
                            onChange={handleInputChange}
                            accept="image/*"
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-500 file:text-white hover:file:bg-blue-600"
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
                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Submitting..." : "Add Candidate"}
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
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 z-10 rounded-t-2xl p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Declare Winner
                  </h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Select the winner for {selectedWinnerSection.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowWinnerPopup(false);
                    setSelectedWinnerSection(null);
                  }}
                  className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {selectedWinnerSection.candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {candidate.photoUrl ? (
                        <img
                          src={candidate.photoUrl}
                          alt={candidate.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-lg">
                            {getInitials(candidate.name)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-slate-900">
                          {candidate.name}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {candidate.position}
                        </p>
                        {candidate.candidate_id && (
                          <p className="text-xs text-slate-500">
                            ID: {candidate.candidate_id}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectWinner(candidate)}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Select as Winner
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowWinnerPopup(false);
                    setSelectedWinnerSection(null);
                  }}
                  className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Details Modal - IMPROVED */}
      {showDetails && selectedCandidate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            ref={detailsModalRef}
            className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] w-full max-w-2xl overflow-hidden animate-fadeIn"
          >
            {/* Header */}
            <div className="px-7 py-5 border-b border-slate-200 bg-white/70 backdrop-blur-xl flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                Candidate Profile
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Body - IMPROVED LAYOUT */}
            <div className="p-8">
              <div className="flex flex-col items-center">
                {/* Photo Section - CENTERED */}
                <div className="mb-8">
                  {selectedCandidate.photoUrl ? (
                    <img
                      src={selectedCandidate.photoUrl}
                      alt={selectedCandidate.name}
                      className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-xl mx-auto"
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-xl">
                      <span className="text-white font-bold text-4xl">
                        {getInitials(selectedCandidate.name)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name and Position - CENTERED */}
                <div className="text-center mb-10">
                  <h3 className="text-3xl font-bold text-slate-900 mb-2">
                    {selectedCandidate.name}
                  </h3>
                  <p className="text-blue-600 font-semibold text-lg">
                    {selectedCandidate.position}
                  </p>
                  {selectedCandidate.candidate_id && (
                    <p className="text-sm text-slate-500 mt-3">
                      Candidate ID: {selectedCandidate.candidate_id}
                    </p>
                  )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="bg-slate-50 rounded-xl p-5">
                      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          />
                        </svg>
                        Contact Information
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">
                            Email
                          </p>
                          <p className="text-slate-900 font-medium break-all">
                            {selectedCandidate.email}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">
                            Phone
                          </p>
                          <p className="text-slate-900 font-medium">
                            {selectedCandidate.phone}
                          </p>
                        </div>

                        {selectedCandidate.whatsapp && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">
                              WhatsApp
                            </p>
                            <p className="text-slate-900 font-medium">
                              {selectedCandidate.whatsapp}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="bg-slate-50 rounded-xl p-5">
                      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Personal Details
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">
                            Age
                          </p>
                          <p className="text-slate-900 font-medium">
                            {selectedCandidate.age || "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">
                            Gender
                          </p>
                          <p className="text-slate-900 font-medium capitalize">
                            {selectedCandidate.gender || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Applied Date - CENTERED */}
                <div className="mt-10 pt-6 border-t border-slate-200 text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                    Applied Date
                  </p>
                  <p className="text-slate-900 font-semibold">
                    {selectedCandidate.appliedDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && candidateToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            ref={deleteModalRef}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Delete Candidate
                </h3>
              </div>

              <p className="text-slate-600 mb-6">
                Are you sure you want to delete{" "}
                <strong>{candidateToDelete.name}</strong>? This action cannot be
                undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setCandidateToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                >
                  Delete Candidate
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
