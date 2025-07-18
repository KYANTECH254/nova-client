"use client";
import Link from 'next/link';
import { User, LogOut } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminSessionProvider';

export default function ProfilePopup({ isOpenUser }: any) {
    const { logout } = useAdminAuth();
    return (
        <div className="fixed right-4 top-15 inline-block z-50">
            {/* Popup Menu */}
            {isOpenUser && (
                <div className="right-10 mt-1 w-56 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-50 overflow-hidden">
                    <div className="py-1">
                        <Link
                            href="/admin/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-100 hover:bg-gray-800 transition-colors"
                        >
                            <User className="w-4 h-4 mr-3" />
                            Profile
                        </Link>
                    </div>
                    <div className="border-t border-gray-800"></div>
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}