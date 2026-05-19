import { useState, useEffect, useCallback } from "react";
import { getProyectos, deleteProyecto } from "../api/proyectos";
import { useAuth } from "../context/AuthContext";
import ProyectoCard from "../components/proyectos/ProyectoCard";
import ProyectoFiltros from "../components/proyectos/ProyectoFiltros";
import ProyectoModal from "../components/proyectos/ProyectoModal";

export default function ProyectosPage() {
  const { isAdmin, isCoordinador } = useAuth();
  const canCreate = isAdmin() || isCoordinador();

  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ name: "", status: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [proyectoEdit, setProyectoEdit] = useState(null); // null = crear, objeto = editar
  const [confirmDelete, setConfirmDelete] = useState(null); // proyecto a eliminar

  const fetchProyectos = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtros.name) params.name = filtros.name;
      if (filtros.status) params.status = filtros.status;
      const { data } = await getProyectos(params);
      setProyectos(data);
    } catch {
      setProyectos([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchProyectos();
  }, [fetchProyectos]);

  const handleSaved = () => {
    setModalOpen(false);
    setProyectoEdit(null);
    fetchProyectos();
  };

  const handleEdit = (proyecto) => {
    setProyectoEdit(proyecto);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await deleteProyecto(confirmDelete.id);
      setConfirmDelete(null);
      fetchProyectos();
    } catch {
      alert("No se pudo eliminar el proyecto.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <ProyectoFiltros filtros={filtros} onChange={setFiltros} />
        {canCreate && (
          <button
            onClick={() => { setProyectoEdit(null); setModalOpen(true); }}
            className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo proyecto
          </button>
        )}
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 h-40 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-2 bg-gray-100 rounded w-full mb-2" />
              <div className="h-2 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : proyectos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No se encontraron proyectos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {proyectos.map((p) => (
            <ProyectoCard
              key={p.id}
              proyecto={p}
              onEdit={handleEdit}
              onDelete={setConfirmDelete}
            />
          ))}
        </div>
      )}

      {/* Modal crear/editar */}
      {modalOpen && (
        <ProyectoModal
          proyecto={proyectoEdit}
          onClose={() => { setModalOpen(false); setProyectoEdit(null); }}
          onSaved={handleSaved}
        />
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">¿Eliminar proyecto?</h3>
            <p className="text-xs text-gray-500">
              Estás a punto de eliminar <span className="font-medium text-gray-700">"{confirmDelete.name}"</span>. Esta acción no se puede deshacer.
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