import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Files from "@/components/Files";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Files",
};

export default function page() {
    return (
        <>
            <AdminHeader />
            <Files />
            <DashFooter />
        </>
    )
}