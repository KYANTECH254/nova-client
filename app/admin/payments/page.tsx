import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Payments from "@/components/Payments";

export default function page() {
    return (
        <>
            <AdminHeader />
            <Payments />
            <DashFooter />
        </>
    )
}