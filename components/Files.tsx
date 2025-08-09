"use client";

import { Copy, Download } from "lucide-react";
import { cache, useEffect, useState } from "react";
import { toast } from "sonner";
import { Station } from "./Stations";
import { useAdminAuth } from "@/contexts/AdminSessionProvider";
import { getTimeAgo, hashInternalIP } from "@/utils/FUnstions";

export default function Files() {
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [hash, setHash] = useState("");
    const [backup, setBackUp] = useState<any>([]);
    const [selectedbackup, setselectedBackUp] = useState<any>();
    const [stations, setStations] = useState<Station[]>([]);
    const [tab, setTab] = useState("hotspot");
    const { token } = useAdminAuth();

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/fetchStations`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                });

                const res = await response.json();
                if (res.success) {
                    setStations(res.stations);
                    if (res.stations.length > 0) {
                        setSelectedStation(res.stations[0]);
                    }
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.error("Error fetching Stations:", error);
            }
        };

        fetchStations();
    }, [token]);

    useEffect(() => {
        const fetchBackup = cache(async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/fetchBackUp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });
                const res = await response.json();
                if (res.success) {
                    const backup = res.backup;
                    setBackUp(backup);
                }
            } catch (error) {
                console.error("Error fetching backup file:", error);
            }
        });

        fetchBackup();
    }, []);

    useEffect(() => {
        if (selectedStation?.mikrotikHost) {
            try {
                const hashed = hashInternalIP(selectedStation.mikrotikHost);
                setHash(hashed);
            } catch (err) {
                console.log("Failed to hash internal IP:", err);
                setHash("");
            }
        }
    }, [selectedStation]);

    useEffect(() => {
        if (!selectedStation || !backup?.length) return;

        const latestBackup = backup.find((b: any) => b.host === selectedStation.mikrotikHost);

        setselectedBackUp(latestBackup || null);
    }, [selectedStation, backup]);

    return (
        <div className="p-6 max-w-4xl mx-auto mt-14">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Files</h1>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setTab("hotspot")}
                    className={`px-4 py-2 rounded-md ${
                        tab === "hotspot"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                >
                    Hotspot Folder
                </button>
                <button
                    onClick={() => setTab("backup")}
                    className={`px-4 py-2 rounded-md ${
                        tab === "backup"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                >
                    Cloud Backup
                </button>
            </div>

            <form className="space-y-6">
                {tab === "backup" && (
                    <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-md w-full">
                        <h2 className="text-lg font-semibold mb-4 border-b border-gray-300 dark:border-gray-700 pb-2 text-gray-900 dark:text-gray-200">
                            Latest Backup
                            <p className="text-xs font-semibold italic p-1 bg-green-100 dark:bg-black/30 rounded-md text-green-700 dark:text-green-400">
                                Cloud backup runs automatically every 5 minutes. Latest configuration snapshot is available below.
                            </p>
                        </h2>

                        <div className="mb-4">
                            <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-300">
                                Select Station / Router
                            </h4>
                            <div className="flex gap-4 flex-wrap">
                                {stations.map((station) => (
                                    <button
                                        key={station.id}
                                        type="button"
                                        onClick={() => setSelectedStation(station)}
                                        className={`px-4 py-2 rounded-md ${
                                            selectedStation?.id === station.id
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                        }`}
                                    >
                                        {station.name || "Unnamed Station"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedbackup ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-green-600 dark:text-green-400 font-mono">{selectedbackup.filename}</span>
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_SERVER_URL}/req/backups/remote-hosts/${selectedbackup.host}/${selectedbackup.filename}?token=${token}`}
                                        download
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Download
                                    </a>
                                </div>
                                {selectedbackup.createdAt && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                                        Updated {getTimeAgo(selectedbackup.updatedAt)}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-red-600 dark:text-red-500">No backup found for this station.</p>
                        )}
                    </div>
                )}

                {tab === "hotspot" && (
                    <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-md w-full">
                        <h2 className="text-lg font-semibold mb-4 border-b border-gray-300 dark:border-gray-700 pb-2 text-gray-900 dark:text-gray-200">
                            Hotspot folder
                            <p className="text-xs font-semibold italic p-1 bg-green-100 dark:bg-black/30 rounded-md text-green-700 dark:text-green-400">
                                Configure WiFi DNS and Hotspot server profile to use hotspot folder. Update your login.html with the file below.
                            </p>
                        </h2>

                        <div className="mb-4">
                            <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-300">
                                Select Station / Router
                            </h4>
                            <div className="flex gap-4 flex-wrap">
                                {stations.map((station) => (
                                    <button
                                        key={station.id}
                                        type="button"
                                        onClick={() => setSelectedStation(station)}
                                        className={`px-4 py-2 rounded-md ${
                                            selectedStation?.id === station.id
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                        }`}
                                    >
                                        {station.name || "Unnamed Station"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <CodeBlock
                            code={`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
   "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta http-equiv="pragma" content="no-cache" />
<meta http-equiv="expires" content="-1" />
<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;"/>
<title>Logging in...</title>
</head>

<body onload="autoLogin()">
<script type="text/javascript" src="/md5.js"></script>
<script type="text/javascript">
    function autoLogin() {
        const urlParams = new URLSearchParams(window.location.search);
        const username = urlParams.get('username');
        const password = urlParams.get('password');

        if (username && password) {
            const form = document.createElement('form');
            form.action = "$(link-login-only)";
            form.method = 'post';

            const inputUsername = document.createElement('input');
            inputUsername.type = 'hidden';
            inputUsername.name = 'username';
            inputUsername.value = username;
            form.appendChild(inputUsername);

            const inputPassword = document.createElement('input');
            inputPassword.type = 'hidden';
            inputPassword.name = 'password';
            inputPassword.value = hexMD5('$(chap-id)' + password + '$(chap-challenge)');
            form.appendChild(inputPassword);

            const inputDst = document.createElement('input');
            inputDst.type = 'hidden';
            inputDst.name = 'dst';
            inputDst.value = "$(link-orig)";
            form.appendChild(inputDst);

            const inputPopup = document.createElement('input');
            inputPopup.type = 'hidden';
            inputPopup.name = 'popup';
            inputPopup.value = 'true';
            form.appendChild(inputPopup);

            document.body.appendChild(form);
            form.submit();
        } else {
            window.location.href = "${window.location.origin}/login?hash=${hash}";
        }
    }
</script>

</body>
</html>`}
                            fileName="login.html"
                        />
                    </div>
                )}
            </form>
        </div>
    );
}

export function CodeBlock({
    code,
    fileName = "code.html",
}: {
    code: string;
    fileName?: string;
}) {
    const handleDownload = () => {
        const blob = new Blob([code], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="relative bg-white dark:bg-black border border-green-300 rounded-md overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-green-100 dark:bg-zinc-900 border-b border-green-300">
                <span className="text-sm font-mono text-green-700 dark:text-green-400">{fileName}</span>
                <div className="flex items-center space-x-2">
                    <Download
                        size={18}
                        className="text-green-600 dark:text-green-300 cursor-pointer hover:text-green-900 dark:hover:text-white"
                        onClick={handleDownload}
                    />
                    <Copy
                        size={18}
                        className="text-green-600 dark:text-green-300 cursor-pointer hover:text-green-900 dark:hover:text-white"
                        onClick={() => {
                            navigator.clipboard.writeText(code);
                            toast.success("Code copied to clipboard");
                        }}
                    />
                </div>
            </div>
            <pre className="overflow-x-auto text-sm font-mono whitespace-pre m-0 text-gray-900 dark:text-gray-200 bg-white dark:bg-black px-4 py-3">
                <code className="block">{code}</code>
            </pre>
        </div>
    );
}
