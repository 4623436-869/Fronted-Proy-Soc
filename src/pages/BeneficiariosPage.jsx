import { useState, useEffect, useCallback } from "react";
import { getProyectos } from "../api/proyectos";
import {
  getBeneficiariosPorProyecto,
  deleteBeneficiario,
} from "../api/beneficiarios";
import { useAuth } from "../context/AuthContext";
import BeneficiarioFiltros from "../components/beneficiarios/BeneficiarioFiltros";
import BeneficiarioModal from "../components/beneficiarios/BeneficiarioModal";

const STATUS_STYLES = {
  ACTIVO: "bg-emerald-100 text-emerald-700",
  INACTIVO: "bg-gray-100 text-gray-500",
};

export default function BeneficiariosPage() {
  const { isAdmin, isCoordinador } = useAuth();
  const canEdit = isAdmin() || isCoordinador();

  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState("");
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({ name: "", status: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [beneficiarioEdit, setBeneficiarioEdit] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Cargar proyectos al montar
  useEffect(() => {
    getProyectos()
      .then((res) => {
        setProyectos(res.data || []);
        if (res.data?.length > 0) setProyectoSeleccionado(res.data[0].id);
      })
      .catch(() => {});
  }, []);

  const fetchBeneficiarios = useCallback(async () => {
    if (!proyectoSeleccionado) return;
    setLoading(true);
    try {
      const params = {};
      if (filtros.name) params.name = filtros.name;
      if (filtros.status) params.status = filtros.status;
      const { data } = await getBeneficiariosPorProyecto(proyectoSeleccionado, params);
      setBeneficiarios(data);
    } catch {
      setBeneficiarios([]);
    } finally {
      setLoading(false);
    }
  }, [proyectoSeleccionado, filtros]);

  useEffect(() => {
    fetchBeneficiarios();
  }, [fetchBeneficiarios]);

  const handleSaved = () => {
    setModalOpen(false);
    setBeneficiarioEdit(null);
    fetchBeneficiarios();
  };

  const handleEdit = (b) => {
    setBeneficiarioEdit(b);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await deleteBeneficiario(confirmDelete.id);
      setConfirmDelete(null);
      fetchBeneficiarios();
    } catch {
      alert("No se pudo eliminar.");
    }
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

      {/* Filtros + botón crear */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <BeneficiarioFiltros filtros={filtros} onChange={setFiltros} />
        {canEdit && proyectoSeleccionado && (
          <button
            onClick={() => { setBeneficiarioEdit(null); setModalOpen(true); }}
            className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo beneficiario
          </button>
        )}
      </div>

      {/* Tabla */}
      {!proyectoSeleccionado ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-sm text-gray-400">Selecciona un proyecto para ver sus beneficiarios.</p>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : beneficiarios.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-sm text-gray-400">No hay beneficiarios registrados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Nombre</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Documento</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 hidden md:table-cell">Teléfono</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 hidden lg:table-cell">Dirección</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Estado</th>
                {canEdit && (
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {beneficiarios.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{b.fullName}</td>
                  <td className="px-5 py-3 text-gray-500">{b.documentNumber}</td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{b.phone || "—"}</td>
                  <td className="px-5 py-3 text-gray-500 hidden lg:table-cell max-w-xs truncate">{b.address || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="px-5 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(b)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                          Editar
                        </button>
                        {isAdmin() && (
                          <button
                            onClick={() => setConfirmDelete(b)}
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

      {/* Modal crear/editar */}
      {modalOpen && (
        <BeneficiarioModal
          beneficiario={beneficiarioEdit}
          projectId={proyectoSeleccionado}
          onClose={() => { setModalOpen(false); setBeneficiarioEdit(null); }}
          onSaved={handleSaved}
        />
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">¿Eliminar beneficiario?</h3>
            <p className="text-xs text-gray-500">
              Estás a punto de eliminar a{" "}
              <span className="font-medium text-gray-700">"{confirmDelete.fullName}"</span>. Esta acción no se puede deshacer.
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