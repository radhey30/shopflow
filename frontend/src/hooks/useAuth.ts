import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export const useAuth = () => {
  const store = useAuthStore();
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    await store.login(email, password);
    navigate("/");
  };

  const register = async (name: string, email: string, password: string) => {
    await store.register(name, email, password);
    navigate("/");
  };

  const logout = async () => {
    await store.logout();
    navigate("/login");
  };

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login,
    register,
    logout,
    clearError: store.clearError,
  };
};

export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return { isAuthenticated, isLoading };
};
