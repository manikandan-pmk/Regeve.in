import { Routes, Route, useLocation } from "react-router-dom";

import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import EventForm from "./components/EventForm";
import LuckyDraw from "../src/pages/LuckyDraw/LuckyDraw";
import EventRegistration from "./components/services/EventRegistration";
import LuckydrawServices from "./components/services/LuckydrawServices";
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

// 🔐 ELECTION
import ElectionHome from "./pages/Election/ElectionHome";
import CandidateDashboard from "./pages/Election/CandidateDashboard";
import ParticipantDashboard from "./pages/Election/ParticipantDashboard";
import ElectionManagementPlatform from "./pages/Election/ElectionManagementPlatform";
import ElectionForm from "./pages/Election/ElectionForm";
import VotingPage from "./pages/Election/VotingPage";

// 👤 ADMIN
import AdminDashboard from "./pages/AdminDashboard";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";

//Luckydraw
import LuckyDrawDashboard from "./pages/LuckyDraw/LuckyDrawDashboard";
import RegistrationFormLuckydraw from "./pages/LuckyDraw/RegistrationFormLuckydraw";
import EventGallery from "./pages/EventGallery";

export default function App() {
  const location = useLocation();

  // 🚫 Hide Navbar & Footer on specific pages
  const hideLayout =
    location.pathname === "/event-form" ||
    location.pathname === "/giftstatus" ||
    location.pathname === "/eventform-qr" ||
    location.pathname === "/scanDashboard" ||
    location.pathname === "/regeve-admin" ||
    location.pathname === "/dashboard" ||
    location.pathname === "/participationDashboard" ||
    location.pathname.includes("/luckydraw-dashboard") ||
    location.pathname.includes("/luckydraw-form") ||
    location.pathname.includes("/luckydraw") ||
    // ✅ FIXED — Candidate Dashboard
    location.pathname.includes("/candidate-dashboard/") ||
    // ✅ Participant Dashboard (FIXED)
    location.pathname.includes("/participant-dashboard/") ||
    // election pages
    location.pathname.includes("/electionhome") ||
    location.pathname.startsWith("/electionForm") ||
    // member details
    location.pathname.startsWith("/member-details/") ||
    // admin dashboard
    location.pathname.endsWith("/admindashboard") ||
    location.pathname.includes("/votingpage/");

  return (
    <div className="max-w-full overflow-x-hidden">
      <ScrollToTop />

      {!hideLayout && <Navbar />}

      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/eventgallery" element={<EventGallery />} />
        {/* ================= SERVICES ================= */}
        <Route path="/:adminId/dashboard" element={<Dashboard />} />
        <Route path="/event-form" element={<EventForm />} />
        <Route path="/:adminId/luckydraw" element={<LuckyDraw />} />
        <Route path="/service/registration" element={<EventRegistration />} />
        <Route
          path="/service/luckydraw-system-page"
          element={<LuckydrawServices />}
        />
        <Route path="/service/food-management" element={<FoodManagement />} />
        <Route
          path="/service/dashboard-system-page"
          element={<DashboardSystemPage />}
        />
        {/* ================= AUTH ================= */}
        <Route path="/regeve-admin" element={<RegisterForm />} />
        {/* ================= MEMBER / QR ================= */}
        <Route path="/member-details/:Member_ID" element={<UserDetail />} />
        <Route path="/scanDashboard" element={<MemberDashBoard />} />
        <Route path="/eventform-qr" element={<QRCodeForm />} />
        <Route path="/giftstatus" element={<GiftStatusPage />} />
        <Route path="/qr/:memberId" element={<QRRedirect />} />
        {/* ================= ADMIN PROTECTED ================= */}
        <Route
          path="/:adminId/electionhome"
          element={
            <AdminProtectedRoute>
              <ElectionHome />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/:adminId/luckydraw-dashboard"
          element={<LuckyDrawDashboard />}
        />
        <Route
          path="/:adminId/luckydraw-form"
          element={<RegistrationFormLuckydraw />}
        />
        <Route
          path="/:adminId/candidate-dashboard/:electionDocumentId"
          element={
            <AdminProtectedRoute>
              <CandidateDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/:adminId/participant-dashboard/:electionDocumentId"
          element={<ParticipantDashboard />}
        />
        <Route
          path="/electionManagementplatform"
          element={<ElectionManagementPlatform />}
        />
        <Route
          path="/electionForm/:adminId/:electionDocumentId/:electionName"
          element={<ElectionForm />}
        />
        <Route
          path="/:adminId/votingpage/:electionDocumentId"
          element={<VotingPage />}
        />

        {/* ================= ADMIN DASHBOARD ================= */}
        <Route path="/:adminId/admindashboard" element={<AdminDashboard />} />
        {/* ================= FALLBACK ================= */}
        <Route path="/" element={<Home />} />
      </Routes>

      {!hideLayout && <Footer />}
    </div>
  );
}
