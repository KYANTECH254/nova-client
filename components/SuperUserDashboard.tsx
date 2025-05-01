"use client"

import { useManagerAuth } from "@/contexts/AdminSessionProvider";
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, cache, useState } from "react";
import { toast } from "sonner";

export default function SuperUserDashboard() {
    const { adminUser } = useManagerAuth();
    const [stats, setStats] = useState({ totalPlatforms: 0, totalAdmins: 0});
   
    useEffect(() => {
        const fetchStats = cache(async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/dashstats`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const res = await response.json();
                if (res.success) {
                    setStats(res.stats);
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

    return (
        <>
            <div className="flex flex-col min-h-screen p-5 mt-20">
                <h1 className="text-2xl font-semibold text-gray-200 mb-6">Dashboard Overview</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                        { title: "Platforms", value: stats.totalPlatforms },
                        { title: "Admins", value: stats.totalAdmins },
                    ].map((stat, index) => (
                        <div key={index} className="bg-black rounded-lg shadow p-6">
                            <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                            <p className="text-2xl font-bold mt-2 text-gray-300">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-black rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-300 mb-4">Quick Actions</h2>
                        <div className="flex flex-col space-y-3 gap-1">
                            <Link href="/manager/platforms" >
                                <button className="w-full flex items-center justify-between p-3 bg-gray-900 hover:bg-purple-800/20 rounded-lg transition">
                                    <span className="text-purple-700 font-medium">Manage Platforms</span>
                                    <Users className="w-5 h-5 text-purple-500" />
                                </button>
                            </ Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}