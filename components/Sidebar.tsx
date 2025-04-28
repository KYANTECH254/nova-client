"use client";
import { useState } from "react";
import Link from "next/link";
import {
    Menu,
    X,
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    CreditCard,
    Package,
    UserPlus,
    Satellite
} from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminSessionProvider";

export default function Sidebar({ isOpen, setIsOpen }: any) {
    const { logout, adminUser } = useAdminAuth();
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-20"
                onClick={toggleSidebar}
            />
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-black shadow-lg z-20 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0`}
            >
                <div className="p-4 h-full flex flex-col">
                    <nav className="flex-1a mt-20">
                        <ul className="space-y-2">
                            <SidebarLink href="/admin" icon={<LayoutDashboard className="w-5 h-5" />} title="Dashboard" />
                            <SidebarLink href="/admin/users" icon={<Users className="w-5 h-5" />} title="Users" />
                            <SidebarLink href="/admin/payments" icon={<CreditCard className="w-5 h-5" />} title="Payments" />
                            {adminUser.role === "superuser" && (
                                <>
                                    <SidebarLink href="/admin/moderators" icon={<UserPlus className="w-5 h-5" />} title="Moderators" />
                                    <SidebarLink href="/admin/packages" icon={<Package className="w-5 h-5" />} title="Packages" />
                                    <SidebarLink href="/admin/stations" icon={<Satellite className="w-5 h-5" />} title="Routers" />
                                    <SidebarLink href="/admin/funds" icon={<CreditCard className="w-5 h-5" />} title="Funds" />
                                    <SidebarLink href="/admin/settings" icon={<Settings className="w-5 h-5" />} title="Settings" />
                                </>
                            )}
                        </ul>
                    </nav>
                    <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-900">
                        <button
                            onClick={logout}
                            className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 hover:bg-gray-100 hover:text-red-600 transition-colors w-full">
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

function SidebarLink({
    href,
    icon,
    title
}: {
    href: string;
    icon: React.ReactNode;
    title: string
}) {
    return (
        <li>
            <Link
                href={href}
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-blue-600 transition-colors"
            >
                {icon}
                <span>{title}</span>
            </Link>
        </li>
    );
}