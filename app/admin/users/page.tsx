import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Users from "@/components/Users";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Users",
};

export default function page() {
    return (
        <>
            <AdminHeader />
            <Users />
            <DashFooter />
        </>
    )
}