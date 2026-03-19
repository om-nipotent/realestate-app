import api from './axiosConfig';

/**
 * POST /api/v1/predict-property
 * @param {Object} payload - { city, propertyType, price, area, bedrooms, amenities }
 */
export const predictProperty = async (payload) => {
  const res = await api.post('/predict-property', payload);
  return res.data;
};
