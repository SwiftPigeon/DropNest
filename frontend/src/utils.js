import axios from "axios";
import { message } from "antd";

// =================
// 常量定义 / Constants Definition
// =================

// API 基础配置 / API Base Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:8080",
  WEBSOCKET_URL: process.env.REACT_APP_WS_URL || "ws://localhost:8080",
  TIMEOUT: 10000,
};

// 订单状态 / Order Status
export const ORDER_STATUS = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAID: "PAID",
  PREPARING: "PREPARING",
  PICKING_UP: "PICKING_UP",
  PICKED_UP: "PICKED_UP",
  DELIVERING: "DELIVERING",
  DELIVERED: "DELIVERED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  FAILED: "FAILED",
};

// 订单状态显示文本 / Order Status Display Text
export const ORDER_STATUS_TEXT = {
  PENDING_PAYMENT: "Pending Payment",
  PAID: "Paid",
  PREPARING: "Preparing",
  PICKING_UP: "Picking Up",
  PICKED_UP: "Picked Up",
  DELIVERING: "Delivering",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
};

// 配送类型 / Delivery Type
export const DELIVERY_TYPE = {
  ROBOT: "ROBOT",
  DRONE: "DRONE",
};

// 配送速度 / Delivery Speed
export const DELIVERY_SPEED = {
  BASIC: "BASIC",
  STANDARD: "STANDARD",
  EXPRESS: "EXPRESS",
};

// 支付方式 / Payment Method
export const PAYMENT_METHOD = {
  CREDIT_CARD: "CREDIT_CARD",
  DEBIT_CARD: "DEBIT_CARD",
  PAYPAL: "PAYPAL",
  APPLE_PAY: "APPLE_PAY",
  GOOGLE_PAY: "GOOGLE_PAY",
};

// 通知类型 / Notification Type
export const NOTIFICATION_TYPE = {
  ORDER_STATUS: "ORDER_STATUS",
  DELIVERY_COMPLETED: "DELIVERY_COMPLETED",
  PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",
  SYSTEM: "SYSTEM",
};

// 地址标签 / Address Labels
export const ADDRESS_LABEL = {
  HOME: "Home",
  OFFICE: "Office",
  OTHER: "Other",
};

// 配送站信息 / Delivery Stations Info
export const DELIVERY_STATIONS = {
  STATION_1: {
    id: "station-1",
    name: "SkyHub Central",
    latitude: 37.7749,
    longitude: -122.4194,
  },
  STATION_2: {
    id: "station-2",
    name: "BayWing South",
    latitude: 37.7599,
    longitude: -122.4148,
  },
  STATION_3: {
    id: "station-3",
    name: "Marina Nest",
    latitude: 37.802,
    longitude: -122.443,
  },
};

// =================
// Axios 实例配置 / Axios Instance Configuration
// =================

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器 - 添加认证token / Request Interceptor - Add Auth Token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误 / Response Interceptor - Handle Errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response } = error;

    if (response?.status === 401) {
      // Token过期，尝试刷新 / Token expired, try to refresh
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const newToken = await refreshAuthToken();
          if (newToken) {
            // 重新发送原请求 / Retry original request
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return apiClient.request(error.config);
          }
        } catch (refreshError) {
          clearAuthTokens();
          window.location.href = "/login";
        }
      } else {
        clearAuthTokens();
        window.location.href = "/login";
      }
    }

    // 显示错误消息 / Show error message
    const errorMessage =
      response?.data?.message || error.message || "Request failed";
    message.error(errorMessage);

    return Promise.reject(error);
  }
);

// =================
// 认证相关工具函数 / Authentication Utility Functions
// =================

export const getAuthToken = () => {
  return localStorage.getItem("jwt_token");
};

export const getRefreshToken = () => {
  return localStorage.getItem("refresh_token");
};

export const setAuthTokens = (token, refreshToken) => {
  localStorage.setItem("jwt_token", token);
  localStorage.setItem("refresh_token", refreshToken);
};

export const clearAuthTokens = () => {
  localStorage.removeItem("jwt_token");
  localStorage.removeItem("refresh_token");
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// =================
// 认证API / Authentication API
// =================

export const authAPI = {
  // 用户注册 / User Registration
  register: async (userData) => {
    const response = await apiClient.post("/api/auth/register", userData);
    if (response.data.token) {
      setAuthTokens(response.data.token, response.data.refreshToken);
    }
    return response.data;
  },

  // 用户登录 / User Login
  login: async (credentials) => {
    const response = await apiClient.post("/api/auth/login", credentials);
    if (response.data.token) {
      setAuthTokens(response.data.token, response.data.refreshToken);
    }
    return response.data;
  },

  // 刷新token / Refresh Token
  refreshToken: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");

    const response = await apiClient.post("/api/auth/refresh", {
      refreshToken,
    });

    if (response.data.token) {
      setAuthTokens(response.data.token, response.data.refreshToken);
    }
    return response.data.token;
  },

  // 登出 / Logout
  logout: async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } finally {
      clearAuthTokens();
    }
  },
};

