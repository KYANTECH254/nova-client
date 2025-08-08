"use client"

import { useState, useEffect, cache } from "react";
import { ArrowUpRightIcon, ChevronUp, MoreVertical, Plus, Users, X } from "lucide-react";
import Link from "next/link";
import { useAdminAuth } from "@/contexts/AdminSessionProvider";
import { toast } from "sonner";
import { Package } from "./Packages";

export default function Dashboard() {
    const [showModal, setShowModal] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [packageID, setPackageID] = useState("");
    const [IsB2B, setIsB2B] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [packages, setPackages] = useState<Package[]>([]);
    const [codes, setcodes] = useState<any[]>([]);
    const [months, setmonths] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalUsers: 0, yesterdayRevenue: 0, dailyRevenue: 0, thismonthRevenue: 0, lastmonthRevenue: 0, totalPackages: 0, routers: 0, mostpurchased: "" });
    const [funds, setFunds] = useState({ balance: 0, withdrawals: 0 });
    const { adminUser, token } = useAdminAuth();
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedMonth, setSelectedMonth] = useState<any>("");
    const [customRevenue, setCustomRevenue] = useState<number | null>(null);
    const [showMenu, setShowMenu] = useState(false);

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
                } else {
                    console.log("Error fetching stats:", res.message);
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
                        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // latest first
                        .map((code: any) => ({
                            id: code.id,
                            user: code.phone,
                            package: code.package,
                            code: code.username,
                            action: `Bought package ${code.packageID || "Unknown Package"}`,
                            time: new Date(code.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }))
                        .slice(0, 5);

                    setRecentActivities(formattedActivities);
                } else {
                    console.log("Error fetching stats:", res.message);
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
                    setmonths(res.stats.months)
                } else {
                    console.log("Error fetching stats:", res.message);
                }
            } catch (error) {
                console.log("Error fetching stats:", error);
                toast.error("Failed to fetch stats");
            }
        });
        fetchStats();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        setIsAdding(true)
        e.preventDefault();
        if (code) {
            setPhone("null")
        }
        const newUser = { code, phone, packageID, platformID: adminUser.platformID, package: { connect: { id: packageID } } };
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/addCode`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, data: newUser }),
            });
            const res = await response.json();
            if (res.success) {
                toast.success(res.message);
                setShowModal(false);
                setShowCodeModal(false);
            } else {
                toast.error(res.message);
            }
            setIsAdding(false)
        } catch (error) {
            setIsAdding(false)
            console.log("Error creating user:", error);
            toast.error("Failed to create user.");
        }
    };

    const handleDateFilterSubmit = async () => {
        setIsApplying(true)
        if (!fromDate || !toDate) {
            setIsApplying(false)
            toast.error("Please select both From and To dates.");
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/filterRevenue`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    from: fromDate,
                    to: toDate,
                }),
            });

            const res = await response.json();

            if (res.success) {
                toast.success("Filter applied successfully.");
                setCustomRevenue(res.totalRevenue);
            } else {
                toast.error(res.message || "Failed to filter revenue.");
            }
            setIsApplying(false)
        } catch (err) {
            setIsApplying(false)
            console.error("Filter error:", err);
            toast.error("Something went wrong while filtering.");
        }
    };

    return (
        <>
            <div className="flex flex-col min-h-screen p-5 mt-20">
                <h1 className="text-2xl font-semibold text-gray-200 mb-6">Dashboard Overview</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    {[
                        { title: "Total Users (Active)", value: stats.totalUsers },
                        { title: "Revenue (Today)", value: `KSH ${(stats.dailyRevenue).toFixed(2)}` },
                        {
                            title: selectedMonth
                                ? `Revenue (${selectedMonth.month})`
                                : fromDate && toDate
                                    ? "Revenue (Custom Range)"
                                    : "Revenue (This Month)",
                            value: `KSH ${customRevenue !== null
                                ? Number(customRevenue).toFixed(2)
                                : Number(stats.thismonthRevenue).toFixed(2)
                                }`,
                            menu: true,
                        },

                        { title: "Packages", value: stats.totalPackages },
                        { title: "Routers", value: stats.routers },
                    ].map((stat, index) => (
                        <div key={index} className="bg-black rounded-lg shadow p-6 border-l-5 border-blue-500">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                                {stat.menu && (
                                    <div className="relative ml-auto">
                                        <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-gray-200">
                                            <MoreVertical size={24} className="w-5 h-5 bg-gray-200/10 p-1 font-bold rounded-full cursor-pointer" />
                                        </button>
                                        {showMenu && (
                                            <div onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10 p-4 space-y-3">
                                                <div className="flex flex-row items-center justify-between">
                                                    <h4 className="text-sm text-gray-400 font-medium">Select Month or Range</h4>
                                                    <button onClick={() => setShowMenu(false)} className="text-gray-400 hover:text-gray-200">
                                                        <X size={20} className="w-5 h-5 bg-gray-200/10 p-1 rounded-full cursor-pointer" />
                                                    </button>
                                                </div>

                                                {/* Last 5 Months */}
                                                <div className="space-y-1">
                                                    {months.map((month, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => {
                                                                setSelectedMonth(month);
                                                                setCustomRevenue(month.totalRevenue);
                                                            }}

                                                            className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-700 ${selectedMonth === month ? "bg-blue-700 text-white" : "text-gray-300"
                                                                }`}
                                                        >
                                                            {month.month}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Date Range Inputs */}
                                                <div className="mt-2 space-y-2">
                                                    <div>
                                                        <label className="text-xs text-gray-400 block mb-1">From:</label>
                                                        <input
                                                            required
                                                            type="date"
                                                            value={fromDate}
                                                            onChange={(e) => {
                                                                setSelectedMonth("");
                                                                setFromDate(e.target.value);
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="w-full px-2 py-1 rounded bg-black border border-gray-700 text-white text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-400 block mb-1">To:</label>
                                                        <input
                                                            required
                                                            type="date"
                                                            value={toDate}
                                                            onChange={(e) => {
                                                                setSelectedMonth("");
                                                                setToDate(e.target.value);
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="w-full px-2 py-1 rounded bg-black border border-gray-700 text-white text-sm"
                                                        />
                                                    </div>
                                                    <button
                                                        disabled={isApplying}
                                                        onClick={handleDateFilterSubmit}
                                                        className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-1.5 rounded"
                                                    >
                                                        {isApplying ? "Applying" : "Apply Filter"}
                                                    </button>
                                                </div>
                                            </div>

                                        )}
                                    </div>
                                )}
                            </div>

                            <p className="text-2xl font-bold mt-2 text-gray-300">
                                {stat.title === "Revenue (This Month)"
                                    ? `KSH ${(customRevenue !== null ? customRevenue : stats.thismonthRevenue).toFixed(2)}`
                                    : stat.value}
                            </p>

                            {["Revenue (Today)", "Revenue (This Month)", "Packages"].includes(stat.title) && (
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {stat.title === "Revenue (Today)" && (
                                            <>
                                                <span className="text-xs text-gray-400">Yesterday:</span>
                                                <span className="text-xs text-gray-300 font-medium">KSH {(stats.yesterdayRevenue).toFixed(2)}</span>
                                            </>
                                        )}
                                        {stat.title === "Revenue (This Month)" && (
                                            <>
                                                <span className="text-xs text-gray-400">Last Month:</span>
                                                <span className="text-xs text-gray-300 font-medium">KSH {stats.lastmonthRevenue.toFixed(2)}</span>
                                            </>
                                        )}
                                        {stat.title === "Packages" && (
                                            <>
                                                <span className="text-xs text-gray-400">Most Purchased:</span>
                                                <span className="text-xs text-gray-300 font-medium">{stats.mostpurchased}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Percentage Change */}
                                    <div className="flex items-center gap-1">
                                        {stat.title === "Revenue (Today)" && (() => {
                                            const diff = stats.dailyRevenue - stats.yesterdayRevenue;
                                            const percent = ((diff) / Math.max(stats.yesterdayRevenue, 1)) * 100;
                                            const isPositive = diff >= 0;

                                            return (
                                                <span className={`flex items-center text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
                                                    {isPositive ? <Plus className="w-3 h-3" /> : <ChevronUp className="w-3 h-3 rotate-180" />}
                                                    {`${Math.abs(percent).toFixed(2)}%`}
                                                </span>
                                            );
                                        })()}

                                        {stat.title === "Revenue (This Month)" && (() => {
                                            const diff = stats.thismonthRevenue - stats.lastmonthRevenue;
                                            const percent = ((diff) / Math.max(stats.lastmonthRevenue, 1)) * 100;
                                            const isPositive = diff >= 0;

                                            return (
                                                <span className={`flex items-center text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
                                                    {isPositive ? <Plus className="w-3 h-3" /> : <ChevronUp className="w-3 h-3 rotate-180" />}
                                                    {`${Math.abs(percent).toFixed(2)}%`}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {IsB2B && adminUser?.role === "superuser" && (
                    <>
                        <h1 className="text-2xl font-semiboldtext-gray-200 mb-6">Funds Overview</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[
                                { title: "Total Balance", value: `KSH ${funds.balance}` },
                                { title: "Total Withdrawals", value: `KSH ${funds.withdrawals}` },
                            ].map((stat, index) => (
                                <div key={index} className="bg-black rounded-lg shadow p-6 border-l-5 border-blue-500">
                                    <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                                    <p className="text-2xl font-bold mt-2 text-gray-300">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-black rounded-lg shadow p-6 lg:col-span-2">
                        <h2 className="text-lg font-semiboldtext-gray-300 mb-4">Recent Activities</h2>
                        <ul className="space-y-4">
                            {recentActivities.map(activity => (
                                <li key={activity.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-xs font-mediumtext-gray-400">{activity.user ? activity.user : activity.code} bought {activity.package}</p>
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
                    <div className="bg-black rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-300 mb-4">Quick Actions</h2>
                        <div className="flex flex-col space-y-3 gap-1">

                            {adminUser?.role === "superuser" && (
                                <>
                                    <button onClick={() => setShowModal(true)} className="w-full flex items-center justify-between p-3 bg-gray-900 hover:bg-blue-800/20 rounded-lg transition">
                                        <span className="text-blue-700 font-medium">Add New User</span>
                                        <Plus className="w-5 h-5 text-blue-500" />
                                    </button>
                                    <button onClick={() => setShowCodeModal(true)} className="w-full flex items-center justify-between p-3 bg-gray-900 hover:bg-yellow-800/20 rounded-lg transition">
                                        <span className="text-yellow-700 font-medium">Add New Code</span>
                                        <Plus className="w-5 h-5 text-yellow-500" />
                                    </button>
                                </>
                            )}
                            <Link href="/admin/users" >
                                <button className="w-full flex items-center justify-between p-3 bg-gray-900 hover:bg-purple-800/20 rounded-lg transition">
                                    <span className="text-purple-700 font-medium">Manage Users</span>
                                    <Users className="w-5 h-5 text-purple-500" />
                                </button>
                            </Link>
                            <Link target="_blank" href={`${window.location.origin}/login`} >
                                <button className="w-full flex items-center justify-between p-3 bg-gray-900 hover:bg-green-800/20 rounded-lg transition">
                                    <span className="text-green-700 font-medium">Hotspot Login</span>
                                    <ArrowUpRightIcon className="w-5 h-5 text-green-500" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="flex flex-col bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-md w-full max-w-md max-h-full overflow-y-auto space-y-6">
                        <h2 className="text-xl font-bold mb-4">Add New User</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-black text-white" required />
                            <select value={packageID} onChange={(e) => setPackageID(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-black text-white" required>
                                <option value="">Select Package</option>
                                {packages.map((pkg) => (
                                    <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                                ))}
                            </select>
                            <div className="flex justify-end space-x-2 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">Cancel</button>
                                <button disabled={isAdding} type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{isAdding ? "Saving" : "Save"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showCodeModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="flex flex-col bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-md w-full max-w-md max-h-full overflow-y-auto space-y-6">
                        <h2 className="text-xl font-bold mb-4">Add New Code</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <input type="text" minLength={3} placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-black text-white" required />
                            <select value={packageID} onChange={(e) => setPackageID(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-black text-white" required>
                                <option value="">Select Package</option>
                                {packages.map((pkg) => (
                                    <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                                ))}
                            </select>
                            <div className="flex justify-end space-x-2 mt-6">
                                <button type="button" onClick={() => setShowCodeModal(false)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">Cancel</button>
                                <button disabled={isAdding} type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{isAdding ? "Saving" : "Save"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}