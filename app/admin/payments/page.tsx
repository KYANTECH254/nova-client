import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Payments from "@/components/Payments";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Payments",
};

export default function page() {
    return (
        <>
            <AdminHeader />
            <Payments />
            <DashFooter />
        </>
    )
}