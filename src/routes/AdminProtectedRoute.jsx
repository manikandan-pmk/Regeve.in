// AdminProtectedRoute.jsx - UPDATED
import { Navigate, useParams } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("jwt");
  const storedAdminId = localStorage.getItem("adminId");
  const { adminId } = useParams(); // Changed from adminid to adminId

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // ❌ Wrong admin trying to access
  if (String(adminId) !== String(storedAdminId)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Allowed
  return children;
};

export default AdminProtectedRoute;