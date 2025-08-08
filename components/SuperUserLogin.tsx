"use client";

import { useManagerAuth } from "@/contexts/AdminSessionProvider";
import { Eye, EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SuperUserLogin() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showpassword, SetShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, isAuthenticated, isLoading } = useManagerAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push("/manager");
        }
    }, [isAuthenticated, isLoading, router]);

    const handleLogin = async () => {
        setLoading(true);
        const data = { email, password };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/loginManager`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const res = await response.json();
            if (res.success) {
                login({ token: res.token, userData: res.user });
                toast.success(res.message);
                router.push("/manager");
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.log("Login error:", error);
            toast.error("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col p-6 justify-center items-center min-h-screen">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-md w-full max-w-md mx-auto">
                <div className="mt-5 flex flex-col gap-2">
                    <label htmlFor="email">Email</label>
                    <input
                        required
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[var(--background)] text-[var(--color-text)] pl-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] outline-none transition text-lg shadow-md"
                    />
                </div>
                <div className="mt-5 flex flex-col gap-2">
                    <label htmlFor="password">Password</label>
                    <div className="flex flex-row relative items-center">
                        <input
                            required
                            type={showpassword ? "text" : "password"}
                            placeholder="Enter Password"
                            value={password}
                            maxLength={64}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[var(--background)] text-[var(--color-text)] pl-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] outline-none transition text-lg shadow-md"
                        />
                        <div className="absolute font-bold right-5 cursor-pointer" onClick={() => SetShowPassword((prev) => !prev)}>
                            {showpassword ? <Eye /> : <EyeClosed />}
                        </div>
                    </div>
                </div>
                <div className="mt-5 w-full">
                    <button
                        className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg text-lg"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </div>
            </div>
        </div>
    );
}
