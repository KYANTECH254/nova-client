"use client";

import { createContext, useContext, useState, useEffect, cache } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import ErrorComponent from "@/components/Error";

const AdminAuthContext = createContext<any>(null);
const ManagerAuthContext = createContext<any>(null);

export const AdminAuthProvider = ({ children }: any) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [adminUser, setAdminUser] = useState(null);
    const [token, setToken] = useState("");
    const [Error, setError] = useState("");
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAdminAuth = cache(async () => {
            setIsLoading(true);
            const existing_token = sessionStorage.getItem("authToken") || "";
            setToken(existing_token);

            const isAdminRoute = pathname.startsWith("/admin");
            const isLoginPage = pathname.startsWith("/admin/login");

            if (isAdminRoute) {
                if (!existing_token) {
                    setIsAuthenticated(false);
                    if (!isLoginPage) {
                        router.push("/admin/login");
                    }
                } else {
                    try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/authAdmin`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ token: existing_token }),
                        });

                        const res = await response.json();
                        if (res.success) {
                            setAdminUser(res.admin);
                            setIsAuthenticated(true);
                        } else {
                            toast.error(res.message);
                            setIsAuthenticated(false);
                            if (!isLoginPage) {
                                router.push("/admin/login");
                            }
                        }
                    } catch (error) {
                        sessionStorage.removeItem("authToken");
                        setError("Failed to authenticate.");
                        console.log("Auth Error:", error);
                        toast.error("Failed to authenticate.");
                        if (!isLoginPage) {
                            router.push("/admin/login");
                        }
                    }
                }
            }

            setIsLoading(false);
        });

        checkAdminAuth();
    }, [pathname]);


    const login = ({ token, userData }: { token: string; userData: any }) => {
        sessionStorage.setItem("authToken", token);
        setIsAuthenticated(true);
        setAdminUser(userData);
    };

    const logout = () => {
        sessionStorage.removeItem("authToken");
        setIsAuthenticated(false);
        setAdminUser(null);
        window.location.href = "/admin/login";
    };

    if (Error) {
        return <ErrorComponent message={Error} />;
    }

    return (
        <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, adminUser, login, logout, token }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const ManagerAuthProvider = ({ children }: any) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [managerUser, setManagerUser] = useState(null);
    const [token, setToken] = useState("");
    const [Error, setError] = useState("");
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkManagerAuth = cache(async () => {
            setIsLoading(true);
            const specialToken = sessionStorage.getItem("specialToken") || "";
            setToken(specialToken);

            if (pathname.startsWith("/manager")) {
                if (!specialToken) {
                    setIsAuthenticated(false);
                    router.push("/manager/login");
                } else {
                    try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/authManager`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ token: specialToken }),
                        });

                        const res = await response.json();
                        if (res.success) {
                            setManagerUser(res.manager);
                            setIsAuthenticated(true);
                        } else {
                            toast.error(res.message);
                            setIsAuthenticated(false);
                            router.push("/manager/login");
                        }
                    } catch (error) {
                        setError("Failed to authenticate.");
                        sessionStorage.removeItem("specialToken");
                        console.log("Auth Error:", error);
                        toast.error("Failed to authenticate.");
                    }
                }
            }
            setIsLoading(false);
        });

        checkManagerAuth();
    }, [pathname]);

    const login = ({ token, userData }: { token: string; userData: any }) => {
        sessionStorage.setItem("specialToken", token);
        setIsAuthenticated(true);
        setManagerUser(userData);
    };

    const logout = () => {
        sessionStorage.removeItem("specialToken");
        setIsAuthenticated(false);
        setManagerUser(null);
        router.push("/manager/login");
    };

    if (Error) {
        return <ErrorComponent message={Error} />;
    }

    return (
        <ManagerAuthContext.Provider value={{ isAuthenticated, isLoading, managerUser, login, token, logout }}>
            {children}
        </ManagerAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error("useAdminAuth must be used within an AdminAuthProvider");
    }
    return context;
};

export const useManagerAuth = () => {
    const context = useContext(ManagerAuthContext);
    if (!context) {
        throw new Error("useManagerAuth must be used within a ManagerAuthProvider");
    }
    return context;
};
