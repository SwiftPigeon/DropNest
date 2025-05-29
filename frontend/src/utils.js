import axios from "axios";
import { message } from "antd";

// =================
// 常量定义
// =================

// API 基础配置
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:8080",
  WEBSOCKET_URL: process.env.REACT_APP_WS_URL || "ws://localhost:8080",
  TIMEOUT: 10000,
};

// 订单状态
export const ORDER_STATUS = {
  PENDING_PAYMENT: "待支付",
  PAID: "已支付",
  PREPARING: "准备中",
  PICKING_UP: "取件中",
  PICKED_UP: "已取件",
  DELIVERING: "配送中",
  DELIVERED: "已送达",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  FAILED: "配送失败",
};

// 配送类型
export const DELIVERY_TYPE = {
  ROBOT: "ROBOT",
  DRONE: "DRONE",
};

// 配送速度
export const DELIVERY_SPEED = {
  BASIC: "BASIC",
  STANDARD: "STANDARD",
  EXPRESS: "EXPRESS",
};

// 支付方式
export const PAYMENT_METHOD = {
  CREDIT_CARD: "CREDIT_CARD",
  DEBIT_CARD: "DEBIT_CARD",
  PAYPAL: "PAYPAL",
  APPLE_PAY: "APPLE_PAY",
  GOOGLE_PAY: "GOOGLE_PAY",
};

// 通知类型
export const NOTIFICATION_TYPE = {
  ORDER_STATUS: "ORDER_STATUS",
  DELIVERY_COMPLETED: "DELIVERY_COMPLETED",
  PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",
  SYSTEM: "SYSTEM",
};

// =================
// Axios 实例配置
// =================

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器 - 添加认证token
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

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response } = error;

    if (response?.status === 401) {
      // Token过期，尝试刷新
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const newToken = await refreshAuthToken();
          if (newToken) {
            // 重新发送原请求
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

    // 显示错误消息
    const errorMessage = response?.data?.message || error.message || "请求失败";
    message.error(errorMessage);

    return Promise.reject(error);
  }
);

// =================
// 认证相关工具函数
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
// 认证API
// =================

export const authAPI = {
  // 用户注册
  register: async (userData) => {
    const response = await apiClient.post("/api/auth/register", userData);
    if (response.data.token) {
      setAuthTokens(response.data.token, response.data.refreshToken);
    }
    return response.data;
  },

  // 用户登录
  login: async (credentials) => {
    const response = await apiClient.post("/api/auth/login", credentials);
    if (response.data.token) {
      setAuthTokens(response.data.token, response.data.refreshToken);
    }
    return response.data;
  },

  // 刷新token
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

  // 登出
  logout: async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } finally {
      clearAuthTokens();
    }
  },
};

// 刷新认证token的内部函数
const refreshAuthToken = async () => {
  try {
    return await authAPI.refreshToken();
  } catch (error) {
    throw error;
  }
};

// =================
// 用户管理API
// =================

export const userAPI = {
  // 获取用户资料
  getProfile: async () => {
    const response = await apiClient.get("/api/users/profile");
    return response.data;
  },

  // 更新用户资料
  updateProfile: async (profileData) => {
    const response = await apiClient.put("/api/users/profile", profileData);
    return response.data;
  },

  // 修改密码
  changePassword: async (passwordData) => {
    const response = await apiClient.put("/api/users/password", passwordData);
    return response.data;
  },
};

// =================
// 地址管理API
// =================

export const addressAPI = {
  // 获取地址列表
  getAddresses: async () => {
    const response = await apiClient.get("/api/addresses");
    return response.data;
  },

  // 添加新地址
  addAddress: async (addressData) => {
    const response = await apiClient.post("/api/addresses", addressData);
    return response.data;
  },

  // 更新地址
  updateAddress: async (addressId, addressData) => {
    const response = await apiClient.put(
      `/api/addresses/${addressId}`,
      addressData
    );
    return response.data;
  },

  // 删除地址
  deleteAddress: async (addressId) => {
    const response = await apiClient.delete(`/api/addresses/${addressId}`);
    return response.data;
  },

  // 设置默认地址
  setDefaultAddress: async (addressId) => {
    const response = await apiClient.put(`/api/addresses/${addressId}/default`);
    return response.data;
  },
};

// =================
// 订单管理API
// =================

export const orderAPI = {
  // 计算订单价格
  calculatePrice: async (orderData) => {
    const response = await apiClient.post("/api/orders/calculate", orderData);
    return response.data;
  },

  // 创建订单
  createOrder: async (orderData) => {
    const response = await apiClient.post("/api/orders", orderData);
    return response.data;
  },

  // 获取订单列表
  getOrders: async (params = {}) => {
    const response = await apiClient.get("/api/orders", { params });
    return response.data;
  },

  // 获取订单详情
  getOrderDetails: async (orderId) => {
    const response = await apiClient.get(`/api/orders/${orderId}`);
    return response.data;
  },

  // 取消订单
  cancelOrder: async (orderId, reason) => {
    const response = await apiClient.put(`/api/orders/${orderId}/cancel`, {
      reason,
    });
    return response.data;
  },

  // 确认收货
  confirmDelivery: async (orderId, signatureData) => {
    const response = await apiClient.put(
      `/api/orders/${orderId}/confirm`,
      signatureData
    );
    return response.data;
  },
};

// =================
// 实时跟踪API
// =================

export const trackingAPI = {
  // 获取当前跟踪信息
  getCurrentTracking: async (orderId) => {
    const response = await apiClient.get(`/api/orders/${orderId}/tracking`);
    return response.data;
  },
};

