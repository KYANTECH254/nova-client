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
    Cloud,
    ArrowLeft,
    Network,
    LayoutTemplate,
} from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminSessionProvider";
import { useTutorial } from "@/contexts/TutorialProvider";

export default function Sidebar({ isOpen, setIsOpen }: any) {
    const { logout, adminUser } = useAdminAuth();
    const { step } = useTutorial();

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
                            <SidebarLink className={step === 4 ? "bg-gray-900 text-blue-600" : ""} href="/admin/users" icon={<Users className="w-5 h-5" />} title="Users" />
                            <div className="absolute flex flex-row items-center gap-2">
                                {step === 4 && <TutorialCard text="Fourth Manage your hotspot users here. Check user login codes and status." />}
                            </div>
                            {adminUser.role === "superuser" && (
                                <>
                                    <SidebarLink className={step === 6 ? "bg-gray-900 text-blue-600" : ""} href="/admin/pppoe" icon={<Network className="w-5 h-5" />} title="PPPoE" />
                                    <div className="absolute flex flex-row items-center gap-2">
                                        {step === 6 && <TutorialCard text="Manage your PPPoE clients here. Check clients status, add and remove them." />}
                                    </div>
                                </>
                            )}
                            <SidebarLink className={step === 5 ? "bg-gray-900 text-blue-600" : ""} href="/admin/payments" icon={<CreditCard className="w-5 h-5" />} title="Payments" />
                            <div className="absolute flex flex-row items-center gap-2">
                                {step === 5 && <TutorialCard text="Manage and Confirm all M-PESA payments from Hotspot and PPPoE clients." />}
                            </div>
                            {adminUser.role === "superuser" && (
                                <>
                                    <SidebarLink href="/admin/moderators" icon={<UserPlus className="w-5 h-5" />} title="Moderators" />
                                    <SidebarLink className={step === 2 ? "bg-gray-900 text-blue-600" : ""} href="/admin/packages" icon={<Package className="w-5 h-5" />} title="Packages" />
                                    <div className="absolute flex flex-row items-center gap-2">
                                        {step === 2 && <TutorialCard text="Second add your hotspot packages here." />}
                                    </div>
                                    <SidebarLink className={step === 1 ? "bg-gray-900 text-blue-600" : ""} href="/admin/stations" icon={<Satellite className="w-5 h-5" />} title="Routers" />
                                    <div className="absolute flex flex-row items-center gap-2">
                                        {step === 1 && <TutorialCard text="First Add and Manage all your routers here." />}
                                    </div>
                                    <SidebarLink className={step === 3 ? "bg-gray-900 text-blue-600" : ""} href="/admin/settings" icon={<Settings className="w-5 h-5" />} title="Settings" />
                                    <div className="absolute flex flex-row items-center gap-2">
                                        {step === 3 && (
                                            <TutorialCard text="Third Add your payment method under settings. Configure either C2B, B2B or API." />
                                        )}
                                    </div>
                                    <SidebarLink href="/admin/pools" icon={<LinkIcon className="w-5 h-5" />} title="Pools" />
                                    <SidebarLink href="/admin/funds" icon={<CreditCard className="w-5 h-5" />} title="Funds" />
                                    <SidebarLink href="/admin/ddns" icon={<Cloud className="w-5 h-5" />} title="DDNS" />
                                    <SidebarLink href="/admin/files" icon={<Folder className="w-5 h-5" />} title="Files" />
                                    <SidebarLink href="/admin/scripts" icon={<Terminal className="w-5 h-5" />} title="Scripts" />
                                    <SidebarLink href="/admin/templates" icon={<LayoutTemplate className="w-5 h-5" />} title="Templates" />
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-tborder-gray-900">
                        <button
                            onClick={logout}
                            className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-900 hover:text-red-600 transition-colors w-full"
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
    title,
    className
}: {
    href: string;
    icon: React.ReactNode;
    title: string
    className?: string
}) {
    return (
        <li>
            <Link
                href={href}
                className={`flex items-center space-x-3 p-3 rounded-lg ${className ? "" : "text-gray-300"} hover:bg-gray-900 hover:text-blue-600 transition-colors ${className}`}
            >
                {icon}
                <span>{title}</span>
            </Link>
        </li>
    );
}

function TutorialCard({ text }: { text: string }) {
    const { next, skip } = useTutorial();
    return (
        <div className="absolute left-64 -top-20 bg-black border-2 border-blue-600 text-white rounded-xl p-4 shadow-xl w-64 z-50 animate-fade-in">
            <ArrowLeft className="absolute top-8 -left-10 text-white" size={32} />
            <p className="mb-3 text-sm">{text}</p>
            <div className="flex justify-end gap-2 text-sm">
                <button
                    onClick={skip}
                    className="text-gray-400 hover:text-white px-3 py-1"
                >
                    Skip
                </button>
                <button
                    onClick={next}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white"
                >
                    Next
                </button>
            </div>
        </div>
    );
}