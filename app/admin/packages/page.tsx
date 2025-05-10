import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Packages from "@/components/Packages";

export default function page() {
    return (
        <>
            <AdminHeader />
            <Packages />
            <DashFooter />
        </>
    )
}