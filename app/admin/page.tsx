import AdminHeader from "@/components/AdminHeader";
import Dashboard from "@/components/Dashboard";
import DashFooter from "@/components/DashFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
};

export default function DashboardPage() {
    return (
        <>
            <AdminHeader />
            <Dashboard />
            <DashFooter />
        </>
    );
}