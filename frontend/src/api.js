import axios from 'axios';

const BASE_URL = 'https://dealmind-ai-cdkj.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err.message);
    return Promise.reject(err);
  }
);

export const getProspects = () => api.get('/prospects');
export const recallProspect = (id) => api.get(`/recall/${id}`);
export const prepareForCall = (id) => api.post(`/prepare-for-call/${id}`);
export const logCall = (data) => api.post('/log-call', data);
export const draftFollowup = (data) => api.post('/draft-followup', data);
export const getAuditTrail = () => api.get('/audit-trail');
export const getDealRisk = (id) => api.get(`/deal-risk/${id}`);

export default api;
