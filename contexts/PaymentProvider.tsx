"use client";

import { createContext, useContext, useState, useEffect, ReactNode, cache } from "react";
import { useSocket } from "./SocketProvider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PaymentContextProps {
    transactionId: string | null;
    status: string | null;
    message: string | null;
    loginCode: string | null;
    setTransactionId: (id: string | null) => void;
    setStartChecking: (check: boolean) => void;
}

const PaymentContext = createContext<PaymentContextProps | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
    const { socket, isConnected } = useSocket();
    const router = useRouter();
    const [transactionId, setTransactionId] = useState<string | null>(null);
    const [startchecking, setStartChecking] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loginCode, setLoginCode] = useState<string | null>(null);
    const origin = window.location.origin.replace(/^https?:\/\//, '');

    useEffect(() => {
        const storedTransactionId = localStorage.getItem("transactionId");
        if (startchecking && storedTransactionId) {
            setTransactionId(storedTransactionId);
            let intervalTime = 1000;

            const intervalId = setInterval(() => {
                const checkPayment = cache(async () => {
                    try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/mpesa/confirm`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ code: transactionId })
                        });

                        const res = await response.json();
                        if (res.success) {
                            toast.success(res.message);
                            clearInterval(intervalId);
                            localStorage.removeItem("transactionId");
                            const newLoginCode = res.loginCode;
                            if (newLoginCode) {
                                const loginUrl = `http://local.wifi/login?username=${newLoginCode}&password=${newLoginCode}`;
                                window.location.href = loginUrl;
                            }
                              setStartChecking(false)
                        } else if (res.status === "FAILED") {
                            toast.error(res.message);
                            clearInterval(intervalId);
                            localStorage.removeItem("transactionId")
                            setStartChecking(false)
                        }
                    } catch (error) {
                        console.log("Error fetching payment:", error);
                        toast.error("Failed to fetch payment");
                    }
                });

                checkPayment();
            }, intervalTime);

            return () => clearInterval(intervalId);
        }
    }, [startchecking, socket, isConnected, transactionId]);


    useEffect(() => {
        if (!startchecking || !socket || !isConnected || !transactionId) return;

        socket.emit("join-room", transactionId);

        const handleDepositSuccess = (data: any) => {
            if (data.checkoutRequestId !== transactionId) return;
            localStorage.setItem("wifiLogin", data.loginCode);
            const newStatus = data.status || null;
            const newMessage = data.message || null;
            const newLoginCode = data.loginCode || null;
            setStatus(newStatus);
            setMessage(newMessage);
            setLoginCode(newLoginCode);
            if (newStatus === "COMPLETE") {
                localStorage.removeItem("transactionId");
                toast.success(newMessage);
                if (newLoginCode) {
                    const loginUrl = `http://local.wifi/login?username=${newLoginCode}&password=${newLoginCode}`;
                    window.location.href = loginUrl;
                }
            }
        };

        const handleDepositStatus = (data: any) => {
            if (data.checkoutRequestId !== transactionId) return;
            const newStatus = data.status || null;
            const newMessage = data.message || null;
            setStatus(newStatus);
            setMessage(newMessage);
            setLoginCode(null);
            if (newStatus === "FAILED") {
                localStorage.removeItem("transactionId");
                toast.error(newMessage);
            }
        };

        socket.on("deposit-success", handleDepositSuccess);
        socket.on("deposit-status", handleDepositStatus);

        return () => {
            socket.off("deposit-success", handleDepositSuccess);
            socket.off("deposit-status", handleDepositStatus);
            socket.emit("leave-room", transactionId);
        };
    }, [startchecking, socket, isConnected, transactionId]);

    return (
        <PaymentContext.Provider
            value={{ transactionId, status, message, loginCode, setTransactionId, setStartChecking }}
        >
            {children}
        </PaymentContext.Provider>
    );
};

export const usePayment = () => {
    const context = useContext(PaymentContext);
    if (!context) {
        throw new Error("usePayment must be used within a PaymentProvider");
    }
    return context;
};
