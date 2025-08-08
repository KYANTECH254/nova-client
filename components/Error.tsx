"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorComponent({ message }: any) {
  const handleRefresh = () => {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name)); 
    });
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center text-center h-screen">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-300 ">Oops! Something went wrong</h2>
      <p className="text-gray-400 max-w-md">
        {message || "An unexpected error occurred. Please try refreshing the page."}
      </p>
      <button
        onClick={handleRefresh}
        className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700text-white font-semibold py-2 px-4 rounded-xl transition-all"
      >
        <RefreshCw className="w-5 h-5" /> Refresh Page
      </button>
    </div>
  );
}
