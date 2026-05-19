import { useState, useEffect, useCallback } from "react";
import { getProyectos } from "../api/proyectos";
import { getUsuarios } from "../api/usuarios";
import {
  getAsistenciaPorProyecto,
  registrarManual,
  actualizarAsistencia,
  eliminarAsistencia,
  getResumenProyecto,
} from "../api/asistencia";
import { useAuth } from "../context/AuthContext";

const EMPTY_FORM = {
  userId: "",
  projectId: "",
  checkIn: "",
  checkOut: "",
};

function AsistenciaModal({ registro, proyectos, usuarios, onClose, onSaved }) {
  const isEdit = !!registro;
  const [form, setForm] = useState(
    isEdit
      ? {
          userId: registro.userId,
          projectId: registro.projectId,
          checkIn: registro.checkIn?.slice(0, 16) || "",
          checkOut: registro.checkOut?.slice(0, 16) || "",
        }
      : EMPTY_FORM
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        checkIn: form.checkIn ? form.checkIn + ":00" : undefined,
        checkOut: form.checkOut ? form.checkOut + ":00" : undefined,
      };
      if (isEdit) {
        await actualizarAsistencia(registro.id, payload);
      } else {
        await registrarManual(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">
            {isEdit ? "Editar asistencia" : "Registro manual"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Usuario *</label>
            <select
              name="userId"
              required
              value={form.userId}
              onChange={handleChange}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Selecciona un usuario</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Proyecto *</label>
            <select
              name="projectId"
              required
              value={form.projectId}
              onChange={handleChange}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Selecciona un proyecto</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Check-in *</label>
              <input
                type="datetime-local"
                name="checkIn"
                required
                value={form.checkIn}
                onChange={handleChange}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Check-out</label>
              <input
                type="datetime-local"
                name="checkOut"
                value={form.checkOut}
                onChange={handleChange}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
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
              {loading ? "Guardando..." : isEdit ? "Actualizar" : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AsistenciaPage() {
  const { isAdmin, isCoordinador, user } = useAuth();
  const canEdit = isAdmin() || isCoordinador();

  const [proyectos, setProyectos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState("");
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [registroEdit, setRegistroEdit] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    getProyectos()
      .then((res) => {
        setProyectos(res.data || []);
        if (res.data?.length > 0) setProyectoSeleccionado(res.data[0].id);
      })
      .catch(() => {});

    if (canEdit) {
      getUsuarios()
        .then((res) => setUsuarios(res.data || []))
        .catch(() => {});
    }
  }, []);

  const fetchRegistros = useCallback(async () => {
    if (!proyectoSeleccionado) return;
    setLoading(true);
    try {
      const { data } = await getAsistenciaPorProyecto(proyectoSeleccionado);
      setRegistros(data);
    } catch {
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  }, [proyectoSeleccionado]);

  const fetchResumen = useCallback(async () => {
    if (!proyectoSeleccionado) return;
    try {
      const { data } = await getResumenProyecto(proyectoSeleccionado);
      setResumen(data);
    } catch {
      setResumen(null);
    }
  }, [proyectoSeleccionado]);

  useEffect(() => {
    fetchRegistros();
    fetchResumen();
  }, [fetchRegistros, fetchResumen]);

  const handleSaved = () => {
    setModalOpen(false);
    setRegistroEdit(null);
    fetchRegistros();
    fetchResumen();
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await eliminarAsistencia(confirmDelete.id);
      setConfirmDelete(null);
      fetchRegistros();
    } catch {
      alert("No se pudo eliminar el registro.");
    }
  };

  const formatFecha = (str) => {
    if (!str) return "—";
    return new Date(str).toLocaleString("es-PE", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="space-y-5">
      {/* Selector de proyecto */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap items-center gap-3">
        <label className="text-xs font-medium text-gray-600">Proyecto:</label>
        <select
          value={proyectoSeleccionado}
          onChange={(e) => setProyectoSeleccionado(e.target.value)}
          className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Resumen de horas */}
      {resumen && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total registros", value: resumen.totalRecords ?? "—" },
            { label: "Total horas", value: resumen.totalHours != null ? `${resumen.totalHours}h` : "—" },
            { label: "Participantes", value: resumen.totalUsers ?? "—" },
            { label: "Promedio horas", value: resumen.averageHours != null ? `${resumen.averageHours}h` : "—" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-xl font-semibold text-indigo-600 mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Acciones */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={() => { setRegistroEdit(null); setModalOpen(true); }}
            className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Registro manual
          </button>
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : registros.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-sm text-gray-400">No hay registros de asistencia.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Usuario</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 hidden md:table-cell">Check-in</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 hidden md:table-cell">Check-out</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Horas</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 hidden lg:table-cell">Método</th>
                {canEdit && (
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {registros.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{r.userFullName}</td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{formatFecha(r.checkIn)}</td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{formatFecha(r.checkOut)}</td>
                  <td className="px-5 py-3">
                    <span className="text-emerald-600 font-medium">
                      {r.hoursLogged != null ? `${r.hoursLogged}h` : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      r.registrationMethod === "QR"
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {r.registrationMethod}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="px-5 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setRegistroEdit(r); setModalOpen(true); }}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                          Editar
                        </button>
                        {isAdmin() && (
                          <button
                            onClick={() => setConfirmDelete(r)}
                            className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <AsistenciaModal
          registro={registroEdit}
          proyectos={proyectos}
          usuarios={usuarios}
          onClose={() => { setModalOpen(false); setRegistroEdit(null); }}
          onSaved={handleSaved}
        />
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">¿Eliminar registro?</h3>
            <p className="text-xs text-gray-500">
              Se eliminará el registro de <span className="font-medium text-gray-700">{confirmDelete.userFullName}</span>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 h-9 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 h-9 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}