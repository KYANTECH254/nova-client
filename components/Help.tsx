"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Phone, HelpCircle, X, MessageCircle, MessageSquare } from "lucide-react";
import { usePlatform } from "@/contexts/PlatformProvider";

export default function HelpButton() {
    const [isOpen, setIsOpen] = useState(false);
    const { platformData, error, isConnected } = usePlatform();
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    useEffect(() => {
        platformData ? setPhoneNumber(platformData.phone) : setPhoneNumber('')
    }, [platformData]);

    return (
        <>
            {platformData.template !== "EldoHub" && (
                <div className="fixed bottom-10 right-6 z-50">
                    {/* Help Options */}
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            className="bg-[var(--background)] text-[var(--color-text)] shadow-lg p-3 rounded-xl space-y-2 w-52"
                        >
                            <h2 className="text-lg text-center underline">Need Help ?</h2>
                            {/* WhatsApp */}
                            <a
                                href={`https://wa.me/${phoneNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-500 transition cursor-pointer"
                            >
                                <MessageCircle className="w-5 h-5 text-green-500" />
                                <span className="text-sm font-medium">Chat on WhatsApp</span>
                            </a>

                            {/* Message (SMS) */}
                            <a
                                href={`sms:${phoneNumber}`}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-500 transition cursor-pointer"
                            >
                                <MessageSquare className="w-5 h-5 text-blue-500" />
                                <span className="text-sm font-medium">Send a Message</span>
                            </a>

                            {/* Call */}
                            <a
                                href={`tel:${phoneNumber}`}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-500 transition cursor-pointer"
                            >
                                <Phone className="w-5 h-5 text-red-500" />
                                <span className="text-sm font-medium">Call Now</span>
                            </a>
                        </motion.div>
                    )}

                    {platformData?.template === "NetFundi" && (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center justify-center w-14 h-14 bg-[#ff5f2e] text-white rounded-full shadow-lg transition-all hover:bg-[#ff5f2e]"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
                        </button>
                    )}

                    {platformData?.template !== "NetFundi" && (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center justify-center w-14 h-14 bg-[#00AEEF] text-white rounded-full shadow-lg transition-all hover:bg-[#008ecc]"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
                        </button>
                    )}
                </div>
            )}
        </>
    );
}
