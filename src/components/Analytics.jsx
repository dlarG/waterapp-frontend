/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaChartBar,
  FaWater,
  FaHome,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaQuestionCircle,
  FaMapMarkerAlt,
  FaUsers,
  FaToilet,
  FaArrowUp,
  FaArrowDown,
  FaDownload,
  FaCalendar,
  FaFilter,
  FaChartLine,
  FaChartPie,
  FaChartArea,
  FaSync,
  FaEye,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";
import Layout from "./Layout";
import { analyticsAPI } from "../api/api";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [barangayStats, setBarangayStats] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [contaminationData, setContaminationData] = useState([]);
  const [coverageData, setCoverageData] = useState([]);
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedBarangay, setSelectedBarangay] = useState("all");
  const [chartType, setChartType] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [resultMode, setResultMode] = useState("quantitative");
  // Colors for charts
  const COLORS = {
    safe: "#10b981",
    warning: "#f59e0b",
    undrinkable: "#ef4444",
    notTested: "#9ca3af",
    high: "#dc2626",
    medium: "#f97316",
    low: "#3b82f6",
  };

  useEffect(() => {
    fetchAllData();
  }, [timeRange, resultMode]);

  useEffect(() => {
    fetchAllData();
  }, [timeRange]);

  const fetchAllData = async () => {
    setRefreshing(true);
    setError(null);
    try {
      console.log("🔍 Fetching analytics data...");

      const params = { mode: resultMode };

      try {
        const overviewResponse = await analyticsAPI.getOverview(params);
        if (overviewResponse.success) setOverviewData(overviewResponse.data);
      } catch (err) {
        console.error("❌ Overview fetch failed:", err);
      }

      try {
        const barangayResponse = await analyticsAPI.getBarangayStats(params);
        if (barangayResponse.success) setBarangayStats(barangayResponse.data);
      } catch (err) {
        console.error("❌ Barangay stats fetch failed:", err);
      }

      try {
        const trendsResponse = await analyticsAPI.getWaterQualityTrends(params);
        if (trendsResponse.success) setTrendsData(trendsResponse.data);
      } catch (err) {
        console.error("❌ Trends fetch failed:", err);
      }

      try {
        const contaminationResponse =
          await analyticsAPI.getContaminationHeatmap(params);
        if (contaminationResponse.success)
          setContaminationData(contaminationResponse.data);
      } catch (err) {
        console.error("❌ Contamination fetch failed:", err);
      }

      try {
        const coverageResponse = await analyticsAPI.getHouseholdCoverage();
        if (coverageResponse.success) setCoverageData(coverageResponse.data);
      } catch (err) {
        console.error("❌ Coverage fetch failed:", err);
      }
    } catch (error) {
      console.error("❌ Error fetching analytics data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Prepare pie chart data for water quality distribution
  const getPieData = () => {
    if (!overviewData) return [];
    return [
      {
        name: "Safe",
        value: overviewData.water_locations.safe || 0,
        color: COLORS.safe,
      },
      {
        name: "Warning",
        value: overviewData.water_locations.warning || 0,
        color: COLORS.warning,
      },
      {
        name: "Undrinkable",
        value: overviewData.water_locations.undrinkable || 0,
        color: COLORS.undrinkable,
      },
      {
        name: "Not Tested",
        value: overviewData.water_locations.not_tested || 0,
        color: COLORS.notTested,
      },
    ].filter((item) => item.value > 0); // Only show non-zero values
  };

  // Prepare toilet coverage data
  const getToiletCoverageData = () => {
    if (!overviewData) return [];
    return [
      {
        name: "With Toilet",
        value: overviewData.households.with_toilet || 0,
        color: COLORS.safe,
      },
      {
        name: "Without Toilet",
        value: overviewData.households.without_toilet || 0,
        color: COLORS.undrinkable,
      },
    ].filter((item) => item.value > 0);
  };

  // Filter barangay data
  const filteredBarangayStats =
    selectedBarangay === "all"
      ? barangayStats
      : barangayStats.filter((b) => b.name === selectedBarangay);

  if (loading) {
    return (
      <Layout title="Analytics Dashboard" subtitle="Loading analytics data...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        title="Analytics Dashboard"
        subtitle="Error loading analytics data"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">
              ⚠️ Error Loading Data
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchAllData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Analytics Dashboard"
      subtitle="Comprehensive analysis of water quality and household data in Maasin City"
    >
      <div className="p-4 md:p-6 space-y-6">
        {/* Header Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
        >
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-800">
              Analytics Overview
            </h2>
            <button
              onClick={fetchAllData}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh Data"
            >
              <FaSync
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={resultMode}
              onChange={(e) => setResultMode(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              title="Switch analytics between qualitative/quantitative results"
            >
              <option value="qualitative">
                Quantitative (Bacteriological Exam)
              </option>
              <option value="quantitative">Qualitative (Colilert)</option>
            </select>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>

            <select
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Barangays</option>
              {barangayStats.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Chart Type Selector */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex space-x-2">
            {[
              { id: "overview", label: "Overview", icon: FaChartPie },
              { id: "trends", label: "Trends", icon: FaChartLine },
              { id: "barangay", label: "Barangay Stats", icon: FaChartBar },
              { id: "coverage", label: "Coverage", icon: FaChartArea },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setChartType(type.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  chartType === type.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <type.icon className="w-4 h-4" />
                <span className="text-sm">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Chart 1: Water Quality Distribution */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              Water Quality Distribution
            </h3>
            {getPieData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getPieData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No water quality data available
              </div>
            )}
          </motion.div>

          {/* Chart 3: Water Quality Trends Over Time */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              Water Quality Trends
            </h3>
            {trendsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="safe"
                    stroke={COLORS.safe}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="warning"
                    stroke={COLORS.warning}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="undrinkable"
                    stroke={COLORS.undrinkable}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No trend data available
              </div>
            )}
          </motion.div>

          {/* Chart 4: Barangay Risk Comparison */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              Barangay Risk Comparison
            </h3>
            {filteredBarangayStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={filteredBarangayStats.slice(0, 10)}
                  layout="vertical"
                  margin={{ left: 10, right: 15 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="undrinkable"
                    stackId="a"
                    fill={COLORS.undrinkable}
                    name="Undrinkable"
                  />
                  <Bar
                    dataKey="warning"
                    stackId="a"
                    fill={COLORS.warning}
                    name="Warning"
                  />
                  <Bar
                    dataKey="safe"
                    stackId="a"
                    fill={COLORS.safe}
                    name="Safe"
                  />
                  <Bar
                    dataKey="not_tested"
                    stackId="a"
                    fill={COLORS.notTested}
                    name="Not Tested"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No barangay data available
              </div>
            )}
          </motion.div>
        </div>

        {/* Detailed Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaEye className="w-5 h-5 text-blue-600 mr-2" />
              Detailed Barangay Statistics
            </h3>
          </div>
          <div className="overflow-x-auto">
            {filteredBarangayStats.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Barangay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Total Sources
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Safe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Warning
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Undrinkable
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Not Tested
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBarangayStats.map((barangay, index) => (
                    <motion.tr
                      key={barangay.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {barangay.name}
                      </td>
                      <td className="px-6 py-4">
                        {barangay.total_locations || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-green-600 font-medium">
                          {barangay.safe || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-yellow-600 font-medium">
                          {barangay.warning || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-red-600 font-medium">
                          {barangay.undrinkable || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 font-medium">
                          {barangay.not_tested || 0}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No barangay statistics available
              </div>
            )}
          </div>
        </motion.div>

        {/* Export Button */}
        <div className="flex justify-end">
          <button className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <FaDownload className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
