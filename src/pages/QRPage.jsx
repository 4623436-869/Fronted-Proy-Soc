import { useState, useEffect } from "react";
import { getProyectos } from "../api/proyectos";
import { getUsuarios } from "../api/usuarios";
import { generarQR, escanearQR, checkoutQR } from "../api/qr";
import { useAuth } from "../context/AuthContext";
import QrScanner from "../components/qr/QrScanner";

export default function QRPage() {
  const { user, isAdmin, isCoordinador } = useAuth();
  const canGenerate = isAdmin() || isCoordinador();

  const [proyectos, setProyectos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [scannerAbierto, setScannerAbierto] = useState(false);

  // — Generar QR —
  const [genUserId, setGenUserId] = useState("");
  const [genProjectId, setGenProjectId] = useState("");
  const [qrData, setQrData] = useState(null);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState("");

  // — Escanear QR —
  const [token, setToken] = useState("");
  const [scanMsg, setScanMsg] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState("");

  // — Checkout —
  const [coUserId, setCoUserId] = useState(String(user?.id || ""));
  const [coProjectId, setCoProjectId] = useState("");
  const [coMsg, setCoMsg] = useState(null);
  const [coLoading, setCoLoading] = useState(false);
  const [coError, setCoError] = useState("");

  useEffect(() => {
    getProyectos()
      .then((res) => {
        setProyectos(res.data || []);
        if (res.data?.length > 0) {
          setGenProjectId(res.data[0].id);
          setCoProjectId(res.data[0].id);
        }
      })
      .catch(() => {});

    if (canGenerate) {
      getUsuarios()
        .then((res) => {
          setUsuarios(res.data || []);
          if (res.data?.length > 0) setGenUserId(res.data[0].id);
        })
        .catch(() => {});
    }
  }, []);

  // Cuando la cámara detecta el QR, pone el token y dispara el escaneo
  const handleScanSuccess = async (tokenEscaneado) => {
    setScannerAbierto(false);
    setScanError("");
    setScanMsg(null);
    setScanLoading(true);
    try {
      const { data } = await escanearQR(tokenEscaneado);
      setScanMsg(data);
      setToken("");
    } catch (err) {
      setScanError(err.response?.data?.error || "Token inválido o expirado.");
      setToken(tokenEscaneado); // Deja el token visible para debug
    } finally {
      setScanLoading(false);
    }
  };

  const handleGenerarQR = async (e) => {
    e.preventDefault();
    setGenError("");
    setQrData(null);
    setGenLoading(true);
    try {
      const { data } = await generarQR(genUserId, genProjectId);
      setQrData(data);
    } catch (err) {
      setGenError(err.response?.data?.error || "Error al generar QR.");
    } finally {
      setGenLoading(false);
    }
  };

  const handleEscanearManual = async (e) => {
    e.preventDefault();
    setScanError("");
    setScanMsg(null);
    setScanLoading(true);
    try {
      const { data } = await escanearQR(token);
      setScanMsg(data);
      setToken("");
    } catch (err) {
      setScanError(err.response?.data?.error || "Token inválido o expirado.");
    } finally {
      setScanLoading(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setCoError("");
    setCoMsg(null);
    setCoLoading(true);
    try {
      const { data } = await checkoutQR(coUserId, coProjectId);
      setCoMsg(data);
    } catch (err) {
      setCoError(err.response?.data?.error || "Error al registrar checkout.");
    } finally {
      setCoLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ── Generar QR ── */}
      {canGenerate && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">1</span>
            Generar QR de asistencia
          </h2>

          <form onSubmit={handleGenerarQR} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Usuario</label>
                <select
                  value={genUserId}
                  onChange={(e) => setGenUserId(e.target.value)}
                  required
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>{u.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Proyecto</label>
                <select
                  value={genProjectId}
                  onChange={(e) => setGenProjectId(e.target.value)}
                  required
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {proyectos.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {genError && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{genError}</p>
            )}

            <button
              type="submit"
              disabled={genLoading}
              className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              {genLoading ? "Generando..." : "Generar QR"}
            </button>
          </form>

          {qrData && (
            <div className="mt-5 flex flex-col sm:flex-row gap-5 items-start border-t border-gray-100 pt-5">
              <img
                src={`data:image/png;base64,${qrData.qrBase64}`}
                alt="Código QR"
                className="w-40 h-40 rounded-xl border border-gray-100"
              />
              <div className="space-y-2 text-xs text-gray-500">
                <p>
                  <span className="font-medium text-gray-700">Token:</span>{" "}
                  <span className="font-mono text-indigo-600 break-all">{qrData.token}</span>
                </p>
                <p><span className="font-medium text-gray-700">Generado:</span> {new Date(qrData.generatedAt).toLocaleString("es-PE")}</p>
                <p><span className="font-medium text-gray-700">Expira:</span> {new Date(qrData.expiresAt).toLocaleString("es-PE")}</p>
                <p className="text-gray-400 italic mt-2">Muestra este QR al estudiante para registrar su entrada.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Escanear QR ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">2</span>
          Registrar entrada (escanear QR)
        </h2>

        {/* Botón cámara */}
        <button
          onClick={() => { setScanMsg(null); setScanError(""); setScannerAbierto(true); }}
          className="w-full h-12 rounded-xl border-2 border-dashed border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-emerald-600 font-medium mb-4"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Abrir cámara para escanear
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">o ingresa el token manualmente</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <form onSubmit={handleEscanearManual} className="space-y-4">
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            placeholder="Pega aquí el token UUID..."
            className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />

          {scanError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{scanError}</p>
          )}
          {scanMsg && (
            <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              ✓ Check-in registrado para <span className="font-medium">{scanMsg.userFullName}</span> en <span className="font-medium">{scanMsg.projectName}</span>.
            </p>
          )}
          {scanLoading && (
            <p className="text-xs text-gray-400">Registrando entrada...</p>
          )}

          <button
            type="submit"
            disabled={scanLoading}
            className="h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            {scanLoading ? "Registrando..." : "Registrar entrada"}
          </button>
        </form>
      </div>

      {/* ── Checkout ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">3</span>
          Registrar salida (checkout)
        </h2>

        <form onSubmit={handleCheckout} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Usuario</label>
              {canGenerate ? (
                <select
                  value={coUserId}
                  onChange={(e) => setCoUserId(e.target.value)}
                  required
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>{u.fullName}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={user?.fullName}
                  disabled
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Proyecto</label>
              <select
                value={coProjectId}
                onChange={(e) => setCoProjectId(e.target.value)}
                required
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {coError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{coError}</p>
          )}
          {coMsg && (
            <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              ✓ Salida registrada. Horas acumuladas: <span className="font-medium">{coMsg.hoursLogged}h</span>.
            </p>
          )}

          <button
            type="submit"
            disabled={coLoading}
            className="h-9 px-5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            {coLoading ? "Registrando..." : "Registrar salida"}
          </button>
        </form>
      </div>

      {/* Scanner modal */}
      {scannerAbierto && (
        <QrScanner
          onScan={handleScanSuccess}
          onClose={() => setScannerAbierto(false)}
        />
      )}
    </div>
  );
}