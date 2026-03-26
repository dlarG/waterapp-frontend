/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  FaTimes,
  FaDownload,
  FaExpand,
  FaCompress,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronLeft,
  FaChevronRight,
  FaImage,
} from "react-icons/fa";
import { waterLocationAPI } from "../api/api";
import Layout from "./Layout";
import LocationMap from "./LocationMap";

// Enhanced Edit Form Component with better UX
// Enhanced Edit Form Component with draggable map
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
    bacteriological_exam: location.bacteriological_exam || "untested",
  });

  useEffect(() => {
    setFormData({
      full_name: location?.full_name || "",
      barangay: location?.barangay || "",
      latitude: location?.latitude || "",
      longitude: location?.longitude || "",
      coliform_bacteria: location?.coliform_bacteria ?? null,
      e_coli: location?.e_coli ?? null,
      sample_date: location?.sample_date || "",
      sample_time: location?.sample_time || "",
      bacteriological_exam: (
        location?.bacteriological_exam || "untested"
      ).toLowerCase(),
    });
  }, [location?.id]);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Location name is required";
    }

    if (!formData.latitude || isNaN(formData.latitude)) {
      newErrors.latitude = "Valid latitude is required";
    }

    if (!formData.longitude || isNaN(formData.longitude)) {
      newErrors.longitude = "Valid longitude is required";
    }

    // Validate Maasin bounds
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (lat && (lat < 10.0 || lat > 10.3)) {
      newErrors.latitude = "Latitude must be within Maasin City (10.0 - 10.3)";
    }

    if (lng && (lng < 124.7 || lng > 125.1)) {
      newErrors.longitude =
        "Longitude must be within Maasin City (124.7 - 125.1)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);

    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        bacteriological_exam: (
          formData.bacteriological_exam || "untested"
        ).toLowerCase(),
      };

      console.log("🟦 UPDATE payload (client):", payload); // ✅ debug

      const response = await waterLocationAPI.update(location.id, payload);

      if (response.success) {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Location Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.full_name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, full_name: e.target.value }));
              if (errors.full_name) {
                setErrors((prev) => ({ ...prev, full_name: null }));
              }
            }}
            className={`w-full border ${
              errors.full_name ? "border-red-500" : "border-gray-300"
            } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            placeholder="Enter location name"
          />
          {errors.full_name && (
            <p className="text-sm text-red-500">{errors.full_name}</p>
          )}
        </div>

        {/* Barangay */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Barangay
          </label>
          <input
            type="text"
            value={formData.barangay}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, barangay: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter barangay"
          />
        </div>

        {/* Latitude */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Latitude <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="any"
            required
            value={formData.latitude}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                latitude: e.target.value,
              }));
              if (errors.latitude) {
                setErrors((prev) => ({ ...prev, latitude: null }));
              }
            }}
            className={`w-full border ${
              errors.latitude ? "border-red-500" : "border-gray-300"
            } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            placeholder="10.108537"
          />
          {errors.latitude && (
            <p className="text-sm text-red-500">{errors.latitude}</p>
          )}
        </div>

        {/* Longitude */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Longitude <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="any"
            required
            value={formData.longitude}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                longitude: e.target.value,
              }));
              if (errors.longitude) {
                setErrors((prev) => ({ ...prev, longitude: null }));
              }
            }}
            className={`w-full border ${
              errors.longitude ? "border-red-500" : "border-gray-300"
            } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            placeholder="124.748792"
          />
          {errors.longitude && (
            <p className="text-sm text-red-500">{errors.longitude}</p>
          )}
        </div>

        {/* Sample Date */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Sample Date
          </label>
          <input
            type="date"
            value={formData.sample_date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, sample_date: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Sample Time */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Sample Time
          </label>
          <input
            type="time"
            value={formData.sample_time}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, sample_time: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Map Section - Interactive and Draggable */}
      {formData.latitude && formData.longitude && (
        <div className="bg-gray-50 rounded-lg p-4">
          <LocationMap
            latitude={parseFloat(formData.latitude)}
            longitude={parseFloat(formData.longitude)}
            height="350px"
            draggable={true}
            onPositionChange={(lat, lng) => {
              setFormData((prev) => ({
                ...prev,
                latitude: lat.toFixed(6),
                longitude: lng.toFixed(6),
              }));
              // Clear any coordinate errors
              if (errors.latitude || errors.longitude) {
                setErrors((prev) => ({
                  ...prev,
                  latitude: null,
                  longitude: null,
                }));
              }
            }}
            readOnly={false}
          />
          <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
            <span>💡</span>
            <span>
              Tip: You can drag the marker to adjust the location, or enter
              coordinates manually above
            </span>
          </p>
        </div>
      )}

      {/* Test Results Section */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h4 className="font-medium text-gray-900">Test Results</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coliform Bacteria */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Coliform Bacteria
            </label>
            <select
              value={
                formData.coliform_bacteria === null
                  ? "null"
                  : formData.coliform_bacteria?.toString()
              }
              onChange={(e) => {
                const value =
                  e.target.value === "null" ? null : e.target.value === "true";
                setFormData((prev) => ({ ...prev, coliform_bacteria: value }));
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="null">Not Tested</option>
              <option value="false">Absent (Safe)</option>
              <option value="true">Present (Unsafe)</option>
            </select>
          </div>

          {/* E. coli */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              E. coli
            </label>
            <select
              value={
                formData.e_coli === null ? "null" : formData.e_coli?.toString()
              }
              onChange={(e) => {
                const value =
                  e.target.value === "null" ? null : e.target.value === "true";
                setFormData((prev) => ({ ...prev, e_coli: value }));
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="null">Not Tested</option>
              <option value="false">Absent (Safe)</option>
              <option value="true">Present (Unsafe)</option>
            </select>
          </div>

          {/* Bacteriological Exam */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Bacteriological Exam
            </label>
            <select
              value={formData.bacteriological_exam || "untested"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  bacteriological_exam: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="untested">Untested</option>
              <option value="failed">Failed</option>
              <option value="passed">Passed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </div>
    </form>
  );
};

// View Details Modal Component
const ViewDetailsModal = ({ location, onClose, onEdit, onDelete }) => {
  const [imageExpanded, setImageExpanded] = useState(false);

  const getStatusInfo = (location) => {
    const { coliform_bacteria, e_coli, bacteriological_exam } = location;
    const exam = (bacteriological_exam || "").toLowerCase();

    // 1) Contaminated: exam failed overrides everything
    if (exam === "failed") {
      return {
        text: "CONTAMINATED",
        color: "red",
        bgColor: "bg-red-100",
        textColor: "text-red-600",
        icon: FaTimesCircle,
        description: "Bacteriological exam failed",
      };
    }

    // 2) Drinkable: exam passed overrides bacteria results
    if (exam === "passed") {
      return {
        text: "DRINKABLE",
        color: "green",
        bgColor: "bg-green-100",
        textColor: "text-green-600",
        icon: FaCheckCircle,
        description: "Bacteriological exam passed",
      };
    }

    // 3) Warning: exam untested but bacteria positive
    if (
      exam === "untested" &&
      (coliform_bacteria === true || e_coli === true)
    ) {
      return {
        text: "WARNING",
        color: "yellow",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600",
        icon: FaExclamationTriangle,
        description: "Bacteria detected but exam untested",
      };
    }

    // 4) If exam untested and bacteria not positive, fall back to original bacteria logic

    if (coliform_bacteria === null && e_coli === null) {
      return {
        text: "NOT TESTED",
        color: "gray",
        bgColor: "bg-gray-100",
        textColor: "text-gray-600",
        icon: FaQuestionCircle,
        description: "Water samples not collected or tested yet",
      };
    }

    if (e_coli === true) {
      return {
        text: "UNDRINKABLE",
        color: "red",
        bgColor: "bg-red-100",
        textColor: "text-red-600",
        icon: FaTimesCircle,
        description: "E. coli bacteria detected - highly dangerous",
      };
    }

    if (coliform_bacteria === true && e_coli === true) {
      return {
        text: "HAZARDOUS",
        color: "red",
        bgColor: "bg-red-100",
        textColor: "text-red-600",
        icon: FaExclamationTriangle,
        description: "Both bacteria detected - extremely dangerous",
      };
    }

    if (coliform_bacteria === true && e_coli === false) {
      return {
        text: "WARNING",
        color: "yellow",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600",
        icon: FaExclamationTriangle,
        description: "Coliform bacteria detected - needs treatment",
      };
    }

    if (coliform_bacteria === false && e_coli === false) {
      return {
        text: "DRINKABLE",
        color: "green",
        bgColor: "bg-green-100",
        textColor: "text-green-600",
        icon: FaCheckCircle,
        description: "No harmful bacteria detected",
      };
    }

    if (e_coli === false && coliform_bacteria === null && exam === "failed") {
      return {
        text: "PARTIALLY SAFE",
        color: "orange",
        bgColor: "bg-orange-100",
        textColor: "text-orange-600",
        icon: FaQuestionCircle,
        description: "E. coli negative, coliform testing incomplete",
      };
    }

    return {
      text: "UNKNOWN",
      color: "gray",
      bgColor: "bg-gray-100",
      textColor: "text-gray-600",
      icon: FaQuestionCircle,
      description: "Status needs evaluation",
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Not provided";
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

  const statusInfo = getStatusInfo(location);
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-cyan-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaMapMarkerAlt className="w-6 h-6 text-white" />
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {location.full_name}
                </h3>
                {location.barangay && (
                  <p className="text-sm text-blue-100">{location.barangay}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer text-white hover:text-blue-100 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          <div className="space-y-6">
            {/* Status Badge */}
            <div className={`${statusInfo.bgColor} rounded-lg p-4`}>
              <div className="flex items-center space-x-3">
                <StatusIcon className={`w-6 h-6 ${statusInfo.textColor}`} />
                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.bgColor} ${statusInfo.textColor}`}
                  >
                    {statusInfo.text}
                  </span>
                  <p className={`text-sm mt-1 ${statusInfo.textColor}`}>
                    {statusInfo.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Location Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Location Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Latitude:</span>
                    <span className="font-mono">
                      {location.latitude?.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Longitude:</span>
                    <span className="font-mono">
                      {location.longitude?.toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sample Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Sample Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <FaCalendar className="text-gray-400" />
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {formatDate(location.sample_date)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <FaClock className="text-gray-400" />
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">
                      {formatTime(location.sample_time)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            {location.latitude && location.longitude && (
              <div className="bg-gray-50 rounded-lg p-4">
                <LocationMap
                  latitude={location.latitude}
                  longitude={location.longitude}
                  height="350px"
                  readOnly={true}
                />
              </div>
            )}

            {/* Test Results */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                Bacteriological Test Results
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Coliform Bacteria</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        location.coliform_bacteria === null
                          ? "bg-gray-100 text-gray-600"
                          : location.coliform_bacteria
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {location.coliform_bacteria === null
                        ? "Not Tested"
                        : location.coliform_bacteria
                        ? "Present"
                        : "Absent"}
                    </span>
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">E. coli</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        location.e_coli === null
                          ? "bg-gray-100 text-gray-600"
                          : location.e_coli
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {location.e_coli === null
                        ? "Not Tested"
                        : location.e_coli
                        ? "Present"
                        : "Absent"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Image */}
            {location.image_path && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Location Image
                </h4>
                <div
                  className={`relative ${
                    imageExpanded
                      ? "fixed inset-0 z-50 bg-black bg-opacity-90"
                      : ""
                  }`}
                  onClick={() => setImageExpanded(!imageExpanded)}
                >
                  <img
                    src={`/${location.image_path}`}
                    alt={location.full_name}
                    className={`${
                      imageExpanded
                        ? "max-w-full max-h-full mx-auto my-auto"
                        : "w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    }`}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  {!imageExpanded && (
                    <button
                      onClick={() => setImageExpanded(true)}
                      className="cursor-pointer absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70 transition-all"
                    >
                      <FaExpand className="w-4 h-4" />
                    </button>
                  )}
                  {imageExpanded && (
                    <button
                      onClick={() => setImageExpanded(false)}
                      className="cursor-pointer absolute top-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <FaCompress className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                onClose();
                onEdit(location);
              }}
              className="cursor-pointer px-4 py-2 bg-yellow-500 text-white hover:bg-yellow-600 rounded-lg transition-colors flex items-center space-x-2"
            >
              <FaEdit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(location);
              }}
              className="cursor-pointer px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors flex items-center space-x-2"
            >
              <FaTrash className="w-4 h-4" />
              <span>Delete</span>
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ location, onConfirm, onCancel }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm Deletion
          </h3>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="w-6 h-6 text-red-600" />
            </div>
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
            <p className="font-medium text-gray-900">{location.full_name}</p>
            {location.barangay && (
              <p className="text-sm text-gray-600">{location.barangay}</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="cursor-pointer px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <FaTrash className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const WaterSourceList = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "full_name",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "", // "view", "edit", "delete"
    location: null,
  });

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
    const { coliform_bacteria, e_coli, bacteriological_exam } = location;
    const exam = (bacteriological_exam || "").toLowerCase();

    // 1) Contaminated: exam failed overrides everything
    if (exam === "failed") {
      return {
        text: "CONTAMINATED",
        color: "red",
        bgColor: "bg-red-100",
        textColor: "text-red-600",
        icon: FaTimesCircle,
        description: "Bacteriological exam failed",
      };
    }

    // 2) Drinkable: exam passed overrides bacteria results
    if (exam === "passed") {
      return {
        text: "DRINKABLE",
        color: "green",
        bgColor: "bg-green-100",
        textColor: "text-green-600",
        icon: FaCheckCircle,
        description: "Bacteriological exam passed",
      };
    }

    // 3) Warning: exam untested but bacteria positive
    if (
      exam === "untested" &&
      (coliform_bacteria === true || e_coli === true)
    ) {
      return {
        text: "WARNING",
        color: "yellow",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600",
        icon: FaExclamationTriangle,
        description: "Bacteria detected but exam untested",
      };
    }

    // 4) If exam untested and bacteria not positive, fall back to original bacteria logic

    if (coliform_bacteria === null && e_coli === null) {
      return {
        text: "NOT TESTED",
        color: "gray",
        bgColor: "bg-gray-100",
        textColor: "text-gray-600",
        icon: FaQuestionCircle,
        description: "Water samples not collected or tested yet",
      };
    }

    if (e_coli === true) {
      return {
        text: "UNDRINKABLE",
        color: "red",
        bgColor: "bg-red-100",
        textColor: "text-red-600",
        icon: FaTimesCircle,
        description: "E. coli bacteria detected - highly dangerous",
      };
    }

    if (coliform_bacteria === true && e_coli === true) {
      return {
        text: "HAZARDOUS",
        color: "red",
        bgColor: "bg-red-100",
        textColor: "text-red-600",
        icon: FaExclamationTriangle,
        description: "Both bacteria detected - extremely dangerous",
      };
    }

    if (coliform_bacteria === true && e_coli === false) {
      return {
        text: "WARNING",
        color: "yellow",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600",
        icon: FaExclamationTriangle,
        description: "Coliform bacteria detected - needs treatment",
      };
    }

    if (coliform_bacteria === false && e_coli === false) {
      return {
        text: "DRINKABLE",
        color: "green",
        bgColor: "bg-green-100",
        textColor: "text-green-600",
        icon: FaCheckCircle,
        description: "No harmful bacteria detected",
      };
    }

    if (e_coli === false && coliform_bacteria === null && exam === "failed") {
      return {
        text: "PARTIALLY SAFE",
        color: "orange",
        bgColor: "bg-orange-100",
        textColor: "text-orange-600",
        icon: FaQuestionCircle,
        description: "E. coli negative, coliform testing incomplete",
      };
    }

    return {
      text: "UNKNOWN",
      color: "gray",
      bgColor: "bg-gray-100",
      textColor: "text-gray-600",
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

  // Sorting function
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <FaSort className="w-3 h-3 text-gray-400" />;
    return sortConfig.direction === "asc" ? (
      <FaSortUp className="w-3 h-3 text-blue-600" />
    ) : (
      <FaSortDown className="w-3 h-3 text-blue-600" />
    );
  };

  // Filter and sort locations
  const processedLocations = locations
    .filter((location) => {
      const matchesSearch =
        location.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (location.barangay &&
          location.barangay.toLowerCase().includes(searchTerm.toLowerCase()));

      if (filterStatus === "all") return matchesSearch;

      const statusInfo = getStatusInfo(location);
      return (
        matchesSearch &&
        statusInfo.text.toLowerCase().includes(filterStatus.toLowerCase())
      );
    })
    .sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "sample_date") {
        aValue = a.sample_date || "";
        bValue = b.sample_date || "";
      } else if (sortConfig.key === "status") {
        aValue = getStatusInfo(a).text;
        bValue = getStatusInfo(b).text;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedLocations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(processedLocations.length / itemsPerPage);

  // Handle actions
  const handleView = (location) => {
    setModalState({
      isOpen: true,
      type: "view",
      location,
    });
  };

  const handleEdit = (location) => {
    setModalState({
      isOpen: true,
      type: "edit",
      location,
    });
  };

  const handleDelete = (location) => {
    setModalState({
      isOpen: true,
      type: "delete",
      location,
    });
  };

  const handleAdd = () => {
    navigate("/admin/add-location");
  };

  const handleSaveEdit = (updatedLocation) => {
    setLocations((prev) =>
      prev.map((loc) => (loc.id === updatedLocation.id ? updatedLocation : loc))
    );
    closeModal();
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const response = await waterLocationAPI.delete(modalState.location.id);

      if (response.success) {
        setLocations((prev) =>
          prev.filter((loc) => loc.id !== modalState.location.id)
        );
        closeModal();
      }
    } catch (error) {
      console.error("❌ Error deleting location:", error);
      alert("Failed to delete water location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: "",
      location: null,
    });
  };

  if (loading && locations.length === 0) {
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
      <div className="p-4 md:p-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0"
        >
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-800">Water Sources</h2>
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
              {locations.length} Total
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="cursor-pointer w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
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
          className="bg-white rounded-xl shadow-sm p-4 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 lg:max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or barangay..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400 w-4 h-4" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="drinkable">Drinkable</option>
                <option value="warning">Warning</option>
                <option value="contaminated">Contaminated</option>
                <option value="not tested">Not Tested</option>
                <option value="partially">Partially Tested</option>
              </select>
            </div>
          </div>

          {/* Summary Stats Cards - Mobile Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4 pt-4 border-t border-gray-200">
            {[
              { label: "Total", value: locations.length, color: "blue" },
              {
                label: "Drinkable",
                value: locations.filter(
                  (l) => getStatusInfo(l).text === "DRINKABLE"
                ).length,
                color: "green",
              },
              {
                label: "Warning",
                value: locations.filter(
                  (l) => getStatusInfo(l).text === "WARNING"
                ).length,
                color: "yellow",
              },
              {
                label: "Contaminated",
                value: locations.filter(
                  (l) => getStatusInfo(l).text === "CONTAMINATED"
                ).length,
                color: "red",
              },
              {
                label: "Untested",
                value: locations.filter(
                  (l) => getStatusInfo(l).text === "NOT TESTED"
                ).length,
                color: "gray",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-3 text-center"
              >
                <div className={`text-2xl font-bold text-${stat.color}-600`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Table with Sticky Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      {[
                        { key: "full_name", label: "Location" },
                        { key: "status", label: "Status" },
                        { key: "sample_date", label: "Sample Info" },
                        { key: null, label: "Test Results" },
                        { key: null, label: "Actions" },
                      ].map((column, index) => (
                        <th
                          key={index}
                          className={`px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                            column.key ? "cursor-pointer hover:bg-gray-100" : ""
                          }`}
                          onClick={() => column.key && handleSort(column.key)}
                        >
                          <div className="flex items-center space-x-1">
                            <span>{column.label}</span>
                            {column.key && getSortIcon(column.key)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center space-y-3">
                            <FaMapMarkerAlt className="w-12 h-12 text-gray-400" />
                            <p className="text-gray-500">
                              No water sources found
                            </p>
                            {searchTerm && (
                              <p className="text-sm text-gray-400">
                                Try adjusting your search or filter criteria
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((location, index) => {
                        const statusInfo = getStatusInfo(location);
                        const StatusIcon = statusInfo.icon;

                        return (
                          <motion.tr
                            key={location.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                            onClick={() => handleView(location)}
                          >
                            {/* Location Info */}
                            <td className="px-4 md:px-6 py-4">
                              <div className="flex items-start space-x-3">
                                <FaMapMarkerAlt className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-900 truncate max-w-[200px]">
                                    {location.full_name}
                                  </div>
                                  {location.barangay && (
                                    <div className="text-sm text-gray-500 truncate">
                                      {location.barangay}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 md:px-6 py-4">
                              <div
                                className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                <span className="hidden sm:inline">
                                  {statusInfo.text}
                                </span>
                                <span className="sm:hidden">
                                  {statusInfo.text
                                    .split(" ")
                                    .map((word) => word[0])
                                    .join("")}
                                </span>
                              </div>
                            </td>

                            {/* Sample Info */}
                            <td className="px-4 md:px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-1 text-sm">
                                  <FaCalendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                  <span className="truncate max-w-[80px] md:max-w-none">
                                    {formatDate(location.sample_date)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1 text-sm">
                                  <FaClock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                  <span className="truncate max-w-[80px] md:max-w-none">
                                    {formatTime(location.sample_time)}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Test Results */}
                            <td className="px-4 md:px-6 py-4">
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 hidden md:inline">
                                    Coliform:
                                  </span>
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
                                      ? "?"
                                      : location.coliform_bacteria
                                      ? "+"
                                      : "-"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 hidden md:inline">
                                    E. coli:
                                  </span>
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
                                      ? "?"
                                      : location.e_coli
                                      ? "+"
                                      : "-"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 hidden md:inline">
                                    Bacterio Exam:
                                  </span>
                                  <span
                                    className={`font-medium ${
                                      location.bacteriological_exam ===
                                        "untested" ||
                                      !location.bacteriological_exam
                                        ? "text-gray-400"
                                        : location.bacteriological_exam ===
                                          "failed"
                                        ? "text-red-500"
                                        : "text-green-500"
                                    }`}
                                  >
                                    {location.bacteriological_exam ===
                                      "untested" ||
                                    !location.bacteriological_exam
                                      ? "?"
                                      : location.bacteriological_exam ===
                                        "failed"
                                      ? "+"
                                      : "-"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-4 md:px-6 py-4">
                              <div
                                className="flex items-center space-x-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => handleView(location)}
                                  className="cursor-pointer p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <FaEye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEdit(location)}
                                  className="cursor-pointer p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                                  title="Edit Location"
                                >
                                  <FaEdit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(location)}
                                  className="cursor-pointer p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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
            </div>
          </div>

          {/* Pagination */}
          {processedLocations.length > 0 && (
            <div className="px-4 md:px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, processedLocations.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {processedLocations.length}
                  </span>{" "}
                  results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="cursor-pointer px-3 py-1 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="cursor-pointer px-3 py-1 bg-blue-600 text-white rounded-lg">
                    {currentPage}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="cursor-pointer px-3 py-1 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {modalState.isOpen && modalState.type === "view" && (
            <ViewDetailsModal
              location={modalState.location}
              onClose={closeModal}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          {modalState.isOpen && modalState.type === "edit" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit Water Source
                  </h3>
                </div>
                <div className="px-6 py-4">
                  <EditForm
                    key={modalState.location?.id}
                    location={modalState.location}
                    onSave={handleSaveEdit}
                    onCancel={closeModal}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}

          {modalState.isOpen && modalState.type === "delete" && (
            <DeleteConfirmationModal
              location={modalState.location}
              onConfirm={confirmDelete}
              onCancel={closeModal}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default WaterSourceList;
