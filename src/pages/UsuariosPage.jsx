import { useState, useEffect, useCallback } from "react";
import { getUsuarios, toggleUsuarioActivo, cambiarRol } from "../api/usuarios";

const ROLES = ["ROLE_ADMIN", "ROLE_COORDINADOR", "ROLE_ESTUDIANTE"];

const ROLE_STYLES = {
  ROLE_ADMIN: "bg-indigo-100 text-indigo-700",
  ROLE_COORDINADOR: "bg-emerald-100 text-emerald-700",
  ROLE_ESTUDIANTE: "bg-amber-100 text-amber-700",
};

const ROLE_LABELS = {
  ROLE_ADMIN: "Admin",
  ROLE_COORDINADOR: "Coordinador",
  ROLE_ESTUDIANTE: "Estudiante",
};

function CambiarRolModal({ usuario, onClose, onSaved }) {
  const [rol, setRol] = useState(usuario.roles?.[0] || "ROLE_ESTUDIANTE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await cambiarRol(usuario.id, rol);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar rol.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Cambiar rol</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-3">
              Usuario: <span className="font-medium text-gray-700">{usuario.fullName}</span>
            </p>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nuevo rol</label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [rolFiltro, setRolFiltro] = useState("");
  const [modalRol, setModalRol] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(null);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getUsuarios();
      setUsuarios(data);
    } catch {
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleToggle = async (usuario) => {
    setToggleLoading(usuario.id);
    try {
      await toggleUsuarioActivo(usuario.id);
      fetchUsuarios();
    } catch {
      alert("No se pudo cambiar el estado del usuario.");
    } finally {
      setToggleLoading(null);
    }
  };

  const handleRolSaved = () => {
    setModalRol(null);
    fetchUsuarios();
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchNombre = u.fullName?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email?.toLowerCase().includes(busqueda.toLowerCase());
    const matchRol = rolFiltro ? u.roles?.includes(rolFiltro) : true;
    return matchNombre && matchRol;
  });

  const initials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??";

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-64"
          />
          <select
            value={rolFiltro}
            onChange={(e) => setRolFiltro(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Todos los roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        </div>

        {/* Contador */}
        <p className="text-xs text-gray-400">
          {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-sm text-gray-400">No se encontraron usuarios.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Usuario</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 hidden md:table-cell">Email</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Rol</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Estado</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuariosFiltrados.map((u) => {
                const rolActual = u.roles?.[0];
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    {/* Avatar + nombre */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold shrink-0">
                          {initials(u.fullName)}
                        </div>
                        <span className="font-medium text-gray-800 truncate">{u.fullName}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{u.email}</td>

                    {/* Rol */}
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ROLE_STYLES[rolActual] || "bg-gray-100 text-gray-500"}`}>
                        {ROLE_LABELS[rolActual] || rolActual}
                      </span>
                    </td>

                    {/* Estado activo */}
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        u.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-500"
                      }`}>
                        {u.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-3">
                      <div className="flex gap-3 items-center">
                        <button
                          onClick={() => setModalRol(u)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                          Cambiar rol
                        </button>
                        <button
                          onClick={() => handleToggle(u)}
                          disabled={toggleLoading === u.id}
                          className={`text-xs font-medium transition-colors disabled:opacity-50 ${
                            u.active
                              ? "text-red-400 hover:text-red-600"
                              : "text-emerald-500 hover:text-emerald-700"
                          }`}
                        >
                          {toggleLoading === u.id
                            ? "..."
                            : u.active ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal cambiar rol */}
      {modalRol && (
        <CambiarRolModal
          usuario={modalRol}
          onClose={() => setModalRol(null)}
          onSaved={handleRolSaved}
        />
      )}
    </div>
  );
}