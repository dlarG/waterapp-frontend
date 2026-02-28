import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children, title = "Dashboard", subtitle = "" }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!isAuthenticated) {
    return null; // or loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - Hidden on mobile, conditionally shown */}
        <div
          className={`
            ${isMobile ? "fixed inset-0 z-50 pointer-events-none" : "relative"}
          `}
        >
          {/* Overlay for mobile */}
          {isMobile && sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-auto"
              onClick={closeSidebar}
            />
          )}

          {/* Sidebar */}
          <div
            className={`
              ${
                isMobile
                  ? "fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ease-in-out pointer-events-auto"
                  : "relative"
              }
              ${
                isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"
              }
            `}
          >
            <Sidebar
              collapsed={sidebarCollapsed}
              isMobile={isMobile}
              onClose={closeSidebar}
            />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300">
          {/* Header */}
          <Header
            title={title}
            subtitle={subtitle}
            onToggleSidebar={toggleSidebar}
            onToggleSidebarCollapse={toggleSidebarCollapse}
            isMobile={isMobile}
          />

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
