import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import DDNS from "@/components/DDNS";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "DDNS",
};

export default function page() {
    return (
        <>
            <AdminHeader />
            <DDNS />
            <DashFooter />
        </>
    )
}