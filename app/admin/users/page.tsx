import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Users from "@/components/Users";

export default function page() {
    return (
        <>
            <AdminHeader />
            <Users />
            <DashFooter />
        </>
    )
}