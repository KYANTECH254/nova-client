import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Funds from "@/components/Funds";

export default function page() {
    return (
        <>
            <AdminHeader />
            <Funds />
            <DashFooter />
        </>
    )
}