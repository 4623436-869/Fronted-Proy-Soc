import { useState, useEffect } from "react";
import { createProyecto, updateProyecto } from "../../api/proyectos";
import { getUsuarios } from "../../api/usuarios";

const EMPTY = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "ACTIVO",
  coordinatorId: "",
};

export default function ProyectoModal({ proyecto, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [coordinadores, setCoordinadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!proyecto;

  useEffect(() => {
    if (proyecto) {
      setForm({
        name: proyecto.name || "",
        description: proyecto.description || "",
        startDate: proyecto.startDate || "",
        endDate: proyecto.endDate || "",
        status: proyecto.status || "ACTIVO",
        coordinatorId: proyecto.coordinatorId || "",
      });
    }
    getUsuarios()
      .then((res) => setCoordinadores(res.data || []))
      .catch(() => {});
  }, [proyecto]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // PR27/PR28 — Validación fecha fin anterior a fecha inicio
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError("La fecha de fin debe ser posterior al inicio.");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await updateProyecto(proyecto.id, form);
      } else {
        await createProyecto(form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Ocurrió un error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">
            {isEdit ? "Editar proyecto" : "Nuevo proyecto"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha inicio *</label>
              <input
                type="date"
                name="startDate"
                required
                value={form.startDate}
                onChange={handleChange}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha fin *</label>
              <input
                type="date"
                name="endDate"
                required
                value={form.endDate}
                onChange={handleChange}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="FINALIZADO">Finalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Coordinador</label>
            <select
              name="coordinatorId"
              value={form.coordinatorId}
              onChange={handleChange}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Sin asignar</option>
              {coordinadores.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
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
              {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}