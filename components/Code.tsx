"use client";

import { useEffect, useState } from "react";
import { X, Copy, Loader2, Info } from "lucide-react";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";
import { usePlatform } from "@/contexts/PlatformProvider";
import NetFundiPopup from "./Templates/PopUp/Netfundi/NetFundi";

interface Code {
    password: string;
    username: string;
    expired: boolean;
    activeFrom: string;
    timeLeft: string;
}

export default function GetCodePopup({ onClose }: { onClose: () => void }) {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [loggingin, setLoggingIn] = useState(false);
    const [codes, setCodes] = useState<Code[]>([]);
    const { platformData } = usePlatform();
    const origin = window.location.origin.replace(/^https?:\/\//, '');

    useEffect(() => {
        const savedphone = localStorage.getItem("phone");
        if (savedphone) {
            setInput(savedphone)
        }
    }, [platformData, loading])

    const fetchCode = async () => {
        if (!input.trim()) {
            toast.error("Please enter a phone number or Mpesa code.");
            return;
        }

        setLoading(true);
        setCodes([]);
        const extractMpesaCode = (text: string) => {
            const match = text.match(/\b[A-Z0-9]{10,12}\b/);
            return match ? match[0] : text;
        };

        const extractedInput = extractMpesaCode(input);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: extractedInput, platformID: platformData.platformID }),
            });

            if (!response.ok) {
                toast.error("Failed to fetch codes");
            }

            const data = await response.json();

            if (data.type !== "success" || !data.foundcodes || data.foundcodes.length === 0) {
                toast.error("No codes found.");
                setLoading(false);
                return;
            };

            const formattedCodes = data.foundcodes.map((code: any) => ({
                username: code.username,
                password: code.password,
                expired: code.timeLeft === "Expired",
                activeFrom: code.activeFrom || "Unknown",
                timeLeft: code.timeLeft || "Unknown",
            }));

            setCodes(formattedCodes);
        } catch (error) {
            console.log("Error fetching codes:", error);
            toast.error("Failed to fetch codes. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (username: string) => {
        navigator.clipboard.writeText(username);
        toast.success("Code copied to clipboard!");
    };

    return (
        <>
            {platformData?.template !== "NetFundi" && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="bg-white/10 border-white/20 p-6 rounded-2xl shadow-2xl max-w-md w-full relative"
                    >
                        <button
                            className="absolute top-4 right-4 text-gray-500 bg-gray-200 hover:text-gray-900 transition rounded-full hover:bg-blue-200 w-10 h-10 flex items-center justify-center"
                            onClick={onClose}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-[#00AEEF] mb-4">Get Your Login Code</h2>
                        <div className="max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
                            <div className="flex flex-row gap-1 items-center mb-2">
                                {/* <Info size={24} className="text-[#00AEEF]" /> */}
                                <label className="text-[var(--color-text)] font-medium block">
                                    Enter Phone Number or Mpesa Code or Paste full Mpesa message after payment
                                </label>
                            </div>
                            <input
                                type="text"
                                placeholder="Enter Phone Number or Mpesa Code"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="bg-[var(--background)] text-[var(--color-text)] w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] outline-none transition"
                            />
                            <button
                                className="mt-4 w-full bg-[#00AEEF] hover:bg-[#008ecc] text-white font-semibold py-3 rounded-lg transition-all shadow-lg flex items-center justify-center"
                                onClick={fetchCode}
                                disabled={loading}
                            >
                                {loading ? <ClipLoader size={20} color="#fff" /> : "Get Code"}
                            </button>

                            {loading && (
                                <div className="mt-4 flex justify-center items-center gap-2">
                                    <Loader2 className="animate-spin w-5 h-5 text-[#00AEEF]" />
                                    <p>Fetching your codes... Please wait</p>
                                </div>
                            )}

                            {!loading && codes.length > 0 && (
                                <>
                                    <h3 className="mt-5 text-lg font-bold text-white">
                                        {codes.length} Code{codes.length > 1 ? "s" : ""} Found
                                    </h3>
                                    {codes.map((c, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-3 p-4 border rounded-lg shadow-md bg-gray-900 text-white"
                                        >
                                            <p className={`text-lg font-semibold ${c.expired ? "text-red-500" : "text-green-500"}`}>
                                                {c.expired ? "Expired" : "Active"}
                                            </p>

                                            <div
                                                className="mt-2 p-2 bg-gray-800 text-white border rounded-lg flex items-center justify-between cursor-pointer"
                                                onClick={() => copyToClipboard(c.username)}
                                            >
                                                <span className="font-mono text-lg">{c.username}</span>
                                                <Copy className="w-5 h-5 text-gray-400 hover:text-white transition" />
                                            </div>

                                            <p className="text-xs text-gray-400 mt-2">
                                                This code was active from {c.activeFrom}.
                                                <br />
                                                Remaining time: {c.timeLeft}.
                                            </p>
                                            <button
                                            disabled={loggingin}
                                                onClick={() => {
                                                    if (!c.expired) {
                                                        setLoggingIn(true);
                                                        window.location.href = `http://local.wifi/login?username=${c.username}&password=${c.password}`;
                                                    } else {
                                                        window.location.href = `${window.location.origin}/login`;
                                                    }
                                                }}
                                                className={`mt-4 w-full ${c.expired ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white font-semibold py-2 rounded-lg transition-all flex flex-row items-center gap-2 justify-center`}
                                            >
                                                {c.expired ? "Subscribe" : loggingin ? (
                                                    <>
                                                        <Loader2 className="animate-spin w-5 h-5 mr-2" />
                                                        Logging in...
                                                    </>
                                                ) : "Log In"}
                                            </button>
                                        </motion.div>
                                    ))}
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
            {platformData?.template === "NetFundi" && (
                <NetFundiPopup
                    codes={codes}
                    onClose={onClose}
                    loading={loading}
                    loggingin={loggingin}
                    setLoggingIn={setLoggingIn}
                    copyToClipboard={copyToClipboard}
                    setInput={setInput}
                    input={input}
                    fetchCode={fetchCode}
                />
            )}

        </>
    );
}
