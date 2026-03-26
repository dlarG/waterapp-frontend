import React, { createContext, useContext, useState, useEffect } from "react";
import { adminAPI } from "../api/api";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAdmin = localStorage.getItem("admin");
    const savedToken = localStorage.getItem("token"); // ✅ NEW

    // ✅ Only restore session if token exists
    if (savedAdmin && savedToken) {
      try {
        const parsedAdmin = JSON.parse(savedAdmin);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAdmin(parsedAdmin);
      } catch (error) {
        console.error("Error parsing saved admin:", error);
        localStorage.removeItem("admin");
        localStorage.removeItem("token");
      }
    } else {
      // if one exists without the other, clean up
      localStorage.removeItem("admin");
      localStorage.removeItem("token");
    }

    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await adminAPI.login({ username, password });
      console.log("🔍 Login response:", response);

      if (response.success) {
        const adminData = response.admin;

        setAdmin(adminData);
        localStorage.setItem("admin", JSON.stringify(adminData));

        // ✅ SAVE TOKEN so api.js can attach Authorization header
        if (response.token) {
          localStorage.setItem("token", response.token);
        } else {
          // If token is missing, treat as failure because protected endpoints will 401
          return {
            success: false,
            error: "Login token missing from server response.",
          };
        }

        return { success: true, admin: adminData };
      }

      return { success: false, error: response.error };
    } catch (error) {
      console.error("❌ Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("admin");
    localStorage.removeItem("token"); // ✅ NEW
  };

  // 🔧 FIX: Provide both `admin` and `user` for compatibility
  const value = {
    admin,
    user: admin,
    login,
    logout,
    loading,
    isAuthenticated: !!admin,
  };

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(255,255,255,0.95)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e5e7eb",
              borderTop: "4px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 15px",
            }}
          ></div>
          <p style={{ margin: 0, color: "#4b5563", fontSize: "16px" }}>
            🔒 Loading Authentication...
          </p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
