"use client";

import { useState } from "react";
import { X, Copy, Loader2, Info } from "lucide-react";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";

interface Code {
    code: string;
    expired: boolean;
    activeFrom: string;
    remainingTime: string;
}

export default function GetCodePopup({ onClose }: { onClose: () => void }) {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [codes, setCodes] = useState<Code[]>([]);

    const fetchCode = () => {
        if (!input.trim()) return;
        setLoading(true);
        setTimeout(() => {
            // Mock response: Generate 0-3 codes
            const numCodes = Math.floor(Math.random() * 4);
            const newCodes: Code[] = Array.from({ length: numCodes }, () => {
                const isExpired = Math.random() < 0.3; // 30% chance expired
                return {
                    code: `CODE-${Math.floor(100000 + Math.random() * 900000)}`,
                    expired: isExpired,
                    activeFrom: "2024-02-01",
                    remainingTime: isExpired ? "Expired" : "2 days, 4 hours",
                };
            });

            setCodes(newCodes);
            setLoading(false);
        }, 2000);
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Code copied to clipboard!", {
            style: { backgroundColor: "[var(--background)]" }
        });
    };

    return (
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
                        <Info size={24} className="text-[#00AEEF]" />
                        <label className="text-[var(--color-text)] font-medium block">
                            Enter Phone Number or Mpesa Code
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
                                        onClick={() => copyToClipboard(c.code)}
                                    >
                                        <span className="font-mono text-lg">{c.code}</span>
                                        <Copy className="w-5 h-5 text-gray-400 hover:text-white transition" />
                                    </div>

                                    <p className="text-xs text-gray-400 mt-2">
                                        This code was active from {c.activeFrom}.
                                        <br />
                                        Remaining time: {c.remainingTime}.
                                    </p>
                                    <button
                                        onClick={c.expired ? onClose : () => {}}
                                        className={`mt-4 w-full ${c.expired ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                                            } text-white font-semibold py-2 rounded-lg transition-all`}
                                    >
                                        {c.expired ? "Subscribe" : "Sign In"}
                                    </button>
                                </motion.div>
                            ))}
                        </>
                    )}
                    {!loading && codes.length === 0 && (
                        <p className="mt-5 text-center text-gray-400">No codes found for this input.</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
