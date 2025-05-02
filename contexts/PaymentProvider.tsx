"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSocket } from "./SocketProvider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PaymentContextProps {
    transactionId: string | null;
    status: string | null;
    message: string | null;
    loginCode: string | null;
    setTransactionId: (id: string | null) => void;
}

const PaymentContext = createContext<PaymentContextProps | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
    const { socket, isConnected } = useSocket();
    const router = useRouter();
    const [transactionId, setTransactionId] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loginCode, setLoginCode] = useState<string | null>(null);
    const origin = window.location.origin.replace(/^https?:\/\//, '');

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleDepositSuccess = (data: any) => {
            localStorage.setItem("wifiLogin", data.loginCode);
            if (transactionId && data.checkoutRequestId !== transactionId) return;
            const newStatus = data.status || null;
            const newMessage = data.message || null;
            const newLoginCode = data.loginCode || null;
            setStatus(newStatus);
            setTransactionId(data.checkoutRequestId || null);
            setMessage(newMessage);
            setLoginCode(newLoginCode);
            if (newStatus === "COMPLETE") {
                toast.success(newMessage);
                if (newLoginCode) {
                    const loginUrl = `http://local.wifi/login?username=${newLoginCode}&password=${newLoginCode}`;
                    window.location.href = loginUrl;
                }
            }
        };

        const handleDepositStatus = (data: any) => {
            if (transactionId && data.checkoutRequestId !== transactionId) return;
            const newStatus = data.status || null;
            const newMessage = data.message || null;
            setStatus(newStatus);
            setTransactionId(data.checkoutRequestId || null);
            setMessage(newMessage);
            setLoginCode(null);
            if (newStatus === "FAILED") {
                toast.error(newMessage);
            }
        };

        socket.on("deposit-success", handleDepositSuccess);
        socket.on("deposit-status", handleDepositStatus);

        return () => {
            socket.off("deposit-success", handleDepositSuccess);
            socket.off("deposit-status", handleDepositStatus);
        };
    }, [socket, isConnected, transactionId, router]);

    return (
        <PaymentContext.Provider
            value={{ transactionId, status, message, loginCode, setTransactionId }}
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