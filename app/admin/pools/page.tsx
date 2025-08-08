import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Pools from "@/components/Pools";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pools",
};

export default function page() {
    return (
        <>
            <AdminHeader />
            <Pools />
            <DashFooter />
        </>
    )
}