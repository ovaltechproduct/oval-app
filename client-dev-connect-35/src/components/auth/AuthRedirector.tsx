
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const AuthRedirector = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) {
      console.log("[AuthRedirector] Still loading auth state");
      return;
    }

    const currentPath = location.pathname;
    console.log("[AuthRedirector] Checking navigation", { user, currentPath, isLoading });

    if (!user) {
      if (currentPath !== "/login") {
        console.log("[AuthRedirector] No user, redirecting to login");
        navigate("/login", { replace: true });
      }
    } else {
      if (currentPath === "/login" || currentPath === "/") {
        console.log("[AuthRedirector] User authenticated, redirecting to dashboard", {
          role: user.role
        });
        navigate(`/dashboard/${user.role}`, { replace: true });
      }
    }
  }, [user, isLoading, navigate, location.pathname]);

  return null;
};
