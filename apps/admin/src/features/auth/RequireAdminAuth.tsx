import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAdminAccessToken } from "@/services/http";

export function RequireAdminAuth() {
  const location = useLocation();
  const token = getAdminAccessToken();

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
