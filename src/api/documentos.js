import api from "./axios";

export const getDocumentos = () => api.get("/documents");

export const buscarDocumentos = (params) =>
  api.get("/documents/search", { params });

export const subirDocumento = (formData) =>
  api.post("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const eliminarDocumento = (id) => api.delete(`/documents/${id}`);

export const getUrlArchivo = (id) =>
  `http://localhost:8080/api/documents/${id}/file`;