"use client";

import { cache, useEffect, useState } from "react";
import Table from "./Table";
import { Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/AdminSessionProvider";

export type Pool = {
    id: string;
    name: string;
    ranges: string;
    comment: string;
};

export default function Pools() {
    const [pools, setPools] = useState<any[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedPool, setSelectedPool] = useState<any>();
    const [name, setName] = useState("")
    const [address, setAddress] = useState("")
    const [comment, setComment] = useState("")
    const [selectedStation, setSelectedStation] = useState<any>();
    const [selectedHost, setSelectedHost] = useState<any>();
    const [stations, setStations] = useState<any[]>([]);
    const { adminUser, token } = useAdminAuth();

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
    }, [])

    const handleStationChange = (stationId: string) => {
        const station = stations.find(s => s.id === stationId);
        if (station) {
            setSelectedStation(station);
            setSelectedHost(station.mikrotikHost);
            setName("");
            setSelectedPool("");
        }
    };

    const filteredPools = pools.reverse()

    const handleDelete = async (selectedpool: Pool) => {
        setIsDeleting(true);
        try {
            setPools(prev => prev.filter(pkg => pkg.name !== selectedpool.name));
            const poolData = {
                station: selectedHost || "",
                name: selectedpool?.name || name,
                ranges: selectedpool?.ranges || address,
                comment: selectedpool?.comment || comment
            };
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/mkt/deletePool`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: token, poolData: poolData }),
            });
            const res = await response.json();
            if (res.success) {
                toast.success(res.message);
            } else if (!res.success) {
                toast.error(res.message);
            }
        } catch (error) {
            console.log("Error deleting pool:", error);
            toast.error("Failed to delete pool");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteSelectedPools = async (selected: Pool[]) => {
        if (!selected.length) return;
        setIsDeleting(true);
        try {
            setPools((prev) =>
                prev.filter((mod) => !selected.some((sel) => sel.name === mod.name))
            );
            const deleteRequests = selected.map((mod) => {
                const poolData = {
                    station: selectedHost || "",
                    name: mod?.name || name,
                    ranges: mod?.ranges || address,
                    comment: mod?.comment || comment
                };

                return fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/mkt/deletePool`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token,
                        poolData
                    }),
                });
            });

            const results = await Promise.all(deleteRequests);
            const jsonResults = await Promise.all(results.map((r) => r.json()));

            const failed = jsonResults.filter((res) => !res.success);
            if (failed.length > 0) {
                toast.error(
                    `Failed to delete ${failed.length} pool(s). Some deletions may have succeeded.`
                );
            } else {
                toast.success(`${selected.length} pool(s) deleted.`);
            }
        } catch (err) {
            console.error(err);
            toast.error("Error deleting pools.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (pkg: Pool) => {
        const matchingPool = filteredPools.find(pool => pool.ranges === pkg.ranges);
        setSelectedPool(matchingPool || "");
        setShowModal(true);
    };

    const handleAddPool = () => {
        setSelectedPool("");
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        setIsAdding(true);
        e.preventDefault();
        const poolData = {
            station: selectedHost || "",
            name: selectedPool?.name || name,
            ranges: selectedPool?.ranges || address,
            comment: selectedPool?.comment || comment
        };

        try {
            const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/mkt/updatePool`;
            const method = "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: token, poolData: poolData }),
            });
            const res = await response.json();
            if (res.success) {
                toast.success(res.message);
                selectedPool && setPools(prev => prev.filter(pkg => pkg.name !== poolData.name));
                setPools(prev => [...prev, poolData]);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.log("Error submitting pool:", error);
            toast.error("Failed to submit pool");
        } finally {
            setIsAdding(false);
        }
        setShowModal(false);
    };

    const columns = [
        {
            header: "Pool Name",
            accessor: "name",
        },
        {
            header: "Addresses",
            accessor: "ranges",
        },
        {
            header: "Comment",
            accessor: "comment",
        },
        {
            header: "Actions",
            accessor: "id",
            render: (value: string, row: Pool) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="Edit pool"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete pool"
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
                data={filteredPools}
                columns={columns}
                handleAddPool={handleAddPool}
                title="Pools"
                showSearch={true}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                onDeleteSelected={handleDeleteSelectedPools}
            />

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="flex flex-col bg-gray-900 border border-gray-700 text-gray-100 rounded-lg shadow-2xl p-6 w-full max-w-md max-h-full overflow-y-auto space-y-6">
                        <h2 className="text-xl font-bold mb-4">
                            {selectedPool ? "Edit Pool" : "Add New Pool"}
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
                                    <label className="block text-sm font-medium mb-1">Pool Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={name || selectedPool?.name || ""}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Addresses (E.g 192.168.88.10-192.168.88.254)</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={address || selectedPool?.ranges || ""}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Comment</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={comment || selectedPool?.comment || ""}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                                    />
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
                                    {isAdding ? "Adding..." : selectedPool ? "Update Pool" : "Add Pool"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}