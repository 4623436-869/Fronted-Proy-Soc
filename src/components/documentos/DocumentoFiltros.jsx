export default function DocumentoFiltros({ filtros, onChange }) {
  const handleChange = (e) => {
    onChange((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex flex-wrap gap-2">
      <input
        name="nombre"
        placeholder="Buscar por nombre..."
        value={filtros.nombre}
        onChange={handleChange}
        className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 w-48"
      />
      <input
        name="cicloAcademico"
        placeholder="Ciclo (2025-1)"
        value={filtros.cicloAcademico}
        onChange={handleChange}
        className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 w-32"
      />
      <input
        name="facultad"
        placeholder="Facultad..."
        value={filtros.facultad}
        onChange={handleChange}
        className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 w-40"
      />
      <select
        name="tipo"
        value={filtros.tipo}
        onChange={handleChange}
        className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
      >
        <option value="">Todos los tipos</option>
        <option value="PLAN">Plan</option>
        <option value="INFORME">Informe</option>
      </select>
    </div>
  );
}