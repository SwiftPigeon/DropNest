import React, { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

  // 初始化时从localStorage恢复用户状态
  useEffect(() => {
    const initAuth = () => {
      try {
        const savedToken = localStorage.getItem("jwt_token");
        const savedRefreshToken = localStorage.getItem("refresh_token");
        const savedUser = localStorage.getItem("user");

        if (savedToken && savedUser) {
          setToken(savedToken);
          setRefreshToken(savedRefreshToken);
          setUser(JSON.parse(savedUser));
          // 验证token是否仍然有效
          validateToken(savedToken);
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 验证token有效性
  const validateToken = async (authToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Token validation failed");
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Token validation error:", error);
      await handleTokenRefresh();
    }
  };

  // 处理token刷新
  const handleTokenRefresh = async () => {
    const currentRefreshToken =
      refreshToken || localStorage.getItem("refresh_token");

    if (!currentRefreshToken) {
      clearAuthData();
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: currentRefreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();

      setToken(data.token);
      setRefreshToken(data.refreshToken);
      setUser(data);

      localStorage.setItem("jwt_token", data.token);
      localStorage.setItem("refresh_token", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data));

      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      clearAuthData();
      return false;
    }
  };

  // 清除认证数据
  const clearAuthData = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  };

  // 登录
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      setUser(data);
      setToken(data.token);
      setRefreshToken(data.refreshToken);

      localStorage.setItem("jwt_token", data.token);
      localStorage.setItem("refresh_token", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data));

      message.success("登录成功！");
      return { success: true, data };
    } catch (error) {
      console.error("Login error:", error);
      message.error(error.message || "登录失败，请重试");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // 注册
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();

      setUser(data);
      setToken(data.token);
      setRefreshToken(data.refreshToken);

      localStorage.setItem("jwt_token", data.token);
      localStorage.setItem("refresh_token", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data));

      message.success("注册成功！");
      return { success: true, data };
    } catch (error) {
      console.error("Registration error:", error);
      message.error(error.message || "注册失败，请重试");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthData();
      message.success("已安全登出");
    }
  };

  // 更新用户资料
  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error("Profile update failed");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      message.success("资料更新成功！");
      return { success: true, data: updatedUser };
    } catch (error) {
      console.error("Profile update error:", error);
      message.error("资料更新失败，请重试");
      return { success: false, error: error.message };
    }
  };

  // 修改密码
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Password change failed");
      }

      message.success("密码修改成功！");
      return { success: true };
    } catch (error) {
      console.error("Password change error:", error);
      message.error("密码修改失败，请重试");
      return { success: false, error: error.message };
    }
  };

  // API请求辅助函数（自动处理token）
  const apiRequest = async (url, options = {}) => {
    const currentToken = token || localStorage.getItem("jwt_token");

    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, config);

      // 如果token过期，尝试刷新
      if (response.status === 401) {
        const refreshSuccess = await handleTokenRefresh();
        if (refreshSuccess) {
          // 重新发送请求
          const newToken = localStorage.getItem("jwt_token");
          config.headers.Authorization = `Bearer ${newToken}`;
          return await fetch(`${API_BASE_URL}${url}`, config);
        } else {
          throw new Error("Authentication failed");
        }
      }

      return response;
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    apiRequest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
