import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import PPPoE from "@/components/PPPoE";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "PPPoE",
};

export default function page() {
    return (
        <>
            <AdminHeader />
            <PPPoE />
            <DashFooter />
        </>
    )
}