"use client";
import { usePlatform } from "@/contexts/PlatformProvider";
import { Phone, MessageCircle, MessageSquare } from "lucide-react";

export default function Explore() {
    const { platformData, error, isConnected } = usePlatform();
    return (
        <section className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#00AEEF] via-[#8E44AD] to-[#1B263B] text-white px-4">
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-8 md:p-12 text-center max-w-md w-full shadow-lg">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide mb-4">
                    Get Started with This Template
                </h1>
                <p className="text-lg opacity-80 mb-6">
                    Contact us to set up your WiFi experience.
                </p>

                {/* Call Button */}
                <a
                    href={`tel:${platformData.admin_phone}`}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full transition-all text-lg mb-3"
                >
                    <Phone className="w-5 h-5" />
                    Call Now
                </a>

                {/* SMS Button */}
                <a
                    href={`sms:${platformData.admin_phone}`}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full transition-all text-lg mb-3"
                >
                    <MessageSquare className="w-5 h-5" />
                    Send SMS
                </a>

                {/* WhatsApp Button */}
                <a
                    href={`https://wa.me/${platformData.admin_phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full transition-all text-lg"
                >
                    <MessageCircle className="w-5 h-5" />
                    Chat on WhatsApp
                </a>

                <p className="text-sm text-gray-300 mt-6">
                    Powered by <span className="text-[#00AEEF] font-bold">NOVA</span>
                </p>
            </div>
        </section>
    );
}
