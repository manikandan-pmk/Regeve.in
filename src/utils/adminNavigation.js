export const getAdminId = () => {
  return localStorage.getItem("adminId");
};

export const adminNavigate = (navigate, path) => {
  const adminId = getAdminId();

  if (!adminId) {
    navigate("/regeve-admin");
    return;
  }

  navigate(`/${adminId}${path}`);
};
