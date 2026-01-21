/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { waterLocationAPI } from "./api/api";
import "mapbox-gl/dist/mapbox-gl.css";

const MapView = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]); // Store markers here
  const popupsRef = useRef([]); // Store popups here
  const [locations, setLocations] = useState([]);
  const [mapStatus, setMapStatus] = useState("initializing");

  const MAPBOX_TOKEN =
    "pk.eyJ1IjoicmFsZDEyMDEwMiIsImEiOiJjbWttZGNyaWgwY3h3M2xzZmIwZ3VhYnM3In0.xkubwGBDjYnc41XB_7FT1g";

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

  // Check if location has test results
  const hasTestResults = (location) => {
    return location.coliform_bacteria !== null || location.e_coli !== null;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "No sample date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "No sample time";
    try {
      const timeParts = timeString.split(":");
      const hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${ampm}`;
    } catch {
      return timeString || "Invalid time";
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

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await waterLocationAPI.getAll();
        if (response.success && response.data) {
          setLocations(response.data);
          console.log(`✅ Loaded ${response.data.length} locations`);
        }
      } catch (err) {
        console.error("❌ Error:", err);
      }
    };
    fetchLocations();
  }, []);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    mapboxgl.prewarm = () => {};
    mapboxgl.clearPrewarmedResources = () => {};

    try {
      setMapStatus("creating");

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/standard-satellite",
        center: [124.84, 10.14],
        zoom: 12,
        attributionControl: true,
        trackResize: true,
        preserveDrawingBuffer: false,
        antialias: false,
        optimizeForTerrain: false,
      });

      map.current.on("load", () => {
        console.log("✅ Map loaded!");
        setMapStatus("loaded");
      });

      map.current.on("error", (e) => {
        console.error("❌ Map error:", e);
        setMapStatus("error");
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl());
    } catch (error) {
      console.error("❌ Init error:", error);
      setMapStatus("error");
    }

    return () => {
      if (map.current) {
        // Clean up all markers and popups
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];
        popupsRef.current.forEach((popup) => popup.remove());
        popupsRef.current = [];
        map.current.remove();
        map.current = null;
      }
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

  // Create popup content
  const createPopupContent = (location) => {
    const hasResults = hasTestResults(location);

    return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 0;
        margin: 0;
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            📍 ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
          </div>
        </div>

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
            📅 Sample Information
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
            🧪 Test Results
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

  // FIXED: Enhanced add markers function with proper marker storage
  const addMarkers = () => {
    if (!map.current || !locations.length) return;

    console.log("📌 Adding markers...");

    // Clear existing markers and popups
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    popupsRef.current.forEach((popup) => popup.remove());
    popupsRef.current = [];

    // Calculate bounds for all locations
    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((location) => {
      if (location.latitude && location.longitude) {
        const hasResults = hasTestResults(location);
        const lngLat = [location.longitude, location.latitude];

        // Extend bounds
        bounds.extend(lngLat);

        // Create marker element - SIMPLIFIED VERSION
        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.cssText = `
          width: 28px; 
          height: 28px; 
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

        // FIXED: Add hover effect
        container.addEventListener("mouseenter", () => {
          el.style.zIndex = "2";
          el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
        });

        container.addEventListener("mouseleave", () => {
          el.style.zIndex = "1";
          el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
        });

        const openPopup = () => {
          // Remove any existing popups
          popupsRef.current.forEach((popup) => popup.remove());
          popupsRef.current = [];

          // Create new popup
          const popup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: true,
            maxWidth: "350px",
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
            zoom: 14,
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
    });

    // Fit map to bounds if we have multiple locations
    if (markersRef.current.length > 1) {
      setTimeout(() => {
        if (map.current) {
          map.current.fitBounds(bounds, {
            padding: 100,
            maxZoom: 15,
            duration: 2000,
          });
        }
      }, 500);
    } else if (markersRef.current.length === 1) {
      // Center on single marker
      setTimeout(() => {
        if (map.current) {
          map.current.flyTo({
            center: [locations[0].longitude, locations[0].latitude],
            zoom: 14,
            duration: 1000,
          });
        }
      }, 500);
    }

    console.log(`✅ Added ${markersRef.current.length} markers successfully!`);
  };

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
            Unable to load the map. Please check your connection and try again.
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
      {/* Enhanced Header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "15px",
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={() => window.history.back()}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "5px",
                cursor: "pointer",
                marginRight: "15px",
                fontSize: "14px",
              }}
            >
              ← Back
            </button>
            <strong style={{ fontSize: "18px" }}>
              Water Quality Map - Maasin, Southern Leyte
            </strong>
          </div>
          <div style={{ fontSize: "14px", opacity: "0.9" }}>
            {locations.length} monitoring locations
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: "80px",
          right: "15px",
          backgroundColor: "rgba(255,255,255,0.95)",
          padding: "15px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 10,
          minWidth: "200px",
          backdropFilter: "blur(10px)",
        }}
      >
        <h3
          style={{
            margin: "0 0 10px 0",
            fontSize: "16px",
            color: "#1f2937",
          }}
        >
          Status Legend
        </h3>

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "10px" }}>
          <div style={{ fontSize: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "4px 0",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  marginRight: "8px",
                  border: "2px solid white",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              ></div>
              <span>Safe to drink</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "4px 0",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#f59e0b",
                  marginRight: "8px",
                  border: "2px solid white",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              ></div>
              <span>Not drinkable</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "4px 0",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                  marginRight: "8px",
                  border: "2px solid white",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              ></div>
              <span>Hazardous</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "4px 0",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#9ca3af",
                  marginRight: "8px",
                  border: "2px solid white",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              ></div>
              <span>No sample yet</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            paddingTop: "10px",
            marginTop: "10px",
            fontSize: "11px",
            color: "#6b7280",
          }}
        >
          💡 Click on any marker to view detailed information
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#f0f0f0",
        }}
      />

      {/* Enhanced Loading Overlay */}
      {mapStatus === "creating" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255,255,255,0.9)",
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
              Loading Water Quality Map...
            </p>
            <p
              style={{
                margin: 0,
                color: "#9ca3af",
                fontSize: "12px",
              }}
            >
              Initializing monitoring locations
            </p>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* Add styles for popup close button */
          .mapboxgl-popup-close-button {
            font-size: 20px;
            color: white;
            right: 5px;
            top: 5px;
          }
          
          .mapboxgl-popup-content {
            padding: 2;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          
          /* Fix marker positioning */
          .mapboxgl-marker {
            position: absolute;
            will-change: transform;
          }
          
          .custom-marker {
            position: absolute;
            top: 0;
            left: 0;
            transform: translate(-50%, -50%);
          }
          
          /* Ensure markers stay clickable */
          .mapboxgl-marker-container {
            pointer-events: auto !important;
          }
        `}
      </style>
    </div>
  );
};

export default MapView;
