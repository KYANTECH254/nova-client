"use client";

import { cache, useEffect, useState } from "react";
import Table from "./Table";
import { Trash2, Edit, Plus, Eye, EyeClosed } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/AdminSessionProvider";
import { PPPoE as PPPoEType } from "@/utils/types";
import { validateLocalAddress, validateDNSServer } from "@/utils/FUnstions";

export default function PPPoE() {
    const [pppoE, setPppoE] = useState<PPPoEType[]>([]);
    const [pools, setPools] = useState<any[]>([]);
    const [stations, setStations] = useState<any[]>([]);
    const [pppProfiles, setPppProfiles] = useState<any[]>([]);
    const [pppServers, setPppServers] = useState<any[]>([]);
    const [routerInterfaces, setRouterInterfaces] = useState<any[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentPPPoE, setCurrentPPPoE] = useState<PPPoEType | null>(null);
    const { adminUser, token } = useAdminAuth();
    const [selectedStation, setSelectedStation] = useState<any>();
    const [selectedPool, setSelectedPool] = useState<any>();
    const [selectedProfile, setSelectedProfile] = useState<any>();
    const [selectedServer, setSelectedServer] = useState<any>();
    const [selectedInterface, setSelectedInterface] = useState<any>();

    // Form fields
    const [name, setName] = useState("");
    const [paymentLink, setpaymentLink] = useState("");
    const [email, setEmail] = useState("");
    const [profile, setProfile] = useState("");
    const [servicename, setServicename] = useState("");
    const [price, setPrice] = useState("");
    const [devices, setDevices] = useState("");
    const [usage, setUsage] = useState("");
    const [period, setPeriod] = useState("");
    const [clientname, setClientname] = useState("");
    const [clientpassword, setClientpassword] = useState("");
    const [maxsessions, setMaxsessions] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [localaddress, setLocalAddress] = useState("");
    const [DNSserver, setDNSserver] = useState("");
    const [speed, setSpeed] = useState("");
    const [periodUnit, setPeriodUnit] = useState("")
    const [status, setStatus] = useState("active")

    useEffect(() => {
        const fetchPppoe = cache(async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/pppoe`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token })
                });
                const res = await response.json();
                if (res.success) {
                    setPppoE(res.pppoe);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error fetching PPPoE:", error);
                toast.error("Failed to fetch PPPoE");
            }
        });
        fetchPppoe();
    }, [token]);

    useEffect(() => {
        const fetchPools = cache(async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/mkt/pools`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                });
                const res = await response.json();
                if (res.success) {
                    const poolsData = res.pools
                        .map((pool: any) =>
                            pool.data.pools.map((p: any) => ({
                                ...p,
                                host: pool.host,
                                username: pool.username,
                            }))
                        )
                        .flat();
                    setPools(poolsData);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error fetching pools:", error);
                toast.error("Failed to fetch pools");
            }
        });
        fetchPools();
    }, [token]);

    useEffect(() => {
        const fetchStations = cache(async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/mkt/stations`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token })
                });
                const res = await response.json();
                if (res.success) {
                    setStations(res.stations);
                    if (res.stations.length > 0) {
                        setSelectedStation(res.stations[0]);
                    }
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error fetching stations:", error);
                toast.error("Failed to fetch stations");
            }
        });
        fetchStations();
    }, [token]);

    useEffect(() => {
        const fetchPppProfiles = cache(async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/mkt/ppp-profiles`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                });

                const res = await response.json();

                if (res.success) {
                    const profilesData = res.profiles
                        .map((profileGroup: any) =>
                            // Use profileGroup.data.profiles and sort by name
                            (profileGroup.data?.profiles || [])
                                .sort((a: any, b: any) => a.name.localeCompare(b.name))
                                .map((profile: any) => ({
                                    ...profile,
                                    host: profileGroup.host,
                                    station: profileGroup.station,
                                    profileId: profileGroup.id,
                                }))
                        )
                        .flat();

                    setPppProfiles(profilesData);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.error("Error fetching PPP profiles:", error);
                toast.error("Failed to fetch PPP profiles");
            }
        });

        fetchPppProfiles();
    }, [token]);

    useEffect(() => {
        const fetchPppServers = cache(async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/mkt/ppp-servers`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                });

                const res = await response.json();

                if (res.success) {
                    const serversData = res.servers
                        .map((serverGroup: any) =>
                            (serverGroup.data?.servers || [])
                                .sort((a: any, b: any) => a.serviceName.localeCompare(b.serviceName))
                                .map((server: any) => ({
                                    ...server,
                                    host: serverGroup.host,
                                    station: serverGroup.station,
                                    serverGroupId: serverGroup.id,
                                }))
                        )
                        .flat();

                    setPppServers(serversData);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.error("Error fetching PPP servers:", error);
                toast.error("Failed to fetch PPP servers");
            }
        });

        fetchPppServers();
    }, [token]);

    useEffect(() => {
        const fetchInterfaces = cache(async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/mkt/interfaces`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token })
                });

                const res = await response.json();

                if (res.success) {
                    const interfacesData = res.profiles
                        .map((interfaceGroup: any) =>
                            (interfaceGroup.data?.interfaces || []).map((intf: any) => ({
                                ...intf,
                                host: interfaceGroup.host,
                                username: interfaceGroup.username,
                                profileId: interfaceGroup.id,
                            }))
                        )
                        .flat();

                    setRouterInterfaces(interfacesData);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error fetching interfaces:", error);
                toast.error("Failed to fetch interfaces");
            }
        });

        fetchInterfaces();
    }, [token]);

    const filteredPppoe = pppoE.filter((pppoe) =>
        [pppoe.name, pppoe.profile, pppoe.servicename, pppoe.clientname, pppoe.paymentLink, pppoe.email].some(
            (value) =>
                value &&
                value.toString().toLowerCase().includes(searchValue.toLowerCase())
        )).reverse();

    const filteredPools = pools.filter(
        (pool) =>
            pool.host === selectedStation?.mikrotikHost &&
            pool.username === selectedStation?.mikrotikUser
    );

    const filteredPppProfiles = pppProfiles.filter(
        (profile) =>
            profile.host === selectedStation?.mikrotikHost
    );

    const filteredPppServers = pppServers.filter(
        (profile) =>
            profile.host === selectedStation?.mikrotikHost
    );

    const filteredInterfaces = routerInterfaces.filter(
        (intf) => intf.host === selectedStation?.mikrotikHost
    );

    const handleDelete = async (pppoe: PPPoEType) => {
        setIsDeleting(true);
        try {
            setPppoE(prev => prev.filter(p => p.id !== pppoe.id));
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/mkt/deletePppoE`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: pppoe.id,
                    token
                }),
            });
            const res = await response.json();

            if (res.success) {
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.log("Error deleting PPPoE:", error);
            toast.error("Failed to delete PPPoE");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteSelectedPPPoEs = async (selected: PPPoEType[]) => {
        if (!selected.length) return;
        setIsDeleting(true);
        try {
            setPppoE((prev) =>
                prev.filter((mod) => !selected.some((sel) => sel.id === mod.id))
            );
            const deleteRequests = selected.map((mod) =>
                fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/mkt/deletePppoE`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token,
                        id: mod.id,
                    }),
                })
            );

            const results = await Promise.all(deleteRequests);
            const jsonResults = await Promise.all(results.map((r) => r.json()));

            const failed = jsonResults.filter((res) => !res.success);
            if (failed.length > 0) {
                toast.error(
                    `Failed to delete ${failed.length} pppoe(s). Some deletions may have succeeded.`
                );
            } else {
                toast.success(`${selected.length} pppoe(s) deleted.`);
            }
        } catch (err) {
            console.error(err);
            toast.error("Error deleting pppoes.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (pppoe: PPPoEType) => {
        setCurrentPPPoE(pppoe);
        setName(pppoe.name);
        setProfile(pppoe.profile);
        setServicename(pppoe.servicename);
        setPrice(pppoe.price);
        setDevices(pppoe.devices);
        if (pppoe.period) {
            const matched = pppoe.period.match(/(\d+)\s*(\w+)/);
            if (matched) {
                setPeriod(matched[1]);
                setPeriodUnit(matched[2].toLowerCase());
            }
        }
        setClientname(pppoe.clientname);
        setClientpassword(pppoe.clientpassword);
        setMaxsessions(pppoe.maxsessions);
        setEmail(pppoe.email)
        setStatus(pppoe.status)

        // Find and set related station, pool, profile, and interface
        const station = stations.find(s => s.mikrotikHost === pppoe.station);
        if (station) {
            setSelectedStation(station);

            const pool = pools.find(p =>
                p.host === station.mikrotikHost &&
                p.username === station.mikrotikUser &&
                p.name === pppoe.pool
            );
            if (pool) setSelectedPool(pool);

            const profile = pppProfiles.find(p =>
                p.host === station.mikrotikHost &&
                p.name === pppoe.profile
            );
            if (profile) setSelectedProfile(profile);

            const server = pppServers.find(p =>
                p.host === station.mikrotikHost &&
                p.name === pppoe.servicename
            );
            if (server) setSelectedServer(server);

            const intf = routerInterfaces.find(i =>
                i.host === station.mikrotikHost &&
                i.name === pppoe.interface
            );
            if (intf) setSelectedInterface(intf);
        }

        setShowModal(true);
    };

    const handleAddPPPoE = () => {
        setCurrentPPPoE(null);
        resetForm();
        setShowModal(true);
    };

    const resetForm = () => {
        setName("");
        setProfile("");
        setServicename("");
        setPrice("");
        setDevices("");
        setUsage("");
        setPeriod("");
        setClientname("");
        setClientpassword("");
        setMaxsessions("");
        setSelectedPool(null);
        setSelectedProfile(null);
        setSelectedServer(null);
        setSelectedInterface(null);
    };

    const handleStationChange = (stationId: string) => {
        const station = stations.find(s => s.id === stationId);
        if (station) {
            setSelectedStation(station);
            // Reset dependent fields when station changes
            setSelectedPool(null);
            setSelectedProfile(null);
            setSelectedServer(null);
            setSelectedInterface(null);
        }
    };

    const handlePoolChange = (poolName: string) => {
        const pool = filteredPools.find(p => p.name === poolName);
        setSelectedPool(pool);
    };

    const handleProfileChange = (profileName: string) => {
        const profile = filteredPppProfiles.find(p => p.name === profileName);
        setSelectedProfile(profile);
        setProfile(profileName);
        setName(profileName);
    };

    const handleInterfaceChange = (interfaceName: string) => {
        const intf = filteredInterfaces.find(i => i.name === interfaceName);
        setSelectedInterface(intf);
    };

    const handleServerChange = (serviceName: string) => {
        const serv = filteredPppServers.find(i => i.serviceName === serviceName);
        setSelectedServer(serv);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdding(true);

        if (!selectedStation) {
            toast.error("Please select a station");
            setIsAdding(false);
            return;
        }

        if (!profile && localaddress?.trim()) {
            if (!validateLocalAddress(localaddress)) {
                toast.error("Invalid local address");
                return;
            }
        }

        if (DNSserver?.trim()) {
            if (!validateDNSServer(DNSserver)) {
                toast.error("Invalid DNS server address");
                return;
            }
        }

        const pppoeData = {
            id: currentPPPoE?.id || "",
            token,
            name,
            profile: selectedProfile?.name || profile,
            servicename,
            station: selectedStation.mikrotikHost,
            pool: selectedPool?.name || "",
            price,
            devices,
            period: `${period} ${periodUnit}`,
            clientname,
            clientpassword,
            interface: selectedInterface?.name || "",
            maxsessions,
            DNSserver,
            localaddress: profile ? "" : localaddress,
            speed,
            paymentLink: currentPPPoE?.paymentLink || "",
            email,
            status
        };

        try {
            const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/mkt/updatePPPoE`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(pppoeData),
            });

            const res = await response.json();
            if (res.success) {
                toast.success(res.message);
                if (currentPPPoE) {
                    setPppoE((prev: any) => prev.map((p: { id: string; }) => p.id === currentPPPoE.id ? { ...pppoeData, id: currentPPPoE.id } : p));
                } else {
                    setPppoE(prev => [...prev, { ...res.pppoe, id: res.pppoe.id }]);
                }
                setShowModal(false);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.log("Error submitting PPPoE:", error);
            toast.error("Failed to submit PPPoE");
        } finally {
            setIsAdding(false);
        }
    };

    const columns = [
        {
            header: "Name",
            accessor: "name",
        },
        {
            header: "Email",
            accessor: "email",
        },
        {
            header: "Service",
            accessor: "servicename",
        },
        {
            header: "Client",
            accessor: "clientname",
        },
        {
            header: "Status",
            accessor: "status",
            render: (value: string) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs ${value === "inactive"
                        ? "bg-red-900/20 text-red-800"
                        : "bg-green-900/20 text-green-800"
                        }`}
                >
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
            ),
        },
        {
            header: "Price (KES)",
            accessor: "price",
            render: (value: string) => `KES ${value}`,
        },
        {
            header: "Period",
            accessor: "period",
        },
        {
            header: "Payment Link",
            accessor: "link",
        },
        {
            header: "Created At",
            accessor: "createdAt",
            render: (value: string) => new Date(value).toLocaleString(),
        },
        {
            header: "Actions",
            accessor: "id",
            render: (value: string, row: PPPoEType) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="Edit PPPoE"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete PPPoE"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-4">
            <Table
                data={filteredPppoe}
                columns={columns}
                handleAddPPPoE={handleAddPPPoE}
                title="PPPoE Services"
                showSearch={true}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                onDeleteSelected={handleDeleteSelectedPPPoEs}
            />

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="flex flex-col bg-gray-900 border border-gray-700 text-gray-100 rounded-lg shadow-2xl p-6 w-full max-w-md max-h-full overflow-y-auto space-y-6">
                        <h2 className="text-xl font-bold mb-4">
                            {currentPPPoE ? "Edit PPPoE" : "Add New PPPoE"}
                        </h2>
                        <form autoComplete="off_dont_autofill" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Station / Router</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                        required
                                        value={selectedStation?.id || ""}
                                        onChange={(e) => handleStationChange(e.target.value)}
                                    >
                                        {stations.map((station) => (
                                            <option key={station.id} value={station.id}>
                                                {station.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Pool</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                        required
                                        value={selectedPool?.name || ""}
                                        onChange={(e) => handlePoolChange(e.target.value)}
                                    >
                                        <option value="">Select Pool</option>
                                        {filteredPools.map((pool) => (
                                            <option key={pool.name} value={pool.name}>
                                                {pool.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">PPP Profile</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                        value={selectedProfile?.name || profile}
                                        onChange={(e) => handleProfileChange(e.target.value)}
                                    >
                                        <option value="">Select Profile</option>
                                        {filteredPppProfiles.map((profile) => (
                                            <option key={profile.name} value={profile.name}>
                                                {profile.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">PPP Server</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                        value={selectedServer?.serviceName || servicename}
                                        onChange={(e) => handleServerChange(e.target.value)}
                                    >
                                        <option value="">Select Server</option>
                                        {filteredPppProfiles.map((server) => (
                                            <option key={server.serviceName} value={server.serviceName}>
                                                {server.serviceName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {!selectedProfile && (
                                    <>
                                        <h2 className="text-lg mt-2 mb-2">Create PPP Profile</h2>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Profile Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Local Address (E.g 192.168.88.1)</label>
                                            <input
                                                type="text"
                                                name="local-address"
                                                value={localaddress || currentPPPoE?.localaddress || ""}
                                                onChange={(e) => setLocalAddress(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">DNS Server (E.g 1.1.1.1)</label>
                                            <input
                                                type="text"
                                                name="dnsserver"
                                                value={DNSserver || currentPPPoE?.DNSserver || ""}
                                                onChange={(e) => setDNSserver(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Speed (Mbps)</label>
                                            <input
                                                type="number"
                                                name="speed"
                                                value={speed}
                                                onChange={(e) => setSpeed(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                                required
                                            />
                                        </div>
                                    </>
                                )}
                                {!selectedServer && (
                                    <>
                                        <h2 className="text-lg mt-2 mb-2">Create PPPoE Server</h2>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Service Name</label>
                                            <input
                                                type="text"
                                                value={servicename}
                                                onChange={(e) => setServicename(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Interface</label>
                                            <select
                                                className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                                required
                                                value={selectedInterface?.name || ""}
                                                onChange={(e) => handleInterfaceChange(e.target.value)}
                                            >
                                                <option value="">Select Interface</option>
                                                {filteredInterfaces.map((intf) => (
                                                    <option key={intf.name} value={intf.name}>
                                                        {intf.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Max Sessions</label>
                                            <input
                                                type="number"
                                                value={maxsessions}
                                                onChange={(e) => setMaxsessions(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                <h2 className="text-lg mt-2 mb-2">Create PPP Secret</h2>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Client Name</label>
                                    <input
                                        type="text"
                                        value={clientname}
                                        onChange={(e) => setClientname(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Client Password</label>
                                    <div className="relative flex items-center flex-row">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={clientpassword}
                                            onChange={(e) => setClientpassword(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                            required
                                        />
                                        <div
                                            className="absolute fontbold right-5 text-gray-300 cursor-pointer"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                        >
                                            {showPassword ? <Eye /> : <EyeClosed />}
                                        </div>
                                    </div>
                                </div>

                                <h2 className="text-lg mt-2 mb-2">Create Plan</h2>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Price (KES)  (Optional)</label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                        required
                                    />
                                </div>

                                {/* <div> */}
                                <label className="block text-sm font-medium mb-1">Period</label>
                                <div className="flex">
                                    <input
                                        type="number"
                                        value={period}
                                        onChange={(e) => setPeriod(e.target.value)}
                                        className="w-1/2 px-3 py-2 border rounded-l-md bg-black text-gray-300"
                                        placeholder="Value"
                                        required
                                    />
                                    <select
                                        value={periodUnit}
                                        onChange={(e) => setPeriodUnit(e.target.value)}
                                        className="w-1/2 px-3 py-2 border rounded-r-md bg-black text-gray-300"
                                        required
                                    >
                                        <option value="minutes">Minutes</option>
                                        <option value="hours">Hours</option>
                                        <option value="days">Days</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Plan Status</label>
                                    <div className="flex">
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-r-md bg-black text-gray-300"
                                            required
                                        >
                                            <option value="inactive">Inactive</option>
                                            <option value="active">Active</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Client Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false)
                                        setIsAdding(false)
                                    }}
                                    className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    disabled={isAdding}
                                >
                                    {isAdding ? "Processing..." : currentPPPoE ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}