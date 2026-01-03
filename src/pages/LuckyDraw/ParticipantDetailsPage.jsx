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

// --- 0. TOAST NOTIFICATION COMPONENT ---
const Toast = ({ message, type, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-5 fade-in duration-300">
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md border ${
          type === "success"
            ? "bg-emerald-900/90 border-emerald-500/30 text-white"
            : "bg-red-900/90 border-red-500/30 text-white"
        }`}
      >
        {type === "success" ? (
          <CheckCircle2 size={20} className="text-emerald-400" />
        ) : (
          <AlertCircle size={20} className="text-red-400" />
        )}
        <div>
          <p className="text-sm font-bold">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

// --- 0.5 MOBILE VERIFICATION GATE COMPONENT (UPDATED) ---
const MobileVerificationGate = ({ onVerify, documentId }) => {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shaking, setShaking] = useState(false);

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
        localStorage.setItem("participant_id", userExists.id);
        localStorage.setItem("participant_phone", userExists.Phone_Number);
        localStorage.setItem("participant_name", userExists.Name);
        onVerify();
        navigate(`/${adminId}/participant-page/${documentId}`, {
          replace: true,
        });
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
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white to-transparent"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div
        className={`relative w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/70 shadow-2xl rounded-3xl p-8 sm:p-10 text-center ${
          shaking ? "animate-shake" : "animate-in zoom-in-95 duration-500"
        }`}
      >
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-8 transform rotate-3">
          <Smartphone className="text-white w-12 h-12" />
        </div>

        <h2 className="text-3xl font-bold text-slate-800 mb-3">
          Participant Access
        </h2>
        <p className="text-slate-600 mb-8 text-sm font-medium">
          Verify your registered mobile number to view the participant list
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Phone className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setPhoneNumber(val);
                setError("");
              }}
              maxLength={10}
              className={`w-full pl-12 pr-4 py-4 bg-white border-2 rounded-xl outline-none font-bold text-lg tracking-wider text-center transition-all ${
                error
                  ? "border-red-300 text-red-600 focus:border-red-500 bg-red-50"
                  : "border-slate-300 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              }`}
              placeholder="9876543210"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium flex items-center justify-center gap-2 animate-in fade-in">
              <AlertCircle size={16} /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify Number
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Lock size={12} />
            <span className="font-medium">Secure & Encrypted Verification</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
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
          <User className="text-slate-300" size={24} />
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

// --- STATS CARDS COMPONENT ---
const StatsCards = ({ participants, luckyDrawAmount }) => {
  const totalParticipants = participants.length;
  const winners = participants.filter(p => p.isWinner).length;
  const paidParticipants = participants.filter(p => p.paymentStatus === "paid").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Participants</p>
            <p className="text-3xl font-bold text-slate-800">{totalParticipants}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Users className="text-indigo-600 w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Winners</p>
            <p className="text-3xl font-bold text-slate-800">{winners}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <Crown className="text-amber-600 w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Paid</p>
            <p className="text-3xl font-bold text-slate-800">{paidParticipants}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <BadgeCheck className="text-emerald-600 w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Amount Each</p>
            <p className="text-3xl font-bold text-slate-800">₹{luckyDrawAmount.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
            <Award className="text-violet-600 w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 1. QR CODE MODAL ---
const QRCodeModal = ({ isOpen, onClose, participant, qrImage, amount, showToast }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const paymentLink = `https://regeve.in/payment/${participant?.id || "general"}`;
  const qrImageUrl = qrImage || null;

  const handleDownloadQR = async () => {
    if (!qrImageUrl) {
      showToast("No QR Code available to download", "error");
      return;
    }

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
            link.download = `qr-${participant?.name || "code"}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast("QR Code downloaded as JPG!", "success");
          },
          "image/jpeg",
          0.95
        );
      };
    } catch (e) {
      showToast("Download failed. Please try again.", "error");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Payment QR", url: paymentLink });
    } else {
      navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      showToast("Payment link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Scan to Pay</h2>
              <p className="text-slate-500 text-sm">Complete your payment securely</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-200 mb-6 flex flex-col items-center">
            <div className="w-32 h-32 bg-white rounded-xl p-3 shadow-inner mb-4">
              {qrImageUrl ? (
                <img
                  src={qrImageUrl}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-lg">
                  <QrCode size={40} className="text-slate-300" />
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500 font-medium">Amount to pay</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">₹{amount.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownloadQR}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download size={18} />
              Save
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer"
            >
              {copied ? <CheckCircle size={18} /> : <Share2 size={18} />}
              {copied ? "Copied" : "Share"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 2. UPLOAD MODAL ---
const UploadScreenshotModal = ({
  isOpen,
  onClose,
  participant,
  onUploadComplete,
  showToast,
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  if (!isOpen) return null;

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    }
  };

  const submit = () => {
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      onUploadComplete?.(participant?.id);
      setUploading(false);
      showToast("Proof uploaded successfully!", "success");
      onClose();
      setFile(null);
      setPreview(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Upload Payment Proof</h2>
              <p className="text-slate-500 text-sm">Upload screenshot of your payment</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div
            onClick={() => !file && fileRef.current.click()}
            className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer min-h-[200px] flex flex-col items-center justify-center mb-6 ${
              preview
                ? "border-indigo-400 bg-indigo-50"
                : "border-slate-300 hover:border-indigo-300 hover:bg-slate-50"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              hidden
              onChange={handleFile}
              accept="image/*"
            />
            {preview ? (
              <div className="relative w-full">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg object-contain"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                  <Upload size={24} />
                </div>
                <p className="font-medium text-slate-600 mb-1">Click to select file</p>
                <p className="text-sm text-slate-400">or drag and drop here</p>
              </>
            )}
          </div>

          <button
            onClick={submit}
            disabled={!file || uploading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {uploading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Uploading...
              </>
            ) : (
              "Confirm Upload"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 3. IMAGE PREVIEW MODAL ---
const ImagePreviewModal = ({ isOpen, onClose, imageUrl, name }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors z-50 cursor-pointer"
      >
        <X size={24} />
      </button>

      <div
        className="relative max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative rounded-2xl overflow-hidden bg-black">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-auto max-h-[70vh] object-contain"
          />
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-white text-xl font-bold">{name}</h3>
        </div>
      </div>
    </div>
  );
};

// --- 4. PROFILE MODAL ---
const ProfileModal = ({ isOpen, onClose, participant, onImageClick }) => {
  if (!isOpen || !participant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="relative h-40 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="absolute inset-0 bg-black/10"></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative px-6 pb-8 -mt-16">
          <div className="flex justify-center mb-6">
            <div
              className="relative group cursor-pointer"
              onClick={() => onImageClick(participant.photoUrl, participant.name)}
            >
              <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-2xl border-4 border-white">
                <div className="w-full h-full rounded-xl overflow-hidden bg-slate-100">
                  {participant.photoUrl ? (
                    <SmoothImage
                      src={participant.photoUrl}
                      alt={participant.name}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={48} className="text-slate-300" />
                    </div>
                  )}
                </div>
              </div>
              {participant.isWinner && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg">
                    <Crown size={12} />
                    WINNER
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{participant.name}</h2>
            <p className="text-slate-500 text-sm">{participant.email}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <div className="text-xl font-bold text-slate-800 mb-1">{participant.wins || 0}</div>
              <div className="text-xs text-slate-500 font-medium">Wins</div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
              <div className="text-xl font-bold text-emerald-600 mb-1">₹{participant.totalWon || 0}</div>
              <div className="text-xs text-emerald-500 font-medium">Amount Won</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
              <div className="text-xl font-bold text-blue-600 mb-1">{participant.participations || 1}</div>
              <div className="text-xs text-blue-500 font-medium">Entries</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Phone size={18} className="text-slate-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Phone Number</p>
                <p className="font-medium text-slate-800">{participant.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <CalendarDays size={18} className="text-slate-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Joined Date</p>
                <p className="font-medium text-slate-800">{participant.joinedDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function ParticipantDetailsPage() {
  const { adminId, luckydrawDocumentId } = useParams();
  const documentId = luckydrawDocumentId;
  const navigate = useNavigate();

  const [isVerified, setIsVerified] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [luckyDrawQR, setLuckyDrawQR] = useState(null);
  const [luckyDrawAmount, setLuckyDrawAmount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

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

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const fetchParticipants = useCallback(async (isBackgroundRefresh = false) => {
    if (!documentId) return;

    if (!isBackgroundRefresh) {
      setIsRefreshing(true);
    }

    try {
      const res = await api.get(`/public/lucky-draw-names/${documentId}`);
      const list = res.data?.lucky_draw_forms || [];

      setParticipants(
        list.map((item) => {
          const photo =
            item.Photo?.formats?.small?.url ||
            item.Photo?.formats?.thumbnail?.url ||
            item.Photo?.url ||
            null;

          return {
            id: item.id,
            name: item.Name,
            email: item.Email,
            phone: item.Phone_Number,
            isWinner: item.IsWinnedParticipant ?? false,
            paymentStatus: item.Payment_Status || "pending",
            winAmount: item.Prize_Amount || 0,
            joinedDate: new Date(item.createdAt).toLocaleDateString(),
            photoUrl: photo ? `${API_BASE_URL}${photo}` : null,
          };
        })
      );

      const qr =
        res.data?.QRcode?.formats?.medium?.url ||
        res.data?.QRcode?.formats?.small?.url ||
        res.data?.QRcode?.formats?.thumbnail?.url ||
        res.data?.QRcode?.url ||
        null;

      setLuckyDrawQR(qr ? `${API_BASE_URL}${qr}` : null);

      const totalAmount = Number(res.data?.Amount || 0);
      const totalParticipants = res.data?.lucky_draw_forms?.length || 0;
      const perParticipantAmount =
        totalParticipants > 0 ? Math.floor(totalAmount / totalParticipants) : 0;
      setLuckyDrawAmount(perParticipantAmount);
    } catch (error) {
      console.error("Error fetching participants:", error);
      showToast("Failed to load participants", "error");
    } finally {
      setIsRefreshing(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (isVerified) {
      fetchParticipants(false);
      const intervalId = setInterval(() => fetchParticipants(true), 30000);
      return () => clearInterval(intervalId);
    }
  }, [fetchParticipants, isVerified]);

  const openModal = (type, user) => {
    setSelectedUser(user);
    setActiveModal(type);
  };

  const handleImageClick = (url, name) => {
    if (url) setPreviewImage({ isOpen: true, url, name });
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
      (filter === "all" || (filter === "winners" && p.isWinner)) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">Participants</h1>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    {participants.length} Total
                  </span>
                </div>
                <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                  <Users size={14} />
                  Manage and view all participants
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => openModal("qr", null)}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 rounded-xl font-medium hover:shadow-md transition-all flex items-center gap-2 cursor-pointer border border-indigo-200"
              >
                <QrCode size={18} />
                QR Code
              </button>
              <button
                onClick={() => openModal("upload", null)}
                className="px-4 py-2.5 bg-gradient-to-r from-slate-900 to-black text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Upload size={18} />
                Upload Proof
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Section */}
        <StatsCards participants={participants} luckyDrawAmount={luckyDrawAmount} />

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 lg:flex-none lg:w-80">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search participants by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {["all", "winners"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      filter === f
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {f === "all" ? "All Participants" : "Winners Only"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => fetchParticipants(false)}
                disabled={isRefreshing}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Participants Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filtered.map((participant, index) => (
            <div
              key={participant.id}
              className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Winner Badge */}
              {participant.isWinner && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                    <Crown size={12} />
                    WINNER
                  </div>
                </div>
              )}

              {/* Profile Image */}
              <div className="relative mb-5">
                <div
                  className="w-24 h-24 rounded-2xl mx-auto overflow-hidden bg-slate-100 cursor-pointer border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow"
                  onClick={() => handleImageClick(participant.photoUrl, participant.name)}
                >
                  {participant.photoUrl ? (
                    <SmoothImage
                      src={participant.photoUrl}
                      alt={participant.name}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={40} className="text-slate-300" />
                    </div>
                  )}
                </div>
              </div>

              {/* Participant Info */}
              <div className="text-center mb-5">
                <h3 className="font-bold text-lg text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                  {participant.name}
                </h3>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-3">
                  <div className={`w-2 h-2 rounded-full ${participant.paymentStatus === "paid" ? "bg-emerald-500" : "bg-amber-500"}`}></div>
                  <span className={participant.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"}>
                    {participant.paymentStatus.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-slate-500 truncate">{participant.email || "No email"}</p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => openModal("profile", participant)}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer group/btn border border-slate-200"
              >
                View Profile
                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Users size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No participants found</h3>
            <p className="text-slate-500">
              {search ? "Try a different search term" : "No participants available for the selected filter"}
            </p>
          </div>
        )}
      </main>

      {/* Modals */}
      <QRCodeModal
        isOpen={activeModal === "qr"}
        onClose={() => setActiveModal(null)}
        participant={selectedUser}
        qrImage={luckyDrawQR}
        amount={luckyDrawAmount}
        showToast={showToast}
      />
      <UploadScreenshotModal
        isOpen={activeModal === "upload"}
        onClose={() => setActiveModal(null)}
        participant={selectedUser}
        onUploadComplete={() => {}}
        showToast={showToast}
      />
      <ProfileModal
        isOpen={activeModal === "profile"}
        onClose={() => setActiveModal(null)}
        participant={selectedUser}
        onImageClick={handleImageClick}
      />
      <ImagePreviewModal
        isOpen={previewImage.isOpen}
        onClose={() => setPreviewImage({ ...previewImage, isOpen: false })}
        imageUrl={previewImage.url}
        name={previewImage.name}
      />
    </div>
  );
}