"use client";
import { useEffect, useState } from "react";
import { Lock, Wifi, ChevronRight, Loader2 } from "lucide-react";
import GetCodePopup from "./Code";
import { usePlatform } from "@/contexts/PlatformProvider";
import { toast } from "sonner";

export default function Hero() {
    const [code, setCode] = useState("");
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { platformData } = usePlatform();

    const handleLogin = () => {
        if (!code.trim()) {
            return toast.error("Code is required!")
        }
        setIsLoading(true);
        window.location.href = `${window.location.origin}/login?username=${code}&password=${code}`;
    };

    return (
        <>
            <section className="relative flex items-center justify-center h-[70vh] w-full dark:text-white text-black px-4 md:px-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00AEEF] via-[#8E44AD] to-[#1B263B] animate-gradient"></div>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>

                <div className="relative z-10 text-center max-w-lg mx-auto">
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide mb-4 flex items-center justify-center gap-2">
                        <Wifi className="w-8 h-8 text-[#00AEEF]" />
                        Connect to <span className="text-[#00AEEF]">{platformData?.name || "NOVA"}</span> WiFi
                    </h1>
                    <p className="text-base md:text-lg opacity-80 mb-6">
                        Enter your code to start browsing.
                    </p>

                    {/* Input & Login Button */}
                    <div className="flex items-center bg-white/10 backdrop-blur-lg rounded-full px-3 py-2 w-full max-w-sm mx-auto transition-transform duration-300 hover:scale-105">
                        <Lock className="text-[#00AEEF] w-5 h-5 mr-2" />
                        <input
                            type="text"
                            placeholder="Enter Code"
                            value={code}
                            maxLength={6}
                            onChange={(e) => setCode(e.target.value)}
                            className="bg-transparent outline-none text-white w-full placeholder-gray-300 md:text-base font-semibold text-lg"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-full transition-all text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin w-5 h-5 mr-2" />
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    Login <ChevronRight className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Get Code Link */}
                    <p className="text-sm text-gray-300 mt-3">
                        Don’t have a code?{" "}
                        <a
                            onClick={() => setIsPopupOpen(true)}
                            href="#"
                            className="text-[#00AEEF] font-medium hover:underline"
                        >
                            Get One Here
                        </a>
                    </p>
                </div>
            </section>

            {/* Code Popup */}
            {isPopupOpen && <GetCodePopup onClose={() => setIsPopupOpen(false)} />}
        </>
    );
}
