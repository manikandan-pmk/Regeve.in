// components/CandidateDashboard.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import axios from "axios";
import ElectionDashboard from "./ElectionDashboard ";
import { adminNavigate } from "../../utils/adminNavigation";

const API_URL = "https://api.regeve.in/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const CandidateDashboard = () => {
  const { adminId, electionDocumentId } = useParams();
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
  const [isFetchingCandidates, setIsFetchingCandidates] = useState(false);
  const [showDeleteSectionConfirm, setShowDeleteSectionConfirm] =
    useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [fieldFocus, setFieldFocus] = useState(null);
  const [showStartElection, setShowStartElection] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startingElection, setStartingElection] = useState(false);
  const [electionStarted, setElectionStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [electionStatus, setElectionStatus] = useState(null);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [declaringWinner, setDeclaringWinner] = useState(false);
  const [celebratingWinner, setCelebratingWinner] = useState(false);

  // Add these state variables alongside your existing ones
  const [startDate, setStartDate] = useState("");
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [endDate, setEndDate] = useState("");
  const [endHour, setEndHour] = useState("17");
  const [endMinute, setEndMinute] = useState("00");

  const reloadRef = useRef({
    started: false,
    ended: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    whatsApp_number: "",
    age: "",
    gender: "",
    sectionId: null,
  });
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);

  const formModalRef = useRef(null);
  const detailsModalRef = useRef(null);
  const deleteModalRef = useRef(null);
  const addSectionRef = useRef(null);
  const winnerPopupRef = useRef(null);
  const deleteSectionModalRef = useRef(null);

  const [electionMeta, setElectionMeta] = useState({
    electionName: "",
    electionType: "",
    electionCategory: "",
    start_time: null, // ✅ ADD
    end_time: null, // ✅ ADD
    election_status: null, // ✅ ADD
  });

  // Helper functions for date/time handling
  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const updateStartTime = (date, hour, minute) => {
    if (!date || hour === "" || minute === "") return;
    setStartTime(`${date}T${hour}:${minute}:00`);
  };
  const updateEndTime = (date, hour, minute) => {
    if (!date || hour === "" || minute === "") return;
    setEndTime(`${date}T${hour}:${minute}:00`);
  };

  // Initialize date/time when modal opens
  useEffect(() => {
    if (showStartElection) {
      const now = new Date();
      const currentDate = now.toISOString().split("T")[0];
      const currentHour = now.getHours().toString().padStart(2, "0");
      const currentMinute = now.getMinutes().toString().padStart(2, "0");

      // Calculate 10 minutes from now
      const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);
      const startHourStr = tenMinutesLater
        .getHours()
        .toString()
        .padStart(2, "0");
      const startMinuteStr = tenMinutesLater
        .getMinutes()
        .toString()
        .padStart(2, "0");

      setStartDate(currentDate);
      setStartHour(startHourStr);
      setStartMinute(startMinuteStr);
      updateStartTime(currentDate, startHourStr, startMinuteStr);

      // Set end time to 8 hours later by default
      const endDateTime = new Date(
        tenMinutesLater.getTime() + 8 * 60 * 60 * 1000
      );
      const endDateStr = endDateTime.toISOString().split("T")[0];
      const endHourStr = endDateTime.getHours().toString().padStart(2, "0");
      const endMinuteStr = endDateTime.getMinutes().toString().padStart(2, "0");

      setEndDate(endDateStr);
      setEndHour(endHourStr);
      setEndMinute(endMinuteStr);
      updateEndTime(endDateStr, endHourStr, endMinuteStr);
    }
  }, [showStartElection]);

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
      const input = formModalRef.current.querySelector(
        `[name="${fieldFocus}"]`
      );
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [fieldFocus]);

  // Fetch sections from backend
  useEffect(() => {
    if (!electionDocumentId) return;

    const fetchElectionMeta = async () => {
      try {
        const res = await axiosInstance.get(
          `/election-names/${electionDocumentId}`
        );

        const election = res.data?.data;

        if (!election) {
          console.error("Election not found with documentId:");
          showAlert("error", "Election not found");
          adminNavigate(navigate, "/electionhome");
          return;
        }

        setElectionMeta({
          electionName: election.Election_Name,
          electionType: election.Election_Type,
          electionCategory: election.Election_Category,
          start_time: election.start_time,
          end_time: election.end_time,
          election_status: election.election_status,
        });
      } catch (err) {
        console.error("Election meta fetch failed:", err);
        showAlert("error", "Failed to load election data");
        adminNavigate(navigate, "/electionhome");
      }
    };

    fetchElectionMeta();
  }, [electionDocumentId]);

  const refetchElectionMeta = async () => {
    const res = await axiosInstance.get(
      `/election-names/${electionDocumentId}`
    );
    const election = res.data?.data;
    setElectionMeta({
      electionName: election.Election_Name,
      electionType: election.Election_Type,
      electionCategory: election.Election_Category,
      start_time: election.start_time,
      end_time: election.end_time,
      election_status: election.election_status,
    });
  };

  useEffect(() => {
    if (!electionMeta.election_status) return;
    setElectionStatus(electionMeta.election_status);
  }, [electionMeta.election_status]);

  useEffect(() => {
    if (!electionMeta.start_time || !electionMeta.end_time) return;
    if (!electionDocumentId) return;

    const START_KEY = `election_${electionDocumentId}_start_reloaded`;
    const END_KEY = `election_${electionDocumentId}_end_reloaded`;

    const interval = setInterval(() => {
      const now = Date.now();
      const start = new Date(electionMeta.start_time).getTime();
      const end = new Date(electionMeta.end_time).getTime();

      // ⏳ BEFORE START
      if (now < start) {
        const diff = start - now;
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);

        if (diff <= 1000) {
          setTimeLeft("Starting...");

          if (!sessionStorage.getItem(START_KEY)) {
            sessionStorage.setItem(START_KEY, "true");
            clearInterval(interval);

            setTimeout(() => {
              window.location.reload();
            }, 1500);
          }
        } else {
          setTimeLeft(`Starts in ${h}h ${m}m ${s}s`);
        }
        return;
      }

      // 🟢 ACTIVE
      if (now >= start && now < end) {
        const diff = end - now;
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);

        setTimeLeft(`Ends in ${h}h ${m}m ${s}s`);
        return;
      }

      // 🔴 ENDED → reload ONCE per election
      if (now >= end) {
        setTimeLeft("Election Ended");

        if (!sessionStorage.getItem(END_KEY)) {
          sessionStorage.setItem(END_KEY, "true");
          clearInterval(interval);

          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [electionMeta.start_time, electionMeta.end_time, electionDocumentId]);

  useEffect(() => {
    if (!electionDocumentId) return;

    const START_KEY = `election_${electionDocumentId}_start_reloaded`;
    const END_KEY = `election_${electionDocumentId}_end_reloaded`;

    // If page loaded AFTER a reload-trigger
    if (sessionStorage.getItem(START_KEY)) {
      sessionStorage.removeItem(START_KEY);
    }
  }, [electionDocumentId]);

  // Click outside to close modals
  useEffect(() => {
    const handleClickOutside = (event) => {
      const modals = [
        { show: showForm, ref: formModalRef },
        { show: showDetails, ref: detailsModalRef },
        { show: showDeleteConfirm, ref: deleteModalRef },
        { show: showAddSection, ref: addSectionRef },
        { show: showWinnerPopup, ref: winnerPopupRef },
        { show: showDeleteSectionConfirm, ref: deleteSectionModalRef },
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
    showDeleteSectionConfirm,
  ]);

  // Fetch sections from backend
  const fetchSections = async () => {
    try {
      setIsFetchingCandidates(true);

      const response = await axiosInstance.get(
        `/election-candidate-positions?electionId=${electionDocumentId}`
      );

      // backend returns { data: [...] }
      const list = response.data.data;

      const sectionsData = list.map((section) => ({
        id: section.id,
        name: section.Position,
        position: section.Position,
        isOpen: true,
        election_name: section.election_name,
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
            IsWinnedCandidate: c.IsWinnedCandidate,
            vote_count: c.vote_count,
            photoUrl: c.photo?.url
              ? `https://api.regeve.in${c.photo.url}`
              : null,
          })) || [],
      }));

      setSections(sectionsData);
    } catch (err) {
      console.error("Error fetching sections:", err);
      showAlert("error", "Failed to fetch sections");
    } finally {
      setIsFetchingCandidates(false);
    }
  };

  useEffect(() => {
    if (electionDocumentId) {
      fetchSections();
    }
  }, [electionDocumentId]);

  // Check for duplicate email, phone, or whatsapp
  const checkDuplicates = (candidateData = formData) => {
    const allCandidates = sections.flatMap((section) => section.candidates);
    const errors = {};

    // Skip duplicates check if editing existing candidate
    if (selectedCandidate && candidateData.email === selectedCandidate.email) {
      // If email hasn't changed, don't check
    } else if (
      candidateData.email &&
      allCandidates.some((c) => c.email === candidateData.email)
    ) {
      errors.email = "This email is already registered";
      showAlert(
        "error",
        "A candidate with this email already exists. Please use a different email.",
        5000,
        "email"
      );
    }

    if (
      candidateData.phone_number &&
      allCandidates.some((c) => c.phone === candidateData.phone_number)
    ) {
      errors.phone_number = "This phone number is already registered";
      showAlert(
        "error",
        "A candidate with this phone number already exists. Please use a different number.",
        5000,
        "phone_number"
      );
    }

    if (
      candidateData.whatsApp_number &&
      allCandidates.some((c) => c.whatsapp === candidateData.whatsApp_number)
    ) {
      errors.whatsApp_number = "This WhatsApp number is already registered";
      showAlert(
        "error",
        "A candidate with this WhatsApp number already exists. Please use a different number.",
        5000,
        "whatsApp_number"
      );
    }

    setFormErrors(errors);
    return Object.keys(errors).length > 0;
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    const requiredFields = ["name", "email", "phone_number", "sectionId"];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = `${field.replace("_", " ")} is required`;
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
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }

    if (name === "sectionId") {
      const id = Number(value);
      const selectedSection = sections.find((s) => s.id === id);

      setFormData((prev) => ({
        ...prev,
        sectionId: id,
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
      if (["email", "phone_number", "whatsApp_number"].includes(name)) {
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

      console.log("Token exists:", !!localStorage.getItem("jwt"));
      console.log("Token:", localStorage.getItem("jwt"));

      if (photo) {
        const fd = new FormData();
        fd.append("files", photo);

        try {
          const uploadResp = await axiosInstance.post("/upload", fd);

          if (uploadResp.data && uploadResp.data.length > 0) {
            photoId = uploadResp.data[0].id;
            console.log("Photo uploaded, ID:", photoId);
          }
        } catch (uploadErr) {
          console.error("Photo upload failed:", uploadErr);
          showAlert(
            "warning",
            "Photo upload failed, creating candidate without photo"
          );
        }
      }

      // FIXED PAYLOAD STRUCTURE
      const payload = {
        data: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          // Convert strings to numbers or null
          phone_number: formData.phone_number
            ? Number(formData.phone_number)
            : null,
          whatsApp_number: formData.whatsApp_number
            ? Number(formData.whatsApp_number)
            : null,
          age: formData.age ? Number(formData.age) : null,
          gender: formData.gender || null,
          photo: photoId, // This should be the ID, not the object
          // CRITICAL: This field must match your relation name
          election_candidate_position: Number(formData.sectionId),
          election_name: electionDocumentId, // documentId string
        },
      };

      console.log("SECTION ID:", formData.sectionId);

      // Make the API call
      const response = await axiosInstance.post("/candidates", payload);

      if (response.status === 201) {
        showAlert("success", "Candidate added successfully");

        // Reset form
        setShowForm(false);
        setFormData({
          name: "",
          email: "",
          phone_number: "",
          whatsApp_number: "",
          age: "",
          gender: "",
          sectionId: null,
        });
        setPhoto(null);
        setFormErrors({});

        // Refresh the list
        await fetchSections();
        setDashboardRefreshKey((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error creating candidate:", err);

      // Better error message
      let errorMsg = "Failed to add candidate";
      if (err.response?.data?.error?.message) {
        errorMsg = err.response.data.error.message;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }

      showAlert("error", errorMsg);
    }

    setLoading(false);
  };

  const MIN_BUFFER_MINUTES = 10;

  const validateElectionTimeUI = (startTime, endTime) => {
    if (!startTime || !endTime) {
      return "Start time and end time are required";
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "Invalid date or time selection";
    }

    const diffMinutes = (start.getTime() - now.getTime()) / 60000;
    if (diffMinutes < 10) {
      return "Start time must be at least 10 minutes from now";
    }

    if (end <= start) {
      return "End time must be after start time";
    }

    const durationMinutes = (end - start) / 60000;
    if (durationMinutes < 30) {
      return "Election should last at least 30 minutes";
    }

    return null;
  };

  // Update validation when dates/times change
  useEffect(() => {
    if (showStartElection) {
      updateStartTime(startDate, startHour, startMinute);
      updateEndTime(endDate, endHour, endMinute);
    }
  }, [
    startDate,
    startHour,
    startMinute,
    endDate,
    endHour,
    endMinute,
    showStartElection,
  ]);

  const handleStartElection = async () => {
    const error = validateElectionTimeUI(startTime, endTime);

    if (error) {
      showAlert("error", error);
      return;
    }

    try {
      setStartingElection(true);

      const startUTC = new Date(startTime).toISOString();
      const endUTC = new Date(endTime).toISOString();

      // ✅ FIX: Wrap data in a 'data' object
      const endpoint =
        electionStatus === "ended"
          ? `/elections/${electionDocumentId}/restart`
          : `/elections/${electionDocumentId}/start`;

      await axiosInstance.put(endpoint, {
        start_time: startUTC,
        end_time: endUTC,
      });

      // 🔐 RESET reload guards HERE
      const START_KEY = `election_${electionDocumentId}_start_reloaded`;
      const END_KEY = `election_${electionDocumentId}_end_reloaded`;

      sessionStorage.removeItem(START_KEY);
      sessionStorage.removeItem(END_KEY);

      showAlert(
        "success",
        electionStatus === "ended"
          ? "Election restarted successfully"
          : "Election scheduled successfully"
      );

      setShowStartElection(false);
      await refetchElectionMeta(); // 👈 ADD HERE
    } catch (err) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to start election"
      );
      console.log("Full error:", err.response?.data);
      console.log("Error message:", err.response?.data?.message);
      console.log("Error details:", err.response?.data?.error);
    } finally {
      setStartingElection(false);
    }
  };

  // Create new section (Election Position)
  const handleAddSection = async () => {
    if (!newSectionName.trim()) {
      showAlert("error", "Please enter a position name");
      return;
    }

    // Check if section with same name already exists
    if (
      sections.some(
        (section) =>
          section.name.toLowerCase() === newSectionName.trim().toLowerCase()
      )
    ) {
      showAlert("error", "A position with this name already exists");
      return;
    }

    try {
      const payload = {
        data: {
          Position: newSectionName.trim(),
          election_name: electionDocumentId, // documentId // Match your relation field name
        },
      };

      await axiosInstance.post("/election-candidate-positions", payload);
      await fetchSections();
      setDashboardRefreshKey((prev) => prev + 1);

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

      await fetchSections();
      setDashboardRefreshKey((prev) => prev + 1);

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
    const section = sections.find((s) => s.id === sectionId);
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
      await axiosInstance.delete(
        `/election-candidate-positions/${sectionToDelete.id}`
      );

      setSections(
        sections.filter((section) => section.id !== sectionToDelete.id)
      );
      await fetchSections();
      setDashboardRefreshKey((prev) => prev + 1);

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

  const handleDeclareWinnerBackend = async (sectionId) => {
    try {
      setDeclaringWinner(true);
      setCelebratingWinner(true);

      // Start celebration animation
      setTimeout(() => {
        setCelebratingWinner(false);
      }, 3000);

      await axiosInstance.post("/election-winners/declare", {
        adminId: Number(adminId),
        electionId: electionDocumentId, // documentId string
        positionId: Number(sectionId),
      });

      showAlert("success", "🎉 Winner declared successfully!");

      await fetchSections(); // refresh UI
      setDashboardRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      showAlert(
        "error",
        err.response?.data?.message || "Failed to declare winner"
      );
    } finally {
      setDeclaringWinner(false);
    }
  };

  const getWinnerForSection = (section) => {
    return section.candidates.find((c) => c.IsWinnedCandidate === true);
  };

  // Calculate total candidates across all sections
  const totalCandidates = sections.reduce(
    (total, section) => total + section.candidates.length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Celebration Animation Overlay */}
      {celebratingWinner && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-emerald-400/20 animate-pulse"></div>
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
            <div className="animate-bounce text-6xl">🏆</div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-4xl font-bold text-center bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent animate-glow">
              WINNER DECLARED!
            </div>
          </div>
          <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2">
            <div className="animate-float text-5xl">🎉</div>
          </div>
        </div>
      )}

      {/* Alert Message Container */}
      {message && (
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] animate-slideDown`}
        >
          <div
            className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
              message.type === "error"
                ? "bg-red-50 border border-red-200 text-red-800"
                : "bg-emerald-50 border border-emerald-200 text-emerald-800"
            }`}
          >
            {message.type === "success" ? (
              <svg
                className="w-5 h-5 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => adminNavigate(navigate, "/electionhome")}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors duration-200 group animate-fadeIn"
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
          </button>
          <button
            onClick={() =>
              navigate(
                `/${adminId}/participant-dashboard/${electionDocumentId}`
              )
            }
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl min-w-[160px] animate-pulse hover:animate-none"
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

        {/* Main Dashboard Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8 animate-scaleIn">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Election Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    {electionMeta.electionCategory}
                  </span>
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full hover:scale-105 transition-transform duration-200">
                  {totalCandidates} Candidate{totalCandidates !== 1 ? "s" : ""}
                </span>
                <div className="w-px h-4 bg-slate-300"></div>
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:scale-105 transition-transform duration-200">
                  {sections.length} Position{sections.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-3">
                {/* Election Name */}
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                  {electionMeta.electionName}
                </h1>

                {/* Status Badge */}
                {electionStatus && (
                  <span
                    className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full animate-bounceIn
        ${
          electionStatus === "active"
            ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
            : electionStatus === "scheduled"
            ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
            : "bg-red-100 text-red-700 border border-red-300"
        }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        electionStatus === "active"
                          ? "bg-emerald-500 animate-pulse"
                          : electionStatus === "scheduled"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></span>
                    {electionStatus === "active" && "Active"}
                    {electionStatus === "scheduled" && "Scheduled"}
                    {electionStatus === "ended" && "Ended"}
                  </span>
                )}

                {/* Timer */}
                {timeLeft && (
                  <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 text-yellow-700 animate-pulse">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {timeLeft}
                  </span>
                )}
              </div>

              <p className="text-slate-600 text-lg">
                {electionMeta.electionType} • Candidate Management
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col xs:flex-row gap-3 w-full sm:w-auto">
              {electionStatus === "scheduled" && (
                <button
                  onClick={() => setShowStartElection(true)}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg min-w-[160px] hover:scale-105 transition-all duration-300
    ${
      electionStarted
        ? "bg-slate-300 text-slate-600 cursor-not-allowed"
        : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl"
    }`}
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
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Start Election
                </button>
              )}
              {electionStatus === "active" && (
                <button
                  onClick={async () => {
                    if (!confirm("Are you sure you want to end this election?"))
                      return;

                    await axiosInstance.put(
                      `/elections/${electionDocumentId}/end`
                    );

                    showAlert("success", "Election ended successfully");
                    await refetchElectionMeta();
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  End Election
                </button>
              )}
              {electionStatus === "ended" && (
                <button
                  onClick={() => {
                    setShowStartElection(true); // reuse same modal
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold
    bg-gradient-to-r from-blue-500 to-indigo-600 text-white
    hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 min-w-[160px]"
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Restart Election
                </button>
              )}

              <button
                onClick={() => setShowAddSection(true)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg w-full xs:w-auto hover:shadow-xl hover:scale-105 min-w-[160px]"
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
            </div>
          </div>
        </div>

        {showStartElection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fadeIn">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 animate-scaleIn">
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-white">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Schedule Election
                  </h2>
                  <p className="text-sm text-slate-500">
                    Set start and end date & time
                  </p>
                </div>
                <button
                  onClick={() => setShowStartElection(false)}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors duration-200 flex items-center justify-center hover:rotate-90 transition-transform"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6 space-y-5">
                {/* Start Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        updateStartTime(e.target.value, startHour, startMinute);
                      }}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition-all duration-300 hover:border-emerald-400"
                      min={getCurrentDate()}
                    />
                  </div>

                  {/* Start Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Start Hour
                      </label>
                      <select
                        value={startHour}
                        onChange={(e) => {
                          setStartHour(e.target.value);
                          updateStartTime(
                            startDate,
                            e.target.value,
                            startMinute
                          );
                        }}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition-all duration-300 hover:border-emerald-400"
                      >
                        {Array.from({ length: 24 }, (_, i) =>
                          i.toString().padStart(2, "0")
                        ).map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Start Minute
                      </label>
                      <select
                        value={startMinute}
                        onChange={(e) => {
                          setStartMinute(e.target.value);
                          updateStartTime(startDate, startHour, e.target.value);
                        }}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition-all duration-300 hover:border-emerald-400"
                      >
                        {Array.from({ length: 60 }, (_, i) =>
                          i.toString().padStart(2, "0")
                        ).map((minute) => (
                          <option key={minute} value={minute}>
                            {minute}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* End Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        updateEndTime(e.target.value, endHour, endMinute);
                      }}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition-all duration-300 hover:border-emerald-400"
                      min={startDate || getCurrentDate()}
                    />
                  </div>

                  {/* End Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        End Hour
                      </label>
                      <select
                        value={endHour}
                        onChange={(e) => {
                          setEndHour(e.target.value);
                          updateEndTime(endDate, e.target.value, endMinute);
                        }}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition-all duration-300 hover:border-emerald-400"
                      >
                        {Array.from({ length: 24 }, (_, i) =>
                          i.toString().padStart(2, "0")
                        ).map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        End Minute
                      </label>
                      <select
                        value={endMinute}
                        onChange={(e) => {
                          setEndMinute(e.target.value);
                          updateEndTime(endDate, endHour, e.target.value);
                        }}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition-all duration-300 hover:border-emerald-400"
                      >
                        {Array.from({ length: 60 }, (_, i) =>
                          i.toString().padStart(2, "0")
                        ).map((minute) => (
                          <option key={minute} value={minute}>
                            {minute}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Info Messages */}
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                    Start must be at least 10 minutes from now
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                    End must be after the start time
                  </p>
                </div>

                {/* Validation Error */}
                {validateElectionTimeUI(startTime, endTime) && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium animate-shake">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {validateElectionTimeUI(startTime, endTime)}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
                <button
                  onClick={() => setShowStartElection(false)}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-300 hover:scale-105"
                >
                  Cancel
                </button>

                <button
                  onClick={handleStartElection}
                  disabled={
                    startingElection ||
                    !!validateElectionTimeUI(startTime, endTime)
                  }
                  className={`rounded-lg px-5 py-2.5 font-semibold text-white transition-all duration-300 hover:scale-105
            ${
              startingElection || validateElectionTimeUI(startTime, endTime)
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg"
            }`}
                >
                  {startingElection
                    ? electionStatus === "ended"
                      ? "Restarting..."
                      : "Starting..."
                    : electionStatus === "ended"
                    ? "Restart Election"
                    : "Start Election"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Section Modal */}
        {showAddSection && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div
              ref={addSectionRef}
              className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-md mx-2 p-4 sm:p-6 animate-scaleIn"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center animate-pulse">
                  <svg
                    className="w-5 h-5 text-blue-600"
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
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Add Election Position
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Create a new position for candidates
                  </p>
                </div>
              </div>

              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Enter position name (e.g., President, Secretary)"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4 text-sm transition-all duration-300 hover:border-blue-400"
                onKeyPress={(e) => e.key === "Enter" && handleAddSection()}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddSection(false);
                    setNewSectionName("");
                  }}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-all duration-300 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSection}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Create Position
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isFetchingCandidates && (
          <div className="mb-6 text-center py-8 animate-fadeIn">
            <div className="inline-flex flex-col items-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-slate-600 mt-4 font-medium animate-pulse">
                Loading candidates...
              </p>
            </div>
          </div>
        )}

        {/* Sections with Candidates */}
        <div className="space-y-6 animate-fadeIn">
          {sections.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center animate-scaleIn">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <svg
                    className="w-10 h-10 text-blue-500"
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
                  <strong className="text-blue-600">
                    {electionMeta.electionName}
                  </strong>
                  . Each position will have its own section of candidates.
                </p>
                <button
                  onClick={() => setShowAddSection(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
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
            sections.map((section, index) => {
              const winner = getWinnerForSection(section);
              const hasWinner = !!winner;

              return (
                <div
                  key={section.id}
                  className="relative transition-all duration-700"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Original Section Content (Blurred when winner exists) */}
                  {/* Background Content */}
                  <div className="bg-white rounded-xl shadow-lg border border-slate-200">
                    {/* Section Header */}
                    <div
                      className="p-4 sm:p-5 border-b border-slate-200 cursor-pointer"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-3">
                          <svg
                            className={`w-5 h-5 transform transition-transform duration-300 mt-1 sm:mt-0 flex-shrink-0 ${
                              section.isOpen
                                ? "rotate-90 text-blue-600"
                                : hasWinner
                                ? "text-emerald-500"
                                : "text-slate-400"
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
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3
                                className={`text-lg font-bold ${
                                  hasWinner
                                    ? "bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent"
                                    : "bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent"
                                }`}
                              >
                                {section.name}
                              </h3>
                              {hasWinner && (
                                <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1 rounded-full animate-pulse">
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="text-xs font-bold">
                                    WINNER
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <p
                                className={`text-sm ${
                                  hasWinner
                                    ? "text-emerald-600 font-semibold"
                                    : "text-slate-600"
                                }`}
                              >
                                Position: {section.position}
                              </p>
                              <span
                                className={`text-sm font-medium px-3 py-1 rounded-full ${
                                  hasWinner
                                    ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {section.candidates.length} candidate
                                {section.candidates.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                          {section.candidates.length > 0 &&
                            !hasWinner &&
                            electionStatus === "ended" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeclareWinnerBackend(section.id);
                                }}
                                disabled={declaringWinner}
                                className={`relative overflow-hidden group flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                                  declaringWinner
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/20 to-yellow-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                {declaringWinner ? (
                                  <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Declaring...
                                  </span>
                                ) : (
                                  <>
                                    <svg
                                      className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                      />
                                    </svg>
                                    <span className="relative hidden sm:inline">
                                      Declare Winner
                                    </span>
                                    <span className="relative sm:hidden">
                                      🏆
                                    </span>
                                  </>
                                )}
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
                            disabled={hasWinner}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105 ${
                              hasWinner
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                            }`}
                          >
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4"
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
                            <span className="hidden sm:inline">
                              Add Candidate
                            </span>
                            <span className="sm:hidden">Add</span>
                          </button>

                          {sections.length > 1 && (
                            <button
                              onClick={(e) =>
                                handleDeleteSectionClick(section.id, e)
                              }
                              disabled={hasWinner}
                              className={`p-2 rounded-lg transition-colors hover:scale-110 ${
                                hasWinner
                                  ? "text-slate-300 cursor-not-allowed"
                                  : hasWinner
                                  ? "text-emerald-600 hover:bg-emerald-50"
                                  : "text-red-600 hover:bg-red-50"
                              }`}
                              title={
                                hasWinner
                                  ? "Cannot delete position with winner"
                                  : "Delete position"
                              }
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section Content */}
                    {/* Section Content */}
                    <div className="relative overflow-hidden">
                      {/* Winner Overlay - Fixed to be more compact */}
                      {hasWinner && winner && (
                        <div className="relative z-40 mb-6 animate-fadeIn">
                          <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-emerald-200">
                            {/* Compact Header */}
                            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 px-5">
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-2xl">🏆</span>
                                <h3 className="text-lg font-bold text-white">
                                  Election Winner
                                </h3>
                              </div>
                            </div>

                            {/* Compact Winner Content */}
                            <div className="p-4 sm:p-5">
                              <div className="flex flex-col sm:flex-row items-center gap-4">
                                {/* Winner Image - Smaller */}
                                <div className="relative shrink-0">
                                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-3 border-emerald-100 shadow-md">
                                    <img
                                      src={winner.photoUrl}
                                      alt={winner.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          "https://via.placeholder.com/96/10b981/ffffff?text=" +
                                          winner.name.charAt(0);
                                      }}
                                    />
                                  </div>
                                  <div className="absolute -top-1 -right-1 w-8 h-8 sm:w-9 sm:h-9 bg-yellow-400 rounded-full flex items-center justify-center shadow">
                                    <span className="text-lg sm:text-xl">
                                      👑
                                    </span>
                                  </div>
                                </div>

                                {/* Winner Info - Compact */}
                                <div className="flex-1 min-w-0 text-center sm:text-left">
                                  <div className="mb-3">
                                    <h4 className="text-xl font-bold text-gray-800 truncate">
                                      {winner.name}
                                    </h4>
                                    {winner.position && (
                                      <p className="text-emerald-600 font-medium text-sm mt-0.5">
                                        {winner.position}
                                      </p>
                                    )}
                                  </div>

                                  {/* Vote Count - Compact */}
                                  <div className="bg-emerald-50 rounded-lg p-3 inline-block">
                                    <div className="flex items-center gap-2">
                                      <svg
                                        className="w-5 h-5 text-emerald-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      <span className="text-2xl font-bold text-emerald-700">
                                        {winner.vote_count || 0}
                                      </span>
                                    </div>
                                    <p className="text-emerald-600 font-medium text-sm mt-1">
                                      Total Votes
                                    </p>
                                  </div>
                                </div>

                                {/* Action Buttons - Vertical */}
                                <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[140px]">
                                  <button
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm hover:shadow"
                                    onClick={() => {
                                      setSelectedCandidate(winner);
                                      setShowDetails(true);
                                    }}
                                  >
                                    View Profile
                                  </button>

                                  <button
                                    className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium text-sm shadow-sm hover:shadow"
                                    onClick={() => {
                                      // Toggle section to show results
                                      if (!section.isOpen) {
                                        toggleSection(section.id);
                                      }
                                      // Scroll to candidates section
                                      const element = document.getElementById(
                                        `section-${section.id}`
                                      );
                                      if (element) {
                                        element.scrollIntoView({
                                          behavior: "smooth",
                                        });
                                      }
                                    }}
                                  >
                                    View Results
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Candidate List - Always visible but disabled when winner exists */}
                      <div
                        id={`section-${section.id}`}
                        className={`transition-all duration-300 ${
                          hasWinner
                            ? "opacity-60 pointer-events-none"
                            : "opacity-100"
                        }`}
                      >
                        {section.isOpen && (
                          <>
                            {section.candidates.length === 0 ? (
                              <div className="text-center py-10 px-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                                <h4 className="text-lg font-semibold text-slate-900 mb-2">
                                  No candidates for {section.position}
                                </h4>
                                <p className="text-slate-600 mb-4 text-sm">
                                  Be the first to add a candidate for this
                                  position.
                                </p>
                                <button
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      sectionId: section.id,
                                    }));
                                    setShowForm(true);
                                  }}
                                  disabled={hasWinner}
                                  className={`px-5 py-2.5 font-medium rounded-lg transition-all ${
                                    hasWinner
                                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                                  }`}
                                >
                                  {hasWinner
                                    ? "Cannot add candidates (winner declared)"
                                    : "Add First Candidate"}
                                </button>
                              </div>
                            ) : (
                              <div className="p-4 sm:p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                  {section.candidates.map((candidate, idx) => (
                                    <div
                                      key={candidate.id}
                                      className={`bg-white rounded-xl p-3 border-2 ${
                                        hasWinner && candidate.id === winner?.id
                                          ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-white shadow-lg"
                                          : "border-gray-200 hover:border-blue-300"
                                      } shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-1`}
                                    >
                                      <div className="flex flex-col items-center text-center">
                                        {/* Candidate Photo - Smaller */}
                                        <div className="relative mb-3 w-full aspect-square max-w-32 mx-auto">
                                          <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden bg-white">
                                            {hasWinner &&
                                              candidate.id === winner?.id && (
                                                <div className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow">
                                                  <svg
                                                    className="w-4 h-4 text-white"
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
                                            {candidate.photoUrl ? (
                                              <img
                                                src={candidate.photoUrl}
                                                alt={candidate.name}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                              />
                                            ) : (
                                              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                                <span className="text-white font-bold text-xl">
                                                  {getInitials(candidate.name)}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Candidate Info */}
                                        <div className="w-full mb-3 space-y-1.5">
                                          <h5 className="font-semibold text-slate-900 text-base truncate">
                                            {candidate.name}
                                          </h5>

                                          <div
                                            className={`text-xs font-semibold px-2 py-1 rounded-md inline-block ${
                                              hasWinner &&
                                              candidate.id === winner?.id
                                                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                                                : "text-blue-700 bg-blue-50"
                                            }`}
                                          >
                                            {candidate.position}
                                          </div>

                                          {candidate.candidate_id && (
                                            <div className="text-xs text-slate-600 font-medium">
                                              ID: {candidate.candidate_id}
                                            </div>
                                          )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 w-full">
                                          <button
                                            onClick={() =>
                                              handleViewDetails(candidate)
                                            }
                                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs"
                                          >
                                            View
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDeleteClick(candidate)
                                            }
                                            disabled={hasWinner}
                                            className={`flex-1 px-3 py-2 rounded-lg transition-colors font-medium text-xs ${
                                              hasWinner
                                                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                                                : "bg-red-500 text-white hover:bg-red-600"
                                            }`}
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Candidate Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div
            ref={formModalRef}
            className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto mx-2 animate-scaleIn"
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 z-10 rounded-t-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Add New Candidate
                    </h2>
                    <p className="text-slate-600 text-sm mt-1">
                      {electionMeta.electionName}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center hover:rotate-90 transition-transform"
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
                      <span className="text-red-600 text-xs ml-2">
                        ({formErrors.sectionId})
                      </span>
                    )}
                  </label>
                  <select
                    name="sectionId"
                    value={formData.sectionId || ""}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-300 hover:border-blue-400 ${
                      formErrors.sectionId
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-slate-300"
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
                    <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-5 border border-blue-100 hover:shadow-md transition-all duration-300">
                      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-600"
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
                            {formErrors.name && (
                              <span className="text-red-600 text-xs ml-2">
                                ({formErrors.name})
                              </span>
                            )}
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-300 hover:border-blue-400 ${
                              formErrors.name
                                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                : "border-slate-300"
                            }`}
                            placeholder="Enter candidate full name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email Address *
                            {formErrors.email && (
                              <span className="text-red-600 text-xs ml-2">
                                ({formErrors.email})
                              </span>
                            )}
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-300 hover:border-blue-400 ${
                              formErrors.email
                                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                : "border-slate-300"
                            } ${
                              fieldFocus === "email"
                                ? "ring-2 ring-blue-200"
                                : ""
                            }`}
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
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-300 hover:border-blue-400"
                              placeholder="Age"
                              min="1"
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
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-300 hover:border-blue-400"
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
                    <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-5 border border-blue-100 hover:shadow-md transition-all duration-300">
                      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-600"
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
                        Contact Information
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Phone Number *
                            {formErrors.phone_number && (
                              <span className="text-red-600 text-xs ml-2">
                                ({formErrors.phone_number})
                              </span>
                            )}
                          </label>
                          <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-300 hover:border-blue-400 ${
                              formErrors.phone_number
                                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                : "border-slate-300"
                            } ${
                              fieldFocus === "phone_number"
                                ? "ring-2 ring-blue-200"
                                : ""
                            }`}
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            WhatsApp Number
                            {formErrors.whatsApp_number && (
                              <span className="text-red-600 text-xs ml-2">
                                ({formErrors.whatsApp_number})
                              </span>
                            )}
                          </label>
                          <input
                            type="tel"
                            name="whatsApp_number"
                            value={formData.whatsApp_number}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-300 hover:border-blue-400 ${
                              formErrors.whatsApp_number
                                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                : "border-slate-300"
                            }`}
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
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-blue-600 file:text-white hover:file:from-blue-600 hover:file:to-blue-700 transition-all duration-300 hover:border-blue-400"
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
                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Adding Candidate...
                      </span>
                    ) : (
                      "Add Candidate"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Details Modal */}
      {showDetails && selectedCandidate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div
            ref={detailsModalRef}
            className="bg-white rounded-xl sm:rounded-3xl shadow-2xl w-[90vw] sm:w-[95vw] max-w-md sm:max-w-2xl mx-2 sm:mx-4 overflow-hidden animate-scaleIn"
          >
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-8 py-4 sm:py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-white">
                    Candidate Profile
                  </h2>
                  <p className="text-blue-100 text-xs sm:text-sm mt-1">
                    Complete candidate information
                  </p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl flex items-center justify-center text-white transition-colors hover:rotate-90"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-8">
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
                {/* Left Column - Photo and Basic Info */}
                <div className="lg:w-1/3">
                  <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100 hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col items-center">
                      <div className="relative mb-3 sm:mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-lg transform scale-110 opacity-20 animate-pulse"></div>
                        {selectedCandidate.photoUrl ? (
                          <img
                            src={selectedCandidate.photoUrl}
                            alt={selectedCandidate.name}
                            className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg sm:shadow-2xl hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center border-4 border-white shadow-lg sm:shadow-2xl hover:scale-105 transition-transform duration-500">
                            <span className="text-white font-bold text-xl sm:text-3xl">
                              {getInitials(selectedCandidate.name)}
                            </span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 text-center mb-1 sm:mb-2">
                        {selectedCandidate.name}
                      </h3>
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4 hover:scale-105 transition-transform">
                        {selectedCandidate.position}
                      </div>

                      {selectedCandidate.candidate_id && (
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-1">
                            Candidate ID
                          </p>
                          <p className="text-sm font-medium text-slate-900">
                            {selectedCandidate.candidate_id}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:w-2/3">
                  <div className="space-y-4 sm:space-y-6">
                    {/* Contact Information */}
                    <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100 hover:shadow-md transition-all duration-300">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Contact Information
                      </h4>
                      <div className="space-y-3 sm:space-y-4">
                        {/* Email */}
                        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 text-xs font-bold">
                                  @
                                </span>
                              </div>
                              <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                                EMAIL
                              </span>
                            </div>
                            <p className="text-slate-900 font-medium text-sm sm:text-base break-all mt-1 sm:mt-0 ml-8 sm:ml-0">
                              {selectedCandidate.email}
                            </p>
                          </div>

                          {/* Phone */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center flex-shrink-0">
                                <svg
                                  className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                              </div>
                              <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                                PHONE
                              </span>
                            </div>
                            <p className="text-slate-900 font-medium text-sm sm:text-base mt-1 sm:mt-0 ml-8 sm:ml-0">
                              {selectedCandidate.phone}
                            </p>
                          </div>
                        </div>

                        {/* WhatsApp */}
                        {selectedCandidate.whatsapp && (
                          <div className="mt-3 sm:mt-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded flex items-center justify-center flex-shrink-0">
                                <span className="text-emerald-600 text-xs font-bold">
                                  W
                                </span>
                              </div>
                              <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                                WHATSAPP
                              </span>
                            </div>
                            <p className="text-slate-900 font-medium text-sm sm:text-base mt-1 sm:mt-0 ml-8 sm:ml-0">
                              {selectedCandidate.whatsapp}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Personal Details */}
                    <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100 hover:shadow-md transition-all duration-300">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
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
                        Personal Details
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {/* Age */}
                        <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                          <div className="mb-1 sm:mb-2">
                            <span className="text-slate-500 text-xs sm:text-sm font-medium uppercase tracking-wide">
                              AGE
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-slate-900 font-bold text-lg sm:text-xl">
                              {selectedCandidate.age || "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Gender */}
                        <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                          <div className="mb-1 sm:mb-2">
                            <span className="text-slate-500 text-xs sm:text-sm font-medium uppercase tracking-wide">
                              GENDER
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-slate-900 font-bold text-lg sm:text-xl capitalize">
                              {selectedCandidate.gender || "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Applied Date */}
                        <div className="col-span-2 bg-white p-3 sm:p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                          <div className="mb-1 sm:mb-2">
                            <span className="text-slate-500 text-xs sm:text-sm font-medium uppercase tracking-wide">
                              APPLIED DATE
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-slate-900 font-bold text-lg sm:text-xl">
                              {selectedCandidate.appliedDate || "N/A"}
                            </span>
                          </div>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div
            ref={deleteModalRef}
            className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-md mx-2 animate-scaleIn"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center animate-pulse">
                  <svg
                    className="w-6 h-6 text-red-600"
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
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Delete Candidate
                  </h3>
                  <p className="text-sm text-slate-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-slate-600 mb-6">
                Are you sure you want to delete{" "}
                <strong className="text-slate-900">
                  {candidateToDelete.name}
                </strong>
                ? This will remove the candidate from the election permanently.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setCandidateToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold transition-all duration-300 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div
            ref={deleteSectionModalRef}
            className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-md mx-2 animate-scaleIn"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center animate-pulse">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Delete Position
                  </h3>
                  <p className="text-sm text-slate-600">
                    This will delete the position and all its candidates
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4 mb-6 animate-shake">
                <p className="text-red-800 font-medium mb-2">⚠️ Warning!</p>
                <p className="text-sm text-red-700">
                  Deleting{" "}
                  <strong className="font-semibold">
                    {sectionToDelete.name}
                  </strong>{" "}
                  will remove all {sectionToDelete.candidates.length} candidate
                  {sectionToDelete.candidates.length !== 1 ? "s" : ""} in this
                  position. This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteSectionConfirm(false);
                    setSectionToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold transition-all duration-300 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteSection}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Delete Position
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-slate-200 pt-8 mt-8 animate-fadeIn">
        <ElectionDashboard key={dashboardRefreshKey} />
      </div>
    </div>
  );
};

export default CandidateDashboard;
