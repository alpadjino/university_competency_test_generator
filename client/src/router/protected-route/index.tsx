import { Navigate, Outlet } from "react-router-dom";
import { type Role } from "@/types/auth";

interface ProtectedRouteProps {
  user: { role: Role } | null;
  allowedRoles: Role[];
}

export const ProtectedRoute = ({ user, allowedRoles }: ProtectedRouteProps) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
