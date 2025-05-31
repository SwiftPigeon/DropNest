// utils/api.js - Low-level HTTP client configuration
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

// API endpoints configuration
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  REFRESH: "/api/auth/refresh",
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

  // Authenticated request method
  async authenticatedRequest(endpoint, options = {}) {
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await this.request(endpoint, { ...options, headers });

    // Handle 401 Unauthorized - token might be expired
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
