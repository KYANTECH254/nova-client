"use client";

import { Heart, ShieldCheck } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[var(--background)] text-[var(--color-text)] py-6 px-4 md:px-8 mt-10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#00AEEF]" />
                    <p className="flex text-sm font-medium gap-1">
                        Powered by
                        <a href="https://nova.co-m.org/explore" target="_blank" rel="noopener noreferrer">
                            <span className="font-bold text-[#00AEEF]">NOVA</span>
                        </a>
                    </p>
                </div>
                <p className="text-sm mt-2 md:mt-0">
                    &copy; TurboGlobe {new Date().getFullYear()} | All Rights Reserved.
                </p>
            </div>
        </footer>
    );
}
