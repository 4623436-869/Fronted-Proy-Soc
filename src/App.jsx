import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProyectosPage from "./pages/ProyectosPage";
import BeneficiariosPage from "./pages/BeneficiariosPage";
import AsistenciaPage from "./pages/AsistenciaPage";
import QRPage from "./pages/QRPage";
import UsuariosPage from "./pages/UsuariosPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/proyectos" element={<ProyectosPage />} />
            <Route
              path="/beneficiarios"
              element={
                <PrivateRoute roles={["ROLE_ADMIN", "ROLE_COORDINADOR"]}>
                  <BeneficiariosPage />
                </PrivateRoute>
              }
            />
            <Route path="/asistencia" element={<AsistenciaPage />} />
            <Route path="/qr" element={<QRPage />} />
            <Route
              path="/usuarios"
              element={
                <PrivateRoute roles={["ROLE_ADMIN"]}>
                  <UsuariosPage />
                </PrivateRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}