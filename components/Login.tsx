"use client";

import { useAdminAuth } from "@/contexts/AdminSessionProvider";
import { generatePlatformUrl, generatePlatformId, getCurrentAdminId } from "@/utils/FUnstions";
import { Eye, EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Login() {
    const router = useRouter();
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showpassword, SetShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [platformName, setPlatformName] = useState("");
    const [subdomain, setSubdomain] = useState("");
    const [dns, setDns] = useState("novawifi.online");

    const { login, isAuthenticated, isLoading } = useAdminAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push("/admin");
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        setSubdomain(generatePlatformUrl(platformName))
    }, [platformName])

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/loginAdmin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const res = await response.json();
            if (res.success) {
                login({ token: res.token, userData: res.user });
                toast.success("Login successful!");
                router.push("/admin");
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        setLoading(true);
        e.preventDefault();
        try {
            const addData = {
                name: platformName,
                url: `${subdomain}.novawifi.online`,
                platformID: generatePlatformId(),
                adminID: getCurrentAdminId(),
                email: email,
                password: password
            };

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/createAccount`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(addData),
                });
                const res = await response.json();

                if (res.success) {
                    window.location.href = `https://${subdomain}.novawifi.online/admin/login`;
                    // login({ token: res.token, userData: res.user });
                    toast.success(res.message);
                } else if (!res.success) {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error adding platform:", error);
                toast.error("Failed to add platform");
            }
        } catch (error) {
            console.log("Error saving platform:", error);
            toast.error("Failed to save platform");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col p-6 mt-14 justify-center items-center min-h-screen">
            <div className="text-2xl font-bold mb-6 text-white">{isCreateMode ? "Create Platform" : "Login"}</div>

            <div className="bg-gray-900 rounded-xl border border-gray-800/30 p-5 min-w-[340px]">
                {isCreateMode && (
                    <>
                        <div className="mt-3 flex flex-col gap-2">
                            <label>Platform Name</label>
                            <input
                                type="text"
                                placeholder="My Platform"
                                value={platformName}
                                onChange={(e) => setPlatformName(e.target.value)}
                                className="w-full bg-[var(--background)] text-[var(--color-text)] pl-5 py-3 border border-gray-300 rounded-lg text-lg"
                            />
                        </div>
                        <div className="mt-5 flex flex-col gap-2">
                            <label>WiFi DNS</label>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">https://</span>
                                <input
                                    type="text"
                                    placeholder="mywifidns"
                                    value={subdomain}
                                    onChange={(e) => setSubdomain(e.target.value)}
                                    className="flex-1 bg-[var(--background)] text-[var(--color-text)] px-3 py-3 border border-gray-300 rounded-lg text-lg"
                                />
                                <span className="text-gray-500">.novawifi.online</span>
                            </div>
                        </div>
                    </>
                )}

                <div className="mt-5 flex flex-col gap-2">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[var(--background)] text-[var(--color-text)] pl-5 py-3 border border-gray-300 rounded-lg text-lg"
                    />
                </div>

                <div className="mt-5 flex flex-col gap-2">
                    <label>Password</label>
                    <div className="flex relative items-center">
                        <input
                            type={showpassword ? "text" : "password"}
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[var(--background)] text-[var(--color-text)] pl-5 py-3 border border-gray-300 rounded-lg text-lg"
                        />
                        <div className="absolute right-4 cursor-pointer" onClick={() => SetShowPassword((prev) => !prev)}>
                            {showpassword ? <Eye /> : <EyeClosed />}
                        </div>
                    </div>
                </div>

                <button
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-lg"
                    onClick={isCreateMode ? handleRegister : handleLogin}
                    disabled={loading}
                >
                    {loading ? (isCreateMode ? "Creating..." : "Logging in...") : isCreateMode ? "Create Platform" : "Login"}
                </button>

                <button
                    className="mt-3 w-full text-sm text-blue-400 hover:underline"
                    onClick={() => setIsCreateMode((prev) => !prev)}
                >
                    {isCreateMode ? "Back to Login" : "Create a new Platform"}
                </button>
            </div>
        </div>
    );
}