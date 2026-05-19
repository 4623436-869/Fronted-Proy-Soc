import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PAGE_TITLES = {
  "/dashboard": { title: "Dashboard", desc: "Resumen general del sistema" },
  "/proyectos": { title: "Proyectos", desc: "Gestiona los proyectos activos" },
  "/beneficiarios": { title: "Beneficiarios", desc: "Personas registradas en proyectos" },
  "/asistencia": { title: "Asistencia", desc: "Registro y control de asistencia" },
  "/qr": { title: "Escanear QR", desc: "Registra entrada y salida por QR" },
  "/usuarios": { title: "Usuarios", desc: "Administración de cuentas" },
};

export default function Navbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Busca coincidencia exacta o por prefijo (para rutas con id)
  const pageInfo =
    PAGE_TITLES[pathname] ||
    Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ||
    { title: "ProyectoApp", desc: "" };

  const now = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
      {/* Breadcrumb / título */}
      <div>
        <h1 className="text-base font-semibold text-gray-800 leading-none">
          {pageInfo.title}
        </h1>
        {pageInfo.desc && (
          <p className="text-xs text-gray-400 mt-0.5">{pageInfo.desc}</p>
        )}
      </div>

      {/* Lado derecho */}
      <div className="flex items-center gap-4">
        {/* Fecha */}
        <span className="hidden md:block text-xs text-gray-400 capitalize">{now}</span>

        {/* Notificación placeholder */}
        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold">
            {user?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <span className="hidden md:block text-sm text-gray-700 font-medium">
            {user?.fullName?.split(" ")[0]}
          </span>
        </div>
      </div>
    </header>
  );
}