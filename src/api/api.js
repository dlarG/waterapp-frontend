const API_BASE_URL = "http://localhost:5000/api";

// API utility functions
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

// Water locations API
export const waterLocationAPI = {
  // Get all water locations
  getAll: () => apiRequest("/water-locations"),

  // Get specific water location
  getById: (id) => apiRequest(`/water-locations/${id}`),

  // Get map bounds for Maasin
  getMapBounds: () => apiRequest("/map-bounds"),
};

// Health check
export const healthAPI = {
  check: () => apiRequest("/health"),
};

// Admin API
export const adminAPI = {
  login: (credentials) =>
    apiRequest("/admin/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  // NEW: Register endpoint
  register: (adminData) =>
    apiRequest("/admin/register", {
      method: "POST",
      body: JSON.stringify(adminData),
    }),
};

export default {
  waterLocationAPI,
  healthAPI,
  adminAPI,
};
