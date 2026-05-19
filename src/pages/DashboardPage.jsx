import { useAuth } from "../context/AuthContext";

const ROLE_LABELS = {
  ROLE_ADMIN: "Administrador",
  ROLE_COORDINADOR: "Coordinador",
  ROLE_ESTUDIANTE: "Estudiante",
};

export default function DashboardPage() {
  const { user } = useAuth();

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
        {[
          { label: "Proyectos activos", value: "—", color: "bg-indigo-50 text-indigo-600" },
          { label: "Horas registradas", value: "—", color: "bg-emerald-50 text-emerald-600" },
          { label: "Beneficiarios", value: "—", color: "bg-amber-50 text-amber-600" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 mb-1">{card.label}</p>
            <p className={`text-2xl font-semibold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}