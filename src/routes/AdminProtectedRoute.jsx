import { Navigate, useParams } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("jwt");
  const storedAdminId = localStorage.getItem("adminId");
  const { adminid } = useParams();

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // ❌ Wrong admin trying to access
  if (String(adminid) !== String(storedAdminId)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Allowed
  return children;
};

export default AdminProtectedRoute;
