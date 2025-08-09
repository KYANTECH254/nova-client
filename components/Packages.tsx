"use client";

import { cache, useEffect, useState } from "react";
import Table from "./Table";
import { Trash2, Edit, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/AdminSessionProvider";

export type Package = {
    id: string;
    name: string;
    period: string;
    price: string;
    speed: string;
    devices: string;
    usage: string;
    pool: string;
    routerHost?: string;
    routerName?: string;
    category: "Daily" | "Weekly" | "Monthly" | "Data";
    status: string;
    createdAt?: string;
    updatedAt?: string;
};

export default function Packages() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [pools, setPools] = useState<any[]>([]);
    const [stations, setStations] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentPackage, setCurrentPackage] = useState<Package | null>(null);
    const [periodValue, setPeriodValue] = useState("");
    const [periodUnit, setPeriodUnit] = useState<any>("days");
    const [usageValue, setUsageValue] = useState("");
    const [isUnlimited, setIsUnlimited] = useState(false);
    const [unlimitedDevices, setUnlimitedDevices] = useState(false);
    const [unlimitedPeriod, setUnlimitedPeriod] = useState(false);
    const { adminUser, token } = useAdminAuth();
    const [selectedStation, setSelectedStation] = useState<any>();
    const [selectedHost, setSelectedHost] = useState<any>();
    const [selectedPool, setSelectedPool] = useState<any>();
    const [selectedProfileId, setSelectedProfileId] = useState<any>();
    const [name, setName] = useState("");
    const [speed, setSpeed] = useState("");
    const [devices, setDevices] = useState("");
    const [category, setCategory] = useState("Daily");
    const [packagestatus, setPackageStatus] = useState("live");

    useEffect(() => {
        const fetchpackages = cache(async () => {
            const data = {
                token
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
    }, []);

    useEffect(() => {
        const fetchpools = cache(async () => {
            const data = {
                token
            };
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/mkt/pools`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });
                const res = await response.json();
                if (res.success) {
                    // Add host & username to each pool
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
        fetchpools();
    }, []);

    useEffect(() => {
        const fetchstations = cache(async () => {
            const data = {
                token
            }
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/mkt/stations`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data)
                });
                const res = await response.json();
                if (res.success) {
                    setStations(res.stations);
                    if (res.stations.length > 0) {
                        const firstStation = res.stations[0];
                        setSelectedStation(firstStation);
                        setSelectedHost(firstStation.mikrotikHost);
                    }
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error fetching stations:", error);
                toast.error("Failed to fetch stations");
            }
        });
        fetchstations();
    }, []);

    useEffect(() => {
        const fetchProfiles = cache(async () => {
            const data = { token };
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/mkt/hotspot-profiles`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                const res = await response.json();

                if (res.success) {
                    const profilesData = res.profiles
                        .map((profileGroup: any) =>
                            (profileGroup.data?.profiles || []).map((p: any) => ({
                                name: p.name || '',
                                rateLimit: p.rateLimit || '',
                                sharedUsers: p.sharedUsers || '',
                                idleTimeout: p.idleTimeout || '',
                                keepaliveTimeout: p.keepaliveTimeout || '',
                                sessionTimeout: p.sessionTimeout || '',
                                statusAutorefresh: p.statusAutorefresh || '',
                                addMacCookie: p.addMacCookie || '',
                                macCookieTimeout: p.macCookieTimeout || '',
                                addressPool: p.addressPool || '',
                                comment: p.comment || '',
                                host: profileGroup.host,
                                username: profileGroup.username,
                            }))
                        )
                        .flat();
                    setProfiles(profilesData);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error fetching profiles:", error);
                toast.error("Failed to fetch profiles");
            }
        });

        fetchProfiles();
    }, []);

    const filteredPackages = packages.filter((pkg) =>
        [pkg.name, pkg.category, pkg.price, pkg.speed].some(
            (value) =>
                value &&
                value.toString().toLowerCase().includes(searchValue.toLowerCase())
        )
    )
        .reverse()

    const filteredPools = pools.filter(
        (pool) =>
            pool.host === selectedStation?.mikrotikHost &&
            pool.username === selectedStation?.mikrotikUser
    );

    const filteredProfiles = profiles.filter(
        (profile) =>
            profile.addressPool === selectedPool?.name
    );

    const handleDelete = async (selectedpackage: Package) => {
        setIsDeleting(true);
        try {
            setPackages(prev => prev.filter(pkg => pkg.id !== selectedpackage.id));
            const data = {
                token,
                id: selectedpackage.id,
                platformID: adminUser.platformID,
                host: selectedpackage.routerHost
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/deletePackage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const res = await response.json();

            if (res.success) {
                toast.success(res.message);
            } else if (!res.success) {
                toast.error(res.message);
            }
        } catch (error) {
            console.log("Error deleting package:", error);
            toast.error("Failed to delete package");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteSelectedPackages = async (selected: Package[]) => {
        if (!selected.length) return;
        setIsDeleting(true);
        try {
            setPackages((prev) =>
                prev.filter((mod) => !selected.some((sel) => sel.id === mod.id))
            );
            const deleteRequests = selected.map((mod) =>
                fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/deletePackage`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token,
                        id: mod.id,
                        host: mod.routerHost,
                        platformID: adminUser.platformID
                    }),
                })
            );

            const results = await Promise.all(deleteRequests);
            const jsonResults = await Promise.all(results.map((r) => r.json()));

            const failed = jsonResults.filter((res) => !res.success);
            if (failed.length > 0) {
                toast.error(
                    `Failed to delete ${failed.length} package(s). Some deletions may have succeeded.`
                );
            } else {
                toast.success(`${selected.length} package(s) deleted.`);
            }
        } catch (err) {
            console.error(err);
            toast.error("Error deleting packages.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (pkg: Package) => {
        let periodValue = "";
        let periodUnit = "days";

        if (pkg.period.trim() === "NoExpiry") {
            setUnlimitedPeriod(true);
            periodValue = "NoExpiry";
            periodUnit = "";
        } else if (pkg.period) {
            const periodParts = pkg.period.split(" ");
            periodValue = periodParts[0] || "";
            periodUnit = periodParts[1] || "days";
            setUnlimitedPeriod(false);
        }

        const matchingPool = filteredPools.find(pool => pool.name === pkg.pool);

        setSelectedPool(matchingPool || "");
        setPeriodValue(periodValue);
        setPeriodUnit(periodUnit);
        setIsUnlimited(pkg.usage === "Unlimited");
        setUnlimitedDevices(pkg.devices === "Unlimited");
        setDevices(pkg.devices === "Unlimited" ? "" : pkg.devices);
        setName(pkg.name);
        setSpeed(pkg.speed);
        setCurrentPackage(pkg);
        setShowModal(true);
        setPackageStatus(pkg.status);
        setCategory(pkg.category)
    };

    const handleAdd = () => {
        setSelectedPool("");
        setCurrentPackage(null);
        setPeriodValue("");
        setPeriodUnit("days");
        setUsageValue("");
        setIsUnlimited(false);
        setUnlimitedDevices(false);
        setUnlimitedPeriod(false);
        setName("");
        setSpeed("");
        setDevices("");
        setSelectedProfileId("");
        setShowModal(true);
    };

    const handleStationChange = (stationId: string) => {
        const station = stations.find(s => s.id === stationId);
        if (station) {
            setSelectedStation(station);
            setSelectedHost(station.mikrotikHost);
            // Reset dependent fields when station changes
            setSelectedProfileId("");
            setName("");
            setSpeed("");
            setDevices("");
            setSelectedPool("");
        }
    };

    const handlePoolChange = (poolName: string) => {
        const pool = filteredPools.find(p => p.name === poolName);
        setSelectedPool(pool);
        if (pool) {
            setSelectedPool(pool);
            // Reset dependent fields when station changes
            setSelectedProfileId("");
            setName("");
            setSpeed("");
            setDevices("");
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        setIsAdding(true)
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const packageData = {
            token,
            adminID: adminUser?.adminID,
            platformID: adminUser?.platformID,
            id: currentPackage?.id || "",
            name: name,
            period: `${periodValue} ${periodUnit}`,
            price: formData.get("price") as string,
            speed: speed,
            devices: unlimitedDevices ? "Unlimited" : devices,
            usage: isUnlimited ? "Unlimited" : `${(formData.get("usage") as string)} ${(formData.get("usageUnit") as string)}`,
            category: formData.get("category") as "Daily" | "Weekly" | "Monthly" | "Data",
            station: formData.get("station") as string,
            pool: selectedPool?.name || "",
            profile: selectedProfileId || "",
            host: selectedStation.mikrotikHost,
            status: packagestatus
        };

        try {
            const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/req/${currentPackage ? "updatePackage" : "addPackage"}`;
            const method = "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(packageData),
            });
            const res = await response.json();
            if (res.success) {
                toast.success(res.message);
                currentPackage && setPackages(prev => prev.filter(pkg => pkg.id !== packageData.id));
                setPackages(prev => [...prev, packageData]);
            } else {
                toast.error(res.message);
            }
            setIsAdding(false)
        } catch (error) {
            setIsAdding(false)
            console.log("Error submitting package:", error);
            toast.error("Failed to submit package");
        }
        setIsAdding(false)
        setShowModal(false);
    };

    const columns = [
        {
            header: "Name",
            accessor: "name",
        },
        {
            header: "Category",
            accessor: "category",
        },
        {
            header: "Period",
            accessor: "period",
        },
        {
            header: "Price (KES)",
            accessor: "price",
            render: (value: string) => `KES ${value}`,
        },
        {
            header: "Speed",
            accessor: "speed",
        },
        {
            header: "Devices",
            accessor: "devices",
        },
        {
            header: "Usage",
            accessor: "usage",
        },
        {
            header: "Created At",
            accessor: "createdAt",
            render: (value: string) => new Date(value).toLocaleString(),
        },
        {
            header: "Actions",
            accessor: "id",
            render: (value: string, row: Package) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="Edit package"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete package"
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
                data={filteredPackages}
                columns={columns}
                handleAdd={handleAdd}
                title="Packages"
                showSearch={true}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                onDeleteSelected={handleDeleteSelectedPackages}
            />

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="flex flex-col bg-gray-900 border border-gray-700 text-gray-100 rounded-lg shadow-2xl p-6 w-full max-w-md max-h-full overflow-y-auto space-y-6">
                        <h2 className="text-xl font-bold mb-4">
                            {currentPackage ? "Edit Package" : "Add New Package"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Select Station / Router</label>
                                    <select
                                        name="station"
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
                                    <label className="block text-sm font-medium mb-1">Select Pool</label>
                                    <select
                                        name="pool"
                                        className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                        required
                                        value={selectedPool?.name || ""}
                                        onChange={(e) => handlePoolChange(e.target.value)}
                                    >
                                        <option value="">--- Pick pool ---</option>
                                        {filteredPools.map((pool, index) => (
                                            <option key={index} value={pool.name}>
                                                {pool.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Select Profile</label>
                                    <select
                                        name="profile"
                                        className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                        value={selectedProfileId}
                                        onChange={(e) => {
                                            const profileName = e.target.value;
                                            setSelectedProfileId(profileName);

                                            const selectedProfile = filteredProfiles.find(p => p.name === profileName);

                                            if (selectedProfile) {
                                                setName(selectedProfile.name);
                                                const rateLimit = selectedProfile.rateLimit.split('/')[0].replace('M', '');
                                                setSpeed(rateLimit);
                                                setDevices(selectedProfile.sharedUsers.toString());
                                                const sessionTimeout = selectedProfile.sessionTimeout || 'none';

                                                if (sessionTimeout === 'none' || sessionTimeout === '') {
                                                    setUnlimitedPeriod(true);
                                                    setPeriodValue('');
                                                    setPeriodUnit('minutes');  
                                                } else {
                                                    setUnlimitedPeriod(false);
                                                    const match = sessionTimeout.match(/^(\d+)([mhd])$/i);
                                                    if (match) {
                                                        const value = match[1];
                                                        const unitCode = match[2].toLowerCase();
                                                        setPeriodValue(value);
                                                        const unitMap = {
                                                            m: 'minutes',
                                                            h: 'hours',
                                                            d: 'days',
                                                        };
                                                       setPeriodUnit(unitMap[unitCode as keyof typeof unitMap] || 'days');
                                                    } else {
                                                        setPeriodValue('');
                                                        setPeriodUnit('minutes');
                                                    }
                                                }
                                            }
                                        }}

                                    >
                                        <option value="">--- Pick profile ---</option>
                                        {filteredProfiles.map((profile) => (
                                            <option key={profile.name} value={profile.name}>{profile.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input
                                        readOnly={selectedProfileId && !currentPackage || !selectedProfileId && currentPackage}
                                        type="text"
                                        name="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <select
                                        name="category"
                                        defaultValue={currentPackage?.category || "Daily"}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                        required
                                    >
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Data">Data Plan</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Period</label>
                                    <div className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            id="unlimitedPeriod"
                                            checked={unlimitedPeriod}
                                            onChange={(e) => {
                                                setUnlimitedPeriod(e.target.checked);
                                                if (e.target.checked) {
                                                    setPeriodValue("NoExpiry");
                                                    setPeriodUnit("")
                                                }
                                            }}
                                            className="mr-2"
                                        />
                                        <label htmlFor="unlimitedPeriod">{category === "Data" ? "No Expiry" : "Unlimited"}</label>
                                    </div>

                                    {!unlimitedPeriod && (
                                        <div className="flex">
                                            <input
                                                type="number"
                                                value={periodValue}
                                                onChange={(e) => setPeriodValue(e.target.value)}
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
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Price (KES)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        defaultValue={currentPackage?.price || ""}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Speed (Mbps)</label>
                                    <input
                                        type="text"
                                        name="speed"
                                        value={speed}
                                        onChange={(e) => setSpeed(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Devices</label>
                                    <div className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            id="unlimitedDevices"
                                            checked={unlimitedDevices}
                                            onChange={(e) => {
                                                setUnlimitedDevices(e.target.checked);
                                                if (e.target.checked) setDevices("");
                                            }}
                                            className="mr-2"
                                        />
                                        <label htmlFor="unlimitedDevices">Unlimited</label>
                                    </div>
                                    {!unlimitedDevices && (
                                        <input
                                            type="number"
                                            name="devices"
                                            value={devices}
                                            onChange={(e) => setDevices(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                            required
                                        />
                                    )}
                                    <input
                                        type="hidden"
                                        name="devices"
                                        value={unlimitedDevices ? "Unlimited" : ""}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Usage</label>
                                    <div className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            id="unlimited"
                                            checked={isUnlimited}
                                            onChange={(e) => setIsUnlimited(e.target.checked)}
                                            className="mr-2"
                                        />
                                        <label htmlFor="unlimited">Unlimited</label>
                                    </div>
                                    {!isUnlimited && (
                                        <div className="flex">
                                            <input
                                                type="number"
                                                name="usage"
                                                defaultValue={
                                                    currentPackage?.usage !== "Unlimited"
                                                        ? parseFloat(currentPackage?.usage || "0")
                                                        : ""
                                                }
                                                className="w-1/2 px-3 py-2 border rounded-l-md bg-black text-gray-300"
                                                required={!isUnlimited}
                                            />
                                            <select
                                                name="usageUnit"
                                                defaultValue={
                                                    currentPackage?.usage !== "Unlimited"
                                                        ? currentPackage?.usage.replace(/[0-9.\s]/g, "").toUpperCase()
                                                        : "MB"
                                                }
                                                className="w-1/2 px-3 py-2 border rounded-r-md bg-black text-gray-300"
                                                required={!isUnlimited}
                                            >
                                                <option value="MB">MB</option>
                                                <option value="GB">GB</option>
                                                <option value="TB">TB</option>
                                            </select>
                                        </div>

                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Package Visibility</label>
                                    <select
                                        name="packagestatus"
                                        value={packagestatus}
                                        onChange={(e) => setPackageStatus(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                        required
                                    >
                                        <option value="live">Visible to Users</option>
                                        <option value="hidden">Hidden</option>
                                    </select>
                                </div>

                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    disabled={isAdding}
                                >
                                    {isAdding ? "Adding..." : currentPackage ? "Update Package" : "Add Package"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )
            }
        </div >
    );
}