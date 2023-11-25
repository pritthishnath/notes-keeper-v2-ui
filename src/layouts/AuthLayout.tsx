import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useAuthCheck } from "../hooks/useAuthCheck";

export function AuthLayout() {
  useAuthCheck();
  const { isAuth } = useAuth();

  return isAuth ? <Navigate to={"/"} /> : <Outlet />;
}
