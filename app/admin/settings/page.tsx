import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Settings from "@/components/Settings";

export default function page() {
    return (
        <>
            <AdminHeader />
            <Settings />
            <DashFooter />
        </>
    )
}