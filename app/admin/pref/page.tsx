import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Settings",
};

export default function page() {
    return (
        <>
            <AdminHeader />
            <DashFooter />
        </>
    )
}