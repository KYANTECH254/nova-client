"use client"

import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

export default function Files() {
    return (
        <>
            <div className="p-6 max-w-4xl mx-auto mt-14">
                <h1 className="text-2xl font-bold mb-6">Files</h1>
                <form className="space-y-6">
                    {/* Platform Section */}
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-md w-full">
                        <h2 className="text-lg text-gray-200 font-semibold mb-4 border-b pb-2">Hotspot folder
                            <p className="text-xs font-semibold text-green-600 italic p-1 bg-black/30 rounded-md">Configure WiFi DNS and Hotspot server profile to use hotspot folder. Update your login.html with the file below.</p>
                        </h2>
                        <CodeBlock code={`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
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
            window.location.href = "${window.location.origin}/login";
        }
    }
</script>

</body>
</html>`} fileName="login.html" />
                    </div>
                </form>
            </div>
        </>
    )
}

export function CodeBlock({ code, fileName = "code.html" }: { code: string; fileName?: string }) {
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
        <div className="relative bg-black border border-green-300 rounded-md overflow-hidden">
            {/* Header with file name and buttons */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-green-300">
                <span className="text-sm text-green-400 font-mono">{fileName}</span>
                <div className="flex items-center space-x-2">
                    <Download
                        size={18}
                        className="text-green-300 cursor-pointer hover:text-white"
                        onClick={handleDownload}
                    />
                    <Copy
                        size={18}
                        className="text-green-300 cursor-pointer hover:text-white"
                        onClick={() => {
                            navigator.clipboard.writeText(code);
                            toast.success("Code copied to clipboard");
                        }}
                    />
                </div>
            </div>

            {/* Left-aligned code block */}
            <pre className="overflow-x-auto text-sm text-gray-200 font-mono whitespace-pre m-0">
                <code className="block px-4 py-3">{code}</code>
            </pre>
        </div>
    );
}