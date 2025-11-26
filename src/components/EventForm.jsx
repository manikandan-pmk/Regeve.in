import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo1 from "/basf-logo.jpg";

export default function EventForm() {
  const defaultForm = {
    Name: "",
    Age: "",
    Gender: "",
    Company_ID: "",
    Phone_Number: "",
    WhatsApp_Number: "",
    Email: "",
    Adult_Count: "0", // Default to 1 for self
    Children_Count: "0",
    Veg_Count: "",
    Non_Veg_Count: "",
    Travel_Mode: "", // New field for travel mode
    Pickup_Location: "", // New field for pickup location
    Self: "1",
  };

  const navigate = useNavigate();

  const [form, setForm] = useState(defaultForm);
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // For company ID suggestions
  const [searchResults, setSearchResults] = useState([]);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [memberData, setMemberData] = useState(null);

  // Pickup locations data
  const pickupLocations = [
    "Office - Main Gate",
    "Office - Parking Lot",
    "Company - Reception",
    "Company - North Entrance",
    "Viman Nagar",
    "Kharadi",
    "Hadapsar",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Company ID logic
    if (name === "Company_ID") {
      const numericValue = value.replace(/\D/g, "").slice(0, 8);
      setForm({ ...form, [name]: numericValue });

      if (numericValue.length >= 3) {
        axios
          .get(`https://api.regeve.in/api/get-all-basf-staff/${numericValue}`)
          .then((res) => {
            if (res.data.data) {
              setSearchResults([res.data.data]);
            } else {
              setSearchResults([]);
            }
          })
          .catch(() => setSearchResults([]));
      } else {
        setSearchResults([]);
      }

      return; // Keep return ONLY for Company ID
    }

    // ✅ For all other fields update normally
    setForm({ ...form, [name]: value });
  };

  const handlePhoto = (e) => {
    setPhoto(e.target.files[0]);
  };

  const uploadPhoto = async (file) => {
    const fd = new FormData();
    fd.append("files", file);

    const res = await axios.post("https://api.regeve.in/api/upload", fd);
    return res.data[0].id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const totalPersons =
        Number(form.Self) +
        Number(form.Adult_Count) +
        Number(form.Children_Count);

      const totalFoodCount =
        Number(form.Veg_Count) + Number(form.Non_Veg_Count);

      if (totalPersons !== totalFoodCount) {
        alert(
          `Total Persons (${totalPersons}) must match Veg + Non-Veg Count (${totalFoodCount})`
        );
        setIsLoading(false);
        return;
      }

      let photoId = null;

      // Upload photo first
      if (photo) {
        photoId = await uploadPhoto(photo);
      }

      // Save form with uploaded photo ID
      const response = await axios.post(
        "https://api.regeve.in/api/event-forms",
        {
          data: {
            ...form,
            Photo: photoId,
          },
        }
      );

      console.log("SUCCESS:", response.data);

      const memberId = response.data.data.Member_ID;

      // Fetch user details using Member_ID
      const userDetails = await axios.get(
        `https://api.regeve.in/api/event-forms/${memberId}`
      );

      setMemberData(userDetails.data.data);
      setShowPopup(true);

      // Reset form
      setForm(defaultForm);
      setPhoto(null);
    } catch (error) {
      console.error("ERROR:", error.response?.data || error);

      const backendMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to submit form";

      alert(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 relative">
          {/* BASF Logo */}
          <img
            src={Logo1}
            alt="BASF Logo"
            className="mx-auto mb-3 sm:mb-4 w-32 sm:w-40 h-16 object-contain"
          />

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
            Family Day Event - 2025
          </h1>

          <p className="text-gray-600 text-sm sm:text-lg">Registration Form</p>

          {/* Go Home Button */}
          <button
            onClick={() => navigate("/")}
            className="
    hidden lg:inline-block
    sm:fixed sm:top-6 sm:right-6
    sm:bg-gradient-to-br sm:from-blue-600 sm:to-cyan-700
    sm:hover:from-blue-700 sm:hover:to-cyan-800
    sm:border sm:border-blue-500 sm:text-white
    mx-auto sm:mx-0
    w-full sm:w-auto text-center
    mt-4 sm:mt-0
    px-5 py-2.5
    rounded-lg shadow-lg cursor-pointer
    transition-all duration-200
    text-sm font-medium
    bg-blue-600 sm:bg-gradient-to-br
    text-white
  "
          >
            ← Go Home
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:px-8">
            {/* Company ID - Moved to top */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-1.5 h-6 sm:h-8 bg-blue-600 rounded-full mr-3 sm:mr-4"></div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Company Identification
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Company ID *
                  </label>
                  <input
                    name="Company_ID"
                    value={form.Company_ID}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter 8-digit Company ID"
                    required
                    pattern="[0-9]{8}"
                    maxLength={8}
                    minLength={8}
                    title="Please enter exactly 8 digits"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be exactly 8 digits
                  </p>
                  {searchResults.length > 0 && (
                    <ul className="mt-2 border rounded-lg bg-white shadow-md max-h-40 overflow-y-auto">
                      {searchResults.map((item) => (
                        <li
                          key={item.id}
                          onClick={() => {
                            setForm({
                              ...form,
                              Company_ID: item.Company_ID,
                              Name: item.Name,
                            });
                            setSearchResults([]);
                          }}
                          className="px-3 py-2 cursor-pointer hover:bg-blue-100 border-b last:border-b-0"
                        >
                          <strong>{item.Company_ID}</strong> — {item.Name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-1.5 h-6 sm:h-8 bg-blue-600 rounded-full mr-3 sm:mr-4"></div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Personal Information
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Full Name *
                    </label>
                    <input
                      name="Name"
                      value={form.Name}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Enter your full name"
                      required
                      minLength={3}
                      disabled={form.Name !== ""} // Disable when auto-filled
                    />
                    {form.Name !== "" && (
                      <p className="text-xs text-green-600 mt-1">
                        Auto-filled from Company ID
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Age *
                    </label>
                    <input
                      name="Age"
                      value={form.Age}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Enter your age"
                      type="number"
                      required
                      min={18}
                      max={120}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Gender *
                    </label>
                    <div className="relative">
                      <select
                        name="Gender"
                        onChange={handleChange}
                        value={form.Gender}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 appearance-none bg-white cursor-pointer"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Travel Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Travel Mode *
                    </label>
                    <div className="relative">
                      <select
                        name="Travel_Mode"
                        onChange={handleChange}
                        value={form.Travel_Mode}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 appearance-none bg-white cursor-pointer"
                        required
                      >
                        <option value="">Select Travel Mode</option>
                        <option value="Self">Self</option>
                        <option value="Company Bus">Company Bus</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pickup Location - Only show when Company is selected */}
                {form.Travel_Mode === "Company Bus" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Pickup Location *
                    </label>
                    <div className="relative w-full mb-4 sm:mb-0">
                      <input
                        name="Pickup_Location"
                        value={form.Pickup_Location}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="Pickup Location"
                        type="text"
                        required
                      />

                      {/* Custom dropdown arrow */}
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 20 20"
                          fill="gray"
                        >
                          <path d="M5 7l5 5 5-5" />
                        </svg>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-1.5 h-6 sm:h-8 bg-green-600 rounded-full mr-3 sm:mr-4"></div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Contact Information
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Phone Number *
                    </label>
                    <input
                      name="Phone_Number"
                      value={form.Phone_Number}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Enter phone number"
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      WhatsApp Number *
                    </label>
                    <input
                      name="WhatsApp_Number"
                      value={form.WhatsApp_Number}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Enter WhatsApp number"
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Email Address *
                  </label>
                  <input
                    name="Email"
                    value={form.Email}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter email address"
                    type="email"
                    pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-1.5 h-6 sm:h-8 bg-purple-600 rounded-full mr-3 sm:mr-4"></div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Family Members & Food Preference
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Self Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Employee Count *
                  </label>
                  <input
                    name="Self"
                    value={form.Self}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Self Count"
                    type="number"
                    required
                    min={1}
                    max={1}
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Always 1 (yourself)
                  </p>
                </div>

                {/* Adult Count (Additional Adults) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Additional Adults
                  </label>
                  <input
                    name="Adult_Count"
                    value={form.Adult_Count}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Additional Adults"
                    type="number"
                    required
                    min={0}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Other adults besides yourself
                  </p>
                </div>

                {/* Children Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Children
                  </label>
                  <input
                    name="Children_Count"
                    value={form.Children_Count}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Children Count"
                    type="number"
                    required
                    min={0}
                  />
                </div>

                {/* Veg Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Veg Count *
                  </label>
                  <div className="relative">
                    <input
                      name="Veg_Count"
                      value={form.Veg_Count}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Veg Count"
                      type="number"
                      required
                      min={0}
                    />
                  </div>
                </div>

                {/* Non-Veg Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Non-Veg Count *
                  </label>
                  <div>
                    <input
                      name="Non_Veg_Count"
                      value={form.Non_Veg_Count}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Non-Veg Count"
                      type="number"
                      required
                      min={0}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-1.5 h-6 sm:h-8 bg-orange-500 rounded-full mr-3 sm:mr-4"></div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Photo Upload
                </h2>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:px-8 text-center hover:border-blue-400 transition-colors duration-200">
                <div className="max-w-md mx-auto">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base mb-1 sm:mb-2">
                    Upload your photo
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
                    Supports JPG, PNG, JPEG (Max 5MB)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handlePhoto}
                    className="block w-full cursor-pointer text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4 sm:pt-6">
              <button
                type="submit"
                className="w-full cursor-pointer sm:w-auto px-6 sm:px-12 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Submit Registration
              </button>
            </div>
            {isLoading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-gray-500 text-xs sm:text-sm">
            All fields marked with * are required
          </p>
        </div>
      </div>

      {/* UPDATED POPUP DESIGN */}
      {showPopup && memberData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-4xl mx-auto overflow-y-auto max-h-[95vh]">
            {/* Modern Header - Professional Style */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-700 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-white">
                      Registration Successful
                    </h1>
                    <p className="text-blue-100 mt-1 text-xs sm:text-sm">
                      Your registration has been confirmed and processed
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Close Icon */}
                  <button
                    onClick={() => setShowPopup(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
                    aria-label="Close popup"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
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
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6">
              <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
                {/* Left Side - Member Details */}
                <div className="lg:col-span-8">
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                      Member Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Full Name
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">
                          {memberData.Name}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Member ID
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 font-mono break-all">
                          {memberData.Member_ID}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Phone Number
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">
                          {memberData.Phone_Number}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Email Address
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 break-all">
                          {memberData.Email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="text-base  text-center font-semibold text-gray-900 mb-3">
                      Share Details
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-3 flex flex-col items-center">
                        {/* WhatsApp Share */}
                        <button
                          onClick={() => {
                            const shareableLink = `${window.location.origin}/#/member-details/${memberData.Member_ID}`;
                            const message = `🎉 *Registration Confirmed!*\n\n*Name:* ${memberData.Name}\n*Member ID:* ${memberData.Member_ID}\n*Phone:* ${memberData.Phone_Number}\n*Email:* ${memberData.Email}\n\nView full details: ${shareableLink}\n\nPlease present your QR code at the venue for entry.`;
                            const encodedMessage = encodeURIComponent(message);
                            const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
                            window.open(whatsappUrl, "_blank");
                          }}
                          className=" bg-green-500 cursor-pointer hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <svg
                            className="w-5 h-5 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893c0-3.189-1.248-6.189-3.515-8.444" />
                          </svg>
                          <span>Share via WhatsApp</span>
                        </button>

                        {/* Copy Link */}
                        <button
                          onClick={async () => {
                            const shareableLink = `${window.location.origin}/#/member-details/${memberData.Member_ID}`;
                            try {
                              await navigator.clipboard.writeText(
                                shareableLink
                              );
                              alert("Shareable link copied to clipboard!");
                            } catch (err) {
                              // Fallback for older browsers
                              const textArea =
                                document.createElement("textarea");
                              textArea.value = shareableLink;
                              document.body.appendChild(textArea);
                              textArea.select();
                              document.execCommand("copy");
                              document.body.removeChild(textArea);
                              alert("Shareable link copied to clipboard!");
                            }
                          }}
                          className=" bg-blue-500 cursor-pointer hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                          <span>Copy Share Link</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Share your registration details with friends and family
                    </p>
                  </div>
                </div>

                {/* Right Side - Visual Elements */}
                <div className="lg:col-span-4">
                  <div className="space-y-4">
                    {/* QR Code Card */}
                    {memberData.QRCode && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">
                          Event Pass
                        </h3>
                        <div className="text-center">
                          <div className="flex justify-center mb-3">
                            <img
                              src={`https://api.regeve.in${memberData.QRCode.url}`}
                              alt="QR Code"
                              className="w-32 h-32 sm:w-36 sm:h-36 border border-gray-200 rounded-lg bg-white p-2 mx-auto"
                            />
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            Present this QR code at the venue
                          </p>
                          <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>Digital Access Pass</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
