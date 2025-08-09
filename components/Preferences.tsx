"use client";

import { useAdminAuth } from "@/contexts/AdminSessionProvider";
import { useTheme } from "@/contexts/ThemeProvider";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Preferences() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mt-14">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Settings</h1>

      <div className="space-y-6">
        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-md w-full">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-800 dark:text-gray-200">
            Browser Theme
          </h2>

          <button
            type="button"
            onClick={cycleTheme}
            className="p-2 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" && "🌞 Light"}
            {theme === "dark" && "🌜 Dark"}
            {theme === "system" && `🖥️ System (${resolvedTheme})`}
          </button>
        </div>
      </div>
    </div>
  );
}
