"use client";

import { createContext, useContext, useState, useEffect, cache } from "react";
import { useRouter, usePathname } from "next/navigation";
import ErrorComponent from "@/components/Error";
import { useAdminAuth } from "./AdminSessionProvider";
import { toast } from "sonner";

const RoleGateContext = createContext<any>(null);

export const RoleGateProvider = ({ children }: any) => {
    const [Error, setError] = useState("");
    const [isAllowed, setIsAllowed] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { adminUser, token } = useAdminAuth();

    const adminRoutes = ['/admin', '/admin/payments', '/admin/users', '/admin/login'];

    useEffect(() => {
        const checkIfPathIsAllowed = () => {
            if (!adminUser) return;

            if (adminUser.role === "admin") {
                const InAllowed = adminRoutes.some((path) => path === pathname);

                if (!InAllowed) {
                    setIsAllowed(false);
                    setError("Unauthorised route, request more permissions!");
                    toast.error("Unauthorised route, request more permissions!");
                    setTimeout(() => {
                        router.push("/admin");
                    }, 3000);
                } else {
                    setIsAllowed(true);
                }
            }
        };

        checkIfPathIsAllowed();
    }, [adminUser, token, pathname]);

    if (Error) {
        return <ErrorComponent message={Error} />;
    }

    return (
        <RoleGateContext.Provider value={{ isAllowed }}>
            {children}
        </RoleGateContext.Provider>
    );
}

export const useRole = () => {
    const context = useContext(RoleGateContext);
    if (!context) {
        throw new Error("useRole must be used within an RoleProvider");
    }
    return context;
};
