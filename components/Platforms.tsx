"use client";

import { cache, useEffect, useState } from "react";
import Table from "./Table";
import { Trash2, Edit, Plus, UserPlus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { generatePlatformUrl, generatePlatformId, getCurrentAdminId } from "@/utils/FUnstions";

type Platform = {
    id: string;
    name: string;
    url: string;
    platformID: string;
    adminID: string;
    createdAt: string;
    updatedAt: string;
};

type Admin = {
    id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "admin" | "superuser";
};

export default function Platforms() {
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [showPlatformModal, setShowPlatformModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [currentPlatform, setCurrentPlatform] = useState<Platform | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);

    useEffect(() => {
        const fetchPlatforms = cache(async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/fetchPlatforms`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const res = await response.json();
                if (res.success) {
                    setPlatforms(res.platforms)
                } else if (!res.success) {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error fetching platforms:", error);
                toast.error("Failed to fetch platforms");
            }
        })
        fetchPlatforms();
    }, [])

    const [newAdmin, setNewAdmin] = useState<Omit<Admin, "id">>({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "admin",
    });

    const filteredPlatforms = platforms.filter((platform) =>
        [platform.name, platform.url, platform.platformID, platform.adminID].some(
            (value) =>
                value &&
                value.toString().toLowerCase().includes(searchValue.toLowerCase())
        )
    );

    const generateRandomPassword = () => {
        setIsGeneratingPassword(true);
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewAdmin(prev => ({ ...prev, password }));
        setIsGeneratingPassword(false);
        toast.success("Password generated");
    };

    const handleDelete = async (platformId: string) => {
        setIsDeleting(true);
        try {
            setPlatforms(prev => prev.filter(platform => platform.id !== platformId));
            const data = {
                id: platformId
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/deletePlatform`, {
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
            console.log("Error deleting platform:", error);
            toast.error("Failed to delete platform");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (platform: Platform) => {
        setCurrentPlatform(platform);
        setShowPlatformModal(true);
    };

    const handleAddPlatform = () => {
        setCurrentPlatform(null);
        setShowPlatformModal(true);
    };

    const handleAddAdmin = (platform: Platform) => {
        setCurrentPlatform(platform);
        setNewAdmin({
            name: "",
            email: "",
            phone: "",
            password: "",
            role: "admin",
        });
        setShowAdminModal(true);
    };

    const handleSubmitPlatform = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget as HTMLFormElement);
            const name = formData.get("name") as string;

            const platformData = {
                id: currentPlatform?.id || Math.random().toString(36).substring(2, 9),
                name: name,
                url: currentPlatform?.url || generatePlatformUrl(name),
                platformID: currentPlatform?.platformID || generatePlatformId(),
                adminID: currentPlatform?.adminID || getCurrentAdminId(),
                createdAt: currentPlatform?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const adddata = {
                name: name,
                url: currentPlatform?.url || generatePlatformUrl(name),
                platformID: currentPlatform?.platformID || generatePlatformId(),
                adminID: currentPlatform?.adminID || getCurrentAdminId(),
            }

            if (currentPlatform) {
                setPlatforms(prev =>
                    prev.map(platform => (platform.id === currentPlatform.id ? platformData : platform))
                );
                toast.success("Platform updated successfully");
            } else {
                setPlatforms(prev => [...prev, platformData]);
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/addPlatform`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(adddata),
                    });
                    const res = await response.json();

                    if (res.success) {
                        toast.success(res.message);
                    } else if (!res.success) {
                        toast.error(res.message);
                    }
                } catch (error) {
                    console.log("Error adding platform:", error);
                    toast.error("Failed to add platform");
                }
            }

            setShowPlatformModal(false);
        } catch (error) {
            console.log("Error saving platform:", error);
            toast.error("Failed to save platform");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!currentPlatform) {
                toast.error("No platform selected for admin assignment.");
                return;
            }

            const adminData = {
                name: newAdmin.name,
                email: newAdmin.email,
                phone: newAdmin.phone,
                password: newAdmin.password,
                role: newAdmin.role,
                adminID: currentPlatform.adminID,
                platformID: currentPlatform.platformID,
            };
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/addModerator`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(adminData),
            });

            const res = await response.json();
            if (res.success) {
                toast.success(res.message);
                setShowAdminModal(false);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.log("Error adding admin:", error);
            toast.error("Failed to add admin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewAdmin(prev => ({ ...prev, [name]: value }));
    };

    const columns = [
        {
            header: "Name",
            accessor: "name",
        },
        {
            header: "URL",
            accessor: "url",
            render: (value: string) => (
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                >
                    {value}
                </a>
            ),
        },
        {
            header: "Platform ID",
            accessor: "platformID",
        },
        {
            header: "Admin ID",
            accessor: "adminID",
        },
        {
            header: "Created At",
            accessor: "createdAt",
            render: (value: string) => new Date(value).toLocaleString(),
        },
        {
            header: "Actions",
            accessor: "id",
            render: (value: string, row: Platform) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleAddAdmin(row)}
                        className="text-green-600 hover:text-green-800"
                        aria-label="Add admin"
                    >
                        <UserPlus size={18} />
                    </button>
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="Edit platform"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(value)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete platform"
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
                data={filteredPlatforms}
                columns={columns}
                title="Platforms"
                showSearch={true}
                searchValue={searchValue}
                onAddP={handleAddPlatform}
                onSearchChange={setSearchValue}
            />

            {/* Platform Add/Edit Modal */}
            {showPlatformModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="flex flex-col bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-md w-full max-w-md max-h-full overflow-y-auto space-y-6">
                        <h2 className="text-xl font-bold mb-4">
                            {currentPlatform ? "Edit Platform" : "Add New Platform"}
                        </h2>
                        <form onSubmit={handleSubmitPlatform}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Platform Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={currentPlatform?.name || ""}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-white"
                                        required
                                        placeholder="Enter platform name"
                                    />
                                </div>

                                {currentPlatform && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">URL</label>
                                            <div className="p-2 bg-black rounded-md">
                                                {currentPlatform.url}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Platform ID</label>
                                            <div className="p-2 bg-black rounded-md">
                                                {currentPlatform.platformID}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Admin ID</label>
                                            <div className="p-2 bg-black rounded-md">
                                                {currentPlatform.adminID}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowPlatformModal(false)}
                                    className="px-4 py-2 border rounded-md"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span>Processing...</span>
                                    ) : currentPlatform ? (
                                        "Update Platform"
                                    ) : (
                                        "Add Platform"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Admin Modal */}
            {showAdminModal && currentPlatform && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            Add Admin to {currentPlatform.name}
                        </h2>
                        <form onSubmit={handleSubmitAdmin}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newAdmin.name}
                                        onChange={handleAdminChange}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={newAdmin.email}
                                        onChange={handleAdminChange}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={newAdmin.password}
                                            onChange={handleAdminChange}
                                            className="w-full px-3 py-2 border rounded-md bg-black text-white pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={generateRandomPassword}
                                        disabled={isGeneratingPassword}
                                        className="mt-2 text-sm hover:text-blue-800 text-blue-400 disabled:opacity-50"
                                    >
                                        {isGeneratingPassword ? "Generating..." : "Generate Random Password"}
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={newAdmin.phone}
                                        onChange={handleAdminChange}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Role</label>
                                    <select
                                        name="role"
                                        value={newAdmin.role}
                                        onChange={handleAdminChange}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-white"
                                        required
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="superuser">Superuser</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminModal(false)}
                                    className="px-4 py-2 border rounded-md"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Adding..." : "Add Admin"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}