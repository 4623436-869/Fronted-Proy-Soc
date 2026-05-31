import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      // PR74 — Llama al backend para invalidar la sesión en BD
      await api.post("/auth/logout");
    } catch {
      // Si falla igual limpiamos el frontend
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const isAdmin = () => user?.role === "ROLE_ADMIN";
  const isCoordinador = () => user?.role === "ROLE_COORDINADOR";
  const isEstudiante = () => user?.role === "ROLE_ESTUDIANTE";

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isCoordinador, isEstudiante }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);