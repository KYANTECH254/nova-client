"use client";
import { useState } from "react";
import { Lock, Wifi, ChevronRight } from "lucide-react";
import GetCodePopup from "./Code";

export default function Hero() {
    const [code, setCode] = useState("");
    const [isPopupOpen, setIsPopupOpen] = useState(false);


    return (
        <>
            <section className="relative flex items-center justify-center h-[70vh] w-full text-white px-4 md:px-0">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00AEEF] via-[#8E44AD] to-[#1B263B] animate-gradient"></div>

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>

                {/* Left GIF - Only visible on large screens */}
                <div className="absolute left-4 md:left-16 bottom-10 md:bottom-auto md:top-1/2 transform md:-translate-y-1/2 hidden md:block">
                    <img
                        src="/router-animation.gif"
                        alt="Connecting to WiFi"
                        title="Connecting to WiFi"
                        className="w-24 md:w-36 opacity-80 animate-fadeIn hover:animate-bounce"
                    />
                </div>

                {/* Right GIF - Only visible on large screens */}
                <div className="absolute right-4 md:right-16 bottom-10 md:bottom-auto md:top-1/2 transform md:-translate-y-1/2 hidden md:block">
                    <img
                        src="/5g-network-animation.gif"
                        alt="Connected to WiFi"
                        title="Connected to WiFi"
                        className="w-24 md:w-36 opacity-80 animate-fadeIn hover:animate-pulse"
                    />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 text-center max-w-lg mx-auto">
                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide mb-4 flex items-center justify-center gap-2">
                        <Wifi className="w-8 h-8 text-[#00AEEF]" />
                        Connect to <span className="text-[#00AEEF]">NOVA</span> WiFi
                    </h1>

                    {/* Description */}
                    <p className="text-base md:text-lg opacity-80 mb-6">
                        Enter your code to start browsing.
                    </p>

                    {/* Input Box */}
                    <div className="flex items-center bg-white/10 backdrop-blur-lg rounded-full px-3 py-2 w-full max-w-sm mx-auto transition-transform duration-300 hover:scale-105">
                        <Lock className="text-[#00AEEF] w-5 h-5 mr-2" />
                        <input
                            type="text"
                            placeholder="Enter Code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="bg-transparent outline-none text-white w-full placeholder-gray-300 md:text-base font-semibold text-lg"
                        />
                        <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-full transition-all text-sm md:text-base">
                            Login <ChevronRight className="ml-2 w-5 h-5" />
                        </button>
                    </div>

                    {/* Support Text */}
                    <p
                        className="text-sm text-gray-300 mt-3">
                        Don’t have a code? <a
                            onClick={() => setIsPopupOpen(true)}
                            href="#" className="text-[#00AEEF] font-medium hover:underline">Get One Here</a>
                    </p>
                </div>
            </section>

            {/* Render GetCodePopup when open */}
            {isPopupOpen && <GetCodePopup onClose={() => setIsPopupOpen(false)} />}
        </>
    );
}
