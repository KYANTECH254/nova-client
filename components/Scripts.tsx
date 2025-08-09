"use client"

import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

export default function Scripts() {
    return (
        <>
            <div className="p-6 max-w-4xl mx-auto mt-14">
                <h1 className="text-2xl font-bold mb-6">Scripts</h1>
                <form className="space-y-6">
                    {/* Platform Section */}
                <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-md w-full">
                    <h2 className="text-lg font-semibold mb-4 border-b border-gray-300 dark:border-gray-700 pb-2 text-gray-900 dark:text-gray-200">
                        Public IP DDNS Update Script
                        <p className="text-xs font-semibold italic p-1 bg-green-100 dark:bg-black/30 rounded-md text-green-700 dark:text-green-400 mt-1">Configure this Script on Winbox on the Scripts section and add scheduler time for it to run.</p>
                        </h2>
                        <CodeBlock
                            fileName="ddnsupdatescript.txt"
                            code={`:local serverUrl "https://api.novawifi.online/req/updateddns"  # API Endpoint
:local subdomain "routerddnsname.${window.location.origin.replace(/^https?:\/\//, "")}" # Router DDNS Name get it from routers section

/tool fetch url="https://api.ipify.org" mode=http output=user as-value
:local newIP [:pick (\$user->"data") 0 [:len (\$user->"data")]]

:global lastIP

:if (\$newIP != \$lastIP) do={
    :set lastIP \$newIP

    # Send the request to API
    /tool fetch url="\$serverUrl" \\
        http-method=post \\
        http-header-field="Content-Type: application/json" \\
        http-data="{\\"subdomain\\":\\"\$subdomain\\",\\"publicIP\\":\\"\$newIP\\"}" \\
        output=none

    :log info "Updated DNS record for \$subdomain to IP \$newIP"
}`}
                        />
                    </div>
                </form>
            </div>
        </>
    )
}

export function CodeBlock({ code, fileName = "script.txt" }: { code: string; fileName?: string }) {
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
            {/* Header with file name and buttons */}
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

            {/* Left-aligned code block */}
              <pre className="overflow-x-auto text-sm font-mono whitespace-pre m-0 text-gray-900 dark:text-gray-200 bg-white dark:bg-black px-4 py-3">
                <code className="block">{code}</code>
            </pre>
        </div>
    );
}