import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { waterLocationAPI } from "./api/api";
import "mapbox-gl/dist/mapbox-gl.css";

// You need to get a free API key from https://www.mapbox.com/
mapboxgl.accessToken =
  "pk.eyJ1IjoidGVzdC11c2VyIiwiYSI6ImNsdHh4eXh4eDAwMDAzamxhbGpzdDEyeXEifQ.XXX"; // Replace with your Mapbox token

const MapView = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Maasin City, Southern Leyte bounds
  const MAASIN_BOUNDS = {
    center: [125.03, 10.13], // [lng, lat]
    zoom: 13,
    maxBounds: [
      [124.95, 10.05], // Southwest coordinates [lng, lat]
      [125.05, 10.15], // Northeast coordinates [lng, lat]
    ],
  };

  // Water status colors
  const getStatusColor = (status) => {
    switch (status) {
      case "safe":
        return "#10b981"; // Green
      case "undrinkable":
        return "#f59e0b"; // Orange
      case "hazard":
        return "#ef4444"; // Red
      default:
        return "#6b7280"; // Gray
    }
  };

  // Create marker HTML
  const createMarkerElement = (location) => {
    const el = document.createElement("div");
    el.className = "custom-marker";
    el.style.cssText = `
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: ${getStatusColor(location.water_status)};
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: transform 0.2s ease;
    `;

    // Add hover effect
    el.addEventListener("mouseenter", () => {
      el.style.transform = "scale(1.2)";
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "scale(1)";
    });

    return el;
  };

  // Create popup content
  const createPopupContent = (location) => {
    const statusColors = {
      safe: "bg-green-100 text-green-800 border-green-200",
      undrinkable: "bg-orange-100 text-orange-800 border-orange-200",
      hazard: "bg-red-100 text-red-800 border-red-200",
    };

    return `
      <div class="p-4 max-w-sm">
        <div class="mb-3">
          <h3 class="font-bold text-lg text-gray-900 mb-1">${
            location.full_name
          }</h3>
          <div class="flex items-center space-x-2">
            <span class="px-2 py-1 rounded-full text-xs font-semibold border ${
              statusColors[location.water_status] || statusColors.safe
            }">
              ${location.water_status.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div class="space-y-2 text-sm">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <span class="font-medium text-gray-600">Coliform:</span>
              <span class="ml-1 ${
                location.coliform_bacteria
                  ? "text-red-600 font-semibold"
                  : "text-green-600"
              }">
                ${location.coliform_bacteria ? "Present" : "Absent"}
              </span>
            </div>
            <div>
              <span class="font-medium text-gray-600">E. Coli:</span>
              <span class="ml-1 ${
                location.e_coli
                  ? "text-red-600 font-semibold"
                  : "text-green-600"
              }">
                ${location.e_coli ? "Present" : "Absent"}
              </span>
            </div>
          </div>
          
          ${
            location.sample_date
              ? `
            <div>
              <span class="font-medium text-gray-600">Sample Date:</span>
              <span class="ml-1">${new Date(
                location.sample_date
              ).toLocaleDateString()}</span>
            </div>
          `
              : ""
          }
          
          <div class="text-xs text-gray-500 mt-2">
            Coordinates: ${location.latitude.toFixed(
              6
            )}, ${location.longitude.toFixed(6)}
          </div>
        </div>
      </div>
    `;
  };

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12", // Satellite imagery
      center: MAASIN_BOUNDS.center,
      zoom: MAASIN_BOUNDS.zoom,
      maxBounds: MAASIN_BOUNDS.maxBounds,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add scale control
    map.current.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: "metric",
      })
    );

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Fetch water locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await waterLocationAPI.getAll();
        if (response.success) {
          setLocations(response.data);
        } else {
          setError("Failed to load water locations");
        }
      } catch (err) {
        setError("Error fetching data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Add markers to map
  useEffect(() => {
    if (!map.current || locations.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    locations.forEach((location) => {
      if (location.latitude && location.longitude) {
        const el = createMarkerElement(location);

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
        }).setHTML(createPopupContent(location));

        const marker = new mapboxgl.Marker(el)
          .setLngLat([location.longitude, location.latitude])
          .setPopup(popup)
          .addTo(map.current);

        // Store marker reference
        markersRef.current.push(marker);

        // Handle marker click
        el.addEventListener("click", () => {
          setSelectedLocation(location);
          popup.addTo(map.current);
        });
      }
    });
  }, [locations]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading water monitoring locations...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.54-.833-2.310 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Map
          </h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              Water Quality Map - Maasin, Southern Leyte
            </h1>
          </div>
          <div className="text-sm text-gray-600">
            {locations.length} monitoring location
            {locations.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-20 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs">
        <h3 className="font-semibold text-gray-900 mb-3">
          Water Status Legend
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow"></div>
            <span className="text-sm text-gray-700">Safe to drink</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow"></div>
            <span className="text-sm text-gray-700">Not drinkable</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow"></div>
            <span className="text-sm text-gray-700">Hazardous</span>
          </div>
        </div>
      </div>

      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapView;
