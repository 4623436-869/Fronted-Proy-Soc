import api from "./axios";

export const getUsuarios = () => api.get("/users");
export const toggleUsuarioActivo = (id) => api.patch(`/users/${id}/toggle-active`);
export const cambiarRol = (id, newRole) => api.patch(`/users/${id}/role`, null, { params: { newRole } });