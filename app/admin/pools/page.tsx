import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Pools from "@/components/Pools";

export default function page() {
    return (
        <>
            <AdminHeader />
            <Pools />
            <DashFooter />
        </>
    )
}