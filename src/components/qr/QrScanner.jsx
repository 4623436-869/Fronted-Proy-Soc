import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QrScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState("");
  const [iniciando, setIniciando] = useState(true);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          // Detiene el escáner y devuelve el token al padre
          scanner.stop().then(() => onScan(decodedText)).catch(() => onScan(decodedText));
        },
        () => {} // Error por frame — ignorar
      )
      .then(() => setIniciando(false))
      .catch((err) => {
        setError("No se pudo acceder a la cámara. Verifica los permisos.");
        setIniciando(false);
        console.error(err);
      });

    return () => {
      // Limpieza al desmontar
      scanner.isScanning && scanner.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Escanear código QR</h2>
          <button
            onClick={() => {
              scannerRef.current?.isScanning &&
                scannerRef.current.stop().catch(() => {});
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Área de cámara */}
        <div className="p-5">
          {iniciando && (
            <div className="flex items-center justify-center h-52 text-sm text-gray-400">
              Iniciando cámara...
            </div>
          )}

          {error ? (
            <div className="flex flex-col items-center justify-center h-52 gap-3">
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-red-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-xs text-red-500 text-center">{error}</p>
            </div>
          ) : (
            <div
              id="qr-reader"
              className="w-full rounded-xl overflow-hidden"
              style={{ minHeight: iniciando ? 0 : "auto" }}
            />
          )}

          <p className="text-xs text-gray-400 text-center mt-3">
            Apunta la cámara al código QR para registrar la entrada automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
}