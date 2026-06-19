import { useState, useEffect, useCallback } from "react";
import { buscarDocumentos, eliminarDocumento } from "../api/documentos";
import { useAuth } from "../context/AuthContext";
import DocumentoUploadModal from "../components/documentos/DocumentoUploadModal";
import DocumentoFiltros from "../components/documentos/DocumentoFiltros";
import DocumentoPreviewModal from "../components/documentos/DocumentoPreviewModal";

const TIPO_LABELS = { PLAN: "Plan", INFORME: "Informe" };

export default function RepositorioDocumentosPage() {
  const { isAdmin, isCoordinador } = useAuth();
  const canUpload = isAdmin() || isCoordinador();

  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ nombre: "", cicloAcademico: "", facultad: "", tipo: "" });
  const [uploadOpen, setUploadOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchDocumentos = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtros.nombre) params.nombre = filtros.nombre;
      if (filtros.cicloAcademico) params.cicloAcademico = filtros.cicloAcademico;
      if (filtros.facultad) params.facultad = filtros.facultad;
      if (filtros.tipo) params.tipo = filtros.tipo;
      const { data } = await buscarDocumentos(params);
      setDocumentos(data);
    } catch {
      setDocumentos([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchDocumentos();
  }, [fetchDocumentos]);

  const handleSaved = () => {
    setUploadOpen(false);
    fetchDocumentos();
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await eliminarDocumento(confirmDelete.id);
      setConfirmDelete(null);
      fetchDocumentos();
    } catch {
      alert("No se pudo eliminar el documento.");
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "—";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <DocumentoFiltros filtros={filtros} onChange={setFiltros} />
        {canUpload && (
          <button
            onClick={() => setUploadOpen(true)}
            className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shrink-0"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Subir documento
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : documentos.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">No se encontraron documentos.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="px-5 py-2.5 font-medium">Nombre</th>
                <th className="px-5 py-2.5 font-medium">Tipo</th>
                <th className="px-5 py-2.5 font-medium">Ciclo</th>
                <th className="px-5 py-2.5 font-medium">Facultad / Escuela</th>
                <th className="px-5 py-2.5 font-medium">Tamaño</th>
                <th className="px-5 py-2.5 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documentos.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-gray-700 font-medium truncate max-w-[200px]">
                    {doc.originalFileName}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                      {TIPO_LABELS[doc.tipo] || doc.tipo}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{doc.cicloAcademico}</td>
                  <td className="px-5 py-3 text-gray-500">
                    <p className="truncate max-w-[180px]">{doc.facultad}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[180px]">{doc.escuela}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{formatSize(doc.fileSize)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setPreview(doc)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Ver
                      </button>
                      {isAdmin() && (
                        <button
                          onClick={() => setConfirmDelete(doc)}
                          className="text-xs text-red-500 hover:text-red-600 font-medium"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal subir */}
      {uploadOpen && (
        <DocumentoUploadModal onClose={() => setUploadOpen(false)} onSaved={handleSaved} />
      )}

      {/* Modal preview */}
      {preview && (
        <DocumentoPreviewModal documento={preview} onClose={() => setPreview(null)} />
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">¿Eliminar documento?</h3>
            <p className="text-xs text-gray-500">
              Estás a punto de eliminar <span className="font-medium text-gray-700">"{confirmDelete.originalFileName}"</span>. Esta acción no se puede deshacer.
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