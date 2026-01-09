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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/80 to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-indigo-200 rounded-full blur-[60px] opacity-20" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-purple-200 rounded-full blur-[60px] opacity-20" />
      </div>

      {step === 1 ? (
        <div className="relative w-full max-w-[95vw] sm:max-w-md max-h-[calc(100dvh-2rem)] bg-white/95 backdrop-blur-md border border-white/70 shadow-2xl rounded-2xl p-6 text-center overflow-auto">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg border-4 border-white rotate-3">
              <Smartphone className="text-white w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 mb-5">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Participant Portal
            </h2>
            <p className="text-slate-600 mb-3 text-sm font-medium px-2">
              Enter your registered mobile number to access the participant
              dashboard
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-full">
              <Shield size={12} className="text-indigo-500" />
              <span className="text-xs text-indigo-700 font-medium">
                Secure Verification
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Phone className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                maxLength={10}
                className={`w-full pl-10 pr-4 py-3.5 ${
                  error
                    ? "bg-red-50 border-red-300 text-red-600"
                    : "bg-white border-slate-200 text-slate-800"
                } border-2 rounded-xl outline-none font-bold text-base tracking-wide text-center placeholder-slate-400 disabled:opacity-50`}
                placeholder="Enter 10-digit number"
                autoFocus
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2.5 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-xs font-medium text-left m-0">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Access Dashboard
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Lock size={10} />
              <span className="font-medium">End-to-end encrypted</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full max-w-[95vw] sm:max-w-md bg-white/95 backdrop-blur-md border border-white/70 shadow-2xl rounded-2xl p-6 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="text-white w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Verification Successful!
            </h2>
            <p className="text-slate-600 text-sm">
              Welcome back,{" "}
              <span className="font-bold text-indigo-600">{phoneNumber}</span>
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500 ml-2">Redirecting...</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
        ${
          shaking
            ? ".animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }"
            : ""
        }
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
          <User className="text-slate-300 w-5 h-5" />
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
          className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 md:hover:-translate-y-1 transition-all duration-300 group animate-in fade-in"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-[95vw] sm:max-w-md max-h-[calc(100dvh-1rem)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Gradient Bar */}
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex-shrink-0" />

        <div className="p-4 overflow-auto flex-1">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-800 truncate">
                Pay ₹{amount.toLocaleString("en-IN")}
              </h2>
              <p className="text-slate-500 text-xs mt-0.5 truncate">
                Scan QR or use UPI ID below
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-transparent border-none rounded-lg cursor-pointer flex-shrink-0 hover:bg-slate-100 transition-colors"
            >
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center mb-3">
            <div className="relative mb-2">
              <div className="w-[260px] h-[260px] max-w-[80vw] max-h-[80vw] bg-white rounded-xl p-3 border-2 border-slate-100 shadow-lg">
                {qrImageUrl ? (
                  <img
                    src={qrImageUrl}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
                    <QrCode size={72} className="text-slate-300" />
                  </div>
                )}
              </div>

              <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shadow-md">
                <CheckCircle size={10} className="text-white" />
              </div>
            </div>

            {/* Amount Display */}
            <div className="inline-flex items-center gap-2 p-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200 mb-2">
              <IndianRupee size={14} className="text-emerald-600" />
              <p className="text-md font-bold text-emerald-700 m-0">
                {amount.toLocaleString("en-IN")}
              </p>
            </div>

            {upiId && (
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">UPI ID</p>
                <button
                  onClick={handleCopyUPI}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border-none rounded-lg font-semibold text-sm text-slate-800 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <CreditCard size={14} />
                  {upiId}
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleDownloadQR}
              disabled={downloading || !qrImageUrl}
              className="flex-1 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white border-none rounded-lg font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-sm hover:shadow-md transition-shadow"
            >
              {downloading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Save QR
                </>
              )}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none rounded-lg font-semibold flex items-center justify-center gap-2 cursor-pointer text-sm hover:shadow-md transition-shadow"
            >
              <Share2 size={16} />
              Share
            </button>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Shield size={10} className="text-slate-400" />
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
          const totalPeople = Number(luckyDraw.Number_of_Peoples || 0);

          const perParticipantAmount =
            totalPeople > 0 ? Math.round(totalAmount / totalPeople) : 0;

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
        className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/70 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          className="w-full max-w-[95vw] sm:max-w-md max-h-[calc(100dvh-0.5rem)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0" />

          <div className="p-4 overflow-auto flex-1">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 pr-2">
                <h2 className="text-base font-bold text-slate-800 truncate">
                  Submit Payment Proof
                </h2>
                <p className="text-slate-500 text-xs mt-1 truncate">
                  Upload screenshot and fill details
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={uploading}
                className="p-1.5 bg-transparent border-none rounded-lg cursor-pointer flex-shrink-0 opacity-50 disabled:opacity-30 hover:bg-slate-100 transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Payment Amount Input */}
            <div className="mb-3">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                <IndianRupee size={12} className="text-emerald-500" />
                <span>Payment Amount (₹)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="1"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg outline-none text-sm font-bold text-slate-800 placeholder-slate-400 disabled:opacity-50"
                  placeholder="Enter amount"
                  disabled={uploading}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="text-slate-400 font-medium text-xs">
                    INR
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Cycle Selection */}
            <div className="mb-3 relative">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                <CalendarDays size={12} className="text-blue-500" />
                <span>Payment Cycle</span>
              </label>
              <select
                value={paymentCycle?.value || ""}
                onChange={(e) => {
                  const selected = paymentCycles.find(
                    (c) => c.value === e.target.value
                  );
                  setPaymentCycle(selected);
                }}
                className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg outline-none appearance-none cursor-pointer text-sm text-slate-800 disabled:opacity-50"
                disabled={uploading}
              >
                <option value="">Select a payment cycle</option>
                {paymentCycles.map((cycle) => (
                  <option key={cycle.value} value={cycle.value}>
                    {cycle.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 bottom-3 pointer-events-none">
                <ChevronRight size={14} className="text-slate-400 rotate-90" />
              </div>
            </div>

            {/* Upload Box */}
            <div className="mb-3">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                <Upload size={12} className="text-purple-500" />
                <span>Payment Screenshot</span>
              </label>
              <div
                onClick={() => !file && !uploading && fileRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  border-2 border-dashed rounded-xl p-4 text-center min-h-[100px]
                  flex flex-col items-center justify-center cursor-pointer
                  ${
                    dragOver
                      ? "border-indigo-400 bg-indigo-50"
                      : preview
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-slate-300"
                  }
                  ${
                    uploading
                      ? "cursor-not-allowed opacity-60"
                      : "hover:border-indigo-400 hover:bg-indigo-50"
                  }
                  transition-all duration-200
                `}
              >
                <input
                  ref={fileRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                />

                {preview ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-20 rounded-lg shadow-md mb-2"
                    />
                    {!uploading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setPreview(null);
                        }}
                        className="px-3 py-1.5 bg-slate-900 text-white border-none rounded font-medium flex items-center gap-1 cursor-pointer text-xs hover:bg-slate-800 transition-colors"
                      >
                        <X size={12} /> Change
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        dragOver ? "bg-indigo-100" : "bg-slate-100"
                      }`}
                    >
                      <Upload
                        size={18}
                        className={
                          dragOver ? "text-indigo-500" : "text-slate-400"
                        }
                      />
                    </div>
                    <p className="font-medium text-gray-700 mb-1 text-xs">
                      {dragOver
                        ? "Drop image here"
                        : "Click to upload or drag & drop"}
                    </p>
                    <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                  </>
                )}
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={openConfirmPopup}
              disabled={!file || !paymentAmount || !paymentCycle || uploading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none rounded-xl font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 text-sm hover:shadow-md transition-all"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Continue to Review
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-2 bg-black/70 backdrop-blur-sm"
          onClick={(e) =>
            e.target === e.currentTarget && !uploading && setConfirmOpen(false)
          }
        >
          <div className="w-full max-w-[95vw] sm:max-w-md max-h-[calc(100dvh-0.5rem)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 overflow-auto flex-1">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-800">
                  Confirm Payment Details
                </h2>
                <button
                  onClick={() => !uploading && setConfirmOpen(false)}
                  disabled={uploading}
                  className="p-1.5 bg-transparent border-none rounded-lg cursor-pointer opacity-50 disabled:opacity-30 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} className="text-slate-400" />
                </button>
              </div>

              <div className="flex flex-col gap-2.5 mb-4">
                <div className="p-3 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                    <IndianRupee size={10} /> Payment Amount
                  </p>
                  <p className="text-xl font-bold text-slate-800 m-0">
                    ₹{Number(paymentAmount).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="p-3 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                    <CalendarDays size={10} /> Payment Cycle
                  </p>
                  <p className="text-sm font-semibold text-slate-800 m-0 truncate">
                    {paymentCycle?.label}
                  </p>
                </div>

                {preview && (
                  <div className="p-3 bg-gradient-to-r from-emerald-50 to-white rounded-xl border border-emerald-200 text-center">
                    <p className="text-xs text-emerald-600 font-semibold mb-2 flex items-center justify-center gap-1.5">
                      <CheckCircle size={10} /> Screenshot Preview
                    </p>
                    <img
                      src={preview}
                      alt="Payment proof"
                      className="rounded-lg max-h-[70px] mx-auto shadow-sm"
                    />
                  </div>
                )}

                <div className="p-2.5 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-600 font-semibold mb-1 flex items-center gap-1.5">
                    <AlertCircle size={10} /> Important Note
                  </p>
                  <p className="text-xs text-blue-700 m-0">
                    Your payment will be verified within 24 hours.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => !uploading && setConfirmOpen(false)}
                  disabled={uploading}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 border-none rounded-xl font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-sm hover:bg-slate-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={submitPayment}
                  disabled={uploading}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none rounded-xl font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm hover:shadow-md transition-all"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Confirm
                      <CheckCircle size={14} />
                    </>
                  )}
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

  const resetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-2 bg-black/95 backdrop-blur-lg"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
        <button
          onClick={resetView}
          className="p-2.5 bg-white/10 border-none rounded-full cursor-pointer text-white hover:bg-white/20 transition-colors"
          title="Reset Zoom"
        >
          <RefreshCw size={18} />
        </button>
        <button
          onClick={onClose}
          className="p-2.5 bg-white/10 border-none rounded-full cursor-pointer text-white hover:bg-white/20 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div
        className="relative w-full h-full flex items-center justify-center p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative rounded-xl overflow-hidden bg-black/30 border border-white/10 max-w-full max-h-[calc(100dvh-6rem)]">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-auto max-h-[calc(100dvh-7.5rem)] object-contain"
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transition: isDragging ? "none" : "transform 0.2s ease",
            }}
            onMouseDown={handleMouseDown}
          />
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 max-w-[90%]">
          <h3 className="text-sm font-medium text-white m-0 text-center truncate">
            {name}
          </h3>
          <div className="text-xs text-white/70 mt-0.5 text-center">
            Zoom: {Math.round(zoom * 100)}% • Drag to pan
          </div>
        </div>
      </div>
    </div>
  );
};

