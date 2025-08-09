"use client";
import Link from "next/link";
import { User, LogOut, Cog } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminSessionProvider";

export default function ProfilePopup({ isOpenUser }: any) {
    const { logout } = useAdminAuth();

    return (
        <div className="fixed right-4 top-15 inline-block z-50">
            {/* Popup Menu */}
            {isOpenUser && (
                <div className="right-10 mt-1 w-56 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-50 overflow-hidden">
                    <div className="">
                        <Link
                            href="/admin/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <User className="w-4 h-4 mr-3" />
                            Profile
                        </Link>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-800"></div>
                    <div className="">
                        <Link
                            href="/admin/pref"
                            className="flex items-center px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Cog className="w-4 h-4 mr-3" />
                            Settings
                        </Link>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-800"></div>
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}
