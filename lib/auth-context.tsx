"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, GymConfig } from "./types";
import { defaultGymConfig } from "./mock-data";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  gymConfig: GymConfig;
  updateGymConfig: (config: GymConfig) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function   AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [gymConfig, setGymConfig] = useState<GymConfig>(defaultGymConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem("gym_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Load gym config from localStorage
    const storedConfig = localStorage.getItem("gym_config");
    if (storedConfig) {
      setGymConfig(JSON.parse(storedConfig));
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication
    const { authenticateUser } = await import("./mock-data");
    const authenticatedUser = authenticateUser(email, password);

    if (authenticatedUser) {
      setUser(authenticatedUser);
      localStorage.setItem("gym_user", JSON.stringify(authenticatedUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("gym_user");
  };

  const updateGymConfig = (config: GymConfig) => {
    setGymConfig(config);
    localStorage.setItem("gym_config", JSON.stringify(config));
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        gymConfig,
        updateGymConfig,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