// 刷新认证token的内部函数 / Internal function to refresh auth token
const refreshAuthToken = async () => {
  try {
    return await authAPI.refreshToken();
  } catch (error) {
    throw error;
  }
};

// =================
// 用户管理API / User Management API
// =================

export const userAPI = {
  // 获取用户资料 / Get User Profile
  getProfile: async () => {
    const response = await apiClient.get("/api/users/profile");
    return response.data;
  },

  // 更新用户资料 / Update User Profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put("/api/users/profile", profileData);
    return response.data;
  },

  // 修改密码 / Change Password
  changePassword: async (passwordData) => {
    const response = await apiClient.put("/api/users/password", passwordData);
    return response.data;
  },
};

// =================
// 地址管理API / Address Management API
// =================

export const addressAPI = {
  // 获取地址列表 / Get Address List
  getAddresses: async () => {
    const response = await apiClient.get("/api/addresses");
    return response.data;
  },

  // 添加新地址 / Add New Address
  addAddress: async (addressData) => {
    const response = await apiClient.post("/api/addresses", addressData);
    return response.data;
  },

  // 更新地址 / Update Address
  updateAddress: async (addressId, addressData) => {
    const response = await apiClient.put(
      `/api/addresses/${addressId}`,
      addressData
    );
    return response.data;
  },

  // 删除地址 / Delete Address
  deleteAddress: async (addressId) => {
    const response = await apiClient.delete(`/api/addresses/${addressId}`);
    return response.data;
  },

  // 设置默认地址 / Set Default Address
  setDefaultAddress: async (addressId) => {
    const response = await apiClient.put(`/api/addresses/${addressId}/default`);
    return response.data;
  },
};

// =================
// 配送站API / Delivery Stations API
// =================

export const stationAPI = {
  // 获取所有配送站 / Get All Stations
  getAllStations: async () => {
    const response = await apiClient.get("/api/stations");
    return response.data;
  },

  // 获取配送站详情 / Get Station Details
  getStationDetails: async (stationId) => {
    const response = await apiClient.get(`/api/stations/${stationId}`);
    return response.data;
  },
};

// =================
// 订单管理API / Order Management API
// =================

export const orderAPI = {
  // 计算订单价格 / Calculate Order Price
  calculatePrice: async (orderData) => {
    const response = await apiClient.post("/api/orders/calculate", orderData);
    return response.data;
  },

  // 创建订单 / Create Order
  createOrder: async (orderData) => {
    const response = await apiClient.post("/api/orders", orderData);
    return response.data;
  },

  // 获取订单列表 / Get Order List
  getOrders: async (params = {}) => {
    const response = await apiClient.get("/api/orders", { params });
    return response.data;
  },

  // 获取订单详情 / Get Order Details
  getOrderDetails: async (orderId) => {
    const response = await apiClient.get(`/api/orders/${orderId}`);
    return response.data;
  },

  // 取消订单 / Cancel Order
  cancelOrder: async (orderId, reason) => {
    const response = await apiClient.put(`/api/orders/${orderId}/cancel`, {
      reason,
    });
    return response.data;
  },

  // 确认收货 / Confirm Delivery
  confirmDelivery: async (orderId, confirmationData) => {
    const response = await apiClient.put(
      `/api/orders/${orderId}/confirm`,
      confirmationData
    );
    return response.data;
  },
};

// =================
// 实时跟踪API / Real-time Tracking API
// =================

export const trackingAPI = {
  // 获取当前跟踪信息 / Get Current Tracking Info
  getCurrentTracking: async (orderId) => {
    const response = await apiClient.get(`/api/orders/${orderId}/tracking`);
    return response.data;
  },
};

// =================
// 支付API（简化版）/ Payment API (Simplified)
// =================

export const paymentAPI = {
  // 支付订单 / Pay Order
  payOrder: async (orderId, paymentMethod) => {
    const response = await apiClient.post("/api/payments/pay", {
      orderId,
      paymentMethod,
    });
    return response.data;
  },

  // 获取支付历史 / Get Payment History
  getPaymentHistory: async (params = {}) => {
    const response = await apiClient.get("/api/payments/history", { params });
    return response.data;
  },
};

