"use client"

import { useState, useEffect, cache } from "react";
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { useAdminAuth } from "@/contexts/AdminSessionProvider";
import { toast } from "sonner";
import { Package } from "./Packages";

export default function Dashboard() {
    const [showModal, setShowModal] = useState(false);
    const [phone, setPhone] = useState("");
    const [packageID, setPackageID] = useState("");
    const [IsB2B, setIsB2B] = useState(false);
    const [packages, setPackages] = useState<Package[]>([]);
    const [codes, setcodes] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalUsers: 0, dailyRevenue: 0, totalPackages: 0, routers: 0 });
    const [funds, setFunds] = useState({ balance: 0, withdrawals: 0 });
    const { adminUser, token } = useAdminAuth();
    const [recentActivities, setRecentActivities] = useState<any[]>([]);

    useEffect(() => {
        const fetchpackages = cache(async () => {
            const data = {
                token: token
            }
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/fetchPackages`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data)
                });
                const res = await response.json();
                if (res.success) {
                    setPackages(res.packages)
                } else if (!res.success) {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error fetching packages:", error);
                toast.error("Failed to fetch packages");
            }
        })
        fetchpackages();
    }, [])

    useEffect(() => {
        const fetchcodes = cache(async () => {
            const data = {
                token
            }
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/fetchCodes`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data)
                });
                const res = await response.json();
                if (res.success) {
                    setcodes(res.codes)
                    const formattedActivities = res.codes
                        .map((code: any) => ({
                            id: code.id,
                            user: code.phone,
                            action: `Bought package ${code.packageID || "Unknown Package"}`,
                            time: new Date(code.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }))
                        .slice(0, 5);
                    setRecentActivities(formattedActivities);
                } else if (!res.success) {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error fetching codes:", error);
                toast.error("Failed to fetch codes");
            }
        })
        fetchcodes();
    }, [])

    useEffect(() => {
        const fetchStats = cache(async () => {
            const data = { token };
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/stats`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                const res = await response.json();
                if (res.success) {
                    setStats(res.stats);
                    setFunds(res.funds)
                    setIsB2B(res.IsB2B)
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error fetching stats:", error);
                toast.error("Failed to fetch stats");
            }
        });
        fetchStats();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const newUser = { phone, packageID, platformID: adminUser.platformID, package: { connect: { id: packageID } } };
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/addCode`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ data: newUser }),
            });
            const res = await response.json();
            if (res.success) {
                toast.success(res.message);
                setShowModal(false);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.log("Error creating user:", error);
            toast.error("Failed to create user.");
        }
    };

    return (
        <>
            <div className="flex flex-col min-h-screen p-5 mt-20">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Dashboard Overview</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { title: "Total Users (Active)", value: stats.totalUsers },
                        { title: "Revenue (Today)", value: `KSH ${stats.dailyRevenue}` },
                        { title: "Packages", value: stats.totalPackages },
                        { title: "Routers", value: stats.routers },
                    ].map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-black rounded-lg shadow p-6">
                            <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                            <p className="text-2xl font-bold mt-2 text-gray-800 dark:text-gray-300">{stat.value}</p>
                        </div>
                    ))}
                </div>
                {IsB2B && (
                    <>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Funds Overview</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[
                                { title: "Total Balance", value: `KSH ${funds.balance}` },
                                { title: "Total Withdrawals", value: `KSH ${funds.withdrawals}` },
                            ].map((stat, index) => (
                                <div key={index} className="bg-white dark:bg-black rounded-lg shadow p-6">
                                    <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                                    <p className="text-2xl font-bold mt-2 text-gray-800 dark:text-gray-300">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-black rounded-lg shadow p-6 lg:col-span-2">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-4">Recent Activities</h2>
                        <ul className="space-y-4">
                            {recentActivities.map(activity => (
                                <li key={activity.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-xs font-medium text-gray-800 dark:text-gray-400">{activity.user} bought package</p>
                                    </div>
                                    <span className="ml-auto text-sm text-gray-500">{activity.time}</span>
                                </li>
                            ))}
                        </ul>
                        <Link href="/admin/payments">
                            <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
                                View all activities →
                            </button>
                        </Link>
                    </div>
                    <div className="bg-white dark:bg-black rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-4">Quick Actions</h2>
                        <div className="flex flex-col space-y-3 gap-1">
                            <button onClick={() => setShowModal(true)} className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-gray-900 hover:bg-blue-800/20 rounded-lg transition">
                                <span className="text-blue-700 font-medium">Add New User</span>
                                <Plus className="w-5 h-5 text-blue-500" />
                            </button>
                            <Link href="/admin/users" >
                                <button className="w-full flex items-center justify-between p-3 bg-purple-50 dark:bg-gray-900 hover:bg-purple-800/20 rounded-lg transition">
                                    <span className="text-purple-700 font-medium">Manage Users</span>
                                    <Users className="w-5 h-5 text-purple-500" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New User</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-black dark:text-white" required />
                            <select value={packageID} onChange={(e) => setPackageID(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-black dark:text-white" required>
                                <option value="">Select Package</option>
                                {packages.map((pkg) => (
                                    <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                                ))}
                            </select>
                            <div className="flex justify-end space-x-2 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}