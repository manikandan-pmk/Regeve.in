import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom';

import './App.css'
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Footer from './components/Footer';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import EventForm from './components/EventForm';
import LuckyDraw from './components/LuckyDraw';
import EventRegistration from "./components/services/EventRegistration"
import LuckydrawFooter from './components/services/LuckydrawFooter';
import FoodManagement from './components/services/FoodManagement';
import DashboardSystemPage from './components/services/DashboardSystemPage';
import ScrollToTop from './components/ScrollToTop';
import UserDetail from './components/UserDetail';
import BlogPage from './components/BlogPage';
import HelpCenter from './components/HelpCenter';
import PrivacyPolicy from './components/PrivacyPolicy ';


export default function App() {
  const location = useLocation();

  // Hide navbar & footer on specific pages
  const hideLayout =
    location.pathname === "/event-form" ||
    location.pathname === "/luckydraw" ||
    location.pathname === "/dashboard" ||
    location.pathname.startsWith("/member-details/");

  return (
    <>
      <ScrollToTop />
      {!hideLayout && <Navbar />}

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/event-form' element={<EventForm />} />
        <Route path='/luckydraw' element={<LuckyDraw />} />
        <Route path='/service/registration' element={<EventRegistration />} />
        <Route path='/service/luckydraw-system-page' element={<LuckydrawFooter />} />
        <Route path='/service/food-management' element={<FoodManagement />} />
        <Route path='/service/dashboard-system-page' element={<DashboardSystemPage />} />
        <Route path='/member-details/:Member_ID' element={<UserDetail />} />
        <Route path='/blog' element={<BlogPage />} />
        <Route path='/help' element={<HelpCenter />} />
        <Route path='/privacy' element={<PrivacyPolicy />} />
      </Routes>

      {!hideLayout && <Footer />}
    </>
  );
}

