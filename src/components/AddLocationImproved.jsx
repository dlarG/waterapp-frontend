import React, { useRef, useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { waterLocationAPI, imageAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons for different marker types
const newMarkerIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const existingMarkerIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -28],
  shadowSize: [32, 32],
});

// Maasin City configuration
const MAASIN_CONFIG = {
  center: [10.173022, 124.825287],
  zoom: 13,
  bounds: [
    [10.108537, 124.748792], // Southwest corner
    [10.250638, 124.943169], // Northeast corner
  ],
};

const AddLocationImproved = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    description: "",
    latitude: MAASIN_CONFIG.center[0].toString(),
    longitude: MAASIN_CONFIG.center[1].toString(),
    barangay_name: "",
    coliform_bacteria: null,
    e_coli: null,
    sample_date: "",
    sample_time: "",
    image_path: "",
  });

  // Enhanced state for barangay handling
  const [createNewBarangay, setCreateNewBarangay] = useState(false);
  const [newBarangayName, setNewBarangayName] = useState("");
  const [barangayOptions, setBarangayOptions] = useState([]);
  const [loadingBarangays, setLoadingBarangays] = useState(true);

  // Bacteria test results state
  const [bacteriaTestResults, setBacteriaTestResults] = useState({
    coliform_present: "", // 'present', 'absent', or ''
    ecoli_present: "", // 'present', 'absent', or ''
    both_safe: false, // Safe water checkbox
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // NEW: Existing locations state
  const [existingLocations, setExistingLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  // Check if coordinates are within Maasin bounds
  const isWithinBounds = useCallback((lat, lng) => {
    const [swLat, swLng] = MAASIN_CONFIG.bounds[0];
    const [neLat, neLng] = MAASIN_CONFIG.bounds[1];
    return lat >= swLat && lat <= neLat && lng >= swLng && lng <= neLng;
  }, []);

  // Load existing barangays from database
  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        setLoadingBarangays(true);
        const response = await fetch("/api/barangays/from-locations");
        const result = await response.json();

        if (result.success) {
          setBarangayOptions(result.data || []);
        } else {
          console.error("Failed to fetch barangays:", result.error);
          setBarangayOptions([
            "batuan",
            "combado",
            "hantag",
            "malapoc-norte",
            "malapoc-sur",
            "matin_ao",
            "rizal",
            "san_isidro",
          ]);
        }
      } catch (error) {
        console.error("Error fetching barangays:", error);
        setBarangayOptions([
          "batuan",
          "combado",
          "hantag",
          "malapoc-norte",
          "malapoc-sur",
          "matin_ao",
          "rizal",
          "san_isidro",
        ]);
      } finally {
        setLoadingBarangays(false);
      }
    };

    fetchBarangays();
  }, []);

  // NEW: Fetch existing water locations to display on map
  useEffect(() => {
    const fetchExistingLocations = async () => {
      try {
        setLoadingLocations(true);
        const response = await waterLocationAPI.getAll();
        if (response.success) {
          setExistingLocations(response.data || []);
        } else {
          console.error("Failed to fetch existing locations:", response.error);
          setExistingLocations([]);
        }
      } catch (error) {
        console.error("Error fetching existing locations:", error);
        setExistingLocations([]);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchExistingLocations();
  }, []);

  // Simple bacteria test result handling
  const handleBacteriaResultChange = (bacteriaType, result) => {
    setBacteriaTestResults((prev) => ({
      ...prev,
      [bacteriaType]: result,
      // If setting both safe, clear individual results
      ...(bacteriaType === "both_safe" && result
        ? { coliform_present: "", ecoli_present: "" }
        : {}),
      // If setting individual results, clear both safe
      ...(bacteriaType !== "both_safe" && result ? { both_safe: false } : {}),
    }));

    // Also update formData for backend compatibility
    if (bacteriaType === "both_safe" && result) {
      setFormData((prev) => ({
        ...prev,
        coliform_bacteria: false,
        e_coli: false,
      }));
    } else if (bacteriaType === "coliform_present") {
      setFormData((prev) => ({
        ...prev,
        coliform_bacteria:
          result === "present" ? true : result === "absent" ? false : null,
      }));
    } else if (bacteriaType === "ecoli_present") {
      setFormData((prev) => ({
        ...prev,
        e_coli:
          result === "present" ? true : result === "absent" ? false : null,
      }));
    }
  };

  // Component for handling map clicks
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;

        if (isWithinBounds(lat, lng)) {
          setFormData((prev) => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
          }));
        } else {
          alert("Please select a location within Maasin City bounds.");
        }
      },
    });
    return null;
  };

  // Custom draggable marker component for new location
  const DraggableMarker = () => {
    const markerRef = useRef(null);

    const eventHandlers = {
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();

          if (isWithinBounds(lat, lng)) {
            setFormData((prev) => ({
              ...prev,
              latitude: lat.toFixed(6),
              longitude: lng.toFixed(6),
            }));
          } else {
            alert("Please keep the marker within Maasin City bounds.");
            // Reset marker to previous valid position
            marker.setLatLng([
              parseFloat(formData.latitude),
              parseFloat(formData.longitude),
            ]);
          }
        }
      },
    };

    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={[
          parseFloat(formData.latitude),
          parseFloat(formData.longitude),
        ]}
        ref={markerRef}
        icon={newMarkerIcon}
      />
    );
  };

  // NEW: Component for displaying existing locations
  const ExistingLocationsMarkers = () => {
    return (
      <>
        {existingLocations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={existingMarkerIcon}
          />
        ))}
      </>
    );
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      // Handle special checkbox logic for bacteria testing
      if (name === "create_new_barangay") {
        setCreateNewBarangay(checked);
        if (checked) {
          setFormData((prev) => ({ ...prev, barangay_name: "" }));
        } else {
          setNewBarangayName("");
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: checked ? true : null,
        }));
      }
    } else {
      if (name === "new_barangay_name") {
        setNewBarangayName(value);
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleCoordinateChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Location name is required";
    }

    if (!formData.latitude || isNaN(parseFloat(formData.latitude))) {
      newErrors.latitude = "Valid latitude is required";
    }

    if (!formData.longitude || isNaN(parseFloat(formData.longitude))) {
      newErrors.longitude = "Valid longitude is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine final barangay value
      const finalBarangay = createNewBarangay
        ? newBarangayName.trim()
        : formData.barangay_name;

      const submitData = {
        full_name: formData.full_name.trim(),
        barangay: finalBarangay || null,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        coliform_bacteria: formData.coliform_bacteria,
        e_coli: formData.e_coli,
        image_path: formData.image_path || null,
        sample_date: formData.sample_date || null,
        sample_time: formData.sample_time || null,
        created_by: user?.id,
      };

      const response = await waterLocationAPI.create(submitData);

      if (response.success) {
        alert("✅ Water location added successfully!");
        navigate("/dashboard");
      } else {
        alert(`❌ Failed to add location: ${response.error}`);
      }
    } catch (error) {
      console.error("❌ Error adding location:", error);
      alert(`❌ Error adding location: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Image handling functions
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      alert("Please select an image first");
      return;
    }

    setIsUploading(true);
    try {
      const response = await imageAPI.upload(selectedImage);

      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          image_path: response.image_path,
        }));
        alert("✅ Image uploaded successfully!");
      } else {
        alert(`❌ Upload failed: ${response.error}`);
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      alert(`❌ Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      image_path: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Improved Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add New Water Location
              </h1>
              <p className="text-gray-600">
                Add a new water monitoring point to the system
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section with Back Button */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* NEW: Back button at top of form */}
            <div className="mb-6">
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Batuan Water Source #1"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.full_name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.full_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.full_name}
                  </p>
                )}
              </div>

              {/* Enhanced Barangay Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barangay (Optional)
                </label>

                {/* Checkbox to create new barangay */}
                <div className="mb-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="create_new_barangay"
                      checked={createNewBarangay}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Create new barangay
                    </span>
                  </label>
                </div>

                {/* Barangay Dropdown (disabled when creating new) */}
                {!createNewBarangay && (
                  <select
                    name="barangay_name"
                    value={formData.barangay_name}
                    onChange={handleInputChange}
                    disabled={loadingBarangays}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.barangay_name
                        ? "border-red-500"
                        : "border-gray-300"
                    } ${loadingBarangays ? "bg-gray-100" : ""}`}
                  >
                    <option value="">
                      {loadingBarangays
                        ? "Loading barangays..."
                        : "Select Barangay"}
                    </option>
                    {barangayOptions.map((barangay) => (
                      <option key={barangay} value={barangay}>
                        {barangay.charAt(0).toUpperCase() +
                          barangay.slice(1).replace(/[-_]/g, " ")}
                      </option>
                    ))}
                  </select>
                )}

                {/* New Barangay Input (shown when creating new) */}
                {createNewBarangay && (
                  <input
                    type="text"
                    name="new_barangay_name"
                    value={newBarangayName}
                    onChange={handleInputChange}
                    placeholder="Enter new barangay name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}

                {errors.barangay_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.barangay_name}
                  </p>
                )}
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={(e) =>
                      handleCoordinateChange("latitude", e.target.value)
                    }
                    placeholder="10.108537"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.latitude ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.latitude && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.latitude}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={(e) =>
                      handleCoordinateChange("longitude", e.target.value)
                    }
                    placeholder="124.748792"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.longitude ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.longitude && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.longitude}
                    </p>
                  )}
                </div>
              </div>

              {/* Simplified Water Quality Tests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Water Quality Tests (Optional)
                </label>

                <div className="space-y-4">
                  {/* Safe Water Checkbox */}
                  <div className="border border-green-200 rounded-lg p-3 bg-green-50">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={bacteriaTestResults.both_safe}
                        onChange={(e) =>
                          handleBacteriaResultChange(
                            "both_safe",
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                      />
                      <div>
                        <span className="font-medium text-green-800">
                          ✅ Safe Water (No bacteria detected)
                        </span>
                        <p className="text-sm text-green-700">
                          Check this if both coliform and E.coli tests are
                          negative
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Individual Bacteria Tests (when not safe water) */}
                  {!bacteriaTestResults.both_safe && (
                    <>
                      {/* Coliform Bacteria */}
                      <div className="border border-gray-200 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Coliform Bacteria Test
                        </h4>
                        <div className="flex space-x-6">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="coliform_test"
                              value="present"
                              checked={
                                bacteriaTestResults.coliform_present ===
                                "present"
                              }
                              onChange={(e) =>
                                handleBacteriaResultChange(
                                  "coliform_present",
                                  e.target.value
                                )
                              }
                              className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                            />
                            <span className="text-sm text-red-700">
                              Present
                            </span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="coliform_test"
                              value="absent"
                              checked={
                                bacteriaTestResults.coliform_present ===
                                "absent"
                              }
                              onChange={(e) =>
                                handleBacteriaResultChange(
                                  "coliform_present",
                                  e.target.value
                                )
                              }
                              className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                            />
                            <span className="text-sm text-green-700">
                              Absent
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* E. Coli */}
                      <div className="border border-gray-200 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          E. Coli Test
                        </h4>
                        <div className="flex space-x-6">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="ecoli_test"
                              value="present"
                              checked={
                                bacteriaTestResults.ecoli_present === "present"
                              }
                              onChange={(e) =>
                                handleBacteriaResultChange(
                                  "ecoli_present",
                                  e.target.value
                                )
                              }
                              className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                            />
                            <span className="text-sm text-red-700">
                              Present
                            </span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="ecoli_test"
                              value="absent"
                              checked={
                                bacteriaTestResults.ecoli_present === "absent"
                              }
                              onChange={(e) =>
                                handleBacteriaResultChange(
                                  "ecoli_present",
                                  e.target.value
                                )
                              }
                              className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                            />
                            <span className="text-sm text-green-700">
                              Absent
                            </span>
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Sample Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sample Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="sample_date"
                    value={formData.sample_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sample Time (Optional)
                  </label>
                  <input
                    type="time"
                    name="sample_time"
                    value={formData.sample_time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Water Source Image (Optional)
                </label>

                <div className="space-y-4">
                  {/* Image Preview */}
                  {(imagePreview || formData.image_path) && (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview || `/${formData.image_path}`}
                        alt="Water source preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* File Input and Upload Buttons */}
                  <div className="flex space-x-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span>Select Image</span>
                    </button>

                    {selectedImage && !formData.image_path && (
                      <button
                        type="button"
                        onClick={handleImageUpload}
                        disabled={isUploading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
                      >
                        {isUploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <span>Upload Image</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {formData.image_path && (
                    <p className="text-sm text-green-600">
                      ✅ Image uploaded successfully
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding Location...</span>
                    </div>
                  ) : (
                    "Add Water Location"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Enhanced Map Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Location on Map
              </h3>
              <p className="text-sm text-gray-600">
                Click on the map or drag the red marker to set the location
              </p>
              {/* NEW: Map Legend */}
              <div className="mt-3 flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>New Location</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Existing ({existingLocations.length})</span>
                </div>
                {loadingLocations && (
                  <div className="flex items-center space-x-1 text-gray-500">
                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="relative h-96">
              <MapContainer
                center={MAASIN_CONFIG.center}
                zoom={MAASIN_CONFIG.zoom}
                style={{ height: "100%", width: "100%" }}
                maxBounds={MAASIN_CONFIG.bounds}
                maxBoundsViscosity={1.0}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapClickHandler />
                <DraggableMarker />
                {/* NEW: Display existing locations */}
                <ExistingLocationsMarkers />
              </MapContainer>
            </div>

            <div className="p-4 bg-gray-50 text-sm text-gray-600">
              <p>
                <strong>Instructions:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Click anywhere on the map to place the red marker</li>
                <li>Drag the red marker to adjust the position</li>
                <li>
                  Enter coordinates manually to position the marker precisely
                </li>
                <li>Blue markers show existing water sources</li>
                <li>The marker is restricted to the Maasin City area</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLocationImproved;
