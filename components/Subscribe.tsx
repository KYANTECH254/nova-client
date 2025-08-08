"use client";

import { useEffect, useState } from "react";
import { X, DollarSign, Zap, Clock, CheckCircle, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { usePlatform } from "@/contexts/PlatformProvider";
import NetFundiSubscribe from "./Templates/PopUp/Netfundi/Subscribe";
import { useSocket } from "@/contexts/SocketProvider";
import { usePayment } from "@/contexts/PaymentProvider";

export default function SubscribePopup({ plan, onClose }: any) {
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const { platformData } = usePlatform();
    const { socket, isConnected } = useSocket();
    const { setStartChecking } = usePayment()

    useEffect(() => {
        const savedphone = localStorage.getItem("phone");
        if (savedphone) {
            setPhone(savedphone)
        }
    }, [platformData, loading])

    if (!plan) return null;
    const handlePayment = async () => {
        if (!phone || !/^(07|01)\d{8}$/.test(phone)) {
            toast.error("Please enter a valid phone number starting with 07 or 01.");
            return;
        }
        setLoading(true);
        try {
            localStorage.setItem("phone", phone);
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/mpesa/stkpush`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, amount: plan.price, package: plan, platformID: platformData.platformID }),
            });
            const data = await response.json();
            if (!response.ok) {
                toast.error(data.message);
            } else {
                if (data.data.authorization_url) {
                    window.location.href = data.data.authorization_url;
                }
                if (socket) {
                    setStartChecking(true)
                    socket.emit("join-room", data.data.checkoutRequestId);
                };
                localStorage.setItem("transactionId", data.data.checkoutRequestId);
                toast.success(data.message);
                // onClose();
                // window.location.reload();
            }
        } catch (err) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {platformData.template !== "NetFundi" && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="bg-white/10 border-white/20 p-6 rounded-2xl shadow-2xl max-w-md w-full relative"
                    >
                        <button
                            className="absolute top-4 right-4 text-gray-500 bg-gray-200 transition rounded-full hover:bg-blue-200 w-10 h-10 flex items-center justify-center"
                            onClick={onClose}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl md:text-3xl font-extrabold text-[#00AEEF] mb-4 flex items-center gap-2 break-words">
                            <Zap className="w-6 h-6 text-[#00AEEF]" /> {plan.name}
                        </h2>

                        <div className="space-y-3 text-gray-200">
                            <p className="text-lg font-semibold flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-500" />
                                <span className="text-gray-300">Price:</span> shs.{plan.price}
                            </p>
                            <p className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-blue-500" /> <strong>Speed:</strong> {plan.speed} Mbps
                            </p>
                            <p className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-yellow-500" /> <strong>Validity:</strong> {plan.period}
                            </p>
                            <p className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" /> <strong>Usage:</strong> {plan.usage}
                            </p>
                            <p className="flex items-center gap-2">
                                <Smartphone className="w-5 h-5 text-purple-500" /> <strong>Devices:</strong> {plan.devices}
                            </p>
                        </div>

                        <div className="relative mt-5">
                            <input
                                type="tel"
                                placeholder="Enter Phone Number"
                                value={phone}
                                maxLength={10}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-[var(--background)] text-[var(--color-text)] pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] outline-none transition text-lg shadow-md"
                            />
                            <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                        </div>

                        <button
                            className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg text-lg"
                            onClick={handlePayment}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : `Pay Now Ksh ${plan.price}`}
                        </button>
                    </motion.div>
                </div>
            )}
            {platformData.template === "NetFundi" && (
                <NetFundiSubscribe
                    plan={plan}
                    onClose={onClose}
                    handlePayment={handlePayment}
                    loading={loading}
                    setPhone={setPhone}
                    phone={phone}
                />
            )}
        </>
    );
}
