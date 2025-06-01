// src/components/Tracking/TrackingModal.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Modal, Spin, message, Typography, Row, Col, Alert } from "antd";
import { getOrderDetails, getOrderTracking } from "../../services/api"; // Assuming getOrderTracking for initial data
import {
  connectToTracking,
  disconnectTracking,
} from "../../services/trackingService";
import { useAuth } from "../../context/AuthContext"; // To get the token
import DeliveryMap from "./DeliveryMap";
import OrderStatusProgress from "./OrderStatusProgress";

const { Title } = Typography;

const TrackingModal = ({ visible, onCancel, orderId }) => {
  const { token } = useAuth();
  const [orderDetails, setOrderDetails] = useState(null);
  const [trackingData, setTrackingData] = useState(null); // Will hold route and initial device location
  const [currentDeviceLocation, setCurrentDeviceLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wsInstance, setWsInstance] = useState(null);

  const fetchInitialData = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch basic order details (for status, addresses etc.)
      const details = await getOrderDetails(orderId);
      setOrderDetails(details);

      // 2. Fetch initial tracking data (route info, last known location)
      //    The API doc suggests /api/orders/{id}/tracking for this.
      //    This will give us route.origin, route.pickup, route.delivery, and initial deviceLocation.
      if (["PICKING_UP", "DELIVERING"].includes(details.status)) {
        const initialTracking = await getOrderTracking(orderId);
        setTrackingData(initialTracking); // Contains route and initial deviceLocation
        setCurrentDeviceLocation(initialTracking.deviceLocation); // Set initial for map
      } else {
        // If not actively tracking, use device info from orderDetails if available, or set a placeholder
        // The `DeliveryMap` needs `route` and `deviceLocation`.
        // Construct a minimal route if possible from orderDetails for map context.
        const minimalRoute = {
          origin: details.assignedStation
            ? {
                // Assuming station might have coords or name
                name: details.assignedStation.name,
                latitude: details.assignedStation.latitude, // Add if API provides
                longitude: details.assignedStation.longitude, // Add if API provides
              }
            : null,
          pickup: details.pickupAddress,
          delivery: details.deliveryAddress,
        };
        setTrackingData({
          route: minimalRoute,
          deviceLocation: details.device?.currentLocation || null, // Use from orderDetails if present
        });
        setCurrentDeviceLocation(details.device?.currentLocation || null);
      }
    } catch (err) {
      message.error(`Failed to load order data: ${err.message}`);
      setError(`Failed to load order data: ${err.message}. Please try again.`);
      console.error("Error fetching initial data for tracking modal:", err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (visible && orderId) {
      fetchInitialData();
    } else {
      // Reset state when modal is not visible or orderId changes
      setOrderDetails(null);
      setTrackingData(null);
      setCurrentDeviceLocation(null);
      setLoading(true);
      setError(null);
    }
  }, [visible, orderId, fetchInitialData]);

  useEffect(() => {
    if (
      !visible ||
      !orderDetails ||
      !token ||
      !["PICKING_UP", "DELIVERING"].includes(orderDetails.status)
    ) {
      // If WebSocket is active, disconnect it
      if (wsInstance) {
        disconnectTracking(wsInstance);
        setWsInstance(null);
      }
      return;
    }

    // Establish WebSocket connection only if order is actively being tracked
    const ws = connectToTracking(
      orderId,
      token,
      (messageData) => {
        // onMessage
        // Assuming messageData is the full tracking object from WebSocket,
        // or at least contains deviceLocation.
        console.log("WebSocket message received:", messageData);
        if (messageData.deviceLocation) {
          setCurrentDeviceLocation(messageData.deviceLocation);
        }
        // Optionally update full tracking data if WebSocket sends more than just location
        // setTrackingData(prev => ({ ...prev, ...messageData }));

        // If WebSocket message indicates order status change (e.g., to DELIVERED)
        if (messageData.status && messageData.status !== orderDetails.status) {
          setOrderDetails((prev) => ({
            ...prev,
            status: messageData.status /* update history if sent */,
          }));
          if (
            messageData.status === "DELIVERED" ||
            messageData.status === "COMPLETED"
          ) {
            disconnectTracking(ws); // Disconnect if order is delivered/completed
            setWsInstance(null);
          }
        }
      },
      (err) => {
        // onError
        message.error(`WebSocket error: ${err.message || "Connection failed"}`);
        console.error("WebSocket error:", err);
        setError("Real-time tracking connection failed.");
      },
      (closeEvent) => {
        // onClose
        console.log("WebSocket connection closed:", closeEvent.reason);
        setWsInstance(null); // Clear instance on close
        // Optionally inform user, or attempt re-fetch if appropriate (not for this simplified version)
      }
    );
    setWsInstance(ws);

    return () => {
      // Cleanup on component unmount or when dependencies change
      if (ws) {
        disconnectTracking(ws);
        setWsInstance(null);
      }
    };
  }, [visible, orderId, token, orderDetails]); // Re-run if orderDetails changes (e.g. status)

  const handleCancel = () => {
    if (wsInstance) {
      disconnectTracking(wsInstance);
      setWsInstance(null);
    }
    onCancel(); // Call the parent's onCancel
  };

  const modalTitle = orderDetails
    ? `Tracking Order: ${orderDetails.orderId}`
    : "Loading Tracking Information...";

  return (
    <Modal
      title={modalTitle}
      visible={visible}
      onCancel={handleCancel}
      footer={null} // No explicit footer, close handled by onCancel
      width={800}
      destroyOnClose // Ensures state is reset if modal is re-rendered for a new order
      bodyStyle={{
        padding: "0",
        height: "70vh",
        display: "flex",
        flexDirection: "column",
      }}
      className="tracking-modal" // For potential custom CSS
    >
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <Spin size="large" tip="Loading tracking details..." />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full p-6">
          <Alert message="Error" description={error} type="error" showIcon />
        </div>
      ) : orderDetails && trackingData ? (
        <>
          <div
            className="flex-grow"
            style={{ minHeight: "0", flexBasis: "70%" }}
          >
            {" "}
            {/* Map area takes 70% */}
            <DeliveryMap
              route={trackingData.route}
              deviceLocation={currentDeviceLocation} // Pass the live device location
              orderDetails={orderDetails}
            />
          </div>
          <div
            className="p-4 border-t border-gray-200 bg-gray-50"
            style={{ flexShrink: 0, flexBasis: "30%", overflowY: "auto" }}
          >
            {" "}
            {/* Progress area */}
            <OrderStatusProgress
              currentStatus={orderDetails.status}
              statusHistory={orderDetails.statusHistory}
            />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full p-6">
          <Alert
            message="Information"
            description="No tracking information available for this order or state."
            type="info"
            showIcon
          />
        </div>
      )}
    </Modal>
  );
};

export default TrackingModal;
