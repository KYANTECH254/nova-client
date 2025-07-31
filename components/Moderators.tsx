"use client";

import { cache, useEffect, useState } from "react";
import Table from "./Table";
import { Trash2, Edit, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/AdminSessionProvider";

type Admin = {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: "admin" | "superuser";
    password: string;
    adminID: string;
    platformID: string;
    createdAt?: string;
    updatedAt?: string;
};

export default function Moderators() {
    const [moderators, setModerators] = useState<Admin[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentModerator, setCurrentModerator] = useState<Admin | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
    const { adminUser, token } = useAdminAuth();

    useEffect(() => {
        const fetchModerators = cache(async () => {
            const data = {
                token
            }
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/fetchModerators`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data)
                });
                const res = await response.json();
                if (res.success) {
                    setModerators(res.moderators)
                } else if (!res.success) {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error fetching Moderators:", error);
                toast.error("Failed to fetch Moderators");
            }
        })
        fetchModerators();
    }, [])

    const filteredModerators = moderators.filter((mod) =>
        [mod.name, mod.email, mod.phone, mod.role].some(
            (value) =>
                value &&
                value.toString().toLowerCase().includes(searchValue.toLowerCase())
        )
    )
        .reverse()

    const generateRandomPassword = () => {
        setIsGeneratingPassword(true);
        setTimeout(() => {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
            let password = "";
            for (let i = 0; i < 12; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
            if (passwordInput) passwordInput.value = password;
            setIsGeneratingPassword(false);
            toast.success("Password generated");
        }, 500);
    };

    const handleDelete = async (moderatorId: string) => {
        setIsDeleting(true);
        try {
            setModerators(prev => prev.filter(mod => mod.id !== moderatorId));
            const data = {
                token,
                id: moderatorId
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req//deleteModerator`, {
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
            console.log("Error deleting moderator:", error);
            toast.error("Failed to delete moderator");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteSelectedModerators = async (selected: Admin[]) => {
        if (!selected.length) return;
        setIsDeleting(true);
        try {
            setModerators((prev) =>
                prev.filter((mod) => !selected.some((sel) => sel.id === mod.id))
            );
            const deleteRequests = selected.map((mod) =>
                fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/deleteModerator`, {
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
                    `Failed to delete ${failed.length} moderator(s). Some deletions may have succeeded.`
                );
            } else {
                toast.success(`${selected.length} moderator(s) deleted.`);
            }
        } catch (err) {
            console.error(err);
            toast.error("Error deleting moderators.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (mod: Admin) => {
        setCurrentModerator(mod);
        setShowPassword(false);
        setShowModal(true);
    };

    const handleAdd = () => {
        setCurrentModerator(null);
        setShowPassword(false);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        setIsAdding(true)
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);

        const moderatorData = {
            token,
            id: currentModerator?.id || "",
            adminID: adminUser?.adminID,
            platformID: adminUser?.platformID,
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string || "",
            role: formData.get("role") as "admin" | "superuser",
            password: formData.get("password") as string || currentModerator?.password || "",
        };

        try {
            const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/req/${currentModerator ? "updateModerator" : "addModerator"}`;
            const method = "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(moderatorData),
            });

            const res = await response.json();

            if (res.success) {
                toast.success(res.message);
                currentModerator && setModerators(prev => prev.filter(moderator => moderator.id !== moderatorData.id));
                setModerators(prev => [...prev, moderatorData]);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.log("Error submitting moderator:", error);
            toast.error("Failed to submit moderator");
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
            header: "Email",
            accessor: "email",
        },
        {
            header: "Phone",
            accessor: "phone",
        },
        {
            header: "Role",
            accessor: "role",
            render: (value: string) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs ${value === "superuser"
                        ? "bg-purple-900/20 text-purple-800"
                        : "bg-blue-900/20 text-blue-800"
                        }`}
                >
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
            ),
        },
        {
            header: "Created At",
            accessor: "createdAt",
            render: (value: string) => new Date(value).toLocaleString(),
        },
        {
            header: "Actions",
            accessor: "id",
            render: (value: string, row: Admin) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="Edit moderator"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(value)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete moderator"
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
                data={filteredModerators}
                columns={columns}
                title="Moderators"
                showSearch={true}
                searchValue={searchValue}
                onAdd={handleAdd}
                onSearchChange={setSearchValue}
                onDeleteSelected={handleDeleteSelectedModerators}
            />

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="flex flex-col bg-gray-900 border border-gray-700 text-gray-100 rounded-lg shadow-2xl p-6 w-full max-w-md max-h-full overflow-y-auto space-y-6">
                        <h2 className="text-xl font-bold mb-4">
                            {currentModerator ? "Edit Moderator" : "Add New Moderator"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={currentModerator?.name || ""}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        defaultValue={currentModerator?.email || ""}
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
                                            defaultValue={currentModerator ? "" : ""}
                                            placeholder={currentModerator ? "Leave blank to keep current" : ""}
                                            className="w-full px-3 py-2 border rounded-md bg-black text-white pr-10"
                                            required={!currentModerator}
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
                                        defaultValue={currentModerator?.phone || ""}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Role</label>
                                    <select
                                        name="role"
                                        defaultValue={currentModerator?.role || "admin"}
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
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    disabled={isAdding}
                                >
                                    {isAdding ? "Adding..." : currentModerator ? "Update Moderator" : "Add Moderator"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}