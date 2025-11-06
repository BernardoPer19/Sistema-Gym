"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, GymConfig } from "./types/types";
import { defaultGymConfig } from "./mock-data";

interface AuthContextType {
  gymConfig: GymConfig;
  updateGymConfig: (config: GymConfig) => void;
  isLoading: boolean;
}

const ConfingContext = createContext<AuthContextType | undefined>(undefined);

export function ConfingProvider({ children }: { children: ReactNode }) {
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
    <ConfingContext.Provider
      value={{
        gymConfig,
        updateGymConfig,
        isLoading,
      }}
    >
      {children}
    </ConfingContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfingContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfingProvider");
  }
  return context;
}
