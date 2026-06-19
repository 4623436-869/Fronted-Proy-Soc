import { useState, useEffect } from "react";
import { createProyecto, updateProyecto } from "../../api/proyectos";
import { getUsuarios } from "../../api/usuarios";

const EMPTY = {
  name: "",
  description: "",
  startDate: "",
  startTime: "08:00",
  endDate: "",
  endTime: "17:00",
  status: "ACTIVO",
  cicloAcademico: "",
  campus: "LIMA",
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
      // Separar fecha y hora del LocalDateTime que viene del backend
      const splitDateTime = (dt) => {
        if (!dt) return { date: "", time: "08:00" };
        const [date, time] = dt.split("T");
        return { date, time: time ? time.slice(0, 5) : "08:00" };
      };

      const start = splitDateTime(proyecto.startDate);
      const end = splitDateTime(proyecto.endDate);

      setForm({
        name: proyecto.name || "",
        description: proyecto.description || "",
        startDate: start.date,
        startTime: start.time,
        endDate: end.date,
        endTime: end.time,
        status: proyecto.status || "ACTIVO",
        cicloAcademico: proyecto.cicloAcademico || "",
        campus: proyecto.campus || "LIMA",
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

    // Validación formato ciclo académico (AAAA-N)
    if (!/^\d{4}-[1-2]$/.test(form.cicloAcademico)) {
      setError("El ciclo académico debe tener formato AAAA-N, ej: 2025-1");
      return;
    }

    setLoading(true);
    try {
      // Combinar fecha y hora en formato LocalDateTime para el backend
      const payload = {
        name: form.name,
        description: form.description,
        startDate: `${form.startDate}T${form.startTime}:00`,
        endDate: form.endDate ? `${form.endDate}T${form.endTime}:00` : null,
        status: form.status,
        cicloAcademico: form.cicloAcademico,
        campus: form.campus,
        coordinatorId: form.coordinatorId || null,
      };

      if (isEdit) {
        await updateProyecto(proyecto.id, payload);
      } else {
        await createProyecto(payload);
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
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
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
          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nombre *
            </label>
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          {/* Fecha inicio + Hora inicio */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Fecha de inicio *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                name="startDate"
                required
                value={form.startDate}
                onChange={handleChange}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Fecha fin + Hora fin */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Fecha de fin *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                name="endDate"
                required
                value={form.endDate}
                onChange={handleChange}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Ciclo académico + Campus */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Ciclo académico *
              </label>
              <input
                name="cicloAcademico"
                required
                placeholder="2025-1"
                value={form.cicloAcademico}
                onChange={handleChange}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Campus *
              </label>
              <select
                name="campus"
                value={form.campus}
                onChange={handleChange}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="LIMA">Lima</option>
                <option value="JULIACA">Juliaca</option>
                <option value="TARAPOTO">Tarapoto</option>
              </select>
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Estado
            </label>
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

          {/* Coordinador */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Coordinador
            </label>
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