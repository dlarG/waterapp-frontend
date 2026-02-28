import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaChevronDown,
  FaUserCircle,
  FaHistory,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

const Header = ({
  title = "Dashboard",
  subtitle = "",
  onToggleSidebar,
  onToggleSidebarCollapse,
  isMobile = false,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
              aria-label="Toggle sidebar"
            >
              <FaBars className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Desktop sidebar collapse button */}
          {!isMobile && (
            <button
              onClick={onToggleSidebarCollapse}
              className="hidden md:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Collapse sidebar"
            >
              <FaBars className="w-5 h-5 text-gray-600" />
            </button>
          )}

          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
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
  );
};

export default Header;
