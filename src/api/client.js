// API Client for Investment OS & StartupIQ Backend
import {
  PORTFOLIO_SUMMARY,
  INVESTMENTS_LIST,
  DEAL_ROOM_COMPANIES,
  CAP_TABLE_DATA,
  LEDGER_TRANSACTIONS,
  WATCHLIST_ITEMS,
  DATA_ROOM_DOCUMENTS
} from '../data/investmentData.js';

const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE = `${API_ORIGIN}/api/v1`;

// Token management
export const getAuthToken = () => localStorage.getItem('token') || '';
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
};

export const getRefreshToken = () => localStorage.getItem('refreshToken') || '';
export const setRefreshToken = (token) => {
  if (token) localStorage.setItem('refreshToken', token);
  else localStorage.removeItem('refreshToken');
};

export const getStoredUser = () => {
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) localStorage.setItem('user', JSON.stringify(user));
  else localStorage.removeItem('user');
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

const headers = () => {
  const h = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

async function apiRequest(endpoint, options = {}, fallbackData = null) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { ...headers(), ...(options.headers || {}) }
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP error ${res.status}`);
    }
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    if (fallbackData !== null) {
      return fallbackData;
    }
    console.warn(`API ${endpoint} error:`, err.message);
    throw err;
  }
}

// ========================================================
// STARTUPIQ & INVESTMENT OS API SUITE
// ========================================================
export const api = {
  // ========================================================
  // SUBSCRIPTION & RAZORPAY BILLING (/api/v1/subscription)
  // ========================================================
  subscription: {
    getPlans: () => apiRequest('/subscription/plans'),
    getStatus: () => apiRequest('/subscription/status'),
    createOrder: (planId, billingCycle = 'monthly') => apiRequest('/subscription/create-order', {
      method: 'POST',
      body: JSON.stringify({ planId, billingCycle })
    }),
    verifyPayment: (payload) => apiRequest('/subscription/verify-payment', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    testUpgrade: (planId = 'founder_pro', billingCycle = 'monthly') => apiRequest('/subscription/test-upgrade', {
      method: 'POST',
      body: JSON.stringify({ planId, billingCycle })
    }),
    cancel: () => apiRequest('/subscription/cancel', {
      method: 'POST'
    })
  },

  // ========================================================
  // AUTHENTICATION & SESSIONS (/api/v1/auth)
  // ========================================================
  auth: {
    login: async (credentials) => {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      if (data && data.token) {
        setAuthToken(data.token);
        if (data.refreshToken) setRefreshToken(data.refreshToken);
        if (data.user) setStoredUser(data.user);
      }
      return data;
    },

    register: async (userData) => {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      if (data && data.token) {
        setAuthToken(data.token);
        if (data.refreshToken) setRefreshToken(data.refreshToken);
        if (data.user) setStoredUser(data.user);
      }
      return data;
    },

    getMe: async () => {
      const data = await apiRequest('/auth/me');
      const user = data && (data.user || data);
      if (user && user.role) {
        setStoredUser(user);
      }
      return user;
    },

    logout: async () => {
      try {
        await apiRequest('/auth/logout', { method: 'POST' });
      } finally {
        clearAuth();
      }
    },

    logoutAll: async () => {
      try {
        await apiRequest('/auth/logout-all', { method: 'POST' });
      } finally {
        clearAuth();
      }
    },

    refreshToken: async () => {
      const rf = getRefreshToken();
      if (!rf) throw new Error('No refresh token available');
      const data = await apiRequest('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: rf })
      });
      if (data && data.token) {
        setAuthToken(data.token);
      }
      return data;
    },

    changePassword: (payload) => apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

    forgotPassword: (email) => apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

    resetPassword: (payload) => apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

    getSessions: () => apiRequest('/auth/sessions'),
    revokeSession: (sessionId) => apiRequest(`/auth/sessions/${sessionId}`, {
      method: 'DELETE'
    }),

    saveOnboarding: async (payload) => {
      const data = await apiRequest('/auth/onboarding', {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      if (data) {
        setStoredUser(data);
      }
      return data;
    }
  },

  // ========================================================
  // STARTUP PROFILE & COCKPIT (STARTUPIQ)
  // ========================================================
  getProfile: (ticker) => apiRequest(`/startup-profile/${ticker}`),
  updateProfile: (ticker, data) => apiRequest(`/startup-profile/${ticker}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  getMetrics: (ticker) => apiRequest(`/startup-profile/${ticker}/metrics`),

  // Health Score
  getHealthScore: (ticker, growthRate = 15) => apiRequest(`/startup-health/${ticker}?growthRate=${growthRate}`),

  // Idea Analyzer
  analyzeIdea: (ticker, data) => apiRequest(`/startup-idea-analyzer/${ticker}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getIdeaHistory: (ticker) => apiRequest(`/startup-idea-analyzer/${ticker}/history`),

  // Business Idea Testing
  getHypotheses: (ticker) => apiRequest(`/business-idea-testing/${ticker}/hypotheses`),
  createHypothesis: (ticker, data) => apiRequest(`/business-idea-testing/${ticker}/hypotheses`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getExperiments: (ticker) => apiRequest(`/business-idea-testing/${ticker}/experiments`),
  createExperiment: (ticker, data) => apiRequest(`/business-idea-testing/${ticker}/experiments`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getTestingReadiness: (ticker) => apiRequest(`/business-idea-testing/${ticker}/readiness`),

  // GTM Roadmap
  getGtmSummary: (ticker) => apiRequest(`/gtm-roadmap/${ticker}/summary`),
  getGtmReadiness: (ticker) => apiRequest(`/gtm-roadmap/${ticker}/readiness`),
  getPersonas: (ticker) => apiRequest(`/gtm-roadmap/${ticker}/personas`),
  createPersona: (ticker, data) => apiRequest(`/gtm-roadmap/${ticker}/personas`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getChannels: (ticker) => apiRequest(`/gtm-roadmap/${ticker}/channels`),
  createChannel: (ticker, data) => apiRequest(`/gtm-roadmap/${ticker}/channels`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getRoadmapItems: (ticker) => apiRequest(`/gtm-roadmap/${ticker}/roadmap-items`),
  createRoadmapItem: (ticker, data) => apiRequest(`/gtm-roadmap/${ticker}/roadmap-items`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Financial Model
  getFinancialModel: (ticker) => apiRequest(`/financial-model/${ticker}`),
  calculateFinancialModel: (ticker, overrides = {}) => apiRequest(`/financial-model/${ticker}/calculate`, {
    method: 'POST',
    body: JSON.stringify(overrides)
  }),

  // Metric Relationships
  getMetricRelationships: (ticker) => apiRequest(`/metric-relationships/${ticker}`),

  // 30-Day Action Plan
  getActionPlan: (ticker) => apiRequest(`/action-plan/${ticker}`),

  // AI Prompt Builder
  getPromptTypes: () => apiRequest('/ai-prompt-builder/types'),
  generatePrompt: (ticker, data) => apiRequest(`/ai-prompt-builder/${ticker}/generate`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Business Learning Curriculum
  getLessons: (category, difficulty) => {
    const params = new URLSearchParams();
    if (category && category !== 'ALL') params.append('category', category.toLowerCase());
    if (difficulty && difficulty !== 'ALL') params.append('difficulty', difficulty.toLowerCase());
    return apiRequest(`/learning/lessons?${params.toString()}`);
  },
  getLessonCategories: () => apiRequest('/learning/categories'),
  getLessonById: (id) => apiRequest(`/learning/lessons/${id}`),
  getLearningProgress: (ticker) => apiRequest(`/learning/${ticker}/progress`),
  updateLessonProgress: (ticker, lessonId, data) => apiRequest(`/learning/${ticker}/progress/${lessonId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // ========================================================
  // ACTUAL INVESTMENT MODULE ENDPOINTS
  // ========================================================

  // Investor Portfolio (/api/v1/investments)
  getMyPortfolio: () => apiRequest('/investments/my/portfolio', {}, PORTFOLIO_SUMMARY),
  getMyInvestments: () => apiRequest('/investments/my', {}, INVESTMENTS_LIST),
  getCompanyInvestments: (ticker) => apiRequest(`/investments/company/${ticker}`, {}, INVESTMENTS_LIST),
  createInvestment: (ticker, data) => apiRequest(`/investments/${ticker}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateInvestment: (id, data) => apiRequest(`/investments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteInvestment: (id) => apiRequest(`/investments/${id}`, {
    method: 'DELETE'
  }),

  // Companies & Deal Room (/api/v1/companies)
  getCompanies: () => apiRequest('/companies', {}, DEAL_ROOM_COMPANIES),
  createCompany: (data) => apiRequest('/companies', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  searchCompanies: (query) => apiRequest(`/companies/search?query=${encodeURIComponent(query)}`, {}, DEAL_ROOM_COMPANIES),
  getCompanyByTicker: (ticker) => apiRequest(`/companies/${ticker}`),
  getFunding: (ticker) => apiRequest(`/companies/${ticker}/funding`, {}, CAP_TABLE_DATA),
  updateFunding: (ticker, data) => apiRequest(`/companies/${ticker}/funding`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  getTeamMembers: (ticker) => apiRequest(`/companies/${ticker}/members`),

  // Double-Entry Operational Ledger (/api/v1/ledger)
  getTransactions: (ticker) => apiRequest(`/ledger/${ticker}`, {}, LEDGER_TRANSACTIONS),
  addTransaction: (ticker, data) => apiRequest(`/ledger/${ticker}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteTransaction: (id) => apiRequest(`/ledger/entry/${id}`, {
    method: 'DELETE'
  }),

  // Investor Watchlists (/api/v1/watchlists)
  getMyWatchlist: () => apiRequest('/watchlists', {}, WATCHLIST_ITEMS),
  getWatchlistStatus: (ticker) => apiRequest(`/watchlists/${ticker}/status`, {}, { inWatchlist: true }),
  addToWatchlist: (ticker, note = '') => apiRequest(`/watchlists/${ticker}`, {
    method: 'POST',
    body: JSON.stringify({ note })
  }),
  updateWatchlist: (ticker, note) => apiRequest(`/watchlists/${ticker}`, {
    method: 'PATCH',
    body: JSON.stringify({ note })
  }),
  removeFromWatchlist: (ticker) => apiRequest(`/watchlists/${ticker}`, {
    method: 'DELETE'
  }),

  // Reports & Investor Filings (/api/v1/reports)
  getCompanyReports: (ticker) => apiRequest(`/reports/${ticker}`),
  createReport: (ticker, data) => apiRequest(`/reports/${ticker}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Due Diligence Documents / VDR (/api/v1/upload)
  getCompanyDocuments: (ticker) => apiRequest(`/upload/${ticker}/documents`, {}, DATA_ROOM_DOCUMENTS),
  uploadCompanyDocument: async (ticker, formData) => {
    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/upload/${ticker}/documents`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Upload failed with status ${res.status}`);
    }
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  },
  downloadDocument: (documentId) => apiRequest(`/upload/documents/${documentId}/download`),
  updateDocumentStatus: (documentId, status, reviewNotes) => apiRequest(`/upload/documents/${documentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reviewNotes })
  }),
  deleteDocument: (documentId) => apiRequest(`/upload/documents/${documentId}`, {
    method: 'PATCH'
  }),

  // AI Venture Copilot & Advisory Engine (/api/v1/ai)
  getAIStatus: () => apiRequest('/ai/status'),
  generateAIAnalysis: (payload) => apiRequest('/ai/generate', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  askAICopilot: (payload) => apiRequest('/ai/copilot', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Admin Workspace (/api/v1/users, /api/v1/audit-logs)
  getUsers: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const query = params.toString();
    return apiRequest(`/users${query ? `?${query}` : ''}`);
  },
  getAuditLogs: (limit = 25) => apiRequest(`/audit-logs?limit=${limit}`),
  updateUserRole: (userId, payload) => apiRequest(`/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  }),

  // Founder Competency Assessment
  generateAssessmentTest: (ticker, mode = 'ai') => 
    apiRequest(`/assessments/${ticker}/generate-test?mode=${mode}`, { method: 'POST', body: JSON.stringify({ mode }) }),

  submitAssessmentTest: (ticker, payload) =>
    apiRequest(`/assessments/${ticker}/submit-test`, { method: 'POST', body: JSON.stringify(payload) }),

  getAssessmentHistory: (ticker) =>
    apiRequest(`/assessments/${ticker}`),
};
