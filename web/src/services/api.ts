/**
 * LifeLink AI — API Client
 * Axios instance configured to call the FastAPI backend at :8000
 * Falls back to mock data if backend is unreachable
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://lifelink-ai-rwru.onrender.com';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ll_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ll_access_token');
      window.location.href = '/onboarding';
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────
export const authAPI = {
  register: (data: any) => api.post('/api/auth/register', data),
  login: (identifier: string, password: string) =>
    api.post('/api/auth/login', { identifier, password }),
  sendOTP: (phone: string) => api.post(`/api/auth/send-otp?phone=${phone}`),
  verifyOTP: (phone: string, otp: string) =>
    api.post('/api/auth/verify-otp', { phone, otp }),
  me: () => api.get('/api/auth/me'),
};

// ─────────────────────────────────────────────
// AI TRIAGE API
// ─────────────────────────────────────────────
export const aiAPI = {
  triage: (symptoms: string, language: string = 'en') => api.post('/api/ai/triage', { symptoms, language }),
  voiceCommand: (text: string) => api.post(`/api/ai/voice-command?text=${encodeURIComponent(text)}`),
  getSession: (sessionId: string) => api.get(`/api/ai/triage/${sessionId}`),
  communitySearch: (query: string) => api.post('/api/ai/community-search', { query }),
};

// ─────────────────────────────────────────────
// SOS API
// ─────────────────────────────────────────────
export const sosAPI = {
  trigger: (lat: number, lng: number, triageLevel = 'critical', method = 'button') =>
    api.post('/api/sos/trigger', { lat, lng, triage_level: triageLevel, trigger_method: method }),
  cancel: (sosId: string) => api.post(`/api/sos/${sosId}/cancel`),
  resolve: (sosId: string) => api.post(`/api/sos/${sosId}/resolve`),
  status: (sosId: string) => api.get(`/api/sos/${sosId}/status`),
  sendLocation: (sosId: string, lat: number, lng: number) =>
    api.post(`/api/sos/${sosId}/location`, { lat, lng }),
};

// ─────────────────────────────────────────────
// HEALTH API
// ─────────────────────────────────────────────
export const healthAPI = {
  getProfile: () => api.get('/api/health/profile'),
  updateProfile: (data: any) => api.put('/api/health/profile', data),
  getQRPassport: () => api.get('/api/health/qr-passport'),
  verifyQR: (token: string) => api.post('/api/health/qr-passport/verify', { token }),
  getVault: () => api.get('/api/health/vault'),
  uploadDocument: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/api/health/vault/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ─────────────────────────────────────────────
// HOSPITAL API
// ─────────────────────────────────────────────
export const hospitalAPI = {
  nearby: (lat: number, lng: number) =>
    api.get(`/api/hospital/nearby?lat=${lat}&lng=${lng}`),
  getHospital: (id: string) => api.get(`/api/hospital/${id}`),
  erStatus: (id: string) => api.get(`/api/hospital/${id}/er-status`),
};

// ─────────────────────────────────────────────
// AMBULANCE API
// ─────────────────────────────────────────────
export const ambulanceAPI = {
  nearby: (lat: number, lng: number) =>
    api.get(`/api/ambulance/nearby?lat=${lat}&lng=${lng}`),
  dispatch: (lat: number, lng: number, sosId: string, triageLevel = 'critical') =>
    api.post(`/api/ambulance/dispatch?lat=${lat}&lng=${lng}&sos_id=${sosId}&triage_level=${triageLevel}`),
  location: (ambId: string) => api.get(`/api/ambulance/${ambId}/location`),
};

// ─────────────────────────────────────────────
// DOCTOR API
// ─────────────────────────────────────────────
export const doctorAPI = {
  onCall: () => api.get('/api/doctor/on-call'),
  familyDoctor: (userId: string) => api.get(`/api/doctor/family-doctor/${userId}`),
  createSession: (doctorId: string) =>
    api.post(`/api/doctor/session/create?doctor_id=${doctorId}&user_id=usr_demo`),
  joinSession: (sessionId: string) => api.post(`/api/doctor/session/${sessionId}/join`),
};

// ─────────────────────────────────────────────
// BLOOD NETWORK API
// ─────────────────────────────────────────────
export const bloodAPI = {
  nearbyDonors: (lat: number, lng: number, bloodGroup?: string) =>
    api.get(`/api/v1/blood/nearby-donors?lat=${lat}&lng=${lng}${bloodGroup ? `&blood_group=${bloodGroup}` : ''}`),
  sendRequest: (patientId: string, bloodGroup: string, lat: number, lng: number, unitsNeeded: number = 1) =>
    api.post(`/api/v1/blood/emergency-request`, { patient_id: patientId, required_blood_group: bloodGroup, lat, lng, units_needed: unitsNeeded }),
  registerDonor: (userId: string, bloodGroup: string, lat: number, lng: number, isAvailable: boolean = true) =>
    api.post(`/api/v1/blood/register-donor`, { user_id: userId, blood_group: bloodGroup, lat, lng, is_available: isAvailable }),
};

// ─────────────────────────────────────────────
// PHARMACY API
// ─────────────────────────────────────────────
export const pharmacyAPI = {
  nearby: (lat: number, lng: number) => api.get(`/api/pharmacy/nearby?lat=${lat}&lng=${lng}`),
  search: (medicine: string) => api.get(`/api/pharmacy/search?medicine=${medicine}`),
  inventory: (pharmacyId: string) => api.get(`/api/pharmacy/${pharmacyId}/inventory`),
};

// ─────────────────────────────────────────────
// LAB API
// ─────────────────────────────────────────────
export const labAPI = {
  nearby: (lat: number, lng: number) => api.get(`/api/labs/nearby?lat=${lat}&lng=${lng}`),
  tests: (labId: string) => api.get(`/api/labs/${labId}/tests`),
  book: (labId: string, testId: string, slot: string) =>
    api.post(`/api/labs/book?lab_id=${labId}&test_id=${testId}&slot_time=${slot}`),
  bookings: () => api.get('/api/labs/bookings'),
};

// ─────────────────────────────────────────────
// FAMILY API
// ─────────────────────────────────────────────
export const familyAPI = {
  getGroup: () => api.get('/api/family/group'),
  getMembers: () => api.get('/api/family/group/members'),
  invite: (phone: string, relationship: string) =>
    api.post(`/api/family/group/invite?phone=${phone}&relationship=${relationship}`),
  sosFeed: () => api.get('/api/family/group/sos-feed'),
};

// ─────────────────────────────────────────────
// WebSocket helpers
// ─────────────────────────────────────────────
export const WS_BASE = BASE_URL.replace('http', 'ws');

export function createSOSWebSocket(sosId: string): WebSocket {
  return new WebSocket(`${WS_BASE}/api/sos/ws/${sosId}`);
}

export function createAmbulanceWebSocket(ambId: string): WebSocket {
  return new WebSocket(`${WS_BASE}/api/ambulance/ws/${ambId}`);
}
