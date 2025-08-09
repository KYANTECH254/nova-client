"use client";

import { useAdminAuth } from "@/contexts/AdminSessionProvider";
import { usePlatform } from "@/contexts/PlatformProvider";
import { useReturnUrl } from "@/contexts/ReturnUrlProvider";
import { generatePlatformUrl, generatePlatformId, getCurrentAdminId } from "@/utils/FUnstions";
import { Eye, EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Login() {
    const router = useRouter();
    const [mode, setMode] = useState<"login" | "register" | "reset" | "update-password" | "check-email">("login");

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [platformName, setPlatformName] = useState("");
    const [subdomain, setSubdomain] = useState("");
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");

    const { login, isAuthenticated, isLoading } = useAdminAuth();
    const { platformData } = usePlatform();
    const { returnUrl, clearReturnUrl } = useReturnUrl();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            if (returnUrl) {
                window.location.href = `${window.location.origin}${returnUrl}`;
            } else {
                window.location.href = `${window.location.origin}/admin`;
            }
        }
    }, [isAuthenticated, isLoading]);

    useEffect(() => {
        setSubdomain(generatePlatformUrl(platformName));
    }, [platformName]);

    useEffect(() => {
        if (window.location.hostname === "demo.novawifi.online") {
            setPassword("12345678");
            setEmail("demo@novawifi.online");
        }
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const form = urlParams.get("form");
        const resetCode = urlParams.get("code");

        if (form === "update-password" && resetCode) {
            setMode("update-password");
            setCode(resetCode);
        }

        const action = urlParams.get("action");
        const tutorial = urlParams.get("tutorial");

        sessionStorage.setItem("action", action || "login");
        sessionStorage.setItem("tutorial", tutorial || "false");
    }, []);

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
                // if (res.domain !== window.location.origin.replace(/^https?:\/\//, '')) {
                //     toast.error(`Unauthorized! Go to https://${res.domain} to login.`);
                //     setTimeout(() => {
                //         window.location.href = `https://${res.domain}/admin/login`;
                //     }, 3000);
                //     return;
                // }
                login({ token: res.token, userData: res.user });
                toast.success("Login successful!");
                console.log(returnUrl);
                
                if (returnUrl && returnUrl !== "/") {
                    window.location.href = `${window.location.origin}${returnUrl}`;
                } else {
                    window.location.href = `${window.location.origin}/admin`;
                }
                clearReturnUrl()
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newPlatform = {
                name: platformName,
                url: `${subdomain}.novawifi.online`,
                platformID: generatePlatformId(),
                adminID: getCurrentAdminId(),
                email,
                password,
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/createAccount`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPlatform),
            });

            const res = await response.json();
            if (res.success) {
                toast.success(res.message);
                window.location.href = `https://${subdomain}.novawifi.online/admin/login?action=register&tutorial=true`;
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to create platform.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!password || !confirmPassword) return toast.error("Please fill all fields.");
        if (password !== confirmPassword) return toast.error("Passwords do not match.");

        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/updatePassword`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password, code }),
            });
            const res = await response.json();
            if (res.success) {
                toast.success("Password updated! Please login.");
                window.location.href = "/admin/login";
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error("Password update failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/resetPassword`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const res = await response.json();
            if (res.success) {
                toast.success(res.message);
                setMode("check-email");
                setMessage(res.message);
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error("Password reset failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isLogin = mode === "login";
    const isRegister = mode === "register";
    const isReset = mode === "reset";
    const isUpdatePassword = mode === "update-password";
    const isSendEmail = mode === "check-email";

    return (
        <div className="flex flex-col p-6 mt-14 justify-center items-center min-h-[90vh]">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-md w-full max-w-md mx-auto">

                {isRegister && (
                    <>
                        <div className="text-2xl font-bold mb-4 mt-2 text-white text-center">Create WiFi Platform</div>
                        <div className="mt-3 flex flex-col gap-2">
                            <label>Platform Name</label>
                            <input
                                required
                                type="text"
                                placeholder="My Platform"
                                value={platformName}
                                onChange={(e) => setPlatformName(e.target.value)}
                                className="w-full bg-black text-white pl-5 py-3 border border-gray-300 rounded-lg text-lg"
                            />
                        </div>
                        <div className="mt-5 flex flex-col gap-2">
                            <label>WiFi DNS</label>
                            <div className="flex items-center gap-2 overflow-x-auto">
                                <span className="text-gray-500">https://</span>
                                <input
                                    required
                                    placeholder="mywifidns"
                                    type="text"
                                    value={subdomain}
                                    onChange={(e) => setSubdomain(e.target.value)}
                                    className="flex-1 bg-black text-white px-1 py-1 border border-gray-300 rounded-lg text-lg"
                                />
                                <span className="text-gray-500">.novawifi.online</span>
                            </div>
                        </div>
                    </>
                )}

                <div className="text-2xl font-bold mb-4 mt-4 text-white text-center">
                    {isLogin && "Login to WiFi Portal"}
                    {isReset && "Reset Password"}
                    {isUpdatePassword && "Update Password"}
                    {isSendEmail && "Request sent!"}
                </div>

                {isSendEmail && (
                    <h1 className="text-green-500">{message}</h1>
                )}

                {!isUpdatePassword && !isSendEmail && (
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
                )}

                {isReset && (
                    <button
                        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-lg"
                        onClick={handleReset}
                        disabled={loading}
                    >
                        {loading ? "Sending Reset Email..." : "Send Reset Email"}
                    </button>
                )}

                {(isLogin || isRegister || isUpdatePassword) && (
                    <>
                        <div className="mt-5 flex flex-col gap-2">
                            <label>Password</label>
                            <div className="flex relative items-center">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[var(--background)] text-[var(--color-text)] pl-5 py-3 border border-gray-300 rounded-lg text-lg"
                                />
                                <div className="absolute right-4 cursor-pointer" onClick={() => setShowPassword(prev => !prev)}>
                                    {showPassword ? <Eye /> : <EyeClosed />}
                                </div>
                            </div>
                        </div>
                        {isUpdatePassword && (
                            <div className="mt-5 flex flex-col gap-2">
                                <label>Confirm Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-[var(--background)] text-[var(--color-text)] pl-5 py-3 border border-gray-300 rounded-lg text-lg"
                                />
                            </div>
                        )}
                    </>
                )}

                {!isReset && !isSendEmail && (
                    <button
                        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-lg"
                        onClick={
                            isRegister
                                ? handleRegister
                                : isUpdatePassword
                                    ? handleUpdatePassword
                                    : handleLogin
                        }
                        disabled={loading}
                    >
                        {loading
                            ? isRegister
                                ? "Creating..., Please wait!"
                                : isLogin
                                    ? "Logging in..."
                                    : isUpdatePassword
                                        ? "Updating..."
                                        : "Processing..."
                            : isRegister
                                ? "Create Platform"
                                : isLogin
                                    ? "Login"
                                    : isUpdatePassword
                                        ? "Update Password"
                                        : "Submit"}
                    </button>
                )}


                {/* Links */}
                {!isUpdatePassword && !isSendEmail && (
                    <div className="flex flex-col mt-3 w-full gap-2">
                        <div className="flex items-center gap-2">
                            <div className="text-xs text-white font-semibold">
                                {isRegister ? "Already have an account?" : "Don't have an account?"}
                            </div>
                            <button
                                className="text-sm text-blue-400 hover:underline"
                                onClick={() =>
                                    setMode((prev) =>
                                        prev === "register" ? "login" : "register"
                                    )
                                }
                            >
                                {isRegister ? "Back to Login" : "Create a new Platform"}
                            </button>
                        </div>

                        {isLogin && (
                            <div className="flex items-center gap-2">
                                <div className="text-xs text-white font-semibold">Forgot password?</div>
                                <button
                                    className="text-sm text-blue-400 hover:underline"
                                    onClick={() => setMode("reset")}
                                >
                                    Reset password
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
