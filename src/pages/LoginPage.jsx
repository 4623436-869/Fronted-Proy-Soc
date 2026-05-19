import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error || "Credenciales incorrectas. Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="flex w-full max-w-3xl rounded-2xl overflow-hidden shadow-lg">

        {/* Panel izquierdo */}
        <div className="hidden md:flex flex-col justify-between bg-[#1a1a2e] text-white p-10 w-2/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-sm font-bold">P</div>
            <span className="text-sm font-medium text-gray-300">ProyectoApp</span>
          </div>
          <div>
            <p className="font-serif italic text-2xl leading-snug">
              Gestiona proyectos y{" "}
              <span className="text-indigo-400">asistencia</span>{" "}
              en un solo lugar.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Control de horas, QR, beneficiarios y más.
            </p>
          </div>
          <div className="flex gap-6">
            {[["3", "Roles de acceso"], ["QR", "Asistencia digital"], ["JWT", "Auth seguro"]].map(
              ([val, label]) => (
                <div key={label}>
                  <p className="text-lg font-medium">{val}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Panel derecho — formulario */}
        <div className="flex-1 bg-white p-10 flex flex-col justify-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-1">Bienvenido</h1>
          <p className="text-sm text-gray-500 mb-7">
            Ingresa tus credenciales para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@proyecto.com"
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          {/* Hint de credenciales de prueba */}
          <div className="mt-5 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-400 space-y-1">
            <p className="font-medium text-gray-500">Usuarios de prueba</p>
            <p><b className="text-gray-600">Admin:</b> admin@proyecto.com / Admin1234!</p>
            <p><b className="text-gray-600">Coordinador:</b> coordinador@proyecto.com / Coord1234!</p>
            <p><b className="text-gray-600">Estudiante:</b> estudiante@proyecto.com / Estud1234!</p>
          </div>
        </div>

      </div>
    </div>
  );
}