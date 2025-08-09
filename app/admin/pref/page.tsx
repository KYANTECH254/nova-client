import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Preferences from "@/components/Preferences";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Settings",
};

export default function page() {
    return (
        <>
            <AdminHeader />
            <Preferences />
            <DashFooter />
        </>
    )
}