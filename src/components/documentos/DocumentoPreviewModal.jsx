import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function DocumentoPreviewModal({ documento, onClose }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let urlToRevoke = null;

    const cargarPdf = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/documents/${documento.id}/file`, {
          responseType: "blob",
        });
        const url = URL.createObjectURL(data);
        urlToRevoke = url;
        setBlobUrl(url);
      } catch {
        setError("No se pudo cargar la vista previa del documento.");
      } finally {
        setLoading(false);
      }
    };

    cargarPdf();

    return () => {
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
    };
  }, [documento.id]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl h-[85vh] shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">{documento.originalFileName}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {documento.facultad} · {documento.escuela} · {documento.cicloAcademico}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          {loading ? (
            <p className="text-gray-400 text-sm">Cargando vista previa...</p>
          ) : error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : (
            <iframe
              src={blobUrl}
              title={documento.originalFileName}
              className="w-full h-full border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}