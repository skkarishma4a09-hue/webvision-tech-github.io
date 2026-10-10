const API_BASE = '/api';

// ─────────────────────────────────────────────
// Token management (for legacy / API client use)
// Primary auth uses secure HttpOnly cookies set by server.
// ─────────────────────────────────────────────
function getAuthToken(): string | null {
  return localStorage.getItem('pcai_auth_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('pcai_auth_token', token);
  } else {
    localStorage.removeItem('pcai_auth_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for HttpOnly session cookie
  });

  const resData = await response.json().catch(() => ({}));

  if (!response.ok || resData.success === false) {
    const errorObj = resData.error || {};
    const err: any = new Error(errorObj.message || resData.message || `HTTP ${response.status} Request failed`);
    err.code = errorObj.code;
    err.details = errorObj.details;
    err.status = response.status;
    throw err;
  }

  return resData as T;
}

export const api = {
  // ─── OTP Authentication (primary) ─────────────────────────
  requestOtp: (email: string) =>
    request<any>('/auth/request-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyOtp: (email: string, otp: string) =>
    request<any>('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  resendOtp: (email: string) =>
    request<any>('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) }),

  // ─── Session ──────────────────────────────────────────────
  getCurrentUser: () => request<any>('/auth/me'),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),
  logoutAll: () => request<any>('/auth/logout', { method: 'POST', body: JSON.stringify({ allSessions: true }) }),

  // ─── Legacy (kept for compatibility) ──────────────────────
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email: string) => request<any>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (data: any) => request<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

  // ─── Profile & Sub-sections ───────────────────────────────
  getProfile: () => request<any>('/profile'),
  updateProfile: (data: any) => request<any>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  addSkill: (data: any) => request<any>('/profile/skills', { method: 'POST', body: JSON.stringify(data) }),
  removeSkill: (id: string) => request<any>(`/profile/skills/${id}`, { method: 'DELETE' }),
  addEducation: (data: any) => request<any>('/profile/education', { method: 'POST', body: JSON.stringify(data) }),
  deleteEducation: (id: string) => request<any>(`/profile/education/${id}`, { method: 'DELETE' }),
  addExperience: (data: any) => request<any>('/profile/experience', { method: 'POST', body: JSON.stringify(data) }),
  deleteExperience: (id: string) => request<any>(`/profile/experience/${id}`, { method: 'DELETE' }),
  addProject: (data: any) => request<any>('/profile/projects', { method: 'POST', body: JSON.stringify(data) }),
  deleteProject: (id: string) => request<any>(`/profile/projects/${id}`, { method: 'DELETE' }),
  uploadResume: (data: any) => request<any>('/profile/resumes', { method: 'POST', body: JSON.stringify(data) }),
  deleteResume: (id: string) => request<any>(`/profile/resumes/${id}`, { method: 'DELETE' }),

  // ─── Jobs ─────────────────────────────────────────────────
  getJobs: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/jobs${query}`);
  },
  getJobById: (id: string) => request<any>(`/jobs/${id}`),
  createJob: (data: any) => request<any>('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  updateJob: (id: string, data: any) => request<any>(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJob: (id: string) => request<any>(`/jobs/${id}`, { method: 'DELETE' }),

  // ─── Saved Jobs ───────────────────────────────────────────
  saveJob: (jobId: string) => request<any>('/saved-jobs', { method: 'POST', body: JSON.stringify({ jobId }) }),
  unsaveJob: (jobId: string) => request<any>(`/saved-jobs/${jobId}`, { method: 'DELETE' }),
  getSavedJobs: () => request<any>('/saved-jobs'),

  // ─── Applications ─────────────────────────────────────────
  applyToJob: (data: any) => request<any>('/applications', { method: 'POST', body: JSON.stringify(data) }),
  getApplications: () => request<any>('/applications'),
  updateApplicationStatus: (id: string, data: any) =>
    request<any>(`/applications/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // ─── Job Alerts ───────────────────────────────────────────
  createAlert: (data: any) => request<any>('/alerts', { method: 'POST', body: JSON.stringify(data) }),
  getAlerts: () => request<any>('/alerts'),
  updateAlert: (id: string, data: any) => request<any>(`/alerts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAlert: (id: string) => request<any>(`/alerts/${id}`, { method: 'DELETE' }),

  // ─── AI Studio ────────────────────────────────────────────
  generateAiContent: (data: {
    toolId: string;
    input: string;
    settings: { tone: string; length: string; language: string };
    action?: string;
  }) => request<any>('/ai/generate', { method: 'POST', body: JSON.stringify(data) }),
  getAiHistory: () => request<any>('/ai/history'),
  deleteAiGeneration: (id: string) => request<any>(`/ai/history/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // ─── Marketplace discovery ────────────────────────────────
  getCreators: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/creators${query}`);
  },
  getCreator: (id: string) => request<any>(`/creators/${encodeURIComponent(id)}`),
  getServices: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/services${query}`);
  },
  getService: (id: string) => request<any>(`/services/${encodeURIComponent(id)}`),
  toggleFavoriteService: (id: string) =>
    request<any>(`/favorites/services/${encodeURIComponent(id)}`, { method: 'POST' }),
  toggleFavoriteCreator: (id: string) =>
    request<any>(`/favorites/creators/${encodeURIComponent(id)}`, { method: 'POST' }),
  getFavorites: () => request<any>('/favorites'),
  toggleFollowCreator: (id: string) =>
    request<any>(`/follows/${encodeURIComponent(id)}`, { method: 'POST' }),
  createOrder: (data: { serviceId: string; packageName: string; addons?: { label: string; price: number }[]; requirements?: string }) =>
    request<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: (role: 'buyer' | 'seller' = 'buyer') =>
    request<any>(`/orders?role=${role}`),
  updateOrderStatus: (id: string, data: { status: string; note?: string }) =>
    request<any>(`/orders/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  getProjects: (role: 'client' | 'creator' = 'client') =>
    request<any>(`/projects?role=${role}`),
  getCreatorAnalytics: (days = 30) =>
    request<any>(`/analytics/creator?days=${days}`),
  searchMarketplace: (query: string) =>
    request<any>(`/search?query=${encodeURIComponent(query)}`),

  // ─── Messaging ───────────────────────────────────────────
  getConversations: () => request<any>('/chat/conversations'),
  startConversation: (userId: string) =>
    request<any>('/chat/conversations', { method: 'POST', body: JSON.stringify({ userId }) }),
  getMessages: (conversationId: string) =>
    request<any>(`/chat/conversations/${encodeURIComponent(conversationId)}/messages`),
  sendMessage: (conversationId: string, text: string) =>
    request<any>(`/chat/conversations/${encodeURIComponent(conversationId)}/messages`, { method: 'POST', body: JSON.stringify({ text }) }),
  markConversationRead: (conversationId: string) =>
    request<any>(`/chat/conversations/${encodeURIComponent(conversationId)}/read`, { method: 'POST' }),

  // ─── Notifications ───────────────────────────────────────
  getNotifications: () => request<any>('/notifications'),
  markNotificationRead: (id: string) =>
    request<any>(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () =>
    request<any>('/notifications/read-all', { method: 'PATCH' }),
  deleteNotification: (id: string) =>
    request<any>(`/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
