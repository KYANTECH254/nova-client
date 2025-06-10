import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Stations from "@/components/Stations";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Stations",
};

export default function page() {
    return (
        <>
            <AdminHeader />
            <Stations />
            <DashFooter />
        </>
    )
}