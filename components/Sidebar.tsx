"use client";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    CreditCard,
    Package,
    UserPlus,
    Satellite,
    Folder,
    LinkIcon,
    Terminal,
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
                className={`fixed top-0 left-0 h-full w-64 bg-black shadow-lg z-20 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto mt-20 px-4">
                        <ul className="space-y-2">
                            <SidebarLink href="/admin" icon={<LayoutDashboard className="w-5 h-5" />} title="Dashboard" />
                            <SidebarLink href="/admin/users" icon={<Users className="w-5 h-5" />} title="Users" />
                            {/* {adminUser.role === "superuser" && (
                            <SidebarLink href="/admin/pppoe" icon={<Network className="w-5 h-5" />} title="PPPoe" />
                            )} */}
                            <SidebarLink href="/admin/payments" icon={<CreditCard className="w-5 h-5" />} title="Payments" />
                            {adminUser.role === "superuser" && (
                                <>
                                    <SidebarLink href="/admin/moderators" icon={<UserPlus className="w-5 h-5" />} title="Moderators" />
                                    <SidebarLink href="/admin/packages" icon={<Package className="w-5 h-5" />} title="Packages" />
                                    <SidebarLink href="/admin/stations" icon={<Satellite className="w-5 h-5" />} title="Routers" />
                                    <SidebarLink href="/admin/pools" icon={<LinkIcon className="w-5 h-5" />} title="Pools" />
                                    <SidebarLink href="/admin/funds" icon={<CreditCard className="w-5 h-5" />} title="Funds" />
                                    <SidebarLink href="/admin/settings" icon={<Settings className="w-5 h-5" />} title="Settings" />
                                    <SidebarLink href="/admin/files" icon={<Folder className="w-5 h-5" />} title="Files" />
                                    <SidebarLink href="/admin/scripts" icon={<Terminal className="w-5 h-5" />} title="Scripts" />
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-tborder-gray-900">
                        <button
                            onClick={logout}
                            className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-900 transition-colors w-full"
                        >
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