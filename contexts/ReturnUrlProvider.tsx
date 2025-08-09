"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ReturnUrlContextType = {
  returnUrl: string;
  setReturnUrl: (url: string) => void;
  clearReturnUrl: () => void;
};

const ReturnUrlContext = createContext<ReturnUrlContextType | undefined>(undefined);

const isExcludedPath = (path: string) => path.includes("/login");

export const ReturnUrlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [returnUrl, setReturnUrlState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("returnUrl");
      if (saved && !isExcludedPath(saved)) return saved;
      if (!isExcludedPath(window.location.pathname)) return window.location.pathname;
    }
    return "/admin";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateReturnUrl = () => {
      const path = window.location.pathname;
      if (!isExcludedPath(path) && path !== returnUrl) {
        setReturnUrlState(path);
        localStorage.setItem("returnUrl", path);
      }
    };

    const intervalId = setInterval(updateReturnUrl, 500);

    return () => clearInterval(intervalId);
  }, [returnUrl]);

  const setReturnUrl = (url: string) => {
    if (!isExcludedPath(url)) {
      setReturnUrlState(url);
      localStorage.setItem("returnUrl", url);
    }
  };

  const clearReturnUrl = () => {
    setReturnUrlState("/");
    localStorage.removeItem("returnUrl");
  };

  return (
    <ReturnUrlContext.Provider value={{ returnUrl, setReturnUrl, clearReturnUrl }}>
      {children}
    </ReturnUrlContext.Provider>
  );
};

export function useReturnUrl() {
  const context = useContext(ReturnUrlContext);
  if (!context) {
    throw new Error("useReturnUrl must be used within a ReturnUrlProvider");
  }
  return context;
}
