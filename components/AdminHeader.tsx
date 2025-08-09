"use client";
import { useState, useEffect } from "react";
import GetCodePopup from "./Code";
import { ChevronDown, ChevronUp, Menu, User, X } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAdminAuth } from "@/contexts/AdminSessionProvider";
import { toast } from "sonner";
import { useTutorial } from "@/contexts/TutorialProvider";
import ProfilePopup from "./ProfilePopUp";

export default function AdminHeader() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenUser, setIsOpenUser] = useState(false);
    const { adminUser, isAuthenticated, token } = useAdminAuth();
    const [name, setName] = useState("");
    const { next, skip, step } = useTutorial();

    useEffect(() => {
        if (step > 0 && !isOpen) {
            setIsOpen(true);
        }
    }, [isOpen, next, skip])

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const fetchsettings = async () => {
            if (!adminUser) return;
            const data = { token };
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/fetchSettings`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                const res = await response.json();
                if (res.success) {
                    if (res.settings) {
                        setName(res.name);
                    } else {
                        toast.error(res.message);
                    }
                }
            } catch (error) {
                console.log("Error fetching settings:", error);
                toast.error("Failed to fetch settings");
            }
        };
        fetchsettings();
    }, [adminUser, token]);

    const toggleSidebar = () => setIsOpen(!isOpen);
    const toggleProfile = () => setIsOpenUser(!isOpenUser);

    return (
        <>
            <header
                className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300
                    ${isScrolled
                        ? "bg-[var(--background)] text-white shadow-lg dark:bg-[var(--background)]"
                        : "bg-slate-800 text-white dark:bg-black dark:text-white"
                    }
                `}
            >
                <div className="flex flex-row gap-2 justify-items-start items-center">
                    {isAuthenticated && (
                        <button
                            onClick={toggleSidebar}
                            className="fixed top-4 left-4 z-30 p-2 rounded-md bg-gray-900 shadow-lg dark:bg-gray-800"
                        >
                            {isOpen ? (
                                <X className="w-6 h-6 text-gray-100 dark:text-gray-200" />
                            ) : (
                                <Menu size={40} className="w-6 h-6 text-gray-100 dark:text-gray-200" />
                            )}
                        </button>
                    )}
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <h1 className={`text-black dark:text-white text-2xl sm:text-3xl font-bold tracking-wide 
                            ${!isScrolled && "text-white"
                            }`}>
                            {name} Portal
                        </h1>
                    </div>
                    <button
                        onClick={toggleProfile}
                        className="fixed top-4 right-4 z-30 p-2 rounded-md bg-gray-900 shadow-lg dark:bg-gray-800"
                    >
                        <div className="flex flex-row items-center justify-center">
                            <User size={40} className="w-6 h-6 text-gray-100 dark:text-gray-200" />
                            {!isOpenUser ? (
                                <ChevronDown size={16} className="text-gray-100 font-bold dark:text-gray-200" />
                            ) : (
                                <ChevronUp size={16} className="text-gray-100 font-bold dark:text-gray-200" />
                            )}
                        </div>
                    </button>
                </div>
            </header>
            {isPopupOpen && <GetCodePopup onClose={() => setIsPopupOpen(false)} />}
            {isAuthenticated && isOpen && <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />}
            {isOpenUser && <ProfilePopup setIsOpenUser={setIsOpenUser} isOpenUser={isOpenUser} />}
        </>
    );
}
