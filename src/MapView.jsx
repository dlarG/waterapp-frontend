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
  const [heatmapIntensity, setHeatmapIntensity] = useState(0.5);
  const [showContaminatedSources, setShowContaminatedSources] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [riskStats, setRiskStats] = useState({
    totalRiskZones: 0,
    highRiskZones: 0,
    mediumRiskZones: 0,
    lowRiskZones: 0,
    avgRiskScore: 0,
  });

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

        // Calculate statistics
        const stats = calculateRiskStats(riskResponse.data);
        setRiskStats(stats);

        console.log(`✅ Loaded ${riskResponse.data.length} risk zones`);
        console.log("📊 Risk Statistics:", stats);
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

  // Calculate risk statistics
  const calculateRiskStats = (data) => {
    if (!data.length)
      return {
        totalRiskZones: 0,
        highRiskZones: 0,
        mediumRiskZones: 0,
        lowRiskZones: 0,
        avgRiskScore: 0,
      };

    const highRisk = data.filter((d) => d.risk_score > 25).length;
    const mediumRisk = data.filter(
      (d) => d.risk_score > 10 && d.risk_score <= 25
    ).length;
    const lowRisk = data.filter((d) => d.risk_score <= 10).length;
    const avgScore =
      data.reduce((sum, d) => sum + d.risk_score, 0) / data.length;

    return {
      totalRiskZones: data.length,
      highRiskZones: highRisk,
      mediumRiskZones: mediumRisk,
      lowRiskZones: lowRisk,
      avgRiskScore: Math.round(avgScore * 10) / 10,
    };
  };

  // ENHANCED: Add heatmap layer with multiple visualization options
  const addHeatmapLayer = () => {
    console.log("🗺️ Adding enhanced heatmap layer...");
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

    // Remove existing layers if they exist
    removeHeatmapLayer();

    console.log(
      "📊 Creating enhanced heatmap with",
      riskData.length,
      "risk points"
    );

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
          coliform: point.contamination_type?.coliform || false,
          e_coli: point.contamination_type?.e_coli || false,
          risk_level:
            point.risk_score > 25
              ? "high"
              : point.risk_score > 10
              ? "medium"
              : "low",
        },
      })),
    };

    // Add heatmap source
    map.current.addSource("household-heatmap", {
      type: "geojson",
      data: heatmapData,
    });

    // ENHANCED: Main heatmap layer with better color gradient
    map.current.addLayer({
      id: "household-heatmap",
      type: "heatmap",
      source: "household-heatmap",
      maxzoom: 18,
      paint: {
        // Increase the heatmap weight based on risk score with exponential scaling
        "heatmap-weight": [
          "interpolate",
          ["linear"],
          ["get", "risk_score"],
          0,
          0,
          5,
          0.3,
          25,
          0.6,
          50,
          1.0,
          100,
          1.3,
        ],

        // ENHANCED: Dynamically adjust intensity based on zoom level
        // Lower intensity when zoomed out, higher when zoomed in
        "heatmap-intensity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          heatmapIntensity * 0.8,
          10,
          heatmapIntensity * 1.2,
          18,
          heatmapIntensity * 1.5,
        ],

        // ENHANCED: More intuitive color ramp - blue (low) to red (high)
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(0, 0, 255, 0)", // Transparent blue
          0.1,
          "rgba(65, 105, 225, 0.2)", // Very light blue at low density
          0.3,
          "rgba(65, 105, 225, 0.5)", // Light blue
          0.5,
          "rgba(255, 255, 0, 0.6)", // Yellow
          0.7,
          "rgba(255, 165, 0, 0.8)", // Orange
          0.9,
          "rgba(255, 69, 0, 0.9)", // Red-orange
          1,
          "rgba(139, 0, 0, 1)", // Dark red
        ],

        // ENHANCED: Adjust heatmap radius by zoom level - smaller when zoomed out
        "heatmap-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          5, // Very small radius at far zoom (was 15)
          8,
          10, // Small at medium zoom
          12,
          20, // Medium at closer zoom
          16,
          35, // Larger at very close zoom
          18,
          50, // Largest at max zoom
        ],

        // ENHANCED: Opacity also varies with zoom
        "heatmap-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          0.4, // More transparent when zoomed out
          8,
          0.6,
          12,
          0.7,
          16,
          0.8,
          18,
          0.9, // More opaque when zoomed in
        ],
      },
    });

    // UPDATED: Smaller cluster layer for mid-level zoom
    map.current.addLayer({
      id: "risk-clusters",
      type: "circle",
      source: "household-heatmap",
      minzoom: 18, // Start showing at zoom 13
      maxzoom: 2, // Hide after zoom 15
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["get", "risk_score"],
          0,
          3, // Reduced from 5
          25,
          6, // Reduced from 10
          50,
          9, // Reduced from 15
          100,
          12, // Reduced from 20
        ],
        "circle-color": [
          "match",
          ["get", "risk_level"],
          "high",
          "#ef4444",
          "medium",
          "#f97316",
          "low",
          "#3b82f6",
          "#9ca3af",
        ],
        "circle-stroke-color": "white",
        "circle-stroke-width": 1, // Reduced from 2
        "circle-opacity": 0.7, // Reduced from 0.8
      },
    });

    // UPDATED: Smaller household risk points for high zoom levels
    map.current.addLayer({
      id: "household-risk-points",
      type: "circle",
      source: "household-heatmap",
      minzoom: 15, // Only show at zoom 15 and higher
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["get", "household_count"],
          1,
          3,
          10,
          5,
          50,
          8,
        ],
        "circle-color": [
          "case",
          ["==", ["get", "e_coli"], true],
          "#ef4444",
          ["==", ["get", "coliform"], true],
          "#f97316",
          "#3b82f6",
        ],
        "circle-stroke-color": "white",
        "circle-stroke-width": 1,
        "circle-opacity": 0.8,
      },
    });

    // Add contaminated water sources as markers if enabled
    if (showContaminatedSources) {
      // Get unique contaminated water sources
      const contaminatedSources = [
        ...new Map(
          riskData.map((item) => [
            item.water_source,
            {
              name: item.water_source,
              contamination: item.contamination_type,
              coordinates: [item.longitude, item.latitude],
            },
          ])
        ).values(),
      ];

      const sourceData = {
        type: "FeatureCollection",
        features: contaminatedSources.map((source) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: source.coordinates,
          },
          properties: {
            name: source.name,
            coliform: source.contamination?.coliform || false,
            e_coli: source.contamination?.e_coli || false,
          },
        })),
      };

      map.current.addSource("contaminated-sources", {
        type: "geojson",
        data: sourceData,
      });

      // UPDATED: Contaminated sources with zoom-based visibility
      map.current.addLayer({
        id: "contaminated-sources",
        type: "circle",
        source: "contaminated-sources",
        minzoom: 10,
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            3, // Tiny at zoom 10
            12,
            4,
            14,
            5,
            16,
            6,
            18,
            8, // Larger at max zoom
          ],
          "circle-color": [
            "case",
            ["==", ["get", "e_coli"], true],
            "#dc2626",
            ["==", ["get", "coliform"], true],
            "#f97316",
            "#9ca3af",
          ],
          "circle-stroke-color": "white",
          "circle-stroke-width": 1.5,
          "circle-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            0.5, // More transparent at lower zoom
            14,
            0.7,
            18,
            0.9,
          ],
        },
      });
      // UPDATED: Labels only show at higher zoom levels
      map.current.addLayer({
        id: "contaminated-sources-labels",
        type: "symbol",
        source: "contaminated-sources",
        minzoom: 14, // Show labels at zoom 14 and higher
        layout: {
          "text-field": ["get", "name"],
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            8,
            16,
            10,
            18,
            12,
          ],
          "text-offset": [0, 1.2],
          "text-anchor": "top",
          "text-optional": true,
        },
        paint: {
          "text-color": "#dc2626",
          "text-halo-color": "white",
          "text-halo-width": 2,
          "text-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            0.6,
            16,
            0.8,
            18,
            1,
          ],
        },
      });
    }

    // Add click handler for risk points with enhanced popup
    map.current.on("click", "household-risk-points", (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const properties = e.features[0].properties;

      // Create enhanced popup for risk area
      new mapboxgl.Popup({
        className: "risk-popup",
        maxWidth: "350px",
      })
        .setLngLat(coordinates)
        .setHTML(
          `
      <div style="padding: 15px;">
        <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
          ⚠️ Risk Assessment
        </h3>
        
        <div style="margin-bottom: 12px; background: #f3f4f6; padding: 10px; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #4b5563;">Risk Level:</span>
            <span style="font-weight: 600; color: ${
              properties.risk_score > 25
                ? "#dc2626"
                : properties.risk_score > 10
                ? "#f97316"
                : "#2563eb"
            }">
              ${
                properties.risk_score > 25
                  ? "HIGH"
                  : properties.risk_score > 10
                  ? "MEDIUM"
                  : "LOW"
              }
            </span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #4b5563;">Risk Score:</span>
            <span style="font-weight: 600;">${Math.round(
              properties.risk_score
            )}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #4b5563;">Households:</span>
            <span style="font-weight: 600;">${properties.household_count}</span>
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Nearby Contaminated Source:</h4>
          <p style="margin: 0; color: #4b5563; font-size: 13px; background: #f9fafb; padding: 8px; border-radius: 4px;">
            ${properties.water_source}
          </p>
        </div>

        <div style="margin-bottom: 12px;">
          <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Contamination Type:</h4>
          <div style="display: flex; gap: 10px;">
            ${
              properties.coliform
                ? '<span style="background: #f97316; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">Coliform</span>'
                : ""
            }
            ${
              properties.e_coli
                ? '<span style="background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">E. Coli</span>'
                : ""
            }
          </div>
        </div>

        <div style="font-size: 11px; color: #6b7280; margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
          Click for more details • High risk areas require immediate attention
        </div>
      </div>
    `
        )
        .addTo(map.current);
    });

    // Add click handler for clusters
    map.current.on("click", "risk-clusters", (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const properties = e.features[0].properties;

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(
          `
      <div style="padding: 10px;">
        <h4 style="margin: 0 0 5px 0;">Risk Cluster</h4>
        <p>Risk Level: ${properties.risk_level.toUpperCase()}</p>
        <p>Risk Score: ${Math.round(properties.risk_score)}</p>
        <p>Zoom in to see individual household markers</p>
      </div>
    `
        )
        .addTo(map.current);
    });

    // Change cursor on hover for interactive elements
    ["household-risk-points", "risk-clusters", "contaminated-sources"].forEach(
      (layerId) => {
        if (map.current.getLayer(layerId)) {
          map.current.on("mouseenter", layerId, () => {
            map.current.getCanvas().style.cursor = "pointer";
          });

          map.current.on("mouseleave", layerId, () => {
            map.current.getCanvas().style.cursor = "";
          });
        }
      }
    );
  };

  // FIXED: Remove heatmap layer with proper order
  const removeHeatmapLayer = () => {
    if (!map.current) return;

    // Remove layers in reverse order (children before parents)
    const layersToRemove = [
      "contaminated-sources-labels", // Remove labels first
      "contaminated-sources", // Then remove source circles
      "household-risk-points",
      "risk-clusters",
      "risk-grid",
      "household-heatmap",
    ];

    layersToRemove.forEach((layerId) => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });

    // Remove sources after all layers are removed
    const sourcesToRemove = ["contaminated-sources", "household-heatmap"];
    sourcesToRemove.forEach((sourceId) => {
      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
    });
  };

  // ENHANCED: Toggle between views with better state management
  const toggleViewMode = async () => {
    if (viewMode === "markers") {
      // Switch to heatmap
      if (riskData.length === 0) {
        await fetchHouseholdData();
      }

      // Hide markers
      markersRef.current.forEach((marker) => {
        if (marker.getElement()) {
          marker.getElement().style.display = "none";
        }
      });

      // Show heatmap
      addHeatmapLayer();
      setViewMode("heatmap");
    } else {
      // Switch to markers
      removeHeatmapLayer();

      // Show markers
      markersRef.current.forEach((marker) => {
        if (marker.getElement()) {
          marker.getElement().style.display = "block";
        }
      });

      setViewMode("markers");
    }
  };

  // ENHANCED: Adjust heatmap intensity
  const adjustHeatmapIntensity = (increase) => {
    const newIntensity = increase
      ? Math.min(heatmapIntensity + 0.3, 3)
      : Math.max(heatmapIntensity - 0.3, 0.5);

    setHeatmapIntensity(newIntensity);

    if (viewMode === "heatmap" && map.current.getLayer("household-heatmap")) {
      map.current.setPaintProperty("household-heatmap", "heatmap-intensity", [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        newIntensity * 0.8,
        10,
        newIntensity * 1.2,
        18,
        newIntensity * 1.5,
      ]);
    }
  };

  // Toggle contaminated sources visibility
  const toggleContaminatedSources = () => {
    setShowContaminatedSources(!showContaminatedSources);

    if (viewMode === "heatmap" && map.current) {
      if (map.current.getLayer("contaminated-sources")) {
        map.current.setLayoutProperty(
          "contaminated-sources",
          "visibility",
          !showContaminatedSources ? "visible" : "none"
        );
      } else if (!showContaminatedSources) {
        // Re-add the layer if it doesn't exist
        addHeatmapLayer();
      }
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

  // UPDATED: Get water quality status and color based on new rules
  const getWaterQualityInfo = (location) => {
    const coliform = location.coliform_bacteria;
    const eColi = location.e_coli;

    // Case 1: No tests conducted (both null)
    if (coliform === null && eColi === null) {
      return {
        status: "NO DATA",
        color: "#9ca3af", // Gray
        description:
          "⏳ Water samples have not been collected or tested yet. Testing is required to determine water quality status.",
      };
    }

    // Case 2: E. coli present (regardless of coliform status)
    if (eColi === true) {
      return {
        status: "UNDRINKABLE",
        color: "#ef4444", // Red
        description:
          "🚨 E. coli detected in water sample. This water is unsafe for drinking and requires treatment.",
      };
    }

    // Case 3: Coliform present but E. coli absent
    if (coliform === true && (eColi === false || eColi === null)) {
      return {
        status: "WARNING",
        color: "#f97316", // Orange
        description:
          "⚠️ Coliform bacteria detected but E. coli is absent. Further testing is recommended to ensure water safety.",
      };
    }

    // Case 4: Both bacteria absent (safe)
    if (
      (coliform === false || coliform === null) &&
      (eColi === false || eColi === null)
    ) {
      // Only mark as safe if both are explicitly false or one is false and other null
      // But if one is true, it would have been caught above
      return {
        status: "SAFE",
        color: "#10b981", // Green
        description:
          "✅ Water quality tests indicate this source is safe for drinking. No harmful bacteria detected.",
      };
    }

    // Default fallback
    return {
      status: "UNKNOWN",
      color: "#9ca3af", // Gray
      description: "❓ Water quality status needs further evaluation.",
    };
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
        <div class="image-container" onclick="window.openImageViewer('/${imagePath}', '${locationName}')" style="
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
            src="/${imagePath}" 
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
        style: "mapbox://styles/mapbox/streets-v12",
        center: MAASIN_CONFIG.center,
        zoom: MAASIN_CONFIG.zoom,
        maxBounds: MAASIN_CONFIG.bounds,
        maxBoundsViscosity: 1.0,
        projection: "mercator",
        attributionControl: true,
        trackResize: true,
        preserveDrawingBuffer: false,
        antialias: false,
        optimizeForTerrain: false,
        failIfMajorPerformanceCaveat: false,
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

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");
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

  // UPDATED: Status explanation helper
  const getStatusExplanation = (location) => {
    // eslint-disable-next-line no-unused-vars
    const { status, description } = getWaterQualityInfo(location);
    return description;
  };

  // Add markers when map and data are ready
  useEffect(() => {
    if (mapStatus === "loaded" && locations.length > 0 && map.current) {
      addMarkers();
    }
  }, [locations, mapStatus]);

  // ENHANCED: Create popup content with clickable images
  const createPopupContent = (location) => {
    const { status, color } = getWaterQualityInfo(location);
    // eslint-disable-next-line no-unused-vars
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
            background-color: ${color};
            color: white;
            letter-spacing: 0.5px;
          ">
            ${status}
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
          border-left: 4px solid ${color};
          margin-top: 10px;
        ">
          <div style="
            font-size: 11px;
            color: #4b5563;
            line-height: 1.4;
          ">
            ${getStatusExplanation(location)}
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
        const { color } = getWaterQualityInfo(location);
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
            background-color: ${color};
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
      <div className="map-error-container">
        <div className="map-error-card">
          <div className="map-error-icon">⚠️</div>
          <h2 className="map-error-title">Map Error</h2>
          <p className="map-error-message">
            Unable to load the Maasin water monitoring map. Please check your
            connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="map-error-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="map-wrapper">
      {/* Modern Header */}
      <header className="map-header">
        <div className="header-content">
          <div className="header-left">
            <button
              onClick={() => window.history.back()}
              className="back-button"
            >
              ←
            </button>
            <div className="header-title">
              <h1>Maasin Water Quality Monitor</h1>
              <p>Southern Leyte, Philippines</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-badge">
              <span className="stat-value">{locations.length}</span>
              <span className="stat-label">Total Locations</span>
            </div>
            <button
              className={`view-toggle-btn ${
                viewMode === "markers" ? "active" : ""
              }`}
              onClick={toggleViewMode}
              disabled={heatmapLoading}
            >
              {heatmapLoading ? (
                <span className="loading-spinner-small"></span>
              ) : viewMode === "markers" ? (
                <>
                  <span>Show Risk Heatmap</span>
                </>
              ) : (
                <>
                  <span>Show Water Sources</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Control Panel */}
      <div className="control-panel">
        {viewMode === "heatmap" && (
          <>
            <div className="panel-section">
              <h4 className="legend-title">Heatmap Controls</h4>
              <div className="control-group">
                <button
                  onClick={() => adjustHeatmapIntensity(false)}
                  className="control-btn-small"
                  title="Decrease intensity"
                >
                  −
                </button>
                <span className="intensity-display">
                  Intensity: {heatmapIntensity.toFixed(1)}x
                </span>
                <button
                  onClick={() => adjustHeatmapIntensity(true)}
                  className="control-btn-small"
                  title="Increase intensity"
                >
                  +
                </button>
              </div>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={showContaminatedSources}
                    onChange={toggleContaminatedSources}
                  />
                  <span className="checkbox-custom"></span>
                  Show contaminated sources
                </label>
              </div>
            </div>

            <div className="panel-section">
              <h4>Risk Level Legend</h4>
              <div className="legend-items">
                <div className="legend-item">
                  <span className="legend-color high-risk"></span>
                  <span>High Risk ({"<"}25)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color medium-risk"></span>
                  <span>Medium Risk (10-25)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color low-risk"></span>
                  <span>Low Risk ({">"}10)</span>
                </div>
              </div>
              <p className="legend-description">
                Risk score based on household density near contaminated water
                sources
              </p>
            </div>
          </>
        )}
      </div>

      {/* Water Quality Legend (visible in markers mode) */}
      {viewMode === "markers" && (
        <div className="quality-legend">
          <h4 className="legend-title">Water Quality Status</h4>
          <div className="legend-items">
            <div className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: "#ef4444" }}
              ></span>
              <span>Undrinkable (E. coli present)</span>
            </div>
            <div className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: "#f97316" }}
              ></span>
              <span>Warning (Coliform present)</span>
            </div>
            <div className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: "#10b981" }}
              ></span>
              <span>Safe (Both absent)</span>
            </div>
            <div className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: "#9ca3af" }}
              ></span>
              <span>No data (Not tested)</span>
            </div>
          </div>
          <p className="legend-description">
            Click on any marker for detailed water quality information
          </p>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainer} className="map-container" />

      {/* Image Viewer Modal */}
      {imageViewer.isOpen && (
        <div
          className="image-viewer-overlay"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
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
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading Maasin Water Quality Map...</p>
          <p className="loading-subtext">
            {heatmapLoading
              ? "Analyzing household risk data..."
              : "Focusing on Maasin City, Southern Leyte"}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapView;
