import { useState } from "react";
import { buscarEstudiantes } from "../api/usuarios";
import { getResumenHorasEstudiante } from "../api/asistencia";

export default function ConsultaHorasPage() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [busquedaHecha, setBusquedaHecha] = useState(false);

  const [estudianteSel, setEstudianteSel] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [cargandoResumen, setCargandoResumen] = useState(false);

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setBuscando(true);
    setBusquedaHecha(true);
    setEstudianteSel(null);
    setResumen(null);

    try {
      const { data } = await buscarEstudiantes(query.trim());
      setResultados(data);
    } catch {
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  };

  const handleSeleccionar = async (estudiante) => {
    setEstudianteSel(estudiante);
    setResumen(null);
    setCargandoResumen(true);
    try {
      const { data } = await getResumenHorasEstudiante(estudiante.id);
      setResumen(data);
    } catch {
      setResumen(null);
      alert("No se pudo obtener el resumen de horas de este estudiante.");
    } finally {
      setCargandoResumen(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header + buscador */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">
          Consulta de horas de proyección social
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Busca un estudiante por código o apellido para ver el total de horas acumuladas en todos los ciclos.
        </p>

        <form onSubmit={handleBuscar} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: 2021012345 o Pérez"
            className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
          <button
            type="submit"
            disabled={buscando}
            className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shrink-0"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            {buscando ? "Buscando..." : "Buscar"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Lista de resultados */}
        <div className="lg:col-span-1 space-y-3">
          {buscando ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 h-16 animate-pulse" />
              ))}
            </div>
          ) : busquedaHecha && resultados.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <p className="text-gray-400 text-sm">No se encontraron estudiantes con ese código o apellido.</p>
            </div>
          ) : (
            resultados.map((est) => (
              <button
                key={est.id}
                onClick={() => handleSeleccionar(est)}
                className={`w-full text-left bg-white rounded-xl border p-4 transition-colors ${
                  estudianteSel?.id === est.id
                    ? "border-indigo-400 ring-2 ring-indigo-100"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <p className="text-sm font-medium text-gray-800 truncate">{est.fullName}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {est.codigoEstudiante || "Sin código asignado"}
                </p>
                {!est.active && (
                  <span className="inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">
                    Inactivo
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Detalle de horas */}
        <div className="lg:col-span-2">
          {!estudianteSel ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center h-full flex items-center justify-center">
              <p className="text-gray-400 text-sm">
                Selecciona un estudiante de la lista para ver su resumen de horas.
              </p>
            </div>
          ) : cargandoResumen ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <p className="text-gray-400 text-sm">Cargando resumen...</p>
            </div>
          ) : resumen ? (
            <div className="space-y-4">
              {/* Card resumen total */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{resumen.fullName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {resumen.codigoEstudiante || "Sin código asignado"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">
                      {resumen.totalHoursAllCycles}
                    </p>
                    <p className="text-xs text-gray-400">horas acumuladas (todos los ciclos)</p>
                  </div>
                </div>
              </div>

              {/* Tabla detalle por proyecto/ciclo */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Detalle por proyecto y ciclo
                  </h3>
                </div>

                {resumen.details.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-400 text-sm">Este estudiante no tiene horas registradas.</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                        <th className="px-5 py-2 font-medium">Proyecto</th>
                        <th className="px-5 py-2 font-medium">Ciclo</th>
                        <th className="px-5 py-2 font-medium text-right">Horas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumen.details.map((d, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                          <td className="px-5 py-2.5 text-gray-700">{d.projectName}</td>
                          <td className="px-5 py-2.5 text-gray-500">{d.cicloAcademico || "—"}</td>
                          <td className="px-5 py-2.5 text-right text-gray-700 font-medium">{d.hours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}