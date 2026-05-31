import { useState, useEffect } from "react";
import { getProyectos } from "../../api/proyectos";
import { createBeneficiario, updateBeneficiario } from "../../api/beneficiarios";

const EMPTY = {
  fullName: "",
  documentNumber: "",
  phone: "",
  address: "",
  birthDate: "",
  status: "ACTIVO",
  projectId: "",
};

export default function BeneficiarioModal({ beneficiario, projectId, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!beneficiario;

  useEffect(() => {
    if (beneficiario) {
      setForm({
        fullName: beneficiario.fullName || "",
        documentNumber: beneficiario.documentNumber || "",
        phone: beneficiario.phone || "",
        address: beneficiario.address || "",
        birthDate: beneficiario.birthDate || "",
        status: beneficiario.status || "ACTIVO",
        projectId: beneficiario.projectId || projectId || "",
      });
    } else {
      setForm((prev) => ({ ...prev, projectId: projectId || "" }));
    }

    // PR29/PR30 — Solo proyectos activos disponibles
    getProyectos({ status: "ACTIVO" })
      .then((res) => setProyectos(res.data || []))
      .catch(() => {});
  }, [beneficiario, projectId]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isEdit) {
        await updateBeneficiario(beneficiario.id, form);
      } else {
        await createBeneficiario(form);
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
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-sm font-semibold text-gray-800">
            {isEdit ? "Editar beneficiario" : "Nuevo beneficiario"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo *</label>
            <input
              name="fullName"
              required
              value={form.fullName}
              onChange={handleChange}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">N° Documento *</label>
              <input
                name="documentNumber"
                required
                value={form.documentNumber}
                onChange={handleChange}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Dirección</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha nacimiento</label>
              <input
                type="date"
                name="birthDate"
                value={form.birthDate}
                onChange={handleChange}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
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
              </select>
            </div>
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