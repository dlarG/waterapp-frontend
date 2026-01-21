/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { waterLocationAPI } from "../api/api";
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
} from "react-icons/fa";

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // eslint-disable-next-line no-unused-vars
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
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

    // Sort by date (most recent first) and take latest 5
    activities.sort((a, b) => b.date - a.date);
    setRecentActivity(activities.slice(0, 5));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="sticky bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img
                  src="images/logo/logo-circled.png"
                  alt="Safewater logo"
                  className="w-13 h-13 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold">SafeWater</h1>
                  <p className="text-sm opacity-90">Maasin, Southern Leyte</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {user?.username?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <p className="text-sm font-medium">Welcome back,</p>
                  <p className="font-bold">{user?.username || "Admin"}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all duration-300"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FaCheckCircle className="w-6 h-6 text-green-600" />
                  </div>
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
          </div>

          {/* Undrinkable Water */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <FaExclamationTriangle className="w-6 h-6 text-orange-600" />
                  </div>
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
          </div>

          {/* Hazardous Water */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <FaExclamationCircle className="w-6 h-6 text-red-600" />
                  </div>
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
          </div>

          {/* Pending Tests */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <FaClock className="w-6 h-6 text-gray-600" />
                  </div>
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
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
                    <FaBell className="w-5 h-5 text-white" />
                  </div>
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
                  <button
                    onClick={() => navigate("/map")}
                    className="group bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl p-5 text-left transition-all duration-300 transform hover:-translate-y-1 border border-blue-100"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <FaMap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">View Map</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Interactive monitoring map
                        </p>
                      </div>
                    </div>
                  </button>

                  <button className="group bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl p-5 text-left transition-all duration-300 transform hover:-translate-y-1 border border-blue-100">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <FaChartBar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Reports</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Generate quality reports
                        </p>
                      </div>
                    </div>
                  </button>

                  <button className="group bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl p-5 text-left transition-all duration-300 transform hover:-translate-y-1 border border-blue-100">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <FaPlus className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          Add Location
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          New monitoring point
                        </p>
                      </div>
                    </div>
                  </button>

                  <button className="group bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl p-5 text-left transition-all duration-300 transform hover:-translate-y-1 border border-blue-100">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <FaVial className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Lab Results</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Update test results
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
                    <FaChartLine className="w-5 h-5 text-white" />
                  </div>
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

              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 hover:bg-blue-50 rounded-lg transition-colors duration-200"
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
                            <span className="text-xs">
                              <span className="font-medium">Coliform: </span>
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
                            <span className="text-xs">
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
                      </div>
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
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
                  <FaCog className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    System Status
                  </h2>
                  <p className="text-sm text-gray-600">
                    Monitoring infrastructure health
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">System Online</span>
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
                    <p className="text-sm text-gray-600 mt-1">Mapbox GL JS</p>
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
                    <h4 className="font-bold text-gray-900">Authentication</h4>
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
                    <p className="text-sm text-gray-600 mt-1">Flask Backend</p>
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
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
                <FaWater className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Water Quality Monitor
                </p>
                <p className="text-sm text-gray-600">
                  Maasin, Southern Leyte © 2024
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span className="text-gray-900 font-medium">{stats.total}</span>{" "}
              monitoring locations •
              <span className="text-green-600 font-medium ml-2">
                {stats.safe}
              </span>{" "}
              safe •
              <span className="text-orange-600 font-medium ml-2">
                {stats.undrinkable}
              </span>{" "}
              warning •
              <span className="text-red-600 font-medium ml-2">
                {stats.hazard}
              </span>{" "}
              hazardous
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