// =================
// 支付API
// =================

export const paymentAPI = {
  // 创建支付
  createPayment: async (paymentData) => {
    const response = await apiClient.post("/api/payments/create", paymentData);
    return response.data;
  },

  // 获取支付状态
  getPaymentStatus: async (paymentId) => {
    const response = await apiClient.get(`/api/payments/${paymentId}/status`);
    return response.data;
  },
};

// =================
// 评价API
// =================

export const reviewAPI = {
  // 提交评价
  submitReview: async (orderId, reviewData) => {
    const response = await apiClient.post(
      `/api/orders/${orderId}/review`,
      reviewData
    );
    return response.data;
  },

  // 获取评价
  getReview: async (orderId) => {
    const response = await apiClient.get(`/api/orders/${orderId}/review`);
    return response.data;
  },
};

// =================
// 通知API
// =================

export const notificationAPI = {
  // 获取通知列表
  getNotifications: async (params = {}) => {
    const response = await apiClient.get("/api/notifications", { params });
    return response.data;
  },

  // 标记为已读
  markAsRead: async (notificationId) => {
    const response = await apiClient.put(
      `/api/notifications/${notificationId}/read`
    );
    return response.data;
  },

  // 获取未读数量
  getUnreadCount: async () => {
    const response = await apiClient.get("/api/notifications/unread-count");
    return response.data;
  },
};

// =================
// 配置API
// =================

export const configAPI = {
  // 获取配送类型
  getDeliveryTypes: async () => {
    const response = await apiClient.get("/api/config/delivery-types");
    return response.data;
  },

  // 获取速度选项
  getSpeedOptions: async () => {
    const response = await apiClient.get("/api/config/speed-options");
    return response.data;
  },

  // 获取禁止物品列表
  getProhibitedItems: async () => {
    const response = await apiClient.get("/api/config/prohibited-items");
    return response.data;
  },
};

// =================
// WebSocket 管理
// =================

class TrackingWebSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
  }

  connect(orderId) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("需要登录才能连接实时跟踪");
    }

    const wsUrl = `${API_CONFIG.WEBSOCKET_URL}/ws/tracking/${orderId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("WebSocket连接已建立");
      // 发送认证信息
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
        console.error("解析WebSocket消息失败:", error);
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket连接已关闭");
      this.notifyListeners("close");
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket错误:", error);
      this.notifyListeners("error", error);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("WebSocket监听器回调错误:", error);
        }
      });
    }
  }
}

export const trackingWebSocket = new TrackingWebSocket();

// =================
// 工具函数
// =================

// 格式化价格
export const formatPrice = (price) => {
  return `$${price.toFixed(2)}`;
};

// 格式化距离
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

// 格式化时间
export const formatTime = (timeString) => {
  const date = new Date(timeString);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 格式化相对时间
export const formatRelativeTime = (timeString) => {
  const now = new Date();
  const time = new Date(timeString);
  const diff = now - time;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return formatTime(timeString);
};

// 验证手机号
export const validatePhone = (phone) => {
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  return phoneRegex.test(phone);
};

// 验证邮箱
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 验证信用卡号
export const validateCreditCard = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/\s/g, "");
  return /^\d{16}$/.test(cleanNumber);
};

// 格式化信用卡号显示
export const formatCreditCardNumber = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/\s/g, "");
  return cleanNumber.replace(/(.{4})/g, "$1 ").trim();
};

// 脱敏信用卡号
export const maskCreditCardNumber = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/\s/g, "");
  if (cleanNumber.length < 4) return cardNumber;

  const lastFour = cleanNumber.slice(-4);
  const masked = "*".repeat(cleanNumber.length - 4);
  return formatCreditCardNumber(masked + lastFour);
};

// 计算两点之间的距离 (单位: km)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 地球半径 (km)
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

// 生成唯一ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 防抖函数
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

// 节流函数
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

// 检查订单是否可以取消
export const canCancelOrder = (order) => {
  const cancelableStatuses = ["PENDING_PAYMENT", "PAID", "PREPARING"];
  return cancelableStatuses.includes(order.status);
};

// 检查订单是否需要确认收货
export const needsDeliveryConfirmation = (order) => {
  return order.status === "DELIVERED" && order.requireSignature;
};

// 获取订单状态颜色
export const getOrderStatusColor = (status) => {
  const colorMap = {
    PENDING_PAYMENT: "#faad14", // 橙色
    PAID: "#52c41a", // 绿色
    PREPARING: "#1890ff", // 蓝色
    PICKING_UP: "#722ed1", // 紫色
    PICKED_UP: "#722ed1", // 紫色
    DELIVERING: "#1890ff", // 蓝色
    DELIVERED: "#52c41a", // 绿色
    COMPLETED: "#52c41a", // 绿色
    CANCELLED: "#ff4d4f", // 红色
    FAILED: "#ff4d4f", // 红色
  };
  return colorMap[status] || "#d9d9d9";
};

// 导出默认对象
export default {
  API_CONFIG,
  ORDER_STATUS,
  DELIVERY_TYPE,
  DELIVERY_SPEED,
  PAYMENT_METHOD,
  NOTIFICATION_TYPE,
  authAPI,
  userAPI,
  addressAPI,
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
  validateCreditCard,
  formatCreditCardNumber,
  maskCreditCardNumber,
  calculateDistance,
  generateId,
  debounce,
  throttle,
  canCancelOrder,
  needsDeliveryConfirmation,
  getOrderStatusColor,
  getAuthToken,
  setAuthTokens,
  clearAuthTokens,
  isAuthenticated,
};
