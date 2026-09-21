"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "@/lib/authTypes";
import { loginUser, registerUser, logoutUser, getCurrentUser } from "@/lib/authApi";
import { useToast } from "./Toast";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    getCurrentUser()
      .then((userData) => setUser(userData))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const data = await loginUser(identifier, password);
      setUser(data.data); // ApiResponse wrapper: data.data is the user object directly
      showToast({ variant: "success", title: "Welcome back!" });
      return true;
    } catch (error) {
      showToast({
        variant: "error",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
      return false;
    }
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      await registerUser(data);
      setUser(null);
      showToast({
        variant: "success",
        title: "Account created!",
        description: `Welcome, ${data.firstName}. Please log in.`,
      });
      return true;
    } catch (error) {
      showToast({
        variant: "error",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
      return false;
    }
  };

  const logout = async () => {
    setUser(null); // clear immediately, don't wait on the network call
    try {
      await logoutUser();
      showToast({ variant: "info", title: "Logged out" });
    } catch {
      // Even if the backend call fails, the user is logged out locally.
      // This can happen if the access token already expired.
      showToast({ variant: "info", title: "Logged out" });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}