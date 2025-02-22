"use client";

import { useState } from "react";
import { X, DollarSign, Zap, Clock, CheckCircle, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

export default function SubscribePopup({ plan, onClose }: any) {
    const [phone, setPhone] = useState("");

    if (!plan) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white/10 border-white/20 p-6 rounded-2xl shadow-2xl max-w-md w-full relative"
            >
                {/* Close Button */}
                <button
                    className="absolute top-4 right-4 text-gray-500 bg-gray-200 transition rounded-full hover:bg-blue-200 w-10 h-10 flex items-center justify-center"
                    onClick={onClose}
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Plan Details */}
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#00AEEF] mb-4 flex items-center gap-2 break-words">
                    <Zap className="w-6 h-6 text-[#00AEEF]" /> {plan.title}
                </h2>
                <div className="space-y-3 text-gray-200">
                    <p className="text-lg font-semibold flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        <span className="text-gray-300">Price:</span> shs.{plan.price}
                    </p>
                    <p className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-500" /> <strong>Speed:</strong> {plan.speed}
                    </p>
                    <p className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-500" /> <strong>Validity:</strong> {plan.validity}
                    </p>
                    <p className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" /> <strong>Usage:</strong> {plan.usage}
                    </p>
                    <p className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-purple-500" /> <strong>Devices:</strong> {plan.devices}
                    </p>
                </div>

                {/* Phone Number Input */}
                <div className="relative mt-5">
                    <input
                        type="tel"
                        placeholder="Enter Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[var(--background)] text-[var(--color-text)] pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] outline-none transition text-lg shadow-md"
                    />
                    <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                </div>

                {/* Pay Button */}
                <button className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg text-lg">
                    Pay Now Ksh {plan.price}
                </button>
            </motion.div>
        </div>
    );
}
