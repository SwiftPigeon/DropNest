// src/components/Tracking/DeliveryMap.jsx
import React, { useRef, useState, useEffect, useMemo } from "react";
import { Typography, Tag } from "antd";
import {
  EnvironmentOutlined, // Generic location pin
  FlagOutlined, // For delivery
  HomeOutlined, // For station
  ShoppingOutlined, // For pickup
  RocketOutlined, // For device (drone)
  RobotOutlined, // For device (robot)
} from "@ant-design/icons";

const { Text } = Typography;

// Helper to calculate bounding box for multiple points
const calculateGeoBounds = (points) => {
  const validPoints = points.filter(
    (p) =>
      p && typeof p.latitude === "number" && typeof p.longitude === "number"
  );

  if (validPoints.length === 0) {
    // Default San Francisco bounds
    return {
      minLat: 37.708,
      maxLat: 37.8324,
      minLon: -122.5136,
      maxLon: -122.358,
    };
  }

  let minLat = Infinity,
    maxLat = -Infinity,
    minLon = Infinity,
    maxLon = -Infinity;

  validPoints.forEach((point) => {
    minLat = Math.min(minLat, point.latitude);
    maxLat = Math.max(maxLat, point.latitude);
    minLon = Math.min(minLon, point.longitude);
    maxLon = Math.max(maxLon, point.longitude);
  });

  if (validPoints.length === 1) {
    // If only one point, add some default padding
    minLat -= 0.01;
    maxLat += 0.01;
    minLon -= 0.01;
    maxLon += 0.01;
  } else {
    const latPadding = (maxLat - minLat) * 0.2 || 0.01; // 20% padding or default
    const lonPadding = (maxLon - minLon) * 0.2 || 0.01;
    minLat -= latPadding;
    maxLat += latPadding;
    minLon -= lonPadding;
    maxLon += lonPadding;
  }

  // Ensure min < max
  if (minLat === maxLat) {
    maxLat += 0.001;
  }
  if (minLon === maxLon) {
    maxLon += 0.001;
  }

  return { minLat, maxLat, minLon, maxLon };
};

// Helper to project Geo coordinates to pixel coordinates
const projectToPixel = (lat, lon, mapPixelWidth, mapPixelHeight, geoBounds) => {
  if (
    !geoBounds ||
    mapPixelWidth === 0 ||
    mapPixelHeight === 0 ||
    !geoBounds.minLat
  ) {
    return { x: -1000, y: -1000 }; // Off-screen
  }
  const { minLat, maxLat, minLon, maxLon } = geoBounds;

  if (maxLat === minLat || maxLon === minLon)
    return { x: mapPixelWidth / 2, y: mapPixelHeight / 2 }; // Avoid division by zero

  const xRatio = (lon - minLon) / (maxLon - minLon);
  const yRatio = (maxLat - lat) / (maxLat - minLat); // Latitude is inverted for screen Y

  let x = xRatio * mapPixelWidth;
  let y = yRatio * mapPixelHeight;

  // Simple clamping to keep markers somewhat within view if projection is off due to bounds
  x = Math.max(-20, Math.min(x, mapPixelWidth + 20)); // Allow slight overflow for marker centering
  y = Math.max(-20, Math.min(y, mapPixelHeight + 20));

  return { x, y };
};

