"use client";

import { Eye, EyeClosed, Trash, Edit, Plus, X, ArrowRight, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminSessionProvider";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSocket } from "@/contexts/SocketProvider";
import { getNextAvailableIP } from "@/utils/FUnstions";

interface Station {
    id: string;
    name: string;
    mikrotikHost: string;
    mikrotikUser: string;
    mikrotikPublicKey: string;
    mikrotikPublicHost: string;
    mikrotikPassword: string;
    token:String;
}

export default function Stations() {
    const [stations, setStations] = useState<Station[]>([]);
    const [allstations, setAllStations] = useState<Station[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingStation, setEditingStation] = useState<Station | null>(null);
    const { adminUser, token } = useAdminAuth();
    const [formData, setFormData] = useState<Station>({
        id: "",
        name: "",
        mikrotikHost: "",
        mikrotikPublicHost: "",
        mikrotikPublicKey: "",
        mikrotikUser: "",
        mikrotikPassword: "",
        token:token
    });
    const { socket, isConnected } = useSocket();
    const [connectionStatus, setConnectionStatus] = useState<{ [id: string]: string }>({});
    const origin = window.location.origin.replace(/^https?:\/\//, '');

    useEffect(() => {
        if (socket && isConnected) {
            socket.emit("connect-mikrotik", { token: token });
            socket.on("connection-status", (results: { id: string; status: string }[]) => {
                const updatedStatus: Record<string, string> = {};
                results.forEach(({ id, status }) => {
                    updatedStatus[id] = status;
                });
                console.log(results);

                setConnectionStatus(updatedStatus);
            });
            return () => {
                socket.off("connection-status");
            };
        }
    }, [socket, isConnected]);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/fetchStations`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                });
                const res = await response.json();
                if (res.success) {
                    setStations(res.stations);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error fetching Stations:", error);
                toast.error("Failed to fetch Stations");
            }
        };
        fetchStations();
    }, []);

    useEffect(() => {
        const fetchAllStations = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/stations`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const res = await response.json();
                if (res.success && Array.isArray(res.stations)) {
                    setAllStations(res.stations);
                    const hostList = res.stations
                        .map((s: { mikrotikHost?: string }) => s.mikrotikHost)
                        .filter((ip: string): ip is string => typeof ip === "string" && ip.startsWith("10.10.10."));

                    if (!editingStation) {
                        const nextIP = getNextAvailableIP(hostList, "10.10.10.");

                        if (!nextIP) {
                            toast.error("No available IPs left in 10.10.10.0/24");
                            return;
                        }

                        setFormData(prev => ({
                            ...prev,
                            mikrotikHost: nextIP,
                        }));
                    }

                } else {
                    toast.error(res.message || "Failed to fetch stations");
                }
            } catch (error) {
                console.log("Error fetching Stations:", error);
                toast.error("Failed to fetch Stations");
            }
        };

        fetchAllStations();
    }, [showForm, editingStation]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/updateStation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ data: formData }),
            });

            const result = await response.json();
            if (result.success) {
                toast.success(result.message);
                if (editingStation) {
                    setStations(stations.map(station =>
                        station.id === formData.id ? result.station : station
                    ));
                } else {
                    setStations([...stations, result.station]);
                }

                setEditingStation(null);
                setShowForm(false);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.log("Error updating station:", error);
            toast.error("Failed to update station");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteStation = async (id: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/deleteStation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });
            const result = await response.json();
            if (result.success) {
                toast.success(result.message);
                setStations(stations.filter(station => station.id !== id));
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.log("Error deleting station:", error);
            toast.error("Failed to delete station");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto mt-14">
            <h1 className="text-2xl font-bold mb-6">Router Settings</h1>

            {!showForm && (
                <button
                    onClick={() => {
                        setShowForm(true);
                        setEditingStation(null);
                    }} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mb-4">
                    <Plus size={16} className="inline mr-2" /> Add Router
                </button>
            )}

            {showForm && (
                <div className="bg-gray-900 rounded-lg shadow p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">{editingStation ? "Edit Router" : "Add Router"}</h2>
                        <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    </div>
                    {!editingStation && (
                        <div className="rounded-md bg-yellow-600/30 p-1 mt-2 mb-2 text-white relative flex flex-col gap-2">
                            <div className="flex flex-row items-center justify-between p-1">
                                <h1 className="text-xl">Instructions to configure Router (Using Wireguard)</h1>
                                <div
                                    onClick={() => setShowInstructions((prev) => !prev)}
                                    className="flex items-center justify-center cursor-pointer w-8 h-8 rounded-full bg-gray-900 hover:bg-gray-800">
                                    {showInstructions ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                </div>
                            </div>
                            {showInstructions && (
                                <div className="flex flex-col">
                                    <h1 className="bold italic">Before adding router complete these instructions for configuring Wireguard VPN on the Router you are about to add.</h1>
                                    <h1 className="bold flex flex-row items-center text-green-500"><ArrowRight size={15} /> Make sure your MikroTik RouterOS version 7.x and above.</h1>
                                    <h1 className="bold underline pt-2">Open MikroTik terminal and Run these Commands</h1>
                                    <div className="mb-2 flex flex-col gap-1">
                                        <h1 className="semibold  italic">1. Add Wireguard interface</h1>
                                        <CommandInput command="/interface/wireguard/add listen-port=13231 mtu=1420 name=wireguard" />

                                        <h1 className="semibold  italic">2. Assign IP to WireGuard Interface, after adding the interface copy the public Key of the interface you created, you will fill it in the form below.</h1>
                                        <CommandInput command={`/ip address add address=${formData.mikrotikHost}/24 interface=wireguard`} />

                                        <h1 className="semibold  italic">3. Add Remote Server IP as Peer</h1>
                                        <CommandInput command="/interface wireguard peers add interface=wireguard name=novapeer public-key='wZsLOvBo5gfLp+2ixsHXfP3MjLD2uUqzvuXXQYv9EkM=' endpoint-address=16.170.70.95 endpoint-port=51820 allowed-address=10.10.10.1/32 persistent-keepalive=25" />

                                        <h1 className="semibold  italic">4. Confirm WireGuard Interface and Peer are set</h1>
                                        <CommandInput command="/interface wireguard print" />
                                        <CommandInput command="/interface wireguard peers print" />

                                        <h1 className="semibold  italic">5. Allow API Access from WireGuard Subnet </h1>
                                        <CommandInput command="/ip service set api address=10.10.10.0/24" />

                                        <h1 className="semibold  italic">6. Add Firewall Rule for API </h1>
                                        <CommandInput command={`/ip firewall filter add \ chain=input \ src-address=10.10.10.0/24 \ protocol=tcp \ dst-port=8728 \ action=accept \ comment="Allow API from WireGuard"`} />

                                        <h1 className="semibold  italic">7. Add Walled garden access </h1>
                                        <CommandInput command={`/ip hotspot walled-garden add dst-host=novawifi.online action=allow add dst-host=*.novawifi.online action=allow add dst-host=api64.ipify.org action=allow`} />
                                        <CommandInput command="/ip hotspot walled-garden add dst-port=53 protocol=udp action=allow comment='Allow DNS'" />

                                        <h1 className="semibold  italic">8. Add Firewall Rule for Wireguard listen port </h1>
                                        <CommandInput command="/ip firewall add action=accept chain=input dst-port=13231 protocol=udp" />
                                        <CommandInput command="/ip firewall add action=accept chain=input src-address=10.10.10.0/24" />
                                        <CommandInput command="/ip dns set servers=8.8.8.8,1.1.1.1 allow-remote-requests=yes" />

                                        <h1 className="semibold  italic">9. Continue and add Router Login Username and password below</h1>
                                        <h1 className="semibold  italic">10. After setting up and filling all details below try pinging our server wireguard internal ip on mikrotik to see if connection was successful</h1>
                                        <CommandInput command="ping 10.10.10.1" />

                                        <h1 className="semibold  italic">11. Lastly make sure to add <span className="text-green-600 font-bold">{origin}</span> as your WiFi hotspot server profile DNS name. Remember to make sure you have /hotspot<a className="font-bold text-blue-600" href="/admin/files">/login.html</a> folder as well</h1>

                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Router Name</label>
                                <input required type="text" name="name" value={formData.name || ""} onChange={handleChange} placeholder="Enter Router Name" className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Public Host (IP Provided by ISP, use <a target="_blank" rel="noopener noreferrer" className="text-blue-600 underline" href="https://whatismyipaddress.com/">WhatIsMyIp</a> to get it.)</label>
                                <input required type="text" name="mikrotikPublicHost" value={formData.mikrotikPublicHost || ""} onChange={handleChange} placeholder="Enter Mikrotik Public Host" className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Private Host (IP Provided by Us)</label>
                                <input
                                    required
                                    readOnly
                                    type="text"
                                    name="mikrotikHost"
                                    value={formData.mikrotikHost || ""}
                                    placeholder="Enter Mikrotik Host"
                                    className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Wireguard Public Key</label>
                                <input required type="text" name="mikrotikPublicKey" value={formData.mikrotikPublicKey || ""} onChange={handleChange} placeholder="Enter Wireguard Public Key" className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Router Username</label>
                                <input required type="text" name="mikrotikUser" value={formData.mikrotikUser || ""} onChange={handleChange} placeholder="Enter Mikrotik Username" className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Router Password</label>
                                <div className="relative flex items-center flex-row">
                                    <input required type={showPassword ? "text" : "password"} name="mikrotikPassword" value={formData.mikrotikPassword || ""} onChange={handleChange} placeholder="Enter Mikrotik Password" className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                                    <div className="absolute fontbold right-5 text-gray-300 cursor-pointer" onClick={() => setShowPassword((prev) => !prev)}>
                                        {showPassword ? <Eye /> : <EyeClosed />}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {isLoading ? "Saving..." : "Save Station"}
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stations.length === 0 ? <p>No stations available.</p> : stations.map((station) => {
                    const status = connectionStatus[station.id] || "Connecting";
                    return (
                        <div key={station.id} className="bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all p-6">
                            <h3 className="text-lg font-semibold">{station.name}</h3>
                            <p className="text-sm text-gray-500">{station.mikrotikHost}</p>
                            <p className={`mt-2 text-sm font-medium ${status === "Connected" ? "text-green-600" :
                                status === "Failed" ? "text-red-500" :
                                    "text-yellow-500"
                                }`}>
                                {status}
                            </p>
                            <div className="flex justify-between mt-4">
                                {!showForm && (
                                    <button
                                        onClick={() => { setShowForm(true); setEditingStation(station); setFormData(station); }} className="text-blue-600 hover:text-blue-800">
                                        <Edit size={16} />
                                    </button>
                                )}
                                <button onClick={() => handleDeleteStation(station.id)} className="text-red-600 hover:text-red-800">
                                    <Trash size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


export function CommandInput({ command }: any) {
    return (
        <div className="flex flex-row items-center relative">
            <input
                type="text"
                value={command}
                readOnly
                className="w-full px-3 py-2 border bg-black text-gray-300 border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute right-3 cursor-pointer">
                <Copy
                    size={20}
                    onClick={() => {
                        navigator.clipboard.writeText(`${command}`);
                        toast.success("Copied to clipboard");
                    }}
                />
            </div>
        </div>
    )
}
