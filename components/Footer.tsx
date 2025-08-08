"use client";
import { usePlatform } from "@/contexts/PlatformProvider";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import NetFundiFooter from "./Templates/Footer/NetFundi/Footer";

export default function Footer() {
    const { platformData } = usePlatform();

    return (
        <>
            {platformData?.template !== "EldoHub" && platformData?.template !== "NetFundi" && (
                <footer className="bg-[var(--background)] text-[var(--color-text)] py-6 px-4 md:px-8 mt-10 bottom-0 relative w-full">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-[#00AEEF]" />
                            <p className="flex text-sm font-medium gap-1">
                                Powered by
                                <a href="https://novawifi.online" target="_blank" rel="noopener noreferrer">
                                    <span className="font-bold text-[#00AEEF]">NOVA</span>
                                </a>
                            </p>
                        </div>
                        <Link href="/admin/login" target="_blank">
                            <p className="text-sm mt-2 md:mt-0">
                                &copy; {platformData?.name || "NOVA"} {new Date().getFullYear()} | All Rights Reserved.
                            </p>
                        </Link>
                    </div>
                </footer>
            )}
            {platformData?.template === "EldoHub" && (
                <footer className="eldohub-footer">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-[#00AEEF]" />
                            <p className="flex text-sm font-medium gap-1">
                                Powered by
                                <a href="https://novawifi.online" target="_blank" rel="noopener noreferrer">
                                    <span className="font-bold text-[#00AEEF]">NOVA</span>
                                </a>
                            </p>
                        </div>
                        <Link href="/admin/login" target="_blank">
                            <p className="text-sm mt-2 md:mt-0">
                                &copy; {platformData?.name || "NOVA"} {new Date().getFullYear()} | All Rights Reserved.
                            </p>
                        </Link>
                    </div>
                </footer>
            )}
            {platformData?.template === "NetFundi" && (
                <NetFundiFooter />
            )}
        </>
    );
}
