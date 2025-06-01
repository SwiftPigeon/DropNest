// src/context/AuthContext.js (Updated - Removed refresh token)
import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import {
  loginUser,
  registerUser,
  logoutUser,
  fetchUserProfile,
} from "../services/api";

const AuthContext = createContext();
const TOKEN_KEY = "jwt_token";
const USER_INFO_KEY = "user_info";

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const attemptAutoLogin = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_INFO_KEY);

      if (storedToken && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setToken(storedToken);
          console.log("Auth Provider: Auto-login with stored data.", user);
        } catch (e) {
          console.error(
            "Auth Provider: Failed to parse stored user, clearing auth.",
            e
          );
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_INFO_KEY);
          setCurrentUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };
    attemptAutoLogin();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // This will be intercepted by MSW
      const response = await loginUser({ email, password });
      const { token: apiToken, ...userData } = response; // No more refreshToken

      localStorage.setItem(TOKEN_KEY, apiToken);
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userData));

      setCurrentUser(userData);
      setToken(apiToken);
      setLoading(false);
      return userData;
    } catch (error) {
      console.error("Login failed:", error.message || error);
      setLoading(false);
      setCurrentUser(null);
      setToken(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);
      throw error; // Re-throw for the component to handle
    }
  };

  const signup = async (userData) => {
    // { email, password, phone, name }
    setLoading(true);
    try {
      // This will be intercepted by MSW
      const response = await registerUser(userData);
      const { token: apiToken, ...newUserData } = response; // No more refreshToken

      localStorage.setItem(TOKEN_KEY, apiToken);
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(newUserData));

      setCurrentUser(newUserData);
      setToken(apiToken);
      setLoading(false);
      return newUserData;
    } catch (error) {
      console.error("Signup failed:", error.message || error);
      setLoading(false);
      setCurrentUser(null);
      setToken(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // This will be intercepted by MSW. Even if it fails, clear client-side.
      await logoutUser(token); // Pass current token if API needs it
    } catch (error) {
      console.warn(
        "Mock logout API call failed (expected in some mock setups):",
        error
      );
    } finally {
      setCurrentUser(null);
      setToken(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);
      setLoading(false);
    }
  };

  // Fetch profile if needed, e.g. on app load
  const getProfile = async () => {
    if (!token) return null;
    try {
      const profileData = await fetchUserProfile(token);
      setCurrentUser(profileData); // Update with fresh data
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(profileData));
      return profileData;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      // Handle token expiry by logging out (no refresh token available)
      if (error.status === 401 || error.status === 403) {
        await logout();
      }
      return null;
    }
  };

  const value = {
    currentUser,
    token,
    loading,
    login,
    signup,
    logout,
    getProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
