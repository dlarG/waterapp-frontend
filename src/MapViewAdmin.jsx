/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { waterLocationAPI, householdAPI } from "./api/api";
import Layout from "./components/Layout";
import "mapbox-gl/dist/mapbox-gl.css";

const MapViewAdmin = () => {
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
          exam_failed: point.contamination_type?.exam_failed || false, // 👈 NEW
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
        // Increase the heatmap weight based on risk score with exam_failed bias
        "heatmap-weight": [
          "interpolate",
          ["linear"],
          [
            "*",
            ["get", "risk_score"],
            [
              "case",
              ["==", ["get", "exam_failed"], true],
              1.3, // 30% boost for failed exam zones
              1.0,
            ],
          ],
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
            exam_failed: source.contamination?.exam_failed || false, // 👈 NEW
          },
        })),
      };

      map.current.addSource("contaminated-sources", {
        type: "geojson",
        data: sourceData,
      });

      // UPDATED: Contaminated sources with exam_failed first
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
            3,
            12,
            4,
            14,
            5,
            16,
            6,
            18,
            8,
          ],
          "circle-color": [
            "case",
            // exam_failed -> RED
            ["==", ["get", "exam_failed"], true],
            "#dc2626",
            // else if e_coli -> dark red
            ["==", ["get", "e_coli"], true],
            "#b91c1c",
            // else if coliform -> orange
            ["==", ["get", "coliform"], true],
            "#f97316",
            // default gray
            "#9ca3af",
          ],
          "circle-stroke-color": "white",
          "circle-stroke-width": 1.5,
          "circle-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            0.5,
            14,
            0.7,
            18,
            0.9,
          ],
        },
      });

      // labels block can stay as‑is
      map.current.addLayer({
        id: "contaminated-sources-labels",
        type: "symbol",
        source: "contaminated-sources",
        minzoom: 14,
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
    const exam = (location.bacteriological_exam || "").toLowerCase();

    // 1) Contaminated: exam failed overrides everything
    if (exam === "failed") {
      return {
        status: "CONTAMINATED",
        color: "#ef4444", // Red
        description:
          "🚨 Bacteriological exam failed. This water source is considered contaminated regardless of bacteria values.",
      };
    }

    // 2) Safe: exam passed overrides bacteria results
    if (exam === "passed") {
      return {
        status: "SAFE",
        color: "#10b981", // Green
        description:
          "✅ Bacteriological exam passed. This water source is considered safe to drink.",
      };
    }

    // 3) Warning: exam untested but bacteria positive (either coliform or E. coli)
    if (exam === "untested" && (coliform === true || eColi === true)) {
      return {
        status: "WARNING",
        color: "#f97316", // Orange
        description:
          "⚠️ Bacteria detected but the bacteriological exam is untested. Further confirmation is required.",
      };
    }

    // 4) No data: nothing tested or all null/untested
    if (
      (coliform === null && eColi === null && !exam) ||
      (coliform === null && eColi === null && exam === "untested")
    ) {
      return {
        status: "NO DATA",
        color: "#9ca3af", // Gray
        description:
          "⏳ No test data available yet for this water source. Please collect and test samples.",
      };
    }

    // Fallback (for older records where only bacteria exist)
    if (eColi === true) {
      return {
        status: "CONTAMINATED",
        color: "#ef4444",
        description:
          "🚨 E. coli detected. This water source is contaminated and unsafe for drinking.",
      };
    }

    if (coliform === true && (eColi === false || eColi === null)) {
      return {
        status: "WARNING",
        color: "#f97316",
        description:
          "⚠️ Coliform bacteria detected. Further bacteriological examination is recommended.",
      };
    }

    if (
      (coliform === false || coliform === null) &&
      (eColi === false || eColi === null)
    ) {
      return {
        status: "SAFE",
        color: "#10b981",
        description:
          "✅ No harmful bacteria detected. Water is considered safe based on available tests.",
      };
    }

    // Default fallback
    return {
      status: "UNKNOWN",
      color: "#9ca3af",
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

  const ImageViewerModal = () => {
    if (!imageViewer.isOpen) return null;

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
      setImageViewer((prev) => ({ ...prev, isDragging: false }));
    };

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center"
        style={{ zIndex: 10000 }}
        onClick={closeImageViewer}
      >
        <div className="relative max-w-[95vw] max-h-[95vh] flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4 z-10 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {imageViewer.locationName}
              </h3>
              <p className="text-sm text-gray-300">
                Water Source Location Image
              </p>
            </div>
            <button
              onClick={closeImageViewer}
              className="text-white hover:text-gray-300 text-2xl leading-none p-2"
              title="Close (Esc)"
            >
              ×
            </button>
          </div>

          {/* Image Container */}
          <div
            className="relative overflow-hidden bg-black rounded-lg mt-16"
            style={{
              minWidth: "300px",
              minHeight: "300px",
              maxWidth: "90vw",
              maxHeight: "80vh",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={imageViewer.imageSrc}
              alt={imageViewer.locationName}
              className="max-w-none"
              style={{
                transform: `scale(${imageViewer.zoom}) translate(${imageViewer.position.x}px, ${imageViewer.position.y}px)`,
                cursor:
                  imageViewer.zoom > 1
                    ? imageViewer.isDragging
                      ? "grabbing"
                      : "grab"
                    : "default",
                transition: imageViewer.isDragging
                  ? "none"
                  : "transform 0.3s ease",
                maxHeight: "80vh",
                width: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.target.src = "/placeholder-image.png";
                e.target.alt = "Image not found";
              }}
            />
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4 z-10">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  zoomOut();
                }}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                disabled={imageViewer.zoom <= 0.5}
                title="Zoom Out (-)"
              >
                <span className="text-lg">−</span>
                <span className="text-sm">Zoom Out</span>
              </button>

              <div className="text-sm bg-white bg-opacity-20 px-3 py-2 rounded-lg text-gray-500">
                {Math.round(imageViewer.zoom * 100)}%
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  zoomIn();
                }}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                disabled={imageViewer.zoom >= 5}
                title="Zoom In (+)"
              >
                <span className="text-lg">+</span>
                <span className="text-sm">Zoom In</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetZoom();
                }}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                title="Reset Zoom (0)"
              >
                <span className="text-sm">Reset</span>
              </button>
            </div>

            <div className="text-xs text-gray-300 text-center mt-2">
              Use mouse wheel to zoom • Drag to pan when zoomed • Press Esc or
              click outside to close
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Also add mouse wheel zoom support
  useEffect(() => {
    const handleWheel = (e) => {
      if (!imageViewer.isOpen) return;

      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      const newZoom = Math.max(0.5, Math.min(5, imageViewer.zoom + delta));

      setImageViewer((prev) => ({
        ...prev,
        zoom: newZoom,
      }));
    };

    if (imageViewer.isOpen) {
      document.addEventListener("wheel", handleWheel, { passive: false });
      return () => document.removeEventListener("wheel", handleWheel);
    }
  }, [imageViewer.isOpen, imageViewer.zoom]);

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
      <Layout title="Map View - Error" subtitle="Unable to load the map">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Map Error
            </h2>
            <p className="text-red-600 mb-6">
              Unable to load the Maasin water monitoring map. Please check your
              connection and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="cursor-pointer px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
      title="Map View"
      subtitle="Interactive water quality monitoring map for Maasin City"
    >
      <div className="p-4 md:p-6 h-full">
        {/* Header Section */}
        <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-800">
              Water Quality Map
            </h2>
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
              {locations.length} Locations
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              className={`cursor-pointer px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                viewMode === "markers"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => viewMode !== "markers" && toggleViewMode()}
              disabled={heatmapLoading}
            >
              Water Sources
            </button>
            <button
              className={`cursor-pointer px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                viewMode === "heatmap"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => viewMode !== "heatmap" && toggleViewMode()}
              disabled={heatmapLoading}
            >
              {heatmapLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Risk Heatmap</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Map Controls Panel */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-sm border border-blue-100 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-blue-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {viewMode === "markers"
                        ? "Water Quality Legend"
                        : "Risk Analysis Controls"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {viewMode === "markers"
                        ? "Color-coded water source status indicators"
                        : "Interactive heatmap visualization settings"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {viewMode.toUpperCase()} VIEW
                  </div>
                  {viewMode === "heatmap" && riskData.length > 0 && (
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {riskData.length} RISK ZONES
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Controls Content */}
            <div className="p-6">
              {viewMode === "heatmap" ? (
                <div className="space-y-6">
                  {/* Intensity Control */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-gray-800">
                        Heat Intensity
                      </label>
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                        {heatmapIntensity.toFixed(1)}x
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => adjustHeatmapIntensity(false)}
                        className="cursor-pointer flex-shrink-0 w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                        title="Decrease intensity"
                      >
                        <span className="text-lg font-bold">−</span>
                      </button>

                      <div className="flex-1 relative">
                        <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 shadow-inner">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300 shadow-sm"
                            style={{
                              width: `${(heatmapIntensity / 3) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => adjustHeatmapIntensity(true)}
                        className="cursor-pointer flex-shrink-0 w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                        title="Increase intensity"
                      >
                        <span className="text-lg font-bold">+</span>
                      </button>
                    </div>
                  </div>

                  {/* Risk Level Legend */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <h5 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                      Risk Level Classification
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-md flex-shrink-0"></div>
                        <div>
                          <div className="text-sm font-medium text-red-800">
                            High Risk
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-md flex-shrink-0"></div>
                        <div>
                          <div className="text-sm font-medium text-orange-800">
                            Medium Risk
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-md flex-shrink-0"></div>
                        <div>
                          <div className="text-sm font-medium text-blue-800">
                            Low Risk
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Options */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <h5 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                      Display Options
                    </h5>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="showSources"
                            checked={showContaminatedSources}
                            onChange={toggleContaminatedSources}
                            className="sr-only"
                          />
                          <div
                            className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                              showContaminatedSources
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                                showContaminatedSources
                                  ? "translate-x-6"
                                  : "translate-x-0.5"
                              } mt-0.5`}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                          Show contaminated water sources
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                /* Water Quality Status Legend */
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <h5 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                    Water Quality Status Guide
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
                      <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-md flex-shrink-0 ring-2 ring-red-200"></div>
                      <div>
                        <div className="text-sm font-medium text-red-800">
                          Undrinkable
                        </div>
                        <div className="text-xs text-red-600">
                          E. coli detected
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors">
                      <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-md flex-shrink-0 ring-2 ring-orange-200"></div>
                      <div>
                        <div className="text-sm font-medium text-orange-800">
                          Warning
                        </div>
                        <div className="text-xs text-orange-600">
                          Coliform present
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-md flex-shrink-0 ring-2 ring-green-200"></div>
                      <div>
                        <div className="text-sm font-medium text-green-800">
                          Safe
                        </div>
                        <div className="text-xs text-green-600">
                          No bacteria found
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                      <div className="w-6 h-6 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-md flex-shrink-0 ring-2 ring-gray-200"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          No Data
                        </div>
                        <div className="text-xs text-gray-600">
                          Not tested yet
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start space-x-2">
                      <div className="text-xs text-blue-700">
                        <strong>Tip:</strong> Click on any water source marker
                        to view detailed test results, sample information, and
                        contamination analysis.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-white py-10 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div
            ref={mapContainer}
            className="w-full h-[600px] relative"
            style={{ minHeight: "600px" }}
          />

          {/* Loading Overlay */}
          {mapStatus === "creating" && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">
                  Loading Maasin Water Quality Map...
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {heatmapLoading
                    ? "Analyzing household risk data..."
                    : "Focusing on Maasin City, Southern Leyte"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <ImageViewerModal />
    </Layout>
  );
};

export default MapViewAdmin;
