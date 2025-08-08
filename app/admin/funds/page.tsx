import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Funds from "@/components/Funds";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Funds",
};

export default function page() {
    return (
        <>
            <AdminHeader />
            <Funds />
            <DashFooter />
        </>
    )
}