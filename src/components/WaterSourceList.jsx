/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaCalendar,
  FaClock,
  FaSearch,
  FaFilter,
  FaEye,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaQuestionCircle,
} from "react-icons/fa";
import { waterLocationAPI } from "../api/api";
import Layout from "./Layout";

// Edit Form Component
const EditForm = ({ location, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    full_name: location.full_name || "",
    barangay: location.barangay || "",
    latitude: location.latitude || "",
    longitude: location.longitude || "",
    coliform_bacteria: location.coliform_bacteria,
    e_coli: location.e_coli,
    sample_date: location.sample_date || "",
    sample_time: location.sample_time || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await waterLocationAPI.update(location.id, formData);
      if (response.success) {
        alert("Water source updated successfully!");
        onSave(response.data);
      }
    } catch (error) {
      console.error("❌ Error updating location:", error);
      alert("Failed to update water source. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            required
            value={formData.full_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, full_name: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Barangay
          </label>
          <input
            type="text"
            value={formData.barangay}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, barangay: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude *
          </label>
          <input
            type="number"
            step="any"
            required
            value={formData.latitude}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                latitude: parseFloat(e.target.value),
              }))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitude *
          </label>
          <input
            type="number"
            step="any"
            required
            value={formData.longitude}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                longitude: parseFloat(e.target.value),
              }))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sample Date
          </label>
          <input
            type="date"
            value={formData.sample_date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, sample_date: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sample Time
          </label>
          <input
            type="time"
            value={formData.sample_time}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, sample_time: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coliform Bacteria
          </label>
          <select
            value={
              formData.coliform_bacteria === null
                ? "null"
                : formData.coliform_bacteria.toString()
            }
            onChange={(e) => {
              const value =
                e.target.value === "null" ? null : e.target.value === "true";
              setFormData((prev) => ({ ...prev, coliform_bacteria: value }));
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="null">Not Tested</option>
            <option value="false">Absent</option>
            <option value="true">Present</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E. coli
          </label>
          <select
            value={
              formData.e_coli === null ? "null" : formData.e_coli.toString()
            }
            onChange={(e) => {
              const value =
                e.target.value === "null" ? null : e.target.value === "true";
              setFormData((prev) => ({ ...prev, e_coli: value }));
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="null">Not Tested</option>
            <option value="false">Absent</option>
            <option value="true">Present</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

const WaterSourceList = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [modalType, setModalType] = useState(""); // "view", "edit", "delete"

  // Fetch water locations on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await waterLocationAPI.getAll();
      if (response.success && response.data) {
        setLocations(response.data);
      }
    } catch (error) {
      console.error("❌ Error fetching locations:", error);
      alert("Failed to fetch water locations");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced status logic matching MapViewAdmin
  const getStatusInfo = (location) => {
    const { coliform_bacteria, e_coli } = location;

    // Both not tested - Gray
    if (coliform_bacteria === null && e_coli === null) {
      return {
        text: "NOT TESTED",
        color: "gray-400",
        bgColor: "gray-100",
        icon: FaQuestionCircle,
        description: "Water samples not collected or tested yet",
      };
    }

    // E. coli present (highest priority) - Red
    if (e_coli === true) {
      return {
        text: "UNDRINKABLE",
        color: "red-500",
        bgColor: "red-100",
        icon: FaTimesCircle,
        description: "E. coli bacteria detected - highly dangerous",
      };
    }

    // Both bacteria present - Red (hazardous)
    if (coliform_bacteria === true && e_coli === true) {
      return {
        text: "HAZARDOUS",
        color: "red-600",
        bgColor: "red-100",
        icon: FaExclamationTriangle,
        description: "Both bacteria detected - extremely dangerous",
      };
    }

    // Coliform present but e_coli absent - Yellow (warning)
    if (coliform_bacteria === true && e_coli === false) {
      return {
        text: "WARNING",
        color: "yellow-500",
        bgColor: "yellow-100",
        icon: FaExclamationTriangle,
        description: "Coliform bacteria detected - needs treatment",
      };
    }

    // Both bacteria absent - Green (safe)
    if (coliform_bacteria === false && e_coli === false) {
      return {
        text: "DRINKABLE",
        color: "green-500",
        bgColor: "green-100",
        icon: FaCheckCircle,
        description: "No harmful bacteria detected",
      };
    }

    // E. coli absent but coliform not tested - Orange
    if (e_coli === false && coliform_bacteria === null) {
      return {
        text: "PARTIALLY TESTED",
        color: "orange-500",
        bgColor: "orange-100",
        icon: FaQuestionCircle,
        description: "E. coli negative, coliform testing incomplete",
      };
    }

    return {
      text: "UNKNOWN",
      color: "gray-400",
      bgColor: "gray-100",
      icon: FaQuestionCircle,
      description: "Status needs evaluation",
    };
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Format time helper
  const formatTime = (timeString) => {
    if (!timeString) return "No time";
    try {
      const time = String(timeString).trim();
      if (time.includes(":")) {
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes || "00"} ${ampm}`;
      }
      return timeString;
    } catch {
      return "Invalid time";
    }
  };

  // Filter locations based on search and status
  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      location.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (location.barangay &&
        location.barangay.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterStatus === "all") return matchesSearch;

    const statusInfo = getStatusInfo(location);
    const statusMatch = statusInfo.text
      .toLowerCase()
      .includes(filterStatus.toLowerCase());

    return matchesSearch && statusMatch;
  });

  // Handle actions
  const handleView = (location) => {
    setSelectedLocation(location);
    setModalType("view");
    setShowModal(true);
  };
  const handleEdit = (location) => {
    setSelectedLocation(location);
    setModalType("edit");
    setShowModal(true);
  };

  const handleDelete = (location) => {
    setSelectedLocation(location);
    setModalType("delete");
    setShowModal(true);
  };
  const handleAdd = () => {
    // Navigate to add location page
    navigate("/admin/add-location");
  };
  const confirmDelete = async () => {
    try {
      setLoading(true);
      await waterLocationAPI.delete(selectedLocation.id);

      // Remove from local state
      setLocations((prev) =>
        prev.filter((loc) => loc.id !== selectedLocation.id)
      );

      // Close modal
      setShowModal(false);
      setSelectedLocation(null);

      // Show success message
      alert(`Successfully deleted ${selectedLocation.full_name}`);
    } catch (error) {
      console.error("❌ Error deleting location:", error);
      alert("Failed to delete water location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading water sources...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout
      title="Water Sources Management"
      subtitle="Monitor and manage water quality monitoring locations in Maasin City"
    >
      <div className="p-6">
        {/* Header Section with Add Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-end"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add New Location</span>
          </motion.button>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 md:max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or barangay..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400 w-4 h-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="drinkable">Drinkable</option>
                <option value="warning">Warning</option>
                <option value="undrinkable">Undrinkable</option>
                <option value="not tested">Not Tested</option>
                <option value="partially">Partially Tested</option>
              </select>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {locations.length}
              </div>
              <div className="text-sm text-gray-600">Total Sources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {
                  locations.filter((l) => getStatusInfo(l).text === "DRINKABLE")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600">Drinkable</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {
                  locations.filter((l) => getStatusInfo(l).text === "WARNING")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600">Warning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {
                  locations.filter((l) =>
                    ["UNDRINKABLE", "HAZARDOUS"].includes(getStatusInfo(l).text)
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Contaminated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {
                  locations.filter(
                    (l) => getStatusInfo(l).text === "NOT TESTED"
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Untested</div>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sample Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Results
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLocations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <FaMapMarkerAlt className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-500">No water sources found</p>
                        {searchTerm && (
                          <p className="text-sm text-gray-400">
                            Try adjusting your search or filter criteria
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLocations.map((location, index) => {
                    const statusInfo = getStatusInfo(location);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <motion.tr
                        key={location.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        {/* Location Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                            <FaMapMarkerAlt className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {location.full_name}
                              </div>
                              {location.barangay && (
                                <div className="text-sm text-gray-500">
                                  {location.barangay}
                                </div>
                              )}
                              <div className="text-xs text-gray-400">
                                {location.latitude?.toFixed(6)},{" "}
                                {location.longitude?.toFixed(6)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div
                            className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium`}
                            style={{
                              backgroundColor:
                                statusInfo.bgColor === "gray-100"
                                  ? "#f3f4f6"
                                  : statusInfo.bgColor === "red-100"
                                  ? "#fee2e2"
                                  : statusInfo.bgColor === "yellow-100"
                                  ? "#fef3c7"
                                  : statusInfo.bgColor === "green-100"
                                  ? "#dcfce7"
                                  : statusInfo.bgColor === "orange-100"
                                  ? "#fed7aa"
                                  : "#f3f4f6",
                              color:
                                statusInfo.color === "gray-400"
                                  ? "#9ca3af"
                                  : statusInfo.color === "red-500"
                                  ? "#ef4444"
                                  : statusInfo.color === "red-600"
                                  ? "#dc2626"
                                  : statusInfo.color === "yellow-500"
                                  ? "#eab308"
                                  : statusInfo.color === "green-500"
                                  ? "#10b981"
                                  : statusInfo.color === "orange-500"
                                  ? "#f97316"
                                  : "#9ca3af",
                            }}
                          >
                            <StatusIcon className="w-3 h-3" />
                            <span>{statusInfo.text}</span>
                          </div>
                        </td>

                        {/* Sample Info */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-sm">
                              <FaCalendar className="w-3 h-3 text-gray-400" />
                              <span>{formatDate(location.sample_date)}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm">
                              <FaClock className="w-3 h-3 text-gray-400" />
                              <span>{formatTime(location.sample_time)}</span>
                            </div>
                          </div>
                        </td>

                        {/* Test Results */}
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Coliform:</span>
                              <span
                                className={`font-medium ${
                                  location.coliform_bacteria === null
                                    ? "text-gray-400"
                                    : location.coliform_bacteria
                                    ? "text-red-500"
                                    : "text-green-500"
                                }`}
                              >
                                {location.coliform_bacteria === null
                                  ? "Not tested"
                                  : location.coliform_bacteria
                                  ? "Present"
                                  : "Absent"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">E. coli:</span>
                              <span
                                className={`font-medium ${
                                  location.e_coli === null
                                    ? "text-gray-400"
                                    : location.e_coli
                                    ? "text-red-500"
                                    : "text-green-500"
                                }`}
                              >
                                {location.e_coli === null
                                  ? "Not tested"
                                  : location.e_coli
                                  ? "Present"
                                  : "Absent"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleView(location)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(location)}
                              className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                              title="Edit Location"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(location)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete Location"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
        {/* Modal for View/Edit/Delete */}
        {showModal && selectedLocation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {modalType === "view" && (
                <div>
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Water Source Details
                      </h3>
                      <button
                        onClick={() => setShowModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {/* ...rest of your existing modal content... */}
                  <div className="px-6 py-4 space-y-6">
                    {/* Location Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Location Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Name
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedLocation.full_name}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Barangay
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedLocation.barangay || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Latitude
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedLocation.latitude?.toFixed(6)}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Longitude
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedLocation.longitude?.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Water Quality Status
                      </h4>
                      {(() => {
                        const statusInfo = getStatusInfo(selectedLocation);
                        const StatusIcon = statusInfo.icon;
                        const bgColor =
                          statusInfo.bgColor === "gray-100"
                            ? "#f3f4f6"
                            : statusInfo.bgColor === "red-100"
                            ? "#fee2e2"
                            : statusInfo.bgColor === "yellow-100"
                            ? "#fef3c7"
                            : statusInfo.bgColor === "green-100"
                            ? "#dcfce7"
                            : statusInfo.bgColor === "orange-100"
                            ? "#fed7aa"
                            : "#f3f4f6";
                        const textColor =
                          statusInfo.color === "gray-400"
                            ? "#9ca3af"
                            : statusInfo.color === "red-500"
                            ? "#ef4444"
                            : statusInfo.color === "red-600"
                            ? "#dc2626"
                            : statusInfo.color === "yellow-500"
                            ? "#eab308"
                            : statusInfo.color === "green-500"
                            ? "#10b981"
                            : statusInfo.color === "orange-500"
                            ? "#f97316"
                            : "#9ca3af";

                        return (
                          <div
                            className="flex items-center space-x-3 p-4 rounded-lg"
                            style={{ backgroundColor: bgColor }}
                          >
                            <StatusIcon
                              className="w-6 h-6"
                              style={{ color: textColor }}
                            />
                            <div>
                              <div
                                className="font-medium"
                                style={{ color: textColor }}
                              >
                                {statusInfo.text}
                              </div>
                              <div className="text-sm text-gray-600">
                                {statusInfo.description}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Test Results */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Test Results
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              Coliform Bacteria
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                selectedLocation.coliform_bacteria === null
                                  ? "bg-gray-100 text-gray-600"
                                  : selectedLocation.coliform_bacteria
                                  ? "bg-red-100 text-red-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {selectedLocation.coliform_bacteria === null
                                ? "Not tested"
                                : selectedLocation.coliform_bacteria
                                ? "Present"
                                : "Absent"}
                            </span>
                          </div>
                        </div>
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">E. coli</span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                selectedLocation.e_coli === null
                                  ? "bg-gray-100 text-gray-600"
                                  : selectedLocation.e_coli
                                  ? "bg-red-100 text-red-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {selectedLocation.e_coli === null
                                ? "Not tested"
                                : selectedLocation.e_coli
                                ? "Present"
                                : "Absent"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sample Information */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Sample Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Sample Date
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {formatDate(selectedLocation.sample_date)}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Sample Time
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {formatTime(selectedLocation.sample_time)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Image */}
                    {selectedLocation.image_path && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Water Source Image
                        </h4>
                        <img
                          src={`/${selectedLocation.image_path}`}
                          alt={selectedLocation.full_name}
                          className="w-full h-64 object-cover rounded-lg shadow-sm"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {/* Modal Footer */}
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleEdit(selectedLocation)}
                      className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Edit Location
                    </button>
                  </div>
                </div>
              )}

              {modalType === "edit" && (
                <div>
                  {/* Edit Modal Header */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Edit Water Source
                      </h3>
                      <button
                        onClick={() => setShowModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Edit Form */}
                  <div className="px-6 py-4">
                    <EditForm
                      location={selectedLocation}
                      onSave={(updatedLocation) => {
                        // Update the location in the list
                        setLocations((prev) =>
                          prev.map((loc) =>
                            loc.id === updatedLocation.id
                              ? updatedLocation
                              : loc
                          )
                        );
                        setShowModal(false);
                      }}
                      onCancel={() => setShowModal(false)}
                    />
                  </div>
                </div>
              )}

              {modalType === "delete" && (
                <div>
                  {/* Delete Confirmation */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Confirm Deletion
                    </h3>
                  </div>
                  <div className="px-6 py-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <FaExclamationTriangle className="w-6 h-6 text-red-500" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Are you sure you want to delete this water source?
                        </p>
                        <p className="text-sm text-gray-600">
                          This action cannot be undone.
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium">
                        {selectedLocation.full_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedLocation.barangay}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WaterSourceList;
