"use client";
import { useState, useEffect } from "react";
import GetCodePopup from "./Code";
import { Menu, X } from "lucide-react";
import SuperUserSidebar from "./SuperUserSidebar";
import { useManagerAuth } from "@/contexts/AdminSessionProvider";

export default function SuperUserHeader() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated } = useManagerAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${isScrolled ? "bg-[var(--background)] shadow-lg" : "bg-slate-700"
                    }`}

            >
                <div className="flex flex-row gap-2 justify-items-start items-center">
                    {isAuthenticated && (
                        <button
                            onClick={toggleSidebar}
                            className="fixed top-4 left-4 z-30 p-2 rounded-md bg-gray-900 shadow-lg"
                        >
                            {isOpen ? (
                                <X className="w-6 h-6 text-gray-100" />
                            ) : (
                                <Menu size={40} className="w-6 h-6 text-gray-100" />
                            )}
                        </button>
                    )}
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <h1 className="text-white text-3xl font-bold tracking-wide">Nova Portal</h1>
                    </div>
                </div>
            </header>
            {isPopupOpen && <GetCodePopup onClose={() => setIsPopupOpen(false)} />}
            {isAuthenticated && isOpen && (<SuperUserSidebar isOpen={isOpen} setIsOpen={setIsOpen} />)}
        </>
    );
}
