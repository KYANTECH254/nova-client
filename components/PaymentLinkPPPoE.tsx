"use client";

import { useEffect, useState } from "react";
import { Eye, EyeClosed, Copy } from "lucide-react";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import Loader from "./Loader";
import ErrorComponent from "./Error";
import { PPPoE } from "@/utils/types";

type TimeRemaining = {
    days: number;
    hours: number;
    minutes: number;
};

export default function PaymentLinkPPPoE() {
    const router = useRouter();
    const pathname = usePathname();
    const [pppoE, setPppoE] = useState<PPPoE | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [paying, setIsPaying] = useState<boolean>(false);
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
        days: 0,
        hours: 0,
        minutes: 0,
    });

    const getPPPoEIdFromUrl = (): string | null => {
        const parts = pathname.split("/pppoe/");
        return parts.length > 1 ? parts[1] : null;
    };

    const pppoeId = getPPPoEIdFromUrl();

    useEffect(() => {
        if (!pppoE || !pppoE.expiresAt) return;

        const calculateTimeRemaining = () => {
            const now = new Date();
            const expiresAt = new Date(pppoE.expiresAt as string);
            const diff = expiresAt.getTime() - now.getTime();

            if (diff <= 0) {
                return { days: 0, hours: 0, minutes: 0 };
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            return { days, hours, minutes };
        };

        setTimeRemaining(calculateTimeRemaining());
        const timer = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining());
        }, 60000); // every minute

        return () => clearInterval(timer);
    }, [pppoE]);

    useEffect(() => {
        const fetchPppoeDetails = async () => {
            if (!pppoeId) {
                toast.error("Invalid PPPoE link");
                router.push("/dashboard");
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/req/pppoeInfo`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentLink: pppoeId }),
                    }
                );

                const res = await response.json();

                if (res.success && res.pppoe) {
                    setPppoE(res.pppoe);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.error("Error fetching PPPoE details:", error);
                toast.error("Failed to fetch PPPoE details");
            } finally {
                setLoading(false);
            }
        };

        fetchPppoeDetails();
    }, [pppoeId, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!pppoE || !pppoeId) return;

        setIsPaying(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/mpesa/payPPPoE`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: pppoE.price,
                        pppoeId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message);
            } else {
                if (data.data.authorization_url) {
                    window.location.href = data.data.authorization_url;
                }

                localStorage.setItem("pppoe_transactionId", data.data.checkoutRequestId);
                toast.success(data.message);
            }
        } catch (error) {
            console.error("Error initiating payment:", error);
            toast.error("Failed to initiate payment");
        } finally {
            setIsPaying(false);
        }
    };

    const copyToClipboard = (): void => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Payment link copied to clipboard!");
    };

    if (loading) return <Loader />;
    if (!pppoE) return <ErrorComponent message="PPPoE details not found" />;

    return (
        <div className="p-4 flex items-center justify-center min-h-[80vh]">
            <div className="flex flex-col bg-gray-900 text-gray-100 rounded-lg shadow-2xl p-6 w-full max-w-md space-y-6">
                <h2 className="text-xl font-bold mb-4">
                    PPPoE Details: {pppoE.name}
                </h2>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-400">PPPoE Link</p>
                        <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{typeof window !== "undefined" ? window.location.href : ""}</p>
                            <button
                                onClick={copyToClipboard}
                                className="text-blue-400 hover:text-blue-300"
                                title="Copy link"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">Time Remaining</p>
                        <p className="font-medium">
                            {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">Service Name</p>
                        <p className="font-medium">{pppoE.servicename}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">Client Name</p>
                        <p className="font-medium">{pppoE.clientname}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">Password</p>
                        <div className="flex items-center">
                            <p className="font-medium">
                                {showPassword ? pppoE.clientpassword : "••••••••"}
                            </p>
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="ml-2 text-blue-400"
                            >
                                {showPassword ? <EyeClosed size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">Price</p>
                        <p className="text-2xl font-bold text-green-500">KES {pppoE.price}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">Validity Period</p>
                        <p className="font-medium">{pppoE.period}</p>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={paying}
                    className={`w-full py-2 px-4 rounded-md font-medium disabled:opacity-50 ${parseFloat(pppoE.price) > 0
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-green-600 hover:bg-green-700"
                        }`}
                >
                    {paying ? "Processing..." : parseFloat(pppoE.price) > 0 ? "Make Payment" : "Make Next Payment"}
                </button>
            </div>
        </div>
    );
}
