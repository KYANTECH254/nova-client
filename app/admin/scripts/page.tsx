import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Scripts from "@/components/Scripts";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Scripts",
};

export default function page() {
    return (
        <>
            <AdminHeader />
            <Scripts />
            <DashFooter />
        </>
    )
}