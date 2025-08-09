"use client";

import { cache, useEffect, useState } from "react";
import Table from "./Table";
import { Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/AdminSessionProvider";

export type DDNS = {
    id: string;
    url: string;
    publicIP: string;
    platformID?: string;
    isActive?: boolean;
    createAt?: Date;
    updatedAt?: Date;
};

export default function DDNS() {
    const [ddns, setddns] = useState<DDNS[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedDDNS, setSelectedDDNS] = useState<any>();
    const [url, seturl] = useState("")
    const [publicIP, setpublicIP] = useState("")
    const { token } = useAdminAuth();

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
                    console.log(ddnsData);

                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error fetching ddns:", error);
                toast.error("Failed to fetch ddns");
            }
        });
        fetchddns();
    }, []);

    const filteredDDNS = ddns.reverse()

    const handleDelete = async (selectedddns: DDNS) => {
        setIsDeleting(true);
        try {
            setddns(prev => prev.filter(pkg => pkg.url !== selectedddns.url));
            const ddnsData = {
                id: selectedddns?.id || "",
                url: selectedddns?.url || url,
                publicIP: selectedddns?.publicIP || publicIP,
            };
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/deletemyddns`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: token, ddnsData: ddnsData }),
            });
            const res = await response.json();
            if (res.success) {
                toast.success(res.message);
            } else if (!res.success) {
                toast.error(res.message);
            }
        } catch (error) {
            console.log("Error deleting ddns:", error);
            toast.error("Failed to delete ddns");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteSelectedDDNs = async (selected: DDNS[]) => {
        if (!selected.length) return;
        setIsDeleting(true);
        try {
            setddns((prev) =>
                prev.filter((mod) => !selected.some((sel) => sel.id === mod.id))
            );
            const deleteRequests = selected.map((mod) =>
                fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/deletemyddns`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token,
                        id: mod.id,
                        url: mod?.url || url,
                        publicIP: mod?.publicIP || publicIP,
                    }),
                })
            );

            const results = await Promise.all(deleteRequests);
            const jsonResults = await Promise.all(results.map((r) => r.json()));

            const failed = jsonResults.filter((res) => !res.success);
            if (failed.length > 0) {
                toast.error(
                    `Failed to delete ${failed.length} ddns(s). Some deletions may have succeeded.`
                );
            } else {
                toast.success(`${selected.length} ddns(s) deleted.`);
            }
        } catch (err) {
            console.error(err);
            toast.error("Error deleting ddns.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (pkg: DDNS) => {
        const matchingddns = filteredDDNS.find(ddns => ddns.url === pkg.url);
        setSelectedDDNS(matchingddns || "");
        seturl(matchingddns?.url || "");
        setpublicIP(matchingddns?.publicIP || "");
        setShowModal(true);
    };

    const handleAddDDNS = () => {
        setSelectedDDNS("");
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        !selectedDDNS && setIsAdding(true);
        e.preventDefault();
        const ddnsData = {
            id: selectedDDNS?.id || "",
            url: url,
            publicIP: publicIP,
        };
        try {
            const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/req/updatemyddns`;
            const method = "POST";
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: token, ddnsData: ddnsData }),
            });
            const res = await response.json();
            if (res.success) {
                toast.success(res.message);
                selectedDDNS && setddns(prev => prev.filter(pkg => pkg.url !== selectedDDNS?.url));
                setddns(prev => [...prev, ddnsData]);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.log("Error submitting ddns:", error);
            toast.error("Failed to submit ddns");
        }
        setShowModal(false);
    };

    const columns = [
        {
            header: "DDNS Url",
            accessor: "url",
        },
        {
            header: "Public IP",
            accessor: "publicIP",
        },
        {
            header: "DNS Status",
            accessor: "isActive",
            render: (value: boolean | string) => {
                let statusText = "";
                let badgeClass = "";

                if (value === true) {
                    statusText = "Active";
                    badgeClass = "bg-green-900/20 text-green-800";
                } else if (value === false) {
                    statusText = "Inactive";
                    badgeClass = "bg-yellow-900/20 text-yellow-800";
                } else {
                    statusText = String(value).charAt(0).toUpperCase() + String(value).slice(1);
                    badgeClass = "bg-red-900/20 text-red-800";
                }

                return (
                    <span className={`px-2 py-1 rounded-full text-xs ${badgeClass}`}>
                        {statusText}
                    </span>
                );
            },
        },
        {
            header: "Actions",
            accessor: "id",
            render: (value: string, row: DDNS) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="Edit ddns"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete ddns"
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
                data={filteredDDNS}
                columns={columns}
                handleAddDDNS={handleAddDDNS}
                title="DDNS Urls"
                showSearch={true}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                onDeleteSelected={handleDeleteSelectedDDNs}
            />

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="flex flex-col bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-2xl p-6 w-full max-w-md max-h-full overflow-y-auto space-y-6">
                        <h2 className="text-xl font-bold mb-4">
                            {selectedDDNS ? "Edit DDNS" : "Add New DDNS"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">DDNS Url</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            name="url"
                                            value={
                                                url
                                                    ? url.replace(`.${window.location.origin.replace(/^https?:\/\//, "")}`, "")
                                                    : selectedDDNS?.url
                                                        ? selectedDDNS.url.replace(`.${window.location.origin.replace(/^https?:\/\//, "")}`, "")
                                                        : ""
                                            }
                                            onChange={(e) => {
                                                const rawValue = e.target.value.toLowerCase();
                                                const sanitized = rawValue.replace(/[^a-z]/g, "");
                                                seturl(`${sanitized}.${window.location.origin.replace(/^https?:\/\//, '')}`);
                                            }}
                                            className="w-full min-w-50 px-3 py-2 border rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-300 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                            placeholder="Enter preferred DDNS url"
                                        />
                                        <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            .{typeof window !== "undefined" ? window.location.origin.replace(/^https?:\/\//, '') : "example.com"}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Public IP Host (Use{" "}
                                        <a target="_blank" rel="noopener noreferrer" className="text-blue-600 underline" href="https://whatismyipaddress.com/">
                                            WhatIsMyIp
                                        </a>{" "}
                                        or check on WinBox IP/Cloud)
                                    </label>
                                    <input
                                        type="text"
                                        name="publicIP"
                                        value={publicIP}
                                        onChange={(e) => setpublicIP(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-300 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                        placeholder="Enter Public IP"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    disabled={isAdding}
                                >
                                    {isAdding ? "Adding..." : selectedDDNS ? "Update DDNS" : "Add DDNS"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}