/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { waterLocationAPI } from "../api/api";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import {
  FaWater,
  FaMapMarkerAlt,
  FaFlask,
  FaChartLine,
  FaUser,
  FaSignOutAlt,
  FaMap,
  FaFileAlt,
  FaPlus,
  FaVial,
  FaDatabase,
  FaShieldAlt,
  FaServer,
  FaSatellite,
  FaCheckCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaClock,
  FaBell,
  FaChartBar,
  FaCog,
  FaChevronDown,
  FaUserCircle,
  FaHistory,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // eslint-disable-next-line no-unused-vars
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [stats, setStats] = useState({
    total: 0,
    safe: 0,
    undrinkable: 0,
    hazard: 0,
    pending: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

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

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await waterLocationAPI.getAll();

      if (response.success && response.data) {
        const locationData = response.data;
        setLocations(locationData);
        calculateStats(locationData);
        generateRecentActivity(locationData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const calculateStats = (locationData) => {
    const stats = {
      total: locationData.length,
      safe: 0,
      undrinkable: 0,
      hazard: 0,
      pending: 0,
    };

    locationData.forEach((location) => {
      const hasResults =
        location.coliform_bacteria !== null || location.e_coli !== null;

      if (!hasResults) {
        stats.pending++;
      } else {
        switch (location.water_status) {
          case "safe":
            stats.safe++;
            break;
          case "undrinkable":
            stats.undrinkable++;
            break;
          case "hazard":
            stats.hazard++;
            break;
          default:
            stats.pending++;
        }
      }
    });

    setStats(stats);
  };

  const generateRecentActivity = (locationData) => {
    const activities = [];

    locationData.forEach((location) => {
      if (location.sample_date) {
        activities.push({
          id: location.id,
          type: "sample",
          location: location.full_name,
          status: location.water_status,
          date: new Date(location.sample_date),
          time: location.sample_time,
          bacteria: location.coliform_bacteria,
          ecoli: location.e_coli,
        });
      }
    });

    activities.sort((a, b) => b.date - a.date);
    setRecentActivity(activities.slice(0, 5));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      const timeParts = timeString.split(":");
      const hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "safe":
        return <FaCheckCircle className="w-5 h-5 text-green-500" />;
      case "undrinkable":
        return <FaExclamationTriangle className="w-5 h-5 text-orange-500" />;
      case "hazard":
        return <FaExclamationCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FaClock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "safe":
        return "bg-green-100 text-green-800";
      case "undrinkable":
        return "bg-orange-100 text-orange-800";
      case "hazard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">
            Loading Dashboard...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Fetching water quality data
          </p>
        </div>
      </div>
    );
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
            ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}
          `}
          >
            {" "}
            <Sidebar
              collapsed={sidebarCollapsed}
              isMobile={isMobile}
              onClose={closeSidebar}
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
              {" "}
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
                    Dashboard
                  </h1>
                  <p className="text-sm text-gray-600">
                    Welcome back, {user?.full_name || "Admin"}
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
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Safe Water */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Safe Water</p>
                        <h3 className="text-3xl font-bold text-gray-900">
                          {stats.safe}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Drinkable sources</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.total > 0
                        ? ((stats.safe / stats.total) * 100).toFixed(1)
                        : 0}
                      %
                    </div>
                    <div className="text-xs text-gray-500">Safe</div>
                  </div>
                </div>
              </motion.div>

              {/* Undrinkable Water */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Undrinkable</p>
                        <h3 className="text-3xl font-bold text-gray-900">
                          {stats.undrinkable}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Needs treatment</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.total > 0
                        ? ((stats.undrinkable / stats.total) * 100).toFixed(1)
                        : 0}
                      %
                    </div>
                    <div className="text-xs text-gray-500">Warning</div>
                  </div>
                </div>
              </motion.div>

              {/* Hazardous Water */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Hazardous</p>
                        <h3 className="text-3xl font-bold text-gray-900">
                          {stats.hazard}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Unsafe sources</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      {stats.total > 0
                        ? ((stats.hazard / stats.total) * 100).toFixed(1)
                        : 0}
                      %
                    </div>
                    <div className="text-xs text-gray-500">Danger</div>
                  </div>
                </div>
              </motion.div>

              {/* Pending Tests */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Pending Tests</p>
                        <h3 className="text-3xl font-bold text-gray-900">
                          {stats.pending}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Awaiting samples</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-600">
                      {stats.total > 0
                        ? ((stats.pending / stats.total) * 100).toFixed(1)
                        : 0}
                      %
                    </div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-2"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Quick Actions
                        </h2>
                        <p className="text-sm text-gray-600">
                          Manage your water monitoring system
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/admin/map")}
                        className="cursor-pointer group bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl p-5 text-left transition-all duration-300 border border-blue-100"
                      >
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-bold text-gray-900 text-l">
                              View Map
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Interactive monitoring map
                            </p>
                          </div>
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer group bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl p-5 text-left transition-all duration-300 border border-blue-100"
                      >
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-bold text-gray-900 text-l">
                              Reports
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Generate quality reports
                            </p>
                          </div>
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/admin/add-location")}
                        className="cursor-pointer group bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl p-5 text-left transition-all duration-300 border border-blue-100"
                      >
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-bold text-gray-900 text-l">
                              Add Location
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              New monitoring point
                            </p>
                          </div>
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer group bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl p-5 text-left transition-all duration-300 border border-blue-100"
                      >
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-bold text-gray-900 text-l">
                              Lab Results
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Update test results
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Recent Activity
                        </h2>
                        <p className="text-sm text-gray-600">
                          Latest water quality updates
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-4 overflow-y-auto"
                    style={{ maxHeight: "200px" }}
                  >
                    <div className="space-y-4">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((activity, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                          >
                            <div className="flex-shrink-0">
                              {getStatusIcon(activity.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                Sample at {activity.location}
                              </p>
                              <div className="flex items-center space-x-3 mt-1">
                                <span className="text-xs text-gray-500">
                                  {formatDate(activity.date)} •{" "}
                                  {formatTime(activity.time)}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    activity.status
                                  )}`}
                                >
                                  {activity.status.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xs text-gray-600">
                                  <span className="font-medium">
                                    Coliform:{" "}
                                  </span>
                                  <span
                                    className={
                                      activity.bacteria
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }
                                  >
                                    {activity.bacteria === null
                                      ? "Not tested"
                                      : activity.bacteria
                                      ? "Present"
                                      : "Absent"}
                                  </span>
                                </span>
                                <span className="text-xs text-gray-600">
                                  <span className="font-medium">E. Coli: </span>
                                  <span
                                    className={
                                      activity.ecoli
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }
                                  >
                                    {activity.ecoli === null
                                      ? "Not tested"
                                      : activity.ecoli
                                      ? "Present"
                                      : "Absent"}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaChartLine className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-600 font-medium">
                            No recent activity
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Water quality updates will appear here
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* System Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        System Status
                      </h2>
                      <p className="text-sm text-gray-600">
                        Monitoring infrastructure health
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Map Service */}
                  <div className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                        <FaSatellite className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Map Service</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Mapbox GL JS
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Database */}
                  <div className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                        <FaDatabase className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Database</h4>
                        <p className="text-sm text-gray-600 mt-1">PostgreSQL</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Connected
                      </span>
                    </div>
                  </div>

                  {/* Authentication */}
                  <div className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                        <FaShieldAlt className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          Authentication
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">JWT Tokens</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Secure
                      </span>
                    </div>
                  </div>

                  {/* API Server */}
                  <div className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                        <FaServer className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">API Server</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Flask Backend
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Running
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
