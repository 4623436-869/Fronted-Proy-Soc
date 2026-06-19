import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    roles: ["ROLE_ADMIN", "ROLE_COORDINADOR", "ROLE_ESTUDIANTE"],
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Proyectos",
    path: "/proyectos",
    roles: ["ROLE_ADMIN", "ROLE_COORDINADOR", "ROLE_ESTUDIANTE"],
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    label: "Beneficiarios",
    path: "/beneficiarios",
    roles: ["ROLE_ADMIN", "ROLE_COORDINADOR"],
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },

{
    label: "Consulta de Horas",
    path: "/consulta-horas",
    roles: ["ROLE_ADMIN", "ROLE_COORDINADOR"],
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
      </svg>
    ),
  },

  {
    label: "Asistencia",
    path: "/asistencia",
    roles: ["ROLE_ADMIN", "ROLE_COORDINADOR", "ROLE_ESTUDIANTE"],
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Escanear QR",
    path: "/qr",
    roles: ["ROLE_ADMIN", "ROLE_COORDINADOR", "ROLE_ESTUDIANTE"],
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    label: "Usuarios",
    path: "/usuarios",
    roles: ["ROLE_ADMIN"],
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

const ROLE_LABELS = {
  ROLE_ADMIN: { label: "Admin", color: "bg-indigo-100 text-indigo-700" },
  ROLE_COORDINADOR: { label: "Coordinador", color: "bg-emerald-100 text-emerald-700" },
  ROLE_ESTUDIANTE: { label: "Estudiante", color: "bg-amber-100 text-amber-700" },
};

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const filteredItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user?.role)
  );

  const roleInfo = ROLE_LABELS[user?.role] || { label: user?.role, color: "bg-gray-100 text-gray-600" };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <aside
      className={`
        h-screen flex flex-col bg-[#0f0f1a] border-r border-white/5
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? "w-[64px]" : "w-[220px]"}
      `}
    >
      {/* Logo + toggle */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/5">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              P
            </div>
            <span className="text-white text-sm font-semibold tracking-wide">
              ProyectoApp
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold mx-auto">
            P
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="text-white/30 hover:text-white/70 transition-colors ml-2"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
        {collapsed && (
          <button
            onClick={onToggle}
            className="text-white/30 hover:text-white/70 transition-colors absolute left-[72px] top-[22px]"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group
              ${isActive
                ? "bg-indigo-600 text-white"
                : "text-white/50 hover:text-white hover:bg-white/5"
              }
              ${collapsed ? "justify-center" : ""}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="font-medium truncate">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-white/5 p-3">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-300 text-xs font-semibold shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.fullName}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="text-white/30 hover:text-red-400 transition-colors shrink-0"
              title="Cerrar sesión"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex justify-center text-white/30 hover:text-red-400 transition-colors"
            title="Cerrar sesión"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
}