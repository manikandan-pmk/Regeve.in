import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Trophy,
  Download,
  Share2,
  Search,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Upload,
  X,
  User,
  Phone,
  CalendarDays,
  CheckCircle,
  History,
  RefreshCw,
  Maximize2,
  Eye,
  AlertCircle,
  CheckCircle2,
  Lock,
  Smartphone,
  ArrowRight,
  Loader2,
  Users,
  Award,
  Filter,
  Sparkles,
  Crown,
  BadgeCheck,
  IndianRupee,
  CreditCard,
  FileText,
  Clock,
  Receipt,
  TrendingUp,
  Shield,
  BarChart3,
  Home,
} from "lucide-react";

// --- CONFIGURATION ---
const API_BASE = "https://api.regeve.in/api";
const API_BASE_URL = "https://api.regeve.in";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const getPaymentProofImage = (payment) => {
  const photo =
    payment?.Payment_Photo?.data?.[0] || // Strapi default
    payment?.Payment_Photo?.[0]; // Your current API

  if (!photo) return null;

  const url = photo.formats?.small?.url || photo.url;

  return url ? `${API_BASE_URL}${url}` : null;
};

// --- 0. TOAST NOTIFICATION COMPONENT ---
const Toast = ({ message, type, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 md:top-6 right-2 md:right-6 z-[100] animate-in slide-in-from-top-5 fade-in duration-300 max-w-[calc(100vw-1rem)]">
      <div
        className={`flex items-center gap-3 px-4 py-3 md:px-5 md:py-3 rounded-xl md:rounded-2xl shadow-2xl backdrop-blur-md border ${
          type === "success"
            ? "bg-emerald-900/90 border-emerald-500/30 text-white"
            : "bg-red-900/90 border-red-500/30 text-white"
        }`}
      >
        {type === "success" ? (
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
        ) : (
          <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold truncate md:whitespace-normal">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors cursor-pointer flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

// --- 0.5 MOBILE VERIFICATION GATE COMPONENT (IMPROVED & RESPONSIVE) ---
const MobileVerificationGate = ({ onVerify, documentId }) => {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!phoneNumber || phoneNumber.length < 10) {
      triggerError("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.get(`/public/lucky-draw-names/${documentId}`);
      const participants = res.data?.lucky_draw_forms || [];
      const matches = participants.filter(
        (u) => String(u.Phone_Number) === String(phoneNumber)
      );
      const userExists = matches.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0];

      if (userExists) {
        if (!userExists.isVerified) {
          triggerError(
            "Your account is not verified yet. Please wait for admin approval."
          );
          return;
        }
        localStorage.setItem("participant_documentId", userExists.documentId);
        localStorage.setItem("participant_phone", userExists.Phone_Number);
        localStorage.setItem("participant_name", userExists.Name);

        // Show success animation before redirect
        setStep(2);
        setTimeout(() => {
          onVerify();
          navigate(`/${adminId}/participant-page/${documentId}`, {
            replace: true,
          });
        }, 1500);
        return;
      }
      triggerError("Mobile number not registered for this event.");
    } catch (err) {
      console.error(err);
      triggerError("Verification failed. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerError = (msg) => {
    setError(msg);
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'linear-gradient(to bottom right, #f8fafc, #eff6ff, #eef2ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '50%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), transparent)' }} />
        <div style={{ position: 'absolute', top: '25%', right: '25%', width: '200px', height: '200px', backgroundColor: '#c7d2fe', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.2 }} />
        <div style={{ position: 'absolute', bottom: '25%', left: '25%', width: '200px', height: '200px', backgroundColor: '#ddd6fe', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.2 }} />
      </div>

      {step === 1 ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 'min(95vw, 380px)',
            maxHeight: 'calc(100dvh - 32px)',
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.7)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            borderRadius: '20px',
            padding: '24px',
            textAlign: 'center',
            overflow: 'auto',
          }}
        >
          <div style={{ position: 'absolute', top: '-22px', left: '50%', transform: 'translateX(-50%)' }}>
            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(to bottom right, #6366f1, #7c3aed)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)', border: '4px solid white', transform: 'rotate(3deg)' }}>
              <Smartphone style={{ color: 'white', width: '22px', height: '22px' }} />
            </div>
          </div>

          <div style={{ marginTop: '16px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', background: 'linear-gradient(to right, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Participant Portal
            </h2>
            <p style={{ color: '#475569', marginBottom: '12px', fontSize: '13px', fontWeight: 500, padding: '0 8px' }}>
              Enter your registered mobile number to access the participant dashboard
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#eef2ff', borderRadius: '9999px' }}>
              <Shield size={12} style={{ color: '#6366f1' }} />
              <span style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 500 }}>Secure Verification</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', insetInlineStart: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <Phone style={{ width: '18px', height: '18px', color: '#94a3b8' }} />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => { setPhoneNumber(e.target.value.replace(/\D/g, "")); setError(""); }}
                maxLength={10}
                style={{
                  width: '100%',
                  paddingLeft: '42px',
                  paddingRight: '16px',
                  paddingTop: '14px',
                  paddingBottom: '14px',
                  backgroundColor: error ? '#fef2f2' : 'white',
                  border: `2px solid ${error ? '#fca5a5' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  outline: 'none',
                  fontWeight: 700,
                  fontSize: '16px',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  color: error ? '#dc2626' : '#1e293b',
                  boxSizing: 'border-box',
                }}
                placeholder="Enter 10-digit number"
                autoFocus
                disabled={isLoading}
              />
            </div>

            {error && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca' }}>
                <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
                <p style={{ color: '#dc2626', fontSize: '12px', fontWeight: 500, textAlign: 'left', margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '15px',
                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isLoading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : <>Access Dashboard <ArrowRight size={18} /></>}
            </button>
          </form>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
              <Lock size={10} />
              <span style={{ fontWeight: 500 }}>End-to-end encrypted</span>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 'min(95vw, 380px)',
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.7)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            borderRadius: '20px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', background: 'linear-gradient(to bottom right, #34d399, #22c55e)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle2 style={{ color: 'white', width: '32px', height: '32px' }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Verification Successful!</h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Welcome back, <span style={{ fontWeight: 700, color: '#4f46e5' }}>{phoneNumber}</span></p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#34d399', borderRadius: '50%' }} className="animate-pulse" />
            <div style={{ width: '8px', height: '8px', backgroundColor: '#34d399', borderRadius: '50%' }} className="animate-pulse" />
            <div style={{ width: '8px', height: '8px', backgroundColor: '#34d399', borderRadius: '50%' }} className="animate-pulse" />
            <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>Redirecting...</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </div>
  );
};

// --- HELPER: Image with Smooth Load Animation ---
const SmoothImage = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse flex items-center justify-center">
          <User className="text-slate-300" size={20} />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover object-center transition-all duration-500 ease-out ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
        }`}
      />
    </div>
  );
};

// --- STATS CARDS COMPONENT (RESPONSIVE) ---
const StatsCards = ({ participants, luckyDrawAmount, paymentStats }) => {
  const totalParticipants = participants.length;
  const winners = participants.filter((p) => p.isWinner).length;
  const paidParticipants = participants.filter(
    (p) => p.paymentStatus === "paid"
  ).length;
  const pendingVerification = participants.filter(
    (p) => p.paymentStatus === "pending_verification"
  ).length;

  const stats = [
    {
      label: "Total Participants",
      value: totalParticipants,
      icon: Users,
      color: "indigo",
    },
    {
      label: " Winners",
      value: winners,
      icon: Crown,
      color: "amber",
    },
    {
      label: "Amount Per Head",
      value: `₹${luckyDrawAmount.toLocaleString()}`,
      icon: IndianRupee,
      color: "emerald",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 md:hover:-translate-y-1 transition-all duration-300 group"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-slate-500 text-xs md:text-sm font-medium mb-1 md:mb-2 flex items-center gap-2 truncate">
                <span
                  className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-${stat.color}-500 flex-shrink-0`}
                ></span>
                <span className="truncate">{stat.label}</span>
              </p>
              <p className="text-xl md:text-2xl font-bold text-slate-800 mb-1 truncate">
                {stat.value}
              </p>
            </div>
            <div
              className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-${stat.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 ml-2`}
            >
              <stat.icon
                className={`text-${stat.color}-600 w-5 h-5 md:w-6 md:h-6`}
              />
            </div>
          </div>
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-100">
            <div className="w-full bg-slate-100 rounded-full h-1 md:h-1.5">
              <div
                className={`bg-${stat.color}-500 h-1 md:h-1.5 rounded-full transition-all duration-1000`}
                style={{
                  width: `${Math.min(
                    (stat.value / (totalParticipants || 1)) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- 1. QR CODE MODAL (RESPONSIVE - NO SCROLL, FIT TO SCREEN) ---
const QRCodeModal = ({
  isOpen,
  onClose,
  participant,
  qrImage,
  amount,
  upiId,
  showToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const paymentLink = `https://regeve.in/payment/${upiId || "payment"}`;
  const qrImageUrl = qrImage || null;

  const handleCopyUPI = () => {
    if (!upiId) {
      showToast("UPI ID not available", "error");
      return;
    }

    navigator.clipboard.writeText(upiId).then(() => {
      setCopied(true);
      showToast("UPI ID copied!", "success");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadQR = async () => {
    if (!qrImageUrl) {
      showToast("No QR Code available to download", "error");
      return;
    }

    setDownloading(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = qrImageUrl;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `payment-qr-${new Date().getTime()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast("QR Code downloaded!", "success");
            setDownloading(false);
          },
          "image/jpeg",
          0.95
        );
      };
    } catch (e) {
      showToast("Download failed. Please try again.", "error");
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareText = `Pay ₹${amount}\nUPI: ${upiId}\nScan QR to pay`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Payment QR Code",
          text: shareText,
          url: paymentLink,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          navigator.clipboard.writeText(shareText);
          setCopied(true);
          showToast("Payment details copied!", "success");
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      showToast("Payment details copied!", "success");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 'min(95vw, 400px)',
          maxHeight: 'calc(100dvh - 32px)',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Gradient Bar */}
        <div style={{ height: '4px', background: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)', flexShrink: 0 }} />

        <div style={{ padding: '16px', overflow: 'auto', flex: 1 }}>
          {/* Compact Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                Pay ₹{amount.toLocaleString("en-IN")}
              </h2>
              <p style={{ color: '#64748b', fontSize: '12px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Scan QR or use UPI ID below
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ padding: '6px', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }}
            >
              <X size={18} style={{ color: '#94a3b8' }} />
            </button>
          </div>

          {/* QR Code Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <div style={{ width: 'min(180px, 45vw)', height: 'min(180px, 45vw)', backgroundColor: 'white', borderRadius: '8px', padding: '8px', border: '2px solid #f1f5f9' }}>
                {qrImageUrl ? (
                  <img src={qrImageUrl} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)', borderRadius: '4px' }}>
                    <QrCode size={48} style={{ color: '#cbd5e1' }} />
                  </div>
                )}
              </div>
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '20px', height: '20px', backgroundColor: '#6366f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <CheckCircle size={10} style={{ color: 'white' }} />
              </div>
            </div>

            {/* Amount Display */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'linear-gradient(to right, #ecfdf5, #f0fdf4)', borderRadius: '8px', border: '1px solid #d1fae5', marginBottom: '8px' }}>
              <IndianRupee size={14} style={{ color: '#059669' }} />
              <p style={{ fontSize: '20px', fontWeight: 700, color: '#047857', margin: 0 }}>
                {amount.toLocaleString("en-IN")}
              </p>
            </div>

            {upiId && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>UPI ID</p>
                <button
                  onClick={handleCopyUPI}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', color: '#1e293b', cursor: 'pointer' }}
                >
                  <CreditCard size={14} />
                  {upiId}
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={handleDownloadQR}
              disabled={downloading || !qrImageUrl}
              style={{ flex: 1, padding: '12px', background: 'linear-gradient(to right, #1e293b, #0f172a)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: downloading || !qrImageUrl ? 'not-allowed' : 'pointer', opacity: downloading || !qrImageUrl ? 0.5 : 1, fontSize: '13px' }}
            >
              {downloading ? <><Loader2 size={16} className="animate-spin" /> Downloading...</> : <><Download size={16} /> Save QR</>}
            </button>
            <button
              onClick={handleShare}
              style={{ flex: 1, padding: '12px', background: 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}
            >
              <Share2 size={16} /> Share
            </button>
          </div>

          {/* Footer */}
          <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
              <Shield size={10} style={{ color: '#94a3b8' }} />
              <span>Secure payment • Instant confirmation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 2. UPLOAD MODAL (RESPONSIVE) ---
const getWeekOfMonth = (date) => Math.ceil(date.getDate() / 7);
const getMonthLabel = (date) => date.toLocaleString("en-US", { month: "long" });

const UploadScreenshotModal = ({
  isOpen,
  onClose,
  participant,
  luckydrawDocumentId,
  onUploadComplete,
  showToast,
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCycle, setPaymentCycle] = useState("");
  const [paymentCycles, setPaymentCycles] = useState([]);
  const [durationInfo, setDurationInfo] = useState({ value: 1, unit: "week" });
  const [dragOver, setDragOver] = useState(false);

  const fileRef = useRef(null);
  const modalRef = useRef(null);

  // Fetch payment cycles when modal opens
  useEffect(() => {
    if (isOpen && luckydrawDocumentId) {
      fetchPaymentCycles();
    }
  }, [isOpen, luckydrawDocumentId]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (confirmOpen) {
          setConfirmOpen(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, confirmOpen, onClose]);

  const fetchPaymentCycles = async () => {
    try {
      const res = await api.get(
        `/public/lucky-draw-names/${luckydrawDocumentId}`
      );
      const luckyDraw = res.data;

      if (luckyDraw) {
        const durationValue = luckyDraw.Duration_Value || 1;
        const rawUnit = luckyDraw.Duration_Unit || "week";

        // 🔥 normalize unit (THIS FIXES DROPDOWN)
        const durationUnit = rawUnit.toLowerCase().includes("month")
          ? "month"
          : "week";

        setDurationInfo({ value: durationValue, unit: durationUnit });

        const startDate = new Date(luckyDraw.createdAt);
        const cycles = generatePaymentCycles(
          durationValue,
          durationUnit,
          startDate
        );

        setPaymentCycles(cycles);

        if (cycles.length > 0) {
          setPaymentCycle(cycles[0]);
        }

        if (luckyDraw.Amount) {
          const totalAmount = Number(luckyDraw.Amount);
          const participants = luckyDraw.lucky_draw_forms?.length || 1;
          const perParticipantAmount = Math.floor(totalAmount / participants);
          setPaymentAmount(perParticipantAmount.toString());
        }
      }
    } catch (error) {
      console.error("Error fetching payment cycles:", error);
      showToast("Failed to load payment cycles", "error");
    }
  };

  const generatePaymentCycles = (durationValue, durationUnit, startDate) => {
    const cycles = [];

    for (let i = 0; i < durationValue; i++) {
      const cycleStart = new Date(startDate);
      const cycleEnd = new Date(startDate);

      if (durationUnit === "week") {
        cycleStart.setDate(startDate.getDate() + i * 7);
        cycleEnd.setDate(cycleStart.getDate() + 6);
      }

      if (durationUnit === "month") {
        cycleStart.setMonth(startDate.getMonth() + i, 1);
        cycleEnd.setMonth(cycleStart.getMonth() + 1, 0);
      }

      cycles.push({
        value: `${durationUnit}-${i + 1}`,
        label: `${durationUnit === "week" ? "Week" : "Month"} ${i + 1}
        (${cycleStart.toLocaleDateString(
          "en-IN"
        )} - ${cycleEnd.toLocaleDateString("en-IN")})`,
        startDate: cycleStart,
        endDate: cycleEnd,
      });
    }

    return cycles;
  };

  if (!isOpen) return null;

  const handleFile = (f) => {
    if (!f) return;

    // Validate file type
    if (!f.type.startsWith("image/")) {
      showToast("Please select an image file (JPG, PNG, etc.)", "error");
      return;
    }

    // Validate file size (5MB max)
    if (f.size > 5 * 1024 * 1024) {
      showToast("File size should be less than 5MB", "error");
      return;
    }

    setFile(f);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    handleFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const openConfirmPopup = () => {
    if (!file) {
      showToast("Please select a payment screenshot", "error");
      return;
    }
    if (!paymentAmount || isNaN(paymentAmount) || Number(paymentAmount) <= 0) {
      showToast("Please enter a valid payment amount", "error");
      return;
    }
    if (!paymentCycle) {
      showToast("Please select a payment cycle", "error");
      return;
    }
    setConfirmOpen(true);
  };

  const submitPayment = async () => {
    try {
      setUploading(true);

      const participantDocumentId = localStorage.getItem(
        "participant_documentId"
      );

      if (!participantDocumentId) {
        showToast("Participant not verified", "error");
        return;
      }

      const formData = new FormData();
      formData.append("files", file);

      const uploadRes = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedImageId = uploadRes.data[0]?.id;

      await api.post("/lucky-draw-participant-payments", {
        data: {
          Amount: Number(paymentAmount),
          Payment_Cycle: Number(paymentCycle.value.split("-")[1]),

          due_date: paymentCycle.endDate,
          lucky_draw_form: participantDocumentId,
          lucky_draw_name: luckydrawDocumentId,
          Payment_Photo: [uploadedImageId],
        },
      });

      showToast("Payment proof submitted successfully!", "success");

      setConfirmOpen(false);
      onClose();
      onUploadComplete?.();
    } catch (err) {
      console.error("Payment submission error:", err);
      showToast("Upload failed. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      if (!uploading) {
        onClose();
      }
    }
  };

  return (
    <>
      {/* Main Modal */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          style={{
            width: '100%',
            maxWidth: 'min(95vw, 440px)',
            maxHeight: 'calc(100dvh - 24px)',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ height: '4px', background: 'linear-gradient(to right, #3b82f6, #a855f7)', flexShrink: 0 }} />

          <div style={{ padding: '16px', overflow: 'auto', flex: 1 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ minWidth: 0, paddingRight: '8px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Submit Payment Proof
                </h2>
                <p style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Upload screenshot and fill details
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={uploading}
                style={{ padding: '6px', background: 'transparent', border: 'none', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1, flexShrink: 0 }}
              >
                <X size={18} style={{ color: '#94a3b8' }} />
              </button>
            </div>

            {/* Payment Amount Input */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                <IndianRupee size={12} style={{ color: '#10b981' }} />
                <span>Payment Amount (₹)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="1"
                  style={{ width: '100%', padding: '10px 40px 10px 12px', backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontSize: '14px', fontWeight: 700, color: '#1e293b', boxSizing: 'border-box' }}
                  placeholder="Enter amount"
                  disabled={uploading}
                />
                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: '12px' }}>INR</span>
                </div>
              </div>
            </div>

            {/* Payment Cycle Selection */}
            <div style={{ marginBottom: '12px', position: 'relative' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                <CalendarDays size={12} style={{ color: '#3b82f6' }} />
                <span>Payment Cycle</span>
              </label>
              <select
                value={paymentCycle?.value || ""}
                onChange={(e) => {
                  const selected = paymentCycles.find((c) => c.value === e.target.value);
                  setPaymentCycle(selected);
                }}
                style={{ width: '100%', padding: '10px 32px 10px 12px', backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', appearance: 'none', cursor: 'pointer', fontSize: '13px', color: '#1e293b', boxSizing: 'border-box' }}
                disabled={uploading}
              >
                <option value="">Select a payment cycle</option>
                {paymentCycles.map((cycle) => (
                  <option key={cycle.value} value={cycle.value}>{cycle.label}</option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: '12px', bottom: '12px', pointerEvents: 'none' }}>
                <ChevronRight size={14} style={{ color: '#94a3b8', transform: 'rotate(90deg)' }} />
              </div>
            </div>

            {/* Upload Box */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                <Upload size={12} style={{ color: '#a855f7' }} />
                <span>Payment Screenshot</span>
              </label>
              <div
                onClick={() => !file && !uploading && fileRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{
                  border: `2px dashed ${dragOver ? '#818cf8' : preview ? '#818cf8' : '#cbd5e1'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  minHeight: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  backgroundColor: dragOver || preview ? '#eef2ff' : 'transparent',
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                <input ref={fileRef} type="file" hidden accept="image/*" onChange={handleFileChange} disabled={uploading} />

                {preview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={preview} alt="Preview" style={{ maxHeight: '80px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '8px' }} />
                    {!uploading && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                        style={{ padding: '6px 12px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        <X size={12} /> Change
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div style={{ width: '40px', height: '40px', backgroundColor: dragOver ? '#c7d2fe' : '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                      <Upload size={18} style={{ color: dragOver ? '#4f46e5' : '#94a3b8' }} />
                    </div>
                    <p style={{ fontWeight: 500, color: '#374151', marginBottom: '4px', fontSize: '12px' }}>
                      {dragOver ? "Drop image here" : "Click to upload or drag & drop"}
                    </p>
                    <p style={{ fontSize: '11px', color: '#64748b' }}>PNG, JPG up to 5MB</p>
                  </>
                )}
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={openConfirmPopup}
              disabled={!file || !paymentAmount || !paymentCycle || uploading}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: !file || !paymentAmount || !paymentCycle || uploading ? 'not-allowed' : 'pointer',
                opacity: !file || !paymentAmount || !paymentCycle || uploading ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
            >
              {uploading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <>Continue to Review <ArrowRight size={16} /></>}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => e.target === e.currentTarget && !uploading && setConfirmOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 'min(95vw, 440px)',
              maxHeight: 'calc(100dvh - 24px)',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '16px', overflow: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Confirm Payment Details</h2>
                <button
                  onClick={() => !uploading && setConfirmOpen(false)}
                  disabled={uploading}
                  style={{ padding: '6px', background: 'transparent', border: 'none', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1 }}
                >
                  <X size={18} style={{ color: '#94a3b8' }} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: 'linear-gradient(to right, #f8fafc, white)', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IndianRupee size={10} /> Payment Amount
                  </p>
                  <p style={{ fontWeight: 700, fontSize: '20px', color: '#1e293b', margin: 0 }}>₹{Number(paymentAmount).toLocaleString("en-IN")}</p>
                </div>

                <div style={{ padding: '12px', background: 'linear-gradient(to right, #f8fafc, white)', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CalendarDays size={10} /> Payment Cycle
                  </p>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{paymentCycle?.label}</p>
                </div>

                {preview && (
                  <div style={{ padding: '12px', background: 'linear-gradient(to right, #ecfdf5, white)', borderRadius: '12px', border: '1px solid #d1fae5', textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <CheckCircle size={10} /> Screenshot Preview
                    </p>
                    <img src={preview} alt="Payment proof" style={{ borderRadius: '8px', maxHeight: '70px', margin: '0 auto', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                  </div>
                )}

                <div style={{ padding: '10px', background: 'linear-gradient(to right, #eff6ff, white)', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <p style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={10} /> Important Note
                  </p>
                  <p style={{ fontSize: '11px', color: '#1d4ed8', margin: 0 }}>Your payment will be verified within 24 hours.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => !uploading && setConfirmOpen(false)}
                  disabled={uploading}
                  style={{ flex: 1, padding: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1, fontSize: '13px' }}
                >
                  Back
                </button>
                <button
                  onClick={submitPayment}
                  disabled={uploading}
                  style={{ flex: 1, padding: '12px', background: 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}
                >
                  {uploading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <>Confirm <CheckCircle size={14} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- 3. IMAGE PREVIEW MODAL (RESPONSIVE - NO SCROLL) ---
const ImagePreviewModal = ({ isOpen, onClose, imageUrl, name }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  if (!isOpen || !imageUrl) return null;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const resetView = () => { setZoom(1); setPosition({ x: 0, y: 0 }); };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(8px)',
        padding: '8px',
      }}
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 50 }}>
        <button onClick={resetView} style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', cursor: 'pointer', color: 'white' }} title="Reset Zoom">
          <RefreshCw size={18} />
        </button>
        <button onClick={onClose} style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', cursor: 'pointer', color: 'white' }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '100%', maxHeight: 'calc(100dvh - 100px)' }}>
          <img
            src={imageUrl}
            alt={name}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: 'calc(100dvh - 120px)',
              objectFit: 'contain',
              cursor: isDragging ? 'grabbing' : 'grab',
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.2s ease',
            }}
            onMouseDown={handleMouseDown}
          />
        </div>
        <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', borderRadius: '9999px', padding: '8px 16px', maxWidth: '90%' }}>
          <h3 style={{ color: 'white', fontSize: '14px', fontWeight: 500, margin: 0, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</h3>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '2px', textAlign: 'center' }}>Zoom: {Math.round(zoom * 100)}% • Drag to pan</div>
        </div>
      </div>
    </div>
  );
};

// --- PAYMENT HISTORY MODAL (RESPONSIVE - NO SCROLL, FIT TO SCREEN) ---
const PaymentHistoryModal = ({
  isOpen,
  onClose,
  participant,
  paymentHistory,
  onImageClick,
  showToast,
}) => {
  if (!isOpen || !participant) return null;

  const handleViewProof = (imageUrl, cycleName) => {
    onClose();
    setTimeout(() => {
      onImageClick(imageUrl, `Payment Proof - ${cycleName}`);
    }, 300);
  };

  const totalPaid = paymentHistory.filter((p) => p.isVerified).reduce((sum, p) => sum + (Number(p.Amount) || 0), 0);
  const pendingAmount = paymentHistory.filter((p) => !p.isVerified).reduce((sum, p) => sum + (Number(p.Amount) || 0), 0);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 'min(95vw, 560px)',
          maxHeight: 'calc(100dvh - 24px)',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(to right, #f8fafc, white)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ minWidth: 0, paddingRight: '8px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Payment History</h2>
              <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {participant.name} • {paymentHistory.length} payment{paymentHistory.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button onClick={onClose} style={{ padding: '6px', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }}>
              <X size={18} style={{ color: '#94a3b8' }} />
            </button>
          </div>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ padding: '10px', backgroundColor: '#ecfdf5', borderRadius: '10px', border: '1px solid #d1fae5' }}>
              <p style={{ fontSize: '11px', color: '#059669', fontWeight: 500, marginBottom: '2px' }}>Total Paid</p>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#047857', margin: 0 }}>₹{totalPaid.toLocaleString("en-IN")}</p>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a' }}>
              <p style={{ fontSize: '11px', color: '#d97706', fontWeight: 500, marginBottom: '2px' }}>Pending</p>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#b45309', margin: 0 }}>₹{pendingAmount.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          {paymentHistory && paymentHistory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {paymentHistory.map((payment, index) => {
                const paymentProofImage = getPaymentProofImage(payment);
                const paymentDate = new Date(payment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

                return (
                  <div
                    key={payment.id || index}
                    style={{ background: 'linear-gradient(to right, #f8fafc, white)', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: payment.isVerified ? '#10b981' : '#f59e0b', flexShrink: 0 }} />
                          <p style={{ fontWeight: 700, color: '#1e293b', fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{payment.Payment_Cycle}</p>
                        </div>
                        <p style={{ fontSize: '11px', color: '#64748b', marginLeft: '14px' }}>
                          <Clock size={10} style={{ display: 'inline', marginRight: '4px' }} />{paymentDate}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>₹{Number(payment.Amount).toLocaleString("en-IN")}</p>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px', padding: '3px 8px', borderRadius: '9999px', fontSize: '10px', fontWeight: 600, backgroundColor: payment.isVerified ? '#d1fae5' : '#fef3c7', color: payment.isVerified ? '#047857' : '#b45309' }}>
                          {payment.isVerified ? <><CheckCircle size={10} /> Verified</> : <><Clock size={10} /> Pending</>}
                        </div>
                      </div>
                    </div>

                    {paymentProofImage && (
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: '11px', color: '#374151', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                          <FileText size={10} /> Payment Proof
                        </p>
                        <button
                          onClick={() => { if (paymentProofImage) handleViewProof(paymentProofImage, payment.Payment_Cycle); }}
                          style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Eye size={10} /> View <ArrowRight size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ width: '60px', height: '60px', margin: '0 auto 16px', background: 'linear-gradient(to bottom right, #f1f5f9, #e2e8f0)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Receipt size={24} style={{ color: '#cbd5e1' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>No Payment History</h3>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>No payments made yet.</p>
              <button
                onClick={onClose}
                style={{ padding: '10px 20px', background: 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 500, cursor: 'pointer', fontSize: '13px' }}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getWinnerCycleLabel = (participant) => {
  if (!participant?.winnerCycleNumber || !participant?.winnerCycleUnit)
    return null;

  return `${participant.winnerCycleUnit} ${participant.winnerCycleNumber}`;
};

// --- PARTICIPANT CARD COMPONENT (RESPONSIVE) ---
const ParticipantCard = ({ participant, index, onImageClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleImageClick = (url, name) => {
    if (url) onImageClick(url, name);
  };

  const statusConfig = {
    paid: { label: "PAID", icon: CheckCircle },
    pending_verification: { label: "PENDING VERIFICATION", icon: Clock },
    pending: { label: "PENDING", icon: AlertCircle },
  };

  const StatusIcon =
    statusConfig[participant.paymentStatus]?.icon || AlertCircle;

  const winnerCycleLabel = getWinnerCycleLabel(participant);

  return (
    <div
      className="group bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5 sm:hover:-translate-y-2 transition-all duration-500 overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Winner Badge */}
      {participant.isWinner && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 animate-in zoom-in duration-300">
          <div
            className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 
                    text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 
                    rounded-lg flex flex-col items-center gap-0.5 shadow-lg"
          >
            <div className="flex items-center gap-1">
              <Crown size={10} />
              <span>WINNER</span>
            </div>

            {winnerCycleLabel && (
              <span className="text-[10px] font-semibold opacity-90">
                {winnerCycleLabel}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Profile Image */}
      <div className="relative mb-3 sm:mb-4 md:mb-6">
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-lg sm:rounded-xl md:rounded-2xl mx-auto overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 cursor-pointer border-2 sm:border-4 border-white shadow-lg sm:shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-500 relative"
          onClick={() =>
            handleImageClick(participant.photoUrl, participant.name)
          }
        >
          {participant.photoUrl ? (
            <SmoothImage
              src={participant.photoUrl}
              alt={participant.name}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User
                size={24}
                className="text-slate-300 sm:w-8 sm:h-8 md:w-12 md:h-12"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Animated Ring */}
        <div className="absolute inset-0 rounded-lg sm:rounded-xl border border-green-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      {/* Participant Info */}
      <div className="text-center mb-3 sm:mb-4 md:mb-5 relative z-10">
        <h3 className="font-bold text-base sm:text-lg md:text-xl text-slate-900 mb-1 sm:mb-2 truncate group-hover:text-indigo-600 transition-colors duration-300 px-1">
          {participant.name}
        </h3>
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2 md:mb-3">
          <Phone size={12} className="text-slate-400" />
          <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
            {participant.phone}
          </p>
        </div>
        <p className="text-xs text-slate-500 truncate px-1">
          {participant.email || "No email provided"}
        </p>
      </div>

      {/* Bottom Border Animation */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 group-hover:w-3/4 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent transition-all duration-700"></div>
    </div>
  );
};

// --- MAIN PAGE (RESPONSIVE) ---
export default function ParticipantDetailsPage() {
  const { adminId, luckydrawDocumentId } = useParams();
  const participantDocumentId = localStorage.getItem("participant_documentId");
  const participantName = localStorage.getItem("participant_name");

  const documentId = luckydrawDocumentId;
  const navigate = useNavigate();

  const [isVerified, setIsVerified] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [luckyDrawQR, setLuckyDrawQR] = useState(null);
  const [luckyDrawAmount, setLuckyDrawAmount] = useState(0);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [upiId, setUpiId] = useState("");

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const [activeModal, setActiveModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [previewImage, setPreviewImage] = useState({
    isOpen: false,
    url: null,
    name: "",
  });
  const [userPaymentHistory, setUserPaymentHistory] = useState([]);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const fetchParticipants = useCallback(
    async (isBackgroundRefresh = false) => {
      if (!documentId) return;

      if (!isBackgroundRefresh) {
        setIsRefreshing(true);
        setIsLoading(true);
      }

      try {
        const res = await api.get(`/public/lucky-draw-names/${documentId}`);
        const data = res.data;

        const participantPayments = data?.participant_payments || [];
        const participantsList = data?.lucky_draw_forms || [];

        // 🔥 FLATTEN WINNERS FROM PARTICIPANTS (IMPORTANT)
        const allWinners = participantsList.flatMap(
          (p) => p.lucky_draw_winners || []
        );

        // ✅ SET UPI ID FROM BACKEND
        setUpiId(data?.Upi_Id || "");

        const mappedParticipants = participantsList.map((item) => {
          const photo =
            item.Photo?.formats?.small?.url ||
            item.Photo?.formats?.thumbnail?.url ||
            item.Photo?.url ||
            null;

          const userPayments = participantPayments.filter(
            (payment) =>
              String(payment.lucky_draw_form?.documentId) ===
              String(item.documentId)
          );

          const hasVerified = userPayments.some((p) => p.isVerified);
          const hasPending = userPayments.some((p) => !p.isVerified);

          let paymentStatus = "pending";
          if (hasVerified) paymentStatus = "paid";
          else if (hasPending) paymentStatus = "pending_verification";

          // ✅ CORRECT WINNER SOURCE
          const winnerInfo = (item.lucky_draw_winners || [])[0] || null;

          return {
            id: item.id,
            documentId: item.documentId,
            isVerified: item.isVerified,
            name: item.Name,
            email: item.Email,
            phone: item.Phone_Number,

            // 🏆 WINNER FLAGS (FIXED)
            isWinner: !!winnerInfo,
            winnerCycleNumber: winnerInfo?.Cycle_Number ?? null,
            winnerCycleUnit: winnerInfo?.Cycle_Unit ?? null,

            paymentStatus,
            joinedDate: new Date(item.createdAt).toLocaleDateString(),
            photoUrl: photo ? `${API_BASE_URL}${photo}` : null,
            paymentHistory: [...userPayments],
          };
        });

        // 🔥 FORCE UI UPDATE
        setParticipants([...mappedParticipants]);

        // ✅ CURRENT USER PAYMENT HISTORY
        const myPayments = participantPayments.filter(
          (payment) =>
            String(payment.lucky_draw_form?.documentId) ===
            String(participantDocumentId)
        );

        setUserPaymentHistory([...myPayments]); // 🔥 FORCE UPDATE

        // ✅ QR CODE
        const qr =
          data?.QRcode?.formats?.medium?.url ||
          data?.QRcode?.formats?.small?.url ||
          data?.QRcode?.formats?.thumbnail?.url ||
          data?.QRcode?.url ||
          null;

        setLuckyDrawQR(qr ? `${API_BASE_URL}${qr}` : null);

        // ✅ AMOUNT PER PARTICIPANT
        const totalAmount = Number(data?.Amount || 0);
        const totalParticipants = participantsList.length || 0;
        const perParticipantAmount =
          totalParticipants > 0
            ? Math.floor(totalAmount / totalParticipants)
            : 0;

        setLuckyDrawAmount(perParticipantAmount);
      } catch (error) {
        console.error("Error fetching participants:", error);
        showToast("Failed to load participants", "error");
      } finally {
        setIsRefreshing(false);
        setIsLoading(false);
      }
    },
    [documentId, participantDocumentId]
  );

  useEffect(() => {
    if (isVerified) {
      fetchParticipants(false);
      const intervalId = setInterval(() => fetchParticipants(true), 30000);
      return () => clearInterval(intervalId);
    }
  }, [fetchParticipants, isVerified]);

  const openModal = (type, user) => {
    setSelectedUser(user);
    if (user && user.paymentHistory) {
      setUserPaymentHistory(user.paymentHistory);
    } else {
      setUserPaymentHistory([]);
    }
    setActiveModal(type);
  };

  const handleImageClick = (url, name) => {
    if (url) setPreviewImage({ isOpen: true, url, name });
  };

  const handleBackToHome = () => {
    navigate(`/${adminId}/home`);
  };

  if (!isVerified) {
    return (
      <MobileVerificationGate
        documentId={documentId}
        onVerify={() => setIsVerified(true)}
      />
    );
  }

  const filtered = participants.filter(
    (p) =>
      p.isVerified === true && // ✅ participant verified
      (filter === "all" || (filter === "winners" && p.isWinner)) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-white">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-blue-50/10 to-transparent"></div>
        <div className="absolute top-20 left-4 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-20 right-4 sm:right-10 w-48 h-48 sm:w-72 sm:h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative min-w-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 truncate">
                      Participants Dashboard
                    </h1>
                    <div className="absolute -bottom-1 left-0 w-12 sm:w-16 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                  </div>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-2 flex items-center gap-1 sm:gap-2 truncate">
                  <Users size={12} className="flex-shrink-0" />
                  <span>
                    Welcome,{" "}
                    <span className="font-bold text-indigo-600">
                      {participantName}
                    </span>
                  </span>
                  <span className="text-slate-400 hidden sm:inline">•</span>
                  <span className="hidden sm:inline">
                    Manage and view all participants
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() =>
                  openModal("paymentHistory", {
                    name: participantName,
                    paymentHistory: userPaymentHistory,
                  })
                }
                className="px-3 py-1.5 sm:px-4 sm:py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg sm:rounded-xl font-medium hover:shadow-md sm:hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-1 sm:gap-2 cursor-pointer border border-blue-200 group text-xs sm:text-sm"
              >
                <History
                  size={14}
                  className="group-hover:rotate-180 transition-transform duration-700 sm:w-4 sm:h-4"
                />
                <span className="hidden sm:inline">View All Payments</span>
                <span className="inline sm:hidden">Payments</span>
              </button>
              <button
                onClick={() => openModal("qr", null)}
                className="px-3 py-1.5 sm:px-4 sm:py-2.5 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 rounded-lg sm:rounded-xl font-medium hover:shadow-md sm:hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-1 sm:gap-2 cursor-pointer border border-indigo-200 group text-xs sm:text-sm"
              >
                <QrCode
                  size={14}
                  className="group-hover:scale-110 transition-transform sm:w-4 sm:h-4"
                />
                <span className="hidden sm:inline">QR Code</span>
                <span className="inline sm:hidden">QR</span>
              </button>
              <button
                onClick={() => openModal("upload", null)}
                className="px-3 py-1.5 sm:px-4 sm:py-2.5 bg-gradient-to-r from-slate-900 to-black text-white rounded-lg sm:rounded-xl font-medium hover:shadow-lg sm:hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center gap-1 sm:gap-2 cursor-pointer group text-xs sm:text-sm"
              >
                <Upload
                  size={14}
                  className="group-hover:translate-y-1 transition-transform sm:w-4 sm:h-4"
                />
                <span className="hidden sm:inline">Upload Proof</span>
                <span className="inline sm:hidden">Upload</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 relative z-10">
        {/* Stats Section */}
        <StatsCards
          participants={participants}
          luckyDrawAmount={luckyDrawAmount}
          paymentStats={{}}
        />

        {/* Search and Filter Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-200/80 shadow-sm mb-4 sm:mb-6 md:mb-8 hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative group">
                <Search
                  className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-indigo-400 transition-colors"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search participants..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 sm:pl-10 md:pl-12 pr-8 sm:pr-4 py-2.5 sm:py-3 md:py-3.5 bg-slate-50/50 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 font-medium placeholder-slate-400 hover:border-slate-300 text-sm sm:text-base"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-0.5 sm:p-1 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X size={14} className="text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex bg-slate-100 p-0.5 sm:p-1 rounded-lg sm:rounded-xl">
                {["all", "winners"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${
                      filter === f
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    {f === "all" ? "All" : "Winners"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => fetchParticipants(false)}
                disabled={isRefreshing}
                className="p-1.5 sm:p-2.5 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-lg sm:rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50 hover:shadow-md active:scale-95"
                title="Refresh data"
              >
                <RefreshCw
                  size={16}
                  className={isRefreshing ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-10 sm:py-12 md:py-16 animate-in fade-in duration-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6">
              <div className="w-full h-full rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-r from-indigo-200 to-purple-200 animate-pulse flex items-center justify-center">
                <Loader2
                  size={24}
                  className="text-indigo-400 animate-spin sm:w-8 sm:h-8"
                />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 sm:mb-2">
              Loading Participants...
            </h3>
            <p className="text-slate-500 text-sm">Fetching the latest data</p>
          </div>
        )}

        {/* Participants Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 animate-in fade-in duration-500">
            {filtered.map((participant, index) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                index={index}
                onImageClick={handleImageClick}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-10 sm:py-12 md:py-16 animate-in fade-in duration-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center">
              <Users size={28} className="text-slate-300 sm:w-10 sm:h-10" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 sm:mb-2">
              No participants found
            </h3>
            <p className="text-slate-500 mb-4 sm:mb-6 text-sm">
              {search
                ? "Try a different search term"
                : "No participants available for the selected filter"}
            </p>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl font-medium transition-colors text-sm"
                >
                  Clear Search
                </button>
              )}
              <button
                onClick={() => setFilter("all")}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-medium hover:shadow-md sm:hover:shadow-lg transition-all text-sm"
              >
                Show All
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => openModal("upload", null)}
        className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 md:bottom-8 md:right-8 z-30 p-3 sm:p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl sm:shadow-2xl hover:shadow-2xl sm:hover:shadow-3xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer group animate-bounce-slow"
      >
        <Upload
          size={20}
          className="group-hover:rotate-180 transition-transform duration-500 sm:w-6 sm:h-6"
        />
      </button>

      {/* Modals */}
      <QRCodeModal
        isOpen={activeModal === "qr"}
        onClose={() => setActiveModal(null)}
        participant={selectedUser}
        qrImage={luckyDrawQR}
        amount={luckyDrawAmount}
        upiId={upiId}
        showToast={showToast}
      />
      <UploadScreenshotModal
        isOpen={activeModal === "upload"}
        onClose={() => setActiveModal(null)}
        participant={selectedUser}
        luckydrawDocumentId={documentId}
        onUploadComplete={() => fetchParticipants(false)}
        showToast={showToast}
      />
      <PaymentHistoryModal
        isOpen={activeModal === "paymentHistory"}
        onClose={() => setActiveModal(null)}
        participant={selectedUser}
        paymentHistory={userPaymentHistory}
        showToast={showToast}
        onImageClick={handleImageClick}
      />
      <ImagePreviewModal
        isOpen={previewImage.isOpen}
        onClose={() => setPreviewImage({ ...previewImage, isOpen: false })}
        imageUrl={previewImage.url}
        name={previewImage.name}
      />

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        
        @media (min-width: 475px) {
          .xs\:grid-cols-2 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
