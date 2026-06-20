import api from "./axios";

const descargarArchivo = async (url, fileName) => {
  const response = await api.get(url, { responseType: "blob" });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const descargarReporteEstudianteExcel = (userId, fileName) =>
  descargarArchivo(`/reports/student/${userId}/excel`, fileName);

export const descargarReporteEstudiantePdf = (userId, fileName) =>
  descargarArchivo(`/reports/student/${userId}/pdf`, fileName);

export const descargarReporteProyectoExcel = (projectId, fileName) =>
  descargarArchivo(`/reports/project/${projectId}/excel`, fileName);

export const descargarReporteProyectoPdf = (projectId, fileName) =>
  descargarArchivo(`/reports/project/${projectId}/pdf`, fileName);