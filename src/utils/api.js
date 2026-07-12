/**
 * API fetch helper utility to communicate with the Express backend.
 * Automatically injects the JWT authorization token and handles errors.
 */

// Storage Keys
const TOKEN_KEY = 'assetflow_token';
const USER_KEY = 'assetflow_user';

/**
 * Saves authentication credentials to local storage
 * @param {string} token 
 * @param {object} user 
 */
export const setAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Retrieves authentication token
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Retrieves user profile object
 * @returns {object|null}
 */
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

/**
 * Clears authentication credentials from storage
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Helper to check if a user is currently authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * General purpose fetch wrapper for API communication
 * @param {string} endpoint - The relative API path (e.g. '/auth/login', '/departments')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<any>}
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('/') ? `/api${endpoint}` : `/api/${endpoint}`;

  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...options,
    headers
  };

  if (options.body) {
    if (isFormData) {
      fetchOptions.body = options.body;
    } else if (typeof options.body === 'object') {
      fetchOptions.body = JSON.stringify(options.body);
    }
  }

  try {
    const response = await fetch(url, fetchOptions);

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      if (response.status === 401) {
        clearAuth();
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login?expired=true';
        }
      }

      const errorMessage = data?.message || `HTTP error! Status: ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Fetch Error [${url}]:`, error.message);
    throw error;
  }
};
