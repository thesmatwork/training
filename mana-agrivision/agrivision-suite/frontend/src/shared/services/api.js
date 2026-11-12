const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

export function getToken() {
  return localStorage.getItem('mana_token');
}

export function setSession(token, user) {
  if (!token) throw new Error('The backend did not return an access token.');
  localStorage.setItem('mana_token', token);
  localStorage.setItem('mana_user', JSON.stringify(user || {}));
}

export function clearSession() {
  localStorage.removeItem('mana_token');
  localStorage.removeItem('mana_user');
}

function normalizeApiPath(path) {
  // The FastAPI resource router names soil records `/soil`; the UI label is `/soil-irrigation`.
  return path.replace(/^\/api\/v1\/soil-irrigation(?=\/|\\?|$)/, '/api/v1/soil');
}

export async function api(path, options = {}) {
  const headers = { Accept: 'application/json', ...(options.headers || {}) };
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE}${normalizeApiPath(path)}`, {
      ...options,
      headers
    });
  } catch {
    throw new Error(`Cannot reach the Mana Polam backend at ${API_BASE}. Start FastAPI and check VITE_API_BASE_URL and CORS.`);
  }

  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : await response.text().catch(() => '');

  if (!response.ok) {
    const detail = typeof payload === 'string'
      ? payload
      : (payload.detail || payload.message || payload.error);
    throw new Error(detail || `Backend request failed (${response.status}).`);
  }
  return payload;
}

export function getApiBaseUrl() {
  return API_BASE;
}
