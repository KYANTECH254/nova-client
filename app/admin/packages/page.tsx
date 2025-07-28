import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Packages from "@/components/Packages";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Packages",
};

export default function page() {
    return (
        <>
            <AdminHeader />
            <Packages />
            <DashFooter />
        </>
    )
}