const API_BASE_URL = import.meta.env.VITE_API_URL;

// API utility functions
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      // ...existing code...
      throw new Error(data?.error || "Request failed");
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

  // Update water location
  update: (id, locationData) =>
    apiRequest(`/water-locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(locationData),
    }),

  // Delete water location
  delete: (id) =>
    apiRequest(`/water-locations/${id}`, {
      method: "DELETE",
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
  getRiskAnalysis: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/households/risk-analysis${qs ? `?${qs}` : ""}`);
  },
};

// Barangay API
export const barangayAPI = {
  // Get all barangays
  getAll: () => apiRequest("/barangays"),

  // Get unique barangays from existing water locations
  getFromLocations: () => apiRequest("/barangays/from-locations"),
};

// Analytics API
export const analyticsAPI = {
  getOverview: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/analytics/overview${qs ? `?${qs}` : ""}`);
  },
  getBarangayStats: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/analytics/barangay-stats${qs ? `?${qs}` : ""}`);
  },
  getWaterQualityTrends: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/analytics/water-quality-trends${qs ? `?${qs}` : ""}`);
  },
  getContaminationHeatmap: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/analytics/contamination-heatmap${qs ? `?${qs}` : ""}`);
  },
  getHouseholdCoverage: () => apiRequest("/analytics/household-coverage"),
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
  barangayAPI,
  analyticsAPI,
  imageAPI,
};
