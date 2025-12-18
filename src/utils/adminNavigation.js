// adminNavigation.js - FIXED VERSION
const getAdminId = () => {
  return localStorage.getItem("adminId");
};

const adminNavigate = (navigate, path) => {
  const adminId = getAdminId();

  if (!adminId) {
    navigate("/regeve-admin");
    return;
  }

  navigate(`/${adminId}${path}`);
};

export { getAdminId, adminNavigate };