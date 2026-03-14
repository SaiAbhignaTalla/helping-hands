import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

// ============================================
// AUTH ENDPOINTS
// ============================================

export const authAPI = {
  registerUser: (data) => api.post("/api/auth/register", data),
  registerVolunteer: (data) => api.post("/api/auth/register/volunteer", data),
  login: (data) => api.post("/api/auth/login", data),
  logout: () => api.post("/api/auth/logout"),
};

// ============================================
// USER ENDPOINTS
// ============================================

export const userAPI = {
  getProfile: (userId) => api.get(`/api/users/${userId}`),
  updateProfile: (userId, data) => api.patch(`/api/users/${userId}`, data),
  getRequests: (userId) => api.get(`/api/users/${userId}/requests`),
};

// ============================================
// REQUEST ENDPOINTS
// ============================================

export const requestAPI = {
  create: (data, userId) => api.post(`/api/requests/?user_id=${userId}`, data),
  getAll: (filters = {}) => api.get("/api/requests/", { params: filters }),
  getById: (requestId, helperId = null) => {
    const params = helperId ? { helper_id: helperId } : {};
    return api.get(`/api/requests/${requestId}`, { params });
  },
  updateStatus: (requestId, status) =>
    api.patch(`/api/requests/${requestId}/status`, null, {
      params: { new_status: status },
    }),
};

// ============================================
// VOLUNTEER ENDPOINTS
// ============================================

export const volunteerAPI = {
  getAll: (filters = {}) => api.get("/api/volunteers/", { params: filters }),
  getById: (id) => api.get(`/api/volunteers/${id}`),
  getMatches: (id) => api.get(`/api/volunteers/${id}/matches`),
};

// ============================================
// ORGANIZATION ENDPOINTS
// ============================================

export const organizationAPI = {
  getAll: (filters = {}) => api.get("/api/organizations/", { params: filters }),
  getById: (id) => api.get(`/api/organizations/${id}`),
  getMatches: (id) => api.get(`/api/organizations/${id}/matches`),
};

// ============================================
// MATCH ENDPOINTS
// ============================================

export const matchAPI = {
  accept: (matchId) => api.patch(`/api/matches/${matchId}/accept`),
  decline: (matchId) => api.patch(`/api/matches/${matchId}/decline`),
  getVolunteerMatches: (volunteerId, status) =>
    api.get(`/api/matches/volunteer/${volunteerId}`, { params: { status } }),
  getOrganizationMatches: (organizationId, status) =>
    api.get(`/api/matches/organization/${organizationId}`, {
      params: { status },
    }),
  getAcceptedHelperInfo: (requestId) =>
    api.get(`/api/matches/request/${requestId}/accepted`),
};

export default api;
