"use client"

import { useAdminAuth } from "@/contexts/AdminSessionProvider";
import { useState } from "react";
import { toast } from "sonner";

export default function Funds() {
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const { adminUser, token } = useAdminAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/mpesa/withdraw`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    amount: Number(amount) 
                }),
            });
            const res = await response.json();
            if (res.success) {
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.log("Error updating settings:", error);
            toast.error("An error occurred!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto mt-14">
            <h1 className="text-2xl font-bold mb-6">Funds</h1>
            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Platform Section */}
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-md w-full">
                    <h2 className="text-lg text-gray-200 font-semibold mb-4 border-b pb-2">
                        Withdraw Funds
                        <p className="text-xs font-semibold text-green-600 italic p-1 bg-black/30 rounded-md">
                            Configure B2B payments on Settings Tab to use this section
                        </p>
                    </h2>
                    <h5 className="text-gray-200 font-semibold mb-4 border-b pb-2">
                        Maximum Amount: KSH 150,000, Minimum Amount: KSH 100
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Amount</label>
                            <input
                                required
                                type="number"
                                name="amount"
                                value={amount}
                                onChange={handleChange}
                                placeholder="Enter withdrawal amount"
                                className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-start mt-3 relative">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {isLoading ? "Sending request..." : "Withdraw"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
