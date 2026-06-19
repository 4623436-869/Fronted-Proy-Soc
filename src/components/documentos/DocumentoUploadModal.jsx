import { useState } from "react";
import { subirDocumento } from "../../api/documentos";

const EMPTY = {
  cicloAcademico: "",
  facultad: "",
  escuela: "",
  tipo: "PLAN",
  campus: "LIMA",
  description: "",
};

export default function DocumentoUploadModal({ onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      setError("Solo se permiten archivos en formato PDF.");
      setFile(null);
      return;
    }
    if (selected.size > 20 * 1024 * 1024) {
      setError("El archivo supera el tamaño máximo permitido (20 MB).");
      setFile(null);
      return;
    }
    setError("");
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Debes seleccionar un archivo PDF.");
      return;
    }
    if (!form.cicloAcademico || !form.facultad || !form.escuela) {
      setError("Ciclo, facultad y escuela son obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("cicloAcademico", form.cicloAcademico);
      formData.append("facultad", form.facultad);
      formData.append("escuela", form.escuela);
      formData.append("tipo", form.tipo);
      formData.append("campus", form.campus);
      formData.append("description", form.description);

      await subirDocumento(formData);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Ocurrió un error al subir el documento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-sm font-semibold text-gray-800">Subir documento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Archivo */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Archivo PDF *
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600 file:text-xs file:font-medium hover:file:bg-indigo-100"
            />
            {file && (
              <p className="text-xs text-gray-400 mt-1">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tipo de documento
            </label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="PLAN">Plan</option>
              <option value="INFORME">Informe</option>
            </select>
          </div>

          {/* Ciclo + Campus */}
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
                Campus
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

          {/* Facultad */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Facultad *
            </label>
            <input
              name="facultad"
              required
              placeholder="Facultad de Ingeniería"
              value={form.facultad}
              onChange={handleChange}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Escuela */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Escuela *
            </label>
            <input
              name="escuela"
              required
              placeholder="Escuela de Ingeniería de Sistemas"
              value={form.escuela}
              onChange={handleChange}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
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
              {loading ? "Subiendo..." : "Subir"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}