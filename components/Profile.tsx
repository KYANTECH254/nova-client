"use client";

import { useAdminAuth } from "@/contexts/AdminSessionProvider";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Profile() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { token, adminUser } = useAdminAuth();

    useEffect(() => {
        if (!adminUser) return;
        setRole(adminUser?.role)
        setEmail(adminUser?.email)
        setName(adminUser?.name)
        setPhone(adminUser?.phone)
    }, [adminUser])

    const handleSubmit = async () => {
        setIsLoading(true)
        if (!name || !email || !phone || !role) {
            setIsLoading(false)
            return toast.error("Missing fields required!")
        }

        try {
            const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/req/updateProfile`;
            const method = "POST";
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, name, phone })
            });
            const res = await response.json();
            if (res.success) {
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.log('Error updating name:', error);
            toast.error("An error occurred!");
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <>
            <div className="p-6 max-w-4xl mx-auto mt-14">
                <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

                <form className="space-y-6">
                    <div className="bg-gray-900 rounded-lg shadow p-6">
                        <h2 className="text-lg text-gray-200 font-semibold mb-4 border-b pb-2">My Profile Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter Name"
                                    className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2 mt-3">
                            <label className="block text-sm font-medium text-gray-300">Email</label>
                            <div className="relative flex items-center">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    readOnly
                                    className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2 mt-3">
                            <label className="block text-sm font-medium text-gray-300">Phone</label>
                            <div className="relative flex items-center">
                                <input
                                    type="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2 mt-3">
                            <label className="block text-sm font-medium text-gray-300">Role</label>
                            <h3 className="text-green-500 text-lg capitalize">{role}</h3>
                        </div>
                        <div
                            onClick={handleSubmit}
                            className="flex justify-start mt-3">
                            <button
                                type="button"
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {isLoading ? "Updating..." : "Update"}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </>
    )
}