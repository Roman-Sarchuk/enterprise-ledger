import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export function PublicLayout() {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  if (token && isAuthPage) {
    return <Navigate to="/accounts" replace />;
  }

  return (
    <div className="app-shell">
      <Outlet />
    </div>
  );
}

