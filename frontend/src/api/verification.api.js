import api from './axiosConfig';

// ── Seller ────────────────────────────────────────────────────────────────────
export const submitVerification = async (formData) => {
  const res = await api.post('/verifications/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getMyVerificationStatus = async () => {
  const res = await api.get('/verifications/my-status');
  return res.data;
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getAllVerifications = async (params = {}) => {
  const res = await api.get('/verifications', { params });
  return res.data;
};

export const approveVerification = async (id) => {
  const res = await api.put(`/verifications/${id}/approve`);
  return res.data;
};

export const rejectVerification = async (id, rejectionReason) => {
  const res = await api.put(`/verifications/${id}/reject`, { rejectionReason });
  return res.data;
};

// ── Notifications (kept here as they use same api instance) ──────────────────
export const getUserNotifications = async (params = {}) => {
  const res = await api.get('/users/notifications', { params });
  return res.data;
};

export const markNotificationRead = async (id) => {
  const res = await api.put(`/users/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await api.put('/users/notifications/read-all');
  return res.data;
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const getPriceSuggestion = async (data) => {
  const res = await api.post('/analytics/price-suggestion', data);
  return res.data;
};

export const getTrendingAreas = async () => {
  const res = await api.get('/analytics/trending-areas');
  return res.data;
};

export const getPopularProperties = async (limit = 10) => {
  const res = await api.get('/analytics/popular-properties', { params: { limit } });
  return res.data;
};

export const getMarketStats = async () => {
  const res = await api.get('/analytics/market-stats');
  return res.data;
};

export const getSellerAnalytics = async () => {
  const res = await api.get('/analytics/seller');
  return res.data;
};

export const getRecommendations = async (limit = 8) => {
  const res = await api.get('/analytics/recommendations', { params: { limit } });
  return res.data;
};
