"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useSocket } from "./SocketProvider";
import Loader from "@/components/Loader";

interface PlatformContextProps {
  sendClientData: () => void;
  platform: string | null;
  ip: string | null;
  platformData: any;
  packages: any[] | null;
  error: string | null;
  isConnected: boolean;
  loading: boolean;
}

const PlatformContext = createContext<PlatformContextProps | undefined>(undefined);

export const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const { socket, isConnected } = useSocket();
  const searchParams = useSearchParams();
  const [platform, setPlatform] = useState<string | null>(null);
  const [ip, setIp] = useState<string | null>(null);
  const [platformData, setPlatformData] = useState<any>(null);
  const [packages, setPackages] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const urlPlatform = searchParams.get("platform");
    if (urlPlatform) {
      setPlatform(urlPlatform);
    }
  }, [searchParams]);

  useEffect(() => {
    async function getPublicIP() {
      try {
        const response = await fetch("https://api64.ipify.org?format=json");
        const data = await response.json();
        setIp(data.ip);
      } catch (err) {
        setIp(null);
      }
    }
    getPublicIP();
  }, []);

  useEffect(() => {
    if (socket && isConnected && platform && ip) {
      socket.emit("client-data", { platform, ip });
    }
  }, [socket, isConnected, platform, ip]);

  useEffect(() => {
    if (!socket) return;

    const handlePlatformData = (data: any) => {
      setPlatformData(data);
      setError(null);
      setLoading(false);
    };

    const handlePlatformError = (errorData: { error: string }) => {
      setPlatformData(null);
      setError(errorData.error);
      setLoading(false);
    };

    socket.on("platform-data", handlePlatformData);
    socket.on("platform-error", handlePlatformError);

    return () => {
      socket.off("platform-data", handlePlatformData);
      socket.off("platform-error", handlePlatformError);
    };
  }, [socket]);

  useEffect(() => {
    async function fetchPackages(platformID: string) {
      try {
        const response = await fetch('http://localhost:3013/req/packages', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platformID }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch packages: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        
        setPackages(data?.packages);
      } catch (err) {
        setPackages(null);
      }
    }

    if (platformData?.platformID) {
      fetchPackages(platformData.platformID);
    }
  }, [platformData]);

  const sendClientData = () => {
    if (socket && isConnected && platform && ip) {
      socket.emit("client-data", { platform, ip });
    }
  };

  return (
    <PlatformContext.Provider
      value={{ sendClientData, platform, ip, platformData, packages, error, isConnected, loading }}
    >
      {loading ? <Loader /> : children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatform must be used within a PlatformProvider");
  }
  return context;
};
