import api from "./axios";

export const getUsuarios = () => api.get("/users");
export const toggleUsuarioActivo = (id) => api.patch(`/users/${id}/toggle-active`);
export const cambiarRol = (id, newRole) => api.patch(`/users/${id}/role`, null, { params: { newRole } });
export const buscarEstudiantes = (query) => api.get("/users/search", { params: { query } });
export const asignarCodigoEstudiante = (id, codigo) => api.patch(`/users/${id}/codigo`, null, { params: { codigo } });