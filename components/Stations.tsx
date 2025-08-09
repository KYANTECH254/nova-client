"use client";

import { Eye, EyeClosed, Trash, Edit, Plus, X, ArrowRight, ChevronDown, ChevronUp, Copy, Link2 } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminSessionProvider";
import { useState, useEffect, cache } from "react";
import { toast } from "sonner";
import { useSocket } from "@/contexts/SocketProvider";
import { getMappedPort, getNextAvailableIP, isValidIP, isValidPublicKey, validateDdnsHost } from "@/utils/FUnstions";
import Link from "next/link";
import { DDNS } from "./DDNS";

export interface Station {
    id: string;
    name: string;
    mikrotikHost: string;
    mikrotikUser: string;
    mikrotikPublicKey: string;
    mikrotikPublicHost: string;
    mikrotikPassword: string;
    mikrotikDDNS: string;
    mikrotikWebfigHost: string;
    token: String;
}

export default function Stations() {
    const [stations, setStations] = useState<Station[]>([]);
    const [allstations, setAllStations] = useState<Station[]>([]);
    const [selectedStation, setselectedStation] = useState<any>();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showModal, setshowModal] = useState(false);
    const [useDDNS, setUseDDNS] = useState(false);
    const [ddns, setddns] = useState<DDNS[]>([]);
    const [url, seturl] = useState("")
    const [publicIP, setpublicIP] = useState("")
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
        mikrotikDDNS: "",
        mikrotikWebfigHost: "",
        token: token
    });
    const [allCommands, setAllCommands] = useState<string[]>([]);
    const { socket, isConnected } = useSocket();
    const [connectionStatus, setConnectionStatus] = useState<{ [id: string]: string }>({});
    const [connectionMessage, setConnectionMessage] = useState<{ [id: string]: string }>({});
    const origin = window.location.origin.replace(/^https?:\/\//, '');

    // useEffect(() => {
    //     if (socket && isConnected) {
    //         socket.emit("connect-mikrotik", { token: token });
    //         socket.on("connection-status", (results: { id: string; status: string, message: string }[]) => {
    // const updatedStatus: Record<string, string> = {};
    // const updatedMessage: Record<string, string> = {};
    //             if (!results) return;
    //             results.forEach(({ id, status, message }) => {
    //                 updatedStatus[id] = status;
    //                 updatedMessage[id] = message;
    //             });
    //             setConnectionStatus(updatedStatus);
    //             setConnectionMessage(updatedMessage);
    //         });
    //         return () => {
    //             socket.off("connection-status");
    //         };
    //     }
    // }, [socket, isConnected]);

    useEffect(() => {
        const fetchConnections = cache(async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/mkt/connections`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                });
                const res = await response.json();
                if (res.success) {
                    const results: { id: string; status: string; message: string }[] = res.result;

                    const updatedStatus: Record<string, string> = {};
                    const updatedMessage: Record<string, string> = {};

                    results.forEach(({ id, status, message }) => {
                        updatedStatus[id] = status;
                        updatedMessage[id] = message;
                    });

                    setConnectionStatus(updatedStatus);
                    setConnectionMessage(updatedMessage);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error fetching Connections:", error);
            }
        });
        fetchConnections();
    }, []);

    useEffect(() => {
        const fetchStations = cache(async () => {
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
            }
        });
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

                        setAllCommands([
                            `/interface/wireguard/add listen-port=13231 mtu=1420 name=wireguard`,
                            `/ip address add address=${nextIP}/24 interface=wireguard`,
                            `/interface wireguard peers add interface=wireguard name=novapeer public-key="xPCGwCHqAGaAbBlYHs6Af7OIAdoBsAQ5PVvEjmZb2zo=" endpoint-address=51.21.158.217 endpoint-port=51820 allowed-address=10.10.10.1/32 persistent-keepalive=10`,
                            `/interface wireguard print`,
                            `/interface wireguard peers print`,
                            `/ip service set api address=10.10.10.0/24`,
                            `/ip firewall filter add chain=input src-address=10.10.10.0/24 protocol=tcp dst-port=8728 action=accept comment="Allow API from WireGuard"`,
                            `/interface list member add list=LAN interface=wireguard`,
                            `/ip hotspot walled-garden add dst-host=novawifi.online action=allow`,
                            `/ip hotspot walled-garden add dst-host=*.novawifi.online action=allow`,
                            `/ip hotspot walled-garden add dst-host=api64.ipify.org action=allow`,
                            `/ip firewall filter add action=accept chain=input dst-port=13231 protocol=udp`,
                            `/ip firewall filter add action=accept chain=input src-address=10.10.10.0/24`,
                            `/ip dns set servers=8.8.8.8,1.1.1.1 allow-remote-requests=yes`,
                            `/ip firewall mangle add chain=postrouting out-interface=bridge action=change-ttl new-ttl=set:1`,
                        ])
                    }
                } else {
                    toast.error(res.message || "Failed to fetch stations");
                }
            } catch (error) {
                console.log("Error fetching Stations:", error);
            }
        };

        fetchAllStations();
    }, [socket, showForm, editingStation]);

    useEffect(() => {
        if (editingStation && editingStation.mikrotikDDNS) {
            setUseDDNS(true);
        } else {
            setUseDDNS(false);
        }
    }, [editingStation]);

    useEffect(() => {
        const fetchddns = cache(async () => {
            const data = {
                token
            };
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/fetchddns`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });
                const res = await response.json();
                if (res.success) {
                    const ddnsData = res.data;
                    setddns(ddnsData);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error fetching ddns:", error);
            }
        });
        fetchddns();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        const updatedFormData = { ...formData, [name]: value };

        if (name === 'name' && useDDNS) {
            const slug = value.toLowerCase().replace(/\s+/g, '');
            updatedFormData.mikrotikDDNS = `${slug}.${window.location.origin.replace(/^https?:\/\//, '')}`;
        }

        setFormData(updatedFormData);
    };

    const handleToggle = () => {
        const updatedUseDDNS = !useDDNS;
        setUseDDNS(updatedUseDDNS);

        if (updatedUseDDNS && formData.name) {
            const slug = formData.name.toLowerCase().replace(/\s+/g, '');
            setFormData((prev) => ({
                ...prev,
                mikrotikDDNS: `${slug}.${window.location.origin.replace(/^https?:\/\//, '')}`
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidIP(formData.mikrotikHost)) {
            toast.error("Invalid MikroTik host IP address");
            return;
        }

        if (
            formData.mikrotikPublicHost &&
            !validateDdnsHost(formData.mikrotikPublicHost) &&
            !isValidIP(formData.mikrotikPublicHost)
        ) {
            toast.error("Invalid public host. Must be a valid IP address or domain name.");
            return;
        }

        if (formData.mikrotikPublicKey && !isValidPublicKey(formData.mikrotikPublicKey)) {
            toast.error("Invalid public key format");
            return;
        }

        setIsLoading(true);
        formData.token = token;
        if (formData.mikrotikPublicHost) {
            formData.mikrotikDDNS = "";
        } else if (formData.mikrotikDDNS) {
            formData.mikrotikPublicHost = "";
        }

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
        setIsDeleting(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/deleteStation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id, token }),
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
        } finally {
            setIsDeleting(false)
            setshowModal(false)
        }
    };

    const copyAll = () => {
        const fullCommand = allCommands.join("\r\n");
        navigator.clipboard.writeText(fullCommand);
        toast.success("All commands copied!");
    };

    const confirmDeleteStation = async (station: any) => {
        setshowModal(true)
        setselectedStation(station)
    };
return (
  <div className="p-6 max-w-4xl mx-auto mt-14">
    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Router Settings</h1>

    {!showForm && (
      <button
        onClick={() => {
          setShowForm(true);
          setEditingStation(null);
        }}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mb-4"
      >
        <Plus size={16} className="inline mr-2" /> Add Router
      </button>
    )}

    {showForm && (
      <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-md w-full mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {editingStation ? "Edit Router" : "Add Router"}
          </h2>
          <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        {!editingStation && (
          <div className="rounded-md bg-yellow-600/90 p-1 mt-2 mb-2 text-white relative flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between p-1">
              <h1 className="text-xl">Instructions to configure Router (Using Wireguard)</h1>
              <div
                onClick={() => setShowInstructions((prev) => !prev)}
                className="flex items-center justify-center cursor-pointer w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700"
              >
                {showInstructions ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </div>
            </div>
            {showInstructions && (
              <div className="flex flex-col">
                <h1 className="italic font-bold text-gray-900 dark:text-gray-100">
                  Before adding the router, please follow these instructions to configure WireGuard VPN on the router you're about to add.
                  <strong> Rest assured, these changes will not affect the router's regular operations.</strong>
                </h1>

                <h1 className="flex flex-row items-center text-green-500 font-bold">
                  <ArrowRight size={15} /> Make sure your MikroTik RouterOS version 7.x and above.
                </h1>
                <div className="flex items-center justify-between">
                  <h1 className="underline pt-2 font-bold text-gray-900 dark:text-gray-100">
                    Open MikroTik terminal and Run these Commands
                  </h1>
                  <button
                    onClick={copyAll}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Copy All
                  </button>
                </div>
                <div className="mb-2 flex flex-col gap-1 text-gray-900 dark:text-gray-100">
                  <h1 className="italic font-semibold">1. Add Wireguard interface</h1>
                  <CommandInput command="/interface/wireguard/add listen-port=13231 mtu=1420 name=wireguard" />

                  <h1 className="italic font-semibold">
                    2. Assign IP to WireGuard Interface, after adding the interface copy the public Key of the interface you created, you will fill it in the form below.
                  </h1>
                  <CommandInput command={`/ip address add address=${formData.mikrotikHost}/24 interface=wireguard`} />

                  <h1 className="italic font-semibold">3. Add Remote Server IP as Peer</h1>
                  <CommandInput command={`/interface wireguard peers add interface=wireguard name=novapeer public-key="xPCGwCHqAGaAbBlYHs6Af7OIAdoBsAQ5PVvEjmZb2zo=" endpoint-address=51.21.158.217 endpoint-port=51820 allowed-address=10.10.10.1/32 persistent-keepalive=10 `} />

                  <h1 className="italic font-semibold">4. Confirm WireGuard Interface and Peer are set</h1>
                  <CommandInput command="/interface wireguard print" />
                  <CommandInput command="/interface wireguard peers print" />

                  <h1 className="italic font-semibold">5. Allow API Access from WireGuard Subnet </h1>
                  <CommandInput command="/ip service set api address=10.10.10.0/24" />

                  <h1 className="italic font-semibold">6. Add Firewall Rule for API </h1>
                  <CommandInput command={`/ip firewall filter add \ chain=input \ src-address=10.10.10.0/24 \ protocol=tcp \ dst-port=8728 \ action=accept \ comment="Allow API from WireGuard"`} />
                  <CommandInput command={`/interface list member add list=LAN interface=wireguard`} />

                  <h1 className="italic font-semibold">7. Add Walled garden access </h1>
                  <CommandInput command={`/ip hotspot walled-garden add dst-host=novawifi.online action=allow`} />
                  <CommandInput command={`/ip hotspot walled-garden add dst-host=*.novawifi.online action=allow`} />
                  <CommandInput command="/ip hotspot walled-garden add dst-host=api64.ipify.org action=allow" />

                  <h1 className="italic font-semibold">8. Add Firewall Rule for Wireguard listen port </h1>
                  <CommandInput command="/ip firewall filter add action=accept chain=input dst-port=13231 protocol=udp" />
                  <CommandInput command="/ip firewall filter add action=accept chain=input src-address=10.10.10.0/24" />
                  <CommandInput command="/ip dns set servers=8.8.8.8,1.1.1.1 allow-remote-requests=yes" />

                  <h1 className="italic font-semibold">9. Add Firewall Mangle Rule to Limit Packet Forwarding </h1>
                  <CommandInput command="/ip firewall mangle add chain=postrouting out-interface=bridge action=change-ttl new-ttl=set:1" />

                  <h1 className="italic font-semibold">10. Continue and add Router Login Username and password below</h1>
                  <h1 className="italic font-semibold">11. After setting up and filling all details below try pinging our server wireguard internal ip on mikrotik to see if connection was successful</h1>
                  <CommandInput command="ping 10.10.10.1" />

                  <h1 className="italic font-semibold">
                    12. Lastly make sure to add <span className="text-green-600 font-bold">"local.wifi"</span> as your WiFi hotspot server profile DNS name. Remember to make sure you have{" "}
                    <Link className="font-semibold text-blue-600 underline" href="/admin/files">
                      /hotspot/login.html
                    </Link>{" "}
                    folder as well
                  </h1>
                </div>
              </div>
            )}
          </div>
        )}
        <form className="space-y-4">
          {ddns.length > 0 && (
            <div className="flex items-center space-x-3 mb-4 mt-4">
              <span className="text-sm text-gray-900 dark:text-gray-300">Use DDNS</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={useDDNS} onChange={handleToggle} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">Router Name</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder="Enter Router Name"
                className="w-full px-3 py-2 border bg-white dark:bg-black text-gray-900 dark:text-gray-300 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {useDDNS ? (
              <div className="space-y-2">
                <label htmlFor="mikrotikDDNS" className="block text-sm font-medium text-gray-900 dark:text-gray-300">
                  DDNS Host (Select one)
                </label>
                <select
                  id="mikrotikDDNS"
                  name="mikrotikDDNS"
                  value={formData.mikrotikDDNS || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border bg-white dark:bg-black text-gray-900 dark:text-gray-300 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="" disabled>
                    -- choose a DDNS --
                  </option>
                  {ddns
                    .filter((d) => d.isActive)
                    .map((d) => (
                      <option key={d.id} value={d.url}>
                        {d.url.replace(`.${origin}`, "")}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
                  Public IP Host or DDNS Url (Use{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                    href="https://whatismyipaddress.com/"
                  >
                    WhatIsMyIp
                  </a>{" "}
                  or check on WinBox IP/Cloud)
                </label>
                <input
                  required
                  type="text"
                  name="mikrotikPublicHost"
                  value={formData.mikrotikPublicHost || ""}
                  onChange={handleChange}
                  placeholder="Enter Mikrotik Public Host"
                  className="w-full px-3 py-2 border bg-white dark:bg-black text-gray-900 dark:text-gray-300 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">Private Host (IP Provided by Us)</label>
              <input
                required
                readOnly
                type="text"
                name="mikrotikHost"
                value={formData.mikrotikHost || ""}
                placeholder="Enter Mikrotik Host"
                className="w-full px-3 py-2 border bg-white dark:bg-black text-gray-900 dark:text-gray-300 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">Wireguard Public Key</label>
              <input
                required
                type="text"
                name="mikrotikPublicKey"
                value={formData.mikrotikPublicKey || ""}
                onChange={handleChange}
                placeholder="Enter Wireguard Public Key"
                className="w-full px-3 py-2 border bg-white dark:bg-black text-gray-900 dark:text-gray-300 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">Router Username</label>
              <input
                required
                type="text"
                name="mikrotikUser"
                value={formData.mikrotikUser || ""}
                onChange={handleChange}
                placeholder="Enter Mikrotik Username"
                className="w-full px-3 py-2 border bg-white dark:bg-black text-gray-900 dark:text-gray-300 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">Router Password</label>
              <div className="relative flex items-center flex-row">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="mikrotikPassword"
                  value={formData.mikrotikPassword || ""}
                  onChange={handleChange}
                  placeholder="Enter Mikrotik Password"
                  className="w-full px-3 py-2 border bg-white dark:bg-black text-gray-900 dark:text-gray-300 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <div
                  className="absolute fontbold right-5 text-gray-900 dark:text-gray-300 cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <Eye /> : <EyeClosed />}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Station"}
          </button>
        </form>
      </div>
    )}

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
      {stations.length === 0 ? (
        <p className="text-gray-900 dark:text-gray-300">No stations available.</p>
      ) : (
        stations.map((station) => {
          const status = connectionStatus[station.id] || "Connecting";
          const message = connectionStatus[station.id] || "Waiting for connection...";
          return (
            <div
              key={station.id}
              className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-all p-6"
            >
              <div className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold flex flex-row items-center gap-2 text-gray-900 dark:text-gray-100">
                  {station.name}
                </h3>
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://${station.mikrotikWebfigHost}`}
                  title={`https://${station.mikrotikWebfigHost}`}
                >
                  <p className="text-blue-600 font-semibold underline text-sm flex flex-row items-center gap-1">
                    Open Webfig
                    <Link2 size={16} />
                  </p>
                </Link>
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="text-green-400 font-semibold"> Internal IP: </span>
                  {station.mikrotikHost}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="text-green-400 font-semibold"> Remote IP/Port: </span> 51.21.158.217:{getMappedPort(station.mikrotikHost)}
                </p>
              </div>

              <p
                title={message}
                className={`mt-2 text-sm font-medium ${
                  status === "Connected"
                    ? "text-green-600"
                    : status === "Failed"
                    ? "text-red-500"
                    : "text-yellow-500"
                }`}
              >
                {status}
              </p>
              <div className="flex justify-between mt-4">
                {!showForm && (
                  <button
                    onClick={() => {
                      setShowForm(true);
                      setEditingStation(station);
                      setFormData(station);
                    }}
                    className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                  >
                    <Edit size={16} />
                  </button>
                )}
                <button onClick={() => confirmDeleteStation(station)} className="text-red-600 hover:text-red-800 dark:hover:text-red-400">
                  <Trash size={16} />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>

    {showModal && (
      <DeleteRouter
        selectedStation={selectedStation}
        setshowModal={setshowModal}
        isDeleting={isDeleting}
        handleDeleteStation={handleDeleteStation}
      />
    )}
  </div>
);
}

// DeleteRouter component:
export function DeleteRouter({ selectedStation, setshowModal, isDeleting, handleDeleteStation }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-2xl p-6 w-full max-w-md max-h-full overflow-y-auto space-y-6">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-x-1 flex-wrap">
          <span>Are you sure you want to delete</span>
          <span className="text-red-500">"{selectedStation.name}"</span>
          <span>Router</span>
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This action will permanently delete all associated hotspot users, PPPoE users, and packages linked to this router from our site.
        </p>
        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={() => {
              setshowModal(false);
            }}
            className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteStation(selectedStation.id)}
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// CommandInput component:
export function CommandInput({ command }: any) {
  return (
    <div className="flex flex-row items-center relative">
      <input
        type="text"
        value={command}
        readOnly
        className="w-full px-3 py-2 border bg-white dark:bg-black text-gray-900 dark:text-gray-300 border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
  );
}
