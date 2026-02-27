/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { waterLocationAPI, householdAPI } from "./api/api";
import "mapbox-gl/dist/mapbox-gl.css";

const MapView = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const popupsRef = useRef([]);
  const [locations, setLocations] = useState([]);
  const [mapStatus, setMapStatus] = useState("initializing");

  const [viewMode, setViewMode] = useState("markers"); // "markers" or "heatmap"
  // eslint-disable-next-line no-unused-vars
  const [householdData, setHouseholdData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);

  const fetchHouseholdData = async () => {
    try {
      setHeatmapLoading(true);
      console.log("🔍 Starting household data fetch...");

      const [householdsResponse, riskResponse] = await Promise.all([
        householdAPI.getAll(),
        householdAPI.getRiskAnalysis(),
      ]);

      console.log("🏠 Households response:", householdsResponse);
      console.log("🎯 Risk response:", riskResponse);

      if (householdsResponse.success) {
        setHouseholdData(householdsResponse.data);
        console.log(
          `✅ Loaded ${householdsResponse.data.length} household clusters`
        );
      } else {
        console.error(
          "❌ Households request failed:",
          householdsResponse.error
        );
      }

      if (riskResponse.success) {
        setRiskData(riskResponse.data);
        console.log(`✅ Loaded ${riskResponse.data.length} risk zones`);
      } else {
        console.error("❌ Risk analysis request failed:", riskResponse.error);
      }
    } catch (error) {
      console.error("❌ Error fetching household data:", error);
      alert(`Error loading heatmap data: ${error.message}`);
    } finally {
      setHeatmapLoading(false);
    }
  };

  // NEW: Add heatmap layer
  const addHeatmapLayer = () => {
    console.log("🗺️ Adding heatmap layer...");
    console.log("Map available:", !!map.current);
    console.log("Risk data length:", riskData.length);

    if (!map.current) {
      console.error("❌ Map not available");
      return;
    }

    if (!riskData.length) {
      console.error("❌ No risk data available");
      alert(
        "No risk data available for heatmap. Please ensure you have contaminated water sources and household data."
      );
      return;
    }

    // Remove existing heatmap layer if it exists
    if (map.current.getLayer("household-heatmap")) {
      console.log("🗑️ Removing existing heatmap layer");
      map.current.removeLayer("household-heatmap");
    }
    if (map.current.getSource("household-heatmap")) {
      map.current.removeSource("household-heatmap");
    }
    if (map.current.getLayer("household-risk-points")) {
      map.current.removeLayer("household-risk-points");
    }

    console.log("📊 Creating heatmap with", riskData.length, "risk points");

    // Prepare GeoJSON data for heatmap
    const heatmapData = {
      type: "FeatureCollection",
      features: riskData.map((point) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [point.longitude, point.latitude],
        },
        properties: {
          risk_score: point.risk_score,
          household_count: point.household_count,
          water_source: point.water_source,
          contamination: point.contamination_type,
        },
      })),
    };

    // Add heatmap source
    map.current.addSource("household-heatmap", {
      type: "geojson",
      data: heatmapData,
    });

    // Add heatmap layer
    map.current.addLayer({
      id: "household-heatmap",
      type: "heatmap",
      source: "household-heatmap",
      maxzoom: 18,
      paint: {
        // Increase the heatmap weight based on risk score
        "heatmap-weight": [
          "interpolate",
          ["linear"],
          ["get", "risk_score"],
          0,
          0,
          500,
          1,
        ],
        // Increase the heatmap color intensity based on zoom level
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 10, 3],
        // Color ramp for heatmap - red indicates higher risk
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(33,102,172,0)",
          0.2,
          "rgb(103,169,207)",
          0.4,
          "rgb(209,229,240)",
          0.6,
          "rgb(253,219,199)",
          0.8,
          "rgb(239,138,98)",
          1,
          "rgb(178,24,43)",
        ],
        // Adjust the heatmap radius by zoom level
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 20, 18, 40],
      },
    });

    // Add circle layer for high zoom levels
    map.current.addLayer({
      id: "household-risk-points",
      type: "circle",
      source: "household-heatmap",
      minzoom: 14,
      paint: {
        // Size circle radius by risk score
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["get", "risk_score"],
          1,
          4,
          50,
          20,
        ],
        // Color circle by risk score
        "circle-color": [
          "interpolate",
          ["linear"],
          ["get", "risk_score"],
          0,
          "#2563eb",
          10,
          "#f59e0b",
          25,
          "#ef4444",
          50,
          "#991b1b",
        ],
        "circle-stroke-color": "white",
        "circle-stroke-width": 1,
        "circle-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0, 16, 1],
      },
    });

    // Add click handler forMAA risk points
    map.current.on("click", "household-risk-points", (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const properties = e.features[0].properties;

      // Create popup for risk area
      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(
          `
          <div style="padding: 15px; max-width: 300px;">
            <h3 style="margin: 0 0 10px 0; color: #dc2626; font-size: 14px;">
              ⚠️ High Risk Area
            </h3>
            <div style="margin-bottom: 8px;">
              <strong>Households:</strong> ${properties.household_count}
            </div>
            <div style="margin-bottom: 8px;">
              <strong>Risk Score:</strong> ${Math.round(properties.risk_score)}
            </div>
            <div style="margin-bottom: 8px;">
              <strong>Nearby Contaminated Source:</strong><br>
              ${properties.water_source}
            </div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
              This area shows increased risk due to proximity to contaminated water sources and household density.
            </div>
          </div>
        `
        )
        .addTo(map.current);
    });

    // Change cursor on hover
    map.current.on("mouseenter", "household-risk-points", () => {
      map.current.getCanvas().style.cursor = "pointer";
    });

    map.current.on("mouseleave", "household-risk-points", () => {
      map.current.getCanvas().style.cursor = "";
    });
  };

  const removeHeatmapLayer = () => {
    if (!map.current) return;

    // Remove layers and source
    ["household-heatmap", "household-risk-points"].forEach((layerId) => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });

    if (map.current.getSource("household-heatmap")) {
      map.current.removeSource("household-heatmap");
    }
  };

  // NEW: Toggle between views
  const toggleViewMode = async () => {
    if (viewMode === "markers") {
      // Switch to heatmap
      if (riskData.length === 0) {
        await fetchHouseholdData();
      }

      // Hide markers
      markersRef.current.forEach((marker) => {
        marker.getElement().style.display = "none";
      });

      // Show heatmap
      addHeatmapLayer();
      setViewMode("heatmap");
    } else {
      // Switch to markers
      removeHeatmapLayer();

      // Show markers
      markersRef.current.forEach((marker) => {
        marker.getElement().style.display = "block";
      });

      setViewMode("markers");
    }
  };

  // Load household data when component mounts
  useEffect(() => {
    fetchHouseholdData();
  }, []);

  // NEW: Image viewer state
  const [imageViewer, setImageViewer] = useState({
    isOpen: false,
    imageSrc: "",
    locationName: "",
    zoom: 1,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    position: { x: 0, y: 0 },
  });

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_KEY;

  const MAASIN_CONFIG = {
    center: [124.748792, 10.108537],
    zoom: 14.5,
    bounds: [
      [124.748792, 10.108537], // Southwest corner
      [124.943169, 10.250638], // Northeast corner
    ],
  };

  // Enhanced status color function with grey for no samples
  const getStatusColor = (status, hasResults) => {
    if (!hasResults) {
      return "#9ca3af";
    }
    switch (status) {
      case "safe":
        return "#10b981";
      case "undrinkable":
        return "#f59e0b";
      case "hazard":
        return "#ef4444";
      default:
        return "#9ca3af";
    }
  };

  const hasTestResults = (location) => {
    return location.coliform_bacteria !== null || location.e_coli !== null;
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === null || dateString === undefined) {
      return "No sample date";
    }

    try {
      let date;

      if (typeof dateString === "string") {
        if (dateString.includes("T") || dateString.includes("-")) {
          date = new Date(dateString);
        } else {
          date = new Date(dateString);
        }
      } else if (dateString instanceof Date) {
        date = dateString;
      } else {
        date = new Date(String(dateString));
      }

      if (isNaN(date.getTime())) {
        console.warn("⚠️ Invalid date:", dateString);
        return "Invalid date";
      }

      const formatted = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return formatted;
    } catch (error) {
      console.error("❌ Date formatting error:", error, "Input:", dateString);
      return "Date error";
    }
  };

  // Enhanced time formatting with better error handling
  const formatTime = (timeString) => {
    if (!timeString || timeString === null || timeString === undefined) {
      return "No sample time";
    }

    try {
      let timeStr = String(timeString).trim();

      if (timeStr.includes(":")) {
        const timeParts = timeStr.split(":");
        const hours = parseInt(timeParts[0]);
        const minutes = timeParts[1] || "00";

        if (isNaN(hours) || hours < 0 || hours > 23) {
          console.warn("⚠️ Invalid hours:", hours);
          return "Invalid time";
        }

        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        const formatted = `${displayHours}:${minutes} ${ampm}`;

        return formatted;
      } else {
        const hours = parseInt(timeStr);
        if (!isNaN(hours) && hours >= 0 && hours <= 23) {
          const ampm = hours >= 12 ? "PM" : "AM";
          const displayHours = hours % 12 || 12;
          return `${displayHours}:00 ${ampm}`;
        }
      }

      return timeString;
    } catch (error) {
      console.error("❌ Time formatting error:", error, "Input:", timeString);
      return "Time error";
    }
  };

  // Get bacteria status text
  const getBacteriaStatus = (bacteriaValue) => {
    if (bacteriaValue === null) return "Not tested";
    return bacteriaValue ? "Present" : "Absent";
  };

  // Get bacteria status color
  const getBacteriaColor = (bacteriaValue) => {
    if (bacteriaValue === null) return "#9ca3af";
    return bacteriaValue ? "#ef4444" : "#10b981";
  };

  // NEW: Open image viewer
  const openImageViewer = (imagePath, locationName) => {
    setImageViewer({
      isOpen: true,
      imageSrc: imagePath,
      locationName: locationName,
      zoom: 1,
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      position: { x: 0, y: 0 },
    });
  };

  // NEW: Close image viewer
  const closeImageViewer = () => {
    setImageViewer((prev) => ({
      ...prev,
      isOpen: false,
      zoom: 1,
      position: { x: 0, y: 0 },
    }));
  };

  // NEW: Zoom functions
  const zoomIn = () => {
    setImageViewer((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom + 0.5, 5),
    }));
  };

  const zoomOut = () => {
    setImageViewer((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom - 0.5, 0.5),
    }));
  };

  const resetZoom = () => {
    setImageViewer((prev) => ({
      ...prev,
      zoom: 1,
      position: { x: 0, y: 0 },
    }));
  };

  // NEW: Download image
  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = imageViewer.imageSrc;
    link.download = `${imageViewer.locationName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_water_source.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // NEW: Handle image dragging
  const handleMouseDown = (e) => {
    if (imageViewer.zoom > 1) {
      setImageViewer((prev) => ({
        ...prev,
        isDragging: true,
        dragStart: {
          x: e.clientX - prev.position.x,
          y: e.clientY - prev.position.y,
        },
      }));
    }
  };

  const handleMouseMove = (e) => {
    if (imageViewer.isDragging && imageViewer.zoom > 1) {
      setImageViewer((prev) => ({
        ...prev,
        position: {
          x: e.clientX - prev.dragStart.x,
          y: e.clientY - prev.dragStart.y,
        },
      }));
    }
  };

  const handleMouseUp = () => {
    setImageViewer((prev) => ({
      ...prev,
      isDragging: false,
    }));
  };

  // NEW: Enhanced image display with click handler
  const getImageDisplay = (imagePath, locationName) => {
    if (!imagePath) {
      return `
        <div style="
          width: 100%;
          height: 150px;
          background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          margin-bottom: 10px;
          color: #9ca3af;
          font-size: 12px;
        ">
          📷 No image available
        </div>
      `;
    }

    return `
      <div style="margin-bottom: 15px;">
        <div class="image-container" onclick="window.openImageViewer('${imagePath}', '${locationName}')" style="
          position: relative;
          cursor: pointer;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        "
        onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'"
        >
          <img 
            src="${imagePath}" 
            alt="${locationName}"
            style="
              width: 100%;
              height: 150px;
              object-fit: cover;
              display: block;
            "
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          />
          <div style="
            width: 100%;
            height: 150px;
            background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
            display: none;
            align-items: center;
            justify-content: center;
            color: #9ca3af;
            font-size: 12px;
          ">
            📷 Image not found
          </div>
        </div>
        <div style="
          font-size: 10px;
          color: #9ca3af;
          text-align: center;
          margin-top: 5px;
        ">
           Click to view full size • Water source at ${locationName}
        </div>
      </div>
    `;
  };

  // Make openImageViewer available globally for inline onclick
  useEffect(() => {
    window.openImageViewer = openImageViewer;
    return () => {
      delete window.openImageViewer;
    };
  }, []);

  // Fetch locations with debug info
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await waterLocationAPI.getAll();
        if (response.success && response.data) {
          setLocations(response.data);
        }
      } catch (err) {
        console.error("❌ Error:", err);
      }
    };
    fetchLocations();
  }, []);

  // 🗺️ UPDATED: Initialize map with Maasin bounds and configuration
  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    mapboxgl.prewarm = () => {};
    mapboxgl.clearPrewarmedResources = () => {};

    try {
      setMapStatus("creating");

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v12", // Use satellite streets for better visibility
        center: MAASIN_CONFIG.center,
        zoom: MAASIN_CONFIG.zoom,
        maxBounds: MAASIN_CONFIG.bounds, // 🔒 Lock map to Maasin area
        maxBoundsViscosity: 1.0, // Prevent panning outside bounds
        projection: "mercator",
        attributionControl: true,
        trackResize: true,
        preserveDrawingBuffer: false,
        antialias: false,
        optimizeForTerrain: false,
        failIfMajorPerformanceCaveat: false, // Allow map to load even on slower devices
      });

      map.current.on("load", () => {
        setMapStatus("loaded");
        map.current.setMaxBounds(MAASIN_CONFIG.bounds);
      });

      map.current.on("error", (e) => {
        console.error("❌ Map error:", e);
        setMapStatus("error");
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add scale control
      map.current.addControl(
        new mapboxgl.ScaleControl({
          maxWidth: 80,
          unit: "metric",
        }),
        "bottom-left"
      );
    } catch (error) {
      console.error("❌ Map initialization error:", error);
      setMapStatus("error");
    }

    return () => {
      if (map.current) {
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];
        popupsRef.current.forEach((popup) => popup.remove());
        popupsRef.current = [];
        map.current.remove();
        map.current = null;
      }
      delete window.resetMapToMaasin;
    };
  }, []);

  // Status explanation helper
  const getStatusExplanation = (status, hasResults) => {
    if (!hasResults) {
      return "⏳ This location has been identified but water samples have not been collected or tested yet. Testing is required to determine water quality status.";
    }

    switch (status) {
      case "safe":
        return "✅ Water quality tests indicate this source is safe for drinking. No harmful bacteria detected.";
      case "undrinkable":
        return "⚠️ Water quality tests show presence of bacteria. This water should be treated before consumption.";
      case "hazard":
        return "🚨 Water quality tests show bacterial contamination. This water is unsafe for drinking and requires treatment.";
      default:
        return "❓ Water quality status needs further evaluation.";
    }
  };

  // Add markers when map and data are ready
  useEffect(() => {
    if (mapStatus === "loaded" && locations.length > 0 && map.current) {
      addMarkers();
    }
  }, [locations, mapStatus]);

  // ENHANCED: Create popup content with clickable images
  const createPopupContent = (location) => {
    const hasResults = hasTestResults(location);

    return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 0;
        margin: 0;
        max-width: 380px;
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #0787ff 0%,rgb(51, 140, 223) 100%);
          color: white;
          padding: 15px;
          margin: -10px -10px 15px -10px;
          border-radius: 8px 8px 0 0;
        ">
          <h3 style="
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            line-height: 1.3;
          ">${location.full_name}</h3>
          <div style="
            margin-top: 8px;
            font-size: 11px;
            opacity: 0.9;
          ">
            ${location.latitude?.toFixed(6)}, ${location.longitude?.toFixed(6)}
          </div>
        </div>

        <!-- ENHANCED: Clickable Water Source Image -->
        ${getImageDisplay(location.image_path, location.full_name)}

        <!-- Status Badge -->
        <div style="
          margin-bottom: 15px;
          display: flex;
          justify-content: center;
        ">
          <div style="
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            background-color: ${getStatusColor(
              location.water_status,
              hasResults
            )};
            color: white;
            letter-spacing: 0.5px;
          ">
            ${hasResults ? location.water_status : "NO SAMPLE YET"}
          </div>
        </div>

        <!-- Sample Information -->
        <div style="margin-bottom: 15px;">
          <div style="
            font-size: 13px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            margin-left: 2px;
            display: flex;
            align-items: center;
          ">
            Sample Information
          </div>
          
          <div style="
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-size: 12px;
            margin-left: 5px;
            border-bottom: 1px solid #f3f4f6;
          ">
            <span style="color: #6b7280;">Date:</span>
            <span style="color: #1f2937; font-weight: 500;">
              ${formatDate(location.sample_date)}
            </span>
          </div>

          <div style="
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            margin-left: 5px;
            font-size: 12px;
          ">
            <span style="color: #6b7280;">Time:</span>
            <span style="color: #1f2937; font-weight: 500;">
              ${formatTime(location.sample_time)}
            </span>
          </div>
        </div>

        <!-- Test Results -->
        <div style="margin-bottom: 10px;">
          <div style="
            font-size: 13px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
          ">
            Test Results
          </div>
          
          <div style="
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 12px;
            margin-left: 5px;
            border-bottom: 1px solid #f3f4f6;
          ">
            <span style="color: #6b7280;">Coliform Bacteria:</span>
            <span style="
              color: ${getBacteriaColor(location.coliform_bacteria)};
              font-weight: 600;
            ">
              ${getBacteriaStatus(location.coliform_bacteria)}
            </span>
          </div>

          <div style="
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            margin-left: 5px;
            font-size: 12px;
          ">
            <span style="color: #6b7280;">E. Coli:</span>
            <span style="
              color: ${getBacteriaColor(location.e_coli)};
              font-weight: 600;
            ">
              ${getBacteriaStatus(location.e_coli)}
            </span>
          </div>
        </div>

        <!-- Status Explanation -->
        <div style="
          background: #f9fafb;
          padding: 10px;
          border-radius: 6px;
          border-left: 4px solid ${getStatusColor(
            location.water_status,
            hasResults
          )};
          margin-top: 10px;
        ">
          <div style="
            font-size: 11px;
            color: #4b5563;
            line-height: 1.4;
          ">
            ${getStatusExplanation(location.water_status, hasResults)}
          </div>
        </div>
      </div>
    `;
  };

  // Enhanced add markers function with proper marker storage
  const addMarkers = () => {
    if (!map.current || !locations.length) return;

    // Clear existing markers and popups
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    popupsRef.current.forEach((popup) => popup.remove());
    popupsRef.current = [];

    // Calculate bounds for all locations within Maasin
    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((location) => {
      if (location.latitude && location.longitude) {
        const hasResults = hasTestResults(location);
        const lngLat = [location.longitude, location.latitude];

        // 🔍 Check if location is within Maasin bounds
        const isInMaasin =
          location.longitude >= MAASIN_CONFIG.bounds[0][0] &&
          location.longitude <= MAASIN_CONFIG.bounds[1][0] &&
          location.latitude >= MAASIN_CONFIG.bounds[0][1] &&
          location.latitude <= MAASIN_CONFIG.bounds[1][1];

        // Only add markers for locations within Maasin bounds
        if (isInMaasin) {
          bounds.extend(lngLat);

          // Create marker element - SIMPLIFIED VERSION
          const el = document.createElement("div");
          el.className = "custom-marker";
          el.style.cssText = `
            width: 16px; 
            height: 16px; 
            border-radius: 50%;
            background-color: ${getStatusColor(
              location.water_status,
              hasResults
            )};
            border: 3px solid white; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            cursor: pointer;
            position: relative;
            z-index: 1;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            pointer-events: auto;
          `;

          // Create a container div for better positioning
          const container = document.createElement("div");
          container.style.cssText = `
            position: absolute;
            width: 28px;
            height: 28px;
            pointer-events: auto;
            cursor: pointer;
          `;
          container.appendChild(el);

          // Store the location data
          el.dataset.locationId = location.id || location.full_name;

          // Create marker using the container
          const marker = new mapboxgl.Marker({
            element: container,
            anchor: "center",
          })
            .setLngLat(lngLat)
            .addTo(map.current);

          // Add hover effect
          container.addEventListener("mouseenter", () => {
            el.style.transform = "scale(1.2)";
            el.style.zIndex = "2";
            el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
          });

          container.addEventListener("mouseleave", () => {
            el.style.transform = "scale(1)";
            el.style.zIndex = "1";
            el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
          });

          const openPopup = () => {
            // Remove any existing popups
            popupsRef.current.forEach((popup) => popup.remove());
            popupsRef.current = [];

            // Create new popup with larger maxWidth for images
            const popup = new mapboxgl.Popup({
              closeButton: true,
              closeOnClick: true,
              maxWidth: "400px", // Increased for images
              offset: 25,
              className: "water-quality-popup",
            })
              .setLngLat(lngLat)
              .setHTML(createPopupContent(location))
              .addTo(map.current);

            popupsRef.current.push(popup);

            // Focus on the marker when popup opens
            map.current.flyTo({
              center: lngLat,
              zoom: Math.max(map.current.getZoom(), 16),
              duration: 1000,
            });

            // Remove popup from refs when it closes
            popup.on("close", () => {
              const index = popupsRef.current.indexOf(popup);
              if (index > -1) {
                popupsRef.current.splice(index, 1);
              }
            });
          };

          // Add click handler to both elements
          container.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            openPopup();
          });

          el.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            openPopup();
          });

          markersRef.current.push(marker);
        }
      }
    });

    // Fit map to bounds if we have multiple locations within Maasin
    if (markersRef.current.length > 1) {
      setTimeout(() => {
        if (map.current) {
          map.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 16,
            duration: 2000,
          });
        }
      }, 500);
    } else if (markersRef.current.length === 1) {
      // Center on single marker
      const firstLocation = locations.find(
        (loc) =>
          loc.longitude >= MAASIN_CONFIG.bounds[0][0] &&
          loc.longitude <= MAASIN_CONFIG.bounds[1][0] &&
          loc.latitude >= MAASIN_CONFIG.bounds[0][1] &&
          loc.latitude <= MAASIN_CONFIG.bounds[1][1]
      );

      if (firstLocation) {
        setTimeout(() => {
          if (map.current) {
            map.current.flyTo({
              center: [firstLocation.longitude, firstLocation.latitude],
              zoom: 15,
              duration: 1000,
            });
          }
        }, 500);
      }
    }
  };

  // NEW: Handle keyboard shortcuts for image viewer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!imageViewer.isOpen) return;

      switch (e.key) {
        case "Escape":
          closeImageViewer();
          break;
        case "+":
        case "=":
          e.preventDefault();
          zoomIn();
          break;
        case "-":
          e.preventDefault();
          zoomOut();
          break;
        case "0":
          e.preventDefault();
          resetZoom();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [imageViewer.isOpen]);

  // Error state
  if (mapStatus === "error") {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            maxWidth: "400px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
          <h2 style={{ color: "#ef4444", marginBottom: "15px" }}>Map Error</h2>
          <p style={{ color: "#6b7280", marginBottom: "20px" }}>
            Unable to load the Maasin water monitoring map. Please check your
            connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* <div className="modern-header">
        <div className="header-content">
          <div className="header-left">
            <button
              onClick={() => window.history.back()}
              className="back-button"
            >
              ←
            </button>
            <div className="header-title">
              <h1>Water Quality Monitoring - Maasin City</h1>
              <p>Southern Leyte, Philippines</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stats-item">
              <span className="stats-value">{locations.length}</span>
              <span className="stats-label">Total Locations</span>
            </div>
          </div>
        </div>
      </div> */}

      <div className="view-toggle-container">
        <button
          className={`view-toggle-btn ${
            viewMode === "markers" ? "active" : ""
          }`}
          onClick={toggleViewMode}
          disabled={heatmapLoading}
        >
          {heatmapLoading ? (
            <span>Loading...</span>
          ) : viewMode === "markers" ? (
            <>Show Risk Heatmap</>
          ) : (
            <>Show Water Sources</>
          )}
        </button>

        {viewMode === "heatmap" && (
          <div className="heatmap-legend">
            <h4>Risk Level</h4>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-color low-risk"></span>
                <span>Low Risk</span>
              </div>
              <div className="legend-item">
                <span className="legend-color medium-risk"></span>
                <span>Medium Risk</span>
              </div>
              <div className="legend-item">
                <span className="legend-color high-risk"></span>
                <span>High Risk</span>
              </div>
            </div>
            <p className="legend-description">
              Risk based on household density near contaminated water sources
            </p>
          </div>
        )}
      </div>

      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#f0f0f0",
        }}
      />

      {/* NEW: Image Viewer Modal */}
      {imageViewer.isOpen && (
        <div
          className="image-viewer-overlay"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Image Viewer Controls */}
          <div className="image-viewer-controls">
            <div className="control-group">
              <button
                onClick={zoomOut}
                className="control-btn"
                title="Zoom Out (-)"
              >
                −
              </button>
              <span className="zoom-display">
                {Math.round(imageViewer.zoom * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="control-btn"
                title="Zoom In (+)"
              >
                +
              </button>
              <button
                onClick={resetZoom}
                className="control-btn"
                title="Reset Zoom (0)"
              >
                ↻
              </button>
            </div>
            <div className="control-group">
              <button
                onClick={downloadImage}
                className="control-btn"
                title="Download Image"
              >
                ↓
              </button>
              <button
                onClick={closeImageViewer}
                className="control-btn close-btn"
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div className="image-viewer-container">
            <img
              src={imageViewer.imageSrc}
              alt={imageViewer.locationName}
              className="viewer-image"
              style={{
                transform: `scale(${imageViewer.zoom}) translate(${
                  imageViewer.position.x / imageViewer.zoom
                }px, ${imageViewer.position.y / imageViewer.zoom}px)`,
                cursor:
                  imageViewer.zoom > 1
                    ? imageViewer.isDragging
                      ? "grabbing"
                      : "grab"
                    : "default",
              }}
              onMouseDown={handleMouseDown}
              draggable={false}
            />
          </div>

          {mapStatus === "creating" && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(255,255,255,0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 20,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "4px solid #e5e7eb",
                    borderTop: "4px solid #3b82f6",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 15px",
                  }}
                ></div>
                <p
                  style={{
                    margin: 0,
                    color: "#4b5563",
                    fontSize: "16px",
                    marginBottom: "5px",
                  }}
                >
                  Loading Maasin Water Quality Map...
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "#9ca3af",
                    fontSize: "12px",
                  }}
                >
                  {heatmapLoading
                    ? "Analyzing household risk data..."
                    : "Focusing on Maasin City, Southern Leyte"}
                </p>
              </div>
            </div>
          )}

          {/* Image Info */}
          <div className="image-viewer-info">
            <h3>📷 {imageViewer.locationName}</h3>
            <p>
              Water Source in Maasin City • Use +/- keys or buttons to zoom •
              Drag to pan when zoomed
            </p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {mapStatus === "creating" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255,255,255,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #e5e7eb",
                borderTop: "4px solid #3b82f6",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 15px",
              }}
            ></div>
            <p
              style={{
                margin: 0,
                color: "#4b5563",
                fontSize: "16px",
                marginBottom: "5px",
              }}
            >
              Loading Maasin Water Quality Map...
            </p>
            <p
              style={{
                margin: 0,
                color: "#9ca3af",
                fontSize: "12px",
              }}
            >
              Focusing on Maasin City, Southern Leyte
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
