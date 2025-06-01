// src/services/trackingService.js

const WEBSOCKET_BASE_URL = "ws://localhost:8080/ws/tracking"; // As per API doc

/**
 * Establishes a WebSocket connection for real-time order tracking.
 *
 * @param {string} orderId - The ID of the order to track.
 * @param {string} token - The JWT token for authentication.
 * @param {function} onMessage - Callback function to handle incoming messages (receives parsed JSON data).
 * @param {function} onError - Callback function to handle WebSocket errors.
 * @param {function} onClose - Callback function to handle WebSocket connection closure.
 * @returns {WebSocket | null} The WebSocket instance if connection is attempted, or null if params are missing.
 */
export const connectToTracking = (
  orderId,
  token,
  onMessage,
  onError,
  onClose
) => {
  if (!orderId || !token) {
    console.error(
      "TrackingService: Order ID and token are required to connect."
    );
    if (onError) {
      onError(
        new Error("Order ID and token are required to connect for tracking.")
      );
    }
    return null;
  }

  // Authentication for WebSockets in browsers when a custom Authorization header
  // cannot be set for the initial HTTP upgrade request is typically handled
  // via query parameters or a sub-protocol.
  // Given the API doc mentions an "Authorization: Bearer {{jwt_token}}" header,
  // a common workaround for browser clients is to pass the token as a query parameter.
  // The server would need to be configured to accept this.
  // Example: ws://localhost:8080/ws/tracking/{orderId}?token={jwt_token}
  // The exact query parameter name ('token', 'authToken', 'access_token', etc.) depends on the backend implementation.
  // We'll use 'token' as a common convention.
  const wsUrl = `${WEBSOCKET_BASE_URL}/${orderId}?token=${encodeURIComponent(
    token
  )}`;

  // Alternative using Sec-WebSocket-Protocol (if server supports it for auth):
  // const ws = new WebSocket(wsUrlWithoutQueryParam, [token]); // Or [`Bearer ${token}`]
  // This would send the token in the 'Sec-WebSocket-Protocol' header.

  console.log(`TrackingService: Attempting to connect to ${wsUrl}`);
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log(
      `TrackingService: WebSocket connection established for order ${orderId}.`
    );
    // If the server expects an auth message *after* connection, send it here.
    // e.g., ws.send(JSON.stringify({ type: 'auth', token: token }));
    // However, the query param or protocol method is for handshake-time auth.
  };

  ws.onmessage = (event) => {
    try {
      const messageData = JSON.parse(event.data);
      if (onMessage) {
        onMessage(messageData);
      }
    } catch (e) {
      console.error(
        "TrackingService: Error parsing message data:",
        e,
        event.data
      );
      if (onError) {
        onError(new Error("Failed to parse WebSocket message: " + e.message));
      }
    }
  };

  ws.onerror = (error) => {
    console.error(
      `TrackingService: WebSocket error for order ${orderId}:`,
      error
    );
    if (onError) {
      onError(error); // 现有代码
    }
    // 添加：标记连接失败，让调用方知道需要降级
  };

  ws.onclose = (event) => {
    console.log(
      `TrackingService: WebSocket connection closed for order ${orderId}. Code: ${event.code}, Reason: ${event.reason}, Clean: ${event.wasClean}`
    );
    if (onClose) {
      onClose(event); // Pass the original close event
    }
  };

  return ws;
};

/**
 * Closes an active WebSocket connection.
 *
 * @param {WebSocket} ws - The WebSocket instance to disconnect.
 */
export const disconnectTracking = (ws) => {
  if (
    ws &&
    (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)
  ) {
    console.log("TrackingService: Closing WebSocket connection.");
    ws.close(1000, "User initiated disconnect"); // 1000 is a normal closure
  } else {
    console.log(
      "TrackingService: WebSocket connection not open or already closing/closed."
    );
  }
};
