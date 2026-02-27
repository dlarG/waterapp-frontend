/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import {
  FaBell,
  FaChevronDown,
  FaUserCircle,
  FaHistory,
  FaSignOutAlt,
  FaBars,
  FaCog,
} from "react-icons/fa";

const AdminLayout = ({
  children,
  title,
  subtitle,
  currentView = "dashboard",
  onNavigate,
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
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

  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  // Map view to path for sidebar active state
  const getPathFromView = (view) => {
    const viewToPathMap = {
      dashboard: "/dashboard",
      map: "/admin/map",
      "water-sources": "/admin/locations",
      analytics: "/admin/analytics",
      reports: "/admin/reports",
      users: "/admin/users",
      activity: "/admin/activity",
      settings: "/admin/settings",
    };
    return viewToPathMap[view] || "/dashboard";
  };

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
            ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}
          `}
          >
            {" "}
            <Sidebar
              collapsed={sidebarCollapsed}
              isMobile={isMobile}
              onClose={closeSidebar}
              onNavigate={onNavigate}
              currentPath={getPathFromView(currentView)}
            />
          </div>
        </div>

        {/* Main Content */}
        <main
          className={`
          flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300
        `}
        >
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
                  aria-label="Toggle sidebar"
                >
                  <FaBars className="w-5 h-5 text-gray-600" />
                </button>

                {/* Desktop sidebar collapse button */}
                <button
                  onClick={toggleSidebarCollapse}
                  className="hidden md:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Collapse sidebar"
                >
                  <FaBars className="w-5 h-5 text-gray-600" />
                </button>

                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {title || "Dashboard"}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {subtitle || `Welcome back, ${user?.full_name || "Admin"}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                  <FaBell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="cursor-pointer flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                      {user?.username?.[0]?.toUpperCase() || "A"}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-700">
                        {user?.full_name || "Admin User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.username || "admin"}
                      </p>
                    </div>
                    <FaChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.full_name || "Admin User"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {user?.email || "admin@example.com"}
                          </p>
                        </div>
                        <div className="p-2">
                          <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <FaUserCircle className="w-4 h-4 flex-shrink-0" />
                            <span>Profile Settings</span>
                          </button>
                          <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <FaHistory className="w-4 h-4 flex-shrink-0" />
                            <span>Activity Log</span>
                          </button>
                          <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <FaCog className="w-4 h-4 flex-shrink-0" />
                            <span>Settings</span>
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                          >
                            <FaSignOutAlt className="w-4 h-4 flex-shrink-0" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
