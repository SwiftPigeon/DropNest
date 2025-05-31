// services/authService.js - Authentication business logic layer
import { httpClient, API_ENDPOINTS } from "../utils/api";

class AuthService {
  // Login user with email and password
  async login(email, password) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();

      // Store authentication data
      this.storeAuthData(data);

      return data;
    } catch (error) {
      console.error("Login service error:", error);
      throw new Error("Login failed. Please check your credentials.");
    }
  }

  // Register new user
  async register(userData) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.REGISTER, {
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        name: userData.name,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const data = await response.json();

      // Store authentication data
      this.storeAuthData(data);

      return data;
    } catch (error) {
      console.error("Registration service error:", error);
      throw new Error("Registration failed. Please try again.");
    }
  }

  // Logout user
  async logout() {
    try {
      const token = this.getToken();

      if (token) {
        // Call logout API to invalidate token on server
        try {
          await httpClient.authPost(API_ENDPOINTS.LOGOUT);
        } catch (apiError) {
          console.error("Logout API call failed:", apiError);
          // Continue with local logout even if API call fails
        }
      }
    } finally {
      // Always clear local storage regardless of API call result
      this.clearAuthData();
    }
  }

  // Refresh authentication token
  async refreshToken() {
    try {
      const refreshTokenValue = this.getRefreshToken();

      if (!refreshTokenValue) {
        throw new Error("No refresh token available");
      }

      const response = await httpClient.post(API_ENDPOINTS.REFRESH, {
        refreshToken: refreshTokenValue,
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();

      // Update stored tokens
      localStorage.setItem("jwt_token", data.token);
      if (data.refreshToken) {
        localStorage.setItem("refresh_token", data.refreshToken);
      }

      return data;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, clear auth data
      this.clearAuthData();
      throw error;
    }
  }

  // Store authentication data in localStorage
  storeAuthData(authData) {
    localStorage.setItem("jwt_token", authData.token);
    localStorage.setItem("refresh_token", authData.refreshToken);

    const userData = {
      userId: authData.userId,
      email: authData.email,
      name: authData.name,
      phone: authData.phone,
    };

    localStorage.setItem("user_data", JSON.stringify(userData));
  }

  // Clear all authentication data
  clearAuthData() {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
  }

  // Get current JWT token
  getToken() {
    return localStorage.getItem("jwt_token");
  }

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem("refresh_token");
  }

  // Get stored user data
  getUserData() {
    try {
      const userData = localStorage.getItem("user_data");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  // Check if user is currently authenticated
  isAuthenticated() {
    const token = this.getToken();
    const userData = this.getUserData();
    return !!(token && userData);
  }

  // Get current authentication state
  getAuthState() {
    return {
      isAuthenticated: this.isAuthenticated(),
      user: this.getUserData(),
      token: this.getToken(),
    };
  }

  // Handle authentication errors (e.g., when API returns 401)
  handleAuthError() {
    this.clearAuthData();
    // You could emit an event here or use a callback to notify the app
    // For now, we'll just clear the data
  }
}

// Create and export a default instance
export const authService = new AuthService();
export default authService;
