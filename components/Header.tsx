"use client";
import { useState, useEffect } from "react";
import { LucideHandHelping } from "lucide-react";
import GetCodePopup from "./Code";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <header
                className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
                    isScrolled ? "bg-[var(--background)] shadow-lg" : "bg-transparent"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    {/* Logo styled as a text */}
                    <h1 className="text-white text-3xl font-bold tracking-wide">NOVA</h1>

                    {/* Get Code button */}
                    <button
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
                        onClick={() => setIsPopupOpen(true)}
                    >
                        <LucideHandHelping className="w-5 h-5" />
                        <span>Get Code</span>
                    </button>
                </div>
            </header>

            {/* Render GetCodePopup when open */}
            {isPopupOpen && <GetCodePopup onClose={() => setIsPopupOpen(false)} />}
        </>
    );
}