// =================
// 评价API（简化版）/ Review API (Simplified)
// =================

export const reviewAPI = {
  // 提交评价 / Submit Review
  submitReview: async (orderId, reviewData) => {
    const response = await apiClient.post(
      `/api/orders/${orderId}/review`,
      reviewData
    );
    return response.data;
  },

  // 获取评价 / Get Review
  getReview: async (orderId) => {
    const response = await apiClient.get(`/api/orders/${orderId}/review`);
    return response.data;
  },
};

// =================
// 通知API / Notification API
// =================

export const notificationAPI = {
  // 获取通知列表 / Get Notification List
  getNotifications: async (params = {}) => {
    const response = await apiClient.get("/api/notifications", { params });
    return response.data;
  },

  // 标记为已读 / Mark as Read
  markAsRead: async (notificationId) => {
    const response = await apiClient.put(
      `/api/notifications/${notificationId}/read`
    );
    return response.data;
  },

  // 获取未读数量 / Get Unread Count
  getUnreadCount: async () => {
    const response = await apiClient.get("/api/notifications/unread-count");
    return response.data;
  },
};

// =================
// 配置API / Configuration API
// =================

export const configAPI = {
  // 获取配送类型 / Get Delivery Types
  getDeliveryTypes: async () => {
    const response = await apiClient.get("/api/config/delivery-types");
    return response.data;
  },

  // 获取速度选项 / Get Speed Options
  getSpeedOptions: async () => {
    const response = await apiClient.get("/api/config/speed-options");
    return response.data;
  },

  // 获取禁止物品列表 / Get Prohibited Items List
  getProhibitedItems: async () => {
    const response = await apiClient.get("/api/config/prohibited-items");
    return response.data;
  },
};

// =================
// WebSocket 管理 / WebSocket Management
// =================

class TrackingWebSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
  }

  // 连接WebSocket / Connect WebSocket
  connect(orderId) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication required for real-time tracking");
    }

    const wsUrl = `${API_CONFIG.WEBSOCKET_URL}/ws/tracking/${orderId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("WebSocket connection established");
      // 发送认证信息 / Send authentication info
      this.ws.send(
        JSON.stringify({
          type: "auth",
          token: token,
        })
      );
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notifyListeners("message", data);
      } catch (error) {
        console.error("Failed to parse WebSocket message", error);
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket connection closed");
      this.notifyListeners("close");
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.notifyListeners("error", error);
    };
  }

  // 断开连接 / Disconnect
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // 添加监听器 / Add Listener
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // 移除监听器 / Remove Listener
  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // 通知监听器 / Notify Listeners
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            "WebSocket listener callback error / WebSocket监听器回调错误:",
            error
          );
        }
      });
    }
  }
}

export const trackingWebSocket = new TrackingWebSocket();

// =================
// 工具函数 / Utility Functions
// =================

// 格式化价格 / Format Price
export const formatPrice = (price) => {
  return `$${price.toFixed(2)}`;
};

// 格式化距离 / Format Distance
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

// 格式化时间 / Format Time
export const formatTime = (timeString) => {
  const date = new Date(timeString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 格式化相对时间 / Format Relative Time
export const formatRelativeTime = (timeString) => {
  const now = new Date();
  const time = new Date(timeString);
  const diff = now - time;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 7) return `${days} days ago`;

  return formatTime(timeString);
};

// 验证手机号 / Validate Phone Number
export const validatePhone = (phone) => {
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  return phoneRegex.test(phone);
};

// 验证邮箱 / Validate Email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 计算两点之间的距离 (单位: km) / Calculate Distance Between Two Points (unit: km)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 地球半径 (km) / Earth radius (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 生成唯一ID / Generate Unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 防抖函数 / Debounce Function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 节流函数 / Throttle Function
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// 检查订单是否可以取消 / Check if Order Can Be Cancelled
export const canCancelOrder = (order) => {
  const cancelableStatuses = [
    ORDER_STATUS.PENDING_PAYMENT,
    ORDER_STATUS.PAID,
    ORDER_STATUS.PREPARING,
  ];
  return cancelableStatuses.includes(order.status);
};

// 检查订单是否需要确认收货 / Check if Order Needs Delivery Confirmation
export const needsDeliveryConfirmation = (order) => {
  return order.status === ORDER_STATUS.DELIVERED && order.requireSignature;
};

// 检查订单是否可以评价 / Check if Order Can Be Reviewed
export const canReviewOrder = (order) => {
  return order.status === ORDER_STATUS.COMPLETED;
};

// 获取订单状态颜色 / Get Order Status Color
export const getOrderStatusColor = (status) => {
  const colorMap = {
    [ORDER_STATUS.PENDING_PAYMENT]: "#faad14", // Orange / 橙色
    [ORDER_STATUS.PAID]: "#52c41a", // Green / 绿色
    [ORDER_STATUS.PREPARING]: "#1890ff", // Blue / 蓝色
    [ORDER_STATUS.PICKING_UP]: "#722ed1", // Purple / 紫色
    [ORDER_STATUS.PICKED_UP]: "#722ed1", // Purple / 紫色
    [ORDER_STATUS.DELIVERING]: "#1890ff", // Blue / 蓝色
    [ORDER_STATUS.DELIVERED]: "#52c41a", // Green / 绿色
    [ORDER_STATUS.COMPLETED]: "#52c41a", // Green / 绿色
    [ORDER_STATUS.CANCELLED]: "#ff4d4f", // Red / 红色
    [ORDER_STATUS.FAILED]: "#ff4d4f", // Red / 红色
  };
  return colorMap[status] || "#d9d9d9";
};

// 获取订单状态显示文本 / Get Order Status Display Text
export const getOrderStatusText = (status) => {
  return ORDER_STATUS_TEXT[status] || status;
};

// 获取最近的配送站 / Get Nearest Delivery Station
export const getNearestStation = (latitude, longitude) => {
  let nearestStation = null;
  let minDistance = Infinity;

  Object.values(DELIVERY_STATIONS).forEach((station) => {
    const distance = calculateDistance(
      latitude,
      longitude,
      station.latitude,
      station.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestStation = station;
    }
  });

  return nearestStation;
};

// 验证订单重量和体积限制 / Validate Order Weight and Volume Limits
export const validateOrderLimits = (items, deliveryType) => {
  const totalWeight = items.reduce(
    (sum, item) => sum + item.weight * item.quantity,
    0
  );
  const totalVolume = items.reduce(
    (sum, item) => sum + item.volume * item.quantity,
    0
  );

  const limits = {
    [DELIVERY_TYPE.ROBOT]: { maxWeight: 30, maxVolume: 100 },
    [DELIVERY_TYPE.DRONE]: { maxWeight: 5, maxVolume: 20 },
  };

  const limit = limits[deliveryType];
  if (!limit) return { valid: false, reason: "Invalid delivery type" };

  if (totalWeight > limit.maxWeight) {
    return {
      valid: false,
      reason: `Total weight (${totalWeight}kg) exceeds ${deliveryType.toLowerCase()} limit (${
        limit.maxWeight
      }kg)`,
    };
  }

  if (totalVolume > limit.maxVolume) {
    return {
      valid: false,
      reason: `Total volume (${totalVolume}L) exceeds ${deliveryType.toLowerCase()} limit (${
        limit.maxVolume
      }L)`,
    };
  }

  return { valid: true };
};

// 获取支付方式显示名称 / Get Payment Method Display Name
export const getPaymentMethodName = (method) => {
  const nameMap = {
    [PAYMENT_METHOD.CREDIT_CARD]: "Credit Card",
    [PAYMENT_METHOD.DEBIT_CARD]: "Debit Card",
    [PAYMENT_METHOD.PAYPAL]: "PayPal",
    [PAYMENT_METHOD.APPLE_PAY]: "Apple Pay",
    [PAYMENT_METHOD.GOOGLE_PAY]: "Google Pay",
  };
  return nameMap[method] || method;
};

// 格式化评分显示 / Format Rating Display
export const formatRating = (rating) => {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  return `${stars} (${rating}/5)`;
};

// 导出默认对象 / Export Default Object
export default {
  API_CONFIG,
  ORDER_STATUS,
  ORDER_STATUS_TEXT,
  DELIVERY_TYPE,
  DELIVERY_SPEED,
  PAYMENT_METHOD,
  NOTIFICATION_TYPE,
  ADDRESS_LABEL,
  DELIVERY_STATIONS,
  authAPI,
  userAPI,
  addressAPI,
  stationAPI,
  orderAPI,
  trackingAPI,
  paymentAPI,
  reviewAPI,
  notificationAPI,
  configAPI,
  trackingWebSocket,
  formatPrice,
  formatDistance,
  formatTime,
  formatRelativeTime,
  validatePhone,
  validateEmail,
  calculateDistance,
  generateId,
  debounce,
  throttle,
  canCancelOrder,
  needsDeliveryConfirmation,
  canReviewOrder,
  getOrderStatusColor,
  getOrderStatusText,
  getNearestStation,
  validateOrderLimits,
  getPaymentMethodName,
  formatRating,
  getAuthToken,
  setAuthTokens,
  clearAuthTokens,
  isAuthenticated,
};
