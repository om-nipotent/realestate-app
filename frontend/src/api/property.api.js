import api from './axiosConfig';

export const getProperties = async (params = {}) => {
  const res = await api.get('/properties', { params });
  return res.data;
};

export const getProperty = async (id) => {
  const res = await api.get(`/properties/${id}`);
  return res.data;
};

export const getFeaturedProperties = async () => {
  const res = await api.get('/properties/featured');
  return res.data;
};

export const getNearbyProperties = async (lat, lng, distance = 10) => {
  const res = await api.get('/properties/nearby', { params: { lat, lng, distance } });
  return res.data;
};

export const getSellerProperties = async (params = {}) => {
  const res = await api.get('/properties/seller/listings', { params });
  return res.data;
};

export const createProperty = async (formData) => {
  const res = await api.post('/properties', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateProperty = async (id, formData) => {
  const res = await api.put(`/properties/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteProperty = async (id) => {
  const res = await api.delete(`/properties/${id}`);
  return res.data;
};

export const deletePropertyImage = async (propertyId, imageId) => {
  const res = await api.delete(`/properties/${propertyId}/images/${imageId}`);
  return res.data;
};

export const toggleFeatured = async (id) => {
  const res = await api.put(`/properties/${id}/featured`);
  return res.data;
};
