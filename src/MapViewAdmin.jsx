/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { waterLocationAPI } from "./api/api";
import "mapbox-gl/dist/mapbox-gl.css";

const MapView = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const popupsRef = useRef([]);
  const [locations, setLocations] = useState([]);
  const [mapStatus, setMapStatus] = useState("initializing");

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
    center: [124.748792, 10.108537], // Maasin, Southern Leyte - City Center
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

          // 🔍 DEBUG: Let's see what date/time data we're getting
          // response.data.forEach((loc, index) => {
          //   console.log(`Location ${index + 1} (${loc.full_name}):`, {
          //     sample_date: loc.sample_date,
          //     sample_time: loc.sample_time,
          //     date_type: typeof loc.sample_date,
          //     time_type: typeof loc.sample_time,
          //     coordinates: [loc.longitude, loc.latitude],
          //     raw_location: loc,
          //   });
          // });

          // console.log(
          //   "Locations with images:",
          //   response.data.filter((loc) => loc.image_path)
          // );
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
        style: "mapbox://styles/mapbox/satellite-streets-v12", // Use satellite streets for better visibility
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
      <div className="modern-header">
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
              src={`/${imageViewer.imageSrc}`}
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

          {/* Image Info */}
          <div className="image-viewer-info">
            <h3>{imageViewer.locationName}</h3>
            <p>
              Water Source in Maasin City • Use +/- keys or buttons to zoom •
              Drag to pan when zoomed
            </p>
          </div>
        </div>
      )}

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

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .mapboxgl-popup-close-button {
            font-size: 20px;
            color: white;
            right: 5px;
            top: 5px;
            background: rgba(0,0,0,0.2);
            border-radius: 50%;
            width: 24px;
            height: 24px;
          }

          .modern-header {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%);
            color: white;
            padding: 5px 24px;
            z-index: 20;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          }
          
          .header-content {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .header-left {
            display: flex;
            align-items: center;
            gap: 20px;
          }
          
          .back-button {
            background: rgba(255, 255, 255, 0.15);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          }
          
          .back-button:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateX(-2px);
          }
          
          .header-title h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          
          .header-title p {
            margin: 4px 0 0;
            font-size: 13px;
            opacity: 0.9;
          }
          
          .header-stats {
            display: flex;
            gap: 15px;
            align-items: center;
          }
          
          .stats-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 5px 10px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            min-width: 80px;
          }
          
          .stats-value {
            font-size: 20px;
            font-weight: 700;
          }
          
          .stats-label {
            font-size: 12px;
            opacity: 0.9;
            margin-top: 4px;
          }

          

          /* NEW: Image Viewer Styles */
          .image-viewer-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(10px);
          }

          .image-viewer-controls {
            position: absolute;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 15px;
            z-index: 1001;
          }

          .control-group {
            display: flex;
            gap: 8px;
            background: rgba(255, 255, 255, 0.1);
            padding: 8px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .control-btn {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            padding: 10px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            min-width: 40px;
          }

          .control-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.05);
          }

          .close-btn {
            background: rgba(239, 68, 68, 0.8) !important;
          }

          .close-btn:hover {
            background: rgba(239, 68, 68, 1) !important;
          }

          .zoom-display {
            color: white;
            font-size: 12px;
            padding: 10px 8px;
            font-weight: 600;
            min-width: 50px;
            text-align: center;
          }

          .image-viewer-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            width: 100%;
            height: 100%;
            position: relative;
          }

          .viewer-image {
            max-width: 90vw;
            max-height: 80vh;
            object-fit: contain;
            transition: transform 0.3s ease;
            user-select: none;
          }

          .image-viewer-info {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            text-align: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            max-width: 80vw;
          }

          .image-viewer-info h3 {
            margin: 0 0 5px 0;
            font-size: 16px;
            font-weight: 600;
          }

          .image-viewer-info p {
            margin: 0;
            font-size: 12px;
            opacity: 0.8;
            line-height: 1.4;
          }
          
          .mapboxgl-popup-content {
            padding: 10px;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-height: 80vh;
            overflow-y: auto;
          }
          
          .mapboxgl-marker {
            position: absolute;
            will-change: transform;
          }
          
          .custom-marker {
            position: absolute;
            top: 0;
            left: 0;
          }
          
          .mapboxgl-marker-container {
            pointer-events: auto !important;
          }

          @media (max-width: 768px) {
            .header-stats {
              flex-direction: column;
              gap: 8px;
            }
            
            .stats-item {
              min-width: 60px;
              padding: 8px 12px;
            }
            
            .legend-toggle-btn {
              right: 5px;
              top: 90px;
              min-width: 80px;
              padding: 10px 12px;
            }

            .legend-toggle-text {
              font-size: 12px;
            }
            
            .modern-legend {
              width: 250px;
              right: 5px;
              top: 140px;
            }
            
            .image-viewer-controls {
              top: 10px;
              right: 10px;
              flex-direction: column;
              gap: 8px;
            }
            
            .control-group {
              padding: 6px;
            }
            
            .image-viewer-info {
              bottom: 10px;
              padding: 12px 20px;
              max-width: 90vw;
            }
            
            .viewer-image {
              max-width: 95vw;
              max-height: 70vh;
            }
          }
        `}
      </style>
    </div>
  );
};

export default MapView;
