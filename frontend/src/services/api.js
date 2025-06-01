// api.js - Complete API client with HTTP utilities and service functions (Updated)
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

// API endpoints configuration (removed refresh token endpoint)
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT: "/api/auth/logout",

  // User Management
  PROFILE: "/api/users/profile",
  UPDATE_PROFILE: "/api/users/profile",
  CHANGE_PASSWORD: "/api/users/password",

  // Address Management
  ADDRESSES: "/api/addresses",
  ADDRESS_BY_ID: (id) => `/api/addresses/${id}`,

  // Orders
  CALCULATE_PRICE: "/api/orders/calculate",
  ORDERS: "/api/orders",
  ORDER_BY_ID: (id) => `/api/orders/${id}`,
  CANCEL_ORDER: (id) => `/api/orders/${id}/cancel`,
  CONFIRM_DELIVERY: (id) => `/api/orders/${id}/confirm`,
  ORDER_TRACKING: (id) => `/api/orders/${id}/tracking`,

  // Payments
  PAY_ORDER: "/api/payments/pay",
  PAYMENT_HISTORY: "/api/payments/history",

  // Reviews
  ORDER_REVIEW: (id) => `/api/orders/${id}/review`,

  // Configuration
  DELIVERY_TYPES: "/api/config/delivery-types",
  SPEED_OPTIONS: "/api/config/speed-options",
};

// HTTP client class for making requests
class HttpClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get authorization header with current token
  getAuthHeaders() {
    const token = localStorage.getItem("jwt_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Core request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      return response;
    } catch (error) {
      console.error("HTTP request failed:", error);
      throw error;
    }
  }

  // Authenticated request method (simplified - no token refresh)
  async authenticatedRequest(endpoint, options = {}) {
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await this.request(endpoint, { ...options, headers });

    // Handle 401 Unauthorized - token expired, need to re-login
    if (response.status === 401) {
      throw new Error("AUTHENTICATION_REQUIRED");
    }

    return response;
  }

  // Convenience methods for common HTTP methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: "GET", ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: "DELETE", ...options });
  }

  // Authenticated versions
  async authGet(endpoint, options = {}) {
    return this.authenticatedRequest(endpoint, { method: "GET", ...options });
  }

  async authPost(endpoint, data, options = {}) {
    return this.authenticatedRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    });
  }

  async authPut(endpoint, data, options = {}) {
    return this.authenticatedRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    });
  }

  async authDelete(endpoint, options = {}) {
    return this.authenticatedRequest(endpoint, {
      method: "DELETE",
      ...options,
    });
  }
}

// Create and export a default HTTP client instance
export const httpClient = new HttpClient();

// ============ API SERVICE FUNCTIONS ============

// Auth API functions (removed refresh token functionality)
export const loginUser = async ({ email, password }) => {
  const response = await httpClient.post(API_ENDPOINTS.LOGIN, {
    email,
    password,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }
  return response.json();
};

export const registerUser = async (userData) => {
  const response = await httpClient.post(API_ENDPOINTS.REGISTER, userData);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registration failed");
  }
  return response.json();
};

export const logoutUser = async (token) => {
  const response = await httpClient.authenticatedRequest(API_ENDPOINTS.LOGOUT, {
    method: "POST",
  });
  if (!response.ok) {
    console.warn(
      "Logout API call failed, but continuing with client-side logout"
    );
  }
  return response.ok;
};

// Removed refreshToken function

// User API functions
export const fetchUserProfile = async () => {
  const response = await httpClient.authGet(API_ENDPOINTS.PROFILE);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch profile");
  }
  return response.json();
};

export const updateUserProfile = async (profileData) => {
  const response = await httpClient.authPut(
    API_ENDPOINTS.UPDATE_PROFILE,
    profileData
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update profile");
  }
  return response.json();
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await httpClient.authPut(API_ENDPOINTS.CHANGE_PASSWORD, {
    currentPassword,
    newPassword,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to change password");
  }
  return response.json();
};

// Address API functions
export const getAddresses = async () => {
  const response = await httpClient.authGet(API_ENDPOINTS.ADDRESSES);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch addresses");
  }
  return response.json();
};

export const addAddress = async (addressData) => {
  const response = await httpClient.authPost(
    API_ENDPOINTS.ADDRESSES,
    addressData
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to add address");
  }
  return response.json();
};

export const updateAddress = async (addressId, addressData) => {
  const response = await httpClient.authPut(
    API_ENDPOINTS.ADDRESS_BY_ID(addressId),
    addressData
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update address");
  }
  return response.json();
};

export const deleteAddress = async (addressId) => {
  const response = await httpClient.authDelete(
    API_ENDPOINTS.ADDRESS_BY_ID(addressId)
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete address");
  }
  return response.ok;
};

// Order API functions
export const calculateOrderPrice = async (orderData) => {
  const response = await httpClient.authPost(
    API_ENDPOINTS.CALCULATE_PRICE,
    orderData
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to calculate price");
  }
  return response.json();
};

export const createOrder = async (orderData) => {
  const response = await httpClient.authPost(API_ENDPOINTS.ORDERS, orderData);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create order");
  }
  return response.json();
};

export const getOrders = async (page = 1, limit = 10, status = null) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (status) queryParams.append("status", status);

  const response = await httpClient.authGet(
    `${API_ENDPOINTS.ORDERS}?${queryParams}`
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch orders");
  }
  return response.json();
};

export const getOrderDetails = async (orderId) => {
  const response = await httpClient.authGet(API_ENDPOINTS.ORDER_BY_ID(orderId));
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch order details");
  }
  return response.json();
};

export const cancelOrder = async (orderId, reason) => {
  const response = await httpClient.authPut(
    API_ENDPOINTS.CANCEL_ORDER(orderId),
    { reason }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to cancel order");
  }
  return response.json();
};

export const confirmDelivery = async (orderId, confirmed, signatureName) => {
  const response = await httpClient.authPut(
    API_ENDPOINTS.CONFIRM_DELIVERY(orderId),
    {
      confirmed,
      signatureName,
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to confirm delivery");
  }
  return response.json();
};

// Tracking API functions
export const getOrderTracking = async (orderId) => {
  const response = await httpClient.authGet(
    API_ENDPOINTS.ORDER_TRACKING(orderId)
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch tracking info");
  }
  return response.json();
};

// Payment API functions
export const payOrder = async (orderId, paymentMethod) => {
  const response = await httpClient.authPost(API_ENDPOINTS.PAY_ORDER, {
    orderId,
    paymentMethod,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Payment failed");
  }
  return response.json();
};

export const getPaymentHistory = async (page = 1, limit = 10) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  const response = await httpClient.authGet(
    `${API_ENDPOINTS.PAYMENT_HISTORY}?${queryParams}`
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch payment history");
  }
  return response.json();
};

// Review API functions
export const submitOrderReview = async (orderId, rating, comment) => {
  const response = await httpClient.authPost(
    API_ENDPOINTS.ORDER_REVIEW(orderId),
    {
      rating,
      comment,
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to submit review");
  }
  return response.json();
};

export const getOrderReview = async (orderId) => {
  const response = await httpClient.authGet(
    API_ENDPOINTS.ORDER_REVIEW(orderId)
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch review");
  }
  return response.json();
};

// Configuration API functions
export const getDeliveryTypes = async () => {
  const response = await httpClient.authGet(API_ENDPOINTS.DELIVERY_TYPES);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch delivery types");
  }
  return response.json();
};

export const getSpeedOptions = async () => {
  const response = await httpClient.authGet(API_ENDPOINTS.SPEED_OPTIONS);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch speed options");
  }
  return response.json();
};
