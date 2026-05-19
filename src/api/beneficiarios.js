import api from "./axios";

export const getBeneficiariosPorProyecto = (projectId, params) =>
  api.get(`/beneficiaries/project/${projectId}`, { params });

export const getBeneficiario = (id) => api.get(`/beneficiaries/${id}`);

export const createBeneficiario = (data) => api.post("/beneficiaries", data);

export const updateBeneficiario = (id, data) => api.put(`/beneficiaries/${id}`, data);

export const deleteBeneficiario = (id) => api.delete(`/beneficiaries/${id}`);