const DeliveryMap = ({ route, deviceLocation, orderDetails }) => {
  const mapContainerRef = useRef(null);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 400 }); // Default height
  const [viewGeoBounds, setViewGeoBounds] = useState(null);

  useEffect(() => {
    const pointsForBounds = [
      route?.origin,
      route?.pickup,
      route?.delivery,
      deviceLocation,
    ];
    setViewGeoBounds(calculateGeoBounds(pointsForBounds));
  }, [route, deviceLocation]);

  useEffect(() => {
    const mapDiv = mapContainerRef.current;
    if (!mapDiv) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setMapDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height, // Use actual height
        });
      }
    });

    resizeObserver.observe(mapDiv);
    // Initial set
    setMapDimensions({
      width: mapDiv.offsetWidth,
      height: mapDiv.offsetHeight,
    });

    return () => resizeObserver.unobserve(mapDiv);
  }, []);

  const mapUrl = useMemo(() => {
    if (!viewGeoBounds) return "";
    const { minLat, maxLat, minLon, maxLon } = viewGeoBounds;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik`;
  }, [viewGeoBounds]);

  const stationCoords = useMemo(
    () =>
      route?.origin
        ? projectToPixel(
            route.origin.latitude,
            route.origin.longitude,
            mapDimensions.width,
            mapDimensions.height,
            viewGeoBounds
          )
        : null,
    [route?.origin, mapDimensions, viewGeoBounds]
  );
  const pickupCoords = useMemo(
    () =>
      route?.pickup
        ? projectToPixel(
            route.pickup.latitude,
            route.pickup.longitude,
            mapDimensions.width,
            mapDimensions.height,
            viewGeoBounds
          )
        : null,
    [route?.pickup, mapDimensions, viewGeoBounds]
  );
  const deliveryCoords = useMemo(
    () =>
      route?.delivery
        ? projectToPixel(
            route.delivery.latitude,
            route.delivery.longitude,
            mapDimensions.width,
            mapDimensions.height,
            viewGeoBounds
          )
        : null,
    [route?.delivery, mapDimensions, viewGeoBounds]
  );
  const deviceCoords = useMemo(
    () =>
      deviceLocation
        ? projectToPixel(
            deviceLocation.latitude,
            deviceLocation.longitude,
            mapDimensions.width,
            mapDimensions.height,
            viewGeoBounds
          )
        : null,
    [deviceLocation, mapDimensions, viewGeoBounds]
  );

  const svgPathString = useMemo(() => {
    if (
      !stationCoords ||
      !pickupCoords ||
      !deliveryCoords ||
      mapDimensions.width === 0
    )
      return "";
    // Path: Station -> Pickup -> Delivery
    return `M ${stationCoords.x} ${stationCoords.y} L ${pickupCoords.x} ${pickupCoords.y} L ${deliveryCoords.x} ${deliveryCoords.y}`;
  }, [stationCoords, pickupCoords, deliveryCoords, mapDimensions.width]);

  const DeviceIcon =
    orderDetails?.deliveryType === "DRONE" ? RocketOutlined : RobotOutlined;

  if (!route || !deviceLocation || !orderDetails) {
    return (
      <div className="text-center p-4">
        <Text type="secondary">Map data is not available.</Text>
      </div>
    );
  }

  return (
    <div
      className="relative w-full"
      style={{ height: `${mapDimensions.height}px` }}
      ref={mapContainerRef}
    >
      {mapUrl && (
        <iframe
          title="Delivery Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={mapUrl}
          className="absolute top-0 left-0 z-0"
          loading="lazy"
        />
      )}

      {/* Overlays: Markers and Path */}
      {mapDimensions.width > 0 && viewGeoBounds && (
        <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
          {/* SVG Path */}
          <svg width="100%" height="100%" style={{ overflow: "visible" }}>
            <path
              d={svgPathString}
              stroke="#3B82F6"
              strokeWidth="3"
              fill="none"
              strokeDasharray="5,5"
            />
          </svg>

          {/* Markers: Use <div> with absolute positioning and icons */}
          {stationCoords && (
            <div
              style={{
                position: "absolute",
                left: `${stationCoords.x}px`,
                top: `${stationCoords.y}px`,
                transform: "translate(-50%, -100%)",
              }}
              className="flex flex-col items-center pointer-events-auto"
              title={`Station: ${route.origin.name || "Origin"}`}
            >
              <HomeOutlined style={{ fontSize: "24px", color: "#0052cc" }} />
              <Tag color="blue" className="mt-1 text-xs">
                Station
              </Tag>
            </div>
          )}

          {pickupCoords && (
            <div
              style={{
                position: "absolute",
                left: `${pickupCoords.x}px`,
                top: `${pickupCoords.y}px`,
                transform: "translate(-50%, -100%)",
              }}
              className="flex flex-col items-center pointer-events-auto"
              title={`Pickup: ${route.pickup.address || "Pickup Location"}`}
            >
              <ShoppingOutlined
                style={{ fontSize: "24px", color: "#22c55e" }}
              />
              <Tag color="green" className="mt-1 text-xs">
                Pickup
              </Tag>
            </div>
          )}

          {deliveryCoords && (
            <div
              style={{
                position: "absolute",
                left: `${deliveryCoords.x}px`,
                top: `${deliveryCoords.y}px`,
                transform: "translate(-50%, -100%)",
              }}
              className="flex flex-col items-center pointer-events-auto"
              title={`Delivery: ${
                route.delivery.address || "Delivery Location"
              }`}
            >
              <FlagOutlined style={{ fontSize: "24px", color: "#ef4444" }} />
              <Tag color="red" className="mt-1 text-xs">
                Delivery
              </Tag>
            </div>
          )}

          {deviceCoords && (
            <div
              style={{
                position: "absolute",
                left: `${deviceCoords.x}px`,
                top: `${deviceCoords.y}px`,
                transform: "translate(-50%, -50%)",
              }}
              className="flex flex-col items-center pointer-events-auto animate-pulse" // Added animate-pulse for simple CSS animation
              title="Current Device Location"
            >
              <DeviceIcon
                style={{ fontSize: "28px", color: "#f97316" }}
                className="bg-white rounded-full p-1 shadow-lg"
              />
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-white p-2 rounded shadow-md z-20 text-xs">
        <Text strong>Legend:</Text>
        <div className="flex items-center mt-1">
          <HomeOutlined className="mr-1" style={{ color: "#0052cc" }} /> Station
        </div>
        <div className="flex items-center mt-1">
          <ShoppingOutlined className="mr-1" style={{ color: "#22c55e" }} />{" "}
          Pickup
        </div>
        <div className="flex items-center mt-1">
          <FlagOutlined className="mr-1" style={{ color: "#ef4444" }} />{" "}
          Delivery
        </div>
        <div className="flex items-center mt-1">
          <RocketOutlined className="mr-1" style={{ color: "#f97316" }} /> /{" "}
          <RobotOutlined className="mr-1" style={{ color: "#f97316" }} /> Device
        </div>
        <div className="flex items-center mt-1">
          <svg height="10" width="10" className="mr-1">
            <line
              x1="0"
              y1="5"
              x2="10"
              y2="5"
              style={{
                stroke: "#3B82F6",
                strokeWidth: 2,
                strokeDasharray: "2,2",
              }}
            />
          </svg>{" "}
          Route
        </div>
      </div>
    </div>
  );
};

export default DeliveryMap;
