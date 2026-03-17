import api from './axiosConfig';

export const sendInquiry = async (data) => {
  const res = await api.post('/inquiries', data);
  return res.data;
};

export const getBuyerInquiries = async (params = {}) => {
  const res = await api.get('/inquiries/buyer', { params });
  return res.data;
};

export const getSellerInquiries = async (params = {}) => {
  const res = await api.get('/inquiries/seller', { params });
  return res.data;
};

export const replyToInquiry = async (id, reply) => {
  const res = await api.put(`/inquiries/${id}/reply`, { reply });
  return res.data;
};

export const markInquiryRead = async (id) => {
  const res = await api.put(`/inquiries/${id}/read`);
  return res.data;
};
