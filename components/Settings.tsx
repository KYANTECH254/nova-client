"use client";

import { useAdminAuth } from "@/contexts/AdminSessionProvider";
import { Copy, Eye, EyeClosed, Info } from "lucide-react";
import { cache, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Settings() {
    const [name, setName] = useState("");
    const [platurl, setplaturl] = useState("");
    const [platid, setplatid] = useState("");
    const [settings, setSettings] = useState({
        mpesaConsumerKey: "",
        mpesaConsumerSecret: "",
        mpesaShortCode: "",
        mpesaShortCodeType: "Phone",
        mpesaPassKey: "",
        adminID: "",
        IsC2B: true,
        IsB2B: false,
        IsAPI: false,
        mpesaAccountNumber: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showModal, setshowModal] = useState(false);
    const [isChangingName, setIsChangingName] = useState(false);
    const [showconsumer, setShowConsumer] = useState(false);
    const [showpasskey, setShowpasskey] = useState(false);
    const { adminUser, token, logout } = useAdminAuth();

    useEffect(() => {
        const fetchsettings = async () => {
            const data = {
                token
            }
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/fetchSettings`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data)
                });
                const res = await response.json();
                if (res.success) {
                    if (res.settings) {
                        setSettings(prev => ({
                            ...prev,
                            ...res.settings,
                            mpesaConsumerKey: res.settings.mpesaConsumerKey || "",
                            mpesaConsumerSecret: res.settings.mpesaConsumerSecret || "",
                            mpesaShortCode: res.settings.mpesaShortCode || "",
                            mpesaShortCodeType: res.settings.mpesaShortCodeType || "Phone",
                            mpesaPassKey: res.settings.mpesaPassKey || "",
                            mpesaAccountNumber: res.settings.mpesaAccountNumber || "",
                            IsC2B: res.settings.IsC2B !== undefined ? res.settings.IsC2B : true,
                            IsAPI: res.settings.IsAPI || false,
                            IsB2B: res.settings.IsB2B || false
                        }));
                    }
                    setName(res.name);
                    setplaturl(res.url);
                    setplatid(res.platform_id);
                    console.log(res.platform_id);

                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error fetching settings:", error);
                toast.error("Failed to fetch settings");
            }
        }
        fetchsettings();
    }, [adminUser]);

    const handleToggle = (type: "C2B" | "B2B" | "API") => {
        setSettings(prev => ({
            ...prev,
            IsC2B: type === "C2B",
            IsB2B: type === "B2B",
            IsAPI: type === "API"
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "name") {
            setName(value);
        }
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = {
                settings
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/updateSettings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, data: settings }),
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

    const handleSubmitName = async () => {
        setIsChangingName(true);
        const purl = generatePlatformUrl(name);
        try {
            const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/req/updateName`;
            const method = "POST";
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, url: `${purl}.novawifi.online`, name })
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
            setIsChangingName(false);
        }
    };

    const generatePlatformUrl = (name: string) => {
        return `${name.toLowerCase().replace(/\s+/g, '-')}`;
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        if (!platid) {
            setIsDeleting(false);
            setshowModal(false)
            return toast.error("Missing Platform information!")
        }
        try {
            const data = {
                id: platid,
                token
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/deletePlatform`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const res = await response.json();

            if (res.success) {
                toast.success(res.message);
                logout()
                window.location.href = "https://novawifi.online"
            } else if (!res.success) {
                toast.error(res.message);
            }

        } catch (error) {
            console.log("Error deleting platform:", error);
            toast.error("Failed to delete platform");
        } finally {
            setIsDeleting(false);
            setshowModal(false)
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto mt-14">
            <h1 className="text-2xl font-bold mb-6">Platform Settings</h1>

            <form className="space-y-6">
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-md w-full">
                    <h2 className="text-lg text-gray-200 font-semibold mb-4 border-b pb-2">Platform Configuration <p className="text-xs font-semibold text-green-600 italic p-1 bg-black/30 rounded-md">Configure platform name & WiFi DNS</p></h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Platform Name</label>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                onChange={handleChange}
                                placeholder="Enter Platform Name"
                                className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="space-y-2 md:col-span-2 mt-3">
                        <label className="block text-sm font-medium text-gray-300">Live Platform URL (WiFi DNS)</label>
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={`${platurl}`}
                                readOnly
                                className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            <div className="absolute right-3 cursor-pointer">
                                <Copy
                                    size={20}
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${platurl}`);
                                        toast.success("Copied to clipboard");
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 md:col-span-2 mt-3">
                        <label className="block text-sm font-medium text-gray-300">Live Admin Portal URL</label>
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={`${platurl}/admin`}
                                readOnly
                                className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            <div className="absolute right-3 cursor-pointer">
                                <Copy
                                    size={20}
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${platurl}/admin`);
                                        toast.success("Copied to clipboard");
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div
                        onClick={handleSubmitName}
                        className="flex justify-start mt-3">
                        <button
                            type="button"
                            disabled={isChangingName}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {isChangingName ? "Updating..." : "Update Platform"}
                        </button>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-md w-full">
                    <h2 className="text-lg text-gray-200 font-semibold mb-4 border-b pb-2">MPESA Configuration <p className="text-xs font-semibold text-green-600 italic p-1 bg-black/30 rounded-md">Configure how you receive payments from customers</p></h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">MPESA Type</label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => handleToggle("C2B")}
                                className={`px-4 py-2 rounded-md ${settings.IsC2B ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                            >
                                Mpesa C2B
                            </button>
                            <button
                                type="button"
                                onClick={() => handleToggle("B2B")}
                                className={`px-4 py-2 rounded-md ${settings.IsB2B ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                            >
                                Mpesa B2B
                            </button>
                            <button
                                type="button"
                                onClick={() => handleToggle("API")}
                                className={`px-4 py-2 rounded-md ${settings.IsAPI ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                            >
                                Mpesa API
                            </button>
                        </div>
                    </div>

                    <h3 className="text-sm text-green-500 font-semibold mb-2 flex flex-row items-center gap-1">
                        <Info size={14} />
                        {settings.IsB2B && ("Your Clients Pay directly to us then we Pay you.")}
                        {settings.IsC2B && ("Receive funds directly from your clients.")}
                        {settings.IsAPI && ("Receive funds directly from your clients. Get your API Keys from MPESA Portal.")}
                    </h3>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {settings.IsB2B && (
                            <>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Short Code / Phone Number</label>
                                    <input
                                        type="text"
                                        name="mpesaShortCode"
                                        value={settings.mpesaShortCode || ""}
                                        onChange={handleChange}
                                        placeholder="Enter MPESA Short Code"
                                        className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Short Code Type</label>
                                    <select
                                        name="mpesaShortCodeType"
                                        value={settings.mpesaShortCodeType || "Till"}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm"
                                    >
                                        <option value="Paybill">Paybill</option>
                                        <option value="Till">Till</option>
                                        <option value="Phone">Phone Number</option>
                                    </select>
                                </div>

                                {settings.mpesaShortCodeType === "Paybill" && (
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-300">Account No (Leave Blank to use customer's phone number as account no.)</label>
                                        <input
                                            type="text"
                                            name="mpesaAccountNumber"
                                            value={settings.mpesaAccountNumber || ""}
                                            onChange={handleChange}
                                            placeholder="Enter MPESA Account No"
                                            className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm"
                                        />
                                    </div>
                                )}
                            </>
                        )}{/* Form Section */}
                        {settings.IsC2B && (
                            <div className="relative">

                                <>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">Short Code</label>
                                        <input
                                            type="text"
                                            name="mpesaShortCode"
                                            value={settings.mpesaShortCode || ""}
                                            onChange={handleChange}
                                            placeholder="Enter MPESA Short Code"
                                            className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-2 mt-4">
                                        <label className="block text-sm font-medium text-gray-300">Short Code Type</label>
                                        <select
                                            name="mpesaShortCodeType"
                                            value={settings.mpesaShortCodeType || "Phone"}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="Phone">Phone Number</option>
                                            <option value="Paybill">Paybill</option>
                                            <option value="Till">Till</option>
                                        </select>
                                    </div>

                                    {/* Blur Overlay */}
                                    <div className="absolute inset-0 bg-black/50 bg-opacity-60 backdrop-blur-md flex items-center justify-center rounded-md z-10">
                                        <p className="text-white text-lg font-semibold text-center">C2B is Under Maintenance</p>
                                    </div>
                                </>

                            </div>
                        )}
                        {settings.IsAPI && (
                            <>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Consumer Key</label>
                                    <input
                                        type="text"
                                        name="mpesaConsumerKey"
                                        value={settings.mpesaConsumerKey || ""}
                                        onChange={handleChange}
                                        placeholder="Enter MPESA Consumer Key"
                                        className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Consumer Secret</label>
                                    <div className="relative flex items-center flex-row">
                                        <input
                                            type={showconsumer ? "text" : "password"}
                                            name="mpesaConsumerSecret"
                                            value={settings.mpesaConsumerSecret || ""}
                                            onChange={handleChange}
                                            placeholder="Enter MPESA Consumer Secret"
                                            className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm"
                                        />
                                        <div className="absolute fontbold right-5 text-gray-300 cursor-pointer" onClick={() => setShowConsumer(prev => !prev)}>
                                            {showconsumer ? <Eye /> : <EyeClosed />}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Short Code</label>
                                    <input
                                        type="text"
                                        name="mpesaShortCode"
                                        value={settings.mpesaShortCode || ""}
                                        onChange={handleChange}
                                        placeholder="Enter MPESA Short Code"
                                        className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Short Code Type</label>
                                    <select
                                        name="mpesaShortCodeType"
                                        value={settings.mpesaShortCodeType || "Till"}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm"
                                    >
                                        <option value="Paybill">Paybill</option>
                                        <option value="Till">Till</option>
                                    </select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300">Till No / PayBill No</label>
                                    <input
                                        required
                                        type="text"
                                        name="mpesaAccountNumber"
                                        value={settings.mpesaAccountNumber || ""}
                                        onChange={handleChange}
                                        placeholder="Enter MPESA Till or PayBill Number"
                                        className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300">Pass Key</label>
                                    <div className="relative flex items-center flex-row">
                                        <input
                                            type={showpasskey ? "text" : "password"}
                                            name="mpesaPassKey"
                                            value={settings.mpesaPassKey || ""}
                                            onChange={handleChange}
                                            placeholder="Enter MPESA Pass Key"
                                            className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm"
                                        />
                                        <div className="absolute fontbold right-5 text-gray-300 cursor-pointer" onClick={() => setShowpasskey(prev => !prev)}>
                                            {showpasskey ? <Eye /> : <EyeClosed />}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* {settings.IsAPI && (
                            <div className="space-y-2 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300">Live API URL</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={process.env.NEXT_PUBLIC_SERVER_URL}
                                        readOnly
                                        className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm"
                                    />
                                    <div className="absolute right-3 cursor-pointer">
                                        <Copy
                                            size={20}
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_SERVER_URL}`);
                                                toast.success("Copied to clipboard");
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )} */}
                    </div>

                    <div className="flex justify-start mt-3 relative">
                        {settings.IsC2B ? (
                            <></>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                type="button"
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {isLoading ? "Updating..." : "Update Mpesa"}
                            </button>
                        )}

                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-md w-full">
                    <h2 className="text-lg text-gray-200 font-semibold mb-4 border-b pb-2">Delete {name} Platform
                        <p className="text-xs font-semibold text-red-600 italic p-1 bg-black/30 rounded-md">Delete all {name} platform information stored on our site, note that all information will be deleted and can not be recovered!</p></h2>

                    <div
                        onClick={() => {
                            setshowModal(true)
                        }}
                        className="flex justify-start mt-3">
                        <button
                            type="button"
                            disabled={isDeleting}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {isDeleting ? "Deleting..." : "Delete Platform"}
                        </button>
                    </div>
                </div>
            </form>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="flex flex-col bg-gray-900 border border-gray-700 text-gray-100 rounded-lg shadow-2xl p-6 w-full max-w-md max-h-full overflow-y-auto space-y-6">
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-x-1 flex-wrap">
                            <span>Are you sure you want to delete</span>
                            <span className="text-red-500">"{name}"</span>
                            <span>Platform</span>
                        </h2>

                        <p className="text-sm text-gray-400 mb-4">
                            This action will permanently delete all information stored on our site, note that all information will be deleted and can not be recovered!
                        </p>
                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setshowModal(false)
                                }}
                                className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                type="submit"
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};