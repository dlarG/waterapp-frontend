import React, { useRef, useState, useCallback } from "react";
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

// Maasin City configuration
const MAASIN_CONFIG = {
  center: [10.173022, 124.825287],
  zoom: 13,
  bounds: [
    [10.108537, 124.748792], // Southwest corner
    [10.250638, 124.943169], // Northeast corner
  ],
};

const AddLocation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const mapRef = useRef(null); // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    description: "",
    latitude: MAASIN_CONFIG.center[0].toString(),
    longitude: MAASIN_CONFIG.center[1].toString(),
    coliform_bacteria: null,
    e_coli: null,
    sample_date: "",
    sample_time: "",
    barangay_name: "",
    image_path: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Barangay options for dropdown
  const barangayOptions = [
    "batuan",
    "combado",
    "hantag",
    "malapoc-norte",
    "malapoc-sur",
    "matin_ao",
    "rizal",
    "san_isidro",
    // Add more barangays as needed
  ];

  // Check if coordinates are within Maasin bounds
  const isWithinBounds = useCallback((lat, lng) => {
    const [swLat, swLng] = MAASIN_CONFIG.bounds[0];
    const [neLat, neLng] = MAASIN_CONFIG.bounds[1];
    return lat >= swLat && lat <= neLat && lng >= swLng && lng <= neLng;
  }, []);

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

  // Custom draggable marker component
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
            alert("Marker must stay within Maasin City bounds.");
            // Reset marker to previous position
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
      />
    );
  };
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked ? true : null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
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
      const submitData = {
        full_name: formData.full_name.trim(),
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
        alert("✅ Location added successfully!");
        navigate("/dashboard");
      } else {
        alert(`❌ Error: ${response.error}`);
      }
    } catch (error) {
      console.error("❌ Submit error:", error);
      alert(`❌ Error adding location: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Image handling functions
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, GIF, or WEBP)");
        return;
      }

      // Validate file size (16MB max)
      const maxSize = 16 * 1024 * 1024; // 16MB
      if (file.size > maxSize) {
        alert("File size must be less than 16MB");
        return;
      }

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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Dashboard
              </button>
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
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
              </div>{" "}
              {/* Barangay Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barangay (Optional)
                </label>
                <select
                  name="barangay_name"
                  value={formData.barangay_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.barangay_name ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Barangay</option>
                  {barangayOptions.map((barangay) => (
                    <option key={barangay} value={barangay}>
                      {barangay.charAt(0).toUpperCase() +
                        barangay.slice(1).replace("-", " ")}
                    </option>
                  ))}
                </select>
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
              {/* Water Quality Tests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Water Quality Tests (Optional)
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="coliform_bacteria"
                      checked={formData.coliform_bacteria === true}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700">
                      Coliform Bacteria Present
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="e_coli"
                      checked={formData.e_coli === true}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700">
                      E. Coli Present
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Leave unchecked if tests haven't been performed yet
                </p>
              </div>
              {/* Sample Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sample Date
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
                    Sample Time
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
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Location Image (Optional)
                </label>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-4">
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

                {/* File Input */}
                <div className="flex items-center space-x-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
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

                  {formData.image_path && (
                    <span className="text-sm text-green-600 flex items-center space-x-1">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Image uploaded</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: JPEG, PNG, GIF, WEBP (Max: 16MB)
                </p>
              </div>
              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Location</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Location on Map
              </h3>
              <p className="text-sm text-gray-600">
                Click on the map or drag the marker to set the location
              </p>
            </div>{" "}
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
              </MapContainer>
            </div>
            <div className="p-4 bg-gray-50 text-sm text-gray-600">
              <p>
                <strong>Instructions:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Click anywhere on the map to place a marker</li>
                <li>Drag the blue marker to adjust the position</li>
                <li>
                  Enter coordinates manually to position the marker precisely
                </li>
                <li>The marker is restricted to the Maasin City area</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLocation;
