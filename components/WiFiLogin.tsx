"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner"; 

export default function WiFiStatus() {
    const [status, setStatus] = useState<any>(null);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await fetch("/status", { credentials: "include" });
            const text = await response.text();

            // Extract status information from MikroTik's raw HTML response
            const ipMatch = text.match(/IP address:\s*([\d.]+)/);
            const bytesMatch = text.match(/bytes up\/down:\s*([\d.]+) \/ ([\d.]+)/);
            const uptimeMatch = text.match(/connected:\s*([\w:]+)/);
            const sessionTimeMatch = text.match(/left:\s*([\w:]+)/);
            const refreshMatch = text.match(/status refresh:\s*([\w:]+)/);

            const statusData = {
                ip: ipMatch ? ipMatch[1] : "Unknown",
                bytesIn: bytesMatch ? bytesMatch[1] : "0",
                bytesOut: bytesMatch ? bytesMatch[2] : "0",
                uptime: uptimeMatch ? uptimeMatch[1] : "Unknown",
                sessionTimeLeft: sessionTimeMatch ? sessionTimeMatch[1] : null,
                refreshTimeout: refreshMatch ? refreshMatch[1] : "Unknown",
                loggedIn: !!ipMatch
            };

            setStatus(statusData);
            setLoggedIn(statusData.loggedIn);
        } catch (error) {
            toast.error("Error fetching WiFi status");
            console.log("Error fetching WiFi status", error);
        }
    };

    const handleLogin = async () => {
        try {
            const credentialsResponse = await fetch("/req/code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: "YOUR_PHONE_NUMBER", platformID: "YOUR_PLATFORM_ID" }),
                credentials: "include"
            });
            if (!credentialsResponse.ok) {
                toast.error("Failed to fetch credentials");
            }
            const data = await credentialsResponse.json();
            if (data.type !== "success" || !data.foundcodes || data.foundcodes.length === 0) {
                toast.error("No codes found.");
            }
            const { username, password } = data.foundcodes[0]; 
            const loginResponse = await fetch(`/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
                method: "POST",
                credentials: "include"
            });
            if (!loginResponse.ok) {
                toast.error("Login failed");
            }
            toast.success("Logged in successfully");
            fetchStatus();
        } catch (error) {
            toast.error('An error occured');
            console.log("Login failed", error);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch("/logout", { method: "POST", credentials: "include" });
            toast.success("Logged out successfully");
            fetchStatus();
        } catch (error) {
            toast.error("Logout failed");
            console.log("Logout failed", error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="p-6 border border-gray-700 rounded-xl bg-gray-800 w-80 text-center">
                <h2 className="text-xl font-bold mb-4">WiFi Status</h2>
                {status ? (
                    <>
                        <p><strong>IP Address:</strong> {status.ip}</p>
                        <p><strong>Data Usage:</strong> {status.bytesIn} / {status.bytesOut}</p>
                        <p><strong>Connected Time:</strong> {status.uptime}</p>
                        {status.sessionTimeLeft && <p><strong>Time Left:</strong> {status.sessionTimeLeft}</p>}
                        <p><strong>Status Refresh:</strong> {status.refreshTimeout}</p>
                        {loggedIn ? (
                            <button className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl w-full" onClick={handleLogout}>
                                Log Out
                            </button>
                        ) : (
                            <button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl w-full" onClick={handleLogin}>
                                Log In
                            </button>
                        )}
                    </>
                ) : (
                    <p className="text-gray-400">Loading...</p>
                )}
            </div>
        </div>
    );
}
