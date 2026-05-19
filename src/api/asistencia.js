import api from "./axios";

export const getAsistenciaPorProyecto = (projectId) =>
  api.get(`/attendance/project/${projectId}`);

export const getAsistenciaPorUsuario = (userId) =>
  api.get(`/attendance/user/${userId}`);

export const getAsistenciaFiltrada = (params) =>
  api.get("/attendance/filter", { params });

export const registrarManual = (data) =>
  api.post("/attendance/manual", data);

export const actualizarAsistencia = (id, data) =>
  api.put(`/attendance/${id}`, data);

export const eliminarAsistencia = (id) =>
  api.delete(`/attendance/${id}`);

export const getTotalHoras = (userId, projectId) =>
  api.get("/attendance/hours", { params: { userId, projectId } });

export const getResumenProyecto = (projectId) =>
  api.get(`/attendance/summary/project/${projectId}`);