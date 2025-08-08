import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Settings from "@/components/Settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Settings",
};

export default function page() {
    return (
        <>
            <AdminHeader />
            <Settings />
            <DashFooter />
        </>
    )
}