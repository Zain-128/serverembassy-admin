import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/store/useAuth";

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p className="grid min-h-screen place-items-center text-muted">Loading…</p>;
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
