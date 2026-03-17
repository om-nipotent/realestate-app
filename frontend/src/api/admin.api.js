import api from './axiosConfig';

export const getDashboardStats = async () => {
  const res = await api.get('/admin/dashboard');
  return res.data;
};

export const getUsers = async (params = {}) => {
  const res = await api.get('/admin/users', { params });
  return res.data;
};

export const updateUserStatus = async (id, isActive) => {
  const res = await api.put(`/admin/users/${id}/status`, { isActive });
  return res.data;
};

export const getAdminProperties = async (params = {}) => {
  const res = await api.get('/admin/properties', { params });
  return res.data;
};

export const updatePropertyStatus = async (id, status) => {
  const res = await api.put(`/admin/properties/${id}/status`, { status });
  return res.data;
};

export const togglePropertyFeaturedAdmin = async (id) => {
  const res = await api.put(`/admin/properties/${id}/featured`);
  return res.data;
};

export const deletePropertyAdmin = async (id) => {
  const res = await api.delete(`/admin/properties/${id}`);
  return res.data;
};

export const getFraudAlerts = async () => {
  const res = await api.get('/admin/fraud-alerts');
  return res.data;
};

export const getPlatformActivity = async (params = {}) => {
  const res = await api.get('/admin/activity', { params });
  return res.data;
};
