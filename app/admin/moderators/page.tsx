import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Moderators from "@/components/Moderators";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Moderators",
};

export default function page() {
    return (
        <>
            <AdminHeader />
            <Moderators />
            <DashFooter />
        </>
    )
}