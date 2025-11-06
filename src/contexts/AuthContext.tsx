"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as api from "@/lib/api";

interface User {
  id: string;
  email: string;
  username?: string | null;
  emailVerified: boolean;
  roles: string[];
  displayName?: string | null; // For compatibility
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  accessToken: string | null;
  signIn: (emailOrUsername: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  accessToken: null,
  signIn: async () => {},
  signUp: async () => {},
  logout: async () => {},
  refreshToken: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Try to refresh token on mount to restore session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Check for existing access token in localStorage first
        const storedToken =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")?.trim()
            : null;

        if (storedToken) {
          // If we have a stored token, try to use it
          console.log("🔄 Found stored token, attempting to restore session...");
          try {
            const userData = await api.getCurrentUser(storedToken);
            setAccessToken(storedToken);
            setUser({
              ...userData,
              displayName: userData.username || undefined,
            });
            console.log("✅ Session restored successfully with stored token");
            return;
          } catch (tokenError) {
            // Stored token is invalid, clear it and try refresh
            console.log("⚠️ Stored token invalid, trying refresh...");
            if (typeof window !== "undefined") {
              localStorage.removeItem("accessToken");
            }
          }
        }

        // DO NOT attempt refresh for guests with no cookie
        // Silently skip - only refresh if there's actually a refresh cookie
        // (The refresh call will fail with 401 if no cookie, so we skip it entirely)
        console.log("ℹ️ No stored token found - user is a guest, skipping refresh");
      } catch (error) {
        // Error during token validation or refresh - treat as guest
        console.log("❌ Session restoration failed - user needs to login");
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const signIn = async (emailOrUsername: string, password: string) => {
    const response = await api.login(emailOrUsername, password);
    setAccessToken(response.accessToken);

    // Store token in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", response.accessToken);
    }

    const userData = {
      ...response.user,
      displayName: response.user.username, // For compatibility
    };
    setUser(userData);
    console.log("User logged in:", userData);
  };

  const signUp = async (email: string, password: string, username?: string) => {
    console.log("🔵 AuthContext signUp called with:", { email, username });
    try {
      console.log("🔵 About to call api.register...");
      const response = await api.register(email, password, username);
      console.log("🔵 API register response received:", response);
      setAccessToken(response.accessToken);

      // Store token in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", response.accessToken);
      }

      const userData = {
        ...response.user,
        displayName: response.user.username, // For compatibility
      };
      setUser(userData);
      console.log("🔵 User signed up successfully, user set:", userData);
    } catch (error: any) {
      console.error("🔴 AuthContext signUp error:", error);
      console.error("🔴 Error message:", error?.message);
      console.error("🔴 Error stack:", error?.stack);
      throw error;
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setAccessToken(null);
  };

  const refreshToken = async () => {
    const token = await api.refreshAccessToken();
    setAccessToken(token);
  };

  const value = {
    user,
    loading,
    accessToken,
    signIn,
    signUp,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
