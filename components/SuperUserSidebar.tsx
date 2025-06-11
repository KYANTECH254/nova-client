"use client";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    LogOut,
    LayoutTemplate,
} from "lucide-react";
import { useManagerAuth } from "@/contexts/AdminSessionProvider";

export default function SuperUserSidebar({ isOpen, setIsOpen }: any) {
    const { logout } = useManagerAuth();
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
                className={`fixed top-0 left-0 h-full w-64 bg-black shadow-lg z-20 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0`}
            >
                <div className="p-4 h-full flex flex-col">
                    <nav className="flex-1a mt-20">
                        <ul className="space-y-2">
                            <SidebarLink href="/manager" icon={<LayoutDashboard className="w-5 h-5" />} title="Dashboard" />
                            <SidebarLink href="/manager/platforms" icon={<Users className="w-5 h-5" />} title="Platforms" />
                            <SidebarLink href="/manager/templates" icon={<LayoutTemplate className="w-5 h-5" />} title="Templates" />
                        </ul>
                    </nav>
                    <div className="mt-auto p-4 border-t border-gray-900">
                        <button
                            onClick={logout}
                            className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-900 hover:text-red-600 transition-colors w-full">
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
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-900 hover:text-blue-600 transition-colors"
            >
                {icon}
                <span>{title}</span>
            </Link>
        </li>
    );
}