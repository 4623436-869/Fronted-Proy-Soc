import api from "./axios";

export const getProyectos = (params) => api.get("/projects", { params });
export const getProyecto = (id) => api.get(`/projects/${id}`);
export const createProyecto = (data) => api.post("/projects", data);
export const updateProyecto = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProyecto = (id) => api.delete(`/projects/${id}`);