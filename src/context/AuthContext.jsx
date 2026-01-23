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
    if (savedAdmin) {
      try {
        const parsedAdmin = JSON.parse(savedAdmin);
        console.log("🔍 Loaded admin from localStorage:", parsedAdmin);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAdmin(parsedAdmin);
      } catch (error) {
        console.error("Error parsing saved admin:", error);
        localStorage.removeItem("admin");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await adminAPI.login({ username, password });
      console.log("🔍 Login response:", response);

      if (response.success) {
        // Store the complete admin object from response
        const adminData = response.admin;
        console.log("✅ Admin data to store:", adminData);

        setAdmin(adminData);
        localStorage.setItem("admin", JSON.stringify(adminData));

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
  };

  // 🔧 FIX: Provide both `admin` and `user` for compatibility
  const value = {
    admin,
    user: admin, // 🎯 Map admin to user for Dashboard compatibility
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
          <p
            style={{
              margin: 0,
              color: "#4b5563",
              fontSize: "16px",
            }}
          >
            🔒 Loading Authentication...
          </p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
