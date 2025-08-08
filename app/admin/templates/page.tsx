import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import PPPoE from "@/components/PPPoE";
import Templates from "@/components/Templates";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Templates",
};

export default function page() {
    return (
        <>
            <AdminHeader />
            <Templates />
            <DashFooter />
        </>
    )
}