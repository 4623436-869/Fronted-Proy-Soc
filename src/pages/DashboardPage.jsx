import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const ROLE_LABELS = {
  ROLE_ADMIN: "Administrador",
  ROLE_COORDINADOR: "Coordinador",
  ROLE_ESTUDIANTE: "Estudiante",
};

const CAMPUS_LABELS = {
  LIMA: "Lima",
  JULIACA: "Juliaca",
  TARAPOTO: "Tarapoto",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumen = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/dashboard/summary");
        setResumen(data);
      } catch {
        setResumen(null);
      } finally {
        setLoading(false);
      }
    };
    fetchResumen();
  }, []);

  const cards = [
    {
      label: "Proyectos activos",
      value: resumen?.activeProjects ?? "—",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Horas registradas",
      value: resumen?.totalHours ?? "—",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Beneficiarios",
      value: resumen?.totalBeneficiaries ?? "—",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const maxHoras = resumen?.byCampus?.length
    ? Math.max(...resumen.byCampus.map((c) => c.totalHours), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Bienvenido, {user?.fullName} 👋
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Accediste como <span className="font-medium text-indigo-600">{ROLE_LABELS[user?.role]}</span>.
          Usa el menú lateral para navegar.
        </p>
      </div>

      {/* Cards rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 mb-1">{card.label}</p>
            {loading ? (
              <div className="h-7 w-16 bg-gray-100 rounded animate-pulse" />
            ) : (
              <p className={`text-2xl font-semibold ${card.color}`}>{card.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Resumen por campus */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Resumen por campus</h3>
        <p className="text-xs text-gray-500 mb-4">
          Proyectos, horas y beneficiarios distribuidos por sede.
        </p>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : !resumen?.byCampus?.length ? (
          <p className="text-gray-400 text-sm text-center py-8">
            No hay datos de campus aún.
          </p>
        ) : (
          <div className="space-y-4">
            {resumen.byCampus.map((c) => (
              <div key={c.campus}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">
                    {CAMPUS_LABELS[c.campus] || c.campus}
                  </span>
                  <span className="text-gray-400">
                    {c.projectCount} proyectos · {c.beneficiaryCount} beneficiarios · {c.totalHours} hrs
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${(c.totalHours / maxHoras) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}