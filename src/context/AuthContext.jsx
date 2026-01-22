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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAdmin(JSON.parse(savedAdmin));
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
      if (response.success) {
        setAdmin(response.admin);
        localStorage.setItem("admin", JSON.stringify(response.admin));
        return { success: true, admin: response.admin };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("admin");
  };

  const value = {
    admin,
    login,
    logout,
    loading,
    isAuthenticated: !!admin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
