const API_BASE_URL = import.meta.env.VITE_API_URL;

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

  // Create new water location
  create: (locationData) =>
    apiRequest("/water-locations", {
      method: "POST",
      body: JSON.stringify(locationData),
    }),

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

export const householdAPI = {
  // Get all households
  getAll: () => apiRequest("/households"),

  // Get household risk analysis
  getRiskAnalysis: () => apiRequest("/households/risk-analysis"),
};

// Image upload API
export const imageAPI = {
  // Upload image for water location
  upload: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/upload-image`, {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      return data;
    } catch (error) {
      console.error("Image Upload Error:", error);
      throw error;
    }
  },
};

export default {
  waterLocationAPI,
  healthAPI,
  adminAPI,
  householdAPI,
  imageAPI,
};
