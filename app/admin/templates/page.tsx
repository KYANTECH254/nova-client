import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import PPPoE from "@/components/PPPoE";

export default function page() {
    return (
        <>
            <AdminHeader />
            <PPPoE />
            <DashFooter />
        </>
    )
}