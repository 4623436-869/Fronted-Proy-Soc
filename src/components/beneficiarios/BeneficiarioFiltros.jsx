export default function BeneficiarioFiltros({ filtros, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={filtros.name}
        onChange={(e) => onChange({ ...filtros, name: e.target.value })}
        className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-56"
      />
      <select
        value={filtros.status}
        onChange={(e) => onChange({ ...filtros, status: e.target.value })}
        className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <option value="">Todos los estados</option>
        <option value="ACTIVO">Activo</option>
        <option value="INACTIVO">Inactivo</option>
      </select>
    </div>
  );
}