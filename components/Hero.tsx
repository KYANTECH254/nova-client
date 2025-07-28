"use client";
import { useEffect, useState } from "react";
import { Lock, Wifi, ChevronRight, Loader2 } from "lucide-react";
import GetCodePopup from "./Code";
import { usePlatform } from "@/contexts/PlatformProvider";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import EldoHub from "./Templates/EldoHub";
import NetFUndiHero from "./Templates/Hero/Netfundi/NetFundi";

export default function Hero() {
    const [code, setCode] = useState("");
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { platformData } = usePlatform();
    const [connect, setConnect] = useState(false);
    const origin = window.location.origin.replace(/^https?:\/\//, '');
    const path = usePathname();

    useEffect(() => {
        const checkWifiDetails = () => {
            const wifiDetails = localStorage.getItem("wifiLogin");
            if (wifiDetails) {
                setConnect(true);
                setCode(wifiDetails);
                return true;
            }
            return false;
        };
        if (checkWifiDetails()) return;
        const interval = setInterval(() => {
            if (checkWifiDetails()) {
                clearInterval(interval);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [path]);

    const handleLogin = async () => {
        setIsLoading(true);
        if (!code.trim()) {
            setIsLoading(false);
            return toast.error("Code is required!")
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/verifyCode`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: code, platformID: platformData?.platformID }),
            });

            if (!response.ok) {
                setIsLoading(false);
                return toast.error("Failed to fetch codes");
            }
            const data = await response.json();
            if (!data.success) {
                toast.error(data.message);
                localStorage.removeItem("wifiLogin")
                setIsLoading(false);
                return;
            };

            toast.success(data.message)
            return window.location.href = `http://local.wifi/login?username=${code}&password=${code}`;
        } catch (error) {
            toast.error("An error occured, try again");
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {platformData.template === "Nova Special" && (
                <>
                    <section className="relative flex items-center justify-center h-[70vh] w-full text-white px-4 md:px-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00AEEF] via-[#8E44AD] to-[#1B263B] animate-gradient"></div>
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>

                        <div className="relative z-10 text-center max-w-lg mx-auto">
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide mb-4 flex flex-wrap items-center justify-center break-words gap-2">
                                <Wifi className="w-8 h-8 text-[#00AEEF]" />
                                Connect to <span className="text-[#00AEEF]">{platformData?.name || "NOVA"}</span> WiFi
                            </h1>
                            <p className="text-base md:text-lg opacity-80 mb-6">
                                Enter your code to start browsing.
                            </p>

                            <div className="flex items-center justify-center bg-white/10 backdrop-blur-lg rounded-full px-3 py-2 w-full max-w-sm mx-auto transition-transform duration-300 hover:scale-105">
                                {!connect ? (
                                    <>
                                        <Lock className="text-[#00AEEF] w-5 h-5 mr-2" />
                                        <input
                                            type="text"
                                            placeholder="Enter Code"
                                            value={code}
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
                                                    Checking...
                                                </>
                                            ) : (
                                                <>
                                                    Login <ChevronRight className="ml-2 w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-row items-center justify-between gap-3">
                                        <label htmlFor="connect" className="text-white font-semibold text-lg">Already Purchased?</label>
                                        <button
                                            onClick={handleLogin}
                                            disabled={isLoading}
                                            className="flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-full transition-all text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <>
                                                Connect <ChevronRight className="ml-2 w-5 h-5" />
                                            </>
                                        </button>
                                    </div>
                                )}

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
            )}
            {platformData.template === "Nova Simple" && (
                <>
                    <section className="relative flex flex-col gap-5 items-center justify-center h-[40vh] w-full dark:bg-[#0a0a0a] bg-gray-200 dark:text-white text-black px-4 md:px-0">
                        <h1 className="text-center text-xl font-bold">Enter your code to start browsing.</h1>
                        <div className="flex items-center justify-center bg-white/10 backdrop-blur-lg rounded-full px-3 py-2 w-full max-w-sm mx-auto transition-transform duration-300 hover:scale-105">
                            {!connect ? (
                                <>
                                    <Lock className="text-[#00AEEF] w-5 h-5 mr-2" />
                                    <input
                                        type="text"
                                        placeholder="Enter Code"
                                        value={code}
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
                                                Checking...
                                            </>
                                        ) : (
                                            <>
                                                Login <ChevronRight className="ml-2 w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-row items-center justify-between gap-3">
                                    <label htmlFor="connect" className="text-white font-semibold text-lg">Already Purchased?</label>
                                    <button
                                        onClick={handleLogin}
                                        disabled={isLoading}
                                        className="flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-full transition-all text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <>
                                            Connect <ChevronRight className="ml-2 w-5 h-5" />
                                        </>
                                    </button>
                                </div>
                            )}

                        </div>

                    </section>
                </>
            )}

            {platformData.template === "EldoHub" && (
                <>
                    <EldoHub isLoading={isLoading} code={code} handleLogin={handleLogin} setCode={setCode} />
                </>
            )}
            {platformData?.template === "NetFundi" && (
                <NetFUndiHero isLoading={isLoading} code={code} handleLogin={handleLogin} setCode={setCode} />
            )}
        </>
    );
}