const formatPaymentCycle = (cycleNumber, unit) => {
  if (!cycleNumber) return "";
  const label = unit?.toLowerCase().includes("month") ? "Month" : "Week";
  return `${label} ${cycleNumber}`;
};

// --- PAYMENT HISTORY MODAL (RESPONSIVE - NO SCROLL, FIT TO SCREEN) ---
const PaymentHistoryModal = ({
  isOpen,
  onClose,
  participant,
  paymentHistory,
  cycleUnit = "week",
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

  const totalPaid = paymentHistory
    .filter((p) => p.isVerified)
    .reduce((sum, p) => sum + (Number(p.Amount) || 0), 0);
  const pendingAmount = paymentHistory
    .filter((p) => !p.isVerified)
    .reduce((sum, p) => sum + (Number(p.Amount) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-[95vw] sm:max-w-lg max-h-[calc(100dvh-0.5rem)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0 pr-2">
              <h2 className="text-base font-bold text-slate-800 truncate">
                Payment History
              </h2>
              <p className="text-slate-500 text-xs mt-1 truncate">
                {participant.name} • {paymentHistory.length} payment
                {paymentHistory.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-transparent border-none rounded-lg cursor-pointer flex-shrink-0 hover:bg-slate-100 transition-colors"
            >
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-xs text-emerald-600 font-medium mb-0.5">
                Total Paid
              </p>
              <p className="text-base font-bold text-emerald-700 m-0">
                ₹{totalPaid.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-600 font-medium mb-0.5">
                Pending
              </p>
              <p className="text-base font-bold text-amber-700 m-0">
                ₹{pendingAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4">
          {paymentHistory && paymentHistory.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {paymentHistory.map((payment, index) => {
                const paymentProofImage = getPaymentProofImage(payment);
                const paymentDate = new Date(
                  payment.createdAt
                ).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <div
                    key={payment.id || index}
                    className="bg-gradient-to-r from-slate-50 to-white p-3 rounded-xl border border-slate-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              payment.isVerified
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            } flex-shrink-0`}
                          />
                          <p className="font-bold text-slate-800 text-sm truncate">
                            {formatPaymentCycle(
                              payment.Payment_Cycle,
                              cycleUnit
                            )}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 ml-3.5">
                          <Clock size={10} className="inline mr-1" />
                          {paymentDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-800 m-0">
                          ₹{Number(payment.Amount).toLocaleString("en-IN")}
                        </p>
                        <div
                          className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            payment.isVerified
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {payment.isVerified ? (
                            <>
                              <CheckCircle size={10} />
                              Verified
                            </>
                          ) : (
                            <>
                              <Clock size={10} />
                              Pending
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {paymentProofImage && (
                      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                        <p className="text-xs text-gray-700 font-medium flex items-center gap-1 m-0">
                          <FileText size={10} />
                          Payment Proof
                        </p>
                        <button
                          onClick={() => {
                            if (paymentProofImage)
                              handleViewProof(
                                paymentProofImage,
                                payment.Payment_Cycle
                              );
                          }}
                          className="text-xs text-indigo-600 font-medium flex items-center gap-1 bg-transparent border-none cursor-pointer p-0 hover:text-indigo-700 transition-colors"
                        >
                          <Eye size={10} />
                          View
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 px-4">
              <div className="w-15 h-15 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                <Receipt size={24} className="text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">
                No Payment History
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                No payments made yet.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none rounded-xl font-medium cursor-pointer text-sm hover:shadow-md transition-all"
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
      className="group bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5 sm:hover:-translate-y-2 transition-all duration-500 overflow-hidden relative animate-in fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
              <User className="text-slate-300 w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12" />
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
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent transition-all duration-700"></div>
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
        // ✅ AMOUNT PER PARTICIPANT (USING Number_of_Peoples)
        const totalAmount = Number(data?.Amount || 0);
        const totalPeople = Number(data?.Number_of_Peoples || 0);

        const perParticipantAmount =
          totalPeople > 0 ? Math.round(totalAmount / totalPeople) : 0;

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
                    cycleUnit: "week", // or "month" (temporary default)
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
                <span className="hidden sm:inline">Make Your Payment</span>
                <span className="inline sm:hidden">Make Your Payment</span>
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
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-400 transition-colors"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 sm:p-1 hover:bg-slate-200 rounded-full transition-colors"
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
