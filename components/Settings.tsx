"use client";

import { useAdminAuth } from "@/contexts/AdminSessionProvider";
import { Copy, Eye, EyeClosed } from "lucide-react";
import { cache, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Settings() {
    const [name, setName] = useState("");
    const [platurl, setplaturl] = useState("");
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
    const [isChangingName, setIsChangingName] = useState(false);
    const [showconsumer, setShowConsumer] = useState(false);
    const [showpasskey, setShowpasskey] = useState(false);
    const { adminUser, token } = useAdminAuth();

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
                            mpesaShortCodeType: res.settings.mpesaShortCodeType || "Till",
                            mpesaPassKey: res.settings.mpesaPassKey || "",
                            mpesaAccountNumber: res.settings.mpesaAccountNumber || "",
                            IsC2B: res.settings.IsC2B || true,
                            IsAPI: res.settings.IsAPI || false,
                            IsB2B: res.settings.IsB2B || false
                        }));
                    }
                    setName(res.name);
                    setplaturl(res.url);
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

    const handleChangeRadio = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(prev => ({
            ...prev,
            IsC2B: e.target.value === "C2B",
            IsB2B: e.target.value === "B2B",
            IsAPI: e.target.value === "API"
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

    return (
        <div className="p-6 max-w-4xl mx-auto mt-14">
            <h1 className="text-2xl font-bold mb-6">Platform Settings</h1>

            <form className="space-y-6">
                {/* Platform Section */}
                <div className="bg-gray-900 rounded-lg shadow p-6">
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

                {/* MPESA Section */}
                <div className="bg-gray-900 rounded-lg shadow p-6 ">
                    <h2 className="text-lg text-gray-200 font-semibold mb-4 border-b pb-2">MPESA Configuration <p className="text-xs font-semibold text-green-600 italic p-1 bg-black/30 rounded-md">Configure how you receive payments from customers</p></h2>

                    {/* Radio Input for MPESA Type */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">MPESA Type</label>
                        <div className="flex gap-6">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="mpesaType"
                                    value="C2B"
                                    checked={settings.IsC2B === true}
                                    onChange={handleChangeRadio}
                                    className="form-radio text-blue-600"
                                />
                                <span className="ml-2 text-gray-300">Mpesa C2B</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="mpesaType"
                                    value="B2B"
                                    checked={settings.IsB2B === true}
                                    onChange={handleChangeRadio}
                                    className="form-radio text-blue-600"
                                />
                                <span className="ml-2 text-gray-300">Mpesa B2B</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="mpesaType"
                                    value="API"
                                    checked={settings.IsAPI === true}
                                    onChange={handleChangeRadio}
                                    className="form-radio text-blue-600"
                                />
                                <span className="ml-2 text-gray-300">Mpesa API</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {settings.IsB2B && (
                            <>
                                {/* Short Code */}
                                < div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Short Code / Phone NUmber</label>
                                    <input
                                        type="text"
                                        name="mpesaShortCode"
                                        value={settings.mpesaShortCode || ""}
                                        onChange={handleChange}
                                        placeholder="Enter MPESA Short Code"
                                        className="w-full px-3 py-2 border bg-black text-gray-300 border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>

                                {/* Short Code Type */}
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

                                {/* Conditionally show Account Number for Paybill */}
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
                        )}
                        {settings.IsC2B && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Short Code */}
                                < div className="space-y-2">
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

                                {/* Short Code Type */}
                                <div className="space-y-2">
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

                                {/* Conditionally show Account Number for Paybill */}
                                {/* {settings.mpesaShortCodeType === "Paybill" && (
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
                                )} */}
                            </div>
                        )}
                        {settings.IsAPI && (
                            <>
                                {/* Consumer Key */}
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

                                {/* Consumer Secret */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Consumer Secret</label>
                                    <div className="relative flex items-center flex-row">
                                        <input
                                            type={showconsumer ? "text" : "password"}
                                            name="mpesaConsumerSecret"
                                            value={settings.mpesaConsumerSecret || ""}
                                            onChange={handleChange}
                                            placeholder="Enter MPESA Consumer Secret"
                                            className="w-full px-3 py-2 border  bg-black text-gray-300 border-gray-300 rounded-md shadow-sm"
                                        />
                                        <div className="absolute fontbold right-5 text-gray-300 cursor-pointer" onClick={() => setShowConsumer(prev => !prev)}>
                                            {showconsumer ? <Eye /> : <EyeClosed />}
                                        </div>
                                    </div>
                                </div>

                                {/* Short Code */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Short Code</label>
                                    <input
                                        type="text"
                                        name="mpesaShortCode"
                                        value={settings.mpesaShortCode || ""}
                                        onChange={handleChange}
                                        placeholder="Enter MPESA Short Code"
                                        className="w-full px-3 py-2 border  bg-black  text-gray-300 border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>

                                {/* Short Code Type */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium  text-gray-300">Short Code Type</label>
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

                                {/* Conditionally show Account Number for Paybill */}
                                {settings.mpesaShortCodeType === "Paybill" && (
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="block text-sm font-medium  text-gray-300">Account No (Leave Blank to use customer's phone number as account no.)</label>
                                        <input
                                            type="text"
                                            name="mpesaAccountNumber"
                                            value={settings.mpesaAccountNumber || ""}
                                            onChange={handleChange}
                                            placeholder="Enter MPESA Account No"
                                            className="w-full px-3 py-2 border  bg-black  text-gray-300 border-gray-300 rounded-md shadow-sm"
                                        />
                                    </div>
                                )}

                                {/* Pass Key */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300">Pass Key</label>
                                    <div className="relative flex items-center flex-row">
                                        <input
                                            type={showpasskey ? "text" : "password"}
                                            name="mpesaPassKey"
                                            value={settings.mpesaPassKey || ""}
                                            onChange={handleChange}
                                            placeholder="Enter MPESA Pass Key"
                                            className="w-full px-3 py-2 border  bg-black  text-gray-300 border-gray-300 rounded-md shadow-sm"
                                        />
                                        <div className="absolute fontbold right-5 text-gray-300 cursor-pointer" onClick={() => setShowpasskey(prev => !prev)}>
                                            {showpasskey ? <Eye /> : <EyeClosed />}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Live API URL */}
                        {settings.IsAPI && (
                            <div className="space-y-2 md:col-span-2">
                                <label className="block text-sm font-medium  text-gray-300">Live API URL</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={process.env.NEXT_PUBLIC_SERVER_URL}
                                        readOnly
                                        className="w-full px-3 py-2 border  bg-black text-gray-300 border-gray-300 rounded-md shadow-sm"
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
                        )}
                    </div>


                    <div className="flex justify-start mt-3 relative">
                        <button
                            onClick={handleSubmit}
                            type="button"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {isLoading ? "Updating..." : "Update Mpesa"}
                        </button>
                    </div>
                </div>

            </form >
        </div >
    );
};
