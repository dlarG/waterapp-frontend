/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaMap,
  FaChartBar,
  FaWater,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaUsers,
  FaBell,
  FaHistory,
  FaTimes,
} from "react-icons/fa";

const Sidebar = ({ collapsed = false, isMobile = false, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: FaHome, label: "Dashboard", path: "/dashboard" },
    { icon: FaMap, label: "Map View", path: "/admin/map" },
    { icon: FaWater, label: "Water Sources", path: "/admin/locations" },
    { icon: FaChartBar, label: "Analytics", path: "/admin/analytics" },
    { icon: FaFileAlt, label: "Reports", path: "/admin/reports" },
    { icon: FaUsers, label: "Users", path: "/admin/users" },
    { icon: FaHistory, label: "Activity Log", path: "/admin/activity" },
    { icon: FaCog, label: "Settings", path: "/admin/settings" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleLogout = async () => {
    // Add your logout logic here
    navigate("/auth");
  };

  return (
    <aside
      className={`h-screen flex flex-col bg-white shadow-xl transition-all duration-300 ${
        collapsed ? "w-[70px]" : "w-[280px]"
      }`}
    >
      {/* Logo Area with Close Button for Mobile */}
      <div
        className={`flex items-center border-b border-gray-200 ${
          collapsed ? "justify-center p-4" : "justify-between p-5"
        }`}
      >
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "space-x-3"
          }`}
        >
          <img
            src="/images/logo/cropped_circle_image.png"
            alt="MWAVE Logo"
            className="w-10 h-10 rounded-full border-2 border-blue-200"
          />
          {!collapsed && (
            <div>
              <h3 className="font-bold text-sm text-gray-800">M-W.A.V.E</h3>
              <p className="text-xs text-gray-500">Maasin Water Analysis</p>
            </div>
          )}
        </div>

        {/* Close button for mobile */}
        {isMobile && !collapsed && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-3">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;

            return (
              <motion.li
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`cursor-pointer w-full flex items-center ${
                    collapsed ? "justify-center px-3" : "space-x-3 px-4"
                  } py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </button>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`cursor-pointer w-full flex items-center ${
            collapsed ? "justify-center px-3" : "space-x-3 px-4"
          } py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-300`}
          title={collapsed ? "Logout" : undefined}
        >
          <FaSignOutAlt className="w-5 h-5 flex-shrink-0" />
          {!collapsed && (
            <span className="text-sm font-medium whitespace-nowrap">
              Logout
            </span>
          )}
        </button>

        {!collapsed && (
          <div className="mt-4 px-4 py-3 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <FaBell className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-xs text-gray-500">System Status</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="text-xs text-gray-600">
                All systems operational
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
