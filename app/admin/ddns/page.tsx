import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import DDNS from "@/components/DDNS";

export default function page() {
    return (
        <>
            <AdminHeader />
            <DDNS />
            <DashFooter />
        </>
    )
}