/**
 * Base API client for backend integration.
 * Configure base URL, auth headers, and interceptors here.
 */

const getBaseUrl = () => {
  if (import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  return '/api' // relative for same-origin or proxy
}

/**
 * Default fetch options. Extend with auth token when AuthProvider is added.
 */
function getDefaultOptions() {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  // Future: const token = getAuthToken(); if (token) headers.Authorization = `Bearer ${token}`
  return { headers }
}

/**
 * HTTP client. Use for all API calls to support a single place for:
 * - Base URL and env config
 * - Auth injection
 * - Error handling and refresh logic
 */
export async function apiClient(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${getBaseUrl()}${endpoint}`
  const config = {
    ...getDefaultOptions(),
    ...options,
    headers: { ...getDefaultOptions().headers, ...options.headers },
  }
  const response = await fetch(url, config)
  if (!response.ok) {
    const error = new Error(response.statusText || 'Request failed')
    error.status = response.status
    error.response = response
    throw error
  }
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return response.json()
  }
  return response.text()
}

export const api = {
  get: (endpoint, options) => apiClient(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    apiClient(endpoint, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (endpoint, body, options) =>
    apiClient(endpoint, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: (endpoint, body, options) =>
    apiClient(endpoint, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (endpoint, options) => apiClient(endpoint, { ...options, method: 'DELETE' }),
}
