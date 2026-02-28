import React, { useEffect, useRef } from "react";
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
  center: [10.1333, 124.8447],
  bounds: [
    [10.0, 124.7], // Southwest corner
    [10.3, 125.1], // Northeast corner
  ],
};

const LocationMap = ({
  latitude,
  longitude,
  height = "300px",
  draggable = false,
  onPositionChange = null,
  readOnly = true,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Create colored icon based on status (for view mode)
  // eslint-disable-next-line no-unused-vars
  const getStatusColor = () => {
    if (readOnly) {
      return "#3b82f6"; // Blue for view mode
    }
    return "#3b82f6"; // Blue for edit mode as well
  };

  useEffect(() => {
    // Initialize map
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [
          latitude || MAASIN_CONFIG.center[0],
          longitude || MAASIN_CONFIG.center[1],
        ],
        15
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);

      // Set bounds to Maasin City
      mapInstanceRef.current.setMaxBounds(MAASIN_CONFIG.bounds);
      mapInstanceRef.current.on("drag", function () {
        mapInstanceRef.current.panInsideBounds(MAASIN_CONFIG.bounds, {
          animate: true,
        });
      });

      // Create marker
      if (latitude && longitude) {
        const marker = L.marker([latitude, longitude], {
          draggable: draggable,
        }).addTo(mapInstanceRef.current);

        // Add popup
        marker
          .bindPopup(
            draggable ? "Drag me to adjust position" : "Water source location"
          )
          .openPopup();

        markerRef.current = marker;

        // Handle drag events
        if (draggable && onPositionChange) {
          marker.on("dragend", function (e) {
            const position = e.target.getLatLng();
            onPositionChange(position.lat, position.lng);
          });
        }
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker position when props change (for edit mode)
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && latitude && longitude) {
      const newLatLng = L.latLng(latitude, longitude);
      markerRef.current.setLatLng(newLatLng);
      mapInstanceRef.current.panTo(newLatLng);
    }
  }, [latitude, longitude]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Location Map</h4>
        {draggable && (
          <p className="text-xs text-blue-600">
            Drag the marker to adjust position
          </p>
        )}
      </div>
      <div
        ref={mapRef}
        style={{
          height: height,
          width: "100%",
          borderRadius: "0.5rem",
          border: "1px solid #e5e7eb",
          zIndex: 1,
        }}
      />
      {!latitude || !longitude ? (
        <p className="text-sm text-yellow-600 flex items-center space-x-1">
          <span>⚠️</span>
          <span>No coordinates available for this location</span>
        </p>
      ) : (
        <></>
        // <p className="text-xs text-gray-500 flex items-center space-x-2">
        //   <span>📍</span>
        //   <span>
        //     {latitude.toFixed(6)}, {longitude.toFixed(6)}
        //   </span>
        // </p>
      )}
    </div>
  );
};

export default LocationMap;
