import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import EventForm from "./components/EventForm";
import LuckyDraw from "./components/LuckyDraw";
import EventRegistration from "./components/services/EventRegistration";
import LuckydrawFooter from "./components/services/LuckydrawFooter";
import FoodManagement from "./components/services/FoodManagement";
import DashboardSystemPage from "./components/services/DashboardSystemPage";
import ScrollToTop from "./components/ScrollToTop";
import UserDetail from "./components/UserDetail";
import BlogPage from "./components/BlogPage";
import HelpCenter from "./components/HelpCenter";
import PrivacyPolicy from "./components/PrivacyPolicy";
import RegisterForm from "./pages/Auth/RegisterForm";
import MemberDashBoard from "./pages/Scan/MemberDashBoard";
import QRCodeForm from "./components/QRCodeFom/QRCodeForm";
import GiftStatusPage from "./pages/GiftStatusPage";
import QRRedirect from "./pages/QRRedirect";
import ElectionHome from "./pages/Election/ElectionHome";
import CandidateDashboard from "./pages/Election/CandidateDashboard";
import ParticipationForm from "./pages/Election/ParticipationForm";
import ElectionManagementPlatform from "./pages/Election/ElectionManagementPlatform";
import ElectionForm from "./pages/Election/ElectionForm";

export default function App() {
  const location = useLocation();

  const hideLayout =
    location.pathname === "/event-form" ||
    location.pathname === "/giftstatus" ||
    location.pathname === "/eventform-qr" ||
    location.pathname === "/scanDashboard" ||
    location.pathname === "/luckydraw" ||
    location.pathname === "/regeve-admin" ||
    location.pathname === "/dashboard" ||
    location.pathname === "/candidate-dashboard" ||
    location.pathname === "/participationForm" ||
    location.pathname.startsWith("/member-details/");

  return (
    <div className="max-w-full overflow-x-hidden">
      <ScrollToTop />
      {!hideLayout && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/event-form" element={<EventForm />} />
        <Route path="/regeve-admin" element={<RegisterForm />} />
        <Route path="/luckydraw" element={<LuckyDraw />} />
        <Route path="/service/registration" element={<EventRegistration />} />
        <Route path="/service/luckydraw-system-page" element={<LuckydrawFooter />}/>
        <Route path="/service/food-management" element={<FoodManagement />} />
        <Route path="/service/dashboard-system-page" element={<DashboardSystemPage />} />
        <Route path="/member-details/:Member_ID" element={<UserDetail />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/scanDashboard" element={<MemberDashBoard />} />
        <Route path="/eventform-qr" element={<QRCodeForm />} />
        <Route path="/giftstatus" element={<GiftStatusPage />} />
        <Route path="/qr/:memberId" element={<QRRedirect />} />
        <Route path="/electionhome" element={<ElectionHome />} />
        <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
        <Route path="/participationForm" element={<ParticipationForm />} />
        <Route path="/electionManagementplatform"element={<ElectionManagementPlatform />}/>
        <Route path="/electionForm" element={<ElectionForm />} />
      </Routes>

      {!hideLayout && <Footer />}
    </div>
  );
}
