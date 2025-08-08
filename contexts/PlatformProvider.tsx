"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useSocket } from "./SocketProvider";
import Loader from "@/components/Loader";
import ErrorComponent from "@/components/Error";

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
  const router = useRouter();
  const pathname = usePathname();
  const { socket, isConnected } = useSocket();
  const searchParams = useSearchParams();
  const [platform, setPlatform] = useState<string | null>(null);
  const [ip, setIp] = useState<string | null>(null);
  const [platformData, setPlatformData] = useState<any>(null);
  const [packages, setPackages] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (pathname.includes("/admin") || pathname.includes("/manager")) {
      setLoading(false);
      return;
    }

    const baseDomain = "novawifi.online";
    let dplatform: string | null = null;

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";

    const urlPlatform = searchParams.get("platform");
    const hash = searchParams.get("hash");
    localStorage.setItem("hash", hash || "");
    // if (!hash) {
    //   window.location.href = "http://local.wifi/login";
    // }

    if (urlPlatform) {
      const sub = urlPlatform.split(".")[0];
      const fullDomain = `${sub}.${baseDomain}`;
      localStorage.setItem("platform", fullDomain);
      dplatform = fullDomain;
    } else {
      if (hostname.endsWith(baseDomain) && hostname.split(".").length > 2) {
        const fullSubdomain = hostname
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, "");
        localStorage.setItem("platform", fullSubdomain);
        dplatform = fullSubdomain;
      } else {
        const stored = localStorage.getItem("platform");
        if (stored) {
          dplatform = stored;
        } else {
          const dorigin = window.location.origin;
          dplatform = dorigin.replace(/^https?:\/\//, "")
            .replace(/\/$/, "");
        }
      }
    }

    // setPlatform(dplatform);
    setPlatform("netfundi.novawifi.online");
  }, [searchParams, pathname]);


  useEffect(() => {
    if (pathname.includes("/admin") || pathname.includes("/manager")) return;

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
  }, [pathname]);

  useEffect(() => {
    if (pathname.includes("/admin") || pathname.includes("/manager")) return;
    if (socket && isConnected && platform && ip) {
      const plat_id = localStorage.getItem("platform_id");
      plat_id ? socket.emit("client-data_2", { plat_id, ip }) : socket.emit("client-data", { platform, ip });
    }
  }, [socket, isConnected, platform, ip, pathname]);

  useEffect(() => {
    if (!socket) return;
    if (pathname.includes("/admin") || pathname.includes("/manager")) return;
    const temp = searchParams.get("template");

    const handlePlatformData = (data: any) => {
      if (!data) {
        setLoading(false);
        setError("An error occured, please try again!")
        return;
      }
      localStorage.setItem("platform_id", data.platformID);
      if (temp) {
        const { template, ...upddata } = data;
        upddata.template = temp;
        setPlatformData(upddata);
      } else {
        setPlatformData(data);
      }
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
  }, [socket, pathname]);

  useEffect(() => {
    if (pathname.includes("/admin") || pathname.includes("/manager")) return;

    async function fetchPackages(platformID: string) {
      const hash = localStorage.getItem("hash") || "";
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/packages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platformID, hash }),
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
  }, [platformData, pathname]);

  useEffect(() => {
    if (!platformData) {
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      const capitalized = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);
      setPlatformData({ name: capitalized });
    }
  }, []);


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
