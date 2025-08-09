"use client"
import React, { createContext, useContext, useEffect, useState } from 'react';

type ReturnUrlContextType = {
  returnUrl: string;
  setReturnUrl: (url: string) => void;
  clearReturnUrl: () => void;
};

const ReturnUrlContext = createContext<ReturnUrlContextType | undefined>(undefined);

export const ReturnUrlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [returnUrl, setReturnUrlState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('returnUrl') || window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    localStorage.setItem('returnUrl', returnUrl);
  }, [returnUrl]);

  const setReturnUrl = (url: string) => {
    setReturnUrlState(url);
    localStorage.setItem('returnUrl', url);
  };

  const clearReturnUrl = () => {
    setReturnUrlState('/');
    localStorage.removeItem('returnUrl');
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
    throw new Error('useReturnUrl must be used within a ReturnUrlProvider');
  }
  return context;
}
