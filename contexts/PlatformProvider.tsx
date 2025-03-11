"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useSocket } from "./SocketProvider";
import Loader from "@/components/Loader";
import ErrorComponent from "@/components/Error";
import { SavePackagesToJson } from "@/actions/Operations";

export type Plan = {
  name: string;
  price: string;
  speed: string;
  period: string;
  usage: string;
  devices: string;
  category: "Daily" | "Weekly" | "Monthly";
}

interface PlatformContextProps {
  sendClientData: () => void;
  platform: string | null;
  ip: string | null;
  platformData: any;
  packages: Plan[];
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
  const [packages, setPackages] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let urlPlatform;
    urlPlatform = searchParams.get("platform");
    if (urlPlatform) {
      localStorage.setItem("platform", urlPlatform);
      setPlatform(urlPlatform)
      return;
    } else {
      urlPlatform = localStorage.getItem("platform");
      if (urlPlatform) {
        setPlatform(urlPlatform);
      }
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
      const plat_id = localStorage.getItem("platform_id");
      plat_id ? socket.emit("client-data_2", { plat_id, ip }) : socket.emit("client-data", { platform, ip });
    }
  }, [socket, isConnected, platform, ip]);

  useEffect(() => {
    if (!socket) return;

    const handlePlatformData = (data: any) => {
      if (data === null) {
        setLoading(false);
        setError("An error occured, please try again!")
        return;
      }
      localStorage.setItem("platform_id", data.platformID);
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/packages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platformID }),
        });

        if (!response.ok) {
          setLoading(false);
          setError('Failed to fetch packages');
          return;
        }

        const data = await response.json();
        setPackages(data?.packages);
        setLoading(false);
        // await SavePackagesToJson(data?.packages);
      } catch (err) {
        setError('Failed to fetch packages');
        setLoading(false);
        setPackages([]);
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
      {loading ? <Loader /> : error ? <ErrorComponent message={error} /> : children}
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
