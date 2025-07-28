import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Profile from "@/components/Profile";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profile",
};

export default function page() {
    return (
        <>
            <AdminHeader />
            <Profile />
            <DashFooter />
        </>
    )
}