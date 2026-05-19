import { useAuth } from "../../context/AuthContext";

const STATUS_STYLES = {
  ACTIVO: "bg-emerald-100 text-emerald-700",
  INACTIVO: "bg-gray-100 text-gray-500",
  FINALIZADO: "bg-blue-100 text-blue-600",
};

export default function ProyectoCard({ proyecto, onEdit, onDelete }) {
  const { isAdmin, isCoordinador } = useAuth();
  const canEdit = isAdmin() || isCoordinador();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-800 leading-snug">{proyecto.name}</h3>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLES[proyecto.status]}`}>
          {proyecto.status}
        </span>
      </div>

      {proyecto.description && (
        <p className="text-xs text-gray-400 line-clamp-2">{proyecto.description}</p>
      )}

      <div className="text-xs text-gray-400 space-y-1">
        <p>
          <span className="font-medium text-gray-500">Inicio:</span>{" "}
          {new Date(proyecto.startDate).toLocaleDateString("es-PE")}
        </p>
        <p>
          <span className="font-medium text-gray-500">Fin:</span>{" "}
          {new Date(proyecto.endDate).toLocaleDateString("es-PE")}
        </p>
        {proyecto.coordinatorName && (
          <p>
            <span className="font-medium text-gray-500">Coordinador:</span>{" "}
            {proyecto.coordinatorName}
          </p>
        )}
      </div>

      {canEdit && (
        <div className="flex gap-2 pt-1 border-t border-gray-50">
          <button
            onClick={() => onEdit(proyecto)}
            className="flex-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium py-1 transition-colors"
          >
            Editar
          </button>
          {isAdmin() && (
            <button
              onClick={() => onDelete(proyecto)}
              className="flex-1 text-xs text-red-400 hover:text-red-600 font-medium py-1 transition-colors"
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
}