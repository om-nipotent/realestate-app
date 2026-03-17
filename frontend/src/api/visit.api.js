import api from './axiosConfig';

export const requestVisit = async (data) => {
  const res = await api.post('/visits', data);
  return res.data;
};

export const getBuyerVisits = async (params = {}) => {
  const res = await api.get('/visits/buyer', { params });
  return res.data;
};

export const getSellerVisits = async (params = {}) => {
  const res = await api.get('/visits/seller', { params });
  return res.data;
};

export const respondToVisit = async (id, data) => {
  const res = await api.put(`/visits/${id}/respond`, data);
  return res.data;
};

export const cancelVisit = async (id) => {
  const res = await api.put(`/visits/${id}/cancel`);
  return res.data;
};

export const completeVisit = async (id) => {
  const res = await api.put(`/visits/${id}/complete`);
  return res.data;
};
