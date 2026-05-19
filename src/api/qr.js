import api from "./axios";

export const generarQR = (userId, projectId) =>
  api.post("/qr/generate", null, { params: { userId, projectId } });

export const escanearQR = (token) =>
  api.post("/qr/scan", { token });

export const checkoutQR = (userId, projectId) =>
  api.post("/qr/checkout", { userId, projectId });