"use client";

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-white text-gray-900 dark:bg-black dark:text-gray-100">
      <div className="relative">
        <img
          src="/router-animation.gif"
          alt="Connecting to WiFi"
          title="Connecting to WiFi"
          className="max-w-56 w-auto opacity-90 animate-fadeIn hover:animate-bounce"
        />
        <div className="absolute inset-0 bg-blue-500/10 opacity-20 blur-xl rounded-full animate-pulse dark:bg-blue-400/20"></div>
      </div>
    </div>
  );
}
