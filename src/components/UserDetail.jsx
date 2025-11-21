import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  FaWhatsapp,
  FaEnvelope,
  FaShareAlt,
  FaPhoneAlt,
  FaHome,
  FaUser,
  FaUtensils,
  FaUsers,
  FaChild,
  FaUserPlus,
} from "react-icons/fa";

/* ---------------------------------------------
   REUSABLE COMPONENTS
--------------------------------------------- */

const InfoPill = ({ icon: Icon, label, value, theme = "blue" }) => {
  const themeColors = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-green-100 text-green-700 border-green-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${themeColors[theme]}`}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white">
        <Icon className="text-lg" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-600">{label}</div>
        <div className="font-semibold text-gray-900">{value || "N/A"}</div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, onClick, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    purple: "bg-purple-600 hover:bg-purple-700 text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${colors[color]}`}
    >
      <Icon className="text-sm" />
      <span>{label}</span>
    </button>
  );
};

const StatCard = ({ label, value, icon: Icon, color = "blue" }) => {
  const colorConfig = {
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    green: "text-green-600 bg-green-50 border-green-200",
    purple: "text-purple-600 bg-purple-50 border-purple-200",
    orange: "text-orange-600 bg-orange-50 border-orange-200",
  };

  return (
    <div className={`p-3 rounded-lg border-2 text-center ${colorConfig[color]}`}>
      <Icon className="text-xl mx-auto mb-1" />
      <div className="text-lg font-bold">{value || "0"}</div>
      <div className="text-xs font-medium text-gray-600">{label}</div>
    </div>
  );
};

/* ---------------------------------------------
   MAIN COMPONENT
--------------------------------------------- */

const UserDetail = () => {
  const { Member_ID } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadMember = async () => {
      try {
        const response = await axios.get(
          `https://api.regeve.in/api/event-forms/${Member_ID}`
        );
        setMember(response.data?.data);
      } catch (err) {
        console.error("Error fetching member data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, [Member_ID]);

  const totalMembers =
    (member?.Adult_Count || 0) + (member?.Children_Count || 0);

  const handleShare = () => {
    if (!member) return;
    const profileURL = window.location.href;
    const shareMessage = `View Member Profile for ${member.Name} (ID: ${Member_ID}).\n\nProfile Link:\n${profileURL}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      shareMessage
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg border-2 border-gray-200 text-center max-w-md w-full">
          <div className="text-4xl mb-3">❌</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Member Not Found</h3>
          <p className="text-gray-600 mb-4">The requested member profile could not be loaded.</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* PROFILE HEADER */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* PROFILE IMAGE */}
            <div className="flex-shrink-0">
              {member.Photo?.url && !imageError ? (
                <img
                  src={`https://api.regeve.in${member.Photo.url}`}
                  alt="Profile"
                  className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                  <FaUser className="text-3xl text-gray-500" />
                </div>
              )}
            </div>

            {/* PROFILE INFO */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{member.Name}</h1>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  ID: {Member_ID}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {member.Company_ID}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-xs">
                <StatCard label="Age" value={member.Age} icon={FaUser} color="blue" />
                <StatCard label="Gender" value={member.Gender} icon={FaUsers} color="purple" />
                <StatCard label="Status" value="Active" icon={FaUserPlus} color="green" />
              </div>
            </div>

            {/* SHARE BUTTON */}
            <div className="sm:self-start">
              <ActionButton
                icon={FaShareAlt}
                label="Share"
                onClick={handleShare}
                color="purple"
              />
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CONTACT INFO */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaPhoneAlt className="text-blue-600" />
                Contact Information
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoPill
                  icon={FaPhoneAlt}
                  label="Phone"
                  value={member.Phone_Number}
                  theme="blue"
                />
                <InfoPill
                  icon={FaWhatsapp}
                  label="WhatsApp"
                  value={member.WhatsApp_Number}
                  theme="green"
                />
                <InfoPill
                  icon={FaEnvelope}
                  label="Email"
                  value={member.Email}
                  theme="purple"
                />
                <InfoPill
                  icon={FaHome}
                  label="Address"
                  value={member.Address}
                  theme="orange"
                />
              </div>
            </div>
          </div>

          {/* MEMBER DETAILS */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaUsers className="text-green-600" />
              Member Details
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <StatCard 
                  label="Total Members" 
                  value={totalMembers} 
                  icon={FaUserPlus} 
                  color="green" 
                />
              </div>
              
              <StatCard 
                label="Veg" 
                value={member.Veg_Count || 0} 
                icon={FaUtensils} 
                color="green" 
              />
              
              <StatCard 
                label="Non-Veg" 
                value={member.Non_Veg_Count || 0} 
                icon={FaUtensils} 
                color="orange" 
              />
              
              <StatCard 
                label="Adults" 
                value={member.Adult_Count || 0} 
                icon={FaUsers} 
                color="blue" 
              />
              
              <StatCard 
                label="Children" 
                value={member.Children_Count || 0} 
                icon={FaChild} 
                color="purple" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;